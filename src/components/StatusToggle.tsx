"use client";

import { useOptimistic, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Minus } from "lucide-react";
import { toast } from "sonner";
import { updateMonthlyItem } from "@/actions/monthly";
import { cn } from "@/lib/utils";

export type ItemStatus = "PLANNED" | "DONE" | "SKIPPED";

export const STATUS_LABELS: Record<ItemStatus, string> = {
  PLANNED: "รอดำเนินการ",
  DONE: "เสร็จแล้ว",
  SKIPPED: "ข้าม",
};

/** Status of one monthly item with an optimistic update, so a tick lands instantly. */
export function useItemStatus(itemId: string, status: ItemStatus) {
  const router = useRouter();
  const [optimistic, setOptimistic] = useOptimistic(status);
  const [isPending, startTransition] = useTransition();

  function setStatus(next: ItemStatus) {
    startTransition(async () => {
      setOptimistic(next);
      try {
        await updateMonthlyItem(itemId, { status: next });
        router.refresh();
      } catch {
        toast.error("อัปเดตสถานะไม่สำเร็จ ลองอีกครั้ง");
      }
    });
  }

  return { status: optimistic, setStatus, isPending };
}

/**
 * One-tap checklist control: PLANNED ↔ DONE. "ข้าม" lives in the row menu.
 * The hit area is 40px (44px on touch) around a 24px circle.
 */
export function StatusToggle({
  status,
  onChange,
  itemName,
  className,
}: {
  status: ItemStatus;
  onChange: (next: ItemStatus) => void;
  itemName: string;
  className?: string;
}) {
  const done = status === "DONE";
  const skipped = status === "SKIPPED";

  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={done}
      aria-label={`${itemName}: ${STATUS_LABELS[status]} — แตะเพื่อ${done ? "ยกเลิก" : "ทำเครื่องหมายว่าเสร็จ"}`}
      onClick={() => onChange(done ? "PLANNED" : "DONE")}
      className={cn(
        "group/toggle inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full pointer-coarse:h-11 pointer-coarse:w-11",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500",
        className
      )}
    >
      <span
        className={cn(
          "flex h-6 w-6 items-center justify-center rounded-full border-2 transition-[background-color,border-color,transform] duration-200 ease-out group-active/toggle:scale-90",
          done && "border-emerald-500 bg-emerald-500 text-white",
          skipped && "border-amber-300 bg-amber-50 text-amber-500",
          !done && !skipped && "border-slate-300 bg-white text-transparent group-hover/toggle:border-emerald-400"
        )}
      >
        {skipped ? (
          <Minus className="h-3.5 w-3.5" strokeWidth={3} />
        ) : (
          <Check className="h-3.5 w-3.5" strokeWidth={3} />
        )}
      </span>
    </button>
  );
}
