// src/app/api/market-prices/route.ts
// GET /api/market-prices?countyId=xxx
// Returns all county-level market prices for a given county,
// grouped by material category, with source and trend data.

import { prisma } from "@/lib/prisma";
import { PriceTrend } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export interface MarketPriceRow {
  id: string;
  materialId: string;
  materialName: string;
  category: string;
  unit: string;
  priceKes: number;
  priceLow: number | null;
  priceHigh: number | null;
  sourceName: string;
  sourceUrl: string | null;
  updatedAt: Date;
  trend: PriceTrend;
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  const countyId = req.nextUrl.searchParams.get("countyId");

  if (!countyId) {
    return NextResponse.json(
      { error: "countyId query parameter is required" },
      { status: 400 },
    );
  }

  const county = await prisma.county.findUnique({
    where: { id: countyId },
    select: { id: true },
  });

  if (!county) {
    return NextResponse.json({ error: "County not found" }, { status: 404 });
  }

  const prices = await prisma.countyMaterialPrice.findMany({
    where: {
      countyId,
      // Only return verified prices in the public API.
      // Supplier submissions (verified: false) are hidden until admin approves.
      verified: true,
    },
    include: {
      material: true,
      source: true,
    },
    orderBy: [{ material: { category: "asc" } }, { material: { name: "asc" } }],
  });

  const rows: MarketPriceRow[] = prices.map((p) => {
    // Cast to any to handle cases where the generated Prisma client
    // predates a db push that added priceLow / priceHigh columns.
    const raw = p as any;
    return {
      id: p.id,
      materialId: p.materialId,
      materialName: p.material.name,
      category: p.material.category,
      unit: p.material.unit,
      priceKes: p.priceKes,
      priceLow: raw.priceLow ?? null,
      priceHigh: raw.priceHigh ?? null,
      sourceName: p.source?.name ?? "GRUTH Field Survey",
      sourceUrl: p.source?.url ?? null,
      updatedAt: p.updatedAt,
      trend: p.trend,
    };
  });

  return NextResponse.json(rows);
}
