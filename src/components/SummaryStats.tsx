import { cn } from "@/lib/utils";

export type StatTone =
  | "default"
  | "income"
  | "expense"
  | "saving"
  | "goal"
  | "family"
  | "primary"
  | "positive"
  | "negative";

const TONE_TEXT: Record<StatTone, string> = {
  default: "text-slate-900",
  income: "text-emerald-600",
  expense: "text-red-600",
  saving: "text-indigo-600",
  goal: "text-purple-600",
  family: "text-orange-600",
  primary: "text-indigo-600",
  positive: "text-emerald-600",
  negative: "text-red-600",
};

const TONE_DOT: Record<StatTone, string | null> = {
  default: null,
  income: "bg-emerald-500",
  expense: "bg-red-500",
  saving: "bg-indigo-500",
  goal: "bg-purple-500",
  family: "bg-orange-500",
  primary: null,
  positive: null,
  negative: null,
};

export type Stat = {
  label: string;
  value: React.ReactNode;
  tone?: StatTone;
  hint?: React.ReactNode;
};

/**
 * Money summary that reads like a statement on phones (one card, label ↔ amount
 * rows, the headline figure on top) and becomes a grid of cards from 640px up.
 */
export function SummaryStats({
  items,
  highlight,
  gridClassName = "sm:grid-cols-3",
  className,
}: {
  items: Stat[];
  /** The figure that matters most; leads the phone list, closes the grid. */
  highlight?: Stat;
  gridClassName?: string;
  className?: string;
}) {
  const all = highlight ? [...items, highlight] : items;

  return (
    <div className={className}>
      {/* Phone: statement list */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm sm:hidden">
        {highlight && (
          <div className="border-b border-slate-100 px-4 py-3.5">
            <p className="text-sm text-slate-500">{highlight.label}</p>
            <p className={cn("mt-0.5 text-2xl font-semibold tabular-nums tracking-tight", TONE_TEXT[highlight.tone ?? "default"])}>
              {highlight.value}
            </p>
            {highlight.hint && <div className="mt-1 text-xs text-slate-500">{highlight.hint}</div>}
          </div>
        )}
        <dl className="divide-y divide-slate-100">
          {items.map((s) => (
            <div key={s.label} className="flex items-center justify-between gap-3 px-4 py-3">
              <dt className="flex min-w-0 items-center gap-2 text-sm text-slate-600">
                {TONE_DOT[s.tone ?? "default"] && (
                  <span className={cn("h-2 w-2 shrink-0 rounded-full", TONE_DOT[s.tone ?? "default"])} aria-hidden />
                )}
                <span className="truncate">{s.label}</span>
              </dt>
              <dd className="text-right">
                <span className={cn("text-[15px] font-semibold tabular-nums", TONE_TEXT[s.tone ?? "default"])}>
                  {s.value}
                </span>
                {s.hint && <div className="text-xs text-slate-500">{s.hint}</div>}
              </dd>
            </div>
          ))}
        </dl>
      </div>

      {/* Tablet / desktop: card grid */}
      <dl className={cn("hidden gap-3 sm:grid lg:gap-4", gridClassName)}>
        {all.map((s) => (
          <div key={s.label} className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm lg:p-5">
            <dt className="flex items-center gap-2 text-sm text-slate-500">
              {TONE_DOT[s.tone ?? "default"] && (
                <span className={cn("h-2 w-2 shrink-0 rounded-full", TONE_DOT[s.tone ?? "default"])} aria-hidden />
              )}
              <span className="truncate">{s.label}</span>
            </dt>
            <dd className={cn("mt-1.5 text-xl font-semibold tabular-nums tracking-tight lg:text-2xl", TONE_TEXT[s.tone ?? "default"])}>
              {s.value}
            </dd>
            {s.hint && <dd className="mt-1 text-xs text-slate-500">{s.hint}</dd>}
          </div>
        ))}
      </dl>
    </div>
  );
}

/** Done / total checklist progress, used on the dashboard and the month plan. */
export function ChecklistProgress({
  done,
  total,
  skipped = 0,
  className,
}: {
  done: number;
  total: number;
  skipped?: number;
  className?: string;
}) {
  const settled = done + skipped;
  const pct = total > 0 ? Math.round((settled / total) * 100) : 0;
  return (
    <div className={className}>
      <div className="flex items-baseline justify-between gap-3 text-sm">
        <span className="text-slate-600">
          เสร็จแล้ว <span className="font-semibold tabular-nums text-slate-900">{done}</span>
          <span className="tabular-nums text-slate-400"> / {total}</span> รายการ
          {skipped > 0 && <span className="text-slate-400"> · ข้าม {skipped}</span>}
        </span>
        <span className="text-xs font-medium tabular-nums text-slate-500">{pct}%</span>
      </div>
      <div
        className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={settled}
        aria-label="ความคืบหน้ารายการของเดือน"
      >
        <div
          className="h-full rounded-full bg-emerald-500 transition-[width] duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
