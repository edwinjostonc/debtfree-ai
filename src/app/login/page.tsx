"use client";

import { loginUser, type ActionState } from "@/app/actions/auth";
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

export default function LoginPage() {
  const [state, action, pending] = useActionState(loginUser, INITIAL);

  return (
    <div className="flex min-h-screen">
      {/* Left panel — solid teal */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between bg-teal-700 p-12">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20">
            <TrendingDown size={15} className="text-white" />
          </div>
          <span className="text-base font-bold tracking-tight text-white">DebtFree AI</span>
        </Link>

        <div>
          <h2 className="text-3xl font-bold text-white leading-tight mb-4">
            Take control of your debt today.
          </h2>
          <p className="text-teal-100 text-base leading-relaxed mb-8">
            Build a personalized payoff plan, track every debt, and get AI-powered coaching — free, forever.
          </p>
          <ul className="space-y-3">
            {TRUST_POINTS.map((point) => (
              <li key={point} className="flex items-center gap-3 text-sm text-teal-100">
                <CheckCircle size={16} className="text-teal-300 shrink-0" />
                {point}
              </li>
            ))}
          </ul>
        </div>

        <p className="text-xs text-teal-300">
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
            Welcome back
          </h1>
          <p className="text-sm text-slate-500 mb-8">
            Sign in to your DebtFree AI account
          </p>

          <form action={action} className="space-y-5">
            {state.error && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-600">
                {state.error}
              </div>
            )}
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
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />
            <Button type="submit" className="w-full" size="lg" loading={pending}>
              {!pending && (
                <>
                  Sign In
                  <ArrowRight size={16} />
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-slate-500">
              No account yet?{" "}
              <Link href="/register" className="font-semibold text-teal-700 hover:text-teal-800 transition-colors">
                Create one free
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
