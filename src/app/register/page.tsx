"use client";

import { registerUser, type ActionState } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TrendingDown, ArrowRight, CheckCircle } from "lucide-react";
import Link from "next/link";
import { useActionState } from "react";

const INITIAL: ActionState = {};

const PERKS = ["Free forever", "No credit card", "Private & secure"];

export default function RegisterPage() {
  const [state, action, pending] = useActionState(registerUser, INITIAL);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 dark:bg-[#020817]">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-emerald-400/8 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-teal-400/8 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex flex-col items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-xl shadow-emerald-500/30">
              <TrendingDown size={26} className="text-white" />
            </div>
          </Link>
          <h1 className="mt-4 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Start your journey
          </h1>
          <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
            Your personalized debt-free plan in 2 minutes
          </p>
          <div className="mt-3 flex items-center justify-center gap-4">
            {PERKS.map((p) => (
              <span key={p} className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                <CheckCircle size={12} className="text-emerald-500" />
                {p}
              </span>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white/90 p-8 shadow-xl shadow-slate-200/40 backdrop-blur-sm dark:border-slate-800/80 dark:bg-slate-900/90 dark:shadow-slate-900/40">
          <form action={action} className="space-y-5">
            {state.error && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-600 dark:border-red-900 dark:bg-red-950/50 dark:text-red-400">
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
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Already have an account?{" "}
              <Link href="/login" className="font-semibold text-emerald-600 hover:text-emerald-500 transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
