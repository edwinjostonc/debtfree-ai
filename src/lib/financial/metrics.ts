import { toMonthlyAmount } from "./interest";
import type { FinancialMetrics } from "./types";

interface RawDebt {
  balance: number;
  originalBalance: number;
  minimumPayment: number;
  type: string;
}

interface RawIncome {
  amount: number;
  frequency: string;
  isActive: boolean;
}

interface RawExpense {
  amount: number;
  frequency: string;
}

export function computeMetrics(
  debts: RawDebt[],
  incomes: RawIncome[],
  expenses: RawExpense[]
): FinancialMetrics {
  const totalDebt = debts.reduce((s, d) => s + d.balance, 0);
  const totalMinimumPayments = debts.reduce((s, d) => s + d.minimumPayment, 0);

  const monthlyIncome = incomes
    .filter((i) => i.isActive)
    .reduce((s, i) => s + toMonthlyAmount(i.amount, i.frequency), 0);

  const monthlyExpenses = expenses.reduce(
    (s, e) => s + toMonthlyAmount(e.amount, e.frequency),
    0
  );

  const availableForDebt = Math.max(
    0,
    monthlyIncome - monthlyExpenses - totalMinimumPayments
  );

  const debtToIncomeRatio =
    monthlyIncome > 0
      ? Math.round((totalMinimumPayments / monthlyIncome) * 10000) / 100
      : 0;

  // Credit utilization: only credit cards count
  const creditCards = debts.filter((d) => d.type === "CREDIT_CARD");
  const totalCreditLimit = creditCards.reduce(
    (s, d) => s + d.originalBalance,
    0
  );
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

export function dtiRating(dti: number): {
  label: string;
  color: string;
  description: string;
} {
  if (dti < 20)
    return { label: "Excellent", color: "green", description: "Healthy DTI ratio" };
  if (dti < 36)
    return { label: "Good", color: "blue", description: "Manageable debt load" };
  if (dti < 43)
    return { label: "Fair", color: "yellow", description: "Consider reducing debt" };
  if (dti < 50)
    return { label: "Poor", color: "orange", description: "High debt burden" };
  return {
    label: "Critical",
    color: "red",
    description: "Debt significantly exceeds capacity",
  };
}

export function utilizationRating(pct: number): {
  label: string;
  color: string;
} {
  if (pct < 10) return { label: "Excellent", color: "green" };
  if (pct < 30) return { label: "Good", color: "blue" };
  if (pct < 50) return { label: "Fair", color: "yellow" };
  if (pct < 75) return { label: "Poor", color: "orange" };
  return { label: "Critical", color: "red" };
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}
