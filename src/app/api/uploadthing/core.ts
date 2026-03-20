// src/app/api/uploadthing/core.ts
// Three upload routes:
//   1. verificationFiles  — unauthenticated, for request-verification form
//   2. inspectionMedia    — authenticated inspectors, wired to InspectionMedia records
//   3. projectDocuments   — authenticated clients, general project documents

import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const f = createUploadthing();

export const ourFileRouter = {
  // ── 1. Verification request attachments (public — no auth required) ────────
  // Files are stored temporarily; URLs are saved in VerificationRequest.filesJson
  verificationFiles: f({
    image: { maxFileSize: "8MB", maxFileCount: 10 },
    pdf: { maxFileSize: "16MB", maxFileCount: 5 },
    video: { maxFileSize: "64MB", maxFileCount: 3 },
  })
    .middleware(async () => {
      // No auth — anyone submitting the form can upload
      // Return a temp session key so we can group files by submission
      return { source: "verification-form" };
    })
    .onUploadComplete(async ({ file }) => {
      // Just return the URL — the form will include it in the submission payload
      return { url: file.ufsUrl, name: file.name };
    }),

  // ── 2. Inspector field report media ───────────────────────────────────────
  // Saves each uploaded file as an InspectionMedia record in the database
  inspectionMedia: f({
    image: { maxFileSize: "16MB", maxFileCount: 20 },
    video: { maxFileSize: "128MB", maxFileCount: 5 },
  })
    .middleware(async ({ req }) => {
      const session = await auth();
      if (!session?.user?.id) throw new UploadThingError("Unauthorized");
      if (
        (session.user as any).role !== "INSPECTOR" &&
        (session.user as any).role !== "ADMIN"
      ) {
        throw new UploadThingError("Forbidden — inspectors only");
      }

      // projectId and inspectionId are passed as query params from the client
      const url = new URL(req.url);
      const projectId = url.searchParams.get("projectId") ?? "";
      const inspectionId = url.searchParams.get("inspectionId") ?? "";

      return { userId: session.user.id, projectId, inspectionId };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // If an inspectionId is provided, create an InspectionMedia record immediately
      if (metadata.inspectionId) {
        await prisma.inspectionMedia.create({
          data: {
            inspectionId: metadata.inspectionId,
            type: "PHOTO",
            url: file.ufsUrl,
            filename: file.name,
            caption: null,
            sortOrder: 0,
          },
        });
      }
      return {
        url: file.ufsUrl,
        name: file.name,
        projectId: metadata.projectId,
      };
    }),

  // ── 3. Client project document uploads ────────────────────────────────────
  // General project-scoped file uploads for clients (plans, deeds, etc.)
  projectDocuments: f({
    image: { maxFileSize: "8MB", maxFileCount: 10 },
    pdf: { maxFileSize: "32MB", maxFileCount: 10 },
    video: { maxFileSize: "64MB", maxFileCount: 3 },
  })
    .middleware(async () => {
      const session = await auth();
      if (!session?.user?.id) throw new UploadThingError("Unauthorized");
      return { userId: session.user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      return { url: file.ufsUrl, name: file.name, uploadedBy: metadata.userId };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
