"use client";

import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";

export function MoneyInput({
  value,
  onChange,
  placeholder = "0.00",
  className,
  disabled,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}) {
  const [displayValue, setDisplayValue] = useState(value);
  const [focused, setFocused] = useState(false);

  const formatDisplay = useCallback((val: string) => {
    const num = parseFloat(val);
    if (isNaN(num)) return "";
    return num.toLocaleString("th-TH", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }, []);

  function handleFocus() {
    setFocused(true);
    setDisplayValue(value);
  }

  function handleBlur() {
    setFocused(false);
    const formatted = formatDisplay(displayValue);
    setDisplayValue(formatted);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value.replace(/,/g, "");
    setDisplayValue(e.target.value);
    onChange(raw);
  }

  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">
        ฿
      </span>
      <input
        type={focused ? "number" : "text"}
        step="0.01"
        value={focused ? value : displayValue || formatDisplay(value)}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder}
        disabled={disabled}
        className={cn(
          "flex h-9 w-full rounded-lg border border-slate-200 bg-white pl-7 pr-3 py-2 text-sm text-slate-900 tabular-nums text-right placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
      />
    </div>
  );
}
