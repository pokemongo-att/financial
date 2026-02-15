type MonthlyItem = {
  category: "INCOME" | "EXPENSE" | "SAVING" | "GOAL" | "FAMILY";
  plannedAmountCents: number;
  actualAmountCents: number | null;
  status: "PLANNED" | "DONE" | "SKIPPED";
};

export type MonthlySummary = {
  incomeTotal: number;
  expenseTotal: number;
  savingsTotal: number;
  goalSavingsTotal: number;
  familySupportTotal: number;
  netCashflow: number;
  endingBalance: number | null;
  totalPlanned: number;
  totalDone: number;
  totalSkipped: number;
};

function effectiveAmount(item: MonthlyItem): number {
  if (item.status === "SKIPPED") return 0;
  return item.actualAmountCents ?? item.plannedAmountCents;
}

export function calculateMonthlySummary(
  items: MonthlyItem[],
  startingBalanceCents?: number | null
): MonthlySummary {
  let incomeTotal = 0;
  let expenseTotal = 0;
  let savingsTotal = 0;
  let goalSavingsTotal = 0;
  let familySupportTotal = 0;
  let totalPlanned = 0;
  let totalDone = 0;
  let totalSkipped = 0;

  for (const item of items) {
    const amt = effectiveAmount(item);

    switch (item.category) {
      case "INCOME":
        incomeTotal += amt;
        break;
      case "EXPENSE":
        expenseTotal += amt;
        break;
      case "SAVING":
        savingsTotal += amt;
        break;
      case "GOAL":
        goalSavingsTotal += amt;
        break;
      case "FAMILY":
        familySupportTotal += amt;
        break;
    }

    switch (item.status) {
      case "PLANNED":
        totalPlanned++;
        break;
      case "DONE":
        totalDone++;
        break;
      case "SKIPPED":
        totalSkipped++;
        break;
    }
  }

  const netCashflow =
    incomeTotal - expenseTotal - savingsTotal - goalSavingsTotal - familySupportTotal;

  const endingBalance =
    startingBalanceCents != null ? startingBalanceCents + netCashflow : null;

  return {
    incomeTotal,
    expenseTotal,
    savingsTotal,
    goalSavingsTotal,
    familySupportTotal,
    netCashflow,
    endingBalance,
    totalPlanned,
    totalDone,
    totalSkipped,
  };
}
