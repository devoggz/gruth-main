// src/app/dashboard/market-prices/page.tsx
import { prisma } from "@/lib/prisma";
import { MarketPricesClient } from "@/components/dashboard/MarketPricesClient";
import { formatRelativeDate } from "@/lib/utils";
import MarketPriceTicker from "@/components/dashboard/MarketPriceTicker";
import { CATEGORY_NAMES } from "@/lib/material-categories";

export const revalidate = 3600;
export const metadata = { title: "Market Prices | GRUTH" };

export default async function MarketPricesPage() {
  const tickerRaw = await prisma.countyMaterialPrice.findMany({
    include: { material: true, county: true },
    orderBy: [{ county: { name: "asc" } }, { updatedAt: "desc" }],
    take: 94,
  });

  const tickerItems = tickerRaw
    .filter(
      (p) =>
        p.material.category === "Cement & Concrete" ||
        p.material.category === "Steel & Metal",
    )
    .slice(0, 47)
    .map((p) => ({
      county: p.county.name,
      material: p.material.name,
      priceKes: p.priceKes,
      priceLow: (p as any).priceLow ?? null,
      priceHigh: (p as any).priceHigh ?? null,
      trend: p.trend as "UP" | "DOWN" | "STABLE",
    }));

  const counties = await prisma.county.findMany({
    where: { marketPrices: { some: {} } },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  const defaultCounty = counties[0];

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

  const allPricesRaw = await prisma.countyMaterialPrice.findMany({
    include: { material: true, source: true },
  });

  const allCountyPricesRaw: Record<string, typeof defaultPrices> = {};
  for (const p of allPricesRaw) {
    (allCountyPricesRaw[p.countyId] ??= []).push(p);
  }

  const lastUpdated = defaultPrices[0]?.updatedAt ?? null;

  function serialise(rows: typeof defaultPrices) {
    return rows.map((p) => ({
      id: p.id,
      materialId: p.materialId,
      materialName: p.material.name,
      category: p.material.category,
      unit: p.material.unit,
      description: p.material.description ?? null,
      priceKes: p.priceKes,
      priceLow: (p as any).priceLow ?? null,
      priceHigh: (p as any).priceHigh ?? null,
      sourceName: p.source?.name ?? "GRUTH Field Survey",
      sourceUrl: p.source?.url ?? null,
      updatedAt: p.updatedAt,
      trend: p.trend as "UP" | "DOWN" | "STABLE",
    }));
  }

  const serialisedDefault = serialise(defaultPrices);
  const serialisedAll: Record<string, ReturnType<typeof serialise>> = {};
  for (const [countyId, rows] of Object.entries(allCountyPricesRaw)) {
    serialisedAll[countyId] = serialise(rows);
  }

  return (
    <div className="space-y-6 pb-12 overflow-hidden">
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
        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-3.5 py-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="text-xs font-semibold text-emerald-700">
            GRUTH Verified
          </span>
        </div>
      </div>

      {tickerItems.length > 0 && (
        <MarketPriceTicker items={tickerItems} speed={38} />
      )}

      <div className="rounded-xl border border-blue-100 bg-blue-50/70 px-4 py-3.5 flex gap-3 items-start">
        <svg
          className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <p className="text-xs text-blue-700 leading-relaxed">
          <strong className="font-semibold">How to use this:</strong> Compare
          these market rates against contractor invoices. A markup of{" "}
          <strong>30%+</strong> above these figures is a red flag worth
          querying. Hover any row to see the full price range and source.
        </p>
      </div>

      {counties.length === 0 ? (
        <div className="card p-16 text-center">
          <div className="w-14 h-14 bg-charcoal-100 rounded-2xl flex items-center justify-center mx-auto mb-8">
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
            Our team is compiling verified prices across all 47 counties.
          </p>
        </div>
      ) : (
        <MarketPricesClient
          counties={counties}
          defaultCountyId={defaultCounty!.id}
          defaultPrices={serialisedDefault}
          categories={CATEGORY_NAMES} /* ← from material-categories.ts */
          allCountyPrices={serialisedAll}
        />
      )}
    </div>
  );
}
