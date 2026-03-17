"use client";
// src/components/dashboard/DashboardCharts.tsx

import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

import type {
  ValueType,
  NameType,
  Formatter,
} from "recharts/types/component/DefaultTooltipContent";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Props {
  spendingHistory: { month: string; budget: number; spent: number }[];
  projectsByType: { name: string; value: number }[];
  inspectionTimeline: { date: string; count: number }[];
}

const PIE_COLORS = [
  "#f97316",
  "#0369a1",
  "#16a34a",
  "#7c3aed",
  "#db2777",
  "#d97706",
];

// ─── Shared tooltip ───────────────────────────────────────────────────────────
function Tip({ active, payload, label, currency = false }: any) {
  if (!active || !payload?.length) return null;

  return (
    <div className="bg-charcoal-950 text-white rounded-xl px-4 py-3 shadow-2xl border border-white/10 text-xs min-w-[140px]">
      <p className="font-semibold text-charcoal-300 mb-1.5">{label}</p>

      {payload.map((e: any) => (
        <p
          key={e.name}
          style={{ color: e.color }}
          className="flex justify-between gap-4"
        >
          <span>{e.name}</span>
          <span className="font-bold">
            {currency ? `KES ${Number(e.value).toLocaleString()}` : e.value}
          </span>
        </p>
      ))}
    </div>
  );
}

// ─── Formatters (typed once, reused) ──────────────────────────────────────────
const projectFormatter: Formatter<ValueType, NameType> = (
  value,
  name,
  _item,
  _index,
  _payload,
) => {
  const v = Number(value ?? 0);
  return [`${v} project${v !== 1 ? "s" : ""}`, name];
};

const inspectionFormatter: Formatter<ValueType, NameType> = (
  value,
  _name,
  _item,
  _index,
  _payload,
) => {
  const v = Number(value ?? 0);
  return [`${v} inspection${v !== 1 ? "s" : ""}`, ""];
};

// ─── Charts ──────────────────────────────────────────────────────────────────
export function DashboardCharts({
  spendingHistory,
  projectsByType,
  inspectionTimeline,
}: Props) {
  return (
    <div className="space-y-6">
      {/* Row: Area chart + Pie chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Spending area chart */}
        <div className="card p-6 lg:col-span-2">
          <div className="mb-6">
            <h2 className="font-display font-semibold text-charcoal-950">
              Monthly Spend
            </h2>
            <p className="text-charcoal-400 text-xs mt-0.5">
              Budget vs actual spend, last 6 months
            </p>
          </div>

          <ResponsiveContainer width="100%" height={200}>
            <AreaChart
              data={spendingHistory}
              margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="gradBudget" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.12} />
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                </linearGradient>

                <linearGradient id="gradSpent" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0369a1" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#0369a1" stopOpacity={0} />
                </linearGradient>
              </defs>

              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#f0efe9"
                vertical={false}
              />

              <XAxis
                dataKey="month"
                tick={{ fontSize: 11, fill: "#908e87" }}
                axisLine={false}
                tickLine={false}
              />

              <YAxis
                tick={{ fontSize: 11, fill: "#908e87" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
              />

              <Tooltip content={(props) => <Tip {...props} currency />} />

              <Area
                type="monotone"
                dataKey="budget"
                name="Budget"
                stroke="#f97316"
                strokeWidth={1.5}
                strokeDasharray="4 2"
                fill="url(#gradBudget)"
                dot={false}
              />

              <Area
                type="monotone"
                dataKey="spent"
                name="Spent"
                stroke="#0369a1"
                strokeWidth={2}
                fill="url(#gradSpent)"
                dot={{ fill: "#0369a1", r: 3 }}
                activeDot={{ r: 5 }}
              />
            </AreaChart>
          </ResponsiveContainer>

          <div className="flex items-center gap-5 mt-4">
            {[
              { color: "#f97316", label: "Budget (monthly)", dashed: true },
              { color: "#0369a1", label: "Actual spend", dashed: false },
            ].map(({ color, label, dashed }) => (
              <div key={label} className="flex items-center gap-1.5">
                <svg width="20" height="2">
                  <line
                    x1="0"
                    y1="1"
                    x2="20"
                    y2="1"
                    stroke={color}
                    strokeWidth="2"
                    strokeDasharray={dashed ? "4 2" : undefined}
                  />
                </svg>
                <span className="text-xs text-charcoal-400">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Project type pie */}
        <div className="card p-6">
          <div className="mb-4">
            <h2 className="font-display font-semibold text-charcoal-950">
              By Service Type
            </h2>
            <p className="text-charcoal-400 text-xs mt-0.5">
              Project breakdown
            </p>
          </div>

          {projectsByType.length === 0 ? (
            <div className="flex items-center justify-center h-40 text-charcoal-300 text-sm">
              No data yet
            </div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie
                    data={projectsByType}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={72}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {projectsByType.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>

                  <Tooltip
                    formatter={projectFormatter}
                    contentStyle={{
                      borderRadius: "12px",
                      border: "1px solid #e5e3de",
                      fontSize: 12,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>

              <div className="space-y-2 mt-2">
                {projectsByType.map((entry, i) => (
                  <div
                    key={entry.name}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{
                          background: PIE_COLORS[i % PIE_COLORS.length],
                        }}
                      />
                      <span className="text-xs text-charcoal-600">
                        {entry.name}
                      </span>
                    </div>

                    <span className="text-xs font-semibold text-charcoal-800">
                      {entry.value}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Inspection bar chart */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-display font-semibold text-charcoal-950">
              Inspection Activity
            </h2>
            <p className="text-charcoal-400 text-xs mt-0.5">
              Inspections completed per week
            </p>
          </div>
        </div>

        {inspectionTimeline.length === 0 ? (
          <div className="flex items-center justify-center h-24 text-charcoal-300 text-sm">
            Inspection data will appear here once your first inspection is
            complete.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={140}>
            <BarChart
              data={inspectionTimeline}
              margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#f0efe9"
                vertical={false}
              />

              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: "#908e87" }}
                axisLine={false}
                tickLine={false}
              />

              <YAxis
                tick={{ fontSize: 11, fill: "#908e87" }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />

              <Tooltip
                formatter={inspectionFormatter}
                contentStyle={{
                  borderRadius: "12px",
                  border: "1px solid #e5e3de",
                  fontSize: 12,
                }}
              />

              <Bar
                dataKey="count"
                name="Inspections"
                fill="#f97316"
                radius={[4, 4, 0, 0]}
                maxBarSize={40}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
