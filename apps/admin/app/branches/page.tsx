"use client";

import React, { useState } from "react";
import { MapPin, Plus, Phone, Clock, DollarSign, Check, X } from "lucide-react";
import { useAdmin } from "@/context/AdminContext";
import { AdminBranch } from "@/types";

export default function AdminBranchesPage() {
  const { branches, addBranch } = useAdmin();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    nameBn: "",
    nameEn: "",
    area: "ঢাকা (Dhaka)",
    address: "",
    phone: "০১৭০১-০০০০০০",
    deliveryFee: 49,
    eta: "৩০-৪৫ মিনিট",
    isActive: true,
    managerName: "ম্যানেজার নাম",
  });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    addBranch(formData);
    setIsModalOpen(false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ fontSize: "1.4rem", fontWeight: 800, color: "var(--text-main)" }}>
            ওয়্যারহাউস হাব ও ডেলিভারি জোন কনফিগারেশন
          </h1>
          <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginTop: "2px" }}>
            ব্রাঞ্চ ও ফুলফিলমেন্ট হাবের তথ্য সরাসরি গ্রাহক স্টোরফ্রন্ট ফুটারে লাইভ প্রদর্শিত হয়
          </p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="admin-btn admin-btn-primary">
          <Plus size={16} />
          <span>+ নতুন হাব যুক্ত করুন</span>
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "20px" }}>
        {branches.map((b) => (
          <div key={b.id} className="admin-card" style={{ padding: "20px", display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div style={{ padding: "8px", borderRadius: "8px", background: "var(--primary-light)", color: "var(--primary)" }}>
                  <MapPin size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: "1.05rem", fontWeight: 800 }}>{b.nameBn}</h3>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{b.nameEn}</div>
                </div>
              </div>
              <span className={`status-badge ${b.isActive ? "success" : "neutral"}`}>
                {b.isActive ? "সক্রিয় হাব" : "নিষ্ক্রিয়"}
              </span>
            </div>

            <div style={{ fontSize: "0.85rem", color: "var(--text-main)", marginBottom: "14px", lineHeight: 1.4 }}>
              📍 <strong>ঠিকানা:</strong> {b.address}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", background: "#F8FAFC", padding: "10px 14px", borderRadius: "8px", fontSize: "0.78rem", marginBottom: "14px" }}>
              <div>
                <div style={{ color: "var(--text-muted)" }}>ডেলিভারি ফি:</div>
                <div style={{ fontWeight: 800, color: "var(--primary-dark)" }}>৳{b.deliveryFee}</div>
              </div>
              <div>
                <div style={{ color: "var(--text-muted)" }}>গড় ETA:</div>
                <div style={{ fontWeight: 800, color: "var(--accent)" }}>{b.eta}</div>
              </div>
              <div>
                <div style={{ color: "var(--text-muted)" }}>হাব ম্যানেজার:</div>
                <div style={{ fontWeight: 700 }}>{b.managerName}</div>
              </div>
              <div>
                <div style={{ color: "var(--text-muted)" }}>হটলাইন:</div>
                <div style={{ fontWeight: 700 }}>{b.phone}</div>
              </div>
            </div>

            <div style={{ marginTop: "auto", display: "flex", justifyContent: "flex-end" }}>
              <button className="admin-btn admin-btn-secondary" style={{ padding: "5px 12px", fontSize: "0.78rem" }}>
                এডিট হাব
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "460px" }}>
            <h2 style={{ fontSize: "1.2rem", fontWeight: 800, marginBottom: "16px" }}>নতুন হাব / ওয়্যারহাউস যোগ</h2>
            <form onSubmit={handleAdd} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={{ fontSize: "0.8rem", fontWeight: 700, display: "block", marginBottom: "4px" }}>হাবের নাম (বাংলা) *</label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: মিরপুর সেন্ট্রাল হাব"
                  value={formData.nameBn}
                  onChange={(e) => setFormData({ ...formData, nameBn: e.target.value })}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-medium)" }}
                />
              </div>
              <div>
                <label style={{ fontSize: "0.8rem", fontWeight: 700, display: "block", marginBottom: "4px" }}>Hub Name (English) *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mirpur Central Hub"
                  value={formData.nameEn}
                  onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-medium)" }}
                />
              </div>
              <div>
                <label style={{ fontSize: "0.8rem", fontWeight: 700, display: "block", marginBottom: "4px" }}>সম্পূর্ণ ঠিকানা *</label>
                <input
                  type="text"
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-medium)" }}
                />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ fontSize: "0.8rem", fontWeight: 700, display: "block", marginBottom: "4px" }}>ডেলিভারি ফি (৳)</label>
                  <input
                    type="number"
                    value={formData.deliveryFee}
                    onChange={(e) => setFormData({ ...formData, deliveryFee: Number(e.target.value) })}
                    style={{ width: "100%", padding: "8px 12px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-medium)" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "0.8rem", fontWeight: 700, display: "block", marginBottom: "4px" }}>আনুমানিক সময় (ETA)</label>
                  <input
                    type="text"
                    value={formData.eta}
                    onChange={(e) => setFormData({ ...formData, eta: e.target.value })}
                    style={{ width: "100%", padding: "8px 12px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-medium)" }}
                  />
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px" }}>
                <button type="button" onClick={() => setIsModalOpen(false)} className="admin-btn admin-btn-secondary">বাতিল</button>
                <button type="submit" className="admin-btn admin-btn-primary">হাব যুক্ত করুন</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
