import { getDemoUserId } from "@/lib/demo-user";
import { getMonthlyPlan } from "@/actions/monthly";
import { getTemplates } from "@/actions/templates";
import { calculateMonthlySummary } from "@/lib/calc/monthly";
import { formatTHB } from "@/lib/money";
import { PageHeader } from "@/components/PageHeader";
import { MonthPicker, formatThaiMonth } from "@/components/MonthPicker";
import { SummaryStats, ChecklistProgress } from "@/components/SummaryStats";
import { MonthlyItemsTable } from "./MonthlyItemsTable";
import { CreatePlanForm } from "./CreatePlanForm";
import { MonthMaintenanceActions } from "./MonthMaintenanceActions";

export default async function MonthPage({
  params,
}: {
  params: Promise<{ ym: string }>;
}) {
  const { ym } = await params;
  const userId = await getDemoUserId();
  const plan = await getMonthlyPlan(userId, ym);
  const templates = await getTemplates(userId);

  const summary = plan
    ? calculateMonthlySummary(plan.items, plan.startingBalanceCents)
    : null;

  return (
    <div className="space-y-5 sm:space-y-6">
      <PageHeader title="แผนรายเดือน" subtitle={formatThaiMonth(ym)}>
        <MonthPicker currentMonth={ym} className="flex-1 sm:flex-none" />
        <MonthMaintenanceActions userId={userId} />
      </PageHeader>

      {!plan || !summary ? (
        <CreatePlanForm month={ym} templates={templates} userId={userId} />
      ) : (
        <>
          <SummaryStats
            items={[
              { label: "รายรับ", value: formatTHB(summary.incomeTotal), tone: "income" },
              { label: "รายจ่าย", value: formatTHB(summary.expenseTotal), tone: "expense" },
              { label: "เงินออม", value: formatTHB(summary.savingsTotal), tone: "saving" },
              { label: "เป้าหมาย", value: formatTHB(summary.goalSavingsTotal), tone: "goal" },
              { label: "ครอบครัว", value: formatTHB(summary.familySupportTotal), tone: "family" },
            ]}
            highlight={{
              label: "คงเหลือ",
              value: formatTHB(summary.netCashflow),
              tone: summary.netCashflow >= 0 ? "positive" : "negative",
            }}
          />

          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3.5 shadow-sm sm:px-5">
            <ChecklistProgress done={summary.totalDone} skipped={summary.totalSkipped} total={plan.items.length} />
          </div>

          <MonthlyItemsTable items={plan.items} />
        </>
      )}
    </div>
  );
}
