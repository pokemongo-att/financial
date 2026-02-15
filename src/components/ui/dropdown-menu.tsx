"use client";

import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { MoreHorizontal } from "lucide-react";
import { Button } from "./button";

export function DropdownMenu({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <div ref={ref} className={cn("relative inline-block", className)}>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setOpen(!open)}
        className="h-8 w-8"
      >
        <MoreHorizontal className="w-4 h-4 text-slate-400" />
      </Button>
      {open && (
        <div
          className="absolute right-0 top-full mt-1 z-50 min-w-[160px] rounded-xl border border-slate-200 bg-white shadow-lg py-1 animate-in fade-in-0 zoom-in-95"
          onClick={() => setOpen(false)}
        >
          {children}
        </div>
      )}
    </div>
  );
}

export function DropdownMenuItem({
  children,
  onClick,
  className,
  variant = "default",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  variant?: "default" | "destructive";
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors",
        variant === "destructive"
          ? "text-red-600 hover:bg-red-50"
          : "text-slate-700 hover:bg-slate-50",
        className
      )}
    >
      {children}
    </button>
  );
}
