import type { Metadata } from "next";
import { AdminProvider } from "@/context/AdminContext";
import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { AdminHeader } from "@/components/layout/AdminHeader";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Tatka Bazar Control Panel — Admin Hub",
    template: "%s | Tatka Bazar Admin",
  },
  description: "Internal central control panel for Tatka Bazar operations, inventory and multi-vendor marketplace.",
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="bn">
      <body style={{ background: "var(--bg-deep)" }}>
        <AdminProvider>
          <div style={{ display: "flex", minHeight: "100vh" }}>
            <AdminSidebar />
            <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, background: "var(--bg-deep)" }}>
              <AdminHeader />
              <main style={{ flex: 1, padding: "24px 28px", overflowY: "auto", background: "var(--bg-deep)" }}>
                {children}
              </main>
            </div>
          </div>
        </AdminProvider>
      </body>
    </html>
  );
}
