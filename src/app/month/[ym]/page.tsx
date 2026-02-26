import { getDemoUserId } from "@/lib/demo-user";
import { getMonthlyPlan } from "@/actions/monthly";
import { getTemplates } from "@/actions/templates";
import { calculateMonthlySummary } from "@/lib/calc/monthly";
import { formatTHB } from "@/lib/money";
import { Card, CardTitle, CardValue } from "@/components/ui/card";
import { PageHeader } from "@/components/PageHeader";
import { MonthPicker } from "@/components/MonthPicker";
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
    <div className="space-y-6">
      <PageHeader title="แผนรายเดือน" subtitle={`เดือน ${ym}`}>
        <MonthMaintenanceActions userId={userId} />
        <MonthPicker currentMonth={ym} />
      </PageHeader>

      {!plan ? (
        <CreatePlanForm month={ym} templates={templates} userId={userId} />
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <Card className="p-5">
              <CardTitle>รายรับ</CardTitle>
              <CardValue className="text-emerald-600">{formatTHB(summary!.incomeTotal)}</CardValue>
            </Card>
            <Card className="p-5">
              <CardTitle>รายจ่าย</CardTitle>
              <CardValue className="text-red-600">{formatTHB(summary!.expenseTotal)}</CardValue>
            </Card>
            <Card className="p-5">
              <CardTitle>เงินออม</CardTitle>
              <CardValue className="text-indigo-600">{formatTHB(summary!.savingsTotal)}</CardValue>
            </Card>
            <Card className="p-5">
              <CardTitle>เป้าหมาย</CardTitle>
              <CardValue className="text-purple-600">{formatTHB(summary!.goalSavingsTotal)}</CardValue>
            </Card>
            <Card className="p-5">
              <CardTitle>ครอบครัว</CardTitle>
              <CardValue className="text-orange-600">{formatTHB(summary!.familySupportTotal)}</CardValue>
            </Card>
            <Card className="p-5">
              <CardTitle>คงเหลือ</CardTitle>
              <CardValue className={summary!.netCashflow >= 0 ? "text-emerald-600" : "text-red-600"}>
                {formatTHB(summary!.netCashflow)}
              </CardValue>
            </Card>
          </div>
          <MonthlyItemsTable items={plan.items} />
        </>
      )}
    </div>
  );
}
