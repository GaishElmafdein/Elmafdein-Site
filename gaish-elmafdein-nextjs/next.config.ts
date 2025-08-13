import type { NextConfig } from "next";

// Restored config with ESLint enabled for core-web-vitals and strict TypeScript.
const nextConfig: NextConfig = {
  reactStrictMode: true,
  eslint: {
    // Enforce lint during builds now that environment is stable
    ignoreDuringBuilds: false,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
