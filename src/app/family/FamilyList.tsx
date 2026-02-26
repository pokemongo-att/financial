"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createFamilyMember, createFamilyTransaction, updateFamilyMember } from "@/actions/family";
import { formatTHB, toCents } from "@/lib/money";
import { Card, CardTitle, CardValue } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { EmptyState } from "@/components/EmptyState";
import { Plus, Users, Pencil } from "lucide-react";
import { toast } from "sonner";
import { MoneyInput } from "@/components/MoneyInput";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

type FamilyTx = {
  id: string;
  amountCents: number;
  date: string;
  note: string | null;
};

type Member = {
  id: string;
  name: string;
  type: "PARENT" | "CHILD";
  openingBalanceCents: number;
  transactions: FamilyTx[];
  totalCents: number;
};

export function FamilyList({
  members,
  userId,
}: {
  members: Member[];
  userId: string;
}) {
  const router = useRouter();
  const [showAddMember, setShowAddMember] = useState(false);
  const [memberName, setMemberName] = useState("");
  const [memberType, setMemberType] = useState<"PARENT" | "CHILD">("PARENT");
  const [memberOpeningBalance, setMemberOpeningBalance] = useState("");
  const [isPending, startTransition] = useTransition();
  const [editMember, setEditMember] = useState<Member | null>(null);
  const [editOpeningBalance, setEditOpeningBalance] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  const [addingTxFor, setAddingTxFor] = useState<string | null>(null);
  const [txAmount, setTxAmount] = useState("");
  const [txDate, setTxDate] = useState(new Date().toISOString().slice(0, 10));
  const [txNote, setTxNote] = useState("");

  function handleAddMember(e: React.FormEvent) {
    e.preventDefault();
    if (!memberName.trim()) return;
    startTransition(async () => {
      try {
        await createFamilyMember(userId, {
          name: memberName.trim(),
          type: memberType,
          openingBalanceCents: memberOpeningBalance ? toCents(parseFloat(memberOpeningBalance)) : 0,
        });
        setMemberName("");
        setMemberOpeningBalance("");
        setShowAddMember(false);
        toast.success("เพิ่มสมาชิกแล้ว");
        router.refresh();
      } catch {
        toast.error("เกิดข้อผิดพลาด");
      }
    });
  }

  async function handleSaveEditMember(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!editMember) return;

    setSavingEdit(true);
    try {
      await updateFamilyMember(editMember.id, {
        openingBalanceCents: editOpeningBalance ? toCents(parseFloat(editOpeningBalance)) : 0,
      });
      toast.success("อัปเดตยอดตั้งต้นครอบครัวแล้ว");
      setEditMember(null);
      setEditOpeningBalance("");
      router.refresh();
    } catch {
      toast.error("เกิดข้อผิดพลาดในการอัปเดต");
    } finally {
      setSavingEdit(false);
    }
  }

  function handleAddTx(e: React.FormEvent, memberId: string) {
    e.preventDefault();
    if (!txAmount) return;
    startTransition(async () => {
      try {
        await createFamilyTransaction({
          familyMemberId: memberId,
          amountCents: toCents(parseFloat(txAmount)),
          date: txDate,
          note: txNote || undefined,
        });
        setTxAmount("");
        setTxNote("");
        setAddingTxFor(null);
        toast.success("เพิ่มรายการแล้ว");
        router.refresh();
      } catch {
        toast.error("เกิดข้อผิดพลาด");
      }
    });
  }

  const parents = members.filter((m) => m.type === "PARENT");
  const children = members.filter((m) => m.type === "CHILD");
  const grandTotal = members.reduce((s, m) => s + m.totalCents, 0);

  return (
    <div className="space-y-6">
      <Card className="p-5">
        <CardTitle>ยอดรวมทั้งหมด</CardTitle>
        <CardValue className="text-indigo-600">{formatTHB(grandTotal)}</CardValue>
      </Card>

      <div className="flex justify-end">
        <Button onClick={() => setShowAddMember(!showAddMember)}>
          <Plus className="w-4 h-4" />
          เพิ่มสมาชิก
        </Button>
      </div>

      {showAddMember && (
        <Card className="p-4">
          <form onSubmit={handleAddMember} className="flex gap-3">
            <Input value={memberName} onChange={(e) => setMemberName(e.target.value)} placeholder="ชื่อ" className="flex-1" />
            <MoneyInput
              value={memberOpeningBalance}
              onChange={setMemberOpeningBalance}
              placeholder="ยอดตั้งต้น"
              className="w-40"
            />
            <Select value={memberType} onChange={(e) => setMemberType(e.target.value as "PARENT" | "CHILD")} className="w-32">
              <option value="PARENT">พ่อแม่</option>
              <option value="CHILD">หลาน</option>
            </Select>
            <Button type="submit" disabled={isPending}>สร้าง</Button>
          </form>
        </Card>
      )}

      {parents.length > 0 && (
        <div>
          <h2 className="text-sm font-medium text-slate-500 mb-3">พ่อแม่</h2>
          <div className="space-y-3">
            {parents.map((m) => (
              <MemberCard key={m.id} member={m} addingTxFor={addingTxFor} setAddingTxFor={setAddingTxFor}
                txAmount={txAmount} setTxAmount={setTxAmount} txDate={txDate} setTxDate={setTxDate}
                txNote={txNote} setTxNote={setTxNote} isPending={isPending} onAddTx={handleAddTx}
                onEditOpening={() => {
                  setEditMember(m);
                  setEditOpeningBalance((m.openingBalanceCents / 100).toFixed(2));
                }} />
            ))}
          </div>
        </div>
      )}

      {children.length > 0 && (
        <div>
          <h2 className="text-sm font-medium text-slate-500 mb-3">หลาน</h2>
          <div className="space-y-3">
            {children.map((m) => (
              <MemberCard key={m.id} member={m} addingTxFor={addingTxFor} setAddingTxFor={setAddingTxFor}
                txAmount={txAmount} setTxAmount={setTxAmount} txDate={txDate} setTxDate={setTxDate}
                txNote={txNote} setTxNote={setTxNote} isPending={isPending} onAddTx={handleAddTx}
                onEditOpening={() => {
                  setEditMember(m);
                  setEditOpeningBalance((m.openingBalanceCents / 100).toFixed(2));
                }} />
            ))}
          </div>
        </div>
      )}

      {members.length === 0 && (
        <Card>
          <EmptyState icon={<Users className="w-8 h-8" />} title="ยังไม่มีสมาชิก" description="เพิ่มสมาชิกครอบครัวเพื่อเริ่มติดตาม" />
        </Card>
      )}

      <Dialog
        open={editMember !== null}
        onOpenChange={(open) => {
          if (!open) {
            setEditMember(null);
            setEditOpeningBalance("");
          }
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>แก้ไขยอดตั้งต้น: {editMember?.name}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveEditMember} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="familyOpening">ยอดตั้งต้น (บาท)</Label>
              <Input
                id="familyOpening"
                type="number"
                step="0.01"
                value={editOpeningBalance}
                onChange={(e) => setEditOpeningBalance(e.target.value)}
                placeholder="0.00"
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditMember(null)}>
                ยกเลิก
              </Button>
              <Button type="submit" disabled={savingEdit}>
                {savingEdit ? "กำลังบันทึก..." : "บันทึก"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function MemberCard({
  member, addingTxFor, setAddingTxFor, txAmount, setTxAmount, txDate, setTxDate, txNote, setTxNote, isPending, onAddTx,
  onEditOpening,
}: {
  member: { id: string; name: string; openingBalanceCents: number; transactions: { id: string; amountCents: number; date: string; note: string | null }[]; totalCents: number };
  addingTxFor: string | null; setAddingTxFor: (v: string | null) => void;
  txAmount: string; setTxAmount: (v: string) => void;
  txDate: string; setTxDate: (v: string) => void;
  txNote: string; setTxNote: (v: string) => void;
  isPending: boolean; onAddTx: (e: React.FormEvent, memberId: string) => void;
  onEditOpening: () => void;
}) {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="font-medium text-slate-900">{member.name}</h3>
          <p className="text-sm text-slate-500">
            ยอดตั้งต้น: <span className="font-medium tabular-nums text-slate-700">{formatTHB(member.openingBalanceCents)}</span>
          </p>
          <p className="text-sm text-slate-500">
            ยอดรวม: <span className="font-medium tabular-nums text-indigo-600">{formatTHB(member.totalCents)}</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={onEditOpening}>
            <Pencil className="w-3.5 h-3.5" />
            แก้ยอดตั้งต้น
          </Button>
          <Button size="sm" onClick={() => setAddingTxFor(addingTxFor === member.id ? null : member.id)}>
            <Plus className="w-3.5 h-3.5" />
            เพิ่มรายการ
          </Button>
        </div>
      </div>

      {addingTxFor === member.id && (
        <form onSubmit={(e) => onAddTx(e, member.id)} className="mb-3 flex gap-2 flex-wrap">
          <MoneyInput value={txAmount} onChange={setTxAmount} placeholder="จำนวนเงิน" className="w-36" />
          <Input type="date" value={txDate} onChange={(e) => setTxDate(e.target.value)} className="w-auto" />
          <Input value={txNote} onChange={(e) => setTxNote(e.target.value)} placeholder="หมายเหตุ" className="flex-1" />
          <Button type="submit" disabled={isPending} size="sm">บันทึก</Button>
        </form>
      )}

      {member.transactions.length > 0 && (
        <div className="border-t border-slate-100 pt-2 space-y-1">
          {[...member.transactions].reverse().slice(0, 5).map((tx) => (
            <div key={tx.id} className="flex items-center justify-between text-sm py-1">
              <div className="flex items-center gap-2">
                <span className="text-slate-400 text-xs">{tx.date}</span>
                {tx.note && <span className="text-xs text-slate-400">{tx.note}</span>}
              </div>
              <span className="font-medium tabular-nums text-slate-900">{formatTHB(tx.amountCents)}</span>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
