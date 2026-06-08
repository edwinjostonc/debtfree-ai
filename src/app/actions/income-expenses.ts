"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { revalidatePath } from "next/cache";

const incomeSchema = z.object({
  name: z.string().min(1),
  amount: z.coerce.number().positive(),
  frequency: z.enum(["WEEKLY", "BIWEEKLY", "MONTHLY", "QUARTERLY", "ANNUALLY"]),
  currency: z.string().length(3).default("USD"),
  isActive: z.coerce.boolean().optional().default(true),
});

const expenseSchema = z.object({
  name: z.string().min(1),
  category: z.enum([
    "HOUSING",
    "FOOD",
    "TRANSPORTATION",
    "UTILITIES",
    "INSURANCE",
    "HEALTHCARE",
    "ENTERTAINMENT",
    "CLOTHING",
    "EDUCATION",
    "PERSONAL_CARE",
    "SAVINGS",
    "OTHER",
  ]),
  amount: z.coerce.number().positive(),
  frequency: z.enum(["WEEKLY", "BIWEEKLY", "MONTHLY", "QUARTERLY", "ANNUALLY"]),
  currency: z.string().length(3).default("USD"),
  isFixed: z.coerce.boolean().optional().default(true),
});

async function requireUser() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  return session.user.id;
}

// Income actions
export async function createIncome(formData: FormData) {
  const userId = await requireUser();
  const parsed = incomeSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  await prisma.income.create({ data: { ...parsed.data, userId } });
  revalidatePath("/dashboard");
  revalidatePath("/income");
  return { success: true };
}

export async function updateIncome(id: string, formData: FormData) {
  const userId = await requireUser();
  const parsed = incomeSchema.partial().safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  await prisma.income.updateMany({ where: { id, userId }, data: parsed.data });
  revalidatePath("/dashboard");
  revalidatePath("/income");
  return { success: true };
}

export async function deleteIncome(id: string) {
  const userId = await requireUser();
  await prisma.income.deleteMany({ where: { id, userId } });
  revalidatePath("/dashboard");
  revalidatePath("/income");
  return { success: true };
}

// Expense actions
export async function createExpense(formData: FormData) {
  const userId = await requireUser();
  const parsed = expenseSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  await prisma.expense.create({ data: { ...parsed.data, userId } });
  revalidatePath("/dashboard");
  revalidatePath("/expenses");
  return { success: true };
}

export async function updateExpense(id: string, formData: FormData) {
  const userId = await requireUser();
  const parsed = expenseSchema.partial().safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  await prisma.expense.updateMany({ where: { id, userId }, data: parsed.data });
  revalidatePath("/dashboard");
  revalidatePath("/expenses");
  return { success: true };
}

export async function deleteExpense(id: string) {
  const userId = await requireUser();
  await prisma.expense.deleteMany({ where: { id, userId } });
  revalidatePath("/dashboard");
  revalidatePath("/expenses");
  return { success: true };
}

export async function getIncomesAndExpenses() {
  const userId = await requireUser();
  const [incomes, expenses] = await Promise.all([
    prisma.income.findMany({ where: { userId }, orderBy: { createdAt: "asc" } }),
    prisma.expense.findMany({ where: { userId }, orderBy: { createdAt: "asc" } }),
  ]);
  return { incomes, expenses };
}

