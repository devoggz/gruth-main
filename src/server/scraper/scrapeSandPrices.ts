// src/server/scraper/scrapeSandPrices.ts
import type { RawScrapedPrice } from "./types";

const SOURCE_NAME = "Kenya Quarry Association Price Guide";
const SOURCE_URL  = "https://www.builderskenya.com/price-guide/aggregates";
const PRICE_PATTERN = /([A-Za-z0-9\s\(\)&\-\/]+?)\s+(?:KES|KSh|Ksh)[\s]?([\d,]+(?:\.\d{1,2})?)/gi;

function parseKes(r: string) { return parseFloat(r.replace(/,/g, "").trim()); }

export async function scrapeSandPrices(): Promise<RawScrapedPrice[]> {
  try {
    const res = await fetch(SOURCE_URL, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; GRUTHBot/1.0; +https://gruth.ke/bot)" },
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) return SAND_BASELINE.map(p => ({ ...p, scrapedAt: new Date().toISOString() }));
    const html = await res.text();
    const results: RawScrapedPrice[] = [];
    const scrapedAt = new Date().toISOString();
    let m: RegExpExecArray | null;
    PRICE_PATTERN.lastIndex = 0;
    while ((m = PRICE_PATTERN.exec(html)) !== null) {
      const n = m[1].trim().replace(/\s+/g, " ");
      const p = parseKes(m[2]);
      if (n.length < 5 || isNaN(p) || p <= 0 || p > 100_000) continue;
      results.push({ materialName: n, priceKes: p, sourceName: SOURCE_NAME, sourceUrl: SOURCE_URL, scrapedAt });
    }
    return results.length > 0 ? results : SAND_BASELINE.map(p => ({ ...p, scrapedAt }));
  } catch {
    return SAND_BASELINE.map(p => ({ ...p, scrapedAt: new Date().toISOString() }));
  }
}

const SAND_BASELINE: Omit<RawScrapedPrice, "scrapedAt">[] = [
  { materialName: "River Sand",    priceKes: 2800, priceLow: 2400, priceHigh: 3200, sourceName: "GRUTH Field Survey", sourceUrl: "https://gruth.ke" },
  { materialName: "Quarry Dust",   priceKes: 2200, priceLow: 1800, priceHigh: 2600, sourceName: "GRUTH Field Survey", sourceUrl: "https://gruth.ke" },
  { materialName: "Hardcore",      priceKes: 2500, priceLow: 2000, priceHigh: 3000, sourceName: "GRUTH Field Survey", sourceUrl: "https://gruth.ke" },
  { materialName: "Crusher Run",   priceKes: 3000, priceLow: 2600, priceHigh: 3400, sourceName: "GRUTH Field Survey", sourceUrl: "https://gruth.ke" },
  { materialName: "Building Sand", priceKes: 3200, priceLow: 2800, priceHigh: 3800, sourceName: "GRUTH Field Survey", sourceUrl: "https://gruth.ke" },
];
