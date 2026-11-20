"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Users, Pencil, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { createFamilyMember, createFamilyTransaction, updateFamilyMember, deleteFamilyMember } from "@/actions/family";
import { formatTHB, toCents } from "@/lib/money";
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
import { SegmentedControl } from "@/components/SegmentedControl";

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
        toast.error("เพิ่มสมาชิกไม่สำเร็จ ลองอีกครั้ง");
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
      toast.error("อัปเดตไม่สำเร็จ ลองอีกครั้ง");
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
        toast.success("บันทึกรายการแล้ว");
        router.refresh();
      } catch {
        toast.error("บันทึกรายการไม่สำเร็จ ลองอีกครั้ง");
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
      toast.error("ลบไม่สำเร็จ ลองอีกครั้ง");
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  }

  const parents = members.filter((m) => m.type === "PARENT");
  const children = members.filter((m) => m.type === "CHILD");
  const grandTotal = members.reduce((s, m) => s + m.totalCents, 0);

  const cardProps = (m: Member) => ({
    member: m,
    adding: addingTxFor === m.id,
    setAddingTxFor,
    txAmount,
    setTxAmount,
    txDate,
    setTxDate,
    txNote,
    setTxNote,
    isPending,
    onAddTx: handleAddTx,
    onEditOpening: () => {
      setEditMember(m);
      setEditOpeningBalance((m.openingBalanceCents / 100).toFixed(2));
    },
    onDelete: () => setDeleteId(m.id),
  });

  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-slate-500">
          ยอดรวมทั้งหมด{" "}
          <span className="text-base font-semibold tabular-nums text-indigo-600">{formatTHB(grandTotal)}</span>
        </p>
        <Button
          onClick={() => setShowAddMember(!showAddMember)}
          variant={showAddMember ? "outline" : "default"}
          aria-expanded={showAddMember}
        >
          {showAddMember ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {showAddMember ? "ปิด" : "เพิ่มสมาชิก"}
        </Button>
      </div>

      {showAddMember && (
        <Card className="p-4 sm:p-5">
          <form
            onSubmit={handleAddMember}
            className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_11rem_12rem_auto] lg:items-end"
          >
            <Field label="ชื่อ">
              <Input value={memberName} onChange={(e) => setMemberName(e.target.value)} placeholder="เช่น แม่" autoFocus />
            </Field>
            <div className="space-y-1.5">
              <span className="block text-xs font-medium text-slate-600">ความสัมพันธ์</span>
              <SegmentedControl
                label="ความสัมพันธ์"
                value={memberType}
                onChange={setMemberType}
                options={[
                  { value: "PARENT", label: "พ่อแม่" },
                  { value: "CHILD", label: "หลาน" },
                ]}
              />
            </div>
            <Field label="ยอดตั้งต้น">
              <MoneyInput value={memberOpeningBalance} onChange={setMemberOpeningBalance} />
            </Field>
            <Button type="submit" disabled={isPending || !memberName.trim()} className="sm:self-end">
              {isPending ? "กำลังเพิ่ม..." : "เพิ่ม"}
            </Button>
          </form>
        </Card>
      )}

      {parents.length > 0 && (
        <section>
          <h2 className="mb-3 text-sm font-semibold text-slate-900">พ่อแม่</h2>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4">
            {parents.map((m) => (
              <MemberCard key={m.id} {...cardProps(m)} />
            ))}
          </div>
        </section>
      )}

      {children.length > 0 && (
        <section>
          <h2 className="mb-3 text-sm font-semibold text-slate-900">หลาน</h2>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4">
            {children.map((m) => (
              <MemberCard key={m.id} {...cardProps(m)} />
            ))}
          </div>
        </section>
      )}

      {members.length === 0 && (
        <Card>
          <EmptyState icon={<Users className="h-8 w-8" />} title="ยังไม่มีสมาชิก" description="เพิ่มสมาชิกครอบครัวเพื่อเริ่มติดตาม" />
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
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>แก้ไขยอดตั้งต้น: {editMember?.name}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveEditMember} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="familyOpening">ยอดตั้งต้น (บาท)</Label>
              <MoneyInput id="familyOpening" value={editOpeningBalance} onChange={setEditOpeningBalance} />
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
  member,
  adding,
  setAddingTxFor,
  txAmount,
  setTxAmount,
  txDate,
  setTxDate,
  txNote,
  setTxNote,
  isPending,
  onAddTx,
  onEditOpening,
  onDelete,
}: {
  member: Member;
  adding: boolean;
  setAddingTxFor: (v: string | null) => void;
  txAmount: string;
  setTxAmount: (v: string) => void;
  txDate: string;
  setTxDate: (v: string) => void;
  txNote: string;
  setTxNote: (v: string) => void;
  isPending: boolean;
  onAddTx: (e: React.FormEvent, memberId: string) => void;
  onEditOpening: () => void;
  onDelete: () => void;
}) {
  const txTotal = member.transactions.reduce((s, tx) => s + tx.amountCents, 0);

  return (
    <Card className="relative overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-1 bg-orange-400" aria-hidden />
      <div className="p-4 sm:p-5">
        <div className="mb-3 flex items-start justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-orange-50">
              <Users className="h-4 w-4 text-orange-600" />
            </span>
            <div className="min-w-0">
              <h3 className="truncate font-semibold text-slate-900">{member.name}</h3>
              <p className="text-xs text-slate-500">{member.type === "PARENT" ? "พ่อแม่" : "หลาน"}</p>
            </div>
          </div>
          <RowActions
            label={`ตัวเลือกของ ${member.name}`}
            className="-mr-1.5"
            actions={[
              { label: "แก้ไขยอดตั้งต้น", icon: Pencil, onSelect: onEditOpening },
              { label: "ลบสมาชิก", icon: Trash2, onSelect: onDelete, destructive: true },
            ]}
          />
        </div>

        <p className="text-xs text-slate-500">ยอดรวม</p>
        <p className="mt-0.5 text-2xl font-semibold tabular-nums tracking-tight text-indigo-600">
          {formatTHB(member.totalCents)}
        </p>

        <dl className="mt-3 grid grid-cols-2 gap-2">
          <div className="rounded-lg bg-slate-50 px-3 py-2">
            <dt className="text-[11px] text-slate-500">ตั้งต้น</dt>
            <dd className="text-xs font-semibold tabular-nums text-slate-700">{formatTHB(member.openingBalanceCents)}</dd>
          </div>
          <div className="rounded-lg bg-emerald-50 px-3 py-2">
            <dt className="text-[11px] text-emerald-700">ธุรกรรม</dt>
            <dd className="text-xs font-semibold tabular-nums text-emerald-700">{formatTHB(txTotal)}</dd>
          </div>
        </dl>

        {adding ? (
          <form
            onSubmit={(e) => onAddTx(e, member.id)}
            className="mt-4 grid grid-cols-2 gap-3 rounded-xl border border-slate-200 p-3"
          >
            <Field label="จำนวนเงิน" className="col-span-2 sm:col-span-1">
              <MoneyInput value={txAmount} onChange={setTxAmount} autoFocus />
            </Field>
            <Field label="วันที่" className="col-span-2 sm:col-span-1">
              <Input type="date" value={txDate} onChange={(e) => setTxDate(e.target.value)} />
            </Field>
            <Field label="หมายเหตุ" className="col-span-2">
              <Input value={txNote} onChange={(e) => setTxNote(e.target.value)} placeholder="ไม่บังคับ" />
            </Field>
            <Button type="button" variant="outline" onClick={() => setAddingTxFor(null)}>
              ยกเลิก
            </Button>
            <Button type="submit" disabled={isPending || !txAmount}>
              {isPending ? "กำลังบันทึก..." : "บันทึก"}
            </Button>
          </form>
        ) : (
          <Button size="sm" variant="outline" className="mt-4 w-full" onClick={() => setAddingTxFor(member.id)}>
            <Plus className="h-3.5 w-3.5" />
            บันทึกเงินที่ให้
          </Button>
        )}

        {member.transactions.length > 0 && (
          <ul className="mt-4 divide-y divide-slate-100 border-t border-slate-100">
            {[...member.transactions]
              .reverse()
              .slice(0, 5)
              .map((tx) => (
                <li key={tx.id} className="flex items-center justify-between gap-3 py-2 text-sm">
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="shrink-0 text-xs tabular-nums text-slate-500">{tx.date}</span>
                    {tx.note && <span className="truncate text-xs text-slate-400">{tx.note}</span>}
                  </div>
                  <span className="shrink-0 font-medium tabular-nums text-slate-900">{formatTHB(tx.amountCents)}</span>
                </li>
              ))}
            {member.transactions.length > 5 && (
              <li className="pt-2 text-center text-xs text-slate-500">และอีก {member.transactions.length - 5} รายการ</li>
            )}
          </ul>
        )}
      </div>
    </Card>
  );
}
