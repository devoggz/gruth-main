// src/app/api/inspector/projects/[id]/respond/route.ts
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
  decision: z.enum(["ACCEPTED", "DECLINED"]),
});

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(req: NextRequest, ctx: RouteContext) {
  const session = await auth();
  const user = session?.user as { id?: string; role?: string } | undefined;
  if (!session || (user?.role !== "INSPECTOR" && user?.role !== "ADMIN")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await ctx.params;
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input." }, { status: 400 });
  }

  // Verify ownership — inspector can only respond to their own assignments
  const project = await prisma.project.findUnique({
    where: { id },
    select: { id: true, inspectorId: true, name: true },
  });
  if (!project)
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  if (project.inspectorId !== user?.id && user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const { decision } = parsed.data;

  await prisma.project.update({
    where: { id },
    data: { inspectorStatus: decision },
  });

  // Notify client via alert
  const message =
    decision === "ACCEPTED"
      ? `Your assigned inspector has accepted the project and will be in touch to schedule a visit.`
      : `The inspector was unable to take on this project. Our team will assign another inspector shortly.`;

  await prisma.alert.create({
    data: {
      projectId: id,
      severity: decision === "ACCEPTED" ? "INFO" : "WARNING",
      title:
        decision === "ACCEPTED"
          ? "Inspector confirmed"
          : "Inspector unavailable",
      message,
      actionUrl: `/dashboard/projects/${id}`,
    },
  });

  return NextResponse.json({ success: true, decision });
}
