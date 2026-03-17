// src/app/(marketing)/terms/page.tsx
import React from "react";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "The terms and conditions governing your use of GRUTH.",
};

const LAST_UPDATED = "15 March 2025";

export default function TermsPage() {
  return (
    <div className="pt-16">
      {/* Hero */}
      <section className="bg-charcoal-950 py-16 sm:py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-1.5 text-orange-400 text-[10px] font-bold tracking-widest uppercase bg-orange-500/10 border border-orange-500/20 px-3 py-1 rounded-full mb-6">
            Legal
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-white tracking-tight mb-4">
            Terms of Service
          </h1>
          <p className="text-charcoal-400 text-sm">
            Last updated: {LAST_UPDATED}
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 sm:py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-10">

            {/* Intro */}
            <div className="bg-orange-50 border border-orange-100 rounded-2xl p-6">
              <p className="text-charcoal-700 text-sm leading-relaxed m-0">
                Please read these Terms of Service (&ldquo;Terms&rdquo;) carefully before using GRUTH. By accessing or using our platform, you agree to be bound by these Terms. If you do not agree, do not use GRUTH.
              </p>
            </div>

            <TermsSection title="1. The Service">
              <p>
                GRUTH provides on-the-ground verification services in Kenya. We dispatch trained field inspectors to visit locations, collect photographic and video evidence, and prepare structured written reports delivered through a secure client dashboard.
              </p>
              <p>
                GRUTH is an information and evidence service. Our reports reflect conditions observed at the time of inspection. We do not provide legal, architectural, engineering, or financial advice.
              </p>
            </TermsSection>

            <TermsSection title="2. Eligibility & Account">
              <p>
                You must be at least 18 years old and capable of entering into a legally binding agreement to use GRUTH. By registering, you confirm that the information you provide is accurate and up to date.
              </p>
              <p>
                You are responsible for maintaining the security of your account credentials. You must notify us immediately at{" "}
                <a href="mailto:hello@gruth.it.com" className="text-orange-500 hover:text-orange-600 font-medium transition-colors">
                  hello@gruth.it.com
                </a>{" "}
                if you suspect unauthorised access to your account.
              </p>
            </TermsSection>

            <TermsSection title="3. Verification Requests">
              <p>
                When you submit a verification request, you agree to:
              </p>
              <ul className="space-y-2 text-charcoal-600 text-sm mt-3">
                {[
                  "Provide accurate location information and a clear description of what requires verification",
                  "Not use the service to inspect properties or persons without lawful authority to do so",
                  "Not request surveillance, harassment, or evidence for use in illegal activities",
                  "Accept that inspections are subject to reasonable access and may be rescheduled due to circumstances beyond our control",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5">
                    <span className="text-orange-500 font-bold flex-shrink-0 mt-0.5">—</span>
                    {item}
                  </li>
                ))}
              </ul>
            </TermsSection>

            <TermsSection title="4. Fees & Payment">
              <p>
                Service fees are displayed at the time of request and are payable in advance unless otherwise agreed. Fees are non-refundable once an inspector has been dispatched, except in cases where we are unable to complete the inspection through no fault of the client.
              </p>
              <p>
                GRUTH reserves the right to update pricing at any time. Changes will not affect requests already submitted and paid.
              </p>
            </TermsSection>

            <TermsSection title="5. Reports & Deliverables">
              <p>
                Reports are provided for your personal and business use only. You may share your own reports with advisors, family members, or institutions for lawful purposes. You may not:
              </p>
              <ul className="space-y-2 text-charcoal-600 text-sm mt-3">
                {[
                  "Reproduce or redistribute reports commercially without our written consent",
                  "Misrepresent the source, date, or findings of a report",
                  "Use reports as a substitute for legal due diligence or professional surveys",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5">
                    <span className="text-orange-500 font-bold flex-shrink-0 mt-0.5">—</span>
                    {item}
                  </li>
                ))}
              </ul>
              <p>
                All reports are delivered within the timeframe stated at the time of request (typically 24–48 hours). Where circumstances prevent on-time delivery, we will notify you and agree a revised schedule.
              </p>
            </TermsSection>

            <TermsSection title="6. Limitation of Liability">
              <p>
                GRUTH reports reflect conditions as observed by field inspectors at the time of inspection. We make no guarantees as to future conditions, third-party conduct, or outcomes of transactions made in reliance on our reports.
              </p>
              <p>
                To the maximum extent permitted by law, GRUTH&apos;s total liability to you for any claim arising from use of our service is limited to the fees paid for the specific inspection giving rise to the claim.
              </p>
              <p>
                We are not liable for indirect, consequential, or punitive damages of any kind.
              </p>
            </TermsSection>

            <TermsSection title="7. Acceptable Use">
              <p>You agree not to:</p>
              <ul className="space-y-2 text-charcoal-600 text-sm mt-3">
                {[
                  "Use GRUTH for any unlawful purpose",
                  "Submit false or misleading information in verification requests",
                  "Attempt to access other users' accounts or data",
                  "Use automated tools to scrape or overload the platform",
                  "Engage in any conduct that could damage GRUTH's reputation or relationships with inspectors",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5">
                    <span className="text-orange-500 font-bold flex-shrink-0 mt-0.5">—</span>
                    {item}
                  </li>
                ))}
              </ul>
              <p>
                Violation of these terms may result in immediate account suspension and, where applicable, referral to relevant authorities.
              </p>
            </TermsSection>

            <TermsSection title="8. Intellectual Property">
              <p>
                The GRUTH platform, brand, and all associated technology are our exclusive intellectual property. Inspection reports and evidence collected on your behalf remain your property once delivered, subject to the usage restrictions in Section 5.
              </p>
            </TermsSection>

            <TermsSection title="9. Termination">
              <p>
                You may close your account at any time. We reserve the right to suspend or terminate accounts that violate these Terms. Upon termination, your data will be handled in accordance with our Privacy Policy.
              </p>
            </TermsSection>

            <TermsSection title="10. Governing Law">
              <p>
                These Terms are governed by the laws of Kenya. Any disputes will be subject to the exclusive jurisdiction of the courts of Nairobi, Kenya, unless otherwise required by applicable consumer protection laws in your jurisdiction.
              </p>
            </TermsSection>

            <TermsSection title="11. Changes to These Terms">
              <p>
                We may revise these Terms at any time. Updated Terms will be posted with a new &ldquo;Last updated&rdquo; date. Material changes will be communicated via email or in-app notification. Continued use of GRUTH after the effective date constitutes acceptance of the revised Terms.
              </p>
            </TermsSection>

          </div>

          {/* Footer nav */}
          <div className="mt-16 pt-8 border-t border-charcoal-100 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <p className="text-charcoal-400 text-sm">
              Questions?{" "}
              <a href="mailto:hello@gruth.it.com" className="text-orange-500 hover:text-orange-600 font-medium transition-colors">
                hello@gruth.it.com
              </a>
            </p>
            <Link
              href="/privacy"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-charcoal-600 hover:text-charcoal-950 transition-colors"
            >
              Read our Privacy Policy
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function TermsSection({
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
