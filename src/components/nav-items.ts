import {
  LayoutDashboard,
  CalendarCheck,
  FileText,
  Target,
  Users,
  Briefcase,
  TrendingUp,
  Home,
  Shield,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  /** Short label for the tablet rail and the phone tab bar. */
  short: string;
  icon: LucideIcon;
  /** Shown as a tab in the phone bottom bar; everything else lives in the "เมนู" sheet. */
  primary?: boolean;
};

export type NavGroup = { label: string; items: NavItem[] };

export const NAV_GROUPS: NavGroup[] = [
  {
    label: "ภาพรวม",
    items: [
      { href: "/dashboard", label: "Dashboard", short: "Dashboard", icon: LayoutDashboard, primary: true },
      { href: "/month", label: "แผนรายเดือน", short: "แผนเดือน", icon: CalendarCheck, primary: true },
      { href: "/templates", label: "Templates", short: "Templates", icon: FileText },
    ],
  },
  {
    label: "การออม",
    items: [
      { href: "/goals", label: "เป้าหมาย", short: "เป้าหมาย", icon: Target, primary: true },
      { href: "/family", label: "ครอบครัว", short: "ครอบครัว", icon: Users },
    ],
  },
  {
    label: "การลงทุน",
    items: [
      { href: "/portfolio", label: "Portfolio", short: "Portfolio", icon: Briefcase, primary: true },
      { href: "/portfolio/dividends", label: "ปันผล", short: "ปันผล", icon: TrendingUp },
    ],
  },
  {
    label: "หนี้สินและประกัน",
    items: [
      { href: "/home-loan", label: "สินเชื่อบ้าน", short: "บ้าน", icon: Home },
      { href: "/insurances", label: "พอร์ตประกัน", short: "ประกัน", icon: Shield },
    ],
  },
];

export const NAV_ITEMS: NavItem[] = NAV_GROUPS.flatMap((g) => g.items);

/** The single nav item that owns `pathname` — the longest matching href wins,
 *  so /portfolio/dividends lights up "ปันผล" and not "Portfolio". */
export function activeHref(pathname: string): string | null {
  let best: string | null = null;
  for (const item of NAV_ITEMS) {
    if (pathname === item.href || pathname.startsWith(item.href + "/")) {
      if (!best || item.href.length > best.length) best = item.href;
    }
  }
  return best;
}
