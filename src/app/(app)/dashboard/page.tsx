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
import { Bot, Plus, AlertCircle, Zap } from "lucide-react";

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
  const metrics = await computeMetricsMultiCurrency(debts, incomes, expenses, baseCurrency);

  const debtInput = await convertDebtsToBase(
    debts.map((d) => ({ id: d.id, name: d.name, type: d.type, balance: d.balance, originalBalance: d.originalBalance, interestRate: d.interestRate, minimumPayment: d.minimumPayment, currency: d.currency })),
    baseCurrency
  );

  const monthlyBudget = Math.max(metrics.monthlyIncome - metrics.monthlyExpenses, metrics.totalMinimumPayments);
  const payoff = debtInput.length > 0 ? calculatePayoff(debtInput, monthlyBudget, "AVALANCHE") : null;
  const dtiInfo = dtiRating(metrics.debtToIncomeRatio);
  const fmt = (v: number) => formatMoney(v, baseCurrency);

  const hasNoData = debts.length === 0 && incomes.length === 0;

  const DTI_COLORS: Record<string, string> = {
    green: "text-emerald-400", blue: "text-cyan-400",
    yellow: "text-amber-400", orange: "text-orange-400", red: "text-rose-400"
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black tracking-tight">Dashboard</h1>
          <p className="mt-0.5 text-[13px] text-[#5a5a7a]">
            Totals in {baseInfo.code} · <Link href="/settings" className="text-violet-400 hover:text-violet-300 transition-colors">Change</Link>
          </p>
        </div>
        <Link href="/debts" className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white" style={{ background: "linear-gradient(135deg,#7c3aed,#06b6d4)" }}>
          <Plus size={15} />Add Debt
        </Link>
      </div>

      {/* Onboarding */}
      {hasNoData && (
        <div className="rounded-2xl border border-violet-500/20 bg-violet-500/5 p-6">
          <div className="flex items-start gap-4">
            <AlertCircle className="mt-0.5 shrink-0 text-violet-400" size={18} />
            <div>
              <h3 className="font-bold text-sm text-white">Start by adding your debts</h3>
              <p className="mt-1 text-[13px] text-[#5a5a7a]">Add your debts and income to see your personalized debt-free date.</p>
              <div className="mt-4 flex gap-3">
                <Link href="/debts" className="rounded-lg px-4 py-2 text-xs font-bold text-white" style={{ background: "linear-gradient(135deg,#7c3aed,#a855f7)" }}>Add First Debt</Link>
                <Link href="/income" className="rounded-lg border border-[#1a1a2e] px-4 py-2 text-xs font-medium text-[#5a5a7a] hover:text-white transition-colors">Add Income</Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total Debt", value: fmt(metrics.totalDebt), sub: `${debts.length} debt${debts.length !== 1 ? "s" : ""}`, color: "text-rose-400" },
          { label: "Monthly Income", value: fmt(metrics.monthlyIncome), sub: "all sources", color: "text-emerald-400" },
          { label: "Debt-to-Income", value: formatPercent(metrics.debtToIncomeRatio), sub: dtiInfo.label, color: DTI_COLORS[dtiInfo.color] ?? "text-white" },
          payoff
            ? { label: "Debt-Free Date", value: payoff.debtFreeDate.toLocaleDateString("en-US", { month: "short", year: "numeric" }), sub: `${payoff.totalMonths} months`, color: "text-violet-400" }
            : { label: "Available / Mo", value: fmt(metrics.availableForDebt), sub: "for extra payments", color: "text-cyan-400" },
        ].map((m) => (
          <Card key={m.label}>
            <CardContent className="pt-5">
              <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#5a5a7a]">{m.label}</p>
              <p className={`num mt-2 text-2xl font-black ${m.color}`}>{m.value}</p>
              <p className="mt-0.5 text-[11px] text-[#2a2a45]">{m.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts + summary */}
      {debtInput.length > 0 && payoff && (
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <DashboardCharts monthlySummary={payoff.monthlySummary.slice(0, 60)} debts={debtInput} />
          </div>
          <div className="space-y-4">
            <Card>
              <CardHeader><CardTitle>Payoff Summary</CardTitle></CardHeader>
              <CardContent className="space-y-3 pt-4">
                {[
                  { k: "Strategy", v: "Avalanche" },
                  { k: "Total Interest", v: fmt(payoff.totalInterestPaid) },
                  { k: "Total Paid", v: fmt(payoff.totalPaid) },
                  { k: "Months Left", v: String(payoff.totalMonths) },
                ].map(({ k, v }) => (
                  <div key={k} className="flex justify-between text-sm">
                    <span className="text-[#5a5a7a]">{k}</span>
                    <span className="font-bold text-white">{v}</span>
                  </div>
                ))}
                <div className="pt-1 text-[11px] text-[#2a2a45]">Rates via frankfurter.app</div>
              </CardContent>
            </Card>

            <Link href="/simulator" className="flex items-center gap-3 rounded-2xl border border-violet-500/20 bg-violet-500/5 p-4 hover:border-violet-500/40 transition-all">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: "linear-gradient(135deg,#7c3aed,#a855f7)" }}>
                <Zap size={16} className="text-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">Run a Simulation</p>
                <p className="text-[12px] text-[#5a5a7a]">What if you paid $100 extra?</p>
              </div>
            </Link>

            <Link href="/coach" className="flex items-center gap-3 rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-4 hover:border-cyan-500/40 transition-all">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: "linear-gradient(135deg,#06b6d4,#2dd4bf)" }}>
                <Bot size={16} className="text-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">Ask Your Coach</p>
                <p className="text-[12px] text-[#5a5a7a]">Personalized debt advice</p>
              </div>
            </Link>
          </div>
        </div>
      )}

      {/* Debt list */}
      {debts.length > 0 && (
        <DebtSummaryList debts={debts} plans={payoff?.plans ?? []} baseCurrency={baseCurrency} />
      )}
    </div>
  );
}
