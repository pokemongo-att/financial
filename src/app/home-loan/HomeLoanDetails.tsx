"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Bar, Line, Legend, ComposedChart } from "recharts";
import { type ColumnDef } from "@tanstack/react-table";
import { Pencil } from "lucide-react";
import { toast } from "sonner";
import { formatTHB, toCents } from "@/lib/money";
import { HomeLoanSummary, HomeLoanTransaction } from "@/lib/calc/home-loan";
import { updateHomeLoan } from "@/actions/home-loan";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { DataTable, type ColumnMeta } from "@/components/DataTable";
import { PageHeader } from "@/components/PageHeader";
import { SummaryStats } from "@/components/SummaryStats";
import { MoneyInput } from "@/components/MoneyInput";

type LoanProps = {
  loan: {
    id: string;
    name: string;
    slug: string;
    principalBalanceCents: number;
  };
  transactions: HomeLoanTransaction[];
};

type MonthRow = HomeLoanSummary["monthlyData"][0];

/** 1234567_00 cents → "1.2M", 35000_00 → "35k" for chart axes. */
function compactBaht(cents: number) {
  const baht = cents / 100;
  const abs = Math.abs(baht);
  if (abs >= 1_000_000) return `${(baht / 1_000_000).toFixed(abs >= 10_000_000 ? 0 : 1)}M`;
  if (abs >= 1_000) return `${Math.round(baht / 1_000)}k`;
  return `${Math.round(baht)}`;
}

