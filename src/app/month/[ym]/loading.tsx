import { Skeleton, SkeletonPageHeader, SkeletonStats, SkeletonTable } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export default function MonthLoading() {
  return (
    <div className="space-y-5 sm:space-y-6">
      <SkeletonPageHeader />
      <SkeletonStats />
      <Card className="px-4 py-3.5 sm:px-5">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="mt-2.5 h-2 w-full rounded-full" />
      </Card>
      <SkeletonTable rows={8} cols={7} />
    </div>
  );
}
