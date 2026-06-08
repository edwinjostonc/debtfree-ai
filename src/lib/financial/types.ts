export type DebtType =
  | "CREDIT_CARD"
  | "STUDENT_LOAN"
  | "MORTGAGE"
  | "CAR_LOAN"
  | "PERSONAL_LOAN"
  | "MEDICAL"
  | "OTHER";

export type Strategy = "SNOWBALL" | "AVALANCHE" | "HYBRID";

export type Frequency = "WEEKLY" | "BIWEEKLY" | "MONTHLY" | "QUARTERLY" | "ANNUALLY";

export interface Debt {
  id: string;
  name: string;
  type: DebtType;
  balance: number;
  originalBalance: number;
  interestRate: number; // annual percentage rate (e.g. 18.5 = 18.5%)
  minimumPayment: number;
}

export interface PayoffMonth {
  month: number;
  date: Date;
  debtId: string;
  openingBalance: number;
  payment: number;
  principal: number;
  interest: number;
  closingBalance: number;
}

export interface DebtPayoffPlan {
  debtId: string;
  debtName: string;
  payoffMonth: number;
  payoffDate: Date;
  totalPaid: number;
  totalInterest: number;
  schedule: PayoffMonth[];
}

export interface PayoffResult {
  strategy: Strategy;
  debtOrder: string[];
  plans: DebtPayoffPlan[];
  totalMonths: number;
  debtFreeDate: Date;
  totalInterestPaid: number;
  totalPaid: number;
  monthlySummary: MonthlySummary[];
}

export interface MonthlySummary {
  month: number;
  date: Date;
  totalBalance: number;
  totalPayment: number;
  totalPrincipal: number;
  totalInterest: number;
}

export interface SimulationParams {
  debts: Debt[];
  monthlyBudget: number;
  strategy: Strategy;
  extraMonthlyPayment?: number;
  lumpSumPayment?: number;
  lumpSumDebtId?: string;
  incomeIncrease?: number;
  expenseReduction?: number;
}

export interface SimulationResult {
  baseline: PayoffResult;
  scenario: PayoffResult;
  monthsSaved: number;
  interestSaved: number;
  newDebtFreeDate: Date;
}

export interface FinancialMetrics {
  totalDebt: number;
  totalMinimumPayments: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  availableForDebt: number;
  debtToIncomeRatio: number;
  creditUtilization: number;
  totalCreditLimit: number;
}
