import { Skeleton, SkeletonPageHeader, SkeletonStats } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export default function DividendsLoading() {
  return (
    <div className="space-y-5 sm:space-y-6">
      <SkeletonPageHeader action={false} />
      <div className="flex gap-1.5">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-20 rounded-full" />
        ))}
      </div>
      <SkeletonStats count={3} />
      <Card className="overflow-hidden">
        <div className="border-b border-slate-100 px-4 py-4 sm:px-6">
          <Skeleton className="h-4 w-28" />
        </div>
        <div className="divide-y divide-slate-100">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between gap-3 px-4 py-3.5 sm:px-6">
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-40" />
              </div>
              <Skeleton className="h-4 w-20" />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
