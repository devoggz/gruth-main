// src/app/api/uploadthing/core.ts
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const f = createUploadthing();

export const ourFileRouter = {

  // ── 1. Public verification request files ─────────────────────────────────
  // No auth required — attached before the user is even logged in on the form.
  verificationFiles: f({
    image:    { maxFileSize: "16MB", maxFileCount: 10 },
    video:    { maxFileSize: "64MB", maxFileCount: 3  },
    "application/pdf": { maxFileSize: "16MB", maxFileCount: 5 },
  })
    .middleware(async () => {
      // Public route — no auth check
      return {};
    })
    .onUploadComplete(async ({ file }) => {
      // Return url (not ufsUrl — that's client-side only)
      return { url: file.url, name: file.name };
    }),

  // ── 2. Inspector field report media ───────────────────────────────────────
  // Auth required — INSPECTOR or ADMIN only.
  inspectionMedia: f({
    image: { maxFileSize: "16MB", maxFileCount: 20 },
    video: { maxFileSize: "256MB", maxFileCount: 5 },
  })
    .middleware(async ({ req }) => {
      const session = await auth();
      const role = (session?.user as any)?.role;
      if (!session?.user?.id || (role !== "INSPECTOR" && role !== "ADMIN")) {
        throw new UploadThingError("Unauthorized");
      }

      // Optional: read projectId + inspectionId from query params
      const url         = new URL(req.url);
      const projectId   = url.searchParams.get("projectId")   ?? undefined;
      const inspectionId = url.searchParams.get("inspectionId") ?? undefined;

      return { userId: session.user.id, projectId, inspectionId };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // If an inspectionId was provided, persist the media record immediately
      if (metadata.inspectionId) {
        const mediaType = file.type?.startsWith("video/") ? "VIDEO" : "PHOTO";
        await prisma.inspectionMedia.create({
          data: {
            inspectionId: metadata.inspectionId,
            type:         mediaType,
            url:          file.url,   // ← file.url, not file.ufsUrl
            filename:     file.name,
          },
        }).catch(err => console.error("[uploadthing] inspectionMedia create error:", err));
      }
      return { url: file.url, name: file.name };
    }),

  // ── 3. Client project documents ───────────────────────────────────────────
  // Any authenticated user.
  projectDocuments: f({
    "application/pdf": { maxFileSize: "32MB", maxFileCount: 5 },
    image:             { maxFileSize: "16MB", maxFileCount: 10 },
  })
    .middleware(async () => {
      const session = await auth();
      if (!session?.user?.id) throw new UploadThingError("Unauthorized");
      return { userId: session.user.id };
    })
    .onUploadComplete(async ({ file }) => {
      return { url: file.url, name: file.name };
    }),

} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
