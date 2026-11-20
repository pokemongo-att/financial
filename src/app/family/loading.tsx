import { Skeleton, SkeletonPageHeader } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export default function FamilyLoading() {
  return (
    <div className="space-y-5 sm:space-y-6">
      <SkeletonPageHeader action={false} />
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-44" />
        <Skeleton className="h-10 w-32" />
      </div>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4">
        {Array.from({ length: 2 }).map((_, i) => (
          <Card key={i} className="space-y-3 p-4 sm:p-5">
            <div className="flex items-center gap-2.5">
              <Skeleton className="h-9 w-9 rounded-xl" />
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-12" />
              </div>
            </div>
            <Skeleton className="h-7 w-36" />
            <div className="grid grid-cols-2 gap-2">
              <Skeleton className="h-11" />
              <Skeleton className="h-11" />
            </div>
            <Skeleton className="h-10 w-full" />
          </Card>
        ))}
      </div>
    </div>
  );
}
