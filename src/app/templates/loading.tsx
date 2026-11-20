import { Skeleton, SkeletonPageHeader } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export default function TemplatesLoading() {
  return (
    <div className="space-y-5 sm:space-y-6">
      <SkeletonPageHeader action={false} />
      <div className="flex justify-end">
        <Skeleton className="h-10 w-44" />
      </div>
      <Card className="divide-y divide-slate-100 overflow-hidden">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between px-4 py-4">
            <div className="flex items-center gap-3">
              <Skeleton className="h-9 w-9 rounded-xl" />
              <Skeleton className="h-4 w-40" />
            </div>
            <Skeleton className="h-4 w-4" />
          </div>
        ))}
      </Card>
    </div>
  );
}
