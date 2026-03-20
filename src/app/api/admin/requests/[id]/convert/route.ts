// src/app/api/admin/requests/[id]/convert/route.ts
// Converts a VerificationRequest into a live Project, optionally assigning an inspector.
import { auth }           from "@/lib/auth";
import { prisma }         from "@/lib/prisma";
import { sendPushToUser } from "@/lib/push";
import { NextRequest, NextResponse } from "next/server";
import { z }        from "zod";
import bcrypt       from "bcryptjs";

const schema = z.object({
  inspectorId: z.string().optional().nullable(),
});

const SERVICE_TYPE_MAP: Record<string, string> = {
  "Construction Site":             "CONSTRUCTION",
  "Land & Property":               "LAND_PROPERTY",
  "Wedding/Event":                 "WEDDING_EVENT",
  "Funeral/Event":                 "FUNERAL_EVENT",
  "Business Investment":           "BUSINESS_INVESTMENT",
  "Material Pricing":              "MATERIAL_PRICING",
  CONSTRUCTION:                    "CONSTRUCTION",
  LAND_PROPERTY:                   "LAND_PROPERTY",
};

function toProjectType(serviceType: string): string {
  return SERVICE_TYPE_MAP[serviceType] ?? "CONSTRUCTION";
}

interface RouteContext { params: Promise<{ id: string }> }

export async function POST(req: NextRequest, ctx: RouteContext) {
  const session = await auth();
  if ((session?.user as { role?: string })?.role !== "ADMIN")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await ctx.params;
  const body   = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json({ error: "Invalid input." }, { status: 400 });

  const vr = await prisma.verificationRequest.findUnique({ where: { id } });
  if (!vr)
    return NextResponse.json({ error: "Request not found." }, { status: 404 });
  if (vr.status === "CONVERTED")
    return NextResponse.json({ error: "Already converted." }, { status: 409 });

  // Find or create CLIENT user
  let clientUser = await prisma.user.findUnique({ where: { email: vr.email } });
  if (!clientUser) {
    const tempPassword = Math.random().toString(36).slice(-10);
    const passwordHash = await bcrypt.hash(tempPassword, 12);
    clientUser = await prisma.user.create({
      data: {
        email:        vr.email,
        name:         vr.name,
        phone:        vr.phone ?? undefined,
        country:      vr.country,
        role:         "CLIENT",
        passwordHash,
      },
    });
  }

  const inspectorId = parsed.data.inspectorId ?? null;

  const project = await prisma.project.create({
    data: {
      name:        `${vr.serviceType} — ${vr.projectLocation}`,
      type:        toProjectType(vr.serviceType) as any,
      location:    vr.projectLocation,
      county:      vr.county ?? undefined,
      description: vr.description,
      status:      "PENDING",
      clientId:    clientUser.id,
      ...(inspectorId ? { inspectorId, inspectorStatus: "PENDING" } : {}),
    },
    include: { inspector: { select: { id: true, name: true } } },
  });

  // Alert + push: project created
  await prisma.alert.create({
    data: {
      projectId:  project.id,
      severity:   "INFO",
      title:      "Your project has been created",
      message:    `Your ${vr.serviceType} verification request has been approved and a project has been opened. Log in to track progress.`,
      actionUrl:  `/dashboard/projects/${project.id}`,
    },
  });

  sendPushToUser(clientUser.id, {
    title: "Your verification project is live",
    body:  `${project.name} has been created. Log in to your dashboard to track progress.`,
    url:   `/dashboard/projects/${project.id}`,
    tag:   `project-created-${project.id}`,
  }).catch(console.error);

  // Alert + push: inspector assigned (if provided at conversion time)
  if (inspectorId && project.inspector) {
    await prisma.alert.create({
      data: {
        projectId:  project.id,
        severity:   "INFO",
        title:      "Inspector assigned",
        message:    `${project.inspector.name} has been assigned and will confirm availability shortly.`,
        actionUrl:  `/dashboard/projects/${project.id}`,
      },
    });

    sendPushToUser(clientUser.id, {
      title: "Inspector assigned to your project",
      body:  `${project.inspector.name} has been assigned to ${project.name}.`,
      url:   `/dashboard/projects/${project.id}`,
      tag:   `inspector-assigned-${project.id}`,
    }).catch(console.error);
  }

  await prisma.verificationRequest.update({
    where: { id },
    data:  { status: "CONVERTED" },
  });

  return NextResponse.json({ success: true, projectId: project.id });
}