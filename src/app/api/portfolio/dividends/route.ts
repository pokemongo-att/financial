import { NextRequest, NextResponse } from "next/server";
import { getDemoUserId } from "@/lib/demo-user";
import { db } from "@/db";
import { assetAccounts, assetTransactions } from "@/db/schema";
import { eq, and, gte, lte } from "drizzle-orm";
import { calculateDividendSummary } from "@/lib/calc/dividends";

export async function GET(request: NextRequest) {
  try {
    const userId = await getDemoUserId();
    const { searchParams } = new URL(request.url);
    const start = searchParams.get("start") ?? undefined;
    const end = searchParams.get("end") ?? undefined;

    const accounts = await db
      .select()
      .from(assetAccounts)
      .where(eq(assetAccounts.userId, userId));

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

    const summary = calculateDividendSummary(allDividends);
    return NextResponse.json(summary);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch dividend data" },
      { status: 500 }
    );
  }
}
