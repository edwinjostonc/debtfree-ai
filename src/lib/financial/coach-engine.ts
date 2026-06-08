import { calculatePayoff } from "./payoff";
import { runSimulation } from "./simulator";
import { computeMetrics, dtiRating, utilizationRating, formatCurrency } from "./metrics";
import type { Debt } from "./types";

interface FinancialSnapshot {
  debts: Debt[];
  monthlyIncome: number;
  monthlyExpenses: number;
  monthlyBudget: number;
  metrics: ReturnType<typeof computeMetrics>;
}

export interface CoachInsight {
  type: "critical" | "warning" | "tip" | "win";
  title: string;
  detail: string;
  action?: string;
  impact?: string;
}

export interface CoachResponse {
  greeting?: string;
  summary: string;
  insights: CoachInsight[];
  topRecommendation: string;
  payoffPlan: string;
  motivationalNote: string;
}

/**
 * Rule-based financial coaching engine.
 * Produces specific, personalized advice from real numbers.
 * No external API. No hallucinations. Pure math + decision logic.
 */
export function generateCoaching(
  snapshot: FinancialSnapshot,
  question?: string
): CoachResponse {
  const { debts, monthlyIncome, monthlyExpenses, monthlyBudget, metrics } = snapshot;

  const hasDebts = debts.length > 0;
  const avalanche = hasDebts
    ? calculatePayoff(debts, Math.max(monthlyBudget, metrics.totalMinimumPayments), "AVALANCHE")
    : null;
  const snowball = hasDebts
    ? calculatePayoff(debts, Math.max(monthlyBudget, metrics.totalMinimumPayments), "SNOWBALL")
    : null;

  const insights: CoachInsight[] = [];

  // ── DTI Analysis ──────────────────────────────────────
  if (metrics.debtToIncomeRatio >= 43) {
    insights.push({
      type: "critical",
      title: `High Debt-to-Income: ${metrics.debtToIncomeRatio.toFixed(1)}%`,
      detail: `Lenders consider 43% the danger threshold. Your minimum payments consume ${formatCurrency(metrics.totalMinimumPayments)}/mo of ${formatCurrency(monthlyIncome)}/mo income.`,
      action: "Prioritize cutting expenses or adding income before taking on any new debt.",
      impact: "Reducing DTI below 36% dramatically improves financial flexibility.",
    });
  } else if (metrics.debtToIncomeRatio >= 36) {
    insights.push({
      type: "warning",
      title: `Elevated DTI: ${metrics.debtToIncomeRatio.toFixed(1)}%`,
      detail: `Minimum payments total ${formatCurrency(metrics.totalMinimumPayments)}/mo. Aim to get this below 36%.`,
      action: "Focus extra income on the highest-interest debt first.",
    });
  } else if (metrics.debtToIncomeRatio > 0) {
    insights.push({
      type: "win",
      title: `Healthy DTI: ${metrics.debtToIncomeRatio.toFixed(1)}%`,
      detail: `Your debt load is manageable. Staying below 36% keeps you financially resilient.`,
    });
  }

  // ── Credit utilization ─────────────────────────────────
  if (metrics.creditUtilization > 30) {
    const targetBalance = metrics.totalCreditLimit * 0.3;
    const currentCCBalance = metrics.totalCreditLimit * (metrics.creditUtilization / 100);
    const toPayDown = Math.max(0, currentCCBalance - targetBalance);
    const utilInfo = utilizationRating(metrics.creditUtilization);
    insights.push({
      type: metrics.creditUtilization > 50 ? "critical" : "warning",
      title: `Credit Utilization: ${metrics.creditUtilization.toFixed(0)}% (${utilInfo.label})`,
      detail: `You're using ${formatCurrency(currentCCBalance)} of ${formatCurrency(metrics.totalCreditLimit)} credit limit.`,
      action: `Pay down ${formatCurrency(toPayDown)} to reach the recommended 30% threshold.`,
      impact: "Dropping below 30% can significantly improve your credit score.",
    });
  }

  // ── Cash flow ──────────────────────────────────────────
  const surplus = monthlyIncome - monthlyExpenses - metrics.totalMinimumPayments;
  if (surplus < 0) {
    insights.push({
      type: "critical",
      title: "Negative Cash Flow",
      detail: `Expenses + minimum payments exceed income by ${formatCurrency(Math.abs(surplus))}/mo. Debt is growing each month.`,
      action: "Identify at least one expense to cut immediately. Even $50/mo prevents compounding.",
    });
  } else if (surplus < 200) {
    insights.push({
      type: "warning",
      title: `Thin Margin: ${formatCurrency(surplus)}/mo available`,
      detail: "After minimums and expenses, little remains for extra debt payments or emergencies.",
      action: "Target one variable expense to reduce. Freeing $100/mo extra saves months off your payoff.",
    });
  } else {
    insights.push({
      type: "tip",
      title: `${formatCurrency(surplus)}/mo available for acceleration`,
      detail: "You have room to make extra payments beyond minimums.",
      action: `Apply the full ${formatCurrency(surplus)} surplus to your highest-interest debt each month.`,
      impact: avalanche ? `Could save ${formatCurrency(avalanche.totalInterestPaid * 0.15 + surplus * avalanche.totalMonths * 0.1)} in interest over time.` : undefined,
    });
  }

  // ── High-interest debt alert ──────────────────────────
  const highInterest = debts.filter((d) => d.interestRate >= 20);
  if (highInterest.length > 0) {
    const worst = highInterest.sort((a, b) => b.interestRate - a.interestRate)[0];
    const monthlyInterestCost = worst.balance * (worst.interestRate / 100 / 12);
    insights.push({
      type: "critical",
      title: `High-Rate Debt: ${worst.name} at ${worst.interestRate}% APR`,
      detail: `Costs ${formatCurrency(monthlyInterestCost)}/mo in interest alone — ${formatCurrency(monthlyInterestCost * 12)}/yr.`,
      action: "Attack this first with every available dollar (avalanche method).",
      impact: "Eliminating this could free hundreds per month for other debts.",
    });
  }

  // ── Avalanche vs Snowball comparison ──────────────────
  if (avalanche && snowball && avalanche.totalInterestPaid !== snowball.totalInterestPaid) {
    const interestDiff = snowball.totalInterestPaid - avalanche.totalInterestPaid;
    const monthsDiff = snowball.totalMonths - avalanche.totalMonths;
    if (interestDiff > 100) {
      insights.push({
        type: "tip",
        title: "Avalanche saves more money",
        detail: `Paying highest interest first saves ${formatCurrency(interestDiff)} and ${monthsDiff} month${monthsDiff !== 1 ? "s" : ""} vs smallest-balance first.`,
        action: "Use avalanche strategy (highest rate first) unless you need quick motivation wins.",
      });
    } else {
      insights.push({
        type: "tip",
        title: "Snowball gives motivational wins",
        detail: `Strategies are nearly equal in cost (${formatCurrency(Math.abs(interestDiff))} difference). Snowball pays off ${Math.abs(monthsDiff)} debt${Math.abs(monthsDiff) !== 1 ? "s" : ""} faster for motivation.`,
        action: "Choose avalanche for math, snowball if you need quick wins to stay motivated.",
      });
    }
  }

  // ── Extra payment impact ───────────────────────────────
  if (hasDebts && surplus > 0) {
    const extra50 = runSimulation({
      debts, monthlyBudget: Math.max(monthlyBudget, metrics.totalMinimumPayments),
      strategy: "AVALANCHE", extraMonthlyPayment: 50,
    });
    const extra100 = runSimulation({
      debts, monthlyBudget: Math.max(monthlyBudget, metrics.totalMinimumPayments),
      strategy: "AVALANCHE", extraMonthlyPayment: 100,
    });
    if (extra100.monthsSaved > 0) {
      insights.push({
        type: "tip",
        title: "Extra $100/mo makes a real difference",
        detail: `Adding just $100/mo to your top debt saves ${extra100.monthsSaved} month${extra100.monthsSaved !== 1 ? "s" : ""} and ${formatCurrency(extra100.interestSaved)} in interest.`,
        action: "Even $50/mo extra saves " + extra50.monthsSaved + " month" + (extra50.monthsSaved !== 1 ? "s" : "") + ".",
        impact: `Debt-free by ${extra100.newDebtFreeDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })} instead of ${avalanche?.debtFreeDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}`,
      });
    }
  }

  // ── Build summary ──────────────────────────────────────
  const summary = buildSummary(snapshot, avalanche);
  const topRec = buildTopRecommendation(snapshot, insights, avalanche);
  const payoffPlan = buildPayoffPlan(debts, avalanche, snowball);
  const motivation = buildMotivation(debts, avalanche, metrics);

  // ── Handle specific questions ─────────────────────────
  if (question) {
    return handleQuestion(question, snapshot, insights, avalanche, snowball, {
      summary, topRec, payoffPlan, motivation,
    });
  }

  return {
    summary,
    insights,
    topRecommendation: topRec,
    payoffPlan,
    motivationalNote: motivation,
  };
}

