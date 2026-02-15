"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createTemplateItem, deleteTemplateItem } from "@/actions/templates";
import { formatTHB, toCents } from "@/lib/money";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Plus, Trash2 } from "lucide-react";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { DropdownMenu, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { MoneyInput } from "@/components/MoneyInput";

type Item = {
  id: string;
  category: "INCOME" | "EXPENSE" | "SAVING" | "GOAL" | "FAMILY";
  name: string;
  defaultAmountCents: number;
  isActive: boolean;
  sortOrder: number;
};

const CATEGORY_OPTIONS = [
  { value: "INCOME", label: "รายรับ" },
  { value: "EXPENSE", label: "รายจ่าย" },
  { value: "SAVING", label: "เงินออม" },
  { value: "GOAL", label: "เป้าหมาย" },
  { value: "FAMILY", label: "ครอบครัว" },
];

const BADGE_VARIANT: Record<string, "success" | "destructive" | "info" | "purple" | "orange"> = {
  INCOME: "success",
  EXPENSE: "destructive",
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
  const [category, setCategory] = useState<string>("INCOME");
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [isPending, startTransition] = useTransition();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    startTransition(async () => {
      try {
        await createTemplateItem({
          templateId,
          category: category as "INCOME" | "EXPENSE" | "SAVING" | "GOAL" | "FAMILY",
          name: name.trim(),
          defaultAmountCents: amount ? toCents(parseFloat(amount)) : 0,
          sortOrder: items.length,
        });
        setName("");
        setAmount("");
        setShowAdd(false);
        toast.success("เพิ่มรายการแล้ว");
        router.refresh();
      } catch {
        toast.error("เกิดข้อผิดพลาด");
      }
    });
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
    items: items.filter((i) => i.category === cat.value),
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
              <Select value={category} onChange={(e) => setCategory(e.target.value)}>
                {CATEGORY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </Select>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="ชื่อรายการ" />
              <MoneyInput value={amount} onChange={setAmount} placeholder="จำนวนเงิน" />
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
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-medium tabular-nums text-slate-600">
                      {formatTHB(item.defaultAmountCents)}
                    </span>
                    <DropdownMenu>
                      <DropdownMenuItem variant="destructive" onClick={() => setDeleteId(item.id)}>
                        <Trash2 className="w-3.5 h-3.5" /> ลบ
                      </DropdownMenuItem>
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
    </div>
  );
}
