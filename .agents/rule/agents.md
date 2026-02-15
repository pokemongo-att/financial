# agents.md — Finance Planner Web App (Vibe Code Spec for AI)

> เอกสารนี้คือ “คำสั่งให้ AI” ออกแบบและเขียนระบบ Web Application สำหรับสรุปการเงินรายเดือน: รายรับ/รายจ่าย/เงินออม/เงินออมเป้าหมาย/ดูแลพ่อแม่-หลาน + ระบบพอร์ตหุ้น/กองทุนปันผล  
> แนวคิด: **ทำงานแบบ template รายเดือน + checklist (task done) + สรุปยอดอัตโนมัติ + ติดตามการถอนเงินจากเป้าหมาย**

---

## 0) Product North Star
สร้างระบบที่ทำให้ผู้ใช้ “เห็นภาพการเงินต้นเดือน” ได้เร็วที่สุด:
- รู้ว่า **รายรับรวม**, **รายจ่ายรวม**, **ออมรวม**, และ **เงินคงเหลือของเดือน**
- มี **Template รายเดือน** ให้เลือกเพื่อสร้างเดือนใหม่ใน 1 คลิก
- ทุกบรรทัดสามารถ “ติ๊กทำแล้ว” (Paid/Saved/Received) และดูสถานะค้างได้
- เงินออมแบบเป้าหมาย (ท่องเที่ยว/รถ/ประกัน) ต้อง **ติดตามการถอน** และเห็น **ยอดคงเหลือ**
- หุ้น/กองทุน ต้องมี **Portfolio + ต้นทุน + จำนวนหน่วย + ประวัติเคลื่อนไหว + ปันผล**
- มีหน้า **Dividend Dashboard** สรุป “ยอดปันผล” แยกหุ้น/กองทุน และรวมทั้งหมด

---

## 1) Users & Roles
- `Owner` (ผู้ใช้หลัก 1 คน): จัดการทุกอย่างได้
- (Optional future) `Partner`/`Viewer`: ดูได้อย่างเดียวหรือเพิ่มรายการเฉพาะที่ได้รับสิทธิ์

---

## 2) Financial Concepts (Core Buckets)
ระบบต้องมี “หมวดหลัก” เหล่านี้และคำนวณรวมอัตโนมัติ

### 2.1 Income (รายรับ)
แหล่งรายรับหลัก (เริ่มต้นระบบต้องมี preset):
- เงินเดือน `att`
- เงินเดือนแฟน `aom`
- เงินค่าเข้าบ้าน `142/19`
- เงินค่าเข้าบ้าน `50/22`
- เงินพ่อให้

### 2.2 Expense (รายจ่าย)
รายการรายจ่ายหลัก (preset):
- ค่าน้ำมัน
- `tel` ค่าโทรศัพท์/อินเตอร์เน็ต
- ค่าไฟฟ้า
- ค่าใช้จ่ายในชีวิตประจำวันที่เป็นก้อนใหญ่ทั้งเดือน `10,000`
- เงินโป๊ะบ้าน
- ค่าสินเชื่อบ้าน `144/49`
- ค่าสินเชื่อบ้าน `50/22`

### 2.3 Savings (เงินออมทั่วไป)
เงินออมต้องแยกประเภทได้ และต้องใส่ “ยอดตั้งต้นก่อนเริ่มระบบ” ได้:
- กองทุน (ต้องแยก “กอง” ได้)
- หุ้น
- Bitcoin
- เงินฝากธนาคาร

### 2.4 Goal Savings (เงินออมเพื่อวัตถุประสงค์เฉพาะ)
เป้าหมายเริ่มต้น:
- เงินเก็บท่องเที่ยว
- เงินเก็บค่าใช้จ่ายรถ
- เงินเก็บจ่ายประกัน

**เงื่อนไขสำคัญ**
- ต้องบันทึก “ฝากเข้า” และ “ถอนออกไปจ่าย” ได้
- ต้องเห็น **ยอดคงเหลือ (Current Balance)** แบบ real-time
- ทุกการถอนต้องผูกกับเหตุผล/รายการที่จ่าย (optional link ไป expense)

### 2.5 Family Support (เงินดูแลพ่อแม่ และหลาน)
- บันทึกรายการจ่ายให้ “พ่อแม่” และ “หลาน”
- ดูยอดรวมรายเดือน/รายปี และยอดรวมทั้งหมดได้

