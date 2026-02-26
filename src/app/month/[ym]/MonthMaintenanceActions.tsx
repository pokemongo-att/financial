"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { clearMonthlyTestData } from "@/actions/monthly";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

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
        toast.error("เกิดข้อผิดพลาดในการล้างข้อมูลรายเดือน");
      }
    });
  }

  return (
    <>
      <Button
        type="button"
        variant="outline"
        className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
        onClick={() => setOpenConfirm(true)}
        disabled={isPending}
      >
        <Trash2 className="w-4 h-4" />
        ล้างข้อมูลทดสอบรายเดือน
      </Button>

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
