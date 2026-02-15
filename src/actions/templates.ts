"use server";

import { db } from "@/db";
import { templates, templateItems } from "@/db/schema";
import { eq } from "drizzle-orm";
import { createTemplateSchema, createTemplateItemSchema } from "@/lib/validators/template";

export async function getTemplates(userId: string) {
  return db.select().from(templates).where(eq(templates.userId, userId));
}

export async function getTemplateWithItems(templateId: string) {
  const [template] = await db
    .select()
    .from(templates)
    .where(eq(templates.id, templateId));

  if (!template) return null;

  const items = await db
    .select()
    .from(templateItems)
    .where(eq(templateItems.templateId, templateId))
    .orderBy(templateItems.sortOrder);

  return { ...template, items };
}

export async function createTemplate(userId: string, data: { name: string; isDefault?: boolean }) {
  const parsed = createTemplateSchema.parse(data);
  const [created] = await db
    .insert(templates)
    .values({ ...parsed, userId })
    .returning();
  return created;
}

export async function updateTemplate(templateId: string, data: { name?: string; isDefault?: boolean }) {
  const [updated] = await db
    .update(templates)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(templates.id, templateId))
    .returning();
  return updated;
}

export async function deleteTemplate(templateId: string) {
  await db.delete(templates).where(eq(templates.id, templateId));
}

export async function createTemplateItem(
  data: {
    templateId: string;
    category: "INCOME" | "EXPENSE" | "SAVING" | "GOAL" | "FAMILY";
    name: string;
    defaultAmountCents?: number;
    accountOrSubType?: string;
    isActive?: boolean;
    sortOrder?: number;
  }
) {
  const parsed = createTemplateItemSchema.parse(data);
  const [created] = await db
    .insert(templateItems)
    .values(parsed)
    .returning();
  return created;
}

export async function updateTemplateItem(
  itemId: string,
  data: Partial<{
    category: "INCOME" | "EXPENSE" | "SAVING" | "GOAL" | "FAMILY";
    name: string;
    defaultAmountCents: number;
    accountOrSubType: string;
    isActive: boolean;
    sortOrder: number;
  }>
) {
  const [updated] = await db
    .update(templateItems)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(templateItems.id, itemId))
    .returning();
  return updated;
}

export async function deleteTemplateItem(itemId: string) {
  await db.delete(templateItems).where(eq(templateItems.id, itemId));
}
