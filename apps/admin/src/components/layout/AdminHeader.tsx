"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search, Bell, ExternalLink, Shield, X,
  ShoppingBag, Package, AlertTriangle,
  ChevronDown, Clock, Zap, LogOut,
} from "lucide-react";
import { useAdmin } from "@/context/AdminContext";
import { AdminRole } from "@/types";

export function AdminHeader() {
  const router = useRouter();
  const { currentUser, setCurrentRole, vendors, orders, products } = useAdmin();
  const [showNotifs, setShowNotifs] = useState(false);
  const [showRole, setShowRole]     = useState(false);
  const [searchQ, setSearchQ]       = useState("");
  const [timeStr, setTimeStr]       = useState("");
  const notifsRef = useRef<HTMLDivElement>(null);
  const roleRef   = useRef<HTMLDivElement>(null);

  const pendingOrders  = orders.filter(o => o.status === "PENDING" || o.status === "CONFIRMED").length;
  const pendingVendors = vendors.filter(v => v.status === "PENDING").length;
  const lowStock       = products.filter(p => p.stock <= p.lowStockAlert).length;
  const totalBadge     = pendingOrders + pendingVendors + lowStock;

  useEffect(() => {
    const update = () => setTimeStr(new Date().toLocaleTimeString("en-BD", {
      hour: "2-digit", minute: "2-digit", timeZone: "Asia/Dhaka",
    }));
    update();
    const id = setInterval(update, 60000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifsRef.current && !notifsRef.current.contains(e.target as Node)) setShowNotifs(false);
      if (roleRef.current && !roleRef.current.contains(e.target as Node)) setShowRole(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQ.trim()) {
      router.push(`/orders?search=${encodeURIComponent(searchQ.trim())}`);
      setSearchQ("");
    }
  };

  const ROLES: { value: AdminRole; label: string; icon: string }[] = [
    { value: "SUPER_ADMIN",         label: "Super Admin",          icon: "👑" },
    { value: "MANAGER",             label: "Store Manager",        icon: "👔" },
    { value: "INVENTORY_STAFF",     label: "Inventory Staff",      icon: "📦" },
    { value: "SUPPORT_STAFF",       label: "Support Staff",        icon: "🎧" },
    { value: "DELIVERY_COORDINATOR",label: "Delivery Coordinator", icon: "🛵" },
  ];
  const currentRoleObj = ROLES.find(r => r.value === currentUser.role) ?? ROLES[0]!;

  return (
    <header style={{
      background: "var(--bg-surface)",
      borderBottom: "1px solid var(--border-1)",
      padding: "10px 24px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: "16px",
      position: "sticky",
      top: 0,
      zIndex: 90,
      backdropFilter: "blur(12px)",
    }}>

      {/* ── Global Search ──────────────────────────────────── */}
      <form onSubmit={handleSearch} style={{ flex: 1, maxWidth: "380px" }}>
        <div className="search-wrap">
          <Search size={15} className="search-icon" />
          <input
            className="search-input"
            type="text"
            placeholder="Order ID, Customer দিয়ে search করুন..."
            value={searchQ}
            onChange={e => setSearchQ(e.target.value)}
          />
        </div>
      </form>

      {/* ── Right Controls ─────────────────────────────────── */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>

        {/* Live Clock */}
        <div style={{
          display: "flex", alignItems: "center", gap: "6px",
          padding: "6px 12px",
          background: "var(--bg-raised)",
          border: "1px solid var(--border-1)",
          borderRadius: "var(--r-md)",
          fontSize: "0.8rem", color: "var(--text-2)",
          fontFamily: "var(--font-mono)",
        }}>
          <Clock size={13} style={{ color: "var(--green)" }} />
          <span>{timeStr}</span>
          <span style={{ color: "var(--text-4)", fontSize: "0.72rem" }}>BDT</span>
        </div>

        {/* Role Switcher */}
        <div ref={roleRef} style={{ position: "relative" }}>
          <button
            onClick={() => setShowRole(!showRole)}
            style={{
              display: "flex", alignItems: "center", gap: "7px",
              padding: "6px 12px",
              background: "var(--green-glass)",
              border: "1px solid var(--border-green)",
              borderRadius: "var(--r-md)",
              color: "var(--green)",
              fontSize: "0.8rem", fontWeight: 700,
              cursor: "pointer", fontFamily: "var(--font)",
            }}
          >
            <Shield size={13} />
            <span>{currentRoleObj.icon} {currentRoleObj.label}</span>
            <ChevronDown size={12} style={{ opacity: 0.7 }} />
          </button>
          {showRole && (
            <div style={{
              position: "absolute", top: "calc(100% + 8px)", right: 0,
              background: "var(--bg-surface)",
              border: "1px solid var(--border-2)",
              borderRadius: "var(--r-lg)",
              boxShadow: "var(--shadow-lg)",
              padding: "6px",
              width: "220px",
              zIndex: 200,
              animation: "fadeOverlay 0.15s ease",
            }}>
              {ROLES.map(r => (
                <button
                  key={r.value}
                  onClick={() => { setCurrentRole(r.value); setShowRole(false); }}
                  style={{
                    width: "100%", display: "flex", alignItems: "center", gap: "8px",
                    padding: "8px 12px", borderRadius: "var(--r-md)",
                    background: r.value === currentUser.role ? "var(--green-glass)" : "transparent",
                    color: r.value === currentUser.role ? "var(--green)" : "var(--text-2)",
                    border: "none", cursor: "pointer",
                    fontSize: "0.83rem", fontWeight: r.value === currentUser.role ? 700 : 500,
                    textAlign: "left", fontFamily: "var(--font)",
                    transition: "all var(--t-fast)",
                  }}
                  onMouseEnter={e => { if (r.value !== currentUser.role) e.currentTarget.style.background = "var(--bg-hover)"; }}
                  onMouseLeave={e => { if (r.value !== currentUser.role) e.currentTarget.style.background = "transparent"; }}
                >
                  <span>{r.icon}</span>
                  <span>{r.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Live Storefront Link */}
        <a
          href="http://localhost:3000"
          target="_blank"
          rel="noreferrer"
          className="admin-btn admin-btn-ghost"
          style={{ fontSize: "0.8rem", gap: "5px" }}
        >
          <span>স্টোরফ্রন্ট</span>
          <ExternalLink size={13} />
        </a>

        {/* Notifications */}
        <div ref={notifsRef} style={{ position: "relative" }}>
          <button
            onClick={() => setShowNotifs(!showNotifs)}
            style={{
              position: "relative",
              padding: "8px",
              background: "var(--bg-raised)",
              border: "1px solid var(--border-1)",
              borderRadius: "var(--r-md)",
              color: "var(--text-2)",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer",
              transition: "all var(--t-fast)",
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--border-2)"; e.currentTarget.style.color = "var(--text-1)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border-1)"; e.currentTarget.style.color = "var(--text-2)"; }}
          >
            <Bell size={17} />
            {totalBadge > 0 && (
              <span style={{
                position: "absolute", top: "-5px", right: "-5px",
                width: "18px", height: "18px", borderRadius: "50%",
                background: "var(--red)", color: "#fff",
                fontSize: "0.65rem", fontWeight: 800,
                display: "flex", alignItems: "center", justifyContent: "center",
                border: "2px solid var(--bg-deep)",
                animation: "livePulseRed 2s infinite",
              }}>
                {totalBadge}
              </span>
            )}
          </button>

          {showNotifs && (
            <div style={{
              position: "absolute", top: "calc(100% + 10px)", right: 0,
              width: "300px",
              background: "var(--bg-surface)",
              border: "1px solid var(--border-2)",
              borderRadius: "var(--r-lg)",
              boxShadow: "var(--shadow-lg)",
              padding: "0",
              zIndex: 200,
              overflow: "hidden",
              animation: "fadeOverlay 0.18s ease",
            }}>
              <div style={{
                padding: "14px 16px",
                borderBottom: "1px solid var(--border-1)",
                display: "flex", alignItems: "center", justifyContent: "space-between",
              }}>
                <div style={{ fontWeight: 700, fontSize: "0.875rem", color: "var(--text-1)" }}>
                  Notifications ({totalBadge})
                </div>
                <button onClick={() => setShowNotifs(false)} style={{ color: "var(--text-3)", padding: "2px" }}>
                  <X size={14} />
                </button>
              </div>
              <div style={{ padding: "8px", display: "flex", flexDirection: "column", gap: "4px" }}>
                {pendingOrders > 0 && (
                  <Link href="/orders" onClick={() => setShowNotifs(false)} style={{
                    display: "flex", alignItems: "center", gap: "10px",
                    padding: "10px 12px", borderRadius: "var(--r-md)",
                    background: "var(--blue-glass)", border: "1px solid rgba(59,130,246,0.2)",
                    color: "var(--blue)", fontSize: "0.82rem",
                  }}>
                    <ShoppingBag size={15} style={{ flexShrink: 0 }} />
                    <span><strong>{pendingOrders}</strong> টি অর্ডার নিশ্চিতকরণের অপেক্ষায়</span>
                  </Link>
                )}
                {pendingVendors > 0 && (
                  <Link href="/vendors" onClick={() => setShowNotifs(false)} style={{
                    display: "flex", alignItems: "center", gap: "10px",
                    padding: "10px 12px", borderRadius: "var(--r-md)",
                    background: "var(--amber-glass)", border: "1px solid rgba(245,158,11,0.2)",
                    color: "var(--amber)", fontSize: "0.82rem",
                  }}>
                    <Zap size={15} style={{ flexShrink: 0 }} />
                    <span><strong>{pendingVendors}</strong> ভেন্ডর অনুমোদনের অপেক্ষায়</span>
                  </Link>
                )}
                {lowStock > 0 && (
                  <Link href="/inventory" onClick={() => setShowNotifs(false)} style={{
                    display: "flex", alignItems: "center", gap: "10px",
                    padding: "10px 12px", borderRadius: "var(--r-md)",
                    background: "var(--red-glass)", border: "1px solid rgba(239,68,68,0.2)",
                    color: "var(--red)", fontSize: "0.82rem",
                  }}>
                    <AlertTriangle size={15} style={{ flexShrink: 0 }} />
                    <span><strong>{lowStock}</strong> পণ্যের স্টক কম</span>
                  </Link>
                )}
                {totalBadge === 0 && (
                  <div style={{ padding: "16px", textAlign: "center", color: "var(--text-3)", fontSize: "0.82rem" }}>
                    ✅ সব কিছু ঠিক আছে!
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Admin Avatar */}
        <div style={{
          display: "flex", alignItems: "center", gap: "10px",
          paddingLeft: "10px",
          borderLeft: "1px solid var(--border-1)",
        }}>
          <div style={{
            width: "34px", height: "34px", borderRadius: "50%",
            background: "linear-gradient(135deg, #22C55E, #0EA472)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff", fontWeight: 800, fontSize: "0.88rem",
            boxShadow: "0 0 12px rgba(34,197,94,0.35)",
            flexShrink: 0,
          }}>
            {currentUser.name.charAt(0)}
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: "0.82rem", color: "var(--text-1)", lineHeight: 1.2 }}>
              Admin
            </div>
            <div style={{ fontSize: "0.68rem", color: "var(--text-3)" }}>
              {currentUser.role.replace("_", " ")}
            </div>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={() => {
            if (typeof window !== "undefined") {
              localStorage.removeItem("tatka_admin_token");
            }
            router.push("/login");
          }}
          title="লগআউট করুন"
          style={{
            padding: "8px",
            background: "var(--bg-raised)",
            border: "1px solid var(--border-1)",
            borderRadius: "var(--r-md)",
            color: "var(--text-3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            transition: "all var(--t-fast)",
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = "var(--red)";
            e.currentTarget.style.color = "var(--red)";
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = "var(--border-1)";
            e.currentTarget.style.color = "var(--text-3)";
          }}
        >
          <LogOut size={16} />
        </button>

      </div>
    </header>
  );
}
