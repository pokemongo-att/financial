"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { clearMonthlyTestData } from "@/actions/monthly";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { RowActions } from "@/components/RowActions";

/** Rare, destructive maintenance lives behind the page's "⋯" menu. */
export function MonthMaintenanceActions({ userId }: { userId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [openConfirm, setOpenConfirm] = useState(false);

  function handleClearAllMonths() {
    startTransition(async () => {
      try {
        const result = await clearMonthlyTestData(userId);
        toast.success(`ล้างข้อมูลแผนรายเดือนแล้ว ${result.deletedPlans} เดือน`);
        setOpenConfirm(false);
        router.refresh();
      } catch {
        toast.error("ล้างข้อมูลรายเดือนไม่สำเร็จ ลองอีกครั้ง");
      }
    });
  }

  return (
    <>
      <RowActions
        label="ตัวเลือกของหน้านี้"
        className="h-10 w-10 border border-slate-200 bg-white text-slate-500 shadow-sm pointer-coarse:h-12 pointer-coarse:w-12"
        actions={[
          {
            label: "ล้างข้อมูลทดสอบรายเดือน",
            icon: Trash2,
            onSelect: () => setOpenConfirm(true),
            destructive: true,
          },
        ]}
      />

      <ConfirmDialog
        open={openConfirm}
        onClose={() => setOpenConfirm(false)}
        onConfirm={handleClearAllMonths}
        title="ล้างข้อมูลรายเดือนทั้งหมด"
        description="ระบบจะลบแผนรายเดือนและรายการ TODO รายเดือนที่เคยทดสอบทั้งหมดในทุกเดือน คุณแน่ใจหรือไม่?"
        confirmLabel="ล้างข้อมูล"
        loading={isPending}
      />
    </>
  );
}
