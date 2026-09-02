"use client";

import React, { useState } from "react";
import { Tag, Plus, Sparkles, Calendar, CheckCircle, Percent, DollarSign } from "lucide-react";
import { useAdmin } from "@/context/AdminContext";

export default function AdminMarketingPage() {
  const { coupons, addCoupon } = useAdmin();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [couponForm, setCouponForm] = useState({
    code: "",
    type: "PERCENTAGE" as "PERCENTAGE" | "FLAT",
    value: 10,
    minOrderAmount: 300,
    usageLimit: 500,
    expiresAt: "2026-12-31",
    isActive: true,
  });

  const handleAddCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    addCoupon({
      ...couponForm,
      code: couponForm.code.toUpperCase(),
    });
    setIsModalOpen(false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ fontSize: "1.4rem", fontWeight: 800, color: "var(--text-main)" }}>
            Marketing Campaigns, Coupons & Promotions
          </h1>
          <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginTop: "2px" }}>
            Create discount coupons, set usage thresholds, and manage promotional offers
          </p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="admin-btn admin-btn-primary">
          <Plus size={16} />
          <span>+ Create New Coupon</span>
        </button>
      </div>

      <div className="admin-card">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Coupon Code</th>
              <th>Discount Type & Value</th>
              <th>Min Order Amount</th>
              <th>Usage Count / Limit</th>
              <th>Expiry Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {coupons.map((c) => (
              <tr key={c.id}>
                <td>
                  <span style={{ fontWeight: 800, color: "var(--primary-dark)", background: "var(--primary-light)", padding: "4px 8px", borderRadius: "6px", fontFamily: "var(--font-mono)", fontSize: "0.9rem" }}>
                    🏷️ {c.code}
                  </span>
                </td>
                <td>
                  <span style={{ fontWeight: 700 }}>
                    {c.type === "PERCENTAGE" ? `${c.value}% Discount` : `৳${c.value} Flat Discount`}
                  </span>
                </td>
                <td>
                  <span style={{ fontWeight: 600 }}>৳{c.minOrderAmount}</span>
                </td>
                <td>
                  <div style={{ fontSize: "0.82rem" }}>
                    <strong>{c.usedCount}</strong> / {c.usageLimit} redeemed
                  </div>
                  <div style={{ width: "120px", height: "5px", background: "#F1F5F9", borderRadius: "999px", marginTop: "4px", overflow: "hidden" }}>
                    <div style={{ width: `${(c.usedCount / c.usageLimit) * 100}%`, height: "100%", background: "var(--primary)" }} />
                  </div>
                </td>
                <td>
                  <span style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>{c.expiresAt}</span>
                </td>
                <td>
                  <span className={`status-badge ${c.isActive ? "success" : "neutral"}`}>
                    {c.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "460px" }}>
            <h2 style={{ fontSize: "1.2rem", fontWeight: 800, marginBottom: "16px" }}>Create New Promo Code</h2>
            <form onSubmit={handleAddCoupon} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={{ fontSize: "0.8rem", fontWeight: 700, display: "block", marginBottom: "4px" }}>Coupon Code (e.g. WELCOME10) *</label>
                <input
                  type="text"
                  required
                  value={couponForm.code}
                  onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value })}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-medium)", textTransform: "uppercase" }}
                />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ fontSize: "0.8rem", fontWeight: 700, display: "block", marginBottom: "4px" }}>Discount Type</label>
                  <select
                    value={couponForm.type}
                    onChange={(e) => setCouponForm({ ...couponForm, type: e.target.value as any })}
                    style={{ width: "100%", padding: "8px 12px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-medium)", background: "#FFF" }}
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FLAT">Flat Amount (৳)</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: "0.8rem", fontWeight: 700, display: "block", marginBottom: "4px" }}>Discount Value *</label>
                  <input
                    type="number"
                    required
                    value={couponForm.value}
                    onChange={(e) => setCouponForm({ ...couponForm, value: Number(e.target.value) })}
                    style={{ width: "100%", padding: "8px 12px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-medium)" }}
                  />
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ fontSize: "0.8rem", fontWeight: 700, display: "block", marginBottom: "4px" }}>Min Order Amount (৳)</label>
                  <input
                    type="number"
                    value={couponForm.minOrderAmount}
                    onChange={(e) => setCouponForm({ ...couponForm, minOrderAmount: Number(e.target.value) })}
                    style={{ width: "100%", padding: "8px 12px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-medium)" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "0.8rem", fontWeight: 700, display: "block", marginBottom: "4px" }}>Max Redemptions Limit</label>
                  <input
                    type="number"
                    value={couponForm.usageLimit}
                    onChange={(e) => setCouponForm({ ...couponForm, usageLimit: Number(e.target.value) })}
                    style={{ width: "100%", padding: "8px 12px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-medium)" }}
                  />
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px" }}>
                <button type="button" onClick={() => setIsModalOpen(false)} className="admin-btn admin-btn-secondary">Cancel</button>
                <button type="submit" className="admin-btn admin-btn-primary">Publish Coupon</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
