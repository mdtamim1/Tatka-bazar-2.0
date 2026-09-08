"use client";

import React, { useState } from "react";
import { Building2, Plus, X, Check, MapPin, Phone, ToggleRight, ToggleLeft, Edit } from "lucide-react";
import { useAdmin } from "@/context/AdminContext";
import { AdminB2BAccount, AdminBranch } from "@/types";

export default function BranchesPage() {
  const { branches, addBranch, updateBranch, b2bAccounts, approveB2BAccount, rejectB2BAccount } = useAdmin();
  const [showAddBranch, setShowAddBranch] = useState(false);
  const [form, setForm] = useState({ nameEn: "", nameBn: "", area: "", city: "Dhaka", address: "", phone: "", deliveryFee: 49, eta: "30-45 min", managerName: "", coverageZones: "" });
  const set = (k: string, v: any) => setForm(p => ({ ...p, [k]: v }));

  const pendingB2B = b2bAccounts.filter(b => b.status === "PENDING");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Branches & B2B</h1>
          <p className="page-subtitle">{branches.length} hubs · {b2bAccounts.filter(b => b.status === "APPROVED").length} B2B accounts</p>
        </div>
        <button className="admin-btn admin-btn-primary" onClick={() => setShowAddBranch(true)}><Plus size={14} /> Add Branch</button>
      </div>

      {/* Branches */}
      <div>
        <div className="section-label"><MapPin size={11} /> Delivery Hubs</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px" }}>
          {branches.map(b => (
            <div key={b.id} className="admin-card" style={{ padding: "18px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: "0.95rem", color: "var(--text-0)" }}>{b.nameEn}</div>
                  <div style={{ fontSize: "0.72rem", color: "var(--text-3)", marginTop: "2px" }}>{b.area}, {b.city}</div>
                </div>
                <span className={`status-badge ${b.isActive ? "success" : "neutral"}`}>{b.isActive ? "Active" : "Inactive"}</span>
              </div>
              <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
                <div style={{ flex: 1, background: "var(--bg-elevated)", borderRadius: "var(--r-md)", padding: "8px", textAlign: "center" }}>
                  <div style={{ fontWeight: 800, fontSize: "1rem", color: "var(--text-0)" }}>৳{b.deliveryFee}</div>
                  <div style={{ fontSize: "0.65rem", color: "var(--text-3)" }}>Delivery Fee</div>
                </div>
                <div style={{ flex: 1, background: "var(--bg-elevated)", borderRadius: "var(--r-md)", padding: "8px", textAlign: "center" }}>
                  <div style={{ fontWeight: 800, fontSize: "0.85rem", color: "var(--text-0)" }}>{b.eta}</div>
                  <div style={{ fontSize: "0.65rem", color: "var(--text-3)" }}>ETA</div>
                </div>
              </div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-3)", marginBottom: "8px" }}>
                <Phone size={10} style={{ display: "inline", marginRight: "4px" }} />{b.phone}
              </div>
              <div style={{ fontSize: "0.72rem", color: "var(--text-3)", marginBottom: "10px" }}>
                Manager: <span style={{ color: "var(--text-2)", fontWeight: 600 }}>{b.managerName || "TBD"}</span>
              </div>
              {b.coverageZones.length > 0 && (
                <div style={{ display: "flex", gap: "5px", flexWrap: "wrap" }}>
                  {b.coverageZones.map(z => <span key={z} className="tag">{z}</span>)}
                </div>
              )}
              <button
                className="admin-btn admin-btn-ghost admin-btn-sm"
                style={{ marginTop: "12px", width: "100%", justifyContent: "center" }}
                onClick={() => updateBranch(b.id, { isActive: !b.isActive })}
              >
                {b.isActive ? <ToggleRight size={13} color="var(--green)" /> : <ToggleLeft size={13} />}
                {b.isActive ? "Mark Inactive" : "Activate"}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* B2B Accounts */}
      <div>
        <div className="section-label"><Building2 size={11} /> B2B / Wholesale Accounts</div>
        <div className="admin-card">
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Company</th>
                  <th>Contact</th>
                  <th>Category Need</th>
                  <th>Volume</th>
                  <th>Credit Limit</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {b2bAccounts.map(b => (
                  <tr key={b.id}>
                    <td>
                      <div style={{ fontWeight: 700, fontSize: "0.84rem" }}>{b.companyName}</div>
                      <div style={{ fontSize: "0.70rem", color: "var(--text-3)" }}>{b.tradeLicense}</div>
                    </td>
                    <td>
                      <div style={{ fontSize: "0.80rem" }}>{b.contactPerson}</div>
                      <div style={{ fontSize: "0.70rem", color: "var(--text-3)" }}>{b.phone}</div>
                    </td>
                    <td style={{ fontSize: "0.80rem" }}>{b.categoryNeeded}</td>
                    <td style={{ fontSize: "0.80rem", color: "var(--text-2)" }}>{b.monthlyVolume}</td>
                    <td><span className="mono" style={{ color: "var(--green-bright)" }}>৳{b.creditLimit.toLocaleString()}</span></td>
                    <td><span className={`status-badge ${b.status === "APPROVED" ? "success" : b.status === "PENDING" ? "warning" : "danger"}`}>{b.status}</span></td>
                    <td>
                      {b.status === "PENDING" && (
                        <div style={{ display: "flex", gap: "6px" }}>
                          <button className="admin-btn admin-btn-primary admin-btn-sm" onClick={() => approveB2BAccount(b.id, b.creditLimit)}>
                            <Check size={12} /> Approve
                          </button>
                          <button className="admin-btn admin-btn-danger admin-btn-sm" onClick={() => rejectB2BAccount(b.id)}>
                            <X size={12} /> Reject
                          </button>
                        </div>
                      )}
                      {b.status !== "PENDING" && <span style={{ fontSize: "0.72rem", color: "var(--text-4)" }}>—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Branch Modal */}
      {showAddBranch && (
        <div className="modal-overlay" onClick={() => setShowAddBranch(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: "500px" }}>
            <div className="modal-header">
              <div className="modal-title">Add New Hub / Branch</div>
              <button className="admin-btn admin-btn-ghost admin-btn-icon" onClick={() => setShowAddBranch(false)}><X size={16} /></button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div style={{ gridColumn: "1/-1" }}>
                <label className="admin-label">Hub Name *</label>
                <input className="admin-input" value={form.nameEn} onChange={e => set("nameEn", e.target.value)} placeholder="e.g. Dhanmondi Hub" />
              </div>
              <div><label className="admin-label">Area *</label><input className="admin-input" value={form.area} onChange={e => set("area", e.target.value)} placeholder="Dhanmondi" /></div>
              <div><label className="admin-label">City</label><input className="admin-input" value={form.city} onChange={e => set("city", e.target.value)} /></div>
              <div style={{ gridColumn: "1/-1" }}><label className="admin-label">Full Address</label><input className="admin-input" value={form.address} onChange={e => set("address", e.target.value)} /></div>
              <div><label className="admin-label">Phone</label><input className="admin-input" value={form.phone} onChange={e => set("phone", e.target.value)} /></div>
              <div><label className="admin-label">Manager Name</label><input className="admin-input" value={form.managerName} onChange={e => set("managerName", e.target.value)} /></div>
              <div><label className="admin-label">Delivery Fee (৳)</label><input className="admin-input" type="number" value={form.deliveryFee} onChange={e => set("deliveryFee", parseFloat(e.target.value))} /></div>
              <div><label className="admin-label">ETA</label><input className="admin-input" value={form.eta} onChange={e => set("eta", e.target.value)} placeholder="30-45 min" /></div>
              <div style={{ gridColumn: "1/-1" }}><label className="admin-label">Coverage Zones (comma-separated)</label><input className="admin-input" value={form.coverageZones} onChange={e => set("coverageZones", e.target.value)} placeholder="Dhanmondi, Mohammadpur, Kalabagan" /></div>
            </div>
            <div className="modal-footer">
              <button className="admin-btn admin-btn-secondary" onClick={() => setShowAddBranch(false)}>Cancel</button>
              <button className="admin-btn admin-btn-primary" disabled={!form.nameEn || !form.area} onClick={() => {
                addBranch({
                  nameEn: form.nameEn, nameBn: form.nameBn || form.nameEn,
                  area: form.area, city: form.city, address: form.address,
                  phone: form.phone, managerName: form.managerName,
                  deliveryFee: form.deliveryFee, eta: form.eta,
                  isActive: true,
                  coverageZones: form.coverageZones.split(",").map(s => s.trim()).filter(Boolean),
                });
                setShowAddBranch(false);
              }}>
                <Check size={14} /> Add Branch
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
