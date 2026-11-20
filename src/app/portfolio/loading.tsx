import { Skeleton, SkeletonPageHeader } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export default function PortfolioLoading() {
  return (
    <div className="space-y-5 sm:space-y-6">
      <SkeletonPageHeader action={false} />
      <Card className="space-y-4 p-4 sm:p-5">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-2 gap-2 border-t border-slate-100 pt-4 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-11" />
          ))}
        </div>
      </Card>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-1.5">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-20 rounded-full" />
          ))}
        </div>
        <Skeleton className="h-10 w-full sm:w-36" />
      </div>
      <Card className="divide-y divide-slate-100 overflow-hidden">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between gap-3 px-4 py-3.5 sm:px-6">
            <div className="space-y-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-3 w-44" />
            </div>
            <Skeleton className="h-4 w-24" />
          </div>
        ))}
      </Card>
    </div>
  );
}
