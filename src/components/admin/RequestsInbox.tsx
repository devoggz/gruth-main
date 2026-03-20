"use client";
// src/components/admin/RequestsInbox.tsx

import { useState, useEffect, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";

type RequestStatus = "NEW" | "REVIEWING" | "CONTACTED" | "CONVERTED" | "CLOSED";

interface UploadedFile {
  url:  string;
  name: string;
}

interface VerificationRequest {
  id:               string;
  name:             string;
  email:            string;
  phone?:           string;
  country?:         string;
  county?:          string;
  projectLocation:  string;
  serviceType:      string;
  description:      string;
  urgency?:         string;
  specificConcerns?: string;
  onGroundContact?: string;
  filesJson?:       string | null;
  status:           RequestStatus;
  createdAt:        string;
}

interface Inspector {
  id:    string;
  name:  string | null;
  email: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parseFiles(filesJson?: string | null): UploadedFile[] {
  if (!filesJson) return [];
  try { return JSON.parse(filesJson); } catch { return []; }
}

function isImage(file: UploadedFile) {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  return ["jpg","jpeg","png","webp","gif","avif","heic"].includes(ext) ||
         file.url.match(/\.(jpg|jpeg|png|webp|gif|avif)/i) !== null;
}

function isPdf(file: UploadedFile) {
  return file.name.toLowerCase().endsWith(".pdf") || file.url.includes(".pdf");
}

function fileIcon(file: UploadedFile) {
  if (isImage(file)) return "🖼️";
  if (isPdf(file))   return "📄";
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  if (["mp4","mov","avi","webm"].includes(ext)) return "🎬";
  return "📎";
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

const URGENCY_LABELS: Record<string, { label: string; color: string }> = {
  urgent:   { label: "Urgent · 48h",    color: "text-red-600 bg-red-50 border-red-200"     },
  standard: { label: "Standard · 1 wk", color: "text-amber-600 bg-amber-50 border-amber-200" },
  flexible: { label: "Flexible · 2wk+", color: "text-emerald-600 bg-emerald-50 border-emerald-200" },
};

const STATUS_CONFIG: Record<RequestStatus, { label: string; dot: string; badge: string }> = {
  NEW:       { label: "New",       dot: "bg-orange-500",   badge: "bg-orange-50 text-orange-700 ring-orange-200"   },
  REVIEWING: { label: "Reviewing", dot: "bg-blue-500",     badge: "bg-blue-50 text-blue-700 ring-blue-200"         },
  CONTACTED: { label: "Contacted", dot: "bg-violet-500",   badge: "bg-violet-50 text-violet-700 ring-violet-200"   },
  CONVERTED: { label: "Converted", dot: "bg-emerald-500",  badge: "bg-emerald-50 text-emerald-700 ring-emerald-200"},
  CLOSED:    { label: "Closed",    dot: "bg-charcoal-300", badge: "bg-charcoal-50 text-charcoal-500 ring-charcoal-200" },
};

const STATUS_ORDER: RequestStatus[] = ["NEW","REVIEWING","CONTACTED","CONVERTED","CLOSED"];

// ─── StatusBadge ──────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: RequestStatus }) {
  const c = STATUS_CONFIG[status];
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ring-1 ${c.badge}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {c.label}
    </span>
  );
}

// ─── ImageLightbox ─────────────────────────────────────────────────────────────

function ImageLightbox({ url, name, onClose }: { url: string; name: string; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 w-9 h-9 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M18 6L6 18M6 6l12 12"/>
        </svg>
      </button>
      <div onClick={e => e.stopPropagation()} className="max-w-4xl max-h-[90vh] relative">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={url} alt={name} className="max-h-[85vh] max-w-full object-contain rounded-xl shadow-2xl" />
        <p className="text-white/60 text-xs text-center mt-2">{name}</p>
      </div>
    </div>
  );
}

// ─── FileGallery ──────────────────────────────────────────────────────────────

function FileGallery({ files, compact = false }: { files: UploadedFile[]; compact?: boolean }) {
  const [lightbox, setLightbox] = useState<UploadedFile | null>(null);

  if (files.length === 0) return null;

  const images = files.filter(isImage);
  const docs   = files.filter(f => !isImage(f));

  return (
    <>
      {lightbox && (
        <ImageLightbox url={lightbox.url} name={lightbox.name} onClose={() => setLightbox(null)} />
      )}

      <div className={compact ? "space-y-2" : "space-y-3"}>
        {/* Image grid */}
        {images.length > 0 && (
          <div className={`grid gap-2 ${
            compact
              ? "grid-cols-4"
              : images.length === 1 ? "grid-cols-1"
              : images.length === 2 ? "grid-cols-2"
              : "grid-cols-3"
          }`}>
            {images.map((f, i) => (
              <button
                key={i}
                onClick={() => setLightbox(f)}
                className={`relative overflow-hidden rounded-xl bg-charcoal-100 group ${
                  compact ? "aspect-square" : images.length === 1 ? "aspect-video" : "aspect-square"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={f.url}
                  alt={f.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                  <svg className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>
                  </svg>
                </div>
                {!compact && (
                  <div className="absolute bottom-0 inset-x-0 p-2 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-white text-[10px] truncate">{f.name}</p>
                  </div>
                )}
              </button>
            ))}
          </div>
        )}

        {/* Document list */}
        {docs.length > 0 && (
          <div className="space-y-1.5">
            {docs.map((f, i) => (
              <a
                key={i}
                href={f.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 px-3 py-2.5 bg-charcoal-50 hover:bg-orange-50 border border-charcoal-100 hover:border-orange-200 rounded-xl transition-all group"
              >
                <span className="text-lg flex-shrink-0">{fileIcon(f)}</span>
                <span className="text-sm font-medium text-charcoal-700 group-hover:text-orange-700 truncate flex-1 transition-colors">
                  {f.name}
                </span>
                <svg className="w-3.5 h-3.5 text-charcoal-300 group-hover:text-orange-400 flex-shrink-0 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3"/>
                </svg>
              </a>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

// ─── RequestDrawer ────────────────────────────────────────────────────────────

function RequestDrawer({
  request, inspectors, onClose, onStatusChange,
}: {
  request:        VerificationRequest;
  inspectors:     Inspector[];
  onClose:        () => void;
  onStatusChange: (id: string, status: RequestStatus) => void;
}) {
  const [pending, startTransition]   = useTransition();
  const [current, setCurrent]        = useState<RequestStatus>(request.status);
  const [selectedInspector, setSelectedInspector] = useState("");
  const [converting, setConverting]  = useState(false);
  const [convertedProjectId, setConvertedProjectId] = useState<string | null>(null);
  const [convertError, setConvertError] = useState("");

  const files    = parseFiles(request.filesJson);
  const images   = files.filter(isImage);
  const urgency  = request.urgency ? URGENCY_LABELS[request.urgency] : null;

  const handleStatus = (status: RequestStatus) => {
    setCurrent(status);
    startTransition(async () => {
      await fetch(`/api/admin/requests/${request.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      onStatusChange(request.id, status);
    });
  };

  const handleConvert = async () => {
    setConvertError("");
    setConverting(true);
    try {
      const res = await fetch(`/api/admin/requests/${request.id}/convert`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inspectorId: selectedInspector || null }),
      });
      const json = await res.json();
      if (res.ok) {
        setConvertedProjectId(json.projectId);
        setCurrent("CONVERTED");
        onStatusChange(request.id, "CONVERTED");
      } else {
        setConvertError(json.error ?? "Conversion failed.");
      }
    } finally {
      setConverting(false);
    }
  };

  const isConverted = current === "CONVERTED";

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div className="flex-1 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col overflow-hidden">

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="flex items-start justify-between px-6 py-5 border-b border-charcoal-100 flex-shrink-0">
          <div className="flex items-start gap-3 min-w-0">
            <div className="w-10 h-10 bg-charcoal-950 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white text-sm font-bold">
                {request.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="min-w-0">
              <h3 className="font-display font-bold text-charcoal-950 text-lg leading-tight">
                {request.name}
              </h3>
              <p className="text-xs text-charcoal-400 mt-0.5 truncate">
                {request.serviceType} · {request.projectLocation}
              </p>
              <div className="mt-1.5 flex items-center gap-2 flex-wrap">
                <StatusBadge status={current} />
                {urgency && (
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${urgency.color}`}>
                    {urgency.label}
                  </span>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-charcoal-100 transition-colors text-charcoal-400 hover:text-charcoal-700 flex-shrink-0"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        {/* ── Scrollable body ─────────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

          {/* Contact + location grid */}
          <div className="grid grid-cols-2 gap-2.5">
            {[
              { label: "Email",    value: request.email,           href: `mailto:${request.email}` },
              { label: "Phone",    value: request.phone ?? "—",    href: request.phone ? `tel:${request.phone}` : undefined },
              { label: "Country",  value: request.country ?? "—" },
              { label: "County",   value: request.county  ?? "—" },
              { label: "Location", value: request.projectLocation },
              { label: "Received", value: timeAgo(request.createdAt) },
            ].map(({ label, value, href }) => (
              <div key={label} className="bg-charcoal-50 rounded-xl p-3">
                <p className="text-[10px] font-bold text-charcoal-400 uppercase tracking-wider mb-1">
                  {label}
                </p>
                {href ? (
                  <a href={href} className="text-sm font-medium text-orange-600 hover:text-orange-700 truncate block transition-colors">
                    {value}
                  </a>
                ) : (
                  <p className="text-sm font-medium text-charcoal-800 truncate">{value}</p>
                )}
              </div>
            ))}
          </div>

          {/* Description */}
          <div>
            <p className="text-[10px] font-bold text-charcoal-400 uppercase tracking-wider mb-2">
              Description
            </p>
            <div className="bg-charcoal-50 rounded-xl p-4 text-sm text-charcoal-700 leading-relaxed">
              {request.description}
            </div>
          </div>

          {/* Specific concerns */}
          {request.specificConcerns && (
            <div>
              <p className="text-[10px] font-bold text-charcoal-400 uppercase tracking-wider mb-2">
                Specific Concerns
              </p>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-charcoal-700 leading-relaxed">
                {request.specificConcerns}
              </div>
            </div>
          )}

          {/* On-ground contact */}
          {request.onGroundContact && (
            <div>
              <p className="text-[10px] font-bold text-charcoal-400 uppercase tracking-wider mb-2">
                On-Ground Contact
              </p>
              <div className="flex items-center gap-3 bg-charcoal-50 rounded-xl px-4 py-3">
                <svg className="w-4 h-4 text-charcoal-400 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/>
                </svg>
                <span className="text-sm font-medium text-charcoal-700">{request.onGroundContact}</span>
              </div>
            </div>
          )}

          {/* ── Uploaded files ──────────────────────────────────────────── */}
          {files.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-[10px] font-bold text-charcoal-400 uppercase tracking-wider">
                  Attached Files
                </p>
                <span className="text-[10px] font-bold text-charcoal-400 bg-charcoal-100 px-2 py-0.5 rounded-full">
                  {files.length} file{files.length > 1 ? "s" : ""}
                </span>
              </div>
              <FileGallery files={files} />
            </div>
          )}

          {/* ── Status updater ──────────────────────────────────────────── */}
          {!isConverted && (
            <div>
              <p className="text-[10px] font-bold text-charcoal-400 uppercase tracking-wider mb-3">
                Update Status
              </p>
              <div className="flex flex-wrap gap-2">
                {STATUS_ORDER.filter(s => s !== "CONVERTED").map(s => (
                  <button
                    key={s}
                    onClick={() => handleStatus(s)}
                    disabled={pending}
                    className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
                      current === s
                        ? "bg-charcoal-950 border-charcoal-950 text-white"
                        : "border-charcoal-200 text-charcoal-600 hover:border-charcoal-400 hover:text-charcoal-900"
                    }`}
                  >
                    {STATUS_CONFIG[s].label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── Convert to Project ──────────────────────────────────────── */}
          {isConverted && convertedProjectId ? (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-4 h-4 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M20 6L9 17l-5-5"/>
                </svg>
                <p className="font-semibold text-emerald-800 text-sm">Converted to project</p>
              </div>
              <Link href={`/admin/projects/${convertedProjectId}`}
                className="text-sm text-emerald-700 hover:text-emerald-900 underline font-medium">
                View project →
              </Link>
            </div>
          ) : isConverted ? (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
              <p className="font-semibold text-emerald-800 text-sm">This request has been converted to a project.</p>
              <Link href="/admin/projects" className="text-sm text-emerald-700 hover:text-emerald-900 underline mt-1 inline-block">
                View all projects →
              </Link>
            </div>
          ) : (
            <div className="border border-charcoal-200 rounded-xl p-4 space-y-3">
              <p className="text-[10px] font-bold text-charcoal-400 uppercase tracking-wider">
                Convert to Project
              </p>
              <p className="text-xs text-charcoal-500 leading-relaxed">
                Creates a live project + client account. Optionally assign an inspector immediately.
              </p>
              <div>
                <label className="text-xs font-semibold text-charcoal-500 block mb-1.5">
                  Assign inspector (optional)
                </label>
                <select
                  value={selectedInspector}
                  onChange={e => setSelectedInspector(e.target.value)}
                  className="w-full px-3 py-2 border border-charcoal-200 rounded-xl text-sm text-charcoal-800 bg-white focus:outline-none focus:ring-2 focus:ring-orange-400"
                >
                  <option value="">— Assign later —</option>
                  {inspectors.map(ins => (
                    <option key={ins.id} value={ins.id}>{ins.name ?? ins.email}</option>
                  ))}
                </select>
              </div>
              {convertError && <p className="text-red-600 text-xs">{convertError}</p>}
              <button
                onClick={handleConvert}
                disabled={converting}
                className="w-full flex items-center justify-center gap-2 bg-charcoal-950 hover:bg-charcoal-800 disabled:opacity-60 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"
              >
                {converting ? "Converting…" : (
                  <>
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"/>
                    </svg>
                    Convert to Project
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* ── Footer — actions + image thumbnails ─────────────────────────── */}
        <div className="border-t border-charcoal-100 flex-shrink-0">

          {/* Image strip — shown when client uploaded photos */}
          {images.length > 0 && (
            <div className="px-6 pt-4 pb-3">
              <p className="text-[10px] font-bold text-charcoal-400 uppercase tracking-wider mb-2">
                {images.length} Photo{images.length > 1 ? "s" : ""} from client
              </p>
              <FileGallery files={images} compact />
            </div>
          )}

          {/* Action buttons */}
          <div className="px-6 py-4 flex gap-2.5">
            <a
              href={`mailto:${request.email}?subject=Re: Your GRUTH Verification Request — ${request.serviceType}`}
              className="flex-1 inline-flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
              </svg>
              Email
            </a>
            {request.phone && (
              <a
                href={`https://wa.me/${request.phone.replace(/\D/g, "")}?text=${encodeURIComponent(
                  `Hi ${request.name.split(" ")[0]}, this is GRUTH regarding your ${request.serviceType} verification request.`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1db955] text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                WhatsApp
              </a>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

// ─── RequestsInbox ────────────────────────────────────────────────────────────

export default function RequestsInbox() {
  const [requests,   setRequests]   = useState<VerificationRequest[]>([]);
  const [inspectors, setInspectors] = useState<Inspector[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [filter,     setFilter]     = useState<RequestStatus | "ALL">("ALL");
  const [selected,   setSelected]   = useState<VerificationRequest | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/verification-requests").then(r => r.json()),
      fetch("/api/admin/inspectors").then(r => r.json()),
    ])
      .then(([reqData, insData]) => {
        setRequests(reqData.requests ?? []);
        setInspectors(insData.inspectors ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleStatusChange = (id: string, status: RequestStatus) => {
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r));
    if (selected?.id === id) setSelected(prev => prev ? { ...prev, status } : null);
  };

  const filtered   = filter === "ALL" ? requests : requests.filter(r => r.status === filter);
  const newCount   = requests.filter(r => r.status === "NEW").length;
  const counts     = STATUS_ORDER.reduce((acc, s) => {
    acc[s] = requests.filter(r => r.status === s).length;
    return acc;
  }, {} as Record<RequestStatus, number>);

  return (
    <>
      <div className="bg-white rounded-2xl border border-charcoal-100 overflow-hidden">

        {/* Header */}
        <div className="px-5 sm:px-6 py-4 border-b border-charcoal-100 flex items-center justify-between flex-wrap gap-3">
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="font-display font-semibold text-charcoal-950">Verification Requests</h2>
              {newCount > 0 && (
                <span className="inline-flex items-center gap-1 bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 bg-white/60 rounded-full animate-pulse" />
                  {newCount} new
                </span>
              )}
            </div>
            <p className="text-xs text-charcoal-400 mt-0.5">{requests.length} total from the intake form</p>
          </div>

          {/* Filter tabs */}
          <div className="flex items-center gap-1 flex-wrap">
            <button
              onClick={() => setFilter("ALL")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                filter === "ALL" ? "bg-charcoal-950 text-white" : "text-charcoal-500 hover:bg-charcoal-100"
              }`}
            >
              All ({requests.length})
            </button>
            {STATUS_ORDER.map(s => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  filter === s ? "bg-charcoal-950 text-white" : "text-charcoal-500 hover:bg-charcoal-100"
                }`}
              >
                {STATUS_CONFIG[s].label} ({counts[s]})
              </button>
            ))}
          </div>
        </div>

        {/* List */}
        {loading ? (
          <div className="px-6 py-16 text-center text-charcoal-400 text-sm">Loading requests…</div>
        ) : filtered.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <div className="w-12 h-12 bg-charcoal-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="text-charcoal-300">
                <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
              </svg>
            </div>
            <p className="text-charcoal-400 text-sm">No requests yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-charcoal-50">
            {filtered.map(req => {
              const files  = parseFiles(req.filesJson);
              const images = files.filter(isImage);

              return (
                <button
                  key={req.id}
                  onClick={() => setSelected(req)}
                  className={`w-full text-left px-5 sm:px-6 py-4 hover:bg-orange-50/30 transition-colors group flex items-start gap-4 ${
                    req.status === "NEW" ? "bg-orange-50/20" : ""
                  }`}
                >
                  {/* Avatar */}
                  <div className="w-9 h-9 bg-charcoal-950 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs font-bold">
                      {req.name.charAt(0).toUpperCase()}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <span className="font-semibold text-charcoal-900 text-sm group-hover:text-orange-600 transition-colors">
                          {req.name}
                        </span>
                        {req.status === "NEW" && (
                          <span className="ml-2 w-1.5 h-1.5 bg-orange-500 rounded-full inline-block animate-pulse" />
                        )}
                        <span className="block text-xs text-charcoal-400 mt-0.5 truncate">
                          {req.email}{req.country ? ` · ${req.country}` : ""}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <StatusBadge status={req.status} />
                        <span className="text-[11px] text-charcoal-400 hidden sm:inline">
                          {timeAgo(req.createdAt)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      <span className="text-xs font-medium text-charcoal-600 bg-charcoal-100 px-2 py-0.5 rounded-full">
                        {req.serviceType}
                      </span>
                      <span className="text-xs text-charcoal-400 truncate">
                        {req.projectLocation}
                      </span>
                      {req.urgency && req.urgency !== "standard" && (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${URGENCY_LABELS[req.urgency]?.color ?? ""}`}>
                          {URGENCY_LABELS[req.urgency]?.label}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-charcoal-500 mt-1.5 line-clamp-1">{req.description}</p>

                    {/* Image thumbnails in row */}
                    {images.length > 0 && (
                      <div className="flex items-center gap-1.5 mt-2">
                        {images.slice(0, 4).map((img, i) => (
                          <div key={i} className="relative w-8 h-8 rounded-lg overflow-hidden flex-shrink-0 bg-charcoal-100 border border-charcoal-200">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={img.url} alt={img.name} className="w-full h-full object-cover" />
                          </div>
                        ))}
                        {images.length > 4 && (
                          <div className="w-8 h-8 rounded-lg bg-charcoal-100 border border-charcoal-200 flex items-center justify-center flex-shrink-0">
                            <span className="text-[10px] font-bold text-charcoal-500">+{images.length - 4}</span>
                          </div>
                        )}
                        <span className="text-[10px] text-charcoal-400 ml-0.5">
                          {images.length} photo{images.length > 1 ? "s" : ""}
                        </span>
                      </div>
                    )}
                  </div>

                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                    className="text-charcoal-300 group-hover:text-orange-400 flex-shrink-0 mt-2 transition-colors">
                    <path d="M9 18l6-6-6-6"/>
                  </svg>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {selected && (
        <RequestDrawer
          request={selected}
          inspectors={inspectors}
          onClose={() => setSelected(null)}
          onStatusChange={handleStatusChange}
        />
      )}
    </>
  );
}