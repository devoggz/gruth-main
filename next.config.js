/** @type {import('next').NextConfig} */

const CSP = [
  "default-src 'self'",
  // Scripts: self + Vercel Analytics + Uploadthing + Leaflet CDN
  "script-src 'self' 'unsafe-inline' https://vercel.live https://va.vercel-scripts.com",
  // Styles: self + inline (Tailwind) + Leaflet
  "style-src 'self' 'unsafe-inline' https://unpkg.com",
  // Images: self + all approved CDN hosts (no wildcards)
  "img-src 'self' blob: data: https://images.unsplash.com https://res.cloudinary.com https://l954sx9dfs.ufs.sh https://utfs.io https://lh3.googleusercontent.com https://lh4.googleusercontent.com https://lh5.googleusercontent.com https://lh6.googleusercontent.com https://tile.openstreetmap.org https://a.tile.openstreetmap.org https://b.tile.openstreetmap.org https://c.tile.openstreetmap.org https://unpkg.com",
  // Fonts: self
  "font-src 'self'",
  // Connect: self + Uploadthing + Nominatim + Vercel Analytics
  "connect-src 'self' https://l954sx9dfs.ufs.sh https://utfs.io https://uploadthing.com https://nominatim.openstreetmap.org https://vitals.vercel-insights.com",
  // Frames: none (DENY equivalent for CSP)
  "frame-src 'none'",
  "frame-ancestors 'none'",
  // Workers: self (for SW)
  "worker-src 'self'",
  // Manifest: self
  "manifest-src 'self'",
].join("; ");

const nextConfig = {
  experimental: {
    optimizePackageImports: ["recharts", "react-leaflet"],
  },

  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "l954sx9dfs.ufs.sh" },
      { protocol: "https", hostname: "utfs.io" },
      // Explicit Google profile photo subdomains — no wildcard
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "lh4.googleusercontent.com" },
      { protocol: "https", hostname: "lh5.googleusercontent.com" },
      { protocol: "https", hostname: "lh6.googleusercontent.com" },
      // Uploadthing
      { protocol: "https", hostname: "uploadthing.com" },
    ],
    deviceSizes:  [390, 640, 750, 828, 1080, 1200, 1920],
    imageSizes:   [16, 32, 48, 64, 96, 128, 256],
    minimumCacheTTL: 86400, // 24h CDN cache for optimised images
  },

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options",    value: "nosniff"                       },
          { key: "X-Frame-Options",           value: "DENY"                          },
          { key: "Referrer-Policy",           value: "strict-origin-when-cross-origin" },
          // HSTS — 1 year, include subdomains, preload-ready
          { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains; preload" },
          // CSP
          { key: "Content-Security-Policy",   value: CSP                             },
          // Disable FLoC / interest cohort
          { key: "Permissions-Policy",        value: "camera=(), microphone=(), geolocation=(self), interest-cohort=()" },
          // Prevent IE from sniffing MIME
          { key: "X-DNS-Prefetch-Control",    value: "on"                            },
        ],
      },
      {
        // Long-cache immutable static assets
        source: "/images/(.*)",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
      {
        source: "/icons/(.*)",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
      {
        // Service worker must not be cached
        source: "/sw.js",
        headers: [{ key: "Cache-Control", value: "public, max-age=0, must-revalidate" }],
      },
      {
        // API responses: no store
        source: "/api/(.*)",
        headers: [
          { key: "Cache-Control",   value: "no-store, no-cache, must-revalidate" },
          { key: "Pragma",          value: "no-cache"                             },
          { key: "X-Robots-Tag",    value: "noindex"                              },
        ],
      },
    ];
  },

  compress: true,
  poweredByHeader: false, // remove X-Powered-By: Next.js fingerprint

  turbopack: {
    root: __dirname,
  },
};

module.exports = nextConfig;