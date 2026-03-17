"use client";
// src/components/dashboard/MarkAlertsRead.tsx

import { useTransition } from "react";
import { markAllAlertsRead } from "@/app/actions/alerts";

export function MarkAlertsRead() {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    // void discards the Promise — startTransition requires a sync callback
    startTransition(() => {
      void markAllAlertsRead();
    });
  }

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={handleClick}
      className="text-xs font-semibold text-orange-600 hover:text-orange-700 disabled:opacity-50 border border-orange-200 hover:border-orange-300 rounded-lg px-3 py-1.5 transition-colors"
    >
      {isPending ? "Marking…" : "Mark all read"}
    </button>
  );
}
