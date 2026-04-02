// src/app/(marketing)/privacy/page.tsx
import React from "react";
import type { Metadata } from "next";
import Link from "next/link";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How GRUTH collects, uses, and protects your personal data.",
};

const LAST_UPDATED = "15 March 2025";

export default function PrivacyPage() {
  return (
    <div className="pt-16">
      {/* Hero */}
      <section className="bg-charcoal-950 py-16 sm:py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-1.5 text-orange-400 text-[10px] font-bold tracking-widest uppercase bg-orange-500/10 border border-orange-500/20 px-3 py-1 rounded-full mb-6">
            Legal
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-white tracking-tight mb-4">
            Privacy Policy
          </h1>
          <p className="text-charcoal-400 text-sm">
            Last updated: {LAST_UPDATED}
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 sm:py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="prose prose-charcoal max-w-none space-y-10">
            {/* Intro */}
            <div className="bg-orange-50 border border-orange-100 rounded-2xl p-6">
              <p className="text-charcoal-700 text-sm leading-relaxed m-0">
                GRUTH (&ldquo;we&rdquo;, &ldquo;our&rdquo;, &ldquo;us&rdquo;) is
                committed to protecting your personal information. This policy
                explains what data we collect, why we collect it, and how we
                keep it safe. By using our platform, you agree to the practices
                described here.
              </p>
            </div>

            <PolicySection title="1. Who We Are">
              <p>
                GRUTH is an on-the-ground verification service helping the
                Kenyan diaspora and remote investors get independent, photo and
                video evidence on their properties, construction projects, and
                business interests in Kenya.
              </p>
              <p>
                For any privacy-related questions, contact us at{" "}
                <a
                  href="mailto:hello@gruth.it.com"
                  className="text-orange-500 hover:text-orange-600 font-medium transition-colors"
                >
                  hello@gruth.it.com
                </a>
                .
              </p>
            </PolicySection>

            <PolicySection title="2. Information We Collect">
              <SubHeading>Account information</SubHeading>
              <p>
                When you register, we collect your name, email address, and a
                hashed password. We do not store plain-text passwords.
              </p>

              <SubHeading>Project & request data</SubHeading>
              <p>
                When you submit a verification request we collect details about
                your project — location, service type, budget information, and
                any supporting notes you provide.
              </p>

              <SubHeading>Inspection evidence</SubHeading>
              <p>
                Our field inspectors capture photos, videos, measurements and
                written observations on your behalf. This content is stored
                securely and made available to you in your private dashboard.
              </p>

              <SubHeading>Usage data</SubHeading>
              <p>
                We collect standard server logs including IP addresses, browser
                type, pages visited, and timestamps. This helps us maintain
                security and improve the platform. We do not sell this data.
              </p>

              <SubHeading>Communications</SubHeading>
              <p>
                If you contact us via the platform messaging system, email, or
                enquiry form, we retain those messages to provide support and
                fulfil your verification request.
              </p>
            </PolicySection>

            <PolicySection title="3. How We Use Your Data">
              <ul className="space-y-2 text-charcoal-600 text-sm">
                {[
                  "To create and manage your account",
                  "To process, schedule, and deliver verification reports",
                  "To communicate with you about your projects and requests",
                  "To send transactional emails (e.g. report ready, status updates)",
                  "To improve our platform and inspector network quality",
                  "To comply with applicable Kenyan and international laws",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5">
                    <span className="w-4 h-4 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg
                        width="8"
                        height="8"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#f97316"
                        strokeWidth="3"
                      >
                        <path d="M20 6L9 17l-5-5" />
                      </svg>
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
              <p>
                We will never sell, rent, or share your personal data with third
                parties for marketing purposes.
              </p>
            </PolicySection>

            <PolicySection title="4. Data Storage & Security">
              <p>
                Your data is stored on servers hosted in secure data centres. We
                use encryption in transit (TLS/HTTPS) and at rest for sensitive
                fields. Access to production data is restricted to authorised
                personnel only.
              </p>
              <p>
                Inspection photos and videos are stored via UploadThing, which
                uses industry-standard cloud storage with access controls that
                ensure only you (and our authorised team) can view your project
                evidence.
              </p>
              <p>
                While we take all reasonable precautions, no system is
                completely immune to security breaches. If a breach affecting
                your data occurs, we will notify you within 72 hours of becoming
                aware of it.
              </p>
            </PolicySection>

            <PolicySection title="5. Data Retention">
              <p>
                We retain your account and project data for as long as your
                account is active or as needed to provide services. If you close
                your account, we will delete or anonymise your personal data
                within 90 days, except where we are legally required to retain
                records (e.g. financial transactions).
              </p>
            </PolicySection>

            <PolicySection title="6. Your Rights">
              <p>You have the right to:</p>
              <ul className="space-y-1.5 text-charcoal-600 text-sm">
                {[
                  "Access the personal data we hold about you",
                  "Correct inaccurate or incomplete data",
                  "Request deletion of your personal data",
                  "Object to or restrict certain processing activities",
                  "Receive a copy of your data in a portable format",
                  "Withdraw consent at any time where processing is consent-based",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5">
                    <span className="text-orange-500 font-bold flex-shrink-0">
                      —
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
              <p>
                To exercise any of these rights, email us at{" "}
                <a
                  href="mailto:hello@gruth.it.com"
                  className="text-orange-500 hover:text-orange-600 font-medium transition-colors"
                >
                  hello@gruth.it.com
                </a>{" "}
                with subject line &ldquo;Privacy Request&rdquo;. We will respond
                within 30 days.
              </p>
            </PolicySection>

            <PolicySection title="7. Cookies">
              <p>
                We use essential session cookies to keep you logged in and to
                protect your account (CSRF prevention). We do not use
                third-party tracking cookies or advertising cookies.
              </p>
            </PolicySection>

            <PolicySection title="8. Third-Party Services">
              <p>
                We integrate with the following third-party services to operate
                the platform:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                {[
                  {
                    name: "UploadThing",
                    purpose:
                      "Secure file & media storage for inspection evidence",
                  },
                  { name: "Resend", purpose: "Transactional email delivery" },
                  { name: "Vercel", purpose: "Platform hosting & global CDN" },
                  {
                    name: "Neon / PostgreSQL",
                    purpose: "Encrypted database storage",
                  },
                ].map(({ name, purpose }) => (
                  <div key={name} className="bg-charcoal-50 rounded-xl p-4">
                    <div className="font-semibold text-charcoal-900 text-sm mb-0.5">
                      {name}
                    </div>
                    <div className="text-charcoal-500 text-xs">{purpose}</div>
                  </div>
                ))}
              </div>
              <p>
                Each provider has its own privacy policy and is bound by
                applicable data protection laws.
              </p>
            </PolicySection>

            <PolicySection title="9. Children's Privacy">
              <p>
                Our services are not directed at children under 16 years of age.
                We do not knowingly collect personal data from children. If you
                believe a child has provided us with personal data, please
                contact us and we will delete it promptly.
              </p>
            </PolicySection>

            <PolicySection title="10. Changes to This Policy">
              <p>
                We may update this Privacy Policy from time to time. When we do,
                we&apos;ll update the &ldquo;Last updated&rdquo; date above. For
                significant changes, we&apos;ll notify you by email or via an
                in-app banner. Your continued use of GRUTH after changes
                constitutes acceptance of the updated policy.
              </p>
            </PolicySection>
          </div>

          {/* Footer nav */}
          <div className="mt-16 pt-8 border-t border-charcoal-100 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <p className="text-charcoal-400 text-sm">
              Questions?{" "}
              <a
                href="mailto:hello@gruth.it.com"
                className="text-orange-500 hover:text-orange-600 font-medium transition-colors"
              >
                hello@gruth.it.com
              </a>
            </p>
            <Link
              href="/terms"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-charcoal-600 hover:text-charcoal-950 transition-colors"
            >
              Read our Terms of Service
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function PolicySection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-4">
      <h2 className="font-display text-xl font-bold text-charcoal-950 tracking-tight">
        {title}
      </h2>
      <div className="space-y-3 text-charcoal-600 text-sm leading-relaxed">
        {children}
      </div>
    </div>
  );
}

function SubHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="font-semibold text-charcoal-900 text-sm mt-5 mb-1">
      {children}
    </h3>
  );
}
