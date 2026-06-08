import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { IncomeExpenseManager } from "@/components/income/income-expense-manager";
import { computeMetrics } from "@/lib/financial/metrics";

export default async function IncomePage() {
  const session = await auth();
  const userId = session!.user!.id!;

  const [incomes, expenses, debts] = await Promise.all([
    prisma.income.findMany({ where: { userId }, orderBy: { createdAt: "asc" } }),
    prisma.expense.findMany({ where: { userId }, orderBy: { createdAt: "asc" } }),
    prisma.debt.findMany({ where: { userId, isPaidOff: false } }),
  ]);

  const metrics = computeMetrics(debts, incomes, expenses);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Income & Expenses
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Track your cash flow to maximize debt payments
        </p>
      </div>
      <IncomeExpenseManager
        initialIncomes={incomes}
        initialExpenses={expenses}
        metrics={metrics}
      />
    </div>
  );
}
