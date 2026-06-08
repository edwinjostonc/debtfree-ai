"use client";

import { useState, useTransition, useActionState } from "react";
import {
  createDebt,
  deleteDebt,
  markDebtPaidOff,
  recordPayment,
} from "@/app/actions/debts";
import { Button } from "@/components/ui/button";
import { CurrencySelect } from "@/components/ui/currency-select";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import {
  Plus,
  X,
  Trash2,
  CheckCircle,
  CreditCard,
  TrendingDown,
  DollarSign,
  AlertCircle,
} from "lucide-react";

// â”€â”€ Types â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

interface Payment {
  id: string;
  amount: number;
  date: Date;
  notes: string | null;
}

interface PrismaDebt {
  id: string;
  name: string;
  type: string;
  balance: number;
  originalBalance: number;
  interestRate: number;
  minimumPayment: number;
  dueDate: number | null;
  lender: string | null;
  accountNumber: string | null;
  notes: string | null;
  isPaidOff: boolean;
  paidOffAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  payments: Payment[];
}

interface DebtManagerProps {
  initialDebts: PrismaDebt[];
}

// â”€â”€ Constants â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const DEBT_TYPE_LABELS: Record<string, string> = {
  CREDIT_CARD: "Credit Card",
  STUDENT_LOAN: "Student Loan",
  MORTGAGE: "Mortgage",
  CAR_LOAN: "Car Loan",
  PERSONAL_LOAN: "Personal Loan",
  MEDICAL: "Medical",
  OTHER: "Other",
};

const DEBT_TYPE_COLORS: Record<string, string> = {
  CREDIT_CARD: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
  STUDENT_LOAN: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  MORTGAGE: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  CAR_LOAN: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
  PERSONAL_LOAN: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300",
  MEDICAL: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  OTHER: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
};

