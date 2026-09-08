"use client";

import React, { useState, useMemo } from "react";
import {
  Bike, Plus, Search, X, Check, ShieldCheck, Phone, Eye,
  Star, MapPin, Clock, Package,
} from "lucide-react";
import { useAdmin } from "@/context/AdminContext";
import { AdminRider } from "@/types";

function RiderDrawer({ rider, onClose }: { rider: AdminRider; onClose: () => void }) {
  const { approveRider } = useAdmin();
  return (
    <>
      <div className="drawer-overlay" onClick={onClose} />
      <div className="drawer-panel">
        <div className="drawer-header">
          <div>
            <div style={{ fontWeight: 800, fontSize: "1rem", color: "var(--text-0)" }}>{rider.name}</div>
            <span className={`status-badge ${rider.status === "ACTIVE" ? "success" : rider.status === "BUSY" ? "cyan" : rider.status === "PENDING" ? "warning" : "neutral"}`} style={{ marginTop: "4px" }}>
              {rider.status}
            </span>
          </div>
          <button className="admin-btn admin-btn-ghost admin-btn-icon" onClick={onClose}><X size={16} /></button>
        </div>
        <div className="drawer-body">
          <div className="section-label">👤 Personal Info</div>
          <div className="detail-row"><span className="detail-label">Phone</span><span className="detail-value mono">{rider.phone}</span></div>
          <div className="detail-row"><span className="detail-label">Email</span><span className="detail-value">{rider.email}</span></div>
          <div className="detail-row"><span className="detail-label">NID</span><span className="detail-value mono">{rider.nid}</span></div>
          <div className="detail-row"><span className="detail-label">Vehicle</span><span className="detail-value">{rider.vehicleType}</span></div>
          <div className="detail-row"><span className="detail-label">Area</span><span className="detail-value">{rider.area}</span></div>
          <div className="detail-row"><span className="detail-label">Assigned Hub</span><span className="detail-value">{rider.assignedHubName}</span></div>
          <div className="detail-row"><span className="detail-label">KYC Status</span><span className="detail-value"><span className={`status-badge ${rider.kycStatus === "APPROVED" ? "success" : rider.kycStatus === "SUBMITTED" ? "info" : "warning"}`}>{rider.kycStatus}</span></span></div>
          <div className="detail-row"><span className="detail-label">Joined</span><span className="detail-value">{rider.joinedDate}</span></div>

          <div className="admin-divider" />
          <div className="section-label">📊 Performance</div>
          <div className="detail-row"><span className="detail-label">Total Deliveries</span><span className="detail-value" style={{ fontWeight: 700 }}>{rider.totalDeliveriesCompleted}</span></div>
          <div className="detail-row"><span className="detail-label">Active Now</span><span className="detail-value">{rider.activeDeliveriesCount}</span></div>
          <div className="detail-row"><span className="detail-label">Rating</span><span className="detail-value">{rider.rating > 0 ? `⭐ ${rider.rating.toFixed(1)}` : "No rating yet"}</span></div>
          <div className="detail-row"><span className="detail-label">Total Earned</span><span className="detail-value mono" style={{ color: "var(--green-bright)" }}>৳{rider.totalEarned.toLocaleString()}</span></div>
          <div className="detail-row"><span className="detail-label">Payable</span><span className="detail-value mono" style={{ color: rider.balancePayable > 0 ? "var(--amber)" : "var(--text-2)" }}>৳{rider.balancePayable.toLocaleString()}</span></div>
        </div>
        <div className="drawer-footer">
          {rider.status === "PENDING" && (
            <button className="admin-btn admin-btn-primary" onClick={() => { approveRider(rider.id); onClose(); }}>
              <ShieldCheck size={14} /> Approve Rider
            </button>
          )}
          <button className="admin-btn admin-btn-secondary" onClick={onClose}>Close</button>
        </div>
      </div>
    </>
  );
}

