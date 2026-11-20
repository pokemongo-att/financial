import { getGoalDetail } from "@/actions/goals";
import { notFound } from "next/navigation";
import { formatTHB } from "@/lib/money";
import { PageHeader } from "@/components/PageHeader";
import { SummaryStats } from "@/components/SummaryStats";
import { GoalTransactionsList } from "./GoalTransactionsList";

export default async function GoalDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const goal = await getGoalDetail(id);
  if (!goal) notFound();

  return (
    <div className="space-y-5 sm:space-y-6">
      <PageHeader title={goal.name} subtitle="รายละเอียดเป้าหมายการออม" backHref="/goals" backLabel="กลับไปหน้าเป้าหมาย" />

      <SummaryStats
        gridClassName="sm:grid-cols-2 lg:grid-cols-4"
        items={[
          { label: "ยอดตั้งต้น", value: formatTHB(goal.balance.openingBalance) },
          { label: "ฝากเข้ารวม", value: formatTHB(goal.balance.totalDeposits), tone: "positive" },
          { label: "ถอนออกรวม", value: formatTHB(goal.balance.totalWithdrawals), tone: "negative" },
        ]}
        highlight={{ label: "ยอดคงเหลือ", value: formatTHB(goal.balance.currentBalance), tone: "primary" }}
      />

      <GoalTransactionsList goalId={id} transactions={goal.transactions} />
    </div>
  );
}
