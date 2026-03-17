"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { formatTHB } from "@/lib/money";
import { createAssetAccount } from "@/actions/assets";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/EmptyState";
import { Plus, Briefcase, ChevronRight, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import type { Holdings, BankBalance } from "@/lib/calc/portfolio";

type AssetWithHoldings = {
  id: string;
  type: "STOCK" | "FUND" | "CRYPTO" | "BANK";
  symbol: string;
  name: string | null;
  holdings?: Holdings;
  bankBalance?: BankBalance;
};

const TABS = [
  { key: "STOCK", label: "หุ้น" },
  { key: "FUND", label: "กองทุน" },
  { key: "CRYPTO", label: "BTC/Crypto" },
  { key: "BANK", label: "เงินฝาก" },
] as const;

export function PortfolioTabs({
  stocks, funds, crypto, banks, userId,
}: {
  stocks: AssetWithHoldings[]; funds: AssetWithHoldings[]; crypto: AssetWithHoldings[]; banks: AssetWithHoldings[]; userId: string;
}) {
  const router = useRouter();
  const [tab, setTab] = useState<string>("STOCK");
  const [showAdd, setShowAdd] = useState(false);
  const [symbol, setSymbol] = useState("");
  const [assetName, setAssetName] = useState("");
  const [isPending, startTransition] = useTransition();

  const dataMap: Record<string, AssetWithHoldings[]> = { STOCK: stocks, FUND: funds, CRYPTO: crypto, BANK: banks };
  const currentData = dataMap[tab] ?? [];

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!symbol.trim()) return;
    startTransition(async () => {
      try {
        await createAssetAccount(userId, {
          type: tab as "STOCK" | "FUND" | "CRYPTO" | "BANK",
          symbol: symbol.trim(),
          name: assetName.trim() || undefined,
        });
        setSymbol("");
        setAssetName("");
        setShowAdd(false);
        toast.success("เพิ่มสินทรัพย์แล้ว");
        router.refresh();
      } catch {
        toast.error("เกิดข้อผิดพลาด");
      }
    });
  }

  const stocksCost = stocks.reduce((s, a) => s + (a.holdings?.totalCostCents ?? 0), 0);
  const fundsCost = funds.reduce((s, a) => s + (a.holdings?.totalCostCents ?? 0), 0);
  const cryptoCost = crypto.reduce((s, a) => s + (a.holdings?.totalCostCents ?? 0), 0);
  const bankBalance = banks.reduce((s, a) => s + (a.bankBalance?.currentBalanceCents ?? 0), 0);
  const totalRealizedPnL = [...stocks, ...funds, ...crypto].reduce((s, a) => s + (a.holdings?.realizedPnLCents ?? 0), 0);
  const totalDividends = [...stocks, ...funds, ...crypto].reduce((s, a) => s + (a.holdings?.dividendsTotalCents ?? 0), 0);
  const grandTotal = stocksCost + fundsCost + cryptoCost + bankBalance;

  return (
    <div className="space-y-4">
      <PortfolioSummary
        stocksCost={stocksCost}
        fundsCost={fundsCost}
        cryptoCost={cryptoCost}
        bankBalance={bankBalance}
        grandTotal={grandTotal}
        totalRealizedPnL={totalRealizedPnL}
        totalDividends={totalDividends}
      />
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex gap-1.5 flex-wrap">
          {TABS.map((t) => (
            <Button key={t.key} variant={tab === t.key ? "default" : "secondary"} size="sm" onClick={() => setTab(t.key)}>
              {t.label}
            </Button>
          ))}
        </div>
        <Button onClick={() => setShowAdd(!showAdd)}>
          <Plus className="w-4 h-4 mr-2" />
          เพิ่ม {TABS.find((t) => t.key === tab)?.label}
        </Button>
      </div>

      {showAdd && (
        <Card className="p-4">
          <form onSubmit={handleAdd} className="flex gap-3">
            <Input value={symbol} onChange={(e) => setSymbol(e.target.value)} placeholder="Symbol / Code" required />
            <Input value={assetName} onChange={(e) => setAssetName(e.target.value)} placeholder="ชื่อ (optional)" className="flex-1" />
            <Button type="submit" disabled={isPending}>{isPending ? "..." : "เพิ่ม"}</Button>
          </form>
        </Card>
      )}

      {tab === "BANK" ? <BankTable data={currentData} /> : <HoldingsTable data={currentData} />}
    </div>
  );
}

