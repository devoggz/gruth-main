"use client";
// src/components/dashboard/MarketPricesClient.tsx

import { CATEGORY_NAMES } from "@/lib/material-categories";

import { useState, useEffect, useCallback, useRef } from "react";
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

// ─── Types ────────────────────────────────────────────────────────────────────

interface PriceRow {
  id: string;
  materialId: string;
  materialName: string;
  category: string;
  unit: string;
  description: string | null;
  priceKes: number;
  priceLow: number | null;
  priceHigh: number | null;
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
  allCountyPrices: Record<string, PriceRow[]>;
}

// ─── Trend chip ───────────────────────────────────────────────────────────────

function TrendChip({ trend }: { trend: "UP" | "DOWN" | "STABLE" }) {
  if (trend === "UP")
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-50 text-red-600 border border-red-100">
        <svg
          width="8"
          height="8"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
        >
          <path d="M18 15l-6-6-6 6" />
        </svg>
        Rising
      </span>
    );
  if (trend === "DOWN")
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
        <svg
          width="8"
          height="8"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
        Falling
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-charcoal-50 text-charcoal-400 border border-charcoal-100">
      — Stable
    </span>
  );
}

// ─── Hover tooltip — viewport-aware ──────────────────────────────────────────

function PriceTooltip({
  row,
  anchorRef,
}: {
  row: PriceRow;
  anchorRef: React.RefObject<HTMLElement>;
}) {
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<"above" | "below">("above");

  useEffect(() => {
    if (!anchorRef.current || !tooltipRef.current) return;
    const anchor = anchorRef.current.getBoundingClientRect();
    const tip = tooltipRef.current.getBoundingClientRect();
    // If not enough space above, show below
    setPos(anchor.top - tip.height - 10 < 0 ? "below" : "above");
  }, [anchorRef]);

  return (
    <div
      ref={tooltipRef}
      className={`absolute left-0 z-[999] w-64 pointer-events-none ${
        pos === "above" ? "bottom-full mb-2.5" : "top-full mt-2.5"
      }`}
      style={{ filter: "drop-shadow(0 8px 24px rgba(0,0,0,0.18))" }}
    >
      <div className="bg-charcoal-950 text-white rounded-2xl px-4 py-3.5 text-xs">
        <p className="font-semibold text-white text-sm mb-2 leading-tight">
          {row.materialName}
        </p>

        {row.priceLow != null && row.priceHigh != null && (
          <div className="mb-2.5">
            <p className="text-charcoal-400 text-[10px] uppercase tracking-widest font-semibold mb-1">
              Market range
            </p>
            <div className="flex items-center gap-2">
              <span className="text-emerald-400 font-bold">
                KES {row.priceLow.toLocaleString()}
              </span>
              <span className="text-charcoal-600">–</span>
              <span className="text-red-400 font-bold">
                KES {row.priceHigh.toLocaleString()}
              </span>
            </div>
            <div className="mt-1.5 h-1 bg-charcoal-800 rounded-full overflow-hidden">
              {(() => {
                const range = row.priceHigh - row.priceLow;
                const midPct =
                  range > 0
                    ? ((row.priceKes - row.priceLow) / range) * 100
                    : 50;
                return (
                  <div className="relative h-full">
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-red-500 rounded-full" />
                    <div
                      className="absolute top-1/2 -translate-y-1/2 w-2 h-2 bg-white rounded-full border border-charcoal-800 shadow"
                      style={{ left: `calc(${midPct}% - 4px)` }}
                    />
                  </div>
                );
              })()}
            </div>
          </div>
        )}

        {row.description && (
          <p className="text-charcoal-300 text-[11px] leading-relaxed mb-2.5 border-t border-charcoal-800 pt-2.5">
            {row.description}
          </p>
        )}

        <div className="flex items-center justify-between gap-2 border-t border-charcoal-800 pt-2">
          <span className="text-charcoal-400 text-[10px] truncate">
            {row.sourceUrl ? (
              <a
                href={row.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-orange-400 hover:text-orange-300 pointer-events-auto"
              >
                {row.sourceName}
              </a>
            ) : (
              row.sourceName
            )}
          </span>
          <span className="text-charcoal-500 text-[10px] flex-shrink-0">
            {formatRelativeDate(row.updatedAt)}
          </span>
        </div>
      </div>
      {pos === "above" && (
        <div className="flex justify-start pl-4">
          <div className="w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-l-transparent border-r-transparent border-t-charcoal-950" />
        </div>
      )}
      {pos === "below" && (
        <div
          className="flex justify-start pl-4 order-first mb-0"
          style={{ marginTop: -1, marginBottom: 2 }}
        >
          <div className="w-0 h-0 border-l-[6px] border-r-[6px] border-b-[6px] border-l-transparent border-r-transparent border-b-charcoal-950" />
        </div>
      )}
    </div>
  );
}

// ─── Price row ────────────────────────────────────────────────────────────────

function PriceRowItem({ row }: { row: PriceRow }) {
  const [hovered, setHovered] = useState(false);
  const cellRef = useRef<HTMLTableDataCellElement>(null);

  return (
    <tr
      className="group relative hover:bg-orange-50/50 transition-colors duration-100 cursor-default"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <td
        ref={cellRef}
        className="px-4 py-3 font-medium text-charcoal-900 text-sm"
      >
        <div className="relative inline-block">
          <span className="border-b border-dashed border-charcoal-200 group-hover:border-orange-300 transition-colors">
            {row.materialName}
          </span>
          {hovered && (
            <PriceTooltip
              row={row}
              anchorRef={cellRef as React.RefObject<HTMLElement>}
            />
          )}
        </div>
      </td>
      <td className="px-4 py-3 text-charcoal-400 text-xs">{row.unit}</td>
      <td className="px-4 py-3 text-right">
        <span className="font-display font-bold text-charcoal-950 text-sm">
          {row.priceKes.toLocaleString()}
        </span>
        {row.priceLow != null && row.priceHigh != null && (
          <span className="block text-[10px] text-charcoal-300 font-normal mt-0.5">
            {row.priceLow.toLocaleString()} – {row.priceHigh.toLocaleString()}
          </span>
        )}
      </td>
      <td className="px-4 py-3">
        <TrendChip trend={row.trend} />
      </td>
      <td className="px-4 py-3 text-charcoal-400 text-xs hidden lg:table-cell">
        {row.sourceUrl ? (
          <a
            href={row.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:text-blue-700 hover:underline transition-colors"
          >
            {row.sourceName}
          </a>
        ) : (
          row.sourceName
        )}
      </td>
      <td className="px-4 py-3 text-charcoal-400 text-xs hidden lg:table-cell">
        {formatRelativeDate(row.updatedAt)}
      </td>
    </tr>
  );
}

// ─── Mobile price card ────────────────────────────────────────────────────────

function MobilePriceCard({ row }: { row: PriceRow }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <button
      className="w-full text-left px-4 py-4 hover:bg-orange-50/50 active:bg-orange-50 transition-colors"
      onClick={() => setExpanded((v) => !v)}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="font-medium text-charcoal-900 text-sm leading-snug">
            {row.materialName}
          </div>
          <div className="text-xs text-charcoal-400 mt-0.5">{row.unit}</div>
        </div>
        <div className="text-right flex-shrink-0">
          <div className="font-display font-bold text-charcoal-950 text-sm">
            KES {row.priceKes.toLocaleString()}
          </div>
          {row.priceLow != null && row.priceHigh != null && (
            <div className="text-[10px] text-charcoal-300 mt-0.5">
              {row.priceLow.toLocaleString()} – {row.priceHigh.toLocaleString()}
            </div>
          )}
          <div className="mt-1.5 flex justify-end">
            <TrendChip trend={row.trend} />
          </div>
        </div>
      </div>

      {expanded && (
        <div className="mt-3 pt-3 border-t border-charcoal-100 space-y-1.5 text-left">
          {row.description && (
            <p className="text-xs text-charcoal-500 leading-relaxed">
              {row.description}
            </p>
          )}
          <div className="flex items-center justify-between text-[11px] text-charcoal-400">
            <span>Source: {row.sourceName}</span>
            <span>{formatRelativeDate(row.updatedAt)}</span>
          </div>
        </div>
      )}
    </button>
  );
}

// ─── Comparison tooltip ───────────────────────────────────────────────────────

function ComparisonTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-charcoal-950 text-white rounded-xl px-4 py-3 shadow-2xl border border-charcoal-800 text-sm">
      <p className="font-semibold text-charcoal-300 text-xs mb-1">{label}</p>
      <p className="text-orange-400 font-display font-bold text-lg leading-none">
        KES {payload[0]?.value?.toLocaleString()}
      </p>
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function TableSkeleton() {
  return (
    <div className="bg-white border border-charcoal-100 rounded-2xl overflow-hidden">
      <div className="px-4 py-3 bg-charcoal-50 border-b border-charcoal-100">
        <div className="skeleton h-4 w-40" />
      </div>
      <div className="divide-y divide-charcoal-50">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="px-4 py-3.5 flex items-center justify-between gap-4"
          >
            <div className="skeleton h-4 w-48" />
            <div className="skeleton h-4 w-20" />
            <div className="skeleton h-4 w-28" />
            <div className="skeleton h-5 w-16 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

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
        /* silent */
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
  const selectedCountyName = countyName;

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

  const comparisonData = comparisonMaterial
    ? counties
        .map((county) => {
          const match = (allCountyPrices[county.id] ?? []).find(
            (p) => p.materialName === comparisonMaterial,
          );
          return { county: county.name, price: match?.priceKes ?? 0 };
        })
        .filter((d) => d.price > 0)
    : [];

  const allMaterials = Array.from(
    new Set(defaultPrices.map((p) => p.materialName)),
  ).sort();
  const totalItems = filtered.length;
  const risingCount = filtered.filter((p) => p.trend === "UP").length;
  const fallingCount = filtered.filter((p) => p.trend === "DOWN").length;

  return (
    <div className="space-y-5">
      {/* ── County selector ──────────────────────────────────────────────── */}
      <div>
        <p className="text-[10px] font-bold text-charcoal-400 uppercase tracking-widest mb-2.5">
          County
        </p>
        <div
          className="flex gap-2 overflow-x-auto pb-1"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {counties.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCounty(c.id)}
              className={[
                "flex-shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-150",
                selectedCounty === c.id
                  ? "bg-charcoal-950 text-white shadow-md"
                  : "bg-white border border-charcoal-200 text-charcoal-600 hover:border-charcoal-400 hover:text-charcoal-900",
              ].join(" ")}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* ── Stats + view toggle ───────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 text-xs flex-wrap">
          <span className="bg-charcoal-100 text-charcoal-600 px-2.5 py-1 rounded-full font-semibold">
            {totalItems} items
          </span>
          {risingCount > 0 && (
            <span className="bg-red-50 text-red-600 border border-red-100 px-2.5 py-1 rounded-full font-semibold">
              ↑ {risingCount} rising
            </span>
          )}
          {fallingCount > 0 && (
            <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 px-2.5 py-1 rounded-full font-semibold">
              ↓ {fallingCount} falling
            </span>
          )}
        </div>
        <div className="flex items-center bg-charcoal-100 rounded-xl p-1 gap-1 flex-shrink-0">
          {(["table", "chart"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={[
                "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 whitespace-nowrap",
                view === v
                  ? "bg-white text-charcoal-950 shadow-sm"
                  : "text-charcoal-500 hover:text-charcoal-700",
              ].join(" ")}
            >
              {v === "table" ? "Price List" : "Compare Counties"}
            </button>
          ))}
        </div>
      </div>

      {/* ── Comparison chart ─────────────────────────────────────────────── */}
      {view === "chart" && (
        <div className="bg-white border border-charcoal-100 rounded-2xl p-5 sm:p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
            <div>
              <h3 className="font-display font-semibold text-charcoal-950 text-base">
                County Price Comparison
              </h3>
              <p className="text-xs text-charcoal-400 mt-0.5">
                Select a material to compare across counties
              </p>
            </div>
            <select
              value={comparisonMaterial ?? ""}
              onChange={(e) => setComparisonMaterial(e.target.value || null)}
              className="text-sm border border-charcoal-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400/40 focus:border-orange-300 bg-white text-charcoal-700 w-full sm:max-w-[240px] h-10"
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
            <div className="flex flex-col items-center justify-center h-48 gap-3">
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
              <p className="text-sm text-charcoal-400">
                Pick a material above to see price comparison
              </p>
            </div>
          ) : comparisonData.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-charcoal-400 text-sm">
              No data available for this material
            </div>
          ) : (
            <>
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
                  <div className="grid grid-cols-3 gap-2 sm:gap-3">
                    <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3">
                      <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">
                        Cheapest
                      </p>
                      <p className="font-display font-bold text-emerald-700 text-base sm:text-lg mt-0.5 leading-none">
                        KES {cheapest.price.toLocaleString()}
                      </p>
                      <p className="text-xs text-emerald-500 mt-1 truncate">
                        {cheapest.county}
                      </p>
                    </div>
                    <div className="bg-charcoal-50 border border-charcoal-100 rounded-xl p-3">
                      <p className="text-[10px] font-bold text-charcoal-500 uppercase tracking-widest">
                        Average
                      </p>
                      <p className="font-display font-bold text-charcoal-800 text-base sm:text-lg mt-0.5 leading-none">
                        KES {avg.toLocaleString()}
                      </p>
                      <p className="text-xs text-charcoal-400 mt-1">
                        {comparisonData.length} counties
                      </p>
                    </div>
                    <div className="bg-red-50 border border-red-100 rounded-xl p-3">
                      <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest">
                        Priciest
                      </p>
                      <p className="font-display font-bold text-red-600 text-base sm:text-lg mt-0.5 leading-none">
                        KES {priciest.price.toLocaleString()}
                      </p>
                      <p className="text-xs text-red-400 mt-1 truncate">
                        {priciest.county}
                      </p>
                    </div>
                  </div>
                );
              })()}
              <div className="h-56 sm:h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={comparisonData}
                    margin={{ top: 4, right: 4, left: 0, bottom: 4 }}
                    barCategoryGap="28%"
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#f0eeeb"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="county"
                      tick={{ fontSize: 10, fill: "#75736c" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 10, fill: "#75736c" }}
                      axisLine={false}
                      tickLine={false}
                      width={44}
                      tickFormatter={(v) =>
                        v >= 1000 ? `${(v / 1000).toFixed(1)}k` : String(v)
                      }
                    />
                    <Tooltip
                      content={<ComparisonTooltip />}
                      cursor={{ fill: "#f97316", opacity: 0.06 }}
                    />
                    <Bar dataKey="price" radius={[6, 6, 0, 0]} maxBarSize={48}>
                      {comparisonData.map((entry) => (
                        <Cell
                          key={entry.county}
                          fill={
                            entry.county === selectedCountyName
                              ? "#f97316"
                              : "#e8e6e2"
                          }
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <p className="text-[11px] text-charcoal-400">
                <span className="inline-block w-2 h-2 bg-orange-500 rounded-sm mr-1 align-middle" />
                Orange = {selectedCountyName}. Prices in KES (mid-market rate).
              </p>
            </>
          )}
        </div>
      )}

      {/* ── Table / price list ────────────────────────────────────────────── */}
      {view === "table" && (
        <>
          {/* Search bar — above categories */}
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-charcoal-300 pointer-events-none"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={`Search ${countyName} prices…`}
              className="w-full pl-9 pr-9 py-2.5 text-sm border border-charcoal-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400/40 focus:border-orange-400 placeholder:text-charcoal-300 bg-white h-11"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal-300 hover:text-charcoal-600 transition-colors p-1"
              >
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Category filters — NO scrollbar */}
          <div className="flex flex-wrap gap-2">
            {["All", ...categories].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={[
                  "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 whitespace-nowrap",
                  selectedCategory === cat
                    ? "bg-orange-500 text-white shadow-sm"
                    : "bg-charcoal-100 text-charcoal-600 hover:bg-charcoal-200",
                ].join(" ")}
              >
                {cat === "All" ? "All categories" : cat}
              </button>
            ))}
          </div>

          {/* Results */}
          {loading ? (
            <div className="space-y-4">
              <TableSkeleton />
              <TableSkeleton />
            </div>
          ) : Object.keys(grouped).length === 0 ? (
            <div className="bg-white border border-charcoal-100 rounded-2xl p-12 text-center">
              <svg
                className="w-10 h-10 text-charcoal-200 mx-auto mb-3"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <p className="text-charcoal-500 text-sm font-medium">
                No prices found{search ? ` for "${search}"` : ""}
              </p>
              <p className="text-charcoal-400 text-xs mt-1">
                Try a different search term or category
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {
                // Sort categories in canonical order defined in material-categories.ts
                [...Object.entries(grouped)]
                  .sort(([a], [b]) => {
                    const ai = CATEGORY_NAMES.indexOf(a);
                    const bi = CATEGORY_NAMES.indexOf(b);
                    // Unknown categories (index === -1) go to the end
                    return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
                  })
                  .map(([category, rows]) => (
                    <div
                      key={category}
                      className="bg-white border border-charcoal-100 rounded-2xl overflow-hidden"
                    >
                      <div className="px-4 sm:px-5 py-3 bg-charcoal-50 border-b border-charcoal-100 flex items-center justify-between">
                        <h3 className="font-display font-semibold text-charcoal-900 text-sm">
                          {category}
                        </h3>
                        <span className="text-[11px] text-charcoal-400 font-medium">
                          {rows.length} {rows.length === 1 ? "item" : "items"}
                        </span>
                      </div>

                      {/* Desktop table */}
                      <div className="hidden sm:block overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-charcoal-100">
                              {[
                                "Material",
                                "Unit",
                                "Price (KES)",
                                "Trend",
                                "Source",
                                "Updated",
                              ].map((h, i) => (
                                <th
                                  key={h}
                                  className={`px-4 py-2.5 text-[10px] font-bold text-charcoal-400 uppercase tracking-widest ${
                                    i === 2 ? "text-right" : "text-left"
                                  } ${i >= 4 ? "hidden lg:table-cell" : ""}`}
                                >
                                  {h}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-charcoal-50">
                            {rows.map((row) => (
                              <PriceRowItem key={row.id} row={row} />
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Mobile list */}
                      <div className="sm:hidden divide-y divide-charcoal-100">
                        {rows.map((row) => (
                          <MobilePriceCard key={row.id} row={row} />
                        ))}
                      </div>
                    </div>
                  ))
              }
            </div>
          )}
        </>
      )}

      {/* Disclaimer */}
      <p className="text-[11px] text-charcoal-400 leading-relaxed border-t border-charcoal-100 pt-4">
        <strong className="font-semibold text-charcoal-500">Disclaimer:</strong>{" "}
        Prices are indicative mid-market rates sourced from supplier data and
        GRUTH field surveys. Actual prices vary by quantity, supplier, and
        market conditions.
      </p>
    </div>
  );
}
