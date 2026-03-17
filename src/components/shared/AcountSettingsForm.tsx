"use client";
// src/components/shared/AccountSettingsForm.tsx
import { useState, useTransition } from "react";

interface User {
  name: string;
  email: string;
  phone?: string | null;
  whatsapp?: string | null;
  country?: string | null;
  bio?: string | null;
  hasPassword?: boolean;
}

export default function AccountSettingsForm({ user }: { user: User }) {
  // ── Profile state ──────────────────────────────────────────────────────────
  const [name, setName] = useState(user.name ?? "");
  const [phone, setPhone] = useState(user.phone ?? "");
  const [whatsapp, setWhatsapp] = useState(user.whatsapp ?? "");
  const [country, setCountry] = useState(user.country ?? "");
  const [bio, setBio] = useState(user.bio ?? "");
  const [profileMsg, setProfileMsg] = useState("");
  const [profileOk, setProfileOk] = useState(false);
  const [profilePending, startProfile] = useTransition();

  // ── Password state ─────────────────────────────────────────────────────────
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [passwordMsg, setPasswordMsg] = useState("");
  const [passwordOk, setPasswordOk] = useState(false);
  const [passwordPending, startPassword] = useTransition();

  const handleProfile = () => {
    setProfileMsg("");
    startProfile(async () => {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, whatsapp, country, bio }),
      });
      const json = await res.json();
      if (res.ok) {
        setProfileMsg("Profile updated successfully.");
        setProfileOk(true);
      } else {
        setProfileMsg(json.error ?? "Update failed.");
        setProfileOk(false);
      }
    });
  };

  const handlePassword = () => {
    setPasswordMsg("");
    if (newPw !== confirmPw) {
      setPasswordMsg("Passwords do not match.");
      setPasswordOk(false);
      return;
    }
    if (newPw.length < 8) {
      setPasswordMsg("Password must be at least 8 characters.");
      setPasswordOk(false);
      return;
    }
    startPassword(async () => {
      const res = await fetch("/api/user/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: currentPw || undefined,
          newPassword: newPw,
        }),
      });
      const json = await res.json();
      if (res.ok) {
        setPasswordMsg("Password updated successfully.");
        setPasswordOk(true);
        setCurrentPw("");
        setNewPw("");
        setConfirmPw("");
      } else {
        setPasswordMsg(
          typeof json.error === "string" ? json.error : "Update failed.",
        );
        setPasswordOk(false);
      }
    });
  };

  const inputClass =
    "w-full px-3.5 py-2.5 border border-charcoal-200 rounded-xl text-sm text-charcoal-900 placeholder-charcoal-300 bg-white focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all";
  const labelClass =
    "block text-xs font-semibold text-charcoal-500 mb-1.5 uppercase tracking-wide";

  return (
    <div className="space-y-8 max-w-2xl">
      {/* ── Profile ─────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-charcoal-100 p-6">
        <h2 className="font-display font-semibold text-charcoal-950 mb-1">
          Profile Information
        </h2>
        <p className="text-xs text-charcoal-400 mb-6">
          Your name and contact details visible to the GRUTH team.
        </p>

        <div className="space-y-4">
          {/* Read-only email */}
          <div>
            <label className={labelClass}>Email address</label>
            <input
              value={user.email}
              disabled
              className={`${inputClass} bg-charcoal-50 text-charcoal-400 cursor-not-allowed`}
            />
            <p className="text-[11px] text-charcoal-400 mt-1">
              Email cannot be changed. Contact support if needed.
            </p>
          </div>

          <div>
            <label className={labelClass}>Full name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your full name"
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Phone</label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+254 700 000 000"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>WhatsApp</label>
              <input
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="+254 700 000 000"
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>Country</label>
            <input
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              placeholder="e.g. United Kingdom"
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Bio / Notes</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              placeholder="Short bio or notes about yourself…"
              className={`${inputClass} resize-none`}
            />
          </div>
        </div>

        {profileMsg && (
          <div
            className={`mt-4 text-sm font-medium px-4 py-2.5 rounded-xl ${
              profileOk
                ? "bg-emerald-50 text-emerald-700"
                : "bg-red-50 text-red-700"
            }`}
          >
            {profileMsg}
          </div>
        )}

        <div className="mt-5 flex justify-end">
          <button
            onClick={handleProfile}
            disabled={profilePending}
            className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white text-sm font-semibold rounded-xl transition-colors"
          >
            {profilePending ? "Saving…" : "Save changes"}
          </button>
        </div>
      </div>

      {/* ── Password ────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-charcoal-100 p-6">
        <h2 className="font-display font-semibold text-charcoal-950 mb-1">
          Password
        </h2>
        <p className="text-xs text-charcoal-400 mb-6">
          {user.hasPassword
            ? "Enter your current password to set a new one."
            : "You signed up with Google. Set a password to also enable email/password login."}
        </p>

        <div className="space-y-4">
          {user.hasPassword && (
            <div>
              <label className={labelClass}>Current password</label>
              <input
                type="password"
                value={currentPw}
                onChange={(e) => setCurrentPw(e.target.value)}
                placeholder="Your current password"
                className={inputClass}
              />
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>New password</label>
              <input
                type="password"
                value={newPw}
                onChange={(e) => setNewPw(e.target.value)}
                placeholder="Min. 8 characters"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Confirm new password</label>
              <input
                type="password"
                value={confirmPw}
                onChange={(e) => setConfirmPw(e.target.value)}
                placeholder="Repeat new password"
                className={inputClass}
              />
            </div>
          </div>
        </div>

        {passwordMsg && (
          <div
            className={`mt-4 text-sm font-medium px-4 py-2.5 rounded-xl ${
              passwordOk
                ? "bg-emerald-50 text-emerald-700"
                : "bg-red-50 text-red-700"
            }`}
          >
            {passwordMsg}
          </div>
        )}

        <div className="mt-5 flex justify-end">
          <button
            onClick={handlePassword}
            disabled={passwordPending || !newPw}
            className="px-5 py-2.5 bg-charcoal-950 hover:bg-charcoal-800 disabled:opacity-60 text-white text-sm font-semibold rounded-xl transition-colors"
          >
            {passwordPending
              ? "Updating…"
              : user.hasPassword
                ? "Change password"
                : "Set password"}
          </button>
        </div>
      </div>
    </div>
  );
}
