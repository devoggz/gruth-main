// src/app/api/inspector/projects/[id]/report/route.ts
// Inspector submits field report for an inspection (or creates new inspection + report)
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
  inspectionId: z.string().optional(), // existing inspection to update
  scheduledDate: z.string().optional(), // ISO date string for new inspection
  status: z.enum(["IN_PROGRESS", "COMPLETED"]),
  summary: z.string().min(1, "Summary is required"),
  observations: z.string().min(1, "Observations are required"),
  recommendations: z.string().optional(),
  nextSteps: z.string().optional(),
  overallRating: z.number().int().min(1).max(5).optional(),
  workQuality: z.enum(["POOR", "FAIR", "GOOD", "EXCELLENT"]).optional(),
  safetyCompliance: z.boolean().optional(),
  mediaUrls: z
    .array(
      z.object({
        url: z.string().url(),
        filename: z.string(),
        type: z.enum(["PHOTO", "VIDEO", "DOCUMENT"]),
        caption: z.string().optional(),
        sortOrder: z.number().optional(),
      }),
    )
    .optional(),
});

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(req: NextRequest, context: RouteContext) {
  const session = await auth();
  const user = session?.user as any;
  if (!user || (user.role !== "INSPECTOR" && user.role !== "ADMIN")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id: projectId } = await context.params;
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 },
    );

  const { inspectionId, scheduledDate, mediaUrls, ...reportData } = parsed.data;

  // Verify inspector is assigned to this project
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { id: true, inspectorId: true, clientId: true, name: true },
  });
  if (!project)
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  if (user.role !== "ADMIN" && project.inspectorId !== user.id) {
    return NextResponse.json(
      { error: "Not assigned to this project" },
      { status: 403 },
    );
  }

  let inspection: any;

  if (inspectionId) {
    // Update existing inspection
    inspection = await prisma.inspection.update({
      where: { id: inspectionId },
      data: {
        ...reportData,
        completedDate:
          reportData.status === "COMPLETED" ? new Date() : undefined,
        inspectorId: user.id,
        inspectorName: user.name ?? "Inspector",
      },
    });
  } else {
    // Create new inspection
    inspection = await prisma.inspection.create({
      data: {
        projectId,
        inspectorId: user.id,
        inspectorName: user.name ?? "Inspector",
        scheduledDate: scheduledDate ? new Date(scheduledDate) : new Date(),
        completedDate:
          reportData.status === "COMPLETED" ? new Date() : undefined,
        ...reportData,
      },
    });
  }

  // Add media
  if (mediaUrls && mediaUrls.length > 0) {
    await prisma.inspectionMedia.createMany({
      data: mediaUrls.map((m, i) => ({
        inspectionId: inspection.id,
        type: m.type,
        url: m.url,
        filename: m.filename,
        caption: m.caption,
        sortOrder: m.sortOrder ?? i,
      })),
    });
  }

  // Create alert for client
  if (reportData.status === "COMPLETED") {
    await prisma.alert.create({
      data: {
        projectId,
        severity: "INFO",
        title: "Inspection report available",
        message: `Your inspector has submitted a new report. View the findings and photos in your project dashboard.`,
        actionUrl: `/dashboard/projects/${projectId}`,
      },
    });

    // Update project status to ACTIVE if still PENDING
    await prisma.project.update({
      where: { id: projectId },
      data: { status: project ? undefined : "ACTIVE" },
    });
  }

  return NextResponse.json({ success: true, inspection });
}
