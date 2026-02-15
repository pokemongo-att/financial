type GoalTransaction = {
  type: "DEPOSIT" | "WITHDRAW";
  amountCents: number;
};

export type GoalBalance = {
  openingBalance: number;
  totalDeposits: number;
  totalWithdrawals: number;
  currentBalance: number;
};

export function calculateGoalBalance(
  openingBalanceCents: number,
  transactions: GoalTransaction[]
): GoalBalance {
  let totalDeposits = 0;
  let totalWithdrawals = 0;

  for (const tx of transactions) {
    if (tx.type === "DEPOSIT") {
      totalDeposits += tx.amountCents;
    } else {
      totalWithdrawals += tx.amountCents;
    }
  }

  return {
    openingBalance: openingBalanceCents,
    totalDeposits,
    totalWithdrawals,
    currentBalance: openingBalanceCents + totalDeposits - totalWithdrawals,
  };
}
