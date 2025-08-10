import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable experimental features for better performance
  experimental: {
    optimizePackageImports: ['framer-motion', 'lucide-react'],
  },
  // Simple locale fallback rewrites (middleware removed to avoid Edge runtime issues)
  async rewrites() {
    return [
      // Root path -> Arabic default
  { source: '/', destination: '/ar' },
    ]
  },
  
  // Image optimization configuration (updated to remotePatterns)
  images: {
    remotePatterns: [
      { protocol: 'http', hostname: 'localhost' },
      { protocol: 'https', hostname: 'coptic-treasures.com' },
      { protocol: 'https', hostname: 'www.christianlib.com' },
      { protocol: 'https', hostname: 'christianlib.com' },
  // Added scraped CDN host for loader GIFs / thumbnails
  { protocol: 'https', hostname: 'eadn-wc05-6472364.nxedge.io' },
  // { protocol: 'https', hostname: 'NEW-CDN-DOMAIN' }, // placeholder for future domains if images blocked
    ],
    formats: ['image/webp', 'image/avif'],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  
  // Headers for better security and caching
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
      {
        source: '/favicon.ico',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
  
  // Redirects for better SEO
  async redirects() {
    return [
      {
        source: '/home',
  destination: '/ar',
        permanent: true,
      },
      {
        source: '/index',
  destination: '/ar',
        permanent: true,
      },
    ];
  },
  
  // Enable TypeScript strict mode
  typescript: {
    ignoreBuildErrors: false,
  },
  
  // Enable ESLint during builds
  eslint: {
    ignoreDuringBuilds: false,
  },
  
  // Environment variables
  env: {
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  },
};

export default nextConfig;
