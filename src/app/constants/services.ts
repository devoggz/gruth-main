// src/app/constants/services.ts
// Single source of truth for all GRUTH service definitions.
// Imported by: ServicesSection (homepage), ServicesPage (/services), QuoteCalculator, request form.

export interface Service {
  id: string;
  title: string;
  tagline: string;
  description: string;
  hero: string;
  image: string;
  accent: string;
  // Desktop bento layout
  desktopSpan: string;
  // /services detail page
  what: string[];
  deliverable: string;
  ideal: string;
}

export const SERVICES: Service[] = [
  {
    id: "construction",
    title: "Construction Verification",
    tagline: "See exactly what's been built",
    description:
      "We visit your site and document every stage — foundations, materials, structural work — and verify it matches the plan. No more guessing from blurry WhatsApp photos.",
    image: "/images/hero-one.avif",
    hero: "/images/hero-one.avif",
    accent: "from-orange-950/80",
    desktopSpan: "lg:col-span-2 lg:row-span-2",
    what: [
      "Stage-by-stage site visit with timestamped photos",
      "Materials check — brand, quantity, and grade",
      "Structural compliance vs. approved plan",
      "Contractor progress report with GPS coordinates",
    ],
    deliverable:
      "Full photo + narrative PDF report delivered within 48 hours of inspection.",
    ideal:
      "Diaspora homebuilders, property developers, and families funding construction remotely.",
  },

  {
    id: "land",
    title: "Land & Property",
    tagline: "Verify before you transfer",
    description:
      "Boundaries, title deeds, encumbrances, and current occupancy — all confirmed on the ground before any funds move.",
    image:
      "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=700&q=80",
    hero: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1400&q=85",
    accent: "from-emerald-950/80",
    desktopSpan: "lg:col-span-1 lg:row-span-1",
    what: [
      "Physical boundary walk and GPS mapping",
      "Title deed cross-check with land registry records",
      "Occupancy and caretaker status confirmed",
      "Adjacent dispute or encumbrance check",
    ],
    deliverable:
      "Boundary map, photo evidence, and a written ownership status report.",
    ideal:
      "Anyone purchasing land in Kenya from abroad — residential, agricultural, or investment plots.",
  },

  {
    id: "events",
    title: "Events",
    tagline: "Your moment, witnessed",
    description:
      "Weddings, funerals, graduations, family gatherings — we place a trusted agent on the ground to monitor, document, and relay your most important moments in real time.",
    image: "/images/event.jpg",
    hero: "/images/event.jpg",
    accent: "from-rose-950/80",
    desktopSpan: "lg:col-span-1 lg:row-span-1",
    what: [
      "Weddings — venue, vendors, décor, and logistics verified before the day",
      "Funerals — dignified, discreet documentation and family updates",
      "Graduations — live attendance confirmation and ceremony coverage",
      "Family gatherings — presence and participation verified with photos",
      "Same-day photo and video updates sent directly to family abroad",
    ],
    deliverable:
      "Event readiness report pre-event + a photo/video summary delivered same day.",
    ideal:
      "Diaspora families who cannot be present but need assurance their most important milestones are witnessed, honoured, and documented.",
  },

  {
    id: "business",
    title: "Business Investment",
    tagline: "Due diligence, done right",
    description:
      "We verify that a business exists, operates as described, and matches the pitch — inventory, staff, premises, and all — before you commit capital.",
    image: "/images/nairobi.avif",
    hero: "/images/nairobi.avif",
    accent: "from-blue-950/80",
    desktopSpan: "lg:col-span-2 lg:row-span-1",
    what: [
      "Premises visit — location, size, and condition confirmed",
      "Operational verification — staff, stock, and activity",
      "Cross-check against business registration documents",
      "Investor pitch vs. on-the-ground reality report",
    ],
    deliverable:
      "Business verification report with photos, observations, and a factual summary.",
    ideal:
      "Diaspora investors evaluating SMEs, shops, farms, or franchise opportunities in Kenya.",
  },

  {
    id: "materials",
    title: "Material Pricing Audit",
    tagline: "Real prices, real time",
    description:
      "Live verified pricing from local markets — cement, steel, timber, and more — so you're never overcharged by contractors working from inflated quotes.",
    image: "/images/chuma.avif",
    hero: "/images/chuma.avif",
    accent: "from-amber-950/80",
    desktopSpan: "lg:col-span-1 lg:row-span-1",
    what: [
      "Live pricing from 3+ local suppliers per material",
      "Cement, steel, timber, roofing, and finishing materials",
      "Comparison vs. contractor invoice line items",
      "Overcharge flags with documented evidence",
    ],
    deliverable:
      "Itemised pricing report with supplier receipts and a contractor comparison table.",
    ideal:
      "Anyone managing a construction project remotely who wants to eliminate contractor overcharging.",
  },
];

// Convenience: service titles for select dropdowns (e.g. request form, quote calculator)
export const SERVICE_TITLES = SERVICES.map((s) => s.title);

// Lookup by id
export function getServiceById(id: string): Service | undefined {
  return SERVICES.find((s) => s.id === id);
}
