import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Finance Planner",
  description: "ระบบสรุปการเงินรายเดือน",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersList = await headers();
  const pathname = headersList.get("x-invoke-path") || "";
  const isLoginPage = pathname === "/login";

  return (
    <html lang="th">
      <body className="bg-slate-50 text-slate-900 antialiased">
        <div className="flex min-h-screen">
          {!isLoginPage && <Sidebar />}
          <main className="flex-1 overflow-auto">
            <div className={`container mx-auto max-w-7xl px-4 py-6 md:px-8 md:py-8 ${isLoginPage ? "p-0 max-w-none" : ""}`}>
              {children}
            </div>
          </main>
        </div>
        <Toaster position="bottom-right" richColors />
      </body>
    </html>
  );
}
