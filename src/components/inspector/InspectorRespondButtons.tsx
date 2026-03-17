"use client";
// src/components/inspector/InspectorRespondButtons.tsx
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

interface Props {
  projectId: string;
  currentStatus: string; // PENDING | ACCEPTED | DECLINED
}

export default function InspectorRespondButtons({
  projectId,
  currentStatus,
}: Props) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [pending, start] = useTransition();
  const [error, setError] = useState("");

  if (status === "ACCEPTED") {
    return (
      <div className="flex items-center gap-2 px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-xl text-sm font-semibold text-emerald-700">
        <svg
          className="w-4 h-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
        >
          <path d="M20 6L9 17l-5-5" />
        </svg>
        You have accepted this project
      </div>
    );
  }

  if (status === "DECLINED") {
    return (
      <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm font-semibold text-red-700">
        <svg
          className="w-4 h-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
        >
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
        You declined this project
      </div>
    );
  }

  const respond = (decision: "ACCEPTED" | "DECLINED") => {
    setError("");
    start(async () => {
      const res = await fetch(`/api/inspector/projects/${projectId}/respond`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ decision }),
      });
      if (res.ok) {
        setStatus(decision);
        router.refresh();
      } else {
        const json = await res.json();
        setError(json.error ?? "Something went wrong.");
      }
    });
  };

  return (
    <div>
      <p className="text-sm text-charcoal-600 mb-3">
        You have been assigned to this project. Please confirm your
        availability:
      </p>
      <div className="flex gap-3 flex-wrap">
        <button
          onClick={() => respond("ACCEPTED")}
          disabled={pending}
          className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white text-sm font-semibold rounded-xl transition-colors"
        >
          <svg
            className="w-4 h-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <path d="M20 6L9 17l-5-5" />
          </svg>
          Accept
        </button>
        <button
          onClick={() => respond("DECLINED")}
          disabled={pending}
          className="flex items-center gap-2 px-5 py-2.5 bg-white border border-red-200 hover:bg-red-50 disabled:opacity-60 text-red-600 text-sm font-semibold rounded-xl transition-colors"
        >
          <svg
            className="w-4 h-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
          Decline
        </button>
      </div>
      {error && <p className="text-red-600 text-xs mt-2">{error}</p>}
    </div>
  );
}
