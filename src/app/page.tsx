import Link from "next/link";
import { TrendingDown, Shield, Bot, BarChart3, ArrowRight, Globe } from "lucide-react";

const FEATURES = [
  {
    icon: TrendingDown,
    title: "Personalized Payoff Plans",
    desc: "Snowball, avalanche, or hybrid — calculated precisely for your debts. See your exact debt-free date.",
  },
  {
    icon: BarChart3,
    title: "What-If Simulator",
    desc: "See instantly how extra payments, income changes, or lump sums slash your payoff timeline.",
  },
  {
    icon: Bot,
    title: "AI Debt Coach",
    desc: "Get specific, personalized guidance based on your real numbers. Not generic tips — your situation.",
  },
  {
    icon: Globe,
    title: "43 Currencies",
    desc: "Track debts in any currency simultaneously. Live exchange rates from the European Central Bank.",
  },
];

const STEPS = [
  { n: "01", title: "Add your debts", desc: "Credit cards, loans, anything — any currency" },
  { n: "02", title: "Enter your income", desc: "We calculate exactly what you can put toward debt" },
  { n: "03", title: "Get your plan", desc: "Payoff order, dates, and total interest — instantly" },
  { n: "04", title: "Track & accelerate", desc: "Simulate scenarios and chat with your AI coach" },
];

function MetricRow({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-slate-500">{label}</span>
      <span
        className={`text-sm font-bold ${
          highlight ? "text-emerald-600" : "text-slate-900"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* Nav */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-700">
              <TrendingDown size={15} className="text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight text-slate-900">
              DebtFree <span className="gradient-text">AI</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="rounded-xl bg-teal-700 px-4 py-2 text-sm font-semibold text-white border border-teal-700 hover:bg-teal-800 hover:border-teal-800 transition-colors"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="py-20 md:py-32 bg-white">
          <div className="mx-auto max-w-7xl px-6">
            <div className="grid items-center gap-16 lg:grid-cols-2">
              {/* Left: copy */}
              <div>
                <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700">
                  <Shield size={12} />
                  Free · No credit card · Private
                </div>

                <h1 className="mb-5 text-5xl font-bold tracking-tight text-slate-900 sm:text-6xl leading-tight">
                  Your debt.{" "}
                  <br className="hidden sm:block" />
                  A plan.{" "}
                  <span className="gradient-text">Done.</span>
                </h1>

                <p className="mb-8 text-lg text-slate-600 leading-relaxed max-w-lg">
                  DebtFree AI calculates your exact payoff date, builds the optimal strategy, and gives you a personalized coach — in 2 minutes.
                </p>

                <div className="flex flex-col sm:flex-row items-start gap-4">
                  <Link
                    href="/register"
                    className="group inline-flex items-center gap-2 rounded-xl bg-teal-700 px-6 py-3 text-base font-semibold text-white border border-teal-700 hover:bg-teal-800 hover:border-teal-800 transition-colors"
                  >
                    Start for Free
                    <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                  <p className="flex items-center text-sm text-slate-500 mt-1 sm:mt-3">
                    No credit card required
                  </p>
                </div>

                {/* Trust strip */}
                <div className="mt-10 flex items-center gap-6 border-t border-slate-100 pt-8">
                  {[
                    { value: "43", label: "currencies" },
                    { value: "0", label: "cost" },
                    { value: "100%", label: "private" },
                  ].map((s) => (
                    <div key={s.label}>
                      <p className="text-2xl font-bold text-slate-900">{s.value}</p>
                      <p className="text-xs text-slate-500 uppercase tracking-wider">{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right: mock dashboard card */}
              <div className="flex justify-center lg:justify-end">
                <div className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-5 shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Your Plan</span>
                    <span className="text-xs text-emerald-600 font-medium">● On track</span>
                  </div>
                  <div className="space-y-3">
                    <MetricRow label="Total Debt" value="$24,500" />
                    <MetricRow label="Debt-Free Date" value="Aug 2027" />
                    <MetricRow label="Interest Saved" value="$3,200" highlight />
                    <MetricRow label="Monthly Freed" value="$340" />
                  </div>
                  <div className="mt-4">
                    <div className="flex justify-between text-xs text-slate-500 mb-1">
                      <span>Progress</span>
                      <span>34%</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full">
                      <div className="h-1.5 bg-teal-600 rounded-full w-[34%]" />
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">Strategy</span>
                      <span className="font-medium text-slate-700">Avalanche</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">Debts tracked</span>
                      <span className="font-medium text-slate-700">4 accounts</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-24 bg-slate-50">
          <div className="mx-auto max-w-7xl px-6">
            <div className="mb-14">
              <p className="text-xs font-semibold uppercase tracking-wider text-teal-700 mb-2">Features</p>
              <h2 className="text-3xl font-bold tracking-tight text-slate-900">
                Everything you need to be debt-free
              </h2>
              <p className="mt-3 text-slate-600 max-w-xl">
                Built with the same tools professional financial advisors use — free for everyone.
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {FEATURES.map(({ icon: Icon, title, desc }) => (
                <div
                  key={title}
                  className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
                >
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-teal-50">
                    <Icon size={19} className="text-teal-700" />
                  </div>
                  <h3 className="mb-2 font-semibold text-slate-900">{title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="py-24 bg-white">
          <div className="mx-auto max-w-3xl px-6">
            <div className="mb-14">
              <p className="text-xs font-semibold uppercase tracking-wider text-teal-700 mb-2">How it works</p>
              <h2 className="text-3xl font-bold tracking-tight text-slate-900">
                Your plan in <span className="gradient-text">2 minutes</span>
              </h2>
              <p className="mt-3 text-slate-600">No spreadsheets. No financial degree required.</p>
            </div>

            <div className="space-y-3">
              {STEPS.map((step, i) => (
                <div
                  key={i}
                  className="flex items-center gap-5 rounded-xl border border-slate-200 bg-white p-5"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-teal-700 text-sm font-bold text-white">
                    {step.n}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">{step.title}</p>
                    <p className="text-sm text-slate-500 mt-0.5">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-10">
              <Link
                href="/register"
                className="group inline-flex items-center gap-2 rounded-xl bg-teal-700 px-6 py-3 text-base font-semibold text-white border border-teal-700 hover:bg-teal-800 hover:border-teal-800 transition-colors"
              >
                Create Free Account
                <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <p className="mt-3 text-sm text-slate-500">
                No credit card. No ads. Your data stays private.
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white py-8">
        <div className="mx-auto max-w-7xl px-6 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-teal-700">
              <TrendingDown size={11} className="text-white" />
            </div>
            <span className="text-sm font-semibold text-slate-900">DebtFree AI</span>
          </div>
          <p className="text-xs text-slate-400">
            Not financial advice. © 2026 DebtFree AI.
          </p>
        </div>
      </footer>
    </div>
  );
}
