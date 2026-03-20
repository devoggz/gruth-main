import type { Metadata } from "next";

import HeroSection from "@/components/sections/HeroSection";
import ProblemSection from "@/components/sections/ProblemSection";
import ServicesSection from "@/components/sections/ServicesSection";
import QuoteCalculator from "@/components/home/QuoteCalculator";
import HowItWorksSection from "@/components/sections/HowItWorksSection";
import TestimonialsSection from "@/components/sections/TestimonialsSection";
import CtaSection from "@/components/sections/CtaSection";
import HeroSectionAlt from "@/components/sections/HeroSectionAlt";
import HeroSectionAlter from "@/components/sections/HeroSectionAlter";

export const metadata: Metadata = {
  title: "Request Verification Now – Get Eyes on Your Project in 48 Hours",
};

export default function HomePage() {
  return (
    <div className="pt-16">
      <HeroSectionAlter />
      <ProblemSection />
      <ServicesSection />
      <QuoteCalculator />
      <HowItWorksSection />
      <CtaSection />
    </div>
  );
}
