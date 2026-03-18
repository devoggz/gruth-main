// src/app/(auth)/layout.tsx
import React from "react";
import Link from "next/link";
import Image from "next/image";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex flex-col" style={{ minHeight: "100dvh" }}>
      {/* Dark background */}
      <div className="absolute inset-0 bg-charcoal-950" />

      {/* Subtle orange grid — same motif as hero section */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(to right, #f97316 1px, transparent 1px),
                            linear-gradient(to bottom, #f97316 1px, transparent 1px)`,
          backgroundSize: "56px 56px",
          opacity: 0.045,
        }}
      />

      {/* Radial fade so grid is denser at centre */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 85% 85% at 50% 40%, transparent 30%, rgba(10,9,8,0.7) 100%)",
        }}
      />

      {/* Logo bar */}

      {/* Scrollable centred content — overflow-y-auto so form stays reachable when keyboard opens */}
      <div className="relative z-10 flex-1 flex items-start sm:items-center justify-center px-4 py-4 sm:py-10 overflow-y-auto">
        {children}
      </div>
    </div>
  );
}
