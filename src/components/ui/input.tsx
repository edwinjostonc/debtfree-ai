import { cn } from "@/lib/utils";
import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, ...props }, ref) => (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={id} className="block text-[11px] font-bold uppercase tracking-[0.15em] text-[#5a5a7a]">
          {label}
        </label>
      )}
      <input
        ref={ref} id={id}
        className={cn(
          "w-full rounded-xl border border-[#1a1a2e] bg-[#11111f] px-4 py-2.5 text-sm text-white placeholder:text-[#2a2a45] outline-none transition-all",
          "focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20",
          "disabled:opacity-40 disabled:cursor-not-allowed",
          error && "border-rose-500/30 focus:border-rose-500/50 focus:ring-rose-500/20",
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-rose-400">{error}</p>}
    </div>
  )
);
Input.displayName = "Input";
