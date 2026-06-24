import type { NextConfig } from "next";
import path from "path";

// Applied to every response as defense-in-depth.
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-DNS-Prefetch-Control", value: "off" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    // Allow first-party code + images from our Vercel Blob store and Google
    // avatars; block framing entirely. Kept moderate to avoid breaking Next's
    // inline runtime; tighten with nonces if you remove 'unsafe-inline'.
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "img-src 'self' data: blob: https://*.vercel-storage.com https://lh3.googleusercontent.com https://picsum.photos https://*.picsum.photos",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "font-src 'self' data:",
      // @vercel/blob client uploads POST to https://vercel.com/api/blob, then
      // read URLs resolve on *.vercel-storage.com.
      "connect-src 'self' https://vercel.com https://*.vercel-storage.com https://blob.vercel-storage.com",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "object-src 'none'",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  // Pin the workspace root so Turbopack doesn't get confused by lockfiles
  // that may exist in parent directories.
  turbopack: {
    root: path.resolve(__dirname),
  },
  // Reject oversized server-action payloads (photos go via Blob, not actions).
  experimental: {
    serverActions: {
      bodySizeLimit: "1mb",
    },
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
