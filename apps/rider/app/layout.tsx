import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Tatka Bazar Rider", template: "%s | Rider" },
  description: "Tatka Bazar ডেলিভারি রাইডার পোর্টাল — অর্ডার গ্রহণ, ডেলিভারি ট্র্যাক ও আয় ম্যানেজ করুন",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Tatka Rider",
    startupImage: [
      { url: "/icons/icon-512.png", media: "(device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3)" },
    ],
  },
  icons: {
    icon: [
      { url: "/icons/icon-16.png", sizes: "16x16", type: "image/png" },
      { url: "/icons/icon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    shortcut: "/favicon.ico",
  },
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
    "apple-mobile-web-app-title": "Tatka Rider",
    "application-name": "Tatka Rider",
    "msapplication-TileColor": "#FF6B2B",
    "msapplication-tap-highlight": "no",
    "format-detection": "telephone=no",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#FF6B2B" },
    { media: "(prefers-color-scheme: light)", color: "#FF6B2B" },
  ],
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="bn" dir="ltr">
      <head>
        {/* Service Worker registration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js', { scope: '/' })
                    .then(function(reg) {
                      // Check for updates on each page load
                      reg.update();
                      reg.addEventListener('updatefound', function() {
                        var newWorker = reg.installing;
                        if (newWorker) {
                          newWorker.addEventListener('statechange', function() {
                            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                              window.dispatchEvent(new CustomEvent('sw_update_available'));
                            }
                          });
                        }
                      });
                    })
                    .catch(function(err) { console.warn('SW registration failed:', err); });
                });
              }
            `,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
