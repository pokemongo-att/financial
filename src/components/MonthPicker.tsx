import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

function shift(ym: string, delta: number) {
  const [y, m] = ym.split("-").map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function thisMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export function formatThaiMonth(ym: string) {
  const [y, m] = ym.split("-").map(Number);
  return new Date(y, m - 1).toLocaleDateString("th-TH", { year: "numeric", month: "long" });
}

/**
 * Month stepper built from links (prefetchable, works without JS).
 * `mode="path"` → /month/2026-02, `mode="query"` → /dashboard?month=2026-02.
 */
export function MonthPicker({
  currentMonth,
  basePath = "/month",
  mode = "path",
  className,
}: {
  currentMonth: string;
  basePath?: string;
  mode?: "path" | "query";
  className?: string;
}) {
  const href = (ym: string) => (mode === "query" ? `${basePath}?month=${ym}` : `${basePath}/${ym}`);
  const today = thisMonth();
  const stepClass =
    "inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-lg text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 active:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-indigo-500";

  return (
    <div className={cn("flex w-full min-w-0 flex-wrap items-center gap-2 sm:w-auto", className)}>
      <nav
        aria-label="เลือกเดือน"
        className="flex min-w-0 flex-1 basis-48 items-center rounded-xl border border-slate-200 bg-white p-0.5 sm:flex-none"
      >
        <Link href={href(shift(currentMonth, -1))} className={stepClass} aria-label="เดือนก่อนหน้า" scroll={false}>
          <ChevronLeft className="h-4 w-4" />
        </Link>
        <span className="min-w-0 flex-1 py-1 text-center text-sm font-semibold leading-snug text-slate-900 sm:min-w-32" aria-live="polite">
          {formatThaiMonth(currentMonth)}
        </span>
        <Link href={href(shift(currentMonth, 1))} className={stepClass} aria-label="เดือนถัดไป" scroll={false}>
          <ChevronRight className="h-4 w-4" />
        </Link>
      </nav>
      {currentMonth !== today && (
        <Link
          href={href(today)}
          className="inline-flex min-h-11 shrink-0 items-center rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-indigo-700 transition-colors hover:bg-indigo-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
        >
          เดือนนี้
        </Link>
      )}
    </div>
  );
}
