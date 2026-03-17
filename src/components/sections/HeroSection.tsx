import Link from "next/link";

const trustBadges = [
  "Photo + Video Evidence",
  "Written Reports",
  "Secure Dashboard",
  "Verified Inspectors",
];

const statCards = [
  { value: "150+", label: "Families Served" },
  { value: "48h", label: "Report Turnaround" },
  { value: "100%", label: "Independent Inspectors" },
  { value: "6", label: "Service Categories" },
];

export default function HeroSection() {
  return (
    <section className="relative bg-charcoal-950 min-h-[92vh] flex items-center overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage: `
            linear-gradient(to right, #f97316 1px, transparent 1px),
            linear-gradient(to bottom, #f97316 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      />

      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 70% at 30% 50%, transparent 0%, #1A1916 75%)",
        }}
      />

      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 right-24 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-24 left-8  w-56 h-56 bg-orange-500/5  rounded-full blur-2xl" />
      </div>

      <div className="absolute right-16 xl:right-48 top-1/2 -translate-y-1/2 hidden lg:grid grid-cols-2 gap-px">
        {statCards.map(({ value, label }) => (
          <div
            key={label}
            className="w-48 h-48 flex flex-col items-center justify-center gap-1
                       border border-white/[0.06] bg-white/[0.03] backdrop-blur-sm"
          >
            <span className="font-display text-3xl font-bold text-orange-400 leading-none">
              {value}
            </span>
            <span className="text-charcoal-400 text-xs font-medium text-center leading-tight px-3">
              {label}
            </span>
          </div>
        ))}
      </div>

      <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="max-w-xl lg:max-w-2xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-medium px-3 py-1.5 rounded-full mb-8 uppercase tracking-wider">
            <span className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-pulse" />
            Ground Truth Verification
          </div>

          {/* Headline */}
          <h1 className="font-display text-5xl sm:text-6xl lg:text-[4.25rem] font-bold text-white leading-[1.05] mb-6 tracking-tight">
            Know exactly
            <br />
            what&rsquo;s happening
            <br />
            <span className="text-orange-400 italic">back home.</span>
          </h1>

          {/* Sub-copy */}
          <p className="text-charcoal-300 text-lg sm:text-xl leading-relaxed mb-14">
            GRUTH sends an independent inspector to your site in Kenya. You get
            documented evidence — not reassurances.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 mb-14">
            <Link
              href="/request-verification"
              className="btn-primary text-base py-4 px-8"
            >
              Request a Verification
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
            <Link
              href="/how-it-works"
              className="inline-flex items-center gap-2 text-charcoal-300 hover:text-white border border-white/10 hover:border-white/30 rounded-lg px-8 py-4 font-medium transition-all duration-200"
            >
              See how it works
            </Link>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap gap-x-6 gap-y-3">
            {trustBadges.map((t) => (
              <div
                key={t}
                className="flex items-center gap-2 text-charcoal-400 text-sm"
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

          {/* Mobile stat strip — only visible below lg */}
          <div className="mt-14 grid grid-cols-4 gap-px border border-white/[0.06] lg:hidden">
            {statCards.map(({ value, label }) => (
              <div
                key={label}
                className="flex flex-col items-center justify-center py-4 bg-white/[0.03] gap-0.5"
              >
                <span className="font-display text-xl font-bold text-orange-400 leading-none">
                  {value}
                </span>
                <span className="text-charcoal-500 text-[10px] font-medium text-center leading-tight px-1">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
