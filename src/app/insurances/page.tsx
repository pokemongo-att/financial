import { getDemoUserId } from "@/lib/demo-user";
import { getInsurances } from "@/actions/insurances";
import { formatTHB } from "@/lib/money";
import { PageHeader } from "@/components/PageHeader";
import { SummaryStats } from "@/components/SummaryStats";
import { InsurancesTable } from "./InsurancesTable";

export default async function InsurancesPage() {
  const userId = await getDemoUserId();
  const insurances = await getInsurances(userId);

  const totalCoverage = insurances.reduce((sum, item) => sum + item.coverageAmountCents, 0);
  const totalPremium = insurances.reduce((sum, item) => sum + item.premiumAmountCents, 0);

  return (
    <div className="space-y-5 sm:space-y-6">
      <PageHeader
        title="พอร์ตประกัน"
        subtitle="จัดการข้อมูลกรมธรรม์ประกันชีวิตและประกันภัย"
      />

      <SummaryStats
        items={[
          { label: "จำนวนกรมธรรม์ทั้งหมด", value: `${insurances.length} ฉบับ` },
          { label: "รวมค่าเบี้ยต่อปี", value: formatTHB(totalPremium) },
        ]}
        highlight={{ label: "รวมทุนประกัน/ครบกำหนด", value: formatTHB(totalCoverage), tone: "positive" }}
      />

      <InsurancesTable items={insurances} userId={userId} />
    </div>
  );
}
