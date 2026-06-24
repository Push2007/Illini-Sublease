"use server";

import { AuthError } from "next-auth";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { auth, signIn, signOut } from "@/auth";
import { prisma } from "@/lib/db";
import { isAllowedEmail, normalizeEmail, ALLOWED_EMAIL_DOMAIN } from "@/lib/auth-domain";
import { sendVerificationCode } from "@/lib/email";
import { rateLimitByIp, RATE_LIMITS } from "@/lib/rate-limit";
import { cleanText, codeSchema, emailSchema, passwordSchema } from "@/lib/validation";

export type AuthActionState = { error?: string; info?: string } | undefined;

const VERIFY_TTL_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 5;

function tooManyAttempts(retryAfterSeconds: number): AuthActionState {
  const minutes = Math.max(1, Math.ceil(retryAfterSeconds / 60));
  return { error: `Too many attempts. Please try again in about ${minutes} minute${minutes === 1 ? "" : "s"}.` };
}

export async function signInWithGoogle() {
  const limit = await rateLimitByIp("auth:google", RATE_LIMITS.mutation);
  if (!limit.success) throw new Error("Too many requests. Please slow down and try again shortly.");
  await signIn("google", { redirectTo: "/search" });
}

export async function signOutAction() {
  await signOut({ redirectTo: "/" });
}

export async function loginWithCredentials(
  _prev: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const limit = await rateLimitByIp("auth:login", RATE_LIMITS.auth);
  if (!limit.success) return tooManyAttempts(limit.retryAfterSeconds);

  const parsedEmail = emailSchema.safeParse(formData.get("email"));
  const email = parsedEmail.success ? parsedEmail.data : "";
  // Cap length to reject oversized payloads without leaking which field failed.
  const password = String(formData.get("password") ?? "").slice(0, 200);

  if (!email || !isAllowedEmail(email)) {
    return { error: `Please use your @${ALLOWED_EMAIL_DOMAIN} email.` };
  }
  if (!password) return { error: "Enter your password." };

  try {
    await signIn("credentials", { email, password, redirectTo: "/search" });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Invalid email or password, or your email isn't verified yet." };
    }
    throw error; // re-throw redirect
  }
  return undefined;
}

export async function requestSignup(
  _prev: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const limit = await rateLimitByIp("auth:signup", RATE_LIMITS.auth);
  if (!limit.success) return tooManyAttempts(limit.retryAfterSeconds);

  const name = cleanText(formData.get("name")).slice(0, 80);
  const parsedEmail = emailSchema.safeParse(formData.get("email"));
  const email = parsedEmail.success ? parsedEmail.data : "";
  const parsedPassword = passwordSchema.safeParse(formData.get("password"));

  if (!email || !isAllowedEmail(email)) {
    return { error: `Only @${ALLOWED_EMAIL_DOMAIN} emails can register.` };
  }
  if (!parsedPassword.success) {
    return { error: "Password must be between 8 and 128 characters." };
  }
  const password = parsedPassword.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing?.emailVerified && existing.passwordHash) {
    return { error: "An account with this email already exists. Please log in." };
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const code = String(Math.floor(100000 + Math.random() * 900000));
  const codeHash = await bcrypt.hash(code, 10);

  await prisma.verificationCode.deleteMany({ where: { email } });
  await prisma.verificationCode.create({
    data: {
      email,
      codeHash,
      name: name || null,
      passwordHash,
      expiresAt: new Date(Date.now() + VERIFY_TTL_MS),
    },
  });

  const result = await sendVerificationCode(email, code);
  if (!result.delivered) {
    // Email couldn't be delivered (e.g. Resend test-mode restriction). The code
    // is logged to the server console so you can still verify during testing.
    console.warn(
      `[signup] Verification email NOT delivered to ${email}. Use this code to verify: ${code}` +
        (result.error ? ` (reason: ${result.error})` : "")
    );
  }
  redirect(`/verify?email=${encodeURIComponent(email)}`);
}

export async function verifyCode(
  _prev: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const limit = await rateLimitByIp("auth:verify", RATE_LIMITS.auth);
  if (!limit.success) return tooManyAttempts(limit.retryAfterSeconds);

  const parsedEmail = emailSchema.safeParse(formData.get("email"));
  const email = parsedEmail.success ? parsedEmail.data : "";
  const parsedCode = codeSchema.safeParse(formData.get("code"));
  if (!email) return { error: "No pending verification found. Please sign up again." };
  if (!parsedCode.success) return { error: "Enter the 6-digit code." };
  const code = parsedCode.data;

  const vc = await prisma.verificationCode.findFirst({
    where: { email },
    orderBy: { createdAt: "desc" },
  });
  if (!vc) return { error: "No pending verification found. Please sign up again." };

  if (vc.expiresAt < new Date()) {
    await prisma.verificationCode.deleteMany({ where: { email } });
    return { error: "That code has expired. Please sign up again." };
  }
  if (vc.attempts >= MAX_ATTEMPTS) {
    await prisma.verificationCode.deleteMany({ where: { email } });
    return { error: "Too many attempts. Please sign up again." };
  }

  const ok = await bcrypt.compare(code, vc.codeHash);
  if (!ok) {
    await prisma.verificationCode.update({
      where: { id: vc.id },
      data: { attempts: { increment: 1 } },
    });
    return { error: "Incorrect code. Please try again." };
  }

  await prisma.user.upsert({
    where: { email },
    update: {
      passwordHash: vc.passwordHash,
      name: vc.name ?? undefined,
      emailVerified: new Date(),
    },
    create: {
      email,
      passwordHash: vc.passwordHash,
      name: vc.name ?? undefined,
      emailVerified: new Date(),
    },
  });
  await prisma.verificationCode.deleteMany({ where: { email } });

  redirect("/login?verified=1");
}

/**
 * Permanently deletes the signed-in user's account and all associated data
 * (their listings, listing photos, and any pending verification codes). Reports
 * they filed against other listings are anonymized. Then signs them out.
 */
export async function deleteAccount() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const limit = await rateLimitByIp("auth:delete-account", RATE_LIMITS.mutation);
  if (!limit.success) {
    throw new Error("Too many requests. Please try again shortly.");
  }

  const userId = session.user.id;
  const email = session.user.email ? normalizeEmail(session.user.email) : null;

  // Listings (and their images) cascade-delete via the schema relations.
  await prisma.user.delete({ where: { id: userId } }).catch(() => {});
  if (email) {
    await prisma.verificationCode.deleteMany({ where: { email } });
  }

  await signOut({ redirectTo: "/" });
}
