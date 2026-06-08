"use client";

import { registerUser, type ActionState } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TrendingDown } from "lucide-react";
import Link from "next/link";
import { useActionState } from "react";

const INITIAL: ActionState = {};

export default function RegisterPage() {
  const [state, action, pending] = useActionState(registerUser, INITIAL);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 dark:bg-slate-950">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mb-4 flex justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 text-white">
              <TrendingDown size={24} />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Create your account</h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Free forever. No credit card required.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <form action={action} className="space-y-4">
            {state.error && (
              <div className="rounded-xl bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950 dark:text-red-400">
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
              label="Email"
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
              Create Free Account
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-emerald-600 hover:text-emerald-700"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
