"use client";

import { registerUser, type ActionState } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TrendingDown } from "lucide-react";
import Link from "next/link";
import { useActionState } from "react";

export default function RegisterPage() {
  const [state, action, pending] = useActionState(registerUser, {} as ActionState);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#07070d] px-4">
      <div className="dot-grid pointer-events-none fixed inset-0 opacity-100" />
      <div className="glow-blob w-96 h-96 bg-cyan-700 opacity-[0.07] fixed top-1/4 left-1/2 -translate-x-1/2" />

      <div className="relative w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mb-5 flex justify-center">
            <div className="h-11 w-11 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg,#7c3aed,#06b6d4)" }}>
              <TrendingDown size={20} className="text-white" />
            </div>
          </div>
          <h1 className="text-xl font-black tracking-tight">Create your account</h1>
          <p className="mt-1 text-[13px] text-[#5a5a7a]">Free forever · No credit card</p>
        </div>

        <div className="rounded-2xl border border-[#1a1a2e] bg-[#0c0c16] p-7">
          <form action={action} className="space-y-4">
            {state.error && (
              <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-xs text-rose-400">{state.error}</div>
            )}
            <Input id="name" name="name" type="text" label="Full Name" placeholder="Alex Johnson" required autoComplete="name" />
            <Input id="email" name="email" type="email" label="Email" placeholder="you@example.com" required autoComplete="email" />
            <Input id="password" name="password" type="password" label="Password" placeholder="At least 8 characters" required minLength={8} autoComplete="new-password" />
            <Button type="submit" className="w-full mt-1" size="lg" loading={pending}>Create free account</Button>
          </form>
          <p className="mt-6 text-center text-[13px] text-[#5a5a7a]">
            Have an account?{" "}
            <Link href="/login" className="font-semibold text-violet-400 hover:text-violet-300 transition-colors">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
