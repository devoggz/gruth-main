// src/app/api/admin/market-prices/route.ts
// PATCH /api/admin/market-prices — approve or reject supplier price submissions.
// Admin only.

import { NextRequest, NextResponse } from "next/server";
import { auth }   from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z }      from "zod";

const Schema = z.object({
  priceId: z.string().cuid(),
  action:  z.enum(["approve", "reject"]),
});

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if ((session?.user as any)?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body   = await req.json().catch(() => null);
  const parsed = Schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { priceId, action } = parsed.data;

  if (action === "approve") {
    await prisma.countyMaterialPrice.update({
      where: { id: priceId },
      data:  { verified: true, dataSource: "supplier" },
    });
    return NextResponse.json({ success: true, status: "approved" });
  }

  // Reject = delete the record (supplier submissions are one-off)
  await prisma.countyMaterialPrice.delete({ where: { id: priceId } });
  return NextResponse.json({ success: true, status: "rejected" });
}
