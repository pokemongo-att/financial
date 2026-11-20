import { ChevronDown } from "lucide-react";
import { getDemoUserId } from "@/lib/demo-user";
import { getMonthlyPlan } from "@/actions/monthly";
import { getTemplates } from "@/actions/templates";
import { calculateMonthlySummary } from "@/lib/calc/monthly";
import { formatTHB } from "@/lib/money";
import { PageHeader } from "@/components/PageHeader";
import { MonthPicker } from "@/components/MonthPicker";
import { ChecklistProgress } from "@/components/SummaryStats";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { MonthlyItemsTable } from "./MonthlyItemsTable";
import { CreatePlanForm } from "./CreatePlanForm";
import { MonthMaintenanceActions } from "./MonthMaintenanceActions";

export default async function MonthPage({
  params,
  searchParams,
}: {
  params: Promise<{ ym: string }>;
  searchParams: Promise<{ status?: string }>;
}) {
  const [{ ym }, { status }] = await Promise.all([params, searchParams]);
  const userId = await getDemoUserId();
  const plan = await getMonthlyPlan(userId, ym);
  const templates = plan ? [] : await getTemplates(userId);

  const summary = plan
    ? calculateMonthlySummary(plan.items, plan.startingBalanceCents)
    : null;
  const pendingOnly = status === "pending";

  return (
    <div className="space-y-5 sm:space-y-6">
      <PageHeader title="แผนรายเดือน">
        <MonthPicker currentMonth={ym} className="flex-1 sm:flex-none" />
        <MonthMaintenanceActions userId={userId} />
      </PageHeader>

      {!plan || !summary ? (
        <CreatePlanForm month={ym} templates={templates} userId={userId} />
      ) : (
        <>
          <Card>
            <ChecklistProgress
              className="px-4 py-4 sm:px-6"
              done={summary.totalDone}
              skipped={summary.totalSkipped}
              total={plan.items.length}
            />
            <details className="group border-t border-slate-200">
              <summary className="flex min-h-12 cursor-pointer list-none items-center gap-3 rounded-b-2xl px-4 py-2.5 text-sm hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-indigo-500 sm:px-6 [&::-webkit-details-marker]:hidden">
                <span className="min-w-0 flex-1 font-medium text-slate-700">สรุปยอดเดือนนี้</span>
                <span className={cn("wrap-anywhere text-right font-semibold tabular-nums", summary.netCashflow < 0 && "text-red-700")}>
                  {formatTHB(summary.netCashflow)}
                </span>
                <ChevronDown className="size-4 shrink-0 text-slate-600 transition-transform group-open:rotate-180" aria-hidden />
              </summary>
              <dl className="grid gap-x-6 divide-y divide-slate-100 border-t border-slate-100 px-4 py-1 text-sm sm:grid-cols-2 sm:divide-y-0 sm:px-6 lg:grid-cols-3">
                {[
                  { label: "เงินคงเหลือตามแผน", cents: summary.netCashflow },
                  { label: "รายรับ", cents: summary.incomeTotal },
                  { label: "รายจ่าย", cents: summary.expenseTotal },
                  { label: "เงินออม", cents: summary.savingsTotal },
                  { label: "เป้าหมาย", cents: summary.goalSavingsTotal },
                  { label: "ครอบครัว", cents: summary.familySupportTotal },
                ].map(({ label, cents }) => (
                  <div key={label} className="flex min-w-0 flex-wrap items-baseline justify-between gap-x-3 gap-y-1 py-2.5">
                    <dt className="text-slate-600">{label}</dt>
                    <dd className="wrap-anywhere font-semibold tabular-nums">{formatTHB(cents)}</dd>
                  </div>
                ))}
              </dl>
            </details>
          </Card>

          <MonthlyItemsTable key={`${ym}:${pendingOnly}`} items={plan.items} pendingOnly={pendingOnly} />
        </>
      )}
    </div>
  );
}
