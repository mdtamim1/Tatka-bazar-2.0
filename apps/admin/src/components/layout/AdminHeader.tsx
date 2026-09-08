"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import {
  Bell, BellRing, Volume2, VolumeX, Search, RefreshCw,
  ChevronRight, X, ShoppingBag, MapPin, Clock,
} from "lucide-react";
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
  const { newOrderAlert, dismissAlert, playTestSound, orders } = useAdmin();
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showSearch, setShowSearch] = useState(false);

  const pendingCount = orders.filter((o) => o.status === "PENDING").length;

  // Build breadcrumb
  const segments = pathname.split("/").filter(Boolean);
  const currentPage = PAGE_MAP[`/${segments[0]}`] || segments[0] || "Dashboard";
  const subPage = segments[1] ? `#${segments[1].substring(0, 8).toUpperCase()}` : null;

  const toggleSound = () => {
    setSoundEnabled((v) => !v);
    if (!soundEnabled) playTestSound();
  };

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

        {/* Actions */}
        <div className="header-actions">
          {/* Search toggle */}
          <button
            className="header-icon-btn"
            onClick={() => setShowSearch((v) => !v)}
            title="Search"
          >
            <Search size={15} />
          </button>

          {/* Sound toggle */}
          <button
            className="header-icon-btn"
            onClick={toggleSound}
            title={soundEnabled ? "Mute alerts" : "Enable alerts"}
          >
            {soundEnabled ? <Volume2 size={15} /> : <VolumeX size={15} color="var(--red)" />}
          </button>

          {/* Pending orders bell */}
          <button
            className="header-icon-btn"
            onClick={() => { if (typeof window !== "undefined") window.location.href = "/dispatch"; }}
            title={`${pendingCount} pending orders`}
          >
            {pendingCount > 0 ? <BellRing size={15} color="var(--amber)" /> : <Bell size={15} />}
            {pendingCount > 0 && <span className="notif-dot" />}
          </button>

          {/* Refresh */}
          <button
            className="header-icon-btn"
            onClick={() => window.location.reload()}
            title="Refresh data"
          >
            <RefreshCw size={15} />
          </button>
        </div>
      </header>

      {/* Inline search bar */}
      {showSearch && (
        <div style={{
          position: "fixed",
          top: "60px",
          left: "var(--sidebar-w)",
          right: 0,
          padding: "12px 32px",
          background: "var(--bg-raised)",
          borderBottom: "1px solid var(--border-1)",
          zIndex: 140,
          display: "flex",
          alignItems: "center",
          gap: "12px",
        }}>
          <div className="search-wrap" style={{ flex: 1 }}>
            <Search size={15} className="search-icon" />
            <input
              className="search-input"
              placeholder="Search orders, products, customers, vendors..."
              autoFocus
            />
          </div>
          <button className="admin-btn admin-btn-ghost admin-btn-sm" onClick={() => setShowSearch(false)}>
            <X size={14} /> Close
          </button>
        </div>
      )}

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
