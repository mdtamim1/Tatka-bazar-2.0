"use client";
import React, { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  Bike, Store, ShoppingBag, Clock, CheckCircle2,
  ArrowUpRight, AlertTriangle, Zap, TrendingUp,
  RefreshCw, Activity, CreditCard, FileCheck,
} from "lucide-react";
import type { HubRider, HubVendor, RiderDepositRequest, VendorSettlementRequest } from "@/types/hub";

function timeAgo(ts: string) {
  const diff = Date.now() - new Date(ts).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "Just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function DashboardPage() {
  const { session } = useAuth();
  const [riders, setRiders] = useState<HubRider[]>([]);
  const [vendors, setVendors] = useState<HubVendor[]>([]);
  const [deposits, setDeposits] = useState<RiderDepositRequest[]>([]);
  const [settlements, setSettlements] = useState<VendorSettlementRequest[]>([]);
  const [dispatch, setDispatch] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const token = session?.token || "";

  const fetchAll = useCallback(async () => {
    const headers = { Authorization: `Bearer ${token}` };
    const [rRes, vRes, dRes, sRes, dpRes] = await Promise.allSettled([
      fetch("/api/riders", { headers }).then((r) => r.json()),
      fetch("/api/vendors", { headers }).then((r) => r.json()),
      fetch("/api/riders/deposits", { headers }).then((r) => r.json()),
      fetch("/api/vendors/settlements", { headers }).then((r) => r.json()),
      fetch("/api/proxy/dispatch", { headers }).then((r) => r.json()),
    ]);
    if (rRes.status === "fulfilled" && rRes.value.success) setRiders(rRes.value.data);
    if (vRes.status === "fulfilled" && vRes.value.success) setVendors(vRes.value.data);
    if (dRes.status === "fulfilled" && dRes.value.success) setDeposits(dRes.value.data);
    if (sRes.status === "fulfilled" && sRes.value.success) setSettlements(sRes.value.data);
    if (dpRes.status === "fulfilled" && dpRes.value.success) {
      setDispatch(Array.isArray(dpRes.value.data) ? dpRes.value.data : []);
    }
    setLoading(false);
    setLastRefresh(new Date());
  }, [token]);

  useEffect(() => { fetchAll(); }, [fetchAll]);
  useEffect(() => {
    const iv = setInterval(fetchAll, 15000);
    return () => clearInterval(iv);
  }, [fetchAll]);

  const onlineRiders = riders.filter((r) => r.dutyStatus === "ONLINE");
  const activeVendors = vendors.filter((v) => v.status === "ACTIVE");
  const pendingDeposits = deposits.filter((d) => d.status === "PENDING");
  const pendingSettlements = settlements.filter((s) => s.status === "PENDING");
  const pendingKYC = riders.filter((r) => r.kycStatus === "SUBMITTED");
  const pendingVendors = vendors.filter((v) => v.status === "PENDING_APPROVAL");
  const suspendedRiders = riders.filter((r) => r.status === "SUSPENDED");
  const dispatchActive = dispatch.filter((d) => d.status !== "DELIVERED" && d.status !== "RETURNED");

  const KPIs = [
    {
      label: "Online Riders", value: onlineRiders.length, total: riders.length,
      icon: Bike, accent: "green",
      badge: `${riders.length} total`, badgeCls: "neutral",
    },
    {
      label: "Active Vendors", value: activeVendors.length, total: vendors.length,
      icon: Store, accent: "purple",
      badge: `${pendingVendors.length} pending`, badgeCls: pendingVendors.length > 0 ? "down" : "neutral",
    },
    {
      label: "Active Dispatch", value: dispatchActive.length, total: null,
      icon: Zap, accent: "orange",
      badge: "live", badgeCls: "up",
    },
    {
      label: "Pending Deposits", value: pendingDeposits.length, total: null,
      icon: CreditCard, accent: "blue",
      badge: `Tk.${pendingDeposits.reduce((s, d) => s + d.amount, 0).toLocaleString()}`, badgeCls: "neutral",
    },
    {
      label: "Pending KYC", value: pendingKYC.length, total: null,
      icon: FileCheck, accent: "danger",
      badge: pendingKYC.length > 0 ? "Urgent" : "Good", badgeCls: pendingKYC.length > 0 ? "down" : "up",
    },
    {
      label: "Pending Settlements", value: pendingSettlements.length, total: null,
      icon: TrendingUp, accent: "pink",
      badge: `Tk.${pendingSettlements.reduce((s, d) => s + d.amount, 0).toLocaleString()}`, badgeCls: "neutral",
    },
  ];

  const ACCENT_BG: Record<string, string> = {
    green:  "rgba(0,214,143,0.12)",
    purple: "rgba(124,92,252,0.12)",
    orange: "rgba(255,122,0,0.12)",
    blue:   "rgba(45,156,219,0.12)",
    danger: "rgba(239,68,68,0.12)",
    pink:   "rgba(255,79,154,0.12)",
  };
  const ACCENT_CLR: Record<string, string> = {
    green: "var(--accent-green)", purple: "var(--accent-purple)",
    orange: "var(--accent-orange)", blue: "var(--accent-blue)",
    danger: "var(--danger)", pink: "var(--accent-pink)",
  };

  return (
    <div className="hub-content">
      {/* Header */}
      <div className="page-header">
        <div className="flex-between">
          <div>
            <h1 className="page-title">
              <span>📊</span>
              <span>Dashboard Overview</span>
            </h1>
            <p className="page-subtitle">
              Welcome, {session?.name} — Last updated: {lastRefresh.toLocaleTimeString()}
            </p>
          </div>
          <button onClick={fetchAll} className="btn btn-ghost btn-sm" disabled={loading}>
            <RefreshCw size={13} className={loading ? "spin" : ""} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid" style={{ marginBottom: 24 }}>
        {KPIs.map((k) => {
          const Icon = k.icon;
          return (
            <div key={k.label} className="kpi-card" data-accent={k.accent}>
              <div
                className="kpi-icon"
                style={{ background: ACCENT_BG[k.accent] }}
              >
                <Icon size={18} style={{ color: ACCENT_CLR[k.accent] }} />
              </div>
              <div className="kpi-value">{loading ? "—" : k.value}</div>
              <div className="kpi-label">{k.label}</div>
              {k.total !== null && !loading && (
                <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>
                  Total: {k.total}
                </div>
              )}
              <div className={`kpi-badge ${k.badgeCls}`}>
                {k.badgeCls === "up" && <ArrowUpRight size={11} />}
                <span>{k.badge}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Two-column grid */}
      <div className="grid-2" style={{ gap: 20 }}>
        {/* Pending Actions */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">⚡ Action Required</div>
              <div className="card-subtitle">Pending approval</div>
            </div>
            {(pendingKYC.length + pendingVendors.length + pendingDeposits.length + pendingSettlements.length) > 0 && (
              <span className="badge badge-red">
                {pendingKYC.length + pendingVendors.length + pendingDeposits.length + pendingSettlements.length} pending
              </span>
            )}
          </div>
          {[
            { label: "Pending KYC", count: pendingKYC.length, href: "/riders/kyc", icon: "📋", color: "var(--accent-orange)" },
            { label: "Pending Vendors", count: pendingVendors.length, href: "/vendors/approvals", icon: "🏪", color: "var(--accent-purple)" },
            { label: "Pending Deposits", count: pendingDeposits.length, href: "/riders/deposits", icon: "💳", color: "var(--accent-blue)" },
            { label: "Pending Settlements", count: pendingSettlements.length, href: "/vendors/settlements", icon: "💰", color: "var(--accent-green)" },
          ].map((item) => (
            <a
              key={item.label}
              href={item.href}
              style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "12px 0", borderBottom: "1px solid var(--border)",
                textDecoration: "none",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 18 }}>{item.icon}</span>
                <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>{item.label}</span>
              </div>
              <span
                className="badge"
                style={{
                  background: item.count > 0 ? `rgba(239,68,68,0.12)` : "rgba(90,122,154,0.1)",
                  color: item.count > 0 ? "var(--danger)" : "var(--text-muted)",
                  border: item.count > 0 ? "1px solid rgba(239,68,68,0.25)" : "1px solid var(--border)",
                }}
              >
                {item.count}
              </span>
            </a>
          ))}
        </div>

        {/* Rider Status Summary */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">🛵 Rider Status</div>
              <div className="card-subtitle">Overview of all riders</div>
            </div>
          </div>
          {loading ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[1,2,3,4].map((i) => (
                <div key={i} className="skeleton" style={{ height: 36, borderRadius: 8 }} />
              ))}
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {[
                { label: "Online (On Duty)", count: onlineRiders.length, color: "var(--accent-green)", dot: "dot-green dot-pulse" },
                { label: "Offline", count: riders.filter(r=>r.dutyStatus==="OFFLINE").length, color: "var(--text-muted)", dot: "dot-gray" },
                { label: "Suspended", count: suspendedRiders.length, color: "var(--danger)", dot: "dot-red" },
                { label: "KYC Pending", count: pendingKYC.length, color: "var(--accent-orange)", dot: "dot-orange" },
              ].map((s) => (
                <div key={s.label} className="info-row" style={{ paddingLeft: 4 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1 }}>
                    <span className={`dot ${s.dot}`} />
                    <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>{s.label}</span>
                  </div>
                  <span style={{ fontWeight: 700, fontSize: 16, color: s.color }}>{s.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Vendor status */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">🏪 Vendor Status</div>
              <div className="card-subtitle">Overview of all vendors</div>
            </div>
          </div>
          {loading ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[1,2,3,4].map((i) => <div key={i} className="skeleton" style={{ height: 36, borderRadius: 8 }} />)}
            </div>
          ) : (
            <div>
              {[
                { label: "Active", count: vendors.filter(v=>v.status==="ACTIVE").length, color: "var(--accent-green)" },
                { label: "Pending Approval", count: pendingVendors.length, color: "var(--accent-orange)" },
                { label: "Suspended", count: vendors.filter(v=>v.status==="SUSPENDED").length, color: "var(--danger)" },
                { label: "Vacation Mode", count: vendors.filter(v=>v.vacationMode).length, color: "var(--accent-blue)" },
              ].map((s) => (
                <div key={s.label} className="info-row">
                  <span className="info-label">{s.label}</span>
                  <span style={{ fontWeight: 700, fontSize: 15, color: s.color }}>{s.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Live Dispatch Summary */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">📦 Live Dispatch</div>
              <div className="card-subtitle">Active ongoing orders</div>
            </div>
            <span className="badge badge-green" style={{ fontSize: 10 }}>
              <span className="dot dot-green dot-pulse" style={{ width: 6, height: 6 }} />
              LIVE
            </span>
          </div>
          {dispatch.length === 0 ? (
            <div className="empty-state" style={{ padding: "30px 20px" }}>
              <div className="empty-state-icon">📭</div>
              <div className="empty-state-title">No active orders</div>
            </div>
          ) : (
            <div>
              {dispatch.slice(0, 5).map((t: any) => (
                <div key={t.id || t.orderNumber} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--border)" }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>#{t.orderNumber}</div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{t.deliveryAddress || t.deliveryZone || "No address"}</div>
                  </div>
                  <span className={`badge ${t.claimed ? "badge-blue" : "badge-orange"}`}>
                    <span>{t.claimed ? "Claimed" : "Pending"}</span>
                  </span>
                </div>
              ))}
              {dispatch.length > 5 && (
                <a href="/dispatch" style={{ display: "block", marginTop: 10, fontSize: 12, color: "var(--accent-green)", textAlign: "center" }}>
                  View {dispatch.length - 5} more →
                </a>
              )}
            </div>
          )}
        </div>
      </div>

      <style>{`
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
