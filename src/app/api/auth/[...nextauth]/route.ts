import { handlers } from "@/auth";
import { NextResponse, type NextRequest } from "next/server";
import { ipFromHeaders, rateLimit, RATE_LIMITS } from "@/lib/rate-limit";

export const { GET } = handlers;

// Coarse per-IP ceiling on Auth.js POST endpoints (sign-in, callbacks).
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
