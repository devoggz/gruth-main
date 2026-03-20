// src/app/(marketing)/page.tsx
import type { Metadata } from "next";
import HeroSectionAlter    from "@/components/sections/HeroSectionAlter";
import ProblemSection      from "@/components/sections/ProblemSection";
import ServicesSection     from "@/components/sections/ServicesSection";
import QuoteCalculator     from "@/components/home/QuoteCalculator";
import HowItWorksSection   from "@/components/sections/HowItWorksSection";
import TestimonialsSection from "@/components/sections/TestimonialsSection";
import CommunitySection    from "@/components/sections/CommunitySection";
import CtaSection          from "@/components/sections/CtaSection";

export const metadata: Metadata = {
    title: "Know Exactly What's Happening Back Home | GRUTH",
    description: "Independent on-the-ground verification for Kenyans abroad. Photos, video, GPS evidence delivered to your dashboard in 48 hours.",
    openGraph: {
        title:       "GRUTH — Diaspora Verification",
        description: "Know exactly what's happening with your property or project in Kenya.",
        url:         "https://gruth.ke",
        siteName:    "GRUTH",
        type:        "website",
    },
};

export default function HomePage() {
    return (
        <div className="pt-16">
            <HeroSectionAlter />
            <ProblemSection />
            <ServicesSection />
            <QuoteCalculator />
            <HowItWorksSection />
            <TestimonialsSection />
            <CommunitySection />
            <CtaSection />
        </div>
    );
}