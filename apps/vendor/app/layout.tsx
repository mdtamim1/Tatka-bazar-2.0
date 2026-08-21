import type { Metadata } from "next";
import { VendorProvider } from "@/context/VendorContext";
import { VendorSidebar } from "@/components/layout/VendorSidebar";
import { VendorHeader } from "@/components/layout/VendorHeader";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Tatka Bazar Vendor Portal — Partner Hub",
    template: "%s | Tatka Bazar Vendor",
  },
  description: "Vendor portal for Tatka Bazar partner shops to manage inventory, slice-only orders and payouts.",
};

export default function VendorRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="bn">
      <body>
        <VendorProvider>
          <div style={{ display: "flex", minHeight: "100vh" }}>
            <VendorSidebar />
            <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
              <VendorHeader />
              <main style={{ flex: 1, padding: "24px", overflowY: "auto" }}>
                {children}
              </main>
            </div>
          </div>
        </VendorProvider>
      </body>
    </html>
  );
}
