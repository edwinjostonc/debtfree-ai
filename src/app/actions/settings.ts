"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { SUPPORTED_CURRENCIES } from "@/lib/currency";

const validCodes = SUPPORTED_CURRENCIES.map((c) => c.code) as [string, ...string[]];

const settingsSchema = z.object({
  baseCurrency: z.enum(validCodes as [string, ...string[]]),
  name: z.string().min(2).optional(),
});

async function requireUser() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  return session.user.id;
}

export async function updateSettings(formData: FormData) {
  const userId = await requireUser();
  const parsed = settingsSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  await prisma.user.update({
    where: { id: userId },
    data: {
      ...(parsed.data.baseCurrency && { baseCurrency: parsed.data.baseCurrency }),
      ...(parsed.data.name && { name: parsed.data.name }),
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/debts");
  revalidatePath("/income");
  revalidatePath("/simulator");
  revalidatePath("/coach");
  return { success: true };
}

export async function getUserSettings() {
  const userId = await requireUser();
  return prisma.user.findUnique({
    where: { id: userId },
    select: { baseCurrency: true, name: true, email: true },
  });
}
