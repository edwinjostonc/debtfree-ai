import { monthlyInterest, cents } from "./interest";
import type { Debt, PayoffResult, MonthlySummary, Strategy, DebtPayoffPlan, PayoffMonth } from "./types";

/**
 * Core debt payoff engine.
 * Implements snowball (lowest balance first), avalanche (highest rate first),
 * and hybrid (weighted score) strategies.
 *
 * Algorithm:
 * 1. Pay minimums on all debts
 * 2. Apply extra budget to the priority debt
 * 3. When a debt is paid off, roll its payment to the next priority debt
 * 4. Repeat until all debts are zero
 */

function orderDebts(debts: Debt[], strategy: Strategy): Debt[] {
  const active = debts.filter((d) => d.balance > 0);
  switch (strategy) {
    case "SNOWBALL":
      return [...active].sort((a, b) => a.balance - b.balance);
    case "AVALANCHE":
      return [...active].sort((a, b) => b.interestRate - a.interestRate);
    case "HYBRID": {
      // Score = 40% rate rank + 60% balance rank (inverted)
      const byRate = [...active].sort((a, b) => b.interestRate - a.interestRate);
      const byBalance = [...active].sort((a, b) => a.balance - b.balance);
      const rateScore = Object.fromEntries(byRate.map((d, i) => [d.id, i]));
      const balScore = Object.fromEntries(byBalance.map((d, i) => [d.id, i]));
      return [...active].sort(
        (a, b) =>
          0.4 * rateScore[a.id] + 0.6 * balScore[a.id] -
          (0.4 * rateScore[b.id] + 0.6 * balScore[b.id])
      );
    }
  }
}

export function calculatePayoff(
  debts: Debt[],
  monthlyBudget: number,
  strategy: Strategy,
  startDate: Date = new Date()
): PayoffResult {
  if (debts.length === 0 || debts.every((d) => d.balance <= 0)) {
    return emptyResult(strategy, startDate);
  }

  const totalMinimums = debts.reduce((s, d) => s + d.minimumPayment, 0);
  const extra = Math.max(0, monthlyBudget - totalMinimums);

  const ordered = orderDebts(debts, strategy);
  const balances = Object.fromEntries(debts.map((d) => [d.id, d.balance]));

  const scheduleMap: Record<string, PayoffMonth[]> = {};
  for (const d of debts) scheduleMap[d.id] = [];

  const monthlySummary: MonthlySummary[] = [];
  let month = 0;
  const MAX_MONTHS = 600;

  while (
    Object.values(balances).some((b) => b > 0.005) &&
    month < MAX_MONTHS
  ) {
    month++;
    const date = new Date(startDate);
    date.setMonth(date.getMonth() + month - 1);

    // Determine priority debt (first in ordered list still with balance)
    const priorityDebt = ordered.find((d) => balances[d.id] > 0.005);
    const extraRemaining = extra;

    // Freed payment from paid-off debts rolls to priority
    let freedPayment = 0;

    for (const debt of ordered) {
      if (balances[debt.id] <= 0.005) {
        freedPayment += debt.minimumPayment;
      }
    }

    let summaryPayment = 0;
    let summaryPrincipal = 0;
    let summaryInterest = 0;

    for (const debt of ordered) {
      const opening = balances[debt.id];
      if (opening <= 0.005) {
        scheduleMap[debt.id].push({
          month,
          date: new Date(date),
          debtId: debt.id,
          openingBalance: 0,
          payment: 0,
          principal: 0,
          interest: 0,
          closingBalance: 0,
        });
        continue;
      }

      const interest = monthlyInterest(opening, debt.interestRate);
      let payment = debt.minimumPayment;

      if (debt.id === priorityDebt?.id) {
        payment += extraRemaining + freedPayment;
      }

      payment = Math.min(payment, opening + interest);
      const principal = payment - interest;
      const closing = Math.max(0, opening - principal);

      balances[debt.id] = closing;

      scheduleMap[debt.id].push({
        month,
        date: new Date(date),
        debtId: debt.id,
        openingBalance: cents(opening),
        payment: cents(payment),
        principal: cents(principal),
        interest: cents(interest),
        closingBalance: cents(closing),
      });

      summaryPayment += payment;
      summaryPrincipal += principal;
      summaryInterest += interest;
    }

    const totalBalance = Object.values(balances).reduce((s, b) => s + b, 0);

    monthlySummary.push({
      month,
      date: new Date(date),
      totalBalance: cents(totalBalance),
      totalPayment: cents(summaryPayment),
      totalPrincipal: cents(summaryPrincipal),
      totalInterest: cents(summaryInterest),
    });
  }

  const plans: DebtPayoffPlan[] = debts.map((debt) => {
    const sched = scheduleMap[debt.id];
    const payoffEntry = sched.find((r) => r.closingBalance <= 0.005);
    const payoffMonth = payoffEntry?.month ?? month;
    const payoffDate = payoffEntry?.date ?? new Date(startDate);
    if (!payoffEntry) {
      payoffDate.setMonth(payoffDate.getMonth() + month);
    }
    const totalPaid = sched.reduce((s, r) => s + r.payment, 0);
    const totalInterest = sched.reduce((s, r) => s + r.interest, 0);

    return {
      debtId: debt.id,
      debtName: debt.name,
      payoffMonth,
      payoffDate,
      totalPaid: cents(totalPaid),
      totalInterest: cents(totalInterest),
      schedule: sched,
    };
  });

  const totalInterestPaid = plans.reduce((s, p) => s + p.totalInterest, 0);
  const totalPaid = plans.reduce((s, p) => s + p.totalPaid, 0);

  const debtFreeDate = new Date(startDate);
  debtFreeDate.setMonth(debtFreeDate.getMonth() + month - 1);

  return {
    strategy,
    debtOrder: ordered.map((d) => d.id),
    plans,
    totalMonths: month,
    debtFreeDate,
    totalInterestPaid: cents(totalInterestPaid),
    totalPaid: cents(totalPaid),
    monthlySummary,
  };
}

function emptyResult(strategy: Strategy, startDate: Date): PayoffResult {
  return {
    strategy,
    debtOrder: [],
    plans: [],
    totalMonths: 0,
    debtFreeDate: startDate,
    totalInterestPaid: 0,
    totalPaid: 0,
    monthlySummary: [],
  };
}
