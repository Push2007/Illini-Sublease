import "server-only";
import { headers } from "next/headers";
import { prisma } from "@/lib/db";

export type RateLimitPreset = { limit: number; windowMs: number };

/**
 * Centralized rate-limit policies.
 * - `auth`: brute-force protection for login/signup/verify — 5 attempts / 15 min.
 * - `mutation`: state-changing actions (post/report/reveal/delete).
 * - `read`: cheaper read-ish actions.
 * - `upload`: blob upload-token requests.
 */
export const RATE_LIMITS = {
  auth: { limit: 5, windowMs: 15 * 60 * 1000 },
  mutation: { limit: 20, windowMs: 60 * 1000 },
  read: { limit: 60, windowMs: 60 * 1000 },
  upload: { limit: 30, windowMs: 60 * 1000 },
} as const satisfies Record<string, RateLimitPreset>;

export type RateLimitResult = {
  success: boolean;
  limit: number;
  remaining: number;
  resetAt: Date;
  retryAfterSeconds: number;
};

const MAX_IDENTIFIER_LEN = 100;

function safeIdentifier(value: string): string {
  return value.replace(/[^\w.:-]/g, "_").slice(0, MAX_IDENTIFIER_LEN) || "unknown";
}

/** Best-effort client IP from proxy headers (Vercel sets x-forwarded-for). */
export function ipFromHeaders(h: Headers): string {
  const xff = h.get("x-forwarded-for");
  if (xff) return safeIdentifier(xff.split(",")[0].trim());
  return safeIdentifier(h.get("x-real-ip") ?? "unknown");
}

/** Client IP for the current server-action / RSC request. */
export async function clientIp(): Promise<string> {
  return ipFromHeaders(await headers());
}

/**
 * Fixed-window counter backed by Postgres so the limit holds across serverless
 * instances. Fails OPEN on storage errors so a transient DB issue never locks
 * every user out.
 */
export async function rateLimit(
  identifier: string,
  preset: RateLimitPreset
): Promise<RateLimitResult> {
  const { limit, windowMs } = preset;
  const now = Date.now();
  const bucket = Math.floor(now / windowMs);
  const key = `${safeIdentifier(identifier)}:${bucket}`;
  const resetAt = new Date((bucket + 1) * windowMs);
  const retryAfterSeconds = Math.max(1, Math.ceil((resetAt.getTime() - now) / 1000));

  try {
    const row = await prisma.rateLimit.upsert({
      where: { key },
      create: { key, count: 1, expiresAt: resetAt },
      update: { count: { increment: 1 } },
    });
    return {
      success: row.count <= limit,
      limit,
      remaining: Math.max(0, limit - row.count),
      resetAt,
      retryAfterSeconds,
    };
  } catch {
    return { success: true, limit, remaining: limit, resetAt, retryAfterSeconds };
  }
}

/** Convenience: rate-limit the current request by client IP under a named scope. */
export async function rateLimitByIp(
  scope: string,
  preset: RateLimitPreset
): Promise<RateLimitResult> {
  const ip = await clientIp();
  return rateLimit(`${scope}:${ip}`, preset);
}
