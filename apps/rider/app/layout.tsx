import type { Metadata, Viewport } from "next";
import { RiderProvider } from "@/context/RiderContext";
import { RiderHeader } from "@/components/layout/RiderHeader";
import { RiderBottomNav } from "@/components/layout/RiderBottomNav";
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
    <html lang="bn">
      <body>
        <RiderProvider>
          <div className="rider-app-container">
            <RiderHeader />
            <main style={{ flex: 1, padding: "16px" }}>
              {children}
            </main>
            <RiderBottomNav />
          </div>
        </RiderProvider>
      </body>
    </html>
  );
}
