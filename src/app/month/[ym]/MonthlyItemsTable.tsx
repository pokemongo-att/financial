"use client";

import { useState, useMemo } from "react";
import { formatTHB } from "@/lib/money";
import { StatusCheckbox } from "@/components/StatusCheckbox";
import { useRouter } from "next/navigation";
import { DataTable } from "@/components/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Pencil, Trash2, FileText } from "lucide-react";
import { type ColumnDef } from "@tanstack/react-table";
import { updateMonthlyItem, deleteMonthlyItem } from "@/actions/monthly";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { toast } from "sonner";

type Item = {
  id: string;
  category: "INCOME" | "EXPENSE" | "SAVING" | "GOAL" | "FAMILY";
  name: string;
  plannedAmountCents: number;
  actualAmountCents: number | null;
  status: "PLANNED" | "DONE" | "SKIPPED";
  note: string | null;
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
  const [deleting, setDeleting] = useState(false);

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
          <span className="font-medium text-slate-900">{row.original.name}</span>
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
            <DropdownMenuItem onClick={() => setDeleteId(row.original.id)}>
              <Trash2 className="w-3.5 h-3.5" /> ลบรายการ
            </DropdownMenuItem>
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

  return (
    <>
      <DataTable
        columns={columns}
        data={filtered}
        searchPlaceholder="ค้นหารายการ..."
        emptyTitle="ไม่มีรายการ"
        toolbar={
          <>
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
          </>
        }
      />
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
