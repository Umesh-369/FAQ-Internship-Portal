import type { NextConfig } from "next";

const BACKEND_URL = process.env.RENDER_BACKEND_URL || 'https://yaksha-faq.onrender.com';

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${BACKEND_URL}/api/:path*`,
      },
    ];
  },
  serverExternalPackages: ['@xenova/transformers', 'onnxruntime-node', 'sharp'],
};

export default nextConfig;