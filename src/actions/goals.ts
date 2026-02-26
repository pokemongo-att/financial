"use server";

import { db } from "@/db";
import { goalAccounts, goalTransactions } from "@/db/schema";
import { asc, eq } from "drizzle-orm";
import { createGoalSchema, createGoalTransactionSchema, updateGoalSchema } from "@/lib/validators/goals";
import { calculateGoalBalance } from "@/lib/calc/goals";

function toSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function getGoals(userId: string) {
  const goals = await db
    .select()
    .from(goalAccounts)
    .where(eq(goalAccounts.userId, userId))
    .orderBy(asc(goalAccounts.createdAt), asc(goalAccounts.id));

  // Calculate balance for each goal
  const results = await Promise.all(
    goals.map(async (goal) => {
      const txs = await db
        .select()
        .from(goalTransactions)
        .where(eq(goalTransactions.goalAccountId, goal.id))
        .orderBy(goalTransactions.date);

      const balance = calculateGoalBalance(goal.openingBalanceCents, txs);
      return { ...goal, balance, transactions: txs };
    })
  );

  return results;
}

export async function getGoalDetail(goalId: string) {
  const [goal] = await db
    .select()
    .from(goalAccounts)
    .where(eq(goalAccounts.id, goalId));

  if (!goal) return null;

  const txs = await db
    .select()
    .from(goalTransactions)
    .where(eq(goalTransactions.goalAccountId, goalId))
    .orderBy(goalTransactions.date);

  const balance = calculateGoalBalance(goal.openingBalanceCents, txs);
  return { ...goal, balance, transactions: txs };
}

export async function createGoal(
  userId: string,
  data: { name: string; slug?: string; openingBalanceCents?: number }
) {
  const parsed = createGoalSchema.parse(data);
  const [created] = await db
    .insert(goalAccounts)
    .values({ ...parsed, slug: parsed.slug || toSlug(parsed.name), userId })
    .returning();
  return created;
}

export async function updateGoal(
  goalId: string,
  data: { name?: string; slug?: string; openingBalanceCents?: number }
) {
  const parsed = updateGoalSchema.parse(data);
  const [updated] = await db
    .update(goalAccounts)
    .set({ ...parsed, updatedAt: new Date() })
    .where(eq(goalAccounts.id, goalId))
    .returning();
  return updated;
}

export async function createGoalTransaction(
  data: {
    goalAccountId: string;
    type: "DEPOSIT" | "WITHDRAW";
    amountCents: number;
    date: string;
    note?: string;
    linkedMonthlyItemId?: string;
  }
) {
  const parsed = createGoalTransactionSchema.parse(data);
  const [created] = await db
    .insert(goalTransactions)
    .values(parsed)
    .returning();
  return created;
}

export async function deleteGoalTransaction(txId: string) {
  await db.delete(goalTransactions).where(eq(goalTransactions.id, txId));
}