function fmt(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

// â”€â”€ Add Debt Form â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function AddDebtModal({ onClose }: { onClose: () => void }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await createDebt(fd);
      if (result?.error) {
        setError(result.error);
      } else {
        onClose();
      }
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative z-10 w-full max-w-lg rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-100 p-6 dark:border-slate-800">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Add a Debt</h2>
            <p className="mt-0.5 text-sm text-slate-500">Track a new debt account</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
          >
            <X className="size-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          {error && (
            <div className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
              <AlertCircle className="size-4 shrink-0" />
              {error}
            </div>
          )}

          <Input label="Debt Name" id="name" name="name" placeholder="Chase Sapphire Card" required />

          <div className="grid grid-cols-2 gap-4">
            <Select label="Debt Type" id="type" name="type" required>
            {Object.entries(DEBT_TYPE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
            </Select>
            <CurrencySelect label="Currency" name="currency" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Current Balance"
              id="balance"
              name="balance"
              type="number"
              min="0"
              step="0.01"
              placeholder="5000"
              required
            />
            <Input
              label="Original Balance"
              id="originalBalance"
              name="originalBalance"
              type="number"
              min="0"
              step="0.01"
              placeholder="8000"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Interest Rate (%)"
              id="interestRate"
              name="interestRate"
              type="number"
              min="0"
              max="200"
              step="0.01"
              placeholder="18.99"
              required
            />
            <Input
              label="Minimum Payment"
              id="minimumPayment"
              name="minimumPayment"
              type="number"
              min="0"
              step="0.01"
              placeholder="150"
              required
            />
          </div>

          <Input
            label="Lender / Bank (optional)"
            id="lender"
            name="lender"
            placeholder="Chase Bank"
          />

          <div className="space-y-1.5">
            <label htmlFor="notes" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Notes (optional)
            </label>
            <textarea
              id="notes"
              name="notes"
              rows={2}
              placeholder="Any additional notes..."
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" className="flex-1" loading={isPending}>
              Add Debt
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// â”€â”€ Payment Modal â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function PaymentModal({
  debt,
  onClose,
}: {
  debt: PrismaDebt;
  onClose: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [amount, setAmount] = useState(debt.minimumPayment.toString());
  const [notes, setNotes] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const parsed = parseFloat(amount);
    if (isNaN(parsed) || parsed <= 0) {
      setError("Please enter a valid payment amount.");
      return;
    }
    startTransition(async () => {
      const result = await recordPayment(debt.id, parsed, notes || undefined);
      if (result?.error) {
        setError(result.error);
      } else {
        onClose();
      }
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-sm rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-100 p-5 dark:border-slate-800">
          <div>
            <h2 className="font-semibold text-slate-900 dark:text-white">Record Payment</h2>
            <p className="mt-0.5 text-sm text-slate-500 truncate max-w-[200px]">{debt.name}</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
          >
            <X className="size-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-5">
          {error && (
            <div className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
              <AlertCircle className="size-4 shrink-0" />
              {error}
            </div>
          )}

          <div className="rounded-xl bg-slate-50 px-4 py-3 dark:bg-slate-800">
            <p className="text-xs text-slate-500">Current Balance</p>
            <p className="text-xl font-bold text-slate-900 dark:text-white">{fmt(debt.balance)}</p>
            <p className="text-xs text-slate-400 mt-0.5">Min. payment: {fmt(debt.minimumPayment)}</p>
          </div>

          <Input
            label="Payment Amount ($)"
            id="amount"
            type="number"
            min="0.01"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Notes (optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. extra payment this month"
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
          </div>

          <div className="flex gap-3">
            <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" className="flex-1" loading={isPending}>
              Record
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// â”€â”€ Debt Card â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function DebtCard({
  debt,
  onPayment,
}: {
  debt: PrismaDebt;
  onPayment: (debt: PrismaDebt) => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const progress = debt.originalBalance > 0
    ? Math.min(100, ((debt.originalBalance - debt.balance) / debt.originalBalance) * 100)
    : 0;

  function handleDelete() {
    startTransition(async () => {
      await deleteDebt(debt.id);
    });
  }

  function handlePaidOff() {
    startTransition(async () => {
      await markDebtPaidOff(debt.id);
    });
  }

  return (
    <Card className="group transition-shadow hover:shadow-md">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-slate-900 dark:text-white truncate">{debt.name}</h3>
              <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${DEBT_TYPE_COLORS[debt.type] ?? DEBT_TYPE_COLORS.OTHER}`}>
                {DEBT_TYPE_LABELS[debt.type] ?? debt.type}
              </span>
              {debt.isPaidOff && (
                <span className="shrink-0 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                  Paid Off
                </span>
              )}
            </div>
            {debt.lender && (
              <p className="mt-0.5 text-xs text-slate-400">{debt.lender}</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
            {!debt.isPaidOff && (
              <button
                onClick={handlePaidOff}
                disabled={isPending}
                title="Mark as paid off"
                className="rounded-lg p-1.5 text-emerald-500 hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-900/20 transition-colors disabled:opacity-50"
              >
                <CheckCircle className="size-4" />
              </button>
            )}
            {confirmDelete ? (
              <div className="flex items-center gap-1">
                <button
                  onClick={handleDelete}
                  disabled={isPending}
                  className="rounded-lg px-2 py-1 text-xs font-medium text-white bg-red-500 hover:bg-red-600 transition-colors disabled:opacity-50"
                >
                  Confirm
                </button>
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="rounded-lg px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmDelete(true)}
                disabled={isPending}
                title="Delete debt"
                className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
              >
                <Trash2 className="size-4" />
              </button>
            )}
          </div>
        </div>

        {/* Stats row */}
        <div className="mt-4 grid grid-cols-3 gap-3">
          <div>
            <p className="text-xs text-slate-500">Balance</p>
            <p className="font-semibold text-slate-900 dark:text-white">{fmt(debt.balance)}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Rate</p>
            <p className="font-semibold text-slate-900 dark:text-white">{debt.interestRate.toFixed(2)}%</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Min. Payment</p>
            <p className="font-semibold text-slate-900 dark:text-white">{fmt(debt.minimumPayment)}</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
            <span>{progress.toFixed(0)}% paid off</span>
            <span>{fmt(debt.originalBalance - debt.balance)} paid</span>
          </div>
          <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800">
            <div
              className="h-2 rounded-full bg-emerald-500 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Payment button */}
        {!debt.isPaidOff && (
          <div className="mt-4">
            <Button
              variant="outline"
              size="sm"
              className="w-full gap-2"
              onClick={() => onPayment(debt)}
            >
              <DollarSign className="size-3.5" />
              Record Payment
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// â”€â”€ Main Component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export function DebtManager({ initialDebts }: DebtManagerProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [paymentDebt, setPaymentDebt] = useState<PrismaDebt | null>(null);
  const [activeTab, setActiveTab] = useState<"active" | "paidoff">("active");

  const activeDebts = initialDebts.filter((d) => !d.isPaidOff);
  const paidOffDebts = initialDebts.filter((d) => d.isPaidOff);
  const displayedDebts = activeTab === "active" ? activeDebts : paidOffDebts;

  const totalBalance = activeDebts.reduce((s, d) => s + d.balance, 0);
  const totalMinPayment = activeDebts.reduce((s, d) => s + d.minimumPayment, 0);

  return (
    <>
      {/* Summary strip */}
      {activeDebts.length > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-xl bg-red-100 dark:bg-red-900/20">
                  <CreditCard className="size-4 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Total Debt</p>
                  <p className="font-bold text-slate-900 dark:text-white">{fmt(totalBalance)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-900/20">
                  <TrendingDown className="size-4 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Min. Payments</p>
                  <p className="font-bold text-slate-900 dark:text-white">{fmt(totalMinPayment)}/mo</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="col-span-2 sm:col-span-1">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/20">
                  <CheckCircle className="size-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Debts Active</p>
                  <p className="font-bold text-slate-900 dark:text-white">{activeDebts.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Header + tabs */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex rounded-xl border border-slate-200 bg-slate-50 p-1 dark:border-slate-700 dark:bg-slate-800/50">
          <button
            onClick={() => setActiveTab("active")}
            className={`flex-1 rounded-lg px-4 py-1.5 text-sm font-medium transition-all ${
              activeTab === "active"
                ? "bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-white"
                : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            }`}
          >
            Active ({activeDebts.length})
          </button>
          <button
            onClick={() => setActiveTab("paidoff")}
            className={`flex-1 rounded-lg px-4 py-1.5 text-sm font-medium transition-all ${
              activeTab === "paidoff"
                ? "bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-white"
                : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            }`}
          >
            Paid Off ({paidOffDebts.length})
          </button>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={() => setShowAddForm(true)}
          className="gap-2 shrink-0"
        >
          <Plus className="size-4" />
          Add Debt
        </Button>
      </div>

      {/* Debt list */}
      {displayedDebts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center dark:border-slate-700 dark:bg-slate-900">
          <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800">
            <CreditCard className="size-6 text-slate-400" />
          </div>
          <h3 className="mt-4 font-medium text-slate-900 dark:text-white">
            {activeTab === "active" ? "No active debts" : "No paid off debts yet"}
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            {activeTab === "active"
              ? "Click \"Add Debt\" to start tracking your debts."
              : "Keep paying â€” paid off debts will appear here."}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {displayedDebts.map((debt) => (
            <DebtCard
              key={debt.id}
              debt={debt}
              onPayment={setPaymentDebt}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      {showAddForm && <AddDebtModal onClose={() => setShowAddForm(false)} />}
      {paymentDebt && (
        <PaymentModal
          debt={paymentDebt}
          onClose={() => setPaymentDebt(null)}
        />
      )}
    </>
  );
}

