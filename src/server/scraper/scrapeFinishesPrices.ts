// src/server/scraper/scrapeFinishesPrices.ts
import type { RawScrapedPrice } from "./types";

const SOURCE_NAME = "Kenya Paint & Finishes Index";
const SOURCE_URL  = "https://www.builderskenya.com/price-guide/finishes";
const PRICE_PATTERN = /([A-Za-z0-9\s\(\)&\-\/]+?)\s+(?:KES|KSh|Ksh)[\s]?([\d,]+(?:\.\d{1,2})?)/gi;

function parseKes(r: string) { return parseFloat(r.replace(/,/g, "").trim()); }

export async function scrapeFinishesPrices(): Promise<RawScrapedPrice[]> {
  try {
    const res = await fetch(SOURCE_URL, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; GRUTHBot/1.0; +https://gruth.ke/bot)" },
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) return FINISHES_BASELINE.map(p => ({ ...p, scrapedAt: new Date().toISOString() }));
    const html = await res.text();
    const results: RawScrapedPrice[] = [];
    const scrapedAt = new Date().toISOString();
    let m: RegExpExecArray | null;
    PRICE_PATTERN.lastIndex = 0;
    while ((m = PRICE_PATTERN.exec(html)) !== null) {
      const n = m[1].trim().replace(/\s+/g, " ");
      const p = parseKes(m[2]);
      if (n.length < 5 || isNaN(p) || p <= 0 || p > 200_000) continue;
      results.push({ materialName: n, priceKes: p, sourceName: SOURCE_NAME, sourceUrl: SOURCE_URL, scrapedAt });
    }
    return results.length > 0 ? results : FINISHES_BASELINE.map(p => ({ ...p, scrapedAt }));
  } catch {
    return FINISHES_BASELINE.map(p => ({ ...p, scrapedAt: new Date().toISOString() }));
  }
}

const FINISHES_BASELINE: Omit<RawScrapedPrice, "scrapedAt">[] = [
  { materialName: "Crown Wall Paint 20L",          priceKes: 3800, priceLow: 3400, priceHigh: 4200, sourceName: "GRUTH Field Survey", sourceUrl: "https://gruth.ke" },
  { materialName: "Sadolin Floor Paint 20L",       priceKes: 5200, priceLow: 4800, priceHigh: 5800, sourceName: "GRUTH Field Survey", sourceUrl: "https://gruth.ke" },
  { materialName: "Tile Adhesive 20kg",            priceKes: 980,  priceLow: 850,  priceHigh: 1100, sourceName: "GRUTH Field Survey", sourceUrl: "https://gruth.ke" },
  { materialName: "Tiles 60x60cm (Ceramic)",       priceKes: 1800, priceLow: 1400, priceHigh: 2200, sourceName: "GRUTH Field Survey", sourceUrl: "https://gruth.ke" },
  { materialName: "Tiles 30x30cm (Anti-slip)",     priceKes: 1400, priceLow: 1100, priceHigh: 1700, sourceName: "GRUTH Field Survey", sourceUrl: "https://gruth.ke" },
  { materialName: "Waterproofing Compound 5L",     priceKes: 1200, priceLow: 1000, priceHigh: 1500, sourceName: "GRUTH Field Survey", sourceUrl: "https://gruth.ke" },
  { materialName: "Skim Coat / Finishing Plaster", priceKes: 680,  priceLow: 580,  priceHigh: 780,  sourceName: "GRUTH Field Survey", sourceUrl: "https://gruth.ke" },
];
