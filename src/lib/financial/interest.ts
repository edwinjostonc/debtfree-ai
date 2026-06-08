/**
 * Pure interest calculation functions.
 * All inputs/outputs are plain numbers. No rounding until display layer.
 */

/** Monthly interest charge on a balance */
export function monthlyInterest(balance: number, annualRate: number): number {
  return balance * (annualRate / 100 / 12);
}

/** Monthly payment required to pay off a loan in exactly `months` months */
export function requiredMonthlyPayment(
  principal: number,
  annualRate: number,
  months: number
): number {
  if (annualRate === 0) return principal / months;
  const r = annualRate / 100 / 12;
  return (principal * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);
}

/** Months to pay off a debt given a fixed monthly payment */
export function monthsToPayoff(
  balance: number,
  annualRate: number,
  monthlyPayment: number
): number {
  if (balance <= 0) return 0;
  if (annualRate === 0) return Math.ceil(balance / monthlyPayment);

  const r = annualRate / 100 / 12;
  if (monthlyPayment <= balance * r) {
    return Infinity; // payment doesn't cover interest
  }
  return Math.ceil(
    -Math.log(1 - (balance * r) / monthlyPayment) / Math.log(1 + r)
  );
}

/** Full amortization schedule for a single debt */
export function amortizationSchedule(
  balance: number,
  annualRate: number,
  monthlyPayment: number,
  startDate: Date = new Date()
): Array<{
  month: number;
  date: Date;
  openingBalance: number;
  payment: number;
  principal: number;
  interest: number;
  closingBalance: number;
}> {
  const schedule = [];
  let currentBalance = balance;
  let month = 1;

  while (currentBalance > 0.005 && month <= 600) {
    const date = new Date(startDate);
    date.setMonth(date.getMonth() + month - 1);

    const interest = monthlyInterest(currentBalance, annualRate);
    const payment = Math.min(monthlyPayment, currentBalance + interest);
    const principal = payment - interest;
    const closingBalance = Math.max(0, currentBalance - principal);

    schedule.push({
      month,
      date: new Date(date),
      openingBalance: currentBalance,
      payment,
      principal,
      interest,
      closingBalance,
    });

    currentBalance = closingBalance;
    month++;
  }

  return schedule;
}

/** Total interest paid over the life of a loan */
export function totalInterestPaid(
  balance: number,
  annualRate: number,
  monthlyPayment: number
): number {
  const schedule = amortizationSchedule(balance, annualRate, monthlyPayment);
  return schedule.reduce((sum, row) => sum + row.interest, 0);
}

/** Convert a frequency amount to monthly equivalent */
export function toMonthlyAmount(amount: number, frequency: string): number {
  switch (frequency) {
    case "WEEKLY":
      return (amount * 52) / 12;
    case "BIWEEKLY":
      return (amount * 26) / 12;
    case "MONTHLY":
      return amount;
    case "QUARTERLY":
      return amount / 3;
    case "ANNUALLY":
      return amount / 12;
    default:
      return amount;
  }
}

/** Round to 2 decimal places for display/storage */
export function cents(value: number): number {
  return Math.round(value * 100) / 100;
}
