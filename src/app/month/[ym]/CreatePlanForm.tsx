"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { createMonthlyPlanFromTemplate } from "@/actions/monthly";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/EmptyState";
import { CalendarPlus } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

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

  function handleCreate(templateId: string) {
    startTransition(async () => {
      try {
        await createMonthlyPlanFromTemplate(userId, { month, templateId });
        toast.success("สร้างแผนแล้ว");
        router.refresh();
      } catch {
        toast.error("เกิดข้อผิดพลาดในการสร้างแผน");
      }
    });
  }

  return (
    <Card>
      <EmptyState
        icon={<CalendarPlus className="w-10 h-10" />}
        title={`ยังไม่มีแผนสำหรับเดือน ${month}`}
        description="เลือก template เพื่อสร้างแผนรายเดือน"
        action={
          <div className="flex flex-wrap justify-center gap-3">
            {templates.map((t) => (
              <Button
                key={t.id}
                onClick={() => handleCreate(t.id)}
                disabled={isPending}
              >
                {isPending ? "กำลังสร้าง..." : `สร้างจาก "${t.name}"`}
              </Button>
            ))}
            {templates.length === 0 && (
              <Link href="/templates">
                <Button variant="outline">สร้าง template ก่อน</Button>
              </Link>
            )}
          </div>
        }
      />
    </Card>
  );
}
