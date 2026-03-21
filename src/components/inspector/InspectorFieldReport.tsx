"use client";
// src/components/inspector/InspectorFieldReport.tsx
// Full-featured field report form for inspectors

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUploadThing } from "@/utils/uploadthing";

interface Props {
  projectId: string;
  inspectionId?: string; // existing inspection to update
  inspectorName: string;
}

const QUALITY = [
  {
    value: "POOR",
    label: "Poor",
    color: "border-red-400 bg-red-50 text-red-700",
  },
  {
    value: "FAIR",
    label: "Fair",
    color: "border-amber-400 bg-amber-50 text-amber-700",
  },
  {
    value: "GOOD",
    label: "Good",
    color: "border-blue-400 bg-blue-50 text-blue-700",
  },
  {
    value: "EXCELLENT",
    label: "Excellent",
    color: "border-emerald-400 bg-emerald-50 text-emerald-700",
  },
];

interface MediaItem {
  url: string;
  filename: string;
  type: "PHOTO" | "VIDEO" | "DOCUMENT";
  caption: string;
  sortOrder: number;
}

function StarRating({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onMouseEnter={() => setHovered(n)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(n)}
          className="transition-transform hover:scale-110"
        >
          <svg
            className={`w-7 h-7 transition-colors ${(hovered || value) >= n ? "text-orange-400" : "text-charcoal-200"}`}
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        </button>
      ))}
    </div>
  );
}

