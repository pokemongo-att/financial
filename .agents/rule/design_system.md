# update-v1.md — Fintech Clean UI/UX Pack (for existing AI vibe code)

> ใช้ไฟล์นี้เป็น “คำสั่งอัปเดต” ให้ AI ปรับ UX/UI ของโปรเจกต์ Next.js (App Router) + Tailwind ที่คุณสั่งทำไว้แล้ว  
> เป้าหมาย: ทำให้หน้าตา **Fintech clean**, อ่านตัวเลขง่าย, ตารางใช้งานลื่น, CTA ชัด, ไม่รก

---

## 1) UI Direction: Fintech Clean (Must Follow)
### Color & Visual Language
- ใช้พื้นหลัง **ขาว** เป็นหลัก, ตัวอักษร `slate-900`, muted `slate-500`, เส้น `slate-200`
- มี **Primary color แค่ 1 สี** สำหรับ CTA / active state เท่านั้น (แนะนำ indigo/blue)
- Success/Warning/Destructive ใช้เฉพาะสถานะ (DONE / overdue / delete) และต้องเป็น “subtle” ไม่ทึบทั้งแถว

### Typography
- ทุกตัวเลขที่เป็นเงิน/จำนวนหน่วย ต้องใช้ `tabular-nums`
- Heading: `text-2xl font-semibold tracking-tight`
- Body: `text-sm text-slate-600`
- Amount: `font-medium tabular-nums text-slate-900`

### Layout & Density
- ทุกหน้าใช้ `container max-w-7xl`
- ใช้ grid 12 columns สำหรับ dashboard
- Cards ต้องโค้ง `rounded-2xl` + border บาง + shadow เบา (`shadow-sm`)
- “ปุ่มเด่น” ต่อหน้า **มีได้แค่ 1 ปุ่ม** (Primary CTA)

---

## 2) Recommended UI Libraries (Install / Use)
> ใช้ร่วมกับ Tailwind ได้ดี และเหมาะกับ fintech data-heavy

### Required
- **shadcn/ui** (ใช้ component ทั้งระบบ)
- **lucide-react** (icons)
- **react-hook-form** + **zod** + **@hookform/resolvers**
- **@tanstack/react-table** (tables)
- **recharts** (charts dashboard)
- **sonner** (toast)
- (optional) **next-themes** (dark mode)

### Optional (ถ้าข้อมูลรายการเยอะ)
- **@tanstack/react-virtual** (virtualized table/list)

---

## 3) Implementation Rules (Critical)
### 3.1 Page Header Pattern (ทุกหน้าต้องมี)
- ซ้าย: Title + subtitle
- ขวา: Primary CTA 1 ปุ่ม + secondary actions ใน DropdownMenu (⋯)
- ห้ามวางปุ่มหลายสี/หลายขนาดแข่งกัน

### 3.2 Table UX Standard
Tables (Monthly Items / Transactions / Dividends) ต้องมี:
- Search input
- Filters (category/status/type/date range)
- Sorting (amount/date)
- Row actions ใน menu (⋯): Edit / Duplicate / Delete
- Empty state: ข้อความ + CTA ช่วยเริ่มต้น
- Skeleton loading: แทน spinner ลอย ๆ

### 3.3 Form UX Standard
ทุกฟอร์มต้อง:
- ใช้ react-hook-form + zod validation
- แบ่ง section ชัดเจน: Basic info / Amount / Date / Note
- มี submit state: disabled + “Saving…”
- Confirm dialog ก่อน action สำคัญ (ขายหุ้น/ถอนเงิน/ลบ)

### 3.4 Money Handling UX
- UI แสดง THB แบบอ่านง่าย (comma separators)
- DB เก็บเป็น `amountCents` (integer) เสมอ
- มี `MoneyInput` ที่ format ตอน blur และแก้ได้ง่ายตอน focus

---

## 4) UI Prompt Pack (Copy/Paste to AI)
คัดลอกไปสั่ง AI อัปเดต UI ได้ทันที:

