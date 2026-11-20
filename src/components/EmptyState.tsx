import { cn } from "@/lib/utils";

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center justify-center px-4 py-10 text-center sm:py-12", className)}>
      {icon && <div className="mb-4 text-slate-300">{icon}</div>}
      <h3 className="text-sm font-medium text-balance text-slate-900">{title}</h3>
      {description && <p className="mt-1 max-w-sm text-sm text-balance text-slate-500">{description}</p>}
      {action && <div className="mt-5 flex w-full justify-center">{action}</div>}
    </div>
  );
}
