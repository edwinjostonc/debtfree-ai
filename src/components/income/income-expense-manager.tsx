"use client";

import { useState, useTransition } from "react";
import {
  createIncome,
  deleteIncome,
  createExpense,
  deleteExpense,
} from "@/app/actions/income-expenses";
import { toMonthlyAmount } from "@/lib/financial/interest";
import type { FinancialMetrics } from "@/lib/financial/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Plus,
  Trash2,
  TrendingUp,
  TrendingDown,
  DollarSign,
  AlertCircle,
  X,
  Banknote,
  ShoppingCart,
} from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────────────

interface Income {
  id: string;
  name: string;
  amount: number;
  frequency: string;
  isActive: boolean;
  createdAt: Date;
}

interface Expense {
  id: string;
  name: string;
  category: string;
  amount: number;
  frequency: string;
  isFixed: boolean;
  createdAt: Date;
}

interface IncomeExpenseManagerProps {
  initialIncomes: Income[];
  initialExpenses: Expense[];
  metrics: FinancialMetrics;
}

// ── Constants ──────────────────────────────────────────────────────────────────

const FREQUENCY_LABELS: Record<string, string> = {
  WEEKLY: "Weekly",
  BIWEEKLY: "Bi-weekly",
  MONTHLY: "Monthly",
  QUARTERLY: "Quarterly",
  ANNUALLY: "Annually",
};

const EXPENSE_CATEGORY_LABELS: Record<string, string> = {
  HOUSING: "Housing",
  FOOD: "Food",
  TRANSPORTATION: "Transportation",
  UTILITIES: "Utilities",
  INSURANCE: "Insurance",
  HEALTHCARE: "Healthcare",
  ENTERTAINMENT: "Entertainment",
  CLOTHING: "Clothing",
  EDUCATION: "Education",
  PERSONAL_CARE: "Personal Care",
  SAVINGS: "Savings",
  OTHER: "Other",
};

const EXPENSE_CATEGORY_COLORS: Record<string, string> = {
  HOUSING: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  FOOD: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
  TRANSPORTATION: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
  UTILITIES: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300",
  INSURANCE: "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300",
  HEALTHCARE: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  ENTERTAINMENT: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300",
  CLOTHING: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300",
  EDUCATION: "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300",
  PERSONAL_CARE: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300",
  SAVINGS: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  OTHER: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
};

