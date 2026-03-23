"use client";
// src/components/home/ProblemSection.tsx
import Link from "next/link";
import { useEffect, useRef } from "react";

function useFadeIn(threshold = 0.12) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            el.classList.add("in-view");
            obs.disconnect();
          }
        },
        { threshold },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return ref;
}

const painPoints = [
  {
    icon: (
        <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
          <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
        </svg>
    ),
    label: "Verification",
    title: "Photo + Video Evidence",
    desc: "When reassurance replaces reality, you need proof. Get clear, on-site photos and walk-through videos that show exactly what’s happening—nothing staged, nothing filtered.",
  },
  {
    icon: (
        <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
        </svg>
    ),
    label: "Clarity",
    title: "Written Reports",
    desc: "Instead of vague updates, get structured reports that break down real progress, highlight gaps, and call out anything that doesn’t add up—so you always know where things stand.",
  },
  {
    icon: (
        <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
    ),
    label: "Control",
    title: "Secure Dashboard",
    desc: "All your inspections and reports, organized in one place. Track progress over time, revisit past updates, and stay fully in control—no matter where you are.",
  },
];

export default function ProblemSection() {
  const headerRef = useFadeIn();
  const cardsRef = useFadeIn();
  const ctaRef = useFadeIn();

  return (
      <section className="relative py-14 overflow-hidden">
        {/* Subtle grid */}
        <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: `linear-gradient(to right,#f97316 1px,transparent 1px),linear-gradient(to bottom,#f97316 1px,transparent 1px)`,
              backgroundSize: "60px 60px",
              opacity: 0.05,
              maskImage:
                  "radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 100%)",
              WebkitMaskImage:
                  "radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 100%)",
            }}
        />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* ── Header ─────────────────────────────────────────────────────── */}
          <div ref={headerRef} className="text-center mb-16 fade-up">
          <span className="inline-flex items-center gap-1.5 text-orange-600 text-[10px] font-bold tracking-widest uppercase bg-orange-100 border border-orange-200 px-3 py-1 rounded-full mb-6">
            Why GRUTH Exists
          </span>
            <h2 className="font-display text-4xl sm:text-5xl font-bold text-charcoal-950 mb-5 leading-tight tracking-tight">
              Distance creates a gap.
              <br />
              <span className="text-orange-500 italic">
              People fill it with reassurance.
            </span>
            </h2>
            <p className="text-charcoal-600 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto">
              When you're thousands of miles away, everyone involved in your
              project has an incentive to keep you calm — your relatives, your
              contractor, even your caretaker. What you need instead is someone
              with no stake in the outcome, standing on the actual ground.
            </p>
          </div>

          {/* ── Cards ─────────────────────────────────────────────────────── */}
          <div
              ref={cardsRef}
              className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-16 fade-up"
              style={{ transitionDelay: "120ms" }}
          >
            {painPoints.map(({ icon, label, title, desc }) => (
                <div
                    key={title}
                    className="group relative bg-white border border-orange-100 hover:border-orange-300 rounded-2xl px-6 py-7 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex flex-col"
                >
                  {/* Glow accent */}
                  <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition duration-300 bg-gradient-to-br from-orange-50 via-transparent to-transparent pointer-events-none" />

                  {/* Icon + label */}
                  <div className="flex items-center gap-3 mb-5 relative z-10">
                    <div className="w-11 h-11 rounded-xl bg-orange-100 border border-orange-200 flex items-center justify-center text-orange-500 group-hover:bg-orange-500 group-hover:text-white group-hover:border-orange-500 transition-all duration-300">
                      {icon}
                    </div>
                    <span className="text-[10px] font-bold text-orange-500 uppercase tracking-widest">
                  {label}
                </span>
                  </div>

                  <h3 className="font-display text-lg font-semibold text-charcoal-950 mb-3 leading-snug relative z-10">
                    {title}
                  </h3>

                  <p className="text-charcoal-600 text-sm leading-relaxed relative z-10">
                    {desc}
                  </p>
                </div>
            ))}
          </div>

          {/* ── CTA ────────────────────────────────────────────────────────── */}
          <div
              ref={ctaRef}
              className="flex flex-col items-center gap-3 fade-up"
              style={{ transitionDelay: "240ms" }}
          >
            <Link
                href="/request-verification"
                className="group inline-flex items-center gap-2.5 bg-charcoal-950 hover:bg-charcoal-800 text-white font-semibold text-sm px-7 py-3.5 rounded-xl transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
            >
              Get independent eyes on the ground
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
          </div>
        </div>

        <style>{`
        .fade-up {
          opacity: 0;
          transform: translateY(24px);
          transition: opacity 0.6s ease, transform 0.6s ease;
        }
        .fade-up.in-view {
          opacity: 1;
          transform: translateY(0);
        }
      `}</style>
      </section>
  );
}