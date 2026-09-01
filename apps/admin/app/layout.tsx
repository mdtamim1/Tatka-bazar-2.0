import type { Metadata } from "next";
import { AdminProvider } from "@/context/AdminContext";
import { AdminLayoutShell } from "@/components/layout/AdminLayoutShell";
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
          <AdminLayoutShell>
            {children}
          </AdminLayoutShell>
        </AdminProvider>
      </body>
    </html>
  );
}
