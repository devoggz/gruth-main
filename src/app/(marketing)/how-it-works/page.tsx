// src/app/(marketing)/how-it-works/page.tsx
"use client";

import Link from "next/link";
import { useState } from "react";
import dynamic from "next/dynamic";


const QuoteCalculator   = dynamic(() => import("@/components/home/QuoteCalculator"),       { ssr: true });   

const steps = [
  {
    number: "01",
    title: "Submit Your Request",
    tagline: "Takes under 3 minutes",
    desc: "Fill out the request form with your project location, service type, and what you need verified. Choose whether to be contacted via WhatsApp or email.",
    detail:
      "We confirm receipt within 2 business hours and ask any clarifying questions before dispatching your inspector.",
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
      </svg>
    ),
    proof: "Avg. confirmation time: 90 minutes",
  },
  {
    number: "02",
    title: "Inspector Dispatched",
    tagline: "Vetted. Credential-verified. Local.",
    desc: "We assign a vetted local inspector with expertise matched to your project type — civil engineering background for construction, property law experience for land matters.",
    detail:
      "You receive your inspector's name, credentials, and the confirmed inspection date before they visit.",
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
        <circle cx="12" cy="9" r="2.5" />
      </svg>
    ),
    proof: "Inspector dispatched within 24 hours of request",
  },
  {
    number: "03",
    title: "Evidence Collected",
    tagline: "Nothing edited. Nothing hidden.",
    desc: "The inspector conducts a thorough, systematic visit — photographing every angle, recording video walkthroughs, taking measurements, interviewing on-site personnel, and documenting discrepancies.",
    detail:
      "All evidence is geotagged and timestamped. You see everything we see, exactly as captured.",
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
        <circle cx="12" cy="13" r="4" />
      </svg>
    ),
    proof: "GPS-tagged photos, timestamped video, written observations",
  },
  {
    number: "04",
    title: "Report Delivered",
    tagline: "To your dashboard within 48 hours",
    desc: "Your detailed report is published to your secure client dashboard within 24–48 hours — inspector observations, photographic evidence, video walkthroughs, and clear recommendations.",
    detail:
      "Download as PDF, share securely, and message our team directly for any follow-up questions.",
    icon: (
      <svg
        width="22"
        height="22"
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
    proof: "PDF download, dashboard access, direct team messaging",
  },
];

