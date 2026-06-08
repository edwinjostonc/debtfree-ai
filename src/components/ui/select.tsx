import { cn } from "@/lib/utils";
import { SelectHTMLAttributes, forwardRef } from "react";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, id, children, ...props }, ref) => (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={id} className="block text-[11px] font-bold uppercase tracking-[0.15em] text-[#5a5a7a]">
          {label}
        </label>
      )}
      <select
        ref={ref} id={id}
        className={cn(
          "w-full rounded-xl border border-[#1a1a2e] bg-[#11111f] px-4 py-2.5 text-sm text-white outline-none transition-all",
          "focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20",
          error && "border-rose-500/30",
          className
        )}
        {...props}
      >
        {children}
      </select>
      {error && <p className="text-xs text-rose-400">{error}</p>}
    </div>
  )
);
Select.displayName = "Select";
