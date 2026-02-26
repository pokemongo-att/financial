"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createHomeLoan } from "@/actions/home-loan";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatTHB, toCents } from "@/lib/money";
import { Home, Plus } from "lucide-react";
import { toast } from "sonner";

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
        toast.error("ไม่สามารถเพิ่มพอร์ตสินเชื่อบ้านได้");
      }
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setShowCreate((v) => !v)}>
          <Plus className="w-4 h-4" />
          เพิ่มพอร์ตสินเชื่อบ้าน
        </Button>
      </div>

      {showCreate && (
        <Card className="p-4">
          <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="ชื่อสินเชื่อ เช่น ค่าสินเชื่อบ้าน 99/99"
              className="md:col-span-2"
            />
            <Input
              value={slug}
              onChange={(e) => setSlug(e.target.value.toLowerCase())}
              placeholder="slug เช่น loan99-99"
            />
            <Input
              type="number"
              step="0.01"
              value={principal}
              onChange={(e) => setPrincipal(e.target.value)}
              placeholder="ยอดเงินต้นเริ่มต้น"
            />
            <div className="md:col-span-4 flex justify-end">
              <Button type="submit" disabled={isPending}>
                {isPending ? "กำลังบันทึก..." : "บันทึก"}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {loans.length === 0 ? (
        <Card className="flex flex-col items-center justify-center p-12 text-center">
          <Home className="w-12 h-12 text-slate-300 mb-4" />
          <h3 className="text-lg font-medium text-slate-900">ยังไม่มีข้อมูลสินเชื่อบ้าน</h3>
          <p className="text-sm text-slate-500 max-w-sm mt-1">
            เพิ่มข้อมูลสินเชื่อบ้านเพื่อติดตามยอดหนี้ การชำระเงินต้น และดอกเบี้ย
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {loans.map((loan) => (
            <Link key={loan.id} href={`/home-loan/${loan.slug}`}>
              <Card className="hover:border-indigo-200 transition-colors cursor-pointer h-full">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Home className="w-5 h-5 text-indigo-500" />
                    {loan.name}
                  </CardTitle>
                  <CardDescription>คลิกเพื่อดูรายละเอียดการชำระเงิน</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1">
                    <p className="text-sm text-slate-500">ยอดเงินต้นเริ่มต้น</p>
                    <p className="text-2xl font-bold text-slate-900">{formatTHB(loan.principalBalanceCents)}</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
