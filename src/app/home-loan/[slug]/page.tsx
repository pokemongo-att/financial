import { getDemoUserId } from "@/lib/demo-user";
import { getHomeLoanBySlug } from "@/actions/home-loan";
import { getHomeLoanTransactions } from "@/actions/home-loan-tx";
import { HomeLoanDetails } from "../HomeLoanDetails";
import { notFound } from "next/navigation";

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

  return <HomeLoanDetails loan={loan} transactions={transactions} />;
}
