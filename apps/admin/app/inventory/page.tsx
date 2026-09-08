"use client";

import React, { useState } from "react";
import { Warehouse, AlertTriangle, Search, TrendingDown, Package, RefreshCw } from "lucide-react";
import { useAdmin } from "@/context/AdminContext";

export default function InventoryPage() {
  const { products, updateProduct } = useAdmin();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"ALL" | "LOW" | "OUT">("ALL");
  const [editingStock, setEditingStock] = useState<string | null>(null);
  const [stockInput, setStockInput] = useState("");

  const filtered = products.filter(p => {
    const ms = !search || p.nameEn.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase());
    const mf = filter === "ALL" || (filter === "LOW" && p.stock <= p.lowStockAlert && p.stock > 0) || (filter === "OUT" && p.stock === 0);
    return ms && mf;
  }).sort((a, b) => a.stock - b.stock);

  const lowStockCount = products.filter(p => p.stock <= p.lowStockAlert && p.stock > 0).length;
  const outOfStockCount = products.filter(p => p.stock === 0).length;
  const totalValue = products.reduce((s, p) => s + p.stock * p.basePrice, 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "22px" }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Inventory</h1>
          <p className="page-subtitle">Real-time stock levels across all products</p>
        </div>
      </div>

      <div className="kpi-grid" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
        {[
          { label: "Total SKUs", value: products.length, color: "var(--indigo)", glow: "var(--indigo-glass)" },
          { label: "Low Stock", value: lowStockCount, color: "var(--amber)", glow: "var(--amber-glass)", urgent: lowStockCount > 0 },
          { label: "Out of Stock", value: outOfStockCount, color: "var(--red)", glow: "var(--red-glass)", urgent: outOfStockCount > 0 },
          { label: "Inventory Value", value: `৳${(totalValue / 1000).toFixed(0)}K`, color: "var(--green)", glow: "var(--green-glass)" },
        ].map(s => (
          <div key={s.label} className="kpi-card" style={{ "--kpi-accent": s.color, "--kpi-glow": s.glow } as React.CSSProperties}>
            <div style={{ fontSize: "1.6rem", fontWeight: 900, color: s.urgent ? s.color : "var(--text-0)" }}>{s.value}</div>
            <div style={{ fontSize: "0.78rem", color: "var(--text-3)", marginTop: "4px" }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
        <div className="search-wrap" style={{ flex: 1, minWidth: "220px" }}>
          <Search size={14} className="search-icon" />
          <input className="search-input" placeholder="Search product or SKU…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="tab-bar">
          {[
            { key: "ALL", label: "All Products", count: products.length },
            { key: "LOW", label: "⚠ Low Stock", count: lowStockCount },
            { key: "OUT", label: "❌ Out of Stock", count: outOfStockCount },
          ].map(t => (
            <button key={t.key} className={`tab-pill ${filter === t.key ? "active" : ""}`} onClick={() => setFilter(t.key as any)}>
              {t.label} <span className="tab-count">{t.count}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="admin-card">
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>SKU</th>
                <th>Category</th>
                <th>Stock Level</th>
                <th>Alert Level</th>
                <th>Value in Stock</th>
                <th>Status</th>
                <th>Update Stock</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => {
                const stockPct = Math.min(100, (p.stock / Math.max(p.lowStockAlert * 3, 1)) * 100);
                const isLow = p.stock <= p.lowStockAlert && p.stock > 0;
                const isOut = p.stock === 0;
                return (
                  <tr key={p.id}>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: "0.84rem" }}>{p.nameEn.length > 36 ? p.nameEn.slice(0, 36) + "…" : p.nameEn}</div>
                      <div style={{ fontSize: "0.70rem", color: "var(--text-3)" }}>{p.vendorName}</div>
                    </td>
                    <td><span className="mono" style={{ fontSize: "0.78rem" }}>{p.sku}</span></td>
                    <td style={{ fontSize: "0.80rem" }}>{p.categoryName}</td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <span style={{ fontWeight: 800, fontSize: "1rem", color: isOut ? "var(--red)" : isLow ? "var(--amber)" : "var(--text-0)", minWidth: "32px" }}>
                          {p.stock}
                        </span>
                        <div className="progress-bar-wrap" style={{ width: "80px" }}>
                          <div className="progress-bar-fill" style={{
                            width: `${stockPct}%`,
                            background: isOut ? "var(--red)" : isLow ? "var(--amber)" : "var(--green)",
                          }} />
                        </div>
                      </div>
                    </td>
                    <td style={{ fontSize: "0.82rem" }}>{p.lowStockAlert}</td>
                    <td>
                      <span className="mono" style={{ color: "var(--green-bright)", fontSize: "0.82rem" }}>
                        ৳{(p.stock * p.basePrice).toLocaleString()}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge ${isOut ? "danger" : isLow ? "warning" : "success"}`}>
                        {isOut ? "Out of Stock" : isLow ? "Low Stock" : "OK"}
                      </span>
                    </td>
                    <td onClick={e => e.stopPropagation()}>
                      {editingStock === p.id ? (
                        <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                          <input
                            className="admin-input"
                            style={{ width: "72px", padding: "5px 8px", fontSize: "0.82rem" }}
                            type="number"
                            min="0"
                            value={stockInput}
                            onChange={e => setStockInput(e.target.value)}
                            autoFocus
                          />
                          <button className="admin-btn admin-btn-primary admin-btn-sm" onClick={() => {
                            updateProduct(p.id, { stock: parseInt(stockInput) || 0 });
                            setEditingStock(null);
                          }}>✓</button>
                          <button className="admin-btn admin-btn-ghost admin-btn-sm" onClick={() => setEditingStock(null)}>✕</button>
                        </div>
                      ) : (
                        <button className="admin-btn admin-btn-secondary admin-btn-sm" onClick={() => { setEditingStock(p.id); setStockInput(String(p.stock)); }}>
                          <Package size={12} /> Update
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="empty-state"><div className="empty-state-icon">📦</div><div className="empty-state-title">No products match filters</div></div>
          )}
        </div>
      </div>
    </div>
  );
}
