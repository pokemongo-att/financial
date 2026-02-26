"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { updateTemplate } from "@/actions/templates";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Pencil, Check, X } from "lucide-react";
import { toast } from "sonner";

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

  async function handleSave() {
    if (!name.trim() || name.trim() === templateName) {
      setEditing(false);
      setName(templateName);
      return;
    }
    setSaving(true);
    try {
      await updateTemplate(templateId, { name: name.trim() });
      toast.success("แก้ไขชื่อ template แล้ว");
      setEditing(false);
      router.refresh();
    } catch {
      toast.error("เกิดข้อผิดพลาด");
    } finally {
      setSaving(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") handleSave();
    if (e.key === "Escape") {
      setEditing(false);
      setName(templateName);
    }
  }

  return (
    <div className="flex items-center gap-3">
      <Link href="/templates" className="text-slate-400 hover:text-slate-600 transition-colors">
        <ArrowLeft className="w-4 h-4" />
      </Link>
      {editing ? (
        <div className="flex items-center gap-2 flex-1">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={handleKeyDown}
            className="max-w-xs"
            autoFocus
            disabled={saving}
          />
          <Button size="sm" variant="ghost" onClick={handleSave} disabled={saving}>
            <Check className="w-4 h-4 text-emerald-600" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setEditing(false);
              setName(templateName);
            }}
          >
            <X className="w-4 h-4 text-slate-400" />
          </Button>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <PageHeader title={templateName} subtitle="แก้ไขรายการ template" />
          <Button size="sm" variant="ghost" onClick={() => setEditing(true)}>
            <Pencil className="w-4 h-4 text-slate-400" />
          </Button>
        </div>
      )}
    </div>
  );
}
