"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Warehouse,
  ShoppingBag,
  DollarSign,
  Palette,
  Star,
  ExternalLink,
  Store,
} from "lucide-react";
import { useVendor } from "@/context/VendorContext";

export function VendorSidebar() {
  const pathname = usePathname();
  const { currentVendor, orders, products } = useVendor();

  const pendingOrdersCount = orders.filter((o) => o.status === "PREPARING").length;
  const lowStockCount = products.filter((p) => p.stock <= p.lowStockAlert).length;

  const navItems = [
    { label: "ড্যাশবোর্ড (Dashboard)", href: "/dashboard", icon: LayoutDashboard },
    { label: "আমার পণ্যসমূহ (Products)", href: "/products", icon: Package },
    { label: "স্টক ও ইনভেন্টরি (Stock)", href: "/inventory", icon: Warehouse, badge: lowStockCount > 0 ? `${lowStockCount} Low` : undefined, badgeColor: "var(--danger)" },
    { label: "অর্ডার ফুলফিলমেন্ট (Orders)", href: "/orders", icon: ShoppingBag, badge: pendingOrdersCount > 0 ? `${pendingOrdersCount}` : undefined, badgeColor: "var(--accent)" },
    { label: "পে-আউট ও আয় (Payouts)", href: "/payouts", icon: DollarSign },
    { label: "শপ প্রোফাইল কাস্টমাইজার", href: "/shop-profile", icon: Palette },
    { label: "গ্রাহক রিভিউ ও রেটিং", href: "/reviews", icon: Star },
  ];

  return (
    <aside
      style={{
        width: "260px",
        background: "var(--vendor-sidebar)",
        color: "#FFFFFF",
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        position: "sticky",
        top: 0,
        flexShrink: 0,
        zIndex: 100,
        boxShadow: "2px 0 10px rgba(0,0,0,0.15)",
      }}
    >
      {/* Brand Header */}
      <div
        style={{
          padding: "20px 18px",
          display: "flex",
          alignItems: "center",
          gap: "10px",
          borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
        }}
      >
        <div
          style={{
            width: "38px",
            height: "38px",
            borderRadius: "var(--radius-md)",
            background: "var(--primary)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#FFF",
          }}
        >
          <Store size={22} />
        </div>
        <div>
          <div style={{ fontWeight: 800, fontSize: "1rem", color: "#FFF", lineHeight: 1.1 }}>
            {currentVendor.nameBn}
          </div>
          <div style={{ fontSize: "0.7rem", color: "#A7F3D0", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            VENDOR PORTAL
          </div>
        </div>
      </div>

      {/* Nav List */}
      <nav style={{ flex: 1, overflowY: "auto", padding: "14px 10px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href === "/dashboard" && pathname === "/");

            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "10px 12px",
                  borderRadius: "var(--radius-md)",
                  fontSize: "0.85rem",
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? "#FFFFFF" : "#A7F3D0",
                  background: isActive ? "var(--vendor-sidebar-active)" : "transparent",
                  transition: "all 0.15s ease",
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = "var(--vendor-sidebar-hover)";
                    e.currentTarget.style.color = "#FFFFFF";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = "#A7F3D0";
                  }
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <Icon size={18} color={isActive ? "#34D399" : "currentColor"} />
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    style={{
                      background: item.badgeColor || "var(--primary)",
                      color: "#FFFFFF",
                      fontSize: "0.68rem",
                      fontWeight: 800,
                      padding: "2px 6px",
                      borderRadius: "999px",
                    }}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Live Storefront Public Shop Link */}
      <div style={{ padding: "14px 16px", borderTop: "1px solid rgba(255, 255, 255, 0.1)", background: "rgba(0, 0, 0, 0.2)" }}>
        <a
          href={`http://localhost:3000/shop/${currentVendor.slug}`}
          target="_blank"
          rel="noreferrer"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: "0.8rem",
            color: "#6EE7B7",
            fontWeight: 700,
          }}
        >
          <span>পাবলিক শপ প্রিভিউ</span>
          <ExternalLink size={14} />
        </a>
      </div>
    </aside>
  );
}
