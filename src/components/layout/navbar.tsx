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
} from "lucide-react";
import { useState } from "react";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/debts", label: "Debts", icon: CreditCard },
  { href: "/income", label: "Income & Expenses", icon: DollarSign },
  { href: "/simulator", label: "Simulator", icon: TrendingDown },
  { href: "/coach", label: "AI Coach", icon: Bot },
];

export function Navbar({ userName }: { userName?: string | null }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white">
            <TrendingDown size={16} />
          </div>
          <span className="font-bold text-slate-900 dark:text-white">DebtFree AI</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                pathname.startsWith(href)
                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800"
              )}
            >
              <Icon size={16} />
              {label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {userName && (
            <span className="hidden text-sm text-slate-500 md:block">
              {userName}
            </span>
          )}
          <form action={logoutUser}>
            <button
              type="submit"
              className="hidden md:flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <LogOut size={16} />
              Sign Out
            </button>
          </form>
          <button
            className="md:hidden p-2 rounded-lg hover:bg-slate-100"
            onClick={() => setOpen(!open)}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      {open && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-950">
          {NAV.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                pathname.startsWith(href)
                  ? "bg-emerald-50 text-emerald-700"
                  : "text-slate-600 hover:bg-slate-100"
              )}
            >
              <Icon size={18} />
              {label}
            </Link>
          ))}
          <form action={logoutUser} className="mt-2">
            <button
              type="submit"
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100"
            >
              <LogOut size={18} />
              Sign Out
            </button>
          </form>
        </div>
      )}
    </header>
  );
}
