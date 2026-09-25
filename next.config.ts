import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // These ship a prebuilt binary resolved relative to their own package
  // directory (via __dirname) — bundling them breaks that path resolution,
  // so they must be required natively instead. See src/lib/videoProbe.ts
  // and src/lib/captions.ts.
  serverExternalPackages: ["ffmpeg-static", "ffprobe-static"],
};

export default nextConfig;