function AddRiderModal({ onClose }: { onClose: () => void }) {
  const { addRider, branches } = useAdmin();
  const [form, setForm] = useState({ name: "", phone: "", email: "", nid: "", vehicleType: "MOTORCYCLE", assignedHubId: branches[0]?.id || "", assignedHubName: branches[0]?.nameEn || "", area: "" });
  const set = (k: string, v: any) => setForm(p => ({ ...p, [k]: v }));

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: "480px" }}>
        <div className="modal-header">
          <div className="modal-title">Add Rider</div>
          <button className="admin-btn admin-btn-ghost admin-btn-icon" onClick={onClose}><X size={16} /></button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          <div style={{ gridColumn: "1/-1" }}>
            <label className="admin-label">Full Name *</label>
            <input className="admin-input" value={form.name} onChange={e => set("name", e.target.value)} placeholder="Rider's full name" />
          </div>
          <div><label className="admin-label">Phone</label><input className="admin-input" value={form.phone} onChange={e => set("phone", e.target.value)} placeholder="01XXXXXXXXX" /></div>
          <div><label className="admin-label">Email</label><input className="admin-input" value={form.email} onChange={e => set("email", e.target.value)} placeholder="email@example.com" /></div>
          <div><label className="admin-label">NID</label><input className="admin-input" value={form.nid} onChange={e => set("nid", e.target.value)} placeholder="National ID number" /></div>
          <div>
            <label className="admin-label">Vehicle Type</label>
            <select className="admin-select" value={form.vehicleType} onChange={e => set("vehicleType", e.target.value)}>
              <option value="MOTORCYCLE">Motorcycle</option>
              <option value="BICYCLE">Bicycle</option>
              <option value="VAN">Van</option>
            </select>
          </div>
          <div>
            <label className="admin-label">Hub</label>
            <select className="admin-select" value={form.assignedHubId} onChange={e => {
              const b = branches.find(b => b.id === e.target.value);
              set("assignedHubId", e.target.value);
              set("assignedHubName", b?.nameEn || "");
            }}>
              {branches.map(b => <option key={b.id} value={b.id}>{b.nameEn}</option>)}
            </select>
          </div>
          <div><label className="admin-label">Area</label><input className="admin-input" value={form.area} onChange={e => set("area", e.target.value)} placeholder="e.g. Dhanmondi" /></div>
        </div>
        <div className="modal-footer">
          <button className="admin-btn admin-btn-secondary" onClick={onClose}>Cancel</button>
          <button className="admin-btn admin-btn-primary" disabled={!form.name} onClick={() => { addRider({ ...form, vehicleType: form.vehicleType as "MOTORCYCLE" | "BICYCLE" | "VAN", status: "PENDING", kycStatus: "PENDING", joinedDate: new Date().toLocaleDateString("en-GB") }); onClose(); }}>
            <Check size={14} /> Add Rider
          </button>
        </div>
      </div>
    </div>
  );
}

