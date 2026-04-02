"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createFamilyMember, createFamilyTransaction, updateFamilyMember, deleteFamilyMember } from "@/actions/family";
import { formatTHB, toCents } from "@/lib/money";
import { Card, CardTitle, CardValue } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { EmptyState } from "@/components/EmptyState";
import { Plus, Users, Pencil, Trash2, Wallet } from "lucide-react";
import { toast } from "sonner";
import { MoneyInput } from "@/components/MoneyInput";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Badge } from "@/components/ui/badge";

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
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

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

  async function handleDelete() {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await deleteFamilyMember(deleteId);
      toast.success("ลบสมาชิกแล้ว");
      router.refresh();
    } catch {
      toast.error("เกิดข้อผิดพลาดในการลบ");
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  }

  const parents = members.filter((m) => m.type === "PARENT");
  const children = members.filter((m) => m.type === "CHILD");
  const grandTotal = members.reduce((s, m) => s + m.totalCents, 0);

  return (
    <div className="space-y-6">
      <Card className="relative overflow-hidden p-5">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-500 to-pink-500" />
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
            <Wallet className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <CardTitle className="text-sm text-slate-500">ยอดรวมทั้งหมด</CardTitle>
            <CardValue className="text-indigo-600">{formatTHB(grandTotal)}</CardValue>
          </div>
        </div>
      </Card>

      <div className="flex justify-end">
        <Button onClick={() => setShowAddMember(!showAddMember)}>
          <Plus className="w-4 h-4" />
          เพิ่มสมาชิก
        </Button>
      </div>

      {showAddMember && (
        <Card className="p-4">
          <form onSubmit={handleAddMember} className="flex flex-col sm:flex-row gap-3">
            <Input value={memberName} onChange={(e) => setMemberName(e.target.value)} placeholder="ชื่อ" className="flex-1" />
            <MoneyInput
              value={memberOpeningBalance}
              onChange={setMemberOpeningBalance}
              placeholder="ยอดตั้งต้น"
              className="w-full sm:w-40"
            />
            <Select value={memberType} onChange={(e) => setMemberType(e.target.value as "PARENT" | "CHILD")} className="w-full sm:w-32">
              <option value="PARENT">พ่อแม่</option>
              <option value="CHILD">หลาน</option>
            </Select>
            <Button type="submit" disabled={isPending}>สร้าง</Button>
          </form>
        </Card>
      )}

      {parents.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">พ่อแม่</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {parents.map((m) => (
              <MemberCard key={m.id} member={m} addingTxFor={addingTxFor} setAddingTxFor={setAddingTxFor}
                txAmount={txAmount} setTxAmount={setTxAmount} txDate={txDate} setTxDate={setTxDate}
                txNote={txNote} setTxNote={setTxNote} isPending={isPending} onAddTx={handleAddTx}
                onEditOpening={() => {
                  setEditMember(m);
                  setEditOpeningBalance((m.openingBalanceCents / 100).toFixed(2));
                }}
                onDelete={() => setDeleteId(m.id)} />
            ))}
          </div>
        </div>
      )}

      {children.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">หลาน</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {children.map((m) => (
              <MemberCard key={m.id} member={m} addingTxFor={addingTxFor} setAddingTxFor={setAddingTxFor}
                txAmount={txAmount} setTxAmount={setTxAmount} txDate={txDate} setTxDate={setTxDate}
                txNote={txNote} setTxNote={setTxNote} isPending={isPending} onAddTx={handleAddTx}
                onEditOpening={() => {
                  setEditMember(m);
                  setEditOpeningBalance((m.openingBalanceCents / 100).toFixed(2));
                }}
                onDelete={() => setDeleteId(m.id)} />
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

      <ConfirmDialog
        open={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="ลบสมาชิก"
        description="คุณต้องการลบสมาชิกนี้หรือไม่? รายการธุรกรรมทั้งหมดจะถูกลบด้วย"
        confirmLabel="ลบ"
        loading={deleting}
      />
    </div>
  );
}

