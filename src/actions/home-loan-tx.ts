"use server";

import { db } from "@/db";
import { monthlyItems, monthlyPlans } from "@/db/schema";
import { eq, and, asc, inArray } from "drizzle-orm";

export async function getHomeLoanTransactions(userId: string, slug: string) {
  // First, get all plans for the user
  const userPlans = await db
    .select({ id: monthlyPlans.id, month: monthlyPlans.month })
    .from(monthlyPlans)
    .where(eq(monthlyPlans.userId, userId));

  if (userPlans.length === 0) return [];

  const planIds = userPlans.map((p) => p.id);
  const planMonthMap = new Map(userPlans.map((p) => [p.id, p.month]));

  // Find all done items that map to this exact loan slug
  const items = await db
    .select()
    .from(monthlyItems)
    .where(
      and(
        inArray(monthlyItems.planId, planIds),
        eq(monthlyItems.slug, slug),
        eq(monthlyItems.status, "DONE")
      )
    )
    .orderBy(asc(monthlyItems.doneAt));

  return items.map((item) => ({
    ...item,
    actualAmountCents: item.actualAmountCents ?? item.plannedAmountCents,
    month: planMonthMap.get(item.planId) || "",
  }));
}

