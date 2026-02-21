import { getDemoUserId } from "@/lib/demo-user";
import { getHomeLoans } from "@/actions/home-loan";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatTHB } from "@/lib/money";
import Link from "next/link";
import { Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function HomeLoansPage() {
  const userId = await getDemoUserId();
  const loans = await getHomeLoans(userId);

  return (
    <div className="space-y-6">
      <PageHeader 
        title="พอร์ตสินเชื่อบ้าน" 
        subtitle="ติดตามยอดหนี้และการชำระเงิน"
      />

      {loans.length === 0 ? (
        <Card className="flex flex-col items-center justify-center p-12 text-center">
          <Home className="w-12 h-12 text-slate-300 mb-4" />
          <h3 className="text-lg font-medium text-slate-900">ยังไม่มีข้อมูลสินเชื่อบ้าน</h3>
          <p className="text-sm text-slate-500 max-w-sm mt-1">
            เพิ่มข้อมูลสินเชื่อบ้านเพื่อติดตามยอดหนี้ การชำระเงินต้น และดอกเบี้ย
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {loans.map((loan) => (
            <Link key={loan.id} href={`/home-loan/${loan.slug}`}>
              <Card className="hover:border-indigo-200 transition-colors cursor-pointer h-full">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Home className="w-5 h-5 text-indigo-500" />
                    {loan.name}
                  </CardTitle>
                  <CardDescription>คลิกเพื่อดูรายละเอียดการชำระเงิน</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1">
                    <p className="text-sm text-slate-500">ยอดเงินต้นเริ่มต้น</p>
                    <p className="text-2xl font-bold text-slate-900">
                      {formatTHB(loan.principalBalanceCents)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
