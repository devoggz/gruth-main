"use client";
// src/components/home/RequestVerificationForm.tsx

import React, { useState, useRef, useCallback, useEffect } from "react";
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";
import type { E164Number } from "libphonenumber-js";
import "react-phone-number-input/style.css";
import Select from "react-select";
import Link from "next/link";
import { KENYA_COUNTIES } from "@/app/constants";
import { useUploadThing } from "@/utils/uploadthing";
import KenyaLocationPicker, { type LocationValue } from "@/components/shared/KenyaLocationPicker";
import {
  SERVICES,
  calculatePrice,
  COUNTY_TIERS,
  COUNTY_TIER_SURCHARGE,
  URGENCY_SURCHARGE,
  KES_TO_USD,
  KES_TO_GBP,
} from "@/data/pricing";

// ─── Types ────────────────────────────────────────────────────────────────────

interface UserProfile {
  id:       string;
  name:     string | null;
  email:    string;
  phone:    string | null;
  whatsapp: string | null;
  country:  string | null;
  image?:   string | null;
}

interface Props {
  userProfile?:    UserProfile | null;
  isAuthenticated: boolean;
  profileComplete: boolean;
}

interface FormState {
  name:             string;
  email:            string;
  phone:            E164Number | "";
  projectLocation:  string;
  county:           string;
  countyOption:     { value: string; label: string } | null;
  serviceType:      string;
  serviceId:        string;
  serviceOption:    { value: string; label: string } | null;
  urgency:          "urgent" | "standard" | "flexible";
  description:      string;
  specificConcerns: string;
  onGroundContact:  string;
  locationValue:    LocationValue | null;
}

// ─── Service options — pulled from pricing data ───────────────────────────────

const SERVICE_OPTIONS = SERVICES.map(s => ({
  value: s.name,
  label: `${s.emoji}  ${s.name}`,
  id:    s.id,
}));

const URGENCY_OPTIONS = [
  { value: "urgent",   label: "Urgent",   sub: "48 hrs",   dot: "bg-red-400"     },
  { value: "standard", label: "Standard", sub: "1 week",   dot: "bg-amber-400"   },
  { value: "flexible", label: "Flexible", sub: "2+ weeks", dot: "bg-emerald-400" },
] as const;

const STEP_LABELS_AUTH   = ["Location", "Details",  "Upload"] as const;
const STEP_LABELS_UNAUTH = ["Contact",  "Location", "Details", "Upload"] as const;

// ─── Select styles ────────────────────────────────────────────────────────────

function buildSelectStyles(hasError = false) {
  return {
    control: (b: any, s: any) => ({
      ...b,
      minHeight: "44px", borderRadius: "0.75rem", fontSize: "14px",
      fontFamily: "var(--font-body,'DM Sans',system-ui,sans-serif)",
      background: "#fff",
      border: `1px solid ${s.isFocused ? "transparent" : hasError ? "#fca5a5" : "#d3d2cf"}`,
      boxShadow: s.isFocused ? hasError ? "0 0 0 2px rgba(239,68,68,0.4)" : "0 0 0 2px rgba(249,115,22,0.45)" : "none",
      cursor: "pointer", transition: "all 0.15s ease",
      "&:hover": { borderColor: s.isFocused ? "transparent" : "#b5b3ae" },
    }),
    valueContainer:     (b: any) => ({ ...b, padding: "0 12px", gap: "4px" }),
    singleValue:        (b: any) => ({ ...b, color: "#3d3b36", fontSize: "14px", fontFamily: "var(--font-body,'DM Sans',system-ui,sans-serif)" }),
    placeholder:        (b: any) => ({ ...b, color: "#9ca3af", fontSize: "14px", fontFamily: "var(--font-body,'DM Sans',system-ui,sans-serif)" }),
    input:              (b: any) => ({ ...b, color: "#3d3b36", margin: 0, padding: 0, fontSize: "14px", fontFamily: "var(--font-body,'DM Sans',system-ui,sans-serif)" }),
    indicatorSeparator: ()       => ({ display: "none" }),
    dropdownIndicator:  (b: any, s: any) => ({
      ...b, color: s.isFocused ? "#f97316" : "#9ca3af", padding: "0 10px 0 0",
      transform: s.selectProps.menuIsOpen ? "rotate(180deg)" : "rotate(0deg)",
      transition: "color 0.15s, transform 0.2s", "&:hover": { color: "#f97316" },
    }),
    clearIndicator: (b: any) => ({ ...b, color: "#9ca3af", padding: "0 6px 0 0", "&:hover": { color: "#f97316" } }),
    menu: (b: any) => ({
      ...b, borderRadius: "0.75rem", border: "1px solid #e5e7eb",
      boxShadow: "0 8px 30px rgba(0,0,0,0.08)", background: "#fff",
      marginTop: "6px", zIndex: 60, overflow: "hidden",
      fontFamily: "var(--font-body,'DM Sans',system-ui,sans-serif)",
    }),
    menuList:        (b: any) => ({ ...b, padding: "4px", maxHeight: "240px" }),
    option:          (b: any, s: any) => ({
      ...b, borderRadius: "0.5rem", fontSize: "14px", padding: "9px 12px", cursor: "pointer",
      fontFamily: "var(--font-body,'DM Sans',system-ui,sans-serif)",
      background: s.isSelected ? "#f97316" : s.isFocused ? "#fff7ed" : "transparent",
      color: s.isSelected ? "#fff" : s.isFocused ? "#c2570d" : "#3d3b36",
      "&:active": { background: "#fed7aa" },
    }),
    noOptionsMessage: (b: any) => ({ ...b, fontSize: "13px", color: "#9ca3af" }),
  };
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return (
    <p className="flex items-center gap-1 text-red-500 text-xs mt-1.5">
      <svg className="w-3 h-3 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>
      </svg>
      {msg}
    </p>
  );
}

