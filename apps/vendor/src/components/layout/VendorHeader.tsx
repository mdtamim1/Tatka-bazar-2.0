"use client";

import React from "react";
import Link from "next/link";
import { Store, CheckCircle, Bell, ExternalLink, ArrowRightLeft } from "lucide-react";
import { useVendor, AVAILABLE_VENDORS } from "@/context/VendorContext";

export function VendorHeader() {
  const { currentVendor, switchVendor, orders } = useVendor();
  const pendingOrders = orders.filter((o) => o.status === "PREPARING").length;

  return (
    <header
      style={{
        background: "var(--vendor-surface)",
        borderBottom: "1px solid var(--border-subtle)",
        padding: "12px 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        position: "sticky",
        top: 0,
        zIndex: 90,
      }}
    >
      {/* Active Shop Status Badge */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#10B981" }} />
          <span style={{ fontWeight: 800, fontSize: "0.95rem", color: "var(--text-main)" }}>
            {currentVendor.nameEn || currentVendor.nameBn}
          </span>
          <span className="status-badge success" style={{ fontSize: "0.7rem" }}>
            ✓ Verified & Active
          </span>
        </div>
      </div>

      {/* Right Controls: Vendor Switcher & Actions */}
      <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
        
        {/* Switch Active Vendor Session */}
        <div style={{ display: "flex", alignItems: "center", gap: "6px", background: "var(--primary-light)", padding: "4px 10px", borderRadius: "var(--radius-md)", border: "1px solid rgba(5, 150, 105, 0.2)" }}>
          <ArrowRightLeft size={14} color="var(--primary)" />
          <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--primary-hover)" }}>Switch Shop:</span>
          <select
            value={currentVendor.id}
            onChange={(e) => switchVendor(e.target.value)}
            style={{
              background: "transparent",
              border: "none",
              color: "var(--primary-hover)",
              fontWeight: 700,
              fontSize: "0.8rem",
              outline: "none",
              cursor: "pointer",
            }}
          >
            {AVAILABLE_VENDORS.map((v) => (
              <option key={v.id} value={v.id}>
                {v.nameEn || v.nameBn}
              </option>
            ))}
          </select>
        </div>

        {/* Public Apply Link */}
        <Link
          href="/apply"
          style={{
            fontSize: "0.8rem",
            fontWeight: 600,
            color: "var(--text-muted)",
            padding: "6px 10px",
            borderRadius: "var(--radius-md)",
            background: "#F1F5F9",
            textDecoration: "none",
          }}
        >
          New Shop Application
        </Link>

        {/* Notifications */}
        <Link
          href="/orders"
          style={{
            position: "relative",
            padding: "8px",
            borderRadius: "50%",
            background: "#F1F5F9",
            color: "var(--text-main)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          title="Orders"
        >
          <Bell size={18} />
          {pendingOrders > 0 && (
            <span
              style={{
                position: "absolute",
                top: "-2px",
                right: "-2px",
                width: "18px",
                height: "18px",
                borderRadius: "50%",
                background: "var(--accent)",
                color: "#FFF",
                fontSize: "0.68rem",
                fontWeight: 800,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {pendingOrders}
            </span>
          )}
        </Link>

        {/* Profile Avatar */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", borderLeft: "1px solid var(--border-subtle)", paddingLeft: "12px" }}>
          <img
            src={currentVendor.logo}
            alt="Logo"
            style={{ width: "34px", height: "34px", borderRadius: "var(--radius-sm)", objectFit: "cover" }}
          />
          <div>
            <div style={{ fontSize: "0.82rem", fontWeight: 700 }}>{currentVendor.contactName}</div>
            <div style={{ fontSize: "0.68rem", color: "var(--text-muted)" }}>Vendor Partner</div>
          </div>
        </div>

      </div>
    </header>
  );
}
