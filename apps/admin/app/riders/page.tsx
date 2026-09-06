"use client";

import React, { useState, useEffect, useRef } from "react";
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
          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "6px", flexWrap: "wrap" }}>
            <span className="live-dot" style={{ background: STATUS_COLOR[rider.status], animation: rider.status === "ACTIVE" ? undefined : "none" }} />
            <span style={{ fontSize: "0.72rem", fontWeight: 700, color: STATUS_COLOR[rider.status], textTransform: "uppercase", letterSpacing: "0.05em" }}>
              {STATUS_LABEL[rider.status]}
            </span>
            <span style={{
              padding: "1px 7px", borderRadius: 999, fontSize: ".66rem", fontWeight: 800,
              background: (rider.totalDeliveriesCompleted || 0) > 200 ? "rgba(56,189,248,.15)" : (rider.totalDeliveriesCompleted || 0) > 50 ? "rgba(245,158,11,.15)" : "rgba(148,163,184,.15)",
              color: (rider.totalDeliveriesCompleted || 0) > 200 ? "#38bdf8" : (rider.totalDeliveriesCompleted || 0) > 50 ? "#f59e0b" : "#cbd5e1",
              border: `1px solid ${(rider.totalDeliveriesCompleted || 0) > 200 ? "#38bdf840" : (rider.totalDeliveriesCompleted || 0) > 50 ? "#f59e0b40" : "#cbd5e130"}`,
            }}>
              {(rider.totalDeliveriesCompleted || 0) > 200 ? "💎 Platinum" : (rider.totalDeliveriesCompleted || 0) > 50 ? "🥇 Gold" : (rider.totalDeliveriesCompleted || 0) > 10 ? "🥈 Silver" : "🥉 Bronze"}
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
  const [activeTab, setActiveTab] = useState<"roster" | "tracking">("roster");
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
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <a
            href="/riders/deposits"
            className="admin-btn"
            style={{
              background: "rgba(16, 185, 129, 0.12)",
              border: "1px solid rgba(16, 185, 129, 0.3)",
              color: "var(--green)",
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              fontSize: "0.82rem",
              fontWeight: 700,
            }}
          >
            📥 ডিপোজিট রিকোয়েস্ট
          </a>
          <a
            href="/riders/withdrawals"
            className="admin-btn"
            style={{
              background: "rgba(245, 158, 11, 0.12)",
              border: "1px solid rgba(245, 158, 11, 0.3)",
              color: "var(--amber)",
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              fontSize: "0.82rem",
              fontWeight: 700,
            }}
          >
            💸 উইথড্র রিকোয়েস্ট
          </a>
          <button className="admin-btn admin-btn-primary" onClick={() => setCreate(true)}>
            <Plus size={15} />
            Add New Rider
          </button>
        </div>
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

      {/* ── Tab Switcher ──────────────────────────────────── */}
      <div style={{
        display: "flex", gap: "4px",
        background: "var(--bg-raised)",
        padding: "4px",
        borderRadius: "12px",
        border: "1px solid var(--border-1)",
        alignSelf: "flex-start",
      }}>
        {([
          { id: "roster",   label: "👥 Rider Roster" },
          { id: "tracking", label: "🗺️ লাইভ ট্র্যাকিং" },
        ] as { id: "roster" | "tracking"; label: string }[]).map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: "8px 18px",
              borderRadius: "8px",
              border: "none",
              fontWeight: 700,
              fontSize: "0.82rem",
              cursor: "pointer",
              transition: "all .2s",
              background: activeTab === tab.id ? "var(--accent)" : "transparent",
              color: activeTab === tab.id ? "#fff" : "var(--text-3)",
              boxShadow: activeTab === tab.id ? "0 2px 10px rgba(99,102,241,.35)" : "none",
            }}
          >
            {tab.label}
            {tab.id === "tracking" && (
              <span style={{
                marginLeft: 6, fontSize: ".62rem", background: "#ef4444",
                color: "#fff", borderRadius: 999, padding: "1px 6px", verticalAlign: "middle",
              }}>LIVE</span>
            )}
          </button>
        ))}
      </div>

      {/* ── Live Tracking Tab ────────────────────────────── */}
      {activeTab === "tracking" && <LiveTrackingMap totalRiders={riders.length} />}

      {/* ── Roster Tab content ────────────────────────────── */}
      {activeTab === "roster" && (
        <>
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
        </>
      )}

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


