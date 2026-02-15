"use server";

import { db } from "@/db";
import { goalAccounts, goalTransactions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { createGoalSchema, createGoalTransactionSchema } from "@/lib/validators/goals";
import { calculateGoalBalance } from "@/lib/calc/goals";

export async function getGoals(userId: string) {
  const goals = await db
    .select()
    .from(goalAccounts)
    .where(eq(goalAccounts.userId, userId));

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
  data: { name: string; openingBalanceCents?: number }
) {
  const parsed = createGoalSchema.parse(data);
  const [created] = await db
    .insert(goalAccounts)
    .values({ ...parsed, userId })
    .returning();
  return created;
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