function PortfolioSummary({
  stocksCost, fundsCost, cryptoCost, bankBalance, grandTotal, totalRealizedPnL, totalDividends,
}: {
  stocksCost: number; fundsCost: number; cryptoCost: number; bankBalance: number;
  grandTotal: number; totalRealizedPnL: number; totalDividends: number;
}) {
  return (
    <Card className="p-5">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-4 h-4 text-indigo-500" />
        <span className="text-sm font-semibold text-slate-700">ยอดรวมทั้งหมด</span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <div>
          <p className="text-xs text-slate-400 mb-0.5">หุ้น</p>
          <p className="text-sm font-semibold tabular-nums text-slate-900">{formatTHB(stocksCost)}</p>
        </div>
        <div>
          <p className="text-xs text-slate-400 mb-0.5">กองทุน</p>
          <p className="text-sm font-semibold tabular-nums text-slate-900">{formatTHB(fundsCost)}</p>
        </div>
        <div>
          <p className="text-xs text-slate-400 mb-0.5">BTC/Crypto</p>
          <p className="text-sm font-semibold tabular-nums text-slate-900">{formatTHB(cryptoCost)}</p>
        </div>
        <div>
          <p className="text-xs text-slate-400 mb-0.5">เงินฝาก</p>
          <p className="text-sm font-semibold tabular-nums text-indigo-600">{formatTHB(bankBalance)}</p>
        </div>
        <div className="col-span-2 sm:col-span-1 border-t sm:border-t-0 sm:border-l border-slate-100 sm:pl-4 pt-3 sm:pt-0">
          <p className="text-xs text-slate-400 mb-0.5">รวมทั้งหมด</p>
          <p className="text-lg font-bold tabular-nums text-slate-900">{formatTHB(grandTotal)}</p>
        </div>
      </div>
      <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap gap-4 text-xs text-slate-500">
        <span>Realized P/L: <span className={`font-semibold tabular-nums ${totalRealizedPnL >= 0 ? "text-emerald-600" : "text-red-600"}`}>{formatTHB(totalRealizedPnL)}</span></span>
        <span>ปันผลรวม: <span className="font-semibold tabular-nums text-indigo-600">{formatTHB(totalDividends)}</span></span>
      </div>
    </Card>
  );
}

function HoldingsTable({ data }: { data: AssetWithHoldings[] }) {
  if (data.length === 0) {
    return (
      <Card><EmptyState icon={<Briefcase className="w-8 h-8" />} title="ยังไม่มีรายการ" description="เพิ่มสินทรัพย์เพื่อเริ่มติดตาม" /></Card>
    );
  }

  return (
    <Card className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-100">
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Symbol</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">ชื่อ</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">จำนวน</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">ต้นทุนเฉลี่ย</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">ต้นทุนรวม</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Realized P/L</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">ปันผลรวม</th>
            <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {data.map((asset) => {
            const h = asset.holdings;
            return (
              <tr key={asset.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-3 font-semibold text-slate-900">{asset.symbol}</td>
                <td className="px-6 py-3 text-slate-500">{asset.name ?? "—"}</td>
                <td className="px-6 py-3 text-right tabular-nums text-slate-900">{h?.totalQuantity ?? 0}</td>
                <td className="px-6 py-3 text-right tabular-nums text-slate-600">{formatTHB(h?.avgCostCents ?? 0)}</td>
                <td className="px-6 py-3 text-right tabular-nums font-medium text-slate-900">{formatTHB(h?.totalCostCents ?? 0)}</td>
                <td className={`px-6 py-3 text-right font-medium tabular-nums ${(h?.realizedPnLCents ?? 0) >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                  {formatTHB(h?.realizedPnLCents ?? 0)}
                </td>
                <td className="px-6 py-3 text-right tabular-nums text-indigo-600">{formatTHB(h?.dividendsTotalCents ?? 0)}</td>
                <td className="px-6 py-3 text-center">
                  <Link href={`/portfolio/${asset.id}`} className="text-indigo-600 hover:underline text-xs inline-flex items-center gap-1">
                    ดู <ChevronRight className="w-3 h-3" />
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </Card>
  );
}

function BankTable({ data }: { data: AssetWithHoldings[] }) {
  if (data.length === 0) {
    return (
      <Card><EmptyState icon={<Briefcase className="w-8 h-8" />} title="ยังไม่มีบัญชี" description="เพิ่มบัญชีเงินฝากเพื่อเริ่มติดตาม" /></Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {data.map((asset) => {
        const b = asset.bankBalance;
        return (
          <Link key={asset.id} href={`/portfolio/${asset.id}`}>
            <Card className="p-5 hover:border-indigo-300 transition-colors cursor-pointer">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-slate-900">{asset.symbol}</h3>
                {asset.name && <span className="text-xs text-slate-400">{asset.name}</span>}
              </div>
              <p className="text-2xl font-semibold tabular-nums text-indigo-600">
                {formatTHB(b?.currentBalanceCents ?? 0)}
              </p>
              <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-slate-500">
                <div>ฝากรวม: <span className="font-medium tabular-nums text-emerald-600">{formatTHB(b?.totalDepositsCents ?? 0)}</span></div>
                <div>ถอนรวม: <span className="font-medium tabular-nums text-red-600">{formatTHB(b?.totalWithdrawalsCents ?? 0)}</span></div>
              </div>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
