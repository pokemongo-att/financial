"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function DashboardMonthPicker({ currentMonth }: { currentMonth: string }) {
  const router = useRouter();

  function changeMonth(delta: number) {
    const [y, m] = currentMonth.split("-").map(Number);
    const d = new Date(y, m - 1 + delta, 1);
    const newMonth = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    router.push(`/dashboard?month=${newMonth}`);
  }

  const display = (() => {
    const [y, m] = currentMonth.split("-").map(Number);
    const d = new Date(y, m - 1);
    return d.toLocaleDateString("th-TH", { year: "numeric", month: "long" });
  })();

  return (
    <div className="flex items-center gap-1">
      <Button variant="ghost" size="icon" onClick={() => changeMonth(-1)}>
        <ChevronLeft className="w-4 h-4" />
      </Button>
      <span className="text-sm font-semibold text-slate-900 min-w-[160px] text-center">
        {display}
      </span>
      <Button variant="ghost" size="icon" onClick={() => changeMonth(1)}>
        <ChevronRight className="w-4 h-4" />
      </Button>
    </div>
  );
}