// =============================================================================
// LiveTrackingMap — Admin view of all online rider GPS pings
// =============================================================================
interface GPSPin {
  riderId: string;
  riderName: string;
  lat: number;
  lng: number;
  duty: "ONLINE" | "OFFLINE";
  ts: number;
  gpsError?: string;
}

function LiveTrackingMap({ totalRiders }: { totalRiders: number }) {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletRef = useRef<any>(null);
  const markersRef = useRef<Map<string, any>>(new Map());
  const [pins, setPins] = useState<GPSPin[]>([]);
  const [lastRefresh, setLastRefresh] = useState(Date.now());
  const [seeded, setSeeded] = useState(false);

  // Seed demo GPS data so admin can see pins even without rider app open
  function seedDemoGPS() {
    const demoRiders = [
      { id: "rider-demo-01", name: "তামীম ইকবাল",  lat: 23.7461, lng: 90.3742 },
      { id: "rider-demo-02", name: "সাকিব আল হাসান", lat: 23.8759, lng: 90.3795 },
      { id: "rider-demo-03", name: "রাহেল মাহমুদ",  lat: 23.7808, lng: 90.4147 },
    ];
    demoRiders.forEach(r => {
      const payload: GPSPin = {
        riderId: r.id, riderName: r.name,
        lat: r.lat + (Math.random() - 0.5) * 0.01,
        lng: r.lng + (Math.random() - 0.5) * 0.01,
        duty: "ONLINE", ts: Date.now(),
      };
      localStorage.setItem(`rider_gps_${r.id}`, JSON.stringify(payload));
    });
    setSeeded(true);
    loadPins();
  }

  function loadPins() {
    const all: GPSPin[] = Object.keys(localStorage)
      .filter(k => k.startsWith("rider_gps_"))
      .map(k => { try { return JSON.parse(localStorage.getItem(k) || ""); } catch { return null; } })
      .filter(Boolean) as GPSPin[];
    setPins(all);
    setLastRefresh(Date.now());
    return all;
  }

  // Poll every 5 seconds
  useEffect(() => {
    loadPins();
    const id = setInterval(loadPins, 5000);
    return () => clearInterval(id);
  }, []);

  // Initialize and update Leaflet map
  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current) return;
    import("leaflet").then((L) => {
      if (!leafletRef.current) {
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        const map = L.map(mapRef.current!, {
          center: [23.8103, 90.4125], zoom: 12,
          zoomControl: true, scrollWheelZoom: true, attributionControl: false,
        });
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19 }).addTo(map);
        leafletRef.current = map;
      }

      const map = leafletRef.current;
      const staleThreshold = 30_000; // 30s
      const now = Date.now();

      // Remove stale markers
      markersRef.current.forEach((marker, id) => {
        if (!pins.find(p => p.riderId === id)) {
          map.removeLayer(marker);
          markersRef.current.delete(id);
        }
      });

      // Check active SOS alerts
      const activeSosIds = new Set<string>();
      try {
        const rawSos = localStorage.getItem("tatka_active_sos_alerts");
        if (rawSos) {
          const sosList = JSON.parse(rawSos);
          sosList.filter((s: any) => s.status === "ACTIVE").forEach((s: any) => activeSosIds.add(s.riderId));
        }
      } catch {}

      // Add/update markers
      pins.forEach(pin => {
        const isStale = (now - pin.ts) > staleThreshold;
        const isOffline = pin.duty === "OFFLINE" || isStale;
        const hasSos = activeSosIds.has(pin.riderId);

        const color = hasSos ? "#EF4444" : isOffline ? "#6b7280" : "#22C55E";
        const glow  = hasSos ? "rgba(239,68,68,.8)" : isOffline ? "rgba(107,114,128,.4)" : "rgba(34,197,94,.6)";

        const icon = L.divIcon({
          className: "",
          html: `<div style="display:flex;flex-direction:column;align-items:center;">
            <div style="position:relative;width:34px;height:34px;display:flex;align-items:center;justify-content:center;">
              ${hasSos ? `<div style="position:absolute;inset:0;border-radius:50%;background:${glow};animation:ping 1s cubic-bezier(0,0,0.2,1) infinite;"></div>` : (!isOffline ? `<div style="position:absolute;inset:0;border-radius:50%;background:${glow};animation:liveMapPulse 2s ease-out infinite;"></div>` : "")}
              <div style="width:${hasSos ? 22 : 14}px;height:${hasSos ? 22 : 14}px;border-radius:50%;background:${color};border:2.5px solid white;box-shadow:0 2px 8px ${glow};position:relative;z-index:1;display:flex;align-items:center;justify-content:center;font-size:11px;">
                ${hasSos ? "🚨" : ""}
              </div>
            </div>
            <div style="background:${hasSos ? "#ef4444" : "rgba(0,0,0,.75)"};color:#fff;font-size:9px;font-weight:700;padding:2px 5px;border-radius:4px;white-space:nowrap;margin-top:-2px;border:1px solid ${color}40;">
              ${hasSos ? "🚨 " : ""}${pin.riderName.split(" ")[0]}
            </div>
          </div>`,
          iconSize: [60, 42],
          iconAnchor: [30, 14],
        });

        const secAgo = Math.round((now - pin.ts) / 1000);
        const popupHtml = `<div style="font-size:12px;line-height:1.5;">
          <strong>${pin.riderName}</strong><br/>
          ${hasSos ? "<span style='color:#ef4444;font-weight:bold;'>🚨 EMERGENCY SOS ACTIVE!</span><br/>" : (isOffline ? (pin.duty === "OFFLINE" ? "⚪ Offline" : "⏳ Stale ("+secAgo+"s ago)") : "🟢 Online")}<br/>
          📍 ${pin.lat.toFixed(5)}, ${pin.lng.toFixed(5)}<br/>
          ⏰ ${secAgo}s ago
        </div>`;

        const existing = markersRef.current.get(pin.riderId);
        if (existing) {
          existing.setLatLng([pin.lat, pin.lng]);
          existing.setIcon(icon);
          existing.bindPopup(popupHtml);
        } else {
          const marker = L.marker([pin.lat, pin.lng], { icon })
            .addTo(map)
            .bindPopup(popupHtml);
          markersRef.current.set(pin.riderId, marker);
        }
      });
    });
  }, [pins]);

  const onlinePins  = pins.filter(p => p.duty === "ONLINE" && (Date.now() - p.ts) < 30_000);
  const offlinePins = pins.filter(p => p.duty === "OFFLINE" || (Date.now() - p.ts) >= 30_000);
  const secAgo      = Math.round((Date.now() - lastRefresh) / 1000);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Status Bar */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10,
        padding: "12px 16px",
        background: "var(--bg-raised)",
        border: "1px solid var(--border-1)",
        borderRadius: "var(--r-md)",
      }}>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#22C55E", display: "inline-block", boxShadow: "0 0 0 3px rgba(34,197,94,.25)" }} />
            <span style={{ fontSize: ".82rem", fontWeight: 700, color: "var(--text-1)" }}>ONLINE: {onlinePins.length}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#6b7280", display: "inline-block" }} />
            <span style={{ fontSize: ".82rem", color: "var(--text-3)" }}>Offline: {offlinePins.length}</span>
          </div>
          <div style={{ fontSize: ".80rem", color: "var(--text-3)" }}>
            ⏰ Refreshed {secAgo}s ago
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={loadPins}
            style={{
              padding: "6px 14px", borderRadius: "var(--r-sm)",
              border: "1px solid var(--border-2)",
              background: "transparent", color: "var(--text-2)",
              fontSize: ".78rem", fontWeight: 600, cursor: "pointer",
            }}
          >
            🔄 Refresh
          </button>
          <button
            onClick={seedDemoGPS}
            style={{
              padding: "6px 14px", borderRadius: "var(--r-sm)",
              border: "1px solid rgba(34,197,94,.35)",
              background: "rgba(34,197,94,.08)",
              color: "#22C55E",
              fontSize: ".78rem", fontWeight: 700, cursor: "pointer",
            }}
            title="Demo রাইডারদের ফেক GPS সীড করুন (প্রথমবার ম্যাপ দেখতে)"
          >
            📡 Demo GPS Seeds
          </button>
        </div>
      </div>

      {/* Map */}
      <div style={{ borderRadius: "var(--r-md)", overflow: "hidden", border: "1px solid var(--border-1)" }}>
        <style>{`
          @keyframes liveMapPulse {
            0%   { transform: scale(0.6); opacity: 0.9; }
            100% { transform: scale(2.5); opacity: 0; }
          }
        `}</style>
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" crossOrigin="" />
        <div ref={mapRef} style={{ width: "100%", height: "500px" }} />
      </div>

      {/* Online Riders List */}
      {onlinePins.length > 0 && (
        <div style={{
          background: "var(--bg-raised)", border: "1px solid var(--border-1)",
          borderRadius: "var(--r-md)", overflow: "hidden",
        }}>
          <div style={{
            padding: "10px 16px", background: "rgba(34,197,94,.06)",
            borderBottom: "1px solid var(--border-1)",
            fontSize: ".72rem", fontWeight: 700, color: "#22C55E",
            textTransform: "uppercase", letterSpacing: ".08em",
          }}>
            🟢 Online Riders ({onlinePins.length})
          </div>
          {onlinePins.map(pin => (
            <div key={pin.riderId} style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "10px 16px", borderBottom: "1px solid var(--border-1)",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{
                  width: 8, height: 8, borderRadius: "50%",
                  background: "#22C55E",
                  boxShadow: "0 0 0 3px rgba(34,197,94,.2)",
                  flexShrink: 0, display: "inline-block"
                }} />
                <div>
                  <div style={{ fontSize: ".86rem", fontWeight: 700, color: "var(--text-1)" }}>{pin.riderName}</div>
                  <div style={{ fontSize: ".70rem", color: "var(--text-3)", fontFamily: "monospace" }}>
                    📍 {pin.lat.toFixed(5)}° N, {pin.lng.toFixed(5)}° E
                  </div>
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: ".70rem", color: "var(--text-3)" }}>
                  {Math.round((Date.now() - pin.ts) / 1000)}s ago
                </div>
                <a
                  href={`https://www.google.com/maps?q=${pin.lat},${pin.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ fontSize: ".68rem", color: "var(--accent)", textDecoration: "none" }}
                >
                  View →
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {onlinePins.length === 0 && (
        <div style={{
          padding: "32px", textAlign: "center",
          background: "var(--bg-raised)", borderRadius: "var(--r-md)",
          border: "1px solid var(--border-1)",
        }}>
          <div style={{ fontSize: "2rem", marginBottom: 8 }}>📡</div>
          <div style={{ fontSize: ".90rem", fontWeight: 700, color: "var(--text-2)" }}>No online riders found</div>
          <div style={{ fontSize: ".76rem", color: "var(--text-3)", marginTop: 4 }}>
            Rider must be ONLINE on the Rider Portal to appear here. Use “Demo GPS Seeds” to test.
          </div>
        </div>
      )}
    </div>
  );
}
