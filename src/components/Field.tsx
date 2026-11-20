import { cn } from "@/lib/utils";

/**
 * A visible label above a control. Wrapping in <label> lets a tap on the
 * label focus the field, which matters on touch screens.
 */
export function Field({
  label,
  error,
  hint,
  className,
  children,
}: {
  label: string;
  error?: string;
  hint?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={cn("block min-w-0 space-y-1.5", className)}>
      <span className="block text-xs font-medium text-slate-600">{label}</span>
      {children}
      {error ? (
        <span className="block text-xs text-red-600">{error}</span>
      ) : hint ? (
        <span className="block text-xs text-slate-500">{hint}</span>
      ) : null}
    </label>
  );
}
