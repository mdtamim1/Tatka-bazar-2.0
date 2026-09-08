"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { ChevronRight, ShoppingBag, MapPin } from "lucide-react";
import { useAdmin } from "@/context/AdminContext";

const PAGE_MAP: Record<string, string> = {
  "/dashboard":  "Dashboard",
  "/dispatch":   "Live Dispatch",
  "/orders":     "Orders",
  "/products":   "Products",
  "/categories": "Categories",
  "/inventory":  "Inventory",
  "/vendors":    "Vendors",
  "/b2b":        "B2B Accounts",
  "/riders":     "Riders",
  "/customers":  "Customers",
  "/branches":   "Branches",
  "/marketing":  "Marketing",
  "/reviews":    "Reviews",
  "/reports":    "Reports",
  "/staff":      "Staff",
  "/settings":   "Settings",
  "/audit":      "Audit Log",
};

export function AdminHeader() {
  const pathname = usePathname();
  const { newOrderAlert, dismissAlert } = useAdmin();

  // Build breadcrumb
  const segments = pathname.split("/").filter(Boolean);
  const currentPage = PAGE_MAP[`/${segments[0]}`] || segments[0] || "Dashboard";
  const subPage = segments[1] ? `#${segments[1].substring(0, 8).toUpperCase()}` : null;

  return (
    <>
      <header className="admin-header">
        {/* Breadcrumb */}
        <div className="header-breadcrumb">
          <span className="header-breadcrumb-item">Admin</span>
          <ChevronRight size={12} className="header-breadcrumb-sep" />
          <span className="header-breadcrumb-current">{currentPage}</span>
          {subPage && (
            <>
              <ChevronRight size={12} style={{ color: "var(--text-4)", fontSize: "0.72rem" }} />
              <span className="mono" style={{ fontSize: "0.78rem" }}>{subPage}</span>
            </>
          )}
        </div>

      </header>

      {/* New Order Toast Alert */}
      {newOrderAlert && (
        <div className="new-order-toast" onClick={dismissAlert}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
            <div style={{
              width: "38px", height: "38px",
              borderRadius: "var(--r-md)",
              background: "var(--amber-glass)",
              border: "1px solid var(--border-amber)",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}>
              <ShoppingBag size={18} color="var(--amber)" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "3px" }}>
                <div className="live-dot amber" />
                <span style={{ fontSize: "0.72rem", fontWeight: 800, color: "var(--amber)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  New Order
                </span>
              </div>
              <div style={{ fontWeight: 700, fontSize: "0.875rem", color: "var(--text-0)" }}>
                #{newOrderAlert.orderNumber}
              </div>
              <div style={{ display: "flex", gap: "10px", marginTop: "4px" }}>
                <span style={{ fontSize: "0.75rem", color: "var(--text-3)", display: "flex", alignItems: "center", gap: "4px" }}>
                  <MapPin size={10} /> {newOrderAlert.area}
                </span>
                <span className="mono" style={{ fontSize: "0.78rem", color: "var(--green)" }}>
                  ৳{newOrderAlert.totalAmount.toLocaleString()}
                </span>
              </div>
              <div style={{ fontSize: "0.72rem", color: "var(--text-3)", marginTop: "6px" }}>
                {newOrderAlert.customerName} · Click to dismiss
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
