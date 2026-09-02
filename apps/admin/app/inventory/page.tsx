"use client";

import React, { useState } from "react";
import { Warehouse, AlertTriangle, Clock, Plus, Minus, ArrowDownUp, ShieldCheck, Check } from "lucide-react";
import { useAdmin } from "@/context/AdminContext";
import { AdminProduct } from "@/types";

export default function AdminInventoryPage() {
  const { products, updateProduct, addAuditLog } = useAdmin();

  const [selectedProduct, setSelectedProduct] = useState<AdminProduct | null>(null);
  const [adjustAmount, setAdjustAmount] = useState<number>(10);
  const [adjustReason, setAdjustReason] = useState("Morning fresh stock arrival (Stock In)");

  const lowStockProducts = products.filter((p) => p.stock <= p.lowStockAlert);

  const handleAdjustStock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    const newStock = Math.max(0, selectedProduct.stock + adjustAmount);
    updateProduct(selectedProduct.id, { stock: newStock });
    addAuditLog("STOCK_ADJUSTMENT", "Inventory", selectedProduct.id, `Stock adjusted by ${adjustAmount > 0 ? "+" : ""}${adjustAmount} ${selectedProduct.baseUnit}. Reason: ${adjustReason}`);
    setSelectedProduct(null);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 style={{ fontSize: "1.4rem", fontWeight: 800, color: "var(--text-main)" }}>
            Inventory Control & Stock Audit
          </h1>
          <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginTop: "2px" }}>
            Real-time stock balance, low-stock threshold triggers, and expiry tracking
          </p>
        </div>
      </div>

      {/* Inventory Summary Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
        <div className="admin-card" style={{ padding: "18px" }}>
          <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 700 }}>Total Catalog Products</div>
          <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--text-main)", marginTop: "4px" }}>
            {products.length} Items
          </div>
        </div>

        <div className="admin-card" style={{ padding: "18px", borderLeft: "4px solid var(--danger)" }}>
          <div style={{ fontSize: "0.8rem", color: "var(--danger)", fontWeight: 700 }}>Low-Stock Alerts</div>
          <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--danger)", marginTop: "4px" }}>
            {lowStockProducts.length} Products
          </div>
        </div>

        <div className="admin-card" style={{ padding: "18px", borderLeft: "4px solid var(--primary)" }}>
          <div style={{ fontSize: "0.8rem", color: "var(--primary-dark)", fontWeight: 700 }}>Perishable Fresh Items</div>
          <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--primary-dark)", marginTop: "4px" }}>
            {products.filter((p) => p.expiryDate).length} Products
          </div>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="admin-card">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Product & SKU</th>
              <th>Category</th>
              <th>Current Stock</th>
              <th>Alert Threshold</th>
              <th>Expiry / Freshness</th>
              <th>Stock Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => {
              const isLow = p.stock <= p.lowStockAlert;
              return (
                <tr key={p.id}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <img src={p.images[0]} alt="Img" style={{ width: "40px", height: "40px", borderRadius: "6px", objectFit: "cover" }} />
                      <div>
                        <div style={{ fontWeight: 700 }}>{p.nameEn || p.nameBn}</div>
                        <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>{p.sku}</div>
                      </div>
                    </div>
                  </td>
                  <td>{p.categoryName}</td>
                  <td>
                    <span style={{ fontWeight: 800, fontSize: "1rem", color: isLow ? "var(--danger)" : "var(--primary-dark)" }}>
                      {p.stock} {p.baseUnit}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                      {p.lowStockAlert} {p.baseUnit}
                    </span>
                  </td>
                  <td>
                    {p.expiryDate ? (
                      <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "0.78rem", color: "var(--accent)" }}>
                        <Clock size={13} />
                        <span>{p.expiryDate}</span>
                      </div>
                    ) : (
                      <span style={{ color: "var(--text-subtle)", fontSize: "0.75rem" }}>Non-perishable</span>
                    )}
                  </td>
                  <td>
                    <span className={`status-badge ${isLow ? "danger" : "success"}`}>
                      {isLow ? "Low Stock" : "Sufficient"}
                    </span>
                  </td>
                  <td>
                    <button
                      onClick={() => setSelectedProduct(p)}
                      className="admin-btn admin-btn-secondary"
                      style={{ padding: "5px 10px", fontSize: "0.75rem" }}
                    >
                      <ArrowDownUp size={14} />
                      <span>Adjust Stock</span>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Stock Adjustment Modal */}
      {selectedProduct && (
        <div className="modal-overlay" onClick={() => setSelectedProduct(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "460px" }}>
            <h2 style={{ fontSize: "1.15rem", fontWeight: 800, marginBottom: "8px" }}>
              📦 Stock Adjustment & Audit
            </h2>
            <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginBottom: "16px" }}>
              {selectedProduct.nameEn || selectedProduct.nameBn} (Current: {selectedProduct.stock} {selectedProduct.baseUnit})
            </p>

            <form onSubmit={handleAdjustStock} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={{ fontSize: "0.8rem", fontWeight: 700, display: "block", marginBottom: "4px" }}>
                  Adjustment Units (+ addition / - deduction) *
                </label>
                <input
                  type="number"
                  required
                  value={adjustAmount}
                  onChange={(e) => setAdjustAmount(Number(e.target.value))}
                  style={{ width: "100%", padding: "10px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-medium)" }}
                />
                <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: "3px", display: "block" }}>
                  New final stock will be: {Math.max(0, selectedProduct.stock + adjustAmount)} {selectedProduct.baseUnit}
                </span>
              </div>

              <div>
                <label style={{ fontSize: "0.8rem", fontWeight: 700, display: "block", marginBottom: "4px" }}>
                  Adjustment Reason / Audit Note *
                </label>
                <select
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  style={{ width: "100%", padding: "10px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-medium)", background: "#FFF" }}
                >
                  <option value="Morning fresh stock arrival (Stock In)">Morning fresh stock arrival (Stock In)</option>
                  <option value="Damaged or spoiled goods disposal (Waste)">Damaged or spoiled goods disposal (Waste)</option>
                  <option value="Physical count audit correction (Recount)">Physical count audit correction (Recount)</option>
                  <option value="Vendor return or exchange (Vendor Return)">Vendor return or exchange (Vendor Return)</option>
                </select>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "8px" }}>
                <button type="button" onClick={() => setSelectedProduct(null)} className="admin-btn admin-btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="admin-btn admin-btn-primary">
                  Confirm Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
