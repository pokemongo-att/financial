# Agentic Core Fast Rules (FinancePlan)

วัตถุประสงค์: ลด context ที่ต้องอ่านซ้ำ และทำให้ agent ตัดสินใจเร็วขึ้น

## 1) Quick Start (ทุกงาน)
1. ระบุโดเมนงานก่อนเสมอ: `template` | `monthly` | `goals` | `family` | `home-loan` | `portfolio` | `seed/schema`
2. อ่านไฟล์ขั้นต่ำเฉพาะโดเมน (ดู Section 2)
3. แก้แบบ root-cause ก่อน workaround
4. หลังแก้ให้รันอย่างน้อย:
   - `pnpm run build`
   - ถ้าเกี่ยว schema/seed: `npx drizzle-kit push` + `pnpm run db:seed`

## 2) Minimal Context Map (อ่านเท่าที่จำเป็น)
- Template items: `src/app/templates/[id]/TemplateItemsEditor.tsx`, `src/actions/templates.ts`, `src/lib/validators/template.ts`
- Monthly checklist: `src/app/month/[ym]/MonthlyItemsTable.tsx`, `src/actions/monthly.ts`, `src/lib/validators/monthly.ts`, `src/lib/calc/monthly.ts`
- Goals sync: `src/actions/monthly.ts`, `src/actions/goals.ts`, `src/lib/calc/goals.ts`
- Home loan sync: `src/actions/home-loan.ts`, `src/actions/home-loan-tx.ts`, `src/app/home-loan/*`
- Seed/schema: `src/db/schema.ts`, `src/db/seed.ts`

## 3) Golden Rules (ห้ามพลาด)
- เงินเก็บเป็น cents (`amountCents`) เสมอ
- Mapping ข้ามโมดูลใช้ `slug` ไม่ใช้ชื่อ
- `DONE` ใน checklist ต้องใช้ `actualAmountCents ?? plannedAmountCents`
- Zod ของฟิลด์ text ที่ form อาจว่าง ต้องรองรับ `null`/`optional` อย่างเหมาะสม
- แก้สไตล์ modal/dropdown ให้ทึบ (opaque) เพื่อ readability

## 4) Safe Change Pattern
1. แก้ validator -> action -> UI (ตามลำดับ)
2. ถ้ามี side effect sync (GOAL/Home loan) ให้รองรับทั้ง create + update + revert status
3. เพิ่ม/ปรับ seed ให้สอดคล้อง schema ปัจจุบัน

## 5) Done Criteria (ต่อ PR/งานย่อย)
- Build ผ่าน
- ไม่มี flow regression ของ create/edit/delete ในหน้าเดียวกัน
- สรุปไฟล์ที่แก้ + เหตุผล + behavior หลังแก้
