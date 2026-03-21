// src/data/pricing.ts
// All prices in KES (Kenyan Shillings).
// USD indicative rates shown in UI — converted at ~130 KES/USD for display only.
// Paystack charges in KES; diaspora clients pay by card (USD/GBP/EUR accepted).

export interface ServicePricing {
  id:          string;
  name:        string;
  emoji:       string;
  description: string;
  baseKes:     number;   // base price in KES
  // Per-county surcharges applied on top of base (remote counties cost more)
  countyTier:  "major" | "secondary" | "remote" | "remote-plus";
}

// County tiers — surcharge added to base price
export const COUNTY_TIER_SURCHARGE: Record<ServicePricing["countyTier"], number> = {
  "major":       0,        // Nairobi, Mombasa, Kisumu, Nakuru, Eldoret, Kiambu
  "secondary":   2_000,    // County capitals with decent infrastructure
  "remote":      5_000,    // Harder to reach, inspector travel costs more
  "remote-plus": 10_000,   // Very remote — North Eastern, Turkana, Marsabit etc
};

export const COUNTY_TIERS: Record<string, ServicePricing["countyTier"]> = {
  // Major urban
  "Nairobi":        "major",
  "Mombasa":        "major",
  "Kisumu":         "major",
  "Nakuru":         "major",
  "Eldoret":        "major",
  "Kiambu":         "major",
  // Secondary
  "Machakos":       "secondary",
  "Nyeri":          "secondary",
  "Meru":           "secondary",
  "Embu":           "secondary",
  "Kisii":          "secondary",
  "Kakamega":       "secondary",
  "Bungoma":        "secondary",
  "Kitui":          "secondary",
  "Kajiado":        "secondary",
  "Narok":          "secondary",
  "Kericho":        "secondary",
  "Bomet":          "secondary",
  "Nandi":          "secondary",
  "Vihiga":         "secondary",
  "Busia":          "secondary",
  "Siaya":          "secondary",
  "Homa Bay":       "secondary",
  "Migori":         "secondary",
  "Nyamira":        "secondary",
  "Nyandarua":      "secondary",
  "Kirinyaga":      "secondary",
  "Murang'a":       "secondary",
  "Makueni":        "secondary",
  "Tharaka-Nithi":  "secondary",
  "Trans-Nzoia":    "secondary",
  "Laikipia":       "secondary",
  "Baringo":        "secondary",
  "Elgeyo-Marakwet":"secondary",
  "Kilifi":         "secondary",
  "Kwale":          "secondary",
  "Taita Taveta":   "secondary",
  // Remote
  "Isiolo":         "remote",
  "Samburu":        "remote",
  "West Pokot":     "remote",
  "Lamu":           "remote",
  "Tana River":     "remote",
  // Remote-plus (very hard to reach)
  "Turkana":        "remote-plus",
  "Marsabit":       "remote-plus",
  "Wajir":          "remote-plus",
  "Mandera":        "remote-plus",
  "Garissa":        "remote-plus",
};

export const SERVICES: ServicePricing[] = [
  {
    id:          "construction",
    name:        "Construction Verification",
    emoji:       "🏗️",
    description: "Site visit with photo/video evidence, material checks, progress vs plan report.",
    baseKes:     12_000,
    countyTier:  "major",
  },
  {
    id:          "land-property",
    name:        "Land & Property Verification",
    emoji:       "🏡",
    description: "Boundary confirmation, beacon check, title deed cross-reference, occupancy status.",
    baseKes:     15_000,
    countyTier:  "major",
  },
  {
    id:          "wedding-event",
    name:        "Wedding / Event Verification",
    emoji:       "💒",
    description: "On-ground agent for the event duration — real-time updates and photo/video relay.",
    baseKes:     18_000,
    countyTier:  "major",
  },
  {
    id:          "funeral-oversight",
    name:        "Funeral Event Oversight",
    emoji:       "🕊️",
    description: "Respectful on-ground presence, progress reporting and confirmation of arrangements.",
    baseKes:     14_000,
    countyTier:  "major",
  },
  {
    id:          "business-investment",
    name:        "Business & Investment Verification",
    emoji:       "📊",
    description: "Business premises visit, inventory check, staff confirmation, trading pattern review.",
    baseKes:     20_000,
    countyTier:  "major",
  },
  {
    id:          "material-pricing",
    name:        "Material Price Intelligence",
    emoji:       "🧱",
    description: "Verified market prices for specified materials from named suppliers in the county.",
    baseKes:     8_000,
    countyTier:  "major",
  },
  {
    id:          "other",
    name:        "Other / Custom",
    emoji:       "📋",
    description: "Bespoke verification — price confirmed after project brief review.",
    baseKes:     12_000,
    countyTier:  "major",
  },
];

// ─── Urgency surcharge ────────────────────────────────────────────────────────
export const URGENCY_SURCHARGE: Record<string, number> = {
  urgent:   5_000,   // 48-hour turnaround premium
  standard: 0,
  flexible: 0,
};

// ─── Helper ───────────────────────────────────────────────────────────────────
export function calculatePrice(params: {
  serviceId: string;
  county:    string;
  urgency:   string;
}): { baseKes: number; countySurcharge: number; urgencySurcharge: number; totalKes: number } {
  const service = SERVICES.find(s => s.id === params.serviceId)
    ?? SERVICES.find(s => s.name === params.serviceId)   // fallback: match by name
    ?? SERVICES.find(s => params.serviceId.toLowerCase().includes(s.id)); // fuzzy

  const baseKes         = service?.baseKes ?? 12_000;
  const tier            = COUNTY_TIERS[params.county] ?? "secondary";
  const countySurcharge = COUNTY_TIER_SURCHARGE[tier];
  const urgencySurcharge = URGENCY_SURCHARGE[params.urgency] ?? 0;
  const totalKes        = baseKes + countySurcharge + urgencySurcharge;

  return { baseKes, countySurcharge, urgencySurcharge, totalKes };
}

// Rough display conversion — not used for charging, only UI hints
export const KES_TO_USD = 130;
export const KES_TO_GBP = 104;
export const KES_TO_EUR = 113;
