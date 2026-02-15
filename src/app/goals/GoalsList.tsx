"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { formatTHB, toCents } from "@/lib/money";
import { createGoal } from "@/actions/goals";
import { Card, CardTitle, CardValue } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/EmptyState";
import { Plus, Target } from "lucide-react";
import { toast } from "sonner";
import { MoneyInput } from "@/components/MoneyInput";
import type { GoalBalance } from "@/lib/calc/goals";

type Goal = {
  id: string;
  name: string;
  openingBalanceCents: number;
  balance: GoalBalance;
};

export function GoalsList({ goals, userId }: { goals: Goal[]; userId: string }) {
  const router = useRouter();
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const [openingBalance, setOpeningBalance] = useState("");
  const [isPending, startTransition] = useTransition();

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
          <form onSubmit={handleCreate} className="flex gap-3">
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
              className="w-44"
            />
            <Button type="submit" disabled={isPending}>
              {isPending ? "..." : "สร้าง"}
            </Button>
          </form>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {goals.map((goal) => (
          <Link key={goal.id} href={`/goals/${goal.id}`}>
            <Card className="p-5 hover:border-indigo-300 transition-colors cursor-pointer h-full">
              <div className="flex items-center gap-2 mb-3">
                <Target className="w-4 h-4 text-indigo-500" />
                <h3 className="font-medium text-slate-900">{goal.name}</h3>
              </div>
              <p className="text-2xl font-semibold tabular-nums text-indigo-600">
                {formatTHB(goal.balance.currentBalance)}
              </p>
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-500">
                <div>
                  ตั้งต้น: <span className="font-medium tabular-nums">{formatTHB(goal.balance.openingBalance)}</span>
                </div>
                <div>
                  ฝากเข้า: <span className="font-medium tabular-nums text-emerald-600">{formatTHB(goal.balance.totalDeposits)}</span>
                </div>
                <div>
                  ถอนออก: <span className="font-medium tabular-nums text-red-600">{formatTHB(goal.balance.totalWithdrawals)}</span>
                </div>
              </div>
            </Card>
          </Link>
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
    </div>
  );
}
