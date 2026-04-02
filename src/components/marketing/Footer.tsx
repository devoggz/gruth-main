// src/components/marketing/Footer.tsx
// Upgraded: WhatsApp channel link, social icons, referral nudge, community links

import Link from "next/link";
import Image from "next/image";

const SOCIAL = [
  {
    label: "WhatsApp",
    href: "https://whatsapp.com/channel/gruth-kenya",
    color: "hover:bg-[#25D366]",
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
      </svg>
    ),
  },
  {
    label: "Facebook",
    href: "https://facebook.com/gruthke",
    color: "hover:bg-[#1877F2]",
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
  },
  {
    label: "YouTube",
    href: "https://youtube.com/@gruthke",
    color: "hover:bg-[#FF0000]",
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
  },
  {
    label: "X",
    href: "https://x.com/gruthke",
    color: "hover:bg-charcoal-700",
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
];

export default function Footer() {
  return (
    <footer className="bg-charcoal-950 text-white">
      {/* Referral strip */}
      <div className="border-b border-white/[0.06] bg-white/[0.02]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-charcoal-400 text-xs text-center sm:text-left">
            <span className="text-white font-semibold">Refer a friend</span> who
            completes a verification →{" "}
            <span className="text-orange-400">earn a free one.</span>
          </p>
          <Link
            href="/dashboard/settings"
            className="flex-shrink-0 text-xs font-semibold text-orange-400 hover:text-orange-300 border border-orange-500/30 hover:border-orange-400/50 px-4 py-1.5 rounded-lg transition-all"
          >
            Get your referral link →
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="inline-block mb-5">
              <Image
                src="/images/logo-w.svg"
                alt="GRUTH"
                width={140}
                height={40}
              />
            </Link>
            <p className="text-charcoal-400 text-sm leading-relaxed mb-5">
              Independent, on-the-ground verification for Kenyans abroad.
            </p>
            <p className="text-charcoal-500 text-xs mb-5">hello@gruth.ke</p>

            {/* Social icons */}
            <div className="flex items-center gap-2">
              {SOCIAL.map(({ label, href, color, icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={label}
                  className={`w-8 h-8 bg-white/[0.05] border border-white/[0.08] ${color} rounded-lg flex items-center justify-center text-charcoal-400 hover:text-white transition-all`}
                >
                  {icon}
                </a>
              ))}
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-semibold text-xs uppercase tracking-widest text-charcoal-400 mb-5">
              Services
            </h4>
            <ul className="space-y-3 text-sm text-charcoal-500">
              {[
                "Construction Verification",
                "Land & Property",
                "Wedding & Events",
                "Business Investment",
                "Material Pricing",
              ].map((s) => (
                <li key={s}>
                  <Link
                    href="/services"
                    className="hover:text-white transition-colors"
                  >
                    {s}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold text-xs uppercase tracking-widest text-charcoal-400 mb-5">
              Company
            </h4>
            <ul className="space-y-3 text-sm text-charcoal-500">
              {[
                ["About Us", "/about"],
                ["How It Works", "/how-it-works"],
                ["Contact", "/contact"],
                ["Sign In", "/login"],
                ["Get Started", "/request-verification"],
              ].map(([label, href]) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="hover:text-white transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Community */}
          <div>
            <h4 className="font-semibold text-xs uppercase tracking-widest text-charcoal-400 mb-5">
              Community
            </h4>
            <ul className="space-y-3 text-sm text-charcoal-500">
              {[
                [
                  "WhatsApp Channel",
                  "https://whatsapp.com/channel/gruth-kenya",
                ],
                ["Facebook Groups", "https://facebook.com/gruthke"],
                ["YouTube", "https://youtube.com/@gruthke"],
                ["Refer & Earn", "/dashboard/settings"],
              ].map(([label, href]) => (
                <li key={label}>
                  <Link
                    href={href}
                    {...(href.startsWith("http")
                      ? { target: "_blank", rel: "noreferrer" }
                      : {})}
                    className="hover:text-white transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>

            {/* WhatsApp channel highlight */}
            {/*<a href="https://whatsapp.com/channel/gruth-kenya" target="_blank" rel="noreferrer"*/}
            {/*   className="mt-6 flex items-center gap-2.5 bg-[#25D366]/10 border border-[#25D366]/20 hover:border-[#25D366]/40 rounded-xl px-3 py-2.5 transition-all group">*/}
            {/*  <svg className="w-4 h-4 text-[#25D366] flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">*/}
            {/*    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>*/}
            {/*  </svg>*/}
            {/*  <div>*/}
            {/*    <p className="text-[10px] font-bold text-[#25D366] leading-none">Weekly market prices</p>*/}
            {/*    <p className="text-[10px] text-charcoal-500 mt-0.5 group-hover:text-charcoal-400 transition-colors">Join free on WhatsApp</p>*/}
            {/*  </div>*/}
            {/*</a>*/}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-charcoal-800 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-charcoal-500 text-xs">
            © {new Date().getFullYear()} GRUTH. All rights reserved. · Built by
            diaspora, for diaspora.
          </p>
          <div className="flex gap-6 text-xs text-charcoal-500">
            <Link
              href="/privacy"
              className="hover:text-white transition-colors"
            >
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-white transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
