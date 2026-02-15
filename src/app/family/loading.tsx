import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export default function FamilyLoading() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-56 mt-2" />
      </div>
      <Card className="p-5 space-y-2">
        <Skeleton className="h-3 w-28" />
        <Skeleton className="h-7 w-36" />
      </Card>
      <div className="flex justify-end">
        <Skeleton className="h-9 w-36" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-32" />
              </div>
              <Skeleton className="h-8 w-28" />
            </div>
            <div className="border-t border-slate-100 pt-2 space-y-1">
              {Array.from({ length: 3 }).map((_, j) => (
                <div key={j} className="flex items-center justify-between py-1">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-3 w-16" />
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
