// src/app/api/mobile/projects/[id]/route.ts  (add to your Next.js app)
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyMobileToken } from "@/lib/mobile-auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await verifyMobileToken(req);
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const project = await prisma.project.findFirst({
    where: { id, clientId: session.userId },
    include: {
      inspections: {
        orderBy: { scheduledDate: "desc" },
        include: { media: true, report: true },
      },
      alerts: { orderBy: { createdAt: "desc" } },
      progressStages: { orderBy: { order: "asc" } },
      materialPrices: { orderBy: { materialName: "asc" } },
      vendors: { orderBy: { name: "asc" } },
    },
  });

  if (!project)
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(project);
}
