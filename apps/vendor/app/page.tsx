"use client";

import React from "react";
import Link from "next/link";
import {
  TrendingUp,
  ShoppingBag,
  Package,
  Star,
  Clock,
  CheckCircle2,
  DollarSign,
  ArrowUpRight,
  AlertCircle,
  ExternalLink,
  Plus,
} from "lucide-react";
import { useVendor } from "@/context/VendorContext";

export default function VendorDashboardPage() {
  const { currentVendor, products, orders, payouts } = useVendor();

  const totalSales = orders.reduce((sum, o) => sum + o.subtotal, 0);
  const netEarnings = orders.reduce((sum, o) => sum + o.netEarnings, 0);
  const pendingOrders = orders.filter((o) => o.status === "PREPARING");
  const lowStockProducts = products.filter((p) => p.stock <= p.lowStockAlert);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      
      {/* Welcome Banner */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 style={{ fontSize: "1.45rem", fontWeight: 800, color: "var(--text-main)", lineHeight: 1.2 }}>
            Welcome, {currentVendor.nameEn || currentVendor.nameBn}
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginTop: "2px" }}>
            Today's sales, fulfillment orders, and payout summary for your shop
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <Link href="/products" className="vendor-btn vendor-btn-primary">
            <Plus size={16} />
            <span>+ Add New Product</span>
          </Link>
          <a
            href={`http://localhost:3000/shop/${currentVendor.slug}`}
            target="_blank"
            rel="noreferrer"
            className="vendor-btn vendor-btn-secondary"
          >
            <span>Public Shop</span>
            <ExternalLink size={14} />
          </a>
        </div>
      </div>

      {/* 4 KPI Metrics Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
        
        {/* Total Sales */}
        <div className="vendor-card" style={{ padding: "18px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
            <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--text-muted)" }}>Total Sales Volume</span>
            <div style={{ padding: "6px", borderRadius: "6px", background: "var(--primary-light)", color: "var(--primary)" }}>
              <TrendingUp size={16} />
            </div>
          </div>
          <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--text-main)" }}>
            ৳{totalSales.toLocaleString()}
          </div>
          <div style={{ fontSize: "0.72rem", color: "var(--primary)", fontWeight: 700, marginTop: "6px" }}>
            Commission Rate: {currentVendor.commissionRate}%
          </div>
        </div>

        {/* Net Earnings */}
        <div className="vendor-card" style={{ padding: "18px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
            <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--text-muted)" }}>Net Earnings</span>
            <div style={{ padding: "6px", borderRadius: "6px", background: "#FEF3C7", color: "var(--accent)" }}>
              <DollarSign size={16} />
            </div>
          </div>
          <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--primary-dark)" }}>
            ৳{netEarnings.toLocaleString()}
          </div>
          <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: "6px" }}>
            Next Payout: Tuesday
          </div>
        </div>

        {/* Orders Count */}
        <div className="vendor-card" style={{ padding: "18px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
            <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--text-muted)" }}>Today's Orders</span>
            <div style={{ padding: "6px", borderRadius: "6px", background: "#EFF6FF", color: "#2563EB" }}>
              <ShoppingBag size={16} />
            </div>
          </div>
          <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--text-main)" }}>
            {orders.length}
          </div>
          <div style={{ fontSize: "0.72rem", color: pendingOrders.length > 0 ? "var(--accent)" : "var(--text-muted)", fontWeight: 700, marginTop: "6px" }}>
            {pendingOrders.length > 0 ? `⚡ ${pendingOrders.length} pending packaging` : "All orders fulfilled"}
          </div>
        </div>

        {/* Rating Score */}
        <div className="vendor-card" style={{ padding: "18px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
            <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--text-muted)" }}>Shop Rating</span>
            <div style={{ padding: "6px", borderRadius: "6px", background: "#FEF9C3", color: "#CA8A04" }}>
              <Star size={16} />
            </div>
          </div>
          <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--text-main)", display: "flex", alignItems: "center", gap: "6px" }}>
            <span>{currentVendor.rating}</span>
            <span style={{ fontSize: "0.85rem", color: "var(--accent)" }}>★</span>
          </div>
          <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: "6px" }}>
            {currentVendor.reviewsCount} Customer Reviews
          </div>
        </div>

      </div>

      {/* Action Alerts Row */}
      {lowStockProducts.length > 0 && (
        <div style={{ background: "#FEE2E2", border: "1px solid #FECACA", borderRadius: "var(--radius-md)", padding: "14px 18px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <AlertCircle size={20} color="#B91C1C" />
            <div>
              <div style={{ fontWeight: 800, fontSize: "0.9rem", color: "#991B1B" }}>Inventory Alert ({lowStockProducts.length})</div>
              <div style={{ fontSize: "0.75rem", color: "#B91C1C" }}>{lowStockProducts[0]?.nameEn || lowStockProducts[0]?.nameBn} is running low on stock ({lowStockProducts[0]?.stock} {lowStockProducts[0]?.baseUnit})</div>
            </div>
          </div>
          <Link href="/inventory" className="vendor-btn" style={{ background: "#B91C1C", color: "#FFF", fontSize: "0.78rem", padding: "6px 12px" }}>
            Restock Now →
          </Link>
        </div>
      )}

      {/* Grid: Orders Stream & Products */}
      <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: "24px", alignItems: "flex-start" }}>
        
        {/* Left: Sub-Orders Stream */}
        <div className="vendor-card">
          <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2 style={{ fontSize: "1.05rem", fontWeight: 800 }}>
              Today's Fulfillment Orders
            </h2>
            <Link href="/orders" style={{ fontSize: "0.8rem", color: "var(--primary)", fontWeight: 700 }}>
              View All Orders →
            </Link>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table className="vendor-table">
              <thead>
                <tr>
                  <th>Order No</th>
                  <th>Items</th>
                  <th>Net Earnings</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((ord) => (
                  <tr key={ord.id}>
                    <td>
                      <div style={{ fontWeight: 700, color: "var(--primary-dark)" }}>{ord.masterOrderNumber}</div>
                      <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>{ord.createdAt.split(",")[1]}</div>
                    </td>
                    <td>
                      <div style={{ fontSize: "0.8rem", fontWeight: 600 }}>
                        {ord.items.map((it) => `${it.nameEn || it.nameBn} (${it.quantity * it.weight} ${it.unit})`).join(", ")}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 800, color: "var(--primary-dark)" }}>৳{ord.netEarnings}</div>
                      <div style={{ fontSize: "0.68rem", color: "var(--text-muted)" }}>Commission: -৳{ord.commissionDeducted}</div>
                    </td>
                    <td>
                      <span className={`status-badge ${ord.status === "READY_FOR_PICKUP" ? "success" : "warning"}`}>
                        {ord.status}
                      </span>
                    </td>
                    <td>
                      <Link href="/orders" className="vendor-btn vendor-btn-secondary" style={{ padding: "4px 8px", fontSize: "0.72rem" }}>
                        Pack
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Own Store Products */}
        <div className="vendor-card">
          <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2 style={{ fontSize: "1.05rem", fontWeight: 800 }}>
              Shop Catalog
            </h2>
            <Link href="/products" style={{ fontSize: "0.8rem", color: "var(--primary)", fontWeight: 700 }}>
              Manage Products →
            </Link>
          </div>

          <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
            {products.map((p) => (
              <div key={p.id} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <img src={p.images[0]} alt="Img" style={{ width: "42px", height: "42px", borderRadius: "8px", objectFit: "cover" }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "0.85rem", fontWeight: 700 }}>{p.nameEn || p.nameBn}</div>
                  <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                    Stock: {p.stock} {p.baseUnit} • {p.pricingType === "variableWeight" ? "Variable Weight" : "Fixed"}
                  </div>
                </div>
                <div style={{ fontWeight: 800, fontSize: "0.9rem", color: "var(--primary-dark)" }}>
                  ৳{p.basePrice}/{p.baseUnit}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