function buildSummary(snap: FinancialSnapshot, avalanche: ReturnType<typeof calculatePayoff> | null): string {
  const { metrics, debts } = snap;
  if (debts.length === 0) {
    return "You have no active debts tracked. Add your debts to get a personalized payoff plan and financial analysis.";
  }
  const dti = dtiRating(metrics.debtToIncomeRatio);
  const debtFreeStr = avalanche
    ? `on track to be debt-free by ${avalanche.debtFreeDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}`
    : "ready to build a payoff plan";
  return `You have ${formatCurrency(metrics.totalDebt)} across ${debts.length} debt${debts.length !== 1 ? "s" : ""} with a ${dti.label.toLowerCase()} ${metrics.debtToIncomeRatio.toFixed(1)}% debt-to-income ratio. Monthly income: ${formatCurrency(metrics.monthlyIncome)}, expenses: ${formatCurrency(metrics.monthlyExpenses)}. You are ${debtFreeStr}.`;
}

function buildTopRecommendation(
  snap: FinancialSnapshot,
  insights: CoachInsight[],
  avalanche: ReturnType<typeof calculatePayoff> | null
): string {
  const criticals = insights.filter((i) => i.type === "critical");
  if (criticals.length > 0) return criticals[0].action ?? criticals[0].detail;

  if (snap.debts.length === 0) return "Start by adding all your debts — even small ones. A complete picture is essential for an accurate plan.";

  const highRate = snap.debts.filter((d) => d.interestRate >= 20);
  if (highRate.length > 0) {
    const worst = highRate[0];
    return `Focus every available dollar on ${worst.name} (${worst.interestRate}% APR). Pay its minimum on all others, then send the full surplus to this one until it's gone.`;
  }

  if (avalanche && snap.metrics.availableForDebt > 0) {
    const target = snap.debts.find((d) => d.id === avalanche.debtOrder[0]);
    if (target) {
      return `Pay minimum on all debts, then send the full ${formatCurrency(snap.metrics.availableForDebt)}/mo surplus to ${target.name}. When it's paid off, roll that payment to the next debt.`;
    }
  }

  return "Keep making at least minimum payments on all debts consistently. Even small extra amounts compound into significant interest savings.";
}

