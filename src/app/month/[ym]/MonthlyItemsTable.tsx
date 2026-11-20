"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { type ColumnDef } from "@tanstack/react-table";
import { Pencil, Trash2, SkipForward, RotateCcw, ListChecks } from "lucide-react";
import { toast } from "sonner";
import { formatTHB, toCents } from "@/lib/money";
import { cn } from "@/lib/utils";
import { CATEGORY_LABELS, CATEGORY_BADGE, CATEGORY_DOT, CATEGORY_ORDER, type Category } from "@/lib/categories";
import { DataTable, type ColumnMeta } from "@/components/DataTable";
import { FilterChips } from "@/components/FilterChips";
import { RowActions } from "@/components/RowActions";
import { StatusToggle, useItemStatus, STATUS_LABELS, type ItemStatus } from "@/components/StatusToggle";
import { MoneyInput } from "@/components/MoneyInput";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { updateMonthlyItem, deleteMonthlyItem } from "@/actions/monthly";

type Item = {
  id: string;
  category: Category;
  name: string;
  plannedAmountCents: number;
  actualAmountCents: number | null;
  status: ItemStatus;
  note: string | null;
  interestRate: string | null;
};

function isLoanLikeItem(item: Item) {
  const name = item.name.toLowerCase();
  return item.interestRate != null || name.includes("สินเชื่อ") || name.includes("loan");
}

type Filter = "ALL" | "PENDING" | Category;

export function MonthlyItemsTable({ items }: { items: Item[] }) {
  const router = useRouter();
  const [filter, setFilter] = useState<Filter>("ALL");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editItem, setEditItem] = useState<Item | null>(null);
  const [deleting, setDeleting] = useState(false);

  const filterOptions = useMemo(() => {
    const pending = items.filter((i) => i.status === "PLANNED").length;
    return [
      { value: "ALL" as Filter, label: "ทั้งหมด", count: items.length },
      { value: "PENDING" as Filter, label: "ค้างอยู่", count: pending },
      ...CATEGORY_ORDER.map((c) => ({
        value: c as Filter,
        label: CATEGORY_LABELS[c],
        count: items.filter((i) => i.category === c).length,
      })).filter((o) => o.count > 0),
    ];
  }, [items]);

  const filtered = useMemo(
    () =>
      items.filter((i) =>
        filter === "ALL" ? true : filter === "PENDING" ? i.status === "PLANNED" : i.category === filter
      ),
    [items, filter]
  );

  const columns = useMemo<ColumnDef<Item, any>[]>(
    () => [
      {
        accessorKey: "status",
        header: "สถานะ",
        enableSorting: false,
        meta: { className: "w-[1%]" } satisfies ColumnMeta,
        cell: ({ row }) => <StatusCell item={row.original} />,
      },
      {
        accessorKey: "category",
        header: "หมวด",
        enableSorting: false,
        cell: ({ row }) => (
          <Badge variant={CATEGORY_BADGE[row.original.category]}>{CATEGORY_LABELS[row.original.category]}</Badge>
        ),
      },
      {
        accessorKey: "name",
        header: "รายการ",
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="font-medium text-slate-900">{row.original.name}</span>
            {row.original.interestRate && (
              <span className="text-xs text-slate-500">ดอกเบี้ย {row.original.interestRate}%</span>
            )}
          </div>
        ),
      },
      {
        accessorKey: "plannedAmountCents",
        header: "แผน",
        meta: { align: "right" } satisfies ColumnMeta,
        cell: ({ row }) => (
          <span className="font-medium tabular-nums text-slate-900">{formatTHB(row.original.plannedAmountCents)}</span>
        ),
      },
      {
        accessorKey: "actualAmountCents",
        header: "จริง",
        meta: { align: "right" } satisfies ColumnMeta,
        cell: ({ row }) => (
          <span className="tabular-nums text-slate-600">
            {row.original.actualAmountCents != null ? formatTHB(row.original.actualAmountCents) : "—"}
          </span>
        ),
      },
      {
        accessorKey: "note",
        header: "หมายเหตุ",
        enableSorting: false,
        meta: { className: "hidden xl:table-cell" } satisfies ColumnMeta,
        cell: ({ row }) => (
          <span className="block max-w-[200px] truncate text-xs text-slate-500">{row.original.note ?? "—"}</span>
        ),
      },
      {
        id: "actions",
        header: "",
        enableSorting: false,
        meta: { align: "right", className: "w-[1%]" } satisfies ColumnMeta,
        cell: ({ row }) => (
          <ItemMenu item={row.original} onEdit={() => setEditItem(row.original)} onDelete={() => setDeleteId(row.original.id)} />
        ),
      },
    ],
    []
  );

  async function handleDelete() {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await deleteMonthlyItem(deleteId);
      toast.success("ลบรายการแล้ว");
      router.refresh();
    } catch {
      toast.error("ลบรายการไม่สำเร็จ ลองอีกครั้ง");
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  }

  return (
    <>
      <DataTable
        columns={columns}
        data={filtered}
        getRowId={(r) => r.id}
        searchPlaceholder="ค้นหารายการ..."
        emptyIcon={<ListChecks className="h-8 w-8" />}
        emptyTitle={filter === "PENDING" ? "ไม่มีรายการค้าง เยี่ยมมาก" : "ไม่มีรายการ"}
        toolbar={<FilterChips label="กรองตามหมวด" options={filterOptions} value={filter} onChange={setFilter} />}
        renderCard={(item) => (
          <MonthlyItemRow
            item={item}
            onEdit={() => setEditItem(item)}
            onDelete={() => setDeleteId(item.id)}
          />
        )}
      />

      <EditItemDialog item={editItem} onClose={() => setEditItem(null)} />

      <ConfirmDialog
        open={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="ลบรายการ"
        description="รายการนี้จะถูกลบออกจากแผนของเดือนนี้"
        confirmLabel="ลบ"
        loading={deleting}
      />
    </>
  );
}

