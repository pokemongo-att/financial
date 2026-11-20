"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, Target, Pencil, Trash2, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { formatTHB, toCents } from "@/lib/money";
import { createGoal, updateGoal, deleteGoal } from "@/actions/goals";
import type { GoalBalance } from "@/lib/calc/goals";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { EmptyState } from "@/components/EmptyState";
import { MoneyInput } from "@/components/MoneyInput";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { RowActions } from "@/components/RowActions";
import { Field } from "@/components/Field";

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
        toast.error("สร้างเป้าหมายไม่สำเร็จ ลองอีกครั้ง");
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
      toast.error("อัปเดตไม่สำเร็จ ลองอีกครั้ง");
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
      toast.error("ลบไม่สำเร็จ ลองอีกครั้ง");
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  }

  const total = goals.reduce((s, g) => s + g.balance.currentBalance, 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-slate-500">
          รวมทุกเป้าหมาย <span className="font-semibold tabular-nums text-slate-900">{formatTHB(total)}</span>
        </p>
        <Button onClick={() => setShowCreate(!showCreate)} aria-expanded={showCreate}>
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">สร้างเป้าหมายใหม่</span>
          <span className="sm:hidden">สร้าง</span>
        </Button>
      </div>

      {showCreate && (
        <Card className="p-4">
          <form onSubmit={handleCreate} className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_12rem_auto] sm:items-end">
            <Field label="ชื่อเป้าหมาย">
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="เช่น เที่ยวญี่ปุ่น" autoFocus />
            </Field>
            <Field label="ยอดตั้งต้น">
              <MoneyInput value={openingBalance} onChange={setOpeningBalance} placeholder="0.00" />
            </Field>
            <Button type="submit" disabled={isPending || !name.trim()}>
              {isPending ? "กำลังสร้าง..." : "สร้าง"}
            </Button>
          </form>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-3">
        {goals.map((goal) => (
          <Card key={goal.id} className="relative overflow-hidden transition-shadow hover:shadow-md">
            <div className="absolute inset-x-0 top-0 h-1 bg-indigo-500" aria-hidden />
            <div className="flex items-start gap-2 px-4 pt-4 sm:px-5 sm:pt-5">
              <Link
                href={`/goals/${goal.id}`}
                className="flex min-w-0 flex-1 items-center gap-2.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-50">
                  <Target className="h-4 w-4 text-indigo-600" />
                </span>
                <h3 className="truncate font-semibold text-slate-900">{goal.name}</h3>
              </Link>
              <RowActions
                label={`ตัวเลือกของ ${goal.name}`}
                className="-mr-1.5"
                actions={[
                  {
                    label: "แก้ไขยอดตั้งต้น",
                    icon: Pencil,
                    onSelect: () => {
                      setEditGoal(goal);
                      setEditOpeningBalance((goal.openingBalanceCents / 100).toFixed(2));
                      setEditSlug(goal.slug || "");
                    },
                  },
                  { label: "ลบเป้าหมาย", icon: Trash2, onSelect: () => setDeleteId(goal.id), destructive: true },
                ]}
              />
            </div>

            <Link href={`/goals/${goal.id}`} className="block px-4 pb-4 pt-3 sm:px-5 sm:pb-5">
              <p className="text-xs text-slate-500">ยอดคงเหลือ</p>
              <p className="mt-0.5 text-2xl font-semibold tabular-nums tracking-tight text-indigo-600">
                {formatTHB(goal.balance.currentBalance)}
              </p>
              <dl className="mt-4 grid grid-cols-3 gap-2">
                <MiniStat label="ตั้งต้น" value={formatTHB(goal.balance.openingBalance)} />
                <MiniStat label="ฝากเข้า" value={formatTHB(goal.balance.totalDeposits)} tone="text-emerald-700" />
                <MiniStat label="ถอนออก" value={formatTHB(goal.balance.totalWithdrawals)} tone="text-red-700" />
              </dl>
              <span className="mt-3 flex items-center justify-end gap-1 text-xs font-medium text-indigo-600">
                ดูประวัติฝาก/ถอน
                <ChevronRight className="h-3.5 w-3.5" />
              </span>
            </Link>
          </Card>
        ))}
        {goals.length === 0 && (
          <div className="col-span-full">
            <Card>
              <EmptyState
                icon={<Target className="h-8 w-8" />}
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
        <DialogContent className="sm:max-w-md">
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
                autoCapitalize="none"
                autoCorrect="off"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="goalOpening">ยอดตั้งต้น (บาท)</Label>
              <MoneyInput id="goalOpening" value={editOpeningBalance} onChange={setEditOpeningBalance} />
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

function MiniStat({ label, value, tone = "text-slate-700" }: { label: string; value: string; tone?: string }) {
  return (
    <div className="min-w-0 rounded-lg bg-slate-50 px-2 py-2">
      <dt className="text-[11px] text-slate-500">{label}</dt>
      <dd className={`truncate text-xs font-semibold tabular-nums ${tone}`}>{value}</dd>
    </div>
  );
}
