// src/server/scraper/runScrapers.ts
// Orchestrates all scrapers, normalises output, and returns a unified list.
// Called by /api/scrape/route.ts.
// Add new scrapers by importing them and adding to SCRAPERS array.

import { scrapeCementPrices } from "./scrapeCementPrices";
import { scrapeSteelPrices } from "./scrapeSteelPrices";
import { categorizeMaterial } from "@/lib/categorizeMaterial";
import { detectAnomaly } from "@/lib/market-intelligence";
import type { RawScrapedPrice, NormalisedPrice } from "./types";

// ─── Unit inference ───────────────────────────────────────────────────────────

const UNIT_KEYWORDS: Array<{ keywords: string[]; unit: string }> = [
  { keywords: ["50kg", "cement", "bag", "per bag"], unit: "per bag" },
  {
    keywords: ["tonne", "ton", "sand", "hardcore", "quarry dust", "ballast"],
    unit: "per tonne",
  },
  { keywords: ["sheet", "plywood", "brc mesh"], unit: "per sheet" },
  {
    keywords: ["piece", "block", "lintel", "hinge", "padlock", "pipe", "mcb"],
    unit: "per piece",
  },
  { keywords: ["sqm", "sq m", "tile", "tiles"], unit: "per sqm" },
  { keywords: ["per kg", "nails", "nail", "per kg"], unit: "per kg" },
  { keywords: ["tin", "20l", "5l", "paint"], unit: "per tin" },
  { keywords: ["roll", "cable"], unit: "per roll" },
  { keywords: ["pair", "hinges"], unit: "per pair" },
];

function inferUnit(name: string): string {
  const lower = name.toLowerCase();
  for (const { keywords, unit } of UNIT_KEYWORDS) {
    if (keywords.some((kw) => lower.includes(kw))) return unit;
  }
  return "per unit";
}

// ─── Normalisation ────────────────────────────────────────────────────────────

function normalise(raw: RawScrapedPrice): NormalisedPrice {
  return {
    ...raw,
    materialName: raw.materialName.trim().replace(/\s+/g, " "),
    priceKes: Math.round(raw.priceKes),
    priceLow: raw.priceLow != null ? Math.round(raw.priceLow) : undefined,
    priceHigh: raw.priceHigh != null ? Math.round(raw.priceHigh) : undefined,
    category: categorizeMaterial(raw.materialName),
    unit: inferUnit(raw.materialName),
  };
}

// ─── Deduplication ────────────────────────────────────────────────────────────
// When multiple scrapers return the same material, we keep the entry with
// the most complete data (both priceLow and priceHigh present), or the first.

function deduplicate(prices: NormalisedPrice[]): NormalisedPrice[] {
  const map = new Map<string, NormalisedPrice>();

  for (const p of prices) {
    const key = p.materialName.toLowerCase();
    const existing = map.get(key);

    if (!existing) {
      map.set(key, p);
      continue;
    }

    // Prefer entry with range data
    const existingHasRange =
      existing.priceLow != null && existing.priceHigh != null;
    const newHasRange = p.priceLow != null && p.priceHigh != null;

    if (newHasRange && !existingHasRange) {
      map.set(key, p);
    }
  }

  return Array.from(map.values());
}

// ─── Anomaly filtering ────────────────────────────────────────────────────────
// Prices that are statistical outliers within the same category are logged
// but NOT dropped — the ingestion layer can decide what to do with them.

function flagAnomalies(
  prices: NormalisedPrice[],
): Array<NormalisedPrice & { anomaly: boolean; zScore: number | null }> {
  // Group by category for z-score comparison
  const byCat = new Map<string, number[]>();
  for (const p of prices) {
    const bucket = byCat.get(p.category) ?? [];
    bucket.push(p.priceKes);
    byCat.set(p.category, bucket);
  }

  return prices.map((p) => {
    const peers = byCat.get(p.category) ?? [];
    const { isAnomaly, zScore } = detectAnomaly(p.priceKes, peers);
    if (isAnomaly) {
      console.warn(
        `[scraper] Anomaly detected: "${p.materialName}" KES ${p.priceKes} (z=${zScore}) in ${p.category}`,
      );
    }
    return { ...p, anomaly: isAnomaly, zScore };
  });
}

// ─── Entry point ─────────────────────────────────────────────────────────────

export interface ScraperRunResult {
  prices: NormalisedPrice[];
  raw: RawScrapedPrice[];
  errors: string[];
  runAt: string;
  durationMs: number;
}

// All scrapers registered here — add new ones to this array
const SCRAPERS: Array<{ name: string; fn: () => Promise<RawScrapedPrice[]> }> =
  [
    { name: "cement", fn: scrapeCementPrices },
    { name: "steel", fn: scrapeSteelPrices },
  ];

export async function runScrapers(): Promise<ScraperRunResult> {
  const start = Date.now();
  const runAt = new Date().toISOString();
  const errors: string[] = [];
  const rawAll: RawScrapedPrice[] = [];

  // Run all scrapers concurrently — one failure doesn't kill the others
  const results = await Promise.allSettled(
    SCRAPERS.map(async ({ name, fn }) => {
      const rows = await fn();
      console.log(`[scraper:${name}] returned ${rows.length} rows`);
      return rows;
    }),
  );

  for (let i = 0; i < results.length; i++) {
    const result = results[i];
    if (result.status === "fulfilled") {
      rawAll.push(...result.value);
    } else {
      const msg = `${SCRAPERS[i].name}: ${result.reason}`;
      console.error("[scraper] failed:", msg);
      errors.push(msg);
    }
  }

  // Normalise → deduplicate → flag anomalies
  const normalised = rawAll.map(normalise);
  const deduplicated = deduplicate(normalised);
  const withFlags = flagAnomalies(deduplicated);

  // Strip anomaly metadata from final prices (it's only for logging)
  const prices: NormalisedPrice[] = withFlags.map(
    ({ anomaly: _a, zScore: _z, ...rest }) => rest,
  );

  return {
    prices,
    raw: rawAll,
    errors,
    runAt,
    durationMs: Date.now() - start,
  };
}
