"use client";
// src/app/admin/market-prices/AdminPriceActions.tsx
// Approve / reject buttons for supplier submissions.
// Server action pattern — no separate API route needed.

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  priceId: string;
  notes:   string | null;
}

export default function AdminPriceActions({ priceId, notes }: Props) {
  const router    = useRouter();
  const [loading, setLoading] = useState<"approve" | "reject" | null>(null);
  const [done,    setDone]    = useState<"approved" | "rejected" | null>(null);

  async function handleAction(action: "approve" | "reject") {
    setLoading(action);
    try {
      const res = await fetch("/api/admin/market-prices", {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ priceId, action }),
      });
      if (res.ok) {
        setDone(action === "approve" ? "approved" : "rejected");
        router.refresh();
      }
    } finally {
      setLoading(null);
    }
  }

  if (done) {
    return (
      <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${
        done === "approved"
          ? "text-emerald-700 bg-emerald-50 border border-emerald-200"
          : "text-red-600 bg-red-50 border border-red-200"
      }`}>
        {done === "approved" ? "✓ Approved" : "✕ Rejected"}
      </span>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => handleAction("approve")}
        disabled={!!loading}
        title={notes ?? undefined}
        className="text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
      >
        {loading === "approve" ? "…" : "Approve"}
      </button>
      <button
        onClick={() => handleAction("reject")}
        disabled={!!loading}
        className="text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
      >
        {loading === "reject" ? "…" : "Reject"}
      </button>
    </div>
  );
}
