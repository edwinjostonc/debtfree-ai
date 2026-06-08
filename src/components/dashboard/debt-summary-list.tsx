import { formatCurrency, formatPercent } from "@/lib/financial/metrics";
import type { DebtPayoffPlan } from "@/lib/financial/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface Debt {
  id: string;
  name: string;
  type: string;
  balance: number;
  originalBalance: number;
  interestRate: number;
  minimumPayment: number;
}

interface Props {
  debts: Debt[];
  plans: DebtPayoffPlan[];
}

const DEBT_TYPE_LABELS: Record<string, string> = {
  CREDIT_CARD: "Credit Card",
  STUDENT_LOAN: "Student Loan",
  MORTGAGE: "Mortgage",
  CAR_LOAN: "Car Loan",
  PERSONAL_LOAN: "Personal Loan",
  MEDICAL: "Medical",
  OTHER: "Other",
};

export function DebtSummaryList({ debts, plans }: Props) {
  const planMap = Object.fromEntries(plans.map((p) => [p.debtId, p]));

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Active Debts</CardTitle>
          <Link
            href="/debts"
            className="flex items-center gap-1 text-sm font-medium text-emerald-600 hover:text-emerald-700"
          >
            Manage
            <ArrowRight size={14} />
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {debts.map((debt) => {
            const plan = planMap[debt.id];
            const pct = Math.max(
              0,
              Math.min(
                100,
                ((debt.originalBalance - debt.balance) / debt.originalBalance) * 100
              )
            );
            return (
              <div
                key={debt.id}
                className="rounded-xl border border-slate-100 p-4 dark:border-slate-800"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-medium text-slate-900 dark:text-slate-100 truncate">
                      {debt.name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {DEBT_TYPE_LABELS[debt.type] ?? debt.type} •{" "}
                      {formatPercent(debt.interestRate)} APR
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="font-semibold text-slate-900 dark:text-slate-100">
                      {formatCurrency(debt.balance)}
                    </p>
                    {plan && (
                      <p className="text-xs text-slate-500">
                        Paid off{" "}
                        {plan.payoffDate.toLocaleDateString("en-US", {
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    )}
                  </div>
                </div>
                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                    <span>{pct.toFixed(0)}% paid off</span>
                    <span>
                      Min: {formatCurrency(debt.minimumPayment)}/mo
                    </span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800">
                    <div
                      className="h-1.5 rounded-full bg-emerald-500 transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
