import { Skeleton, SkeletonPageHeader } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export default function GoalsLoading() {
  return (
    <div className="space-y-5 sm:space-y-6">
      <SkeletonPageHeader action={false} />
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-10 w-24 sm:w-48" />
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="space-y-3 p-4 sm:p-5">
            <div className="flex items-center gap-2.5">
              <Skeleton className="h-9 w-9 rounded-xl" />
              <Skeleton className="h-4 w-28" />
            </div>
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-7 w-36" />
            <div className="grid grid-cols-3 gap-2">
              <Skeleton className="h-11" />
              <Skeleton className="h-11" />
              <Skeleton className="h-11" />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
