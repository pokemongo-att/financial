# Finance Planner Web App — Implementation Plan

สร้าง Web Application สำหรับสรุปการเงินรายเดือนครบวงจร ตาม spec ใน `agents.md`: รายรับ/รายจ่าย/เงินออม/เป้าหมาย/ดูแลครอบครัว + Portfolio หุ้น/กองทุน/BTC/เงินฝาก + Dividend Dashboard

---

## Tech Stack
- **Next.js 16 (App Router)** + TypeScript
- **Tailwind CSS** (mobile-first)
- **Drizzle ORM** + drizzle-kit migrations
- **Neon Postgres** (connection via `DATABASE_URL` in `.env.local`)
- **Zod** สำหรับ validation
- **pnpm** เป็น package manager

---

## Phase 1: Project Scaffolding & Database

### 1.1 Init Project
- `npx create-next-app@latest` with TypeScript + Tailwind + App Router
- ติดตั้ง dependencies: `drizzle-orm`, `@neondatabase/serverless`, `drizzle-kit`, `zod`, `uuid`
- สร้าง `.env.local` พร้อม `DATABASE_URL`
- สร้าง `drizzle.config.ts`

### 1.2 Database Schema (`src/db/schema.ts`)
สร้างตารางทั้งหมดตาม spec Section 5:
- `users` — uuid PK, email, name
- `templates` — name, userId, isDefault
- `template_items` — templateId, category (INCOME/EXPENSE/SAVING/GOAL/FAMILY), name, defaultAmountCents, accountOrSubType, isActive, sortOrder
- `monthly_plans` — userId, month (YYYY-MM), templateId, startingBalanceCents
- `monthly_items` — planId, category, name, plannedAmountCents, actualAmountCents, status (PLANNED/DONE/SKIPPED), doneAt, note, paymentMethod
- `goal_accounts` — userId, name, openingBalanceCents
- `goal_transactions` — goalAccountId, type (DEPOSIT/WITHDRAW), amountCents, date, note, linkedMonthlyItemId
- `family_members` — userId, name, type (PARENT/CHILD)
- `family_transactions` — familyMemberId, amountCents, date, note, monthlyPlanId
- `asset_accounts` — userId, type (STOCK/FUND/CRYPTO/BANK), symbol/code, name
- `asset_transactions` — assetAccountId, type (BUY/SELL/DIVIDEND/FEE/DEPOSIT/WITHDRAW/OPENING), quantity, pricePerUnitCents, amountCents, date, note

> ทุกตาราง: uuid PK, createdAt, updatedAt / เงินเก็บเป็น integer (สตางค์) / indexes ตาม spec 13.10

### 1.3 DB Client & Migration
- `src/db/index.ts` — Neon serverless client + drizzle instance
- รัน `drizzle-kit generate` → `drizzle-kit migrate`

---

## Phase 2: Core Library (`src/lib/`)

### 2.1 Money Utilities (`lib/money.ts`)
- `toCents()`, `fromCents()`, `formatTHB()`

### 2.2 Calculation Engine (`lib/calc/`)
- `monthly.ts` — incomeTotal, expenseTotal, savingsTotal, goalSavingsNet, familySupportTotal, netCashflow, endingBalance
- `goals.ts` — balance จาก openingBalance + sum(DEPOSIT) - sum(WITHDRAW)
- `portfolio.ts` — holdings, avgCost, realizedPnL, totalCost จาก transactions
- `dividends.ts` — totals (all/stock/fund), perAsset summary, filter by date range

### 2.3 Validators (`lib/validators/`)
- `monthly.ts`, `template.ts`, `goals.ts`, `assets.ts` — Zod schemas

---

## Phase 3: Server Actions & API Routes (`src/actions/` + `src/app/api/`)

### 3.1 Server Actions
- `actions/templates.ts` — CRUD template + items
- `actions/monthly.ts` — create plan from template, update item status/amount, get summary
- `actions/goals.ts` — create goal, deposit/withdraw, get balance + history
- `actions/assets.ts` — create asset, add transaction (BUY/SELL/DIVIDEND etc.)

### 3.2 Route Handlers (API)
- `GET /api/portfolio/dividends` — dividend summary with date range filter
- (Optional) export CSV endpoints

