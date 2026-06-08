import { monthlyInterest, requiredMonthlyPayment, monthsToPayoff, toMonthlyAmount, cents } from "@/lib/financial/interest";
import { calculatePayoff } from "@/lib/financial/payoff";
import { runSimulation } from "@/lib/financial/simulator";
import { computeMetrics } from "@/lib/financial/metrics";
import type { Debt } from "@/lib/financial/types";

// Sample debts for tests
const DEBTS: Debt[] = [
  {
    id: "d1",
    name: "Credit Card A",
    type: "CREDIT_CARD",
    balance: 5000,
    originalBalance: 6000,
    interestRate: 22.99,
    minimumPayment: 125,
  },
  {
    id: "d2",
    name: "Car Loan",
    type: "CAR_LOAN",
    balance: 12000,
    originalBalance: 15000,
    interestRate: 6.5,
    minimumPayment: 350,
  },
  {
    id: "d3",
    name: "Personal Loan",
    type: "PERSONAL_LOAN",
    balance: 3000,
    originalBalance: 5000,
    interestRate: 14.0,
    minimumPayment: 90,
  },
];

describe("Interest Engine", () => {
  test("monthlyInterest calculates correctly", () => {
    // $5000 at 12% APR = $50/month
    expect(monthlyInterest(5000, 12)).toBeCloseTo(50, 1);
  });

  test("monthlyInterest at 0% = 0", () => {
    expect(monthlyInterest(1000, 0)).toBe(0);
  });

  test("requiredMonthlyPayment to pay $10k at 6% in 60 months", () => {
    const pmt = requiredMonthlyPayment(10000, 6, 60);
    expect(pmt).toBeCloseTo(193.33, 0);
  });

  test("monthsToPayoff with payment covering only interest returns Infinity", () => {
    // $10k at 24% = $200/month interest; paying $200 = never paid off
    expect(monthsToPayoff(10000, 24, 200)).toBe(Infinity);
  });

  test("monthsToPayoff $5000 at 0% paying $500/month = 10 months", () => {
    expect(monthsToPayoff(5000, 0, 500)).toBe(10);
  });

  test("toMonthlyAmount weekly", () => {
    expect(toMonthlyAmount(100, "WEEKLY")).toBeCloseTo((100 * 52) / 12, 1);
  });

  test("toMonthlyAmount annually", () => {
    expect(toMonthlyAmount(12000, "ANNUALLY")).toBeCloseTo(1000, 1);
  });

  test("cents rounds correctly", () => {
    // 1.005 is 1.004999... in IEEE 754 so rounds to 1.00 — this is correct behavior
    expect(cents(1.004)).toBe(1.00);
    expect(cents(1.236)).toBe(1.24);
    expect(cents(99.999)).toBe(100);
  });
});

describe("Payoff Calculator", () => {
  const BUDGET = 700; // covers minimums ($565) + $135 extra

  test("snowball orders by lowest balance first", () => {
    const result = calculatePayoff(DEBTS, BUDGET, "SNOWBALL");
    // Lowest balance: d3 ($3000), then d1 ($5000), then d2 ($12000)
    expect(result.debtOrder[0]).toBe("d3");
  });

  test("avalanche orders by highest rate first", () => {
    const result = calculatePayoff(DEBTS, BUDGET, "AVALANCHE");
    // Highest rate: d1 (22.99%), then d3 (14%), then d2 (6.5%)
    expect(result.debtOrder[0]).toBe("d1");
  });

  test("avalanche pays less interest than snowball", () => {
    const snowball = calculatePayoff(DEBTS, BUDGET, "SNOWBALL");
    const avalanche = calculatePayoff(DEBTS, BUDGET, "AVALANCHE");
    expect(avalanche.totalInterestPaid).toBeLessThan(snowball.totalInterestPaid);
  });

  test("all debts reach zero", () => {
    const result = calculatePayoff(DEBTS, BUDGET, "AVALANCHE");
    result.plans.forEach((plan) => {
      const lastRow = plan.schedule[plan.schedule.length - 1];
      expect(lastRow?.closingBalance ?? 0).toBeLessThan(1);
    });
  });

  test("total months is positive and finite", () => {
    const result = calculatePayoff(DEBTS, BUDGET, "AVALANCHE");
    expect(result.totalMonths).toBeGreaterThan(0);
    expect(result.totalMonths).toBeLessThan(600);
  });

  test("debt free date is in the future", () => {
    const result = calculatePayoff(DEBTS, BUDGET, "AVALANCHE");
    expect(result.debtFreeDate.getTime()).toBeGreaterThan(Date.now());
  });

  test("empty debts returns 0 months", () => {
    const result = calculatePayoff([], 500, "AVALANCHE");
    expect(result.totalMonths).toBe(0);
  });

  test("total paid = sum of all payments", () => {
    const result = calculatePayoff(DEBTS, BUDGET, "AVALANCHE");
    const sumFromPlans = result.plans.reduce((s, p) => s + p.totalPaid, 0);
    expect(Math.abs(result.totalPaid - sumFromPlans)).toBeLessThan(1);
  });
});

