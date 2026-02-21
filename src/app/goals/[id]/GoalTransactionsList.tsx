"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { goalTransactionSchema, type GoalTransactionFormData } from "@/lib/validators";
import { createGoalTransaction, deleteGoalTransaction } from "@/actions/goals";
import { formatTHB, toCents } from "@/lib/money";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/EmptyState";
import { Plus, Trash2, ArrowDownCircle, MoreHorizontal } from "lucide-react";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { DropdownMenu, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuContent } from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { MoneyInput } from "@/components/MoneyInput";

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
    await createGoalTransaction({
      goalAccountId: goalId,
      type: data.type,
      amountCents: toCents(parseFloat(data.amount)),
      date: data.date,
      note: data.note || undefined,
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
      await deleteGoalTransaction(deleteId);
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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-slate-900">ประวัติธุรกรรม</h2>
        <Button onClick={() => setShowAdd(!showAdd)} size="sm">
          <Plus className="w-4 h-4" />
          เพิ่มรายการ
        </Button>
      </div>

      {showAdd && (
        <Card className="p-4">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <Select value={watchType} onChange={(e) => setValue("type", e.target.value as "DEPOSIT" | "WITHDRAW")}>
                <option value="DEPOSIT">ฝากเข้า</option>
                <option value="WITHDRAW">ถอนออก</option>
              </Select>
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

      <Card>
        {transactions.length === 0 ? (
          <EmptyState
            icon={<ArrowDownCircle className="w-8 h-8" />}
            title="ยังไม่มีรายการ"
            description="เพิ่มรายการฝาก/ถอนเพื่อเริ่มติดตาม"
          />
        ) : (
          <div className="divide-y divide-slate-50">
            {[...transactions].reverse().map((tx) => (
              <div key={tx.id} className="flex items-center justify-between px-6 py-3">
                <div className="flex items-center gap-3">
                  <Badge variant={tx.type === "DEPOSIT" ? "success" : "destructive"}>
                    {tx.type === "DEPOSIT" ? "ฝาก" : "ถอน"}
                  </Badge>
                  <span className="text-sm text-slate-500">{tx.date}</span>
                  {tx.note && <span className="text-xs text-slate-400">{tx.note}</span>}
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-sm font-medium tabular-nums ${tx.type === "DEPOSIT" ? "text-emerald-600" : "text-red-600"}`}>
                    {tx.type === "DEPOSIT" ? "+" : "-"}{formatTHB(tx.amountCents)}
                  </span>
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
                </div>
              </div>
            ))}
          </div>
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
