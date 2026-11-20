import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AppShell } from "@/components/AppShell";
import { Toaster } from "sonner";

// Every page reads live data from the database; never prerender at build time.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Finance Planner",
  description: "ระบบสรุปการเงินรายเดือน",
  applicationName: "Finance Planner",
  appleWebApp: {
    capable: true,
    title: "Finance",
    statusBarStyle: "default",
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  interactiveWidget: "resizes-content",
  themeColor: "#f8fafc",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body className="bg-slate-50 text-slate-900 antialiased">
        <AppShell>{children}</AppShell>
        <Toaster
          position="bottom-right"
          richColors
          mobileOffset={{ bottom: "calc(5rem + env(safe-area-inset-bottom))" }}
        />
      </body>
    </html>
  );
}