export default function InspectorFieldReport({
  projectId,
  inspectionId,
  inspectorName,
}: Props) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [uploadProgress, setUploadProgress] = useState<
    "idle" | "uploading" | "done"
  >("idle");

  // File picker state — actual File objects for Uploadthing
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);

  const { startUpload } = useUploadThing("inspectionMedia", {
    onUploadProgress: () => setUploadProgress("uploading"),
  });

  const [form, setForm] = useState({
    status: "COMPLETED" as "IN_PROGRESS" | "COMPLETED",
    scheduledDate: new Date().toISOString().slice(0, 10),
    summary: "",
    observations: "",
    recommendations: "",
    nextSteps: "",
    overallRating: 0,
    workQuality: "",
    safetyCompliance: true,
  });

  const set = (k: string, v: any) => setForm((p) => ({ ...p, [k]: v }));

  const addFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files ?? []);
    setMediaFiles((prev) => [...prev, ...selected].slice(0, 20));
    e.target.value = "";
  };

  const removeFile = (i: number) =>
    setMediaFiles((prev) => prev.filter((_, idx) => idx !== i));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.summary.trim()) e.summary = "Summary is required";
    if (!form.observations.trim()) e.observations = "Observations are required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    setErrors({});

    try {
      // 1. Upload media files to Uploadthing (passes projectId + inspectionId as query params)
      let uploadedMedia: { url: string; name: string }[] = [];
      if (mediaFiles.length > 0) {
        setUploadProgress("uploading");
        const params = new URLSearchParams({ projectId });
        if (inspectionId) params.set("inspectionId", inspectionId);

        const result = await startUpload(mediaFiles, undefined);
        if (!result) {
          setErrors({ submit: "Media upload failed. Please try again." });
          setSubmitting(false);
          setUploadProgress("idle");
          return;
        }
        uploadedMedia = result.map((f) => ({ url: f.serverData?.url ?? f.url, name: f.name }));
        setUploadProgress("done");
      }

      // 2. Submit the report with uploaded media URLs
      const payload = {
        ...form,
        inspectionId,
        scheduledDate: form.scheduledDate,
        overallRating: form.overallRating || undefined,
        workQuality: form.workQuality || undefined,
        // Pass URLs so the API can create InspectionMedia records for any
        // files uploaded without an existing inspectionId
        mediaUrls: uploadedMedia.map((f, i) => ({
          url: f.url,
          filename: f.name,
          type: "PHOTO" as const,
          caption: "",
          sortOrder: i,
        })),
      };

      const res = await fetch(`/api/inspector/projects/${projectId}/report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setSubmitted(true);
        router.refresh();
      } else {
        const d = await res.json();
        setErrors({ submit: d.error ?? "Submission failed" });
      }
    } catch {
      setErrors({ submit: "Network error. Please try again." });
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted)
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-8 text-center">
        <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-7 h-7 text-emerald-600"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </div>
        <h3 className="font-semibold text-emerald-900 text-lg mb-1">
          Report submitted
        </h3>
        <p className="text-emerald-700 text-sm">
          The client has been notified and can view your findings in their
          dashboard.
        </p>
      </div>
    );

  return (
    <form onSubmit={handleSubmit} className="space-y-7">
      {/* Status + Date */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className="label">Inspection Status *</label>
          <div className="flex gap-3">
            {(["IN_PROGRESS", "COMPLETED"] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => set("status", s)}
                className={`flex-1 py-2.5 px-3 rounded-xl border text-sm font-semibold transition-all ${
                  form.status === s
                    ? "border-orange-400 bg-orange-50 text-orange-700"
                    : "border-charcoal-200 text-charcoal-600 hover:border-orange-200"
                }`}
              >
                {s === "IN_PROGRESS" ? "In Progress" : "Completed"}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="label">Inspection Date *</label>
          <input
            type="date"
            value={form.scheduledDate}
            onChange={(e) => set("scheduledDate", e.target.value)}
            className="input-field"
            max={new Date().toISOString().slice(0, 10)}
          />
        </div>
      </div>

      {/* Executive Summary */}
      <div>
        <label className="label">Executive Summary *</label>
        <p className="text-xs text-charcoal-400 mb-2">
          A brief overview the client will see first — 2–4 sentences.
        </p>
        <textarea
          rows={3}
          value={form.summary}
          onChange={(e) => set("summary", e.target.value)}
          className={`input-field resize-none ${errors.summary ? "!border-red-300" : ""}`}
          placeholder="e.g. Ring beam inspection complete. Works generally meet specification — one section requires rectification before wall-raising continues."
        />
        {errors.summary && (
          <p className="text-red-500 text-xs mt-1">{errors.summary}</p>
        )}
      </div>

      {/* Detailed Observations */}
      <div>
        <label className="label">Detailed Observations *</label>
        <p className="text-xs text-charcoal-400 mb-2">
          Technical findings — measurements, issues found, conditions observed.
          Be specific.
        </p>
        <textarea
          rows={6}
          value={form.observations}
          onChange={(e) => set("observations", e.target.value)}
          className={`input-field resize-none ${errors.observations ? "!border-red-300" : ""}`}
          placeholder="e.g. Concrete curing satisfactory. Hairline cracks on eastern face — within tolerance. Rebar spacing on north wall at 18cm vs specified 15cm. DPC correctly installed at plinth level. Sub-spec section on south ring beam: 200mm width vs required 225mm..."
        />
        {errors.observations && (
          <p className="text-red-500 text-xs mt-1">{errors.observations}</p>
        )}
      </div>

      {/* Recommendations */}
      <div>
        <label className="label">
          Recommendations{" "}
          <span className="font-normal text-charcoal-400 text-xs">
            optional
          </span>
        </label>
        <textarea
          rows={4}
          value={form.recommendations}
          onChange={(e) => set("recommendations", e.target.value)}
          className="input-field resize-none"
          placeholder="Numbered list of recommended actions. e.g.:&#10;1. Contractor must widen sub-spec section to 225mm before continuing&#10;2. Increase rebar density on north wall&#10;3. Apply waterproofing membrane before walls reach full height"
        />
      </div>

      {/* Quality assessment row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label className="label">Overall Rating</label>
          <StarRating
            value={form.overallRating}
            onChange={(v) => set("overallRating", v)}
          />
          <p className="text-xs text-charcoal-400 mt-1.5">
            {form.overallRating === 0 && "Click to rate"}
            {form.overallRating === 1 && "Poor — major issues"}
            {form.overallRating === 2 && "Below standard"}
            {form.overallRating === 3 && "Fair — some issues"}
            {form.overallRating === 4 && "Good — minor issues only"}
            {form.overallRating === 5 && "Excellent — fully compliant"}
          </p>
        </div>
        <div>
          <label className="label">Work Quality</label>
          <div className="grid grid-cols-2 gap-2">
            {QUALITY.map((q) => (
              <button
                key={q.value}
                type="button"
                onClick={() => set("workQuality", q.value)}
                className={`py-2 px-3 rounded-lg border text-sm font-semibold transition-all ${
                  form.workQuality === q.value
                    ? q.color + " shadow-sm"
                    : "border-charcoal-100 text-charcoal-600 hover:border-charcoal-300"
                }`}
              >
                {q.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Safety compliance */}
      <div className="flex items-center gap-4 p-4 bg-charcoal-50 rounded-xl">
        <div
          className={`w-6 h-6 rounded-full flex items-center justify-center cursor-pointer flex-shrink-0 transition-all ${
            form.safetyCompliance ? "bg-emerald-500" : "bg-red-400"
          }`}
          onClick={() => set("safetyCompliance", !form.safetyCompliance)}
        >
          {form.safetyCompliance ? (
            <svg
              className="w-3.5 h-3.5 text-white"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
            >
              <path d="M20 6L9 17l-5-5" />
            </svg>
          ) : (
            <svg
              className="w-3.5 h-3.5 text-white"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
            >
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          )}
        </div>
        <div>
          <p className="font-semibold text-charcoal-900 text-sm">
            Safety Compliance
          </p>
          <p
            className={`text-xs ${form.safetyCompliance ? "text-emerald-600" : "text-red-500"}`}
          >
            {form.safetyCompliance
              ? "Site meets safety requirements"
              : "Safety concerns noted — see observations"}
          </p>
        </div>
      </div>

      {/* Next steps */}
      <div>
        <label className="label">
          Next Steps{" "}
          <span className="font-normal text-charcoal-400 text-xs">
            optional
          </span>
        </label>
        <textarea
          rows={2}
          value={form.nextSteps}
          onChange={(e) => set("nextSteps", e.target.value)}
          className="input-field resize-none"
          placeholder="e.g. Re-inspect at 50% wall height. Estimated 2–3 weeks from today."
        />
      </div>

      {/* Media — real file upload via Uploadthing */}
      <div>
        <label className="label">Photos & Videos</label>
        <p className="text-xs text-charcoal-400 mb-3">
          Select photos and videos from your device. Files upload to secure
          cloud storage when you submit.
        </p>

        {/* File list */}
        {mediaFiles.length > 0 && (
          <div className="space-y-2 mb-3">
            {mediaFiles.map((f, i) => (
              <div
                key={i}
                className="flex items-center gap-3 bg-charcoal-50 rounded-xl px-3 py-2.5"
              >
                <span className="text-lg flex-shrink-0">
                  {f.type.startsWith("image/")
                    ? "🖼️"
                    : f.type.startsWith("video/")
                      ? "🎬"
                      : "📄"}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-charcoal-800 truncate">
                    {f.name}
                  </p>
                  <p className="text-xs text-charcoal-400">
                    {f.size < 1024 ** 2
                      ? `${(f.size / 1024).toFixed(0)} KB`
                      : `${(f.size / 1024 ** 2).toFixed(1)} MB`}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => removeFile(i)}
                  className="w-6 h-6 rounded-full text-charcoal-400 hover:bg-red-100 hover:text-red-500 flex items-center justify-center transition-colors"
                >
                  <svg
                    className="w-3.5 h-3.5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Drop zone / file picker */}
        <label className="flex flex-col items-center gap-2 border-2 border-dashed border-charcoal-200 rounded-xl p-6 text-center cursor-pointer hover:border-orange-400 hover:bg-orange-50/30 transition-all group">
          <div className="w-10 h-10 bg-charcoal-100 group-hover:bg-orange-100 rounded-xl flex items-center justify-center transition-colors">
            <svg
              className="w-5 h-5 text-charcoal-400 group-hover:text-orange-500 transition-colors"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1M16 12l-4-4m0 0l-4 4m4-4v12" />
            </svg>
          </div>
          <p className="text-sm font-semibold text-charcoal-700 group-hover:text-orange-700 transition-colors">
            {mediaFiles.length > 0
              ? "Add more files"
              : "Select photos or videos"}
          </p>
          <p className="text-xs text-charcoal-400">
            Images up to 16MB · Videos up to 128MB · max 20 files
          </p>
          <input
            type="file"
            multiple
            className="hidden"
            accept="image/*,video/*"
            onChange={addFiles}
          />
        </label>

        {uploadProgress === "uploading" && (
          <div className="flex items-center gap-2 mt-3 text-xs text-orange-600 font-medium">
            <svg
              className="animate-spin w-3.5 h-3.5"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="3"
                strokeDasharray="20 60"
              />
            </svg>
            Uploading {mediaFiles.length} file{mediaFiles.length > 1 ? "s" : ""}
            …
          </div>
        )}
        {uploadProgress === "done" && (
          <p className="text-xs text-emerald-600 font-medium mt-2">
            ✓ Files uploaded successfully
          </p>
        )}
      </div>

      {errors.submit && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
          {errors.submit}
        </div>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="btn-primary w-full justify-center py-4 text-base disabled:opacity-60"
      >
        {submitting ? (
          <span className="flex items-center gap-2">
            <svg
              className="animate-spin w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="3"
                strokeDasharray="20 60"
              />
            </svg>
            {uploadProgress === "uploading"
              ? `Uploading ${mediaFiles.length} file${mediaFiles.length > 1 ? "s" : ""}…`
              : "Submitting report…"}
          </span>
        ) : (
          <>
            Submit Field Report
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </>
        )}
      </button>
    </form>
  );
}
