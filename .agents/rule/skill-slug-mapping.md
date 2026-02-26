# Skill Rule: Slug Mapping Contract

## เป้าหมาย
ทำให้ข้อมูลเชื่อมข้ามโมดูลแบบ deterministic: Template -> Monthly -> Goals/Home Loan

## Contract
- Template item สามารถมี `slug`
- Monthly item ต้อง copy `slug` จาก template ตอน create monthly plan
- โมดูลปลายทาง map ด้วย slug:
  - GOAL => `goal_accounts.slug`
  - HOME_LOAN => `home_loans.slug`

## Required Fields
- Template loan item ควรมี:
  - `category = EXPENSE`
  - `accountOrSubType = HOME_LOAN`
  - `slug` (บังคับ)
  - `interestRate` (optional)

## Checklist DONE Behavior
- ถ้า `status = DONE`:
  - ใช้ยอด `actualAmountCents ?? plannedAmountCents`
  - sync ธุรกรรมปลายทางตาม slug
- ถ้าเปลี่ยนออกจาก DONE หรือยอด <= 0:
  - ลบ linked transaction ที่ auto-created

## Auto-create Targets
- เมื่อสร้าง template item ที่เป็น HOME_LOAN และมี slug:
  - ถ้าไม่มี `home_loans` slug นั้น ให้สร้างอัตโนมัติด้วยยอดตั้งต้น 0
- เมื่อ update template item แล้ว slug เปลี่ยน:
  - run ensure อีกครั้ง

## Naming Guidance (Loan Pair)
สำหรับสินเชื่อบ้าน 1 พอร์ตควรมีอย่างน้อย 2 รายการใน template:
1. ค่าสินเชื่อบ้าน <id>
2. ค่าสินจ่ายเชื่อโป๊ะบ้าน <id>
ทั้งคู่ต้องใช้ slug เดียวกัน
