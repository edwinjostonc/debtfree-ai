/**
 * Multi-currency aware metrics.
 * Converts all values to the user's base currency before computing totals.
 */
import { toMonthlyAmount } from "./interest";
import { convertAmount } from "@/lib/currency";
import type { FinancialMetrics } from "./types";

interface RawDebt {
  balance: number;
  originalBalance: number;
  minimumPayment: number;
  type: string;
  currency: string;
}

interface RawIncome {
  amount: number;
  frequency: string;
  isActive: boolean;
  currency: string;
}

interface RawExpense {
  amount: number;
  frequency: string;
  currency: string;
}

export async function computeMetricsMultiCurrency(
  debts: RawDebt[],
  incomes: RawIncome[],
  expenses: RawExpense[],
  baseCurrency: string
): Promise<FinancialMetrics> {
  // Convert all amounts to base currency
  const [
    convertedDebts,
    convertedIncomes,
    convertedExpenses,
  ] = await Promise.all([
    Promise.all(
      debts.map(async (d) => ({
        ...d,
        balance: await convertAmount(d.balance, d.currency, baseCurrency),
        originalBalance: await convertAmount(d.originalBalance, d.currency, baseCurrency),
        minimumPayment: await convertAmount(d.minimumPayment, d.currency, baseCurrency),
      }))
    ),
    Promise.all(
      incomes
        .filter((i) => i.isActive)
        .map(async (i) => ({
          monthly: toMonthlyAmount(
            await convertAmount(i.amount, i.currency, baseCurrency),
            i.frequency
          ),
        }))
    ),
    Promise.all(
      expenses.map(async (e) => ({
        monthly: toMonthlyAmount(
          await convertAmount(e.amount, e.currency, baseCurrency),
          e.frequency
        ),
      }))
    ),
  ]);

  const totalDebt = convertedDebts.reduce((s, d) => s + d.balance, 0);
  const totalMinimumPayments = convertedDebts.reduce((s, d) => s + d.minimumPayment, 0);
  const monthlyIncome = convertedIncomes.reduce((s, i) => s + i.monthly, 0);
  const monthlyExpenses = convertedExpenses.reduce((s, e) => s + e.monthly, 0);

  const availableForDebt = Math.max(0, monthlyIncome - monthlyExpenses - totalMinimumPayments);
  const debtToIncomeRatio =
    monthlyIncome > 0
      ? Math.round((totalMinimumPayments / monthlyIncome) * 10000) / 100
      : 0;

  const creditCards = convertedDebts.filter((d) => d.type === "CREDIT_CARD");
  const totalCreditLimit = creditCards.reduce((s, d) => s + d.originalBalance, 0);
  const totalCreditUsed = creditCards.reduce((s, d) => s + d.balance, 0);
  const creditUtilization =
    totalCreditLimit > 0
      ? Math.round((totalCreditUsed / totalCreditLimit) * 10000) / 100
      : 0;

  return {
    totalDebt,
    totalMinimumPayments,
    monthlyIncome,
    monthlyExpenses,
    availableForDebt,
    debtToIncomeRatio,
    creditUtilization,
    totalCreditLimit,
  };
}

/** Convert debts to base currency for payoff calculations */
export async function convertDebtsToBase(
  debts: (RawDebt & { id: string; name: string; interestRate: number })[],
  baseCurrency: string
) {
  return Promise.all(
    debts.map(async (d) => ({
      id: d.id,
      name: d.name,
      type: d.type as "CREDIT_CARD" | "STUDENT_LOAN" | "MORTGAGE" | "CAR_LOAN" | "PERSONAL_LOAN" | "MEDICAL" | "OTHER",
      balance: await convertAmount(d.balance, d.currency, baseCurrency),
      originalBalance: await convertAmount(d.originalBalance, d.currency, baseCurrency),
      interestRate: d.interestRate,
      minimumPayment: await convertAmount(d.minimumPayment, d.currency, baseCurrency),
    }))
  );
}
