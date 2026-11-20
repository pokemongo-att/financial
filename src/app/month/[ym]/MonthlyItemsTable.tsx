"use client";

import { useMemo, useRef, useState } from "react";
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
import { Select } from "@/components/ui/select";
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

export function MonthlyItemsTable({ items, pendingOnly }: { items: Item[]; pendingOnly: boolean }) {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState<"all" | "pending">(pendingOnly ? "pending" : "all");
  const [category, setCategory] = useState<Category | "ALL">("ALL");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editItem, setEditItem] = useState<Item | null>(null);
  const editTrigger = useRef<HTMLButtonElement | null>(null);
  const [deleting, setDeleting] = useState(false);

  const itemsInCategory = useMemo(
    () => items.filter((item) => category === "ALL" || item.category === category),
    [items, category]
  );
  const pending = useMemo(
    () => itemsInCategory.filter((item) => item.status === "PLANNED"),
    [itemsInCategory]
  );
  const filtered = statusFilter === "pending" ? pending : itemsInCategory;
  const emptyTitle = statusFilter === "pending" ? "ไม่มีรายการค้าง" : "ไม่มีรายการ";
  const options = [
    { value: "all" as const, label: "ทั้งหมด", count: itemsInCategory.length },
    { value: "pending" as const, label: "รายการค้าง", count: pending.length },
  ];

  const columns = useMemo<ColumnDef<Item, unknown>[]>(
    () =>
    [
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
            <span className="wrap-anywhere font-medium text-slate-900">{row.original.name}</span>
            {row.original.interestRate && (
              <span className="text-xs text-slate-500">ดอกเบี้ย {row.original.interestRate}%</span>
            )}
          </div>
        ),
      },
      {
        accessorKey: "plannedAmountCents",
        header: "ยอดตามแผน",
        meta: { align: "right" } satisfies ColumnMeta,
        cell: ({ row }) => (
          <span className="font-medium tabular-nums text-slate-900">{formatTHB(row.original.plannedAmountCents)}</span>
        ),
      },
      {
        accessorKey: "actualAmountCents",
        header: "ยอดจริง",
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
        title="เช็กลิสต์รายเดือน"
        columns={columns}
        data={filtered}
        getRowId={(r) => r.id}
        searchPlaceholder="ค้นหา"
        emptyIcon={<ListChecks className="h-8 w-8" />}
        emptyTitle={emptyTitle}
        emptyDescription={category !== "ALL" ? "ลองเลือกหมวดอื่นหรือดูทุกหมวด" : undefined}
        toolbar={
          <div className="flex flex-wrap items-center gap-2">
            <FilterChips
              label="กรองตามสถานะ"
              options={options}
              value={statusFilter}
              onChange={setStatusFilter}
              className="mx-0 flex-wrap overflow-visible px-0"
            />
            <Select
              aria-label="กรองตามหมวด"
              className="min-h-11 w-auto max-w-full"
              value={category}
              onChange={(event) => setCategory(event.target.value as Category | "ALL")}
            >
              <option value="ALL">ทุกหมวด</option>
              {CATEGORY_ORDER.map((value) => (
                <option key={value} value={value}>{CATEGORY_LABELS[value]}</option>
              ))}
            </Select>
          </div>
        }
        renderCard={(item) => (
          <MonthlyItemRow
            item={item}
            onEdit={(trigger) => {
              editTrigger.current = trigger ?? null;
              setEditItem(item);
            }}
            onDelete={() => setDeleteId(item.id)}
          />
        )}
      />

      <EditItemDialog
        item={editItem}
        onClose={() => setEditItem(null)}
        onCloseAutoFocus={(event) => {
          const trigger = editTrigger.current;
          editTrigger.current = null;
          if (trigger?.isConnected) {
            event.preventDefault();
            trigger.focus({ preventScroll: true });
          }
        }}
      />

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
  const { status, setStatus, isPending } = useItemStatus(item.id, item.status);
  return (
    <div className="-my-1 -ml-2 flex items-center gap-1">
      <StatusToggle status={status} onChange={setStatus} itemName={item.name} disabled={isPending} />
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

function MonthlyItemRow({ item, onEdit, onDelete }: {
  item: Item;
  onEdit: (trigger?: HTMLButtonElement) => void;
  onDelete: () => void;
}) {
  const { status, setStatus, isPending } = useItemStatus(item.id, item.status);
  const done = status === "DONE";
  const skipped = status === "SKIPPED";
  const amount = item.actualAmountCents ?? item.plannedAmountCents;
  const differs = item.actualAmountCents != null && item.actualAmountCents !== item.plannedAmountCents;

  return (
    <div className={cn("grid grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-1 px-1.5 py-2 sm:px-3", skipped && "bg-slate-50/70")}>
      <StatusToggle status={status} onChange={setStatus} itemName={item.name} disabled={isPending} />
      <button
        type="button"
        aria-label={`แก้ไข ${item.name}`}
        aria-haspopup="dialog"
        onClick={(event) => onEdit(event.currentTarget)}
        className="min-h-11 min-w-0 rounded-lg px-1.5 py-2 text-left transition-colors hover:bg-slate-50 active:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
      >
        <span className="flex items-start justify-between gap-2">
          <span
            className={cn(
              "min-w-0 wrap-anywhere text-base leading-snug font-medium",
              done || skipped ? "text-slate-600" : "text-slate-900"
            )}
          >
            {item.name}
          </span>
          <Pencil className="mt-0.5 size-4 shrink-0 text-indigo-700" aria-hidden />
        </span>
        <span className="mt-1.5 flex flex-wrap items-baseline gap-x-2.5 gap-y-0.5">
          <span className="wrap-anywhere text-sm font-semibold tabular-nums text-slate-900">{formatTHB(amount)}</span>
          <span className="inline-flex items-center gap-1.5 text-xs text-slate-600">
            <span className={cn("h-1.5 w-1.5 rounded-full", CATEGORY_DOT[item.category])} aria-hidden />
            {CATEGORY_LABELS[item.category]}
          </span>
          {done && <span className="text-xs font-medium text-emerald-700">เสร็จแล้ว</span>}
          {skipped && <span className="text-xs font-medium text-amber-800">ข้าม</span>}
        </span>
        {(differs || item.interestRate || item.note) && (
          <span className="mt-1 flex flex-wrap gap-x-2.5 gap-y-0.5 text-xs text-slate-600">
            {differs && <span className="tabular-nums">ตามแผน {formatTHB(item.plannedAmountCents)}</span>}
            {item.interestRate && <span>ดอกเบี้ย {item.interestRate}%</span>}
            {item.note && <span className="line-clamp-2 wrap-anywhere">{item.note}</span>}
          </span>
        )}
      </button>
      <RowActions
        label={`ตัวเลือกของ ${item.name}`}
        className="size-11"
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

function EditItemDialog({ item, onClose, onCloseAutoFocus }: {
  item: Item | null;
  onClose: () => void;
  onCloseAutoFocus: (event: Event) => void;
}) {
  return (
    <Dialog open={!!item} onOpenChange={(open) => !open && onClose()}>
      <DialogContent onCloseAutoFocus={onCloseAutoFocus}>
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
            <Button
              type="button"
              variant="outline"
              onClick={() => setActual((item.plannedAmountCents / 100).toFixed(2))}
            >
              ใช้ยอดตามแผน
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setActual("")}
            >
              ล้างยอดจริง
            </Button>
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
