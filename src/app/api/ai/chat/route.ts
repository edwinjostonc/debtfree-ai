import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { computeMetrics } from "@/lib/financial/metrics";
import { generateCoaching } from "@/lib/financial/coach-engine";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const body = await req.json();
  const message: string = typeof body.message === "string" ? body.message.slice(0, 1000) : "";

  const [debts, incomes, expenses] = await Promise.all([
    prisma.debt.findMany({ where: { userId, isPaidOff: false } }),
    prisma.income.findMany({ where: { userId, isActive: true } }),
    prisma.expense.findMany({ where: { userId } }),
  ]);

  const metrics = computeMetrics(debts, incomes, expenses);

  const monthlyIncome = metrics.monthlyIncome;
  const monthlyExpenses = metrics.monthlyExpenses;
  const monthlyBudget = Math.max(
    monthlyIncome - monthlyExpenses,
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

  const coaching = generateCoaching(
    { debts: debtInput, monthlyIncome, monthlyExpenses, monthlyBudget, metrics },
    message || undefined
  );

  return Response.json({ coaching, userName: session.user.name });
}