---

## 3) Monthly Template System (หัวใจของระบบ)
### 3.1 Template Definition
Template คือชุดรายการ (income/expense/saving/goal/family) ที่ผู้ใช้ใช้ซ้ำทุกเดือน

Template ต้องรองรับ:
- ตั้งชื่อ template เช่น “Default เดือนปกติ”
- รายการใน template เป็น “บรรทัด” ที่มี:
  - `name`
  - `category` (income/expense/saving/goal/family)
  - `defaultAmount`
  - `accountOrSubType` (เช่น bank name, fund name, stock bucket ฯลฯ)
  - `isActive`

### 3.2 Create Monthly Plan
เมื่อผู้ใช้เลือกเดือน (เช่น 02/26) และเลือก template:
- ระบบสร้าง `MonthlyPlan` และสร้าง `MonthlyLineItems` จาก template
- ผู้ใช้แก้ยอดได้รายเดือน (override) โดยไม่กระทบ template
- ทุก line item มีสถานะ task:
  - `status`: `PLANNED | DONE | SKIPPED`
  - `doneAt`, `note`, `paymentMethod` (optional)

### 3.3 Monthly Summary
ระบบต้องคำนวณ:
- `incomeTotal`
- `expenseTotal`
- `savingsTotal` (ทั่วไป)
- `goalSavingsNet` (ฝากเข้า - ถอนออก) **แสดงแยก**
- `familySupportTotal`
- `netCashflow` = incomeTotal - expenseTotal - savingsTotal - familySupportTotal
- `endingBalance` (ถ้าผู้ใช้ใส่ startingBalance ต่อเดือน)

> IMPORTANT: “ถอนเงินออมเป้าหมาย” ไม่ควรถูกนับเป็นรายรับใหม่โดยอัตโนมัติ ให้แสดงเป็น movement แยก และสามารถ link ไป monthly item ได้แบบ optional

---

## 4) Portfolio System (หุ้น / กองทุน / BTC / เงินฝาก)
### 4.1 Portfolio Scope
ทำเป็นโมดูล “Assets” แยกจาก MonthlyPlan แต่เชื่อมกันได้

### 4.1.1 Stock Portfolio (หุ้น)
ต้องแสดงต่อ “หุ้นรายตัว”:
- `symbol`, `name` (optional)
- `quantity` จำนวนหน่วย/หุ้น
- `avgCost` ต้นทุนเฉลี่ย
- `totalCost` ต้นทุนรวม
- `realizedPnL` (กำไร/ขาดทุนที่ปิดแล้ว จากการขาย)
- `dividendsReceivedTotal`
- รายการธุรกรรม (Transactions):
  - `BUY`: เพิ่มจำนวน, เพิ่มต้นทุน
  - `SELL`: ลดจำนวน, คำนวณ realized P/L (ใช้ average cost)
  - `DIVIDEND`: เพิ่มยอดปันผลสะสม (ไม่กระทบจำนวนหุ้น)
  - `FEE` (optional)

CRUD ที่ต้องมี:
- เพิ่มหุ้นใหม่
- ซื้อเพิ่ม (เพิ่ม transaction BUY)
- ขายออก (SELL)
- บันทึกปันผล (DIVIDEND)
- แก้ไข/ลบ transaction (ต้อง re-calc holdings อัตโนมัติ)

### 4.1.2 Fund Portfolio (กองทุน)
คล้ายหุ้น แต่ชื่อ “กองทุน” และรองรับปันผล:
- `fundCode`, `fundName`
- `units`, `avgCost`, `totalCost`
- `dividendTransactions`

### 4.1.3 BTC / Crypto
ขั้นต่ำ:
- `asset=BTC`
- `quantity`, `avgCost`, `transactions BUY/SELL`
(ราคา market real-time เป็น optional future)

### 4.1.4 Bank Deposit (เงินฝาก)
ขั้นต่ำ:
- บัญชีเงินฝากหลายบัญชี
- ยอดตั้งต้น + รายการฝาก/ถอน
- (optional) ดอกเบี้ยเป็น transaction

---

## 5) Data Model (แนะนำแบบ ORM Friendly)
> ใช้ relational (Postgres/SQLite) หรือ document DB ก็ได้ แต่ต้องรองรับการคำนวณรวมและ history

