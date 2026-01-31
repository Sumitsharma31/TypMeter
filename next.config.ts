import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ['@clerk/shared', 'swr'],
};

export default nextConfig;
