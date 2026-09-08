"use client";

import React, { useState } from "react";
import { Tag, Plus, X, Check, ToggleLeft, ToggleRight, Percent, DollarSign } from "lucide-react";
import { useAdmin } from "@/context/AdminContext";
import { AdminCoupon } from "@/types";

function CouponModal({ onClose }: { onClose: () => void }) {
  const { addCoupon } = useAdmin();
  const [form, setForm] = useState({
    code: "", type: "FLAT" as "FLAT" | "PERCENTAGE",
    value: 0, minOrderAmount: 500, usageLimit: 100, expiresAt: "",
    isActive: true,
  });
  const set = (k: string, v: any) => setForm(p => ({ ...p, [k]: v }));

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: "460px" }}>
        <div className="modal-header">
          <div className="modal-title">➕ Create Coupon</div>
          <button className="admin-btn admin-btn-ghost admin-btn-icon" onClick={onClose}><X size={16} /></button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          <div style={{ gridColumn: "1/-1" }}>
            <label className="admin-label">Coupon Code *</label>
            <input className="admin-input" value={form.code} onChange={e => set("code", e.target.value.toUpperCase())} placeholder="e.g. SAVE50" style={{ textTransform: "uppercase", fontFamily: "var(--font-mono)", fontWeight: 700 }} />
          </div>
          <div>
            <label className="admin-label">Type</label>
            <select className="admin-select" value={form.type} onChange={e => set("type", e.target.value)}>
              <option value="FLAT">৳ Flat Discount</option>
              <option value="PERCENTAGE">% Percentage</option>
            </select>
          </div>
          <div>
            <label className="admin-label">Value ({form.type === "FLAT" ? "৳" : "%"})</label>
            <input className="admin-input" type="number" min="0" value={form.value} onChange={e => set("value", parseFloat(e.target.value))} />
          </div>
          <div>
            <label className="admin-label">Min Order (৳)</label>
            <input className="admin-input" type="number" min="0" value={form.minOrderAmount} onChange={e => set("minOrderAmount", parseFloat(e.target.value))} />
          </div>
          <div>
            <label className="admin-label">Usage Limit</label>
            <input className="admin-input" type="number" min="1" value={form.usageLimit} onChange={e => set("usageLimit", parseInt(e.target.value))} />
          </div>
          <div>
            <label className="admin-label">Expires At</label>
            <input className="admin-input" type="date" value={form.expiresAt} onChange={e => set("expiresAt", e.target.value)} />
          </div>
        </div>
        <div className="modal-footer">
          <button className="admin-btn admin-btn-secondary" onClick={onClose}>Cancel</button>
          <button className="admin-btn admin-btn-primary" disabled={!form.code || form.value <= 0}
            onClick={() => {
              addCoupon({ code: form.code, type: form.type, value: form.value, minOrderAmount: form.minOrderAmount, usageLimit: form.usageLimit, expiresAt: form.expiresAt, isActive: true });
              onClose();
            }}>
            <Check size={14} /> Create Coupon
          </button>
        </div>
      </div>
    </div>
  );
}

export default function MarketingPage() {
  const { coupons, toggleCoupon } = useAdmin();
  const [showForm, setShowForm] = useState(false);

  const active = coupons.filter(c => c.isActive);
  const expired = coupons.filter(c => !c.isActive);
  const totalSaved = coupons.reduce((s, c) => s + c.usedCount * (c.type === "FLAT" ? c.value : c.value * 5), 0); // approx

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "22px" }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Marketing & Coupons</h1>
          <p className="page-subtitle">{active.length} active coupons · {coupons.reduce((s, c) => s + c.usedCount, 0)} total uses</p>
        </div>
        <button className="admin-btn admin-btn-primary" onClick={() => setShowForm(true)}><Plus size={14} /> Create Coupon</button>
      </div>

      {/* Stats */}
      <div className="kpi-grid" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
        {[
          { label: "Active Coupons", value: active.length, color: "var(--green)", glow: "var(--green-glass)" },
          { label: "Total Redemptions", value: coupons.reduce((s, c) => s + c.usedCount, 0), color: "var(--indigo)", glow: "var(--indigo-glass)" },
          { label: "Expired / Disabled", value: expired.length, color: "var(--text-3)", glow: "var(--bg-elevated)" },
        ].map(s => (
          <div key={s.label} className="kpi-card" style={{ "--kpi-accent": s.color, "--kpi-glow": s.glow } as React.CSSProperties}>
            <div style={{ fontSize: "1.6rem", fontWeight: 900, color: "var(--text-0)" }}>{s.value}</div>
            <div style={{ fontSize: "0.78rem", color: "var(--text-3)", marginTop: "4px" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Coupons */}
      <div className="admin-card">
        <div style={{ padding: "18px 22px", borderBottom: "1px solid var(--border-1)", fontWeight: 800, color: "var(--text-0)" }}>All Coupons</div>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Type</th>
                <th>Value</th>
                <th>Min Order</th>
                <th>Used</th>
                <th>Limit</th>
                <th>Expires</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map(c => (
                <tr key={c.id}>
                  <td>
                    <span className="mono" style={{ fontWeight: 800, fontSize: "0.9rem", color: "var(--text-0)", background: "var(--bg-elevated)", padding: "3px 8px", borderRadius: "var(--r-sm)" }}>
                      {c.code}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${c.type === "PERCENTAGE" ? "info" : "purple"}`}>
                      {c.type === "FLAT" ? "৳ Flat" : "% Off"}
                    </span>
                  </td>
                  <td>
                    <span className="mono" style={{ fontWeight: 700, color: "var(--green-bright)" }}>
                      {c.type === "FLAT" ? `৳${c.value}` : `${c.value}%`}
                    </span>
                  </td>
                  <td>৳{c.minOrderAmount}</td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ fontWeight: 700 }}>{c.usedCount}</span>
                      <div className="progress-bar-wrap" style={{ width: "60px" }}>
                        <div className="progress-bar-fill" style={{
                          width: `${Math.min(100, (c.usedCount / c.usageLimit) * 100)}%`,
                          background: c.usedCount >= c.usageLimit ? "var(--red)" : "var(--green)",
                        }} />
                      </div>
                    </div>
                  </td>
                  <td>{c.usageLimit}</td>
                  <td style={{ fontSize: "0.78rem", color: "var(--text-3)" }}>{c.expiresAt || "No expiry"}</td>
                  <td><span className={`status-badge ${c.isActive ? "success" : "neutral"}`}>{c.isActive ? "Active" : "Disabled"}</span></td>
                  <td>
                    <button className="admin-btn admin-btn-ghost admin-btn-sm" onClick={() => toggleCoupon(c.id)}>
                      {c.isActive ? <ToggleRight size={14} color="var(--green)" /> : <ToggleLeft size={14} />}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && <CouponModal onClose={() => setShowForm(false)} />}
    </div>
  );
}
