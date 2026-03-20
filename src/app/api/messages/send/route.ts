// src/app/api/messages/send/route.ts
import { auth }   from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z }      from "zod";
import { NextRequest, NextResponse } from "next/server";

const schema = z.object({
  projectId: z.string().min(1).max(128),
  content:   z.string().min(1).max(4000).trim(), // 4000 char hard cap
});

export async function POST(req: NextRequest): Promise<NextResponse> {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body   = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json({ error: "Invalid input." }, { status: 400 });

  const { projectId, content } = parsed.data;

  // Verify project belongs to this client — prevents IDOR
  const project = await prisma.project.findUnique({
    where:  { id: projectId, clientId: session.user.id },
    select: { id: true },
  });
  if (!project)
    return NextResponse.json({ error: "Project not found." }, { status: 404 });

  const message = await prisma.message.create({
    data: {
      content,
      isFromClient: true,
      projectId,
      userId:   session.user.id,
      senderId: session.user.id,
    },
  });

  return NextResponse.json(message, { status: 201 });
}