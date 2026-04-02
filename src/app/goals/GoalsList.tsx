"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { formatTHB, toCents } from "@/lib/money";
import { createGoal, updateGoal, deleteGoal } from "@/actions/goals";
import { Card, CardTitle, CardValue } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/EmptyState";
import { Plus, Target, Pencil, Trash2, Wallet, ArrowDownLeft, ArrowUpFromLine } from "lucide-react";
import { toast } from "sonner";
import { MoneyInput } from "@/components/MoneyInput";
import type { GoalBalance } from "@/lib/calc/goals";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { ConfirmDialog } from "@/components/ConfirmDialog";

type Goal = {
  id: string;
  name: string;
  slug: string | null;
  openingBalanceCents: number;
  balance: GoalBalance;
};

export function GoalsList({ goals, userId }: { goals: Goal[]; userId: string }) {
  const router = useRouter();
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const [openingBalance, setOpeningBalance] = useState("");
  const [isPending, startTransition] = useTransition();
  const [editGoal, setEditGoal] = useState<Goal | null>(null);
  const [editOpeningBalance, setEditOpeningBalance] = useState("");
  const [editSlug, setEditSlug] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    startTransition(async () => {
      try {
        await createGoal(userId, {
          name: name.trim(),
          openingBalanceCents: openingBalance ? toCents(parseFloat(openingBalance)) : 0,
        });
        setName("");
        setOpeningBalance("");
        setShowCreate(false);
        toast.success("สร้างเป้าหมายแล้ว");
        router.refresh();
      } catch {
        toast.error("เกิดข้อผิดพลาด");
      }
    });
  }

  async function handleSaveEdit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!editGoal) return;

    setSavingEdit(true);
    try {
      await updateGoal(editGoal.id, {
        openingBalanceCents: editOpeningBalance ? toCents(parseFloat(editOpeningBalance)) : 0,
        slug: editSlug.trim() || undefined,
      });
      toast.success("อัปเดตยอดตั้งต้นเป้าหมายแล้ว");
      setEditGoal(null);
      setEditOpeningBalance("");
      setEditSlug("");
      router.refresh();
    } catch {
      toast.error("เกิดข้อผิดพลาดในการอัปเดต");
    } finally {
      setSavingEdit(false);
    }
  }

  async function handleDelete() {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await deleteGoal(deleteId);
      toast.success("ลบเป้าหมายแล้ว");
      router.refresh();
    } catch {
      toast.error("เกิดข้อผิดพลาดในการลบ");
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setShowCreate(!showCreate)}>
          <Plus className="w-4 h-4" />
          สร้างเป้าหมายใหม่
        </Button>
      </div>

      {showCreate && (
        <Card className="p-4">
          <form onSubmit={handleCreate} className="flex flex-col sm:flex-row gap-3">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="ชื่อเป้าหมาย"
              className="flex-1"
            />
            <MoneyInput
              value={openingBalance}
              onChange={setOpeningBalance}
              placeholder="ยอดตั้งต้น"
              className="w-full sm:w-44"
            />
            <Button type="submit" disabled={isPending}>
              {isPending ? "..." : "สร้าง"}
            </Button>
          </form>
        </Card>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {goals.map((goal) => (
          <Card key={goal.id} className="group relative overflow-hidden h-full hover:shadow-md transition-shadow">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-500" />
            <div className="p-5">
              <div className="flex items-start justify-between gap-2 mb-4">
                <Link href={`/goals/${goal.id}`} className="flex min-w-0 items-center gap-2.5 hover:opacity-80">
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
                    <Target className="w-4 h-4 text-indigo-600" />
                  </div>
                  <h3 className="font-semibold text-slate-900 truncate">{goal.name}</h3>
                </Link>
                <div className="flex items-center gap-0.5">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => {
                      setEditGoal(goal);
                      setEditOpeningBalance((goal.openingBalanceCents / 100).toFixed(2));
                      setEditSlug(goal.slug || "");
                    }}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-700 hover:bg-red-50"
                    onClick={() => setDeleteId(goal.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>

              <Link href={`/goals/${goal.id}`} className="block">
                <p className="text-2xl font-bold tabular-nums text-indigo-600 mb-4">
                  {formatTHB(goal.balance.currentBalance)}
                </p>
                <div className="grid grid-cols-3 gap-3">
                  <div className="flex flex-col items-center rounded-lg bg-slate-50 px-2 py-2.5">
                    <Wallet className="w-3.5 h-3.5 text-slate-400 mb-1" />
                    <span className="text-[10px] text-slate-400 mb-0.5">ตั้งต้น</span>
                    <span className="text-xs font-semibold tabular-nums text-slate-700">{formatTHB(goal.balance.openingBalance)}</span>
                  </div>
                  <div className="flex flex-col items-center rounded-lg bg-emerald-50 px-2 py-2.5">
                    <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-500 mb-1" />
                    <span className="text-[10px] text-emerald-500 mb-0.5">ฝากเข้า</span>
                    <span className="text-xs font-semibold tabular-nums text-emerald-700">{formatTHB(goal.balance.totalDeposits)}</span>
                  </div>
                  <div className="flex flex-col items-center rounded-lg bg-red-50 px-2 py-2.5">
                    <ArrowUpFromLine className="w-3.5 h-3.5 text-red-500 mb-1" />
                    <span className="text-[10px] text-red-500 mb-0.5">ถอนออก</span>
                    <span className="text-xs font-semibold tabular-nums text-red-700">{formatTHB(goal.balance.totalWithdrawals)}</span>
                  </div>
                </div>
              </Link>
            </div>
          </Card>
        ))}
        {goals.length === 0 && (
          <div className="col-span-full">
            <Card>
              <EmptyState
                icon={<Target className="w-8 h-8" />}
                title="ยังไม่มีเป้าหมาย"
                description="สร้างเป้าหมายการออมเพื่อเริ่มติดตาม"
              />
            </Card>
          </div>
        )}
      </div>

      <Dialog
        open={editGoal !== null}
        onOpenChange={(open) => {
          if (!open) {
            setEditGoal(null);
            setEditOpeningBalance("");
            setEditSlug("");
          }
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>แก้ไขยอดตั้งต้น: {editGoal?.name}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveEdit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="goalSlug">Slug</Label>
              <Input
                id="goalSlug"
                value={editSlug}
                onChange={(e) => setEditSlug(e.target.value.toLowerCase())}
                placeholder="เช่น goal-travel"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="goalOpening">ยอดตั้งต้น (บาท)</Label>
              <Input
                id="goalOpening"
                type="number"
                step="0.01"
                value={editOpeningBalance}
                onChange={(e) => setEditOpeningBalance(e.target.value)}
                placeholder="0.00"
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditGoal(null)}>
                ยกเลิก
              </Button>
              <Button type="submit" disabled={savingEdit}>
                {savingEdit ? "กำลังบันทึก..." : "บันทึก"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="ลบเป้าหมาย"
        description="คุณต้องการลบเป้าหมายนี้หรือไม่? รายการธุรกรรมทั้งหมดจะถูกลบด้วย"
        confirmLabel="ลบ"
        loading={deleting}
      />
    </div>
  );
}
