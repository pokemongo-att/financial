"use client";

import { useTransition } from "react";
import { updateMonthlyItem } from "@/actions/monthly";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type Status = "PLANNED" | "DONE" | "SKIPPED";

const STATUS_VARIANT: Record<Status, "default" | "success" | "warning"> = {
  PLANNED: "default",
  DONE: "success",
  SKIPPED: "warning",
};

const STATUS_LABELS: Record<Status, string> = {
  PLANNED: "รอดำเนินการ",
  DONE: "เสร็จแล้ว",
  SKIPPED: "ข้าม",
};

const NEXT_STATUS: Record<Status, Status> = {
  PLANNED: "DONE",
  DONE: "SKIPPED",
  SKIPPED: "PLANNED",
};

export function StatusCheckbox({
  itemId,
  status,
  onUpdate,
}: {
  itemId: string;
  status: Status;
  onUpdate?: () => void;
}) {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    const nextStatus = NEXT_STATUS[status];
    startTransition(async () => {
      await updateMonthlyItem(itemId, { status: nextStatus });
      onUpdate?.();
    });
  }

  return (
    <button onClick={handleClick} disabled={isPending}>
      <Badge
        variant={STATUS_VARIANT[status]}
        className={cn("cursor-pointer transition-opacity", isPending && "opacity-50")}
      >
        {isPending ? "..." : STATUS_LABELS[status]}
      </Badge>
    </button>
  );
}
