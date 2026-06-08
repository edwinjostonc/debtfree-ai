"use client";

import { registerUser, type ActionState } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TrendingDown, ArrowRight, CheckCircle } from "lucide-react";
import Link from "next/link";
import { useActionState } from "react";

const INITIAL: ActionState = {};

const TRUST_POINTS = [
  "Free forever — no credit card needed",
  "Your financial data stays private",
  "43 currencies supported",
];

export default function RegisterPage() {
  const [state, action, pending] = useActionState(registerUser, INITIAL);

  return (
    <div className="flex min-h-screen">
      {/* Left panel — slate-900 */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between bg-slate-900 p-12">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10">
            <TrendingDown size={15} className="text-white" />
          </div>
          <span className="text-base font-bold tracking-tight text-white">DebtFree AI</span>
        </Link>

        <div>
          <h2 className="text-3xl font-bold text-white leading-tight mb-4">
            Your debt-free plan in 2 minutes.
          </h2>
          <p className="text-slate-300 text-base leading-relaxed mb-8">
            Join thousands who have taken control of their finances. No spreadsheets, no financial degree required.
          </p>
          <ul className="space-y-3">
            {TRUST_POINTS.map((point) => (
              <li key={point} className="flex items-center gap-3 text-sm text-slate-300">
                <CheckCircle size={16} className="text-teal-400 shrink-0" />
                {point}
              </li>
            ))}
          </ul>
        </div>

        <p className="text-xs text-slate-500">
          Not financial advice. © 2026 DebtFree AI.
        </p>
      </div>

      {/* Right panel — white form */}
      <div className="flex flex-1 items-center justify-center bg-white px-6 py-12">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="lg:hidden mb-8 flex flex-col items-center">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-700">
                <TrendingDown size={17} className="text-white" />
              </div>
              <span className="text-lg font-bold tracking-tight text-slate-900">DebtFree AI</span>
            </Link>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-slate-900 mb-1">
            Start your journey
          </h1>
          <p className="text-sm text-slate-500 mb-8">
            Your personalized debt-free plan in 2 minutes
          </p>

          <form action={action} className="space-y-5">
            {state.error && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-600">
                {state.error}
              </div>
            )}
            <Input
              id="name"
              name="name"
              type="text"
              label="Full Name"
              placeholder="Alex Johnson"
              required
              autoComplete="name"
            />
            <Input
              id="email"
              name="email"
              type="email"
              label="Email Address"
              placeholder="you@example.com"
              required
              autoComplete="email"
            />
            <Input
              id="password"
              name="password"
              type="password"
              label="Password"
              placeholder="At least 8 characters"
              required
              minLength={8}
              autoComplete="new-password"
            />
            <Button type="submit" className="w-full" size="lg" loading={pending}>
              {!pending && (
                <>
                  Create Free Account
                  <ArrowRight size={16} />
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-slate-500">
              Already have an account?{" "}
              <Link href="/login" className="font-semibold text-teal-700 hover:text-teal-800 transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
