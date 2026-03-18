"use client";
// src/components/home/RequestVerificationForm.tsx

import React, { useState, useRef, useCallback } from "react";
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";
import type { E164Number } from "libphonenumber-js";
import "react-phone-number-input/style.css";
import Select from "react-select";
import { KENYA_COUNTIES } from "@/app/constants";

// ─── Types ────────────────────────────────────────────────────────────────────

interface FormState {
  name: string;
  email: string;
  phone: E164Number | "";
  projectLocation: string;
  county: string;
  countyOption: { value: string; label: string } | null;
  serviceType: string;
  serviceOption: { value: string; label: string } | null;
  urgency: "urgent" | "standard" | "flexible";
  description: string;
  specificConcerns: string;
  onGroundContact: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const SERVICE_OPTIONS = [
  {
    value: "Construction Verification",
    label: "🏗️  Construction Verification",
  },
  {
    value: "Land & Property Verification",
    label: "🏡  Land & Property Verification",
  },
  {
    value: "Wedding / Event Verification",
    label: "💒  Wedding / Event Verification",
  },
  { value: "Funeral Event Oversight", label: "🕊️  Funeral Event Oversight" },
  {
    value: "Business & Investment Verification",
    label: "📊  Business & Investment Verification",
  },
  {
    value: "Material Price Intelligence",
    label: "🧱  Material Price Intelligence",
  },
  { value: "Other", label: "📋  Other" },
];

const URGENCY_OPTIONS = [
  { value: "urgent", label: "Urgent", sub: "48 hrs", dot: "bg-red-400" },
  { value: "standard", label: "Standard", sub: "1 week", dot: "bg-amber-400" },
  {
    value: "flexible",
    label: "Flexible",
    sub: "2+ weeks",
    dot: "bg-emerald-400",
  },
] as const;

const STEP_LABELS = ["Contact", "Location", "Details", "Upload"] as const;

// ─── Shared select styles ─────────────────────────────────────────────────────

function buildSelectStyles(hasError = false) {
  return {
    control: (b: any, s: any) => ({
      ...b,
      minHeight: "44px",
      borderRadius: "0.75rem",
      fontSize: "14px",
      fontFamily: "var(--font-body,'DM Sans',system-ui,sans-serif)",
      background: "#fff",
      border: `1px solid ${s.isFocused ? "transparent" : hasError ? "#fca5a5" : "#d3d2cf"}`,
      boxShadow: s.isFocused
        ? hasError
          ? "0 0 0 2px rgba(239,68,68,0.4)"
          : "0 0 0 2px rgba(249,115,22,0.45)"
        : "none",
      cursor: "pointer",
      transition: "all 0.15s ease",
      "&:hover": { borderColor: s.isFocused ? "transparent" : "#b5b3ae" },
    }),
    valueContainer: (b: any) => ({ ...b, padding: "0 12px", gap: "4px" }),
    singleValue: (b: any) => ({
      ...b,
      color: "#3d3b36",
      fontSize: "14px",
      fontFamily: "var(--font-body,'DM Sans',system-ui,sans-serif)",
    }),
    placeholder: (b: any) => ({
      ...b,
      color: "#9ca3af",
      fontSize: "14px",
      fontFamily: "var(--font-body,'DM Sans',system-ui,sans-serif)",
    }),
    input: (b: any) => ({
      ...b,
      color: "#3d3b36",
      margin: 0,
      padding: 0,
      fontSize: "14px",
      fontFamily: "var(--font-body,'DM Sans',system-ui,sans-serif)",
    }),
    indicatorSeparator: () => ({ display: "none" }),
    dropdownIndicator: (b: any, s: any) => ({
      ...b,
      color: s.isFocused ? "#f97316" : "#9ca3af",
      padding: "0 10px 0 0",
      transform: s.selectProps.menuIsOpen ? "rotate(180deg)" : "rotate(0deg)",
      transition: "color 0.15s, transform 0.2s",
      "&:hover": { color: "#f97316" },
    }),
    clearIndicator: (b: any) => ({
      ...b,
      color: "#9ca3af",
      padding: "0 6px 0 0",
      "&:hover": { color: "#f97316" },
    }),
    menu: (b: any) => ({
      ...b,
      borderRadius: "0.75rem",
      border: "1px solid #e5e7eb",
      boxShadow: "0 8px 30px rgba(0,0,0,0.08)",
      background: "#fff",
      marginTop: "6px",
      zIndex: 60,
      overflow: "hidden",
      fontFamily: "var(--font-body,'DM Sans',system-ui,sans-serif)",
    }),
    menuList: (b: any) => ({ ...b, padding: "4px", maxHeight: "240px" }),
    option: (b: any, s: any) => ({
      ...b,
      borderRadius: "0.5rem",
      fontSize: "14px",
      padding: "9px 12px",
      cursor: "pointer",
      fontFamily: "var(--font-body,'DM Sans',system-ui,sans-serif)",
      background: s.isSelected
        ? "#f97316"
        : s.isFocused
          ? "#fff7ed"
          : "transparent",
      color: s.isSelected ? "#fff" : s.isFocused ? "#c2570d" : "#3d3b36",
      "&:active": { background: "#fed7aa" },
    }),
    noOptionsMessage: (b: any) => ({
      ...b,
      fontSize: "13px",
      color: "#9ca3af",
    }),
  };
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return (
    <p className="flex items-center gap-1 text-red-500 text-xs mt-1.5">
      <svg
        className="w-3 h-3 flex-shrink-0"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M12 8v4M12 16h.01" />
      </svg>
      {msg}
    </p>
  );
}

function StepIndicator({ step, total }: { step: number; total: number }) {
  return (
    <div className="mb-7">
      <div className="flex items-center">
        {Array.from({ length: total }, (_, i) => {
          const n = i + 1;
          const done = step > n;
          const active = step === n;
          return (
            <React.Fragment key={n}>
              {i > 0 && (
                <div
                  className={`flex-1 h-0.5 transition-colors duration-300 ${done ? "bg-orange-400" : "bg-charcoal-100"}`}
                />
              )}
              <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-200 ${
                    done
                      ? "bg-emerald-500 text-white"
                      : active
                        ? "bg-orange-500 text-white shadow-md shadow-orange-200"
                        : "bg-charcoal-100 text-charcoal-400"
                  }`}
                >
                  {done ? (
                    <svg
                      className="w-3.5 h-3.5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                    >
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  ) : (
                    n
                  )}
                </div>
                <span
                  className={`text-[10px] font-semibold hidden sm:block leading-none ${
                    active
                      ? "text-orange-600"
                      : done
                        ? "text-charcoal-400"
                        : "text-charcoal-300"
                  }`}
                >
                  {STEP_LABELS[i]}
                </span>
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

function BackBtn({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-sm font-medium text-charcoal-400 hover:text-charcoal-700 flex items-center gap-1.5 transition-colors flex-shrink-0"
    >
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M19 12H5M12 19l-7-7 7-7" />
      </svg>
      Back
    </button>
  );
}

function FileUpload({
  files,
  onChange,
}: {
  files: File[];
  onChange: (f: File[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const dropped = Array.from(e.dataTransfer.files).filter(
      (f) =>
        f.type.startsWith("image/") ||
        f.type === "application/pdf" ||
        f.type.startsWith("video/"),
    );
    onChange([...files, ...dropped].slice(0, 10));
  };

  const handleSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange([...files, ...Array.from(e.target.files ?? [])].slice(0, 10));
    if (inputRef.current) inputRef.current.value = "";
  };

  const fmt = (b: number) =>
    b < 1024
      ? `${b}B`
      : b < 1024 ** 2
        ? `${(b / 1024).toFixed(0)}KB`
        : `${(b / 1024 ** 2).toFixed(1)}MB`;

  const icon = (f: File) =>
    f.type.startsWith("image/")
      ? "🖼️"
      : f.type === "application/pdf"
        ? "📄"
        : f.type.startsWith("video/")
          ? "🎬"
          : "📎";

  return (
    <div>
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className="border-2 border-dashed border-charcoal-200 rounded-xl p-6 text-center cursor-pointer hover:border-orange-400 hover:bg-orange-50/30 transition-all group"
      >
        <div className="w-10 h-10 bg-charcoal-100 group-hover:bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-2.5 transition-colors">
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
          Drop files or <span className="text-orange-600">browse</span>
        </p>
        <p className="text-xs text-charcoal-400 mt-0.5">
          Photos, PDFs, videos · max 10 files
        </p>
        <input
          ref={inputRef}
          type="file"
          multiple
          className="hidden"
          accept="image/*,application/pdf,video/*"
          onChange={handleSelect}
        />
      </div>
      {files.length > 0 && (
        <ul className="mt-3 space-y-1.5">
          {files.map((f, i) => (
            <li
              key={i}
              className="flex items-center gap-3 bg-charcoal-50 rounded-lg px-3 py-2"
            >
              <span className="text-base flex-shrink-0">{icon(f)}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-charcoal-800 truncate">
                  {f.name}
                </p>
                <p className="text-xs text-charcoal-400">{fmt(f.size)}</p>
              </div>
              <button
                type="button"
                onClick={() => onChange(files.filter((_, idx) => idx !== i))}
                className="w-5 h-5 flex items-center justify-center rounded-full text-charcoal-400 hover:bg-red-100 hover:text-red-500 transition-colors flex-shrink-0"
              >
                <svg
                  className="w-3 h-3"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ─── Main form component ──────────────────────────────────────────────────────

export default function RequestVerificationForm() {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    phone: "",
    projectLocation: "",
    county: "",
    countyOption: null,
    serviceType: "",
    serviceOption: null,
    urgency: "standard",
    description: "",
    specificConcerns: "",
    onGroundContact: "",
  });

  const set = useCallback(
    (field: string, value: any) => setForm((p) => ({ ...p, [field]: value })),
    [],
  );

  const validators: Record<number, () => Record<string, string>> = {
    1: () => {
      const e: Record<string, string> = {};
      if (!form.name.trim()) e.name = "Full name is required";
      if (!form.email.trim()) e.email = "Email is required";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
        e.email = "Enter a valid email";
      if (!form.phone) e.phone = "Phone number is required";
      else if (!isValidPhoneNumber(form.phone as string))
        e.phone = "Enter a valid phone number";
      return e;
    },
    2: () => {
      const e: Record<string, string> = {};
      if (!form.serviceType) e.serviceType = "Please select a service type";
      if (!form.county) e.county = "Please select a county";
      if (!form.projectLocation.trim())
        e.projectLocation = "Project location is required";
      return e;
    },
    3: () => {
      const e: Record<string, string> = {};
      if (!form.description.trim())
        e.description = "Please describe your project";
      else if (form.description.trim().length < 40)
        e.description = `${40 - form.description.trim().length} more characters needed`;
      return e;
    },
    4: () => ({}),
  };

  const next = () => {
    const e = validators[step]();
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }
    setErrors({});
    setStep((s) => Math.min(s + 1, 4) as 1 | 2 | 3 | 4);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const back = () => {
    setErrors({});
    setStep((s) => Math.max(s - 1, 1) as 1 | 2 | 3 | 4);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const urgencyLabel = URGENCY_OPTIONS.find((u) => u.value === form.urgency);
    const payload = {
      name: form.name,
      email: form.email,
      phone: form.phone || undefined,
      projectLocation: form.projectLocation,
      county: form.county || undefined,
      serviceType: form.serviceType,
      urgency: form.urgency,
      specificConcerns: form.specificConcerns || undefined,
      onGroundContact: form.onGroundContact || undefined,
      description: [
        form.description,
        form.specificConcerns
          ? `\nSpecific concerns:\n${form.specificConcerns}`
          : "",
        `Urgency: ${urgencyLabel?.label} (${urgencyLabel?.sub})`,
        form.onGroundContact
          ? `On-ground contact: ${form.onGroundContact}`
          : "",
      ]
        .filter(Boolean)
        .join("\n\n"),
    };
    try {
      const res = await fetch("/api/verification-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setSuccess(true);
      } else {
        const d = await res.json();
        setErrors({ submit: d.error ?? "Submission failed." });
      }
    } catch {
      setErrors({ submit: "Network error. Please check your connection." });
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-md w-full mx-auto px-4 py-20 text-center">
        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 ring-8 ring-emerald-50">
          <svg
            className="w-10 h-10 text-emerald-600"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </div>
        <h1 className="font-display text-3xl font-bold text-charcoal-950 mb-3 tracking-tight">
          Request received.
        </h1>
        <p className="text-charcoal-600 leading-relaxed mb-2">
          Our team will contact <strong>{form.name.split(" ")[0]}</strong>{" "}
          within <strong>2 business hours</strong> via email and WhatsApp.
        </p>
        <p className="text-charcoal-400 text-sm mb-8">
          Confirmation sent to{" "}
          <span className="font-medium text-charcoal-600">{form.email}</span>
        </p>
        <div className="grid grid-cols-3 gap-3 card p-5 mb-8">
          {[
            { icon: "📋", label: "Request logged" },
            { icon: "🔍", label: "Matching inspector" },
            { icon: "📞", label: "We'll call you" },
          ].map(({ icon, label }) => (
            <div key={label} className="text-center">
              <div className="text-2xl mb-1.5">{icon}</div>
              <div className="text-xs font-medium text-charcoal-500">
                {label}
              </div>
            </div>
          ))}
        </div>
        <a href="/" className="btn-secondary inline-flex">
          Back to Home
        </a>
      </div>
    );
  }

  return (
    <>
      <style>{`
        .rpi-wrapper .PhoneInput { display:flex;align-items:center;width:100%;padding:0 14px;height:44px;border:1px solid #d3d2cf;border-radius:0.75rem;background:#fff;font-family:var(--font-body,'DM Sans',system-ui,sans-serif);font-size:14px;color:#3d3b36;transition:all 0.15s ease;gap:10px; }
        .rpi-wrapper .PhoneInput:focus-within { border-color:transparent;box-shadow:0 0 0 2px rgba(249,115,22,0.45); }
        .rpi-wrapper.error .PhoneInput { border-color:#fca5a5; }
        .rpi-wrapper.error .PhoneInput:focus-within { border-color:transparent;box-shadow:0 0 0 2px rgba(239,68,68,0.4); }
        .rpi-wrapper .PhoneInputCountry { display:flex;align-items:center;gap:6px;flex-shrink:0;padding-right:10px;border-right:1px solid #e5e7eb;position:relative;cursor:pointer; }
        .rpi-wrapper .PhoneInputCountryFlag { width:20px;height:14px;border-radius:2px;overflow:hidden; }
        .rpi-wrapper .PhoneInputCountrySelect { position:absolute;inset:0;opacity:0;cursor:pointer;z-index:2; }
        .rpi-wrapper .PhoneInputCountrySelectArrow { width:5px;height:5px;border-right:1.5px solid #9ca3af;border-bottom:1.5px solid #9ca3af;transform:rotate(45deg) translateY(-2px);margin-left:2px; }
        .rpi-wrapper .PhoneInputInput { flex:1;border:none;outline:none;background:transparent;font-family:var(--font-body,'DM Sans',system-ui,sans-serif);font-size:14px;color:#3d3b36;padding:0;min-width:0; }
        .rpi-wrapper .PhoneInputInput::placeholder { color:#9ca3af; }
      `}</style>

      <div className="max-w-xl mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-2xl border border-charcoal-100 shadow-sm p-6 sm:p-8">
          <StepIndicator step={step} total={4} />

          <form onSubmit={handleSubmit} noValidate>
            {/* ── STEP 1: Contact ───────────────────────────────────────── */}
            {step === 1 && (
              <div className="space-y-4">
                <div className="mb-5">
                  <h2 className="font-display text-xl font-bold text-charcoal-950 mb-1">
                    Your contact details
                  </h2>
                  <p className="text-charcoal-500 text-sm">
                    We'll use these to send your confirmation and quote.
                  </p>
                </div>

                <div>
                  <label className="label">Full Name *</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => set("name", e.target.value)}
                    className={`input-field ${errors.name ? "!border-red-300 focus:!ring-red-400/50" : ""}`}
                    placeholder="James Mwangi"
                    autoComplete="name"
                  />
                  <FieldError msg={errors.name} />
                </div>

                <div>
                  <label className="label">Email *</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => set("email", e.target.value)}
                    className={`input-field ${errors.email ? "!border-red-300 focus:!ring-red-400/50" : ""}`}
                    placeholder="james@example.com"
                    autoComplete="email"
                  />
                  <FieldError msg={errors.email} />
                </div>

                <div>
                  <label className="label">Phone / WhatsApp *</label>
                  <div className={`rpi-wrapper ${errors.phone ? "error" : ""}`}>
                    <PhoneInput
                      international
                      defaultCountry="GB"
                      countryCallingCodeEditable={false}
                      value={form.phone as E164Number}
                      onChange={(val) => set("phone", val ?? "")}
                      placeholder="Enter phone number"
                    />
                  </div>
                  <FieldError msg={errors.phone} />
                  <p className="text-xs text-charcoal-400 mt-1">
                    Used for WhatsApp project updates
                  </p>
                </div>

                <button
                  type="button"
                  onClick={next}
                  className="btn-primary w-full justify-center py-3.5 mt-1"
                >
                  Continue
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            )}

            {/* ── STEP 2: Service & Location ────────────────────────────── */}
            {step === 2 && (
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-display text-xl font-bold text-charcoal-950 mb-1">
                      Service & Location
                    </h2>
                    <p className="text-charcoal-500 text-sm">
                      What needs verifying and where?
                    </p>
                  </div>
                  <BackBtn onClick={back} />
                </div>

                <div>
                  <label className="label">Service Type *</label>
                  <Select
                    instanceId="service-select"
                    options={SERVICE_OPTIONS}
                    value={form.serviceOption}
                    onChange={(opt) => {
                      set("serviceOption", opt ?? null);
                      set("serviceType", opt?.value ?? "");
                    }}
                    placeholder="Select a service…"
                    isSearchable={false}
                    styles={buildSelectStyles(!!errors.serviceType)}
                    menuPortalTarget={
                      typeof document !== "undefined"
                        ? document.body
                        : undefined
                    }
                    menuPosition="fixed"
                  />
                  <FieldError msg={errors.serviceType} />
                </div>

                <div>
                  <label className="label">Kenya County *</label>
                  <Select
                    instanceId="county-select"
                    options={KENYA_COUNTIES}
                    value={form.countyOption}
                    onChange={(opt) => {
                      set("countyOption", opt ?? null);
                      set("county", opt?.value ?? "");
                    }}
                    placeholder="Select county…"
                    isSearchable
                    isClearable
                    styles={buildSelectStyles(!!errors.county)}
                    noOptionsMessage={() => "No county found"}
                    menuPortalTarget={
                      typeof document !== "undefined"
                        ? document.body
                        : undefined
                    }
                    menuPosition="fixed"
                  />
                  <FieldError msg={errors.county} />
                </div>

                <div>
                  <label className="label">Specific Location *</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-charcoal-400">
                      <svg
                        width="15"
                        height="15"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </span>
                    <input
                      type="text"
                      value={form.projectLocation}
                      onChange={(e) => set("projectLocation", e.target.value)}
                      className={`input-field pl-10 ${errors.projectLocation ? "!border-red-300 focus:!ring-red-400/50" : ""}`}
                      placeholder="e.g. Kiambu Road, Nairobi · Juja, Kiambu County"
                    />
                  </div>
                  <FieldError msg={errors.projectLocation} />
                </div>

                <button
                  type="button"
                  onClick={next}
                  className="btn-primary w-full justify-center py-3.5"
                >
                  Continue
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            )}

            {/* ── STEP 3: Details ───────────────────────────────────────── */}
            {step === 3 && (
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-display text-xl font-bold text-charcoal-950 mb-1">
                      Project details
                    </h2>
                    <p className="text-charcoal-500 text-sm">
                      Tell us exactly what needs verifying.
                    </p>
                  </div>
                  <BackBtn onClick={back} />
                </div>

                <div>
                  <label className="label flex items-baseline justify-between">
                    <span>Project Description *</span>
                    <span
                      className={`text-xs font-normal ${form.description.length >= 40 ? "text-emerald-600" : "text-charcoal-400"}`}
                    >
                      {form.description.length >= 40
                        ? "✓ Good to go"
                        : `${form.description.length}/40 min`}
                    </span>
                  </label>
                  <textarea
                    rows={5}
                    value={form.description}
                    onChange={(e) => set("description", e.target.value)}
                    className={`input-field resize-none ${errors.description ? "!border-red-300 focus:!ring-red-400/50" : ""}`}
                    placeholder="Describe what needs verifying — the current stage, materials or contractors involved, and the outcome you need."
                  />
                  <FieldError msg={errors.description} />
                </div>

                <div>
                  <label className="label">
                    Specific Concerns{" "}
                    <span className="font-normal text-charcoal-400 text-xs">
                      optional
                    </span>
                  </label>
                  <textarea
                    rows={2}
                    value={form.specificConcerns}
                    onChange={(e) => set("specificConcerns", e.target.value)}
                    className="input-field resize-none"
                    placeholder="e.g. Suspect materials are substandard, title deed has disputed signatures…"
                  />
                </div>

                <div>
                  <label className="label">Urgency</label>
                  <div className="grid grid-cols-3 gap-2">
                    {URGENCY_OPTIONS.map(({ value, label, sub, dot }) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => set("urgency", value)}
                        className={`flex flex-col items-center gap-1.5 px-2 py-3 rounded-xl border text-center transition-all duration-150 ${
                          form.urgency === value
                            ? "border-orange-400 bg-orange-50"
                            : "border-charcoal-100 hover:border-orange-200"
                        }`}
                      >
                        <span
                          className={`w-2 h-2 rounded-full flex-shrink-0 ${dot}`}
                        />
                        <span
                          className={`text-xs font-bold leading-tight ${form.urgency === value ? "text-orange-700" : "text-charcoal-800"}`}
                        >
                          {label}
                        </span>
                        <span className="text-[10px] text-charcoal-400 leading-tight">
                          {sub}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="label">
                    On-ground Contact{" "}
                    <span className="font-normal text-charcoal-400 text-xs">
                      optional
                    </span>
                  </label>
                  <input
                    type="text"
                    value={form.onGroundContact}
                    onChange={(e) => set("onGroundContact", e.target.value)}
                    className="input-field"
                    placeholder="e.g. Site foreman: John Kamau, +254 712 000000"
                  />
                  <p className="text-xs text-charcoal-400 mt-1.5">
                    Anyone our inspector should coordinate with on arrival.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={next}
                  className="btn-primary w-full justify-center py-3.5"
                >
                  Continue to Upload
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            )}

            {/* ── STEP 4: Files & Submit ────────────────────────────────── */}
            {step === 4 && (
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-display text-xl font-bold text-charcoal-950 mb-1">
                      Supporting files
                    </h2>
                    <p className="text-charcoal-500 text-sm">
                      Attach plans, photos or documents to help your inspector.
                    </p>
                  </div>
                  <BackBtn onClick={back} />
                </div>

                <FileUpload files={uploadedFiles} onChange={setUploadedFiles} />

                <p className="text-xs text-charcoal-400">
                  Files are uploaded securely and only shared with your assigned
                  inspector and the GRUTH team.
                </p>

                <div className="rounded-2xl bg-charcoal-950 p-5">
                  <p className="font-semibold text-white text-sm mb-3">
                    Request summary
                  </p>
                  <div className="space-y-1.5 text-sm">
                    {[
                      ["Service", form.serviceType || "—"],
                      ["Location", form.projectLocation || "—"],
                      ["County", form.county || "—"],
                      [
                        "Urgency",
                        URGENCY_OPTIONS.find((u) => u.value === form.urgency)
                          ?.label ?? "—",
                      ],
                    ].map(([k, v]) => (
                      <div key={k} className="flex gap-3">
                        <span className="text-charcoal-500 w-20 flex-shrink-0">
                          {k}
                        </span>
                        <span className="text-charcoal-200 truncate">{v}</span>
                      </div>
                    ))}
                    {uploadedFiles.length > 0 && (
                      <div className="flex gap-3">
                        <span className="text-charcoal-500 w-20 flex-shrink-0">
                          Files
                        </span>
                        <span className="text-charcoal-200">
                          {uploadedFiles.length} attached
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {errors.submit && (
                  <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
                    <svg
                      className="w-4 h-4 flex-shrink-0 mt-0.5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <path d="M12 8v4M12 16h.01" />
                    </svg>
                    {errors.submit}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full justify-center py-3.5 text-base disabled:opacity-60"
                >
                  {loading ? (
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
                      Submitting…
                    </span>
                  ) : (
                    <>
                      Submit Verification Request
                      <svg
                        width="15"
                        height="15"
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

                <p className="text-xs text-charcoal-400 text-center leading-relaxed">
                  By submitting you agree to our{" "}
                  <a
                    href="/privacy"
                    className="underline hover:text-orange-600"
                  >
                    Privacy Policy
                  </a>
                  . Your information is kept strictly confidential.
                </p>
              </div>
            )}
          </form>
        </div>
      </div>
    </>
  );
}
