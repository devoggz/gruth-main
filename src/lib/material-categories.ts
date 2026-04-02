// src/lib/material-categories.ts
// Single source of truth for all material categories.
// The UI, scraper pipeline, and ingestion all import from here.
// Order here is the order rendered in MarketPricesClient.

export interface MaterialCategory {
  /** Display name — must match the `category` column in market_materials */
  name: string;
  /** URL-safe slug for filtering / analytics */
  slug: string;
  /** Canonical material names that belong to this category */
  items: string[];
}

export const MATERIAL_CATEGORIES: MaterialCategory[] = [
  {
    name: "Cement & Concrete",
    slug: "cement-concrete",
    items: [
      "Bamburi Cement 50kg",
      "Savannah Cement 50kg",
      "East African Portland Cement",
      "Ballast (20mm)",
      "Concrete Blocks 6 inch",
      "Concrete Blocks 9 inch",
      "Precast Lintels (1.5m)",
    ],
  },
  {
    name: "Steel & Metal",
    slug: "steel-metal",
    items: [
      "Y8 Steel Rebar (6m)",
      "Y10 Steel Rebar (6m)",
      "Y12 Steel Rebar (6m)",
      "Y16 Steel Rebar (6m)",
      "Y20 Steel Rebar (6m)",
      "BRC Mesh A142",
      "Iron Sheets (28 gauge 8ft)",
      "Iron Sheets (30 gauge 8ft)",
      "Galvanised Nails 4 inch",
      "Roofing Nails 3 inch",
    ],
  },
  {
    name: "Sand & Aggregates",
    slug: "sand-aggregates",
    items: [
      "River Sand",
      "Quarry Dust",
      "Hardcore",
      "Crusher Run",
      "Building Sand",
    ],
  },
  {
    name: "Timber & Roofing",
    slug: "timber-roofing",
    items: [
      "3x2 Timber (12ft)",
      "2x2 Timber (12ft)",
      "4x2 Timber (12ft)",
      "Marine Plywood (18mm)",
      "Fascia Board (4m)",
      "Ridging (8ft)",
    ],
  },
  {
    name: "Finishes & Paint",
    slug: "finishes-paint",
    items: [
      "Crown Wall Paint 20L",
      "Sadolin Floor Paint 20L",
      "Tile Adhesive 20kg",
      "Tiles 60x60cm (Ceramic)",
      "Tiles 30x30cm (Anti-slip)",
      "Waterproofing Compound 5L",
      "Skim Coat / Finishing Plaster",
    ],
  },
  {
    name: "Hardware & Fixings",
    slug: "hardware-fixings",
    items: [
      "PVC Pipe 4 inch (6m)",
      "GI Pipe 1 inch (6m)",
      "PPR Pipe 20mm (4m)",
      "Door Hinges 4 inch (pair)",
      "Padlock 60mm",
      "Electrical Cable 2.5mm (50m)",
      "MCB Circuit Breaker 20A",
    ],
  },
];

/** Ordered category names — use this for filtering and rendering */
export const CATEGORY_NAMES = MATERIAL_CATEGORIES.map((c) => c.name);

/** Set of all valid category name strings for fast O(1) lookup */
export const CATEGORY_NAME_SET = new Set(CATEGORY_NAMES);

/** Lookup a category definition by its slug */
export function getCategoryBySlug(slug: string): MaterialCategory | undefined {
  return MATERIAL_CATEGORIES.find((c) => c.slug === slug);
}

/** Lookup a category definition by its display name */
export function getCategoryByName(name: string): MaterialCategory | undefined {
  return MATERIAL_CATEGORIES.find((c) => c.name === name);
}
