import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['@prisma/client', 'bcryptjs'],
  images: {
    domains: ['localhost', 'vercel.app'],
    // OPTIMIZED: Image optimization
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
  },
  env: {
    DATABASE_URL: process.env.DATABASE_URL,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  },
  // OPTIMIZED: Bundle analysis
  ...(process.env.ANALYZE === 'true' && {
    webpack: (config: any) => {
      config.plugins.push(
        new (require('@next/bundle-analyzer'))({
          enabled: true,
          openAnalyzer: true,
        })
      );
      return config;
    },
  }),
  // OPTIMIZED: Performance optimizations
  experimental: {
    optimizePackageImports: ['@next/font', 'next-auth'],
  },
  // OPTIMIZED: Compression
  compress: true,
  // OPTIMIZED: Power optimization
  poweredByHeader: false,
  // OPTIMIZED: React strict mode for development only
  reactStrictMode: process.env.NODE_ENV === 'development',
};

export default nextConfig;
