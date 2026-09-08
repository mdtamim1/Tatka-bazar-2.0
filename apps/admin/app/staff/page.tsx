"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  UserCog, Plus, X, Check, Mail, Phone, Crown, ShieldCheck,
  Package, Headphones, Truck, Calculator, UserX, UserCheck, Trash2,
  Clock, Calendar, MapPin, Eye, AlertTriangle, CheckCircle, ShieldAlert,
  Search, ExternalLink, RefreshCw, FileText, ArrowRight, Activity, Building,
} from "lucide-react";
import { useAdmin } from "@/context/AdminContext";
import { StaffMember, AdminRole, StaffKYCStatus } from "@/types";

const ROLE_META: Record<AdminRole, { label: string; color: string; icon: string; desc: string }> = {
  SUPER_ADMIN:          { label: "Super Admin",          color: "#f43f5e", icon: "👑", desc: "Full system authority. Unrestricted master control." },
  MANAGER:              { label: "Manager",               color: "#818cf8", icon: "🎯", desc: "Manages orders, vendor allocations, catalog, and staff operations." },
  INVENTORY_STAFF:      { label: "Inventory Staff",       color: "#34d399", icon: "📦", desc: "Product stocking, warehouse batching, and inventory thresholds." },
  SUPPORT_STAFF:        { label: "Support Staff",         color: "#60a5fa", icon: "💬", desc: "Customer order inquiries, review moderation, and dispute resolution." },
  DELIVERY_COORDINATOR: { label: "Delivery Coordinator",  color: "#22d3ee", icon: "🚚", desc: "Dispatch routing, hub handover, and rider fleet assignments." },
  FINANCE:              { label: "Finance",               color: "#fbbf24", icon: "💰", desc: "Vendor payouts, revenue auditing, and balance settlements." },
};

type ActiveTab = "ALL_STAFF" | "PROFILES" | "PENDING_KYC" | "ATTENDANCE";

// ── 1. Invite Staff Modal ─────────────────────────────────────────────────────

