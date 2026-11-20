"use client";

import { formatTHB } from "@/lib/money";
import { cn } from "@/lib/utils";
import { CATEGORY_DOT, CATEGORY_LABELS, type Category } from "@/lib/categories";
import { StatusToggle, useItemStatus, type ItemStatus } from "@/components/StatusToggle";

type PendingItem = {
  id: string;
  name: string;
  category: Category;
  status: ItemStatus;
  amountCents: number;
};

/** Pending items you can tick off right from the dashboard. */
export function PendingItemsList({ items }: { items: PendingItem[] }) {
  return (
    <ul className="divide-y divide-slate-100">
      {items.map((item) => (
        <PendingRow key={item.id} item={item} />
      ))}
    </ul>
  );
}

function PendingRow({ item }: { item: PendingItem }) {
  const { status, setStatus, isPending } = useItemStatus(item.id, item.status);
  const done = status === "DONE";
  return (
    <li className="flex items-center gap-1 py-2 pl-2 pr-4 sm:gap-2 sm:pl-3 sm:pr-6">
      <StatusToggle status={status} onChange={setStatus} itemName={item.name} disabled={isPending} />
      <div className="flex min-w-0 flex-1 flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <div className="min-w-0 flex-1 basis-32">
          <p className={cn("wrap-anywhere text-sm leading-snug font-medium", done ? "text-slate-600" : "text-slate-900")}>
            {item.name}
          </p>
          <p className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-600">
            <span className={cn("h-1.5 w-1.5 rounded-full", CATEGORY_DOT[item.category])} aria-hidden />
            {CATEGORY_LABELS[item.category]}
          </p>
        </div>
        <span className={cn("wrap-anywhere text-sm font-semibold tabular-nums", done ? "text-slate-600" : "text-slate-900")}>
          {formatTHB(item.amountCents)}
        </span>
      </div>
    </li>
  );
}
