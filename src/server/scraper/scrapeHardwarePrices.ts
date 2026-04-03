// src/server/scraper/scrapeHardwarePrices.ts
import type { RawScrapedPrice } from "./types";

const SOURCE_NAME = "Kenya Hardware Suppliers Index";
const SOURCE_URL  = "https://www.builderskenya.com/price-guide/hardware";
const PRICE_PATTERN = /([A-Za-z0-9\s\(\)&\-\/]+?)\s+(?:KES|KSh|Ksh)[\s]?([\d,]+(?:\.\d{1,2})?)/gi;

function parseKes(r: string) { return parseFloat(r.replace(/,/g, "").trim()); }

export async function scrapeHardwarePrices(): Promise<RawScrapedPrice[]> {
  try {
    const res = await fetch(SOURCE_URL, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; GRUTHBot/1.0; +https://gruth.ke/bot)" },
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) return HARDWARE_BASELINE.map(p => ({ ...p, scrapedAt: new Date().toISOString() }));
    const html = await res.text();
    const results: RawScrapedPrice[] = [];
    const scrapedAt = new Date().toISOString();
    let m: RegExpExecArray | null;
    PRICE_PATTERN.lastIndex = 0;
    while ((m = PRICE_PATTERN.exec(html)) !== null) {
      const n = m[1].trim().replace(/\s+/g, " ");
      const p = parseKes(m[2]);
      if (n.length < 5 || isNaN(p) || p <= 0 || p > 300_000) continue;
      results.push({ materialName: n, priceKes: p, sourceName: SOURCE_NAME, sourceUrl: SOURCE_URL, scrapedAt });
    }
    return results.length > 0 ? results : HARDWARE_BASELINE.map(p => ({ ...p, scrapedAt }));
  } catch {
    return HARDWARE_BASELINE.map(p => ({ ...p, scrapedAt: new Date().toISOString() }));
  }
}

const HARDWARE_BASELINE: Omit<RawScrapedPrice, "scrapedAt">[] = [
  { materialName: "PVC Pipe 4 inch (6m)",          priceKes: 1400, priceLow: 1200, priceHigh: 1600, sourceName: "GRUTH Field Survey", sourceUrl: "https://gruth.ke" },
  { materialName: "GI Pipe 1 inch (6m)",           priceKes: 2200, priceLow: 1900, priceHigh: 2500, sourceName: "GRUTH Field Survey", sourceUrl: "https://gruth.ke" },
  { materialName: "PPR Pipe 20mm (4m)",             priceKes: 580,  priceLow: 480,  priceHigh: 680,  sourceName: "GRUTH Field Survey", sourceUrl: "https://gruth.ke" },
  { materialName: "Door Hinges 4 inch (pair)",      priceKes: 180,  priceLow: 140,  priceHigh: 220,  sourceName: "GRUTH Field Survey", sourceUrl: "https://gruth.ke" },
  { materialName: "Padlock 60mm",                   priceKes: 650,  priceLow: 500,  priceHigh: 800,  sourceName: "GRUTH Field Survey", sourceUrl: "https://gruth.ke" },
  { materialName: "Electrical Cable 2.5mm (50m)",   priceKes: 3800, priceLow: 3400, priceHigh: 4200, sourceName: "GRUTH Field Survey", sourceUrl: "https://gruth.ke" },
  { materialName: "MCB Circuit Breaker 20A",        priceKes: 420,  priceLow: 350,  priceHigh: 500,  sourceName: "GRUTH Field Survey", sourceUrl: "https://gruth.ke" },
];
