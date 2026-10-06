import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Enable React compiler optimizations
  reactStrictMode: false,
  // Compress responses
  compress: true,
  // Optimize package imports to reduce bundle size and speed up compilation
  experimental: {
    optimizePackageImports: ['lucide-react', 'recharts', 'framer-motion'],
  },
  serverExternalPackages: ['@xenova/transformers', 'onnxruntime-node', 'sharp'],
  // Reduce unnecessary logging in dev
  logging: {
    fetches: {
      fullUrl: false,
    },
  },
};

export default nextConfig;
