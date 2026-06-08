"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutUser } from "@/app/actions/auth";
import { cn } from "@/lib/utils";
import { LayoutDashboard, CreditCard, DollarSign, TrendingDown, Bot, LogOut, Menu, X, Settings, Zap } from "lucide-react";
import { useState } from "react";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/debts", label: "Debts", icon: CreditCard },
  { href: "/income", label: "Cash Flow", icon: DollarSign },
  { href: "/simulator", label: "Simulator", icon: Zap },
  { href: "/coach", label: "Coach", icon: Bot },
];

export function Navbar({ userName }: { userName?: string | null }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-[#1a1a2e] bg-[#07070d]/95 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6">
        <Link href="/dashboard" className="flex items-center gap-2.5 shrink-0">
          <div className="h-7 w-7 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg,#7c3aed,#06b6d4)" }}>
            <TrendingDown size={13} className="text-white" />
          </div>
          <span className="text-sm font-bold tracking-tight">
            DebtFree<span className="g-text">AI</span>
          </span>
        </Link>

        {/* Desktop */}
        <nav className="hidden md:flex items-center gap-0.5">
          {NAV.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-2 rounded-lg px-3 py-1.5 text-[13px] font-medium transition-all",
                pathname.startsWith(href)
                  ? "bg-violet-500/10 text-violet-300"
                  : "text-[#5a5a7a] hover:bg-white/[0.03] hover:text-white"
              )}
            >
              <Icon size={13} />
              {label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1.5">
          <Link
            href="/settings"
            className={cn(
              "hidden md:flex h-8 w-8 items-center justify-center rounded-lg transition-all",
              pathname.startsWith("/settings")
                ? "bg-violet-500/10 text-violet-300"
                : "text-[#5a5a7a] hover:bg-white/[0.03] hover:text-white"
            )}
          >
            <Settings size={14} />
          </Link>
          {userName && (
            <span className="hidden text-[11px] text-[#2a2a45] md:block ml-2 border-l border-[#1a1a2e] pl-3">
              {userName}
            </span>
          )}
          <form action={logoutUser} className="hidden md:block ml-1">
            <button type="submit" className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[12px] text-[#5a5a7a] hover:bg-white/[0.03] hover:text-white">
              <LogOut size={12} /> Sign out
            </button>
          </form>
          <button className="md:hidden p-1.5 rounded-lg text-[#5a5a7a] hover:text-white" onClick={() => setOpen(!open)}>
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-[#1a1a2e] bg-[#07070d] px-4 py-3 space-y-0.5">
          {NAV.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} onClick={() => setOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                pathname.startsWith(href)
                  ? "bg-violet-500/10 text-violet-300"
                  : "text-[#5a5a7a] hover:bg-white/[0.03] hover:text-white"
              )}
            >
              <Icon size={15} />{label}
            </Link>
          ))}
          <Link href="/settings" onClick={() => setOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-[#5a5a7a] hover:text-white">
            <Settings size={15} />Settings
          </Link>
          <form action={logoutUser}>
            <button type="submit" className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-[#5a5a7a] hover:text-white">
              <LogOut size={15} />Sign out
            </button>
          </form>
        </div>
      )}
    </header>
  );
}
