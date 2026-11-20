"use client";

import { Fragment } from "react";
import { MoreHorizontal, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export type RowAction = {
  label: string;
  icon?: LucideIcon;
  onSelect: () => void;
  destructive?: boolean;
};

/**
 * The "⋯" menu for a row or card. Always visible (touch screens have no hover),
 * 32px on mouse, 44px on touch.
 */
export function RowActions({
  actions,
  label = "ตัวเลือกเพิ่มเติม",
  className,
}: {
  actions: RowAction[];
  label?: string;
  className?: string;
}) {
  const firstDestructive = actions.findIndex((a) => a.destructive);
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label={label}
          className={cn("h-8 w-8 shrink-0 text-slate-400 hover:text-slate-700 data-[state=open]:bg-slate-100 data-[state=open]:text-slate-700", className)}
          onClick={(e) => e.stopPropagation()}
        >
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
        {actions.map((a, i) => {
          const Icon = a.icon;
          return (
            <Fragment key={a.label}>
              {i === firstDestructive && i > 0 && <DropdownMenuSeparator />}
              <DropdownMenuItem
                onSelect={a.onSelect}
                className={cn(a.destructive && "text-red-600 focus:bg-red-50 focus:text-red-700")}
              >
                {Icon && <Icon />}
                {a.label}
              </DropdownMenuItem>
            </Fragment>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
