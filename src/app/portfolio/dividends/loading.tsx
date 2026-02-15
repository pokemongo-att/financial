import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export default function DividendsLoading() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-8 w-52" />
        <Skeleton className="h-4 w-64 mt-2" />
      </div>
      <div className="flex gap-1.5">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-20 rounded-lg" />
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="p-5 space-y-2">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-7 w-32" />
          </Card>
        ))}
      </div>
      <Card className="overflow-x-auto">
        <div className="px-6 py-4 border-b border-slate-100">
          <Skeleton className="h-4 w-28" />
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100">
              {Array.from({ length: 7 }).map((_, i) => (
                <th key={i} className="px-6 py-3">
                  <Skeleton className="h-3 w-16" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 4 }).map((_, i) => (
              <tr key={i} className="border-b border-slate-50">
                {Array.from({ length: 7 }).map((_, j) => (
                  <td key={j} className="px-6 py-3">
                    <Skeleton className="h-4 w-20" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
