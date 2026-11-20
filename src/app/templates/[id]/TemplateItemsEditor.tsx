"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Pencil, X } from "lucide-react";
import { toast } from "sonner";
import { createTemplateItem, deleteTemplateItem, updateTemplateItem } from "@/actions/templates";
import { formatTHB, toCents } from "@/lib/money";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { MoneyInput } from "@/components/MoneyInput";
import { RowActions } from "@/components/RowActions";
import { Field } from "@/components/Field";

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

const CATEGORY_OPTIONS: { value: EditorCategory; label: string }[] = [
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

  function openEdit(item: Item) {
    setEditItem(item);
    setEditSlug(item.slug || "");
    setEditAmount((item.defaultAmountCents / 100).toFixed(2));
    setEditInterestRate(item.interestRate || "");
  }

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
        toast.error("เพิ่มรายการไม่สำเร็จ ลองอีกครั้ง");
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
      toast.error("บันทึกไม่สำเร็จ ลองอีกครั้ง");
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
      toast.error("ลบไม่สำเร็จ ลองอีกครั้ง");
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  }

  const grouped = CATEGORY_OPTIONS.map((cat) => {
    const groupItems =
      cat.value === "LOAN"
        ? items.filter((i) => i.accountOrSubType === "HOME_LOAN")
        : cat.value === "EXPENSE"
          ? items.filter((i) => i.category === "EXPENSE" && i.accountOrSubType !== "HOME_LOAN")
          : items.filter((i) => i.category === cat.value);
    return { ...cat, items: groupItems, total: groupItems.reduce((s, i) => s + i.defaultAmountCents, 0) };
  });

  return (
    <div className="space-y-4 sm:space-y-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-slate-500">
          <span className="font-semibold tabular-nums text-slate-900">{items.length}</span> รายการ · เลือกรายการเพื่อปรับยอด
        </p>
        <Button onClick={() => setShowAdd(!showAdd)} variant={showAdd ? "outline" : "default"} aria-expanded={showAdd}>
          {showAdd ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {showAdd ? "ปิด" : "เพิ่มรายการ"}
        </Button>
      </div>

      {showAdd && (
        <Card className="p-4 sm:p-5">
          <form onSubmit={handleAdd} className="space-y-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Field label="หมวด">
                <Select value={category} onChange={(e) => setCategory(e.target.value as EditorCategory)}>
                  {CATEGORY_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </Select>
              </Field>
              <Field label="ชื่อรายการ">
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="เช่น ค่าไฟฟ้า" autoFocus />
              </Field>
              <Field label="จำนวนเงิน">
                <MoneyInput value={amount} onChange={setAmount} />
              </Field>
              <Field label="Slug (ไม่บังคับ)">
                <Input
                  value={slug}
                  onChange={(e) => setSlug(e.target.value.toLowerCase())}
                  placeholder="เช่น goal-travel"
                  autoCapitalize="none"
                  autoCorrect="off"
                />
              </Field>
              {category === "LOAN" && (
                <Field label="ดอกเบี้ย (%)">
                  <Input
                    type="text"
                    inputMode="decimal"
                    value={interestRate}
                    onChange={(e) => setInterestRate(e.target.value)}
                    placeholder="เช่น 3.50"
                  />
                </Field>
              )}
            </div>
            <Button type="submit" disabled={isPending || !name.trim()} className="w-full sm:w-auto">
              {isPending ? "กำลังเพิ่ม..." : "เพิ่ม"}
            </Button>
          </form>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-3 sm:gap-4 xl:grid-cols-2">
        {grouped.map((group) => (
          <Card key={group.value} className="overflow-hidden">
            <div className="flex items-center justify-between gap-2 border-b border-slate-100 px-4 py-3 sm:px-5">
              <div className="flex items-center gap-2">
                <Badge variant={BADGE_VARIANT[group.value]}>{group.label}</Badge>
                <span className="text-xs tabular-nums text-slate-400">{group.items.length} รายการ</span>
              </div>
              {group.items.length > 0 && (
                <span className="text-sm font-semibold tabular-nums text-slate-700">{formatTHB(group.total)}</span>
              )}
            </div>
            {group.items.length > 0 ? (
              <ul className="divide-y divide-slate-100">
                {group.items.map((item) => (
                  <li key={item.id} className="flex items-center gap-1 pr-2 sm:pr-3">
                    <button
                      type="button"
                      onClick={() => openEdit(item)}
                      className="flex min-w-0 flex-1 items-center justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-slate-50/60 active:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-indigo-500 sm:px-5"
                    >
                      <span className="min-w-0">
                        <span
                          className={cn(
                            "block truncate text-sm font-medium text-slate-900",
                            !item.isActive && "text-slate-400 line-through"
                          )}
                        >
                          {item.name}
                        </span>
                        {item.interestRate && (
                          <span className="block text-xs text-slate-500">ดอกเบี้ย {item.interestRate}%</span>
                        )}
                      </span>
                      <span className="shrink-0 text-sm font-medium tabular-nums text-slate-700">
                        {formatTHB(item.defaultAmountCents)}
                      </span>
                    </button>
                    <RowActions
                      label={`ตัวเลือกของ ${item.name}`}
                      actions={[
                        { label: "ปรับยอดเริ่มต้น", icon: Pencil, onSelect: () => openEdit(item) },
                        { label: "ลบรายการ", icon: Trash2, onSelect: () => setDeleteId(item.id), destructive: true },
                      ]}
                    />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="px-4 py-4 text-sm text-slate-400 sm:px-5">ไม่มีรายการ</p>
            )}
          </Card>
        ))}
      </div>

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
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editItem?.name}</DialogTitle>
            <DialogDescription>ปรับยอดเริ่มต้นที่จะใช้ทุกเดือน</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveEdit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="editAmount">ยอดเริ่มต้น (บาท)</Label>
              <MoneyInput id="editAmount" value={editAmount} onChange={setEditAmount} />
            </div>
            {editItem?.accountOrSubType === "HOME_LOAN" && (
              <div className="space-y-2">
                <Label htmlFor="editInterestRate">ดอกเบี้ย (%)</Label>
                <Input
                  id="editInterestRate"
                  type="text"
                  inputMode="decimal"
                  value={editInterestRate}
                  onChange={(e) => setEditInterestRate(e.target.value)}
                  placeholder="เช่น 3.50"
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="editSlug">Slug</Label>
              <Input
                id="editSlug"
                value={editSlug}
                onChange={(e) => setEditSlug(e.target.value.toLowerCase())}
                placeholder="เช่น goal-travel"
                autoCapitalize="none"
                autoCorrect="off"
              />
            </div>
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
