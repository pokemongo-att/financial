"use server";

import { db } from "@/db";
import { monthlyPlans, monthlyItems, templateItems } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { createMonthlyPlanSchema, updateMonthlyItemSchema } from "@/lib/validators/monthly";

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
        category: ti.category,
        name: ti.name,
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
    note?: string;
    paymentMethod?: string;
  }
) {
  const parsed = updateMonthlyItemSchema.parse(data);
  const updateData: Record<string, unknown> = { ...parsed, updatedAt: new Date() };

  if (parsed.status === "DONE") {
    updateData.doneAt = new Date();
  }

  const [updated] = await db
    .update(monthlyItems)
    .set(updateData)
    .where(eq(monthlyItems.id, itemId))
    .returning();
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
