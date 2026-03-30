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
            ([entry]) => { if (entry.isIntersecting) { el.classList.add("cta-in"); obs.disconnect(); } },
            { threshold: 0.12 }
        );
        obs.observe(el);
        return () => obs.disconnect();
    }, []);

    return (
        <section className="relative py-24 sm:py-28 overflow-hidden bg-orange-500">
            <div className="absolute inset-0 pointer-events-none"
                 style={{ backgroundImage: "linear-gradient(to right,rgba(255,255,255,0.07) 1px,transparent 1px),linear-gradient(to bottom,rgba(255,255,255,0.07) 1px,transparent 1px)", backgroundSize: "56px 56px" }}
            />
            <div className="absolute inset-0 pointer-events-none"
                 style={{ background: "radial-gradient(ellipse 70% 70% at 50% 50%,rgba(255,255,255,0.1) 0%,transparent 70%)" }}
            />

            <div ref={ref} className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center cta-fade">
                <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white text-[10px] font-bold px-3 py-1.5 rounded-full mb-6 uppercase tracking-widest">
                    <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                    Get eyes on the ground today
                </div>

                <h2 className="font-display text-4xl sm:text-5xl font-bold text-white mb-6 leading-tight tracking-tight">
                    Get Eyes You Can Actually Trust
                </h2>
                <p className="text-orange-100 text-base sm:text-lg mb-10 max-w-2xl mx-auto leading-relaxed">
                    Every week you wait is another of 'its coming along nicely'. Get the truth
                </p>

                <div className="flex flex-col sm:flex-row justify-center gap-3">
                    {/* Primary */}
                    <Link href="/request-verification"
                          className="group inline-flex items-center justify-center gap-2 bg-white text-orange-600 font-semibold px-8 py-4 rounded-xl hover:bg-orange-50 transition-all duration-200 hover:shadow-xl hover:shadow-orange-700/20 hover:-translate-y-0.5 active:translate-y-0">
                        Get Started
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                             className="transition-transform duration-200 group-hover:translate-x-0.5">
                            <path d="M5 12h14M12 5l7 7-7 7"/>
                        </svg>
                    </Link>

                    {/* WhatsApp channel */}
                    <a href="https://whatsapp.com/channel/gruth-kenya" target="_blank" rel="noreferrer"
                       className="inline-flex items-center justify-center gap-2.5 bg-[#25D366] hover:bg-[#1db955] text-white font-semibold px-8 py-4 rounded-xl transition-all duration-200 hover:shadow-xl hover:shadow-black/20 hover:-translate-y-0.5">
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                        </svg>
                        Join WhatsApp Channel
                    </a>

                    {/* Talk to team */}
                    <Link href="/contact"
                          className="inline-flex items-center justify-center gap-2 border-2 border-white/40 hover:border-white text-white font-medium px-8 py-4 rounded-xl transition-all duration-200 hover:bg-white/5">
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