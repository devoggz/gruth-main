"use client";
import { useEffect } from "react";
import { usePushNotifications } from "@/hooks/usePushNotifications";

export default function PushNotificationSetup() {
  const { supported, permission, subscribed, loading, subscribe } =
    usePushNotifications();

  // Register service worker
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(console.error);
    }
  }, []);

  // Don't render anything if already subscribed or not supported
  if (!supported || subscribed || permission === "denied") return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 sm:w-80 z-50">
      <div className="bg-charcoal-950 border border-charcoal-800 rounded-2xl px-5 py-4 shadow-2xl">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 bg-orange-500/15 rounded-xl flex items-center justify-center flex-shrink-0">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#f97316"
              strokeWidth="1.8"
            >
              <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 01-3.46 0" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-semibold leading-tight mb-0.5">
              Enable notifications
            </p>
            <p className="text-charcoal-400 text-xs leading-snug">
              Get alerted when your inspector submits a report or sends a
              message.
            </p>
          </div>
        </div>
        <div className="flex gap-2 mt-4">
          <button
            onClick={subscribe}
            disabled={loading}
            className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white text-xs font-bold py-2.5 rounded-xl transition-colors"
          >
            {loading ? "Enabling…" : "Enable"}
          </button>
          <button
            onClick={() => {
              /* dismiss — set a localStorage flag */
            }}
            className="px-3 py-2.5 text-charcoal-500 hover:text-charcoal-300 text-xs transition-colors"
          >
            Not now
          </button>
        </div>
      </div>
    </div>
  );
}
