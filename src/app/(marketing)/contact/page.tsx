"use client";
// src/app/(marketing)/contact/page.tsx
import React, { useState } from "react";


export default function ContactPage() {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    setSent(true);
    setLoading(false);
  };

  const set = (f: string, v: string) => setForm((p) => ({ ...p, [f]: v }));

  // Current time in EAT (UTC+3) to show availability
  const nowEAT = new Date(Date.now() + 3 * 3600 * 1000);
  const hourEAT = nowEAT.getUTCHours();
  const isOpen = hourEAT >= 8 && hourEAT < 20; // 8am–8pm EAT

  return (
    <div className="pt-16">
      {/* Hero */}
      <section className="bg-charcoal-950 py-16">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <span className="inline-flex items-center gap-1.5 text-orange-400 text-xs font-bold tracking-widest uppercase bg-orange-500/10 border border-orange-500/20 px-3 py-1.5 rounded-full mb-5">
            Get in Touch
          </span>
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-white mb-4 tracking-tight">
            We're here to help.
          </h1>
          <p className="text-charcoal-300 text-lg leading-relaxed max-w-xl mx-auto">
            Message us and we'll respond within 2 business hours (EAT). For
            urgent matters, WhatsApp is fastest.
          </p>
        </div>
      </section>

      <section className="py-16 bg-charcoal-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* ── Left: Contact info ────────────────────────────────────────────── */}
          <div className="space-y-8">
            <div>
              <h2 className="font-display text-xl font-bold text-charcoal-950 mb-5">
                Contact details
              </h2>
              <div className="space-y-5">
                {[
                  {
                    icon: (
                      <svg
                        className="w-4 h-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                        <polyline points="22,6 12,13 2,6" />
                      </svg>
                    ),
                    label: "Email",
                    value: "info@gruth.ke",
                    href: "mailto:info@gruth.ke",
                  },
                  {
                    icon: (
                      <svg
                        className="w-4 h-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <circle cx="12" cy="11" r="3" />
                      </svg>
                    ),
                    label: "Office",
                    value: "Westlands, Nairobi, Kenya",
                    href: null,
                  },
                ].map(({ icon, label, value, href }) => (
                  <div key={label} className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-charcoal-100 rounded-lg flex items-center justify-center flex-shrink-0 text-charcoal-600">
                      {icon}
                    </div>
                    <div>
                      <div className="text-xs text-charcoal-400 uppercase tracking-widest font-semibold mb-0.5">
                        {label}
                      </div>
                      {href ? (
                        <a
                          href={href}
                          className="text-charcoal-800 text-sm font-medium hover:text-orange-600 transition-colors"
                        >
                          {value}
                        </a>
                      ) : (
                        <div className="text-charcoal-800 text-sm font-medium">
                          {value}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Availability card */}
            <div className="bg-white rounded-2xl border border-charcoal-100 p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <div
                  className={`w-2 h-2 rounded-full ${isOpen ? "bg-emerald-500 animate-pulse" : "bg-charcoal-300"}`}
                />
                <span
                  className={`text-xs font-bold uppercase tracking-widest ${isOpen ? "text-emerald-600" : "text-charcoal-400"}`}
                >
                  {isOpen ? "Available now" : "Currently offline"}
                </span>
              </div>
              <div className="space-y-2 text-xs text-charcoal-500">
                <div className="flex justify-between">
                  <span>Mon – Fri</span>
                  <span className="font-semibold text-charcoal-800">
                    8am – 8pm EAT
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Sat – Sun</span>
                  <span className="font-semibold text-charcoal-800">
                    9am – 5pm EAT
                  </span>
                </div>
                <div className="flex justify-between border-t border-charcoal-100 pt-2 mt-2">
                  <span>Response time</span>
                  <span className="font-semibold text-orange-600">
                    Within 2 hours
                  </span>
                </div>
              </div>
            </div>

            {/* WhatsApp CTA */}
            <a
              href="https://wa.me/254106699315?text=Hi%20GRUTH%2C%20I%20need%20a%20verification%20in%20Kenya."
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 bg-[#25D366] hover:bg-[#1ebe5c] text-white rounded-2xl px-5 py-4 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 group"
            >
              {/* WhatsApp SVG icon */}
              <svg
                className="w-6 h-6 flex-shrink-0"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.464 3.488" />
              </svg>
              <div>
                <div className="text-sm font-bold leading-tight">
                  Chat on WhatsApp
                </div>
                <div className="text-[11px] text-green-100 leading-tight">
                  Fastest response · usually &lt;30 min
                </div>
              </div>
              <svg
                className="w-4 h-4 ml-auto opacity-70 group-hover:translate-x-0.5 transition-transform"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </a>
          </div>

          {/* ── Right: Form ───────────────────────────────────────────────────── */}
          <div className="lg:col-span-2">
            {sent ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-charcoal-100 shadow-sm">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-5 ring-8 ring-emerald-50">
                  <svg
                    className="w-8 h-8 text-emerald-600"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                </div>
                <h3 className="font-display text-2xl font-bold text-charcoal-950 mb-3">
                  Message sent!
                </h3>
                <p className="text-charcoal-600 mb-1">
                  We'll get back to you at <strong>{form.email}</strong>
                </p>
                <p className="text-charcoal-400 text-sm">
                  within 2 business hours (EAT).
                </p>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="bg-white rounded-2xl p-8 border border-charcoal-100 shadow-sm space-y-5"
              >
                <div>
                  <h3 className="font-display text-xl font-bold text-charcoal-950 mb-1">
                    Send a message
                  </h3>
                  <p className="text-charcoal-500 text-sm">
                    We read every message and respond within 2 business hours.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="label">Your name</label>
                    <input
                      required
                      className="input-field"
                      placeholder="James Mwangi"
                      value={form.name}
                      onChange={(e) => set("name", e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="label">Email address</label>
                    <input
                      required
                      type="email"
                      className="input-field"
                      placeholder="james@example.com"
                      value={form.email}
                      onChange={(e) => set("email", e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="label">Subject</label>
                  <input
                    required
                    className="input-field"
                    placeholder="How can we help?"
                    value={form.subject}
                    onChange={(e) => set("subject", e.target.value)}
                  />
                </div>

                <div>
                  <label className="label">Message</label>
                  <textarea
                    required
                    rows={5}
                    className="input-field resize-none"
                    placeholder="Tell us about your project or question. Include the property location in Kenya if relevant."
                    value={form.message}
                    onChange={(e) => set("message", e.target.value)}
                  />
                </div>

                <button
                  disabled={loading}
                  type="submit"
                  className="btn-primary w-full justify-center py-3.5 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <svg
                        className="animate-spin w-4 h-4"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <circle
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="3"
                          strokeDasharray="20 60"
                        />
                      </svg>
                      Sending…
                    </span>
                  ) : (
                    <>
                      Send Message
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                      >
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </>
                  )}
                </button>

                <p className="text-xs text-charcoal-400 text-center">
                  For urgent matters, use{" "}
                  <a
                    href="https://wa.me/254106699315"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#25D366] font-semibold hover:underline"
                  >
                    WhatsApp
                  </a>{" "}
                  for a faster response.
                </p>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
