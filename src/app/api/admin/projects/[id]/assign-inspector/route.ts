// src/app/api/admin/projects/[id]/assign-inspector/route.ts
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({ inspectorId: z.string().nullable() });

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(req: NextRequest, context: RouteContext) {
  const session = await auth();
  if ((session?.user as any)?.role !== "ADMIN")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await context.params;
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json({ error: "Invalid" }, { status: 400 });

  const project = await prisma.project.update({
    where: { id },
    data: { inspectorId: parsed.data.inspectorId },
    include: { inspector: { select: { id: true, name: true, email: true } } },
  });

  // Create an alert for the client
  if (parsed.data.inspectorId) {
    await prisma.alert.create({
      data: {
        projectId: id,
        severity: "INFO",
        title: "Inspector assigned",
        message: `${project.inspector?.name ?? "An inspector"} has been assigned to your project and will be in touch to schedule the first visit.`,
        actionUrl: `/dashboard/projects/${id}`,
      },
    });
  }

  return NextResponse.json({ success: true, project });
}
