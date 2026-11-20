"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Check, X } from "lucide-react";
import { toast } from "sonner";
import { updateTemplate } from "@/actions/templates";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function TemplateDetailHeader({
  templateId,
  templateName,
}: {
  templateId: string;
  templateName: string;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(templateName);
  const [saving, setSaving] = useState(false);

  function cancel() {
    setEditing(false);
    setName(templateName);
  }

  async function handleSave(e?: React.FormEvent) {
    e?.preventDefault();
    if (!name.trim() || name.trim() === templateName) {
      cancel();
      return;
    }
    setSaving(true);
    try {
      await updateTemplate(templateId, { name: name.trim() });
      toast.success("เปลี่ยนชื่อแม่แบบแล้ว");
      setEditing(false);
      router.refresh();
    } catch {
      toast.error("แก้ไขชื่อไม่สำเร็จ ลองอีกครั้ง");
    } finally {
      setSaving(false);
    }
  }

  if (editing) {
    return (
      <form onSubmit={handleSave} className="flex items-center gap-2">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Escape" && cancel()}
          className="max-w-md flex-1 text-base font-semibold"
          aria-label="ชื่อแม่แบบ"
          autoFocus
          disabled={saving}
        />
        <Button type="submit" size="icon" variant="outline" disabled={saving} aria-label="บันทึกชื่อ">
          <Check className="h-4 w-4 text-emerald-600" />
        </Button>
        <Button type="button" size="icon" variant="ghost" onClick={cancel} aria-label="ยกเลิก">
          <X className="h-4 w-4 text-slate-500" />
        </Button>
      </form>
    );
  }

  return (
    <PageHeader title={templateName} subtitle="แก้ไขรายการในแม่แบบ" backHref="/templates" backLabel="กลับไปหน้าแม่แบบรายเดือน">
      <Button variant="outline" onClick={() => setEditing(true)}>
        <Pencil className="h-4 w-4" />
        แก้ไขชื่อ
      </Button>
    </PageHeader>
  );
}
