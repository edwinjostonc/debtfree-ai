import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SimulatorClient } from "@/components/simulator/simulator-client";
import { computeMetrics } from "@/lib/financial/metrics";

export default async function SimulatorPage() {
  const session = await auth();
  const userId = session!.user!.id!;

  const [debts, incomes, expenses] = await Promise.all([
    prisma.debt.findMany({ where: { userId, isPaidOff: false } }),
    prisma.income.findMany({ where: { userId, isActive: true } }),
    prisma.expense.findMany({ where: { userId } }),
  ]);

  const metrics = computeMetrics(debts, incomes, expenses);
  const monthlyBudget = Math.max(
    metrics.monthlyIncome - metrics.monthlyExpenses,
    metrics.totalMinimumPayments
  );

  const debtInput = debts.map((d) => ({
    id: d.id,
    name: d.name,
    type: d.type as "CREDIT_CARD" | "STUDENT_LOAN" | "MORTGAGE" | "CAR_LOAN" | "PERSONAL_LOAN" | "MEDICAL" | "OTHER",
    balance: d.balance,
    originalBalance: d.originalBalance,
    interestRate: d.interestRate,
    minimumPayment: d.minimumPayment,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          What-If Simulator
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          See how changes to your finances accelerate your debt-free date
        </p>
      </div>
      {debtInput.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center dark:border-slate-800 dark:bg-slate-900">
          <p className="text-slate-500">Add debts first to use the simulator.</p>
        </div>
      ) : (
        <SimulatorClient
          debts={debtInput}
          monthlyBudget={monthlyBudget}
          metrics={metrics}
        />
      )}
    </div>
  );
}
