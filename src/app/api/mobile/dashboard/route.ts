// src/app/api/mobile/dashboard/route.ts  (add to your Next.js app)
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyMobileToken } from "@/lib/mobile-auth";

export async function GET(req: NextRequest) {
  const session = await verifyMobileToken(req);
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const uid = session.userId;

  const [
    projects,
    alerts,
    unreadMessages,
    recentInspections,
    totalInspections,
  ] = await Promise.all([
    prisma.project.findMany({
      where: { clientId: uid },
      include: {
        inspections: { orderBy: { scheduledDate: "desc" }, take: 1 },
        alerts: { where: { isRead: false } },
        progressStages: true,
      },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.alert.findMany({
      where: { project: { clientId: uid }, isRead: false },
      include: { project: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.message.count({
      where: { userId: uid, isFromClient: false, readAt: null },
    }),
    prisma.inspection.findMany({
      where: { project: { clientId: uid } },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { project: { select: { id: true, name: true } } },
    }),
    prisma.inspection.count({ where: { project: { clientId: uid } } }),
  ]);

  return NextResponse.json({
    projects,
    alerts,
    unreadMessages,
    recentInspections,
    totalInspections,
  });
}
