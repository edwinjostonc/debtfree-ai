"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutUser } from "@/app/actions/auth";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  CreditCard,
  DollarSign,
  TrendingDown,
  Bot,
  LogOut,
  Menu,
  X,
  Settings,
} from "lucide-react";
import { useState } from "react";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/debts", label: "Debts", icon: CreditCard },
  { href: "/income", label: "Income", icon: DollarSign },
  { href: "/simulator", label: "Simulator", icon: TrendingDown },
  { href: "/coach", label: "Coach", icon: Bot },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Navbar({ userName }: { userName?: string | null }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/60 bg-white/80 backdrop-blur-xl dark:border-slate-800/60 dark:bg-slate-950/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 lg:px-6">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2.5 shrink-0">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/25">
            <TrendingDown size={15} className="text-white" />
          </div>
          <span className="text-base font-bold tracking-tight text-slate-900 dark:text-white">
            DebtFree <span className="gradient-text">AI</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-0.5">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150",
                  active
                    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400"
                    : "text-slate-500 hover:bg-slate-100/80 hover:text-slate-900 dark:text-slate-500 dark:hover:bg-slate-800/60 dark:hover:text-slate-200"
                )}
              >
                <Icon size={15} />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {userName && (
            <span className="hidden lg:block text-xs text-slate-400 dark:text-slate-500 max-w-28 truncate">
              {userName}
            </span>
          )}
          <form action={logoutUser}>
            <button
              type="submit"
              className="hidden lg:flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-500 hover:bg-red-50 hover:text-red-600 transition-all duration-150 dark:hover:bg-red-950/30 dark:hover:text-red-400"
            >
              <LogOut size={15} />
              Sign Out
            </button>
          </form>
          <button
            className="lg:hidden flex items-center justify-center h-9 w-9 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
            onClick={() => setOpen(!open)}
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      {open && (
        <div className="lg:hidden border-t border-slate-200/60 bg-white/95 backdrop-blur-xl px-4 py-3 space-y-1 dark:border-slate-800/60 dark:bg-slate-950/95">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400"
                    : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                )}
              >
                <Icon size={17} />
                {label}
              </Link>
            );
          })}
          <form action={logoutUser} className="pt-1">
            <button
              type="submit"
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
            >
              <LogOut size={17} />
              Sign Out
            </button>
          </form>
        </div>
      )}
    </header>
  );
}
