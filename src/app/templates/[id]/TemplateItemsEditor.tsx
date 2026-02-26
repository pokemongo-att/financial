"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createTemplateItem, deleteTemplateItem, updateTemplateItem } from "@/actions/templates";
import { formatTHB, toCents } from "@/lib/money";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Plus, Trash2, MoreHorizontal } from "lucide-react";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { DropdownMenu, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuContent } from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { MoneyInput } from "@/components/MoneyInput";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

type Item = {
  id: string;
  category: "INCOME" | "EXPENSE" | "SAVING" | "GOAL" | "FAMILY";
  name: string;
  slug: string | null;
  defaultAmountCents: number;
  interestRate: string | null;
  accountOrSubType: string | null;
  isActive: boolean;
  sortOrder: number;
};

type EditorCategory = "INCOME" | "EXPENSE" | "SAVING" | "GOAL" | "FAMILY" | "LOAN";

const CATEGORY_OPTIONS = [
  { value: "INCOME", label: "รายรับ" },
  { value: "EXPENSE", label: "รายจ่าย" },
  { value: "LOAN", label: "ค่าสินเชื่อ" },
  { value: "SAVING", label: "เงินออม" },
  { value: "GOAL", label: "เป้าหมาย" },
  { value: "FAMILY", label: "ครอบครัว" },
];

const BADGE_VARIANT: Record<string, "success" | "destructive" | "info" | "purple" | "orange"> = {
  INCOME: "success",
  EXPENSE: "destructive",
  LOAN: "destructive",
  SAVING: "info",
  GOAL: "purple",
  FAMILY: "orange",
};

