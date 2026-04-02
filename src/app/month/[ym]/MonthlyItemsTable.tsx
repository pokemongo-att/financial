"use client";

import { useState, useMemo } from "react";
import { formatTHB } from "@/lib/money";
import { StatusCheckbox } from "@/components/StatusCheckbox";
import { useRouter } from "next/navigation";
import { DataTable } from "@/components/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuContent } from "@/components/ui/dropdown-menu";
import { Pencil, Trash2, FileText, MoreHorizontal } from "lucide-react";
import { type ColumnDef } from "@tanstack/react-table";
import { updateMonthlyItem, deleteMonthlyItem } from "@/actions/monthly";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

function isLoanLikeItem(item: Item) {
  const name = item.name.toLowerCase();
  return item.interestRate != null || name.includes("สินเชื่อ") || name.includes("loan");
}

type Item = {
  id: string;
  category: "INCOME" | "EXPENSE" | "SAVING" | "GOAL" | "FAMILY";
  name: string;
  plannedAmountCents: number;
  actualAmountCents: number | null;
  status: "PLANNED" | "DONE" | "SKIPPED";
  note: string | null;
  interestRate: string | null;
};

const CATEGORY_LABELS: Record<string, string> = {
  INCOME: "รายรับ",
  EXPENSE: "รายจ่าย",
  SAVING: "เงินออม",
  GOAL: "เป้าหมาย",
  FAMILY: "ครอบครัว",
};

const BADGE_VARIANT: Record<string, "success" | "destructive" | "info" | "purple" | "orange"> = {
  INCOME: "success",
  EXPENSE: "destructive",
  SAVING: "info",
  GOAL: "purple",
  FAMILY: "orange",
};

