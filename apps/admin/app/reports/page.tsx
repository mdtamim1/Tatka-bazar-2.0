"use client";

import React from "react";
import { BarChart3, TrendingUp, ShoppingBag, Users, DollarSign, Package, Star, Truck } from "lucide-react";
import { useAdmin } from "@/context/AdminContext";

export default function ReportsPage() {
  const { orders, products, vendors, customers, riders } = useAdmin();

  const completedOrders = orders.filter(o => o.status === "DELIVERED");
  const totalRevenue = completedOrders.reduce((s, o) => s + o.totalAmount, 0);
  const avgOrderValue = completedOrders.length > 0 ? totalRevenue / completedOrders.length : 0;
  const totalCustomers = customers.length;
  const activeVendors = vendors.filter(v => v.status === "APPROVED").length;

  // Revenue by payment method
  const paymentBreakdown = orders.filter(o => o.status !== "CANCELLED").reduce((acc, o) => {
    acc[o.paymentMethod] = (acc[o.paymentMethod] || 0) + o.totalAmount;
    return acc;
  }, {} as Record<string, number>);

  // Orders by status
  const statusBreakdown = orders.reduce((acc, o) => {
    acc[o.status] = (acc[o.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Top vendors by sales
  const topVendors = [...vendors].filter(v => v.totalSales > 0)
    .sort((a, b) => b.totalSales - a.totalSales).slice(0, 5);

  // Products by category
  const catCounts = products.reduce((acc, p) => {
    acc[p.categoryName] = (acc[p.categoryName] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Reports & Analytics</h1>
          <p className="page-subtitle">Platform-wide performance overview</p>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="kpi-grid">
        {[
          { label: "Total Revenue", value: `৳${(totalRevenue / 1000).toFixed(1)}K`, sublabel: "Delivered orders", color: "var(--green)", glow: "var(--green-glass)" },
          { label: "Avg Order Value", value: `৳${Math.round(avgOrderValue)}`, sublabel: "Per completed order", color: "var(--amber)", glow: "var(--amber-glass)" },
          { label: "Orders Delivered", value: completedOrders.length, sublabel: "Successfully delivered", color: "var(--indigo)", glow: "var(--indigo-glass)" },
          { label: "Registered Customers", value: totalCustomers, sublabel: "Total accounts", color: "var(--purple)", glow: "var(--purple-glass)" },
          { label: "Active Vendors", value: activeVendors, sublabel: "Approved partners", color: "var(--cyan)", glow: "var(--cyan-glass)" },
          { label: "Published Products", value: products.filter(p => p.isPublished).length, sublabel: "Live on storefront", color: "var(--rose)", glow: "var(--rose-glass)" },
        ].map(k => (
          <div key={k.label} className="kpi-card" style={{ "--kpi-accent": k.color, "--kpi-glow": k.glow } as React.CSSProperties}>
            <div style={{ fontSize: "1.8rem", fontWeight: 900, color: "var(--text-0)", lineHeight: 1 }}>{k.value}</div>
            <div style={{ fontSize: "0.83rem", fontWeight: 600, color: "var(--text-2)", marginTop: "6px" }}>{k.label}</div>
            <div style={{ fontSize: "0.70rem", color: "var(--text-3)", marginTop: "2px" }}>{k.sublabel}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>

        {/* Order Status Breakdown */}
        <div className="admin-card" style={{ padding: "20px" }}>
          <div style={{ fontWeight: 800, fontSize: "0.95rem", color: "var(--text-0)", marginBottom: "16px" }}>Order Status Breakdown</div>
          {Object.entries(statusBreakdown).sort((a, b) => b[1] - a[1]).map(([status, count]) => {
            const total = orders.length;
            const pct = Math.round((count / total) * 100);
            const colorMap: Record<string, string> = {
              PENDING: "var(--amber)", CONFIRMED: "var(--blue)", VENDOR_ASSIGNED: "var(--indigo)",
              PREPARING: "var(--purple)", READY_FOR_PICKUP: "var(--cyan)", OUT_FOR_DELIVERY: "var(--cyan)",
              DELIVERED: "var(--green)", CANCELLED: "var(--red)",
            };
            return (
              <div key={status} style={{ marginBottom: "12px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px", fontSize: "0.80rem" }}>
                  <span style={{ color: "var(--text-2)" }}>{status.replace(/_/g, " ")}</span>
                  <span style={{ fontWeight: 700, color: colorMap[status] || "var(--text-1)" }}>{count} ({pct}%)</span>
                </div>
                <div className="progress-bar-wrap">
                  <div className="progress-bar-fill" style={{ width: `${pct}%`, background: colorMap[status] || "var(--text-3)" }} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Payment Method Breakdown */}
        <div className="admin-card" style={{ padding: "20px" }}>
          <div style={{ fontWeight: 800, fontSize: "0.95rem", color: "var(--text-0)", marginBottom: "16px" }}>Revenue by Payment Method</div>
          {Object.entries(paymentBreakdown).sort((a, b) => b[1] - a[1]).map(([method, amount]) => {
            const maxAmount = Math.max(...Object.values(paymentBreakdown));
            const pct = Math.round((amount / maxAmount) * 100);
            const methodColor: Record<string, string> = { BKASH: "#E2136E", NAGAD: "#EE5A24", SSLCOMMERZ: "var(--indigo)", COD: "var(--amber)" };
            return (
              <div key={method} style={{ marginBottom: "12px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px", fontSize: "0.80rem" }}>
                  <span style={{ color: "var(--text-2)", fontWeight: 600 }}>{method}</span>
                  <span className="mono" style={{ color: "var(--green-bright)", fontWeight: 700 }}>৳{amount.toLocaleString()}</span>
                </div>
                <div className="progress-bar-wrap">
                  <div className="progress-bar-fill" style={{ width: `${pct}%`, background: methodColor[method] || "var(--green)" }} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Top Vendors */}
        <div className="admin-card" style={{ padding: "20px" }}>
          <div style={{ fontWeight: 800, fontSize: "0.95rem", color: "var(--text-0)", marginBottom: "16px" }}>Top Vendors by Revenue</div>
          {topVendors.map((v, i) => (
            <div key={v.id} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "8px 0", borderBottom: "1px solid var(--border-0)" }}>
              <span style={{ width: "20px", fontSize: "0.85rem", fontWeight: 800, color: i === 0 ? "var(--amber)" : "var(--text-3)" }}>#{i + 1}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: "0.84rem", color: "var(--text-1)" }}>{v.nameEn}</div>
                <div style={{ fontSize: "0.70rem", color: "var(--text-3)" }}>{v.area} · {v.totalProducts} products</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div className="mono" style={{ fontSize: "0.84rem", fontWeight: 700, color: "var(--green-bright)" }}>৳{(v.totalSales / 1000).toFixed(0)}K</div>
                <div style={{ fontSize: "0.68rem", color: "var(--text-3)" }}>{v.commissionRate}% comm.</div>
              </div>
            </div>
          ))}
        </div>

        {/* Products by Category */}
        <div className="admin-card" style={{ padding: "20px" }}>
          <div style={{ fontWeight: 800, fontSize: "0.95rem", color: "var(--text-0)", marginBottom: "16px" }}>Products by Category</div>
          {Object.entries(catCounts).sort((a, b) => b[1] - a[1]).map(([cat, count]) => {
            const pct = Math.round((count / products.length) * 100);
            return (
              <div key={cat} style={{ marginBottom: "12px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px", fontSize: "0.80rem" }}>
                  <span style={{ color: "var(--text-2)" }}>{cat}</span>
                  <span style={{ fontWeight: 700, color: "var(--text-1)" }}>{count} ({pct}%)</span>
                </div>
                <div className="progress-bar-wrap">
                  <div className="progress-bar-fill" style={{ width: `${pct}%`, background: "var(--indigo)" }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
