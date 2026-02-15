import { z } from "zod/v4";

export const goalTransactionSchema = z.object({
  type: z.enum(["DEPOSIT", "WITHDRAW"]),
  amount: z.string().min(1, "กรุณาระบุจำนวนเงิน"),
  date: z.string().min(1, "กรุณาระบุวันที่"),
  note: z.string().optional(),
});

export type GoalTransactionFormData = z.infer<typeof goalTransactionSchema>;

export const assetTransactionSchema = z.object({
  type: z.string().min(1, "กรุณาเลือกประเภท"),
  quantity: z.string().optional(),
  pricePerUnit: z.string().optional(),
  amount: z.string().min(1, "กรุณาระบุจำนวนเงิน"),
  date: z.string().min(1, "กรุณาระบุวันที่"),
  note: z.string().optional(),
});

export type AssetTransactionFormData = z.infer<typeof assetTransactionSchema>;
