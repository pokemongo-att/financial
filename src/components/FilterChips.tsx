"use client";

import { cn } from "@/lib/utils";

export type ChipOption<T extends string> = { value: T; label: string; count?: number };

/**
 * Single-select chip row. On narrow screens it scrolls sideways instead of
 * wrapping into a tall block of buttons.
 */
export function FilterChips<T extends string>({
  options,
  value,
  onChange,
  label,
  className,
}: {
  options: ChipOption<T>[];
  value: T;
  onChange: (value: T) => void;
  label: string;
  className?: string;
}) {
  return (
    <div
      role="group"
      aria-label={label}
      className={cn("no-scrollbar -mx-4 flex gap-1.5 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0", className)}
    >
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(opt.value)}
            className={cn(
              "inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-full border px-3 text-sm font-medium transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-1",
              active
                ? "border-indigo-600 bg-indigo-600 text-white"
                : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900"
            )}
          >
            {opt.label}
            {opt.count != null && (
              <span className={cn("text-xs tabular-nums", active ? "text-indigo-100" : "text-slate-600")}>
                {opt.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
