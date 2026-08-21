"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Package, FolderTree, Warehouse,
  ShoppingBag, Store, Building2, Bike, Users,
  MapPin, Tag, Star, BarChart3, Settings, History,
  ChevronRight, Zap,
} from "lucide-react";
import { useAdmin } from "@/context/AdminContext";

const NAV_SECTIONS = [
  {
    title: "CORE",
    items: [
      { label: "Dashboard", labelBn: "ড্যাশবোর্ড", href: "/dashboard", icon: LayoutDashboard },
      { label: "Orders", labelBn: "অর্ডারসমূহ", href: "/orders", icon: ShoppingBag, badgeKey: "pendingOrders" },
    ],
  },
  {
    title: "CATALOG",
    items: [
      { label: "Products", labelBn: "পণ্য", href: "/products", icon: Package, badgeKey: "lowStock" },
      { label: "Categories", labelBn: "ক্যাটাগরি", href: "/categories", icon: FolderTree },
      { label: "Inventory", labelBn: "ইনভেন্টরি", href: "/inventory", icon: Warehouse, badgeKey: "lowStock" },
    ],
  },
  {
    title: "PEOPLE",
    items: [
      { label: "Vendors", labelBn: "ভেন্ডর", href: "/vendors", icon: Store, badgeKey: "pendingVendors" },
      { label: "B2B Accounts", labelBn: "B2B হোলসেল", href: "/b2b", icon: Building2, badgeKey: "pendingB2B" },
      { label: "Riders", labelBn: "রাইডার টিম", href: "/riders", icon: Bike, badgeKey: "pendingRiders" },
      { label: "Customers", labelBn: "গ্রাহকবৃন্দ", href: "/customers", icon: Users },
    ],
  },
  {
    title: "OPERATIONS",
    items: [
      { label: "Branches", labelBn: "হাব ও ব্রাঞ্চ", href: "/branches", icon: MapPin },
      { label: "Marketing", labelBn: "মার্কেটিং", href: "/marketing", icon: Tag },
      { label: "Reviews", labelBn: "রিভিউ", href: "/reviews", icon: Star },
      { label: "Reports", labelBn: "রিপোর্ট", href: "/reports", icon: BarChart3 },
      { label: "Settings", labelBn: "সেটিংস", href: "/settings", icon: Settings },
      { label: "Audit Log", labelBn: "অডিট লগ", href: "/audit", icon: History },
    ],
  },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { vendors, b2bAccounts, riders, products, orders } = useAdmin();
  const [time, setTime] = useState("");

  useEffect(() => {
    const update = () => {
      setTime(new Date().toLocaleTimeString("en-BD", {
        hour: "2-digit", minute: "2-digit", second: "2-digit",
        timeZone: "Asia/Dhaka",
      }));
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  const badges: Record<string, number> = {
    pendingOrders: orders.filter(o => o.status === "PENDING").length,
    pendingVendors: vendors.filter(v => v.status === "PENDING").length,
    pendingB2B: b2bAccounts.filter(b => b.status === "PENDING").length,
    pendingRiders: riders.filter(r => r.status === "PENDING").length,
    lowStock: products.filter(p => p.stock <= p.lowStockAlert).length,
  };

  const activeRiders = riders.filter(r => r.status === "ACTIVE").length;
  const onDelivery = riders.filter(r => r.activeDeliveriesCount > 0).length;

  return (
    <aside style={{
      width: "var(--sidebar-w, 240px)",
      background: "var(--sidebar-bg)",
      borderRight: "1px solid var(--border-1)",
      display: "flex",
      flexDirection: "column",
      height: "100vh",
      position: "sticky",
      top: 0,
      flexShrink: 0,
      zIndex: 100,
      boxShadow: "4px 0 24px rgba(0,0,0,0.4)",
    }}>

      {/* ── Brand ──────────────────────────────────────────── */}
      <div style={{
        padding: "18px 16px",
        borderBottom: "1px solid var(--border-1)",
        display: "flex", alignItems: "center", gap: "12px",
      }}>
        <div style={{
          width: "38px", height: "38px",
          borderRadius: "10px",
          background: "linear-gradient(135deg, #22C55E, #16A34A)",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "#fff", fontWeight: 900, fontSize: "1rem",
          boxShadow: "0 4px 16px rgba(34,197,94,0.4)",
          flexShrink: 0,
          position: "relative",
        }}>
          <Zap size={20} />
          <span style={{
            position: "absolute", top: "-4px", right: "-4px",
            width: "10px", height: "10px",
            background: "#22C55E", borderRadius: "50%",
            border: "2px solid var(--sidebar-bg)",
            animation: "livePulse 2s infinite",
          }} />
        </div>
        <div>
          <div style={{ fontWeight: 800, fontSize: "0.92rem", color: "var(--text-1)", lineHeight: 1.2 }}>
            তাতকা বাজার
          </div>
          <div style={{ fontSize: "0.65rem", color: "var(--green)", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>
            COMMAND CENTER
          </div>
        </div>
      </div>

      {/* ── Navigation ─────────────────────────────────────── */}
      <nav style={{ flex: 1, overflowY: "auto", padding: "12px 10px", scrollbarWidth: "none" }}>
        {NAV_SECTIONS.map((section) => (
          <div key={section.title} style={{ marginBottom: "20px" }}>
            <div style={{
              fontSize: "0.63rem", fontWeight: 700, color: "var(--text-4)",
              letterSpacing: "0.12em", padding: "0 6px",
              marginBottom: "6px", textTransform: "uppercase",
            }}>
              {section.title}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href ||
                  (item.href === "/dashboard" && pathname === "/");
                const badgeCount = item.badgeKey ? (badges[item.badgeKey] ?? 0) : 0;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`sidebar-item ${isActive ? "active" : ""}`}
                  >
                    <Icon size={16} style={{ flexShrink: 0 }} />
                    <span style={{ flex: 1, fontSize: "0.845rem" }}>
                      <span style={{ display: "block" }}>{item.labelBn}</span>
                      <span style={{ display: "block", fontSize: "0.67rem", opacity: 0.55 }}>{item.label}</span>
                    </span>
                    {badgeCount > 0 && (
                      <span style={{
                        background: item.badgeKey === "lowStock" ? "rgba(245,158,11,0.2)" : "rgba(239,68,68,0.15)",
                        color: item.badgeKey === "lowStock" ? "var(--amber)" : "var(--red)",
                        border: `1px solid ${item.badgeKey === "lowStock" ? "rgba(245,158,11,0.35)" : "rgba(239,68,68,0.3)"}`,
                        fontSize: "0.65rem", fontWeight: 800,
                        padding: "1px 6px", borderRadius: "999px",
                        minWidth: "20px", textAlign: "center",
                      }}>
                        {badgeCount}
                      </span>
                    )}
                    {isActive && <ChevronRight size={12} style={{ opacity: 0.5, flexShrink: 0 }} />}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* ── Rider Status Strip ─────────────────────────────── */}
      <div style={{
        margin: "0 10px 10px",
        padding: "12px 14px",
        background: "rgba(34,197,94,0.06)",
        border: "1px solid var(--border-green)",
        borderRadius: "10px",
      }}>
        <div style={{ fontSize: "0.68rem", color: "var(--text-3)", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "8px" }}>
          🛵 Rider Fleet Status
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <div style={{ flex: 1, textAlign: "center" }}>
            <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--green)" }}>{activeRiders}</div>
            <div style={{ fontSize: "0.63rem", color: "var(--text-3)" }}>Active</div>
          </div>
          <div style={{ width: "1px", background: "var(--border-1)" }} />
          <div style={{ flex: 1, textAlign: "center" }}>
            <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--amber)" }}>{onDelivery}</div>
            <div style={{ fontSize: "0.63rem", color: "var(--text-3)" }}>On Route</div>
          </div>
          <div style={{ width: "1px", background: "var(--border-1)" }} />
          <div style={{ flex: 1, textAlign: "center" }}>
            <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--text-1)" }}>{riders.length}</div>
            <div style={{ fontSize: "0.63rem", color: "var(--text-3)" }}>Total</div>
          </div>
        </div>
      </div>

      {/* ── Footer Clock ───────────────────────────────────── */}
      <div style={{
        padding: "12px 16px",
        borderTop: "1px solid var(--border-1)",
        background: "rgba(0,0,0,0.3)",
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--text-2)" }}>
              admin@tatkabazar.com
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "0.68rem", color: "var(--green)", marginTop: "2px" }}>
              <span className="live-dot" />
              সার্ভার অনলাইন
            </div>
          </div>
          <div style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.78rem",
            color: "var(--text-3)",
            background: "var(--bg-raised)",
            padding: "4px 8px",
            borderRadius: "6px",
            border: "1px solid var(--border-1)",
          }}>
            {time}
          </div>
        </div>
      </div>
    </aside>
  );
}
