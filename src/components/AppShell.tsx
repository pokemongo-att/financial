"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import Cookies from "js-cookie";
import { LayoutGrid, LogOut, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";
import { NAV_GROUPS, NAV_ITEMS, activeHref, type NavItem } from "./nav-items";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";

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
            "mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8",
            "pt-[max(1rem,env(safe-area-inset-top))] sm:pt-6 lg:pt-8",
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
/* Tablet rail (md) + desktop sidebar (lg)                             */
/* ------------------------------------------------------------------ */

function SideNav({ current }: { current: string | null }) {
  const logout = useLogout();

  return (
    <aside
      className={cn(
        "sticky top-0 hidden h-dvh shrink-0 flex-col border-r border-slate-200 bg-white md:flex",
        "md:w-[84px] lg:w-60",
        "pl-[env(safe-area-inset-left)]"
      )}
    >
      <div className="flex items-center gap-3 px-4 pt-5 pb-4 md:justify-center lg:justify-start lg:px-5">
        <BrandMark />
        <div className="hidden min-w-0 lg:block">
          <p className="truncate text-[15px] font-semibold tracking-tight text-slate-900">Finance Planner</p>
          <p className="truncate text-xs text-slate-500">สรุปการเงินรายเดือน</p>
        </div>
      </div>

      <nav aria-label="เมนูหลัก" className="no-scrollbar flex-1 overflow-y-auto px-2 pb-4 lg:px-3">
        {NAV_GROUPS.map((group, gi) => (
          <div key={group.label} className={cn(gi > 0 && "mt-3 border-t border-slate-100 pt-3 lg:mt-5 lg:border-0 lg:pt-0")}>
            <p className="mb-1 hidden px-3 text-[11px] font-medium text-slate-400 lg:block">{group.label}</p>
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

      <div className="border-t border-slate-100 p-2 lg:p-3">
        <button
          type="button"
          onClick={logout}
          className={cn(
            "flex w-full items-center rounded-lg text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-900",
            "flex-col gap-1 py-2 text-[11px] lg:flex-row lg:gap-3 lg:px-3 lg:text-sm lg:font-medium"
          )}
        >
          <LogOut className="h-5 w-5 lg:h-4 lg:w-4" />
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
        "group flex items-center rounded-lg transition-colors",
        // rail: icon over a short label
        "flex-col gap-1 px-1 py-2 text-[11px] leading-tight",
        // full sidebar: icon beside label
        "lg:flex-row lg:gap-3 lg:px-3 lg:py-2 lg:text-sm lg:font-medium",
        active ? "text-indigo-700 lg:bg-indigo-50" : "text-slate-500 hover:text-slate-900 lg:hover:bg-slate-50"
      )}
    >
      <span
        className={cn(
          "flex h-8 w-12 items-center justify-center rounded-full transition-colors lg:h-auto lg:w-auto lg:rounded-none",
          active ? "bg-indigo-50 lg:bg-transparent" : "group-hover:bg-slate-100 lg:group-hover:bg-transparent"
        )}
      >
        <Icon className="h-5 w-5 lg:h-4 lg:w-4" />
      </span>
      <span className="max-w-full truncate lg:hidden">{item.short}</span>
      <span className="hidden truncate lg:inline">{item.label}</span>
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
    <>
      <nav
        aria-label="เมนูหลัก"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur supports-[backdrop-filter]:bg-white/85 md:hidden"
      >
        <ul className="mx-auto grid max-w-lg grid-cols-5 px-1">
          {PRIMARY.map((item) => (
            <li key={item.href}>
              <TabLink item={item} active={current === item.href} />
            </li>
          ))}
          <li>
            <button
              type="button"
              onClick={() => setMoreOpen(true)}
              aria-haspopup="dialog"
              aria-expanded={moreOpen}
              className={cn(
                "flex h-16 w-full flex-col items-center justify-center gap-1 text-[11px] font-medium transition-colors",
                moreActive ? "text-indigo-700" : "text-slate-500 active:text-slate-900"
              )}
            >
              <TabIcon icon={LayoutGrid} active={moreActive} />
              เมนู
            </button>
          </li>
        </ul>
      </nav>

      <Dialog open={moreOpen} onOpenChange={setMoreOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>เมนูทั้งหมด</DialogTitle>
            <DialogDescription>ไปยังส่วนอื่นของระบบ</DialogDescription>
          </DialogHeader>
          <ul className="grid grid-cols-3 gap-2">
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
                      "flex h-full flex-col items-center gap-2 rounded-xl border px-2 py-3.5 text-center text-xs font-medium transition-colors",
                      active
                        ? "border-indigo-200 bg-indigo-50 text-indigo-700"
                        : "border-slate-200 bg-white text-slate-700 active:bg-slate-50"
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-xl",
                        active ? "bg-white text-indigo-600" : "bg-slate-100 text-slate-600"
                      )}
                    >
                      <Icon className="h-5 w-5" />
                    </span>
                    {item.label}
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
            className="flex h-12 items-center justify-center gap-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 active:bg-slate-50"
          >
            <LogOut className="h-4 w-4" />
            ออกจากระบบ
          </button>
        </DialogContent>
      </Dialog>
    </>
  );
}

function TabIcon({ icon: Icon, active }: { icon: NavItem["icon"]; active: boolean }) {
  return (
    <span
      className={cn(
        "flex h-7 w-12 items-center justify-center rounded-full transition-colors duration-200",
        active ? "bg-indigo-50" : "bg-transparent"
      )}
    >
      <Icon className="h-5 w-5" strokeWidth={active ? 2.25 : 2} />
    </span>
  );
}

function TabLink({ item, active }: { item: NavItem; active: boolean }) {
  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex h-16 flex-col items-center justify-center gap-1 text-[11px] font-medium transition-colors",
        active ? "text-indigo-700" : "text-slate-500 active:text-slate-900"
      )}
    >
      <TabIcon icon={item.icon} active={active} />
      <span className="max-w-full truncate px-0.5">{item.short}</span>
    </Link>
  );
}
