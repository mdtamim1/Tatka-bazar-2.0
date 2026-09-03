import type { Metadata } from "next";
import { LanguageProvider } from "@/context/LanguageContext";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/layout/CartDrawer";
import { WishlistDrawer } from "@/components/layout/WishlistDrawer";
import { OrganizationJsonLd } from "@/components/seo/JsonLd";
import { LiveSupportWidget } from "@/components/chat/LiveSupportWidget";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Tatka Bazar — Considered Living & Premium Fresh Harvest",
    template: "%s | Tatka Bazar",
  },
  description:
    "Curated organic farm produce, authentic Padma Hilsa, seasonal artisan provisions, and pantry staples. Considered living, delivered with intention across Bangladesh.",
  keywords: ["online grocery", "Bangladeshi artisan food", "Padma Ilish", "organic vegetables", "Tatka Bazar", "Dhaka delivery"],
  openGraph: {
    siteName: "Tatka Bazar",
    locale: "en_US",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <OrganizationJsonLd />
      </head>
      <body className="bg-background text-foreground font-sans antialiased min-h-screen flex flex-col selection:bg-terracotta/20">
        <LanguageProvider>
          <Header />
          <main className="flex-1 w-full">{children}</main>
          <CartDrawer />
          <WishlistDrawer />
          <Footer />
          <LiveSupportWidget />
        </LanguageProvider>
      </body>
    </html>
  );
}
