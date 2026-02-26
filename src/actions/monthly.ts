"use server";

import { db } from "@/db";
import { monthlyPlans, monthlyItems, templateItems, goalAccounts, goalTransactions, familyTransactions } from "@/db/schema";
import { eq, and, inArray } from "drizzle-orm";
import { createMonthlyPlanSchema, updateMonthlyItemSchema } from "@/lib/validators/monthly";

function toSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function getMonthlyPlan(userId: string, month: string) {
  const [plan] = await db
    .select()
    .from(monthlyPlans)
    .where(and(eq(monthlyPlans.userId, userId), eq(monthlyPlans.month, month)));

  if (!plan) return null;

  const items = await db
    .select()
    .from(monthlyItems)
    .where(eq(monthlyItems.planId, plan.id))
    .orderBy(monthlyItems.sortOrder);

  return { ...plan, items };
}

export async function getMonthlyPlans(userId: string) {
  return db
    .select()
    .from(monthlyPlans)
    .where(eq(monthlyPlans.userId, userId))
    .orderBy(monthlyPlans.month);
}

export async function createMonthlyPlanFromTemplate(
  userId: string,
  data: { month: string; templateId: string; startingBalanceCents?: number }
) {
  const parsed = createMonthlyPlanSchema.parse(data);

  // Check if plan already exists for this month
  const existing = await db
    .select()
    .from(monthlyPlans)
    .where(and(eq(monthlyPlans.userId, userId), eq(monthlyPlans.month, parsed.month)));

  if (existing.length > 0) {
    throw new Error(`แผนเดือน ${parsed.month} มีอยู่แล้ว`);
  }

  // Get template items
  const tplItems = await db
    .select()
    .from(templateItems)
    .where(
      and(
        eq(templateItems.templateId, parsed.templateId),
        eq(templateItems.isActive, true)
      )
    )
    .orderBy(templateItems.sortOrder);

  // Create the plan
  const [plan] = await db
    .insert(monthlyPlans)
    .values({
      userId,
      month: parsed.month,
      templateId: parsed.templateId,
      startingBalanceCents: parsed.startingBalanceCents,
    })
    .returning();

  // Create line items from template
  if (tplItems.length > 0) {
    await db.insert(monthlyItems).values(
      tplItems.map((ti) => ({
        planId: plan.id,
        slug: ti.slug,
        category: ti.category,
        name: ti.name,
        interestRate: ti.interestRate,
        plannedAmountCents: ti.defaultAmountCents,
        actualAmountCents: null,
        status: "PLANNED" as const,
        sortOrder: ti.sortOrder,
      }))
    );
  }

  return plan;
}

export async function updateMonthlyItem(
  itemId: string,
  data: {
    plannedAmountCents?: number;
    actualAmountCents?: number | null;
    status?: "PLANNED" | "DONE" | "SKIPPED";
    note?: string | null;
    interestRate?: string | null;
    paymentMethod?: string;
  }
) {
  const parsed = updateMonthlyItemSchema.parse(data);
  const [currentItem] = await db
    .select()
    .from(monthlyItems)
    .where(eq(monthlyItems.id, itemId));

  if (!currentItem) {
    throw new Error("ไม่พบรายการรายเดือนที่ต้องการอัปเดต");
  }

  const [plan] = await db
    .select()
    .from(monthlyPlans)
    .where(eq(monthlyPlans.id, currentItem.planId));

  if (!plan) {
    throw new Error("ไม่พบแผนรายเดือนของรายการนี้");
  }

  const updateData: Record<string, unknown> = { ...parsed, updatedAt: new Date() };

  if (parsed.status === "DONE") {
    updateData.doneAt = new Date();
  }

  const [updated] = await db
    .update(monthlyItems)
    .set(updateData)
    .where(eq(monthlyItems.id, itemId))
    .returning();

  if (updated.category !== "GOAL") {
    return updated;
  }

  if (updated.status !== "DONE") {
    await db
      .delete(goalTransactions)
      .where(eq(goalTransactions.linkedMonthlyItemId, itemId));
    return updated;
  }

  const goalSlug = updated.slug || toSlug(updated.name);
  const amountCents = updated.actualAmountCents ?? updated.plannedAmountCents;

  if (amountCents <= 0) {
    await db
      .delete(goalTransactions)
      .where(eq(goalTransactions.linkedMonthlyItemId, itemId));
    return updated;
  }

  let [goal] = await db
    .select()
    .from(goalAccounts)
    .where(
      and(
        eq(goalAccounts.userId, plan.userId),
        eq(goalAccounts.slug, goalSlug)
      )
    );

  if (!goal) {
    [goal] = await db
      .insert(goalAccounts)
      .values({
        userId: plan.userId,
        name: updated.name,
        slug: goalSlug,
        openingBalanceCents: 0,
      })
      .returning();
  }

  const [existingLinkedTx] = await db
    .select()
    .from(goalTransactions)
    .where(eq(goalTransactions.linkedMonthlyItemId, updated.id));

  if (existingLinkedTx) {
    await db
      .update(goalTransactions)
      .set({
        goalAccountId: goal.id,
        amountCents,
        date: `${plan.month}-01`,
        note: `Auto-record จาก checklist เดือน ${plan.month}`,
        updatedAt: new Date(),
      })
      .where(eq(goalTransactions.id, existingLinkedTx.id));
  } else {
    await db.insert(goalTransactions).values({
      goalAccountId: goal.id,
      type: "DEPOSIT",
      amountCents,
      date: `${plan.month}-01`,
      note: `Auto-record จาก checklist เดือน ${plan.month}`,
      linkedMonthlyItemId: updated.id,
    });
  }

  return updated;
}

export async function addMonthlyItem(
  planId: string,
  data: {
    category: "INCOME" | "EXPENSE" | "SAVING" | "GOAL" | "FAMILY";
    name: string;
    plannedAmountCents: number;
    sortOrder?: number;
  }
) {
  const [created] = await db
    .insert(monthlyItems)
    .values({
      planId,
      category: data.category,
      name: data.name,
      plannedAmountCents: data.plannedAmountCents,
      sortOrder: data.sortOrder ?? 0,
    })
    .returning();
  return created;
}

export async function deleteMonthlyItem(itemId: string) {
  await db.delete(monthlyItems).where(eq(monthlyItems.id, itemId));
}

export async function clearMonthlyTestData(userId: string) {
  const plans = await db
    .select({ id: monthlyPlans.id })
    .from(monthlyPlans)
    .where(eq(monthlyPlans.userId, userId));

  if (plans.length === 0) {
    return { deletedPlans: 0 };
  }

  const planIds = plans.map((p) => p.id);

  const items = await db
    .select({ id: monthlyItems.id })
    .from(monthlyItems)
    .where(inArray(monthlyItems.planId, planIds));

  if (items.length > 0) {
    await db
      .delete(goalTransactions)
      .where(inArray(goalTransactions.linkedMonthlyItemId, items.map((i) => i.id)));
  }

  await db
    .delete(familyTransactions)
    .where(inArray(familyTransactions.monthlyPlanId, planIds));

  await db.delete(monthlyPlans).where(eq(monthlyPlans.userId, userId));

  return { deletedPlans: planIds.length };
}
