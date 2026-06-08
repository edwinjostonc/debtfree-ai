import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DebtManager } from "@/components/debts/debt-manager";

export default async function DebtsPage() {
  const session = await auth();
  const userId = session!.user!.id!;

  const debts = await prisma.debt.findMany({
    where: { userId },
    orderBy: { createdAt: "asc" },
    include: { payments: { orderBy: { date: "desc" }, take: 5 } },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Debt Tracker</h1>
        <p className="mt-1 text-sm text-slate-500">
          Manage all your debts and record payments
        </p>
      </div>
      <DebtManager initialDebts={debts} />
    </div>
  );
}
