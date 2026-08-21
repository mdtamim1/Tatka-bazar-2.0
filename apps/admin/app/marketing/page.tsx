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
            মার্কেটিং টুলস, কুপন ও প্রমোশন ইঞ্জিন
          </h1>
          <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginTop: "2px" }}>
            ডিসকাউন্ট কুপন তৈরি, ব্যবহারের সীমা নির্ধারণ ও হিরো ব্যানার শিডিউলিং
          </p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="admin-btn admin-btn-primary">
          <Plus size={16} />
          <span>+ নতুন কুপন তৈরি করুন</span>
        </button>
      </div>

      <div className="admin-card">
        <table className="admin-table">
          <thead>
            <tr>
              <th>কুপন কোড</th>
              <th>ডিসকাউন্ট টাইপ ও পরিমাণ</th>
              <th>সর্বনিম্ন অর্ডার</th>
              <th>ব্যবহারের সীমা ও মোট ব্যবহার</th>
              <th>মেয়াদ শেষ</th>
              <th>স্ট্যাটাস</th>
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
                    {c.type === "PERCENTAGE" ? `${c.value}% মূল্যছাড়` : `৳${c.value} ফ্ল্যাট ছাড়`}
                  </span>
                </td>
                <td>
                  <span style={{ fontWeight: 600 }}>৳{c.minOrderAmount}</span>
                </td>
                <td>
                  <div style={{ fontSize: "0.82rem" }}>
                    <strong>{c.usedCount}</strong> / {c.usageLimit} বার ব্যবহৃত
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
                    {c.isActive ? "সক্রিয়" : "নিষ্ক্রিয়"}
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
            <h2 style={{ fontSize: "1.2rem", fontWeight: 800, marginBottom: "16px" }}>নতুন প্রোমোকোড কুপন তৈরি</h2>
            <form onSubmit={handleAddCoupon} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={{ fontSize: "0.8rem", fontWeight: 700, display: "block", marginBottom: "4px" }}>কুপন কোড (যেমন: WELCOME10) *</label>
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
                  <label style={{ fontSize: "0.8rem", fontWeight: 700, display: "block", marginBottom: "4px" }}>ডিসকাউন্ট ধরন</label>
                  <select
                    value={couponForm.type}
                    onChange={(e) => setCouponForm({ ...couponForm, type: e.target.value as any })}
                    style={{ width: "100%", padding: "8px 12px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-medium)", background: "#FFF" }}
                  >
                    <option value="PERCENTAGE">শতকরা (%) ছাড়</option>
                    <option value="FLAT">ফ্ল্যাট টাকা (৳) ছাড়</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: "0.8rem", fontWeight: 700, display: "block", marginBottom: "4px" }}>ছাড়ের পরিমাণ *</label>
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
                  <label style={{ fontSize: "0.8rem", fontWeight: 700, display: "block", marginBottom: "4px" }}>সর্বনিম্ন অর্ডার (৳)</label>
                  <input
                    type="number"
                    value={couponForm.minOrderAmount}
                    onChange={(e) => setCouponForm({ ...couponForm, minOrderAmount: Number(e.target.value) })}
                    style={{ width: "100%", padding: "8px 12px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-medium)" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "0.8rem", fontWeight: 700, display: "block", marginBottom: "4px" }}>ব্যবহারের সীমা (বার)</label>
                  <input
                    type="number"
                    value={couponForm.usageLimit}
                    onChange={(e) => setCouponForm({ ...couponForm, usageLimit: Number(e.target.value) })}
                    style={{ width: "100%", padding: "8px 12px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-medium)" }}
                  />
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px" }}>
                <button type="button" onClick={() => setIsModalOpen(false)} className="admin-btn admin-btn-secondary">বাতিল</button>
                <button type="submit" className="admin-btn admin-btn-primary">কুপন প্রকাশ করুন</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
