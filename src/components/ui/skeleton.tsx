import { cn } from "@/lib/utils";
import { Card } from "./card";

export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-lg bg-slate-100", className)}
      {...props}
    />
  );
}

export function SkeletonList({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 flex-1" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-16" />
        </div>
      ))}
    </div>
  );
}

/** Header skeleton matching PageHeader. */
export function SkeletonPageHeader({ action = true }: { action?: boolean }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <Skeleton className="h-7 w-40 sm:h-8" />
        <Skeleton className="mt-2 h-4 w-56" />
      </div>
      {action && <Skeleton className="h-10 w-full rounded-xl sm:w-56" />}
    </div>
  );
}

/** Matches SummaryStats: a statement card on phones, a grid from 640px. */
export function SkeletonStats({ count = 6 }: { count?: number }) {
  return (
    <>
      <Card className="divide-y divide-slate-100 sm:hidden">
        <div className="px-4 py-3.5">
          <Skeleton className="h-3.5 w-16" />
          <Skeleton className="mt-2 h-7 w-36" />
        </div>
        {Array.from({ length: Math.max(count - 1, 1) }).map((_, i) => (
          <div key={i} className="flex items-center justify-between px-4 py-3">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-24" />
          </div>
        ))}
      </Card>
      <div className="hidden grid-cols-3 gap-3 sm:grid lg:gap-4">
        {Array.from({ length: count }).map((_, i) => (
          <Card key={i} className="space-y-2.5 p-4 lg:p-5">
            <Skeleton className="h-3.5 w-16" />
            <Skeleton className="h-6 w-28" />
          </Card>
        ))}
      </div>
    </>
  );
}

/** Matches DataTable with renderCard: list rows below 1024px, table above. */
export function SkeletonTable({ rows = 6, cols = 6 }: { rows?: number; cols?: number }) {
  return (
    <Card className="overflow-hidden">
      <div className="flex flex-col gap-3 border-b border-slate-100 px-4 py-3 lg:flex-row lg:items-center lg:justify-between lg:px-6 lg:py-4">
        <div className="flex gap-1.5 overflow-hidden">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-16 shrink-0 rounded-full" />
          ))}
        </div>
        <Skeleton className="h-10 w-full lg:w-60" />
      </div>
      <div className="divide-y divide-slate-100 lg:hidden">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 px-4 py-3.5">
            <Skeleton className="h-6 w-6 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/5" />
              <Skeleton className="h-3 w-2/5" />
            </div>
            <Skeleton className="h-4 w-20" />
          </div>
        ))}
      </div>
      <table className="hidden w-full lg:table">
        <tbody>
          {Array.from({ length: rows }).map((_, i) => (
            <tr key={i} className="border-b border-slate-100 last:border-0">
              {Array.from({ length: cols }).map((_, j) => (
                <td key={j} className="px-4 py-3.5 xl:px-6">
                  <Skeleton className="h-4 w-20" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}
