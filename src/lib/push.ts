// src/lib/push.ts
// web-push is imported dynamically inside each function so that the library
// never executes at module evaluation time. This prevents the build error:
// "No subject set in vapidDetails.subject" which fires when web-push is
// statically imported and VAPID env vars are absent during Next.js build.

import { prisma } from "@/lib/prisma";

export interface PushPayload {
  title: string;
  body: string;
  url?: string;
  tag?: string;
}

async function getWebPush() {
  const subject = process.env.VAPID_EMAIL;
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;

  if (!subject || !publicKey || !privateKey) {
    console.warn("[push] VAPID env vars not set — push notifications disabled");
    return null;
  }

  // Dynamic import keeps web-push out of the module graph at build time
  const webpush = (await import("web-push")).default;
  webpush.setVapidDetails(subject, publicKey, privateKey);
  return webpush;
}

// Send to a single user by userId
export async function sendPushToUser(userId: string, payload: PushPayload) {
  const webpush = await getWebPush();
  if (!webpush) return;

  const subs = await prisma.pushSubscription.findMany({ where: { userId } });
  if (subs.length === 0) return;

  return Promise.allSettled(
    subs.map((sub) =>
      webpush
        .sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth },
          },
          JSON.stringify(payload),
        )
        .catch(async (err) => {
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
  const webpush = await getWebPush();
  if (!webpush) return;

  const subs = await prisma.pushSubscription.findMany();
  return Promise.allSettled(
    subs.map((sub) =>
      webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: { p256dh: sub.p256dh, auth: sub.auth },
        },
        JSON.stringify(payload),
      ),
    ),
  );
}
