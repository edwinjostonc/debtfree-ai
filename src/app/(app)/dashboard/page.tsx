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
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            {firstName}&apos;s Dashboard
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Totals in <span className="font-medium text-slate-700">{baseInfo.code} ({baseInfo.symbol})</span>
            <span className="mx-1.5 text-slate-300">·</span>
            <Link href="/settings" className="text-teal-700 hover:text-teal-800 transition-colors">
              Change
            </Link>
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <Link
            href="/settings"
            className="flex items-center justify-center h-9 w-9 rounded-xl border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-all"
          >
            <Settings size={16} />
          </Link>
          <Link
            href="/debts"
            className="flex items-center gap-2 rounded-xl bg-teal-700 px-4 py-2 text-sm font-semibold text-white border border-teal-700 hover:bg-teal-800 hover:border-teal-800 transition-colors"
          >
            <Plus size={15} />
            Add Debt
          </Link>
        </div>
      </div>

      {/* Onboarding */}
      {hasNoData && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-teal-50">
              <AlertCircle size={18} className="text-teal-700" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Let&apos;s build your debt-free plan</h3>
              <p className="mt-1 text-sm text-slate-500">
                Add your debts and income to see your personalized payoff timeline.
              </p>
              <div className="mt-4 flex gap-3">
                <Link
                  href="/debts"
                  className="rounded-xl bg-teal-700 px-4 py-2 text-sm font-semibold text-white border border-teal-700 hover:bg-teal-800 transition-colors"
                >
                  Add First Debt
                </Link>
                <Link
                  href="/income"
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
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
          accentColor="red"
        />
        <MetricCard
          label="Monthly Income"
          value={fmt(metrics.monthlyIncome)}
          sub="from all sources"
          icon={<DollarSign size={18} />}
          accentColor="teal"
        />
        <MetricCard
          label="Debt-to-Income"
          value={formatPercent(metrics.debtToIncomeRatio)}
          sub={dtiInfo.label}
          icon={<TrendingUp size={18} />}
          accentColor={metrics.debtToIncomeRatio < 36 ? "blue" : "orange"}
        />
        {payoffResult ? (
          <MetricCard
            label="Debt-Free Date"
            value={payoffResult.debtFreeDate.toLocaleDateString("en-US", { month: "short", year: "numeric" })}
            sub={`${payoffResult.totalMonths} months away`}
            icon={<Calendar size={18} />}
            accentColor="teal"
          />
        ) : (
          <MetricCard
            label="Available/Month"
            value={fmt(metrics.availableForDebt)}
            sub="for extra payments"
            icon={<DollarSign size={18} />}
            accentColor="blue"
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
                    <span className="text-slate-500">{label}</span>
                    <span className="font-semibold text-slate-900">{value}</span>
                  </div>
                ))}
                <div className="pt-1 border-t border-slate-100">
                  <p className="text-xs text-slate-400">Rates via frankfurter.app</p>
                </div>
              </CardContent>
            </Card>

            {/* AI Coach CTA */}
            <Link
              href="/coach"
              className="group flex items-center gap-4 rounded-xl border border-teal-200 bg-teal-50 p-4 hover:bg-teal-100 transition-colors"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-teal-700">
                <Bot size={18} className="text-white" />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-teal-900 text-sm">Ask Your AI Coach</p>
                <p className="text-xs text-teal-600 mt-0.5">Personalized debt advice</p>
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

const ACCENT_ICON_STYLES: Record<string, string> = {
  teal: "bg-teal-50 text-teal-700",
  red: "bg-red-50 text-red-600",
  blue: "bg-blue-50 text-blue-600",
  orange: "bg-orange-50 text-orange-600",
};

function MetricCard({
  label,
  value,
  sub,
  icon,
  accentColor,
}: {
  label: string;
  value: string;
  sub: string;
  icon: React.ReactNode;
  accentColor: "teal" | "red" | "blue" | "orange";
}) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="pt-5">
        <div className="flex items-start justify-between">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</p>
            <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">{value}</p>
            <p className="mt-1 text-xs text-slate-400">{sub}</p>
          </div>
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${ACCENT_ICON_STYLES[accentColor]}`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
