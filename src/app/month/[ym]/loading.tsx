import { Skeleton, SkeletonTable } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export default function MonthLoading() {
  return (
    <div className="space-y-5 sm:space-y-6" role="status" aria-label="กำลังโหลดแผนรายเดือน">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Skeleton className="h-8 w-40" />
        <div className="flex w-full gap-2 sm:w-64">
          <Skeleton className="h-12 flex-1" />
          <Skeleton className="size-12" />
        </div>
      </div>
      <Card className="divide-y divide-slate-100">
        <div className="space-y-2 px-4 py-4 sm:px-6">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-2 w-full rounded-full" />
        </div>
        <div className="flex justify-between gap-3 px-4 py-4 sm:px-6">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-24" />
        </div>
      </Card>
      <SkeletonTable rows={8} cols={7} />
    </div>
  );
}
