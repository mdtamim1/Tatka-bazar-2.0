import type { Metadata } from "next";
import { VendorProvider } from "@/context/VendorContext";
import { VendorLayoutShell } from "@/components/layout/VendorLayoutShell";
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
          <VendorLayoutShell>
            {children}
          </VendorLayoutShell>
        </VendorProvider>
      </body>
    </html>
  );
}
