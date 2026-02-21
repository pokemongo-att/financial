import { z } from "zod/v4";

export const createMonthlyPlanSchema = z.object({
  month: z.string().regex(/^\d{4}-\d{2}$/, "รูปแบบเดือนต้องเป็น YYYY-MM"),
  templateId: z.uuid(),
  startingBalanceCents: z.number().int().optional(),
});

export const updateMonthlyItemSchema = z.object({
  plannedAmountCents: z.number().int().min(0).optional(),
  actualAmountCents: z.number().int().min(0).nullable().optional(),
  status: z.enum(["PLANNED", "DONE", "SKIPPED"]).optional(),
  note: z.string().optional(),
  interestRate: z.string().nullable().optional(),
  paymentMethod: z.string().optional(),
});
