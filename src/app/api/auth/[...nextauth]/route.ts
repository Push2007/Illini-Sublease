import { handlers } from "@/auth";
import { NextResponse, type NextRequest } from "next/server";
import { ipFromHeaders, rateLimit, RATE_LIMITS } from "@/lib/rate-limit";

export const { GET } = handlers;

// Strict credential brute-force protection lives in the loginWithCredentials
// server action (5 / 15 min). Here we add a coarser per-IP ceiling on the
// Auth.js POST endpoints (sign-in, callbacks, CSRF) as defense-in-depth — set
// high enough not to break legitimate OAuth round-trips.
export async function POST(request: NextRequest) {
  const ip = ipFromHeaders(request.headers);
  const limit = await rateLimit(`auth:endpoint:${ip}`, RATE_LIMITS.read);
  if (!limit.success) {
    return NextResponse.json(
      { error: "Too many requests." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } }
    );
  }
  return handlers.POST(request);
}
