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
    <html lang="en">
      <body className="bg-[#0B1215] text-slate-100 min-h-screen antialiased selection:bg-emerald-600 selection:text-white">
        <VendorShell>{children}</VendorShell>
      </body>
    </html>
  );
}
