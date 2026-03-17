// src/app/api/mobile/projects/route.ts  (add to your Next.js app)
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyMobileToken } from "@/lib/mobile-auth";

export async function GET(req: NextRequest) {
  const session = await verifyMobileToken(req);
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const projects = await prisma.project.findMany({
    where: { clientId: session.userId },
    include: {
      inspections: { orderBy: { scheduledDate: "desc" }, take: 1 },
      alerts: { where: { isRead: false } },
      progressStages: { orderBy: { order: "asc" } },
      _count: { select: { inspections: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json(projects);
}
