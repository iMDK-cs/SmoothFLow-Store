import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['@prisma/client', 'bcryptjs'],
  images: {
    domains: ['localhost', 'vercel.app'],
    // OPTIMIZED: Image optimization
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 31536000, // 1 year
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
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
    optimizePackageImports: ['@next/font', 'next-auth', 'react', 'react-dom'],
    optimizeCss: true,
    scrollRestoration: true,
  },
  // OPTIMIZED: Compression
  compress: true,
  // OPTIMIZED: Power optimization
  poweredByHeader: false,
  // OPTIMIZED: React strict mode for development only
  reactStrictMode: process.env.NODE_ENV === 'development',
  // OPTIMIZED: Output optimization
  output: 'standalone',
  // OPTIMIZED: SWC minification
  swcMinify: true,
  // OPTIMIZED: Bundle optimization
  webpack: (config: any) => {
    config.optimization = {
      ...config.optimization,
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
        },
      },
    };
    return config;
  },
};

export default nextConfig;
