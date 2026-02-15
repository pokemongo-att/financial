import { getDemoUserId } from "@/lib/demo-user";
import { getMonthlyPlan, getMonthlyPlans } from "@/actions/monthly";
import { calculateMonthlySummary } from "@/lib/calc/monthly";
import { formatTHB } from "@/lib/money";
import { fromCents } from "@/lib/money";
import Link from "next/link";
import { Card, CardTitle, CardValue } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/PageHeader";
import { EmptyState } from "@/components/EmptyState";
import { DashboardMonthPicker } from "./DashboardMonthPicker";
import { DashboardChart } from "./DashboardChart";
import { CalendarPlus, CheckCircle2, Clock, SkipForward } from "lucide-react";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const params = await searchParams;
  const userId = await getDemoUserId();
  const now = new Date();
  const currentMonth =
    params.month ??
    `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  const plan = await getMonthlyPlan(userId, currentMonth);
  const allPlans = await getMonthlyPlans(userId);

  const summary = plan
    ? calculateMonthlySummary(plan.items, plan.startingBalanceCents)
    : null;

  const pendingItems = plan
    ? plan.items.filter((i) => i.status === "PLANNED")
    : [];

  const CATEGORY_LABELS: Record<string, string> = {
    INCOME: "รายรับ",
    EXPENSE: "รายจ่าย",
    SAVING: "เงินออม",
    GOAL: "เป้าหมาย",
    FAMILY: "ครอบครัว",
  };

  const chartData = summary
    ? [
        { name: "รายรับ", value: parseFloat(fromCents(summary.incomeTotal)), fill: "#10b981" },
        { name: "รายจ่าย", value: parseFloat(fromCents(summary.expenseTotal)), fill: "#ef4444" },
        { name: "ออม", value: parseFloat(fromCents(summary.savingsTotal)), fill: "#6366f1" },
        { name: "เป้าหมาย", value: parseFloat(fromCents(summary.goalSavingsTotal)), fill: "#a855f7" },
        { name: "ครอบครัว", value: parseFloat(fromCents(summary.familySupportTotal)), fill: "#f97316" },
      ]
    : [];

  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" subtitle="ภาพรวมการเงินรายเดือน">
        <DashboardMonthPicker currentMonth={currentMonth} />
      </PageHeader>

      {!plan ? (
        <Card>
          <EmptyState
            icon={<CalendarPlus className="w-10 h-10" />}
            title={`ยังไม่มีแผนสำหรับเดือน ${currentMonth}`}
            description="สร้างแผนรายเดือนจาก template เพื่อเริ่มติดตามการเงิน"
            action={
              <Link href={`/month/${currentMonth}`}>
                <Button>สร้างแผนเดือนนี้</Button>
              </Link>
            }
          />
        </Card>
      ) : (
        <>
          {/* Summary Cards Grid */}
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

          {/* Chart + Status Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="lg:col-span-2 p-6">
              <h2 className="text-sm font-medium text-slate-500 mb-4">สัดส่วนรายจ่าย</h2>
              <DashboardChart data={chartData} />
            </Card>

            <Card className="p-6 space-y-5">
              <h2 className="text-sm font-medium text-slate-500">สถานะรายการ</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    เสร็จแล้ว
                  </div>
                  <span className="font-semibold tabular-nums text-slate-900">{summary!.totalDone}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Clock className="w-4 h-4 text-slate-400" />
                    รอดำเนินการ
                  </div>
                  <span className="font-semibold tabular-nums text-slate-900">{summary!.totalPlanned}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <SkipForward className="w-4 h-4 text-amber-400" />
                    ข้าม
                  </div>
                  <span className="font-semibold tabular-nums text-slate-900">{summary!.totalSkipped}</span>
                </div>
              </div>
              {summary!.endingBalance != null && (
                <div className="pt-4 border-t border-slate-100">
                  <p className="text-xs text-slate-400">ยอดคงเหลือปลายเดือน</p>
                  <p className="text-xl font-semibold tabular-nums text-indigo-600 mt-1">
                    {formatTHB(summary!.endingBalance)}
                  </p>
                </div>
              )}
            </Card>
          </div>

          {/* Pending Items */}
          <Card>
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-sm font-medium text-slate-900">
                รายการค้าง
                <span className="ml-2 text-slate-400">({pendingItems.length})</span>
              </h2>
              <Link href={`/month/${currentMonth}`} className="text-xs text-indigo-600 hover:underline">
                ดูทั้งหมด →
              </Link>
            </div>
            {pendingItems.length === 0 ? (
              <div className="px-6 py-8 text-center text-sm text-slate-400">
                ไม่มีรายการค้าง
              </div>
            ) : (
              <div className="divide-y divide-slate-50">
                {pendingItems.slice(0, 8).map((item) => (
                  <div key={item.id} className="flex items-center justify-between px-6 py-3">
                    <div className="flex items-center gap-2.5">
                      <Badge variant={
                        item.category === "INCOME" ? "success" :
                        item.category === "EXPENSE" ? "destructive" :
                        item.category === "SAVING" ? "info" :
                        item.category === "GOAL" ? "purple" : "orange"
                      }>
                        {CATEGORY_LABELS[item.category]}
                      </Badge>
                      <span className="text-sm text-slate-700">{item.name}</span>
                    </div>
                    <span className="text-sm font-medium tabular-nums text-slate-900">
                      {formatTHB(item.actualAmountCents ?? item.plannedAmountCents)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </>
      )}

      {/* All plans */}
      {allPlans.length > 0 && (
        <Card className="p-6">
          <h2 className="text-sm font-medium text-slate-500 mb-3">แผนรายเดือนทั้งหมด</h2>
          <div className="flex flex-wrap gap-2">
            {allPlans.map((p) => (
              <Link key={p.id} href={`/month/${p.month}`}>
                <Button
                  variant={p.month === currentMonth ? "default" : "outline"}
                  size="sm"
                >
                  {p.month}
                </Button>
              </Link>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
