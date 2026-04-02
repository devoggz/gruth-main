"use client";
// src/components/dashboard/DashboardHeader.tsx
import Link from "next/link";
import UserMenu from "@/components/shared/UserMenu";
import Image from "next/image";

interface DashboardHeaderProps {
  user?: {
    name?: string | null;
    email?: string | null;
    role?: string;
  };
}

export default function DashboardHeader({ user }: DashboardHeaderProps) {
  return (
    <header className="h-16 bg-white border-b border-gray-100 px-4 sm:px-6 lg:px-8 flex items-center justify-between flex-shrink-0">
      <div className="md:hidden flex items-center gap-2">
        <Link href="/" className="flex items-center gap-2.5 group">
          <Image
            src="/images/logo-t.svg"
            alt="logo"
            width={120}
            height={32}
            style={{ width: "auto", height: "32px" }}
          />
        </Link>
      </div>

      <div className="hidden md:block" />

      {/* Right side */}
      <div className="flex items-center gap-3">
        <UserMenu name={user?.name} email={user?.email} role={user?.role} />
      </div>
    </header>
  );
}
