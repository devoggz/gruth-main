"use client";
// src/components/admin/AdminAssignInspector.tsx
import { useState } from "react";
import { useRouter } from "next/navigation";

interface Inspector {
  id: string;
  name: string | null;
  email: string;
}
interface Props {
  projectId: string;
  currentInspectorId: string | null;
  inspectors: Inspector[];
}

export default function AdminAssignInspector({
  projectId,
  currentInspectorId,
  inspectors,
}: Props) {
  const router = useRouter();
  const [selected, setSelected] = useState(currentInspectorId ?? "");
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    await fetch(`/api/admin/projects/${projectId}/assign-inspector`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ inspectorId: selected || null }),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
    router.refresh();
    setLoading(false);
  };

  const current = inspectors.find((i) => i.id === currentInspectorId);

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <select
        value={selected}
        onChange={(e) => setSelected(e.target.value)}
        className="input-field py-2 text-sm flex-1 min-w-0 max-w-xs"
      >
        <option value="">— Unassigned —</option>
        {inspectors.map((i) => (
          <option key={i.id} value={i.id}>
            {i.name ?? i.email}
          </option>
        ))}
      </select>
      <button
        onClick={handleSave}
        disabled={loading || selected === (currentInspectorId ?? "")}
        className="btn-primary text-sm py-2 disabled:opacity-50 flex-shrink-0"
      >
        {loading ? "Saving…" : saved ? "✓ Saved" : "Assign"}
      </button>
      {current && (
        <div className="text-xs text-charcoal-500 w-full">
          Currently:{" "}
          <span className="font-semibold text-charcoal-800">
            {current.name}
          </span>{" "}
          ({current.email})
        </div>
      )}
    </div>
  );
}
