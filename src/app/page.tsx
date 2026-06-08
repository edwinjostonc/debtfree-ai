import Link from "next/link";
import { ArrowRight, BarChart3, Bot, Globe, Shield, TrendingDown, Zap } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#07070d] text-[#f0f0f8] overflow-x-hidden">

      {/* NAV */}
      <header className="fixed top-0 inset-x-0 z-50 h-14 flex items-center border-b border-[#1a1a2e] bg-[#07070d]/90 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="h-7 w-7 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg,#7c3aed,#06b6d4)" }}>
              <TrendingDown size={13} className="text-white" />
            </div>
            <span className="text-sm font-bold tracking-tight">DebtFree<span className="g-text">AI</span></span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-[13px] text-[#5a5a7a] hover:text-white transition-colors">Sign in</Link>
            <Link href="/register" className="text-[13px] font-semibold text-white rounded-lg px-4 py-1.5 border border-[#7c3aed] hover:bg-[#7c3aed20] transition-all">
              Get started
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* HERO */}
        <section className="relative pt-36 pb-32 overflow-hidden">
          {/* Blobs */}
          <div className="glow-blob w-[700px] h-[400px] bg-[#7c3aed] opacity-[0.12] top-0 left-[-200px] absolute" />
          <div className="glow-blob w-[500px] h-[400px] bg-[#06b6d4] opacity-[0.08] top-20 right-[-150px] absolute" />

          {/* Dot grid */}
          <div className="dot-grid absolute inset-0 opacity-100 pointer-events-none" />

          <div className="relative z-10 mx-auto max-w-7xl px-6">
            <div className="max-w-4xl">

              {/* Badge */}
              <div className="mb-8 inline-flex items-center gap-2.5 rounded-full border border-[#1a1a2e] bg-[#0c0c16] px-4 py-1.5">
                <span className="status-dot" />
                <span className="text-xs text-[#5a5a7a]">Live · 43 currencies · Free forever</span>
              </div>

              {/* Headline */}
              <h1 className="mb-6 text-[clamp(2.8rem,7vw,5.5rem)] font-black leading-[1.0] tracking-[-0.04em]">
                Know exactly<br />
                when you&apos;ll be<br />
                <span className="g-text">debt-free.</span>
              </h1>

              <p className="mb-10 max-w-lg text-[15px] leading-relaxed text-[#5a5a7a]">
                Track every debt, run payoff simulations, and get a personalized
                strategy — in any currency. Built for real people, not finance nerds.
              </p>

              <div className="flex items-center gap-4">
                <Link
                  href="/register"
                  className="group inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-bold text-white transition-all"
                  style={{ background: "linear-gradient(135deg,#7c3aed,#a855f7 50%,#06b6d4)" }}
                >
                  Start free — 2 min setup
                  <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                </Link>
                <Link href="/login" className="text-sm text-[#5a5a7a] hover:text-white transition-colors">
                  Already have an account →
                </Link>
              </div>

              {/* Floating stat cards */}
              <div className="mt-20 flex flex-wrap gap-4">
                {[
                  { label: "Payoff strategies", value: "3" },
                  { label: "Currencies", value: "43" },
                  { label: "Cost", value: "$0" },
                  { label: "Ads or tracking", value: "None" },
                ].map(({ label, value }) => (
                  <div key={label} className="rounded-xl border border-[#1a1a2e] bg-[#0c0c16] px-5 py-3.5">
                    <p className="num text-2xl font-black">{value}</p>
                    <p className="text-[11px] text-[#5a5a7a] mt-0.5">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS — editorial layout */}
        <section className="py-28 border-t border-[#1a1a2e]">
          <div className="mx-auto max-w-7xl px-6">
            <div className="grid gap-16 lg:grid-cols-2 items-start">
              <div>
                <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.2em] text-[#5a5a7a]">How it works</p>
                <h2 className="text-3xl font-black tracking-tight leading-tight lg:text-4xl">
                  Your plan<br />in 4 steps.
                </h2>
              </div>
              <div className="space-y-3">
                {[
                  { n: "1", t: "Add all your debts", d: "Balances, rates, minimums — any currency." },
                  { n: "2", t: "Enter your income & expenses", d: "We find exactly how much you can throw at debt." },
                  { n: "3", t: "Get your exact debt-free date", d: "Snowball, avalanche, or hybrid — your call." },
                  { n: "4", t: "Run what-if simulations", d: "See what a $500 bonus or a $100/mo extra does instantly." },
                ].map(({ n, t, d }) => (
                  <div key={n} className="flex gap-5 rounded-2xl border border-[#1a1a2e] bg-[#0c0c16] p-5 hover:border-[#252540] transition-all">
                    <span className="num text-3xl font-black text-[#1a1a2e] leading-none shrink-0">{n}</span>
                    <div>
                      <p className="font-semibold text-sm text-white">{t}</p>
                      <p className="text-[13px] text-[#5a5a7a] mt-1">{d}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* FEATURES — asymmetric grid */}
        <section className="py-28 border-t border-[#1a1a2e]">
          <div className="mx-auto max-w-7xl px-6">
            <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.2em] text-[#5a5a7a]">Features</p>
            <h2 className="mb-12 text-3xl font-black tracking-tight lg:text-4xl">
              Built different.
            </h2>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {/* Big card */}
              <div className="sm:col-span-2 lg:col-span-1 lg:row-span-2 rounded-2xl border border-[#1a1a2e] bg-[#0c0c16] p-8 flex flex-col justify-between hover:border-[#252540] transition-all group">
                <div>
                  <div className="mb-6 inline-flex h-11 w-11 items-center justify-center rounded-xl" style={{ background: "linear-gradient(135deg,#7c3aed22,#06b6d422)" }}>
                    <BarChart3 size={20} style={{ color: "#a855f7" }} />
                  </div>
                  <h3 className="mb-3 text-xl font-bold">Precision payoff calculator</h3>
                  <p className="text-sm text-[#5a5a7a] leading-relaxed">
                    Month-by-month amortization math — same formulas banks use.
                    Snowball, avalanche, or hybrid strategy. Exact dates, exact numbers.
                    No guessing.
                  </p>
                </div>
                <div className="mt-8 grid grid-cols-2 gap-3">
                  {["Snowball", "Avalanche", "Hybrid", "Custom"].map((s) => (
                    <div key={s} className="rounded-lg border border-[#1a1a2e] bg-[#11111f] px-3 py-2 text-xs font-medium text-[#5a5a7a]">{s}</div>
                  ))}
                </div>
              </div>

              {[
                { icon: Zap, title: "What-if simulator", desc: "Extra payment? Bonus? Raise? See the exact impact in real time.", col: "#06b6d4" },
                { icon: Globe, title: "43 currencies", desc: "USD, INR, EUR, NGN, GBP — track debts in any mix. Live ECB rates.", col: "#a855f7" },
                { icon: Bot, title: "Personal coach", desc: "Answers based on your numbers. DTI, utilization, strategy advice.", col: "#7c3aed" },
                { icon: Shield, title: "Private by design", desc: "No ads. No data selling. Encrypted. Yours.", col: "#06b6d4" },
              ].map(({ icon: Icon, title, desc, col }) => (
                <div key={title} className="rounded-2xl border border-[#1a1a2e] bg-[#0c0c16] p-6 hover:border-[#252540] transition-all">
                  <div className="mb-4 inline-flex h-9 w-9 items-center justify-center rounded-lg" style={{ background: `${col}18` }}>
                    <Icon size={16} style={{ color: col }} />
                  </div>
                  <h3 className="mb-2 font-semibold text-sm">{title}</h3>
                  <p className="text-[13px] text-[#5a5a7a] leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-28 border-t border-[#1a1a2e]">
          <div className="mx-auto max-w-7xl px-6">
            <div className="relative overflow-hidden rounded-3xl border border-[#1a1a2e] bg-[#0c0c16] p-16 text-center">
              <div className="glow-blob w-[400px] h-[300px] bg-[#7c3aed] opacity-[0.12] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 absolute" />
              <div className="relative">
                <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.2em] text-[#5a5a7a]">Ready?</p>
                <h2 className="mb-6 text-4xl font-black tracking-tight lg:text-5xl">
                  Find out your<br />
                  <span className="g-text">debt-free date today.</span>
                </h2>
                <p className="mb-10 text-sm text-[#5a5a7a]">Free. 2 minutes. No credit card.</p>
                <Link
                  href="/register"
                  className="group inline-flex items-center gap-2 rounded-xl px-8 py-3.5 text-sm font-bold text-white"
                  style={{ background: "linear-gradient(135deg,#7c3aed,#a855f7 50%,#06b6d4)" }}
                >
                  Create free account
                  <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-[#1a1a2e] py-8 text-center text-[11px] text-[#2a2a45]">
        © 2026 DebtFree AI · Not financial advice
      </footer>
    </div>
  );
}
