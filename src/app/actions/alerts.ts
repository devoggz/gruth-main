"use server";
// src/app/actions/alerts.ts

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * Mark every unread alert belonging to the current user's projects as read.
 * Called from the MarkAlertsRead client component on /dashboard/notifications.
 */
export async function markAllAlertsRead(): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) return;

  await prisma.alert.updateMany({
    where: {
      project: { clientId: session.user.id },
      isRead: false,
    },
    data: {
      isRead: true,
      readAt: new Date(),
    },
  });

  revalidatePath("/dashboard/notifications");
  revalidatePath("/dashboard");
}

/**
 * Mark a single alert as read by ID.
 * Ownership is validated — users can only mark their own alerts.
 */
export async function markAlertRead(alertId: string): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) return;

  // Fetch first to confirm ownership before updating
  const alert = await prisma.alert.findUnique({
    where: { id: alertId },
    select: { project: { select: { clientId: true } } },
  });

  if (!alert || alert.project.clientId !== session.user.id) return;

  await prisma.alert.update({
    where: { id: alertId },
    data: { isRead: true, readAt: new Date() },
  });

  revalidatePath("/dashboard/notifications");
  revalidatePath("/dashboard");
}
