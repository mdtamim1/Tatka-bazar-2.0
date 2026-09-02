"use client";

import React, { useState } from "react";
import {
  Bike, Plus, CheckCircle, Search, Star,
  X, Package, MapPin, Phone, Mail, Award,
  ChevronDown, ChevronUp, Zap, ShoppingBag,
} from "lucide-react";
import { useAdmin } from "@/context/AdminContext";
import { AdminRider } from "@/types";

const VEHICLE_ICON: Record<string, string> = {
  MOTORCYCLE: "🏍️",
  BICYCLE:    "🚴",
  VAN:        "🚐",
};

const STATUS_COLOR: Record<string, string> = {
  ACTIVE:    "var(--green)",
  PENDING:   "var(--amber)",
  OFFLINE:   "var(--text-3)",
  SUSPENDED: "var(--red)",
};
const STATUS_LABEL: Record<string, string> = {
  ACTIVE: "Active", PENDING: "Pending", OFFLINE: "Offline", SUSPENDED: "Suspended",
};

function RiderCard({
  rider,
  riderOrders,
  onApprove,
  expanded,
  onToggleExpand,
}: {
  rider: AdminRider;
  riderOrders: ReturnType<typeof useAdmin>["orders"];
  onApprove: () => void;
  expanded: boolean;
  onToggleExpand: () => void;
}) {
  const initials = rider.name
    .split(" ")
    .slice(0, 2)
    .map(w => w.charAt(0).toUpperCase())
    .join("");

  const avatarColors = ["#22C55E", "#3B82F6", "#8B5CF6", "#F59E0B", "#EF4444", "#06B6D4"];
  const colorIdx = rider.id.charCodeAt(rider.id.length - 1) % avatarColors.length;
  const avatarColor = avatarColors[colorIdx];

  return (
    <div className="rider-card" style={{ cursor: "default" }}>
      {/* Top: Avatar + Info */}
      <div style={{ display: "flex", gap: "12px", alignItems: "flex-start", marginBottom: "14px" }}>
        <div className="rider-avatar" style={{ background: `${avatarColor}20`, color: avatarColor }}>
          {rider.status === "ACTIVE" && rider.activeDeliveriesCount > 0 && <div className="rider-avatar-ring" />}
          {initials}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 800, fontSize: "0.92rem", color: "var(--text-1)", lineHeight: 1.2 }}>{rider.name}</div>
          <div style={{ fontSize: "0.75rem", color: "var(--text-3)", marginTop: "3px", fontFamily: "var(--font-mono)" }}>
            {rider.phone}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "6px" }}>
            <span className="live-dot" style={{ background: STATUS_COLOR[rider.status], animation: rider.status === "ACTIVE" ? undefined : "none" }} />
            <span style={{ fontSize: "0.72rem", fontWeight: 700, color: STATUS_COLOR[rider.status], textTransform: "uppercase", letterSpacing: "0.05em" }}>
              {STATUS_LABEL[rider.status]}
            </span>
          </div>
        </div>
        <div style={{ fontSize: "1.4rem", flexShrink: 0 }}>{VEHICLE_ICON[rider.vehicleType]}</div>
      </div>

      {/* Stats Row */}
      <div style={{
        display: "grid", gridTemplateColumns: "repeat(3, 1fr)",
        gap: "8px", marginBottom: "14px",
      }}>
        {[
          { label: "Active", value: rider.activeDeliveriesCount, color: "var(--amber)" },
          { label: "Completed", value: rider.totalDeliveriesCompleted, color: "var(--green)" },
          { label: "Rating", value: rider.rating ? `${rider.rating}★` : "New", color: "var(--text-1)" },
        ].map(stat => (
          <div key={stat.label} style={{
            background: "var(--bg-raised)", borderRadius: "var(--r-sm)",
            padding: "8px", textAlign: "center",
            border: "1px solid var(--border-1)",
          }}>
            <div style={{ fontSize: "1rem", fontWeight: 800, color: stat.color }}>{stat.value}</div>
            <div style={{ fontSize: "0.63rem", color: "var(--text-3)", marginTop: "2px" }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Hub */}
      <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "12px", fontSize: "0.78rem", color: "var(--text-3)" }}>
        <MapPin size={12} />
        <span>{rider.assignedHubName}</span>
      </div>

      {/* Action Buttons */}
      <div style={{ display: "flex", gap: "8px" }}>
        {rider.status === "PENDING" ? (
          <button className="admin-btn admin-btn-primary" style={{ flex: 1, fontSize: "0.80rem" }} onClick={onApprove}>
            <CheckCircle size={14} />
            Approve Rider
          </button>
        ) : (
          <button
            className="admin-btn admin-btn-secondary"
            style={{ flex: 1, fontSize: "0.80rem" }}
            onClick={onToggleExpand}
          >
            <ShoppingBag size={13} />
            View {riderOrders.length} Orders
            {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </button>
        )}
      </div>

      {/* Expanded Orders */}
      {expanded && riderOrders.length > 0 && (
        <div style={{
          marginTop: "14px",
          padding: "12px",
          background: "var(--bg-deep)",
          borderRadius: "var(--r-md)",
          border: "1px solid var(--border-1)",
          display: "flex", flexDirection: "column", gap: "8px",
        }}>
          <div style={{ fontSize: "0.70rem", fontWeight: 700, color: "var(--text-4)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "4px" }}>
            Assigned Orders
          </div>
          {riderOrders.map(ord => (
            <div key={ord.id} style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "8px 10px",
              background: "var(--bg-raised)",
              borderRadius: "var(--r-sm)",
              border: "1px solid var(--border-1)",
            }}>
              <div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.82rem", fontWeight: 700, color: "var(--green)" }}>
                  #{ord.orderNumber}
                </div>
                <div style={{ fontSize: "0.72rem", color: "var(--text-3)" }}>
                  {ord.customerName.split(" ")[0]} · {ord.deliveryArea}
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontWeight: 700, fontSize: "0.82rem", color: "var(--text-1)", fontFamily: "var(--font-mono)" }}>
                  ৳{ord.totalAmount.toLocaleString()}
                </div>
                <span style={{
                  fontSize: "0.65rem", fontWeight: 700,
                  padding: "1px 6px", borderRadius: "99px",
                  background: ord.status === "OUT_FOR_DELIVERY" ? "var(--cyan-glass)" : "var(--green-glass)",
                  color: ord.status === "OUT_FOR_DELIVERY" ? "var(--cyan)" : "var(--green)",
                  border: `1px solid ${ord.status === "OUT_FOR_DELIVERY" ? "rgba(6,182,212,0.3)" : "var(--border-green)"}`,
                }}>
                  {ord.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
      {expanded && riderOrders.length === 0 && (
        <div style={{
          marginTop: "12px", padding: "16px", textAlign: "center",
          background: "var(--bg-deep)", borderRadius: "var(--r-md)",
          color: "var(--text-4)", fontSize: "0.80rem",
        }}>
          No active orders assigned
        </div>
      )}
    </div>
  );
}

/* ── Main Page ─────────────────────────────────────────────── */
export default function AdminRidersPage() {
  const { riders, orders, approveRider, addRider, branches } = useAdmin();
  const [search, setSearch]                 = useState("");
  const [isCreateModalOpen, setCreate]      = useState(false);
  const [expandedRiderId, setExpanded]      = useState<string | null>(null);
  const [newRiderForm, setNewRiderForm]     = useState({
    name: "", phone: "", email: "", nid: "",
    vehicleType: "MOTORCYCLE" as const,
    assignedHubId: branches[0]?.id || "branch-dhanmondi",
    assignedHubName: branches[0]?.nameEn || "Dhanmondi Express Hub",
    status: "ACTIVE" as const,
  });

  const handleCreateRider = (e: React.FormEvent) => {
    e.preventDefault();
    const branch = branches.find(b => b.id === newRiderForm.assignedHubId);
    addRider({ ...newRiderForm, assignedHubName: branch?.nameEn || branch?.nameBn || newRiderForm.assignedHubName });
    setCreate(false);
    setNewRiderForm({ name: "", phone: "", email: "", nid: "", vehicleType: "MOTORCYCLE", assignedHubId: branches[0]?.id || "", assignedHubName: branches[0]?.nameEn || "", status: "ACTIVE" });
  };

  const filteredRiders = riders.filter(r =>
    !search.trim() ||
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    r.phone.includes(search) ||
    r.assignedHubName.toLowerCase().includes(search.toLowerCase())
  );

  // KPI Metrics
  const totalActive   = riders.filter(r => r.status === "ACTIVE").length;
  const onRoute       = riders.filter(r => r.activeDeliveriesCount > 0).length;
  const pending       = riders.filter(r => r.status === "PENDING").length;
  const avgRating     = riders.filter(r => r.rating).reduce((s, r) => s + r.rating, 0) / riders.filter(r => r.rating).length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

      {/* ── Header ─────────────────────────────────────────── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 style={{ fontSize: "1.35rem", fontWeight: 800, color: "var(--text-1)" }}>
            Rider Fleet Management
          </h1>
          <p style={{ fontSize: "0.80rem", color: "var(--text-3)", marginTop: "3px" }}>
            Delivery rider fleet roster, active route tracking, and performance analytics
          </p>
        </div>
        <button className="admin-btn admin-btn-primary" onClick={() => setCreate(true)}>
          <Plus size={15} />
          Add New Rider
        </button>
      </div>

      {/* ── KPI Strip ──────────────────────────────────────── */}
      <div className="kpi-grid">
        {[
          { label: "Total Riders", value: riders.length, icon: "👥", accent: "var(--blue)" },
          { label: "Active", value: totalActive, icon: "✅", accent: "var(--green)" },
          { label: "On Route", value: onRoute, icon: "🛵", accent: "var(--amber)" },
          { label: "Pending Approval", value: pending, icon: "⏳", accent: "var(--red)" },
          { label: "Average Rating", value: avgRating ? `${avgRating.toFixed(1)}★` : "—", icon: "⭐", accent: "var(--amber)" },
        ].map(kpi => (
          <div key={kpi.label} className="kpi-card" style={{ "--kpi-accent": kpi.accent } as React.CSSProperties}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                {kpi.label}
              </div>
              <span style={{ fontSize: "1.3rem" }}>{kpi.icon}</span>
            </div>
            <div style={{ fontSize: "1.8rem", fontWeight: 800, color: kpi.accent, lineHeight: 1, marginTop: "10px" }}>
              {kpi.value}
            </div>
          </div>
        ))}
      </div>

      {/* ── Search ─────────────────────────────────────────── */}
      <div className="search-wrap" style={{ maxWidth: "320px" }}>
        <Search size={14} className="search-icon" />
        <input
          className="search-input"
          placeholder="Search by name, phone, or hub..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        {search && (
          <button onClick={() => setSearch("")} style={{ position: "absolute", right: "10px", color: "var(--text-3)", display: "flex" }}>
            <X size={13} />
          </button>
        )}
      </div>

      {/* ── Riders Grid ────────────────────────────────────── */}
      <div className="rider-grid">
        {filteredRiders.map(rider => {
          const riderOrders = orders.filter(o => o.assignedRiderId === rider.id);
          return (
            <RiderCard
              key={rider.id}
              rider={rider}
              riderOrders={riderOrders}
              onApprove={() => approveRider(rider.id)}
              expanded={expandedRiderId === rider.id}
              onToggleExpand={() => setExpanded(prev => prev === rider.id ? null : rider.id)}
            />
          );
        })}
        {filteredRiders.length === 0 && (
          <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "48px", color: "var(--text-3)" }}>
            No riders found
          </div>
        )}
      </div>

      {/* ── Create Rider Modal ──────────────────────────────── */}
      {isCreateModalOpen && (
        <div className="modal-overlay" onClick={() => setCreate(false)}>
          <div className="modal-content" style={{ maxWidth: "480px" }} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
              <h2 style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--text-1)" }}>
                🛵 Create New Rider Account
              </h2>
              <button className="admin-btn admin-btn-ghost admin-btn-icon" onClick={() => setCreate(false)}><X size={16} /></button>
            </div>
            <form onSubmit={handleCreateRider} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label className="admin-label">Rider Full Name *</label>
                <input className="admin-input" type="text" required placeholder="Full Name"
                  value={newRiderForm.name} onChange={e => setNewRiderForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label className="admin-label">Mobile Phone *</label>
                  <input className="admin-input" type="tel" required placeholder="01XXXXXXXXX"
                    value={newRiderForm.phone} onChange={e => setNewRiderForm(f => ({ ...f, phone: e.target.value }))} />
                </div>
                <div>
                  <label className="admin-label">National ID (NID) *</label>
                  <input className="admin-input" type="text" required placeholder="NID Number"
                    value={newRiderForm.nid} onChange={e => setNewRiderForm(f => ({ ...f, nid: e.target.value }))} />
                </div>
              </div>
              <div>
                <label className="admin-label">Email</label>
                <input className="admin-input" type="email" placeholder="rider@tatkabazar.com"
                  value={newRiderForm.email} onChange={e => setNewRiderForm(f => ({ ...f, email: e.target.value }))} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label className="admin-label">Vehicle Type</label>
                  <select className="admin-select" value={newRiderForm.vehicleType}
                    onChange={e => setNewRiderForm(f => ({ ...f, vehicleType: e.target.value as any }))}>
                    <option value="MOTORCYCLE">🏍️ Motorcycle</option>
                    <option value="BICYCLE">🚴 Bicycle</option>
                    <option value="VAN">🚐 Delivery Van</option>
                  </select>
                </div>
                <div>
                  <label className="admin-label">Assigned Hub</label>
                  <select className="admin-select" value={newRiderForm.assignedHubId}
                    onChange={e => setNewRiderForm(f => ({ ...f, assignedHubId: e.target.value }))}>
                    {branches.map(b => <option key={b.id} value={b.id}>{b.nameEn || b.nameBn}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "8px" }}>
                <button type="button" className="admin-btn admin-btn-secondary" onClick={() => setCreate(false)}>Cancel</button>
                <button type="submit" className="admin-btn admin-btn-primary">
                  <Plus size={15} />
                  Create Rider
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
