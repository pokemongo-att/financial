import { getDemoUserId } from "@/lib/demo-user";
import { getHomeLoanBySlug } from "@/actions/home-loan";
import { getHomeLoanTransactions } from "@/actions/home-loan-tx";
import { PageHeader } from "@/components/PageHeader";
import { HomeLoanDetails } from "../HomeLoanDetails";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function HomeLoanDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const userId = await getDemoUserId();

  const loan = await getHomeLoanBySlug(userId, slug);
  if (!loan) {
    notFound();
  }

  const transactions = await getHomeLoanTransactions(userId, slug);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-2">
        <Link href="/home-loan">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-slate-900">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <PageHeader 
          title={loan.name} 
          subtitle="รายละเอียดการชำระเงินและดอกเบี้ย"
        />
      </div>

      <HomeLoanDetails loan={loan} transactions={transactions} />
    </div>
  );
}
