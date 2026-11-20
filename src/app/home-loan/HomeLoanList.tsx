"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight, Home, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { createHomeLoan } from "@/actions/home-loan";
import { formatTHB, toCents } from "@/lib/money";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/EmptyState";
import { MoneyInput } from "@/components/MoneyInput";
import { Field } from "@/components/Field";

type Loan = {
  id: string;
  name: string;
  slug: string;
  principalBalanceCents: number;
};

export function HomeLoanList({ loans, userId }: { loans: Loan[]; userId: string }) {
  const router = useRouter();
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [principal, setPrincipal] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!name.trim() || !slug.trim()) return;

    startTransition(async () => {
      try {
        await createHomeLoan(userId, {
          name: name.trim(),
          slug: slug.trim().toLowerCase(),
          principalBalanceCents: principal ? toCents(parseFloat(principal)) : 0,
        });
        toast.success("เพิ่มพอร์ตสินเชื่อบ้านแล้ว");
        setName("");
        setSlug("");
        setPrincipal("");
        setShowCreate(false);
        router.refresh();
      } catch {
        toast.error("เพิ่มพอร์ตสินเชื่อบ้านไม่สำเร็จ ลองอีกครั้ง");
      }
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setShowCreate((v) => !v)} variant={showCreate ? "outline" : "default"} aria-expanded={showCreate}>
          {showCreate ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {showCreate ? "ปิด" : "เพิ่มพอร์ตสินเชื่อบ้าน"}
        </Button>
      </div>

      {showCreate && (
        <Card className="p-4 sm:p-5">
          <form onSubmit={handleCreate} className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:items-end">
            <Field label="ชื่อสินเชื่อ" className="lg:col-span-2">
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="เช่น ค่าสินเชื่อบ้าน 99/99" autoFocus />
            </Field>
            <Field label="Slug">
              <Input
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase())}
                placeholder="เช่น loan99-99"
                autoCapitalize="none"
                autoCorrect="off"
              />
            </Field>
            <Field label="ยอดเงินต้นเริ่มต้น">
              <MoneyInput value={principal} onChange={setPrincipal} />
            </Field>
            <div className="flex justify-end sm:col-span-2 lg:col-span-4">
              <Button type="submit" disabled={isPending || !name.trim() || !slug.trim()} className="w-full sm:w-auto">
                {isPending ? "กำลังบันทึก..." : "บันทึก"}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {loans.length === 0 ? (
        <Card>
          <EmptyState
            icon={<Home className="h-10 w-10" />}
            title="ยังไม่มีข้อมูลสินเชื่อบ้าน"
            description="เพิ่มข้อมูลสินเชื่อบ้านเพื่อติดตามยอดหนี้ การชำระเงินต้น และดอกเบี้ย"
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4">
          {loans.map((loan) => (
            <Link
              key={loan.id}
              href={`/home-loan/${loan.slug}`}
              className="group rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            >
              <Card className="h-full p-4 transition-colors group-hover:border-indigo-200 group-active:bg-slate-50 sm:p-5">
                <div className="flex items-start gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-50">
                    <Home className="h-4 w-4 text-indigo-600" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate font-semibold text-slate-900">{loan.name}</h3>
                    <p className="text-xs text-slate-500">ดูรายละเอียดการชำระเงิน</p>
                  </div>
                  <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-slate-300" />
                </div>
                <p className="mt-4 text-xs text-slate-500">ยอดเงินต้นเริ่มต้น</p>
                <p className="mt-0.5 text-2xl font-semibold tabular-nums tracking-tight text-slate-900">
                  {formatTHB(loan.principalBalanceCents)}
                </p>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
