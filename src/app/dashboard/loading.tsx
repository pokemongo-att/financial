import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export default function DashboardLoading() {
  return (
    <div className="space-y-5 sm:space-y-6" role="status" aria-label="กำลังโหลดภาพรวมการเงิน">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-12 w-full rounded-xl sm:w-56" />
      </div>
      <Card className="divide-y divide-slate-100">
        <div className="flex flex-wrap items-center justify-between gap-4 px-4 py-5 sm:px-6">
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-9 w-44" />
          </div>
          <Skeleton className="h-11 w-full sm:w-44" />
        </div>
        <div className="grid grid-cols-2 divide-x divide-slate-100">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="space-y-2 px-4 py-3 sm:px-6">
              <Skeleton className="h-4 w-14" />
              <Skeleton className="h-5 w-24 max-w-full" />
            </div>
          ))}
        </div>
      </Card>

      <div className="grid items-start gap-5 sm:gap-6 lg:grid-cols-12">
        <Card className="lg:col-span-7">
          <div className="space-y-3 border-b border-slate-100 px-4 py-4 sm:px-6">
            <Skeleton className="h-5 w-28" />
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-2 w-full rounded-full" />
          </div>
          <div className="divide-y divide-slate-100">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3 sm:px-6">
                <Skeleton className="size-6 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/5" />
                  <Skeleton className="h-3 w-1/4" />
                </div>
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </div>
        </Card>
        <Card className="space-y-4 p-4 sm:p-6 lg:col-span-5">
          <Skeleton className="h-5 w-28" />
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-3.5 w-20" />
              <Skeleton className="h-1.5 w-full rounded-full" />
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}
