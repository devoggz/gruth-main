// src/app/api/inspector/projects/[id]/respond/route.ts
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendPushToUser } from "@/lib/push";
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
  if (!session || (user?.role !== "INSPECTOR" && user?.role !== "ADMIN"))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await ctx.params;
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json({ error: "Invalid input." }, { status: 400 });

  const project = await prisma.project.findUnique({
    where: { id },
    select: { id: true, inspectorId: true, clientId: true, name: true },
  });
  if (!project)
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  if (project.inspectorId !== user?.id && user?.role !== "ADMIN")
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });

  const { decision } = parsed.data;

  await prisma.project.update({
    where: { id },
    data: { inspectorStatus: decision },
  });

  // Alert content differs by decision
  const isAccepted = decision === "ACCEPTED";
  const alertTitle = isAccepted
    ? "Inspector confirmed"
    : "Inspector unavailable";
  const alertMessage = isAccepted
    ? `Your assigned inspector has accepted the project and will be in touch to schedule a visit.`
    : `The inspector was unable to take on this project. Our team will assign another inspector shortly.`;

  await prisma.alert.create({
    data: {
      projectId: id,
      severity: isAccepted ? "INFO" : "WARNING",
      title: alertTitle,
      message: alertMessage,
      actionUrl: `/dashboard/projects/${id}`,
    },
  });

  sendPushToUser(project.clientId, {
    title: alertTitle,
    body: alertMessage,
    url: `/dashboard/projects/${id}`,
    tag: `inspector-response-${id}`,
  }).catch(console.error);

  return NextResponse.json({ success: true, decision });
}
