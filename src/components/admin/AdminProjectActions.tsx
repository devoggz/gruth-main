"use client";
// src/components/admin/AdminProjectActions.tsx
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

const STATUSES = [
  "PENDING",
  "ACTIVE",
  "ON_HOLD",
  "COMPLETED",
  "CANCELLED",
] as const;
type Status = (typeof STATUSES)[number];

const STATUS_STYLE: Record<Status, string> = {
  PENDING: "bg-amber-50 text-amber-700 border-amber-200",
  ACTIVE: "bg-emerald-50 text-emerald-700 border-emerald-200",
  ON_HOLD: "bg-orange-50 text-orange-700 border-orange-200",
  COMPLETED: "bg-blue-50 text-blue-700 border-blue-200",
  CANCELLED: "bg-charcoal-50 text-charcoal-500 border-charcoal-200",
};

export default function AdminProjectActions({
  projectId,
  currentStatus,
}: {
  projectId: string;
  currentStatus: string;
}) {
  const [status, setStatus] = useState<Status>(currentStatus as Status);
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const handleStatusChange = (next: Status) => {
    setOpen(false);
    if (next === status) return;
    setStatus(next);
    startTransition(async () => {
      await fetch(`/api/admin/projects/${projectId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      router.refresh();
    });
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        disabled={pending}
        className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border transition-all ${STATUS_STYLE[status]} ${pending ? "opacity-60" : "hover:shadow-sm"}`}
      >
        {pending ? (
          <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : (
          <span className="w-1.5 h-1.5 rounded-full bg-current" />
        )}
        {status.replace("_", " ")}
        <svg
          className={`w-3.5 h-3.5 transition-transform ${open ? "rotate-180" : ""}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1.5 z-20 bg-white rounded-xl border border-charcoal-100 shadow-lg overflow-hidden w-44 py-1">
            {STATUSES.map((s) => (
              <button
                key={s}
                onClick={() => handleStatusChange(s)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors hover:bg-charcoal-50 ${
                  s === status
                    ? "text-charcoal-950 bg-charcoal-50"
                    : "text-charcoal-600"
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full flex-shrink-0 ${
                    s === "ACTIVE"
                      ? "bg-emerald-500"
                      : s === "PENDING"
                        ? "bg-amber-500"
                        : s === "ON_HOLD"
                          ? "bg-orange-400"
                          : s === "COMPLETED"
                            ? "bg-blue-500"
                            : "bg-charcoal-300"
                  }`}
                />
                {s.replace("_", " ")}
                {s === status && (
                  <svg
                    className="w-3.5 h-3.5 text-charcoal-400 ml-auto"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
