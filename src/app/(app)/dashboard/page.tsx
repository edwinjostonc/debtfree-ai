import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { computeMetricsMultiCurrency, convertDebtsToBase } from "@/lib/financial/metrics-multi";
import { dtiRating, formatPercent } from "@/lib/financial/metrics";
import { calculatePayoff } from "@/lib/financial/payoff";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardCharts } from "@/components/dashboard/charts";
import { DebtSummaryList } from "@/components/dashboard/debt-summary-list";
import { formatMoney, getCurrencyInfo } from "@/lib/currency";
import Link from "next/link";
import { Bot, Plus, AlertCircle, Settings, TrendingDown, TrendingUp, Calendar, DollarSign } from "lucide-react";

export default async function DashboardPage() {
  const session = await auth();
  const userId = session!.user!.id!;

  const [user, debts, incomes, expenses] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: { baseCurrency: true, name: true } }),
    prisma.debt.findMany({ where: { userId, isPaidOff: false }, orderBy: { balance: "desc" } }),
    prisma.income.findMany({ where: { userId, isActive: true } }),
    prisma.expense.findMany({ where: { userId } }),
  ]);

  const baseCurrency = user?.baseCurrency ?? "USD";
  const baseInfo = getCurrencyInfo(baseCurrency);
  const firstName = user?.name?.split(" ")[0] ?? "there";

  const metrics = await computeMetricsMultiCurrency(debts, incomes, expenses, baseCurrency);

  const debtInput = await convertDebtsToBase(
    debts.map((d) => ({
      id: d.id, name: d.name, type: d.type,
      balance: d.balance, originalBalance: d.originalBalance,
      interestRate: d.interestRate, minimumPayment: d.minimumPayment,
      currency: d.currency,
    })),
    baseCurrency
  );

  const monthlyBudget = Math.max(metrics.monthlyIncome - metrics.monthlyExpenses, metrics.totalMinimumPayments);
  const payoffResult = debtInput.length > 0 ? calculatePayoff(debtInput, monthlyBudget, "AVALANCHE") : null;
  const dtiInfo = dtiRating(metrics.debtToIncomeRatio);
  const hasNoData = debts.length === 0 && incomes.length === 0;
  const fmt = (v: number) => formatMoney(v, baseCurrency);

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Hey, {firstName} 👋
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Totals in <span className="font-medium text-slate-700 dark:text-slate-300">{baseInfo.code} ({baseInfo.symbol})</span>
            <span className="mx-1.5 text-slate-300 dark:text-slate-600">·</span>
            <Link href="/settings" className="text-emerald-600 hover:text-emerald-500 transition-colors">
              Change
            </Link>
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <Link href="/settings" className="flex items-center justify-center h-9 w-9 rounded-xl border border-slate-200 bg-white/80 text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-all dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800">
            <Settings size={16} />
          </Link>
          <Link href="/debts" className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:-translate-y-0.5 transition-all">
            <Plus size={15} />
            Add Debt
          </Link>
        </div>
      </div>

      {/* Onboarding */}
      {hasNoData && (
        <div className="relative overflow-hidden rounded-2xl border border-emerald-200/60 bg-gradient-to-br from-emerald-50 to-teal-50/50 p-6 dark:border-emerald-800/30 dark:from-emerald-950/40 dark:to-teal-950/20">
          <div className="absolute right-0 top-0 h-32 w-32 translate-x-8 -translate-y-8 rounded-full bg-emerald-400/10 blur-2xl" />
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-950">
              <AlertCircle size={18} className="text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h3 className="font-semibold text-emerald-900 dark:text-emerald-100">Let&apos;s build your debt-free plan</h3>
              <p className="mt-1 text-sm text-emerald-700 dark:text-emerald-300">
                Add your debts and income to see your personalized payoff timeline.
              </p>
              <div className="mt-4 flex gap-3">
                <Link href="/debts" className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-500/20">
                  Add First Debt
                </Link>
                <Link href="/income" className="rounded-xl border border-emerald-300 bg-white/80 px-4 py-2 text-sm font-semibold text-emerald-700 hover:bg-white transition-colors dark:border-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
                  Add Income
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Metric cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Total Debt"
          value={fmt(metrics.totalDebt)}
          sub={`${debts.length} active debt${debts.length !== 1 ? "s" : ""}`}
          icon={<TrendingDown size={18} />}
          iconBg="bg-red-100 text-red-600 dark:bg-red-950/60 dark:text-red-400"
          trend="negative"
        />
        <MetricCard
          label="Monthly Income"
          value={fmt(metrics.monthlyIncome)}
          sub="from all sources"
          icon={<DollarSign size={18} />}
          iconBg="bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400"
          trend="positive"
        />
        <MetricCard
          label="Debt-to-Income"
          value={formatPercent(metrics.debtToIncomeRatio)}
          sub={dtiInfo.label}
          icon={<TrendingUp size={18} />}
          iconBg={
            metrics.debtToIncomeRatio < 36
              ? "bg-blue-100 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400"
              : "bg-orange-100 text-orange-600 dark:bg-orange-950/60 dark:text-orange-400"
          }
          trend={metrics.debtToIncomeRatio < 36 ? "positive" : "negative"}
        />
        {payoffResult ? (
          <MetricCard
            label="Debt-Free Date"
            value={payoffResult.debtFreeDate.toLocaleDateString("en-US", { month: "short", year: "numeric" })}
            sub={`${payoffResult.totalMonths} months away`}
            icon={<Calendar size={18} />}
            iconBg="bg-violet-100 text-violet-600 dark:bg-violet-950/60 dark:text-violet-400"
            trend="positive"
          />
        ) : (
          <MetricCard
            label="Available/Month"
            value={fmt(metrics.availableForDebt)}
            sub="for extra payments"
            icon={<DollarSign size={18} />}
            iconBg="bg-blue-100 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400"
            trend="positive"
          />
        )}
      </div>

      {/* Charts + sidebar */}
      {debtInput.length > 0 && payoffResult && (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <DashboardCharts monthlySummary={payoffResult.monthlySummary.slice(0, 60)} debts={debtInput} />
          </div>
          <div className="space-y-4">
            {/* Payoff summary card */}
            <Card>
              <CardHeader>
                <CardTitle>Payoff Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { label: "Strategy", value: "Avalanche" },
                  { label: "Total Interest", value: fmt(payoffResult.totalInterestPaid) },
                  { label: "Total You'll Pay", value: fmt(payoffResult.totalPaid) },
                  { label: "Months Left", value: payoffResult.totalMonths.toString() },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between text-sm">
                    <span className="text-slate-400 dark:text-slate-500">{label}</span>
                    <span className="font-semibold text-slate-900 dark:text-slate-100">{value}</span>
                  </div>
                ))}
                <div className="pt-1 border-t border-slate-100 dark:border-slate-800">
                  <p className="text-xs text-slate-400 dark:text-slate-500">Rates via frankfurter.app</p>
                </div>
              </CardContent>
            </Card>

            {/* AI Coach CTA */}
            <Link
              href="/coach"
              className="group flex items-center gap-4 rounded-2xl border border-emerald-200/60 bg-gradient-to-br from-emerald-50 to-teal-50/50 p-4 hover:from-emerald-100 hover:to-teal-100/50 transition-all dark:border-emerald-800/30 dark:from-emerald-950/40 dark:to-teal-950/20 dark:hover:from-emerald-950/60"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/25 group-hover:shadow-emerald-500/40 transition-shadow">
                <Bot size={20} className="text-white" />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-emerald-900 dark:text-emerald-100 text-sm">Ask Your AI Coach</p>
                <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5">Personalized debt advice →</p>
              </div>
            </Link>
          </div>
        </div>
      )}

      {/* Debt list */}
      {debts.length > 0 && (
        <DebtSummaryList debts={debts} plans={payoffResult?.plans ?? []} baseCurrency={baseCurrency} />
      )}
    </div>
  );
}

function MetricCard({
  label, value, sub, icon, iconBg, trend,
}: {
  label: string;
  value: string;
  sub: string;
  icon: React.ReactNode;
  iconBg: string;
  trend: "positive" | "negative" | "neutral";
}) {
  const valueColor =
    trend === "positive"
      ? "text-slate-900 dark:text-white"
      : trend === "negative"
      ? "text-slate-900 dark:text-white"
      : "text-slate-900 dark:text-white";

  return (
    <Card className="overflow-hidden">
      <CardContent className="pt-5">
        <div className="flex items-start justify-between">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">{label}</p>
            <p className={`mt-2 text-2xl font-bold tracking-tight ${valueColor}`}>{value}</p>
            <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">{sub}</p>
          </div>
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${iconBg}`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