export function HomeLoanDetails({ loan, transactions }: LoanProps) {
  const router = useRouter();
  const summary = calculateHomeLoanSummary(loan.principalBalanceCents, transactions);
  const [showEdit, setShowEdit] = useState(false);
  const [editPrincipal, setEditPrincipal] = useState((loan.principalBalanceCents / 100).toFixed(2));
  const [editSlug, setEditSlug] = useState(loan.slug);
  const [savingEdit, setSavingEdit] = useState(false);

  const paidPct =
    loan.principalBalanceCents > 0
      ? Math.min(100, Math.max(0, (summary.principalPaid / loan.principalBalanceCents) * 100))
      : 0;

  async function handleSaveOpening(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSavingEdit(true);
    try {
      await updateHomeLoan(loan.id, {
        principalBalanceCents: editPrincipal ? toCents(parseFloat(editPrincipal)) : 0,
        slug: editSlug.trim() || loan.slug,
      });
      toast.success("อัปเดตยอดตั้งต้นสินเชื่อบ้านแล้ว");
      setShowEdit(false);
      router.refresh();
    } catch {
      toast.error("อัปเดตไม่สำเร็จ ลองอีกครั้ง");
    } finally {
      setSavingEdit(false);
    }
  }

  const columns: ColumnDef<MonthRow, any>[] = [
    {
      accessorKey: "month",
      header: "เดือน",
      meta: { sortKind: "date" } satisfies ColumnMeta,
      cell: ({ row }) => <span className="font-medium tabular-nums">{row.original.month}</span>,
    },
    {
      accessorKey: "total",
      header: "ยอดชำระรวม",
      meta: { align: "right" } satisfies ColumnMeta,
      cell: ({ row }) => <span className="font-medium tabular-nums text-slate-900">{formatTHB(row.original.total)}</span>,
    },
    {
      accessorKey: "interest",
      header: "ดอกเบี้ย",
      meta: { align: "right" } satisfies ColumnMeta,
      cell: ({ row }) => <span className="tabular-nums text-red-600">{formatTHB(row.original.interest)}</span>,
    },
    {
      accessorKey: "principal",
      header: "เงินต้น",
      meta: { align: "right" } satisfies ColumnMeta,
      cell: ({ row }) => <span className="tabular-nums text-emerald-600">{formatTHB(row.original.principal)}</span>,
    },
    {
      accessorKey: "balance",
      header: "ยอดคงเหลือ",
      meta: { align: "right" } satisfies ColumnMeta,
      cell: ({ row }) => <span className="font-semibold tabular-nums text-indigo-600">{formatTHB(row.original.balance)}</span>,
    },
  ];

  return (
    <div className="space-y-5 sm:space-y-6">
      <PageHeader
        title={loan.name}
        subtitle="รายละเอียดการชำระเงินและดอกเบี้ย"
        backHref="/home-loan"
        backLabel="กลับไปหน้าสินเชื่อบ้าน"
      >
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            setEditPrincipal((loan.principalBalanceCents / 100).toFixed(2));
            setEditSlug(loan.slug);
            setShowEdit(true);
          }}
        >
          <Pencil className="h-4 w-4" />
          แก้ยอดตั้งต้น/Slug
        </Button>
      </PageHeader>

      <SummaryStats
        gridClassName="sm:grid-cols-2 lg:grid-cols-4"
        items={[
          { label: "ชำระเงินต้นสะสม", value: formatTHB(summary.principalPaid), tone: "positive" },
          { label: "ดอกเบี้ยสะสม", value: formatTHB(summary.interestPaid), tone: "negative" },
          { label: "ยอดชำระสะสมทั้งหมด", value: formatTHB(summary.totalPaid) },
        ]}
        highlight={{
          label: "ยอดหนี้คงเหลือ",
          value: formatTHB(summary.currentBalance),
          tone: "primary",
          hint: <>จากยอดกู้ {formatTHB(loan.principalBalanceCents)}</>,
        }}
      />

      <div className="grid grid-cols-1 gap-5 sm:gap-6 lg:grid-cols-3">
        <Card className="p-4 sm:p-6 lg:col-span-2">
          <h2 className="text-sm font-semibold text-slate-900">สัดส่วนการชำระเงินรายเดือน</h2>
          <p className="mt-1 text-sm text-slate-500">เปรียบเทียบเงินต้นและดอกเบี้ยที่จ่ายในแต่ละเดือน</p>
          <div className="mt-4 h-[240px] sm:h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={summary.monthlyData} margin={{ top: 4, right: 0, left: -8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#64748b" }} tickMargin={8} axisLine={false} tickLine={false} minTickGap={12} />
                <YAxis yAxisId="left" width={44} tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={compactBaht} />
                <YAxis yAxisId="right" orientation="right" width={44} tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={compactBaht} />
                <Tooltip
                  formatter={(value: any) => formatTHB(Number(value || 0))}
                  labelFormatter={(label) => `เดือน ${label}`}
                  contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: "13px" }}
                />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
                <Bar yAxisId="left" dataKey="principal" name="เงินต้น" stackId="a" fill="#10b981" radius={[0, 0, 4, 4]} />
                <Bar yAxisId="left" dataKey="interest" name="ดอกเบี้ย" stackId="a" fill="#ef4444" radius={[4, 4, 0, 0]} />
                <Line yAxisId="right" type="monotone" dataKey="balance" name="ยอดคงเหลือ" stroke="#4f46e5" strokeWidth={2} dot={{ r: 3 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="flex flex-col p-4 sm:p-6">
          <h2 className="text-sm font-semibold text-slate-900">ความคืบหน้า</h2>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-4xl font-semibold tabular-nums tracking-tight text-slate-900">{paidPct.toFixed(1)}%</span>
            <span className="text-sm text-slate-500">ของเงินต้นชำระแล้ว</span>
          </div>
          <div
            className="mt-4 h-3 overflow-hidden rounded-full bg-slate-100"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(paidPct)}
            aria-label="สัดส่วนเงินต้นที่ชำระแล้ว"
          >
            <div className="h-full rounded-full bg-emerald-500 transition-[width] duration-700 ease-out" style={{ width: `${paidPct}%` }} />
          </div>
          <dl className="mt-5 space-y-2.5 text-sm lg:mt-auto lg:pt-6">
            <div className="flex justify-between gap-3">
              <dt className="text-slate-500">ชำระเงินต้นแล้ว</dt>
              <dd className="font-medium tabular-nums text-emerald-600">{formatTHB(summary.principalPaid)}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-slate-500">ยอดที่ต้องชำระอีก</dt>
              <dd className="font-medium tabular-nums text-slate-900">{formatTHB(summary.currentBalance)}</dd>
            </div>
          </dl>
        </Card>
      </div>

      <DataTable
        title="ประวัติการชำระเงิน"
        columns={columns}
        data={summary.monthlyData}
        searchPlaceholder="ค้นหาเดือน..."
        emptyTitle="ยังไม่มีประวัติการชำระ"
        renderCard={(row) => (
          <div className="px-4 py-3 sm:px-5">
            <div className="flex items-baseline justify-between gap-3">
              <span className="font-medium tabular-nums text-slate-900">{row.month}</span>
              <span className="font-semibold tabular-nums text-slate-900">{formatTHB(row.total)}</span>
            </div>
            <div className="mt-1 flex flex-wrap items-center justify-between gap-x-3 gap-y-0.5 text-xs">
              <span className="text-slate-500">
                เงินต้น <span className="tabular-nums text-emerald-600">{formatTHB(row.principal)}</span>
                {" · "}
                ดอกเบี้ย <span className="tabular-nums text-red-600">{formatTHB(row.interest)}</span>
              </span>
              <span className="text-slate-500">
                คงเหลือ <span className="font-medium tabular-nums text-indigo-600">{formatTHB(row.balance)}</span>
              </span>
            </div>
          </div>
        )}
      />

      <Dialog open={showEdit} onOpenChange={setShowEdit}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>แก้ไขข้อมูลตั้งต้นสินเชื่อบ้าน</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveOpening} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="loanSlug">Slug</Label>
              <Input
                id="loanSlug"
                value={editSlug}
                onChange={(e) => setEditSlug(e.target.value.toLowerCase())}
                placeholder="เช่น loan144-49"
                autoCapitalize="none"
                autoCorrect="off"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="loanPrincipal">ยอดเงินต้นเริ่มต้น (บาท)</Label>
              <MoneyInput id="loanPrincipal" value={editPrincipal} onChange={setEditPrincipal} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowEdit(false)}>
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

// Temporary inline calculation since we need it client-side
// Better approach: move to server or make an API endpoint
function calculateHomeLoanSummary(
  initialBalanceCents: number,
  transactions: HomeLoanTransaction[]
): HomeLoanSummary {
  let currentBalance = initialBalanceCents;
  let totalInterest = 0;
  let totalPrincipal = 0;

  const monthlyData = transactions.map((tx) => {
    const amount = tx.actualAmountCents || 0;
    const rate = tx.interestRate ? parseFloat(tx.interestRate) : 0;

    // Simple interest calculation: Balance * (Rate / 100) * (30 / 365)
    // Assuming average 30 days per month
    const interest = Math.round(currentBalance * (rate / 100) * (30 / 365));
    const principal = amount - interest;

    currentBalance -= principal;
    totalInterest += interest;
    totalPrincipal += principal;

    return {
      month: tx.month,
      total: amount,
      interest,
      principal,
      balance: currentBalance,
    };
  });

  return {
    principalPaid: totalPrincipal,
    interestPaid: totalInterest,
    totalPaid: totalPrincipal + totalInterest,
    currentBalance,
    monthlyData,
  };
}
