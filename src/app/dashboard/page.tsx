import Link from "next/link";
import { ArrowRight, CalendarPlus, CheckCircle2, Clock, SkipForward } from "lucide-react";
import { getDemoUserId } from "@/lib/demo-user";
import { getMonthlyPlan, getMonthlyPlans } from "@/actions/monthly";
import { calculateMonthlySummary } from "@/lib/calc/monthly";
import { formatTHB, fromCents } from "@/lib/money";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { PageHeader } from "@/components/PageHeader";
import { EmptyState } from "@/components/EmptyState";
import { MonthPicker, formatThaiMonth } from "@/components/MonthPicker";
import { SummaryStats, ChecklistProgress } from "@/components/SummaryStats";
import { DashboardChart } from "./DashboardChart";
import { PendingItemsList } from "./PendingItemsList";

const PENDING_LIMIT = 8;

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

  const [plan, allPlans] = await Promise.all([
    getMonthlyPlan(userId, currentMonth),
    getMonthlyPlans(userId),
  ]);

  const summary = plan
    ? calculateMonthlySummary(plan.items, plan.startingBalanceCents)
    : null;

  const pendingItems = plan
    ? plan.items.filter((i) => i.status === "PLANNED")
    : [];

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
    <div className="space-y-5 sm:space-y-6">
      <PageHeader title="Dashboard" subtitle="ภาพรวมการเงินรายเดือน">
        <MonthPicker currentMonth={currentMonth} basePath="/dashboard" mode="query" />
      </PageHeader>

      {!plan || !summary ? (
        <Card>
          <EmptyState
            icon={<CalendarPlus className="h-10 w-10" />}
            title={`ยังไม่มีแผนสำหรับ${formatThaiMonth(currentMonth)}`}
            description="สร้างแผนรายเดือนจาก template เพื่อเริ่มติดตามการเงิน"
            action={
              <Link href={`/month/${currentMonth}`} className={buttonVariants()}>
                สร้างแผนเดือนนี้
              </Link>
            }
          />
        </Card>
      ) : (
        <div className="flex flex-col gap-5 sm:gap-6">
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

          {/* Pending items come before the chart on phones: they are what you act on. */}
          <Card className="order-2 overflow-hidden lg:order-3">
            <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3 sm:px-6 sm:py-4">
              <h2 className="text-sm font-semibold text-slate-900">
                รายการค้าง
                <span className="ml-1.5 font-normal tabular-nums text-slate-400">{pendingItems.length}</span>
              </h2>
              <Link
                href={`/month/${currentMonth}`}
                className="-mr-2 inline-flex h-9 items-center gap-1 rounded-lg px-2 text-sm font-medium text-indigo-600 hover:bg-indigo-50 pointer-coarse:h-11"
              >
                ดูทั้งหมด
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            {pendingItems.length === 0 ? (
              <EmptyState
                icon={<CheckCircle2 className="h-8 w-8 text-emerald-400" />}
                title="ไม่มีรายการค้าง"
                description="ทุกรายการของเดือนนี้ดำเนินการแล้ว"
              />
            ) : (
              <>
                <PendingItemsList
                  items={pendingItems.slice(0, PENDING_LIMIT).map((i) => ({
                    id: i.id,
                    name: i.name,
                    category: i.category,
                    status: i.status,
                    amountCents: i.actualAmountCents ?? i.plannedAmountCents,
                  }))}
                />
                {pendingItems.length > PENDING_LIMIT && (
                  <Link
                    href={`/month/${currentMonth}`}
                    className="block border-t border-slate-100 px-4 py-3 text-center text-sm font-medium text-indigo-600 hover:bg-slate-50 sm:px-6"
                  >
                    อีก {pendingItems.length - PENDING_LIMIT} รายการในแผนเดือนนี้
                  </Link>
                )}
              </>
            )}
          </Card>

          <div className="order-3 grid grid-cols-1 gap-5 sm:gap-6 lg:order-2 lg:grid-cols-3">
            <Card className="p-4 sm:p-6 lg:col-span-2">
              <h2 className="mb-4 text-sm font-semibold text-slate-900">สัดส่วนรายรับ–รายจ่าย</h2>
              <DashboardChart data={chartData} />
            </Card>

            <Card className="flex flex-col gap-5 p-4 sm:p-6">
              <h2 className="text-sm font-semibold text-slate-900">สถานะรายการ</h2>
              <ChecklistProgress done={summary.totalDone} skipped={summary.totalSkipped} total={plan.items.length} />
              <dl className="grid grid-cols-3 gap-2 lg:grid-cols-1 lg:gap-3">
                <StatusCount icon={CheckCircle2} iconClass="text-emerald-500" label="เสร็จแล้ว" value={summary.totalDone} />
                <StatusCount icon={Clock} iconClass="text-slate-400" label="รอดำเนินการ" value={summary.totalPlanned} />
                <StatusCount icon={SkipForward} iconClass="text-amber-500" label="ข้าม" value={summary.totalSkipped} />
              </dl>
              {summary.endingBalance != null && (
                <div className="mt-auto border-t border-slate-100 pt-4">
                  <p className="text-xs text-slate-500">ยอดคงเหลือปลายเดือน</p>
                  <p className="mt-1 text-xl font-semibold tabular-nums text-indigo-600">
                    {formatTHB(summary.endingBalance)}
                  </p>
                </div>
              )}
            </Card>
          </div>
        </div>
      )}

      {allPlans.length > 0 && (
        <Card className="p-4 sm:p-6">
          <h2 className="mb-3 text-sm font-semibold text-slate-900">แผนรายเดือนทั้งหมด</h2>
          <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
            {allPlans.map((p) => (
              <Link
                key={p.id}
                href={`/month/${p.month}`}
                aria-current={p.month === currentMonth ? "true" : undefined}
                className={cn(
                  buttonVariants({ variant: p.month === currentMonth ? "default" : "outline", size: "sm" }),
                  "shrink-0 tabular-nums"
                )}
              >
                {formatThaiMonth(p.month)}
              </Link>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

function StatusCount({
  icon: Icon,
  iconClass,
  label,
  value,
}: {
  icon: typeof Clock;
  iconClass: string;
  label: string;
  value: number;
}) {
  return (
    <div className="flex flex-col gap-1 rounded-xl bg-slate-50 px-3 py-2.5 lg:flex-row lg:items-center lg:justify-between lg:bg-transparent lg:p-0">
      <dt className="flex items-center gap-1.5 text-xs text-slate-600 lg:text-sm">
        <Icon className={cn("h-4 w-4 shrink-0", iconClass)} />
        <span className="truncate">{label}</span>
      </dt>
      <dd className="text-lg font-semibold tabular-nums text-slate-900 lg:text-base">{value}</dd>
    </div>
  );
}
