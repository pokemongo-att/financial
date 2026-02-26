import "dotenv/config";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq } from "drizzle-orm";
import * as schema from "./schema";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

async function seed() {
  console.log("🌱 Starting seed...");

  // ── A) Demo User ─────────────────────────────────────────────────────
  let [user] = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.email, "demo@local"));

  if (!user) {
    [user] = await db
      .insert(schema.users)
      .values({ email: "demo@local", name: "Admin User" })
      .returning();
    console.log("✅ Created admin user");
  } else {
    console.log("ℹ️  Admin user already exists");
  }

  const userId = user.id;

  // ── B) Clear ALL Existing Data (FK order) ───────────────────────────
  console.log("🧹 Clearing all data...");
  await db.delete(schema.goalTransactions);
  await db.delete(schema.goalAccounts);
  await db.delete(schema.familyTransactions);
  await db.delete(schema.familyMembers);
  await db.delete(schema.assetTransactions);
  await db.delete(schema.assetAccounts);
  await db.delete(schema.monthlyItems);
  await db.delete(schema.monthlyPlans);
  await db.delete(schema.templateItems);
  await db.delete(schema.templates);
  await db.delete(schema.homeLoans);
  await db.delete(schema.insurances);
  console.log("✅ Cleared all data");

  // ── C) Default Template ──────────────────────────────────────────────
  const [template] = await db
    .insert(schema.templates)
    .values({ userId, name: "Default เดือนปกติ", isDefault: true })
    .returning();
  console.log("✅ Created default template");

  const items = [
    // Income
    { category: "INCOME" as const, name: "เงินเดือนอัต", slug: "salary-att", defaultAmountCents: 5000000, sortOrder: 0 },
    { category: "INCOME" as const, name: "เงินเดือนอ้อม", slug: "salary-aom", defaultAmountCents: 2207000, sortOrder: 1 },
    { category: "INCOME" as const, name: "ค่าเช่าบ้าน 142/19", slug: "rent-142-19", defaultAmountCents: 1300000, sortOrder: 2 },
    { category: "INCOME" as const, name: "ค่าเช่าบ้าน 50/22", slug: "rent-50-22", defaultAmountCents: 2300000, sortOrder: 3 },
    { category: "INCOME" as const, name: "ค่าดูแลแม่", slug: "care-mom", defaultAmountCents: 1000000, sortOrder: 4 },
    // Expense
    { category: "EXPENSE" as const, name: "ค่าน้ำมัน", slug: "gas", defaultAmountCents: 350000, sortOrder: 10 },
    { category: "EXPENSE" as const, name: "tel ค่าโทรศัพท์/อินเตอร์เน็ต", slug: "phone-internet", defaultAmountCents: 1979, sortOrder: 11 },
    { category: "EXPENSE" as const, name: "ค่าไฟฟ้า", slug: "electricity", defaultAmountCents: 200000, sortOrder: 12 },
    { category: "EXPENSE" as const, name: "ชีวิตประจำวัน", slug: "daily-life", defaultAmountCents: 1000000, sortOrder: 13 },
    { category: "EXPENSE" as const, name: "ค่าสินเชื่อบ้าน 144/49", slug: "loan144-49", defaultAmountCents: 1560000, sortOrder: 14, interestRate: "0", accountOrSubType: "HOME_LOAN" },
    { category: "EXPENSE" as const, name: "ค่าสินเชื่อโป๊ะบ้าน 144/49", slug: "loan144-49", defaultAmountCents: 500000, sortOrder: 15, interestRate: "0", accountOrSubType: "HOME_LOAN" },
    { category: "EXPENSE" as const, name: "ค่าสินเชื่อบ้าน 50/22", slug: "loan50-22", defaultAmountCents: 17190000, sortOrder: 16, interestRate: "0", accountOrSubType: "HOME_LOAN" },
    { category: "EXPENSE" as const, name: "ค่าสินเชื่อโป๊ะบ้าน 50/22", slug: "loan50-22", defaultAmountCents: 0, sortOrder: 17, interestRate: "0", accountOrSubType: "HOME_LOAN" },
    // Savings (Funds)
    { category: "SAVING" as const, name: "rmf", slug: "fund-rmf", defaultAmountCents: 200000, sortOrder: 20 },
    { category: "SAVING" as const, name: "scbs&p500", slug: "fund-scbsp500", defaultAmountCents: 300000, sortOrder: 21 },
    { category: "SAVING" as const, name: "JEPQ", slug: "fund-jepq", defaultAmountCents: 300000, sortOrder: 22 },
    { category: "SAVING" as const, name: "KFGDIV-D", slug: "fund-kfgdiv", defaultAmountCents: 300000, sortOrder: 23 },
    { category: "SAVING" as const, name: "SCHD", slug: "fund-schd", defaultAmountCents: 200000, sortOrder: 24 },
    { category: "SAVING" as const, name: "VXUS", slug: "fund-vxus", defaultAmountCents: 300000, sortOrder: 25 },
    { category: "SAVING" as const, name: "QQQI", slug: "fund-qqqi", defaultAmountCents: 300000, sortOrder: 26 },
    // Goals
    { category: "GOAL" as const, name: "เงินท่องเที่ยว", slug: "goal-travel", defaultAmountCents: 0, sortOrder: 27 },
    { category: "GOAL" as const, name: "เงินรถยนต์", slug: "goal-car", defaultAmountCents: 0, sortOrder: 28 },
    { category: "GOAL" as const, name: "เงินประกัน", slug: "goal-insurance", defaultAmountCents: 0, sortOrder: 29 },
    // Family
    { category: "FAMILY" as const, name: "พ่อแม่", slug: "family-parents", defaultAmountCents: 500000, sortOrder: 30 },
    { category: "FAMILY" as const, name: "หลาน", slug: "family-child", defaultAmountCents: 200000, sortOrder: 31 },
  ];

  await db.insert(schema.templateItems).values(
    items.map((i) => ({ ...i, templateId: template.id }))
  );
  console.log(`✅ Created ${items.length} template items`);

  // ── D) Monthly Plans ─────────────────────────────────────────────────
  const months = ["2026-03"];

  for (const month of months) {
    const [plan] = await db
      .insert(schema.monthlyPlans)
      .values({
        userId,
        month,
        templateId: template.id,
        startingBalanceCents: 0,
      })
      .returning();

    const tplItems = await db
      .select()
      .from(schema.templateItems)
      .where(eq(schema.templateItems.templateId, template.id))
      .orderBy(schema.templateItems.sortOrder);

    const monthItems = tplItems.map((ti) => ({
      planId: plan.id,
      category: ti.category,
      name: ti.name,
      slug: ti.slug,
      plannedAmountCents: ti.defaultAmountCents,
      interestRate: ti.interestRate,
      status: "PLANNED" as const,
      sortOrder: ti.sortOrder,
    }));

    await db.insert(schema.monthlyItems).values(monthItems);
    console.log(`✅ Created monthly plan ${month} with ${monthItems.length} items`);
  }

  // ── E) Asset Accounts + Transactions (Stocks & Funds) ────────────────
  const assetDefs = [
    // Stocks
    { type: "STOCK" as const, symbol: "AEONTS", name: "AEONTS", qty: 1000, price: 10765500 },
    { type: "STOCK" as const, symbol: "AOT", name: "AOT", qty: 3200, price: 11346500 },
    { type: "STOCK" as const, symbol: "BDMS", name: "BDMS", qty: 4000, price: 7907200 },
    { type: "STOCK" as const, symbol: "CPAXT", name: "CPAXT", qty: 4000, price: 8198700 },
    { type: "STOCK" as const, symbol: "EGCO", name: "EGCO", qty: 10000, price: 109734000 },
    { type: "STOCK" as const, symbol: "PTTEP", name: "PTTEP", qty: 1700, price: 18385800 },
    // Funds
    { type: "FUND" as const, symbol: "rmf", name: "RMF", qty: 0, price: 0 },
    { type: "FUND" as const, symbol: "scbs&p500", name: "SCB S&P500", qty: 0, price: 0 },
    { type: "FUND" as const, symbol: "JEPQ", name: "JEPQ", qty: 0, price: 0 },
    { type: "FUND" as const, symbol: "KFGDIV-D", name: "Krungsri Global Dividend Fund", qty: 0, price: 0 },
    { type: "FUND" as const, symbol: "SCHD", name: "SCHD", qty: 0, price: 0 },
    { type: "FUND" as const, symbol: "VXUS", name: "VXUS", qty: 0, price: 0 },
    { type: "FUND" as const, symbol: "QQQI", name: "QQQI", qty: 0, price: 0 },
  ];

  for (const ad of assetDefs) {
    const [asset] = await db
      .insert(schema.assetAccounts)
      .values({ userId, type: ad.type, symbol: ad.symbol, name: ad.name })
      .returning();
    console.log(`✅ Created asset: ${ad.symbol}`);

    if (ad.type === "STOCK") {
      await db.insert(schema.assetTransactions).values({
        assetAccountId: asset.id,
        type: "OPENING",
        quantity: ad.qty,
        amountCents: ad.price,
        date: "2026-02-21",
        note: "ยอดตั้งต้นหุ้น",
      });
    }
  }

  // ── F) Home Loans ────────────────────────────────────────────────────
  const loanDefs = [
    { name: "ค่าสินเชื่อบ้าน 144/49", slug: "loan144-49", balance: 377506248 },
    { name: "ค่าสินเชื่อบ้าน 50/22", slug: "loan50-22", balance: 0 },
  ];

  for (const ld of loanDefs) {
    await db.insert(schema.homeLoans).values({
      userId,
      name: ld.name,
      slug: ld.slug,
      principalBalanceCents: ld.balance,
    });
    console.log(`✅ Created home loan: ${ld.name}`);
  }

  // ── G) Insurances ────────────────────────────────────────────────────
  const insuranceDefs = [
    { name: "กรุงเทพประกันชีวิต 10/2", coverage: 6000000, start: "2025-03-20", maturity: "2035-03-20", premium: 3000000, untilYear: 2026 },
    { name: "ไทยประกันชีวิต 12/6", coverage: 18000000, start: "2023-12-25", maturity: "2035-12-25", premium: 3000000, untilYear: 2028 },
    { name: "ไทยประกันชีวิต 10/5 AOM", coverage: 10000000, start: "2017-11-27", maturity: "2027-11-27", premium: 0, untilYear: null },
  ];

  for (const ins of insuranceDefs) {
    await db.insert(schema.insurances).values({
      userId,
      name: ins.name,
      coverageAmountCents: ins.coverage,
      startDate: ins.start,
      maturityDate: ins.maturity,
      premiumAmountCents: ins.premium,
      premiumUntilYear: ins.untilYear,
    });
    console.log(`✅ Created insurance: ${ins.name}`);
  }

  // ── H) Family Members ────────────────────────────────────────────────
  const familyDefs = [
    { name: "พ่อแม่", type: "PARENT" as const, openingBalanceCents: 0 },
    { name: "หลาน", type: "CHILD" as const, openingBalanceCents: 0 },
  ];

  for (const fd of familyDefs) {
    await db.insert(schema.familyMembers).values({
      userId,
      name: fd.name,
      type: fd.type,
      openingBalanceCents: fd.openingBalanceCents,
    });
    console.log(`✅ Created family member: ${fd.name}`);
  }

  // ── I) Goal Accounts ─────────────────────────────────────────────────
  const goalDefs = [
    { name: "เงินท่องเที่ยว", slug: "goal-travel", openingBalanceCents: 0 },
    { name: "เงินรถยนต์", slug: "goal-car", openingBalanceCents: 0 },
    { name: "เงินประกัน", slug: "goal-insurance", openingBalanceCents: 0 },
  ];

  for (const gd of goalDefs) {
    await db.insert(schema.goalAccounts).values({
      userId,
      name: gd.name,
      slug: gd.slug,
      openingBalanceCents: gd.openingBalanceCents,
    });
    console.log(`✅ Created goal account: ${gd.name}`);
  }

  console.log("\n🎉 Seed completed successfully!");
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});

