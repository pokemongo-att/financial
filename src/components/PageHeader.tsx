import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

export function PageHeader({
  title,
  subtitle,
  children,
  className,
  backHref,
  backLabel = "ย้อนกลับ",
}: {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  /** Page actions. Stacks under the title on phones, sits right on wider screens. */
  children?: React.ReactNode;
  className?: string;
  /** Renders a back button for detail pages. */
  backHref?: string;
  backLabel?: string;
}) {
  return (
    <header className={cn("flex flex-wrap items-center justify-between gap-x-6 gap-y-3", className)}>
      <div className="flex min-w-0 items-start gap-1">
        {backHref && (
          <Link
            href={backHref}
            aria-label={backLabel}
            className="-ml-2 -mt-1 inline-flex size-11 shrink-0 items-center justify-center rounded-lg text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
        )}
        <div className="min-w-0">
          <h1 className="wrap-anywhere text-2xl font-semibold tracking-tight text-slate-900 sm:text-[1.75rem]">{title}</h1>
          {subtitle && <p className="mt-1 wrap-anywhere text-sm leading-relaxed text-slate-600">{subtitle}</p>}
        </div>
      </div>
      {children && (
        <div className="flex w-full min-w-0 flex-wrap items-center gap-2 sm:w-auto">{children}</div>
      )}
    </header>
  );
}
