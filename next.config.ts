import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["unadduceable-jeffry-squashy.ngrok-free.dev"],
  async redirects() {
    return [
      {
        source: '/undangan/:path*',
        destination: 'https://undangan.gemma.web.id/:path*',
        permanent: true,
      },
      {
        source: '/undanagan/:path*',
        destination: 'https://undangan.gemma.web.id/:path*',
        permanent: true,
      },
      {
        source: '/undagan/:path*',
        destination: 'https://undangan.gemma.web.id/:path*',
        permanent: true,
      },
    ];
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
};

export default nextConfig;
