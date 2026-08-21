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
  ACTIVE: "অ্যাক্টিভ", PENDING: "অপেক্ষারত", OFFLINE: "অফলাইন", SUSPENDED: "সাসপেন্ড",
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
  const dotCls = rider.status === "ACTIVE" && rider.activeDeliveriesCount > 0
    ? "amber"
    : rider.status === "ACTIVE" ? "" : rider.status === "PENDING" ? "amber" : "gray";

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
          { label: "চলমান", value: rider.activeDeliveriesCount, color: "var(--amber)" },
          { label: "সম্পন্ন",  value: rider.totalDeliveriesCompleted, color: "var(--green)" },
          { label: "রেটিং",   value: rider.rating ? `${rider.rating}★` : "নতুন", color: "var(--text-1)" },
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
            অনুমোদন দিন
          </button>
        ) : (
          <button
            className="admin-btn admin-btn-secondary"
            style={{ flex: 1, fontSize: "0.80rem" }}
            onClick={onToggleExpand}
          >
            <ShoppingBag size={13} />
            {riderOrders.length} অর্ডার দেখুন
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
            অ্যাসাইন করা অর্ডারসমূহ
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
          কোনো অ্যাক্টিভ অর্ডার নেই
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
    assignedHubName: branches[0]?.nameBn || "ধানমন্ডি এক্সপ্রেস হাব",
    status: "ACTIVE" as const,
  });

  const handleCreateRider = (e: React.FormEvent) => {
    e.preventDefault();
    const branch = branches.find(b => b.id === newRiderForm.assignedHubId);
    addRider({ ...newRiderForm, assignedHubName: branch?.nameBn || newRiderForm.assignedHubName });
    setCreate(false);
    setNewRiderForm({ name: "", phone: "", email: "", nid: "", vehicleType: "MOTORCYCLE", assignedHubId: branches[0]?.id || "", assignedHubName: branches[0]?.nameBn || "", status: "ACTIVE" });
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
            রাইডার ফ্লিট ম্যানেজমেন্ট
          </h1>
          <p style={{ fontSize: "0.80rem", color: "var(--text-3)", marginTop: "3px" }}>
            ডেলিভারি রাইডার টিম, অর্ডার ট্র্যাকিং ও পারফরম্যান্স মনিটরিং
          </p>
        </div>
        <button className="admin-btn admin-btn-primary" onClick={() => setCreate(true)}>
          <Plus size={15} />
          নতুন রাইডার যুক্ত করুন
        </button>
      </div>

      {/* ── KPI Strip ──────────────────────────────────────── */}
      <div className="kpi-grid">
        {[
          { label: "মোট রাইডার", value: riders.length, icon: "👥", accent: "var(--blue)" },
          { label: "অ্যাক্টিভ",  value: totalActive,   icon: "✅", accent: "var(--green)" },
          { label: "ডেলিভারিতে", value: onRoute,        icon: "🛵", accent: "var(--amber)" },
          { label: "অনুমোদন বাকি",value: pending,       icon: "⏳", accent: "var(--red)" },
          { label: "গড় রেটিং",   value: avgRating ? `${avgRating.toFixed(1)}★` : "—", icon: "⭐", accent: "var(--amber)" },
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
          placeholder="নাম, ফোন বা হাব দিয়ে খুঁজুন..."
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
            কোনো রাইডার পাওয়া যায়নি
          </div>
        )}
      </div>

      {/* ── Create Rider Modal ──────────────────────────────── */}
      {isCreateModalOpen && (
        <div className="modal-overlay" onClick={() => setCreate(false)}>
          <div className="modal-content" style={{ maxWidth: "480px" }} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
              <h2 style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--text-1)" }}>
                🛵 নতুন রাইডার অ্যাকাউন্ট তৈরি
              </h2>
              <button className="admin-btn admin-btn-ghost admin-btn-icon" onClick={() => setCreate(false)}><X size={16} /></button>
            </div>
            <form onSubmit={handleCreateRider} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label className="admin-label">রাইডারের পূর্ণ নাম *</label>
                <input className="admin-input" type="text" required placeholder="পূর্ণ নাম বাংলায়"
                  value={newRiderForm.name} onChange={e => setNewRiderForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label className="admin-label">মোবাইল নম্বর *</label>
                  <input className="admin-input" type="tel" required placeholder="01XXXXXXXXX"
                    value={newRiderForm.phone} onChange={e => setNewRiderForm(f => ({ ...f, phone: e.target.value }))} />
                </div>
                <div>
                  <label className="admin-label">NID নম্বর *</label>
                  <input className="admin-input" type="text" required placeholder="জাতীয় পরিচয়পত্র"
                    value={newRiderForm.nid} onChange={e => setNewRiderForm(f => ({ ...f, nid: e.target.value }))} />
                </div>
              </div>
              <div>
                <label className="admin-label">ইমেইল</label>
                <input className="admin-input" type="email" placeholder="rider@email.com"
                  value={newRiderForm.email} onChange={e => setNewRiderForm(f => ({ ...f, email: e.target.value }))} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label className="admin-label">যানবাহনের ধরন</label>
                  <select className="admin-select" value={newRiderForm.vehicleType}
                    onChange={e => setNewRiderForm(f => ({ ...f, vehicleType: e.target.value as any }))}>
                    <option value="MOTORCYCLE">🏍️ মোটরসাইকেল</option>
                    <option value="BICYCLE">🚴 বাইসাইকেল</option>
                    <option value="VAN">🚐 ডেলিভারি ভ্যান</option>
                  </select>
                </div>
                <div>
                  <label className="admin-label">নিযুক্ত হাব</label>
                  <select className="admin-select" value={newRiderForm.assignedHubId}
                    onChange={e => setNewRiderForm(f => ({ ...f, assignedHubId: e.target.value }))}>
                    {branches.map(b => <option key={b.id} value={b.id}>{b.nameBn}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "8px" }}>
                <button type="button" className="admin-btn admin-btn-secondary" onClick={() => setCreate(false)}>বাতিল</button>
                <button type="submit" className="admin-btn admin-btn-primary">
                  <Plus size={15} />
                  রাইডার তৈরি করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
