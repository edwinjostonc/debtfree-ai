import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AiCoach } from "@/components/coach/ai-coach";

export default async function CoachPage() {
  const session = await auth();
  const userId = session!.user!.id!;

  const [debts, incomes] = await Promise.all([
    prisma.debt.findMany({ where: { userId, isPaidOff: false } }),
    prisma.income.findMany({ where: { userId, isActive: true } }),
  ]);

  const hasData = debts.length > 0 || incomes.length > 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          AI Debt Coach
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Personalized guidance based on your real financial situation
        </p>
      </div>
      <AiCoach hasData={hasData} userName={session!.user!.name} />
    </div>
  );
}
