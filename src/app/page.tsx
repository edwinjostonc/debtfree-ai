import Link from "next/link";
import { TrendingDown, Shield, Bot, BarChart3, CheckCircle, ArrowRight, Sparkles, Zap, Globe } from "lucide-react";

const FEATURES = [
  {
    icon: TrendingDown,
    title: "Personalized Payoff Plans",
    desc: "Snowball, avalanche, or hybrid — calculated precisely for your debts. See your exact debt-free date.",
    color: "emerald",
  },
  {
    icon: BarChart3,
    title: "What-If Simulator",
    desc: "See instantly how extra payments, income changes, or lump sums slash your payoff timeline.",
    color: "blue",
  },
  {
    icon: Bot,
    title: "AI Debt Coach",
    desc: "Get specific, personalized guidance based on your real numbers. Not generic tips — your situation.",
    color: "violet",
  },
  {
    icon: Globe,
    title: "43 Currencies",
    desc: "Track debts in any currency simultaneously. Live exchange rates from the European Central Bank.",
    color: "orange",
  },
];

const ICON_COLORS: Record<string, string> = {
  emerald: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400",
  blue: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400",
  violet: "bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-400",
  orange: "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400",
};

const STEPS = [
  { n: "01", title: "Add your debts", desc: "Credit cards, loans, anything — any currency" },
  { n: "02", title: "Enter your income", desc: "We calculate exactly what you can put toward debt" },
  { n: "03", title: "Get your plan", desc: "Payoff order, dates, and total interest — instantly" },
  { n: "04", title: "Track & accelerate", desc: "Simulate scenarios and chat with your AI coach" },
];

const STATS = [
  { value: "43", label: "Currencies" },
  { value: "3", label: "Payoff strategies" },
  { value: "0", label: "Cost to you" },
  { value: "∞", label: "Debts tracked" },
];

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-[#020817]">
      {/* Nav */}
      <header className="sticky top-0 z-50 border-b border-slate-200/60 bg-white/80 backdrop-blur-xl dark:border-slate-800/60 dark:bg-slate-950/80">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/30">
              <TrendingDown size={15} className="text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
              DebtFree <span className="gradient-text">AI</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:-translate-y-0.5 transition-all duration-200"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden py-24 md:py-36">
          {/* Background blobs */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-emerald-400/10 blur-3xl dark:bg-emerald-500/10" />
            <div className="absolute top-20 right-0 h-80 w-80 rounded-full bg-teal-400/10 blur-3xl dark:bg-teal-500/8" />
            <div className="absolute bottom-0 left-0 h-80 w-80 rounded-full bg-blue-400/8 blur-3xl dark:bg-blue-500/8" />
          </div>

          <div className="relative mx-auto max-w-5xl px-6 text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-200/60 bg-emerald-50 px-4 py-1.5 text-sm font-medium text-emerald-700 dark:border-emerald-800/40 dark:bg-emerald-950/50 dark:text-emerald-400">
              <Sparkles size={13} />
              Free · No credit card · Private
            </div>

            <h1 className="mb-6 text-5xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-7xl">
              Get out of debt{" "}
              <span className="gradient-text">faster.</span>
            </h1>

            <p className="mb-10 mx-auto max-w-2xl text-xl text-slate-600 dark:text-slate-400 leading-relaxed">
              Track every debt, simulate payoff strategies, and get an AI coach that knows your exact financial situation — not generic advice.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/register"
                className="group flex items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-500 px-8 py-4 text-base font-semibold text-white shadow-xl shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:-translate-y-1 transition-all duration-300"
              >
                Start for Free
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/login"
                className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white/80 px-8 py-4 text-base font-semibold text-slate-700 hover:bg-white hover:border-slate-300 backdrop-blur-sm transition-all duration-200 dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                Sign In
              </Link>
            </div>

            {/* Stats bar */}
            <div className="mt-16 grid grid-cols-2 gap-4 sm:grid-cols-4 max-w-2xl mx-auto">
              {STATS.map((s) => (
                <div key={s.label} className="rounded-2xl border border-slate-200/80 bg-white/60 p-4 backdrop-blur-sm dark:border-slate-800/80 dark:bg-slate-900/60">
                  <div className="text-2xl font-bold text-slate-900 dark:text-white">{s.value}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-24 bg-white dark:bg-slate-950/50">
          <div className="mx-auto max-w-7xl px-6">
            <div className="mb-16 text-center">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-blue-200/60 bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-700 dark:border-blue-800/40 dark:bg-blue-950/50 dark:text-blue-400">
                <Zap size={11} />
                Features
              </div>
              <h2 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
                Everything you need to be debt-free
              </h2>
              <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">
                Built with the same tools professional financial advisors use — free for everyone.
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {FEATURES.map(({ icon: Icon, title, desc, color }) => (
                <div
                  key={title}
                  className="group rounded-2xl border border-slate-200/80 bg-slate-50/80 p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-slate-200/60 dark:border-slate-800/80 dark:bg-slate-900/80 dark:hover:shadow-slate-900/60"
                >
                  <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl ${ICON_COLORS[color]} transition-transform duration-300 group-hover:scale-110`}>
                    <Icon size={20} />
                  </div>
                  <h3 className="mb-2 font-semibold text-slate-900 dark:text-white">{title}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="py-24 bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900/50">
          <div className="mx-auto max-w-4xl px-6">
            <div className="mb-16 text-center">
              <h2 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
                Your plan in{" "}
                <span className="gradient-text">2 minutes</span>
              </h2>
              <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">
                No spreadsheets. No financial degree required.
              </p>
            </div>

            <div className="space-y-4">
              {STEPS.map((step, i) => (
                <div
                  key={i}
                  className="flex items-center gap-6 rounded-2xl border border-slate-200/80 bg-white/80 p-6 backdrop-blur-sm transition-all duration-200 hover:border-emerald-200 hover:shadow-md hover:shadow-emerald-500/5 dark:border-slate-800/80 dark:bg-slate-900/80 dark:hover:border-emerald-800/50"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-sm font-bold text-white shadow-lg shadow-emerald-500/30">
                    {step.n}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">{step.title}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{step.desc}</p>
                  </div>
                  <CheckCircle size={20} className="ml-auto shrink-0 text-emerald-500" />
                </div>
              ))}
            </div>

            <div className="mt-12 text-center">
              <Link
                href="/register"
                className="group inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-500 px-10 py-4 text-base font-semibold text-white shadow-xl shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:-translate-y-1 transition-all duration-300"
              >
                Create Free Account
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <p className="mt-3 text-sm text-slate-500 dark:text-slate-500">
                No credit card. No ads. Your data stays private.
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200/60 bg-white py-8 dark:border-slate-800/60 dark:bg-slate-950">
        <div className="mx-auto max-w-7xl px-6 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-emerald-500 to-teal-600">
              <TrendingDown size={11} className="text-white" />
            </div>
            <span className="text-sm font-semibold text-slate-900 dark:text-white">DebtFree AI</span>
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-500">
            Not financial advice. © 2026 DebtFree AI.
          </p>
        </div>
      </footer>
    </div>
  );
}
