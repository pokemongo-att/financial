export type HomeLoanTransaction = {
  id: string;
  month: string;
  name: string;
  actualAmountCents: number | null;
  interestRate: string | null;
  doneAt: Date | null;
  note: string | null;
};

export type HomeLoanSummary = {
  principalPaid: number;
  interestPaid: number;
  totalPaid: number;
  currentBalance: number;
  monthlyData: {
    month: string;
    principal: number;
    interest: number;
    total: number;
    balance: number;
  }[];
};

export function calculateHomeLoanSummary(
  initialBalanceCents: number,
  transactions: HomeLoanTransaction[]
): HomeLoanSummary {
  let currentBalance = initialBalanceCents;
  let totalInterest = 0;
  let totalPrincipal = 0;
  
  const monthlyData = transactions.map((tx) => {
    const amount = tx.actualAmountCents || 0;
    const rate = tx.interestRate ? parseFloat(tx.interestRate) : 0;
    
    // Simple interest calculation: Balance * (Rate / 100) * (30 / 365)
    // Assuming average 30 days per month
    const interest = Math.round(currentBalance * (rate / 100) * (30 / 365));
    const principal = amount - interest;
    
    currentBalance -= principal;
    totalInterest += interest;
    totalPrincipal += principal;
    
    return {
      month: tx.month,
      total: amount,
      interest,
      principal,
      balance: currentBalance,
    };
  });

  return {
    principalPaid: totalPrincipal,
    interestPaid: totalInterest,
    totalPaid: totalPrincipal + totalInterest,
    currentBalance,
    monthlyData,
  };
}
