import {
  pgTable,
  uuid,
  varchar,
  text,
  integer,
  timestamp,
  boolean,
  date,
  index,
  pgEnum,
} from "drizzle-orm/pg-core";

// ── Enums ──────────────────────────────────────────────────────────────
export const categoryEnum = pgEnum("category", [
  "INCOME",
  "EXPENSE",
  "SAVING",
  "GOAL",
  "FAMILY",
]);

export const itemStatusEnum = pgEnum("item_status", [
  "PLANNED",
  "DONE",
  "SKIPPED",
]);

export const goalTxTypeEnum = pgEnum("goal_tx_type", [
  "DEPOSIT",
  "WITHDRAW",
]);

export const familyMemberTypeEnum = pgEnum("family_member_type", [
  "PARENT",
  "CHILD",
]);

export const assetTypeEnum = pgEnum("asset_type", [
  "STOCK",
  "FUND",
  "CRYPTO",
  "BANK",
]);

export const assetTxTypeEnum = pgEnum("asset_tx_type", [
  "BUY",
  "SELL",
  "DIVIDEND",
  "FEE",
  "DEPOSIT",
  "WITHDRAW",
  "OPENING",
]);

// ── Users ──────────────────────────────────────────────────────────────
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ── Templates ──────────────────────────────────────────────────────────
export const templates = pgTable("templates", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),
  name: varchar("name", { length: 255 }).notNull(),
  isDefault: boolean("is_default").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const templateItems = pgTable("template_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  templateId: uuid("template_id")
    .notNull()
    .references(() => templates.id, { onDelete: "cascade" }),
  category: categoryEnum("category").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  defaultAmountCents: integer("default_amount_cents").default(0).notNull(),
  accountOrSubType: varchar("account_or_sub_type", { length: 255 }),
  isActive: boolean("is_active").default(true).notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ── Monthly Plans ──────────────────────────────────────────────────────
export const monthlyPlans = pgTable("monthly_plans", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),
  month: varchar("month", { length: 7 }).notNull(), // YYYY-MM
  templateId: uuid("template_id").references(() => templates.id),
  startingBalanceCents: integer("starting_balance_cents"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const monthlyItems = pgTable(
  "monthly_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    planId: uuid("plan_id")
      .notNull()
      .references(() => monthlyPlans.id, { onDelete: "cascade" }),
    category: categoryEnum("category").notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    plannedAmountCents: integer("planned_amount_cents").default(0).notNull(),
    actualAmountCents: integer("actual_amount_cents"),
    status: itemStatusEnum("status").default("PLANNED").notNull(),
    doneAt: timestamp("done_at"),
    note: text("note"),
    paymentMethod: varchar("payment_method", { length: 100 }),
    sortOrder: integer("sort_order").default(0).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [index("idx_monthly_items_plan_id").on(table.planId)]
);

// ── Goal Accounts ──────────────────────────────────────────────────────
export const goalAccounts = pgTable("goal_accounts", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),
  name: varchar("name", { length: 255 }).notNull(),
  openingBalanceCents: integer("opening_balance_cents").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const goalTransactions = pgTable(
  "goal_transactions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    goalAccountId: uuid("goal_account_id")
      .notNull()
      .references(() => goalAccounts.id, { onDelete: "cascade" }),
    type: goalTxTypeEnum("type").notNull(),
    amountCents: integer("amount_cents").notNull(),
    date: date("date").notNull(),
    note: text("note"),
    linkedMonthlyItemId: uuid("linked_monthly_item_id").references(
      () => monthlyItems.id
    ),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("idx_goal_tx_account_date").on(table.goalAccountId, table.date),
  ]
);

// ── Family ─────────────────────────────────────────────────────────────
export const familyMembers = pgTable("family_members", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),
  name: varchar("name", { length: 255 }).notNull(),
  type: familyMemberTypeEnum("type").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const familyTransactions = pgTable("family_transactions", {
  id: uuid("id").primaryKey().defaultRandom(),
  familyMemberId: uuid("family_member_id")
    .notNull()
    .references(() => familyMembers.id, { onDelete: "cascade" }),
  amountCents: integer("amount_cents").notNull(),
  date: date("date").notNull(),
  note: text("note"),
  monthlyPlanId: uuid("monthly_plan_id").references(() => monthlyPlans.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ── Assets (Portfolio) ─────────────────────────────────────────────────
export const assetAccounts = pgTable("asset_accounts", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),
  type: assetTypeEnum("type").notNull(),
  symbol: varchar("symbol", { length: 50 }).notNull(),
  name: varchar("name", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const assetTransactions = pgTable(
  "asset_transactions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    assetAccountId: uuid("asset_account_id")
      .notNull()
      .references(() => assetAccounts.id, { onDelete: "cascade" }),
    type: assetTxTypeEnum("type").notNull(),
    quantity: integer("quantity"), // in smallest unit (shares, units, satoshi)
    pricePerUnitCents: integer("price_per_unit_cents"),
    amountCents: integer("amount_cents").notNull(),
    date: date("date").notNull(),
    note: text("note"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("idx_asset_tx_account_date").on(table.assetAccountId, table.date),
  ]
);
