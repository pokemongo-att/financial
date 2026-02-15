type DividendTx = {
  assetAccountId: string;
  symbol: string;
  name: string | null;
  assetType: "STOCK" | "FUND" | "CRYPTO" | "BANK";
  amountCents: number;
  date: string;
};

export type DividendPerAsset = {
  assetAccountId: string;
  code: string;
  name: string | null;
  type: "STOCK" | "FUND" | "CRYPTO" | "BANK";
  dividendCount: number;
  dividendTotalCents: number;
  lastDividendAt: string | null;
};

export type DividendSummary = {
  totals: {
    allCents: number;
    stockCents: number;
    fundCents: number;
  };
  perAsset: DividendPerAsset[];
};

export function calculateDividendSummary(
  transactions: DividendTx[]
): DividendSummary {
  const map = new Map<string, DividendPerAsset>();

  let allCents = 0;
  let stockCents = 0;
  let fundCents = 0;

  for (const tx of transactions) {
    allCents += tx.amountCents;
    if (tx.assetType === "STOCK") stockCents += tx.amountCents;
    if (tx.assetType === "FUND") fundCents += tx.amountCents;

    const existing = map.get(tx.assetAccountId);
    if (existing) {
      existing.dividendCount++;
      existing.dividendTotalCents += tx.amountCents;
      if (!existing.lastDividendAt || tx.date > existing.lastDividendAt) {
        existing.lastDividendAt = tx.date;
      }
    } else {
      map.set(tx.assetAccountId, {
        assetAccountId: tx.assetAccountId,
        code: tx.symbol,
        name: tx.name,
        type: tx.assetType,
        dividendCount: 1,
        dividendTotalCents: tx.amountCents,
        lastDividendAt: tx.date,
      });
    }
  }

  return {
    totals: { allCents, stockCents, fundCents },
    perAsset: Array.from(map.values()),
  };
}
