"use client";
// src/components/shared/PWAInstallBanner.tsx

import React, { useEffect, useState, useCallback } from "react";
import Image from "next/image";

type Mode = "android" | "ios" | null; // null = not eligible / already installed

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISSED_KEY = "gruth_pwa_banner_dismissed";

// iOS share icon
function IOSShareIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13" />
    </svg>
  );
}

// Add-to-home icon
function AddHomeIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M12 8v8M8 12h8" />
    </svg>
  );
}

export default function PWAInstallBanner() {
  const [mode, setMode] = useState<Mode>(null);
  const [visible, setVisible] = useState(false);
  const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showIOSSteps, setShowIOSSteps] = useState(false);

  useEffect(() => {
    // Don't show if already dismissed recently
    const dismissed = sessionStorage.getItem(DISMISSED_KEY);
    if (dismissed) return;

    // Don't show if already running as installed PWA
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as any).standalone === true;
    if (isStandalone) return;

    // Only show on mobile
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (!isMobile) return;

    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);

    if (isIOS) {
      // iOS: show manual steps (no native prompt available)
      setMode("ios");
      setVisible(true);
      return;
    }

    // Android / Chrome: wait for beforeinstallprompt
    const handler = (e: Event) => {
      e.preventDefault();
      setPrompt(e as BeforeInstallPromptEvent);
      setMode("android");
      setVisible(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const dismiss = useCallback(() => {
    setVisible(false);
    setShowIOSSteps(false);
    sessionStorage.setItem(DISMISSED_KEY, "1");
  }, []);

  const handleInstall = useCallback(async () => {
    if (mode === "ios") {
      setShowIOSSteps((v) => !v);
      return;
    }
    if (!prompt) return;
    await prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === "accepted") dismiss();
  }, [mode, prompt, dismiss]);

  if (!visible) return null;

  return (
    <div
      id="pwa-install-banner"
      className="fixed top-0 left-0 right-0 z-[60] flex flex-col"
      style={{ WebkitBackdropFilter: "blur(0px)" }}
    >
      {/* ── Main banner bar ─────────────────────────────────────────────────── */}
      <div
        className="flex items-center gap-3 px-4 py-3 border-b border-charcoal-100 bg-white shadow-sm"
        role="banner"
        aria-label="Install GRUTH app"
      >
        {/* Dismiss */}
        <button
          onClick={dismiss}
          className="text-charcoal-400 hover:text-charcoal-700 transition-colors flex-shrink-0 p-0.5"
          aria-label="Dismiss"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          >
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        {/* Icon */}
        <Image src="/images/icon.svg" alt="logo" width={32} height={32} />

        {/* Copy */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-charcoal-950 leading-tight">
            Install GRUTH
          </p>
          <p className="text-xs text-charcoal-500 leading-tight mt-0.5 truncate">
            Track projects, reports & alerts
          </p>
        </div>

        {/* CTA */}
        <button
          onClick={handleInstall}
          className="flex-shrink-0 bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors whitespace-nowrap"
        >
          {mode === "ios" ? "Get" : "Install"}
        </button>
      </div>

      {/* ── iOS manual steps panel ───────────────────────────────────────────── */}
      {mode === "ios" && showIOSSteps && (
        <div className="bg-charcoal-950 border-b border-charcoal-800 px-4 py-4">
          <p className="text-white text-xs font-bold mb-3 text-center">
            Add to your Home Screen in 2 steps
          </p>
          <div className="flex flex-col gap-2.5">
            {[
              {
                step: "1",
                icon: <IOSShareIcon />,
                text: (
                  <>
                    Tap the <span className="font-bold text-white">Share</span>{" "}
                    button{" "}
                    <span className="inline-flex align-middle text-orange-400">
                      <IOSShareIcon />
                    </span>{" "}
                    in your browser toolbar
                  </>
                ),
              },
              {
                step: "2",
                icon: <AddHomeIcon />,
                text: (
                  <>
                    Scroll down and tap{" "}
                    <span className="font-bold text-white">
                      &ldquo;Add to Home Screen&rdquo;
                    </span>
                  </>
                ),
              },
            ].map(({ step, text }) => (
              <div key={step} className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0">
                  {step}
                </span>
                <p className="text-charcoal-300 text-xs leading-relaxed">
                  {text}
                </p>
              </div>
            ))}
          </div>
          <p className="text-charcoal-600 text-[10px] text-center mt-3">
            Then open GRUTH from your Home Screen for the full app experience
          </p>
        </div>
      )}
    </div>
  );
}
