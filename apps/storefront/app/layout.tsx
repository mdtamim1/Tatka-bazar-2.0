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
    default: "Tatka Bazar — Bangladesh's Premium Fresh Marketplace",
    template: "%s | Tatka Bazar",
  },
  description:
    "Shop daily fresh Padma Hilsa, farm organic vegetables, premium Kataribhog rice and pure groceries. 60-minute express delivery across Bangladesh.",
  keywords: ["online grocery", "Bangladeshi bazar", "Padma Ilish", "organic vegetables", "Tatka Bazar", "Dhaka delivery", "Recipe to Cart"],
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
    <html lang="en">
      <head>
        <OrganizationJsonLd />
      </head>
      <body>
        <LanguageProvider>
          <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
            <Header />
            <div style={{ flex: 1 }}>{children}</div>
            <CartDrawer />
            <WishlistDrawer />
            <Footer />
            <LiveSupportWidget />
          </div>
        </LanguageProvider>
      </body>
    </html>
  );
}
