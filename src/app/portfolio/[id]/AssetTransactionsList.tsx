"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2, ArrowUpDown, X } from "lucide-react";
import { toast } from "sonner";
import { assetTransactionSchema, type AssetTransactionFormData } from "@/lib/validators";
import { createAssetTransaction, deleteAssetTransaction } from "@/actions/assets";
import { formatTHB, toCents } from "@/lib/money";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/EmptyState";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { MoneyInput } from "@/components/MoneyInput";
import { RowActions } from "@/components/RowActions";
import { Field } from "@/components/Field";

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
  const typeLabel = (t: string) => txTypes.find((x) => x.value === t)?.label ?? t;
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
    try {
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
    } catch {
      toast.error("เพิ่มรายการไม่สำเร็จ ลองอีกครั้ง");
    }
  }

  async function handleDelete() {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await deleteAssetTransaction(deleteId);
      toast.success("ลบรายการแล้ว");
      router.refresh();
    } catch {
      toast.error("ลบไม่สำเร็จ ลองอีกครั้ง");
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  }

  const rows = [...transactions].reverse();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-slate-900">
          ธุรกรรม
          <span className="ml-1.5 font-normal tabular-nums text-slate-400">{transactions.length}</span>
        </h2>
        <Button onClick={() => setShowAdd(!showAdd)} variant={showAdd ? "outline" : "default"} aria-expanded={showAdd}>
          {showAdd ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {showAdd ? "ปิด" : "เพิ่มรายการ"}
        </Button>
      </div>

      {showAdd && (
        <Card className="p-4 sm:p-5">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <Field label="ประเภท" className="col-span-2 sm:col-span-1">
                <Select value={watchType} onChange={(e) => setValue("type", e.target.value)}>
                  {txTypes.map((t) => (<option key={t.value} value={t.value}>{t.label}</option>))}
                </Select>
              </Field>
              {showQtyFields && (
                <>
                  <Field label="จำนวนหน่วย">
                    <Input type="text" inputMode="numeric" {...register("quantity")} placeholder="0" />
                  </Field>
                  <Field label="ราคา/หน่วย">
                    <MoneyInput value={watchPricePerUnit} onChange={(v) => setValue("pricePerUnit", v)} />
                  </Field>
                </>
              )}
              <Field label="จำนวนเงิน" error={errors.amount?.message} className="col-span-2 sm:col-span-1">
                <MoneyInput
                  value={watchAmount}
                  onChange={(v) => setValue("amount", v, { shouldValidate: !!errors.amount })}
                  aria-invalid={!!errors.amount}
                />
              </Field>
              <Field label="วันที่">
                <Input type="date" {...register("date")} />
              </Field>
              <Field label="หมายเหตุ">
                <Input {...register("note")} placeholder="ไม่บังคับ" />
              </Field>
            </div>
            <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
              {isSubmitting ? "กำลังบันทึก..." : "บันทึก"}
            </Button>
          </form>
        </Card>
      )}

      <Card className="overflow-hidden">
        {transactions.length === 0 ? (
          <EmptyState icon={<ArrowUpDown className="h-8 w-8" />} title="ยังไม่มีรายการ" description="เพิ่มธุรกรรมเพื่อเริ่มติดตาม" />
        ) : (
          <>
            {/* Phone + tablet */}
            <ul className="divide-y divide-slate-100 lg:hidden">
              {rows.map((tx) => (
                <li key={tx.id} className="flex items-center gap-3 py-3 pl-4 pr-2 sm:pl-5 sm:pr-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <span className="flex min-w-0 items-center gap-2">
                        <Badge variant={TX_BADGE_VARIANT[tx.type] ?? "default"} className="shrink-0">
                          {typeLabel(tx.type)}
                        </Badge>
                        <span className="truncate text-sm tabular-nums text-slate-500">{tx.date}</span>
                      </span>
                      <span className="shrink-0 font-semibold tabular-nums text-slate-900">{formatTHB(tx.amountCents)}</span>
                    </div>
                    {(tx.quantity != null || tx.note) && (
                      <p className="mt-1 truncate text-xs text-slate-500">
                        {tx.quantity != null && (
                          <span className="tabular-nums">
                            {tx.quantity.toLocaleString("th-TH")} หน่วย
                            {tx.pricePerUnitCents != null && ` × ${formatTHB(tx.pricePerUnitCents)}`}
                          </span>
                        )}
                        {tx.quantity != null && tx.note && " · "}
                        {tx.note}
                      </p>
                    )}
                  </div>
                  <RowActions
                    label="ตัวเลือกของรายการนี้"
                    actions={[{ label: "ลบรายการ", icon: Trash2, onSelect: () => setDeleteId(tx.id), destructive: true }]}
                  />
                </li>
              ))}
            </ul>

            {/* Desktop */}
            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-xs font-medium text-slate-500">
                    <th scope="col" className="px-4 py-3 text-left xl:px-6">วันที่</th>
                    <th scope="col" className="px-4 py-3 text-left xl:px-6">ประเภท</th>
                    {assetType !== "BANK" && (
                      <>
                        <th scope="col" className="px-4 py-3 text-right xl:px-6">จำนวน</th>
                        <th scope="col" className="px-4 py-3 text-right xl:px-6">ราคา/หน่วย</th>
                      </>
                    )}
                    <th scope="col" className="px-4 py-3 text-right xl:px-6">จำนวนเงิน</th>
                    <th scope="col" className="px-4 py-3 text-left xl:px-6">หมายเหตุ</th>
                    <th scope="col" className="w-[1%] px-4 py-3 xl:px-6"><span className="sr-only">ตัวเลือก</span></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rows.map((tx) => (
                    <tr key={tx.id} className="transition-colors hover:bg-slate-50/60">
                      <td className="px-4 py-3 tabular-nums text-slate-500 xl:px-6">{tx.date}</td>
                      <td className="px-4 py-3 xl:px-6">
                        <Badge variant={TX_BADGE_VARIANT[tx.type] ?? "default"}>{typeLabel(tx.type)}</Badge>
                      </td>
                      {assetType !== "BANK" && (
                        <>
                          <td className="px-4 py-3 text-right tabular-nums text-slate-900 xl:px-6">{tx.quantity ?? "—"}</td>
                          <td className="px-4 py-3 text-right tabular-nums text-slate-600 xl:px-6">
                            {tx.pricePerUnitCents != null ? formatTHB(tx.pricePerUnitCents) : "—"}
                          </td>
                        </>
                      )}
                      <td className="px-4 py-3 text-right font-medium tabular-nums text-slate-900 xl:px-6">{formatTHB(tx.amountCents)}</td>
                      <td className="max-w-[180px] truncate px-4 py-3 text-xs text-slate-500 xl:px-6">{tx.note ?? "—"}</td>
                      <td className="px-4 py-3 text-right xl:px-6">
                        <RowActions
                          label="ตัวเลือกของรายการนี้"
                          actions={[{ label: "ลบรายการ", icon: Trash2, onSelect: () => setDeleteId(tx.id), destructive: true }]}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
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
