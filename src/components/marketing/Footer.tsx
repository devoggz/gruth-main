// src/components/marketing/Footer.tsx
import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="bg-charcoal-950 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <Link href="/" className="flex items-center gap-2.5 group">
                <Image
                  src="/images/logo-w.svg"
                  alt="logo"
                  width={180}
                  height={100}
                />
              </Link>
            </div>
            <p className="text-charcoal-300 text-sm leading-relaxed mb-6">
              Reality, confirmed before you send the money.
            </p>
            <p className="text-charcoal-400 text-xs">
              hello@gruth.it.com
              {/*<br />*/}
              {/*+254 700 000 000*/}
            </p>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider text-charcoal-300 mb-5">
              Services
            </h4>
            <ul className="space-y-3 text-sm text-charcoal-400">
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
            <h4 className="font-semibold text-sm uppercase tracking-wider text-charcoal-300 mb-5">
              Company
            </h4>
            <ul className="space-y-3 text-sm text-charcoal-400">
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

          {/* Trust */}
          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider text-charcoal-300 mb-5">
              Why GRUTH
            </h4>
            <ul className="space-y-3">
              {[
                ["✓", "Photo & video evidence"],
                ["✓", "Structured written reports"],
                ["✓", "Real-time dashboard"],
                ["✓", "Secure & confidential"],
              ].map(([icon, text]) => (
                <li
                  key={text}
                  className="flex items-start gap-2 text-sm text-charcoal-400"
                >
                  <span className="text-orange-400 font-bold flex-shrink-0">
                    {icon}
                  </span>
                  {text}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-charcoal-800 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-charcoal-400 text-xs">
            © {new Date().getFullYear()} GRUTH. All rights reserved.
          </p>
          <div className="flex gap-6 text-xs text-charcoal-400">
            <Link
              href="/privacy"
              className="hover:text-white transition-colors duration-150"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="hover:text-white transition-colors duration-150"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
