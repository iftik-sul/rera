import type { NextConfig } from "next";

// Static export: `npm run build` writes plain HTML/CSS/JS into `out/`.
// No server is needed — the folder can be hosted on any static file host.
const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
