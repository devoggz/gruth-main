// src/lib/push.ts
import webpush from "web-push";
import { prisma } from "@/lib/prisma";

webpush.setVapidDetails(
    process.env.VAPID_EMAIL!,
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!,
);

export interface PushPayload {
    title: string;
    body:  string;
    url?:  string;
    tag?:  string;
}

// Send to a single user by userId
export async function sendPushToUser(userId: string, payload: PushPayload) {
    const subs = await prisma.pushSubscription.findMany({ where: { userId } });

    const results = await Promise.allSettled(
        subs.map(sub =>
            webpush.sendNotification(
                { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
                JSON.stringify(payload),
            ).catch(async (err) => {
                // 410 Gone = subscription expired, clean it up
                if (err.statusCode === 410) {
                    await prisma.pushSubscription.delete({ where: { endpoint: sub.endpoint } }).catch(() => {});
                }
                throw err;
            })
        )
    );

    return results;
}

// Send to all users (e.g. broadcast)
export async function sendPushToAll(payload: PushPayload) {
    const subs = await prisma.pushSubscription.findMany();
    return Promise.allSettled(
        subs.map(sub =>
            webpush.sendNotification(
                { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
                JSON.stringify(payload),
            )
        )
    );
}