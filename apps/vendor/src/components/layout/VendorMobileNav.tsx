"use client";

import React from "react";
import { usePathname, useRouter } from "next/navigation";
import { useVendorStore } from "@/store/vendorStore";
import { translations } from "@/utils/translations";

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

function HistoryIcon() {
  return (
    <svg fill="none" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
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

interface VendorMobileNavProps {
  onOpenNotifications?: () => void;
  onOpenRoleModal?: () => void;
}

export default function VendorMobileNav({}: VendorMobileNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { language, orders } = useVendorStore();
  const t = translations[language];

  const pendingOrders = orders.filter(
    (o) => o.status === "RECEIVED" || o.status === "PREPARING"
  ).length;

  const nav = [
    { href: "/", label: "হোম", icon: <HomeIcon /> },
    { href: "/orders", label: "অর্ডার", icon: <OrdersIcon />, badge: pendingOrders },
    { href: "/settlements", label: "উইথড্র", icon: <WalletIcon /> },
    { href: "/orders/history", label: "হিস্ট্রি", icon: <HistoryIcon /> },
    { href: "/profile", label: "প্রোফাইল", icon: <ProfileIcon /> },
  ];

  return (
    <nav className="bottom-nav" role="navigation" aria-label="মূল নেভিগেশন">
      {nav.map((item) => {
        const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));

        return (
          <button
            key={item.href}
            id={`nav-${item.href === "/" ? "home" : item.href.slice(1).replace("/", "-")}`}
            className={`nav-item${isActive ? " active" : ""}`}
            onClick={() => router.push(item.href)}
            aria-label={item.label}
          >
            {item.badge !== undefined && item.badge > 0 ? (
              <div className="nav-badge">
                {item.badge > 9 ? "9+" : item.badge}
              </div>
            ) : null}
            {item.icon}
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
