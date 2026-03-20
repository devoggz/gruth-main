"use client";
import { useState, useEffect } from "react";

export function usePushNotifications() {
    const [supported,    setSupported]    = useState(false);
    const [permission,   setPermission]   = useState<NotificationPermission>("default");
    const [subscribed,   setSubscribed]   = useState(false);
    const [loading,      setLoading]      = useState(false);

    useEffect(() => {
        setSupported("serviceWorker" in navigator && "PushManager" in window);
        setPermission(Notification.permission);

        // Check if already subscribed
        navigator.serviceWorker?.ready.then(reg => {
            reg.pushManager.getSubscription().then(sub => {
                setSubscribed(!!sub);
            });
        });
    }, []);

    async function subscribe() {
        if (!supported) return;
        setLoading(true);
        try {
            const reg = await navigator.serviceWorker.ready;

            const sub = await reg.pushManager.subscribe({
                userVisibleOnly:      true,
                applicationServerKey: urlBase64ToUint8Array(
                    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
                ),
            });

            setPermission("granted");
            setSubscribed(true);

            await fetch("/api/push/subscribe", {
                method:  "POST",
                headers: { "Content-Type": "application/json" },
                body:    JSON.stringify(sub),
            });
        } catch (err) {
            console.error("Push subscribe failed:", err);
            setPermission(Notification.permission);
        } finally {
            setLoading(false);
        }
    }

    async function unsubscribe() {
        const reg = await navigator.serviceWorker?.ready;
        const sub = await reg?.pushManager.getSubscription();
        if (sub) {
            await sub.unsubscribe();
            await fetch("/api/push/subscribe", {
                method:  "DELETE",
                headers: { "Content-Type": "application/json" },
                body:    JSON.stringify({ endpoint: sub.endpoint }),
            });
            setSubscribed(false);
        }
    }

    return { supported, permission, subscribed, loading, subscribe, unsubscribe };
}

// VAPID key must be converted from base64 to Uint8Array
function urlBase64ToUint8Array(base64: string) {
    const padding = "=".repeat((4 - (base64.length % 4)) % 4);
    const b64     = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
    const raw     = atob(b64);
    return Uint8Array.from([...raw].map(c => c.charCodeAt(0)));
}