export default function RidersPage() {
  const { riders } = useAdmin();
  const [selected, setSelected] = useState<AdminRider | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const filtered = useMemo(() => riders.filter(r => {
    const ms = !search || r.name.toLowerCase().includes(search.toLowerCase()) || r.area.toLowerCase().includes(search.toLowerCase()) || r.phone.includes(search);
    const mst = statusFilter === "ALL" || r.status === statusFilter;
    return ms && mst;
  }), [riders, search, statusFilter]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "22px" }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Riders</h1>
          <p className="page-subtitle">
            {riders.filter(r => ["ACTIVE", "BUSY"].includes(r.status)).length} active · {riders.filter(r => r.status === "PENDING").length} pending approval
          </p>
        </div>
        <button className="admin-btn admin-btn-primary" onClick={() => setShowAdd(true)}><Plus size={14} /> Add Rider</button>
      </div>

      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
        <div className="search-wrap" style={{ flex: 1, minWidth: "220px" }}>
          <Search size={14} className="search-icon" />
          <input className="search-input" placeholder="Search rider name, area, phone…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="tab-bar">
          {["ALL", "ACTIVE", "BUSY", "PENDING", "OFFLINE", "SUSPENDED"].map(s => (
            <button key={s} className={`tab-pill ${statusFilter === s ? "active" : ""}`} onClick={() => setStatusFilter(s)}>
              {s === "ALL" ? "All" : s.charAt(0) + s.slice(1).toLowerCase()}
              <span className="tab-count">{s === "ALL" ? riders.length : riders.filter(r => r.status === s).length}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="rider-grid">
        {filtered.map(r => {
          const dotCls = r.status === "ACTIVE" ? "" : r.status === "BUSY" ? "amber" : r.status === "OFFLINE" ? "off" : r.status === "PENDING" ? "amber" : "red";
          return (
            <div key={r.id} className="rider-card" onClick={() => setSelected(r)}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "14px" }}>
                <div className="rider-avatar" style={{ background: "linear-gradient(135deg, var(--cyan-glass) 0%, var(--blue-glass) 100%)", border: "1px solid var(--border-2)", color: "var(--text-1)" }}>
                  {r.name[0]}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 800, fontSize: "0.9rem", color: "var(--text-0)" }}>{r.name}</div>
                  <div style={{ fontSize: "0.72rem", color: "var(--text-3)", display: "flex", gap: "6px", alignItems: "center", marginTop: "2px" }}>
                    <span className={`live-dot ${dotCls}`} style={{ width: "6px", height: "6px" }} />
                    {r.status} · {r.vehicleType}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <span className={`status-badge ${r.kycStatus === "APPROVED" ? "success" : r.kycStatus === "SUBMITTED" ? "info" : "warning"}`}>{r.kycStatus}</span>
                </div>
              </div>
              <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
                <div style={{ flex: 1, textAlign: "center", background: "var(--bg-raised)", borderRadius: "var(--r-md)", padding: "8px" }}>
                  <div style={{ fontWeight: 800, fontSize: "1rem", color: "var(--text-0)" }}>{r.totalDeliveriesCompleted}</div>
                  <div style={{ fontSize: "0.65rem", color: "var(--text-3)" }}>Deliveries</div>
                </div>
                <div style={{ flex: 1, textAlign: "center", background: "var(--bg-raised)", borderRadius: "var(--r-md)", padding: "8px" }}>
                  <div style={{ fontWeight: 800, fontSize: "1rem", color: "var(--text-0)" }}>{r.rating > 0 ? r.rating.toFixed(1) : "—"}</div>
                  <div style={{ fontSize: "0.65rem", color: "var(--text-3)" }}>Rating</div>
                </div>
                <div style={{ flex: 1, textAlign: "center", background: "var(--bg-raised)", borderRadius: "var(--r-md)", padding: "8px" }}>
                  <div style={{ fontWeight: 800, fontSize: "1rem", color: "var(--green-bright)" }}>{r.activeDeliveriesCount}</div>
                  <div style={{ fontSize: "0.65rem", color: "var(--text-3)" }}>Active</div>
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "var(--text-3)" }}>
                <span><MapPin size={10} style={{ display: "inline", marginRight: "3px" }} />{r.area}</span>
                <span className="mono" style={{ color: r.balancePayable > 0 ? "var(--amber)" : "var(--text-3)" }}>৳{r.balancePayable.toLocaleString()} due</span>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="admin-card" style={{ gridColumn: "1/-1" }}>
            <div className="empty-state"><div className="empty-state-icon">🏍️</div><div className="empty-state-title">No riders found</div></div>
          </div>
        )}
      </div>

      {selected && <RiderDrawer rider={selected} onClose={() => setSelected(null)} />}
      {showAdd && <AddRiderModal onClose={() => setShowAdd(false)} />}
    </div>
  );
}
