"use client";

import { useTransition } from "react";
import { updateMonthlyItem } from "@/actions/monthly";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
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

const TRANSITION_OPTIONS: Record<Status, Status[]> = {
  PLANNED: ["DONE", "SKIPPED"],
  DONE: ["PLANNED", "SKIPPED"],
  SKIPPED: ["PLANNED", "DONE"],
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

  function handleChangeStatus(nextStatus: Status) {
    startTransition(async () => {
      await updateMonthlyItem(itemId, { status: nextStatus });
      onUpdate?.();
    });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild disabled={isPending}>
        <button>
          <Badge
            variant={STATUS_VARIANT[status]}
            className={cn("cursor-pointer transition-opacity", isPending && "opacity-50")}
          >
            {isPending ? "..." : STATUS_LABELS[status]}
          </Badge>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center" className="min-w-[120px]">
        {TRANSITION_OPTIONS[status].map((nextStatus) => (
          <DropdownMenuItem key={nextStatus} onClick={() => handleChangeStatus(nextStatus)}>
            <Badge variant={STATUS_VARIANT[nextStatus]} className="w-full justify-center">
              {STATUS_LABELS[nextStatus]}
            </Badge>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
