// src/app/(marketing)/about/page.tsx
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "About GRUTH" };

export default function AboutPage() {
  return (
    <div className="pt-16">
      <section className="bg-charcoal-950 py-20">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <span className="inline-flex items-center gap-1.5 text-orange-400 text-sm font-medium tracking-wide uppercase bg-orange-500/10 px-3 py-1 rounded-full mb-6">
            Our Story
          </span>
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-white mb-6">
            Built by diaspora, for diaspora.
          </h1>
          <p className="text-charcoal-300 text-lg leading-relaxed max-w-2xl mx-auto">
            GRUTH was founded because our team experienced firsthand what
            happens when you send money home and have no way to verify it's
            being used honestly.
          </p>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="prose prose-lg max-w-none text-charcoal-700 leading-relaxed space-y-6">
            <h2 className="font-display text-3xl font-bold text-charcoal-950">
              Why we exist
            </h2>
            <p>
              Every year, the Kenyan diaspora sends over $4 billion home. That
              money funds homes, businesses, education, and events. It also,
              unfortunately, funds fraud.
            </p>
            <p>
              The problem isn't unique to Kenya — it's a trust gap that exists
              whenever someone sends money to a place they can't physically
              monitor. Contractors report false progress. Relatives inflate
              costs. Vendors accept deposits and disappear. Land is sold to
              multiple buyers. And the person abroad, thousands of miles away,
              has no way to know until it's too late.
            </p>
            <p>
              GRUTH was built to close that gap. We're a team of Kenyans — some
              based in Nairobi, some in the diaspora ourselves — who believe
              that sending money home should come with the same transparency
              you'd expect if you were standing there yourself.
            </p>

            <h2 className="font-display text-3xl font-bold text-charcoal-950 pt-4">
              Our values
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 not-prose">
              {[
                {
                  title: "Radical transparency",
                  desc: "We show you exactly what we find — good or bad. We do not filter our reports for anyone.",
                },
                {
                  title: "Inspector independence",
                  desc: "Our inspectors have no relationship with contractors, suppliers, or vendors. They report only to you.",
                },
                {
                  title: "Evidence over opinion",
                  desc: "Every finding is supported by photos, video, measurements, and documented interviews.",
                },
                {
                  title: "Client confidentiality",
                  desc: "Your projects, financial details, and reports are never shared with third parties.",
                },
              ].map(({ title, desc }) => (
                <div key={title} className="bg-charcoal-50 rounded-xl p-6">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mb-3" />
                  <h3 className="font-semibold text-charcoal-950 mb-2">
                    {title}
                  </h3>
                  <p className="text-charcoal-600 text-sm leading-relaxed">
                    {desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team */}
      {/*<section className="py-20 bg-charcoal-50">*/}
      {/*  <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">*/}
      {/*    <h2 className="font-display text-3xl font-bold text-charcoal-950 mb-12 text-center">*/}
      {/*      The team*/}
      {/*    </h2>*/}
      {/*    <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">*/}
      {/*      {team.map(({ name, role, bio, initials }) => (*/}
      {/*        <div key={name} className="text-center">*/}
      {/*          <div className="w-16 h-16 bg-charcoal-950 text-white rounded-full flex items-center justify-center font-display font-bold text-lg mx-auto mb-4">*/}
      {/*            {initials}*/}
      {/*          </div>*/}
      {/*          <h3 className="font-semibold text-charcoal-950 mb-0.5">*/}
      {/*            {name}*/}
      {/*          </h3>*/}
      {/*          <p className="text-orange-600 text-sm mb-4">{role}</p>*/}
      {/*          <p className="text-charcoal-500 text-sm leading-relaxed">*/}
      {/*            {bio}*/}
      {/*          </p>*/}
      {/*        </div>*/}
      {/*      ))}*/}
      {/*    </div>*/}
      {/*  </div>*/}
      {/*</section>*/}

      <section className="py-20 bg-orange-500">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="font-display text-4xl font-bold text-white mb-4">
            Ready to work with us?
          </h2>
          <p className="text-orange-100 mb-8">
            Join 850+ diaspora families who send money home with confidence.
          </p>
          <Link
            href="/request-verification"
            className="inline-flex items-center justify-center bg-white text-orange-600 font-semibold px-8 py-4 rounded-lg hover:bg-orange-50 transition-colors"
          >
            Get Started
          </Link>
        </div>
      </section>
    </div>
  );
}
