"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2, ArrowDownCircle, X } from "lucide-react";
import { toast } from "sonner";
import { goalTransactionSchema, type GoalTransactionFormData } from "@/lib/validators";
import { createGoalTransaction, deleteGoalTransaction } from "@/actions/goals";
import { formatTHB, toCents } from "@/lib/money";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/EmptyState";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { MoneyInput } from "@/components/MoneyInput";
import { RowActions } from "@/components/RowActions";
import { Field } from "@/components/Field";
import { SegmentedControl } from "@/components/SegmentedControl";

type GoalTx = {
  id: string;
  type: "DEPOSIT" | "WITHDRAW";
  amountCents: number;
  date: string;
  note: string | null;
};

export function GoalTransactionsList({
  goalId,
  transactions,
}: {
  goalId: string;
  transactions: GoalTx[];
}) {
  const router = useRouter();
  const [showAdd, setShowAdd] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<GoalTransactionFormData>({
    resolver: zodResolver(goalTransactionSchema),
    defaultValues: {
      type: "DEPOSIT",
      amount: "",
      date: new Date().toISOString().slice(0, 10),
      note: "",
    },
  });

  const watchAmount = watch("amount");
  const watchType = watch("type");

  async function onSubmit(data: GoalTransactionFormData) {
    try {
      await createGoalTransaction({
        goalAccountId: goalId,
        type: data.type,
        amountCents: toCents(parseFloat(data.amount)),
        date: data.date,
        note: data.note || undefined,
      });
      reset();
      setShowAdd(false);
      toast.success(data.type === "DEPOSIT" ? "บันทึกการฝากแล้ว" : "บันทึกการถอนแล้ว");
      router.refresh();
    } catch {
      toast.error("บันทึกไม่สำเร็จ ลองอีกครั้ง");
    }
  }

  async function handleDelete() {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await deleteGoalTransaction(deleteId);
      toast.success("ลบรายการแล้ว");
      router.refresh();
    } catch {
      toast.error("ลบไม่สำเร็จ ลองอีกครั้ง");
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-slate-900">
            ประวัติธุรกรรม
            <span className="ml-1.5 font-normal tabular-nums text-slate-400">{transactions.length}</span>
          </h2>
          <Button onClick={() => setShowAdd(!showAdd)} variant={showAdd ? "outline" : "default"} aria-expanded={showAdd}>
            {showAdd ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {showAdd ? "ปิด" : "ฝาก / ถอน"}
          </Button>
        </div>

        {showAdd && (
          <Card className="p-4 sm:p-5">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <SegmentedControl
                label="ประเภทรายการ"
                value={watchType}
                onChange={(v) => setValue("type", v)}
                options={[
                  { value: "DEPOSIT", label: "ฝากเข้า", activeClass: "text-emerald-700" },
                  { value: "WITHDRAW", label: "ถอนออก", activeClass: "text-red-700" },
                ]}
                className="sm:max-w-xs"
              />
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-[12rem_10rem_1fr]">
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
                {isSubmitting ? "กำลังบันทึก..." : watchType === "DEPOSIT" ? "บันทึกการฝาก" : "บันทึกการถอน"}
              </Button>
            </form>
          </Card>
        )}

        <Card className="overflow-hidden">
          {transactions.length === 0 ? (
            <EmptyState
              icon={<ArrowDownCircle className="h-8 w-8" />}
              title="ยังไม่มีรายการ"
              description="เพิ่มรายการฝาก/ถอนเพื่อเริ่มติดตาม"
            />
          ) : (
            <ul className="divide-y divide-slate-100">
              {[...transactions].reverse().map((tx) => (
                <li key={tx.id} className="flex items-center gap-3 py-3 pl-4 pr-2 sm:pl-6 sm:pr-4">
                  <Badge variant={tx.type === "DEPOSIT" ? "success" : "destructive"} className="shrink-0">
                    {tx.type === "DEPOSIT" ? "ฝาก" : "ถอน"}
                  </Badge>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm tabular-nums text-slate-700">{tx.date}</p>
                    {tx.note && <p className="truncate text-xs text-slate-500">{tx.note}</p>}
                  </div>
                  <span
                    className={cn(
                      "shrink-0 text-sm font-semibold tabular-nums",
                      tx.type === "DEPOSIT" ? "text-emerald-600" : "text-red-600"
                    )}
                  >
                    {tx.type === "DEPOSIT" ? "+" : "−"}
                    {formatTHB(tx.amountCents)}
                  </span>
                  <RowActions
                    label="ตัวเลือกของรายการนี้"
                    actions={[{ label: "ลบรายการ", icon: Trash2, onSelect: () => setDeleteId(tx.id), destructive: true }]}
                  />
                </li>
              ))}
            </ul>
          )}
        </Card>
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
    </>
  );
}
