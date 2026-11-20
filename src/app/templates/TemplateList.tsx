"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, ChevronRight, FileText, Pencil, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { createTemplate, deleteTemplate, updateTemplate, copyTemplate } from "@/actions/templates";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { EmptyState } from "@/components/EmptyState";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { RowActions } from "@/components/RowActions";
import { Field } from "@/components/Field";

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
  const [copyFromId, setCopyFromId] = useState("");
  const [isPending, startTransition] = useTransition();

  // Rename state
  const [renameItem, setRenameItem] = useState<Template | null>(null);
  const [renameName, setRenameName] = useState("");
  const [savingRename, setSavingRename] = useState(false);

  // Delete state
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    startTransition(async () => {
      try {
        if (copyFromId) {
          await copyTemplate(userId, copyFromId, name.trim());
          toast.success("Copy template แล้ว");
        } else {
          await createTemplate(userId, { name: name.trim() });
          toast.success("สร้าง template แล้ว");
        }
        setName("");
        setCopyFromId("");
        setShowCreate(false);
        router.refresh();
      } catch {
        toast.error("สร้าง template ไม่สำเร็จ ลองอีกครั้ง");
      }
    });
  }

  async function handleRename(e: React.FormEvent) {
    e.preventDefault();
    if (!renameItem || !renameName.trim()) return;
    setSavingRename(true);
    try {
      await updateTemplate(renameItem.id, { name: renameName.trim() });
      toast.success("แก้ไขชื่อ template แล้ว");
      setRenameItem(null);
      setRenameName("");
      router.refresh();
    } catch {
      toast.error("แก้ไขชื่อไม่สำเร็จ ลองอีกครั้ง");
    } finally {
      setSavingRename(false);
    }
  }

  async function handleDelete() {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await deleteTemplate(deleteId);
      toast.success("ลบ template แล้ว");
      router.refresh();
    } catch {
      toast.error("ลบไม่สำเร็จ ลองอีกครั้ง");
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setShowCreate(!showCreate)} variant={showCreate ? "outline" : "default"} aria-expanded={showCreate}>
          {showCreate ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {showCreate ? "ปิด" : "สร้าง Template ใหม่"}
        </Button>
      </div>

      {showCreate && (
        <Card className="p-4 sm:p-5">
          <form onSubmit={handleCreate} className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
            <Field label="ชื่อ template">
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="เช่น เดือนปกติ" autoFocus />
            </Field>
            {templates.length > 0 ? (
              <Field label="เริ่มจาก">
                <Select value={copyFromId} onChange={(e) => setCopyFromId(e.target.value)}>
                  <option value="">template ว่าง</option>
                  {templates.map((t) => (
                    <option key={t.id} value={t.id}>
                      Copy จาก: {t.name}
                    </option>
                  ))}
                </Select>
              </Field>
            ) : (
              <span className="hidden sm:block" />
            )}
            <Button type="submit" disabled={isPending || !name.trim()}>
              {isPending ? "กำลังสร้าง..." : copyFromId ? "Copy & สร้าง" : "สร้าง"}
            </Button>
          </form>
        </Card>
      )}

      {templates.length > 0 ? (
        <Card className="overflow-hidden">
          <ul className="divide-y divide-slate-100">
            {templates.map((t) => (
              <li key={t.id} className="flex items-center gap-1 pr-2 sm:pr-3">
                <Link
                  href={`/templates/${t.id}`}
                  className="flex min-w-0 flex-1 items-center gap-3 px-4 py-3.5 transition-colors hover:bg-slate-50/60 active:bg-slate-50"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                    <FileText className="h-4 w-4" />
                  </span>
                  <span className="truncate font-medium text-slate-900">{t.name}</span>
                  {t.isDefault && (
                    <Badge variant="info" className="shrink-0">
                      Default
                    </Badge>
                  )}
                  <ChevronRight className="ml-auto h-4 w-4 shrink-0 text-slate-300" />
                </Link>
                <RowActions
                  label={`ตัวเลือกของ ${t.name}`}
                  actions={[
                    {
                      label: "แก้ไขชื่อ",
                      icon: Pencil,
                      onSelect: () => {
                        setRenameItem(t);
                        setRenameName(t.name);
                      },
                    },
                    { label: "ลบ template", icon: Trash2, onSelect: () => setDeleteId(t.id), destructive: true },
                  ]}
                />
              </li>
            ))}
          </ul>
        </Card>
      ) : (
        <Card>
          <EmptyState
            icon={<FileText className="h-8 w-8" />}
            title="ยังไม่มี template"
            description="สร้าง template เพื่อใช้เป็นแม่แบบรายเดือน"
          />
        </Card>
      )}

      {/* Rename Dialog */}
      <Dialog
        open={renameItem !== null}
        onOpenChange={(open) => {
          if (!open) {
            setRenameItem(null);
            setRenameName("");
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>แก้ไขชื่อ Template</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleRename} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="renameName">ชื่อ Template</Label>
              <Input
                id="renameName"
                value={renameName}
                onChange={(e) => setRenameName(e.target.value)}
                placeholder="ชื่อ template..."
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setRenameItem(null)}>
                ยกเลิก
              </Button>
              <Button type="submit" disabled={savingRename}>
                {savingRename ? "กำลังบันทึก..." : "บันทึก"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <ConfirmDialog
        open={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="ลบ Template"
        description="คุณต้องการลบ template นี้หรือไม่? รายการทั้งหมดใน template จะถูกลบด้วย"
        confirmLabel="ลบ"
        loading={deleting}
      />
    </div>
  );
}
