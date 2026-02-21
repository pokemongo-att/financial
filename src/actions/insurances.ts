"use server";

import { db } from "@/db";
import { insurances } from "@/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

const insuranceSchema = z.object({
  name: z.string().min(1, "กรุณาระบุชื่อประกัน"),
  coverageAmountCents: z.number().int().min(0, "ทุนประกันต้องไม่ติดลบ"),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "รูปแบบวันที่ไม่ถูกต้อง (YYYY-MM-DD)"),
  maturityDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "รูปแบบวันที่ไม่ถูกต้อง (YYYY-MM-DD)"),
  premiumAmountCents: z.number().int().min(0, "เบี้ยประกันต้องไม่ติดลบ"),
  premiumUntilYear: z.number().int().nullable().optional(),
});

export async function getInsurances(userId: string) {
  return db
    .select()
    .from(insurances)
    .where(eq(insurances.userId, userId))
    .orderBy(insurances.maturityDate);
}

export async function createInsurance(userId: string, data: z.infer<typeof insuranceSchema>) {
  const parsed = insuranceSchema.parse(data);
  
  const [created] = await db
    .insert(insurances)
    .values({
      userId,
      ...parsed,
    })
    .returning();
    
  return created;
}

export async function updateInsurance(id: string, data: Partial<z.infer<typeof insuranceSchema>>) {
  const [updated] = await db
    .update(insurances)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(insurances.id, id))
    .returning();
    
  return updated;
}

export async function deleteInsurance(id: string) {
  await db.delete(insurances).where(eq(insurances.id, id));
}
