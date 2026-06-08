"use client";

import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 font-semibold transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none active:scale-[0.97] select-none",
  {
    variants: {
      variant: {
        primary: [
          "rounded-xl text-white",
          "bg-gradient-to-r from-violet-600 via-purple-500 to-cyan-500",
          "hover:opacity-90 shadow-lg shadow-violet-500/20",
        ],
        secondary: [
          "rounded-xl border border-[#1a1a2e] bg-[#0c0c16] text-white/70",
          "hover:border-[#252540] hover:text-white",
        ],
        destructive: [
          "rounded-xl border border-rose-500/20 bg-rose-500/10 text-rose-400",
          "hover:bg-rose-500/20",
        ],
        ghost: "rounded-lg text-white/40 hover:bg-white/5 hover:text-white",
        outline: [
          "rounded-xl border border-[#1a1a2e] text-white/60",
          "hover:border-violet-500/40 hover:text-white",
        ],
      },
      size: {
        sm: "px-3 py-1.5 text-xs rounded-lg",
        md: "px-4 py-2 text-sm",
        lg: "px-6 py-3 text-sm",
        icon: "p-2 rounded-lg",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  }
);

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, children, disabled, ...props }, ref) => (
    <button ref={ref} disabled={disabled || loading} className={cn(buttonVariants({ variant, size }), className)} {...props}>
      {loading && <span className="size-3.5 border-2 border-current border-t-transparent rounded-full animate-spin shrink-0" />}
      {children}
    </button>
  )
);
Button.displayName = "Button";
