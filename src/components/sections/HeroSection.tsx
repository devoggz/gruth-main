"use client";
// src/components/sections/HeroSectionAlter.tsx
// Full-bleed hero — edge to edge, height-screen, navbar floats on top.

import Link from "next/link";


const trustBadges = [
    "Photo + Video Evidence",
    "Written Reports",
    "Secure Dashboard",
    "Verified Inspectors",
];

export default function HeroSection() {
    return (
        <section className="relative w-full h-screen min-h-[600px] max-h-[960px] overflow-hidden">

            {/* Background image — full bleed */}
            <img
                src="/images/grid.avif"
                alt="Construction site in Kenya"
                className="absolute inset-0 w-full h-full object-cover object-center"
                loading="eager"
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
            <div className="relative z-10 h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-center pt-16">
                <div className="max-w-2xl">
                    <div
                        className="inline-flex items-center gap-2 bg-orange-500/15 border border-orange-500/25 text-orange-300 text-[10px] font-bold px-3 py-1.5 rounded-full mb-6 uppercase tracking-widest"
                        style={{ animation: "hero-fade-up 0.65s ease both" }}
                    >
                        <span className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-pulse" />
                        Ground Truth Verification
                    </div>

                    <h1
                        className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-[1.05] mb-5 tracking-tight"
                        style={{ animation: "hero-fade-up 0.65s 0.08s ease both" }}
                    >
                        Know exactly
                        <br />
                        what&rsquo;s happening
                        <br />
                        <span className="text-orange-400 italic">back home.</span>
                    </h1>

                    <p
                        className="text-white/60 text-base sm:text-lg leading-relaxed mb-8 max-w-md"
                        style={{ animation: "hero-fade-up 0.65s 0.16s ease both" }}
                    >
                        Your contractor says it's 80% done. Your cousin says the same thing. Find out what's actually true with independent eyes on your site in 48 hours
                    </p>

                    <div
                        className="flex flex-col sm:flex-row gap-3"
                        style={{ animation: "hero-fade-up 0.65s 0.24s ease both" }}
                    >
                        <Link
                            href="/request-verification"
                            className="inline-flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold text-sm px-7 py-3.5 rounded-xl transition-all duration-200 hover:shadow-xl hover:shadow-orange-500/30 hover:-translate-y-0.5 active:translate-y-0"
                        >
                            Get it Verified
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <path d="M5 12h14M12 5l7 7-7 7" />
                            </svg>
                        </Link>

                        <Link
                            href="/how-it-works"
                            className="inline-flex items-center justify-center gap-2 text-white/70 hover:text-white bg-white/10 hover:bg-white/15 border border-white/15 hover:border-white/30 rounded-xl px-7 py-3.5 text-sm font-medium transition-all duration-200 backdrop-blur-sm"
                        >
                            See how it works
                        </Link>
                    </div>
                </div>
            </div>


            <style>{`
        @keyframes hero-fade-up {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
        </section>
    );
}