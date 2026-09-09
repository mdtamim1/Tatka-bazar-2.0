"use client";

import React, { useState } from "react";
import { Menu } from "lucide-react";
import { useVendorStore } from "@/store/vendorStore";
import { translations } from "@/utils/translations";

function BellIcon() {
  return (
    <svg fill="none" viewBox="0 0 24 24" style={{ width: 18, height: 18, stroke: "currentColor" }}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg fill="none" viewBox="0 0 24 24" style={{ width: 15, height: 15, stroke: "currentColor" }}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
    </svg>
  );
}

interface VendorHeaderProps {
  onToggleMobileSidebar: () => void;
  onOpenNotifications: () => void;
  onOpenRoleModal?: () => void;
  onOpenShortcuts?: () => void;
}

export default function VendorHeader({
  onToggleMobileSidebar,
  onOpenNotifications,
  onOpenRoleModal,
}: VendorHeaderProps) {
  const {
    language,
    profile,
    dutyStatus,
    setDutyStatus,
    notifications,
  } = useVendorStore();

  const unreadNotifs = notifications.filter((n) => !n.read).length;

  const toggleDuty = () => {
    const next = dutyStatus === "STORE_OPEN" ? "STORE_CLOSED" : "STORE_OPEN";
    setDutyStatus(next);
  };

  const storeDisplayName = language === "bn" 
    ? (profile.storeNameBn || profile.storeName || "তাতকা ভেন্ডর")
    : (profile.storeName || "Tatka Vendor");

  return (
    <div>
      {/* Top Header - Rider Portal Design */}
      <header className="top-header">
        <div className="header-logo">
          <button
            onClick={onToggleMobileSidebar}
            className="lg:hidden p-1.5 -ml-2 text-slate-400 hover:text-white rounded-lg transition-colors"
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>

          <div className="header-logo-mark" title="Tatka Bazar Vendor" style={{ background: "linear-gradient(135deg, #22C55E, #16A34A)", boxShadow: "0 4px 12px rgba(34,197,94,.3)" }}>
            🏪
          </div>
          <div>
            <div className="header-title">Tatka Vendor</div>
            <div className="header-subtitle bn">
              স্বাগতম, {storeDisplayName.split(" ")[0]}!
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>

          {/* Central Support Chat Button */}
          <button
            id="support-chat-btn"
            type="button"
            onClick={() => alert("তাতকা সেন্ট্রাল সাপোর্ট: 01700-000000")}
            className="support-btn"
            style={{
              background: "rgba(34, 197, 94, 0.12)",
              border: "1px solid rgba(34, 197, 94, 0.35)",
              color: "#22c55e",
            }}
            title="তাতকা সেন্ট্রাল সাপোর্ট চ্যাট"
          >
            💬 সাপোর্ট
          </button>

          {/* Notifications Button with unread badge */}
          <button
            id="notifications-btn"
            aria-label="নোটিফিকেশন"
            onClick={onOpenNotifications}
            style={{
              position: "relative",
              background: "var(--bg-card)",
              border: "1px solid var(--border-1)",
              borderRadius: "50%",
              width: 38,
              height: 38,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "var(--text-2)",
              flexShrink: 0,
            }}
          >
            <BellIcon />
            {unreadNotifs > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: -4,
                  right: -4,
                  background: "#ef4444",
                  color: "#fff",
                  borderRadius: "999px",
                  fontSize: ".6rem",
                  fontWeight: 800,
                  minWidth: 18,
                  height: 18,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "0 4px",
                  lineHeight: 1,
                  border: "2px solid var(--bg-void)",
                }}
              >
                {unreadNotifs > 9 ? "9+" : unreadNotifs}
              </span>
            )}
          </button>

          {/* Helpline Call */}
          <a href="tel:+8801700000000" className="support-btn" title="হেল্পলাইনে কল করুন">
            <PhoneIcon />
            <span className="hidden sm:inline">কল</span>
          </a>
        </div>
      </header>

      {/* Duty Status Bar (Online/Offline Switch + Store Status Indicator + Sound Test) */}
      <div className="duty-switch-bar">
        <div className="duty-toggle-group">
          <div
            id="duty-status-toggle"
            className={`duty-status-pill ${dutyStatus === "STORE_OPEN" ? "online" : "offline"}`}
            onClick={toggleDuty}
            title="অন/অফ-ডিউটি পরিবর্তন করুন"
          >
            <div className="duty-pulse-dot" />
            <span>
              {dutyStatus === "STORE_OPEN" ? "🟢 দোকান খোলা (সক্রিয়)" : "⚪ দোকান বন্ধ (বিশ্রামে)"}
            </span>
            <span style={{ fontSize: ".68rem", opacity: 0.75, marginLeft: 2 }}>
              {dutyStatus === "STORE_OPEN" ? "• টগল" : "• চালু করুন"}
            </span>
          </div>

          {/* Live Store Indicator */}
          {dutyStatus === "STORE_OPEN" && (
            <div
              title="লাইভ স্টোর সক্রিয় — ক্রেতা ও রাইডার আপনার স্টোর ও পণ্য দেখতে পাচ্ছেন"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                padding: "4px 10px",
                borderRadius: 999,
                background: "rgba(34, 197, 94, 0.1)",
                border: "1px solid rgba(34, 197, 94, 0.35)",
                fontSize: ".68rem",
                fontWeight: 700,
                color: "#22c55e",
                animation: "gps-blink 2s ease-in-out infinite",
              }}
            >
              <span style={{ fontSize: 11 }}>🏪</span>
              <span>STORE LIVE</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
