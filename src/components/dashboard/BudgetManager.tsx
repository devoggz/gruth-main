"use client";

import { useState, useEffect, useCallback } from "react";
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
  Cell,
  PieChart,
  Pie,
  Legend,
} from "recharts";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface BudgetEntry {
  id: string;
  projectId: string;
  amount: number;
  category: string;
  description: string | null;
  entryDate: string;
  currency: string;
}

interface ProjectBudget {
  id: string;
  name: string;
  estimatedBudget: number | null;
  currency: string;
}

interface Props {
  projectId: string;
  projectName: string;
  estimatedBudget: number | null;
  currency?: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORIES = [
  "Labour",
  "Materials",
  "Inspector Fee",
  "Transport",
  "Permits & Legal",
  "Equipment",
  "Contingency",
  "Other",
] as const;

const CAT_COLORS: Record<string, string> = {
  Labour: "#f97316",
  Materials: "#0369a1",
  "Inspector Fee": "#16a34a",
  Transport: "#7c3aed",
  "Permits & Legal": "#db2777",
  Equipment: "#d97706",
  Contingency: "#6b7280",
  Other: "#64748b",
};

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(n: number, currency = "KES") {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}k`;
  return n.toLocaleString();
}

function fmtFull(n: number, currency = "KES") {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);
}

function monthKey(date: string) {
  const d = new Date(date);
  return `${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

function toMonthISO(year: number, month: number) {
  return `${year}-${String(month + 1).padStart(2, "0")}-01`;
}

// ─── Custom tooltip ───────────────────────────────────────────────────────────

function ChartTip({ active, payload, label, currency }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-charcoal-950 text-white rounded-xl px-4 py-3 shadow-2xl border border-white/10 text-xs min-w-[160px]">
      <p className="font-semibold text-charcoal-300 mb-2">{label}</p>
      {payload.map((e: any) => (
        <div
          key={e.name}
          className="flex items-center justify-between gap-4 mb-1"
        >
          <div className="flex items-center gap-1.5">
            <div
              className="w-2 h-2 rounded-full"
              style={{ background: e.color }}
            />
            <span className="text-charcoal-300">{e.name}</span>
          </div>
          <span className="font-bold" style={{ color: e.color }}>
            {fmtFull(Number(e.value ?? 0), currency)}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── Entry row ────────────────────────────────────────────────────────────────

function EntryRow({
  entry,
  currency,
  onDelete,
}: {
  entry: BudgetEntry;
  currency: string;
  onDelete: (id: string) => void;
}) {
  const [confirming, setConfirming] = useState(false);

  return (
    <div className="flex items-center gap-3 px-4 py-3 hover:bg-charcoal-50 rounded-xl transition-colors group">
      <div
        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
        style={{ background: CAT_COLORS[entry.category] ?? "#6b7280" }}
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-semibold text-charcoal-900">
            {fmtFull(entry.amount, currency)}
          </span>
          <span className="text-[10px] font-bold text-charcoal-400 uppercase tracking-widest bg-charcoal-100 px-2 py-0.5 rounded-full">
            {entry.category}
          </span>
          <span className="text-xs text-charcoal-400">
            {monthKey(entry.entryDate)}
          </span>
        </div>
        {entry.description && (
          <p className="text-xs text-charcoal-500 mt-0.5 truncate">
            {entry.description}
          </p>
        )}
      </div>
      {!confirming ? (
        <button
          onClick={() => setConfirming(true)}
          className="opacity-0 group-hover:opacity-100 text-charcoal-300 hover:text-red-500 transition-all p-1 flex-shrink-0"
          aria-label="Delete entry"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <path d="M3 6h18M8 6V4h8v2M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
          </svg>
        </button>
      ) : (
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button
            onClick={() => onDelete(entry.id)}
            className="text-[11px] font-bold text-white bg-red-500 hover:bg-red-600 px-2.5 py-1 rounded-lg transition-colors"
          >
            Delete
          </button>
          <button
            onClick={() => setConfirming(false)}
            className="text-[11px] font-bold text-charcoal-500 hover:text-charcoal-800 px-2 py-1 transition-colors"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function BudgetManager({
  projectId,
  projectName,
  estimatedBudget: initialBudget,
  currency = "KES",
}: Props) {
  const [entries, setEntries] = useState<BudgetEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<"overview" | "entries" | "add" | "budget">(
    "overview",
  );
  const [estBudget, setEstBudget] = useState<number | null>(initialBudget);
  const [budgetInput, setBudgetInput] = useState(
    initialBudget?.toString() ?? "",
  );

  // Add form state
  const now = new Date();
  const [form, setForm] = useState({
    amount: "",
    category: CATEGORIES[0] as string,
    description: "",
    month: now.getMonth(),
    year: now.getFullYear(),
  });

  // Fetch entries
  const fetchEntries = useCallback(async () => {
    try {
      const res = await fetch(`/api/budget/${projectId}`);
      if (!res.ok) return;
      const data = await res.json();
      setEntries(data.entries);
      if (data.project.estimatedBudget)
        setEstBudget(data.project.estimatedBudget);
    } catch {
      /* silent */
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  // ── Add entry ──────────────────────────────────────────────────────────────
  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const amount = parseFloat(form.amount);
    if (!amount || amount <= 0) {
      setError("Enter a valid amount");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/budget/${projectId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount,
          category: form.category,
          description: form.description || null,
          entryDate: toMonthISO(form.year, form.month),
          currency,
        }),
      });
      if (!res.ok) {
        setError("Failed to save. Try again.");
        return;
      }
      await fetchEntries();
      setForm((prev) => ({ ...prev, amount: "", description: "" }));
      setTab("entries");
    } catch {
      setError("Network error.");
    } finally {
      setSaving(false);
    }
  }

  // ── Delete entry ───────────────────────────────────────────────────────────
  async function handleDelete(id: string) {
    try {
      await fetch(`/api/budget/${projectId}?entryId=${id}`, {
        method: "DELETE",
      });
      setEntries((prev) => prev.filter((e) => e.id !== id));
    } catch {
      /* silent */
    }
  }

  // ── Update estimated budget ────────────────────────────────────────────────
  async function handleBudgetSave() {
    const amount = parseFloat(budgetInput.replace(/,/g, ""));
    if (!amount || amount <= 0) {
      setError("Enter a valid budget");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/budget/${projectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estimatedBudget: amount }),
      });
      if (!res.ok) {
        setError("Failed to update budget.");
        return;
      }
      setEstBudget(amount);
      setTab("overview");
    } catch {
      setError("Network error.");
    } finally {
      setSaving(false);
    }
  }

  // ── Derived data ───────────────────────────────────────────────────────────

  const totalSpent = entries.reduce((s, e) => s + e.amount, 0);
  const remaining = estBudget ? estBudget - totalSpent : null;
  const pct =
    estBudget && totalSpent > 0
      ? Math.min((totalSpent / estBudget) * 100, 100)
      : 0;

  // Monthly aggregation for area chart — last 12 months
  const monthlyData = (() => {
    const now = new Date();
    const map: Record<
      string,
      { month: string; spent: number; budget: number }
    > = {};
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${MONTHS[d.getMonth()]} ${String(d.getFullYear()).slice(2)}`;
      map[key] = {
        month: key,
        spent: 0,
        budget: estBudget ? estBudget / 12 : 0,
      };
    }
    entries.forEach((e) => {
      const d = new Date(e.entryDate);
      const key = `${MONTHS[d.getMonth()]} ${String(d.getFullYear()).slice(2)}`;
      if (map[key]) map[key].spent += e.amount;
    });
    return Object.values(map);
  })();

  // Category breakdown for pie chart
  const catData = CATEGORIES.map((cat) => ({
    name: cat,
    value: entries
      .filter((e) => e.category === cat)
      .reduce((s, e) => s + e.amount, 0),
  })).filter((d) => d.value > 0);

  // Category totals for list
  const catTotals = catData.sort((a, b) => b.value - a.value);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32 gap-3">
        <div className="w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-charcoal-400 text-sm">Loading budget data…</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* ── Tab bar ─────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-1 bg-charcoal-100 rounded-xl p-1">
        {(
          [
            { id: "overview", label: "Overview" },
            { id: "entries", label: `Entries (${entries.length})` },
            { id: "add", label: "+ Add Spend" },
            { id: "budget", label: "Set Budget" },
          ] as const
        ).map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={[
              "flex-1 px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-150 whitespace-nowrap",
              tab === t.id
                ? "bg-white text-charcoal-950 shadow-sm"
                : "text-charcoal-500 hover:text-charcoal-800",
            ].join(" ")}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Overview ────────────────────────────────────────────────────── */}
      {tab === "overview" && (
        <div className="space-y-4">
          {/* Summary strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              {
                label: "Estimated Budget",
                value: estBudget ? fmtFull(estBudget, currency) : "Not set",
                color: "text-charcoal-950",
                sub: estBudget ? "Total project estimate" : "Set a budget →",
                action: !estBudget ? () => setTab("budget") : undefined,
              },
              {
                label: "Total Spent",
                value: fmtFull(totalSpent, currency),
                color: "text-charcoal-950",
                sub: `${entries.length} entries recorded`,
              },
              {
                label: "Remaining",
                value: remaining != null ? fmtFull(remaining, currency) : "—",
                color:
                  remaining != null && remaining < 0
                    ? "text-red-600"
                    : "text-emerald-600",
                sub:
                  remaining != null && remaining < 0
                    ? "Over budget"
                    : "Available",
              },
              {
                label: "Utilised",
                value: estBudget ? `${pct.toFixed(0)}%` : "—",
                color:
                  pct > 85
                    ? "text-red-600"
                    : pct > 60
                      ? "text-amber-600"
                      : "text-charcoal-950",
                sub:
                  pct > 85
                    ? "At risk"
                    : pct > 60
                      ? "Monitor closely"
                      : "On track",
              },
            ].map(({ label, value, color, sub, action }) => (
              <button
                key={label}
                onClick={action}
                className={`bg-white border border-charcoal-100 rounded-2xl p-4 text-left transition-all ${action ? "hover:border-orange-200 cursor-pointer" : "cursor-default"}`}
              >
                <div className="text-[10px] font-bold text-charcoal-400 uppercase tracking-widest mb-1.5">
                  {label}
                </div>
                <div
                  className={`font-display text-xl font-bold leading-tight ${color}`}
                >
                  {value}
                </div>
                <div className="text-xs text-charcoal-400 mt-1">{sub}</div>
              </button>
            ))}
          </div>

          {/* Progress bar */}
          {estBudget && totalSpent > 0 && (
            <div className="bg-white border border-charcoal-100 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-2 text-xs">
                <span className="text-charcoal-500 font-medium">
                  Budget utilisation
                </span>
                <span
                  className={`font-bold ${pct > 85 ? "text-red-600" : pct > 60 ? "text-amber-600" : "text-emerald-600"}`}
                >
                  {pct.toFixed(1)}%
                </span>
              </div>
              <div className="h-3 bg-charcoal-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${pct}%`,
                    background:
                      pct > 85 ? "#dc2626" : pct > 60 ? "#f97316" : "#16a34a",
                  }}
                />
              </div>
              <div className="flex items-center justify-between mt-1.5 text-[10px] text-charcoal-400">
                <span>KES 0</span>
                <span>{fmtFull(estBudget, currency)}</span>
              </div>
            </div>
          )}

          {/* Monthly trend chart */}
          {entries.length > 0 ? (
            <div className="bg-white border border-charcoal-100 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-display font-semibold text-charcoal-950 text-sm">
                    Monthly Spend
                  </h3>
                  <p className="text-charcoal-400 text-xs mt-0.5">
                    Actual spend vs. monthly budget estimate · last 12 months
                  </p>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart
                  data={monthlyData}
                  margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="gBudget" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f97316" stopOpacity={0.1} />
                      <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gSpent" x1="0" y1="0" x2="0" y2="1">
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
                    tick={{ fontSize: 10, fill: "#908e87" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: "#908e87" }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => fmt(v, currency)}
                  />
                  <Tooltip
                    content={(p) => <ChartTip {...p} currency={currency} />}
                  />
                  <Area
                    type="monotone"
                    dataKey="budget"
                    name="Budget/mo"
                    stroke="#f97316"
                    strokeWidth={1.5}
                    strokeDasharray="4 2"
                    fill="url(#gBudget)"
                    dot={false}
                  />
                  <Area
                    type="monotone"
                    dataKey="spent"
                    name="Actual Spend"
                    stroke="#0369a1"
                    strokeWidth={2}
                    fill="url(#gSpent)"
                    dot={{ fill: "#0369a1", r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="bg-white border border-charcoal-100 rounded-2xl p-10 text-center">
              <div className="w-10 h-10 bg-charcoal-50 rounded-xl flex items-center justify-center mx-auto mb-3">
                <svg
                  className="w-5 h-5 text-charcoal-300"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <path d="M3 3v18h18" />
                  <path d="M7 16l4-4 4 4 4-7" />
                </svg>
              </div>
              <p className="text-charcoal-500 text-sm font-medium mb-1">
                No spend entries yet
              </p>
              <p className="text-charcoal-400 text-xs mb-4">
                Add your first spend entry to start tracking
              </p>
              <button
                onClick={() => setTab("add")}
                className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-colors"
              >
                Add First Entry
              </button>
            </div>
          )}

          {/* Category breakdown */}
          {catData.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Pie chart */}
              <div className="bg-white border border-charcoal-100 rounded-2xl p-5">
                <h3 className="font-display font-semibold text-charcoal-950 text-sm mb-4">
                  By Category
                </h3>
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie
                      data={catData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={78}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {catData.map((entry, i) => (
                        <Cell
                          key={i}
                          fill={CAT_COLORS[entry.name] ?? "#6b7280"}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(v: any) => [fmtFull(Number(v), currency), ""]}
                      contentStyle={{
                        borderRadius: "12px",
                        border: "1px solid #e5e3de",
                        fontSize: 11,
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Category list */}
              <div className="bg-white border border-charcoal-100 rounded-2xl p-5">
                <h3 className="font-display font-semibold text-charcoal-950 text-sm mb-4">
                  Category Breakdown
                </h3>
                <div className="space-y-3">
                  {catTotals.map((cat) => {
                    const catPct =
                      totalSpent > 0 ? (cat.value / totalSpent) * 100 : 0;
                    return (
                      <div key={cat.name}>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-2 h-2 rounded-full"
                              style={{
                                background: CAT_COLORS[cat.name] ?? "#6b7280",
                              }}
                            />
                            <span className="text-charcoal-700 font-medium">
                              {cat.name}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-charcoal-500">
                              {catPct.toFixed(0)}%
                            </span>
                            <span className="font-bold text-charcoal-900">
                              {fmtFull(cat.value, currency)}
                            </span>
                          </div>
                        </div>
                        <div className="h-1.5 bg-charcoal-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{
                              width: `${catPct}%`,
                              background: CAT_COLORS[cat.name] ?? "#6b7280",
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Entries list ─────────────────────────────────────────────────── */}
      {tab === "entries" && (
        <div className="bg-white border border-charcoal-100 rounded-2xl overflow-hidden">
          {entries.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-charcoal-400 text-sm mb-3">No entries yet.</p>
              <button
                onClick={() => setTab("add")}
                className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-colors"
              >
                Add First Entry
              </button>
            </div>
          ) : (
            <>
              <div className="px-4 py-3 border-b border-charcoal-100 flex items-center justify-between">
                <span className="text-xs font-bold text-charcoal-400 uppercase tracking-widest">
                  {entries.length} entries · {fmtFull(totalSpent, currency)}{" "}
                  total
                </span>
                <button
                  onClick={() => setTab("add")}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-orange-500 hover:text-orange-600 transition-colors"
                >
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  >
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                  Add Entry
                </button>
              </div>
              <div className="divide-y divide-charcoal-50 p-2">
                {[...entries].reverse().map((entry) => (
                  <EntryRow
                    key={entry.id}
                    entry={entry}
                    currency={currency}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* ── Add entry form ────────────────────────────────────────────────── */}
      {tab === "add" && (
        <div className="bg-white border border-charcoal-100 rounded-2xl p-5 sm:p-6">
          <h3 className="font-display font-semibold text-charcoal-950 mb-5">
            Add Spend Entry
          </h3>
          <form onSubmit={handleAdd} className="space-y-4">
            {/* Amount */}
            <div>
              <label className="label">
                Amount ({currency}) <span className="text-orange-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                step="any"
                required
                value={form.amount}
                onChange={(e) =>
                  setForm((p) => ({ ...p, amount: e.target.value }))
                }
                placeholder="e.g. 45000"
                className="input-field"
              />
            </div>

            {/* Category */}
            <div>
              <label className="label">
                Category <span className="text-orange-500">*</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setForm((p) => ({ ...p, category: cat }))}
                    className={[
                      "px-3 py-2.5 rounded-xl text-xs font-semibold border transition-all duration-150 text-left",
                      form.category === cat
                        ? "border-orange-400 bg-orange-50 text-orange-700"
                        : "border-charcoal-200 text-charcoal-600 hover:border-charcoal-300",
                    ].join(" ")}
                  >
                    <div className="flex items-center gap-1.5">
                      <div
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ background: CAT_COLORS[cat] }}
                      />
                      {cat}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Month + Year */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">
                  Month <span className="text-orange-500">*</span>
                </label>
                <select
                  value={form.month}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, month: Number(e.target.value) }))
                  }
                  className="input-field"
                >
                  {MONTHS.map((m, i) => (
                    <option key={m} value={i}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">
                  Year <span className="text-orange-500">*</span>
                </label>
                <select
                  value={form.year}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, year: Number(e.target.value) }))
                  }
                  className="input-field"
                >
                  {[
                    now.getFullYear() - 1,
                    now.getFullYear(),
                    now.getFullYear() + 1,
                  ].map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="label">
                Description{" "}
                <span className="text-charcoal-400 font-normal">
                  (optional)
                </span>
              </label>
              <input
                type="text"
                value={form.description}
                onChange={(e) =>
                  setForm((p) => ({ ...p, description: e.target.value }))
                }
                placeholder="e.g. Cement batch 3 — Kiambu supplier"
                className="input-field"
              />
            </div>

            {error && <p className="text-red-500 text-xs">{error}</p>}

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition-colors"
              >
                {saving ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Saving…
                  </>
                ) : (
                  "Save Entry"
                )}
              </button>
              <button
                type="button"
                onClick={() => setTab("overview")}
                className="text-sm text-charcoal-500 hover:text-charcoal-800 px-4 py-2.5 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Set estimated budget ─────────────────────────────────────────── */}
      {tab === "budget" && (
        <div className="bg-white border border-charcoal-100 rounded-2xl p-5 sm:p-6">
          <h3 className="font-display font-semibold text-charcoal-950 mb-2">
            Set Project Budget
          </h3>
          <p className="text-charcoal-500 text-sm mb-6 leading-relaxed">
            This is your total estimated budget for{" "}
            <span className="font-semibold text-charcoal-700">
              {projectName}
            </span>
            . It will be used as the baseline for all budget tracking charts and
            utilisation calculations.
          </p>
          <div className="space-y-4">
            <div>
              <label className="label">
                Estimated Total Budget ({currency}){" "}
                <span className="text-orange-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-charcoal-400 text-sm font-semibold">
                  {currency === "KES" ? "KSh" : currency}
                </span>
                <input
                  type="number"
                  min="1"
                  step="any"
                  value={budgetInput}
                  onChange={(e) => setBudgetInput(e.target.value)}
                  placeholder="e.g. 2500000"
                  className="input-field pl-12"
                />
              </div>
              {budgetInput && !isNaN(parseFloat(budgetInput)) && (
                <p className="text-xs text-charcoal-400 mt-1.5">
                  = {fmtFull(parseFloat(budgetInput), currency)}
                </p>
              )}
            </div>

            {error && <p className="text-red-500 text-xs">{error}</p>}

            <div className="flex gap-3">
              <button
                onClick={handleBudgetSave}
                disabled={saving}
                className="inline-flex items-center gap-2 bg-charcoal-950 hover:bg-charcoal-800 disabled:opacity-50 text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition-colors"
              >
                {saving ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Saving…
                  </>
                ) : (
                  "Update Budget"
                )}
              </button>
              <button
                onClick={() => setTab("overview")}
                className="text-sm text-charcoal-500 hover:text-charcoal-800 px-4 py-2.5 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
