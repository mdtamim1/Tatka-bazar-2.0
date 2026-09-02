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
    area: "Dhaka",
    address: "",
    phone: "01701-000000",
    deliveryFee: 49,
    eta: "30-45 mins",
    isActive: true,
    managerName: "Hub Manager",
  });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    addBranch({
      ...formData,
      nameBn: formData.nameEn,
    });
    setIsModalOpen(false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ fontSize: "1.4rem", fontWeight: 800, color: "var(--text-main)" }}>
            Warehouse Hubs & Delivery Zone Configuration
          </h1>
          <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginTop: "2px" }}>
            Branch fulfillment hubs, delivery zones, and customer dispatch coverage
          </p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="admin-btn admin-btn-primary">
          <Plus size={16} />
          <span>+ Add New Hub</span>
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
                  <h3 style={{ fontSize: "1.05rem", fontWeight: 800 }}>{b.nameEn || b.nameBn}</h3>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{b.area}</div>
                </div>
              </div>
              <span className={`status-badge ${b.isActive ? "success" : "neutral"}`}>
                {b.isActive ? "Active Hub" : "Inactive"}
              </span>
            </div>

            <div style={{ fontSize: "0.85rem", color: "var(--text-main)", marginBottom: "14px", lineHeight: 1.4 }}>
              📍 <strong>Address:</strong> {b.address}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", background: "#F8FAFC", padding: "10px 14px", borderRadius: "8px", fontSize: "0.78rem", marginBottom: "14px" }}>
              <div>
                <div style={{ color: "var(--text-muted)" }}>Delivery Fee:</div>
                <div style={{ fontWeight: 800, color: "var(--primary-dark)" }}>৳{b.deliveryFee}</div>
              </div>
              <div>
                <div style={{ color: "var(--text-muted)" }}>Average ETA:</div>
                <div style={{ fontWeight: 800, color: "var(--accent)" }}>{b.eta}</div>
              </div>
              <div>
                <div style={{ color: "var(--text-muted)" }}>Hub Manager:</div>
                <div style={{ fontWeight: 700 }}>{b.managerName}</div>
              </div>
              <div>
                <div style={{ color: "var(--text-muted)" }}>Hotline:</div>
                <div style={{ fontWeight: 700 }}>{b.phone}</div>
              </div>
            </div>

            <div style={{ marginTop: "auto", display: "flex", justifyContent: "flex-end" }}>
              <button className="admin-btn admin-btn-secondary" style={{ padding: "5px 12px", fontSize: "0.78rem" }}>
                Edit Hub
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "460px" }}>
            <h2 style={{ fontSize: "1.2rem", fontWeight: 800, marginBottom: "16px" }}>Add New Express Hub</h2>
            <form onSubmit={handleAdd} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={{ fontSize: "0.8rem", fontWeight: 700, display: "block", marginBottom: "4px" }}>Hub Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mirpur Central Hub"
                  value={formData.nameEn}
                  onChange={(e) => setFormData({ ...formData, nameEn: e.target.value, nameBn: e.target.value })}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-medium)" }}
                />
              </div>
              <div>
                <label style={{ fontSize: "0.8rem", fontWeight: 700, display: "block", marginBottom: "4px" }}>Coverage Area</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mirpur & Pallabi, Dhaka"
                  value={formData.area}
                  onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-medium)" }}
                />
              </div>
              <div>
                <label style={{ fontSize: "0.8rem", fontWeight: 700, display: "block", marginBottom: "4px" }}>Full Address *</label>
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
                  <label style={{ fontSize: "0.8rem", fontWeight: 700, display: "block", marginBottom: "4px" }}>Delivery Fee (৳)</label>
                  <input
                    type="number"
                    value={formData.deliveryFee}
                    onChange={(e) => setFormData({ ...formData, deliveryFee: Number(e.target.value) })}
                    style={{ width: "100%", padding: "8px 12px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-medium)" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "0.8rem", fontWeight: 700, display: "block", marginBottom: "4px" }}>Estimated ETA</label>
                  <input
                    type="text"
                    value={formData.eta}
                    onChange={(e) => setFormData({ ...formData, eta: e.target.value })}
                    style={{ width: "100%", padding: "8px 12px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-medium)" }}
                  />
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px" }}>
                <button type="button" onClick={() => setIsModalOpen(false)} className="admin-btn admin-btn-secondary">Cancel</button>
                <button type="submit" className="admin-btn admin-btn-primary">Add Hub</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
