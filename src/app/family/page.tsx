import { getDemoUserId } from "@/lib/demo-user";
import { getFamilyMembers } from "@/actions/family";
import { PageHeader } from "@/components/PageHeader";
import { FamilyList } from "./FamilyList";

export default async function FamilyPage() {
  const userId = await getDemoUserId();
  const members = await getFamilyMembers(userId);
  return (
    <div className="space-y-6">
      <PageHeader title="เงินดูแลครอบครัว" subtitle="ยอดรวมรายเดือนและรายปี" />
      <FamilyList members={members} userId={userId} />
    </div>
  );
}
