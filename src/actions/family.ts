"use server";

import { db } from "@/db";
import { familyMembers, familyTransactions } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getFamilyMembers(userId: string) {
  const members = await db
    .select()
    .from(familyMembers)
    .where(eq(familyMembers.userId, userId));

  const results = await Promise.all(
    members.map(async (member) => {
      const txs = await db
        .select()
        .from(familyTransactions)
        .where(eq(familyTransactions.familyMemberId, member.id))
        .orderBy(familyTransactions.date);

      const totalCents = member.openingBalanceCents + txs.reduce((sum, tx) => sum + tx.amountCents, 0);
      return { ...member, transactions: txs, totalCents };
    })
  );

  return results;
}

export async function createFamilyMember(
  userId: string,
  data: { name: string; type: "PARENT" | "CHILD"; openingBalanceCents?: number }
) {
  const [created] = await db
    .insert(familyMembers)
    .values({ ...data, openingBalanceCents: data.openingBalanceCents ?? 0, userId })
    .returning();
  return created;
}

export async function updateFamilyMember(
  memberId: string,
  data: { name?: string; type?: "PARENT" | "CHILD"; openingBalanceCents?: number }
) {
  const [updated] = await db
    .update(familyMembers)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(familyMembers.id, memberId))
    .returning();
  return updated;
}

export async function createFamilyTransaction(
  data: {
    familyMemberId: string;
    amountCents: number;
    date: string;
    note?: string;
    monthlyPlanId?: string;
  }
) {
  const [created] = await db
    .insert(familyTransactions)
    .values(data)
    .returning();
  return created;
}

export async function deleteFamilyTransaction(txId: string) {
  await db.delete(familyTransactions).where(eq(familyTransactions.id, txId));
}

export async function deleteFamilyMember(memberId: string) {
  // Transactions are cascade-deleted via FK
  await db.delete(familyMembers).where(eq(familyMembers.id, memberId));
}
