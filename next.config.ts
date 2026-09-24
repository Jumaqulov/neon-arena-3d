import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // pin the workspace root (a stray lockfile exists in the user's home directory)
  turbopack: { root: path.resolve(__dirname) },
  images: {
    // serve modern formats; next/image falls back to the JPEG source
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },
};

export default nextConfig;