function StepIndicator({ step, labels }: { step: number; labels: readonly string[] }) {
  return (
    <div className="mb-7">
      <div className="flex items-center">
        {labels.map((label, i) => {
          const n = i + 1; const done = step > n; const active = step === n;
          return (
            <React.Fragment key={n}>
              {i > 0 && <div className={`flex-1 h-0.5 transition-colors duration-300 ${done ? "bg-orange-400" : "bg-charcoal-100"}`} />}
              <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-200 ${
                  done ? "bg-emerald-500 text-white" : active ? "bg-orange-500 text-white shadow-md shadow-orange-200" : "bg-charcoal-100 text-charcoal-400"
                }`}>
                  {done ? <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 6L9 17l-5-5"/></svg> : n}
                </div>
                <span className={`text-[10px] font-semibold hidden sm:block leading-none ${active ? "text-orange-600" : done ? "text-charcoal-400" : "text-charcoal-300"}`}>
                  {label}
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
    <button type="button" onClick={onClick}
      className="text-sm font-medium text-charcoal-400 hover:text-charcoal-700 flex items-center gap-1.5 transition-colors flex-shrink-0">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M19 12H5M12 19l-7-7 7-7"/>
      </svg>
      Back
    </button>
  );
}

function FileUpload({ files, onChange }: { files: File[]; onChange: (f: File[]) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const dropped = Array.from(e.dataTransfer.files).filter(
      f => f.type.startsWith("image/") || f.type === "application/pdf" || f.type.startsWith("video/")
    );
    onChange([...files, ...dropped].slice(0, 10));
  };
  const handleSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange([...files, ...Array.from(e.target.files ?? [])].slice(0, 10));
    if (inputRef.current) inputRef.current.value = "";
  };
  const fmt  = (b: number) => b < 1024 ? `${b}B` : b < 1024 ** 2 ? `${(b / 1024).toFixed(0)}KB` : `${(b / 1024 ** 2).toFixed(1)}MB`;
  const icon = (f: File)   => f.type.startsWith("image/") ? "🖼️" : f.type === "application/pdf" ? "📄" : f.type.startsWith("video/") ? "🎬" : "📎";
  return (
    <div>
      <div onDragOver={e => e.preventDefault()} onDrop={handleDrop} onClick={() => inputRef.current?.click()}
        className="border-2 border-dashed border-charcoal-200 rounded-xl p-6 text-center cursor-pointer hover:border-orange-400 hover:bg-orange-50/30 transition-all group">
        <div className="w-10 h-10 bg-charcoal-100 group-hover:bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-2.5 transition-colors">
          <svg className="w-5 h-5 text-charcoal-400 group-hover:text-orange-500 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1M16 12l-4-4m0 0l-4 4m4-4v12"/>
          </svg>
        </div>
        <p className="text-sm font-semibold text-charcoal-700 group-hover:text-orange-700 transition-colors">Drop files or <span className="text-orange-600">browse</span></p>
        <p className="text-xs text-charcoal-400 mt-0.5">Photos, PDFs, videos · max 10 files</p>
        <input ref={inputRef} type="file" multiple className="hidden" accept="image/*,application/pdf,video/*" onChange={handleSelect} />
      </div>
      {files.length > 0 && (
        <ul className="mt-3 space-y-1.5">
          {files.map((f, i) => (
            <li key={i} className="flex items-center gap-3 bg-charcoal-50 rounded-lg px-3 py-2">
              <span className="text-base flex-shrink-0">{icon(f)}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-charcoal-800 truncate">{f.name}</p>
                <p className="text-xs text-charcoal-400">{fmt(f.size)}</p>
              </div>
              <button type="button" onClick={() => onChange(files.filter((_, idx) => idx !== i))}
                className="w-5 h-5 flex items-center justify-center rounded-full text-charcoal-400 hover:bg-red-100 hover:text-red-500 transition-colors flex-shrink-0">
                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ─── Price calculator panel ───────────────────────────────────────────────────

function PricePanel({
  serviceType, county, urgency,
}: {
  serviceType: string;
  county:      string;
  urgency:     string;
}) {
  if (!serviceType) return null;

  const { baseKes, countySurcharge, urgencySurcharge, totalKes } = calculatePrice({
    serviceId: serviceType, county, urgency,
  });

  const service = SERVICES.find(s => s.name === serviceType || s.id === serviceType);
  const tier    = county ? (COUNTY_TIERS[county] ?? "secondary") : null;

  const approxUSD = Math.ceil(totalKes / KES_TO_USD);
  const approxGBP = Math.ceil(totalKes / KES_TO_GBP);

  return (
    <div className="rounded-2xl overflow-hidden border border-charcoal-200">
      {/* Header */}
      <div className="bg-charcoal-950 px-5 py-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold text-charcoal-400 uppercase tracking-widest mb-1">Price estimate</p>
            <p className="font-display text-2xl font-bold text-white">
              KES {totalKes.toLocaleString()}
            </p>
            <p className="text-charcoal-400 text-xs mt-0.5">
              ≈ ${approxUSD} USD · £{approxGBP} GBP
            </p>
          </div>
          <div className="flex-shrink-0 flex flex-col gap-1 items-end">
            {/* Payment method icons */}
            <div className="flex items-center gap-1.5">
              {/* Visa */}
              <div className="bg-[#1A1F71] text-white text-[8px] font-bold px-2 py-0.5 rounded">VISA</div>
              {/* Mastercard */}
              <div className="flex -space-x-1">
                <div className="w-4 h-4 bg-[#EB001B] rounded-full opacity-90"/>
                <div className="w-4 h-4 bg-[#F79E1B] rounded-full opacity-90"/>
              </div>
              {/* M-Pesa */}
              <div className="bg-[#00A651] text-white text-[8px] font-bold px-1.5 py-0.5 rounded">M-PESA</div>
            </div>
            <p className="text-[9px] text-charcoal-500">Powered by Paystack</p>
          </div>
        </div>
      </div>

      {/* Breakdown */}
      <div className="bg-white px-5 py-4 space-y-2.5">
        <div className="flex justify-between text-sm">
          <span className="text-charcoal-600">{service?.emoji} {service?.name ?? serviceType}</span>
          <span className="font-medium text-charcoal-900">KES {baseKes.toLocaleString()}</span>
        </div>
        {countySurcharge > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-charcoal-500">
              {county} ({tier} county surcharge)
            </span>
            <span className="text-charcoal-700">+ KES {countySurcharge.toLocaleString()}</span>
          </div>
        )}
        {urgencySurcharge > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-charcoal-500">48-hour urgent premium</span>
            <span className="text-charcoal-700">+ KES {urgencySurcharge.toLocaleString()}</span>
          </div>
        )}
        <div className="border-t border-charcoal-100 pt-2.5 flex justify-between font-semibold text-sm">
          <span className="text-charcoal-900">Total</span>
          <span className="text-charcoal-950">KES {totalKes.toLocaleString()}</span>
        </div>
      </div>

      {/* Payment methods footer */}
      <div className="bg-charcoal-50 border-t border-charcoal-100 px-5 py-3">
        <p className="text-[10px] text-charcoal-400 leading-relaxed">
          Pay by <strong className="text-charcoal-600">card</strong> (Visa, Mastercard, Amex),{" "}
          <strong className="text-charcoal-600">M-Pesa</strong> STK push, or{" "}
          <strong className="text-charcoal-600">Apple Pay</strong>. Charged in KES. No hidden fees.
          Report guaranteed or full refund.
        </p>
      </div>
    </div>
  );
}

// ─── Auth gate ────────────────────────────────────────────────────────────────

function AuthGate() {
  return (
    <div className="max-w-md mx-auto px-4">
      <div className="bg-white rounded-2xl border border-charcoal-100 shadow-sm p-8 text-center">
        <div className="w-14 h-14 bg-orange-50 border border-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
          <svg className="w-7 h-7 text-orange-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
          </svg>
        </div>
        <h2 className="font-display text-xl font-bold text-charcoal-950 mb-2 tracking-tight">Sign in to submit a request</h2>
        <p className="text-charcoal-500 text-sm leading-relaxed mb-6">
          Create a free account to submit your verification request, track progress in your dashboard, and receive notifications when your report is ready.
        </p>
        <div className="space-y-2.5 mb-7 text-left">
          {[
            { icon: "📊", text: "Track your project in real-time"                  },
            { icon: "🔔", text: "Get push notifications when reports arrive"       },
            { icon: "💬", text: "Message your inspector directly"                  },
            { icon: "📄", text: "Download PDF reports from your dashboard"         },
          ].map(({ icon, text }) => (
            <div key={text} className="flex items-center gap-3">
              <span className="text-base flex-shrink-0">{icon}</span>
              <span className="text-sm text-charcoal-600">{text}</span>
            </div>
          ))}
        </div>
        <div className="space-y-3">
          <Link href="/register?redirect=/request-verification"
            className="flex items-center justify-center gap-2 w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold text-sm px-6 py-3.5 rounded-xl transition-all hover:shadow-lg hover:shadow-orange-500/20">
            Create free account
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </Link>
          <Link href="/login?redirect=/request-verification"
            className="flex items-center justify-center w-full border border-charcoal-200 hover:border-charcoal-300 text-charcoal-700 font-medium text-sm px-6 py-3 rounded-xl transition-all">
            Sign in to existing account
          </Link>
        </div>
        <p className="text-xs text-charcoal-400 mt-5">Free account · No payment until your report is delivered</p>
      </div>
    </div>
  );
}

// ─── Profile prompt ───────────────────────────────────────────────────────────

function ProfilePrompt({ profile, onComplete }: {
  profile:    UserProfile;
  onComplete: (phone: string, country: string) => void;
}) {
  const [phone,   setPhone]   = useState<E164Number | "">(profile.phone as E164Number ?? "");
  const [country, setCountry] = useState(profile.country ?? "");
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState("");

  const handleSave = async () => {
    if (!phone || !isValidPhoneNumber(phone as string)) { setError("Enter a valid phone number"); return; }
    if (!country.trim()) { setError("Enter your country"); return; }
    setSaving(true); setError("");
    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: profile.name ?? profile.email.split("@")[0], phone, country }),
      });
      if (res.ok) { onComplete(phone as string, country); }
      else { setError("Failed to save. Please try again."); }
    } catch { setError("Network error. Please try again."); }
    finally { setSaving(false); }
  };

  return (
    <div className="max-w-md mx-auto px-4">
      <div className="bg-white rounded-2xl border border-charcoal-100 shadow-sm p-8">
        <div className="flex items-center gap-3 mb-6 pb-5 border-b border-charcoal-100">
          {profile.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={profile.image} alt={profile.name ?? "User"} referrerPolicy="no-referrer" className="w-11 h-11 rounded-full object-cover flex-shrink-0"/>
          ) : (
            <div className="w-11 h-11 bg-charcoal-950 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white text-sm font-bold">{(profile.name ?? profile.email).charAt(0).toUpperCase()}</span>
            </div>
          )}
          <div className="min-w-0">
            <p className="font-semibold text-charcoal-900 text-sm truncate">{profile.name ?? "Your account"}</p>
            <p className="text-xs text-charcoal-400 truncate">{profile.email}</p>
          </div>
          <span className="ml-auto text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-full flex-shrink-0">Signed in</span>
        </div>
        <h2 className="font-display text-lg font-bold text-charcoal-950 mb-1 tracking-tight">Complete your profile</h2>
        <p className="text-charcoal-500 text-sm leading-relaxed mb-5">We need your phone and country to send WhatsApp updates.</p>
        <div className="space-y-4">
          <div>
            <label className="label">Phone / WhatsApp *</label>
            <div className={`rpi-wrapper ${error && !phone ? "error" : ""}`}>
              <PhoneInput international defaultCountry="GB" countryCallingCodeEditable={false}
                value={phone} onChange={val => setPhone(val ?? "")} placeholder="Enter phone number"/>
            </div>
          </div>
          <div>
            <label className="label">Country of Residence *</label>
            <input type="text" value={country} onChange={e => setCountry(e.target.value)}
              className="input-field" placeholder="e.g. United Kingdom, United States"/>
          </div>
          {error && <p className="text-red-500 text-xs">{error}</p>}
          <button onClick={handleSave} disabled={saving}
            className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-semibold text-sm px-6 py-3.5 rounded-xl transition-all">
            {saving ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>Saving…</> : "Save & continue →"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Identity banner ──────────────────────────────────────────────────────────

function IdentityBanner({ profile }: { profile: UserProfile }) {
  return (
    <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 mb-6">
      {profile.image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={profile.image} alt={profile.name ?? "User"} referrerPolicy="no-referrer" className="w-8 h-8 rounded-full object-cover flex-shrink-0"/>
      ) : (
        <div className="w-8 h-8 bg-charcoal-950 rounded-full flex items-center justify-center flex-shrink-0">
          <span className="text-white text-xs font-bold">{(profile.name ?? profile.email).charAt(0).toUpperCase()}</span>
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-emerald-800 truncate">Submitting as {profile.name ?? profile.email}</p>
        <p className="text-[10px] text-emerald-600 truncate">{profile.email}</p>
      </div>
      <Link href="/dashboard/settings" className="text-[10px] font-semibold text-emerald-600 hover:text-emerald-800 transition-colors flex-shrink-0">Edit profile</Link>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function RequestVerificationForm({ userProfile, isAuthenticated, profileComplete }: Props) {
  const isPreFilled = isAuthenticated && profileComplete && !!userProfile;
  const stepLabels  = isPreFilled ? STEP_LABELS_AUTH : STEP_LABELS_UNAUTH;
  const totalSteps  = stepLabels.length;

  const [step,           setStep]           = useState(1);
  const [loading,        setLoading]        = useState(false);
  const [errors,         setErrors]         = useState<Record<string, string>>({});
  const [uploadedFiles,  setUploadedFiles]  = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<"idle" | "uploading" | "done">("idle");
  const [profileDone,    setProfileDone]    = useState(profileComplete);
  const [localPhone,     setLocalPhone]     = useState(userProfile?.phone ?? "");
  const [localCountry,   setLocalCountry]   = useState(userProfile?.country ?? "");

  const { startUpload } = useUploadThing("verificationFiles", {
    onUploadProgress: () => setUploadProgress("uploading"),
  });

  const [form, setFormState] = useState<FormState>({
    name:             userProfile?.name         ?? "",
    email:            userProfile?.email        ?? "",
    phone:            (userProfile?.phone ?? userProfile?.whatsapp ?? "") as E164Number | "",
    projectLocation:  "",
    county:           "",
    countyOption:     null,
    serviceType:      "",
    serviceId:        "",
    serviceOption:    null,
    urgency:          "standard",
    description:      "",
    specificConcerns: "",
    onGroundContact:  "",
    locationValue:    null,
  });

  const handleProfileComplete = (phone: string, country: string) => {
    setLocalPhone(phone); setLocalCountry(country); setProfileDone(true);
    setFormState(p => ({ ...p, phone: phone as E164Number }));
  };

  const set = useCallback((field: string, value: any) => setFormState(p => ({ ...p, [field]: value })), []);

  // Validators
  const validators: Record<number, () => Record<string, string>> = isPreFilled
    ? {
        1: () => {
          const e: Record<string, string> = {};
          if (!form.serviceType)             e.serviceType     = "Please select a service type";
          if (!form.county)                  e.county          = "Please select a county";
          if (!form.projectLocation.trim())  e.projectLocation = "Project location is required";
          return e;
        },
        2: () => {
          const e: Record<string, string> = {};
          if (!form.description.trim())      e.description = "Please describe your project";
          else if (form.description.trim().length < 40)
            e.description = `${40 - form.description.trim().length} more characters needed`;
          return e;
        },
        3: () => ({}),
      }
    : {
        1: () => {
          const e: Record<string, string> = {};
          if (!form.name.trim())             e.name  = "Full name is required";
          if (!form.email.trim())            e.email = "Email is required";
          else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Enter a valid email";
          if (!form.phone)                   e.phone = "Phone number is required";
          else if (!isValidPhoneNumber(form.phone as string)) e.phone = "Enter a valid phone number";
          return e;
        },
        2: () => {
          const e: Record<string, string> = {};
          if (!form.serviceType)             e.serviceType     = "Please select a service type";
          if (!form.county)                  e.county          = "Please select a county";
          if (!form.projectLocation.trim())  e.projectLocation = "Project location is required";
          return e;
        },
        3: () => {
          const e: Record<string, string> = {};
          if (!form.description.trim())      e.description = "Please describe your project";
          else if (form.description.trim().length < 40)
            e.description = `${40 - form.description.trim().length} more characters needed`;
          return e;
        },
        4: () => ({}),
      };

  const next = () => {
    const e = validators[step]?.() ?? {};
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({});
    setStep(s => Math.min(s + 1, totalSteps));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const back = () => { setErrors({}); setStep(s => Math.max(s - 1, 1)); };

  // ── Payment submit ─────────────────────────────────────────────────────────
  const handleProceedToPayment = async () => {
    setLoading(true);
    setErrors({});

    try {
      // 1. Upload files first if any
      let uploadedFileData: { url: string; name: string }[] = [];
      if (uploadedFiles.length > 0) {
        setUploadProgress("uploading");
        const result = await startUpload(uploadedFiles);
        if (!result) {
          setErrors({ submit: "File upload failed. Please try again." });
          setLoading(false);
          setUploadProgress("idle");
          return;
        }
        uploadedFileData = result.map(f => ({ url: f.serverData?.url ?? f.url, name: f.name }));
        setUploadProgress("done");
      }

      // 2. Build the full form snapshot to store server-side
      const urgencyLabel = URGENCY_OPTIONS.find(u => u.value === form.urgency);
      const snapshot = {
        name:             isPreFilled ? userProfile!.name  : form.name,
        email:            isPreFilled ? userProfile!.email : form.email,
        phone:            isPreFilled ? (localPhone || userProfile!.phone) : form.phone || undefined,
        country:          isPreFilled ? (localCountry || userProfile!.country) : undefined,
        projectLocation:  form.projectLocation,
        county:           form.county || undefined,
        ...(form.locationValue?.lat ? { latitude: form.locationValue.lat, longitude: form.locationValue.lng } : {}),
        serviceType:      form.serviceType,
        urgency:          form.urgency,
        specificConcerns: form.specificConcerns || undefined,
        onGroundContact:  form.onGroundContact  || undefined,
        uploadedFiles:    uploadedFileData,
        description:      [
          form.description,
          form.specificConcerns ? `\nSpecific concerns:\n${form.specificConcerns}` : "",
          `Urgency: ${urgencyLabel?.label} (${urgencyLabel?.sub})`,
          form.onGroundContact ? `On-ground contact: ${form.onGroundContact}` : "",
        ].filter(Boolean).join("\n\n"),
      };

      // 3. Initialize payment — server calculates price, returns Paystack URL
      const res = await fetch("/api/payment/initialize", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          serviceType:  form.serviceType,
          county:       form.county,
          urgency:      form.urgency,
          formSnapshot: JSON.stringify(snapshot),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrors({ submit: data.error ?? "Payment setup failed. Please try again." });
        setLoading(false);
        return;
      }

      // 4. Redirect to Paystack hosted checkout
      window.location.href = data.authorizationUrl;

    } catch {
      setErrors({ submit: "Network error. Please check your connection." });
      setLoading(false);
    }
  };

  // ── Gates ──────────────────────────────────────────────────────────────────
  if (!isAuthenticated) return <AuthGate />;

  if (isAuthenticated && !profileDone && userProfile) {
    return (
      <>
        <style>{phoneInputCSS}</style>
        <ProfilePrompt profile={userProfile} onComplete={handleProfileComplete} />
      </>
    );
  }

  // ── Step mapping ───────────────────────────────────────────────────────────
  const isLocationStep = isPreFilled ? step === 1 : step === 2;
  const isDetailsStep  = isPreFilled ? step === 2 : step === 3;
  const isUploadStep   = isPreFilled ? step === 3 : step === 4;
  const isContactStep  = !isPreFilled && step === 1;

  // Live price for upload step
  const price = calculatePrice({ serviceId: form.serviceType, county: form.county, urgency: form.urgency });

  return (
    <>
      <style>{phoneInputCSS}</style>
      <div className="max-w-xl mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-2xl border border-charcoal-100 shadow-sm p-6 sm:p-8">
          <StepIndicator step={step} labels={stepLabels} />
          {isPreFilled && userProfile && <IdentityBanner profile={userProfile} />}

          <form onSubmit={e => { e.preventDefault(); }} noValidate>

            {/* ── Contact ──────────────────────────────────────────────────── */}
            {isContactStep && (
              <div className="space-y-4">
                <div className="mb-5">
                  <h2 className="font-display text-xl font-bold text-charcoal-950 mb-1">Your contact details</h2>
                  <p className="text-charcoal-500 text-sm">We'll use these to send your confirmation and updates.</p>
                </div>
                <div>
                  <label className="label">Full Name *</label>
                  <input type="text" value={form.name} onChange={e => set("name", e.target.value)}
                    className={`input-field ${errors.name ? "!border-red-300" : ""}`} placeholder="James Mwangi" autoComplete="name"/>
                  <FieldError msg={errors.name} />
                </div>
                <div>
                  <label className="label">Email *</label>
                  <input type="email" value={form.email} onChange={e => set("email", e.target.value)}
                    className={`input-field ${errors.email ? "!border-red-300" : ""}`} placeholder="james@example.com" autoComplete="email"/>
                  <FieldError msg={errors.email} />
                </div>
                <div>
                  <label className="label">Phone / WhatsApp *</label>
                  <div className={`rpi-wrapper ${errors.phone ? "error" : ""}`}>
                    <PhoneInput international defaultCountry="GB" countryCallingCodeEditable={false}
                      value={form.phone as E164Number} onChange={val => set("phone", val ?? "")} placeholder="Enter phone number"/>
                  </div>
                  <FieldError msg={errors.phone} />
                  <p className="text-xs text-charcoal-400 mt-1">Used for WhatsApp project updates</p>
                </div>
                <button type="button" onClick={next} className="btn-primary w-full justify-center py-3.5 mt-1">
                  Continue
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </button>
                <p className="text-xs text-charcoal-400 text-center">
                  Already have an account?{" "}
                  <Link href="/login?redirect=/request-verification" className="text-orange-600 hover:text-orange-700 font-medium underline">Sign in</Link> to skip this step.
                </p>
              </div>
            )}

            {/* ── Location ─────────────────────────────────────────────────── */}
            {isLocationStep && (
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-display text-xl font-bold text-charcoal-950 mb-1">Service & Location</h2>
                    <p className="text-charcoal-500 text-sm">What needs verifying and where?</p>
                  </div>
                  {!isPreFilled && <BackBtn onClick={back} />}
                </div>

                <div>
                  <label className="label">Service Type *</label>
                  <Select instanceId="service-select" options={SERVICE_OPTIONS} value={form.serviceOption}
                    onChange={opt => {
                      set("serviceOption", opt ?? null);
                      set("serviceType", opt?.value ?? "");
                      set("serviceId",   (opt as any)?.id ?? "");
                    }}
                    placeholder="Select a service…" isSearchable={false}
                    styles={buildSelectStyles(!!errors.serviceType)}
                    menuPortalTarget={typeof document !== "undefined" ? document.body : undefined}
                    menuPosition="fixed"/>
                  <FieldError msg={errors.serviceType} />

                  {/* Inline price hint after service selection */}
                  {form.serviceType && (
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-xs text-charcoal-400">Starting from</span>
                      <span className="text-xs font-bold text-orange-600">
                        KES {(SERVICES.find(s => s.name === form.serviceType)?.baseKes ?? 0).toLocaleString()}
                      </span>
                      <span className="text-xs text-charcoal-400">· final price on next step</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="label">Kenya County *</label>
                  <Select instanceId="county-select" options={KENYA_COUNTIES} value={form.countyOption}
                    onChange={opt => { set("countyOption", opt ?? null); set("county", opt?.value ?? ""); }}
                    placeholder="Select county…" isSearchable isClearable
                    styles={buildSelectStyles(!!errors.county)}
                    noOptionsMessage={() => "No county found"}
                    menuPortalTarget={typeof document !== "undefined" ? document.body : undefined}
                    menuPosition="fixed"/>
                  <FieldError msg={errors.county} />
                  {form.county && COUNTY_TIERS[form.county] && COUNTY_TIERS[form.county] !== "major" && (
                    <p className="text-xs text-charcoal-400 mt-1">
                      {form.county} is a {COUNTY_TIERS[form.county]} county — KES {COUNTY_TIER_SURCHARGE[COUNTY_TIERS[form.county]!].toLocaleString()} travel surcharge applies.
                    </p>
                  )}
                </div>

                <div>
                  <label className="label">Specific Location *</label>
                  <KenyaLocationPicker
                    value={form.locationValue}
                    onChange={loc => { set("locationValue", loc); set("projectLocation", loc.address); }}
                    error={!!errors.projectLocation}
                    placeholder="Search a location in Kenya…"
                  />
                  <FieldError msg={errors.projectLocation} />
                </div>

                <button type="button" onClick={next} className="btn-primary w-full justify-center py-3.5">
                  Continue
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </button>
              </div>
            )}

            {/* ── Details ───────────────────────────────────────────────────── */}
            {isDetailsStep && (
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-display text-xl font-bold text-charcoal-950 mb-1">Project details</h2>
                    <p className="text-charcoal-500 text-sm">Tell us exactly what needs verifying.</p>
                  </div>
                  <BackBtn onClick={back} />
                </div>
                <div>
                  <label className="label flex items-baseline justify-between">
                    <span>Project Description *</span>
                    <span className={`text-xs font-normal ${form.description.length >= 40 ? "text-emerald-600" : "text-charcoal-400"}`}>
                      {form.description.length >= 40 ? "✓ Good to go" : `${form.description.length}/40 min`}
                    </span>
                  </label>
                  <textarea rows={5} value={form.description} onChange={e => set("description", e.target.value)}
                    className={`input-field resize-none ${errors.description ? "!border-red-300" : ""}`}
                    placeholder="Describe what needs verifying — the current stage, materials or contractors involved, and the outcome you need."/>
                  <FieldError msg={errors.description} />
                </div>
                <div>
                  <label className="label">Specific Concerns <span className="font-normal text-charcoal-400 text-xs">optional</span></label>
                  <textarea rows={2} value={form.specificConcerns} onChange={e => set("specificConcerns", e.target.value)}
                    className="input-field resize-none" placeholder="e.g. Suspect materials are substandard, title deed has disputed signatures…"/>
                </div>
                <div>
                  <label className="label">Urgency</label>
                  <div className="grid grid-cols-3 gap-2">
                    {URGENCY_OPTIONS.map(({ value, label, sub, dot }) => (
                      <button key={value} type="button" onClick={() => set("urgency", value)}
                        className={`flex flex-col items-center gap-1.5 px-2 py-3 rounded-xl border text-center transition-all duration-150 ${
                          form.urgency === value ? "border-orange-400 bg-orange-50" : "border-charcoal-100 hover:border-orange-200"
                        }`}>
                        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${dot}`} />
                        <span className={`text-xs font-bold leading-tight ${form.urgency === value ? "text-orange-700" : "text-charcoal-800"}`}>{label}</span>
                        <span className="text-[10px] text-charcoal-400 leading-tight">{sub}</span>
                      </button>
                    ))}
                  </div>
                  {form.urgency === "urgent" && (
                    <p className="text-xs text-amber-600 mt-1.5">⚡ 48-hour premium: KES {URGENCY_SURCHARGE.urgent.toLocaleString()} added</p>
                  )}
                </div>
                <div>
                  <label className="label">On-ground Contact <span className="font-normal text-charcoal-400 text-xs">optional</span></label>
                  <input type="text" value={form.onGroundContact} onChange={e => set("onGroundContact", e.target.value)}
                    className="input-field" placeholder="e.g. Site foreman: John Kamau, +254 712 000000"/>
                  <p className="text-xs text-charcoal-400 mt-1.5">Anyone our inspector should coordinate with on arrival.</p>
                </div>
                <button type="button" onClick={next} className="btn-primary w-full justify-center py-3.5">
                  Continue to Payment
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </button>
              </div>
            )}

            {/* ── Upload + Payment ──────────────────────────────────────────── */}
            {isUploadStep && (
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-display text-xl font-bold text-charcoal-950 mb-1">Files & Payment</h2>
                    <p className="text-charcoal-500 text-sm">Attach supporting files, then pay to submit.</p>
                  </div>
                  <BackBtn onClick={back} />
                </div>

                <FileUpload files={uploadedFiles} onChange={setUploadedFiles} />

                {/* ── Price panel ─────────────────────────────────────────── */}
                <PricePanel serviceType={form.serviceType} county={form.county} urgency={form.urgency} />

                {/* Request summary */}
                <div className="rounded-2xl bg-charcoal-50 border border-charcoal-100 p-4">
                  <p className="text-[10px] font-bold text-charcoal-400 uppercase tracking-widest mb-3">Request summary</p>
                  <div className="space-y-1.5 text-sm">
                    {[
                      ["Service",  form.serviceType     || "—"],
                      ["Location", form.projectLocation || "—"],
                      ["County",   form.county          || "—"],
                      ["Urgency",  URGENCY_OPTIONS.find(u => u.value === form.urgency)?.label ?? "—"],
                      ...(isPreFilled ? [["Submitting as", userProfile!.name ?? userProfile!.email]] : []),
                    ].map(([k, v]) => (
                      <div key={k} className="flex gap-3">
                        <span className="text-charcoal-400 w-28 flex-shrink-0">{k}</span>
                        <span className="text-charcoal-700 truncate font-medium">{v}</span>
                      </div>
                    ))}
                    {uploadedFiles.length > 0 && (
                      <div className="flex gap-3">
                        <span className="text-charcoal-400 w-28 flex-shrink-0">Files</span>
                        <span className="text-charcoal-700 font-medium">{uploadedFiles.length} attached</span>
                      </div>
                    )}
                  </div>
                </div>

                {errors.submit && (
                  <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
                    <svg className="w-4 h-4 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>
                    </svg>
                    {errors.submit}
                  </div>
                )}

                {/* Pay button */}
                <button
                  type="button"
                  onClick={handleProceedToPayment}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-3 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-bold text-base py-4 rounded-xl transition-all hover:shadow-xl hover:shadow-orange-500/25 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="20 60"/>
                      </svg>
                      {uploadProgress === "uploading"
                        ? `Uploading ${uploadedFiles.length} file${uploadedFiles.length !== 1 ? "s" : ""}…`
                        : "Preparing payment…"}
                    </span>
                  ) : (
                    <>
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                        <line x1="1" y1="10" x2="23" y2="10"/>
                      </svg>
                      Pay KES {price.totalKes.toLocaleString()} to Submit
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M5 12h14M12 5l7 7-7 7"/>
                      </svg>
                    </>
                  )}
                </button>

                {/* Payment method hints */}
                <div className="flex items-center justify-center gap-3 flex-wrap">
                  <span className="text-[10px] text-charcoal-400">Accepted:</span>
                  <div className="flex items-center gap-2">
                    <div className="bg-[#1A1F71] text-white text-[9px] font-bold px-2 py-0.5 rounded">VISA</div>
                    <div className="flex -space-x-1.5">
                      <div className="w-5 h-5 bg-[#EB001B] rounded-full border border-white"/>
                      <div className="w-5 h-5 bg-[#F79E1B] rounded-full border border-white"/>
                    </div>
                    <div className="bg-[#00A651] text-white text-[9px] font-bold px-2 py-0.5 rounded">M-PESA</div>
                    <div className="bg-black text-white text-[9px] font-bold px-2 py-0.5 rounded">APPLE PAY</div>
                  </div>
                </div>

                <p className="text-xs text-charcoal-400 text-center leading-relaxed">
                  You'll be redirected to Paystack's secure checkout. Your request is only submitted after payment is confirmed.{" "}
                  <a href="/privacy" className="underline hover:text-orange-600">Privacy Policy</a>.
                </p>
              </div>
            )}
          </form>
        </div>
      </div>
    </>
  );
}

