import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Pin the workspace root so Turbopack doesn't get confused by lockfiles
  // that may exist in parent directories.
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