export function MonthlyItemsTable({ items }: { items: Item[] }) {
  const router = useRouter();
  const [filter, setFilter] = useState<string>("ALL");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editItem, setEditItem] = useState<Item | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);

  const categories = ["ALL", "INCOME", "EXPENSE", "SAVING", "GOAL", "FAMILY"];

  const filtered = useMemo(
    () => items.filter((i) => filter === "ALL" || i.category === filter),
    [items, filter]
  );

  const columns = useMemo<ColumnDef<Item, any>[]>(
    () => [
      {
        accessorKey: "category",
        header: "หมวด",
        enableSorting: false,
        cell: ({ row }) => (
          <Badge variant={BADGE_VARIANT[row.original.category]}>
            {CATEGORY_LABELS[row.original.category]}
          </Badge>
        ),
      },
      {
        accessorKey: "name",
        header: "รายการ",
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="font-medium text-slate-900">{row.original.name}</span>
            {row.original.interestRate && (
              <span className="text-xs text-slate-500">ดอกเบี้ย: {row.original.interestRate}%</span>
            )}
          </div>
        ),
      },
      {
        accessorKey: "plannedAmountCents",
        header: "แผน",
        meta: { align: "right" },
        cell: ({ row }) => (
          <span className="font-medium tabular-nums text-slate-900">
            {formatTHB(row.original.plannedAmountCents)}
          </span>
        ),
      },
      {
        accessorKey: "actualAmountCents",
        header: "จริง",
        meta: { align: "right" },
        cell: ({ row }) => (
          <span className="tabular-nums text-slate-600">
            {row.original.actualAmountCents != null
              ? formatTHB(row.original.actualAmountCents)
              : "—"}
          </span>
        ),
      },
      {
        accessorKey: "status",
        header: "สถานะ",
        enableSorting: false,
        meta: { align: "center" },
        cell: ({ row }) => (
          <StatusCheckbox
            itemId={row.original.id}
            status={row.original.status}
            onUpdate={() => router.refresh()}
          />
        ),
      },
      {
        accessorKey: "note",
        header: "หมายเหตุ",
        enableSorting: false,
        cell: ({ row }) => (
          <span className="text-slate-400 text-xs max-w-[200px] truncate block">
            {row.original.note ?? "—"}
          </span>
        ),
      },
      {
        id: "actions",
        header: "",
        enableSorting: false,
        meta: { align: "center" },
        cell: ({ row }) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-white text-slate-900 border-slate-200 shadow-lg">
              <DropdownMenuItem onClick={() => setEditItem(row.original)}>
                <Pencil className="mr-2 h-4 w-4" />
                แก้ไขยอด/หมายเหตุ
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setDeleteId(row.original.id)} className="text-red-600">
                <Trash2 className="mr-2 h-4 w-4" />
                ลบรายการ
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    [router]
  );

  async function handleDelete() {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await deleteMonthlyItem(deleteId);
      toast.success("ลบรายการแล้ว");
      router.refresh();
    } catch {
      toast.error("เกิดข้อผิดพลาด");
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  }

  async function handleSaveEdit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!editItem) return;
    
    const formData = new FormData(e.currentTarget);
    const actualAmountRaw = formData.get("actualAmount");
    const noteRaw = formData.get("note");
    const interestRateRaw = formData.get("interestRate");
    const actualAmount = typeof actualAmountRaw === "string" ? actualAmountRaw.trim() : "";
    const note = typeof noteRaw === "string" ? noteRaw.trim() : "";
    const interestRate = typeof interestRateRaw === "string" ? interestRateRaw.trim() : "";

    setSaving(true);
    try {
      await updateMonthlyItem(editItem.id, {
        actualAmountCents: actualAmount ? Math.round(parseFloat(actualAmount) * 100) : null,
        note: note || null,
        interestRate: interestRate || null,
      });
      toast.success("บันทึกการแก้ไขแล้ว");
      setEditItem(null);
      router.refresh();
    } catch (err) {
      toast.error("เกิดข้อผิดพลาดในการบันทึก");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <DataTable
        columns={columns}
        data={filtered}
        searchPlaceholder="ค้นหารายการ..."
        emptyTitle="ไม่มีรายการ"
        toolbar={
          <div className="flex flex-wrap gap-1.5">
            {categories.map((cat) => (
              <Button
                key={cat}
                variant={filter === cat ? "default" : "secondary"}
                size="sm"
                onClick={() => setFilter(cat)}
              >
                {cat === "ALL" ? "ทั้งหมด" : CATEGORY_LABELS[cat]}
              </Button>
            ))}
          </div>
        }
      />

      <Dialog open={!!editItem} onOpenChange={() => setEditItem(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>แก้ไขรายการ: {editItem?.name}</DialogTitle>
          </DialogHeader>
          {editItem && (
            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="actualAmount">ยอดจ่ายจริง (บาท)</Label>
                <Input
                  id="actualAmount"
                  name="actualAmount"
                  type="number"
                  step="0.01"
                  defaultValue={editItem.actualAmountCents != null ? (editItem.actualAmountCents / 100).toFixed(2) : (editItem.plannedAmountCents / 100).toFixed(2)}
                />
                <p className="text-xs text-slate-500">ยอดที่วางแผนไว้: {(editItem.plannedAmountCents / 100).toLocaleString()} บาท</p>
              </div>
              
              {isLoanLikeItem(editItem) && (
                <div className="space-y-2">
                  <Label htmlFor="interestRate">ดอกเบี้ย (%)</Label>
                  <Input
                    id="interestRate"
                    name="interestRate"
                    type="number"
                    step="0.01"
                    defaultValue={editItem.interestRate || ""}
                    placeholder="เช่น 3.50"
                  />
                  <p className="text-xs text-slate-500">ใส่ดอกเบี้ยเฉพาะกรณีที่เป็นค่าสินเชื่อบ้าน</p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="note">หมายเหตุ</Label>
                <Textarea
                  id="note"
                  name="note"
                  defaultValue={editItem.note || ""}
                  placeholder="เพิ่มหมายเหตุ..."
                  rows={3}
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setEditItem(null)}>
                  ยกเลิก
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? "กำลังบันทึก..." : "บันทึก"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="ลบรายการ"
        description="คุณต้องการลบรายการนี้หรือไม่?"
        confirmLabel="ลบ"
        loading={deleting}
      />
    </>
  );
}