// ─── Phone input CSS (extracted to avoid duplication) ─────────────────────────
const phoneInputCSS = `
  .rpi-wrapper .PhoneInput { display:flex;align-items:center;width:100%;padding:0 14px;height:44px;border:1px solid #d3d2cf;border-radius:0.75rem;background:#fff;font-family:var(--font-body,'DM Sans',system-ui,sans-serif);font-size:14px;color:#3d3b36;transition:all 0.15s ease;gap:10px; }
  .rpi-wrapper .PhoneInput:focus-within { border-color:transparent;box-shadow:0 0 0 2px rgba(249,115,22,0.45); }
  .rpi-wrapper.error .PhoneInput { border-color:#fca5a5; }
  .rpi-wrapper .PhoneInputCountry { display:flex;align-items:center;gap:6px;flex-shrink:0;padding-right:10px;border-right:1px solid #e5e7eb;position:relative;cursor:pointer; }
  .rpi-wrapper .PhoneInputCountryFlag { width:20px;height:14px;border-radius:2px;overflow:hidden; }
  .rpi-wrapper .PhoneInputCountrySelect { position:absolute;inset:0;opacity:0;cursor:pointer;z-index:2; }
  .rpi-wrapper .PhoneInputCountrySelectArrow { width:5px;height:5px;border-right:1.5px solid #9ca3af;border-bottom:1.5px solid #9ca3af;transform:rotate(45deg) translateY(-2px);margin-left:2px; }
  .rpi-wrapper .PhoneInputInput { flex:1;border:none;outline:none;background:transparent;font-family:var(--font-body,'DM Sans',system-ui,sans-serif);font-size:14px;color:#3d3b36;padding:0;min-width:0; }
  .rpi-wrapper .PhoneInputInput::placeholder { color:#9ca3af; }
`;
