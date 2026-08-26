import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The Codex in-app preview uses this loopback hostname in development.
  allowedDevOrigins: ["127.0.0.1"],
};

export default nextConfig;
