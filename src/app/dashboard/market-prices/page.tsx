// src/app/dashboard/market-prices/page.tsx
import { prisma } from "@/lib/prisma";
import { MarketPricesClient } from "@/components/dashboard/MarketPricesClient";
import { formatRelativeDate } from "@/lib/utils";

const MATERIAL_CATEGORIES = [
  "Cement & Concrete",
  "Steel & Metal",
  "Sand & Aggregates",
  "Timber & Roofing",
  "Finishes & Paint",
  "Hardware & Fixings",
] as const;

export default async function MarketPricesPage() {
  // Counties that have price data
  const counties = await prisma.county.findMany({
    where: { marketPrices: { some: {} } },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  const defaultCounty = counties[0];

  // Default county prices (shown on initial load)
  const defaultPrices = defaultCounty
    ? await prisma.countyMaterialPrice.findMany({
        where: { countyId: defaultCounty.id },
        include: { material: true, source: true },
        orderBy: [
          { material: { category: "asc" } },
          { material: { name: "asc" } },
        ],
      })
    : [];

  // All county prices — fetched once at page load for the comparison chart.
  // This avoids per-county API calls when switching materials in chart view.
  const allPricesRaw = await prisma.countyMaterialPrice.findMany({
    include: { material: true, source: true },
  });

  // Group by countyId for O(1) lookup in the client
  const allCountyPrices: Record<string, typeof defaultPrices> = {};
  for (const p of allPricesRaw) {
    (allCountyPrices[p.countyId] ??= []).push(p);
  }

  const lastUpdated = defaultPrices[0]?.updatedAt ?? null;

  const serialisedDefault = defaultPrices.map((p) => ({
    id: p.id,
    materialId: p.materialId,
    materialName: p.material.name,
    category: p.material.category,
    unit: p.material.unit,
    priceKes: p.priceKes,
    sourceName: p.source?.name ?? "GRUTH Field Survey",
    sourceUrl: p.source?.url ?? null,
    updatedAt: p.updatedAt,
    trend: p.trend as "UP" | "DOWN" | "STABLE",
  }));

  // Serialise all county prices in the same shape
  const serialisedAll: Record<string, typeof serialisedDefault> = {};
  for (const [countyId, rows] of Object.entries(allCountyPrices)) {
    serialisedAll[countyId] = rows.map((p) => ({
      id: p.id,
      materialId: p.materialId,
      materialName: p.material.name,
      category: p.material.category,
      unit: p.material.unit,
      priceKes: p.priceKes,
      sourceName: p.source?.name ?? "GRUTH Field Survey",
      sourceUrl: p.source?.url ?? null,
      updatedAt: p.updatedAt,
      trend: p.trend as "UP" | "DOWN" | "STABLE",
    }));
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-2xl font-bold text-charcoal-950 tracking-tight">
            Market Prices
          </h1>
          <p className="text-charcoal-500 text-sm mt-1">
            Verified construction material prices by county · updated weekly
            {lastUpdated && ` · Last: ${formatRelativeDate(lastUpdated)}`}
          </p>
        </div>
        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2.5">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          <span className="text-xs font-semibold text-emerald-700">
            GRUTH Verified
          </span>
        </div>
      </div>

      {/* Info banner */}
      <div className="rounded-xl border border-blue-200 bg-blue-50 px-5 py-4 flex gap-3">
        <svg
          className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <div>
          <p className="text-sm font-semibold text-blue-800">
            How prices are sourced
          </p>
          <p className="text-xs text-blue-600 mt-0.5 leading-relaxed">
            Prices are sourced from leading hardware suppliers in each county,
            verified by GRUTH field inspectors, and updated weekly. Use these as
            a reference when reviewing contractor quotes — a significant markup
            (30%+) from these figures is a red flag.
          </p>
        </div>
      </div>

      {/* Empty state */}
      {counties.length === 0 ? (
        <div className="card p-16 text-center">
          <div className="w-14 h-14 bg-charcoal-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-7 h-7 text-charcoal-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
            </svg>
          </div>
          <h3 className="font-display font-semibold text-charcoal-900 mb-2">
            Price data coming soon
          </h3>
          <p className="text-charcoal-500 text-sm">
            Our team is compiling verified prices across all 47 counties. Check
            back shortly.
          </p>
        </div>
      ) : (
        <MarketPricesClient
          counties={counties}
          defaultCountyId={defaultCounty!.id}
          defaultPrices={serialisedDefault}
          categories={[...MATERIAL_CATEGORIES]}
          allCountyPrices={serialisedAll}
        />
      )}
    </div>
  );
}
