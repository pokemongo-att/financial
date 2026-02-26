"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createTemplate, deleteTemplate, updateTemplate, copyTemplate } from "@/actions/templates";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/EmptyState";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { DropdownMenu, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuContent } from "@/components/ui/dropdown-menu";
import { Plus, ChevronRight, FileText, MoreHorizontal, Pencil, Trash2, Copy } from "lucide-react";
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
        toast.error("เกิดข้อผิดพลาด");
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
      toast.error("เกิดข้อผิดพลาด");
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
      toast.error("เกิดข้อผิดพลาด");
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
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
          <form onSubmit={handleCreate} className="space-y-3">
            <div className="flex gap-3">
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="ชื่อ template..."
                className="flex-1"
              />
              <Button type="submit" disabled={isPending}>
                {isPending ? "กำลังสร้าง..." : copyFromId ? "Copy & สร้าง" : "สร้าง"}
              </Button>
            </div>
            {templates.length > 0 && (
              <div className="flex items-center gap-2">
                <Copy className="w-4 h-4 text-slate-400" />
                <Select
                  value={copyFromId}
                  onChange={(e) => setCopyFromId(e.target.value)}
                >
                  <option value="">— สร้างว่าง (ไม่ copy) —</option>
                  {templates.map((t) => (
                    <option key={t.id} value={t.id}>Copy จาก: {t.name}</option>
                  ))}
                </Select>
              </div>
            )}
          </form>
        </Card>
      )}

      <div className="space-y-2">
        {templates.map((t) => (
          <Card key={t.id} className="p-4 hover:border-indigo-300 transition-colors">
            <div className="flex items-center justify-between">
              <Link href={`/templates/${t.id}`} className="flex-1 flex items-center gap-2.5 cursor-pointer">
                <FileText className="w-4 h-4 text-slate-400" />
                <span className="font-medium text-slate-900">{t.name}</span>
                {t.isDefault && <Badge variant="info">Default</Badge>}
              </Link>
              <div className="flex items-center gap-1">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => {
                        setRenameItem(t);
                        setRenameName(t.name);
                      }}
                    >
                      <Pencil className="mr-2 h-4 w-4" /> แก้ไขชื่อ
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-red-600"
                      onClick={() => setDeleteId(t.id)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" /> ลบ
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Link href={`/templates/${t.id}`}>
                  <ChevronRight className="w-4 h-4 text-slate-300" />
                </Link>
              </div>
            </div>
          </Card>
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
        <DialogContent className="max-w-md">
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
