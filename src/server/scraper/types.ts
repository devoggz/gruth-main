// src/server/scraper/types.ts
// Shared types for the scraper pipeline.
// All scrapers return RawScrapedPrice[]; the ingestion layer normalises.

export interface RawScrapedPrice {
  /** Raw name as it appears on the source page */
  materialName: string;
  /** Price in KES as a number (already parsed from string) */
  priceKes: number;
  /** Optional low-end of range */
  priceLow?: number;
  /** Optional high-end of range */
  priceHigh?: number;
  /** Display name of the source */
  sourceName: string;
  /** URL of the source page that was scraped */
  sourceUrl: string;
  /** ISO string — set to now() by the scraper */
  scrapedAt: string;
}

export interface NormalisedPrice extends RawScrapedPrice {
  /** Canonical category assigned by categorizeMaterial() */
  category: string;
  /** Normalised unit string (e.g. "per bag", "per tonne") */
  unit: string;
}