```txt
อัปเดต UX/UI ให้เป็นสไตล์ “Fintech clean” สำหรับ Next.js App Router + Tailwind โดยใช้ shadcn/ui + lucide-react
- โทนสี: background ขาว, text slate-900, muted slate-500, border slate-200, primary สีเดียว (เช่น indigo)
- Typography: ทุกค่าที่เป็นเงิน/จำนวนหน่วยใช้ tabular-nums และตัวเลขต้องเด่นอ่านง่าย
- Layout: container max-w-7xl, grid 12 columns, spacing โปร่ง (gap-4/6), cards rounded-2xl border + shadow-sm
- ทุกหน้ามี PageHeader (title+subtitle) + primary CTA 1 ปุ่ม + secondary actions อยู่ใน DropdownMenu
- Dashboard: MonthPicker + SummaryCards (Income/Expense/Savings/Goals/Family/Net) + charts (recharts) แบบ minimal
- Monthly Plan: DataTable (TanStack) ต้องมี search/filter/sort, row actions (⋯), empty state + skeleton
- Forms: react-hook-form + zod, MoneyInput แสดง THB แต่เก็บเป็น cents, error message ชัด
- Feedback: toast (sonner) แบบสั้น, confirm dialog ก่อน delete/ถอนเงิน/ขายหุ้น
- สถานะ DONE/PLANNED ใช้ Badge แบบ subtle ห้ามย้อมสีทึบทั้ง row
```
---

## 5) Components to Add (ให้ทั้งระบบ “เนียน” และใช้ซ้ำได้)
> สร้าง/ปรับ component เหล่านี้ แล้ว refactor หน้าเดิมให้ใช้

### 5.1 `PageHeader`
- Props: `title`, `subtitle?`, `primaryAction?`, `secondaryActions?`
- Layout: left text + right buttons

### 5.2 `SummaryCards`
- ใช้บน dashboard
- Card: label เล็ก + number ใหญ่ (tabular) + optional delta

### 5.3 `MoneyInput`
- Controlled input รองรับ comma separators
- onBlur: format display
- onSubmit: ส่ง `amountCents`

### 5.4 `DataTable`
- Wrapper ของ TanStack Table
- Built-in: search, filters slot, pagination, row actions menu
- รองรับ empty state + skeleton

### 5.5 `EmptyState` + `SkeletonList`
- ให้ทุก list page มีมาตรฐานเดียวกัน

---

## 6) Tailwind Class Cheatsheet (Fintech Clean)
- Card: `rounded-2xl border bg-white shadow-sm`
- Page container: `container mx-auto max-w-7xl px-4`
- Title: `text-2xl font-semibold tracking-tight`
- Subtitle: `text-sm text-slate-600`
- Muted: `text-sm text-slate-500`
- Amount: `font-medium tabular-nums text-slate-900`
- Table header: `text-xs font-medium text-slate-500 uppercase`
- Divider: `border-slate-200`

---

## 7) Must Update Screens (Priority Order)
1) `/dashboard`
- เพิ่ม Month picker ชัดเจน
- Summary cards 4–6 ใบ
- Charts minimal (recharts)

2) `/month/[ym]`
- ตารางรายการเป็นหัวใจ: search/filter/sort + status checkbox + row actions (⋯)

3) `/portfolio` + `/portfolio/dividends`
- holdings table + transaction list
- dividends dashboard: totals + per-asset table + date range filter

4) `/goals`
- goal cards + balance + timeline ledger

5) `/family`
- summary + list transactions

---

## 8) Acceptance Criteria (UI)
- ทุกหน้ามี PageHeader + CTA เด่น 1 ปุ่ม
- ทุกตารางมี search/filter/sort/row actions + empty state + skeleton
- Money input แสดงสวย เก็บ cents ถูกต้อง
- Status badges subtle, ไม่ย้อมสีทึบทั้งแถว
- Dashboard ดูเป็น fintech: โปร่ง อ่านง่าย ตัวเลขเด่น และไม่รก