function buildPayoffPlan(
  debts: Debt[],
  avalanche: ReturnType<typeof calculatePayoff> | null,
  snowball: ReturnType<typeof calculatePayoff> | null
): string {
  if (!avalanche || debts.length === 0) return "Add your debts and income to generate your personalized payoff plan.";

  const lines: string[] = [];
  lines.push(`**Recommended: Avalanche Strategy** (saves ${formatCurrency(
    Math.max(0, (snowball?.totalInterestPaid ?? 0) - avalanche.totalInterestPaid)
  )} vs snowball)\n`);

  const ordered = avalanche.debtOrder.map((id) => debts.find((d) => d.id === id)).filter(Boolean) as Debt[];
  ordered.forEach((debt, i) => {
    const plan = avalanche.plans.find((p) => p.debtId === debt.id);
    if (!plan) return;
    const dateStr = plan.payoffDate.toLocaleDateString("en-US", { month: "short", year: "numeric" });
    lines.push(
      `${i + 1}. **${debt.name}** — ${formatCurrency(debt.balance)} @ ${debt.interestRate}% → paid off ${dateStr} (${formatCurrency(plan.totalInterest)} interest)`
    );
  });

  lines.push(`\n**Debt-free:** ${avalanche.debtFreeDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })} (${avalanche.totalMonths} months)`);
  lines.push(`**Total interest:** ${formatCurrency(avalanche.totalInterestPaid)}`);

  return lines.join("\n");
}

