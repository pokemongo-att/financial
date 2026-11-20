import { getAssetDetail } from "@/actions/assets";
import { notFound } from "next/navigation";
import { formatTHB } from "@/lib/money";
import { SummaryStats } from "@/components/SummaryStats";
import { AssetTransactionsList } from "./AssetTransactionsList";
import { AssetDetailHeader } from "./AssetDetailHeader";

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
    <div className="space-y-5 sm:space-y-6">
      <AssetDetailHeader
        assetId={id}
        symbol={asset.symbol}
        name={asset.name}
        type={asset.type}
      />

      {isBank ? (
        <SummaryStats
          items={[
            { label: "ฝากรวม", value: formatTHB(b?.totalDepositsCents ?? 0), tone: "positive" },
            { label: "ถอนรวม", value: formatTHB(b?.totalWithdrawalsCents ?? 0), tone: "negative" },
          ]}
          highlight={{ label: "ยอดคงเหลือ", value: formatTHB(b?.currentBalanceCents ?? 0), tone: "primary" }}
        />
      ) : (
        <SummaryStats
          gridClassName="sm:grid-cols-3 xl:grid-cols-5"
          items={[
            { label: "จำนวน", value: `${(h?.totalQuantity ?? 0).toLocaleString("th-TH")} หน่วย` },
            { label: "ต้นทุนเฉลี่ย", value: formatTHB(h?.avgCostCents ?? 0) },
            {
              label: "Realized P/L",
              value: formatTHB(h?.realizedPnLCents ?? 0),
              tone: (h?.realizedPnLCents ?? 0) >= 0 ? "positive" : "negative",
            },
            { label: "ปันผลสะสม", value: formatTHB(h?.dividendsTotalCents ?? 0), tone: "primary" },
          ]}
          highlight={{ label: "ต้นทุนรวม", value: formatTHB(h?.totalCostCents ?? 0) }}
        />
      )}

      <AssetTransactionsList
        assetId={id}
        assetType={asset.type}
        transactions={asset.transactions}
      />
    </div>
  );
}
