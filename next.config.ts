import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Skip type checking during build (types are checked by IDE and tsc separately)
  // This is needed because resend library has TypeScript issues with v5.x
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
