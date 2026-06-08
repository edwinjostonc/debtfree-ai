import { calculatePayoff } from "./payoff";
import type { Debt, SimulationParams, SimulationResult, PayoffResult } from "./types";

/**
 * What-if simulator.
 * Compares baseline payoff vs a modified scenario.
 * Scenarios: income increase, expense reduction, extra payment, lump sum.
 * All calculations are pure math — no AI involved.
 */
export function runSimulation(params: SimulationParams): SimulationResult {
  const {
    debts,
    monthlyBudget,
    strategy,
    extraMonthlyPayment = 0,
    lumpSumPayment = 0,
    lumpSumDebtId,
    incomeIncrease = 0,
    expenseReduction = 0,
  } = params;

  const startDate = new Date();

  // Baseline: current debts, current budget
  const baseline = calculatePayoff(debts, monthlyBudget, strategy, startDate);

  // Scenario: apply modifications
  const scenarioBudget =
    monthlyBudget + extraMonthlyPayment + incomeIncrease + expenseReduction;

  let scenarioDebts: Debt[] = debts.map((d) => ({ ...d }));

  // Apply lump sum to a specific debt or the first priority debt
  if (lumpSumPayment > 0) {
    const targetId =
      lumpSumDebtId ?? baseline.debtOrder[0] ?? scenarioDebts[0]?.id;
    scenarioDebts = scenarioDebts.map((d) =>
      d.id === targetId
        ? { ...d, balance: Math.max(0, d.balance - lumpSumPayment) }
        : d
    );
  }

  const scenario = calculatePayoff(
    scenarioDebts,
    scenarioBudget,
    strategy,
    startDate
  );

  const monthsSaved = Math.max(0, baseline.totalMonths - scenario.totalMonths);
  const interestSaved = Math.max(
    0,
    baseline.totalInterestPaid - scenario.totalInterestPaid
  );

  return {
    baseline,
    scenario,
    monthsSaved,
    interestSaved,
    newDebtFreeDate: scenario.debtFreeDate,
  };
}

export function buildSimulationSummary(result: SimulationResult): {
  label: string;
  value: string;
  positive: boolean;
}[] {
  return [
    {
      label: "Months Saved",
      value: result.monthsSaved.toString(),
      positive: result.monthsSaved > 0,
    },
    {
      label: "Interest Saved",
      value: `$${result.interestSaved.toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
      positive: result.interestSaved > 0,
    },
    {
      label: "New Debt-Free Date",
      value: result.newDebtFreeDate.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      }),
      positive: result.monthsSaved > 0,
    },
    {
      label: "Total Interest (Scenario)",
      value: `$${result.scenario.totalInterestPaid.toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
      positive: true,
    },
  ];
}
