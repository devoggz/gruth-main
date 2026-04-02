"use client";
// src/components/dashboard/ReferralPanel.tsx

import { useState, useEffect } from "react";

interface Props {
  userId: string;
  userName: string | null;
  referralCode: string | null;
  totalReferred: number;
  unusedCredits: number;
  appUrl: string;
}

export default function ReferralPanel({
  userId,
  userName,
  referralCode: initialCode,
  totalReferred,
  unusedCredits,
  appUrl,
}: Props) {
  const [code, setCode] = useState(initialCode);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(!initialCode);

  useEffect(() => {
    if (initialCode) return;
    // Generate code on first render if missing
    fetch("/api/referral")
      .then((r) => r.json())
      .then((d) => {
        if (d.referralCode) setCode(d.referralCode);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [initialCode]);

  const referralUrl = `${appUrl}/register?ref=${code}`;

  const copy = async () => {
    if (!referralUrl) return;
    try {
      await navigator.clipboard.writeText(referralUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // fallback — select text
    }
  };

  const shareWhatsApp = () => {
    const firstName = (userName ?? "GRUTH").split(" ")[0];
    const text = encodeURIComponent(
      `Hey! I've been using GRUTH to verify my property in Kenya and it's been great. You can use my referral link to get started — your first report is backed by a no-upfront-payment guarantee.\n\n${referralUrl}`,
    );
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  return (
    <div className="bg-white border border-charcoal-100 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="bg-charcoal-950 px-5 py-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-display font-bold text-white text-base leading-tight">
              Refer a friend, get a free verification
            </h2>
            <p className="text-charcoal-400 text-xs mt-1.5 leading-relaxed max-w-xs">
              Every time someone signs up using your link and completes their
              first verification, you earn one free verification credit.
            </p>
          </div>
          <div className="w-10 h-10 bg-orange-500/10 border border-orange-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <svg
              className="w-5 h-5 text-orange-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
            </svg>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mt-5">
          {[
            { label: "Referred", value: totalReferred, color: "text-white" },
            {
              label: "Free credits",
              value: unusedCredits,
              color: "text-orange-400",
            },
          ].map(({ label, value, color }) => (
            <div
              key={label}
              className="bg-white/[0.05] border border-white/[0.08] rounded-xl px-4 py-3 text-center"
            >
              <div className={`font-display text-2xl font-bold ${color}`}>
                {value}
              </div>
              <div className="text-[10px] font-bold text-charcoal-500 uppercase tracking-widest mt-0.5">
                {label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Link section */}
      <div className="p-5 space-y-4">
        <div>
          <p className="text-[10px] font-bold text-charcoal-400 uppercase tracking-widest mb-2">
            Your referral link
          </p>
          {loading ? (
            <div className="h-11 bg-charcoal-100 rounded-xl animate-pulse" />
          ) : (
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-charcoal-50 border border-charcoal-200 rounded-xl px-3 py-2.5 font-mono text-xs text-charcoal-600 truncate">
                {referralUrl}
              </div>
              <button
                onClick={copy}
                className={`flex-shrink-0 flex items-center gap-1.5 text-xs font-semibold px-3 py-2.5 rounded-xl transition-all ${
                  copied
                    ? "bg-emerald-500 text-white"
                    : "bg-charcoal-950 hover:bg-charcoal-800 text-white"
                }`}
              >
                {copied ? (
                  <>
                    <svg
                      className="w-3.5 h-3.5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                    >
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                    Copied
                  </>
                ) : (
                  <>
                    <svg
                      className="w-3.5 h-3.5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <rect x="9" y="9" width="13" height="13" rx="2" />
                      <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                    </svg>
                    Copy
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Share buttons */}
        <div className="flex gap-2">
          <button
            onClick={shareWhatsApp}
            className="flex-1 flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1db955] text-white text-xs font-semibold py-2.5 rounded-xl transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            Share on WhatsApp
          </button>
          <button
            onClick={copy}
            className="flex-shrink-0 flex items-center justify-center gap-2 bg-charcoal-100 hover:bg-charcoal-200 text-charcoal-700 text-xs font-semibold px-4 py-2.5 rounded-xl transition-colors"
          >
            <svg
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13" />
            </svg>
            Copy link
          </button>
        </div>

        {/* How it works */}
        <div className="border-t border-charcoal-100 pt-4">
          <p className="text-[10px] font-bold text-charcoal-400 uppercase tracking-widest mb-3">
            How it works
          </p>
          <div className="space-y-2.5">
            {[
              {
                step: "1",
                text: "Share your referral link with friends or family planning a project in Kenya",
              },
              {
                step: "2",
                text: "They sign up and complete their first verification",
              },
              {
                step: "3",
                text: "You get a free verification credit — automatically applied to your next order",
              },
            ].map(({ step, text }) => (
              <div key={step} className="flex items-start gap-3">
                <span className="w-5 h-5 bg-orange-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  {step}
                </span>
                <p className="text-xs text-charcoal-600 leading-relaxed">
                  {text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
