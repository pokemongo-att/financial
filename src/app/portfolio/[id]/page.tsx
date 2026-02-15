import { getAssetDetail } from "@/actions/assets";
import { notFound } from "next/navigation";
import Link from "next/link";
import { formatTHB } from "@/lib/money";
import { Card, CardTitle, CardValue } from "@/components/ui/card";
import { PageHeader } from "@/components/PageHeader";
import { Badge } from "@/components/ui/badge";
import { AssetTransactionsList } from "./AssetTransactionsList";
import { ArrowLeft } from "lucide-react";

export default async function AssetDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const asset = await getAssetDetail(id);
  if (!asset) notFound();

  const isBank = asset.type === "BANK";
  const h = !isBank ? (asset as any).holdings : null;
  const b = isBank ? (asset as any).bankBalance : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/portfolio" className="text-slate-400 hover:text-slate-600 transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <PageHeader
          title={
            <span>
              {asset.symbol}
              {asset.name && <span className="text-slate-400 font-normal ml-2">— {asset.name}</span>}
            </span>
          }
        />
        <Badge>{asset.type}</Badge>
      </div>

      {isBank ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <Card className="p-5">
            <CardTitle>ยอดคงเหลือ</CardTitle>
            <CardValue className="text-indigo-600">{formatTHB(b?.currentBalanceCents ?? 0)}</CardValue>
          </Card>
          <Card className="p-5">
            <CardTitle>ฝากรวม</CardTitle>
            <CardValue className="text-emerald-600">{formatTHB(b?.totalDepositsCents ?? 0)}</CardValue>
          </Card>
          <Card className="p-5">
            <CardTitle>ถอนรวม</CardTitle>
            <CardValue className="text-red-600">{formatTHB(b?.totalWithdrawalsCents ?? 0)}</CardValue>
          </Card>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card className="p-5">
            <CardTitle>จำนวน</CardTitle>
            <CardValue>{h?.totalQuantity ?? 0}</CardValue>
          </Card>
          <Card className="p-5">
            <CardTitle>ต้นทุนเฉลี่ย</CardTitle>
            <CardValue>{formatTHB(h?.avgCostCents ?? 0)}</CardValue>
          </Card>
          <Card className="p-5">
            <CardTitle>ต้นทุนรวม</CardTitle>
            <CardValue>{formatTHB(h?.totalCostCents ?? 0)}</CardValue>
          </Card>
          <Card className="p-5">
            <CardTitle>Realized P/L</CardTitle>
            <CardValue className={(h?.realizedPnLCents ?? 0) >= 0 ? "text-emerald-600" : "text-red-600"}>
              {formatTHB(h?.realizedPnLCents ?? 0)}
            </CardValue>
          </Card>
          <Card className="p-5">
            <CardTitle>ปันผลสะสม</CardTitle>
            <CardValue className="text-indigo-600">{formatTHB(h?.dividendsTotalCents ?? 0)}</CardValue>
          </Card>
        </div>
      )}

      <AssetTransactionsList
        assetId={id}
        assetType={asset.type}
        transactions={asset.transactions}
      />
    </div>
  );
}
