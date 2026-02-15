import { getDemoUserId } from "@/lib/demo-user";
import { getAssetAccounts } from "@/actions/assets";
import { PageHeader } from "@/components/PageHeader";
import { PortfolioTabs } from "./PortfolioTabs";

export default async function PortfolioPage() {
  const userId = await getDemoUserId();
  const [stocks, funds, crypto, banks] = await Promise.all([
    getAssetAccounts(userId, "STOCK"),
    getAssetAccounts(userId, "FUND"),
    getAssetAccounts(userId, "CRYPTO"),
    getAssetAccounts(userId, "BANK"),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader title="Portfolio" subtitle="หุ้น กองทุน BTC เงินฝาก" />
      <PortfolioTabs
        stocks={stocks}
        funds={funds}
        crypto={crypto}
        banks={banks}
        userId={userId}
      />
    </div>
  );
}
