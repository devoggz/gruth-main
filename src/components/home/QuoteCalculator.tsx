"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";

// ─── Currency ─────────────────────────────────────────────────────────────────

type CurrencyCode = "USD" | "EUR" | "KES";

const RATES: Record<CurrencyCode, number> = { USD: 1, EUR: 0.92, KES: 130 };

function fmt(n: number, currency: CurrencyCode) {
  const v = Math.round(n * RATES[currency]);
  if (currency === "KES") return `KSh ${v.toLocaleString("en-KE")}`;
  if (currency === "EUR") return `€${v.toLocaleString("en-US")}`;
  return `$${v.toLocaleString("en-US")}`;
}

// ─── Services ─────────────────────────────────────────────────────────────────

const SERVICE_TYPES = [
  {
    value: "construction",
    label: "Construction Verification",
    base: [150, 400] as [number, number],
  },
  {
    value: "land",
    label: "Land & Property",
    base: [120, 280] as [number, number],
  },
  {
    value: "wedding",
    label: "Wedding & Events",
    base: [100, 220] as [number, number],
  },
  {
    value: "business",
    label: "Business Investment",
    base: [160, 400] as [number, number],
  },
  {
    value: "materials",
    label: "Material Pricing Audit",
    base: [80, 180] as [number, number],
  },
] as const;

type ServiceValue = (typeof SERVICE_TYPES)[number]["value"];

// ─── Location ─────────────────────────────────────────────────────────────────

const COUNTIES = [
  { value: "nairobi", label: "Nairobi", travel: 0 },
  { value: "mombasa", label: "Mombasa", travel: 30 },
  { value: "kisumu", label: "Kisumu", travel: 35 },
  { value: "nakuru", label: "Nakuru", travel: 20 },
  { value: "eldoret", label: "Eldoret", travel: 28 },
  { value: "nyeri", label: "Nyeri", travel: 24 },
  { value: "machakos", label: "Machakos", travel: 16 },
  { value: "kisii", label: "Kisii", travel: 32 },
  { value: "other", label: "Remote / Other", travel: 50 },
] as const;

type CountyValue = (typeof COUNTIES)[number]["value"];

// ─── Urgency ──────────────────────────────────────────────────────────────────

const URGENCY = [
  {
    value: "standard",
    label: "Standard",
    sub: "48-hour turnaround",
    surcharge: 0,
  },
  {
    value: "priority",
    label: "Priority",
    sub: "24-hour turnaround",
    surcharge: 40,
  },
] as const;

type UrgencyValue = (typeof URGENCY)[number]["value"];

// ─── Size options (context-aware) ─────────────────────────────────────────────

interface SizeOption {
  value: string;
  label: string;
  desc: string;
  multiplier: number;
}

const CONSTRUCTION_STAGES: SizeOption[] = [
  {
    value: "foundation",
    label: "Foundation / Slab",
    desc: "Earthworks, concrete & early structure",
    multiplier: 1.0,
  },
  {
    value: "shell",
    label: "Shell / Walling",
    desc: "Brickwork, columns & roofing stage",
    multiplier: 1.4,
  },
  {
    value: "fitout",
    label: "Full Fit-out",
    desc: "Plastering, finishes & completion",
    multiplier: 1.9,
  },
];

const LAND_SIZES: SizeOption[] = [
  {
    value: "plot",
    label: "Single Plot",
    desc: "Up to ½ acre residential",
    multiplier: 1.0,
  },
  {
    value: "parcel",
    label: "Land Parcel",
    desc: "1–5 acres, title deed check",
    multiplier: 1.5,
  },
  {
    value: "tract",
    label: "Large Tract",
    desc: "5+ acres or commercial land",
    multiplier: 2.0,
  },
];

const DEFAULT_SIZES: SizeOption[] = [
  {
    value: "small",
    label: "Small",
    desc: "Single vendor / 1-day event",
    multiplier: 1.0,
  },
  {
    value: "medium",
    label: "Medium",
    desc: "Multi-vendor / 2–3 days",
    multiplier: 1.4,
  },
  {
    value: "large",
    label: "Large",
    desc: "Complex / multi-location",
    multiplier: 1.9,
  },
];

const SIZE_SERVICES: ServiceValue[] = ["construction", "land", "business"];

function getSizeOptions(service: ServiceValue): SizeOption[] {
  if (service === "construction") return CONSTRUCTION_STAGES;
  if (service === "land") return LAND_SIZES;
  return DEFAULT_SIZES;
}

