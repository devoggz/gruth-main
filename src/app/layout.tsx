// src/app/layout.tsx
import React from "react";
import type { Metadata, Viewport } from "next";
import "./globals.css";
import AuthSessionProvider from "@/components/providers/SessionProvider";
import PWAInstallBanner from "@/components/shared/PWAInstallBanner";
import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin";
import { extractRouterConfig } from "uploadthing/server";
import { ourFileRouter } from "@/app/api/uploadthing/core";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

export const viewport: Viewport = {
  // Prevents iOS from zooming on input focus
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
    url: "https://gruth.ke",
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
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <head>
        {/* DNS prefetch + preconnect for external origins */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link rel="dns-prefetch" href="https://l954sx9dfs.ufs.sh" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />

        {/* Google Fonts — display=swap prevents FOIT */}
        <link
          href="https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />

        {/* PWA meta */}
        <meta name="application-name" content="GRUTH" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-touch-fullscreen" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="GRUTH" />

        {/* Preload hero image to reduce LCP */}
        <link
          rel="preload"
          as="image"
          href="https://l954sx9dfs.ufs.sh/f/pgwsuECRjuZYbl6qz6s6XfCH4Q3Mz8bhvFZ0Em5ncsaDxIlB"
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