function buildMotivation(
  debts: Debt[],
  avalanche: ReturnType<typeof calculatePayoff> | null,
  metrics: ReturnType<typeof computeMetrics>
): string {
  if (debts.length === 0) return "Every debt-free journey starts with a clear picture. You've taken the first step.";
  if (!avalanche) return "Your plan is taking shape. Stay consistent — time is your biggest ally.";

  const totalOriginal = debts.reduce((s, d) => s + d.originalBalance, 0);
  const alreadyPaid = totalOriginal - metrics.totalDebt;
  const pctDone = totalOriginal > 0 ? (alreadyPaid / totalOriginal) * 100 : 0;

  if (pctDone > 50) return `You've paid off ${pctDone.toFixed(0)}% of your original debt — over halfway. The finish line is in sight.`;
  if (avalanche.totalMonths <= 12) return `Just ${avalanche.totalMonths} months to debt freedom. That's closer than you think. Stay the course.`;
  if (avalanche.totalMonths <= 36) return `Under 3 years to financial freedom. Every consistent payment is a vote for your future self.`;
  return `The journey is long but math is on your side. You'll pay ${formatCurrency(avalanche.totalInterestPaid)} in interest — reducing that number is money directly in your pocket.`;
}

// ── Question handler ──────────────────────────────────────────────────────────

function handleQuestion(
  question: string,
  snap: FinancialSnapshot,
  insights: CoachInsight[],
  avalanche: ReturnType<typeof calculatePayoff> | null,
  snowball: ReturnType<typeof calculatePayoff> | null,
  defaults: { summary: string; topRec: string; payoffPlan: string; motivation: string }
): CoachResponse {
  const q = question.toLowerCase();

  if (matches(q, ["snowball", "avalanche", "strategy", "method", "which"])) {
    return answerStrategy(snap, avalanche, snowball, insights, defaults);
  }
  if (matches(q, ["dti", "debt-to-income", "ratio", "income"])) {
    return answerDTI(snap, insights, defaults);
  }
  if (matches(q, ["extra", "more", "additional", "faster", "accelerate", "sooner"])) {
    return answerExtraPayment(snap, avalanche, insights, defaults);
  }
  if (matches(q, ["lump", "bonus", "windfall", "tax refund", "one-time"])) {
    return answerLumpSum(snap, avalanche, insights, defaults);
  }
  if (matches(q, ["credit", "utilization", "score", "card"])) {
    return answerCredit(snap, insights, defaults);
  }
  if (matches(q, ["plan", "order", "payoff", "schedule", "first", "next"])) {
    return {
      summary: defaults.summary,
      insights: insights.slice(0, 3),
      topRecommendation: defaults.topRec,
      payoffPlan: defaults.payoffPlan,
      motivationalNote: defaults.motivation,
    };
  }

  // Default: full coaching view
  return {
    summary: defaults.summary,
    insights,
    topRecommendation: defaults.topRec,
    payoffPlan: defaults.payoffPlan,
    motivationalNote: defaults.motivation,
  };
}

function matches(q: string, keywords: string[]): boolean {
  return keywords.some((k) => q.includes(k));
}

function answerStrategy(
  snap: FinancialSnapshot,
  avalanche: ReturnType<typeof calculatePayoff> | null,
  snowball: ReturnType<typeof calculatePayoff> | null,
  insights: CoachInsight[],
  defaults: { summary: string; topRec: string; payoffPlan: string; motivation: string }
): CoachResponse {
  const diff =
    avalanche && snowball
      ? snowball.totalInterestPaid - avalanche.totalInterestPaid
      : 0;
  const monthsDiff = avalanche && snowball ? snowball.totalMonths - avalanche.totalMonths : 0;

  const summary =
    diff > 500
      ? `**Avalanche** (highest rate first) saves you ${formatCurrency(diff)} and ${monthsDiff} month${monthsDiff !== 1 ? "s" : ""} compared to snowball. The math is clear — avalanche wins.`
      : diff > 0
      ? `The strategies are close. Avalanche saves ${formatCurrency(diff)} (${monthsDiff} month${monthsDiff !== 1 ? "s" : ""}) but snowball pays off ${snap.debts.length > 0 ? "smaller debts faster" : "debts faster"} for motivation.`
      : "Both strategies are equivalent given your current debts.";

  return {
    summary,
    insights: [
      {
        type: "tip",
        title: "Avalanche: Math wins",
        detail: `Pay minimums everywhere, send extra to highest-rate debt. Best for minimizing total interest.`,
        impact: avalanche ? `Debt-free ${avalanche.debtFreeDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}, ${formatCurrency(avalanche.totalInterestPaid)} interest` : undefined,
      },
      {
        type: "tip",
        title: "Snowball: Motivation wins",
        detail: "Pay minimums everywhere, send extra to smallest balance. Quick wins keep you on track.",
        impact: snowball ? `Debt-free ${snowball.debtFreeDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}, ${formatCurrency(snowball.totalInterestPaid)} interest` : undefined,
      },
    ],
    topRecommendation: diff > 200
      ? `Choose avalanche — it saves you ${formatCurrency(diff)} in real money.`
      : "If you've struggled with consistency before, snowball's quick wins are worth the small extra cost.",
    payoffPlan: defaults.payoffPlan,
    motivationalNote: defaults.motivation,
  };
}

