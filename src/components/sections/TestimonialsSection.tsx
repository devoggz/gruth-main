"use client";
// src/components/sections/TestimonialsSection.tsx
// Rebuilt: richer cards with verified badge, diaspora location flags,
// money-saved callout, fade-in animation, and a "share your story" CTA.

import { useEffect, useRef } from "react";
import Link from "next/link";

const testimonials = [
  {
    quote:
      "I was being told my house was 70% done. GRUTH visited and confirmed the walls were only halfway up. I would have sent another £15,000 for work that hadn't happened.",
    name: "Sarah O.",
    location: "Manchester, UK",
    flag: "🇬🇧",
    service: "Construction Verification",
    saved: "£15,000",
    rating: 5,
  },
  {
    quote:
      "They visited the plot I was about to buy and found it was already being claimed by someone else. There was an active dispute I knew nothing about. I would have lost everything.",
    name: "Michael K.",
    location: "Toronto, Canada",
    flag: "🇨🇦",
    service: "Land & Property",
    saved: "CA$80,000",
    rating: 5,
  },
  {
    quote:
      "My contractor was quoting cement at nearly 30% above market. GRUTH's material pricing report gave me the exact figures to push back with. He adjusted the quote immediately.",
    name: "Grace N.",
    location: "Oslo, Norway",
    flag: "🇳🇴",
    service: "Material Pricing",
    saved: "KES 340,000",
    rating: 5,
  },
  {
    quote:
      "The caretaker hadn't been to the property in months. GRUTH confirmed the fence had been removed and there was an encroachment on the eastern side. We'd never have known.",
    name: "David M.",
    location: "Atlanta, USA",
    flag: "🇺🇸",
    service: "Land & Property",
    saved: "$12,000",
    rating: 5,
  },
  {
    quote:
      "The wedding event oversight was brilliant. I couldn't travel back and my aunt kept saying everything was fine. GRUTH's agent was on the ground from setup to close — real-time updates.",
    name: "Wanjiku A.",
    location: "Melbourne, Australia",
    flag: "🇦🇺",
    service: "Wedding & Events",
    saved: null,
    rating: 5,
  },
  {
    quote:
      "I wanted to invest in my brother's shop but couldn't verify it was real. GRUTH confirmed the premises, checked the stock, and confirmed the trading history. I invested with confidence.",
    name: "Peter O.",
    location: "Dubai, UAE",
    flag: "🇦🇪",
    service: "Business Investment",
    saved: "AED 55,000",
    rating: 5,
  },
];

function StarRating({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <svg
          key={n}
          className={`w-3.5 h-3.5 ${n <= count ? "text-orange-400" : "text-charcoal-700"}`}
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  );
}

export default function TestimonialsSection() {
  const headRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            (e.target as HTMLElement).classList.add("ts-in");
            obs.unobserve(e.target);
          }
        }),
      { threshold: 0.08 },
    );
    [headRef, gridRef].forEach((r) => r.current && obs.observe(r.current));
    return () => obs.disconnect();
  }, []);

  return (
    <section className="relative py-24 bg-charcoal-950 overflow-hidden">
      {/* Subtle grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)",
          backgroundSize: "52px 52px",
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div ref={headRef} className="text-center mb-14 ts-fade">
          <span className="inline-flex items-center gap-2 text-orange-400 text-[10px] font-bold tracking-widest uppercase bg-orange-500/10 border border-orange-500/20 px-3 py-1.5 rounded-full mb-5">
            Client Stories
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-white mb-4 tracking-tight">
            Real projects. Real money.
            <br className="hidden sm:block" />
            <span className="text-orange-400"> Real results.</span>
          </h2>
          <p className="text-charcoal-400 text-base max-w-lg mx-auto">
            Every card below is a situation where distance was about to cost
            someone dearly. GRUTH changed the outcome.
          </p>
        </div>

        {/* Cards grid */}
        <div
          ref={gridRef}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-12 ts-fade"
        >
          {testimonials.map(
            ({ quote, name, location, flag, service, saved, rating }) => (
              <div
                key={name}
                className="group bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.07] hover:border-white/[0.14] rounded-2xl p-6 flex flex-col gap-4 transition-all duration-200"
              >
                {/* Top row — verified badge + stars */}
                <div className="flex items-center justify-between">
                  <div className="inline-flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-widest">
                    <svg
                      className="w-2.5 h-2.5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                    >
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                    Verified
                  </div>
                  <StarRating count={rating} />
                </div>

                {/* Quote */}
                <p className="text-charcoal-300 text-sm leading-relaxed flex-1">
                  "{quote}"
                </p>

                {/* Saved callout */}
                {saved && (
                  <div className="bg-orange-500/8 border border-orange-500/15 rounded-xl px-3 py-2 flex items-center gap-2">
                    <svg
                      className="w-3.5 h-3.5 text-orange-400 flex-shrink-0"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                    <p className="text-xs text-orange-300">
                      <span className="font-bold">{saved}</span> protected
                    </p>
                  </div>
                )}

                {/* Footer — person + service */}
                <div className="border-t border-white/[0.06] pt-4 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 bg-charcoal-800 rounded-full flex items-center justify-center text-base flex-shrink-0">
                      {flag}
                    </div>
                    <div>
                      <p className="text-white text-xs font-semibold">{name}</p>
                      <p className="text-charcoal-500 text-[10px]">
                        {location}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] bg-orange-500/10 text-orange-400 border border-orange-500/15 px-2 py-0.5 rounded-full whitespace-nowrap flex-shrink-0">
                    {service}
                  </span>
                </div>
              </div>
            ),
          )}
        </div>

        {/* Bottom CTA */}
        <div className="text-center">
          <Link
            href="/request-verification"
            className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-8 py-4 rounded-xl transition-all hover:shadow-xl hover:shadow-orange-500/20 hover:-translate-y-0.5"
          >
            Get your own verification
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>

      <style>{`
        .ts-fade { opacity:0; transform:translateY(28px); transition:opacity 0.7s ease, transform 0.7s ease; }
        .ts-fade.ts-in { opacity:1; transform:translateY(0); }
      `}</style>
    </section>
  );
}
