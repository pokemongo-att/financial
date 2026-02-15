"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createTemplate } from "@/actions/templates";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/EmptyState";
import { Plus, ChevronRight, FileText } from "lucide-react";
import { toast } from "sonner";

type Template = {
  id: string;
  name: string;
  isDefault: boolean;
};

export function TemplateList({
  templates,
  userId,
}: {
  templates: Template[];
  userId: string;
}) {
  const router = useRouter();
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    startTransition(async () => {
      try {
        await createTemplate(userId, { name: name.trim() });
        setName("");
        setShowCreate(false);
        toast.success("สร้าง template แล้ว");
        router.refresh();
      } catch {
        toast.error("เกิดข้อผิดพลาด");
      }
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setShowCreate(!showCreate)}>
          <Plus className="w-4 h-4" />
          สร้าง Template ใหม่
        </Button>
      </div>

      {showCreate && (
        <Card className="p-4">
          <form onSubmit={handleCreate} className="flex gap-3">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="ชื่อ template..."
              className="flex-1"
            />
            <Button type="submit" disabled={isPending}>
              {isPending ? "กำลังสร้าง..." : "สร้าง"}
            </Button>
          </form>
        </Card>
      )}

      <div className="space-y-2">
        {templates.map((t) => (
          <Link key={t.id} href={`/templates/${t.id}`}>
            <Card className="p-4 hover:border-indigo-300 transition-colors cursor-pointer">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <FileText className="w-4 h-4 text-slate-400" />
                  <span className="font-medium text-slate-900">{t.name}</span>
                  {t.isDefault && <Badge variant="info">Default</Badge>}
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300" />
              </div>
            </Card>
          </Link>
        ))}
        {templates.length === 0 && (
          <Card>
            <EmptyState
              icon={<FileText className="w-8 h-8" />}
              title="ยังไม่มี template"
              description="สร้าง template เพื่อใช้เป็นแม่แบบรายเดือน"
            />
          </Card>
        )}
      </div>
    </div>
  );
}
