// src/components/home/StatsBar.tsx

const stats = [
  { stat: "850+", label: "Inspections completed" },
  { stat: "18", label: "Counties covered" },
  { stat: "98%", label: "Client satisfaction" },
  { stat: "$1M+", label: "Remittances protected" },
];

export default function StatsBar() {
  return (
    <section className="bg-orange-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map(({ stat, label }) => (
            <div key={label} className="text-center">
              <div className="font-display text-3xl font-bold text-white">
                {stat}
              </div>
              <div className="text-orange-100 text-sm mt-1">{label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
