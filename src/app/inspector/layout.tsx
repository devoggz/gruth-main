// src/app/inspector/layout.tsx
import React from "react";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import InspectorSidebar from "@/components/inspector/InspectorSidebar";
import InspectorMobileNav from "@/components/inspector/InspectorMobileNav";
import UserMenu from "@/components/shared/UserMenu";

export default async function InspectorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const user = session?.user as any;
  if (!session) redirect("/login");
  if (user?.role !== "INSPECTOR" && user?.role !== "ADMIN")
    redirect("/dashboard");

  return (
    <div className="flex h-screen bg-[#f6f6f3] overflow-hidden">
      <InspectorSidebar />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <header className="h-16 bg-white border-b border-charcoal-100 px-6 flex items-center justify-between flex-shrink-0">
          <div className="hidden md:flex items-center gap-2">
            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-[0.12em]">
              Inspector Portal
            </span>
          </div>
          <div className="md:hidden flex items-center gap-2.5">
            <div className="w-7 h-7 bg-emerald-600 rounded-lg flex items-center justify-center">
              <svg width="13" height="13" viewBox="0 0 18 18" fill="none">
                <path
                  d="M9 2L15 5.5V12.5L9 16L3 12.5V5.5L9 2Z"
                  stroke="white"
                  strokeWidth="1.5"
                  fill="none"
                />
                <circle cx="9" cy="9" r="2" fill="white" />
              </svg>
            </div>
            <span className="font-display font-bold text-charcoal-950 text-sm">
              GRUTH Inspector
            </span>
          </div>
          <UserMenu name={user?.name} email={user?.email} role={user?.role} />
        </header>
        <main className="flex-1 overflow-y-auto">
          {/* pb-24 on mobile clears the fixed bottom nav */}
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 md:pb-8">
            {children}
          </div>
        </main>
      </div>
      <InspectorMobileNav />
    </div>
  );
}
