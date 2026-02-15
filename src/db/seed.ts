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
      .values({ email: "demo@local", name: "ATT Demo" })
      .returning();
    console.log("✅ Created demo user");
  } else {
    console.log("ℹ️  Demo user already exists");
  }

  const userId = user.id;

  // ── B) Default Template ──────────────────────────────────────────────
  let [template] = await db
    .select()
    .from(schema.templates)
    .where(eq(schema.templates.name, "Default เดือนปกติ"));

  if (!template) {
    [template] = await db
      .insert(schema.templates)
      .values({ userId, name: "Default เดือนปกติ", isDefault: true })
      .returning();
    console.log("✅ Created default template");

    const items = [
      // Income
      { category: "INCOME" as const, name: "เงินเดือน att", defaultAmountCents: 4500000, sortOrder: 0 },
      { category: "INCOME" as const, name: "เงินเดือนแฟน aom", defaultAmountCents: 3500000, sortOrder: 1 },
      { category: "INCOME" as const, name: "ค่าเข้าบ้าน 142/19", defaultAmountCents: 800000, sortOrder: 2 },
      { category: "INCOME" as const, name: "ค่าเข้าบ้าน 50/22", defaultAmountCents: 600000, sortOrder: 3 },
      { category: "INCOME" as const, name: "เงินพ่อให้", defaultAmountCents: 500000, sortOrder: 4 },
      // Expense
      { category: "EXPENSE" as const, name: "ค่าน้ำมัน", defaultAmountCents: 400000, sortOrder: 10 },
      { category: "EXPENSE" as const, name: "tel ค่าโทรศัพท์/อินเตอร์เน็ต", defaultAmountCents: 150000, sortOrder: 11 },
      { category: "EXPENSE" as const, name: "ค่าไฟฟ้า", defaultAmountCents: 300000, sortOrder: 12 },
      { category: "EXPENSE" as const, name: "ชีวิตประจำวัน", defaultAmountCents: 1000000, sortOrder: 13 },
      { category: "EXPENSE" as const, name: "เงินโป๊ะบ้าน", defaultAmountCents: 500000, sortOrder: 14 },
      { category: "EXPENSE" as const, name: "ค่าสินเชื่อบ้าน 144/49", defaultAmountCents: 1200000, sortOrder: 15 },
      { category: "EXPENSE" as const, name: "ค่าสินเชื่อบ้าน 50/22", defaultAmountCents: 900000, sortOrder: 16 },
      // Savings
      { category: "SAVING" as const, name: "กองทุน", defaultAmountCents: 500000, sortOrder: 20 },
      { category: "SAVING" as const, name: "หุ้น", defaultAmountCents: 300000, sortOrder: 21 },
      { category: "SAVING" as const, name: "Bitcoin", defaultAmountCents: 200000, sortOrder: 22 },
      { category: "SAVING" as const, name: "เงินฝากธนาคาร", defaultAmountCents: 500000, sortOrder: 23 },
      // Goals
      { category: "GOAL" as const, name: "เงินเก็บท่องเที่ยว", defaultAmountCents: 300000, sortOrder: 30 },
      { category: "GOAL" as const, name: "เงินเก็บรถ", defaultAmountCents: 500000, sortOrder: 31 },
      { category: "GOAL" as const, name: "เงินเก็บประกัน", defaultAmountCents: 200000, sortOrder: 32 },
      // Family
      { category: "FAMILY" as const, name: "พ่อแม่", defaultAmountCents: 500000, sortOrder: 40 },
      { category: "FAMILY" as const, name: "หลาน", defaultAmountCents: 200000, sortOrder: 41 },
    ];

    await db.insert(schema.templateItems).values(
      items.map((i) => ({ ...i, templateId: template.id }))
    );
    console.log(`✅ Created ${items.length} template items`);
  } else {
    console.log("ℹ️  Default template already exists");
  }

  // ── C) Monthly Plans ─────────────────────────────────────────────────
  const months = ["2026-01", "2026-02"];

  for (const month of months) {
    const [existing] = await db
      .select()
      .from(schema.monthlyPlans)
      .where(eq(schema.monthlyPlans.month, month));

    if (existing) {
      console.log(`ℹ️  Monthly plan ${month} already exists`);
      continue;
    }

    const [plan] = await db
      .insert(schema.monthlyPlans)
      .values({
        userId,
        month,
        templateId: template.id,
        startingBalanceCents: month === "2026-01" ? 5000000 : 3200000,
      })
      .returning();

    // Get template items
    const tplItems = await db
      .select()
      .from(schema.templateItems)
      .where(eq(schema.templateItems.templateId, template.id))
      .orderBy(schema.templateItems.sortOrder);

    const monthItems = tplItems.map((ti, idx) => {
      const isJan = month === "2026-01";
      // Override some amounts for variety
      let actualAmount: number | null = null;
      let status: "PLANNED" | "DONE" | "SKIPPED" = "PLANNED";
      let note: string | null = null;
      let doneAt: Date | null = null;

      if (isJan) {
        // January: most items DONE
        if (ti.category === "INCOME") {
          status = "DONE";
          doneAt = new Date("2026-01-05");
          if (ti.name.includes("att")) actualAmount = 4500000;
        } else if (ti.category === "EXPENSE") {
          status = "DONE";
          doneAt = new Date("2026-01-15");
          if (ti.name.includes("ค่าไฟ")) {
            actualAmount = 350000;
            note = "เดือนนี้ค่าไฟแพงกว่าปกติ";
          }
        } else if (ti.category === "SAVING") {
          status = "DONE";
          doneAt = new Date("2026-01-10");
        } else if (ti.category === "GOAL") {
          status = "DONE";
          doneAt = new Date("2026-01-10");
        } else if (ti.category === "FAMILY") {
          status = "DONE";
          doneAt = new Date("2026-01-08");
          if (ti.name.includes("หลาน")) {
            note = "ค่าเทอมหลาน";
          }
        }
      } else {
        // February: mix DONE and PLANNED
        if (ti.category === "INCOME") {
          if (ti.name.includes("att") || ti.name.includes("aom")) {
            status = "DONE";
            doneAt = new Date("2026-02-05");
          }
        } else if (ti.category === "EXPENSE") {
          if (ti.name.includes("ชีวิตประจำวัน") || ti.name.includes("สินเชื่อ")) {
            status = "DONE";
            doneAt = new Date("2026-02-10");
          }
        }
        // Leave savings, goals, family as PLANNED for Feb
      }

      return {
        planId: plan.id,
        category: ti.category,
        name: ti.name,
        plannedAmountCents: ti.defaultAmountCents,
        actualAmountCents: actualAmount,
        status,
        doneAt,
        note,
        sortOrder: ti.sortOrder,
      };
    });

    await db.insert(schema.monthlyItems).values(monthItems);
    console.log(`✅ Created monthly plan ${month} with ${monthItems.length} items`);
  }

  // ── D) Goal Accounts + Transactions ──────────────────────────────────
  const goalDefs = [
    { name: "ท่องเที่ยว", opening: 1500000 },
    { name: "รถ", opening: 5000000 },
    { name: "ประกัน", opening: 2000000 },
  ];

  for (const gd of goalDefs) {
    let [goal] = await db
      .select()
      .from(schema.goalAccounts)
      .where(eq(schema.goalAccounts.name, gd.name));

    if (!goal) {
      [goal] = await db
        .insert(schema.goalAccounts)
        .values({ userId, name: gd.name, openingBalanceCents: gd.opening })
        .returning();
      console.log(`✅ Created goal: ${gd.name}`);
    }

    // Check if transactions exist
    const existingTxs = await db
      .select()
      .from(schema.goalTransactions)
      .where(eq(schema.goalTransactions.goalAccountId, goal.id));

    if (existingTxs.length === 0) {
      const txs = [];
      if (gd.name === "ท่องเที่ยว") {
        txs.push(
          { goalAccountId: goal.id, type: "DEPOSIT" as const, amountCents: 300000, date: "2026-01-10", note: "ออมเดือน ม.ค." },
          { goalAccountId: goal.id, type: "DEPOSIT" as const, amountCents: 300000, date: "2026-02-10", note: "ออมเดือน ก.พ." },
          { goalAccountId: goal.id, type: "WITHDRAW" as const, amountCents: 500000, date: "2026-01-20", note: "จ่ายตั๋วเครื่องบิน" },
        );
      } else if (gd.name === "รถ") {
        txs.push(
          { goalAccountId: goal.id, type: "DEPOSIT" as const, amountCents: 500000, date: "2026-01-10", note: "ออมเดือน ม.ค." },
          { goalAccountId: goal.id, type: "DEPOSIT" as const, amountCents: 500000, date: "2026-02-10", note: "ออมเดือน ก.พ." },
        );
      } else if (gd.name === "ประกัน") {
        txs.push(
          { goalAccountId: goal.id, type: "DEPOSIT" as const, amountCents: 200000, date: "2026-01-10", note: "ออมเดือน ม.ค." },
          { goalAccountId: goal.id, type: "DEPOSIT" as const, amountCents: 200000, date: "2026-02-10", note: "ออมเดือน ก.พ." },
          { goalAccountId: goal.id, type: "WITHDRAW" as const, amountCents: 1500000, date: "2026-02-15", note: "จ่ายเบี้ยประกันประจำปี" },
        );
      }
      if (txs.length > 0) {
        await db.insert(schema.goalTransactions).values(txs);
        console.log(`  ✅ Added ${txs.length} transactions for goal: ${gd.name}`);
      }
    }
  }

  // ── E) Family Members + Transactions ─────────────────────────────────
  const familyDefs = [
    { name: "พ่อแม่", type: "PARENT" as const },
    { name: "หลาน", type: "CHILD" as const },
  ];

  for (const fd of familyDefs) {
    let [member] = await db
      .select()
      .from(schema.familyMembers)
      .where(eq(schema.familyMembers.name, fd.name));

    if (!member) {
      [member] = await db
        .insert(schema.familyMembers)
        .values({ userId, name: fd.name, type: fd.type })
        .returning();
      console.log(`✅ Created family member: ${fd.name}`);
    }

    const existingTxs = await db
      .select()
      .from(schema.familyTransactions)
      .where(eq(schema.familyTransactions.familyMemberId, member.id));

    if (existingTxs.length === 0) {
      const txs = [];
      if (fd.name === "พ่อแม่") {
        txs.push(
          { familyMemberId: member.id, amountCents: 500000, date: "2026-01-08", note: "ค่าใช้จ่ายเดือน ม.ค." },
          { familyMemberId: member.id, amountCents: 500000, date: "2026-02-08", note: "ค่าใช้จ่ายเดือน ก.พ." },
        );
      } else if (fd.name === "หลาน") {
        txs.push(
          { familyMemberId: member.id, amountCents: 200000, date: "2026-01-08", note: "ค่าขนม ม.ค." },
          { familyMemberId: member.id, amountCents: 300000, date: "2026-02-08", note: "ค่าเทอม ก.พ." },
        );
      }
      if (txs.length > 0) {
        await db.insert(schema.familyTransactions).values(txs);
        console.log(`  ✅ Added ${txs.length} transactions for ${fd.name}`);
      }
    }
  }

  // ── F) Asset Accounts + Transactions ─────────────────────────────────
  const assetDefs = [
    { type: "STOCK" as const, symbol: "SCBSP500", name: "SCB S&P500 Index" },
    { type: "FUND" as const, symbol: "KFGDIV-D", name: "Krungsri Global Dividend Fund" },
    { type: "CRYPTO" as const, symbol: "BTC", name: "Bitcoin" },
    { type: "BANK" as const, symbol: "SCB-SAVINGS", name: "บัญชีออมทรัพย์ SCB" },
  ];

  for (const ad of assetDefs) {
    let [asset] = await db
      .select()
      .from(schema.assetAccounts)
      .where(eq(schema.assetAccounts.symbol, ad.symbol));

    if (!asset) {
      [asset] = await db
        .insert(schema.assetAccounts)
        .values({ userId, type: ad.type, symbol: ad.symbol, name: ad.name })
        .returning();
      console.log(`✅ Created asset: ${ad.symbol}`);
    }

    const existingTxs = await db
      .select()
      .from(schema.assetTransactions)
      .where(eq(schema.assetTransactions.assetAccountId, asset.id));

    if (existingTxs.length > 0) continue;

    const txs: {
      assetAccountId: string;
      type: "BUY" | "SELL" | "DIVIDEND" | "FEE" | "DEPOSIT" | "WITHDRAW" | "OPENING";
      quantity: number | null;
      pricePerUnitCents: number | null;
      amountCents: number;
      date: string;
      note: string | null;
    }[] = [];

    if (ad.symbol === "SCBSP500") {
      txs.push(
        { assetAccountId: asset.id, type: "BUY", quantity: 100, pricePerUnitCents: 1560, amountCents: 156000, date: "2025-10-15", note: "ซื้อครั้งแรก" },
        { assetAccountId: asset.id, type: "BUY", quantity: 50, pricePerUnitCents: 1620, amountCents: 81000, date: "2025-12-10", note: "ซื้อเพิ่ม" },
        { assetAccountId: asset.id, type: "SELL", quantity: 30, pricePerUnitCents: 1700, amountCents: 51000, date: "2026-01-20", note: "ขายบางส่วน" },
        { assetAccountId: asset.id, type: "DIVIDEND", quantity: null, pricePerUnitCents: null, amountCents: 15000, date: "2025-12-28", note: "ปันผล Q4/2025" },
        { assetAccountId: asset.id, type: "DIVIDEND", quantity: null, pricePerUnitCents: null, amountCents: 12000, date: "2026-01-28", note: "ปันผล ม.ค. 2026" },
      );
    } else if (ad.symbol === "KFGDIV-D") {
      txs.push(
        { assetAccountId: asset.id, type: "BUY", quantity: 200, pricePerUnitCents: 1050, amountCents: 210000, date: "2025-11-01", note: "ซื้อกองทุน" },
        { assetAccountId: asset.id, type: "DIVIDEND", quantity: null, pricePerUnitCents: null, amountCents: 8400, date: "2026-02-10", note: "ปันผลกองทุน" },
      );
    } else if (ad.symbol === "BTC") {
      txs.push(
        { assetAccountId: asset.id, type: "BUY", quantity: 1, pricePerUnitCents: 300000000, amountCents: 300000000, date: "2025-09-01", note: "ซื้อ BTC" },
      );
    } else if (ad.symbol === "SCB-SAVINGS") {
      txs.push(
        { assetAccountId: asset.id, type: "OPENING", quantity: null, pricePerUnitCents: null, amountCents: 10000000, date: "2025-01-01", note: "ยอดตั้งต้น" },
        { assetAccountId: asset.id, type: "DEPOSIT", quantity: null, pricePerUnitCents: null, amountCents: 500000, date: "2026-01-10", note: "ฝากเดือน ม.ค." },
        { assetAccountId: asset.id, type: "WITHDRAW", quantity: null, pricePerUnitCents: null, amountCents: 200000, date: "2026-01-25", note: "ถอนใช้จ่าย" },
      );
    }

    if (txs.length > 0) {
      await db.insert(schema.assetTransactions).values(txs);
      console.log(`  ✅ Added ${txs.length} transactions for ${ad.symbol}`);
    }
  }

  console.log("\n🎉 Seed completed successfully!");
  console.log("Summary:");
  console.log("  - 1 Demo User (demo@local)");
  console.log("  - 1 Default Template with 21 items");
  console.log("  - 2 Monthly Plans (2026-01, 2026-02)");
  console.log("  - 3 Goal Accounts with transactions");
  console.log("  - 2 Family Members with transactions");
  console.log("  - 4 Asset Accounts (STOCK, FUND, CRYPTO, BANK) with transactions");
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
