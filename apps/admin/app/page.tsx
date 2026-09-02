"use client";

import React from "react";
import Link from "next/link";
import {
  TrendingUp, ShoppingBag, Store, Bike,
  AlertTriangle, ArrowUpRight, Package,
  CheckCircle2, Clock, Building2, Zap,
  ChevronRight, Activity,
} from "lucide-react";
import { useAdmin } from "@/context/AdminContext";

const STATUS_COLORS: Record<string, { cls: string }> = {
  PENDING:          { cls: "warning" },
  CONFIRMED:        { cls: "info" },
  PREPARING:        { cls: "purple" },
  OUT_FOR_DELIVERY: { cls: "cyan" },
  DELIVERED:        { cls: "success" },
  CANCELLED:        { cls: "danger" },
};

export default function AdminDashboardPage() {
  const { orders, products, vendors, riders, b2bAccounts, updateOrderStatus } = useAdmin();

  const totalRevenue    = orders.reduce((s, o) => s + o.totalAmount, 0);
  const todayOrders     = orders.filter(o => o.status !== "CANCELLED");
  const pendingOrders   = orders.filter(o => o.status === "PENDING" || o.status === "CONFIRMED");
  const lowStockProducts= products.filter(p => p.stock <= p.lowStockAlert);
  const pendingVendors  = vendors.filter(v => v.status === "PENDING");
  const pendingB2B      = b2bAccounts.filter(b => b.status === "PENDING");
  const activeRiders    = riders.filter(r => r.status === "ACTIVE");
  const onDelivery      = orders.filter(o => o.status === "OUT_FOR_DELIVERY");

  const KPI = [
    {
      label: "Total Revenue",
      sublabel: "All-time GMV",
      value: `৳${(totalRevenue / 1000).toFixed(1)}K`,
      icon: TrendingUp,
      accent: "var(--green)",
      badge: "+18.4% vs last week",
      badgeColor: "var(--green)",
    },
    {
      label: "Today's Orders",
      sublabel: "Active orders",
      value: `${todayOrders.length}`,
      icon: ShoppingBag,
      accent: "var(--blue)",
      badge: `${pendingOrders.length} pending`,
      badgeColor: "var(--amber)",
    },
    {
      label: "Partner Vendors",
      sublabel: "Active shops",
      value: `${vendors.filter(v => v.status === "APPROVED").length}`,
      icon: Store,
      accent: "var(--purple)",
      badge: pendingVendors.length > 0 ? `${pendingVendors.length} pending` : "All approved",
      badgeColor: pendingVendors.length > 0 ? "var(--amber)" : "var(--green)",
    },
    {
      label: "Delivery Fleet",
      sublabel: "Active riders",
      value: `${activeRiders.length}`,
      icon: Bike,
      accent: "var(--cyan)",
      badge: `${onDelivery.length} on route`,
      badgeColor: "var(--cyan)",
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "22px" }}>

      {/* ── Page Header ────────────────────────────────────── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 style={{ fontSize: "1.35rem", fontWeight: 800, color: "var(--text-1)", lineHeight: 1.2 }}>
            Operations Command Center
          </h1>
          <p style={{ fontSize: "0.80rem", color: "var(--text-3)", marginTop: "3px" }}>
            Tatka Bazar Marketplace · Real-time Operational Overview
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <Link href="/products" className="admin-btn admin-btn-secondary" style={{ fontSize: "0.82rem" }}>
            <Package size={14} />
            Add New Product
          </Link>
          <Link href="/orders" className="admin-btn admin-btn-primary" style={{ fontSize: "0.82rem" }}>
            <ShoppingBag size={14} />
            View Orders ({orders.length})
          </Link>
        </div>
      </div>

      {/* ── KPI Cards ──────────────────────────────────────── */}
      <div className="kpi-grid">
        {KPI.map(kpi => {
          const Icon = kpi.icon;
          return (
            <div key={kpi.label} className="kpi-card" style={{ "--kpi-accent": kpi.accent } as React.CSSProperties}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                    {kpi.label}
                  </div>
                  <div style={{ fontSize: "0.63rem", color: "var(--text-4)", marginTop: "1px" }}>{kpi.sublabel}</div>
                </div>
                <div style={{
                  width: "36px", height: "36px",
                  borderRadius: "var(--r-md)",
                  background: `${kpi.accent}15`,
                  border: `1px solid ${kpi.accent}30`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Icon size={17} color={kpi.accent} />
                </div>
              </div>
              <div style={{ fontSize: "1.9rem", fontWeight: 800, color: "var(--text-1)", lineHeight: 1, marginTop: "12px" }}>
                {kpi.value}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "5px", marginTop: "8px" }}>
                <ArrowUpRight size={12} color={kpi.badgeColor} />
                <span style={{ fontSize: "0.72rem", fontWeight: 700, color: kpi.badgeColor }}>
                  {kpi.badge}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Alert Strip ────────────────────────────────────── */}
      {(pendingVendors.length > 0 || lowStockProducts.length > 0 || pendingB2B.length > 0) && (
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          {pendingVendors.length > 0 && (
            <Link href="/vendors" style={{
              flex: 1, minWidth: "200px",
              display: "flex", alignItems: "center", justifyContent: "space-between",
              gap: "10px", padding: "12px 16px",
              background: "var(--amber-glass)", border: "1px solid var(--border-amber)",
              borderRadius: "var(--r-md)", color: "var(--amber)",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Store size={16} />
                <span style={{ fontSize: "0.82rem", fontWeight: 700 }}>
                  {pendingVendors.length} vendor applications pending approval
                </span>
              </div>
              <ChevronRight size={15} />
            </Link>
          )}
          {pendingB2B.length > 0 && (
            <Link href="/b2b" style={{
              flex: 1, minWidth: "200px",
              display: "flex", alignItems: "center", justifyContent: "space-between",
              gap: "10px", padding: "12px 16px",
              background: "var(--blue-glass)", border: "1px solid rgba(59,130,246,0.3)",
              borderRadius: "var(--r-md)", color: "var(--blue)",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Building2 size={16} />
                <span style={{ fontSize: "0.82rem", fontWeight: 700 }}>
                  {pendingB2B.length} B2B quotations pending review
                </span>
              </div>
              <ChevronRight size={15} />
            </Link>
          )}
          {lowStockProducts.length > 0 && (
            <Link href="/inventory" style={{
              flex: 1, minWidth: "200px",
              display: "flex", alignItems: "center", justifyContent: "space-between",
              gap: "10px", padding: "12px 16px",
              background: "var(--red-glass)", border: "1px solid var(--border-red)",
              borderRadius: "var(--r-md)", color: "var(--red)",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <AlertTriangle size={16} />
                <span style={{ fontSize: "0.82rem", fontWeight: 700 }}>
                  {lowStockProducts.length} items low on stock
                </span>
              </div>
              <ChevronRight size={15} />
            </Link>
          )}
        </div>
      )}

      {/* ── Main 2-col grid ────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "20px", alignItems: "flex-start" }}>

        {/* ── Recent Orders Table ─────────────────────────── */}
        <div className="admin-card">
          <div style={{
            padding: "16px 20px",
            borderBottom: "1px solid var(--border-1)",
            display: "flex", justifyContent: "space-between", alignItems: "center",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Activity size={16} color="var(--green)" />
              <h2 style={{ fontSize: "0.95rem", fontWeight: 800, color: "var(--text-1)" }}>
                Recent Live Orders
              </h2>
              <span className="live-dot" />
            </div>
            <Link href="/orders" style={{ fontSize: "0.78rem", color: "var(--green)", fontWeight: 700, display: "flex", alignItems: "center", gap: "4px" }}>
              View All <ChevronRight size={13} />
            </Link>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Total Amount</th>
                  <th>Status</th>
                  <th>Quick Action</th>
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 6).map(ord => (
                  <tr key={ord.id} className="order-row-clickable">
                    <td>
                      <span className="mono" style={{ fontWeight: 700, color: "var(--green)", fontSize: "0.83rem" }}>
                        {ord.orderNumber}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: "0.83rem" }}>{ord.customerName}</div>
                      <div style={{ fontSize: "0.70rem", color: "var(--text-3)" }}>{ord.deliveryArea}</div>
                    </td>
                    <td style={{ fontWeight: 800, fontFamily: "var(--font-mono)", fontSize: "0.88rem" }}>
                      ৳{ord.totalAmount.toLocaleString()}
                    </td>
                    <td>
                      <span className={`status-badge ${STATUS_COLORS[ord.status]?.cls || "neutral"}`}>
                        {ord.status.replace("_", " ")}
                      </span>
                    </td>
                    <td>
                      <select
                        value={ord.status}
                        onChange={e => updateOrderStatus(ord.id, e.target.value as any)}
                        className="admin-select"
                        style={{ padding: "4px 8px", fontSize: "0.75rem", width: "auto" }}
                        onClick={e => e.stopPropagation()}
                      >
                        <option value="PENDING">PENDING</option>
                        <option value="CONFIRMED">CONFIRMED</option>
                        <option value="PREPARING">PREPARING</option>
                        <option value="OUT_FOR_DELIVERY">OUT_FOR_DELIVERY</option>
                        <option value="DELIVERED">DELIVERED</option>
                        <option value="CANCELLED">CANCELLED</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Right Column ────────────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

          {/* Top Products */}
          <div className="admin-card">
            <div style={{
              padding: "14px 16px",
              borderBottom: "1px solid var(--border-1)",
              display: "flex", justifyContent: "space-between", alignItems: "center",
            }}>
              <h2 style={{ fontSize: "0.92rem", fontWeight: 800, color: "var(--text-1)" }}>Top Catalog Items</h2>
              <Link href="/products" style={{ fontSize: "0.75rem", color: "var(--green)", fontWeight: 700 }}>
                All →
              </Link>
            </div>
            <div style={{ padding: "12px 16px", display: "flex", flexDirection: "column", gap: "10px" }}>
              {products.slice(0, 4).map(p => (
                <div key={p.id} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <img
                    src={p.images[0]}
                    alt={p.nameEn}
                    style={{ width: "38px", height: "38px", borderRadius: "var(--r-sm)", objectFit: "cover", flexShrink: 0, border: "1px solid var(--border-1)" }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="truncate" style={{ fontWeight: 600, fontSize: "0.82rem", color: "var(--text-1)" }}>{p.nameEn || p.nameBn}</div>
                    <div style={{ fontSize: "0.70rem", color: "var(--text-3)" }}>
                      Stock: <span style={{ color: p.stock <= p.lowStockAlert ? "var(--red)" : "var(--green)", fontWeight: 700 }}>{p.stock} {p.baseUnit}</span>
                    </div>
                  </div>
                  <div style={{ fontWeight: 800, fontSize: "0.85rem", color: "var(--green)", fontFamily: "var(--font-mono)", flexShrink: 0 }}>
                    ৳{p.basePrice}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Vendor Sales Breakdown */}
          <div className="admin-card">
            <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--border-1)" }}>
              <h2 style={{ fontSize: "0.92rem", fontWeight: 800, color: "var(--text-1)" }}>Vendor Sales Distribution</h2>
            </div>
            <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: "12px" }}>
              {vendors.slice(0, 4).map(v => {
                const pct = Math.min(100, (v.totalSales / 620000) * 100);
                return (
                  <div key={v.id}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
                      <span className="truncate" style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--text-2)", maxWidth: "65%" }}>{v.nameEn || v.nameBn}</span>
                      <span style={{ fontSize: "0.78rem", fontWeight: 800, color: "var(--green)", fontFamily: "var(--font-mono)" }}>
                        ৳{(v.totalSales / 1000).toFixed(1)}K
                      </span>
                    </div>
                    <div style={{ width: "100%", height: "5px", background: "var(--bg-raised)", borderRadius: "99px", overflow: "hidden" }}>
                      <div style={{
                        width: `${pct}%`, height: "100%",
                        background: "linear-gradient(90deg, var(--green-dim), var(--green))",
                        borderRadius: "99px",
                        transition: "width 0.8s ease",
                      }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Rider Quick Status */}
          <div className="admin-card">
            <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--border-1)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2 style={{ fontSize: "0.92rem", fontWeight: 800, color: "var(--text-1)" }}>Rider Fleet Status</h2>
              <Link href="/riders" style={{ fontSize: "0.75rem", color: "var(--green)", fontWeight: 700 }}>All →</Link>
            </div>
            <div style={{ padding: "12px 16px", display: "flex", flexDirection: "column", gap: "8px" }}>
              {riders.slice(0, 4).map(r => (
                <div key={r.id} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={{ position: "relative", flexShrink: 0 }}>
                    <div style={{
                      width: "32px", height: "32px", borderRadius: "50%",
                      background: "var(--green-glass)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "0.78rem", fontWeight: 800, color: "var(--green)",
                    }}>
                      {r.name.charAt(0)}
                    </div>
                    <div className={`live-dot ${r.status === "ACTIVE" && r.activeDeliveriesCount > 0 ? "amber" : r.status !== "ACTIVE" ? "gray" : ""}`}
                      style={{ position: "absolute", bottom: "-1px", right: "-1px", width: "8px", height: "8px" }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="truncate" style={{ fontWeight: 600, fontSize: "0.80rem", color: "var(--text-1)" }}>{r.name}</div>
                    <div style={{ fontSize: "0.68rem", color: "var(--text-3)" }}>{r.assignedHubName}</div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{ fontSize: "0.78rem", fontWeight: 700, color: r.activeDeliveriesCount > 0 ? "var(--amber)" : "var(--text-4)" }}>
                      {r.activeDeliveriesCount} orders
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
