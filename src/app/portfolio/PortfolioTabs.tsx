"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, Briefcase, ChevronRight, X, Landmark } from "lucide-react";
import { toast } from "sonner";
import { formatTHB } from "@/lib/money";
import { cn } from "@/lib/utils";
import { createAssetAccount } from "@/actions/assets";
import type { Holdings, BankBalance } from "@/lib/calc/portfolio";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/EmptyState";
import { FilterChips } from "@/components/FilterChips";
import { Field } from "@/components/Field";

type AssetType = "STOCK" | "FUND" | "CRYPTO" | "BANK";

type AssetWithHoldings = {
  id: string;
  type: AssetType;
  symbol: string;
  name: string | null;
  holdings?: Holdings;
  bankBalance?: BankBalance;
};

const TABS: { key: AssetType; label: string }[] = [
  { key: "STOCK", label: "หุ้น" },
  { key: "FUND", label: "กองทุน" },
  { key: "CRYPTO", label: "BTC/Crypto" },
  { key: "BANK", label: "เงินฝาก" },
];

export function PortfolioTabs({
  stocks, funds, crypto, banks, userId,
}: {
  stocks: AssetWithHoldings[]; funds: AssetWithHoldings[]; crypto: AssetWithHoldings[]; banks: AssetWithHoldings[]; userId: string;
}) {
  const router = useRouter();
  const [tab, setTab] = useState<AssetType>("STOCK");
  const [showAdd, setShowAdd] = useState(false);
  const [symbol, setSymbol] = useState("");
  const [assetName, setAssetName] = useState("");
  const [isPending, startTransition] = useTransition();

  const dataMap: Record<AssetType, AssetWithHoldings[]> = { STOCK: stocks, FUND: funds, CRYPTO: crypto, BANK: banks };
  const currentData = dataMap[tab] ?? [];
  const tabLabel = TABS.find((t) => t.key === tab)?.label ?? "";

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!symbol.trim()) return;
    startTransition(async () => {
      try {
        await createAssetAccount(userId, {
          type: tab,
          symbol: symbol.trim(),
          name: assetName.trim() || undefined,
        });
        setSymbol("");
        setAssetName("");
        setShowAdd(false);
        toast.success("เพิ่มสินทรัพย์แล้ว");
        router.refresh();
      } catch {
        toast.error("เพิ่มสินทรัพย์ไม่สำเร็จ ลองอีกครั้ง");
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

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <FilterChips
          label="ประเภทสินทรัพย์"
          value={tab}
          onChange={(v) => {
            setTab(v);
            setShowAdd(false);
          }}
          options={TABS.map((t) => ({ value: t.key, label: t.label, count: dataMap[t.key].length }))}
        />
        <Button
          onClick={() => setShowAdd(!showAdd)}
          variant={showAdd ? "outline" : "default"}
          aria-expanded={showAdd}
          className="w-full sm:w-auto"
        >
          {showAdd ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {showAdd ? "ปิด" : `เพิ่ม${tabLabel}`}
        </Button>
      </div>

      {showAdd && (
        <Card className="p-4 sm:p-5">
          <form onSubmit={handleAdd} className="grid grid-cols-1 gap-3 sm:grid-cols-[12rem_1fr_auto] sm:items-end">
            <Field label={tab === "BANK" ? "ชื่อบัญชี / ธนาคาร" : "Symbol / Code"}>
              <Input
                value={symbol}
                onChange={(e) => setSymbol(e.target.value)}
                placeholder={tab === "BANK" ? "เช่น KBANK ออมทรัพย์" : "เช่น PTT"}
                autoCapitalize={tab === "BANK" ? "sentences" : "characters"}
                autoCorrect="off"
                required
                autoFocus
              />
            </Field>
            <Field label="ชื่อเต็ม (ไม่บังคับ)">
              <Input value={assetName} onChange={(e) => setAssetName(e.target.value)} placeholder="ชื่อที่จะแสดง" />
            </Field>
            <Button type="submit" disabled={isPending || !symbol.trim()}>
              {isPending ? "กำลังเพิ่ม..." : "เพิ่ม"}
            </Button>
          </form>
        </Card>
      )}

      {tab === "BANK" ? <BankList data={currentData} /> : <HoldingsList data={currentData} />}
    </div>
  );
}

function PortfolioSummary({
  stocksCost, fundsCost, cryptoCost, bankBalance, grandTotal, totalRealizedPnL, totalDividends,
}: {
  stocksCost: number; fundsCost: number; cryptoCost: number; bankBalance: number;
  grandTotal: number; totalRealizedPnL: number; totalDividends: number;
}) {
  const parts = [
    { label: "หุ้น", value: stocksCost },
    { label: "กองทุน", value: fundsCost },
    { label: "BTC/Crypto", value: cryptoCost },
    { label: "เงินฝาก", value: bankBalance },
  ];
  return (
    <Card className="p-4 sm:p-5">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-slate-500">ยอดรวมทั้งหมด</p>
          <p className="mt-0.5 text-2xl font-semibold tabular-nums tracking-tight text-slate-900 sm:text-3xl">
            {formatTHB(grandTotal)}
          </p>
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 sm:justify-end">
          <span>
            Realized P/L{" "}
            <span className={cn("font-semibold tabular-nums", totalRealizedPnL >= 0 ? "text-emerald-600" : "text-red-600")}>
              {formatTHB(totalRealizedPnL)}
            </span>
          </span>
          <span>
            ปันผลรวม <span className="font-semibold tabular-nums text-indigo-600">{formatTHB(totalDividends)}</span>
          </span>
        </div>
      </div>
      <dl className="mt-4 grid grid-cols-2 gap-2 border-t border-slate-100 pt-4 sm:grid-cols-4 sm:gap-4">
        {parts.map((p) => (
          <div key={p.label} className="min-w-0 rounded-lg bg-slate-50 px-3 py-2 sm:bg-transparent sm:p-0">
            <dt className="text-xs text-slate-500">{p.label}</dt>
            <dd className="truncate text-sm font-semibold tabular-nums text-slate-900">{formatTHB(p.value)}</dd>
          </div>
        ))}
      </dl>
    </Card>
  );
}

function HoldingsList({ data }: { data: AssetWithHoldings[] }) {
  if (data.length === 0) {
    return (
      <Card>
        <EmptyState icon={<Briefcase className="h-8 w-8" />} title="ยังไม่มีรายการ" description="เพิ่มสินทรัพย์เพื่อเริ่มติดตาม" />
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      {/* Phone + tablet: one tappable row per asset */}
      <ul className="divide-y divide-slate-100 lg:hidden">
        {data.map((asset) => {
          const h = asset.holdings;
          const pnl = h?.realizedPnLCents ?? 0;
          return (
            <li key={asset.id}>
              <Link
                href={`/portfolio/${asset.id}`}
                className="flex items-center gap-3 px-4 py-3.5 transition-colors active:bg-slate-50 sm:px-5"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="truncate font-semibold text-slate-900">
                      {asset.symbol}
                      {asset.name && <span className="ml-2 text-sm font-normal text-slate-500">{asset.name}</span>}
                    </p>
                    <p className="shrink-0 font-semibold tabular-nums text-slate-900">{formatTHB(h?.totalCostCents ?? 0)}</p>
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-slate-500">
                    <span className="tabular-nums">
                      {(h?.totalQuantity ?? 0).toLocaleString("th-TH")} หน่วย · เฉลี่ย {formatTHB(h?.avgCostCents ?? 0)}
                    </span>
                    {pnl !== 0 && (
                      <span className={cn("tabular-nums", pnl > 0 ? "text-emerald-600" : "text-red-600")}>
                        P/L {formatTHB(pnl)}
                      </span>
                    )}
                    {(h?.dividendsTotalCents ?? 0) > 0 && (
                      <span className="tabular-nums text-indigo-600">ปันผล {formatTHB(h?.dividendsTotalCents ?? 0)}</span>
                    )}
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-slate-300" />
              </Link>
            </li>
          );
        })}
      </ul>

      {/* Desktop: full table */}
      <div className="hidden overflow-x-auto lg:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-xs font-medium text-slate-500">
              <th scope="col" className="px-4 py-3 text-left xl:px-6">Symbol</th>
              <th scope="col" className="px-4 py-3 text-left xl:px-6">ชื่อ</th>
              <th scope="col" className="px-4 py-3 text-right xl:px-6">จำนวน</th>
              <th scope="col" className="px-4 py-3 text-right xl:px-6">ต้นทุนเฉลี่ย</th>
              <th scope="col" className="px-4 py-3 text-right xl:px-6">ต้นทุนรวม</th>
              <th scope="col" className="px-4 py-3 text-right xl:px-6">Realized P/L</th>
              <th scope="col" className="px-4 py-3 text-right xl:px-6">ปันผลรวม</th>
              <th scope="col" className="w-[1%] px-4 py-3 xl:px-6"><span className="sr-only">ดูรายละเอียด</span></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.map((asset) => {
              const h = asset.holdings;
              return (
                <tr key={asset.id} className="transition-colors hover:bg-slate-50/60">
                  <td className="px-4 py-3 font-semibold text-slate-900 xl:px-6">{asset.symbol}</td>
                  <td className="px-4 py-3 text-slate-500 xl:px-6">{asset.name ?? "—"}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-slate-900 xl:px-6">{h?.totalQuantity ?? 0}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-slate-600 xl:px-6">{formatTHB(h?.avgCostCents ?? 0)}</td>
                  <td className="px-4 py-3 text-right font-medium tabular-nums text-slate-900 xl:px-6">{formatTHB(h?.totalCostCents ?? 0)}</td>
                  <td className={cn("px-4 py-3 text-right font-medium tabular-nums xl:px-6", (h?.realizedPnLCents ?? 0) >= 0 ? "text-emerald-600" : "text-red-600")}>
                    {formatTHB(h?.realizedPnLCents ?? 0)}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-indigo-600 xl:px-6">{formatTHB(h?.dividendsTotalCents ?? 0)}</td>
                  <td className="px-4 py-3 text-right xl:px-6">
                    <Link
                      href={`/portfolio/${asset.id}`}
                      className="inline-flex items-center gap-1 whitespace-nowrap rounded-md px-2 py-1 text-xs font-medium text-indigo-600 hover:bg-indigo-50"
                    >
                      ดู <ChevronRight className="h-3 w-3" />
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function BankList({ data }: { data: AssetWithHoldings[] }) {
  if (data.length === 0) {
    return (
      <Card>
        <EmptyState icon={<Landmark className="h-8 w-8" />} title="ยังไม่มีบัญชี" description="เพิ่มบัญชีเงินฝากเพื่อเริ่มติดตาม" />
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4">
      {data.map((asset) => {
        const b = asset.bankBalance;
        return (
          <Link
            key={asset.id}
            href={`/portfolio/${asset.id}`}
            className="group rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            <Card className="p-4 transition-colors group-hover:border-indigo-300 group-active:bg-slate-50 sm:p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="truncate font-semibold text-slate-900">{asset.symbol}</h3>
                  {asset.name && <p className="truncate text-xs text-slate-500">{asset.name}</p>}
                </div>
                <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-slate-300" />
              </div>
              <p className="mt-2 text-2xl font-semibold tabular-nums tracking-tight text-indigo-600">
                {formatTHB(b?.currentBalanceCents ?? 0)}
              </p>
              <dl className="mt-2 grid grid-cols-2 gap-2 text-xs text-slate-500">
                <div>
                  <dt className="inline">ฝากรวม </dt>
                  <dd className="inline font-medium tabular-nums text-emerald-600">{formatTHB(b?.totalDepositsCents ?? 0)}</dd>
                </div>
                <div>
                  <dt className="inline">ถอนรวม </dt>
                  <dd className="inline font-medium tabular-nums text-red-600">{formatTHB(b?.totalWithdrawalsCents ?? 0)}</dd>
                </div>
              </dl>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
