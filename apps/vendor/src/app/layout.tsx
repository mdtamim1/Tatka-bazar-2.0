import type { Metadata } from "next";
import "./globals.css";
import VendorShell from "@/components/layout/VendorShell";

export const metadata: Metadata = {
  title: "Tatka Bazar — Vendor Portal | ভেন্ডর অপারেশন কনসোল",
  description:
    "Daily operational back-office console for shop owners and suppliers on Tatka Bazar multi-vendor marketplace.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="bn">
      <body className="bg-[#050810] text-[#F0F6FF] min-h-screen antialiased selection:bg-[#00D68F] selection:text-black">
        <VendorShell>{children}</VendorShell>
      </body>
    </html>
  );
}
