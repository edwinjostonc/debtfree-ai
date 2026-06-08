"use client";

import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/40 focus-visible:ring-offset-2 active:scale-[0.98]",
  {
    variants: {
      variant: {
        primary:
          "bg-teal-700 text-white border border-teal-700 hover:bg-teal-800 hover:border-teal-800",
        secondary:
          "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50",
        destructive:
          "bg-red-600 text-white border border-red-600 hover:bg-red-700 hover:border-red-700",
        ghost:
          "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
        outline:
          "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50",
      },
      size: {
        sm: "px-3 py-1.5 text-sm h-8",
        md: "px-4 py-2 text-sm h-9",
        lg: "px-6 py-3 text-base h-11",
        xl: "px-8 py-4 text-base h-12",
        icon: "p-2 h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      >
        {loading && (
          <span className="size-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
