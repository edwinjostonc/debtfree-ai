"use client";

import { useState, useMemo } from "react";
import { runSimulation } from "@/lib/financial/simulator";
import type { Debt, Strategy, FinancialMetrics } from "@/lib/financial/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  CalendarDays,
  DollarSign,
  TrendingDown,
  Zap,
  Clock,
  Sparkles,
} from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────────────

interface SimulatorClientProps {
  debts: Debt[];
  monthlyBudget: number;
  metrics: FinancialMetrics;
  baseCurrency?: string;
}

interface ScenarioInputs {
  extraMonthlyPayment: number;
  lumpSumPayment: number;
  lumpSumDebtId: string;
  incomeIncrease: number;
  expenseReduction: number;
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function fmt(n: number) {
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

function fmtDate(d: Date) {
  return new Date(d).toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

function fmtMonths(months: number) {
  const years = Math.floor(months / 12);
  const rem = months % 12;
  if (years === 0) return `${rem}mo`;
  if (rem === 0) return `${years}yr`;
  return `${years}yr ${rem}mo`;
}

// ── Chart Tooltip ──────────────────────────────────────────────────────────────

interface TooltipPayload {
  value: number;
  name: string;
  color: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-lg dark:border-slate-700 dark:bg-slate-900">
      <p className="mb-2 text-xs font-semibold text-slate-500">Month {label}</p>
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center gap-2 text-sm">
          <span className="size-2 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-slate-600 dark:text-slate-400">{entry.name}:</span>
          <span className="font-semibold text-slate-900 dark:text-white">{fmt(entry.value)}</span>
        </div>
      ))}
    </div>
  );
}

// ── Comparison Card ────────────────────────────────────────────────────────────

