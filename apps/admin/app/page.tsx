"use client";

import React from "react";
import Link from "next/link";
import {
  TrendingUp, ShoppingBag, Store, Bike, Users, Radio,
  ArrowUpRight, Package, CheckCircle2, Clock, AlertTriangle,
  ChevronRight, Zap, Activity, Star, DollarSign, ShoppingCart,
  BarChart3,
} from "lucide-react";
import { useAdmin } from "@/context/AdminContext";
import { AdminOrder, OrderStatus } from "@/types";

const STATUS_META: Record<OrderStatus, { label: string; cls: string }> = {
  PENDING:           { label: "Pending",          cls: "warning"  },
  CONFIRMED:         { label: "Confirmed",        cls: "info"     },
  PROCESSING:        { label: "Processing",       cls: "info"     },
  VENDOR_ASSIGNED:   { label: "Vendor Assigned",  cls: "indigo"   },
  PREPARING:         { label: "Preparing",        cls: "purple"   },
  READY_FOR_PICKUP:  { label: "Ready",            cls: "cyan"     },
  OUT_FOR_DELIVERY:  { label: "On Delivery",      cls: "cyan"     },
  SHIPPED:           { label: "Shipped",          cls: "cyan"     },
  DELIVERED:         { label: "Delivered",        cls: "success"  },
  CANCELLED:         { label: "Cancelled",        cls: "danger"   },
  RETURNED:          { label: "Returned",         cls: "danger"   },
};

function StatusBadge({ status }: { status: OrderStatus }) {
  const m = STATUS_META[status] || { label: status, cls: "neutral" };
  return <span className={`status-badge ${m.cls}`}>{m.label}</span>;
}

