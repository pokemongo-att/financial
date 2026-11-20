"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import Cookies from "js-cookie";
import { ChevronRight, LayoutGrid, LogOut, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";
import { NAV_GROUPS, NAV_ITEMS, activeHref, type NavItem } from "./nav-items";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";

export function BrandMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm shadow-indigo-600/20",
        className
      )}
      aria-hidden
    >
      <Wallet className="h-[18px] w-[18px]" />
    </span>
  );
}

function useLogout() {
  const router = useRouter();
  return () => {
    Cookies.remove("auth_token");
    router.replace("/login");
    router.refresh();
  };
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "";

  if (pathname === "/login" || pathname.startsWith("/login/")) {
    return <>{children}</>;
  }

  const current = activeHref(pathname);

  return (
    <div className="min-h-dvh md:flex">
      <SideNav current={current} />
      <main className="min-w-0 flex-1">
        <div
          className={cn(
            "mx-auto w-full max-w-7xl pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))] sm:pl-[max(1.5rem,env(safe-area-inset-left))] sm:pr-[max(1.5rem,env(safe-area-inset-right))] xl:px-8",
            "pt-[max(1.25rem,env(safe-area-inset-top))] sm:pt-[max(1.5rem,env(safe-area-inset-top))] xl:pt-8",
            // leave room for the phone tab bar
            "pb-[calc(6rem+env(safe-area-inset-bottom))] md:pb-12"
          )}
        >
          {children}
        </div>
      </main>
      <BottomNav current={current} />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Tablet rail (md) + desktop sidebar (xl)                             */
/* ------------------------------------------------------------------ */

function SideNav({ current }: { current: string | null }) {
  const logout = useLogout();

  return (
    <aside
      className={cn(
        "sticky top-0 hidden h-dvh shrink-0 flex-col border-r border-slate-200 bg-white md:flex",
        "md:w-[calc(5.5rem+env(safe-area-inset-left))] xl:w-56",
        "pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] pl-[env(safe-area-inset-left)]"
      )}
    >
      <div className="flex items-center justify-center gap-3 px-4 pt-5 pb-4 xl:justify-start xl:px-5">
        <BrandMark />
        <div className="hidden min-w-0 xl:block">
          <p className="truncate text-[15px] font-semibold tracking-tight text-slate-900">Finance Planner</p>
          <p className="truncate text-xs text-slate-500">สรุปการเงินรายเดือน</p>
        </div>
      </div>

      <nav aria-label="เมนูหลัก" className="flex-1 overflow-y-auto px-2 pb-4 xl:px-3">
        {NAV_GROUPS.map((group, gi) => (
          <div key={group.label} className={cn(gi > 0 && "mt-3 border-t border-slate-100 pt-3 xl:mt-5 xl:border-0 xl:pt-0")}>
            <p className="mb-1 hidden px-3 text-xs font-medium text-slate-600 xl:block">{group.label}</p>
            <ul className="space-y-0.5">
              {group.items.map((item) => (
                <li key={item.href}>
                  <SideNavLink item={item} active={current === item.href} />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-slate-100 p-2 xl:p-3">
        <button
          type="button"
          onClick={logout}
          className={cn(
            "flex min-h-11 w-full items-center rounded-lg text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500",
            "flex-col justify-center gap-1 py-2 text-xs xl:flex-row xl:justify-start xl:gap-3 xl:px-3 xl:text-sm xl:font-medium"
          )}
        >
          <LogOut className="size-5 xl:size-4" aria-hidden />
          ออกจากระบบ
        </button>
      </div>
    </aside>
  );
}

function SideNavLink({ item, active }: { item: NavItem; active: boolean }) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      title={item.label}
      className={cn(
        "flex min-h-11 items-center justify-center rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-indigo-500",
        "flex-col gap-1 px-1 py-2 text-center text-xs leading-snug",
        "xl:flex-row xl:justify-start xl:gap-3 xl:px-3 xl:text-left xl:text-sm",
        active ? "bg-indigo-50 font-semibold text-indigo-800" : "font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900"
      )}
    >
      <Icon className="size-5 shrink-0 xl:size-4" aria-hidden />
      <span className="xl:hidden">{item.short}</span>
      <span className="hidden xl:inline">{item.label}</span>
    </Link>
  );
}

/* ------------------------------------------------------------------ */
/* Phone tab bar + "เมนู" sheet                                         */
/* ------------------------------------------------------------------ */

const PRIMARY = NAV_ITEMS.filter((i) => i.primary);
const SECONDARY = NAV_ITEMS.filter((i) => !i.primary);

function BottomNav({ current }: { current: string | null }) {
  const [moreOpen, setMoreOpen] = useState(false);
  const logout = useLogout();
  const moreActive = SECONDARY.some((i) => i.href === current);

  return (
    <Dialog open={moreOpen} onOpenChange={setMoreOpen}>
      <nav
        aria-label="เมนูหลัก"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white pb-[env(safe-area-inset-bottom)] pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)] md:hidden"
      >
        <ul className="mx-auto grid max-w-lg grid-cols-5 gap-1 px-1 py-1">
          {PRIMARY.map((item) => (
            <li key={item.href}>
              <TabLink item={item} active={current === item.href} />
            </li>
          ))}
          <li>
            <DialogTrigger asChild>
              <button type="button" className={cn(tabClassName, moreActive && activeTabClassName)}>
                <LayoutGrid className="size-5" aria-hidden />
                เพิ่มเติม
              </button>
            </DialogTrigger>
          </li>
        </ul>
      </nav>

      <DialogContent className="sm:max-w-md" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>เมนูเพิ่มเติม</DialogTitle>
        </DialogHeader>
        <ul className="divide-y divide-slate-100">
          {SECONDARY.map((item) => {
            const Icon = item.icon;
            const active = current === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setMoreOpen(false)}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex min-h-12 items-center gap-3 rounded-lg px-2 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-indigo-500",
                    active
                      ? "bg-indigo-50 text-indigo-800"
                      : "text-slate-700 hover:bg-slate-50 active:bg-slate-100"
                  )}
                >
                  <span
                    className={cn(
                      "flex size-8 shrink-0 items-center justify-center rounded-lg",
                      active ? "bg-white text-indigo-700" : "bg-slate-100 text-slate-600"
                    )}
                  >
                    <Icon className="size-4" aria-hidden />
                  </span>
                  <span className="flex-1">{item.label}</span>
                  <ChevronRight className="size-4 shrink-0 text-slate-500" aria-hidden />
                </Link>
              </li>
            );
          })}
        </ul>
        <button
          type="button"
          onClick={() => {
            setMoreOpen(false);
            logout();
          }}
          className="flex min-h-11 items-center justify-center gap-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
        >
          <LogOut className="h-4 w-4" />
          ออกจากระบบ
        </button>
      </DialogContent>
    </Dialog>
  );
}

const tabClassName =
  "flex min-h-14 w-full flex-col items-center justify-center gap-1 rounded-lg px-0.5 text-center text-xs leading-snug font-medium text-slate-600 transition-colors hover:bg-slate-50 active:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-indigo-500";
const activeTabClassName = "bg-indigo-50 font-semibold text-indigo-800 hover:bg-indigo-100";

function TabLink({ item, active }: { item: NavItem; active: boolean }) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      className={cn(tabClassName, active && activeTabClassName)}
    >
      <Icon className="size-5" strokeWidth={active ? 2.25 : 2} aria-hidden />
      <span>{item.short}</span>
    </Link>
  );
}
