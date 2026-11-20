import Link from "next/link";
import { ArrowRight, CalendarPlus, CheckCircle2 } from "lucide-react";
import { getDemoUserId } from "@/lib/demo-user";
import { getMonthlyPlan, getMonthlyPlans } from "@/actions/monthly";
import { calculateMonthlySummary } from "@/lib/calc/monthly";
import { formatTHB } from "@/lib/money";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { PageHeader } from "@/components/PageHeader";
import { EmptyState } from "@/components/EmptyState";
import { MonthPicker, formatThaiMonth } from "@/components/MonthPicker";
import { ChecklistProgress } from "@/components/SummaryStats";
import { DashboardChart } from "./DashboardChart";
import { PendingItemsList } from "./PendingItemsList";

const PENDING_LIMIT = 5;

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
  const planHref = `/month/${currentMonth}`;

  const [plan, allPlans] = await Promise.all([
    getMonthlyPlan(userId, currentMonth),
    getMonthlyPlans(userId),
  ]);
  const summary = plan ? calculateMonthlySummary(plan.items, plan.startingBalanceCents) : null;
  const pendingItems = plan?.items.filter((item) => item.status === "PLANNED") ?? [];

  return (
    <div className="space-y-5 sm:space-y-6">
      <PageHeader title="ภาพรวมการเงิน">
        <MonthPicker currentMonth={currentMonth} basePath="/dashboard" mode="query" />
      </PageHeader>

      {!plan || !summary ? (
        <Card>
          <EmptyState
            icon={<CalendarPlus className="size-9" />}
            title="เดือนนี้ยังไม่มีแผน"
            description="ใช้แม่แบบรายเดือนเพื่อเตรียมรายการรายรับ รายจ่าย และเงินออม"
            action={
              <Link href={planHref} className={buttonVariants({ size: "lg" })}>
                สร้างแผนรายเดือน
              </Link>
            }
          />
        </Card>
      ) : (
        <>
          <Card className="overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-4 px-4 py-5 sm:px-6">
              <div className="min-w-0">
                <h2 className="text-sm font-medium text-slate-600">เงินคงเหลือตามแผน</h2>
                <p className={cn(
                  "mt-1 wrap-anywhere text-[2rem] leading-tight font-semibold tracking-tight tabular-nums sm:text-4xl",
                  summary.netCashflow < 0 ? "text-red-700" : "text-slate-950"
                )}>
                  {formatTHB(summary.netCashflow)}
                </p>
              </div>
              <Link href={planHref} className={cn(buttonVariants({ size: "lg" }), "w-full justify-between px-4 sm:w-auto sm:justify-center")}>
                เปิดแผนรายเดือน
                <ArrowRight className="size-4" aria-hidden />
              </Link>
            </div>
            <dl className="grid grid-cols-2 divide-x divide-slate-200 border-t border-slate-200 bg-slate-50/80">
              <CashflowStat label="รายรับ" cents={summary.incomeTotal} />
              <CashflowStat label="รายจ่าย" cents={summary.expenseTotal} />
            </dl>
          </Card>

          <div className="grid items-start gap-5 sm:gap-6 lg:grid-cols-12">
            <Card className="min-w-0 lg:col-span-7">
              <div className="border-b border-slate-100 px-4 pt-2.5 pb-4 sm:px-6">
                <div className="flex flex-wrap items-center justify-between gap-x-3">
                  <h2 className="py-1 text-base font-semibold text-slate-900">
                    รายการค้าง <span className="ml-1 text-sm font-medium text-slate-600 tabular-nums">{pendingItems.length} รายการ</span>
                  </h2>
                  {pendingItems.length > 0 && (
                    <Link
                      href={`${planHref}?status=pending`}
                      className="-mr-1 inline-flex min-h-11 items-center gap-1.5 rounded-lg px-1 text-sm font-semibold text-indigo-700 hover:bg-indigo-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                    >
                      ดูรายการค้าง
                      <ArrowRight className="size-4" aria-hidden />
                    </Link>
                  )}
                </div>
                <ChecklistProgress
                  className="mt-1"
                  done={summary.totalDone}
                  skipped={summary.totalSkipped}
                  total={plan.items.length}
                />
              </div>
              {pendingItems.length === 0 ? (
                <EmptyState
                  icon={<CheckCircle2 className="size-8 text-emerald-600" />}
                  title="ไม่มีรายการค้าง"
                  description={plan.items.length ? "ทุกรายการของเดือนนี้จัดการแล้ว" : "เดือนนี้ยังไม่มีรายการในแผน"}
                />
              ) : (
                <PendingItemsList
                  items={pendingItems.slice(0, PENDING_LIMIT).map((item) => ({
                    id: item.id,
                    name: item.name,
                    category: item.category,
                    status: item.status,
                    amountCents: item.actualAmountCents ?? item.plannedAmountCents,
                  }))}
                />
              )}
            </Card>

            <Card className="min-w-0 p-4 sm:p-6 lg:col-span-5">
              <h2 className="mb-4 text-base font-semibold text-slate-900">ยอดตามหมวด</h2>
              <DashboardChart amounts={{
                INCOME: summary.incomeTotal,
                EXPENSE: summary.expenseTotal,
                SAVING: summary.savingsTotal,
                GOAL: summary.goalSavingsTotal,
                FAMILY: summary.familySupportTotal,
              }} />
              {summary.endingBalance != null && (
                <dl className="mt-5 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-t border-slate-100 pt-4">
                  <dt className="text-sm text-slate-600">ยอดคงเหลือปลายเดือน</dt>
                  <dd className="wrap-anywhere text-base font-semibold tabular-nums">{formatTHB(summary.endingBalance)}</dd>
                </dl>
              )}
            </Card>
          </div>
        </>
      )}

      {allPlans.length > 0 && (
        <Card className="p-4 sm:p-6">
          <h2 className="mb-3 text-base font-semibold text-slate-900">แผนรายเดือนทั้งหมด</h2>
          <div className="flex flex-wrap gap-2">
            {allPlans.map((p) => (
              <Link
                key={p.id}
                href={`/month/${p.month}`}
                aria-current={p.month === currentMonth ? "date" : undefined}
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "min-h-11 tabular-nums",
                  p.month === currentMonth && "border-indigo-200 bg-indigo-50 text-indigo-800 hover:bg-indigo-100"
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

function CashflowStat({ label, cents }: { label: string; cents: number }) {
  return (
    <div className="min-w-0 px-4 py-3 sm:px-6">
      <dt className="text-sm text-slate-600">{label}</dt>
      <dd className="mt-0.5 wrap-anywhere text-base font-semibold tabular-nums sm:text-lg">{formatTHB(cents)}</dd>
    </div>
  );
}