export default function AdminDashboardPage() {
  const { orders, products, vendors, riders, b2bAccounts, customers, staff } = useAdmin();

  const totalRevenue     = orders.filter(o => o.status !== "CANCELLED").reduce((s, o) => s + o.totalAmount, 0);
  const todayOrders      = orders.filter(o => o.status !== "CANCELLED");
  const pendingOrders    = orders.filter(o => o.status === "PENDING");
  const activeOrders     = orders.filter(o => !["DELIVERED", "CANCELLED"].includes(o.status));
  const lowStockProducts = products.filter(p => p.stock <= p.lowStockAlert);
  const pendingVendors   = vendors.filter(v => v.status === "PENDING");
  const activeRiders     = riders.filter(r => r.status === "ACTIVE" || r.status === "BUSY");
  const onDelivery       = orders.filter(o => o.status === "OUT_FOR_DELIVERY");
  const publishedProducts = products.filter(p => p.isPublished);

  const KPI = [
    {
      label: "Total Revenue",
      sublabel: "All-time GMV",
      value: `৳${(totalRevenue / 1000).toFixed(1)}K`,
      icon: DollarSign,
      accent: "var(--green)",
      glow: "var(--green-glass)",
      badge: "+18.4% vs last week",
      badgeColor: "var(--green)",
      href: "/reports",
    },
    {
      label: "Active Orders",
      sublabel: "In pipeline",
      value: `${activeOrders.length}`,
      icon: ShoppingBag,
      accent: "var(--amber)",
      glow: "var(--amber-glass)",
      badge: `${pendingOrders.length} need action`,
      badgeColor: "var(--amber)",
      href: "/orders",
    },
    {
      label: "Partner Vendors",
      sublabel: "Approved shops",
      value: `${vendors.filter(v => v.status === "APPROVED").length}`,
      icon: Store,
      accent: "var(--indigo)",
      glow: "var(--indigo-glass)",
      badge: pendingVendors.length > 0 ? `${pendingVendors.length} pending review` : "All approved",
      badgeColor: pendingVendors.length > 0 ? "var(--amber)" : "var(--green)",
      href: "/vendors",
    },
    {
      label: "Delivery Fleet",
      sublabel: "Active riders",
      value: `${activeRiders.length}`,
      icon: Bike,
      accent: "var(--cyan)",
      glow: "var(--cyan-glass)",
      badge: `${onDelivery.length} on route now`,
      badgeColor: "var(--cyan)",
      href: "/riders",
    },
    {
      label: "Total Customers",
      sublabel: "Registered users",
      value: `${customers.length}`,
      icon: Users,
      accent: "var(--purple)",
      glow: "var(--purple-glass)",
      badge: "+24 this week",
      badgeColor: "var(--purple)",
      href: "/customers",
    },
    {
      label: "Products Live",
      sublabel: "Published to store",
      value: `${publishedProducts.length}`,
      icon: Package,
      accent: "var(--rose)",
      glow: "var(--rose-glass)",
      badge: lowStockProducts.length > 0 ? `${lowStockProducts.length} low stock` : "Stock OK",
      badgeColor: lowStockProducts.length > 0 ? "var(--amber)" : "var(--green)",
      href: "/products",
    },
  ];

  const recentOrders = [...orders].sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  ).slice(0, 6);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>

      {/* ── Page Header ── */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Operations Dashboard</h1>
          <p className="page-subtitle">
            Real-time overview of Tatka Bazar · Bangladesh&apos;s premium fresh marketplace
          </p>
        </div>
        <div className="page-actions">
          {pendingOrders.length > 0 && (
            <Link href="/dispatch">
              <button className="admin-btn admin-btn-amber" style={{ animation: "pendingPulse 2s ease-in-out infinite" }}>
                <div className="live-dot amber" style={{ width: "6px", height: "6px" }} />
                {pendingOrders.length} Pending — Go to Dispatch
                <ArrowUpRight size={14} />
              </button>
            </Link>
          )}
          <Link href="/orders">
            <button className="admin-btn admin-btn-primary">
              <ShoppingBag size={15} />
              All Orders
            </button>
          </Link>
        </div>
      </div>

      {/* ── KPI Grid ── */}
      <div className="kpi-grid fade-up">
        {KPI.map((kpi, i) => {
          const Icon = kpi.icon;
          return (
            <Link key={kpi.label} href={kpi.href} style={{ textDecoration: "none" }}>
              <div
                className={`kpi-card fade-up fade-up-${Math.min(i + 1, 4)}`}
                style={{ "--kpi-accent": kpi.accent, "--kpi-glow": kpi.glow } as React.CSSProperties}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "14px" }}>
                  <div style={{
                    width: "38px", height: "38px",
                    borderRadius: "var(--r-md)",
                    background: kpi.glow,
                    border: `1px solid ${kpi.accent}33`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <Icon size={18} color={kpi.accent} />
                  </div>
                  <ArrowUpRight size={14} style={{ color: "var(--text-4)", marginTop: "4px" }} />
                </div>
                <div style={{ fontSize: "1.9rem", fontWeight: 900, color: "var(--text-0)", lineHeight: 1, marginBottom: "4px" }}>
                  {kpi.value}
                </div>
                <div style={{ fontSize: "0.83rem", fontWeight: 600, color: "var(--text-2)", marginBottom: "10px" }}>
                  {kpi.label}
                </div>
                <div style={{ fontSize: "0.72rem", color: kpi.badgeColor, fontWeight: 600 }}>
                  {kpi.badge}
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* ── Main Row: Live Orders + Quick Actions ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "20px", alignItems: "flex-start" }}>

        {/* Recent Orders table */}
        <div className="admin-card fade-up">
          <div style={{ padding: "20px 22px", borderBottom: "1px solid var(--border-1)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontWeight: 800, fontSize: "0.95rem", color: "var(--text-0)" }}>Recent Orders</div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-3)", marginTop: "2px" }}>
                Auto-refreshes every 8 seconds
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span className="live-dot" />
              <span style={{ fontSize: "0.72rem", color: "var(--green)", fontWeight: 600 }}>LIVE</span>
              <Link href="/orders">
                <button className="admin-btn admin-btn-ghost admin-btn-sm">
                  View All <ChevronRight size={12} />
                </button>
              </Link>
            </div>
          </div>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Customer</th>
                  <th>Area</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id} className="clickable" onClick={() => window.location.href = `/orders?id=${order.id}`}>
                    <td>
                      <span className="mono" style={{ fontSize: "0.78rem" }}>#{order.orderNumber}</span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: "0.84rem" }}>{order.customerName}</div>
                      <div style={{ fontSize: "0.72rem", color: "var(--text-3)" }}>{order.customerPhone}</div>
                    </td>
                    <td>
                      <span style={{ fontSize: "0.82rem" }}>{order.deliveryArea}</span>
                    </td>
                    <td>
                      <span className="mono" style={{ color: "var(--green-bright)", fontSize: "0.85rem", fontWeight: 700 }}>
                        ৳{order.totalAmount.toLocaleString()}
                      </span>
                    </td>
                    <td>
                      <StatusBadge status={order.status} />
                    </td>
                    <td>
                      <span style={{ fontSize: "0.75rem", color: "var(--text-3)" }}>
                        {order.createdAt.split(",")[1]?.trim() || order.createdAt}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column — Quick Actions + Alerts */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

          {/* Dispatch Alert */}
          {pendingOrders.length > 0 && (
            <Link href="/dispatch" style={{ textDecoration: "none" }}>
              <div className="dispatch-card pending" style={{ padding: "16px" }}>
                <div className="card-accent-line" />
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
                  <div className="ring-pulse">
                    <div className="live-dot amber" style={{ width: "10px", height: "10px" }} />
                  </div>
                  <span style={{ fontWeight: 800, color: "var(--amber)", fontSize: "0.85rem" }}>
                    {pendingOrders.length} Orders Need Action
                  </span>
                </div>
                <p style={{ fontSize: "0.78rem", color: "var(--text-3)", lineHeight: 1.5 }}>
                  Customers are waiting. Open Live Dispatch to confirm and assign vendors.
                </p>
                <button className="admin-btn admin-btn-amber admin-btn-sm" style={{ width: "100%", marginTop: "12px", justifyContent: "center" }}>
                  <Radio size={13} /> Open Dispatch Center
                </button>
              </div>
            </Link>
          )}

          {/* Quick Actions */}
          <div className="admin-card">
            <div style={{ padding: "16px 18px", borderBottom: "1px solid var(--border-1)" }}>
              <div style={{ fontWeight: 800, fontSize: "0.9rem", color: "var(--text-0)" }}>Quick Actions</div>
            </div>
            <div style={{ padding: "12px" }}>
              {[
                { label: "Add New Product", icon: Package, href: "/products", color: "var(--indigo)" },
                { label: "Approve Vendors", icon: Store, href: "/vendors", color: "var(--green)", count: pendingVendors.length },
                { label: "Approve Riders", icon: Bike, href: "/riders", color: "var(--cyan)", count: riders.filter(r => r.status === "PENDING").length },
                { label: "Moderate Reviews", icon: Star, href: "/reviews", color: "var(--amber)" },
                { label: "View Reports", icon: BarChart3, href: "/reports", color: "var(--purple)" },
                { label: "Manage Staff", icon: Users, href: "/staff", color: "var(--rose)" },
              ].map((action) => {
                const Icon = action.icon;
                return (
                  <Link key={action.href} href={action.href}>
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      padding: "9px 8px",
                      borderRadius: "var(--r-md)",
                      cursor: "pointer",
                      transition: "background var(--t-fast)",
                    }}
                    className="sidebar-link"
                    >
                      <div style={{
                        width: "28px", height: "28px",
                        borderRadius: "var(--r-sm)",
                        background: `${action.color}20`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        flexShrink: 0,
                      }}>
                        <Icon size={13} color={action.color} />
                      </div>
                      <span style={{ fontSize: "0.835rem", fontWeight: 600 }}>{action.label}</span>
                      {action.count !== undefined && action.count > 0 && (
                        <span className="sidebar-badge" style={{ marginLeft: "auto" }}>{action.count}</span>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Low Stock Alert */}
          {lowStockProducts.length > 0 && (
            <div className="admin-card">
              <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--border-amber)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: 800, color: "var(--amber)", fontSize: "0.85rem" }}>
                  <AlertTriangle size={14} />
                  Low Stock Alert
                  <span className="status-badge warning" style={{ marginLeft: "auto" }}>{lowStockProducts.length}</span>
                </div>
              </div>
              <div style={{ padding: "10px 14px" }}>
                {lowStockProducts.slice(0, 4).map((p) => (
                  <div key={p.id} style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "7px 0", borderBottom: "1px solid var(--border-0)",
                  }}>
                    <div style={{ fontSize: "0.80rem", color: "var(--text-2)", fontWeight: 500 }} className="truncate" title={p.nameEn}>
                      {p.nameEn.length > 28 ? p.nameEn.slice(0, 28) + "…" : p.nameEn}
                    </div>
                    <span className="status-badge warning" style={{ flexShrink: 0 }}>{p.stock} left</span>
                  </div>
                ))}
                <Link href="/inventory">
                  <button className="admin-btn admin-btn-ghost admin-btn-sm" style={{ width: "100%", marginTop: "8px", justifyContent: "center" }}>
                    View Inventory →
                  </button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Bottom Row: Vendor & Rider Overview ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>

        {/* Top Vendors */}
        <div className="admin-card fade-up">
          <div style={{ padding: "18px 22px", borderBottom: "1px solid var(--border-1)", display: "flex", justifyContent: "space-between" }}>
            <div style={{ fontWeight: 800, fontSize: "0.9rem", color: "var(--text-0)" }}>Top Vendors</div>
            <Link href="/vendors"><button className="admin-btn admin-btn-ghost admin-btn-sm">Manage →</button></Link>
          </div>
          <div style={{ padding: "12px" }}>
            {vendors.filter(v => v.status === "APPROVED").slice(0, 5).map((v) => (
              <div key={v.id} style={{
                display: "flex", alignItems: "center", gap: "12px",
                padding: "10px 8px", borderBottom: "1px solid var(--border-0)",
              }}>
                <div style={{
                  width: "36px", height: "36px",
                  borderRadius: "var(--r-md)",
                  background: "linear-gradient(135deg, var(--indigo), var(--purple))",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "0.9rem",
                  flexShrink: 0,
                }}>
                  {v.nameEn[0]}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: "0.83rem", color: "var(--text-1)" }} className="truncate">
                    {v.nameEn}
                  </div>
                  <div style={{ fontSize: "0.72rem", color: "var(--text-3)" }}>{v.area}</div>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div className="mono" style={{ fontSize: "0.78rem", color: "var(--green-bright)" }}>
                    ৳{(v.totalSales / 1000).toFixed(0)}K
                  </div>
                  <div style={{ fontSize: "0.68rem", color: "var(--text-3)" }}>{v.activeOrders} active</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Rider Status */}
        <div className="admin-card fade-up">
          <div style={{ padding: "18px 22px", borderBottom: "1px solid var(--border-1)", display: "flex", justifyContent: "space-between" }}>
            <div style={{ fontWeight: 800, fontSize: "0.9rem", color: "var(--text-0)" }}>Rider Status</div>
            <Link href="/riders"><button className="admin-btn admin-btn-ghost admin-btn-sm">Manage →</button></Link>
          </div>
          <div style={{ padding: "12px" }}>
            {riders.slice(0, 5).map((r) => {
              const dotCls = r.status === "ACTIVE" ? "" : r.status === "BUSY" ? "amber" : r.status === "OFFLINE" ? "off" : r.status === "PENDING" ? "amber" : "red";
              return (
                <div key={r.id} style={{
                  display: "flex", alignItems: "center", gap: "12px",
                  padding: "10px 8px", borderBottom: "1px solid var(--border-0)",
                }}>
                  <div style={{
                    width: "36px", height: "36px",
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, var(--cyan-glass), var(--blue-glass))",
                    border: "1px solid var(--border-2)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontWeight: 800, fontSize: "0.78rem", color: "var(--text-1)",
                    flexShrink: 0,
                  }}>
                    {r.name[0]}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: "0.83rem", color: "var(--text-1)" }}>{r.name}</div>
                    <div style={{ fontSize: "0.72rem", color: "var(--text-3)" }}>{r.area} · {r.vehicleType}</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span className={`live-dot ${dotCls}`} style={{ width: "7px", height: "7px" }} />
                    <span style={{ fontSize: "0.70rem", fontWeight: 600, color: "var(--text-2)" }}>{r.status}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

    </div>
  );
}