### 5.1 Core Tables/Collections
- `users`
- `templates`
- `template_items`
- `monthly_plans`
- `monthly_items`
- `goal_accounts`
- `goal_transactions` (DEPOSIT/WITHDRAW)
- `family_members` (PARENT/CHILD)
- `family_transactions`
- `asset_accounts` (STOCK/FUND/CRYPTO/BANK)
- `asset_transactions`

### 5.2 Key Fields (minimum)
**monthly_plans**
- `id`, `userId`, `month` (YYYY-MM), `startingBalance` (optional)
- cached summary fields (optional) เพื่อให้ list เร็ว

**monthly_items**
- `id`, `planId`, `category`, `name`
- `plannedAmount`, `actualAmount` (default = planned)
- `status`, `doneAt`, `note`

**goal_accounts**
- `id`, `userId`, `name` (travel/car/insurance), `openingBalance`

**goal_transactions**
- `id`, `goalAccountId`, `type` (DEPOSIT/WITHDRAW)
- `amount`, `date`, `note`, `linkedMonthlyItemId?`

**asset_transactions**
- `id`, `assetAccountId`
- `type` (BUY/SELL/DIVIDEND/FEE/DEPOSIT/WITHDRAW/OPENING)
- `quantity`, `pricePerUnit`, `amount`, `date`, `note`

> IMPORTANT: ทุกครั้งที่ insert/update/delete transaction ต้อง re-calc “ยอดคงเหลือ/หน่วย/ต้นทุน/ปันผลสะสม” ให้ถูกต้องเสมอ

---

## 6) Business Rules (ต้องทำให้ถูก)
1) ทุกเดือนต้องเลือก template ได้ และ “แก้ยอดเฉพาะเดือน” ได้  
2) รายการที่เป็น “50/22” สามารถเป็นได้ทั้ง income และ expense (แยกด้วย category ของบรรทัด)  
3) เงินออมเป้าหมาย:
   - ฝากเข้าเพิ่ม balance
   - ถอนออกลด balance และต้องมีประวัติย้อนหลัง
4) Family support รวมยอดได้ทุกเดือน และรวมทั้งหมดได้
5) Portfolio:
   - AVG COST recalculation หลัง BUY/SELL
   - Realized P/L เกิดจาก SELL เท่านั้น
   - DIVIDEND เป็นยอดสะสม (และอาจ map เข้า monthly income ได้แบบ optional)
6) ระบบต้องมี “Opening Balance ก่อนเริ่มใช้งาน” สำหรับ:
   - เงินออมทั่วไปบางประเภท
   - goal accounts
   - asset accounts
   - bank deposit accounts

---

## 7) Screens (UI Requirements)
### 7.1 Dashboard
- เลือกเดือน
- Cards: Income / Expense / Savings / Goal Movement / Family / Net
- รายการค้าง (status=PLANNED)

### 7.2 Monthly Plan Page
- ตารางรายการ: Name | Planned | Actual | Status checkbox | Note
- ฟิลเตอร์ตามหมวด (income/expense/…)
- ปุ่ม “Create from Template”
- Export CSV/Excel (optional)

### 7.3 Templates Page
- สร้าง/แก้ไข template
- จัดการ template items (เพิ่ม/ลบ/เรียงลำดับ)

### 7.4 Goals Page
- รายการเป้าหมาย + ยอดคงเหลือ
- เข้าไปดูรายละเอียด:
  - timeline ฝาก/ถอน
  - ปุ่มถอน (ระบุว่าจะไปจ่ายอะไร)
  - (optional) link ไป monthly expense item

### 7.5 Family Support Page
- แยก “พ่อแม่” และ “หลาน”
- ดูยอดรวมรายเดือน/รายปี

### 7.6 Portfolio Page
Tabs: หุ้น | กองทุน | BTC | เงินฝาก
- ตาราง holdings
- เข้าไปที่ asset รายตัวดู transactions + เพิ่ม BUY/SELL/DIVIDEND

### 7.7 Portfolio Dividend Dashboard (หุ้น + กองทุน)
หน้าใหม่: **/portfolio/dividends**
- Summary Cards:
  - Total Dividends (All Assets)
  - Stock Dividends Total
  - Fund Dividends Total
  - เลือกช่วงเวลา: This Month / This Year / Custom Range / All-time
- ตาราง “Dividends by Asset”:
  - Symbol/Code, Name, Type, Dividend Count, Dividend Total, Last Dividend Date
  - sort ตามยอด/วันที่
