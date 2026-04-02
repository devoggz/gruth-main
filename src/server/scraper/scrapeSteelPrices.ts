// src/server/scraper/scrapeSteelPrices.ts
// Fetches steel / rebar prices from a public Kenyan hardware price index.
// Same pattern as the cement scraper — fetch + regex, fallback baseline.

import type { RawScrapedPrice } from "./types";

const SOURCE_NAME = "Kenya Hardware Price Index";
const SOURCE_URL = "https://www.builderskenya.com/price-guide/steel";

const PRICE_LINE_PATTERN =
  /([A-Za-z0-9\s\(\)&\-\/]+?)\s+(?:KES|KSh|Ksh)[\s]?([\d,]+(?:\.\d{1,2})?)/gi;

function parseKes(raw: string): number {
  return parseFloat(raw.replace(/,/g, "").trim());
}

export async function scrapeSteelPrices(): Promise<RawScrapedPrice[]> {
  let html: string;
  try {
    const res = await fetch(SOURCE_URL, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; GRUTHBot/1.0; +https://gruth.ke/bot)",
        Accept: "text/html",
      },
      signal: AbortSignal.timeout(15_000),
    });

    if (!res.ok) {
      console.warn(`[scrapeSteel] HTTP ${res.status}`);
      return [];
    }
    html = await res.text();
  } catch (err) {
    console.error("[scrapeSteel] fetch error:", err);
    return [];
  }

  const results: RawScrapedPrice[] = [];
  const scrapedAt = new Date().toISOString();
  let match: RegExpExecArray | null;

  PRICE_LINE_PATTERN.lastIndex = 0;
  while ((match = PRICE_LINE_PATTERN.exec(html)) !== null) {
    const rawName = match[1].trim().replace(/\s+/g, " ");
    const priceKes = parseKes(match[2]);
    if (rawName.length < 5 || isNaN(priceKes) || priceKes <= 0) continue;
    if (priceKes > 500_000) continue;
    results.push({
      materialName: rawName,
      priceKes,
      sourceName: SOURCE_NAME,
      sourceUrl: SOURCE_URL,
      scrapedAt,
    });
  }

  if (results.length === 0) {
    console.warn("[scrapeSteel] No prices parsed — using baseline fallback");
    return STEEL_BASELINE_PRICES.map((p) => ({ ...p, scrapedAt }));
  }
  return results;
}

const STEEL_BASELINE_PRICES: Omit<RawScrapedPrice, "scrapedAt">[] = [
  {
    materialName: "Y8 Steel Rebar (6m)",
    priceKes: 480,
    priceLow: 450,
    priceHigh: 520,
    sourceName: "GRUTH Field Survey",
    sourceUrl: "https://gruth.ke",
  },
  {
    materialName: "Y10 Steel Rebar (6m)",
    priceKes: 750,
    priceLow: 700,
    priceHigh: 800,
    sourceName: "GRUTH Field Survey",
    sourceUrl: "https://gruth.ke",
  },
  {
    materialName: "Y12 Steel Rebar (6m)",
    priceKes: 1050,
    priceLow: 980,
    priceHigh: 1120,
    sourceName: "GRUTH Field Survey",
    sourceUrl: "https://gruth.ke",
  },
  {
    materialName: "Y16 Steel Rebar (6m)",
    priceKes: 1850,
    priceLow: 1750,
    priceHigh: 1950,
    sourceName: "GRUTH Field Survey",
    sourceUrl: "https://gruth.ke",
  },
  {
    materialName: "Y20 Steel Rebar (6m)",
    priceKes: 2900,
    priceLow: 2700,
    priceHigh: 3100,
    sourceName: "GRUTH Field Survey",
    sourceUrl: "https://gruth.ke",
  },
  {
    materialName: "BRC Mesh A142",
    priceKes: 4800,
    priceLow: 4500,
    priceHigh: 5200,
    sourceName: "GRUTH Field Survey",
    sourceUrl: "https://gruth.ke",
  },
  {
    materialName: "Iron Sheets (28 gauge 8ft)",
    priceKes: 1400,
    priceLow: 1300,
    priceHigh: 1550,
    sourceName: "GRUTH Field Survey",
    sourceUrl: "https://gruth.ke",
  },
  {
    materialName: "Iron Sheets (30 gauge 8ft)",
    priceKes: 1100,
    priceLow: 1000,
    priceHigh: 1200,
    sourceName: "GRUTH Field Survey",
    sourceUrl: "https://gruth.ke",
  },
  {
    materialName: "Galvanised Nails 4 inch",
    priceKes: 160,
    priceLow: 140,
    priceHigh: 180,
    sourceName: "GRUTH Field Survey",
    sourceUrl: "https://gruth.ke",
  },
  {
    materialName: "Roofing Nails 3 inch",
    priceKes: 130,
    priceLow: 110,
    priceHigh: 150,
    sourceName: "GRUTH Field Survey",
    sourceUrl: "https://gruth.ke",
  },
];
