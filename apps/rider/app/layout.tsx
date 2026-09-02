import type { Metadata, Viewport } from "next";
import { RiderProvider } from "@/context/RiderContext";
import { RiderLayoutShell } from "@/components/layout/RiderLayoutShell";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Tatka Bazar Delivery Companion — Rider Portal",
    template: "%s | Tatka Bazar Rider",
  },
  description: "Mobile-first delivery management companion for Tatka Bazar fresh delivery fleet.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RiderRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <RiderProvider>
          <RiderLayoutShell>
            {children}
          </RiderLayoutShell>
        </RiderProvider>
      </body>
    </html>
  );
}
