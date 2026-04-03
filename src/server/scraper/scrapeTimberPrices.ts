// src/server/scraper/scrapeTimberPrices.ts
import type { RawScrapedPrice } from "./types";

const SOURCE_NAME = "Kenya Timber Merchants Association";
const SOURCE_URL  = "https://www.builderskenya.com/price-guide/timber";
const PRICE_PATTERN = /([A-Za-z0-9\s\(\)&\-\/x]+?)\s+(?:KES|KSh|Ksh)[\s]?([\d,]+(?:\.\d{1,2})?)/gi;

function parseKes(r: string) { return parseFloat(r.replace(/,/g, "").trim()); }

export async function scrapeTimberPrices(): Promise<RawScrapedPrice[]> {
  try {
    const res = await fetch(SOURCE_URL, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; GRUTHBot/1.0; +https://gruth.ke/bot)" },
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) return TIMBER_BASELINE.map(p => ({ ...p, scrapedAt: new Date().toISOString() }));
    const html = await res.text();
    const results: RawScrapedPrice[] = [];
    const scrapedAt = new Date().toISOString();
    let m: RegExpExecArray | null;
    PRICE_PATTERN.lastIndex = 0;
    while ((m = PRICE_PATTERN.exec(html)) !== null) {
      const n = m[1].trim().replace(/\s+/g, " ");
      const p = parseKes(m[2]);
      if (n.length < 5 || isNaN(p) || p <= 0 || p > 500_000) continue;
      results.push({ materialName: n, priceKes: p, sourceName: SOURCE_NAME, sourceUrl: SOURCE_URL, scrapedAt });
    }
    return results.length > 0 ? results : TIMBER_BASELINE.map(p => ({ ...p, scrapedAt }));
  } catch {
    return TIMBER_BASELINE.map(p => ({ ...p, scrapedAt: new Date().toISOString() }));
  }
}

const TIMBER_BASELINE: Omit<RawScrapedPrice, "scrapedAt">[] = [
  { materialName: "3x2 Timber (12ft)",      priceKes: 320,  priceLow: 280,  priceHigh: 360,  sourceName: "GRUTH Field Survey", sourceUrl: "https://gruth.ke" },
  { materialName: "2x2 Timber (12ft)",      priceKes: 220,  priceLow: 190,  priceHigh: 250,  sourceName: "GRUTH Field Survey", sourceUrl: "https://gruth.ke" },
  { materialName: "4x2 Timber (12ft)",      priceKes: 480,  priceLow: 420,  priceHigh: 540,  sourceName: "GRUTH Field Survey", sourceUrl: "https://gruth.ke" },
  { materialName: "Marine Plywood (18mm)",  priceKes: 3800, priceLow: 3400, priceHigh: 4200, sourceName: "GRUTH Field Survey", sourceUrl: "https://gruth.ke" },
  { materialName: "Fascia Board (4m)",       priceKes: 380,  priceLow: 320,  priceHigh: 440,  sourceName: "GRUTH Field Survey", sourceUrl: "https://gruth.ke" },
  { materialName: "Ridging (8ft)",           priceKes: 260,  priceLow: 220,  priceHigh: 300,  sourceName: "GRUTH Field Survey", sourceUrl: "https://gruth.ke" },
];
