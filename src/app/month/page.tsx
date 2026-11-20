import { redirect } from "next/navigation";

// Resolve "this month" per request, never at build time.
export const dynamic = "force-dynamic";

/** /month → this month's plan, so the tab bar has a stable link. */
export default function CurrentMonthPage() {
  const now = new Date();
  const ym = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  redirect(`/month/${ym}`);
}
