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

  // Confirm county exists
  const county = await prisma.county.findUnique({
    where: { id: countyId },
    select: { id: true },
  });

  if (!county) {
    return NextResponse.json({ error: "County not found" }, { status: 404 });
  }

  const prices = await prisma.countyMaterialPrice.findMany({
    where: { countyId },
    include: {
      material: true,
      source: true,
    },
    orderBy: [{ material: { category: "asc" } }, { material: { name: "asc" } }],
  });

  const rows: MarketPriceRow[] = prices.map((p) => ({
    id: p.id,
    materialId: p.materialId,
    materialName: p.material.name,
    category: p.material.category,
    unit: p.material.unit,
    priceKes: p.priceKes,
    priceLow: p.priceLow ?? null,
    priceHigh: p.priceHigh ?? null,
    sourceName: p.source?.name ?? "GRUTH Field Survey",
    sourceUrl: p.source?.url ?? null,
    updatedAt: p.updatedAt,
    trend: p.trend,
  }));

  return NextResponse.json(rows);
}
