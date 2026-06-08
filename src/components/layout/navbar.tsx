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
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 lg:px-6">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2.5 shrink-0">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-700">
            <TrendingDown size={15} className="text-white" />
          </div>
          <span className="text-base font-bold tracking-tight text-slate-900">
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
                    ? "bg-teal-50 text-teal-700"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
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
            <span className="hidden lg:block text-xs text-slate-400 max-w-28 truncate">
              {userName}
            </span>
          )}
          <form action={logoutUser}>
            <button
              type="submit"
              className="hidden lg:flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-500 hover:text-red-600 hover:bg-red-50 transition-all duration-150"
            >
              <LogOut size={15} />
              Sign Out
            </button>
          </form>
          <button
            className="lg:hidden flex items-center justify-center h-9 w-9 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
            onClick={() => setOpen(!open)}
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      {open && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-1">
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
                    ? "bg-teal-50 text-teal-700"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
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
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors"
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
