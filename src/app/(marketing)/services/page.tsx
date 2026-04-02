// src/app/services/page.tsx
import Link from "next/link";
import type { Metadata } from "next";
import { SERVICES } from "@/app/constants/services";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Services | GRUTH — Ground Verification",
  description:
    "Every verification service GRUTH offers — construction, land, events, business investment, and materials pricing.",
};

// ─── Page hero ────────────────────────────────────────────────────────────────

function PageHero() {
  return (
    <section className="relative bg-charcoal-950 pt-28 pb-20 overflow-hidden">
      {/* Grid texture */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />
      {/* Centred content */}
      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <span className="inline-flex items-center gap-1.5 text-orange-400 text-xs font-bold tracking-widest uppercase bg-orange-400/10 border border-orange-400/20 px-3 py-1 rounded-full mb-6">
          What we do
        </span>
        <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold text-white tracking-tight leading-none mb-6">
          Every service
          <br />
          <span className="text-orange-400">we offer</span>
        </h1>
        <p className="text-charcoal-400 text-lg leading-relaxed mb-10 max-w-xl mx-auto">
          One promise — a verified, photo-documented report from a qualified
          inspector on the ground in Kenya.
        </p>
        {/* Quick-nav pills */}
        <div className="flex flex-wrap justify-center gap-2">
          {SERVICES.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className="px-4 py-2 rounded-full border border-white/10 text-charcoal-400 hover:text-white hover:border-white/30 text-xs font-semibold tracking-wide transition-all"
            >
              {s.title}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Service detail section ───────────────────────────────────────────────────
// Even index  → dark  (bg-charcoal-950)   text white
// Odd index   → light (bg-orange-50)      text charcoal

function ServiceDetail({
  svc,
  index,
}: {
  svc: (typeof SERVICES)[0];
  index: number;
}) {
  const isLight = index % 2 !== 0; // odd = light
  const flip = index % 2 !== 0; // odd = image right

  return (
    <section
      id={svc.id}
      className={`py-20 scroll-mt-20 ${isLight ? "bg-orange-50" : "bg-charcoal-950"}`}
      style={{
        borderTop: isLight
          ? "1px solid #fed7aa"
          : "1px solid rgba(255,255,255,0.05)",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className={`grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center ${flip ? "lg:[&>*:first-child]:order-2" : ""}`}
        >
          {/* ── Image ─────────────────────────────────────────────────────── */}
          <div className="relative rounded-2xl overflow-hidden aspect-[4/3]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={svc.hero}
              alt={svc.title}
              className="w-full h-full object-cover"
            />
            <div
              className={`absolute inset-0 bg-gradient-to-br ${svc.accent} to-transparent opacity-60`}
            />
            <div className="absolute top-5 left-5">
              <span className="inline-flex items-center gap-1.5 bg-charcoal-950/70 backdrop-blur-sm border border-white/10 text-orange-400 text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full">
                {svc.tagline}
              </span>
            </div>
          </div>

          {/* ── Content ───────────────────────────────────────────────────── */}
          <div>
            <h2
              className={`font-display text-3xl sm:text-4xl font-bold tracking-tight mb-6 ${isLight ? "text-charcoal-950" : "text-white"}`}
            >
              {svc.title}
            </h2>

            {/* What's included */}
            <div className="mb-7">
              <p
                className={`text-[10px] font-bold uppercase tracking-widest mb-3 ${isLight ? "text-charcoal-400" : "text-charcoal-500"}`}
              >
                What's included
              </p>
              <ul className="space-y-3">
                {svc.what.map((item, i) => (
                  <li
                    key={i}
                    className={`flex items-start gap-3 text-sm leading-relaxed ${isLight ? "text-charcoal-700" : "text-charcoal-300"}`}
                  >
                    <span className="mt-0.5 flex-shrink-0 w-4 h-4 rounded-full bg-orange-500/15 flex items-center justify-center">
                      <svg
                        width="8"
                        height="8"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#f97316"
                        strokeWidth="3"
                      >
                        <path d="M20 6L9 17l-5-5" />
                      </svg>
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Deliverable */}
            <div
              className={`rounded-xl p-4 mb-7 ${isLight ? "bg-orange-100 border border-orange-200" : "bg-white/[0.05] border border-white/10"}`}
            >
              <p
                className={`text-[10px] font-bold uppercase tracking-widest mb-1.5 ${isLight ? "text-orange-500" : "text-charcoal-500"}`}
              >
                Deliverable
              </p>
              <p
                className={`text-sm leading-relaxed ${isLight ? "text-charcoal-800" : "text-charcoal-200"}`}
              >
                {svc.deliverable}
              </p>
            </div>

            {/* Ideal for */}
            <p
              className={`text-xs leading-relaxed mb-7 ${isLight ? "text-charcoal-500" : "text-charcoal-500"}`}
            >
              <span
                className={`font-bold ${isLight ? "text-charcoal-700" : "text-charcoal-400"}`}
              >
                Ideal for:{" "}
              </span>
              {svc.ideal}
            </p>

            <Link
              href={`/request-verification?service=${encodeURIComponent(svc.title)}`}
              className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-6 py-3 rounded-xl transition-all hover:shadow-lg hover:shadow-orange-500/20 hover:-translate-y-0.5"
            >
              Request this service
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
        </div>
      </div>
    </section>
  );
}

// ─── CTA banner ───────────────────────────────────────────────────────────────

function CtaBanner() {
  // Last service is odd (index 4) → light bg — so banner sits on orange-50 edge
  // Give it a charcoal-950 wrapper to cap the page cleanly
  return (
    <section
      className="bg-charcoal-950 py-20"
      style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative bg-orange-500 rounded-3xl px-8 sm:px-14 py-14 overflow-hidden">
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage:
                "linear-gradient(#000 1px,transparent 1px),linear-gradient(90deg,#000 1px,transparent 1px)",
              backgroundSize: "32px 32px",
            }}
          />
          <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8">
            <div>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-white tracking-tight mb-3">
                Not sure which service you need?
              </h2>
              <p className="text-orange-100 text-sm max-w-md leading-relaxed">
                Describe your situation and we'll match you to the right
                inspector and report type.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0">
              <Link
                href="/request-verification"
                className="inline-flex items-center justify-center gap-2 bg-white text-orange-600 hover:bg-orange-50 text-sm font-bold px-6 py-3.5 rounded-xl transition-all hover:shadow-lg hover:-translate-y-0.5"
              >
                Request a verification
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
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 text-white text-sm font-semibold px-6 py-3.5 rounded-xl transition-all"
              >
                Talk to our team
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ServicesPage() {
  return (
    <main className="min-h-screen">
      <PageHero />
      {SERVICES.map((svc, i) => (
        <ServiceDetail key={svc.id} svc={svc} index={i} />
      ))}
      <CtaBanner />
    </main>
  );
}