function InviteStaffModal({ onClose }: { onClose: () => void }) {
  const { inviteStaff } = useAdmin();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    department: "Operations",
    role: "SUPPORT_STAFF" as AdminRole,
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  });

  const set = (k: string, v: any) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email) {
      alert("Please provide the staff member's real name and email.");
      return;
    }
    inviteStaff({
      name: form.name,
      email: form.email,
      phone: form.phone,
      address: form.address,
      department: form.department,
      role: form.role,
      avatar: form.avatar,
    });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1200 }}>
      <div
        className="modal-content"
        onClick={e => e.stopPropagation()}
        style={{ maxWidth: "540px", background: "#141418", border: "1px solid #272730" }}
      >
        <div className="modal-header" style={{ borderBottom: "1px solid #232328" }}>
          <div>
            <div className="modal-title" style={{ fontSize: "1.05rem", color: "#fff" }}>
              👤 Register &amp; Invite Staff Member
            </div>
            <div className="modal-subtitle">
              Account is created under their real identity. Role access unlocks upon KYC approval.
            </div>
          </div>
          <button className="admin-btn admin-btn-ghost admin-btn-icon" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: "18px 22px", display: "flex", flexDirection: "column", gap: "14px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <label className="admin-label">Staff Real Name *</label>
              <input
                className="admin-input"
                required
                value={form.name}
                onChange={e => set("name", e.target.value)}
                placeholder="e.g. Mahbubul Alam"
              />
            </div>
            <div>
              <label className="admin-label">Official Email *</label>
              <input
                className="admin-input"
                type="email"
                required
                value={form.email}
                onChange={e => set("email", e.target.value)}
                placeholder="name@tatkabazar.com"
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <label className="admin-label">Mobile Number</label>
              <input
                className="admin-input"
                value={form.phone}
                onChange={e => set("phone", e.target.value)}
                placeholder="01XXXXXXXXX"
              />
            </div>
            <div>
              <label className="admin-label">Department</label>
              <select
                className="admin-select"
                value={form.department}
                onChange={e => set("department", e.target.value)}
              >
                <option value="Operations">Operations &amp; Hub</option>
                <option value="Customer Support">Customer Support</option>
                <option value="Warehousing">Warehousing &amp; Perishables</option>
                <option value="Fleet & Logistics">Fleet &amp; Logistics</option>
                <option value="Accounts & Finance">Accounts &amp; Finance</option>
              </select>
            </div>
          </div>

          <div>
            <label className="admin-label">Residential Address</label>
            <input
              className="admin-input"
              value={form.address}
              onChange={e => set("address", e.target.value)}
              placeholder="House, Road, Area, Thana, District"
            />
          </div>

          <div>
            <label className="admin-label">Assigned Role *</label>
            <select
              className="admin-select"
              value={form.role}
              onChange={e => set("role", e.target.value as AdminRole)}
            >
              {Object.entries(ROLE_META).filter(([k]) => k !== "SUPER_ADMIN").map(([k, v]) => (
                <option key={k} value={k}>{v.icon} {v.label}</option>
              ))}
            </select>
            <div style={{ marginTop: "6px", fontSize: "0.72rem", color: "var(--text-3)" }}>
              {ROLE_META[form.role].desc}
            </div>
          </div>

          {/* Security Alert */}
          <div style={{
            background: "rgba(245, 158, 11, 0.08)",
            border: "1px solid rgba(245, 158, 11, 0.25)",
            borderRadius: "8px",
            padding: "10px 14px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}>
            <ShieldAlert size={16} color="#fbbf24" style={{ flexShrink: 0 }} />
            <div style={{ fontSize: "0.74rem", color: "#fde68a" }}>
              <strong>KYC Security Policy:</strong> This staff member will not be able to exercise system roles or view sensitive data until their KYC verification is reviewed and approved by an administrator.
            </div>
          </div>

          <div className="modal-footer" style={{ borderTop: "1px solid #232328", marginTop: "6px", padding: "14px 0 0" }}>
            <button type="button" className="admin-btn admin-btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-create-order-amber">
              <Mail size={14} /> Send Invite &amp; Register
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── 2. Staff Dossier & Profile Modal ──────────────────────────────────────────

function StaffDossierModal({
  member,
  onClose,
  onApproveKYC,
}: {
  member: StaffMember;
  onClose: () => void;
  onApproveKYC?: () => void;
}) {
  const rm = ROLE_META[member.role];
  const isKycVerified = member.kycStatus === "VERIFIED";

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1200 }}>
      <div
        className="modal-content"
        onClick={e => e.stopPropagation()}
        style={{ maxWidth: "780px", background: "#141418", border: "1px solid #282834" }}
      >
        <div className="modal-header" style={{ borderBottom: "1px solid #232328" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <img
              src={member.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80"}
              alt={member.name}
              className="staff-avatar-photo"
              style={{ width: "48px", height: "48px" }}
            />
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "1.1rem", fontWeight: 800, color: "#fff" }}>{member.name}</span>
                <span className={`kyc-badge ${isKycVerified ? "verified" : member.kycStatus === "SUBMITTED" ? "submitted" : "pending"}`}>
                  {isKycVerified ? "✓ KYC Verified" : member.kycStatus === "SUBMITTED" ? "⏳ KYC Pending Approval" : "✕ KYC Incomplete"}
                </span>
              </div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-3)", marginTop: "2px" }}>
                {rm.icon} {rm.label} · {member.department || "General Operations"} · Joined {member.joinedDate}
              </div>
            </div>
          </div>
          <button className="admin-btn admin-btn-ghost admin-btn-icon" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div style={{ padding: "20px 24px", maxHeight: "75vh", overflowY: "auto" }}>
          {/* Order Performance Metrics (Today, 30 Days, Lifetime) */}
          <div style={{ marginBottom: "20px" }}>
            <div style={{ fontSize: "0.80rem", fontWeight: 800, color: "#fff", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "10px" }}>
              📦 Order Collection &amp; Processing Performance
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
              <div className="order-metric-pill" style={{ borderColor: "#38bdf840", background: "rgba(56, 189, 248, 0.05)" }}>
                <span className="order-metric-label" style={{ color: "#38bdf8" }}>Today&apos;s Collected Orders</span>
                <span className="order-metric-value" style={{ color: "#38bdf8" }}>
                  {member.ordersCollectedToday} <span style={{ fontSize: "0.75rem", fontWeight: 500 }}>orders</span>
                </span>
              </div>
              <div className="order-metric-pill" style={{ borderColor: "#818cf840", background: "rgba(129, 140, 248, 0.05)" }}>
                <span className="order-metric-label" style={{ color: "#a5b4fc" }}>Last 30 Days Collected</span>
                <span className="order-metric-value" style={{ color: "#a5b4fc" }}>
                  {member.ordersCollectedLast30Days} <span style={{ fontSize: "0.75rem", fontWeight: 500 }}>orders</span>
                </span>
              </div>
              <div className="order-metric-pill" style={{ borderColor: "#34d39940", background: "rgba(52, 211, 153, 0.05)" }}>
                <span className="order-metric-label" style={{ color: "#34d399" }}>Lifetime Total Orders</span>
                <span className="order-metric-value" style={{ color: "#34d399" }}>
                  {member.ordersCollectedLifetime} <span style={{ fontSize: "0.75rem", fontWeight: 500 }}>orders</span>
                </span>
              </div>
            </div>
          </div>

          {/* Daily Attendance Tracker Widget */}
          <div style={{
            background: "#181820",
            border: "1px solid #282834",
            borderRadius: "10px",
            padding: "16px",
            marginBottom: "20px",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
              <div style={{ fontSize: "0.80rem", fontWeight: 800, color: "#fff", display: "flex", alignItems: "center", gap: "8px" }}>
                <Clock size={14} color="#38bdf8" /> Today&apos;s Attendance &amp; Activity
              </div>
              <div style={{ fontSize: "0.70rem", color: "var(--text-4)" }}>
                🌙 Resets daily at 12:00 AM (Midnight)
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1.2fr", gap: "10px" }}>
              <div style={{ background: "#131317", padding: "10px", borderRadius: "6px", border: "1px solid #23232a" }}>
                <div style={{ fontSize: "0.68rem", color: "var(--text-4)" }}>LOGIN TIME</div>
                <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#fff", marginTop: "2px" }}>
                  {member.dailySession.loginTime || "Not Clocked In"}
                </div>
              </div>
              <div style={{ background: "#131317", padding: "10px", borderRadius: "6px", border: "1px solid #23232a" }}>
                <div style={{ fontSize: "0.68rem", color: "var(--text-4)" }}>LOGOUT TIME</div>
                <div style={{ fontSize: "0.85rem", fontWeight: 700, color: member.dailySession.isCurrentlyOnline ? "#34d399" : "#fff", marginTop: "2px" }}>
                  {member.dailySession.logoutTime || "Inactive"}
                </div>
              </div>
              <div style={{ background: "#131317", padding: "10px", borderRadius: "6px", border: "1px solid #23232a" }}>
                <div style={{ fontSize: "0.68rem", color: "var(--text-4)" }}>HOURS ACTIVE</div>
                <div style={{ fontSize: "0.85rem", fontWeight: 800, color: "#38bdf8", marginTop: "2px" }}>
                  {Math.floor(member.dailySession.activeMinutesToday / 60)}h {member.dailySession.activeMinutesToday % 60}m
                </div>
              </div>
              <div style={{ background: "#131317", padding: "10px", borderRadius: "6px", border: "1px solid #23232a", display: "flex", alignItems: "center", gap: "8px" }}>
                <span className={member.dailySession.isCurrentlyOnline ? "online-beacon" : "offline-beacon"} />
                <div>
                  <div style={{ fontSize: "0.68rem", color: "var(--text-4)" }}>CURRENT STATE</div>
                  <div style={{ fontSize: "0.80rem", fontWeight: 700, color: member.dailySession.isCurrentlyOnline ? "#34d399" : "#94a3b8" }}>
                    {member.dailySession.isCurrentlyOnline ? "Active In System" : "Logged Out"}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Personal and KYC Information */}
          <div style={{ background: "#16161c", border: "1px solid #24242e", borderRadius: "10px", padding: "16px" }}>
            <div style={{ fontSize: "0.80rem", fontWeight: 800, color: "#fff", marginBottom: "12px", display: "flex", alignItems: "center", gap: "6px" }}>
              <ShieldCheck size={15} color="#34d399" /> KYC &amp; Verification Dossier
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", fontSize: "0.78rem" }}>
              <div>
                <span style={{ color: "var(--text-4)" }}>Official Email:</span>
                <div style={{ fontWeight: 600, color: "#fff", marginTop: "2px" }}>{member.email}</div>
              </div>
              <div>
                <span style={{ color: "var(--text-4)" }}>Phone Number:</span>
                <div style={{ fontWeight: 600, color: "#fff", marginTop: "2px" }}>{member.phone || "Not provided"}</div>
              </div>
              <div>
                <span style={{ color: "var(--text-4)" }}>National ID (NID / Smart Card):</span>
                <div style={{ fontWeight: 700, color: "#fbbf24", fontFamily: "var(--font-mono)", marginTop: "2px" }}>
                  {member.kyc?.nidNumber || "Pending submission"}
                </div>
              </div>
              <div>
                <span style={{ color: "var(--text-4)" }}>Assigned Hub / Branch:</span>
                <div style={{ fontWeight: 600, color: "#fff", marginTop: "2px" }}>{member.assignedBranch || "All Branches"}</div>
              </div>
              <div>
                <span style={{ color: "var(--text-4)" }}>Present Residential Address:</span>
                <div style={{ fontWeight: 600, color: "#e2e8f0", marginTop: "2px" }}>
                  {member.kyc?.presentAddress || member.address || "Pending verification"}
                </div>
              </div>
              <div>
                <span style={{ color: "var(--text-4)" }}>Permanent Village / Town Address:</span>
                <div style={{ fontWeight: 600, color: "#e2e8f0", marginTop: "2px" }}>
                  {member.kyc?.permanentAddress || "Pending verification"}
                </div>
              </div>
              <div>
                <span style={{ color: "var(--text-4)" }}>Emergency Contact Name:</span>
                <div style={{ fontWeight: 600, color: "#fff", marginTop: "2px" }}>
                  {member.kyc?.emergencyContactName || "Not provided"}
                </div>
              </div>
              <div>
                <span style={{ color: "var(--text-4)" }}>Emergency Contact Phone:</span>
                <div style={{ fontWeight: 600, color: "#fff", marginTop: "2px" }}>
                  {member.kyc?.emergencyContactPhone || "Not provided"}
                </div>
              </div>
            </div>

            {/* Document photo preview */}
            {member.kyc?.nidFrontUrl && (
              <div style={{ marginTop: "16px", borderTop: "1px solid #23232c", paddingTop: "12px" }}>
                <div style={{ fontSize: "0.72rem", color: "var(--text-3)", marginBottom: "8px" }}>
                  Submitted Identity Document (NID Scan):
                </div>
                <div style={{ display: "flex", gap: "10px" }}>
                  <img
                    src={member.kyc.nidFrontUrl}
                    alt="NID Front"
                    style={{ width: "140px", height: "85px", objectFit: "cover", borderRadius: "6px", border: "1px solid #33333f" }}
                  />
                  {member.kyc.nidBackUrl && (
                    <img
                      src={member.kyc.nidBackUrl}
                      alt="NID Back"
                      style={{ width: "140px", height: "85px", objectFit: "cover", borderRadius: "6px", border: "1px solid #33333f" }}
                    />
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="modal-footer" style={{ borderTop: "1px solid #232328", padding: "14px 20px" }}>
          <button className="admin-btn admin-btn-secondary" onClick={onClose}>
            Close
          </button>
          {!isKycVerified && onApproveKYC && (
            <button
              className="admin-btn admin-btn-primary"
              onClick={() => {
                onApproveKYC();
                onClose();
              }}
            >
              <CheckCircle size={14} /> Approve KYC &amp; Grant Access
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── 3. Role & Access Control Modal ────────────────────────────────────────────

function RoleControlModal({
  member,
  onClose,
}: {
  member: StaffMember;
  onClose: () => void;
}) {
  const { updateStaffRole } = useAdmin();
  const [selectedRole, setSelectedRole] = useState<AdminRole>(member.role);
  const isKycVerified = member.kycStatus === "VERIFIED";

  const handleSave = () => {
    if (!isKycVerified) {
      alert("Cannot grant active role access: Staff KYC is incomplete. Please approve KYC first.");
      return;
    }
    updateStaffRole(member.id, selectedRole);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1200 }}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: "520px", background: "#141418", border: "1px solid #282834" }}>
        <div className="modal-header" style={{ borderBottom: "1px solid #232328" }}>
          <div>
            <div className="modal-title" style={{ color: "#fff", fontSize: "1.05rem" }}>
              🛡️ Role &amp; Access Control
            </div>
            <div className="modal-subtitle">
              Configure system permissions for <strong>{member.name}</strong>
            </div>
          </div>
          <button className="admin-btn admin-btn-ghost admin-btn-icon" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div style={{ padding: "18px 22px" }}>
          {!isKycVerified && (
            <div style={{
              background: "rgba(239, 68, 68, 0.1)",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              borderRadius: "8px",
              padding: "12px 14px",
              marginBottom: "16px",
              display: "flex",
              gap: "10px",
            }}>
              <AlertTriangle size={18} color="#f87171" style={{ flexShrink: 0 }} />
              <div style={{ fontSize: "0.75rem", color: "#fca5a5" }}>
                <strong>Access Blocked by KYC System:</strong> This account has not satisfied identity verification. Even if a role is selected, system access remains locked until KYC is approved.
              </div>
            </div>
          )}

          <label className="admin-label">Select System Role</label>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "8px" }}>
            {Object.entries(ROLE_META).filter(([k]) => k !== "SUPER_ADMIN").map(([roleKey, meta]) => {
              const isSelected = selectedRole === roleKey;
              return (
                <div
                  key={roleKey}
                  onClick={() => setSelectedRole(roleKey as AdminRole)}
                  style={{
                    padding: "12px 14px",
                    borderRadius: "8px",
                    background: isSelected ? "rgba(59, 130, 246, 0.12)" : "#18181f",
                    border: isSelected ? "1.5px solid #3b82f6" : "1px solid #262630",
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontWeight: 800, fontSize: "0.86rem", color: isSelected ? "#fff" : "var(--text-1)" }}>
                      {meta.icon} {meta.label}
                    </span>
                    {isSelected && <Check size={14} color="#3b82f6" />}
                  </div>
                  <div style={{ fontSize: "0.72rem", color: "var(--text-3)", marginTop: "4px" }}>
                    {meta.desc}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="modal-footer" style={{ borderTop: "1px solid #232328" }}>
          <button className="admin-btn admin-btn-secondary" onClick={onClose}>Cancel</button>
          <button className="admin-btn admin-btn-primary" onClick={handleSave}>
            <Check size={14} /> Update Role &amp; Access
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Staff Management Component ──────────────────────────────────────────

export default function StaffPage() {
  const {
    staff,
    currentUser,
    toggleStaffStatus,
    removeStaff,
    approveStaffKYC,
    rejectStaffKYC,
  } = useAdmin();

  const [activeTab, setActiveTab] = useState<ActiveTab>("ALL_STAFF");
  const [search, setSearch] = useState("");
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<StaffMember | null>(null);
  const [roleControlMember, setRoleControlMember] = useState<StaffMember | null>(null);

  // Filtered lists
  const pendingStaffList = useMemo(() => {
    return staff.filter(s => s.kycStatus === "SUBMITTED");
  }, [staff]);

  const filteredStaff = useMemo(() => {
    return staff.filter(s => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        s.name.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        (s.phone && s.phone.includes(q)) ||
        s.role.toLowerCase().includes(q)
      );
    });
  }, [staff, search]);

  return (
    <div style={{ padding: "24px 28px", maxWidth: "1600px", margin: "0 auto" }}>
      {/* Top Header Bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px", flexWrap: "wrap", gap: "14px" }}>
        <div>
          <div style={{ fontSize: "0.75rem", color: "var(--text-4)", marginBottom: "4px" }}>
            Admin &gt; <span style={{ color: "var(--text-2)" }}>Staff</span>
          </div>
          <h1 style={{ fontSize: "1.45rem", fontWeight: 900, color: "#fff", letterSpacing: "-0.02em", margin: 0, display: "flex", alignItems: "center", gap: "10px" }}>
            <span>Staff Management &amp; Control</span>
          </h1>
          <p style={{ fontSize: "0.78rem", color: "var(--text-3)", margin: "4px 0 0" }}>
            Manage staff accounts under real identity, enforce KYC access controls, and track daily attendance.
          </p>
        </div>

        {/* Prominent Invite Staff Button */}
        <button
          className="btn-create-order-amber"
          onClick={() => setShowInviteModal(true)}
          style={{ fontSize: "0.85rem", padding: "10px 18px" }}
        >
          <Plus size={16} /> Invite Staff
        </button>
      </div>

      {/* 4 Clean Navigation Tabs */}
      <div className="staff-tab-bar">
        <button
          className={`staff-tab-btn ${activeTab === "ALL_STAFF" ? "active" : ""}`}
          onClick={() => setActiveTab("ALL_STAFF")}
        >
          <span>👥 All Staff</span>
          <span className="staff-tab-count">{staff.length}</span>
        </button>

        <button
          className={`staff-tab-btn ${activeTab === "PROFILES" ? "active" : ""}`}
          onClick={() => setActiveTab("PROFILES")}
        >
          <span>🪪 Staffs Profiles</span>
          <span className="staff-tab-count">{staff.length}</span>
        </button>

        <button
          className={`staff-tab-btn ${activeTab === "PENDING_KYC" ? "active" : ""}`}
          onClick={() => setActiveTab("PENDING_KYC")}
        >
          <span>⏳ Pending Staff</span>
          <span className={`staff-tab-count ${pendingStaffList.length > 0 ? "amber" : ""}`}>
            {pendingStaffList.length}
          </span>
        </button>

        <button
          className={`staff-tab-btn ${activeTab === "ATTENDANCE" ? "active" : ""}`}
          onClick={() => setActiveTab("ATTENDANCE")}
        >
          <span>⏱️ Attendance &amp; Tracker</span>
          <span className="staff-tab-count">
            {staff.filter(s => s.dailySession.isCurrentlyOnline).length} Online
          </span>
        </button>
      </div>

      {/* ── TAB 1: ALL STAFF (Simplified Table, Active/Deactive, Role Access) ── */}
      {activeTab === "ALL_STAFF" && (
        <div>
          {/* Search Bar */}
          <div style={{ marginBottom: "16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div className="search-wrap" style={{ maxWidth: "360px" }}>
              <Search size={14} className="search-icon" />
              <input
                className="search-input"
                style={{ background: "#141418", borderColor: "#27272e" }}
                placeholder="Search staff name, email, phone..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-4)" }}>
              Tip: Click the toggle switch to activate or suspend any staff member instantly.
            </div>
          </div>

          <div className="admin-card" style={{ padding: 0, overflow: "hidden", background: "#141418", border: "1px solid #232328" }}>
            <div style={{ overflowX: "auto" }}>
              <table className="admin-table">
                <thead>
                  <tr style={{ background: "#16161a", borderBottom: "1px solid #232328" }}>
                    <th>STAFF MEMBER</th>
                    <th>CONTACT</th>
                    <th>ROLE &amp; PERMISSION</th>
                    <th>KYC ACCESS STATE</th>
                    <th>STATUS (ACTIVE / DEACTIVE)</th>
                    <th>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStaff.map(member => {
                    const isSelf = currentUser?.email === member.email;
                    const isSuper = member.role === "SUPER_ADMIN";
                    const isKycVerified = member.kycStatus === "VERIFIED";
                    const rm = ROLE_META[member.role];

                    return (
                      <tr key={member.id} style={{ borderBottom: "1px solid #1f1f26" }}>
                        {/* Member Identity */}
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <img
                              src={member.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80"}
                              alt={member.name}
                              style={{ width: "36px", height: "36px", borderRadius: "8px", objectFit: "cover", border: "1px solid #2c2c36" }}
                            />
                            <div>
                              <div style={{ fontWeight: 800, fontSize: "0.85rem", color: "#fff", display: "flex", alignItems: "center", gap: "6px" }}>
                                <span>{member.name}</span>
                                {isSelf && (
                                  <span style={{ fontSize: "0.62rem", background: "rgba(16, 185, 129, 0.15)", color: "#34d399", padding: "1px 6px", borderRadius: "4px", border: "1px solid rgba(16, 185, 129, 0.3)" }}>
                                    You
                                  </span>
                                )}
                              </div>
                              <div style={{ fontSize: "0.70rem", color: "var(--text-4)", marginTop: "1px" }}>
                                {member.department || "Operations"} · {member.assignedBranch || "All Hubs"}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Contact */}
                        <td>
                          <div style={{ fontSize: "0.80rem", color: "#e2e8f0" }}>{member.email}</div>
                          <div style={{ fontSize: "0.72rem", color: "var(--text-4)", marginTop: "1px" }}>{member.phone || "No phone"}</div>
                        </td>

                        {/* Role */}
                        <td>
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "5px",
                              padding: "3px 9px",
                              borderRadius: "6px",
                              background: `${rm.color}15`,
                              border: `1px solid ${rm.color}40`,
                              fontSize: "0.74rem",
                              fontWeight: 700,
                              color: rm.color,
                            }}
                          >
                            {rm.icon} {rm.label}
                          </span>
                        </td>

                        {/* KYC Access State */}
                        <td>
                          {isKycVerified ? (
                            <span className="kyc-badge verified">
                              <ShieldCheck size={11} /> KYC Verified
                            </span>
                          ) : member.kycStatus === "SUBMITTED" ? (
                            <span
                              className="kyc-badge submitted"
                              style={{ cursor: "pointer" }}
                              title="Click to review KYC documents"
                              onClick={() => setSelectedMember(member)}
                            >
                              <Clock size={11} /> Pending Review
                            </span>
                          ) : (
                            <span className="kyc-badge pending" title="Role access locked">
                              <AlertTriangle size={11} /> KYC Incomplete
                            </span>
                          )}
                        </td>

                        {/* 1-Click Active / Deactive Switch */}
                        <td>
                          <div
                            className="staff-toggle-switch"
                            onClick={() => {
                              if (isSuper && isSelf) {
                                alert("Cannot deactivate own Super Admin account.");
                                return;
                              }
                              toggleStaffStatus(member.id);
                            }}
                          >
                            <div className={`staff-toggle-track ${member.status === "ACTIVE" ? "active" : ""}`}>
                              <div className="staff-toggle-thumb" />
                            </div>
                            <span style={{ fontSize: "0.76rem", fontWeight: 700, color: member.status === "ACTIVE" ? "#34d399" : "#f87171" }}>
                              {member.status === "ACTIVE" ? "Active" : "Deactive"}
                            </span>
                          </div>
                        </td>

                        {/* Actions */}
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <button
                              className="order-action-icon-btn"
                              title="View Full Profile & Performance"
                              onClick={() => setSelectedMember(member)}
                            >
                              <Eye size={13} />
                            </button>

                            {!isSuper && (
                              <button
                                className="order-action-icon-btn"
                                title="Edit Role & Permissions"
                                onClick={() => setRoleControlMember(member)}
                              >
                                <UserCog size={13} />
                              </button>
                            )}

                            {!isSuper && !isSelf && (
                              <button
                                className="order-action-icon-btn"
                                style={{ color: "#f87171" }}
                                title="Remove Staff Member"
                                onClick={() => {
                                  if (confirm(`Are you sure you want to permanently remove ${member.name}?`)) {
                                    removeStaff(member.id);
                                  }
                                }}
                              >
                                <Trash2 size={13} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {filteredStaff.length === 0 && (
                <div className="empty-state">
                  <div className="empty-state-icon">👥</div>
                  <div className="empty-state-title">No staff members match the filter</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 2: STAFFS PROFILES (Orders Collected: Today, 30 Days, Lifetime) ── */}
      {activeTab === "PROFILES" && (
        <div className="staff-profiles-grid">
          {filteredStaff.map(member => {
            const rm = ROLE_META[member.role];
            const isKycVerified = member.kycStatus === "VERIFIED";

            return (
              <div key={member.id} className="staff-profile-card">
                {/* Header */}
                <div className="staff-profile-header">
                  <img
                    src={member.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80"}
                    alt={member.name}
                    className="staff-avatar-photo"
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div style={{ fontWeight: 900, fontSize: "0.95rem", color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {member.name}
                      </div>
                      <span className={`kyc-badge ${isKycVerified ? "verified" : member.kycStatus === "SUBMITTED" ? "submitted" : "pending"}`}>
                        {isKycVerified ? "Verified" : "KYC Pending"}
                      </span>
                    </div>
                    <div style={{ fontSize: "0.72rem", color: rm.color, fontWeight: 700, marginTop: "2px" }}>
                      {rm.icon} {rm.label}
                    </div>
                    <div style={{ fontSize: "0.70rem", color: "var(--text-4)", marginTop: "2px" }}>
                      {member.department || "Operations"} · {member.assignedBranch || "Central"}
                    </div>
                  </div>
                </div>

                {/* Performance Metrics: Today, 30 Days, Lifetime */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px", marginBottom: "14px" }}>
                  <div className="order-metric-pill">
                    <span className="order-metric-label">Today</span>
                    <span className="order-metric-value" style={{ color: "#38bdf8" }}>
                      {member.ordersCollectedToday}
                    </span>
                  </div>
                  <div className="order-metric-pill">
                    <span className="order-metric-label">30 Days</span>
                    <span className="order-metric-value" style={{ color: "#a5b4fc" }}>
                      {member.ordersCollectedLast30Days}
                    </span>
                  </div>
                  <div className="order-metric-pill">
                    <span className="order-metric-label">Lifetime</span>
                    <span className="order-metric-value" style={{ color: "#34d399" }}>
                      {member.ordersCollectedLifetime}
                    </span>
                  </div>
                </div>

                {/* Session Snippet */}
                <div style={{
                  background: "#181820",
                  border: "1px solid #262632",
                  borderRadius: "8px",
                  padding: "8px 12px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  fontSize: "0.72rem",
                  marginBottom: "14px",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span className={member.dailySession.isCurrentlyOnline ? "online-beacon" : "offline-beacon"} />
                    <span style={{ color: "var(--text-2)" }}>
                      Login: <strong>{member.dailySession.loginTime || "—"}</strong>
                    </span>
                  </div>
                  <span style={{ color: "#38bdf8", fontWeight: 700 }}>
                    {Math.floor(member.dailySession.activeMinutesToday / 60)}h {member.dailySession.activeMinutesToday % 60}m active
                  </span>
                </div>

                {/* View Details Button */}
                <button
                  className="admin-btn admin-btn-secondary"
                  style={{ width: "100%", justifyContent: "center", fontSize: "0.78rem" }}
                  onClick={() => setSelectedMember(member)}
                >
                  <Eye size={13} /> View Full Profile &amp; KYC Dossier
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* ── TAB 3: PENDING STAFF (KYC Verification Queue) ───────────────────── */}
      {activeTab === "PENDING_KYC" && (
        <div>
          <div style={{
            background: "#181820",
            border: "1px solid #282834",
            borderRadius: "10px",
            padding: "16px 20px",
            marginBottom: "20px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "12px",
          }}>
            <div>
              <div style={{ fontWeight: 800, fontSize: "0.95rem", color: "#fff", display: "flex", alignItems: "center", gap: "8px" }}>
                <ShieldCheck size={18} color="#fbbf24" /> KYC Verification Queue
              </div>
              <div style={{ fontSize: "0.74rem", color: "var(--text-3)", marginTop: "3px" }}>
                Review submitted National ID and address proofs. Approving an account immediately unlocks its assigned role permissions.
              </div>
            </div>
            <div style={{ fontSize: "0.80rem", fontWeight: 800, color: "#fbbf24" }}>
              {pendingStaffList.length} Pending Approvals
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(440px, 1fr))", gap: "16px" }}>
            {pendingStaffList.map(member => {
              const rm = ROLE_META[member.role];

              return (
                <div
                  key={member.id}
                  style={{
                    background: "#141418",
                    border: "1px solid #282834",
                    borderRadius: "12px",
                    padding: "20px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "14px",
                  }}
                >
                  <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                    <img
                      src={member.avatar}
                      alt={member.name}
                      style={{ width: "48px", height: "48px", borderRadius: "10px", objectFit: "cover", border: "1px solid #33333f" }}
                    />
                    <div>
                      <div style={{ fontWeight: 800, fontSize: "0.95rem", color: "#fff" }}>{member.name}</div>
                      <div style={{ fontSize: "0.72rem", color: rm.color, fontWeight: 700 }}>
                        {rm.icon} {rm.label} · Applied: {member.kyc?.submittedAt || "Recently"}
                      </div>
                      <div style={{ fontSize: "0.72rem", color: "var(--text-3)" }}>
                        {member.email} · {member.phone}
                      </div>
                    </div>
                  </div>

                  {/* KYC Submitted Data */}
                  <div style={{ background: "#191922", border: "1px solid #262632", borderRadius: "8px", padding: "12px", fontSize: "0.75rem" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                      <div>
                        <span style={{ color: "var(--text-4)" }}>NID / ID Number:</span>
                        <div style={{ fontWeight: 800, color: "#fbbf24", fontFamily: "var(--font-mono)" }}>
                          {member.kyc?.nidNumber}
                        </div>
                      </div>
                      <div>
                        <span style={{ color: "var(--text-4)" }}>Emergency Contact:</span>
                        <div style={{ fontWeight: 600, color: "#fff" }}>
                          {member.kyc?.emergencyContactName} ({member.kyc?.emergencyContactPhone})
                        </div>
                      </div>
                      <div style={{ gridColumn: "span 2" }}>
                        <span style={{ color: "var(--text-4)" }}>Address:</span>
                        <div style={{ color: "#e2e8f0" }}>{member.kyc?.presentAddress}</div>
                      </div>
                    </div>

                    {/* Document Previews */}
                    {member.kyc?.nidFrontUrl && (
                      <div style={{ marginTop: "10px", display: "flex", gap: "8px" }}>
                        <img
                          src={member.kyc.nidFrontUrl}
                          alt="NID Front"
                          style={{ width: "100px", height: "60px", objectFit: "cover", borderRadius: "4px", border: "1px solid #383844" }}
                        />
                        {member.kyc.nidBackUrl && (
                          <img
                            src={member.kyc.nidBackUrl}
                            alt="NID Back"
                            style={{ width: "100px", height: "60px", objectFit: "cover", borderRadius: "4px", border: "1px solid #383844" }}
                          />
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div style={{ display: "flex", gap: "10px", marginTop: "auto" }}>
                    <button
                      className="admin-btn admin-btn-danger"
                      style={{ flex: 1, justifyContent: "center", fontSize: "0.78rem" }}
                      onClick={() => {
                        const reason = prompt("Enter reason for rejecting KYC:");
                        if (reason) rejectStaffKYC(member.id, reason);
                      }}
                    >
                      <X size={14} /> Reject
                    </button>
                    <button
                      className="admin-btn admin-btn-primary"
                      style={{ flex: 1.5, justifyContent: "center", fontSize: "0.78rem" }}
                      onClick={() => approveStaffKYC(member.id)}
                    >
                      <CheckCircle size={14} /> Approve KYC
                    </button>
                  </div>
                </div>
              );
            })}

            {pendingStaffList.length === 0 && (
              <div className="empty-state" style={{ gridColumn: "1 / -1" }}>
                <div className="empty-state-icon">✅</div>
                <div className="empty-state-title">All caught up! No pending staff KYC submissions</div>
                <div className="empty-state-desc">New staff submissions will appear here for verification.</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── TAB 4: ATTENDANCE & REAL-TIME SESSION TRACKER ───────────────────── */}
      {activeTab === "ATTENDANCE" && (
        <div>
          {/* Midnight Reset Banner */}
          <div style={{
            background: "#181822",
            border: "1px solid #282836",
            borderRadius: "10px",
            padding: "16px 20px",
            marginBottom: "20px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "12px",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{
                width: "40px",
                height: "40px",
                borderRadius: "10px",
                background: "rgba(56, 189, 248, 0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#38bdf8",
              }}>
                <Clock size={20} />
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: "0.95rem", color: "#fff" }}>
                  Daily Attendance &amp; Real-Time Session Tracker
                </div>
                <div style={{ fontSize: "0.74rem", color: "var(--text-3)", marginTop: "2px" }}>
                  🌙 <strong>Automatic Daily Reset:</strong> Daily login, logout and active work duration counters reset every night at <strong>12:00 AM (Midnight)</strong>.
                </div>
              </div>
            </div>

            <div style={{ display: "flex", gap: "12px" }}>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "0.70rem", color: "var(--text-4)" }}>ACTIVE RIGHT NOW</div>
                <div style={{ fontSize: "1.1rem", fontWeight: 900, color: "#34d399", display: "flex", alignItems: "center", gap: "6px" }}>
                  <span className="online-beacon" />
                  {staff.filter(s => s.dailySession.isCurrentlyOnline).length} Staff Online
                </div>
              </div>
            </div>
          </div>

          {/* Attendance Table */}
          <div className="admin-card" style={{ padding: 0, overflow: "hidden", background: "#141418", border: "1px solid #232328" }}>
            <div style={{ overflowX: "auto" }}>
              <table className="admin-table">
                <thead>
                  <tr style={{ background: "#16161a", borderBottom: "1px solid #232328" }}>
                    <th>STAFF MEMBER</th>
                    <th>DEPARTMENT / BRANCH</th>
                    <th>TODAY LOGIN</th>
                    <th>TODAY LOGOUT</th>
                    <th>ACTIVE TIME TODAY</th>
                    <th>8-HOUR WORKDAY PROGRESS</th>
                    <th>LIVE STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {staff.map(member => {
                    const online = member.dailySession.isCurrentlyOnline;
                    const mins = member.dailySession.activeMinutesToday;
                    const pct = Math.min(100, Math.round((mins / 480) * 100));

                    return (
                      <tr key={member.id} style={{ borderBottom: "1px solid #1f1f26" }}>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <img
                              src={member.avatar}
                              alt={member.name}
                              style={{ width: "34px", height: "34px", borderRadius: "8px", objectFit: "cover" }}
                            />
                            <div>
                              <div style={{ fontWeight: 800, fontSize: "0.84rem", color: "#fff" }}>{member.name}</div>
                              <div style={{ fontSize: "0.70rem", color: "var(--text-4)" }}>{member.email}</div>
                            </div>
                          </div>
                        </td>

                        <td>
                          <div style={{ fontSize: "0.78rem", color: "#e2e8f0" }}>{member.department || "Operations"}</div>
                          <div style={{ fontSize: "0.70rem", color: "var(--text-4)" }}>{member.assignedBranch || "Central Hub"}</div>
                        </td>

                        <td>
                          <div style={{ fontWeight: 700, fontSize: "0.82rem", color: "#fff" }}>
                            {member.dailySession.loginTime || "—"}
                          </div>
                        </td>

                        <td>
                          <div style={{ fontWeight: 700, fontSize: "0.82rem", color: online ? "#34d399" : "#e2e8f0" }}>
                            {member.dailySession.logoutTime || "—"}
                          </div>
                        </td>

                        <td>
                          <div style={{ fontWeight: 800, fontSize: "0.86rem", color: "#38bdf8", fontFamily: "var(--font-mono)" }}>
                            {Math.floor(mins / 60)}h {mins % 60}m
                          </div>
                        </td>

                        {/* Progress Bar */}
                        <td style={{ minWidth: "160px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <div style={{ flex: 1, height: "6px", background: "#22222a", borderRadius: "3px", overflow: "hidden" }}>
                              <div style={{ width: `${pct}%`, height: "100%", background: pct >= 80 ? "#34d399" : pct >= 50 ? "#38bdf8" : "#fbbf24", borderRadius: "3px" }} />
                            </div>
                            <span style={{ fontSize: "0.70rem", fontWeight: 700, color: "var(--text-3)", width: "32px" }}>
                              {pct}%
                            </span>
                          </div>
                        </td>

                        {/* Live State */}
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <span className={online ? "online-beacon" : "offline-beacon"} />
                            <span style={{ fontSize: "0.75rem", fontWeight: 700, color: online ? "#34d399" : "var(--text-4)" }}>
                              {online ? "Active Now" : "Offline"}
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── Modals ───────────────────────────────────────────────────────────── */}

      {/* 1. Invite Staff Modal */}
      {showInviteModal && (
        <InviteStaffModal onClose={() => setShowInviteModal(false)} />
      )}

      {/* 2. Staff Profile Dossier Modal */}
      {selectedMember && (
        <StaffDossierModal
          member={selectedMember}
          onClose={() => setSelectedMember(null)}
          onApproveKYC={() => approveStaffKYC(selectedMember.id)}
        />
      )}

      {/* 3. Role & Access Control Modal */}
      {roleControlMember && (
        <RoleControlModal
          member={roleControlMember}
          onClose={() => setRoleControlMember(null)}
        />
      )}
    </div>
  );
}
