"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { assetTransactionSchema, type AssetTransactionFormData } from "@/lib/validators";
import { createAssetTransaction, deleteAssetTransaction } from "@/actions/assets";
import { formatTHB, toCents } from "@/lib/money";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/EmptyState";
import { Plus, Trash2, ArrowUpDown } from "lucide-react";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { DropdownMenu, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuContent } from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { MoneyInput } from "@/components/MoneyInput";
import { MoreHorizontal } from "lucide-react";

type AssetTx = {
  id: string;
  type: "BUY" | "SELL" | "DIVIDEND" | "FEE" | "DEPOSIT" | "WITHDRAW" | "OPENING";
  quantity: number | null;
  pricePerUnitCents: number | null;
  amountCents: number;
  date: string;
  note: string | null;
};

const TX_BADGE_VARIANT: Record<string, "success" | "destructive" | "info" | "warning" | "default"> = {
  BUY: "success", SELL: "destructive", DIVIDEND: "info", FEE: "warning",
  DEPOSIT: "success", WITHDRAW: "destructive", OPENING: "default",
};

const INVESTMENT_TX_TYPES = [
  { value: "BUY", label: "ซื้อ" }, { value: "SELL", label: "ขาย" },
  { value: "DIVIDEND", label: "ปันผล" }, { value: "FEE", label: "ค่าธรรมเนียม" },
];

const BANK_TX_TYPES = [
  { value: "OPENING", label: "ยอดตั้งต้น" }, { value: "DEPOSIT", label: "ฝาก" },
  { value: "WITHDRAW", label: "ถอน" }, { value: "DIVIDEND", label: "ดอกเบี้ย" },
];

export function AssetTransactionsList({
  assetId, assetType, transactions,
}: {
  assetId: string; assetType: "STOCK" | "FUND" | "CRYPTO" | "BANK"; transactions: AssetTx[];
}) {
  const router = useRouter();
  const [showAdd, setShowAdd] = useState(false);
  const txTypes = assetType === "BANK" ? BANK_TX_TYPES : INVESTMENT_TX_TYPES;
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AssetTransactionFormData>({
    resolver: zodResolver(assetTransactionSchema),
    defaultValues: {
      type: txTypes[0].value,
      quantity: "",
      pricePerUnit: "",
      amount: "",
      date: new Date().toISOString().slice(0, 10),
      note: "",
    },
  });

  const watchType = watch("type");
  const watchAmount = watch("amount");
  const watchPricePerUnit = watch("pricePerUnit") ?? "";
  const showQtyFields = assetType !== "BANK" && (watchType === "BUY" || watchType === "SELL");

  async function onSubmit(data: AssetTransactionFormData) {
    const sqf = assetType !== "BANK" && (data.type === "BUY" || data.type === "SELL");
    await createAssetTransaction({
      assetAccountId: assetId, type: data.type as any,
      quantity: sqf && data.quantity ? parseInt(data.quantity) : null,
      pricePerUnitCents: sqf && data.pricePerUnit ? toCents(parseFloat(data.pricePerUnit)) : null,
      amountCents: toCents(parseFloat(data.amount)), date: data.date, note: data.note || undefined,
    });
    reset();
    setShowAdd(false);
    toast.success("เพิ่มรายการแล้ว");
    router.refresh();
  }

  async function handleDelete() {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await deleteAssetTransaction(deleteId);
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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-slate-900">ธุรกรรม</h2>
        <Button onClick={() => setShowAdd(!showAdd)} size="sm">
          <Plus className="w-4 h-4" /> เพิ่มรายการ
        </Button>
      </div>

      {showAdd && (
        <Card className="p-4">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <Select value={watchType} onChange={(e) => setValue("type", e.target.value)}>
                {txTypes.map((t) => (<option key={t.value} value={t.value}>{t.label}</option>))}
              </Select>
              {showQtyFields && (
                <>
                  <Input type="number" {...register("quantity")} placeholder="จำนวนหน่วย" />
                  <MoneyInput value={watchPricePerUnit} onChange={(v) => setValue("pricePerUnit", v)} placeholder="ราคา/หน่วย" />
                </>
              )}
              <div>
                <MoneyInput value={watchAmount} onChange={(v) => setValue("amount", v)} placeholder="จำนวนเงิน" />
                {errors.amount && <p className="mt-1 text-xs text-red-500">{errors.amount.message}</p>}
              </div>
              <Input type="date" {...register("date")} />
              <Input {...register("note")} placeholder="หมายเหตุ" />
            </div>
            <Button type="submit" disabled={isSubmitting} size="sm">
              {isSubmitting ? "กำลังบันทึก..." : "บันทึก"}
            </Button>
          </form>
        </Card>
      )}

      <Card className="overflow-x-auto">
        {transactions.length === 0 ? (
          <EmptyState icon={<ArrowUpDown className="w-8 h-8" />} title="ยังไม่มีรายการ" description="เพิ่มธุรกรรมเพื่อเริ่มติดตาม" />
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">วันที่</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">ประเภท</th>
                {assetType !== "BANK" && (
                  <>
                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">จำนวน</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">ราคา/หน่วย</th>
                  </>
                )}
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">จำนวนเงิน</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">หมายเหตุ</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {[...transactions].reverse().map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-3 text-slate-500">{tx.date}</td>
                  <td className="px-6 py-3">
                    <Badge variant={TX_BADGE_VARIANT[tx.type] ?? "default"}>{tx.type}</Badge>
                  </td>
                  {assetType !== "BANK" && (
                    <>
                      <td className="px-6 py-3 text-right tabular-nums text-slate-900">{tx.quantity ?? "—"}</td>
                      <td className="px-6 py-3 text-right tabular-nums text-slate-600">
                        {tx.pricePerUnitCents != null ? formatTHB(tx.pricePerUnitCents) : "—"}
                      </td>
                    </>
                  )}
                  <td className="px-6 py-3 text-right font-medium tabular-nums text-slate-900">{formatTHB(tx.amountCents)}</td>
                  <td className="px-6 py-3 text-slate-400 text-xs max-w-[180px] truncate">{tx.note ?? "—"}</td>
                  <td className="px-6 py-3 text-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem className="text-red-600" onClick={() => setDeleteId(tx.id)}>
                          <Trash2 className="mr-2 h-4 w-4" /> ลบ
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
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
