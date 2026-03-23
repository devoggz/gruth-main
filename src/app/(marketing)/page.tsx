t// src/app/(marketing)/page.tsx
// Performance: HeroSectionAlter is imported normally (above fold, critical path).
// All below-fold sections use dynamic() with ssr:true so their JS is
// code-split into separate chunks — the browser only downloads them when needed,
// shrinking the initial JS payload that blocks TTI on mobile.

import type { Metadata } from "next";
import dynamic from "next/dynamic";
import HeroSection from "@/components/sections/HeroSection";

// ─── Below-fold sections — code-split ────────────────────────────────────────
// ssr:true = still server-rendered (no flash), but JS is a separate chunk
// loaded after the critical path, improving TTI on mobile.

const ProblemSection    = dynamic(() => import("@/components/sections/ProblemSection"),    { ssr: true });
const ServicesSection   = dynamic(() => import("@/components/sections/ServicesSection"),   { ssr: true });
const QuoteCalculator   = dynamic(() => import("@/components/home/QuoteCalculator"),       { ssr: true });
const HowItWorksSection = dynamic(() => import("@/components/sections/HowItWorksSection"), { ssr: true });
const CtaSection        = dynamic(() => import("@/components/sections/CtaSection"),        { ssr: true });

export const metadata: Metadata = {
  title: "Get it Verified – Eyes on Your Project in 48 Hours",
  description:
    "Independent, on-the-ground verification for diaspora-funded projects in Kenya. Photos, video, measurements — delivered to your dashboard in 48 hours.",
  openGraph: {
    title:       "GRUTH — Diaspora property & investment verification",
    description: "Know exactly what's happening with your property or project at home.",
    url:         "https://gruth.ke",
    siteName:    "GRUTH",
    type:        "website",
  },
};

export default function HomePage() {
  return (
    <div>
      {/* HeroSectionAlter is above-fold — NOT code-split, loaded immediately */}
      <HeroSection />
      <ProblemSection />
      <ServicesSection />
      <HowItWorksSection />
      <CtaSection />
    </div>
  );
}