/* ------------------------------------------------------------------ */

function StatusCell({ item }: { item: Item }) {
  const { status, setStatus } = useItemStatus(item.id, item.status);
  return (
    <div className="-my-1 -ml-2 flex items-center gap-1">
      <StatusToggle status={status} onChange={setStatus} itemName={item.name} />
      <span
        className={cn(
          "whitespace-nowrap text-xs font-medium",
          status === "DONE" ? "text-emerald-700" : status === "SKIPPED" ? "text-amber-700" : "text-slate-500"
        )}
      >
        {STATUS_LABELS[status]}
      </span>
    </div>
  );
}

function ItemMenu({ item, onEdit, onDelete }: { item: Item; onEdit: () => void; onDelete: () => void }) {
  const { status, setStatus } = useItemStatus(item.id, item.status);
  return (
    <RowActions
      label={`ตัวเลือกของ ${item.name}`}
      actions={[
        { label: "แก้ไขยอด/หมายเหตุ", icon: Pencil, onSelect: onEdit },
        status === "SKIPPED"
          ? { label: "ยกเลิกการข้าม", icon: RotateCcw, onSelect: () => setStatus("PLANNED") }
          : { label: "ข้ามเดือนนี้", icon: SkipForward, onSelect: () => setStatus("SKIPPED") },
        { label: "ลบรายการ", icon: Trash2, onSelect: onDelete, destructive: true },
      ]}
    />
  );
}

