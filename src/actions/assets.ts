"use server";

import { db } from "@/db";
import { assetAccounts, assetTransactions } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { createAssetAccountSchema, createAssetTransactionSchema, updateAssetAccountSchema } from "@/lib/validators/assets";
import { calculateHoldings, calculateBankBalance } from "@/lib/calc/portfolio";

export async function getAssetAccounts(userId: string, type?: "STOCK" | "FUND" | "CRYPTO" | "BANK") {
  const conditions = [eq(assetAccounts.userId, userId)];
  if (type) conditions.push(eq(assetAccounts.type, type));

  const accounts = await db
    .select()
    .from(assetAccounts)
    .where(and(...conditions));

  const results = await Promise.all(
    accounts.map(async (account) => {
      const txs = await db
        .select()
        .from(assetTransactions)
        .where(eq(assetTransactions.assetAccountId, account.id))
        .orderBy(assetTransactions.date);

      if (account.type === "BANK") {
        const bankBalance = calculateBankBalance(txs);
        return { ...account, bankBalance, transactions: txs };
      }

      const holdings = calculateHoldings(txs);
      return { ...account, holdings, transactions: txs };
    })
  );

  return results;
}

export async function getAssetDetail(assetId: string) {
  const [account] = await db
    .select()
    .from(assetAccounts)
    .where(eq(assetAccounts.id, assetId));

  if (!account) return null;

  const txs = await db
    .select()
    .from(assetTransactions)
    .where(eq(assetTransactions.assetAccountId, assetId))
    .orderBy(assetTransactions.date);

  if (account.type === "BANK") {
    const bankBalance = calculateBankBalance(txs);
    return { ...account, bankBalance, transactions: txs };
  }

  const holdings = calculateHoldings(txs);
  return { ...account, holdings, transactions: txs };
}

export async function createAssetAccount(
  userId: string,
  data: { type: "STOCK" | "FUND" | "CRYPTO" | "BANK"; symbol: string; name?: string }
) {
  const parsed = createAssetAccountSchema.parse(data);
  const [created] = await db
    .insert(assetAccounts)
    .values({ ...parsed, userId })
    .returning();
  return created;
}

export async function updateAssetAccount(
  assetId: string,
  data: { symbol?: string; name?: string }
) {
  const parsed = updateAssetAccountSchema.parse(data);
  const [updated] = await db
    .update(assetAccounts)
    .set({ ...parsed, updatedAt: new Date() })
    .where(eq(assetAccounts.id, assetId))
    .returning();
  return updated;
}

export async function createAssetTransaction(
  data: {
    assetAccountId: string;
    type: "BUY" | "SELL" | "DIVIDEND" | "FEE" | "DEPOSIT" | "WITHDRAW" | "OPENING";
    quantity?: number | null;
    pricePerUnitCents?: number | null;
    amountCents: number;
    date: string;
    note?: string;
  }
) {
  const parsed = createAssetTransactionSchema.parse(data);
  const [created] = await db
    .insert(assetTransactions)
    .values(parsed)
    .returning();
  return created;
}

export async function deleteAssetTransaction(txId: string) {
  await db.delete(assetTransactions).where(eq(assetTransactions.id, txId));
}
