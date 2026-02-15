import { getDemoUserId } from "@/lib/demo-user";
import { getGoals } from "@/actions/goals";
import { PageHeader } from "@/components/PageHeader";
import { GoalsList } from "./GoalsList";

export default async function GoalsPage() {
  const userId = await getDemoUserId();
  const goals = await getGoals(userId);
  return (
    <div className="space-y-6">
      <PageHeader title="เป้าหมายการออม" subtitle="ติดตามยอดฝาก/ถอนและยอดคงเหลือ" />
      <GoalsList goals={goals} userId={userId} />
    </div>
  );
}
