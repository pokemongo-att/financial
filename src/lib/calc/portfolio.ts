type AssetTransaction = {
  type: "BUY" | "SELL" | "DIVIDEND" | "FEE" | "DEPOSIT" | "WITHDRAW" | "OPENING";
  quantity: number | null;
  pricePerUnitCents: number | null;
  amountCents: number;
};

export type Holdings = {
  totalQuantity: number;
  totalCostCents: number;
  avgCostCents: number;
  realizedPnLCents: number;
  dividendsTotalCents: number;
  feesTotalCents: number;
};

/**
 * Calculate holdings from an ordered list of transactions (oldest first).
 * Uses average-cost method for SELL.
 */
export function calculateHoldings(transactions: AssetTransaction[]): Holdings {
  let totalQuantity = 0;
  let totalCostCents = 0;
  let realizedPnLCents = 0;
  let dividendsTotalCents = 0;
  let feesTotalCents = 0;

  for (const tx of transactions) {
    switch (tx.type) {
      case "BUY": {
        const qty = tx.quantity ?? 0;
        totalQuantity += qty;
        totalCostCents += tx.amountCents;
        break;
      }
      case "SELL": {
        const qty = tx.quantity ?? 0;
        const avgCost = totalQuantity > 0 ? totalCostCents / totalQuantity : 0;
        const costBasis = Math.round(avgCost * qty);
        realizedPnLCents += tx.amountCents - costBasis;
        totalQuantity -= qty;
        totalCostCents -= costBasis;
        if (totalQuantity <= 0) {
          totalQuantity = 0;
          totalCostCents = 0;
        }
        break;
      }
      case "DIVIDEND": {
        dividendsTotalCents += tx.amountCents;
        break;
      }
      case "FEE": {
        feesTotalCents += tx.amountCents;
        break;
      }
      case "OPENING":
      case "DEPOSIT": {
        totalCostCents += tx.amountCents;
        totalQuantity += tx.quantity ?? 0;
        break;
      }
      case "WITHDRAW": {
        totalCostCents -= tx.amountCents;
        totalQuantity -= tx.quantity ?? 0;
        if (totalQuantity < 0) totalQuantity = 0;
        if (totalCostCents < 0) totalCostCents = 0;
        break;
      }
    }
  }

  const avgCostCents =
    totalQuantity > 0 ? Math.round(totalCostCents / totalQuantity) : 0;

  return {
    totalQuantity,
    totalCostCents,
    avgCostCents,
    realizedPnLCents,
    dividendsTotalCents,
    feesTotalCents,
  };
}

export type BankBalance = {
  currentBalanceCents: number;
  totalDepositsCents: number;
  totalWithdrawalsCents: number;
};

/**
 * Calculate bank account balance from transactions.
 */
export function calculateBankBalance(
  transactions: AssetTransaction[]
): BankBalance {
  let currentBalanceCents = 0;
  let totalDepositsCents = 0;
  let totalWithdrawalsCents = 0;

  for (const tx of transactions) {
    switch (tx.type) {
      case "OPENING":
      case "DEPOSIT":
        currentBalanceCents += tx.amountCents;
        totalDepositsCents += tx.amountCents;
        break;
      case "WITHDRAW":
        currentBalanceCents -= tx.amountCents;
        totalWithdrawalsCents += tx.amountCents;
        break;
      case "DIVIDEND":
        currentBalanceCents += tx.amountCents;
        break;
    }
  }

  return { currentBalanceCents, totalDepositsCents, totalWithdrawalsCents };
}
