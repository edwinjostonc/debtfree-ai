import { formatPercent } from "@/lib/financial/metrics";
import { formatMoney } from "@/lib/currency";
import type { DebtPayoffPlan } from "@/lib/financial/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface Debt {
  id: string; name: string; type: string;
  balance: number; originalBalance: number;
  interestRate: number; minimumPayment: number; currency: string;
}

const TYPE_LABELS: Record<string, string> = {
  CREDIT_CARD: "Credit Card", STUDENT_LOAN: "Student Loan", MORTGAGE: "Mortgage",
  CAR_LOAN: "Car Loan", PERSONAL_LOAN: "Personal Loan", MEDICAL: "Medical", OTHER: "Other",
};

export function DebtSummaryList({ debts, plans, baseCurrency }: { debts: Debt[]; plans: DebtPayoffPlan[]; baseCurrency: string }) {
  const planMap = Object.fromEntries(plans.map((p) => [p.debtId, p]));

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Active Debts</CardTitle>
          <Link href="/debts" className="flex items-center gap-1 text-[12px] font-medium text-violet-400 hover:text-violet-300 transition-colors">
            Manage <ArrowRight size={12} />
          </Link>
        </div>
      </CardHeader>
      <CardContent className="pt-4 space-y-3">
        {debts.map((debt) => {
          const plan = planMap[debt.id];
          const pct = Math.max(0, Math.min(100, ((debt.originalBalance - debt.balance) / debt.originalBalance) * 100));
          const foreignCurrency = debt.currency !== baseCurrency;

          return (
            <div key={debt.id} className="rounded-xl border border-[#1a1a2e] bg-[#11111f] p-4 hover:border-[#252540] transition-all">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-sm text-white truncate">{debt.name}</p>
                    {foreignCurrency && (
                      <span className="shrink-0 rounded-md bg-[#1a1a2e] px-1.5 py-0.5 text-[10px] font-bold text-[#5a5a7a]">{debt.currency}</span>
                    )}
                  </div>
                  <p className="text-[12px] text-[#5a5a7a] mt-0.5">
                    {TYPE_LABELS[debt.type] ?? debt.type} · {formatPercent(debt.interestRate)} APR
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="num font-black text-white">{formatMoney(debt.balance, debt.currency)}</p>
                  {plan && (
                    <p className="text-[11px] text-[#5a5a7a] mt-0.5">
                      Off {plan.payoffDate.toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                    </p>
                  )}
                </div>
              </div>
              <div className="mt-3">
                <div className="flex justify-between text-[11px] text-[#5a5a7a] mb-1.5">
                  <span>{pct.toFixed(0)}% paid</span>
                  <span>Min: {formatMoney(debt.minimumPayment, debt.currency)}/mo</span>
                </div>
                <div className="h-1 w-full rounded-full bg-[#1a1a2e]">
                  <div className="h-1 rounded-full transition-all" style={{ width: `${pct}%`, background: "linear-gradient(90deg,#7c3aed,#06b6d4)" }} />
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