export function TemplateItemsEditor({
  templateId,
  items,
}: {
  templateId: string;
  items: Item[];
}) {
  const router = useRouter();
  const [showAdd, setShowAdd] = useState(false);
  const [category, setCategory] = useState<EditorCategory>("INCOME");
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [amount, setAmount] = useState("");
  const [interestRate, setInterestRate] = useState("");
  const [isPending, startTransition] = useTransition();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [editItem, setEditItem] = useState<Item | null>(null);
  const [editSlug, setEditSlug] = useState("");
  const [editAmount, setEditAmount] = useState("");
  const [editInterestRate, setEditInterestRate] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    startTransition(async () => {
      try {
        const isLoanTemplate = category === "LOAN";
        await createTemplateItem({
          templateId,
          category: isLoanTemplate ? "EXPENSE" : (category as "INCOME" | "EXPENSE" | "SAVING" | "GOAL" | "FAMILY"),
          name: name.trim(),
          slug: slug.trim() || undefined,
          defaultAmountCents: amount ? toCents(parseFloat(amount)) : 0,
          interestRate: isLoanTemplate ? interestRate.trim() || null : null,
          accountOrSubType: isLoanTemplate ? "HOME_LOAN" : undefined,
          sortOrder: items.length,
        });
        setName("");
        setSlug("");
        setAmount("");
        setInterestRate("");
        setShowAdd(false);
        toast.success("เพิ่มรายการแล้ว");
        router.refresh();
      } catch {
        toast.error("เกิดข้อผิดพลาด");
      }
    });
  }

  async function handleSaveEdit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!editItem) return;

    setSavingEdit(true);
    try {
      await updateTemplateItem(editItem.id, {
        slug: editSlug.trim() || undefined,
        defaultAmountCents: editAmount ? toCents(parseFloat(editAmount)) : 0,
        interestRate:
          editItem.accountOrSubType === "HOME_LOAN"
            ? editInterestRate.trim() || null
            : undefined,
      });
      toast.success("บันทึกยอดเริ่มต้นแล้ว");
      setEditItem(null);
      setEditSlug("");
      setEditAmount("");
      setEditInterestRate("");
      router.refresh();
    } catch {
      toast.error("เกิดข้อผิดพลาดในการบันทึก");
    } finally {
      setSavingEdit(false);
    }
  }

  async function handleDelete() {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await deleteTemplateItem(deleteId);
      toast.success("ลบรายการแล้ว");
      router.refresh();
    } catch {
      toast.error("เกิดข้อผิดพลาด");
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  }

  const grouped = CATEGORY_OPTIONS.map((cat) => ({
    ...cat,
    items:
      cat.value === "LOAN"
        ? items.filter((i) => i.accountOrSubType === "HOME_LOAN")
        : cat.value === "EXPENSE"
          ? items.filter((i) => i.category === "EXPENSE" && i.accountOrSubType !== "HOME_LOAN")
          : items.filter((i) => i.category === cat.value),
  }));

  return (
    <div className="space-y-5">
      <div className="flex justify-end">
        <Button onClick={() => setShowAdd(!showAdd)}>
          <Plus className="w-4 h-4" />
          เพิ่มรายการ
        </Button>
      </div>

      {showAdd && (
        <Card className="p-4">
          <form onSubmit={handleAdd} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Select value={category} onChange={(e) => setCategory(e.target.value as EditorCategory)}>
                {CATEGORY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </Select>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="ชื่อรายการ" />
              <Input value={slug} onChange={(e) => setSlug(e.target.value.toLowerCase())} placeholder="slug เช่น goal-travel" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <MoneyInput value={amount} onChange={setAmount} placeholder="จำนวนเงิน" />
              {category === "LOAN" && (
                <Input
                  type="number"
                  step="0.01"
                  value={interestRate}
                  onChange={(e) => setInterestRate(e.target.value)}
                  placeholder="ดอกเบี้ย % เช่น 3.50"
                />
              )}
            </div>
            <Button type="submit" disabled={isPending}>
              {isPending ? "กำลังเพิ่ม..." : "เพิ่ม"}
            </Button>
          </form>
        </Card>
      )}

      {grouped.map((group) => (
        <Card key={group.value}>
          <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
            <Badge variant={BADGE_VARIANT[group.value]}>{group.label}</Badge>
            <span className="text-xs text-slate-400">({group.items.length} รายการ)</span>
          </div>
          {group.items.length > 0 ? (
            <div className="divide-y divide-slate-50">
              {group.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between px-6 py-3">
                  <span className={cn("text-sm font-medium text-slate-900", !item.isActive && "line-through text-slate-400")}>
                    {item.name}
                  </span>
                  {item.interestRate && (
                    <span className="ml-2 text-xs text-slate-500">ดอกเบี้ย {item.interestRate}%</span>
                  )}
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-medium tabular-nums text-slate-600">
                      {formatTHB(item.defaultAmountCents)}
                    </span>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => {
                            setEditItem(item);
                            setEditSlug(item.slug || "");
                            setEditAmount((item.defaultAmountCents / 100).toFixed(2));
                            setEditInterestRate(item.interestRate || "");
                          }}
                        >
                          ปรับยอดเริ่มต้น
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600" onClick={() => setDeleteId(item.id)}>
                          <Trash2 className="mr-2 h-4 w-4" /> ลบ
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="px-6 py-4 text-sm text-slate-400">ไม่มีรายการ</p>
          )}
        </Card>
      ))}
      <ConfirmDialog
        open={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="ลบรายการ"
        description="คุณต้องการลบรายการนี้หรือไม่?"
        confirmLabel="ลบ"
        loading={deleting}
      />

      <Dialog
        open={editItem !== null}
        onOpenChange={(open) => {
          if (!open) {
            setEditItem(null);
            setEditSlug("");
            setEditAmount("");
          }
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>ปรับยอดเริ่มต้น: {editItem?.name}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveEdit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="editSlug">Slug</Label>
              <Input
                id="editSlug"
                value={editSlug}
                onChange={(e) => setEditSlug(e.target.value.toLowerCase())}
                placeholder="เช่น goal-travel"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editAmount">ยอดเริ่มต้น (บาท)</Label>
              <Input
                id="editAmount"
                type="number"
                step="0.01"
                value={editAmount}
                onChange={(e) => setEditAmount(e.target.value)}
                placeholder="0.00"
              />
            </div>
            {editItem?.accountOrSubType === "HOME_LOAN" && (
              <div className="space-y-2">
                <Label htmlFor="editInterestRate">ดอกเบี้ย (%)</Label>
                <Input
                  id="editInterestRate"
                  type="number"
                  step="0.01"
                  value={editInterestRate}
                  onChange={(e) => setEditInterestRate(e.target.value)}
                  placeholder="เช่น 3.50"
                />
              </div>
            )}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditItem(null)}>
                ยกเลิก
              </Button>
              <Button type="submit" disabled={savingEdit}>
                {savingEdit ? "กำลังบันทึก..." : "บันทึก"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
