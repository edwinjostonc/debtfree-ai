import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { computeMetrics } from "@/lib/financial/metrics";
import { calculatePayoff } from "@/lib/financial/payoff";
import { toMonthlyAmount } from "@/lib/financial/interest";
import Anthropic from "@anthropic-ai/sdk";
import { NextRequest } from "next/server";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const userId = session.user.id;
  const { message, conversationId } = await req.json();

  if (!message || typeof message !== "string" || message.length > 2000) {
    return new Response("Invalid message", { status: 400 });
  }

  // Fetch user's full financial picture
  const [debts, incomes, expenses] = await Promise.all([
    prisma.debt.findMany({ where: { userId, isPaidOff: false } }),
    prisma.income.findMany({ where: { userId, isActive: true } }),
    prisma.expense.findMany({ where: { userId } }),
  ]);

  const metrics = computeMetrics(debts, incomes, expenses);

  // Calculate payoff for context
  const debtInput = debts.map((d) => ({
    id: d.id,
    name: d.name,
    type: d.type as "CREDIT_CARD" | "STUDENT_LOAN" | "MORTGAGE" | "CAR_LOAN" | "PERSONAL_LOAN" | "MEDICAL" | "OTHER",
    balance: d.balance,
    originalBalance: d.originalBalance,
    interestRate: d.interestRate,
    minimumPayment: d.minimumPayment,
  }));

  const monthlyBudget =
    metrics.monthlyIncome - metrics.monthlyExpenses;
  const avalancheResult = debtInput.length > 0
    ? calculatePayoff(debtInput, Math.max(monthlyBudget, metrics.totalMinimumPayments), "AVALANCHE")
    : null;

  const financialContext = buildFinancialContext(
    debts,
    incomes,
    expenses,
    metrics,
    avalancheResult
  );

  // Load or create conversation
  let conversation = conversationId
    ? await prisma.aiConversation.findFirst({
        where: { id: conversationId, userId },
      })
    : null;

  const history: { role: "user" | "assistant"; content: string }[] =
    conversation?.messages ? JSON.parse(conversation.messages) : [];

  history.push({ role: "user", content: message });

  const systemPrompt = `You are DebtFree AI — a supportive, knowledgeable personal debt management coach.
You help ${session.user.name ?? "this user"} create a personalized debt freedom plan.

CRITICAL RULES:
- NEVER fabricate financial numbers. All calculations are done by the system, not you.
- Be supportive, realistic, and practical. Never use guilt-based language.
- Explain financial concepts clearly and simply.
- Give specific, actionable advice tailored to their situation below.
- Recommend professional financial advisors for complex tax/legal situations.
- Keep responses concise (2-4 paragraphs max unless detail is requested).

USER'S CURRENT FINANCIAL PICTURE:
${financialContext}`;

  // Stream response from Claude
  const stream = await client.messages.stream({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    system: systemPrompt,
    messages: history.map((m) => ({ role: m.role, content: m.content })),
  });

  const encoder = new TextEncoder();
  let fullResponse = "";

  const readable = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          if (
            chunk.type === "content_block_delta" &&
            chunk.delta.type === "text_delta"
          ) {
            const text = chunk.delta.text;
            fullResponse += text;
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`));
          }
        }

        // Save conversation
        history.push({ role: "assistant", content: fullResponse });

        if (conversation) {
          await prisma.aiConversation.update({
            where: { id: conversation.id },
            data: { messages: JSON.stringify(history) },
          });
        } else {
          const created = await prisma.aiConversation.create({
            data: {
              userId,
              messages: JSON.stringify(history),
              context: financialContext,
            },
          });
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ conversationId: created.id })}\n\n`
            )
          );
        }

        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
      } catch (err) {
        controller.error(err);
      }
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}

function buildFinancialContext(
  debts: { name: string; balance: number; interestRate: number; minimumPayment: number; type: string }[],
  incomes: { name: string; amount: number; frequency: string }[],
  expenses: { name: string; category: string; amount: number; frequency: string }[],
  metrics: ReturnType<typeof computeMetrics>,
  payoff: ReturnType<typeof calculatePayoff> | null
): string {
  const debtList = debts
    .map(
      (d) =>
        `  - ${d.name} (${d.type}): $${d.balance.toLocaleString()} @ ${d.interestRate}% APR, $${d.minimumPayment}/mo minimum`
    )
    .join("\n");

  const incomeList = incomes
    .map(
      (i) =>
        `  - ${i.name}: $${i.amount.toLocaleString()} ${i.frequency.toLowerCase()} (~$${toMonthlyAmount(i.amount, i.frequency).toFixed(0)}/mo)`
    )
    .join("\n");

  const expenseList = expenses
    .map(
      (e) =>
        `  - ${e.name} (${e.category}): $${e.amount.toLocaleString()} ${e.frequency.toLowerCase()}`
    )
    .join("\n");

  const payoffInfo = payoff
    ? `Debt-free in ${payoff.totalMonths} months (${payoff.debtFreeDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}) using avalanche strategy. Total interest: $${payoff.totalInterestPaid.toLocaleString()}`
    : "No active debts";

  return `
DEBTS (${debts.length} active):
${debtList || "  None"}

INCOME SOURCES:
${incomeList || "  None"}

MONTHLY EXPENSES:
${expenseList || "  None"}

KEY METRICS:
  Total Debt: $${metrics.totalDebt.toLocaleString()}
  Monthly Income: $${metrics.monthlyIncome.toFixed(0)}
  Monthly Expenses: $${metrics.monthlyExpenses.toFixed(0)}
  Available for Extra Debt Payment: $${metrics.availableForDebt.toFixed(0)}/mo
  Debt-to-Income Ratio: ${metrics.debtToIncomeRatio}%
  Credit Card Utilization: ${metrics.creditUtilization}%

PAYOFF PROJECTION (Avalanche Strategy):
  ${payoffInfo}
`.trim();
}