function getSizeLabel(service: ServiceValue) {
  if (service === "construction") return "Construction Stage";
  if (service === "land") return "Land / Plot Size";
  return "Project Scale";
}

// ─── Add-ons ──────────────────────────────────────────────────────────────────

const ADDONS = [
  { value: "drone", label: "Drone Footage", price: 45 },
  { value: "lab", label: "Material Lab Testing", price: 80 },
  { value: "extra", label: "Extra Site Visit", price: 60 },
  { value: "video", label: "Video Evidence Package", price: 35 },
] as const;

type AddonValue = (typeof ADDONS)[number]["value"];

// ─── Estimate ─────────────────────────────────────────────────────────────────

interface EstimateRow {
  label: string;
  low: number;
  high: number;
}
interface Estimate {
  low: number;
  high: number;
  breakdown: EstimateRow[];
}

function useEstimate(
  service: ServiceValue,
  county: CountyValue,
  urgency: UrgencyValue,
  size: string,
  addons: AddonValue[],
): Estimate {
  return useMemo(() => {
    const svc = SERVICE_TYPES.find((s) => s.value === service)!;
    const cty = COUNTIES.find((c) => c.value === county)!;
    const urg = URGENCY.find((u) => u.value === urgency)!;
    const showSize = SIZE_SERVICES.includes(service);
    const opts = getSizeOptions(service);
    const sz = opts.find((p) => p.value === size) ?? opts[0];
    const mult = showSize ? sz.multiplier : 1;

    const baseLow = Math.round(svc.base[0] * mult);
    const baseHigh = Math.round(svc.base[1] * mult);

    const breakdown: EstimateRow[] = [
      { label: "Base inspection fee", low: baseLow, high: baseHigh },
    ];
    if (cty.travel > 0)
      breakdown.push({
        label: `${cty.label} travel`,
        low: cty.travel,
        high: cty.travel,
      });
    if (urg.surcharge > 0)
      breakdown.push({
        label: "Priority surcharge",
        low: urg.surcharge,
        high: urg.surcharge,
      });
    addons.forEach((a) => {
      const ad = ADDONS.find((x) => x.value === a)!;
      breakdown.push({ label: ad.label, low: ad.price, high: ad.price });
    });

    return {
      breakdown,
      low: breakdown.reduce((s, r) => s + r.low, 0),
      high: breakdown.reduce((s, r) => s + r.high, 0),
    };
  }, [service, county, urgency, size, addons]);
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function QuoteCalculator() {
  const [service, setService] = useState<ServiceValue>("construction");
  const [county, setCounty] = useState<CountyValue>("nairobi");
  const [urgency, setUrgency] = useState<UrgencyValue>("standard");
  const [size, setSize] = useState<string>("foundation");
  const [addons, setAddons] = useState<AddonValue[]>([]);
  const [currency, setCurrency] = useState<CurrencyCode>("USD");

  // Reset size to first option when service type changes
  useEffect(() => {
    setSize(getSizeOptions(service)[0].value);
  }, [service]);

  const estimate = useEstimate(service, county, urgency, size, addons);
  const showSize = SIZE_SERVICES.includes(service);
  const samePrice = estimate.low === estimate.high;
  const f = (n: number) => fmt(n, currency);

  const toggleAddon = (v: AddonValue) =>
    setAddons((prev) =>
      prev.includes(v) ? prev.filter((a) => a !== v) : [...prev, v],
    );

  const ctaHref = useMemo(() => {
    const svcLabel =
      SERVICE_TYPES.find((s) => s.value === service)?.label ?? "";
    const ctyLabel = COUNTIES.find((c) => c.value === county)?.label ?? "";
    return `/request-verification?service=${encodeURIComponent(svcLabel)}&location=${encodeURIComponent(ctyLabel)}`;
  }, [service, county]);

  return (
    <section className="py-12 bg-charcoal-950 relative overflow-hidden">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-1.5 text-orange-400 text-sm font-medium tracking-wide uppercase bg-orange-400/10 px-3 py-1 rounded-full mb-4">
            Quick Estimate
          </span>
          <h2 className="font-display text-4xl sm:text-5xl font-bold text-white mb-4 tracking-tight">
            How much will your
            <br />
            <span className="text-orange-400">verification cost?</span>
          </h2>
          <p className="text-charcoal-400 text-lg max-w-xl mx-auto">
            Configure your project below and get a real-time estimate in
            seconds.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
          {/* ── Left panel ──────────────────────────────────────────────────── */}
          <div className="lg:col-span-3 bg-white/[0.04] border border-white/10 rounded-2xl p-6 sm:p-8 space-y-7">
            {/* Service type */}
            <div>
              <CalcLabel>Service Type</CalcLabel>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-2">
                {SERVICE_TYPES.map((svc) => (
                  <button
                    key={svc.value}
                    onClick={() => setService(svc.value)}
                    className={`text-left px-4 py-3 rounded-xl border text-sm font-medium transition-all duration-150 ${
                      service === svc.value
                        ? "bg-orange-500 border-orange-500 text-white shadow-lg shadow-orange-500/20"
                        : "border-white/10 text-charcoal-300 hover:border-white/25 hover:text-white"
                    }`}
                  >
                    {svc.label}
                  </button>
                ))}
              </div>
            </div>

            {/* County + Urgency */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <CalcLabel>Project Location</CalcLabel>
                <div className="relative mt-2">
                  <select
                    value={county}
                    onChange={(e) => setCounty(e.target.value as CountyValue)}
                    className="w-full appearance-none bg-white/[0.06] border border-white/10 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 transition-all cursor-pointer"
                  >
                    {COUNTIES.map((c) => (
                      <option
                        key={c.value}
                        value={c.value}
                        className="bg-charcoal-950 text-white"
                      >
                        {c.label}
                        {c.travel > 0 ? ` (+${f(c.travel)})` : ""}
                      </option>
                    ))}
                  </select>
                  <ChevronDown />
                </div>
                {county === "other" && (
                  <p className="text-xs text-amber-400 mt-1.5">
                    Travel fee applies — confirm at quote stage.
                  </p>
                )}
              </div>

              <div>
                <CalcLabel>Urgency</CalcLabel>
                <div className="flex gap-2 mt-2">
                  {URGENCY.map((u) => (
                    <button
                      key={u.value}
                      onClick={() => setUrgency(u.value)}
                      className={`flex-1 px-3 py-3 rounded-xl border text-sm font-medium text-center transition-all duration-150 ${
                        urgency === u.value
                          ? "bg-orange-500 border-orange-500 text-white shadow-lg shadow-orange-500/20"
                          : "border-white/10 text-charcoal-300 hover:border-white/25 hover:text-white"
                      }`}
                    >
                      <div className="font-semibold">{u.label}</div>
                      <div
                        className={`text-[11px] mt-0.5 ${urgency === u.value ? "text-orange-100" : "text-charcoal-500"}`}
                      >
                        {u.sub}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Context-aware size selector */}
            {showSize && (
              <div>
                <CalcLabel>{getSizeLabel(service)}</CalcLabel>
                <div className="grid grid-cols-3 gap-2.5 mt-2">
                  {getSizeOptions(service).map((p) => (
                    <button
                      key={p.value}
                      onClick={() => setSize(p.value)}
                      className={`text-left px-4 py-3 rounded-xl border text-sm transition-all duration-150 ${
                        size === p.value
                          ? "bg-orange-500 border-orange-500 text-white shadow-lg shadow-orange-500/20"
                          : "border-white/10 text-charcoal-300 hover:border-white/25 hover:text-white"
                      }`}
                    >
                      <div className="font-semibold">{p.label}</div>
                      <div
                        className={`text-[11px] mt-0.5 leading-snug ${size === p.value ? "text-orange-100" : "text-charcoal-500"}`}
                      >
                        {p.desc}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Add-ons */}
            <div>
              <CalcLabel>Optional Add-ons</CalcLabel>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-2">
                {ADDONS.map((a) => {
                  const checked = addons.includes(a.value);
                  return (
                    <button
                      key={a.value}
                      onClick={() => toggleAddon(a.value)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm text-left transition-all duration-150 ${
                        checked
                          ? "bg-emerald-500/10 border-emerald-500/40 text-white"
                          : "border-white/10 text-charcoal-300 hover:border-white/25 hover:text-white"
                      }`}
                    >
                      <span
                        className={`w-4 h-4 rounded flex-shrink-0 flex items-center justify-center border transition-all ${
                          checked
                            ? "bg-emerald-500 border-emerald-500"
                            : "border-white/20"
                        }`}
                      >
                        {checked && (
                          <svg
                            width="10"
                            height="8"
                            viewBox="0 0 10 8"
                            fill="none"
                          >
                            <path
                              d="M1 4l2.5 2.5L9 1"
                              stroke="white"
                              strokeWidth="1.8"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        )}
                      </span>
                      <span className="flex-1">{a.label}</span>
                      <span
                        className={`font-mono text-xs ${checked ? "text-emerald-400" : "text-charcoal-500"}`}
                      >
                        +{f(a.price)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ── Right panel ─────────────────────────────────────────────────── */}
          <div className="lg:col-span-2 sticky top-8 space-y-4">
            {/* Currency selector */}
            <div className="flex gap-2">
              {(["USD", "EUR", "KES"] as CurrencyCode[]).map((c) => (
                <button
                  key={c}
                  onClick={() => setCurrency(c)}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold tracking-widest border transition-all ${
                    currency === c
                      ? "bg-orange-500 border-orange-500 text-white shadow-lg shadow-orange-500/20"
                      : "border-white/10 text-charcoal-400 hover:text-white hover:border-white/25"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>

            {/* Price card — dark themed */}
            <div className="bg-white/[0.06] border border-white/10 rounded-2xl p-6 sm:p-8">
              <p className="text-xs font-semibold text-charcoal-400 uppercase tracking-widest mb-3">
                Estimated Cost
              </p>

              <div className="mb-1">
                {samePrice ? (
                  <span className="font-display text-4xl font-bold text-white tracking-tight">
                    {f(estimate.low)}
                  </span>
                ) : (
                  <>
                    <span className="font-display text-3xl font-bold text-white tracking-tight">
                      {f(estimate.low)}
                    </span>
                    <span className="text-charcoal-600 font-display text-2xl mx-2">
                      –
                    </span>
                    <span className="font-display text-3xl font-bold text-white tracking-tight">
                      {f(estimate.high)}
                    </span>
                  </>
                )}
              </div>
              <p className="text-xs text-charcoal-500 mb-6">
                {currency === "KES"
                  ? "Kenyan Shillings"
                  : currency === "EUR"
                    ? "Euros"
                    : "US Dollars"}{" "}
                · indicative, incl. VAT
              </p>

              {/* Breakdown */}
              <div className="space-y-2.5 border-t border-white/10 pt-5 mb-6">
                {estimate.breakdown.map((row, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="text-charcoal-400">{row.label}</span>
                    <span className="font-mono font-medium text-charcoal-200 text-xs tabular-nums">
                      {row.low === row.high
                        ? f(row.low)
                        : `${f(row.low)} – ${f(row.high)}`}
                    </span>
                  </div>
                ))}
              </div>

              <Link
                href={ctaHref}
                className="flex items-center justify-center gap-2 w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-3.5 rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-orange-500/25 hover:-translate-y-0.5 active:translate-y-0 text-sm"
              >
                Get Accurate Quote
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

            {/* Trust notes — SVG icons, no escrow */}
            <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-5 space-y-3.5">
              {[
                {
                  icon: (
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    >
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                      <path d="M9 12l2 2 4-4" />
                    </svg>
                  ),
                  text: "No upfront payment — invoiced only after your report is delivered",
                },
                {
                  icon: (
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    >
                      <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
                      <rect x="9" y="3" width="6" height="4" rx="1" />
                      <path d="M9 12h6M9 16h4" />
                    </svg>
                  ),
                  text: "Final quote confirmed after a full project brief",
                },
                {
                  icon: (
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <path d="M12 6v6l4 2" />
                    </svg>
                  ),
                  text: "Inspector assigned within 2 hours of booking",
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 text-xs text-charcoal-400 leading-relaxed"
                >
                  <span className="text-charcoal-500 flex-shrink-0 mt-0.5">
                    {item.icon}
                  </span>
                  {item.text}
                </div>
              ))}
            </div>

            {/* Disclaimer */}
            <p className="text-[11px] text-charcoal-600 leading-relaxed px-1">
              Quick estimate only. Rates are approximate — USD base, converted
              at indicative rates. Final pricing confirmed after project brief.
              May vary based on scope, access, and complexity.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Micro components ─────────────────────────────────────────────────────────

function CalcLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-xs font-semibold text-charcoal-400 uppercase tracking-widest">
      {children}
    </span>
  );
}

function ChevronDown() {
  return (
    <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-charcoal-400">
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
      >
        <path d="M6 9l6 6 6-6" />
      </svg>
    </span>
  );
}
