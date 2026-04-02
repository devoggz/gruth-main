// src/lib/categorizeMaterial.ts
// Maps a raw scraped or user-submitted material name → canonical category.
// Used by the ingestion pipeline before writing to the DB.
// Deterministic: same input always returns same output.
// Extend KEYWORD_MAP to add new categories without touching existing logic.

import { CATEGORY_NAME_SET } from "./material-categories";

// ─── Keyword map ──────────────────────────────────────────────────────────────
// Order matters: first match wins. Put the most specific entries first
// when there is ambiguity (e.g. "roofing nails" should match Steel, not Timber).

const KEYWORD_MAP: Array<{ keywords: string[]; category: string }> = [
  // ── Cement & Concrete ──────────────────────────────────────────────────────
  {
    keywords: [
      "cement",
      "concrete",
      "ballast",
      "block",
      "lintel",
      "pozzolana",
      "opc",
      "portland",
      "precast",
    ],
    category: "Cement & Concrete",
  },

  // ── Steel & Metal ──────────────────────────────────────────────────────────
  // "roofing nails" before "roofing" so nails don't fall into Timber & Roofing
  {
    keywords: [
      "rebar",
      "steel",
      "brc mesh",
      "iron sheet",
      "gi sheet",
      "roofing nail",
      "galvanised nail",
      "nails",
      "mesh",
      "angle iron",
      "hollow section",
      "channel bar",
      "binding wire",
    ],
    category: "Steel & Metal",
  },

  // ── Sand & Aggregates ──────────────────────────────────────────────────────
  {
    keywords: [
      "sand",
      "aggregate",
      "hardcore",
      "quarry dust",
      "crusher run",
      "gravel",
      "fill",
      "sub-base",
      "murram",
    ],
    category: "Sand & Aggregates",
  },

  // ── Timber & Roofing ──────────────────────────────────────────────────────
  // NOTE: "roofing" keyword comes AFTER Steel so iron sheets don't land here
  {
    keywords: [
      "timber",
      "plywood",
      "fascia",
      "ridging",
      "purlin",
      "truss",
      "board",
      "batten",
      "softwood",
      "hardwood",
      "roofing",
      "roof",
    ],
    category: "Timber & Roofing",
  },

  // ── Finishes & Paint ──────────────────────────────────────────────────────
  {
    keywords: [
      "paint",
      "tile",
      "adhesive",
      "plaster",
      "skim",
      "waterproof",
      "emulsion",
      "varnish",
      "primer",
      "sealer",
      "grout",
      "floor coat",
      "wall coat",
    ],
    category: "Finishes & Paint",
  },

  // ── Hardware & Fixings ────────────────────────────────────────────────────
  {
    keywords: [
      "pipe",
      "hinge",
      "padlock",
      "cable",
      "mcb",
      "breaker",
      "fitting",
      "valve",
      "tap",
      "socket",
      "switch",
      "conduit",
      "pvc",
      "gi pipe",
      "ppr",
      "bolt",
      "screw",
      "nut",
      "washer",
      "lock",
    ],
    category: "Hardware & Fixings",
  },
];

// ─── Main function ────────────────────────────────────────────────────────────

/**
 * Returns the canonical category name for a raw material name.
 * If the raw name already IS a valid category (e.g. data came from the DB),
 * it is returned as-is. Otherwise, keyword matching is performed.
 * Falls back to "Other" if no match found.
 */
export function categorizeMaterial(rawName: string): string {
  const normalised = rawName.trim().toLowerCase();

  // Fast path: already a valid category name
  if (CATEGORY_NAME_SET.has(rawName.trim())) return rawName.trim();

  for (const { keywords, category } of KEYWORD_MAP) {
    if (keywords.some((kw) => normalised.includes(kw.toLowerCase()))) {
      return category;
    }
  }

  return "Other";
}

/**
 * Batch version — categorise an array of names in one call.
 */
export function categorizeMaterials(
  rawNames: string[],
): Record<string, string> {
  return Object.fromEntries(
    rawNames.map((name) => [name, categorizeMaterial(name)]),
  );
}
