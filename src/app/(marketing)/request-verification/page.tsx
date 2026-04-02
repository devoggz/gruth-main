// src/app/(marketing)/request-verification/page.tsx
// Server component — reads session and fetches user profile before rendering.
// Passes auth state to the client form so it can:
//   1. Gate unauthenticated users (prompt to sign in / register)
//   2. Prompt Google users with incomplete profiles to fill in phone + country
//   3. Pre-fill contact details for fully set-up users

import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import RequestVerificationForm from "@/components/home/RequestVerificationForm";

export const metadata: Metadata = {
  title: "Request a Verification",
  description:
    "Submit your verification request. We confirm availability and provide a quote within 2 business hours.",
};

export default async function RequestVerificationPage() {
  const session = await auth();

  // Fetch full profile if authenticated so the form can pre-fill fields
  let userProfile: {
    id: string;
    name: string | null;
    email: string;
    phone: string | null;
    whatsapp: string | null;
    country: string | null;
    image?: string | null;
  } | null = null;

  if (session?.user?.id) {
    userProfile = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        whatsapp: true,
        country: true,
      },
    });
    // Attach Google avatar from the session (not stored in User table)
    if (userProfile) {
      userProfile.image = session.user.image ?? null;
    }
  }

  // A profile is "incomplete" if the user signed in via Google and hasn't
  // added a phone number (required for WhatsApp updates) or country yet.
  const isGoogleUser = !!(session?.user && !(session.user as any).passwordHash);
  const profileComplete = !!(userProfile?.phone && userProfile?.country);

  return (
    <div className="pt-16">
      {/* Hero */}
      <section className="relative bg-charcoal-950 overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(to right, #f97316 1px, transparent 1px),
                              linear-gradient(to bottom, #f97316 1px, transparent 1px)`,
            backgroundSize: "56px 56px",
            opacity: 0.045,
          }}
        />
        <div className="relative max-w-3xl mx-auto px-4 text-center py-10 sm:py-14">
          <span className="inline-flex items-center gap-1.5 text-orange-400 text-[10px] sm:text-xs font-bold tracking-widest uppercase bg-orange-500/10 border border-orange-500/20 px-3 py-1.5 rounded-full mb-4 sm:mb-5">
            Get Started
          </span>
          <h1 className="font-display text-3xl sm:text-5xl font-bold text-white mb-3 sm:mb-4 tracking-tight">
            Request a Verification
          </h1>
          <p className="text-charcoal-300 text-sm sm:text-lg font-light max-w-xl mx-auto leading-relaxed">
            {session
              ? "Your contact details are pre-filled. Tell us about your project."
              : "Tell us about your project. We confirm availability and provide a quote within 2 business hours."}
          </p>
        </div>
      </section>

      {/* Form section */}
      <section className="relative py-10 sm:py-12">
        <div className="relative">
          <RequestVerificationForm
            userProfile={userProfile}
            isAuthenticated={!!session}
            profileComplete={profileComplete}
          />
        </div>
      </section>
    </div>
  );
}
