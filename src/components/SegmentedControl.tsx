"use client";

import { cn } from "@/lib/utils";

export type SegmentOption<T extends string> = {
  value: T;
  label: string;
  /** Classes applied when this segment is selected. */
  activeClass?: string;
};

/** Two-to-four big, thumb-friendly choices in one row (instead of a select). */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  label,
  className,
}: {
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  label: string;
  className?: string;
}) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={cn("grid gap-1 rounded-xl bg-slate-100 p-1", className)}
      style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}
    >
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(opt.value)}
            className={cn(
              "h-8 rounded-lg text-sm font-medium transition-colors pointer-coarse:h-10",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500",
              active
                ? cn("bg-white text-slate-900 shadow-sm", opt.activeClass)
                : "text-slate-500 hover:text-slate-800"
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
