// src/app/api/scrape/route.ts
// POST /api/scrape
// Runs the full scraper pipeline and upserts results into the DB.
// Protected by CRON_SECRET to prevent public invocation.
// Called by Vercel Cron (vercel.json) or a Docker cron job.

import { NextRequest, NextResponse } from "next/server";
import { prisma }       from "@/lib/prisma";
import { runScrapers }  from "@/server/scraper/runScrapers";
import { detectTrend }  from "@/lib/market-intelligence";
import type { NormalisedPrice } from "@/server/scraper/types";

export const runtime    = "nodejs";
export const maxDuration = 60; // seconds — scraping takes time

// ─── Auth ─────────────────────────────────────────────────────────────────────

function isAuthorised(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;

  // Vercel Cron sends the secret as a Bearer token
  const auth = req.headers.get("authorization");
  if (auth === `Bearer ${secret}`) return true;

  // Alternative: x-cron-secret header for Docker cron jobs
  const headerSecret = req.headers.get("x-cron-secret");
  if (headerSecret === secret) return true;

  return false;
}

// ─── Upsert logic ─────────────────────────────────────────────────────────────

async function upsertPrices(
  prices: NormalisedPrice[],
  countyId: string,
): Promise<{ upserted: number; skipped: number }> {
  let upserted = 0;
  let skipped  = 0;

  for (const p of prices) {
    try {
      // 1. Upsert the material (name is unique)
      const material = await prisma.marketMaterial.upsert({
        where:  { name: p.materialName },
        create: {
          name:     p.materialName,
          category: p.category,
          unit:     p.unit,
        },
        update: {
          // Don't overwrite manually-set descriptions
          category: p.category,
          unit:     p.unit,
        },
      });

      // 2. Upsert the price source
      const source = await prisma.marketPriceSource.upsert({
        where:  { name: p.sourceName },
        create: { name: p.sourceName, url: p.sourceUrl, verified: false },
        update: { url: p.sourceUrl },
      });

      // 3. Get existing price for trend detection
      const existing = await prisma.countyMaterialPrice.findFirst({
        where: { materialId: material.id, countyId },
        orderBy: { updatedAt: "desc" },
      });

      const trend = existing
        ? detectTrend(existing.priceKes, p.priceKes)
        : "STABLE";

      // 4. Upsert the county price (unique on materialId+countyId+sourceId)
      await prisma.countyMaterialPrice.upsert({
        where: {
          materialId_countyId_sourceId: {
            materialId: material.id,
            countyId,
            sourceId: source.id,
          },
        },
        create: {
          materialId: material.id,
          countyId,
          sourceId:   source.id,
          priceKes:   p.priceKes,
          priceLow:   p.priceLow  ?? null,
          priceHigh:  p.priceHigh ?? null,
          trend,
          scrapedUrl: p.sourceUrl,
          scrapedAt:  new Date(p.scrapedAt),
        },
        update: {
          priceKes:   p.priceKes,
          priceLow:   p.priceLow  ?? null,
          priceHigh:  p.priceHigh ?? null,
          trend,
          scrapedUrl: p.sourceUrl,
          scrapedAt:  new Date(p.scrapedAt),
        },
      });

      upserted++;
    } catch (err) {
      console.error(`[scrape/upsert] failed for "${p.materialName}":`, err);
      skipped++;
    }
  }

  return { upserted, skipped };
}

// ─── Route handler ────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  if (!isAuthorised(req)) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  // Optionally scope to a specific county via query param.
  // Defaults to Nairobi (the most price-representative county).
  const countyName =
    req.nextUrl.searchParams.get("county") ?? "Nairobi";

  const county = await prisma.county.findFirst({
    where: { name: { contains: countyName, mode: "insensitive" } },
  });

  if (!county) {
    return NextResponse.json(
      { error: `County "${countyName}" not found in DB` },
      { status: 404 }
    );
  }

  // Run all scrapers
  const { prices, errors, runAt, durationMs } = await runScrapers();

  if (prices.length === 0) {
    return NextResponse.json(
      { success: false, errors, message: "All scrapers returned 0 prices" },
      { status: 502 }
    );
  }

  // Upsert into DB
  const { upserted, skipped } = await upsertPrices(prices, county.id);

  const summary = {
    success:     true,
    runAt,
    county:      county.name,
    scraped:     prices.length,
    upserted,
    skipped,
    errors,
    durationMs,
  };

  console.log("[scrape] complete:", summary);
  return NextResponse.json(summary);
}

// Also support GET for Vercel Cron (which sends GET requests)
export async function GET(req: NextRequest) {
  return POST(req);
}
