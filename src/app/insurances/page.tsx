import { getDemoUserId } from "@/lib/demo-user";
import { getInsurances } from "@/actions/insurances";
import { PageHeader } from "@/components/PageHeader";
import { InsurancesTable } from "./InsurancesTable";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { formatTHB } from "@/lib/money";
import { Shield } from "lucide-react";

export default async function InsurancesPage() {
  const userId = await getDemoUserId();
  const insurances = await getInsurances(userId);

  const totalCoverage = insurances.reduce((sum, item) => sum + item.coverageAmountCents, 0);
  const totalPremium = insurances.reduce((sum, item) => sum + item.premiumAmountCents, 0);

  return (
    <div className="space-y-6">
      <PageHeader 
        title="พอร์ตประกัน" 
        subtitle="จัดการข้อมูลกรมธรรม์ประกันชีวิตและประกันภัย"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-indigo-100 rounded-full">
                <Shield className="h-6 w-6 text-indigo-600" />
              </div>
              <div>
                <CardTitle className="text-sm font-medium text-slate-500 mb-1">จำนวนกรมธรรม์ทั้งหมด</CardTitle>
                <div className="text-2xl font-bold text-slate-900">{insurances.length} ฉบับ</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div>
              <CardTitle className="text-sm font-medium text-slate-500 mb-1">รวมทุนประกัน/ครบกำหนด</CardTitle>
              <div className="text-2xl font-bold text-emerald-600">{formatTHB(totalCoverage)}</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div>
              <CardTitle className="text-sm font-medium text-slate-500 mb-1">รวมค่าเบี้ยต่อปี</CardTitle>
              <div className="text-2xl font-bold text-slate-900">{formatTHB(totalPremium)}</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <InsurancesTable items={insurances} userId={userId} />
    </div>
  );
}
