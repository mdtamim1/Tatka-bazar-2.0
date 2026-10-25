"use client";

import React, { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useVendorStore } from "@/store/vendorStore";

// ─── SVG Icons ────────────────────────────────────────────────

function HomeIcon() {
  return (
    <svg fill="none" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  );
}

function OrdersIcon() {
  return (
    <svg fill="none" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    </svg>
  );
}

function WalletIcon() {
  return (
    <svg fill="none" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
    </svg>
  );
}

function ProductsIcon() {
  return (
    <svg fill="none" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  );
}

function ProfileIcon() {
  return (
    <svg fill="none" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  );
}

function GridIcon() {
  return (
    <svg fill="none" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg fill="none" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

// ─── More Menu Extras ─────────────────────────────────────────

const MORE_ITEMS = [
  { href: "/analytics",  label: "অ্যানালিটিক্স", emoji: "📊" },
  { href: "/inventory",  label: "ইনভেন্টরি",     emoji: "📦" },
  { href: "/promotions", label: "কুপন ও ছাড়",    emoji: "🏷️" },
  { href: "/wholesale",  label: "হোলসেল B2B",    emoji: "🤝" },
  { href: "/staff",      label: "স্টাফ",          emoji: "👥" },
  { href: "/reviews",    label: "রিভিউ",          emoji: "⭐" },
  { href: "/orders/history", label: "হিস্ট্রি",  emoji: "🕓" },
  { href: "/settings",   label: "সেটিংস",         emoji: "⚙️" },
];

interface VendorMobileNavProps {
  onOpenNotifications?: () => void;
  onOpenRoleModal?: () => void;
}

export default function VendorMobileNav({}: VendorMobileNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { orders } = useVendorStore();
  const [showMore, setShowMore] = useState(false);

  const pendingOrders = orders.filter(
    (o) => o.status === "RECEIVED" || o.status === "PREPARING"
  ).length;

  // Primary nav (5 slots)
  const nav = [
    { href: "/",           label: "হোম",      icon: <HomeIcon /> },
    { href: "/orders",     label: "অর্ডার",   icon: <OrdersIcon />,  badge: pendingOrders },
    { href: "/products",   label: "পণ্য",     icon: <ProductsIcon /> },
    { href: "/settlements",label: "উইথড্র",  icon: <WalletIcon /> },
    { href: "/profile",    label: "প্রোফাইল", icon: <ProfileIcon /> },
  ];

  // "More" sheet is active when we're on a route not in primary nav
  const primaryHrefs = nav.map((n) => n.href);
  const isMoreActive =
    showMore ||
    (!primaryHrefs.some((h) => h !== "/" ? pathname.startsWith(h) : pathname === "/") &&
      pathname !== "/");

  return (
    <>
      {/* ── More Sheet Overlay ── */}
      {showMore && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 48,
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
          }}
          onClick={() => setShowMore(false)}
        >
          {/* Backdrop */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(5,8,16,0.7)",
              backdropFilter: "blur(4px)",
            }}
          />
          {/* Sheet */}
          <div
            style={{
              position: "relative",
              background: "#08111E",
              borderTop: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "20px 20px 0 0",
              padding: "20px 16px 100px",
              animation: "slideUp 0.22s ease",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <span style={{ color: "#A8C0D8", fontSize: 13, fontWeight: 700 }}>আরও পেজ</span>
              <button
                onClick={() => setShowMore(false)}
                style={{ background: "rgba(255,255,255,0.07)", border: "none", borderRadius: 8, width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center", color: "#A8C0D8", cursor: "pointer" }}
              >
                <XIcon />
              </button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
              {MORE_ITEMS.map((item) => {
                const isActive = item.href !== "/" && pathname.startsWith(item.href);
                return (
                  <button
                    key={item.href}
                    onClick={() => { router.push(item.href); setShowMore(false); }}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 6,
                      padding: "12px 6px",
                      borderRadius: 14,
                      background: isActive ? "rgba(0,214,143,0.12)" : "rgba(255,255,255,0.04)",
                      border: `1px solid ${isActive ? "rgba(0,214,143,0.3)" : "rgba(255,255,255,0.07)"}`,
                      cursor: "pointer",
                    }}
                  >
                    <span style={{ fontSize: 22 }}>{item.emoji}</span>
                    <span style={{ fontSize: 10, fontWeight: 700, color: isActive ? "#00D68F" : "#A8C0D8", textAlign: "center", lineHeight: 1.3 }}>
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── Bottom Nav Bar ── */}
      <nav className="bottom-nav" role="navigation" aria-label="মূল নেভিগেশন">
        {nav.map((item) => {
          const isActive = item.href === "/"
            ? pathname === "/"
            : pathname.startsWith(item.href);

          return (
            <button
              key={item.href}
              id={`nav-${item.href === "/" ? "home" : item.href.slice(1).replace("/", "-")}`}
              className={`nav-item${isActive ? " active" : ""}`}
              onClick={() => { setShowMore(false); router.push(item.href); }}
              aria-label={item.label}
            >
              {item.badge !== undefined && item.badge > 0 ? (
                <div className="nav-badge">{item.badge > 9 ? "9+" : item.badge}</div>
              ) : null}
              {item.icon}
              <span>{item.label}</span>
            </button>
          );
        })}

        {/* "More" button */}
        <button
          id="nav-more"
          className={`nav-item${isMoreActive ? " active" : ""}`}
          onClick={() => setShowMore((p) => !p)}
          aria-label="আরও"
        >
          {showMore ? <XIcon /> : <GridIcon />}
          <span>আরও</span>
        </button>
      </nav>
    </>
  );
}
