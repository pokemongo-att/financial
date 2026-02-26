import { z } from "zod/v4";

export const createAssetAccountSchema = z.object({
  type: z.enum(["STOCK", "FUND", "CRYPTO", "BANK"]),
  symbol: z.string().min(1, "Symbol ห้ามว่าง"),
  name: z.string().optional(),
});

export const updateAssetAccountSchema = z.object({
  symbol: z.string().min(1, "Symbol ห้ามว่าง").optional(),
  name: z.string().optional(),
});

export const createAssetTransactionSchema = z.object({
  assetAccountId: z.uuid(),
  type: z.enum(["BUY", "SELL", "DIVIDEND", "FEE", "DEPOSIT", "WITHDRAW", "OPENING"]),
  quantity: z.number().int().nullable().optional(),
  pricePerUnitCents: z.number().int().nullable().optional(),
  amountCents: z.number().int().min(0),
  date: z.string(),
  note: z.string().optional(),
});
