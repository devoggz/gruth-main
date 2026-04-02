// src/app/layout.tsx
import React from "react";
import type { Metadata, Viewport } from "next";
import "./globals.css";
import { DM_Sans, DM_Mono, Red_Hat_Display, Roboto } from "next/font/google";
import AuthSessionProvider from "@/components/providers/SessionProvider";
import PWAInstallBanner from "@/components/shared/PWAInstallBanner";
import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin";
import { extractRouterConfig } from "uploadthing/server";
import { ourFileRouter } from "@/app/api/uploadthing/core";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
  variable: "--font-body",
  preload: true,
});

const dmMono = DM_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
  variable: "--font-mono",
  preload: false,
});

const playfair = Roboto({
  subsets: ["latin"],
  weight: ["700", "800"],
  display: "swap",
  variable: "--font-display",
  preload: true,
});

// ─────────────────────────────────────────────────────────────────────────────

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#1e1d1a",
};

export const metadata: Metadata = {
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "GRUTH" },
  title: {
    default: "GRUTH — Diaspora property & investment verification",
    template: "%s | GRUTH",
  },
  description:
    "Independent, on-the-ground verification for diaspora-funded projects in Kenya. Photos, video, measurements — delivered to your dashboard in 48 hours.",
  keywords: [
    "Kenya verification",
    "diaspora projects",
    "construction verification",
    "land verification",
    "project monitoring",
    "property verification Kenya",
  ],
  authors: [{ name: "GRUTH" }],
  creator: "GRUTH",
  openGraph: {
    type: "website",
    locale: "en_GB",
    url: "https://gruth.it.com",
    title: "GRUTH — Diaspora property & investment verification",
    description:
      "Trusted on-the-ground verification for diaspora-funded projects in Kenya.",
    siteName: "GRUTH",
  },
  twitter: {
    card: "summary_large_image",
    title: "GRUTH",
    description:
      "Trusted on-the-ground verification for diaspora-funded projects in Kenya.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      data-scroll-behavior="smooth"
      className={`${dmSans.variable} ${dmMono.variable} ${playfair.variable}`}
    >
      <head>
        {/* Preconnect to image CDN — eliminates DNS+TCP+TLS from the LCP critical path */}
        <link rel="preconnect" href="https://l954sx9dfs.ufs.sh" />
        <link rel="dns-prefetch" href="//images.unsplash.com" />

        {/* PWA meta */}
        <meta name="application-name" content="GRUTH" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-touch-fullscreen" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="GRUTH" />

        {/* Hero image preload — fetchpriority tells browser this is the LCP element.
            imageSrcSet/imageSizes let mobile devices fetch a smaller file. */}
        <link
          rel="preload"
          as="image"
          href="https://l954sx9dfs.ufs.sh/f/pgwsuECRjuZYbl6qz6s6XfCH4Q3Mz8bhvFZ0Em5ncsaDxIlB"
          // @ts-ignore — imageSrcSet is valid in HTML5 but not yet in React types
          imageSrcSet="https://l954sx9dfs.ufs.sh/f/pgwsuECRjuZYbl6qz6s6XfCH4Q3Mz8bhvFZ0Em5ncsaDxIlB?w=828 828w, https://l954sx9dfs.ufs.sh/f/pgwsuECRjuZYbl6qz6s6XfCH4Q3Mz8bhvFZ0Em5ncsaDxIlB?w=1200 1200w, https://l954sx9dfs.ufs.sh/f/pgwsuECRjuZYbl6qz6s6XfCH4Q3Mz8bhvFZ0Em5ncsaDxIlB 1920w"
          imageSizes="100vw"
          // @ts-ignore
          fetchPriority="high"
        />
      </head>
      <AuthSessionProvider>
        <body className="antialiased">
          <Analytics />
          <SpeedInsights />
          <PWAInstallBanner />
          <NextSSRPlugin routerConfig={extractRouterConfig(ourFileRouter)} />
          {children}
        </body>
      </AuthSessionProvider>
    </html>
  );
}
