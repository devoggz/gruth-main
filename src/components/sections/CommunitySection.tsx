"use client";
// src/components/sections/CommunitySection.tsx


import Link from "next/link";
import { useEffect, useRef } from "react";

function useFadeIn(delay = 0) {
    const ref = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const timer = setTimeout(() => {
            const obs = new IntersectionObserver(
                ([entry]) => { if (entry.isIntersecting) { el.classList.add("comm-in"); obs.disconnect(); } },
                { threshold: 0.1 }
            );
            obs.observe(el);
            return () => obs.disconnect();
        }, delay);
        return () => clearTimeout(timer);
    }, [delay]);
    return ref;
}

const CHANNELS = [
    {
        icon: (
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
        ),
        label:   "WhatsApp Channel",
        desc:    "Weekly market prices & project updates — straight to your phone.",
        cta:     "Join free",
        href:    "https://whatsapp.com/channel/gruth-kenya",
        color:   "bg-[#25D366] text-white",
        border:  "border-[#25D366]/20",
        bg:      "bg-[#25D366]/5",
    },
    {
        icon: (
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
        ),
        label:   "Facebook Groups",
        desc:    "We're active in the largest Kenyan diaspora groups — answer your questions there.",
        cta:     "Find us",
        href:    "https://facebook.com/groups/search/results/?q=kenyans+uk",
        color:   "bg-[#1877F2] text-white",
        border:  "border-[#1877F2]/20",
        bg:      "bg-[#1877F2]/5",
    },
    {
        icon: (
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
            </svg>
        ),
        label:   "YouTube",
        desc:    "Step-by-step guides on buying land, building from abroad, and verifying projects in Kenya.",
        cta:     "Watch",
        href:    "https://youtube.com/@gruthke",
        color:   "bg-[#FF0000] text-white",
        border:  "border-[#FF0000]/20",
        bg:      "bg-[#FF0000]/5",
    },
];

const STATS = [
    { value: "150+",   label: "Verifications completed"    },
    { value: "47",     label: "Counties covered in Kenya"  },
    { value: "48h",    label: "Average report turnaround"  },
    { value: "£0",     label: "Upfront — pay on delivery"  },
];

export default function CommunitySection() {
    const headRef  = useFadeIn(0);
    const statsRef = useFadeIn(100);
    const cardsRef = useFadeIn(200);
    const ctaRef   = useFadeIn(300);

    return (
        <section className="relative py-24 bg-charcoal-950 overflow-hidden">
            {/* Grid background */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.035]"
                 style={{ backgroundImage: "linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)", backgroundSize: "52px 52px" }}
            />
            {/* Warm glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] pointer-events-none"
                 style={{ background: "radial-gradient(ellipse at center, rgba(249,115,22,0.08) 0%, transparent 70%)" }}
            />

            <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Header */}
                <div ref={headRef} className="text-center mb-14 comm-fade">
          <span className="inline-flex items-center gap-2 text-orange-400 text-[10px] font-bold tracking-widest uppercase bg-orange-500/10 border border-orange-500/20 px-3 py-1.5 rounded-full mb-5">
            Community
          </span>
                    <h2 className="font-display text-3xl sm:text-4xl font-bold text-white tracking-tight mb-4">
                        The conversation is already happening.<br className="hidden sm:block" />
                        <span className="text-orange-400"> We're part of it.</span>
                    </h2>
                    <p className="text-charcoal-400 text-base max-w-xl mx-auto leading-relaxed">
                        Every week, thousands of Kenyans abroad discuss properties, contractors, and projects.
                        GRUTH is where those conversations turn into verified answers.
                    </p>
                </div>

                {/* Stats row */}
                <div ref={statsRef} className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-14 comm-fade">
                    {STATS.map(({ value, label }) => (
                        <div key={label} className="bg-white/[0.04] border border-white/[0.07] rounded-2xl p-5 text-center">
                            <div className="font-display text-3xl font-bold text-white mb-1">{value}</div>
                            <div className="text-[11px] text-charcoal-500 leading-snug">{label}</div>
                        </div>
                    ))}
                </div>

                {/* Channel cards */}
                <div ref={cardsRef} className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-14 comm-fade">
                    {CHANNELS.map(({ icon, label, desc, cta, href, color, border, bg }) => (
                        <div key={label} className={`${bg} border ${border} rounded-2xl p-5 flex flex-col gap-4`}>
                            <div className="flex items-start justify-between gap-3">
                                <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                                    {icon}
                                </div>
                                <a href={href} target="_blank" rel="noreferrer"
                                   className="text-[11px] font-bold text-white bg-white/10 hover:bg-white/20 border border-white/10 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap">
                                    {cta} →
                                </a>
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-white mb-1">{label}</p>
                                <p className="text-xs text-charcoal-400 leading-relaxed">{desc}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Referral horizontal CTA */}
                <div ref={ctaRef} className="comm-fade">
                    <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
                        <div className="text-center sm:text-left">
                            <p className="font-display text-lg font-bold text-white mb-1">
                                Know someone who needs this?
                            </p>
                            <p className="text-charcoal-400 text-sm leading-relaxed max-w-md">
                                Refer a friend who completes a verification and earn yourself a free one. Your community trusts you — help them trust their projects.
                            </p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0">
                            <Link href="/register"
                                  className="inline-flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-6 py-3 rounded-xl transition-all hover:shadow-lg hover:shadow-orange-500/20 whitespace-nowrap">
                                Get your referral link →
                            </Link>
                        </div>
                    </div>
                </div>

            </div>

            <style>{`
        .comm-fade { opacity:0; transform:translateY(24px); transition:opacity 0.6s ease, transform 0.6s ease; }
        .comm-fade.comm-in { opacity:1; transform:translateY(0); }
      `}</style>
        </section>
    );
}