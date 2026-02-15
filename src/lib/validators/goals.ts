import { z } from "zod/v4";

export const createGoalSchema = z.object({
  name: z.string().min(1, "ชื่อเป้าหมายห้ามว่าง"),
  openingBalanceCents: z.number().int().min(0).default(0),
});

export const createGoalTransactionSchema = z.object({
  goalAccountId: z.uuid(),
  type: z.enum(["DEPOSIT", "WITHDRAW"]),
  amountCents: z.number().int().min(1, "จำนวนเงินต้องมากกว่า 0"),
  date: z.string(),
  note: z.string().optional(),
  linkedMonthlyItemId: z.uuid().optional(),
});
