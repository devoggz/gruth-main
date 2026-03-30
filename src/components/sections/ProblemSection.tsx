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
        // Camera icon (Photo + Video Evidence)
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
          <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V7a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
          <circle cx="12" cy="13" r="4" />
        </svg>
    ),
    label: "Verification",
    title: "Photo + Video Evidence",
    desc: "When reassurance replaces reality, you need proof. Get clear, on-site photos and walk-through videos that show exactly what’s happening—nothing staged, nothing filtered.",
  },
  {
    icon: (
        // Document/report icon
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
          <line x1="8" y1="13" x2="16" y2="13" />
          <line x1="8" y1="17" x2="14" y2="17" />
        </svg>
    ),
    label: "Clarity",
    title: "Written Reports",
    desc: "Instead of vague updates, get structured reports that break down real progress, highlight gaps, and call out anything that doesn’t add up—so you always know where things stand.",
  },
  {
    icon: (
        // Shield icon (security + control)
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
          <path d="M12 2l7 4v6c0 5-3.5 9-7 10-3.5-1-7-5-7-10V6l7-4z" />
          <path d="M9 12l2 2 4-4" />
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
          {/* Header */}
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
                The further away you are, the easier it is to be told what you want to hear. Everyone involved has something to gain from keeping you calm. We started GRUTH because we were that person abroad — sending money home, trusting the updates, hoping for the best. You deserve better than hope.
            </p>
          </div>

          {/* Cards */}
          <div
              ref={cardsRef}
              className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-16 fade-up"
              style={{ transitionDelay: "120ms" }}
          >
            {painPoints.map(({ icon, label, title, desc }) => (
                <div
                    key={title}
                    className="group bg-white border border-orange-100 hover:border-orange-300 rounded-2xl px-6 py-7 transition-all duration-200 hover:shadow-md flex flex-col"
                >
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-11 h-11 rounded-xl bg-orange-100 border border-orange-200 flex items-center justify-center text-orange-500 group-hover:bg-orange-500 group-hover:text-white group-hover:border-orange-500 transition-all duration-200">
                      {icon}
                    </div>
                    <span className="text-[10px] font-bold text-orange-500 uppercase tracking-widest">
                  {label}
                </span>
                  </div>

                  <h3 className="font-display text-lg font-semibold text-charcoal-950 mb-3 leading-snug">
                    {title}
                  </h3>

                  <p className="text-charcoal-600 text-sm leading-relaxed">
                    {desc}
                  </p>
                </div>
            ))}
          </div>

          {/* CTA */}
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