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
  const { status, setStatus } = useItemStatus(item.id, item.status);
  const done = status === "DONE";
  return (
    <li className="flex items-center gap-2 py-1 pl-2 pr-4 sm:pl-3 sm:pr-6">
      <StatusToggle status={status} onChange={setStatus} itemName={item.name} />
      <div className="min-w-0 flex-1 py-2">
        <p className={cn("truncate text-sm font-medium text-slate-900", done && "text-slate-400")}>
          {item.name}
        </p>
        <p className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-500">
          <span className={cn("h-1.5 w-1.5 rounded-full", CATEGORY_DOT[item.category])} aria-hidden />
          {CATEGORY_LABELS[item.category]}
        </p>
      </div>
      <span className={cn("shrink-0 text-sm font-semibold tabular-nums", done ? "text-slate-400" : "text-slate-900")}>
        {formatTHB(item.amountCents)}
      </span>
    </li>
  );
}
