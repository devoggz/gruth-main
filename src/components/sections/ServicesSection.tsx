"use client";
// src/components/home/ServicesSection.tsx
import Link from "next/link";
import { useEffect, useRef } from "react";
import { SERVICES } from "@/app/constants/services";

// ─── Scroll fade-in hook ──────────────────────────────────────────────────────
function useFadeIn(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("sv-in");
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

// ─── Section ──────────────────────────────────────────────────────────────────
export default function ServicesSection() {
  const headerRef = useFadeIn(0.1);
  const gridRef = useFadeIn(0.05);

  return (
    <section className="py-24 overflow-x-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(to right,#f97316 1px,transparent 1px),linear-gradient(to bottom,#f97316 1px,transparent 1px)`,
          backgroundSize: "60px 60px",
          opacity: 0.06,
          maskImage:
            "radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 100%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 100%)",
        }}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div
          ref={headerRef}
          className="flex flex-col sm:flex-row sm:items-end justify-between gap-5 mb-10 sv-fade"
        >
          <div>
            <span className="inline-flex items-center gap-1.5 text-orange-600 text-[10px] font-bold tracking-widest uppercase bg-orange-100 border border-orange-200 px-3 py-1 rounded-full mb-4">
              Our Services
            </span>
            <h2 className="font-display text-4xl sm:text-5xl font-bold text-charcoal-950 tracking-tight">
              Whatever you're sending money home for, we'll make sure it's real.
            </h2>
          </div>
          <Link
            prefetch={true}
            href="/services"
            className="self-start sm:self-auto inline-flex items-center gap-1.5 text-sm font-semibold text-charcoal-600 hover:text-charcoal-950 transition-colors whitespace-nowrap"
          >
            All services
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {/* Bento grid
            Desktop (lg): 3-col, auto-rows-[280px], Construction spans 2×2
            Tablet (sm):  2-col grid, each card 260px tall
            Mobile:       single column, each card 280px tall
        */}
        <div
          ref={gridRef}
          className="grid gap-3 grid-cols-1 auto-rows-[280px] sm:grid-cols-2 sm:auto-rows-[260px] lg:grid-cols-3 lg:auto-rows-[280px]"
        >
          {SERVICES.map((svc, i) => (
            <div
              key={svc.id}
              className={`${svc.desktopSpan} sv-card`}
              style={{ transitionDelay: `${i * 80}ms` }}
            >
              <ServiceCard
                id={svc.id}
                title={svc.title}
                tagline={svc.tagline}
                description={svc.description}
                image={svc.image}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Animations */}
      <style>{`
        .sv-fade {
          opacity: 0;
          transform: translateY(20px);
          transition: opacity 0.6s ease, transform 0.6s ease;
        }
        .sv-fade.sv-in { opacity: 1; transform: translateY(0); }

        .sv-card {
          opacity: 0;
          transform: translateY(28px);
          transition: opacity 0.55s ease, transform 0.55s ease;
        }
        .sv-in .sv-card { opacity: 1; transform: translateY(0); }
      `}</style>
    </section>
  );
}

// ─── Card ─────────────────────────────────────────────────────────────────────
function ServiceCard({
  id,
  title,
  tagline,
  description,
  image,
}: {
  id: string;
  title: string;
  tagline: string;
  description: string;
  image: string;
}) {
  return (
    <div className="group relative w-full h-full rounded-2xl overflow-hidden cursor-default">
      <img
        src={image}
        alt={title}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
      />
      {/* Permanent bottom gradient — default state */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-black/5" />

      {/* Hover overlay — backdrop blur + near-opaque dark so text is always readable */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-out"
        style={{
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          background: "rgba(14,13,11,0.93)",
        }}
      />

      {/* Default: tagline + title */}
      <div className="relative h-full flex flex-col justify-end p-5 sm:p-6">
        <div className="group-hover:opacity-0 group-hover:-translate-y-1 transition-all duration-300">
          <p className="text-orange-400 text-[10px] font-bold uppercase tracking-widest mb-1.5">
            {tagline}
          </p>
          <h3 className="font-display text-xl font-bold text-white leading-snug">
            {title}
          </h3>
        </div>

        {/* Hover: full description */}
        <div className="absolute inset-0 flex flex-col justify-center p-5 sm:p-6 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-500 delay-75">
          <p className="text-orange-400 text-[10px] font-bold uppercase tracking-widest mb-3">
            {tagline}
          </p>
          <h3 className="font-display text-xl font-bold text-white leading-snug mb-3">
            {title}
          </h3>
          <p className="text-charcoal-200 text-sm leading-relaxed mb-5">
            {description}
          </p>
          <Link
            prefetch={true}
            href={`/services#${id}`}
            className="inline-flex items-center gap-2 text-orange-400 hover:text-orange-300 text-[11px] font-bold uppercase tracking-widest transition-colors w-fit"
          >
            Learn more
            <svg
              width="11"
              height="11"
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

      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
    </div>
  );
}