---

## Phase 4: UI Pages (`src/app/`)

### 4.1 Dashboard (`/dashboard`)
- MonthPicker เลือกเดือน
- SummaryCards: Income / Expense / Savings / Goal Movement / Family / Net Cashflow
- รายการค้าง (status=PLANNED)

### 4.2 Monthly Plan (`/month/[ym]`)
- ตาราง LineItems: Name | Planned | Actual | Status checkbox | Note
- ฟิลเตอร์ตาม category
- ปุ่ม "Create from Template"

### 4.3 Templates (`/templates`)
- สร้าง/แก้ไข template
- จัดการ template items (เพิ่ม/ลบ/เรียงลำดับ)

### 4.4 Goals (`/goals`)
- รายการเป้าหมาย + ยอดคงเหลือ
- Detail: timeline ฝาก/ถอน, ปุ่มถอน + ระบุเหตุผล

### 4.5 Family Support (`/family`)
- แยกพ่อแม่ / หลาน
- ยอดรวมรายเดือน / รายปี / ทั้งหมด

### 4.6 Portfolio (`/portfolio`)
- Tabs: หุ้น | กองทุน | BTC | เงินฝาก
- ตาราง holdings → drill-down เข้า asset → transactions + เพิ่ม BUY/SELL/DIVIDEND

### 4.7 Dividend Dashboard (`/portfolio/dividends`)
- Summary Cards: Total / Stock / Fund dividends
- Filter: This Month / This Year / Custom Range / All-time
- ตาราง per-asset: Symbol, Name, Type, Count, Total, Last Date

---

## Phase 5: Shared Components (`src/components/`)
- `MonthPicker` — เลือกเดือน YYYY-MM
- `SummaryCards` — การ์ดแสดงยอดสรุป
- `LineItemTable` — ตารางรายการ + status toggle
- `StatusCheckbox` — PLANNED/DONE/SKIPPED toggle
- `TransactionFormModal` — modal สำหรับเพิ่ม transaction
- Layout / Sidebar / Navigation

---

## Phase 6: Seed Data (`src/db/seed.ts`)

สร้าง seed idempotent (`pnpm db:seed`) ตาม spec 13.13:
- **Demo User**: `demo@local` / `ATT Demo`
- **Default Template**: Income 5 items, Expense 7 items
- **Monthly Plans**: `2026-01`, `2026-02` พร้อม override + mix DONE/PLANNED
- **Goals**: ท่องเที่ยว/รถ/ประกัน + deposits ≥ 2, withdraw ≥ 1
- **Family**: พ่อแม่(PARENT), หลาน(CHILD) + transactions 2 เดือน
- **Assets**: STOCK ≥ 1 (BUY 2, SELL 1, DIVIDEND 2), FUND ≥ 1 (BUY 1, DIV 1), BTC (BUY 1), BANK (OPENING/DEPOSIT/WITHDRAW)
- Console log สรุปผลหลัง seed

---

## Phase 7: Final Polish
- Responsive ทุกหน้า (mobile-first)
- Indexes ตาม spec (monthly_items.planId, goal_transactions.goalAccountId+date, asset_transactions.assetAccountId+date)
- README.md พร้อมวิธี setup/run/seed
- ตรวจ Definition of Done (Section 12) ครบทุกข้อ

---

## Implementation Order (สรุป)
| Step | Task | Est. Files |
|------|------|-----------|
| 1 | Project init + deps + env | ~5 |
| 2 | DB schema + migration | ~3 |
| 3 | lib/money + lib/calc/* + lib/validators/* | ~8 |
| 4 | Server actions + API routes | ~5 |
| 5 | UI: Dashboard + Monthly Plan | ~6 |
| 6 | UI: Templates | ~3 |
| 7 | UI: Goals | ~4 |
| 8 | UI: Family | ~3 |
| 9 | UI: Portfolio + Dividend Dashboard | ~6 |
| 10 | Components (shared) | ~6 |
| 11 | Seed data | ~1 |
| 12 | Polish + README | ~2 |

**รวมประมาณ ~52 files** ที่ต้องสร้าง/แก้ไข
