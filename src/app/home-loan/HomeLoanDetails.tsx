"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatTHB, toCents } from "@/lib/money";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { HomeLoanSummary, HomeLoanTransaction } from "@/lib/calc/home-loan";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend, ComposedChart } from "recharts";
import { DataTable } from "@/components/DataTable";
import { type ColumnDef } from "@tanstack/react-table";
import { updateHomeLoan } from "@/actions/home-loan";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

type LoanProps = {
  loan: {
    id: string;
    name: string;
    slug: string;
    principalBalanceCents: number;
  };
  transactions: HomeLoanTransaction[];
};

export function HomeLoanDetails({ loan, transactions }: LoanProps) {
  const router = useRouter();
  const summary = calculateHomeLoanSummary(loan.principalBalanceCents, transactions);
  const [showEdit, setShowEdit] = useState(false);
  const [editPrincipal, setEditPrincipal] = useState((loan.principalBalanceCents / 100).toFixed(2));
  const [editSlug, setEditSlug] = useState(loan.slug);
  const [savingEdit, setSavingEdit] = useState(false);

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
      toast.error("เกิดข้อผิดพลาดในการอัปเดต");
    } finally {
      setSavingEdit(false);
    }
  }

  const columns: ColumnDef<HomeLoanSummary["monthlyData"][0]>[] = [
    {
      accessorKey: "month",
      header: "เดือน",
      cell: ({ row }) => <span className="font-medium">{row.original.month}</span>,
    },
    {
      accessorKey: "total",
      header: "ยอดชำระรวม",
      meta: { align: "right" },
      cell: ({ row }) => <span className="text-slate-900 font-medium">{formatTHB(row.original.total)}</span>,
    },
    {
      accessorKey: "interest",
      header: "ดอกเบี้ย",
      meta: { align: "right" },
      cell: ({ row }) => <span className="text-red-500">{formatTHB(row.original.interest)}</span>,
    },
    {
      accessorKey: "principal",
      header: "เงินต้น",
      meta: { align: "right" },
      cell: ({ row }) => <span className="text-emerald-600">{formatTHB(row.original.principal)}</span>,
    },
    {
      accessorKey: "balance",
      header: "ยอดคงเหลือ",
      meta: { align: "right" },
      cell: ({ row }) => <span className="text-indigo-600 font-semibold">{formatTHB(row.original.balance)}</span>,
    },
  ];

  return (
    <div className="space-y-6 mt-6">
      <div className="flex justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            setEditPrincipal((loan.principalBalanceCents / 100).toFixed(2));
            setEditSlug(loan.slug);
            setShowEdit(true);
          }}
        >
          แก้ยอดตั้งต้น/Slug
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">ยอดหนี้คงเหลือ</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-indigo-600">
              {formatTHB(summary.currentBalance)}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              จากยอดกู้: {formatTHB(loan.principalBalanceCents)}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">ชำระเงินต้นสะสม</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">
              {formatTHB(summary.principalPaid)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">ดอกเบี้ยสะสม</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">
              {formatTHB(summary.interestPaid)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">ยอดชำระสะสมทั้งหมด</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              {formatTHB(summary.totalPaid)}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>สัดส่วนการชำระเงินรายเดือน</CardTitle>
            <CardDescription>เปรียบเทียบเงินต้นและดอกเบี้ยที่จ่ายในแต่ละเดือน</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={summary.monthlyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" fontSize={12} tickMargin={10} />
                <YAxis yAxisId="left" fontSize={12} tickFormatter={(v) => `฿${(v / 100).toLocaleString()}`} />
                <YAxis yAxisId="right" orientation="right" fontSize={12} tickFormatter={(v) => `฿${(v / 100).toLocaleString()}`} />
                <Tooltip 
                  formatter={(value: any) => formatTHB(Number(value || 0))}
                  labelFormatter={(label) => `เดือน ${label}`}
                />
                <Legend />
                <Bar yAxisId="left" dataKey="principal" name="เงินต้น" stackId="a" fill="#10b981" radius={[0, 0, 4, 4]} />
                <Bar yAxisId="left" dataKey="interest" name="ดอกเบี้ย" stackId="a" fill="#ef4444" radius={[4, 4, 0, 0]} />
                <Line yAxisId="right" type="monotone" dataKey="balance" name="ยอดคงเหลือ" stroke="#4f46e5" strokeWidth={2} dot={{ r: 4 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>ความคืบหน้า</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center space-y-6 h-[300px]">
            <div className="relative w-48 h-48 flex items-center justify-center rounded-full border-8 border-slate-100">
              <div 
                className="absolute inset-0 rounded-full border-8 border-emerald-500"
                style={{ 
                  clipPath: `polygon(50% 50%, 50% 0%, ${
                    loan.principalBalanceCents > 0 
                      ? Math.min(100, Math.max(0, (summary.principalPaid / loan.principalBalanceCents) * 100))
                      : 0
                  }% 0%)`,
                  transform: 'rotate(-45deg)',
                }}
              />
              <div className="flex flex-col items-center">
                <span className="text-3xl font-bold text-slate-900">
                  {loan.principalBalanceCents > 0 
                    ? ((summary.principalPaid / loan.principalBalanceCents) * 100).toFixed(1) 
                    : "0.0"}%
                </span>
                <span className="text-sm text-slate-500">ชำระแล้ว</span>
              </div>
            </div>
            
            <div className="w-full space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">ยอดที่ต้องชำระอีก</span>
                <span className="font-medium text-slate-900">{formatTHB(summary.currentBalance)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>ประวัติการชำระเงิน</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={summary.monthlyData}
            searchPlaceholder="ค้นหาเดือน..."
          />
        </CardContent>
      </Card>

      <Dialog open={showEdit} onOpenChange={setShowEdit}>
        <DialogContent className="max-w-md">
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
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="loanPrincipal">ยอดเงินต้นเริ่มต้น (บาท)</Label>
              <Input
                id="loanPrincipal"
                type="number"
                step="0.01"
                value={editPrincipal}
                onChange={(e) => setEditPrincipal(e.target.value)}
                placeholder="0.00"
              />
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
