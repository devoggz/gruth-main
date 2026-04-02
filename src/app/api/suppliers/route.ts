// src/app/api/suppliers/route.ts
// POST /api/suppliers — public supplier price submission endpoint.
// Submissions are stored as UNVERIFIED and reviewed by admin before going live.
// Rate-limited by IP via a simple in-memory store (upgrade to Upstash for prod).

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { categorizeMaterial } from "@/lib/categorizeMaterial";

// ─── Rate limiting ────────────────────────────────────────────────────────────
// Simple in-memory store: 5 submissions per IP per 10 minutes.
// Replace with Upstash Redis for multi-instance deployments.

const rateLimitMap = new Map<string, { count: number; windowStart: number }>();
const LIMIT = 5;
const WINDOW = 10 * 60 * 1000; // 10 minutes in ms

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now - record.windowStart > WINDOW) {
    rateLimitMap.set(ip, { count: 1, windowStart: now });
    return false;
  }

  if (record.count >= LIMIT) return true;

  record.count++;
  return false;
}

// ─── Schema ───────────────────────────────────────────────────────────────────

const SubmissionSchema = z
  .object({
    /** Supplier's business name */
    supplierName: z.string().min(2).max(120),
    /** County where the price was observed */
    county: z.string().min(2).max(80),
    /** Material name — will be categorized automatically */
    materialName: z.string().min(3).max(120),
    /** Price in KES */
    priceKes: z.number().int().positive().max(10_000_000),
    /** Optional lower bound */
    priceLow: z.number().int().positive().optional(),
    /** Optional upper bound */
    priceHigh: z.number().int().positive().optional(),
    /** Optionally override the inferred unit */
    unit: z.string().max(30).optional(),
    /** Where the submitter observed this price */
    sourceUrl: z.string().url().optional(),
    /** Contact for verification follow-up */
    contactEmail: z.string().email().optional(),
  })
  .refine((d) => !d.priceLow || !d.priceHigh || d.priceLow <= d.priceHigh, {
    message: "priceLow must be ≤ priceHigh",
    path: ["priceLow"],
  });

// ─── Route ────────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  // 1. Rate limit
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";

  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Too many submissions. Please try again later." },
      { status: 429 },
    );
  }

  // 2. Parse + validate
  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = SubmissionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten() },
      { status: 422 },
    );
  }

  const d = parsed.data;

  // 3. Resolve county
  const county = await prisma.county.findFirst({
    where: { name: { contains: d.county.trim(), mode: "insensitive" } },
    select: { id: true, name: true },
  });

  if (!county) {
    return NextResponse.json(
      { error: `County "${d.county}" not found.` },
      { status: 404 },
    );
  }

  // 4. Categorize the material
  const category = categorizeMaterial(d.materialName);

  // 5. Upsert material
  const material = await prisma.marketMaterial.upsert({
    where: { name: d.materialName.trim() },
    create: {
      name: d.materialName.trim(),
      category,
      unit: d.unit ?? "per unit",
    },
    update: {},
  });

  // 6. Create or find the supplier as a price source
  const source = await prisma.marketPriceSource.upsert({
    where: { name: d.supplierName.trim() },
    create: {
      name: d.supplierName.trim(),
      url: d.sourceUrl ?? null,
      county: county.name,
      verified: false, // requires admin review
    },
    update: { url: d.sourceUrl ?? undefined },
  });

  // 7. Create the price entry (UNVERIFIED — won't appear in public UI until admin approves)
  // We use create here (not upsert) so each submission is individually reviewable.
  await prisma.countyMaterialPrice.create({
    data: {
      materialId: material.id,
      countyId: county.id,
      sourceId: source.id,
      priceKes: d.priceKes,
      priceLow: d.priceLow ?? null,
      priceHigh: d.priceHigh ?? null,
      trend: "STABLE",
      notes: `Submitted by ${d.supplierName}${d.contactEmail ? ` (${d.contactEmail})` : ""}`,
      scrapedUrl: d.sourceUrl ?? null,
      scrapedAt: new Date(),
    },
  });

  return NextResponse.json(
    {
      success: true,
      message:
        "Thank you — your submission will be reviewed before going live.",
      category,
      county: county.name,
      material: d.materialName,
    },
    { status: 201 },
  );
}
