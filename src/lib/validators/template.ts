import { z } from "zod/v4";

export const createTemplateSchema = z.object({
  name: z.string().min(1, "ชื่อ template ห้ามว่าง"),
  isDefault: z.boolean().optional().default(false),
});

export const createTemplateItemSchema = z.object({
  templateId: z.uuid(),
  category: z.enum(["INCOME", "EXPENSE", "SAVING", "GOAL", "FAMILY"]),
  name: z.string().min(1, "ชื่อรายการห้ามว่าง"),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9-]+$/, "slug ใช้ได้เฉพาะ a-z, 0-9 และ -")
    .optional(),
  defaultAmountCents: z.number().int().min(0).default(0),
  interestRate: z.string().trim().min(1).nullable().optional(),
  accountOrSubType: z.string().optional(),
  isActive: z.boolean().optional().default(true),
  sortOrder: z.number().int().optional().default(0),
});

export const updateTemplateItemSchema = createTemplateItemSchema.partial().omit({
  templateId: true,
});
