"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Coins } from "lucide-react";
import { formatTHB } from "@/lib/money";
import type { DividendSummary } from "@/lib/calc/dividends";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/EmptyState";
import { FilterChips } from "@/components/FilterChips";
import { SummaryStats } from "@/components/SummaryStats";

type Range = "month" | "year" | "all";

const RANGES: { value: Range; label: string }[] = [
  { value: "month", label: "เดือนนี้" },
  { value: "year", label: "ปีนี้" },
  { value: "all", label: "ทั้งหมด" },
];

export function DividendDashboardClient({
  summary,
  currentRange,
}: {
  summary: DividendSummary;
  currentRange: string;
}) {
  const router = useRouter();
  const perAsset = [...summary.perAsset].sort((a, b) => b.dividendTotalCents - a.dividendTotalCents);

  return (
    <div className="space-y-5 sm:space-y-6">
      <FilterChips
        label="ช่วงเวลา"
        value={(currentRange as Range) ?? "all"}
        onChange={(r) => router.push(`/portfolio/dividends?range=${r}`, { scroll: false })}
        options={RANGES}
      />

      <SummaryStats
        items={[
          { label: "ปันผลหุ้น", value: formatTHB(summary.totals.stockCents), tone: "positive" },
          { label: "ปันผลกองทุน", value: formatTHB(summary.totals.fundCents), tone: "saving" },
        ]}
        highlight={{ label: "ปันผลรวมทั้งหมด", value: formatTHB(summary.totals.allCents), tone: "primary" }}
      />

      <Card className="overflow-hidden">
        <div className="border-b border-slate-100 px-4 py-3 sm:px-6 sm:py-4">
          <h2 className="text-sm font-semibold text-slate-900">ปันผลรายตัว</h2>
        </div>
        {perAsset.length === 0 ? (
          <EmptyState
            icon={<Coins className="h-8 w-8" />}
            title="ไม่มีข้อมูลปันผล"
            description="ปันผลจะแสดงเมื่อมีรายการ DIVIDEND ในพอร์ต"
          />
        ) : (
          <>
            {/* Phone + tablet */}
            <ul className="divide-y divide-slate-100 lg:hidden">
              {perAsset.map((asset) => (
                <li key={asset.assetAccountId}>
                  <Link
                    href={`/portfolio/${asset.assetAccountId}`}
                    className="flex items-center gap-3 px-4 py-3.5 transition-colors active:bg-slate-50 sm:px-5"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-3">
                        <p className="flex min-w-0 items-center gap-2">
                          <span className="truncate font-semibold text-slate-900">{asset.code}</span>
                          <Badge variant={asset.type === "STOCK" ? "success" : "info"} className="shrink-0">
                            {asset.type === "STOCK" ? "หุ้น" : "กองทุน"}
                          </Badge>
                        </p>
                        <p className="shrink-0 font-semibold tabular-nums text-indigo-600">
                          {formatTHB(asset.dividendTotalCents)}
                        </p>
                      </div>
                      <p className="mt-1 truncate text-xs text-slate-500">
                        {asset.name && <>{asset.name} · </>}
                        <span className="tabular-nums">{asset.dividendCount} ครั้ง</span>
                        {asset.lastDividendAt && <> · ล่าสุด <span className="tabular-nums">{asset.lastDividendAt}</span></>}
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 shrink-0 text-slate-300" />
                  </Link>
                </li>
              ))}
            </ul>

            {/* Desktop */}
            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-xs font-medium text-slate-500">
                    <th scope="col" className="px-4 py-3 text-left xl:px-6">Symbol</th>
                    <th scope="col" className="px-4 py-3 text-left xl:px-6">ชื่อ</th>
                    <th scope="col" className="px-4 py-3 text-center xl:px-6">ประเภท</th>
                    <th scope="col" className="px-4 py-3 text-right xl:px-6">จำนวนครั้ง</th>
                    <th scope="col" className="px-4 py-3 text-right xl:px-6">ปันผลรวม</th>
                    <th scope="col" className="px-4 py-3 text-left xl:px-6">ครั้งล่าสุด</th>
                    <th scope="col" className="w-[1%] px-4 py-3 xl:px-6"><span className="sr-only">ดูรายละเอียด</span></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {perAsset.map((asset) => (
                    <tr key={asset.assetAccountId} className="transition-colors hover:bg-slate-50/60">
                      <td className="px-4 py-3 font-semibold text-slate-900 xl:px-6">{asset.code}</td>
                      <td className="px-4 py-3 text-slate-500 xl:px-6">{asset.name ?? "—"}</td>
                      <td className="px-4 py-3 text-center xl:px-6">
                        <Badge variant={asset.type === "STOCK" ? "success" : "info"}>
                          {asset.type === "STOCK" ? "หุ้น" : "กองทุน"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums text-slate-900 xl:px-6">{asset.dividendCount}</td>
                      <td className="px-4 py-3 text-right font-medium tabular-nums text-indigo-600 xl:px-6">
                        {formatTHB(asset.dividendTotalCents)}
                      </td>
                      <td className="px-4 py-3 tabular-nums text-slate-500 xl:px-6">{asset.lastDividendAt ?? "—"}</td>
                      <td className="px-4 py-3 text-right xl:px-6">
                        <Link
                          href={`/portfolio/${asset.assetAccountId}`}
                          className="inline-flex items-center gap-1 whitespace-nowrap rounded-md px-2 py-1 text-xs font-medium text-indigo-600 hover:bg-indigo-50"
                        >
                          ดู <ChevronRight className="h-3 w-3" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
