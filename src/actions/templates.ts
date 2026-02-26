"use server";

import { db } from "@/db";
import { templates, templateItems, homeLoans, assetAccounts } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { createTemplateSchema, createTemplateItemSchema } from "@/lib/validators/template";

function deriveLoanNameFromTemplateItemName(name: string) {
  return name.replace("ค่าสินจ่ายเชื่อโป๊ะบ้าน", "ค่าสินเชื่อบ้าน").trim();
}

async function ensureAssetAccountByTemplateItem(input: {
  templateId: string;
  category: string;
  slug?: string | null;
  name?: string;
}) {
  if (input.category !== "SAVING" || !input.slug) return;

  const [template] = await db
    .select({ userId: templates.userId })
    .from(templates)
    .where(eq(templates.id, input.templateId));

  if (!template) return;

  const [existing] = await db
    .select({ id: assetAccounts.id })
    .from(assetAccounts)
    .where(
      and(
        eq(assetAccounts.userId, template.userId),
        eq(assetAccounts.symbol, input.slug)
      )
    );

  if (existing) return;

  await db.insert(assetAccounts).values({
    userId: template.userId,
    type: "FUND",
    symbol: input.slug,
    name: input.name || input.slug,
  });
}

async function ensureHomeLoanByTemplateItem(input: {
  templateId: string;
  slug?: string | null;
  name?: string;
  accountOrSubType?: string;
}) {
  if (input.accountOrSubType !== "HOME_LOAN" || !input.slug) return;

  const [template] = await db
    .select({ userId: templates.userId })
    .from(templates)
    .where(eq(templates.id, input.templateId));

  if (!template) return;

  const [existingLoan] = await db
    .select({ id: homeLoans.id })
    .from(homeLoans)
    .where(
      and(
        eq(homeLoans.userId, template.userId),
        eq(homeLoans.slug, input.slug)
      )
    );

  if (existingLoan) return;

  await db.insert(homeLoans).values({
    userId: template.userId,
    name: deriveLoanNameFromTemplateItemName(input.name || input.slug),
    slug: input.slug,
    principalBalanceCents: 0,
  });
}

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

export async function copyTemplate(userId: string, sourceTemplateId: string, newName: string) {
  const source = await getTemplateWithItems(sourceTemplateId);
  if (!source) throw new Error("Source template not found");

  const [created] = await db
    .insert(templates)
    .values({ userId, name: newName, isDefault: false })
    .returning();

  if (source.items.length > 0) {
    await db.insert(templateItems).values(
      source.items.map((item) => ({
        templateId: created.id,
        category: item.category,
        name: item.name,
        slug: item.slug,
        defaultAmountCents: item.defaultAmountCents,
        interestRate: item.interestRate,
        accountOrSubType: item.accountOrSubType,
        isActive: item.isActive,
        sortOrder: item.sortOrder,
      }))
    );
  }

  return created;
}

export async function createTemplateItem(
  data: {
    templateId: string;
    category: "INCOME" | "EXPENSE" | "SAVING" | "GOAL" | "FAMILY";
    name: string;
    slug?: string;
    defaultAmountCents?: number;
    interestRate?: string | null;
    accountOrSubType?: string;
    isActive?: boolean;
    sortOrder?: number;
  }
) {
  const parsed = createTemplateItemSchema.parse(data);

  await ensureHomeLoanByTemplateItem({
    templateId: parsed.templateId,
    slug: parsed.slug,
    name: parsed.name,
    accountOrSubType: parsed.accountOrSubType,
  });

  await ensureAssetAccountByTemplateItem({
    templateId: parsed.templateId,
    category: parsed.category,
    slug: parsed.slug,
    name: parsed.name,
  });

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
    slug: string;
    defaultAmountCents: number;
    interestRate: string | null;
    accountOrSubType: string;
    isActive: boolean;
    sortOrder: number;
  }>
) {
  const [currentItem] = await db
    .select({
      templateId: templateItems.templateId,
      slug: templateItems.slug,
      name: templateItems.name,
      accountOrSubType: templateItems.accountOrSubType,
    })
    .from(templateItems)
    .where(eq(templateItems.id, itemId));

  if (currentItem) {
    await ensureHomeLoanByTemplateItem({
      templateId: currentItem.templateId,
      slug: data.slug ?? currentItem.slug,
      name: data.name ?? currentItem.name,
      accountOrSubType: data.accountOrSubType ?? currentItem.accountOrSubType ?? undefined,
    });
  }

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
