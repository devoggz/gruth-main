"use client";
// src/components/sections/CtaSection.tsx
// Upgraded: three paths (get started, WhatsApp, talk to team)

import Link from "next/link";
import { useEffect, useRef } from "react";

export default function CtaSection() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("cta-in");
          obs.disconnect();
        }
      },
      { threshold: 0.12 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <section className="relative py-24 sm:py-28 overflow-hidden bg-orange-500">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(to right,rgba(255,255,255,0.07) 1px,transparent 1px),linear-gradient(to bottom,rgba(255,255,255,0.07) 1px,transparent 1px)",
          backgroundSize: "56px 56px",
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 70% 70% at 50% 50%,rgba(255,255,255,0.1) 0%,transparent 70%)",
        }}
      />

      <div
        ref={ref}
        className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center cta-fade"
      >
        <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white text-[10px] font-bold px-3 py-1.5 rounded-full mb-6 uppercase tracking-widest">
          <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
          Get eyes on the ground today
        </div>

        <h2 className="font-display text-4xl sm:text-5xl font-bold text-white mb-6 leading-tight tracking-tight">
          Get Eyes You Can Actually Trust
        </h2>
        <p className="text-orange-100 text-base sm:text-lg mb-10 max-w-2xl mx-auto leading-relaxed">
          Every week you wait is another of 'its coming along nicely'. Get the
          truth
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-3">
          {/* Primary */}
          <Link
            href="/request-verification"
            className="group inline-flex items-center justify-center gap-2 bg-white text-orange-600 font-semibold px-8 py-4 rounded-xl hover:bg-orange-50 transition-all duration-200 hover:shadow-xl hover:shadow-orange-700/20 hover:-translate-y-0.5 active:translate-y-0"
          >
            Get Started
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              className="transition-transform duration-200 group-hover:translate-x-0.5"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>

          {/* WhatsApp channel */}

          {/* Talk to team */}
          <Link
            href="/contact"
            className="inline-flex items-center justify-center gap-2 border-2 border-white/40 hover:border-white text-white font-medium px-8 py-4 rounded-xl transition-all duration-200 hover:bg-white/5"
          >
            Talk to Our Team
          </Link>
        </div>
      </div>

      <style>{`
        .cta-fade { opacity:0; transform:translateY(28px); transition:opacity 0.7s ease,transform 0.7s ease; }
        .cta-fade.cta-in { opacity:1; transform:translateY(0); }
      `}</style>
    </section>
  );
}
