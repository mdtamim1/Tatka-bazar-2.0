"use client";

import React, { useState } from "react";
import { Warehouse, AlertTriangle, Clock, Plus, Minus, ArrowDownUp, ShieldCheck, Check } from "lucide-react";
import { useAdmin } from "@/context/AdminContext";
import { AdminProduct } from "@/types";

export default function AdminInventoryPage() {
  const { products, updateProduct, addAuditLog } = useAdmin();

  const [selectedProduct, setSelectedProduct] = useState<AdminProduct | null>(null);
  const [adjustAmount, setAdjustAmount] = useState<number>(10);
  const [adjustReason, setAdjustReason] = useState("নতুন ভোরের তাজা স্টক ইনওয়ার্ড");

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
            ইনভেন্টরি কন্ট্রোল ও স্টক অডিট
          </h1>
          <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginTop: "2px" }}>
            রিয়েল-টাইম স্টক লেভেল, লো-স্টক থ্রেশহোল্ড ও পচনশীল পণ্যের মেয়াদ ট্র্যাকিং
          </p>
        </div>
      </div>

      {/* Inventory Summary Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
        <div className="admin-card" style={{ padding: "18px" }}>
          <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 700 }}>মোট ক্যাটালগ পণ্য</div>
          <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--text-main)", marginTop: "4px" }}>
            {products.length} আইটেম
          </div>
        </div>

        <div className="admin-card" style={{ padding: "18px", borderLeft: "4px solid var(--danger)" }}>
          <div style={{ fontSize: "0.8rem", color: "var(--danger)", fontWeight: 700 }}>লো-স্টক সতর্কবার্তা</div>
          <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--danger)", marginTop: "4px" }}>
            {lowStockProducts.length} টি পণ্য
          </div>
        </div>

        <div className="admin-card" style={{ padding: "18px", borderLeft: "4px solid var(--primary)" }}>
          <div style={{ fontSize: "0.8rem", color: "var(--primary-dark)", fontWeight: 700 }}>পচনশীল তাজা আইটেম</div>
          <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--primary-dark)", marginTop: "4px" }}>
            {products.filter((p) => p.expiryDate).length} টি পণ্য
          </div>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="admin-card">
        <table className="admin-table">
          <thead>
            <tr>
              <th>পণ্য ও SKU</th>
              <th>ক্যাটাগরি</th>
              <th>বর্তমান মজুদ (Stock)</th>
              <th>অ্যালার্ট সীমা</th>
              <th>মেয়াদ / ফ্রেশনেস</th>
              <th>স্টক স্থিতি</th>
              <th>অ্যাকশন</th>
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
                        <div style={{ fontWeight: 700 }}>{p.nameBn}</div>
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
                      <span style={{ color: "var(--text-subtle)", fontSize: "0.75rem" }}>অনির্দিষ্ট</span>
                    )}
                  </td>
                  <td>
                    <span className={`status-badge ${isLow ? "danger" : "success"}`}>
                      {isLow ? "লো স্টক" : "পর্যাপ্ত"}
                    </span>
                  </td>
                  <td>
                    <button
                      onClick={() => setSelectedProduct(p)}
                      className="admin-btn admin-btn-secondary"
                      style={{ padding: "5px 10px", fontSize: "0.75rem" }}
                    >
                      <ArrowDownUp size={14} />
                      <span>স্টক সমন্বয়</span>
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
              📦 স্টক অ্যাডজাস্টমেন্ট ও অডিট
            </h2>
            <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginBottom: "16px" }}>
              {selectedProduct.nameBn} (বর্তমান মজুদ: {selectedProduct.stock} {selectedProduct.baseUnit})
            </p>

            <form onSubmit={handleAdjustStock} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={{ fontSize: "0.8rem", fontWeight: 700, display: "block", marginBottom: "4px" }}>
                  সমন্বয়ের পরিমাণ (+ যোগ / - বিয়োগ) *
                </label>
                <input
                  type="number"
                  required
                  value={adjustAmount}
                  onChange={(e) => setAdjustAmount(Number(e.target.value))}
                  style={{ width: "100%", padding: "10px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-medium)" }}
                />
                <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: "3px", display: "block" }}>
                  নতুন চূড়ান্ত স্টক হবে: {Math.max(0, selectedProduct.stock + adjustAmount)} {selectedProduct.baseUnit}
                </span>
              </div>

              <div>
                <label style={{ fontSize: "0.8rem", fontWeight: 700, display: "block", marginBottom: "4px" }}>
                  সমন্বয়ের কারণ / অডিট নোট *
                </label>
                <select
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  style={{ width: "100%", padding: "10px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-medium)", background: "#FFF" }}
                >
                  <option value="নতুন ভোরের তাজা স্টক ইনওয়ার্ড">নতুন ভোরের তাজা স্টক ইনওয়ার্ড (Stock In)</option>
                  <option value="নষ্ট / পচে যাওয়া বর্জ্য বাদ (Damage/Waste)">নষ্ট / পচে যাওয়া বর্জ্য বাদ (Damage/Waste)</option>
                  <option value="ভৌত অডিট গণনায় অমিল সংশোধন">ভৌত অডিট গণনায় অমিল সংশোধন (Audit Recount)</option>
                  <option value="ভেন্ডর রিটার্ন বা এক্সচেঞ্জ">ভেন্ডর রিটার্ন বা এক্সচেঞ্জ (Vendor Return)</option>
                </select>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "8px" }}>
                <button type="button" onClick={() => setSelectedProduct(null)} className="admin-btn admin-btn-secondary">
                  বাতিল
                </button>
                <button type="submit" className="admin-btn admin-btn-primary">
                  সমন্বয় নিশ্চিত করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