/** Phone/tablet row: check · name + meta (tap to edit) · menu. */
function MonthlyItemRow({ item, onEdit, onDelete }: { item: Item; onEdit: () => void; onDelete: () => void }) {
  const { status, setStatus } = useItemStatus(item.id, item.status);
  const done = status === "DONE";
  const skipped = status === "SKIPPED";
  const amount = item.actualAmountCents ?? item.plannedAmountCents;
  const differs = item.actualAmountCents != null && item.actualAmountCents !== item.plannedAmountCents;

  return (
    <div className={cn("flex items-center gap-1 py-1 pl-2 pr-2 sm:pl-3", skipped && "bg-slate-50/70")}>
      <StatusToggle status={status} onChange={setStatus} itemName={item.name} />
      <button
        type="button"
        onClick={onEdit}
        className="min-w-0 flex-1 rounded-lg px-1.5 py-2.5 text-left transition-colors active:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
      >
        <span className="flex items-baseline justify-between gap-3">
          <span
            className={cn(
              "truncate text-[15px] font-medium text-slate-900",
              done && "text-slate-500",
              skipped && "text-slate-500"
            )}
          >
            {item.name}
          </span>
          <span className={cn("shrink-0 text-[15px] font-semibold tabular-nums", done || skipped ? "text-slate-500" : "text-slate-900")}>
            {formatTHB(amount)}
          </span>
        </span>
        <span className="mt-0.5 flex min-w-0 items-center gap-x-2 text-xs text-slate-500">
          <span className="inline-flex shrink-0 items-center gap-1.5">
            <span className={cn("h-1.5 w-1.5 rounded-full", CATEGORY_DOT[item.category])} aria-hidden />
            {CATEGORY_LABELS[item.category]}
          </span>
          {skipped && <span className="shrink-0 font-medium text-amber-700">ข้าม</span>}
          {differs && <span className="shrink-0 tabular-nums">แผน {formatTHB(item.plannedAmountCents)}</span>}
          {item.interestRate && <span className="shrink-0">ดอกเบี้ย {item.interestRate}%</span>}
          {item.note && <span className="truncate text-slate-400">· {item.note}</span>}
        </span>
      </button>
      <RowActions
        label={`ตัวเลือกของ ${item.name}`}
        actions={[
          { label: "แก้ไขยอด/หมายเหตุ", icon: Pencil, onSelect: onEdit },
          skipped
            ? { label: "ยกเลิกการข้าม", icon: RotateCcw, onSelect: () => setStatus("PLANNED") }
            : { label: "ข้ามเดือนนี้", icon: SkipForward, onSelect: () => setStatus("SKIPPED") },
          { label: "ลบรายการ", icon: Trash2, onSelect: onDelete, destructive: true },
        ]}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */

function EditItemDialog({ item, onClose }: { item: Item | null; onClose: () => void }) {
  return (
    <Dialog open={!!item} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        {item && <EditItemForm key={item.id} item={item} onClose={onClose} />}
      </DialogContent>
    </Dialog>
  );
}

function EditItemForm({ item, onClose }: { item: Item; onClose: () => void }) {
  const router = useRouter();
  const [actual, setActual] = useState(
    ((item.actualAmountCents ?? item.plannedAmountCents) / 100).toFixed(2)
  );
  const [saving, setSaving] = useState(false);

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const note = String(formData.get("note") ?? "").trim();
    const interestRate = String(formData.get("interestRate") ?? "").trim();

    setSaving(true);
    try {
      await updateMonthlyItem(item.id, {
        actualAmountCents: actual.trim() ? toCents(actual) : null,
        note: note || null,
        interestRate: interestRate || null,
      });
      toast.success("บันทึกการแก้ไขแล้ว");
      onClose();
      router.refresh();
    } catch {
      toast.error("บันทึกไม่สำเร็จ ลองอีกครั้ง");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>{item.name}</DialogTitle>
        <DialogDescription>
          {CATEGORY_LABELS[item.category]} · แผน {formatTHB(item.plannedAmountCents)}
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSave} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="actualAmount">ยอดจริง (บาท)</Label>
          <MoneyInput id="actualAmount" value={actual} onChange={setActual} />
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setActual((item.plannedAmountCents / 100).toFixed(2))}
              className="rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50 pointer-coarse:py-1.5"
            >
              ใช้ยอดตามแผน
            </button>
            <button
              type="button"
              onClick={() => setActual("")}
              className="rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50 pointer-coarse:py-1.5"
            >
              ล้างยอดจริง
            </button>
          </div>
        </div>

        {isLoanLikeItem(item) && (
          <div className="space-y-2">
            <Label htmlFor="interestRate">ดอกเบี้ย (%)</Label>
            <Input
              id="interestRate"
              name="interestRate"
              type="text"
              inputMode="decimal"
              defaultValue={item.interestRate || ""}
              placeholder="เช่น 3.50"
            />
            <p className="text-xs text-slate-500">ใส่เฉพาะรายการค่าสินเชื่อบ้าน</p>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="note">หมายเหตุ</Label>
          <Textarea id="note" name="note" defaultValue={item.note || ""} placeholder="เพิ่มหมายเหตุ..." rows={3} />
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            ยกเลิก
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? "กำลังบันทึก..." : "บันทึก"}
          </Button>
        </DialogFooter>
      </form>
    </>
  );
}
