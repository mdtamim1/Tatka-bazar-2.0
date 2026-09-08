"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, ShoppingBag, Package, FolderTree, Warehouse,
  Store, Building2, Bike, Users, MapPin, Tag, Star, BarChart3,
  Settings, History, Zap, Radio, UserCog, LogOut, ChevronRight,
  ShoppingCart,
} from "lucide-react";
import { useAdmin } from "@/context/AdminContext";

const NAV = [
  {
    title: "CORE",
    items: [
      { label: "Dashboard",        href: "/dashboard",  icon: LayoutDashboard },
      { label: "Live Dispatch",    href: "/dispatch",   icon: Radio,       badge: "live", badgeColor: "green" },
      { label: "Orders",           href: "/orders",     icon: ShoppingBag, badgeKey: "pendingOrders" },
    ],
  },
  {
    title: "STOREFRONT CONTROL",
    items: [
      { label: "Products",         href: "/products",   icon: Package,    badgeKey: "lowStock" },
      { label: "Categories",       href: "/categories", icon: FolderTree },
      { label: "Inventory",        href: "/inventory",  icon: Warehouse,  badgeKey: "lowStock" },
    ],
  },
  {
    title: "PEOPLE",
    items: [
      { label: "Vendors",          href: "/vendors",    icon: Store,       badgeKey: "pendingVendors" },
      { label: "B2B Accounts",     href: "/b2b",        icon: Building2,   badgeKey: "pendingB2B" },
      { label: "Riders",           href: "/riders",     icon: Bike,        badgeKey: "pendingRiders" },
      { label: "Customers",        href: "/customers",  icon: Users },
    ],
  },
  {
    title: "OPERATIONS",
    items: [
      { label: "Branches",         href: "/branches",   icon: MapPin },
      { label: "Marketing",        href: "/marketing",  icon: Tag },
      { label: "Reviews",          href: "/reviews",    icon: Star,        badgeKey: "pendingReviews" },
      { label: "Reports",          href: "/reports",    icon: BarChart3 },
    ],
  },
  {
    title: "ADMIN",
    items: [
      { label: "Staff",            href: "/staff",      icon: UserCog,     badgeKey: "pendingStaff" },
      { label: "Settings",         href: "/settings",   icon: Settings },
      { label: "Audit Log",        href: "/audit",      icon: History },
    ],
  },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { vendors, b2bAccounts, riders, products, orders, reviews, staff } = useAdmin();
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

  const badges: Record<string, number | string> = {
    pendingOrders:  orders.filter((o) => o.status === "PENDING").length,
    pendingVendors: vendors.filter((v) => v.status === "PENDING").length,
    pendingB2B:     b2bAccounts.filter((b) => b.status === "PENDING").length,
    pendingRiders:  riders.filter((r) => r.status === "PENDING").length,
    lowStock:       products.filter((p) => p.stock <= p.lowStockAlert).length,
    pendingReviews: reviews.filter((r) => r.status === "PENDING").length,
    pendingStaff:   staff.filter((s) => s.status === "PENDING").length,
  };

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("tatka_admin_token");
      window.location.href = "/login";
    }
  };

  // Determine current user initials for avatar
  const { currentUser } = useAdmin();
  const initials = currentUser.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  return (
    <aside className="admin-sidebar">

      {/* Brand */}
      <div className="sidebar-brand">
        <div className="sidebar-brand-logo">
          <Zap size={18} />
        </div>
        <div className="sidebar-brand-text">
          <div className="sidebar-brand-name">Tatka Bazar</div>
          <div className="sidebar-brand-sub">Control Panel</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="sidebar-nav">
        {NAV.map((section) => (
          <div key={section.title}>
            <div className="sidebar-section-title">{section.title}</div>
            {section.items.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
              const badgeVal = item.badgeKey ? badges[item.badgeKey] : item.badge;
              const showBadge = badgeVal !== undefined && badgeVal !== 0 && badgeVal !== "";

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`sidebar-link ${isActive ? "active" : ""}`}
                >
                  <span className="sidebar-link-icon">
                    <Icon size={15} />
                  </span>
                  <span>{item.label}</span>
                  {showBadge && (
                    <span className={`sidebar-badge ${item.badgeColor === "green" ? "green" : typeof badgeVal === "number" && badgeVal > 0 ? "" : ""}`}>
                      {badgeVal === "live" ? "LIVE" : badgeVal}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Bottom: Time + User + Logout */}
      <div className="sidebar-bottom">
        <div className="sidebar-clock">
          🇧🇩 BD · {time}
        </div>
        <div style={{ marginTop: "8px" }}>
          <div className="sidebar-user">
            <div className="sidebar-user-avatar">{initials}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="sidebar-user-name truncate">{currentUser.name}</div>
              <div className="sidebar-user-role">
                {currentUser.role.replace(/_/g, " ")}
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="sidebar-link"
            style={{
              width: "100%",
              marginTop: "4px",
              color: "var(--red)",
              borderColor: "transparent",
            }}
          >
            <span className="sidebar-link-icon"><LogOut size={14} /></span>
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
