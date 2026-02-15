"use client";

import { useRouter } from "next/navigation";
import { formatTHB } from "@/lib/money";
import Link from "next/link";
import { Card, CardTitle, CardValue } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/EmptyState";
import { ChevronRight, Coins } from "lucide-react";
import type { DividendSummary } from "@/lib/calc/dividends";

const RANGES = [
  { key: "month", label: "เดือนนี้" },
  { key: "year", label: "ปีนี้" },
  { key: "all", label: "ทั้งหมด" },
];

export function DividendDashboardClient({
  summary,
  currentRange,
}: {
  summary: DividendSummary;
  currentRange: string;
}) {
  const router = useRouter();

  function setRange(range: string) {
    router.push(`/portfolio/dividends?range=${range}`);
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-1.5">
        {RANGES.map((r) => (
          <Button key={r.key} variant={currentRange === r.key ? "default" : "secondary"} size="sm" onClick={() => setRange(r.key)}>
            {r.label}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-5">
          <CardTitle>ปันผลรวมทั้งหมด</CardTitle>
          <CardValue className="text-indigo-600">{formatTHB(summary.totals.allCents)}</CardValue>
        </Card>
        <Card className="p-5">
          <CardTitle>ปันผลหุ้น</CardTitle>
          <CardValue className="text-emerald-600">{formatTHB(summary.totals.stockCents)}</CardValue>
        </Card>
        <Card className="p-5">
          <CardTitle>ปันผลกองทุน</CardTitle>
          <CardValue className="text-blue-600">{formatTHB(summary.totals.fundCents)}</CardValue>
        </Card>
      </div>

      <Card className="overflow-x-auto">
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="text-sm font-medium text-slate-900">ปันผลรายตัว</h2>
        </div>
        {summary.perAsset.length === 0 ? (
          <EmptyState icon={<Coins className="w-8 h-8" />} title="ไม่มีข้อมูลปันผล" description="ปันผลจะแสดงเมื่อมีรายการ DIVIDEND ในพอร์ต" />
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Symbol</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">ชื่อ</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase">ประเภท</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">จำนวนครั้ง</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">ปันผลรวม</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">ครั้งล่าสุด</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {summary.perAsset
                .sort((a, b) => b.dividendTotalCents - a.dividendTotalCents)
                .map((asset) => (
                  <tr key={asset.assetAccountId} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-3 font-semibold text-slate-900">{asset.code}</td>
                    <td className="px-6 py-3 text-slate-500">{asset.name ?? "—"}</td>
                    <td className="px-6 py-3 text-center">
                      <Badge variant={asset.type === "STOCK" ? "success" : "info"}>
                        {asset.type === "STOCK" ? "หุ้น" : "กองทุน"}
                      </Badge>
                    </td>
                    <td className="px-6 py-3 text-right tabular-nums text-slate-900">{asset.dividendCount}</td>
                    <td className="px-6 py-3 text-right font-medium tabular-nums text-indigo-600">
                      {formatTHB(asset.dividendTotalCents)}
                    </td>
                    <td className="px-6 py-3 text-slate-500">{asset.lastDividendAt ?? "—"}</td>
                    <td className="px-6 py-3 text-center">
                      <Link href={`/portfolio/${asset.assetAccountId}`} className="text-indigo-600 hover:underline text-xs inline-flex items-center gap-1">
                        ดู <ChevronRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