- Drill-down:
  - เข้า asset รายตัวแล้วมี section ปันผลรวม + list DIVIDEND transactions

---

## 8) API Contract (ตัวอย่าง)
> ทำเป็น REST หรือ tRPC ก็ได้ แต่ต้องครอบคลุม use-cases

- `POST /templates`
- `POST /templates/:id/items`
- `POST /monthly-plans` (create from template)
- `PATCH /monthly-items/:id` (update amount/status)
- `POST /goals`
- `POST /goals/:id/transactions`
- `GET /goals/:id/balance`
- `POST /assets`
- `POST /assets/:id/transactions`
- `GET /assets/:id/summary` (holdings calc)
- `GET /api/portfolio/dividends?start=YYYY-MM-DD&end=YYYY-MM-DD` (Dividend dashboard)

Dividend summary response shape (ตัวอย่าง):
```ts
{
  totals: { allCents: number, stockCents: number, fundCents: number },
  perAsset: Array<{
    assetAccountId: string,
    code: string,
    name?: string,
    type: "STOCK" | "FUND",
    dividendCount: number,
    dividendTotalCents: number,
    lastDividendAt?: string
  }>
}
```

---

## 9) Seed Data (Preset ที่ต้องมีตั้งแต่เริ่ม)
### 9.1 Default Template Items
**Income**: att, aom, 142/19, 50/22, เงินพ่อให้  
**Expense**: ค่าน้ำมัน, tel, ค่าไฟฟ้า, ชีวิตประจำวัน 10,000, โป๊ะบ้าน, 144/49, 50/22  
**Savings**: กองทุน, หุ้น, BTC, เงินฝากธนาคาร (เป็นหมวด หรือแยกบัญชีได้)  
**Goals**: ท่องเที่ยว, รถ, ประกัน  
**Family**: พ่อแม่, หลาน  

---

## 10) Non-Functional Requirements
- ข้อมูลต้องแก้ไขย้อนหลังได้
- ใช้งานบนมือถือได้ดี (responsive)
- คำนวณยอดต้อง deterministic และ audit ได้ (ดู history)
- มีระบบ backup/export อย่างน้อย CSV

---

## 11) AI Implementation Guidance (คำสั่งสำคัญ)
- สร้างระบบแบบ “เดือน = snapshot” (monthly plan) และ “portfolio = continuous ledger”
- อย่าผสม “ถอนเงินออมเป้าหมาย” เป็นรายรับของเดือนโดยอัตโนมัติ ให้แสดงเป็น movement แยก
- ทุก transaction ต้องสามารถย้อนตรวจสอบได้ (ห้ามแก้ยอดคงเหลือแบบตรง ๆ โดยไม่มี transaction)
- ออกแบบให้เพิ่มหมวด/เพิ่ม template ได้ง่ายในอนาคต

---

## 12) Definition of Done
- ผู้ใช้สร้างเดือนใหม่จาก template ได้
- ติ๊กสถานะ DONE ได้ทุกบรรทัด
- Dashboard สรุปยอดตรงตามรายการ
- Goals ฝาก/ถอนแล้ว balance ถูกต้อง + มีประวัติ
- Portfolio หุ้น: BUY/SELL/DIVIDEND แล้ว holdings + avg cost + realized P/L + dividends total ถูกต้อง
- มีหน้า `/portfolio/dividends` แสดงปันผลรวม แยกหุ้น/กองทุน และรายตัว

---

# 13) Development Approach (AI Vibe Code Guidance)

## 13.1 Tech Stack (Fixed)
- **Next.js (App Router) + TypeScript**
- **Tailwind CSS**
- **Drizzle ORM + drizzle-kit migrations**
- **Neon Postgres**

> เป้าหมาย: ให้ AI เขียนโค้ดได้ “ครบวงจร” ตั้งแต่ DB schema → migrations → API routes/actions → UI pages → calc utilities → seed data

## 13.2 Project Structure (Opinionated)
```
src/
  app/
    (auth)/
    dashboard/
    month/[ym]/
    templates/
    goals/
    family/
    portfolio/
    api/
  components/
  db/
    schema.ts
    index.ts
    seed.ts
  lib/
    money.ts
    calc/
      monthly.ts
      goals.ts
      portfolio.ts
      dividends.ts
    validators/
      monthly.ts
      template.ts
      goals.ts
      assets.ts
  actions/
    monthly.ts
    templates.ts
    goals.ts
    assets.ts
  styles/
```

