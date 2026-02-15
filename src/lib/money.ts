/**
 * Convert a baht amount (number or string) to satang (integer cents).
 * e.g. toCents(156.50) => 15650
 */
export function toCents(value: number | string): number {
  const num = typeof value === "string" ? parseFloat(value) : value;
  return Math.round(num * 100);
}

/**
 * Convert satang (integer cents) back to baht string with 2 decimal places.
 * e.g. fromCents(15650) => "156.50"
 */
export function fromCents(cents: number): string {
  return (cents / 100).toFixed(2);
}

/**
 * Format satang as Thai Baht display string.
 * e.g. formatTHB(1560000) => "฿15,600.00"
 */
export function formatTHB(cents: number): string {
  const baht = cents / 100;
  return new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
    minimumFractionDigits: 2,
  }).format(baht);
}
