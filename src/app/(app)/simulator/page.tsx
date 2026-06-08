import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SimulatorClient } from "@/components/simulator/simulator-client";
import { computeMetricsMultiCurrency, convertDebtsToBase } from "@/lib/financial/metrics-multi";

export default async function SimulatorPage() {
  const session = await auth();
  const userId = session!.user!.id!;

  const [user, debts, incomes, expenses] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: { baseCurrency: true } }),
    prisma.debt.findMany({ where: { userId, isPaidOff: false } }),
    prisma.income.findMany({ where: { userId, isActive: true } }),
    prisma.expense.findMany({ where: { userId } }),
  ]);

  const baseCurrency = user?.baseCurrency ?? "USD";
  const metrics = await computeMetricsMultiCurrency(debts, incomes, expenses, baseCurrency);

  const monthlyBudget = Math.max(
    metrics.monthlyIncome - metrics.monthlyExpenses,
    metrics.totalMinimumPayments
  );

  const debtInput = await convertDebtsToBase(
    debts.map((d) => ({
      id: d.id, name: d.name, type: d.type,
      balance: d.balance, originalBalance: d.originalBalance,
      interestRate: d.interestRate, minimumPayment: d.minimumPayment,
      currency: d.currency,
    })),
    baseCurrency
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">What-If Simulator</h1>
        <p className="mt-1 text-sm text-slate-500">
          All values in {baseCurrency}. Debts converted from their original currencies.
        </p>
      </div>
      {debtInput.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center dark:border-slate-800 dark:bg-slate-900">
          <p className="text-slate-500">Add debts first to use the simulator.</p>
        </div>
      ) : (
        <SimulatorClient debts={debtInput} monthlyBudget={monthlyBudget} metrics={metrics} baseCurrency={baseCurrency} />
      )}
    </div>
  );
}