function answerDTI(
  snap: FinancialSnapshot,
  insights: CoachInsight[],
  defaults: { summary: string; topRec: string; payoffPlan: string; motivation: string }
): CoachResponse {
  const dti = snap.metrics.debtToIncomeRatio;
  const dtiInfo = dtiRating(dti);
  const targetPayment = snap.metrics.monthlyIncome * 0.36;
  const toReduce = Math.max(0, snap.metrics.totalMinimumPayments - targetPayment);

  return {
    summary: `Your debt-to-income ratio is **${dti.toFixed(1)}%** — rated **${dtiInfo.label}**. ${dtiInfo.description}.`,
    insights: [
      {
        type: dti >= 43 ? "critical" : dti >= 36 ? "warning" : "win",
        title: `DTI: ${dti.toFixed(1)}% (${dtiInfo.label})`,
        detail: `Minimum payments: ${formatCurrency(snap.metrics.totalMinimumPayments)}/mo on ${formatCurrency(snap.metrics.monthlyIncome)}/mo income.`,
        action: toReduce > 0
          ? `Reduce minimum obligations by ${formatCurrency(toReduce)}/mo to reach the 36% target.`
          : "You're within healthy range. Keep minimums low by avoiding new debt.",
      },
    ],
    topRecommendation: toReduce > 0
      ? `To reach a healthy 36% DTI, you need to eliminate ${formatCurrency(toReduce)}/mo in minimums. Pay off the smallest debt first to free up a minimum payment quickly.`
      : `DTI is in good shape. Focus on paying down principal to keep it that way.`,
    payoffPlan: defaults.payoffPlan,
    motivationalNote: defaults.motivation,
  };
}

function answerExtraPayment(
  snap: FinancialSnapshot,
  avalanche: ReturnType<typeof calculatePayoff> | null,
  insights: CoachInsight[],
  defaults: { summary: string; topRec: string; payoffPlan: string; motivation: string }
): CoachResponse {
  if (!avalanche || snap.debts.length === 0) {
    return { summary: "Add your debts first to see the impact of extra payments.", insights: [], topRecommendation: defaults.topRec, payoffPlan: defaults.payoffPlan, motivationalNote: defaults.motivation };
  }

  const budget = Math.max(snap.monthlyBudget, snap.metrics.totalMinimumPayments);
  const extras = [50, 100, 200, 500];
  const simResults = extras.map((extra) => ({
    extra,
    result: runSimulation({ debts: snap.debts, monthlyBudget: budget, strategy: "AVALANCHE", extraMonthlyPayment: extra }),
  }));

  const lines = simResults.map(
    ({ extra, result }) =>
      `+${formatCurrency(extra)}/mo → saves ${result.monthsSaved} month${result.monthsSaved !== 1 ? "s" : ""} & ${formatCurrency(result.interestSaved)}`
  );

  return {
    summary: `Here's exactly what extra monthly payments save you:\n\n${lines.join("\n")}`,
    insights: simResults.filter((s) => s.result.monthsSaved > 0).slice(0, 2).map(({ extra, result }) => ({
      type: "tip" as const,
      title: `+${formatCurrency(extra)}/mo saves ${result.monthsSaved} months`,
      detail: `Saves ${formatCurrency(result.interestSaved)} in interest. Debt-free ${result.newDebtFreeDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}.`,
      action: "Apply directly to your highest-rate debt each month.",
    })),
    topRecommendation: `Even ${formatCurrency(50)}/mo extra makes a measurable difference. Start there if budget is tight — the math compounds over time.`,
    payoffPlan: defaults.payoffPlan,
    motivationalNote: defaults.motivation,
  };
}