function ComparisonCard({
  label,
  baseline,
  scenario,
  icon: Icon,
  format,
  lowerIsBetter = true,
}: {
  label: string;
  baseline: string;
  scenario: string;
  icon: React.ElementType;
  format?: (v: string) => string;
  lowerIsBetter?: boolean;
}) {
  const improved = lowerIsBetter
    ? scenario < baseline
    : scenario > baseline;

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="flex size-7 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800">
            <Icon className="size-4 text-slate-500" />
          </div>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800">
            <p className="text-xs text-slate-400 mb-1">Baseline</p>
            <p className="font-bold text-slate-700 dark:text-slate-300 text-sm">{format ? format(baseline) : baseline}</p>
          </div>
          <div className={`rounded-xl p-3 ${improved ? "bg-emerald-50 dark:bg-emerald-900/20" : "bg-slate-50 dark:bg-slate-800"}`}>
            <p className="text-xs text-slate-400 mb-1">Scenario</p>
            <p className={`font-bold text-sm ${improved ? "text-emerald-700 dark:text-emerald-400" : "text-slate-700 dark:text-slate-300"}`}>
              {format ? format(scenario) : scenario}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

export function SimulatorClient({
  debts,
  monthlyBudget,
  metrics: _metrics,
}: SimulatorClientProps) {
  const [strategy, setStrategy] = useState<Strategy>("AVALANCHE");
  const [inputs, setInputs] = useState<ScenarioInputs>({
    extraMonthlyPayment: 0,
    lumpSumPayment: 0,
    lumpSumDebtId: debts[0]?.id ?? "",
    incomeIncrease: 0,
    expenseReduction: 0,
  });

  function setField(field: keyof ScenarioInputs, value: number | string) {
    setInputs((prev) => ({ ...prev, [field]: value }));
  }

  // Run simulation — pure math, no AI
  const result = useMemo(() => {
    if (debts.length === 0) return null;
    return runSimulation({
      debts,
      monthlyBudget,
      strategy,
      extraMonthlyPayment: inputs.extraMonthlyPayment,
      lumpSumPayment: inputs.lumpSumPayment,
      lumpSumDebtId: inputs.lumpSumDebtId || undefined,
      incomeIncrease: inputs.incomeIncrease,
      expenseReduction: inputs.expenseReduction,
    });
  }, [debts, monthlyBudget, strategy, inputs]);

  // Build chart data from monthly summaries — show up to 120 months
  const chartData = useMemo(() => {
    if (!result) return [];

    const baseMap = new Map<number, number>();
    for (const m of result.baseline.monthlySummary) {
      baseMap.set(m.month, m.totalBalance);
    }

    const scenarioMap = new Map<number, number>();
    for (const m of result.scenario.monthlySummary) {
      scenarioMap.set(m.month, m.totalBalance);
    }

    const maxMonth = Math.max(
      result.baseline.totalMonths,
      result.scenario.totalMonths
    );

    const points: { month: number; Baseline: number; Scenario: number }[] = [];
    // Thin out data points for very long timelines
    const step = maxMonth > 120 ? Math.ceil(maxMonth / 120) : 1;

    for (let m = 0; m <= maxMonth; m += step) {
      points.push({
        month: m,
        Baseline: baseMap.get(m) ?? 0,
        Scenario: scenarioMap.get(m) ?? 0,
      });
    }

    // Ensure final zero points appear
    if (points[points.length - 1]?.Baseline !== 0 || points[points.length - 1]?.Scenario !== 0) {
      points.push({ month: maxMonth, Baseline: 0, Scenario: 0 });
    }

    return points;
  }, [result]);

  const hasChanges =
    inputs.extraMonthlyPayment > 0 ||
    inputs.lumpSumPayment > 0 ||
    inputs.incomeIncrease > 0 ||
    inputs.expenseReduction > 0;

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="grid gap-6 lg:grid-cols-[1fr_2fr]">
        {/* Strategy + scenario inputs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="size-4 text-emerald-500" />
              Scenario Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select
              label="Payoff Strategy"
              id="strategy"
              value={strategy}
              onChange={(e) => setStrategy(e.target.value as Strategy)}
            >
              <option value="AVALANCHE">Avalanche (highest rate first)</option>
              <option value="SNOWBALL">Snowball (lowest balance first)</option>
              <option value="HYBRID">Hybrid (balanced)</option>
            </Select>

            <div className="border-t border-slate-100 pt-4 dark:border-slate-800">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">What-If Adjustments</p>

              <div className="space-y-3">
                <Input
                  label="Extra Monthly Payment ($)"
                  type="number"
                  min="0"
                  step="10"
                  placeholder="0"
                  value={inputs.extraMonthlyPayment || ""}
                  onChange={(e) => setField("extraMonthlyPayment", parseFloat(e.target.value) || 0)}
                />

                <div className="grid grid-cols-2 gap-2">
                  <Input
                    label="Lump Sum ($)"
                    type="number"
                    min="0"
                    step="100"
                    placeholder="0"
                    value={inputs.lumpSumPayment || ""}
                    onChange={(e) => setField("lumpSumPayment", parseFloat(e.target.value) || 0)}
                  />
                  <Select
                    label="Apply To"
                    value={inputs.lumpSumDebtId}
                    onChange={(e) => setField("lumpSumDebtId", e.target.value)}
                  >
                    {debts.map((d) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </Select>
                </div>

                <Input
                  label="Monthly Income Increase ($)"
                  type="number"
                  min="0"
                  step="50"
                  placeholder="0"
                  value={inputs.incomeIncrease || ""}
                  onChange={(e) => setField("incomeIncrease", parseFloat(e.target.value) || 0)}
                />

                <Input
                  label="Monthly Expense Reduction ($)"
                  type="number"
                  min="0"
                  step="50"
                  placeholder="0"
                  value={inputs.expenseReduction || ""}
                  onChange={(e) => setField("expenseReduction", parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>

            <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800">
              <p className="text-xs text-slate-500">
                Monthly Budget: <span className="font-semibold text-slate-700 dark:text-slate-300">{fmt(monthlyBudget)}</span>
              </p>
              {hasChanges && (
                <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5">
                  Scenario budget: {fmt(monthlyBudget + inputs.extraMonthlyPayment + inputs.incomeIncrease + inputs.expenseReduction)}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Savings summary */}
        {result && (
          <div className="space-y-4">
            {/* Headline savings */}
            {hasChanges && (
              <div className="rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 p-5 text-white">
                <div className="flex items-center gap-2 mb-3">
                  <Zap className="size-5" />
                  <p className="font-semibold">Your Scenario Saves You</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-3xl font-bold">{fmtMonths(result.monthsSaved)}</p>
                    <p className="text-emerald-100 text-sm mt-0.5">sooner debt-free</p>
                  </div>
                  <div>
                    <p className="text-3xl font-bold">{fmt(result.interestSaved)}</p>
                    <p className="text-emerald-100 text-sm mt-0.5">in interest</p>
                  </div>
                </div>
              </div>
            )}

            {/* Comparison cards */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <ComparisonCard
                label="Debt-Free Date"
                baseline={fmtDate(result.baseline.debtFreeDate)}
                scenario={fmtDate(result.scenario.debtFreeDate)}
                icon={CalendarDays}
                lowerIsBetter={true}
              />
              <ComparisonCard
                label="Total Interest"
                baseline={fmt(result.baseline.totalInterestPaid)}
                scenario={fmt(result.scenario.totalInterestPaid)}
                icon={TrendingDown}
              />
              <ComparisonCard
                label="Total Paid"
                baseline={fmt(result.baseline.totalPaid)}
                scenario={fmt(result.scenario.totalPaid)}
                icon={DollarSign}
              />
              <ComparisonCard
                label="Months Remaining"
                baseline={fmtMonths(result.baseline.totalMonths)}
                scenario={fmtMonths(result.scenario.totalMonths)}
                icon={Clock}
              />
            </div>
          </div>
        )}
      </div>

      {/* Chart */}
      {result && chartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Balance Over Time</CardTitle>
            <p className="text-sm text-slate-500 mt-0.5">
              Projected total debt balance month-by-month
            </p>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={chartData}
                  margin={{ top: 4, right: 8, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="baselineGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f97316" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="scenarioGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.5} />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 11, fill: "#94a3b8" }}
                    tickFormatter={(v: number) => `Mo ${v}`}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "#94a3b8" }}
                    tickFormatter={(v: number) =>
                      v >= 1000 ? `$${(v / 1000).toFixed(0)}k` : `$${v}`
                    }
                    axisLine={false}
                    tickLine={false}
                    width={55}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    wrapperStyle={{ fontSize: "13px", paddingTop: "16px" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="Baseline"
                    stroke="#f97316"
                    strokeWidth={2}
                    fill="url(#baselineGrad)"
                    dot={false}
                    activeDot={{ r: 4 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="Scenario"
                    stroke="#10b981"
                    strokeWidth={2}
                    fill="url(#scenarioGrad)"
                    dot={false}
                    activeDot={{ r: 4 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Debt order info */}
      {result && (
        <Card>
          <CardHeader>
            <CardTitle>Payoff Order ({strategy.charAt(0) + strategy.slice(1).toLowerCase()})</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-2">
              {result.baseline.debtOrder.map((debtId, idx) => {
                const debt = debts.find((d) => d.id === debtId);
                const plan = result.baseline.plans.find((p) => p.debtId === debtId);
                if (!debt || !plan) return null;
                return (
                  <li key={debtId} className="flex items-center gap-3">
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                      {idx + 1}
                    </span>
                    <div className="flex flex-1 items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-medium text-slate-900 dark:text-white">{debt.name}</p>
                        <p className="text-xs text-slate-400">{debt.interestRate}% APR · {fmt(debt.balance)} balance</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">{fmtDate(plan.payoffDate)}</p>
                        <p className="text-xs text-slate-400">{fmt(plan.totalInterest)} interest</p>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ol>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
