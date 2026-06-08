import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { computeMetrics, dtiRating, utilizationRating, formatCurrency, formatPercent } from "@/lib/financial/metrics";
import { calculatePayoff } from "@/lib/financial/payoff";
import { toMonthlyAmount } from "@/lib/financial/interest";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardCharts } from "@/components/dashboard/charts";
import { DebtSummaryList } from "@/components/dashboard/debt-summary-list";
import Link from "next/link";
import { Bot, Plus, TrendingDown, AlertCircle } from "lucide-react";

export default async function DashboardPage() {
  const session = await auth();
  const userId = session!.user!.id!;

  const [debts, incomes, expenses] = await Promise.all([
    prisma.debt.findMany({ where: { userId, isPaidOff: false }, orderBy: { balance: "desc" } }),
    prisma.income.findMany({ where: { userId, isActive: true } }),
    prisma.expense.findMany({ where: { userId } }),
  ]);

  const metrics = computeMetrics(debts, incomes, expenses);

  const debtInput = debts.map((d) => ({
    id: d.id,
    name: d.name,
    type: d.type as "CREDIT_CARD" | "STUDENT_LOAN" | "MORTGAGE" | "CAR_LOAN" | "PERSONAL_LOAN" | "MEDICAL" | "OTHER",
    balance: d.balance,
    originalBalance: d.originalBalance,
    interestRate: d.interestRate,
    minimumPayment: d.minimumPayment,
  }));

  const monthlyBudget = Math.max(
    metrics.monthlyIncome - metrics.monthlyExpenses,
    metrics.totalMinimumPayments
  );

  const payoffResult =
    debtInput.length > 0
      ? calculatePayoff(debtInput, monthlyBudget, "AVALANCHE")
      : null;

  const dtiInfo = dtiRating(metrics.debtToIncomeRatio);
  const utilInfo = utilizationRating(metrics.creditUtilization);

  const hasNoData = debts.length === 0 && incomes.length === 0;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Your debt freedom progress at a glance
          </p>
        </div>
        <Link
          href="/debts"
          className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 transition-colors"
        >
          <Plus size={16} />
          Add Debt
        </Link>
      </div>

      {/* Onboarding prompt */}
      {hasNoData && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 dark:border-emerald-900 dark:bg-emerald-950/30">
          <div className="flex items-start gap-4">
            <AlertCircle className="mt-0.5 shrink-0 text-emerald-600" size={20} />
            <div>
              <h3 className="font-semibold text-emerald-900 dark:text-emerald-100">
                Let&apos;s get your plan started
              </h3>
              <p className="mt-1 text-sm text-emerald-700 dark:text-emerald-300">
                Add your debts and income to see your personalized debt-free date and payoff strategy.
              </p>
              <div className="mt-4 flex gap-3">
                <Link
                  href="/debts"
                  className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
                >
                  Add First Debt
                </Link>
                <Link
                  href="/income"
                  className="rounded-lg border border-emerald-300 bg-white px-4 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-50"
                >
                  Add Income
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Key Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Total Debt"
          value={formatCurrency(metrics.totalDebt)}
          sub={`${debts.length} active debt${debts.length !== 1 ? "s" : ""}`}
          color="red"
        />
        <MetricCard
          label="Monthly Income"
          value={formatCurrency(metrics.monthlyIncome)}
          sub="from all sources"
          color="green"
        />
        <MetricCard
          label="Debt-to-Income"
          value={formatPercent(metrics.debtToIncomeRatio)}
          sub={dtiInfo.label}
          color={dtiInfo.color as "green" | "blue" | "yellow" | "orange" | "red"}
        />
        {payoffResult ? (
          <MetricCard
            label="Debt-Free Date"
            value={payoffResult.debtFreeDate.toLocaleDateString("en-US", {
              month: "short",
              year: "numeric",
            })}
            sub={`${payoffResult.totalMonths} months away`}
            color="emerald"
          />
        ) : (
          <MetricCard
            label="Extra/Month"
            value={formatCurrency(metrics.availableForDebt)}
            sub="available for debt"
            color="blue"
          />
        )}
      </div>

      {/* Charts + payoff insight */}
      {debtInput.length > 0 && payoffResult && (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <DashboardCharts
              monthlySummary={payoffResult.monthlySummary.slice(0, 60)}
              debts={debtInput}
            />
          </div>
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Payoff Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <SummaryRow label="Strategy" value="Avalanche" />
                <SummaryRow
                  label="Total Interest"
                  value={formatCurrency(payoffResult.totalInterestPaid)}
                />
                <SummaryRow
                  label="Total Paid"
                  value={formatCurrency(payoffResult.totalPaid)}
                />
                <SummaryRow
                  label="Months Remaining"
                  value={payoffResult.totalMonths.toString()}
                />
                {metrics.creditUtilization > 0 && (
                  <SummaryRow
                    label="Credit Utilization"
                    value={`${formatPercent(metrics.creditUtilization)} (${utilInfo.label})`}
                  />
                )}
              </CardContent>
            </Card>

            <Link
              href="/coach"
              className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 hover:bg-emerald-100 transition-colors dark:border-emerald-900 dark:bg-emerald-950/30"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white">
                <Bot size={20} />
              </div>
              <div>
                <p className="font-semibold text-emerald-900 dark:text-emerald-100 text-sm">
                  Ask Your AI Coach
                </p>
                <p className="text-xs text-emerald-700 dark:text-emerald-300">
                  Get personalized debt advice
                </p>
              </div>
            </Link>
          </div>
        </div>
      )}

      {/* Debt list */}
      {debts.length > 0 && (
        <DebtSummaryList
          debts={debts}
          plans={payoffResult?.plans ?? []}
        />
      )}
    </div>
  );
}

function MetricCard({
  label,
  value,
  sub,
  color,
}: {
  label: string;
  value: string;
  sub: string;
  color: string;
}) {
  const colorMap: Record<string, string> = {
    red: "text-red-600 dark:text-red-400",
    green: "text-emerald-600 dark:text-emerald-400",
    emerald: "text-emerald-600 dark:text-emerald-400",
    blue: "text-blue-600 dark:text-blue-400",
    yellow: "text-yellow-600 dark:text-yellow-400",
    orange: "text-orange-600 dark:text-orange-400",
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
        <p className={`mt-1 text-2xl font-bold ${colorMap[color] ?? "text-slate-900"}`}>
          {value}
        </p>
        <p className="mt-0.5 text-xs text-slate-500">{sub}</p>
      </CardContent>
    </Card>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-slate-500">{label}</span>
      <span className="font-medium text-slate-900 dark:text-slate-100">{value}</span>
    </div>
  );
}
