"use client";

import { useState, useMemo } from "react";
import { formatTHB } from "@/lib/money";
import { DataTable } from "@/components/DataTable";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { type ColumnDef } from "@tanstack/react-table";
import { createInsurance, updateInsurance, deleteInsurance } from "@/actions/insurances";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";

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
          meta: { align: "right" },
          cell: ({ row }) => (
            <span className="font-medium tabular-nums text-emerald-600">
              {formatTHB(row.original.coverageAmountCents)}
            </span>
          ),
        },
        {
          accessorKey: "premiumAmountCents",
          header: "ค่าเบี้ย",
          meta: { align: "right" },
          cell: ({ row }) => (
            <span className="tabular-nums text-slate-900">
              {formatTHB(row.original.premiumAmountCents)}
            </span>
          ),
        },
        {
          accessorKey: "startDate",
          header: "วันที่เริ่ม",
          cell: ({ row }) => <span className="text-slate-600">{row.original.startDate}</span>,
        },
        {
          accessorKey: "maturityDate",
          header: "ครบกำหนด",
          cell: ({ row }) => <span className="text-slate-600">{row.original.maturityDate}</span>,
        },
        {
          accessorKey: "premiumUntilYear",
          header: "ชำระเบี้ยถึงปี",
          meta: { align: "center" },
          cell: ({ row }) => (
            <span className="text-slate-600">{row.original.premiumUntilYear || "—"}</span>
          ),
        },
        {
          id: "actions",
          header: "",
          enableSorting: false,
          meta: { align: "right" },
          cell: ({ row }) => (
            <div className="flex justify-end gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-slate-500 hover:text-blue-600"
                onClick={() => {
                  setEditingItem(row.original);
                  setIsModalOpen(true);
                }}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-slate-500 hover:text-red-600"
                onClick={() => setDeleteId(row.original.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ),
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
      toast.error("เกิดข้อผิดพลาดในการลบ");
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  }

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const name = formData.get("name") as string;
    const coverageAmount = parseFloat(formData.get("coverageAmount") as string) * 100;
    const premiumAmount = parseFloat(formData.get("premiumAmount") as string) * 100;
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
    } catch (err) {
      toast.error("เกิดข้อผิดพลาดในการบันทึก");
    } finally {
      setSaving(false);
    }
  }

  function openCreateModal() {
    setEditingItem(null);
    setIsModalOpen(true);
  }

  return (
    <>
      <Card>
        <CardContent className="p-0">
          <DataTable
            columns={columns}
            data={items}
            searchPlaceholder="ค้นหาชื่อประกัน..."
            emptyTitle="ไม่มีข้อมูลประกัน"
            toolbar={
              <Button onClick={openCreateModal} className="gap-2">
                <Plus className="h-4 w-4" />
                เพิ่มกรมธรรม์
              </Button>
            }
          />
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingItem ? "แก้ไขกรมธรรม์" : "เพิ่มกรมธรรม์ใหม่"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label htmlFor="name">ชื่อประกัน</Label>
              <Input
                id="name"
                name="name"
                required
                defaultValue={editingItem?.name || ""}
                placeholder="เช่น ไทยประกันชีวิต 10/5"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="coverageAmount">ทุนประกัน/ครบกำหนด (บาท)</Label>
                <Input
                  id="coverageAmount"
                  name="coverageAmount"
                  type="number"
                  step="0.01"
                  required
                  defaultValue={editingItem ? (editingItem.coverageAmountCents / 100).toFixed(2) : ""}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="premiumAmount">ค่าเบี้ยประกัน (บาท)</Label>
                <Input
                  id="premiumAmount"
                  name="premiumAmount"
                  type="number"
                  step="0.01"
                  required
                  defaultValue={editingItem ? (editingItem.premiumAmountCents / 100).toFixed(2) : ""}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">วันที่เริ่ม</Label>
                <Input
                  id="startDate"
                  name="startDate"
                  type="date"
                  required
                  defaultValue={editingItem?.startDate || ""}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maturityDate">ครบกำหนด</Label>
                <Input
                  id="maturityDate"
                  name="maturityDate"
                  type="date"
                  required
                  defaultValue={editingItem?.maturityDate || ""}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="premiumUntilYear">ชำระเบี้ยถึงปี (ค.ศ. หรือ พ.ศ. ก็ได้)</Label>
              <Input
                id="premiumUntilYear"
                name="premiumUntilYear"
                type="number"
                defaultValue={editingItem?.premiumUntilYear || ""}
                placeholder="เช่น 2030 หรือ 2573"
              />
            </div>

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                ยกเลิก
              </Button>
              <Button type="submit" disabled={saving}>
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
