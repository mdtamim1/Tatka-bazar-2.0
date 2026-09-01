import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_API_URL: process.env["API_URL"] ?? "http://localhost:4000",
  },
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 86400, // 24 hours image CDN cache
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "**" },
    ],
  },
  async headers() {
    return [
      // 1. Edge & CDN Caching for Catalog & Static Routes (s-maxage=300, stale-while-revalidate=600)
      {
        source: "/:path*",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
        ],
      },
      // 2. Heavy caching for static images and assets
      {
        source: "/_next/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      // 3. Edge CDN cache for public pages
      {
        source: "/(category|product|shop|recipes)/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, s-maxage=300, stale-while-revalidate=600",
          },
        ],
      },
    ];
  },
  async rewrites() {
    const adminUrl = process.env["ADMIN_URL"] ?? "http://localhost:3001";
    const vendorUrl = process.env["VENDOR_URL"] ?? "http://localhost:3002";
    const riderUrl = process.env["RIDER_URL"] ?? "http://localhost:3003";

    return [
      // Admin Portal Multi-Zone Proxying
      {
        source: "/admin",
        destination: `${adminUrl}`,
      },
      {
        source: "/admin/:path*",
        destination: `${adminUrl}/:path*`,
      },
      // Vendor Portal Multi-Zone Proxying
      {
        source: "/vendor",
        destination: `${vendorUrl}`,
      },
      {
        source: "/vendor/:path*",
        destination: `${vendorUrl}/:path*`,
      },
      // Rider Portal Multi-Zone Proxying
      {
        source: "/rider",
        destination: `${riderUrl}`,
      },
      {
        source: "/rider/:path*",
        destination: `${riderUrl}/:path*`,
      },
    ];
  },
};

export default nextConfig;
