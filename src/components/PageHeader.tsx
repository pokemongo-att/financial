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
    <div className={cn("flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between", className)}>
      <div className="flex min-w-0 items-start gap-1">
        {backHref && (
          <Link
            href={backHref}
            aria-label={backLabel}
            className="-ml-2 -mt-1 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 pointer-coarse:-mt-2 pointer-coarse:h-11 pointer-coarse:w-11 sm:mt-0 sm:pointer-coarse:-mt-1.5"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
        )}
        <div className="min-w-0">
          <h1 className="text-xl font-semibold tracking-tight text-balance text-slate-900 sm:text-2xl">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
        </div>
      </div>
      {children && (
        <div className="flex flex-wrap items-center gap-2 sm:shrink-0 sm:flex-nowrap">{children}</div>
      )}
    </div>
  );
}
