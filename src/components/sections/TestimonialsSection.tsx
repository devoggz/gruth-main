// src/components/home/TestimonialsSection.tsx

const testimonials = [
  {
    quote:
      "I was being told my house was 70% done. GroundTruth visited and confirmed the walls were only halfway up. Saved me from sending another £15,000 prematurely.",
    name: "Sarah O.",
    location: "Manchester, UK",
    service: "Construction Verification",
  },
  {
    quote:
      "They visited the plot I was about to buy and discovered it was already being claimed by someone else. I would have lost everything.",
    name: "Michael K.",
    location: "Toronto, Canada",
    service: "Land & Property",
  },
  {
    quote:
      "The material price report was eye-opening. My contractor was quoting cement at nearly 30% above market. GroundTruth negotiated it down for me.",
    name: "Grace N.",
    location: "Oslo, Norway",
    service: "Material Pricing",
  },
];

export default function TestimonialsSection() {
  return (
    <section className="py-24 bg-charcoal-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="inline-flex items-center gap-1.5 text-orange-400 text-sm font-medium tracking-wide uppercase bg-orange-500/10 px-3 py-1 rounded-full mb-4">
            Client Stories
          </span>
          <h2 className="font-display text-4xl font-bold text-white mb-4">
            Trusted by families across the diaspora
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map(({ quote, name, location, service }) => (
            <div
              key={name}
              className="bg-charcoal-900 rounded-xl p-7 border border-charcoal-800"
            >
              <div className="text-orange-400 text-3xl font-serif mb-4">"</div>
              <p className="text-charcoal-200 text-sm leading-relaxed mb-6 italic">
                {quote}
              </p>
              <div className="border-t border-charcoal-800 pt-4">
                <div className="font-semibold text-white text-sm">{name}</div>
                <div className="text-charcoal-400 text-xs">{location}</div>
                <div className="mt-2 inline-flex text-xs bg-orange-500/10 text-orange-400 px-2 py-0.5 rounded-full">
                  {service}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
