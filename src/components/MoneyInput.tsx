"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { fieldBase } from "@/components/ui/input";

function formatDisplay(val: string) {
  if (val === "") return "";
  const num = parseFloat(val);
  if (isNaN(num)) return "";
  return num.toLocaleString("th-TH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/** Keep digits and a single decimal point with at most two decimals. */
function sanitize(input: string) {
  let raw = input.replace(/,/g, "").replace(/[^\d.]/g, "");
  const dot = raw.indexOf(".");
  if (dot !== -1) {
    raw = raw.slice(0, dot + 1) + raw.slice(dot + 1).replace(/\./g, "").slice(0, 2);
  }
  return raw;
}

/**
 * Baht amount field. Shows "12,345.00" at rest and the raw number while editing.
 * `value` / `onChange` carry the raw string (e.g. "12345.5"); callers convert to cents.
 * Uses inputMode="decimal" so phones open the number pad with a decimal key.
 */
export function MoneyInput({
  value,
  onChange,
  placeholder = "0.00",
  className,
  disabled,
  id,
  name,
  autoFocus,
  "aria-label": ariaLabel,
  "aria-invalid": ariaInvalid,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  id?: string;
  name?: string;
  autoFocus?: boolean;
  "aria-label"?: string;
  "aria-invalid"?: boolean;
}) {
  const [focused, setFocused] = useState(false);

  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">
        ฿
      </span>
      <input
        id={id}
        name={name}
        type="text"
        inputMode="decimal"
        autoComplete="off"
        enterKeyHint="done"
        autoFocus={autoFocus}
        value={focused ? value : formatDisplay(value)}
        onChange={(e) => onChange(sanitize(e.target.value))}
        onFocus={(e) => {
          setFocused(true);
          // select the whole amount so typing replaces it
          requestAnimationFrame(() => e.target.select());
        }}
        onBlur={() => setFocused(false)}
        placeholder={placeholder}
        disabled={disabled}
        aria-label={ariaLabel}
        aria-invalid={ariaInvalid}
        className={cn(
          fieldBase,
          "flex h-10 pl-7 pr-3 py-2 text-right tabular-nums pointer-coarse:h-11",
          className
        )}
      />
    </div>
  );
}
