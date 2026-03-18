// src/app/(marketing)/request-verification/page.tsx
import type { Metadata } from "next";
import RequestVerificationForm from "@/components/home/RequestVerificationForm";

export const metadata: Metadata = {
  title: "Request a Verification",
  description:
    "Submit your verification request. We confirm availability and provide a quote within 2 business hours.",
};

export default function RequestVerificationPage() {
  return (
    <div className="pt-16">
      {/* Hero */}
      <section className="relative bg-charcoal-950 overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(to right, #f97316 1px, transparent 1px),
                              linear-gradient(to bottom, #f97316 1px, transparent 1px)`,
            backgroundSize: "56px 56px",
            opacity: 0.045,
          }}
        />
        <div className="relative max-w-3xl mx-auto px-4 text-center py-10 sm:py-14">
          <span className="inline-flex items-center gap-1.5 text-orange-400 text-[10px] sm:text-xs font-bold tracking-widest uppercase bg-orange-500/10 border border-orange-500/20 px-3 py-1.5 rounded-full mb-4 sm:mb-5">
            Get Started
          </span>
          <h1 className="font-display text-3xl sm:text-5xl font-bold text-white mb-3 sm:mb-4 tracking-tight">
            Request a Verification
          </h1>
          <p className="text-charcoal-300 text-sm sm:text-lg font-light max-w-xl mx-auto leading-relaxed">
            Tell us about your project. We confirm availability and provide a
            quote within 2 business hours.
          </p>
        </div>
      </section>

      {/* Form section */}
      <section className="relative py-10 sm:py-12">
        <div className="absolute inset-0 pointer-events-none" />
        <div className="relative">
          <RequestVerificationForm />
        </div>
      </section>
    </div>
  );
}
