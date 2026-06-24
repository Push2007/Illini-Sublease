import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { isAllowedEmail } from "@/lib/auth-domain";
import { ipFromHeaders, rateLimit, RATE_LIMITS } from "@/lib/rate-limit";

const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const ALLOWED_CONTENT_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/heic",
];

// Issues short-lived client upload tokens so listing photos go straight to
// Vercel Blob (bypassing the server action body-size limit). Only signed-in
// UIUC users may request a token.
export async function POST(request: Request): Promise<NextResponse> {
  const ip = ipFromHeaders(request.headers);
  const limit = await rateLimit(`upload:${ip}`, RATE_LIMITS.upload);
  if (!limit.success) {
    return NextResponse.json(
      { error: "Too many uploads. Please slow down." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } }
    );
  }

  let body: HandleUploadBody;
  try {
    body = (await request.json()) as HandleUploadBody;
  } catch {
    return NextResponse.json({ error: "Malformed request body." }, { status: 400 });
  }

  try {
    const json = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => {
        const session = await auth();
        if (!session?.user?.id || !isAllowedEmail(session.user.email)) {
          throw new Error("You must be signed in with your @illinois.edu account to upload.");
        }
        return {
          allowedContentTypes: ALLOWED_CONTENT_TYPES,
          maximumSizeInBytes: MAX_IMAGE_BYTES,
          addRandomSuffix: true,
          tokenPayload: JSON.stringify({ userId: session.user.id }),
        };
      },
      // NOTE: intentionally no onUploadCompleted — that callback requires a
      // publicly reachable URL (it can't hit localhost in dev), and we capture
      // the uploaded URLs directly from the client `upload()` result instead.
    });

    return NextResponse.json(json);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload failed." },
      { status: 400 }
    );
  }
}
