import { Skeleton, SkeletonPageHeader, SkeletonStats } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export default function DashboardLoading() {
  return (
    <div className="space-y-5 sm:space-y-6">
      <SkeletonPageHeader />
      <SkeletonStats />

      <Card className="overflow-hidden">
        <div className="border-b border-slate-100 px-4 py-4 sm:px-6">
          <Skeleton className="h-4 w-28" />
        </div>
        <div className="divide-y divide-slate-100">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-3.5 sm:px-6">
              <Skeleton className="h-6 w-6 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-2/5" />
                <Skeleton className="h-3 w-1/5" />
              </div>
              <Skeleton className="h-4 w-20" />
            </div>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-5 sm:gap-6 lg:grid-cols-3">
        <Card className="p-4 sm:p-6 lg:col-span-2">
          <Skeleton className="mb-4 h-4 w-32" />
          <Skeleton className="h-56 w-full sm:h-64" />
        </Card>
        <Card className="space-y-4 p-4 sm:p-6">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-2 w-full rounded-full" />
          <div className="grid grid-cols-3 gap-2 lg:grid-cols-1">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-14 lg:h-5" />
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
