// src/app/constants/quote-calculator.ts
// All static constants for the QuoteCalculator component.
// Keeping them here ensures the component file stays focused on UI logic.

// ─── Currency ──────────────────────────────────────────────────────────────────

export type CurrencyCode = "USD" | "EUR" | "KES";

export const RATES: Record<CurrencyCode, number> = {
  USD: 1,
  EUR: 0.92,
  KES: 130,
};

export function fmt(n: number, currency: CurrencyCode): string {
  const v = Math.round(n * RATES[currency]);
  if (currency === "KES") return `KSh ${v.toLocaleString("en-KE")}`;
  if (currency === "EUR") return `€${v.toLocaleString("en-US")}`;
  return `$${v.toLocaleString("en-US")}`;
}

// ─── Services ─────────────────────────────────────────────────────────────────

export const SERVICE_TYPES = [
  {
    value: "construction",
    label: "Construction Verification",
    base: [150, 400] as [number, number],
  },
  {
    value: "land",
    label: "Land & Property",
    base: [120, 280] as [number, number],
  },
  {
    value: "wedding",
    label: "Wedding & Events",
    base: [100, 220] as [number, number],
  },
  {
    value: "business",
    label: "Business Investment",
    base: [160, 400] as [number, number],
  },
  {
    value: "materials",
    label: "Material Pricing Audit",
    base: [80, 180] as [number, number],
  },
] as const;

export type ServiceValue = (typeof SERVICE_TYPES)[number]["value"];

// ─── Location ─────────────────────────────────────────────────────────────────

export const COUNTIES = [
  { value: "nairobi", label: "Nairobi", travel: 0 },
  { value: "mombasa", label: "Mombasa", travel: 30 },
  { value: "kisumu", label: "Kisumu", travel: 35 },
  { value: "nakuru", label: "Nakuru", travel: 20 },
  { value: "eldoret", label: "Eldoret", travel: 28 },
  { value: "nyeri", label: "Nyeri", travel: 24 },
  { value: "machakos", label: "Machakos", travel: 16 },
  { value: "kisii", label: "Kisii", travel: 32 },
  { value: "other", label: "Remote / Other", travel: 50 },
] as const;

export type CountyValue = (typeof COUNTIES)[number]["value"];

// ─── Urgency ──────────────────────────────────────────────────────────────────

export const URGENCY = [
  {
    value: "standard",
    label: "Standard",
    sub: "48-hour turnaround",
    surcharge: 0,
  },
  {
    value: "priority",
    label: "Priority",
    sub: "24-hour turnaround",
    surcharge: 40,
  },
] as const;

export type UrgencyValue = (typeof URGENCY)[number]["value"];

// ─── Size options (context-aware) ─────────────────────────────────────────────

export interface SizeOption {
  value: string;
  label: string;
  desc: string;
  multiplier: number;
}

export const CONSTRUCTION_STAGES: SizeOption[] = [
  {
    value: "foundation",
    label: "Foundation / Slab",
    desc: "Earthworks, concrete & early structure",
    multiplier: 1.0,
  },
  {
    value: "shell",
    label: "Shell / Walling",
    desc: "Brickwork, columns & roofing stage",
    multiplier: 1.4,
  },
  {
    value: "fitout",
    label: "Full Fit-out",
    desc: "Plastering, finishes & completion",
    multiplier: 1.9,
  },
];

export const LAND_SIZES: SizeOption[] = [
  {
    value: "plot",
    label: "Single Plot",
    desc: "Up to ½ acre residential",
    multiplier: 1.0,
  },
  {
    value: "parcel",
    label: "Land Parcel",
    desc: "1–5 acres, title deed check",
    multiplier: 1.5,
  },
  {
    value: "tract",
    label: "Large Tract",
    desc: "5+ acres or commercial land",
    multiplier: 2.0,
  },
];

export const DEFAULT_SIZES: SizeOption[] = [
  {
    value: "small",
    label: "Small",
    desc: "Single vendor / 1-day event",
    multiplier: 1.0,
  },
  {
    value: "medium",
    label: "Medium",
    desc: "Multi-vendor / 2–3 days",
    multiplier: 1.4,
  },
  {
    value: "large",
    label: "Large",
    desc: "Complex / multi-location",
    multiplier: 1.9,
  },
];

export const SIZE_SERVICES: ServiceValue[] = [
  "construction",
  "land",
  "business",
];

export function getSizeOptions(service: ServiceValue): SizeOption[] {
  if (service === "construction") return CONSTRUCTION_STAGES;
  if (service === "land") return LAND_SIZES;
  return DEFAULT_SIZES;
}

export function getSizeLabel(service: ServiceValue): string {
  if (service === "construction") return "Construction Stage";
  if (service === "land") return "Land / Plot Size";
  return "Project Scale";
}

// ─── Add-ons ──────────────────────────────────────────────────────────────────

export const ADDONS = [
  { value: "drone", label: "Drone Footage", price: 45 },
  { value: "lab", label: "Material Lab Testing", price: 80 },
  { value: "extra", label: "Extra Site Visit", price: 60 },
  { value: "video", label: "Video Evidence Package", price: 35 },
] as const;

export type AddonValue = (typeof ADDONS)[number]["value"];

// ─── Estimate types ───────────────────────────────────────────────────────────

export interface EstimateRow {
  label: string;
  low: number;
  high: number;
}

export interface Estimate {
  low: number;
  high: number;
  breakdown: EstimateRow[];
}
