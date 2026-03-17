"use client";
// src/components/dashboard/MarketPricesClient.tsx

import { useState, useEffect, useCallback } from "react";
import { formatRelativeDate } from "@/lib/utils";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface PriceRow {
  id: string;
  materialId: string;
  materialName: string;
  category: string;
  unit: string;
  priceKes: number;
  sourceName: string;
  sourceUrl: string | null;
  updatedAt: Date;
  trend: "UP" | "DOWN" | "STABLE";
}

interface Props {
  counties: { id: string; name: string }[];
  defaultCountyId: string;
  defaultPrices: PriceRow[];
  categories: string[];
  // All county prices passed in for comparison chart (server-fetched)
  allCountyPrices: Record<string, PriceRow[]>;
}

function TrendIcon({ trend }: { trend: "UP" | "DOWN" | "STABLE" }) {
  if (trend === "UP")
    return (
      <span className="inline-flex items-center gap-1 text-red-500 font-bold text-xs">
        ↑ <span className="font-normal text-red-400">Rising</span>
      </span>
    );
  if (trend === "DOWN")
    return (
      <span className="inline-flex items-center gap-1 text-emerald-600 font-bold text-xs">
        ↓ <span className="font-normal text-emerald-500">Falling</span>
      </span>
    );
  return <span className="text-charcoal-300 text-xs">— Stable</span>;
}

// Custom tooltip for the comparison chart
function ComparisonTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-charcoal-950 text-white rounded-xl px-4 py-3 shadow-2xl border border-charcoal-800 text-sm">
      <p className="font-semibold mb-1">{label}</p>
      <p className="text-orange-400 font-display font-bold text-lg">
        KES {payload[0]?.value?.toLocaleString()}
      </p>
    </div>
  );
}

