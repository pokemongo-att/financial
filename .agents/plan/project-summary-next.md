# Project Summary & Next Improvements (FinancePlan)

## A) สรุปความต้องการที่ใช้อยู่จริง (Current Requirements)
1. **Template-driven monthly planning**
   - สร้างแผนรายเดือนจาก template
   - มี checklist (`PLANNED/DONE/SKIPPED`) และแก้ยอดรายเดือนได้

2. **Slug-based mapping (สำคัญมาก)**
   - mapping ข้ามโมดูลต้องใช้ slug เพื่อกันชื่อซ้ำ
   - template item และ goal/home-loan ต้องรองรับแก้ slug

3. **Opening balance editable**
   - Goals / Family / Home Loan ต้องกำหนดและแก้ยอดตั้งต้นได้

4. **DONE automation**
   - GOAL item เมื่อ DONE ต้อง auto-record ไป goal account (ตาม slug)
   - HOME_LOAN item เมื่อ DONE ต้องสะท้อนในพอร์ตบ้านที่ slug ตรงกัน
   - ถ้าไม่กรอกยอดจริง ให้ใช้ยอดตามแผน

5. **Template loan grouping**
   - กลุ่มค่าสินเชื่อมีคู่รายการเสมอ: ค่างวด + โป๊ะ
   - ทั้งคู่ใช้ slug เดียวกันเพื่อรวมเข้าพอร์ตเดียว

6. **Readable forms/modals**
   - modal/dropdown ต้องทึบ อ่านชัด ไม่โปร่ง

---

## B) สถานะที่ปรับแล้ว (Implemented)
- เพิ่ม/แก้ slug และ opening balance ในหลายโมดูล
- แก้ monthly edit error (`note` null) และเสถียรภาพ checklist
- เพิ่ม template loan type พร้อม interest rate
- เชื่อม loan pair ด้วย slug และปรับ seed เริ่มต้น
- เพิ่มสร้างพอร์ตสินเชื่อบ้านจากเมนู + auto-create จาก template loan

---

## C) สิ่งที่ควรปรับปรุงต่อไป (Next Improvements)
1. **DB constraints สำหรับ slug**
   - unique per user ใน `goal_accounts.slug` และ `home_loans.slug`
   - index สำหรับ query ตาม slug ให้เร็วขึ้น

2. **Normalization ของ loan monthly mapping**
   - เพิ่มตาราง ledger เฉพาะ home loan (ตอนนี้ derive จาก monthly_items)
   - รองรับรายงานแยก principal/interest ชัดเจนขึ้น

3. **Validation เข้มขึ้น**
   - บังคับ pattern slug สำหรับ loan เช่น `loanxxx-yy`
   - ดอกเบี้ยจำกัดช่วง 0-100 และทศนิยม 2 ตำแหน่ง

4. **Automated tests (high priority)**
   - test status transition DONE/undo
   - test slug mapping across modules
   - test template loan pair -> home loan aggregation

5. **UX polishing**
   - highlight รายการ loan pair ใน template editor
   - add inline hint เมื่อ slug ซ้ำ/ผิดรูปแบบ

6. **Observability**
   - เพิ่ม audit note สำหรับ auto-record (who/when/source item)
   - เพิ่ม admin debug panel สำหรับ linked transaction tracing

---

## D) Recommended Task Order (Next Sprint)
1. Add DB unique constraints + migrations
2. Add test coverage for checklist+slug mapping
3. Add loan slug pattern validator + UI inline validation
4. Refactor home-loan reporting model (optional ledger table)
