"use server";

import { db } from "@/db";
import { homeLoans } from "@/db/schema";
import { and, eq, ne } from "drizzle-orm";
import { z } from "zod";

const createHomeLoanSchema = z.object({
  name: z.string().min(1, "กรุณาระบุชื่อสินเชื่อ"),
  slug: z.string().min(1, "กรุณาระบุ Slug"),
  principalBalanceCents: z.number().int().min(0, "ยอดเงินต้นต้องไม่ติดลบ"),
});

const updateHomeLoanSchema = z.object({
  name: z.string().min(1, "กรุณาระบุชื่อสินเชื่อ").optional(),
  slug: z.string().min(1, "กรุณาระบุ Slug").optional(),
  principalBalanceCents: z.number().int().min(0, "ยอดเงินต้นต้องไม่ติดลบ").optional(),
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
    .where(and(eq(homeLoans.userId, userId), eq(homeLoans.slug, slug)))
    .limit(1);

  return loan;
}

export async function createHomeLoan(userId: string, data: z.infer<typeof createHomeLoanSchema>) {
  const parsed = createHomeLoanSchema.parse(data);

  const [existing] = await db
    .select({ id: homeLoans.id })
    .from(homeLoans)
    .where(
      and(
        eq(homeLoans.userId, userId),
        eq(homeLoans.slug, parsed.slug)
      )
    );

  if (existing) {
    throw new Error("slug ของสินเชื่อนี้ถูกใช้งานแล้ว");
  }
  
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

export async function updateHomeLoan(
  loanId: string,
  data: z.infer<typeof updateHomeLoanSchema>
) {
  const parsed = updateHomeLoanSchema.parse(data);

  if (parsed.slug) {
    const [current] = await db
      .select({ id: homeLoans.id, userId: homeLoans.userId })
      .from(homeLoans)
      .where(eq(homeLoans.id, loanId));

    if (current) {
      const [duplicate] = await db
        .select({ id: homeLoans.id })
        .from(homeLoans)
        .where(
          and(
            eq(homeLoans.userId, current.userId),
            eq(homeLoans.slug, parsed.slug),
            ne(homeLoans.id, loanId)
          )
        );

      if (duplicate) {
        throw new Error("slug ของสินเชื่อนี้ถูกใช้งานแล้ว");
      }
    }
  }

  const [updated] = await db
    .update(homeLoans)
    .set({ ...parsed, updatedAt: new Date() })
    .where(eq(homeLoans.id, loanId))
    .returning();
  return updated;
}