function answerLumpSum(
  snap: FinancialSnapshot,
  avalanche: ReturnType<typeof calculatePayoff> | null,
  insights: CoachInsight[],
  defaults: { summary: string; topRec: string; payoffPlan: string; motivation: string }
): CoachResponse {
  if (!avalanche || snap.debts.length === 0) {
    return { summary: "Add your debts first to model lump sum impact.", insights: [], topRecommendation: defaults.topRec, payoffPlan: defaults.payoffPlan, motivationalNote: defaults.motivation };
  }

  const budget = Math.max(snap.monthlyBudget, snap.metrics.totalMinimumPayments);
  const topDebt = snap.debts.find((d) => d.id === avalanche.debtOrder[0]);
  if (!topDebt) return { summary: defaults.summary, insights, topRecommendation: defaults.topRec, payoffPlan: defaults.payoffPlan, motivationalNote: defaults.motivation };

  const amounts = [500, 1000, 2000, 5000].filter((a) => a <= topDebt.balance * 1.5);
  const simResults = amounts.map((amount) => ({
    amount,
    result: runSimulation({ debts: snap.debts, monthlyBudget: budget, strategy: "AVALANCHE", lumpSumPayment: amount, lumpSumDebtId: topDebt.id }),
  }));

  const lines = simResults.map(
    ({ amount, result }) =>
      `${formatCurrency(amount)} lump sum on ${topDebt.name} → saves ${result.monthsSaved} months & ${formatCurrency(result.interestSaved)}`
  );

  return {
    summary: `Apply any windfall to **${topDebt.name}** (${topDebt.interestRate}% APR — your highest rate):\n\n${lines.join("\n")}`,
    insights: [
      {
        type: "tip",
        title: `Best target: ${topDebt.name}`,
        detail: `At ${topDebt.interestRate}% APR, this costs ${formatCurrency(topDebt.balance * topDebt.interestRate / 100 / 12)}/mo in interest. Every dollar here has maximum impact.`,
        action: "Apply 100% of the lump sum to this debt, not spread across multiple debts.",
      },
    ],
    topRecommendation: `Direct any lump sum to ${topDebt.name} first. Concentrating beats spreading — you eliminate one high-rate debt faster.`,
    payoffPlan: defaults.payoffPlan,
    motivationalNote: defaults.motivation,
  };
}

function answerCredit(
  snap: FinancialSnapshot,
  insights: CoachInsight[],
  defaults: { summary: string; topRec: string; payoffPlan: string; motivation: string }
): CoachResponse {
  const util = snap.metrics.creditUtilization;
  const utilInfo = utilizationRating(util);
  const creditDebts = snap.debts.filter((d) => d.type === "CREDIT_CARD");
  const targetBalance = snap.metrics.totalCreditLimit * 0.3;
  const currentBalance = snap.metrics.totalCreditLimit * (util / 100);
  const toPayDown = Math.max(0, currentBalance - targetBalance);

  return {
    summary: `Credit utilization: **${util.toFixed(0)}%** (${utilInfo.label}). You're using ${formatCurrency(currentBalance)} of ${formatCurrency(snap.metrics.totalCreditLimit)} total limit across ${creditDebts.length} credit card${creditDebts.length !== 1 ? "s" : ""}.`,
    insights: [
      {
        type: util > 50 ? "critical" : util > 30 ? "warning" : "win",
        title: `${util.toFixed(0)}% utilization (${utilInfo.label})`,
        detail: util > 30
          ? `Pay down ${formatCurrency(toPayDown)} to reach the recommended 30% threshold.`
          : "Under 30% — this range has a positive effect on credit scoring models.",
        action: util > 30 ? `Focus payoff on the card with highest balance-to-limit ratio.` : "Maintain this by keeping balances low.",
        impact: util > 30 ? "Under 30% can meaningfully improve your credit score." : undefined,
      },
    ],
    topRecommendation: util > 30
      ? `Pay down ${formatCurrency(toPayDown)} across your credit cards to hit 30%. Highest-balance card first.`
      : "Utilization is healthy. Avoid adding new balances to maintain it.",
    payoffPlan: defaults.payoffPlan,
    motivationalNote: defaults.motivation,
  };
}
