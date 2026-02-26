# Skill Rule: Monthly Checklist Stability

## Scope
แก้/พัฒนา flow หน้า `/month/[ym]` โดยลดบัคฝั่งแก้ไขยอด/หมายเหตุ/สถานะ

## Mandatory Validation
- `note`, `paymentMethod` ต้องรองรับ `null` ได้
- parse FormData แบบ defensive:
  - ตรวจชนิดก่อน cast เป็น string
  - trim ก่อนใช้

## Edit Modal Rules
- default actual amount = actual เดิม ถ้าไม่มีให้ fallback planned
- แสดง field ดอกเบี้ยเฉพาะรายการ loan-like
- Dropdown/Modal ต้องใช้พื้นหลังทึบ อ่านชัด

## Status Transition Rules
- PLANNED -> DONE: set `doneAt`
- DONE -> SKIPPED/PLANNED: clear side effects linked transaction
- DONE + แก้ยอดใหม่: update linked transaction ตามยอดใหม่

## Regression Checklist
1. แก้ยอด+หมายเหตุแล้วไม่ error (รวมเคส note null)
2. ติ๊ก DONE โดยไม่แก้ยอด ใช้ยอดแผน
3. ติ๊ก DONE แล้วแก้ยอด ใช้ยอดจริง
4. revert สถานะแล้ว linked transaction ถูกล้าง