หลักการ:
- **db/** เก็บ schema + db client + seed
- **lib/calc/** รวมฟังก์ชันคำนวณทั้งหมด (pure functions) เพื่อ test/verify ได้
- **actions/** ใช้ Server Actions (หรือ route handlers) เป็นตัวกลางเรียก DB
- UI ใน `app/` เป็น page-first ตามโมดูล

## 13.3 Environment & Config
- `DATABASE_URL` (Neon Postgres)  value is postgresql://neondb_owner:npg_QPV8Fa0bIjDA@ep-green-resonance-a1rbant3-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
- `NEXT_PUBLIC_APP_NAME` (optional)  
ใช้ `.env.local` และห้าม hardcode connection string

## 13.4 Database Design in Drizzle (Guidelines)
- ใช้ `uuid` เป็น PK ทุกตาราง
- ใช้ `createdAt`, `updatedAt` ทุกตาราง
- เก็บค่าเงินเป็น **integer หน่วยสตางค์** (`amountCents`) เพื่อเลี่ยง float error
- เก็บเดือนเป็น string `YYYY-MM` ใน `monthly_plans.month`

## 13.5 Migrations & Seeding (drizzle-kit)
- รัน `drizzle-kit generate` และ `drizzle-kit migrate`
- ห้ามแก้ migration ที่รันไปแล้วใน prod (ให้สร้าง migration ใหม่เสมอ)

## 13.6 API Strategy (Next.js App Router)
- **Server Actions-first** สำหรับ CRUD ที่มาจากฟอร์มในหน้าเดียวกัน
- **Route Handlers (/app/api/...)** สำหรับ endpoints ที่ reuse ได้ / future mobile client

แนะนำ:
- Server Actions: `create/update monthly items`, `create from template`
- Route Handlers: `portfolio transactions`, `dividends summary`, `export`

## 13.7 Validation & Types
- ใช้ `zod` ใน `lib/validators/*` เพื่อ validate input ทุกครั้งก่อนเขียน DB
- สร้าง type จาก drizzle schema และ reuse ใน UI
- ทำ `money.ts`:
  - `toCents(number|string) -> int`
  - `fromCents(int) -> string`
  - `formatTHB(int) -> string`

## 13.8 Calculation Engine (Deterministic)
- Monthly summary คำนวณจาก `monthly_items` แบบ pure function
- Goals/Portfolio คำนวณจาก ledger transactions เสมอ
- แก้/ลบ transaction ต้อง re-run calc และอัปเดตผลทันที

## 13.9 UI Implementation Guidance (Tailwind)
- Mobile-first
- Cards + tables responsive
- แนะนำ components:
  - `MonthPicker`, `SummaryCards`, `LineItemTable`, `StatusCheckbox`, `TransactionFormModal`

## 13.10 Performance & DX
- ใช้ server components เป็นหลัก, client เฉพาะจุด interactive
- เพิ่ม indexes:
  - monthly_items(planId)
  - goal_transactions(goalAccountId, date)
  - asset_transactions(assetAccountId, date)

## 13.11 Deployment Notes (Neon)
- ตั้ง Neon database + env ใน Vercel/Hosting
- ใช้ connection pooling ตามแนวทาง Neon (กรณี serverless)
- migrations ควรรันผ่าน pipeline (หรือ step ที่กำหนดชัดเจน)

## 13.12 Acceptance Checklist for AI
AI ต้องส่งมอบอย่างน้อย:
1) drizzle schema + migrations + seed
2) หน้า Templates → สร้าง template และ items
3) หน้า Month → สร้างเดือนจาก template + ติ๊ก DONE + สรุปยอด
4) หน้า Goals → ฝาก/ถอน + balance + history
5) หน้า Portfolio (Stocks/Funds) → BUY/SELL/DIVIDEND + holdings calc ถูกต้อง
6) หน้า Dividends Dashboard → totals + per-asset + filter ช่วงเวลา

---

## 13.13 Seed & Mock Data Requirements (ต้องมีข้อมูลจำลองในฐานตามสเปค)

### 13.13.1 เป้าหมาย
ระบบต้อง “เปิดแล้วใช้งานได้ทันที” โดยมีข้อมูลจำลองครบ:
- เห็นภาพรายเดือน (income/expense/savings/goals/family) ตาม template จริง
- เห็นการติ๊ก DONE บางรายการ (เพื่อเป็นตัวอย่าง workflow)
- เห็น Goals ที่มีทั้ง “ฝากเข้า” และ “ถอนออก” พร้อมยอดคงเหลือ
- เห็น Portfolio หุ้น/กองทุน ที่มี BUY/SELL/DIVIDEND และคำนวณได้ตรง
- เห็น Dividend dashboard มีข้อมูลพอสำหรับ filter ช่วงเวลา

### 13.13.2 Seed Strategy (drizzle + Neon)
ให้ทำ seed แบบ **idempotent** (รันซ้ำได้ ไม่สร้างข้อมูลซ้ำ) โดยใช้คีย์อ้างอิงที่ชัดเจน เช่น:
- `user.email = "demo@local"`
- `template.name = "Default เดือนปกติ"`
- `goal_accounts.name in ["ท่องเที่ยว","รถ","ประกัน"]`
- `asset_accounts.code/symbol` เป็น unique

ต้องมีคำสั่งรัน seed:
- `pnpm db:seed` หรือ `npm run db:seed` (เลือกอย่างใดอย่างหนึ่ง)

### 13.13.3 Demo Data Set (Minimum Required)
**A) Demo User**
- `demo@local`, ชื่อ `ATT Demo`, (optional) timezone `Asia/Bangkok`

**B) Default Template (ตรงตาม spec)**
- Income: att, aom, 142/19, 50/22, เงินพ่อให้
- Expense: ค่าน้ำมัน, tel, ค่าไฟ, ชีวิตประจำวัน 10,000, โป๊ะบ้าน, 144/49, 50/22

**C) Monthly Plans อย่างน้อย 2 เดือน**
- `2026-01`, `2026-02`
- ต้องมีการ override ยอดบางรายการ และมีรายการ DONE/PLANNED ผสมกัน
- มี note ตัวอย่างอย่างน้อย 1–2 รายการ

**D) Goals + Transactions**
- goal accounts: ท่องเที่ยว/รถ/ประกัน (openingBalance > 0)
- transactions: ฝากเข้า ≥ 2, ถอนออก ≥ 1
- อย่างน้อย 1 ถอน link ไป monthly expense item (optional)

**E) Family Support**
- members: พ่อแม่(type=PARENT), หลาน(type=CHILD)
- transactions: อย่างน้อยเดือนละ 1 รายการใน 2 เดือน เพื่อโชว์ยอดรวมรายเดือน/รวมทั้งหมด

**F) Savings & Assets (Portfolio Demo)**
สร้าง asset accounts อย่างน้อย:
- STOCK: อย่างน้อย 1 ตัว (เช่น SCBSP500 หรือ JEPQ)
- FUND: อย่างน้อย 1 กอง (เช่น KFGDIV-D)
- CRYPTO: BTC
- BANK: อย่างน้อย 1 บัญชี

ธุรกรรมขั้นต่ำ:
- หุ้น: BUY 2, SELL 1, DIVIDEND ≥ 2 (ต่างเดือนเพื่อ filter)
- กองทุน: BUY 1, DIVIDEND ≥ 1
- BTC: BUY 1
- BANK: OPENING/DEPOSIT/WITHDRAW อย่างน้อยอย่างละ 1

**Expected behavior**
- holdings, avgCost, realizedPnL, dividends totals คำนวณถูกต้องและมองเห็นได้ใน UI

### 13.13.4 Seed Output Verification
หลังรัน seed ต้องมีวิธีตรวจสอบอย่างน้อย 1 แบบ:
- console log สรุปสิ่งที่สร้าง
หรือ
- dashboard แสดง “Demo badge” และ default ไปที่เดือน `2026-02`

### 13.13.5 Developer Notes
- ห้าม seed แบบสุ่มที่ทำให้ยอดไม่สัมพันธ์กัน
- ยอดต้องเป็นตัวเลขอ่านรู้เรื่อง (เช่น 15600, 17190, 10000)
- seed ต้องสะท้อนโครงสร้างจริงของระบบ: template → monthly plan → items, goals ledger, assets ledger
- ต้องมีอย่างน้อย 1 เดือนที่รายการ “ยังไม่ DONE” เพื่อโชว์ task tracking
