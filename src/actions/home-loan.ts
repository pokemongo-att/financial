"use server";

import { db } from "@/db";
import { homeLoans } from "@/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

const createHomeLoanSchema = z.object({
  name: z.string().min(1, "กรุณาระบุชื่อสินเชื่อ"),
  slug: z.string().min(1, "กรุณาระบุ Slug"),
  principalBalanceCents: z.number().int().min(0, "ยอดเงินต้นต้องไม่ติดลบ"),
});

export async function getHomeLoans(userId: string) {
  return db
    .select()
    .from(homeLoans)
    .where(eq(homeLoans.userId, userId))
    .orderBy(homeLoans.createdAt);
}

export async function getHomeLoanBySlug(userId: string, slug: string) {
  const [loan] = await db
    .select()
    .from(homeLoans)
    .where(eq(homeLoans.slug, slug))
    .limit(1);
    
  if (loan && loan.userId !== userId) return null;
  return loan;
}

export async function createHomeLoan(userId: string, data: z.infer<typeof createHomeLoanSchema>) {
  const parsed = createHomeLoanSchema.parse(data);
  
  const [created] = await db
    .insert(homeLoans)
    .values({
      userId,
      name: parsed.name,
      slug: parsed.slug,
      principalBalanceCents: parsed.principalBalanceCents,
    })
    .returning();
    
  return created;
}