const faqs = [
  {
    q: "How long does an inspection take?",
    a: "Most standard inspections take 1–2 business days from request to report delivery. Complex construction inspections may take up to 3 days.",
  },
  {
    q: "How do I know your inspectors are trustworthy?",
    a: "All inspectors undergo background checks, carry verified credentials, and operate under our code of conduct. Inspector names and credentials are shared with you before any site visit.",
  },
  {
    q: "Can I request multiple visits for an ongoing project?",
    a: "Yes. Construction clients typically subscribe to regular monthly inspections throughout the build. We offer bundled pricing for ongoing monitoring.",
  },
  {
    q: "What if the situation looks fraudulent?",
    a: "We document everything and note our concerns clearly in the report. We can also refer you to legal practitioners in Kenya if needed.",
  },
  {
    q: "Do you cover all areas of Kenya?",
    a: "We cover all major urban and peri-urban areas across all 47 counties. For remote rural inspections, contact us — we can usually arrange coverage with 48 hours notice.",
  },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className={`border rounded-2xl overflow-hidden transition-all duration-200 ${open ? "border-orange-200 shadow-sm shadow-orange-500/10" : "border-charcoal-100"}`}
    >
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left hover:bg-orange-50/40 transition-colors"
      >
        <span
          className={`text-sm font-semibold leading-snug transition-colors ${open ? "text-orange-600" : "text-charcoal-900"}`}
        >
          {q}
        </span>
        <span
          className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-all duration-200 ${open ? "bg-orange-500 text-white rotate-45" : "bg-charcoal-100 text-charcoal-500"}`}
        >
          <svg
            width="10"
            height="10"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
          >
            <path d="M12 5v14M5 12h14" />
          </svg>
        </span>
      </button>
      {open && (
        <div className="px-5 pb-5">
          <p className="text-charcoal-600 text-sm leading-relaxed">{a}</p>
        </div>
      )}
    </div>
  );
}

export default function HowItWorksPage() {
  const [activeStep, setActiveStep] = useState(0);
  const active = steps[activeStep];

  return (
    <div>
      {/* ── Hero ───────────────────────────────────────────────────────────── */}
      <section className="relative bg-charcoal-950 pt-24 pb-20 overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)",
            backgroundSize: "52px 52px",
          }}
        />
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <span className="inline-flex items-center gap-1.5 text-orange-400 text-[10px] font-bold tracking-widest uppercase bg-orange-400/10 border border-orange-400/20 px-3 py-1 rounded-full mb-6">
            The Process
          </span>
          <h1 className="font-display text-5xl sm:text-6xl font-bold text-white tracking-tight leading-tight mb-5">
            Simple. Transparent.
            <br />
            <span className="text-orange-400 italic">Thorough.</span>
          </h1>
          <p className="text-charcoal-400 text-base sm:text-lg leading-relaxed max-w-xl mx-auto">
            From request to verified report in as little as 24 hours — no
            flights required.
          </p>
        </div>
      </section>

      {/* ── Interactive steps ──────────────────────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Step tabs */}
          <div
            className="flex gap-2 sm:gap-3 mb-10 overflow-x-auto pb-2"
            style={{ scrollbarWidth: "none" }}
          >
            {steps.map((s, i) => (
              <button
                key={s.number}
                onClick={() => setActiveStep(i)}
                className={[
                  "flex-shrink-0 flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200",
                  activeStep === i
                    ? "bg-charcoal-950 text-white shadow-lg"
                    : "bg-charcoal-50 text-charcoal-500 hover:bg-charcoal-100 hover:text-charcoal-800",
                ].join(" ")}
              >
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 transition-colors ${activeStep === i ? "bg-orange-500 text-white" : "bg-charcoal-200 text-charcoal-500"}`}
                >
                  {i + 1}
                </span>
                <span className="hidden sm:inline">{s.title}</span>
                <span className="sm:hidden font-mono text-xs">{s.number}</span>
              </button>
            ))}
          </div>

          {/* Detail panel */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6 lg:gap-8">
            {/* Left — main content */}
            <div className="bg-charcoal-950 rounded-3xl p-7 sm:p-10 flex flex-col gap-6">
              <div className="flex items-start gap-5">
                <div className="w-14 h-14 rounded-2xl bg-orange-500/15 border border-orange-500/20 flex items-center justify-center text-orange-400 flex-shrink-0">
                  {active.icon}
                </div>
                <div>
                  <span className="text-[10px] font-bold text-charcoal-600 uppercase tracking-widest">
                    Step {active.number}
                  </span>
                  <h2 className="font-display text-2xl sm:text-3xl font-bold text-white mt-1 leading-tight">
                    {active.title}
                  </h2>
                  <span className="text-orange-400 text-xs font-semibold mt-1 block">
                    {active.tagline}
                  </span>
                </div>
              </div>

              <p className="text-charcoal-300 text-base leading-relaxed">
                {active.desc}
              </p>

              <div className="flex items-start gap-3 bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3.5">
                <svg
                  className="flex-shrink-0 mt-0.5 text-orange-400"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 8v4m0 4h.01" />
                </svg>
                <p className="text-charcoal-400 text-sm leading-relaxed">
                  {active.detail}
                </p>
              </div>

              <div className="flex items-center gap-2 mt-auto">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
                <span className="text-charcoal-500 text-xs">
                  {active.proof}
                </span>
              </div>

              {/* Navigation row */}
              <div className="flex items-center justify-between pt-4 border-t border-white/[0.06]">
                <button
                  onClick={() => setActiveStep((v) => Math.max(0, v - 1))}
                  disabled={activeStep === 0}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-charcoal-500 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  >
                    <path d="M19 12H5M12 19l-7-7 7-7" />
                  </svg>
                  Previous
                </button>
                <div className="flex gap-1.5">
                  {steps.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveStep(i)}
                      className={`h-2 rounded-full transition-all duration-200 ${i === activeStep ? "bg-orange-500 w-5" : "bg-charcoal-700 hover:bg-charcoal-500 w-2"}`}
                    />
                  ))}
                </div>
                {activeStep < steps.length - 1 ? (
                  <button
                    onClick={() =>
                      setActiveStep((v) => Math.min(steps.length - 1, v + 1))
                    }
                    className="inline-flex items-center gap-2 text-sm font-semibold text-orange-400 hover:text-orange-300 transition-colors"
                  >
                    Next
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    >
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </button>
                ) : (
                  <Link
                    href="/request-verification"
                    className="inline-flex items-center gap-2 text-sm font-semibold bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-xl transition-colors"
                  >
                    Get Started
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    >
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </Link>
                )}
              </div>
            </div>

            {/* Right — step list sidebar */}
            <div className="flex flex-col gap-2">
              {steps.map((s, i) => {
                const isActive = i === activeStep;
                const isDone = i < activeStep;
                return (
                  <button
                    key={s.number}
                    onClick={() => setActiveStep(i)}
                    className={[
                      "w-full text-left flex items-center gap-4 px-4 py-4 rounded-2xl border transition-all duration-200",
                      isActive
                        ? "bg-orange-50 border-orange-200 shadow-sm"
                        : isDone
                          ? "bg-charcoal-950 border-charcoal-800"
                          : "bg-white border-charcoal-100 hover:border-charcoal-200 hover:bg-charcoal-50",
                    ].join(" ")}
                  >
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all ${
                        isActive
                          ? "bg-orange-500 text-white shadow-md shadow-orange-500/30"
                          : isDone
                            ? "bg-emerald-500 text-white"
                            : "bg-charcoal-100 text-charcoal-400"
                      }`}
                    >
                      {isDone ? (
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                          strokeLinecap="round"
                        >
                          <path d="M20 6L9 17l-5-5" />
                        </svg>
                      ) : (
                        <span
                          className={
                            isActive ? "text-white" : "text-charcoal-400"
                          }
                        >
                          {s.icon}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div
                        className={`text-[10px] font-bold uppercase tracking-widest mb-0.5 ${isActive ? "text-orange-500" : isDone ? "text-emerald-400" : "text-charcoal-400"}`}
                      >
                        Step {s.number}
                      </div>
                      <div
                        className={`text-sm font-semibold leading-tight ${isActive ? "text-charcoal-950" : isDone ? "text-white" : "text-charcoal-700"}`}
                      >
                        {s.title}
                      </div>
                    </div>
                    {isActive && (
                      <svg
                        className="text-orange-400 flex-shrink-0"
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                      >
                        <path d="M9 18l6-6-6-6" />
                      </svg>
                    )}
                  </button>
                );
              })}


  
            </div>
          </div>
        </div>
        <div className="pt-16">

        <QuoteCalculator />
        </div>

      </section>

      

      {/* ── FAQs ───────────────────────────────────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-charcoal-950 tracking-tight mb-3">
              Frequently asked questions
            </h2>
            <p className="text-charcoal-500 text-sm">
              Still unsure? Reach out at team@gruth.ke
            </p>
          </div>
          <div className="space-y-3">
            {faqs.map((faq) => (
              <FAQItem key={faq.q} {...faq} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Bottom CTA ─────────────────────────────────────────────────────── */}
      <section className="py-16 bg-charcoal-950">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-white tracking-tight mb-4">
            Ready to get eyes on the ground?
          </h2>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/request-verification"
              className="inline-flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold text-sm px-7 py-3.5 rounded-xl transition-all hover:shadow-xl hover:shadow-orange-500/25 hover:-translate-y-0.5"
            >
              Request a Verification
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
            <Link
              href="/services"
              className="inline-flex items-center justify-center gap-2 text-charcoal-400 hover:text-white border border-white/10 hover:border-white/30 text-sm font-medium px-7 py-3.5 rounded-xl transition-all"
            >
              Browse services
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
