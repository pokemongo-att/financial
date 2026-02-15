import { getGoalDetail } from "@/actions/goals";
import { notFound } from "next/navigation";
import Link from "next/link";
import { formatTHB } from "@/lib/money";
import { Card, CardTitle, CardValue } from "@/components/ui/card";
import { PageHeader } from "@/components/PageHeader";
import { Badge } from "@/components/ui/badge";
import { GoalTransactionsList } from "./GoalTransactionsList";
import { ArrowLeft } from "lucide-react";

export default async function GoalDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const goal = await getGoalDetail(id);
  if (!goal) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/goals" className="text-slate-400 hover:text-slate-600 transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <PageHeader title={goal.name} subtitle="รายละเอียดเป้าหมายการออม" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-5">
          <CardTitle>ยอดตั้งต้น</CardTitle>
          <CardValue>{formatTHB(goal.balance.openingBalance)}</CardValue>
        </Card>
        <Card className="p-5">
          <CardTitle>ฝากเข้ารวม</CardTitle>
          <CardValue className="text-emerald-600">{formatTHB(goal.balance.totalDeposits)}</CardValue>
        </Card>
        <Card className="p-5">
          <CardTitle>ถอนออกรวม</CardTitle>
          <CardValue className="text-red-600">{formatTHB(goal.balance.totalWithdrawals)}</CardValue>
        </Card>
        <Card className="p-5">
          <CardTitle>ยอดคงเหลือ</CardTitle>
          <CardValue className="text-indigo-600">{formatTHB(goal.balance.currentBalance)}</CardValue>
        </Card>
      </div>

      <GoalTransactionsList goalId={id} transactions={goal.transactions} />
    </div>
  );
}