export function MarketPricesClient({
  counties,
  defaultCountyId,
  defaultPrices,
  categories,
  allCountyPrices,
}: Props) {
  const [selectedCounty, setSelectedCounty] = useState(defaultCountyId);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [prices, setPrices] = useState<PriceRow[]>(defaultPrices);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [comparisonMaterial, setComparisonMaterial] = useState<string | null>(
    null,
  );
  const [view, setView] = useState<"table" | "chart">("table");

  const fetchPrices = useCallback(
    async (countyId: string) => {
      if (countyId === defaultCountyId) {
        setPrices(defaultPrices);
        return;
      }
      setLoading(true);
      try {
        const res = await fetch(`/api/market-prices?countyId=${countyId}`);
        const data = await res.json();
        setPrices(data);
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    },
    [defaultCountyId, defaultPrices],
  );

  useEffect(() => {
    fetchPrices(selectedCounty);
  }, [selectedCounty, fetchPrices]);

  const countyName = counties.find((c) => c.id === selectedCounty)?.name ?? "";

  const filtered = prices
    .filter(
      (p) => selectedCategory === "All" || p.category === selectedCategory,
    )
    .filter(
      (p) =>
        !search || p.materialName.toLowerCase().includes(search.toLowerCase()),
    );

  const grouped = filtered.reduce<Record<string, PriceRow[]>>((acc, p) => {
    (acc[p.category] ??= []).push(p);
    return acc;
  }, {});

  // Build comparison chart data: price of selected material across all counties
  const comparisonData = comparisonMaterial
    ? counties
        .map((county) => {
          const countyPrices = allCountyPrices[county.id] ?? [];
          const match = countyPrices.find(
            (p) => p.materialName === comparisonMaterial,
          );
          return { county: county.name, price: match?.priceKes ?? 0 };
        })
        .filter((d) => d.price > 0)
    : [];

  // All unique material names for the comparison selector
  const allMaterials = Array.from(
    new Set(defaultPrices.map((p) => p.materialName)),
  ).sort();

  const selectedCountyName = counties.find(
    (c) => c.id === selectedCounty,
  )?.name;

  return (
    <div className="space-y-8">
      {/* ── County + View toggle row ─────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-charcoal-400 uppercase tracking-widest mb-2.5">
            Select County
          </p>
          <div className="flex flex-wrap gap-2">
            {counties.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedCounty(c.id)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                  selectedCounty === c.id
                    ? "bg-charcoal-950 text-white shadow-md"
                    : "bg-white border border-charcoal-200 text-charcoal-700 hover:border-orange-300 hover:text-orange-700"
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>

        {/* View toggle */}
        <div className="flex items-center bg-charcoal-100 rounded-xl p-1 gap-1 self-start sm:self-auto">
          <button
            onClick={() => setView("table")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              view === "table"
                ? "bg-white text-charcoal-950 shadow-sm"
                : "text-charcoal-500 hover:text-charcoal-700"
            }`}
          >
            Table
          </button>
          <button
            onClick={() => setView("chart")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              view === "chart"
                ? "bg-white text-charcoal-950 shadow-sm"
                : "text-charcoal-500 hover:text-charcoal-700"
            }`}
          >
            Compare Counties
          </button>
        </div>
      </div>

      {/* ── County Comparison Chart ───────────────────────────────────── */}
      {view === "chart" && (
        <div className="card p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-display font-semibold text-charcoal-950">
                County Price Comparison
              </h3>
              <p className="text-xs text-charcoal-400 mt-0.5">
                Compare how prices differ across counties for a single material
              </p>
            </div>
            {/* Material selector */}
            <select
              value={comparisonMaterial ?? ""}
              onChange={(e) => setComparisonMaterial(e.target.value || null)}
              className="text-sm border border-charcoal-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400/40 focus:border-orange-300 bg-white text-charcoal-700 max-w-xs w-full sm:w-auto"
            >
              <option value="">Select a material…</option>
              {allMaterials.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          {!comparisonMaterial ? (
            <div className="flex flex-col items-center justify-center h-56 text-charcoal-300 gap-3">
              <svg
                className="w-10 h-10 text-charcoal-200"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path d="M3 3v18h18" />
                <path d="M7 16l4-4 4 4 4-6" />
              </svg>
              <p className="text-sm">
                Pick a material above to compare prices across counties
              </p>
            </div>
          ) : comparisonData.length === 0 ? (
            <div className="flex items-center justify-center h-56 text-charcoal-400 text-sm">
              No data available for this material
            </div>
          ) : (
            <>
              {/* Min/max callouts */}
              <div className="grid grid-cols-3 gap-3">
                {(() => {
                  const sorted = [...comparisonData].sort(
                    (a, b) => a.price - b.price,
                  );
                  const cheapest = sorted[0];
                  const priciest = sorted[sorted.length - 1];
                  const avg = Math.round(
                    comparisonData.reduce((s, d) => s + d.price, 0) /
                      comparisonData.length,
                  );
                  return (
                    <>
                      <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3">
                        <p className="text-[10px] font-semibold text-emerald-600 uppercase tracking-widest">
                          Cheapest
                        </p>
                        <p className="font-display font-bold text-emerald-700 text-lg mt-0.5">
                          KES {cheapest.price.toLocaleString()}
                        </p>
                        <p className="text-xs text-emerald-600 mt-0.5">
                          {cheapest.county}
                        </p>
                      </div>
                      <div className="bg-charcoal-50 border border-charcoal-100 rounded-xl p-3">
                        <p className="text-[10px] font-semibold text-charcoal-500 uppercase tracking-widest">
                          Average
                        </p>
                        <p className="font-display font-bold text-charcoal-800 text-lg mt-0.5">
                          KES {avg.toLocaleString()}
                        </p>
                        <p className="text-xs text-charcoal-400 mt-0.5">
                          across {comparisonData.length} counties
                        </p>
                      </div>
                      <div className="bg-red-50 border border-red-100 rounded-xl p-3">
                        <p className="text-[10px] font-semibold text-red-500 uppercase tracking-widest">
                          Priciest
                        </p>
                        <p className="font-display font-bold text-red-600 text-lg mt-0.5">
                          KES {priciest.price.toLocaleString()}
                        </p>
                        <p className="text-xs text-red-400 mt-0.5">
                          {priciest.county}
                        </p>
                      </div>
                    </>
                  );
                })()}
              </div>

              {/* Bar chart */}
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={comparisonData}
                    margin={{ top: 4, right: 4, left: 0, bottom: 4 }}
                    barCategoryGap="28%"
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#f0f0f0"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="county"
                      tick={{ fontSize: 11, fill: "#6b7280" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: "#6b7280" }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(v) =>
                        `${(v / 1000).toFixed(v >= 1000 ? 1 : 0)}${v >= 1000 ? "k" : ""}`
                      }
                      width={40}
                    />
                    <Tooltip
                      content={<ComparisonTooltip />}
                      cursor={{ fill: "#f97316", opacity: 0.06 }}
                    />
                    <Bar dataKey="price" radius={[6, 6, 0, 0]} maxBarSize={52}>
                      {comparisonData.map((entry, i) => (
                        <Cell
                          key={entry.county}
                          fill={
                            entry.county === selectedCountyName
                              ? "#f97316" // orange for selected county
                              : "#e5e7eb" // grey for others
                          }
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <p className="text-xs text-charcoal-400">
                Orange bar = currently selected county ({selectedCountyName}).
                Prices in KES.
              </p>
            </>
          )}
        </div>
      )}

      {/* ── Table view ───────────────────────────────────────────────── */}
      {view === "table" && (
        <>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1 max-w-xs">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-300"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search materials…"
                className="w-full pl-9 pr-4 py-2 text-sm border border-charcoal-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400/40 focus:border-orange-300"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {["All", ...categories].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    selectedCategory === cat
                      ? "bg-orange-500 text-white"
                      : "bg-charcoal-100 text-charcoal-600 hover:bg-charcoal-200"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Prices table */}
          {loading ? (
            <div className="flex items-center justify-center h-48">
              <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : Object.keys(grouped).length === 0 ? (
            <div className="card p-12 text-center text-charcoal-400 text-sm">
              No prices found{search ? ` for "${search}"` : ""} in {countyName}.
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(grouped).map(([category, rows]) => (
                <div key={category} className="card overflow-hidden">
                  <div className="px-5 py-3 bg-charcoal-50 border-b border-charcoal-100 flex items-center justify-between">
                    <h3 className="font-display font-semibold text-charcoal-900 text-sm">
                      {category}
                    </h3>
                    <span className="text-xs text-charcoal-400">
                      {rows.length} item{rows.length !== 1 ? "s" : ""}
                    </span>
                  </div>

                  {/* Desktop table */}
                  <div className="hidden sm:block overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left border-b border-charcoal-100">
                          <th className="px-5 py-3 text-xs font-semibold text-charcoal-400 uppercase tracking-widest">
                            Material
                          </th>
                          <th className="px-5 py-3 text-xs font-semibold text-charcoal-400 uppercase tracking-widest">
                            Unit
                          </th>
                          <th className="px-5 py-3 text-xs font-semibold text-charcoal-400 uppercase tracking-widest text-right">
                            Price (KES)
                          </th>
                          <th className="px-5 py-3 text-xs font-semibold text-charcoal-400 uppercase tracking-widest">
                            Trend
                          </th>
                          <th className="px-5 py-3 text-xs font-semibold text-charcoal-400 uppercase tracking-widest">
                            Source
                          </th>
                          <th className="px-5 py-3 text-xs font-semibold text-charcoal-400 uppercase tracking-widest">
                            Updated
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-charcoal-50">
                        {rows.map((row) => (
                          <tr
                            key={row.id}
                            className="hover:bg-orange-50/40 transition-colors"
                          >
                            <td className="px-5 py-3.5 font-medium text-charcoal-900">
                              {row.materialName}
                            </td>
                            <td className="px-5 py-3.5 text-charcoal-500">
                              {row.unit}
                            </td>
                            <td className="px-5 py-3.5 text-right">
                              <span className="font-display font-bold text-charcoal-950">
                                {row.priceKes.toLocaleString()}
                              </span>
                            </td>
                            <td className="px-5 py-3.5">
                              <TrendIcon trend={row.trend} />
                            </td>
                            <td className="px-5 py-3.5 text-charcoal-400 text-xs">
                              {row.sourceUrl ? (
                                <a
                                  href={row.sourceUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:underline"
                                >
                                  {row.sourceName}
                                </a>
                              ) : (
                                row.sourceName
                              )}
                            </td>
                            <td className="px-5 py-3.5 text-charcoal-400 text-xs">
                              {formatRelativeDate(row.updatedAt)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile cards */}
                  <div className="sm:hidden divide-y divide-charcoal-100">
                    {rows.map((row) => (
                      <div
                        key={row.id}
                        className="px-4 py-3.5 flex items-center justify-between gap-3"
                      >
                        <div>
                          <div className="font-medium text-charcoal-900 text-sm">
                            {row.materialName}
                          </div>
                          <div className="text-xs text-charcoal-400 mt-0.5">
                            {row.unit} · {row.sourceName}
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="font-display font-bold text-charcoal-950 text-base">
                            KES {row.priceKes.toLocaleString()}
                          </div>
                          <div className="flex items-center justify-end gap-1 mt-0.5">
                            <TrendIcon trend={row.trend} />
                            <span className="text-[10px] text-charcoal-300">
                              {formatRelativeDate(row.updatedAt)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Disclaimer */}
      <p className="text-xs text-charcoal-400 leading-relaxed border-t border-charcoal-100 pt-4">
        <strong>Disclaimer:</strong> Prices are indicative, sourced from
        publicly accessible supplier data and GRUTH field surveys. Actual prices
        may vary by quantity, supplier, and market conditions. Significant
        deviations (30%+) from these figures should be queried with your
        supplier or contractor.
      </p>
    </div>
  );
}
