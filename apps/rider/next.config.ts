import type { NextConfig } from 'next';

const PRODUCTION_API = process.env.NEXT_PUBLIC_API_URL || 'https://api.tatkabazar.com';
const PRODUCTION_HUB = process.env.NEXT_PUBLIC_HUB_URL || 'https://hub-gamma-umber.vercel.app';

// Extract domain for CSP
const apiDomain = (() => {
  try { return new URL(PRODUCTION_API).hostname; } catch { return 'api.tatkabazar.com'; }
})();
const hubDomain = (() => {
  try { return new URL(PRODUCTION_HUB).hostname; } catch { return 'hub-gamma-umber.vercel.app'; }
})();

const nextConfig: NextConfig = {
  transpilePackages: ['@tatka-bazar/shared', '@tatka-bazar/database'],

  // Compress output
  compress: true,

  // Production optimizations
  poweredByHeader: false,
  reactStrictMode: true,

  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 86400,
  },

  async headers() {
    return [
      {
        // Service Worker — must NOT be cached by browser
        source: '/sw.js',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=0, must-revalidate' },
          { key: 'Service-Worker-Allowed', value: '/' },
        ],
      },
      {
        // Manifest
        source: '/manifest.json',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=3600, stale-while-revalidate=86400' },
          { key: 'Content-Type', value: 'application/manifest+json; charset=utf-8' },
        ],
      },
      {
        // Static assets — long cache
        source: '/icons/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        // All routes — security headers
        source: '/(.*)',
        headers: [
          // Prevent clickjacking
          { key: 'X-Frame-Options', value: 'DENY' },
          // Prevent MIME sniffing
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          // XSS protection (legacy browsers)
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          // Referrer policy
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          // HSTS (after confirming HTTPS in production)
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          // Permissions policy — limit sensitive APIs
          {
            key: 'Permissions-Policy',
            value: [
              'camera=(self)',           // For face cam / KYC
              'microphone=()',           // Not needed
              'geolocation=(self)',      // GPS for riders
              'payment=()',              // No payment in rider app
              'usb=()',
              'bluetooth=()',
              'accelerometer=(self)',
              'gyroscope=(self)',
            ].join(', '),
          },
          // Content Security Policy
          {
            key: 'Content-Security-Policy',
            value: [
              `default-src 'self'`,
              // Scripts: self + inline scripts for SW registration
              `script-src 'self' 'unsafe-inline' https://www.gstatic.com https://www.googleapis.com`,
              // Styles: self + inline styles (React inline styles)
              `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`,
              // Fonts
              `font-src 'self' https://fonts.gstatic.com`,
              // Images: self + data URIs (for map tiles)
              `img-src 'self' data: blob: https://*.tile.openstreetmap.org https://tile.openstreetmap.org`,
              // API connections: production + local dev
              `connect-src 'self' ${PRODUCTION_API} wss://${apiDomain} ${PRODUCTION_HUB} wss://${hubDomain} https://www.googleapis.com https://fcm.googleapis.com ws://localhost:3003 ws://localhost:4000 http://localhost:4000 http://localhost:3004`,
              // Media: camera for face cam
              `media-src 'self' blob:`,
              // Workers: service worker
              `worker-src 'self' blob:`,
              // Manifest
              `manifest-src 'self'`,
              // Frame: deny all
              `frame-src 'none'`,
              // Object: deny all
              `object-src 'none'`,
              // Base URI: self only
              `base-uri 'self'`,
              // Form action: self only
              `form-action 'self'`,
            ].join('; '),
          },
        ],
      },
    ];
  },

  // WebSocket support through rewrites (for local dev)
  async rewrites() {
    return [
      {
        source: '/ws/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/ws/:path*`,
      },
    ];
  },
};

export default nextConfig;
