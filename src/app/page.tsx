import Link from "next/link";
import {
  TrendingDown,
  Shield,
  Bot,
  BarChart3,
  CheckCircle,
  ArrowRight,
} from "lucide-react";

const FEATURES = [
  {
    icon: TrendingDown,
    title: "Personalized Payoff Plans",
    desc: "Snowball, avalanche, or hybrid strategies calculated precisely for your debts.",
  },
  {
    icon: BarChart3,
    title: "What-If Simulator",
    desc: "See instantly how extra payments, income changes, or lump sums affect your debt-free date.",
  },
  {
    icon: Bot,
    title: "AI Debt Coach",
    desc: "Get personalized, supportive guidance powered by Claude AI — based on your real numbers.",
  },
  {
    icon: Shield,
    title: "Your Data, Secure",
    desc: "Your financial data stays private. We never sell data or use it for advertising.",
  },
];

const STEPS = [
  "Add your debts with balances and interest rates",
  "Enter your income and monthly expenses",
  "Get your personalized debt payoff plan instantly",
  "Chat with your AI coach for tailored guidance",
];

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero */}
      <header className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white">
              <TrendingDown size={16} />
            </div>
            <span className="font-bold text-slate-900 dark:text-white">DebtFree AI</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-medium text-slate-600 hover:text-slate-900"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 transition-colors"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero section */}
        <section className="bg-gradient-to-b from-white to-slate-50 dark:from-slate-950 dark:to-slate-900 py-20 md:py-32">
          <div className="mx-auto max-w-4xl px-4 text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5 text-sm font-medium text-emerald-700">
              <Bot size={14} />
              AI-Powered Debt Management
            </div>
            <h1 className="mb-6 text-4xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-6xl">
              Become Debt-Free{" "}
              <span className="text-emerald-600">Faster</span>
            </h1>
            <p className="mb-10 mx-auto max-w-2xl text-lg text-slate-600 dark:text-slate-400">
              Track all your debts, simulate payoff strategies, and get a
              personalized AI coach that knows your exact financial situation —
              not generic advice.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/register"
                className="flex items-center gap-2 rounded-xl bg-emerald-600 px-8 py-3.5 text-base font-semibold text-white hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200"
              >
                Start for Free
                <ArrowRight size={18} />
              </Link>
              <Link
                href="/login"
                className="rounded-xl border border-slate-200 bg-white px-8 py-3.5 text-base font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Sign In
              </Link>
            </div>
            <p className="mt-4 text-sm text-slate-500">Free • No credit card • Private</p>
          </div>
        </section>

        {/* Features */}
        <section className="py-20 bg-white dark:bg-slate-950">
          <div className="mx-auto max-w-7xl px-4">
            <h2 className="mb-12 text-center text-3xl font-bold text-slate-900 dark:text-white">
              Everything you need to get out of debt
            </h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {FEATURES.map(({ icon: Icon, title, desc }) => (
                <div
                  key={title}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-900"
                >
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
                    <Icon size={20} />
                  </div>
                  <h3 className="mb-2 font-semibold text-slate-900 dark:text-white">{title}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="py-20 bg-slate-50 dark:bg-slate-900">
          <div className="mx-auto max-w-3xl px-4">
            <h2 className="mb-12 text-center text-3xl font-bold text-slate-900 dark:text-white">
              Get your plan in minutes
            </h2>
            <div className="space-y-4">
              {STEPS.map((step, i) => (
                <div
                  key={i}
                  className="flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-sm font-bold text-white">
                    {i + 1}
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle size={18} className="shrink-0 text-emerald-500" />
                    <span className="text-slate-700 dark:text-slate-300">{step}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-10 text-center">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-8 py-3.5 text-base font-semibold text-white hover:bg-emerald-700 transition-colors"
              >
                Create Free Account
                <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white py-8 dark:border-slate-800 dark:bg-slate-950">
        <div className="mx-auto max-w-7xl px-4 text-center text-sm text-slate-500">
          <p>© 2026 DebtFree AI. Not financial advice. Always consult a financial professional.</p>
        </div>
      </footer>
    </div>
  );
}
