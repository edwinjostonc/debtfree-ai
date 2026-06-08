import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { IncomeExpenseManager } from "@/components/income/income-expense-manager";
import { computeMetricsMultiCurrency } from "@/lib/financial/metrics-multi";

export default async function IncomePage() {
  const session = await auth();
  const userId = session!.user!.id!;

  const [user, incomes, expenses, debts] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: { baseCurrency: true } }),
    prisma.income.findMany({ where: { userId }, orderBy: { createdAt: "asc" } }),
    prisma.expense.findMany({ where: { userId }, orderBy: { createdAt: "asc" } }),
    prisma.debt.findMany({ where: { userId, isPaidOff: false } }),
  ]);

  const baseCurrency = user?.baseCurrency ?? "USD";
  const metrics = await computeMetricsMultiCurrency(debts, incomes, expenses, baseCurrency);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Income & Expenses</h1>
        <p className="mt-1 text-sm text-slate-500">Track your cash flow — each item can use its own currency</p>
      </div>
      <IncomeExpenseManager
        initialIncomes={incomes}
        initialExpenses={expenses}
        metrics={metrics}
        baseCurrency={baseCurrency}
      />
    </div>
  );
}
