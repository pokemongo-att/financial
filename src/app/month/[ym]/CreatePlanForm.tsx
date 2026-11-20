"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CalendarPlus, FileText } from "lucide-react";
import { toast } from "sonner";
import { createMonthlyPlanFromTemplate } from "@/actions/monthly";
import { Card } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/EmptyState";
import { formatThaiMonth } from "@/components/MonthPicker";

type Template = {
  id: string;
  name: string;
};

export function CreatePlanForm({
  month,
  templates,
  userId,
}: {
  month: string;
  templates: Template[];
  userId: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [pendingId, setPendingId] = useState<string | null>(null);

  function handleCreate(templateId: string) {
    setPendingId(templateId);
    startTransition(async () => {
      try {
        await createMonthlyPlanFromTemplate(userId, { month, templateId });
        toast.success("สร้างแผนแล้ว");
        router.refresh();
      } catch {
        toast.error("สร้างแผนไม่สำเร็จ ลองอีกครั้ง");
      }
    });
  }

  return (
    <Card>
      <EmptyState
        icon={<CalendarPlus className="h-10 w-10" />}
        title={`ยังไม่มีแผนสำหรับ${formatThaiMonth(month)}`}
        description="เลือก template เพื่อสร้างรายการของเดือนนี้ในครั้งเดียว"
        action={
          templates.length === 0 ? (
            <Link href="/templates" className={buttonVariants({ variant: "outline" })}>
              สร้าง template ก่อน
            </Link>
          ) : (
            <div className="flex w-full max-w-sm flex-col gap-2 sm:max-w-none sm:flex-row sm:flex-wrap sm:justify-center">
              {templates.map((t) => (
                <Button key={t.id} onClick={() => handleCreate(t.id)} disabled={isPending} className="w-full sm:w-auto">
                  <FileText className="h-4 w-4" />
                  {isPending && pendingId === t.id ? "กำลังสร้าง..." : `สร้างจาก "${t.name}"`}
                </Button>
              ))}
            </div>
          )
        }
      />
    </Card>
  );
}
