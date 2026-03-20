// src/lib/push.ts
// Lazy VAPID initialisation — setVapidDetails is called inside the function,
// not at module evaluation time, so Next.js build succeeds even when env vars
// are not present in the build environment.

import webpush from "web-push";
import { prisma } from "@/lib/prisma";

export interface PushPayload {
    title: string;
    body:  string;
    url?:  string;
    tag?:  string;
}

let vapidInitialised = false;

function initVapid() {
    if (vapidInitialised) return;

    const subject    = process.env.VAPID_EMAIL;
    const publicKey  = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    const privateKey = process.env.VAPID_PRIVATE_KEY;

    // Skip silently at build time — all three vars must be present at runtime
    if (!subject || !publicKey || !privateKey) {
        if (process.env.NODE_ENV === "production") {
            console.warn("[push] VAPID env vars missing — push notifications disabled");
        }
        return;
    }

    webpush.setVapidDetails(subject, publicKey, privateKey);
    vapidInitialised = true;
}

// Send to a single user by userId
export async function sendPushToUser(userId: string, payload: PushPayload) {
    initVapid();
    if (!vapidInitialised) return;

    const subs = await prisma.pushSubscription.findMany({ where: { userId } });
    if (subs.length === 0) return;

    return Promise.allSettled(
        subs.map(sub =>
            webpush
                .sendNotification(
                    { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
                    JSON.stringify(payload),
                )
                .catch(async err => {
                    // 410 Gone = subscription expired — clean it up
                    if (err.statusCode === 410) {
                        await prisma.pushSubscription
                            .delete({ where: { endpoint: sub.endpoint } })
                            .catch(() => {});
                    }
                    throw err;
                }),
        ),
    );
}

// Broadcast to all subscribers
export async function sendPushToAll(payload: PushPayload) {
    initVapid();
    if (!vapidInitialised) return;

    const subs = await prisma.pushSubscription.findMany();
    return Promise.allSettled(
        subs.map(sub =>
            webpush.sendNotification(
                { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
                JSON.stringify(payload),
            ),
        ),
    );
}