function MemberCard({
  member, addingTxFor, setAddingTxFor, txAmount, setTxAmount, txDate, setTxDate, txNote, setTxNote, isPending, onAddTx,
  onEditOpening, onDelete,
}: {
  member: { id: string; name: string; type: "PARENT" | "CHILD"; openingBalanceCents: number; transactions: { id: string; amountCents: number; date: string; note: string | null }[]; totalCents: number };
  addingTxFor: string | null; setAddingTxFor: (v: string | null) => void;
  txAmount: string; setTxAmount: (v: string) => void;
  txDate: string; setTxDate: (v: string) => void;
  txNote: string; setTxNote: (v: string) => void;
  isPending: boolean; onAddTx: (e: React.FormEvent, memberId: string) => void;
  onEditOpening: () => void;
  onDelete: () => void;
}) {
  const txTotal = member.transactions.reduce((s, tx) => s + tx.amountCents, 0);
  return (
    <Card className="group relative overflow-hidden hover:shadow-md transition-shadow">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-400 to-rose-400" />
      <div className="p-5">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center">
              <Users className="w-4 h-4 text-orange-600" />
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-slate-900 truncate">{member.name}</h3>
              <Badge variant={member.type === "PARENT" ? "purple" : "info"} className="mt-0.5">
                {member.type === "PARENT" ? "พ่อแม่" : "หลาน"}
              </Badge>
            </div>
          </div>
          <div className="flex items-center gap-0.5">
            <Button size="icon" variant="ghost" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity" onClick={onEditOpening}>
              <Pencil className="w-3.5 h-3.5" />
            </Button>
            <Button size="icon" variant="ghost" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-700 hover:bg-red-50" onClick={onDelete}>
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>

        <p className="text-2xl font-bold tabular-nums text-indigo-600 mb-3">
          {formatTHB(member.totalCents)}
        </p>

        <div className="grid grid-cols-2 gap-3 mb-3">
          <div className="flex flex-col items-center rounded-lg bg-slate-50 px-2 py-2">
            <span className="text-[10px] text-slate-400 mb-0.5">ตั้งต้น</span>
            <span className="text-xs font-semibold tabular-nums text-slate-700">{formatTHB(member.openingBalanceCents)}</span>
          </div>
          <div className="flex flex-col items-center rounded-lg bg-emerald-50 px-2 py-2">
            <span className="text-[10px] text-emerald-500 mb-0.5">ธุรกรรม</span>
            <span className="text-xs font-semibold tabular-nums text-emerald-700">{formatTHB(txTotal)}</span>
          </div>
        </div>

        <div className="flex justify-end mb-2">
          <Button size="sm" variant="outline" onClick={() => setAddingTxFor(addingTxFor === member.id ? null : member.id)}>
            <Plus className="w-3.5 h-3.5" />
            เพิ่มรายการ
          </Button>
        </div>

        {addingTxFor === member.id && (
          <form onSubmit={(e) => onAddTx(e, member.id)} className="mb-3 flex gap-2 flex-wrap">
            <MoneyInput value={txAmount} onChange={setTxAmount} placeholder="จำนวนเงิน" className="w-full sm:w-36" />
            <Input type="date" value={txDate} onChange={(e) => setTxDate(e.target.value)} className="w-full sm:w-auto" />
            <Input value={txNote} onChange={(e) => setTxNote(e.target.value)} placeholder="หมายเหตุ" className="flex-1 min-w-[120px]" />
            <Button type="submit" disabled={isPending} size="sm">บันทึก</Button>
          </form>
        )}

        {member.transactions.length > 0 && (
          <div className="border-t border-slate-100 pt-2 space-y-1">
            {[...member.transactions].reverse().slice(0, 5).map((tx) => (
              <div key={tx.id} className="flex items-center justify-between text-sm py-1">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-slate-400 text-xs flex-shrink-0">{tx.date}</span>
                  {tx.note && <span className="text-xs text-slate-400 truncate">{tx.note}</span>}
                </div>
                <span className="font-medium tabular-nums text-slate-900 flex-shrink-0">{formatTHB(tx.amountCents)}</span>
              </div>
            ))}
            {member.transactions.length > 5 && (
              <p className="text-xs text-slate-400 text-center pt-1">+{member.transactions.length - 5} รายการ</p>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