function fmt(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

function fmtDecimal(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

// ── DTI Badge ──────────────────────────────────────────────────────────────────

function DtiBadge({ dti }: { dti: number }) {
  let label: string;
  let cls: string;

  if (dti < 20) {
    label = "Excellent";
    cls = "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300";
  } else if (dti < 36) {
    label = "Good";
    cls = "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300";
  } else if (dti < 43) {
    label = "Fair";
    cls = "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300";
  } else if (dti < 50) {
    label = "Poor";
    cls = "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300";
  } else {
    label = "Critical";
    cls = "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300";
  }

  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${cls}`}>
      {label}
    </span>
  );
}

// ── Add Income Form ────────────────────────────────────────────────────────────

function AddIncomeForm({ onClose }: { onClose: () => void }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await createIncome(fd);
      if (result?.error) {
        setError(result.error);
      } else {
        onClose();
      }
    });
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Add Income Source</CardTitle>
          <button onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
            <X className="size-4" />
          </button>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
              <AlertCircle className="size-4 shrink-0" />
              {error}
            </div>
          )}

          <Input label="Source Name" id="inc-name" name="name" placeholder="Salary, Freelance, etc." required />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Amount ($)"
              id="inc-amount"
              name="amount"
              type="number"
              min="0.01"
              step="0.01"
              placeholder="3500"
              required
            />
            <Select label="Frequency" id="inc-frequency" name="frequency" required>
              {Object.entries(FREQUENCY_LABELS).map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </Select>
          </div>

          <div className="flex gap-3">
            <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>Cancel</Button>
            <Button type="submit" variant="primary" className="flex-1" loading={isPending}>Add Income</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

// ── Add Expense Form ───────────────────────────────────────────────────────────

function AddExpenseForm({ onClose }: { onClose: () => void }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await createExpense(fd);
      if (result?.error) {
        setError(result.error);
      } else {
        onClose();
      }
    });
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Add Expense</CardTitle>
          <button onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
            <X className="size-4" />
          </button>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
              <AlertCircle className="size-4 shrink-0" />
              {error}
            </div>
          )}

          <Input label="Expense Name" id="exp-name" name="name" placeholder="Rent, Groceries, etc." required />

          <div className="grid grid-cols-2 gap-4">
            <Select label="Category" id="exp-category" name="category" required>
              {Object.entries(EXPENSE_CATEGORY_LABELS).map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </Select>
            <Select label="Frequency" id="exp-frequency" name="frequency" required>
              {Object.entries(FREQUENCY_LABELS).map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </Select>
          </div>

          <Input
            label="Amount ($)"
            id="exp-amount"
            name="amount"
            type="number"
            min="0.01"
            step="0.01"
            placeholder="1200"
            required
          />

          <label className="flex items-center gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              name="isFixed"
              value="true"
              defaultChecked
              className="size-4 rounded border-slate-300 accent-emerald-600"
            />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Fixed expense (same amount each period)</span>
          </label>

          <div className="flex gap-3">
            <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>Cancel</Button>
            <Button type="submit" variant="primary" className="flex-1" loading={isPending}>Add Expense</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

// ── Income Row ─────────────────────────────────────────────────────────────────

function IncomeRow({ income }: { income: Income }) {
  const [isPending, startTransition] = useTransition();
  const monthly = toMonthlyAmount(income.amount, income.frequency);

  function handleDelete() {
    startTransition(async () => {
      await deleteIncome(income.id);
    });
  }

  return (
    <div className="group flex items-center justify-between gap-4 rounded-xl border border-slate-100 bg-white p-4 transition-shadow hover:shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
          <Banknote className="size-4 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div className="min-w-0">
          <p className="font-medium text-slate-900 dark:text-white truncate">{income.name}</p>
          <p className="text-xs text-slate-400">
            {fmtDecimal(income.amount)} / {FREQUENCY_LABELS[income.frequency] ?? income.frequency}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <div className="text-right">
          <p className="font-semibold text-slate-900 dark:text-white">{fmtDecimal(monthly)}</p>
          <p className="text-xs text-slate-400">per month</p>
        </div>
        <button
          onClick={handleDelete}
          disabled={isPending}
          className="rounded-lg p-1.5 text-slate-300 opacity-0 group-hover:opacity-100 hover:bg-red-50 hover:text-red-500 dark:text-slate-600 dark:hover:bg-red-900/20 dark:hover:text-red-400 transition-all disabled:opacity-50"
        >
          <Trash2 className="size-4" />
        </button>
      </div>
    </div>
  );
}

// ── Expense Row ────────────────────────────────────────────────────────────────

function ExpenseRow({ expense }: { expense: Expense }) {
  const [isPending, startTransition] = useTransition();
  const monthly = toMonthlyAmount(expense.amount, expense.frequency);

  function handleDelete() {
    startTransition(async () => {
      await deleteExpense(expense.id);
    });
  }

  return (
    <div className="group flex items-center justify-between gap-4 rounded-xl border border-slate-100 bg-white p-4 transition-shadow hover:shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800">
          <ShoppingCart className="size-4 text-slate-500 dark:text-slate-400" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-medium text-slate-900 dark:text-white truncate">{expense.name}</p>
            <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${EXPENSE_CATEGORY_COLORS[expense.category] ?? EXPENSE_CATEGORY_COLORS.OTHER}`}>
              {EXPENSE_CATEGORY_LABELS[expense.category] ?? expense.category}
            </span>
          </div>
          <p className="text-xs text-slate-400">
            {fmtDecimal(expense.amount)} / {FREQUENCY_LABELS[expense.frequency] ?? expense.frequency}
            {!expense.isFixed && " · variable"}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <div className="text-right">
          <p className="font-semibold text-slate-900 dark:text-white">{fmtDecimal(monthly)}</p>
          <p className="text-xs text-slate-400">per month</p>
        </div>
        <button
          onClick={handleDelete}
          disabled={isPending}
          className="rounded-lg p-1.5 text-slate-300 opacity-0 group-hover:opacity-100 hover:bg-red-50 hover:text-red-500 dark:text-slate-600 dark:hover:bg-red-900/20 dark:hover:text-red-400 transition-all disabled:opacity-50"
        >
          <Trash2 className="size-4" />
        </button>
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

export function IncomeExpenseManager({
  initialIncomes,
  initialExpenses,
  metrics,
}: IncomeExpenseManagerProps) {
  const [activeTab, setActiveTab] = useState<"income" | "expenses">("income");
  const [showAddIncome, setShowAddIncome] = useState(false);
  const [showAddExpense, setShowAddExpense] = useState(false);

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/20">
                <TrendingUp className="size-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Monthly Income</p>
                <p className="text-xl font-bold text-slate-900 dark:text-white">{fmt(metrics.monthlyIncome)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-red-100 dark:bg-red-900/20">
                <TrendingDown className="size-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Monthly Expenses</p>
                <p className="text-xl font-bold text-slate-900 dark:text-white">{fmt(metrics.monthlyExpenses)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/20">
                <DollarSign className="size-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Available for Debt</p>
                <p className="text-xl font-bold text-slate-900 dark:text-white">{fmt(metrics.availableForDebt)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* DTI indicator */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Debt-to-Income Ratio</p>
                <DtiBadge dti={metrics.debtToIncomeRatio} />
              </div>
              <p className="mt-0.5 text-xs text-slate-500">
                {metrics.debtToIncomeRatio.toFixed(1)}% of your income goes toward minimum debt payments.
                {metrics.debtToIncomeRatio >= 43
                  ? " Try to reduce this below 43%."
                  : " You're in a healthy range."}
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <div className="h-3 w-48 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className={`h-3 rounded-full transition-all duration-700 ${
                    metrics.debtToIncomeRatio < 20
                      ? "bg-emerald-500"
                      : metrics.debtToIncomeRatio < 36
                      ? "bg-blue-500"
                      : metrics.debtToIncomeRatio < 43
                      ? "bg-yellow-500"
                      : metrics.debtToIncomeRatio < 50
                      ? "bg-orange-500"
                      : "bg-red-500"
                  }`}
                  style={{ width: `${Math.min(100, metrics.debtToIncomeRatio)}%` }}
                />
              </div>
              <span className="text-sm font-bold text-slate-900 dark:text-white w-12 text-right">
                {metrics.debtToIncomeRatio.toFixed(1)}%
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex rounded-xl border border-slate-200 bg-slate-50 p-1 dark:border-slate-700 dark:bg-slate-800/50 w-fit">
          <button
            onClick={() => setActiveTab("income")}
            className={`rounded-lg px-5 py-1.5 text-sm font-medium transition-all ${
              activeTab === "income"
                ? "bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-white"
                : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            }`}
          >
            Income ({initialIncomes.length})
          </button>
          <button
            onClick={() => setActiveTab("expenses")}
            className={`rounded-lg px-5 py-1.5 text-sm font-medium transition-all ${
              activeTab === "expenses"
                ? "bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-white"
                : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            }`}
          >
            Expenses ({initialExpenses.length})
          </button>
        </div>

        <Button
          variant="primary"
          size="md"
          className="gap-2 shrink-0"
          onClick={() => {
            if (activeTab === "income") {
              setShowAddIncome(true);
              setShowAddExpense(false);
            } else {
              setShowAddExpense(true);
              setShowAddIncome(false);
            }
          }}
        >
          <Plus className="size-4" />
          Add {activeTab === "income" ? "Income" : "Expense"}
        </Button>
      </div>

      {/* Add forms */}
      {showAddIncome && activeTab === "income" && (
        <AddIncomeForm onClose={() => setShowAddIncome(false)} />
      )}
      {showAddExpense && activeTab === "expenses" && (
        <AddExpenseForm onClose={() => setShowAddExpense(false)} />
      )}

      {/* Lists */}
      {activeTab === "income" && (
        <div className="space-y-2">
          {initialIncomes.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center dark:border-slate-700 dark:bg-slate-900">
              <div className="mx-auto flex size-11 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800">
                <Banknote className="size-5 text-slate-400" />
              </div>
              <p className="mt-3 font-medium text-slate-900 dark:text-white">No income sources yet</p>
              <p className="mt-1 text-sm text-slate-500">Add your salary and other income streams.</p>
            </div>
          ) : (
            initialIncomes.map((income) => (
              <IncomeRow key={income.id} income={income} />
            ))
          )}
        </div>
      )}

      {activeTab === "expenses" && (
        <div className="space-y-2">
          {initialExpenses.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center dark:border-slate-700 dark:bg-slate-900">
              <div className="mx-auto flex size-11 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800">
                <ShoppingCart className="size-5 text-slate-400" />
              </div>
              <p className="mt-3 font-medium text-slate-900 dark:text-white">No expenses tracked yet</p>
              <p className="mt-1 text-sm text-slate-500">Add your monthly expenses to see your debt payment capacity.</p>
            </div>
          ) : (
            initialExpenses.map((expense) => (
              <ExpenseRow key={expense.id} expense={expense} />
            ))
          )}
        </div>
      )}
    </div>
  );
}
