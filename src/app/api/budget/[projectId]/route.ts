import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

interface Ctx {
  params: Promise<{ projectId: string }>;
}

async function requireOwnership(userId: string, projectId: string) {
  const project = await prisma.project.findUnique({
    where: { id: projectId, clientId: userId },
    select: { id: true, estimatedBudget: true, currency: true, name: true },
  });
  return project;
}

// ── GET ───────────────────────────────────────────────────────────────────────
export async function GET(_req: NextRequest, ctx: Ctx): Promise<NextResponse> {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { projectId } = await ctx.params;
  const project = await requireOwnership(session.user.id, projectId);
  if (!project)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  const entries = await prisma.budgetEntry.findMany({
    where: { projectId },
    orderBy: { entryDate: "asc" },
  });

  return NextResponse.json({ project, entries });
}

// ── POST ──────────────────────────────────────────────────────────────────────
export async function POST(req: NextRequest, ctx: Ctx): Promise<NextResponse> {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { projectId } = await ctx.params;
  const project = await requireOwnership(session.user.id, projectId);
  if (!project)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  let body: {
    amount?: number;
    category?: string;
    description?: string;
    entryDate?: string; // ISO string, will be normalised to 1st of month
    currency?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { amount, category, description, entryDate, currency } = body;

  if (!amount || amount <= 0 || !category || !entryDate)
    return NextResponse.json(
      { error: "amount, category, and entryDate are required" },
      { status: 400 },
    );

  // Normalise to 1st of the given month
  const d = new Date(entryDate);
  const normalised = new Date(d.getFullYear(), d.getMonth(), 1);

  const entry = await prisma.budgetEntry.create({
    data: {
      projectId,
      amount,
      category: category.trim(),
      description: description?.trim() ?? null,
      entryDate: normalised,
      currency: currency ?? project.currency ?? "KES",
    },
  });

  return NextResponse.json(entry, { status: 201 });
}

// ── DELETE ────────────────────────────────────────────────────────────────────
export async function DELETE(
  req: NextRequest,
  ctx: Ctx,
): Promise<NextResponse> {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { projectId } = await ctx.params;
  const project = await requireOwnership(session.user.id, projectId);
  if (!project)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  const entryId = new URL(req.url).searchParams.get("entryId");
  if (!entryId)
    return NextResponse.json({ error: "entryId required" }, { status: 400 });

  // Confirm entry belongs to this project
  const entry = await prisma.budgetEntry.findUnique({
    where: { id: entryId },
    select: { projectId: true },
  });
  if (!entry || entry.projectId !== projectId)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.budgetEntry.delete({ where: { id: entryId } });
  return NextResponse.json({ deleted: true });
}

// ── PATCH — update estimatedBudget on the Project itself ─────────────────────
export async function PATCH(req: NextRequest, ctx: Ctx): Promise<NextResponse> {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { projectId } = await ctx.params;
  const project = await requireOwnership(session.user.id, projectId);
  if (!project)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  let body: { estimatedBudget?: number };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.estimatedBudget || body.estimatedBudget <= 0)
    return NextResponse.json(
      { error: "estimatedBudget must be > 0" },
      { status: 400 },
    );

  const updated = await prisma.project.update({
    where: { id: projectId },
    data: { estimatedBudget: body.estimatedBudget },
    select: { id: true, estimatedBudget: true },
  });

  return NextResponse.json(updated);
}