describe("Simulator", () => {
  test("extra payment reduces months", () => {
    const result = runSimulation({
      debts: DEBTS,
      monthlyBudget: 700,
      strategy: "AVALANCHE",
      extraMonthlyPayment: 200,
    });
    expect(result.monthsSaved).toBeGreaterThan(0);
  });

  test("lump sum reduces interest", () => {
    const result = runSimulation({
      debts: DEBTS,
      monthlyBudget: 700,
      strategy: "AVALANCHE",
      lumpSumPayment: 1000,
      lumpSumDebtId: "d1",
    });
    expect(result.interestSaved).toBeGreaterThan(0);
  });

  test("baseline equals direct payoff calculation", () => {
    const direct = calculatePayoff(DEBTS, 700, "SNOWBALL");
    const sim = runSimulation({ debts: DEBTS, monthlyBudget: 700, strategy: "SNOWBALL" });
    expect(sim.baseline.totalMonths).toBe(direct.totalMonths);
    expect(sim.baseline.totalInterestPaid).toBe(direct.totalInterestPaid);
  });

  test("no modification produces 0 months saved", () => {
    const result = runSimulation({ debts: DEBTS, monthlyBudget: 700, strategy: "AVALANCHE" });
    expect(result.monthsSaved).toBe(0);
  });
});

describe("Financial Metrics", () => {
  const debts = [{ balance: 5000, originalBalance: 6000, minimumPayment: 200, type: "CREDIT_CARD" }];
  const incomes = [{ amount: 3000, frequency: "MONTHLY", isActive: true }];
  const expenses = [{ amount: 1000, frequency: "MONTHLY" }];

  test("DTI ratio calculation", () => {
    const metrics = computeMetrics(debts, incomes, expenses);
    // Min payment $200 / income $3000 = 6.67%
    expect(metrics.debtToIncomeRatio).toBeCloseTo(6.67, 1);
  });

  test("availableForDebt = income - expenses - minimums", () => {
    const metrics = computeMetrics(debts, incomes, expenses);
    expect(metrics.availableForDebt).toBe(1800); // 3000 - 1000 - 200
  });

  test("credit utilization only on credit cards", () => {
    const metrics = computeMetrics(debts, incomes, expenses);
    // $5000 used / $6000 limit = 83.33%
    expect(metrics.creditUtilization).toBeCloseTo(83.33, 1);
  });

  test("no debt = 0 DTI", () => {
    const metrics = computeMetrics([], incomes, expenses);
    expect(metrics.debtToIncomeRatio).toBe(0);
  });

  test("weekly income converts to monthly", () => {
    const weeklyIncome = [{ amount: 1000, frequency: "WEEKLY", isActive: true }];
    const metrics = computeMetrics([], weeklyIncome, []);
    expect(metrics.monthlyIncome).toBeCloseTo((1000 * 52) / 12, 0);
  });
});

describe("Edge Cases", () => {
  test("very high interest debt still terminates", () => {
    const highInterest: Debt = {
      id: "x",
      name: "Payday Loan",
      type: "PERSONAL_LOAN",
      balance: 500,
      originalBalance: 500,
      interestRate: 400,
      minimumPayment: 100,
    };
    const result = calculatePayoff([highInterest], 500, "AVALANCHE");
    expect(result.totalMonths).toBeLessThan(600);
  });

  test("single payment debt paid off in 1 month", () => {
    const tiny: Debt = {
      id: "t",
      name: "Small Bill",
      type: "MEDICAL",
      balance: 50,
      originalBalance: 50,
      interestRate: 0,
      minimumPayment: 50,
    };
    const result = calculatePayoff([tiny], 100, "AVALANCHE");
    expect(result.totalMonths).toBe(1);
  });

  test("large debt values work correctly", () => {
    const mortgage: Debt = {
      id: "m",
      name: "Mortgage",
      type: "MORTGAGE",
      balance: 350000,
      originalBalance: 400000,
      interestRate: 7.5,
      minimumPayment: 2800,
    };
    const result = calculatePayoff([mortgage], 3500, "AVALANCHE");
    expect(result.totalInterestPaid).toBeGreaterThan(0);
    expect(result.debtFreeDate.getTime()).toBeGreaterThan(Date.now());
  });
});
