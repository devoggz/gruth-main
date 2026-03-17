// src/app/(marketing)/how-it-works/page.tsx
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "How It Works",
};

const steps = [
  {
    number: "01",
    title: "Submit Your Verification Request",
    desc: "Fill out our simple request form with your name, project location, service type, and a brief description of what you need verified. You can also message us directly on WhatsApp.",
    detail:
      "We'll confirm receipt within 2 business hours and ask any clarifying questions we need before dispatching your inspector.",
    icon: (
      <svg
        className="w-7 h-7"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    number: "02",
    title: "Inspector Assigned & Dispatched",
    desc: "We assign a vetted, licensed local inspector with relevant expertise for your project type. For construction, this means someone with civil engineering background. For legal matters, we have associates with property law experience.",
    detail:
      "You'll receive your inspector's name, credentials, and confirmation of the inspection date before they visit.",
    icon: (
      <svg
        className="w-7 h-7"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    number: "03",
    title: "On-the-Ground Evidence Collection",
    desc: "The inspector visits the location and conducts a thorough, systematic inspection. They photograph every angle, record video walkthroughs, take measurements, interview on-site personnel, and document any discrepancies.",
    detail:
      "All evidence is geotagged and timestamped. Nothing is edited or filtered — you see everything we see.",
    icon: (
      <svg
        className="w-7 h-7"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <path d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
        <path d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    number: "04",
    title: "Structured Report Delivered",
    desc: "Within 24–48 hours of the inspection, your detailed report is published to your secure client dashboard. It includes inspector observations, photographic evidence, video walkthroughs, and clear recommendations.",
    detail:
      "You can download the report as a PDF, share it securely, and message our team directly if you have follow-up questions.",
    icon: (
      <svg
        className="w-7 h-7"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <path d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
];

const faqs = [
  {
    q: "How long does an inspection take?",
    a: "Most standard inspections take 1–2 business days from request to report delivery. Complex construction inspections may take up to 3 days.",
  },
  {
    q: "How do I know your inspectors are trustworthy?",
    a: "All inspectors undergo background checks, carry verified credentials, and operate under our code of conduct. We have never had a compromised inspector in our history.",
  },
  {
    q: "Can I request multiple visits for ongoing projects?",
    a: "Yes. Most construction clients subscribe to regular monthly inspections throughout the project. We offer bundled pricing for ongoing monitoring.",
  },
  {
    q: "What if the situation looks fraudulent?",
    a: "We will document everything and note our concerns clearly in the report. We can also refer you to legal practitioners in Kenya if needed.",
  },
  {
    q: "Do you cover all areas of Kenya?",
    a: "We currently cover all major urban and peri-urban areas. For rural inspections, please contact us — we can usually arrange coverage with 48 hours notice.",
  },
];

export default function HowItWorksPage() {
  return (
    <div className="pt-16">
      <section className="bg-charcoal-950 py-20">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <span className="inline-flex items-center gap-1.5 text-orange-400 text-sm font-medium tracking-wide uppercase bg-orange-500/10 px-3 py-1 rounded-full mb-6">
            The Process
          </span>
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-white mb-6">
            Simple. Transparent. Thorough.
          </h1>
          <p className="text-charcoal-300 text-lg">
            From request to report in as little as 24 hours.
          </p>
        </div>
      </section>

      {/* Steps */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {steps.map(({ number, title, desc, detail, icon }) => (
            <div key={number} className="flex gap-8 items-start">
              <div className="flex flex-col items-center flex-shrink-0">
                <div className="w-16 h-16 bg-charcoal-950 text-white rounded-2xl flex items-center justify-center">
                  {icon}
                </div>
                <div className="font-mono text-xs text-charcoal-400 mt-2">
                  {number}
                </div>
              </div>
              <div className="flex-1 pb-12 border-b border-gray-100 last:border-0">
                <h2 className="font-display text-2xl font-bold text-charcoal-950 mb-3">
                  {title}
                </h2>
                <p className="text-charcoal-600 leading-relaxed mb-4">{desc}</p>
                <div className="bg-orange-50 border-l-4 border-orange-400 pl-4 py-2">
                  <p className="text-charcoal-700 text-sm leading-relaxed">
                    {detail}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Dashboard preview callout */}
      <section className="bg-charcoal-50 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-charcoal-950 rounded-2xl p-10 text-center">
            <div className="text-4xl mb-4">📱</div>
            <h2 className="font-display text-3xl font-bold text-white mb-4">
              Monitor everything from your dashboard
            </h2>
            <p className="text-charcoal-300 leading-relaxed mb-8 max-w-2xl mx-auto">
              Once you're a client, your secure dashboard gives you real-time
              access to all your projects, inspection timelines, evidence
              galleries, material prices, and direct communication with our
              team.
            </p>
            <Link href="/register" className="btn-primary text-base px-8 py-4">
              Create Your Account
            </Link>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-3xl font-bold text-charcoal-950 mb-12 text-center">
            Frequently asked questions
          </h2>
          <div className="space-y-8">
            {faqs.map(({ q, a }) => (
              <div key={q} className="border-b border-gray-100 pb-8">
                <h3 className="font-semibold text-charcoal-900 mb-3">{q}</h3>
                <p className="text-charcoal-600 text-sm leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
