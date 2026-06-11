import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * Scheduled cleanup (see vercel.json). Hides/expires listings whose availability
 * window has passed (which stops their contact info from being revealed) and
 * purges stale, unused verification codes.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const now = new Date();

  const expired = await prisma.listing.updateMany({
    where: { status: "ACTIVE", availableTo: { not: null, lt: now } },
    data: { status: "EXPIRED" },
  });

  const codes = await prisma.verificationCode.deleteMany({
    where: { expiresAt: { lt: now } },
  });

  return NextResponse.json({
    ok: true,
    expiredListings: expired.count,
    purgedCodes: codes.count,
    ranAt: now.toISOString(),
  });
}
