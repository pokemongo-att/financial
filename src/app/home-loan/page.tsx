import { getDemoUserId } from "@/lib/demo-user";
import { getHomeLoans } from "@/actions/home-loan";
import { PageHeader } from "@/components/PageHeader";
import { HomeLoanList } from "./HomeLoanList";

export default async function HomeLoansPage() {
  const userId = await getDemoUserId();
  const loans = await getHomeLoans(userId);

  return (
    <div className="space-y-6">
      <PageHeader 
        title="พอร์ตสินเชื่อบ้าน" 
        subtitle="ติดตามยอดหนี้และการชำระเงิน"
      />
      <HomeLoanList loans={loans} userId={userId} />
    </div>
  );
}
