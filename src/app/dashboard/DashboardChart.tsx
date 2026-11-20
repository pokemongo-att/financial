import { formatTHB } from "@/lib/money";
import { cn } from "@/lib/utils";
import { CATEGORY_DOT, CATEGORY_LABELS, CATEGORY_ORDER, type Category } from "@/lib/categories";

export function DashboardChart({ amounts }: { amounts: Record<Category, number> }) {
  const maxAmount = Math.max(1, ...Object.values(amounts).map(Math.abs));

  return (
    <dl className="space-y-3.5">
      {CATEGORY_ORDER.map((category) => (
        <div key={category} className="relative flex flex-wrap items-baseline justify-between gap-x-3 pb-3">
          <dt className="text-sm text-slate-600">{CATEGORY_LABELS[category]}</dt>
          <dd className="wrap-anywhere text-sm font-medium tabular-nums">
            {formatTHB(amounts[category])}
            <span className="absolute inset-x-0 bottom-0 block h-1.5 overflow-hidden rounded-full bg-slate-100" aria-hidden>
              <span
                className={cn("block h-full rounded-full", CATEGORY_DOT[category])}
                style={{ width: `${(Math.abs(amounts[category]) / maxAmount) * 100}%` }}
              />
            </span>
          </dd>
        </div>
      ))}
    </dl>
  );
}
