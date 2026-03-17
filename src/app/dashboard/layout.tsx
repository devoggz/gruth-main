// src/app/dashboard/layout.tsx
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardMobileNav from "@/components/dashboard/DashboardMobileNav";
import React from "react";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  const user = session.user as any;

  // Fetch unread counts for mobile nav badges
  const [unreadMessages, unreadAlerts] = await Promise.all([
    prisma.message.count({
      where: { userId: user.id, isFromClient: false, readAt: null },
    }),
    prisma.alert.count({
      where: { project: { clientId: user.id }, isRead: false },
    }),
  ]);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <DashboardSidebar />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <DashboardHeader
          user={{ name: user?.name, email: user?.email, role: user?.role }}
        />
        <main className="flex-1 overflow-y-auto">
          {/* pb-24 on mobile to clear the fixed bottom nav bar */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-8">
            {children}
          </div>
        </main>
      </div>
      {/* Mobile bottom navigation — hidden md+ where sidebar takes over */}
      <DashboardMobileNav
        unreadMessages={unreadMessages}
        unreadAlerts={unreadAlerts}
      />
    </div>
  );
}
