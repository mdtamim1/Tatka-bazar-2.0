import type { Metadata, Viewport } from "next";
import "./globals.css";
import RiderShell from "@/components/layout/RiderShell";

export const metadata: Metadata = {
  title: "Tatka Bazar — Rider Portal | ডেলিভারি পার্টনার",
  description: "Dedicated Delivery Rider Companion Application for Tatka Bazar Dhaka",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Tatka Rider",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#1B8A4C",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-[#070D09] text-gray-100 antialiased min-h-screen flex justify-center selection:bg-brand-500 selection:text-white">
        <RiderShell>{children}</RiderShell>
      </body>
    </html>
  );
}
