import { getDemoUserId } from "@/lib/demo-user";
import { db } from "@/db";
import { assetAccounts, assetTransactions } from "@/db/schema";
import { eq, and, gte, lte } from "drizzle-orm";
import { calculateDividendSummary } from "@/lib/calc/dividends";
import { PageHeader } from "@/components/PageHeader";
import { DividendDashboardClient } from "./DividendDashboardClient";

async function getDividendData(userId: string, start?: string, end?: string) {
  const accounts = await db
    .select()
    .from(assetAccounts)
    .where(eq(assetAccounts.userId, userId));

  const accountIds = accounts.map((a) => a.id);
  if (accountIds.length === 0) return calculateDividendSummary([]);

  const allDividends: {
    assetAccountId: string;
    symbol: string;
    name: string | null;
    assetType: "STOCK" | "FUND" | "CRYPTO" | "BANK";
    amountCents: number;
    date: string;
  }[] = [];

  for (const account of accounts) {
    const conditions = [
      eq(assetTransactions.assetAccountId, account.id),
      eq(assetTransactions.type, "DIVIDEND"),
    ];
    if (start) conditions.push(gte(assetTransactions.date, start));
    if (end) conditions.push(lte(assetTransactions.date, end));

    const txs = await db
      .select()
      .from(assetTransactions)
      .where(and(...conditions));

    for (const tx of txs) {
      allDividends.push({
        assetAccountId: account.id,
        symbol: account.symbol,
        name: account.name,
        assetType: account.type,
        amountCents: tx.amountCents,
        date: tx.date,
      });
    }
  }

  return calculateDividendSummary(allDividends);
}

export default async function DividendDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ start?: string; end?: string; range?: string }>;
}) {
  const params = await searchParams;
  const userId = await getDemoUserId();

  let start: string | undefined;
  let end: string | undefined;

  const now = new Date();
  const range = params.range ?? "all";

  if (range === "month") {
    start = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
    end = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-31`;
  } else if (range === "year") {
    start = `${now.getFullYear()}-01-01`;
    end = `${now.getFullYear()}-12-31`;
  } else if (range === "custom") {
    start = params.start;
    end = params.end;
  }

  const summary = await getDividendData(userId, start, end);

  return (
    <div className="space-y-6">
      <PageHeader title="Dividend Dashboard" subtitle="สรุปปันผลจากหุ้นและกองทุน" />
      <DividendDashboardClient summary={summary} currentRange={range} />
    </div>
  );
}
