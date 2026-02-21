"use server";

import { db } from "@/db";
import { monthlyItems, monthlyPlans } from "@/db/schema";
import { eq, and, asc, isNotNull, inArray, or, like } from "drizzle-orm";

export async function getHomeLoanTransactions(userId: string, slug: string) {
  // First, get all plans for the user
  const userPlans = await db
    .select({ id: monthlyPlans.id, month: monthlyPlans.month })
    .from(monthlyPlans)
    .where(eq(monthlyPlans.userId, userId));

  if (userPlans.length === 0) return [];

  const planIds = userPlans.map((p) => p.id);
  const planMonthMap = new Map(userPlans.map((p) => [p.id, p.month]));

  // Find all items that match the slug (including "loanmore[slug]" variations)
  const items = await db
    .select()
    .from(monthlyItems)
    .where(
      and(
        inArray(monthlyItems.planId, planIds),
        or(
          eq(monthlyItems.slug, slug),
          like(monthlyItems.slug, `%${slug}%`)
        ),
        eq(monthlyItems.status, "DONE"),
        isNotNull(monthlyItems.actualAmountCents)
      )
    )
    .orderBy(asc(monthlyItems.doneAt));

  return items.map(item => ({
    ...item,
    month: planMonthMap.get(item.planId) || "",
  }));
}

