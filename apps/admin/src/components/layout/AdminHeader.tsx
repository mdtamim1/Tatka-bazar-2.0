"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";

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

  // Build breadcrumb
  const segments = pathname.split("/").filter(Boolean);
  const currentPage = PAGE_MAP[`/${segments[0]}`] || segments[0] || "Dashboard";
  const subPage = segments[1] ? `#${segments[1].substring(0, 8).toUpperCase()}` : null;

  return (
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
  );
}
