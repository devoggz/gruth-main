"use client";
// src/components/sections/HeroSectionAlter.tsx
// Full-bleed hero — edge to edge, height-screen, navbar floats on top.

import Link from "next/link";
import Image from "next/image";

function ScrollIndicator() {
    return (
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce-slow pointer-events-none">
      <span className="text-charcoal-600 text-[10px] font-bold uppercase tracking-[0.2em]">
        Scroll
      </span>
            <div className="w-px h-10 bg-gradient-to-b from-charcoal-600 to-transparent" />
        </div>
    );
}

const trustBadges = [
    "Photo + Video Evidence",
    "Written Reports",
    "Secure Dashboard",
    "Verified Inspectors",
];

export default function HeroSection() {
    return (
        <section className="relative w-full h-screen min-h-[600px] max-h-[940px] overflow-hidden">

            {/* Background image — full bleed */}
            <Image
                src="/images/hero.jpg"
               alt="Construction site in Kenya"
  fill                            // fills the container
  priority                        // LCP — fetch immediately
  quality={85}
  sizes="100vw"
  className="object-cover object-center hero-img"
            />

            {/* Gradient overlay */}
            <div
                className="absolute inset-0"
                style={{
                    background: `
            linear-gradient(to top, rgba(10,9,8,0.92) 0%, rgba(10,9,8,0.55) 45%, rgba(10,9,8,0.15) 75%, transparent 100%),
            linear-gradient(to right, rgba(10,9,8,0.5) 0%, transparent 55%)
          `,
                }}
            />

            {/* Grid texture */}
            <div
                className="absolute inset-0 opacity-[0.04] mix-blend-screen pointer-events-none"
                style={{
                    backgroundImage: `linear-gradient(to right,#f97316 1px,transparent 1px),linear-gradient(to bottom,#f97316 1px,transparent 1px)`,
                    backgroundSize: "60px 60px",
                }}
            />

            {/* Content — capped at max-w-7xl, padded to sit below the 64px navbar */}
            <div className="relative z-10 h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col text-center items-center justify-center pt-8">
                <div className="max-w-4xl">
                    <div
                        className="inline-flex items-center gap-2 bg-orange-500/20 border border-orange-500/25 text-orange-300 text-[10px] font-bold px-3 py-1.5 rounded-full mb-6 uppercase tracking-widest"
                        style={{ animation: "hero-fade-up 0.65s ease both" }}
                    >
                        <span className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-pulse" />
                        WELCOME TO GRUTH
                    </div>

                    <h1
                        className="font-display text-6xl lg:text-7xl font-bold text-white leading-[1.05] mb-5 tracking-tight"
                        style={{ animation: "hero-fade-up 0.65s 0.08s ease both" }}
                    >
                        See exactly
                        <br />
                        what&rsquo;s happening
                        <br />
                        <span className="text-orange-400 italic">back home.</span>
                    </h1>

                    <p
                        className="text-white/60 text-base sm:text-lg text-center leading-relaxed mb-8 max-w-lg"
                        style={{ animation: "hero-fade-up 0.65s 0.16s ease both" }}
                    >
                        Your fundi says it's 80% done. Your cousin says the same thing. But is is true? Find out what's actually true with independent eyes on your site in 48 hours
                    </p>

                    <div
                        className="flex flex-col justify-center sm:flex-row gap-3"
                        style={{ animation: "hero-fade-up 0.65s 0.24s ease both" }}
                    >
                        <Link
prefetch={true}
                            href="/request-verification"
                            className="inline-flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold text-sm px-7 py-3.5 rounded-xl transition-all duration-200  hover:-translate-y-0.5 active:translate-y-0"
                        >
                            Get it Verified
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <path d="M5 12h14M12 5l7 7-7 7" />
                            </svg>
                        </Link>

                        <Link
prefetch={true}
                            href="/how-it-works"
                            className="inline-flex items-center justify-center gap-2 text-white/70 hover:text-white bg-white/10 hover:bg-white/15 border border-white/15 hover:border-white/30 rounded-xl px-7 py-3.5 text-sm font-medium transition-all duration-200 backdrop-blur-sm"
                        >
                            See how it works
                        </Link>
                    </div>
                </div>
                <div
                    className="absolute bottom-12 flex flex-wrap gap-x-6 gap-y-3"
                    style={{ animation: "hero-fade-up 0.7s 0.4s ease both" }}
                >
                    {trustBadges.map((t) => (
                        <div
                            key={t}
                            className="flex justify-between items-center gap-2 text-charcoal-400 text-sm"
                        >
                            <svg
                                width="13"
                                height="13"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="#f97316"
                                strokeWidth="2.5"
                            >
                                <path d="M20 6L9 17l-5-5" />
                            </svg>
                            {t}
                        </div>
                    ))}
                </div>
            </div>

            {/*<ScrollIndicator/>*/}


            <style>{`
        @keyframes hero-fade-up {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
        </section>
    );
}