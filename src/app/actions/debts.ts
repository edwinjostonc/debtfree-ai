"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { revalidatePath } from "next/cache";

const debtSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.enum([
    "CREDIT_CARD",
    "STUDENT_LOAN",
    "MORTGAGE",
    "CAR_LOAN",
    "PERSONAL_LOAN",
    "MEDICAL",
    "OTHER",
  ]),
  balance: z.coerce.number().positive("Balance must be positive"),
  originalBalance: z.coerce.number().positive("Original balance must be positive"),
  interestRate: z.coerce.number().min(0).max(200),
  minimumPayment: z.coerce.number().min(0),
  dueDate: z.coerce.number().int().min(1).max(31).optional(),
  lender: z.string().optional(),
  accountNumber: z.string().optional(),
  notes: z.string().optional(),
});

async function requireUser() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  return session.user.id;
}

export async function createDebt(formData: FormData) {
  const userId = await requireUser();
  const raw = Object.fromEntries(formData.entries());
  const parsed = debtSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const debt = await prisma.debt.create({
    data: { ...parsed.data, userId },
  });

  revalidatePath("/dashboard");
  revalidatePath("/debts");
  return { success: true, id: debt.id };
}

export async function updateDebt(id: string, formData: FormData) {
  const userId = await requireUser();
  const existing = await prisma.debt.findFirst({ where: { id, userId } });
  if (!existing) return { error: "Debt not found" };

  const raw = Object.fromEntries(formData.entries());
  const parsed = debtSchema.partial().safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  await prisma.debt.update({ where: { id }, data: parsed.data });

  revalidatePath("/dashboard");
  revalidatePath("/debts");
  return { success: true };
}

export async function deleteDebt(id: string) {
  const userId = await requireUser();
  await prisma.debt.deleteMany({ where: { id, userId } });
  revalidatePath("/dashboard");
  revalidatePath("/debts");
  return { success: true };
}

export async function markDebtPaidOff(id: string) {
  const userId = await requireUser();
  await prisma.debt.updateMany({
    where: { id, userId },
    data: { isPaidOff: true, paidOffAt: new Date(), balance: 0 },
  });
  revalidatePath("/dashboard");
  revalidatePath("/debts");
  return { success: true };
}

export async function recordPayment(
  debtId: string,
  amount: number,
  notes?: string
) {
  const userId = await requireUser();
  const debt = await prisma.debt.findFirst({ where: { id: debtId, userId } });
  if (!debt) return { error: "Debt not found" };

  // Calculate interest portion for this payment
  const monthlyRate = debt.interestRate / 100 / 12;
  const interestCharge = debt.balance * monthlyRate;
  const principal = Math.max(0, amount - interestCharge);
  const newBalance = Math.max(0, debt.balance - principal);

  await prisma.$transaction([
    prisma.payment.create({
      data: {
        userId,
        debtId,
        amount,
        principal,
        interest: Math.min(interestCharge, amount),
        notes,
      },
    }),
    prisma.debt.update({
      where: { id: debtId },
      data: {
        balance: newBalance,
        isPaidOff: newBalance < 1,
        paidOffAt: newBalance < 1 ? new Date() : null,
      },
    }),
  ]);

  revalidatePath("/dashboard");
  revalidatePath("/debts");
  return { success: true };
}

export async function getDebts() {
  const userId = await requireUser();
  return prisma.debt.findMany({
    where: { userId },
    orderBy: { createdAt: "asc" },
  });
}

