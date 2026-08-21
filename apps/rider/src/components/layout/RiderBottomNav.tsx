"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Package, DollarSign, User } from "lucide-react";
import { useRider } from "@/context/RiderContext";

export function RiderBottomNav() {
  const pathname = usePathname();
  const { deliveries } = useRider();

  const activeDeliveriesCount = deliveries.filter(
    (d) => d.status === "ASSIGNED" || d.status === "PICKED_UP_FROM_HUB" || d.status === "EN_ROUTE"
  ).length;

  const navItems = [
    {
      label: "ডেলিভারি",
      href: "/deliveries",
      icon: Package,
      badge: activeDeliveriesCount > 0 ? activeDeliveriesCount : undefined,
    },
    {
      label: "ক্যাশ সামারি",
      href: "/cash-summary",
      icon: DollarSign,
    },
    {
      label: "প্রোফাইল",
      href: "/profile",
      icon: User,
    },
  ];

  return (
    <nav
      style={{
        position: "fixed",
        bottom: 0,
        left: "50%",
        transform: "translateX(-50%)",
        width: "100%",
        maxWidth: "500px",
        height: "65px",
        background: "var(--rider-surface)",
        borderTop: "1px solid var(--border-subtle)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-around",
        zIndex: 100,
        boxShadow: "0 -2px 10px rgba(0, 0, 0, 0.05)",
      }}
    >
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href || (item.href === "/deliveries" && (pathname === "/" || pathname.startsWith("/order")));

        return (
          <Link
            key={item.href}
            href={item.href}
            style={{
              flex: 1,
              height: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "4px",
              color: isActive ? "var(--primary)" : "var(--text-muted)",
              position: "relative",
              fontSize: "0.75rem",
              fontWeight: isActive ? 800 : 600,
            }}
          >
            <div style={{ position: "relative" }}>
              <Icon size={20} color={isActive ? "var(--primary)" : "currentColor"} />
              {item.badge && (
                <span
                  style={{
                    position: "absolute",
                    top: "-4px",
                    right: "-8px",
                    background: "var(--accent)",
                    color: "#FFF",
                    fontSize: "0.65rem",
                    fontWeight: 800,
                    width: "16px",
                    height: "16px",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {item.badge}
                </span>
              )}
            </div>
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
