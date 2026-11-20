"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { type ColumnDef } from "@tanstack/react-table";
import { Plus, Pencil, Trash2, Shield } from "lucide-react";
import { toast } from "sonner";
import { formatTHB, toCents } from "@/lib/money";
import { createInsurance, updateInsurance, deleteInsurance } from "@/actions/insurances";
import { DataTable, type ColumnMeta } from "@/components/DataTable";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { RowActions } from "@/components/RowActions";
import { MoneyInput } from "@/components/MoneyInput";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

type Insurance = {
  id: string;
  name: string;
  coverageAmountCents: number;
  startDate: string;
  maturityDate: string;
  premiumAmountCents: number;
  premiumUntilYear: number | null;
};

export function InsurancesTable({ items, userId }: { items: Insurance[]; userId: string }) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Insurance | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [coverage, setCoverage] = useState("");
  const [premium, setPremium] = useState("");

  function openModal(item: Insurance | null) {
    setEditingItem(item);
    setCoverage(item ? (item.coverageAmountCents / 100).toFixed(2) : "");
    setPremium(item ? (item.premiumAmountCents / 100).toFixed(2) : "");
    setIsModalOpen(true);
  }

  const columns = useMemo<ColumnDef<Insurance, any>[]>(
    () => [
      {
        accessorKey: "name",
        header: "ชื่อประกัน",
        cell: ({ row }) => <span className="font-medium text-slate-900">{row.original.name}</span>,
      },
      {
        accessorKey: "coverageAmountCents",
        header: "ทุนประกัน/ครบกำหนด",
        meta: { align: "right" } satisfies ColumnMeta,
        cell: ({ row }) => (
          <span className="font-medium tabular-nums text-emerald-600">{formatTHB(row.original.coverageAmountCents)}</span>
        ),
      },
      {
        accessorKey: "premiumAmountCents",
        header: "ค่าเบี้ย",
        meta: { align: "right" } satisfies ColumnMeta,
        cell: ({ row }) => <span className="tabular-nums text-slate-900">{formatTHB(row.original.premiumAmountCents)}</span>,
      },
      {
        accessorKey: "startDate",
        header: "วันที่เริ่ม",
        meta: { sortKind: "date" } satisfies ColumnMeta,
        cell: ({ row }) => <span className="tabular-nums text-slate-600">{row.original.startDate}</span>,
      },
      {
        accessorKey: "maturityDate",
        header: "ครบกำหนด",
        meta: { sortKind: "date" } satisfies ColumnMeta,
        cell: ({ row }) => <span className="tabular-nums text-slate-600">{row.original.maturityDate}</span>,
      },
      {
        accessorKey: "premiumUntilYear",
        header: "ชำระเบี้ยถึงปี",
        meta: { align: "center", sortKind: "number" } satisfies ColumnMeta,
        cell: ({ row }) => <span className="tabular-nums text-slate-600">{row.original.premiumUntilYear || "—"}</span>,
      },
      {
        id: "actions",
        header: "",
        enableSorting: false,
        meta: { align: "right", className: "w-[1%]" } satisfies ColumnMeta,
        cell: ({ row }) => <InsuranceActions item={row.original} onEdit={openModal} onDelete={setDeleteId} />,
      },
    ],
    []
  );

  async function handleDelete() {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await deleteInsurance(deleteId);
      toast.success("ลบกรมธรรม์แล้ว");
      router.refresh();
    } catch {
      toast.error("ลบไม่สำเร็จ ลองอีกครั้ง");
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  }

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const name = formData.get("name") as string;
    const coverageAmount = toCents(coverage || "0");
    const premiumAmount = toCents(premium || "0");
    const startDate = formData.get("startDate") as string;
    const maturityDate = formData.get("maturityDate") as string;
    const premiumUntilYearStr = formData.get("premiumUntilYear") as string;
    const premiumUntilYear = premiumUntilYearStr ? parseInt(premiumUntilYearStr, 10) : null;

    setSaving(true);
    try {
      if (editingItem) {
        await updateInsurance(editingItem.id, {
          name,
          coverageAmountCents: coverageAmount,
          premiumAmountCents: premiumAmount,
          startDate,
          maturityDate,
          premiumUntilYear,
        });
        toast.success("บันทึกการแก้ไขแล้ว");
      } else {
        await createInsurance(userId, {
          name,
          coverageAmountCents: coverageAmount,
          premiumAmountCents: premiumAmount,
          startDate,
          maturityDate,
          premiumUntilYear,
        });
        toast.success("เพิ่มกรมธรรม์ใหม่แล้ว");
      }
      setIsModalOpen(false);
      router.refresh();
    } catch {
      toast.error("บันทึกไม่สำเร็จ ลองอีกครั้ง");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <DataTable
        title="กรมธรรม์ทั้งหมด"
        columns={columns}
        data={items}
        getRowId={(r) => r.id}
        searchPlaceholder="ค้นหาชื่อประกัน..."
        emptyIcon={<Shield className="h-8 w-8" />}
        emptyTitle="ไม่มีข้อมูลประกัน"
        toolbar={
          <Button onClick={() => openModal(null)} className="w-full lg:w-auto">
            <Plus className="h-4 w-4" />
            เพิ่มกรมธรรม์
          </Button>
        }
        renderCard={(item) => (
          <div className="flex items-start gap-2 py-3 pl-4 pr-2 sm:pl-5 sm:pr-3">
            <button
              type="button"
              onClick={() => openModal(item)}
              className="min-w-0 flex-1 rounded-lg text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            >
              <span className="flex items-baseline justify-between gap-3">
                <span className="truncate font-medium text-slate-900">{item.name}</span>
                <span className="shrink-0 font-semibold tabular-nums text-emerald-600">
                  {formatTHB(item.coverageAmountCents)}
                </span>
              </span>
              <span className="mt-1 block text-xs text-slate-500">
                เบี้ย <span className="tabular-nums text-slate-700">{formatTHB(item.premiumAmountCents)}</span>
                {item.premiumUntilYear ? <> · ชำระถึงปี <span className="tabular-nums">{item.premiumUntilYear}</span></> : null}
              </span>
              <span className="mt-0.5 block text-xs tabular-nums text-slate-500">
                {item.startDate} → ครบกำหนด {item.maturityDate}
              </span>
            </button>
            <InsuranceActions item={item} onEdit={openModal} onDelete={setDeleteId} />
          </div>
        )}
      />

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingItem ? "แก้ไขกรมธรรม์" : "เพิ่มกรมธรรม์ใหม่"}</DialogTitle>
          </DialogHeader>
          <form key={editingItem?.id ?? "new"} onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">ชื่อประกัน</Label>
              <Input id="name" name="name" required defaultValue={editingItem?.name || ""} placeholder="เช่น ไทยประกันชีวิต 10/5" />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="coverageAmount">ทุนประกัน/ครบกำหนด (บาท)</Label>
                <MoneyInput id="coverageAmount" value={coverage} onChange={setCoverage} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="premiumAmount">ค่าเบี้ยประกัน (บาท)</Label>
                <MoneyInput id="premiumAmount" value={premium} onChange={setPremium} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">วันที่เริ่ม</Label>
                <Input id="startDate" name="startDate" type="date" required defaultValue={editingItem?.startDate || ""} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maturityDate">ครบกำหนด</Label>
                <Input id="maturityDate" name="maturityDate" type="date" required defaultValue={editingItem?.maturityDate || ""} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="premiumUntilYear">ชำระเบี้ยถึงปี (ค.ศ. หรือ พ.ศ. ก็ได้)</Label>
              <Input
                id="premiumUntilYear"
                name="premiumUntilYear"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                defaultValue={editingItem?.premiumUntilYear || ""}
                placeholder="เช่น 2030 หรือ 2573"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                ยกเลิก
              </Button>
              <Button type="submit" disabled={saving || !coverage || !premium}>
                {saving ? "กำลังบันทึก..." : "บันทึก"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="ลบกรมธรรม์"
        description="คุณต้องการลบกรมธรรม์นี้หรือไม่? ข้อมูลที่เกี่ยวข้องจะถูกลบทั้งหมด"
        confirmLabel="ลบ"
        loading={deleting}
      />
    </>
  );
}

function InsuranceActions({
  item,
  onEdit,
  onDelete,
}: {
  item: Insurance;
  onEdit: (item: Insurance) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <RowActions
      label={`ตัวเลือกของ ${item.name}`}
      actions={[
        { label: "แก้ไข", icon: Pencil, onSelect: () => onEdit(item) },
        { label: "ลบกรมธรรม์", icon: Trash2, onSelect: () => onDelete(item.id), destructive: true },
      ]}
    />
  );
}
