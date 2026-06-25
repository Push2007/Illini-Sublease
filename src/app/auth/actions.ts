"use server";

import { redirect } from "next/navigation";
import { auth, signIn, signOut } from "@/auth";
import { prisma } from "@/lib/db";
import { normalizeEmail } from "@/lib/auth-domain";
import { rateLimitByIp, RATE_LIMITS } from "@/lib/rate-limit";

export async function signInWithGoogle() {
  const limit = await rateLimitByIp("auth:google", RATE_LIMITS.mutation);
  if (!limit.success) throw new Error("Too many requests. Please slow down and try again shortly.");
  await signIn("google", { redirectTo: "/search" });
}

export async function signOutAction() {
  await signOut({ redirectTo: "/" });
}

/** Permanently deletes the signed-in user's account and all associated data. */
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

  await prisma.user.delete({ where: { id: userId } }).catch(() => {});
  if (email) {
    await prisma.verificationCode.deleteMany({ where: { email } });
  }

  await signOut({ redirectTo: "/" });
}
