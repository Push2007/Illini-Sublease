import { NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { prisma } from "@/lib/db";
import { ipFromHeaders, rateLimit, RATE_LIMITS } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

/** Constant-time bearer comparison to avoid leaking the secret via timing. */
function authorized(request: Request, secret: string): boolean {
  const header = request.headers.get("authorization") ?? "";
  const expected = `Bearer ${secret}`;
  const a = Buffer.from(header);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

/**
 * Scheduled cleanup (see vercel.json). Hides/expires listings whose availability
 * window has passed (which stops their contact info from being revealed) and
 * purges stale verification codes and expired rate-limit counters.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  // Require the secret to be configured AND to match; never run unauthenticated.
  if (!secret || !authorized(request, secret)) {
    // Rate-limit unauthorized probes by IP to slow brute forcing.
    await rateLimit(`cron:${ipFromHeaders(request.headers)}`, RATE_LIMITS.mutation);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();

  const expired = await prisma.listing.updateMany({
    where: { status: "ACTIVE", availableTo: { not: null, lt: now } },
    data: { status: "EXPIRED" },
  });

  const codes = await prisma.verificationCode.deleteMany({
    where: { expiresAt: { lt: now } },
  });

  const limits = await prisma.rateLimit.deleteMany({
    where: { expiresAt: { lt: now } },
  });

  return NextResponse.json({
    ok: true,
    expiredListings: expired.count,
    purgedCodes: codes.count,
    purgedRateLimits: limits.count,
    ranAt: now.toISOString(),
  });
}
