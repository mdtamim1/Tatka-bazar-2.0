"use client";

import React, { useState } from "react";
import {
  UserCog, Plus, X, Check, Mail, Phone, Crown, ShieldCheck,
  Package, Headphones, Truck, Calculator, UserX, UserCheck, Trash2,
} from "lucide-react";
import { useAdmin } from "@/context/AdminContext";
import { StaffMember, AdminRole } from "@/types";

const ROLE_META: Record<AdminRole, { label: string; color: string; icon: string }> = {
  SUPER_ADMIN:          { label: "Super Admin",          color: "var(--rose)",   icon: "👑" },
  MANAGER:              { label: "Manager",               color: "var(--indigo)", icon: "🎯" },
  INVENTORY_STAFF:      { label: "Inventory Staff",       color: "var(--green)",  icon: "📦" },
  SUPPORT_STAFF:        { label: "Support Staff",         color: "var(--blue)",   icon: "💬" },
  DELIVERY_COORDINATOR: { label: "Delivery Coordinator",  color: "var(--cyan)",   icon: "🚚" },
  FINANCE:              { label: "Finance",               color: "var(--amber)",  icon: "💰" },
};

function InviteModal({ onClose }: { onClose: () => void }) {
  const { inviteStaff } = useAdmin();
  const [form, setForm] = useState({ email: "", name: "", role: "SUPPORT_STAFF" as AdminRole, phone: "" });
  const set = (k: string, v: any) => setForm(p => ({ ...p, [k]: v }));

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: "460px" }}>
        <div className="modal-header">
          <div>
            <div className="modal-title">✉️ Invite Staff Member</div>
            <div className="modal-subtitle">They'll receive an email with a setup link</div>
          </div>
          <button className="admin-btn admin-btn-ghost admin-btn-icon" onClick={onClose}><X size={16} /></button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div>
            <label className="admin-label">Full Name *</label>
            <input className="admin-input" value={form.name} onChange={e => set("name", e.target.value)} placeholder="Full name" />
          </div>
          <div>
            <label className="admin-label">Email Address *</label>
            <input className="admin-input" type="email" value={form.email} onChange={e => set("email", e.target.value)} placeholder="staff@tatkabazar.com" />
          </div>
          <div>
            <label className="admin-label">Phone (optional)</label>
            <input className="admin-input" value={form.phone} onChange={e => set("phone", e.target.value)} placeholder="01XXXXXXXXX" />
          </div>
          <div>
            <label className="admin-label">Role & Permissions *</label>
            <select className="admin-select" value={form.role} onChange={e => set("role", e.target.value as AdminRole)}>
              {Object.entries(ROLE_META).filter(([k]) => k !== "SUPER_ADMIN").map(([k, v]) => (
                <option key={k} value={k}>{v.icon} {v.label}</option>
              ))}
            </select>
            <div style={{ marginTop: "8px", padding: "10px 12px", background: "var(--bg-elevated)", borderRadius: "var(--r-md)", border: "1px solid var(--border-1)" }}>
              <div style={{ fontSize: "0.78rem", color: "var(--text-3)" }}>
                {form.role === "MANAGER" && "Can manage orders, products, vendors, riders, and staff (except Super Admin actions)."}
                {form.role === "INVENTORY_STAFF" && "Can add/edit/remove products and manage inventory stock."}
                {form.role === "SUPPORT_STAFF" && "Can view orders, moderate reviews, and respond to customer queries."}
                {form.role === "DELIVERY_COORDINATOR" && "Can assign riders, track dispatches, and manage delivery status."}
                {form.role === "FINANCE" && "Can view reports, settlement history, and manage vendor payouts."}
              </div>
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="admin-btn admin-btn-secondary" onClick={onClose}>Cancel</button>
          <button
            className="admin-btn admin-btn-primary"
            disabled={!form.email || !form.name}
            onClick={() => { inviteStaff(form.email, form.name, form.role, form.phone); onClose(); }}
          >
            <Mail size={14} /> Send Invite
          </button>
        </div>
      </div>
    </div>
  );
}

function StaffCard({ member }: { member: StaffMember }) {
  const { suspendStaff, activateStaff, removeStaff, updateStaffRole, currentUser } = useAdmin();
  const [showRoleEdit, setShowRoleEdit] = useState(false);
  const [newRole, setNewRole] = useState<AdminRole>(member.role);

  const rm = ROLE_META[member.role];
  const isSelf = currentUser.email === member.email;
  const isSuperAdmin = member.role === "SUPER_ADMIN";
  const initials = member.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="staff-card" style={{ position: "relative" }}>
      {/* Avatar */}
      <div className="staff-avatar-lg" style={{
        background: `linear-gradient(135deg, ${rm.color}40, ${rm.color}20)`,
        border: `1.5px solid ${rm.color}50`,
        color: rm.color,
      }}>
        {initials}
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <span style={{ fontWeight: 800, fontSize: "0.9rem", color: "var(--text-0)" }}>{member.name}</span>
          {isSelf && <span className="tag green" style={{ fontSize: "0.60rem" }}>You</span>}
        </div>
        <div style={{ fontSize: "0.75rem", color: "var(--text-3)", marginTop: "2px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <span>{member.email}</span>
          {member.phone && <span>{member.phone}</span>}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "8px", flexWrap: "wrap" }}>
          {!showRoleEdit ? (
            <span style={{
              display: "inline-flex", alignItems: "center", gap: "5px",
              padding: "3px 9px", borderRadius: "var(--r-full)",
              background: `${rm.color}15`, border: `1px solid ${rm.color}40`,
              fontSize: "0.72rem", fontWeight: 700, color: rm.color,
            }}>
              {rm.icon} {rm.label}
            </span>
          ) : (
            <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
              <select className="admin-select" style={{ width: "180px", padding: "4px 8px", fontSize: "0.78rem" }}
                value={newRole} onChange={e => setNewRole(e.target.value as AdminRole)}>
                {Object.entries(ROLE_META).filter(([k]) => k !== "SUPER_ADMIN").map(([k, v]) => (
                  <option key={k} value={k}>{v.icon} {v.label}</option>
                ))}
              </select>
              <button className="admin-btn admin-btn-primary admin-btn-sm" onClick={() => { updateStaffRole(member.id, newRole); setShowRoleEdit(false); }}>
                <Check size={12} />
              </button>
              <button className="admin-btn admin-btn-ghost admin-btn-sm" onClick={() => setShowRoleEdit(false)}>
                <X size={12} />
              </button>
            </div>
          )}
          <span className={`status-badge ${member.status === "ACTIVE" ? "success" : member.status === "PENDING" ? "warning" : "danger"}`}>
            {member.status}
          </span>
        </div>
        {member.lastLogin && (
          <div style={{ fontSize: "0.70rem", color: "var(--text-4)", marginTop: "5px" }}>
            Last login: {member.lastLogin}
          </div>
        )}
        {member.status === "PENDING" && (
          <div style={{ fontSize: "0.70rem", color: "var(--amber)", marginTop: "5px" }}>
            ⏳ Invite sent {member.invitedAt} by {member.invitedBy}
          </div>
        )}
      </div>

      {/* Actions */}
      {!isSelf && !isSuperAdmin && (
        <div style={{ display: "flex", gap: "6px", flexShrink: 0, alignItems: "center" }}>
          <button className="admin-btn admin-btn-ghost admin-btn-sm" title="Change role" onClick={() => setShowRoleEdit(!showRoleEdit)}>
            <UserCog size={13} />
          </button>
          {member.status === "ACTIVE" && (
            <button className="admin-btn admin-btn-amber admin-btn-sm" title="Suspend" onClick={() => suspendStaff(member.id)}>
              <UserX size={13} />
            </button>
          )}
          {member.status === "SUSPENDED" && (
            <button className="admin-btn admin-btn-primary admin-btn-sm" title="Reactivate" onClick={() => activateStaff(member.id)}>
              <UserCheck size={13} />
            </button>
          )}
          <button className="admin-btn admin-btn-danger admin-btn-sm" title="Remove" onClick={() => { if (confirm(`Remove ${member.name}?`)) removeStaff(member.id); }}>
            <Trash2 size={13} />
          </button>
        </div>
      )}
    </div>
  );
}

export default function StaffPage() {
  const { staff } = useAdmin();
  const [showInvite, setShowInvite] = useState(false);
  const [roleFilter, setRoleFilter] = useState<AdminRole | "ALL">("ALL");

  const filtered = staff.filter(s => roleFilter === "ALL" || s.role === roleFilter);
  const pendingCount = staff.filter(s => s.status === "PENDING").length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "22px" }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Staff Management</h1>
          <p className="page-subtitle">
            {staff.length} team members · {staff.filter(s => s.status === "ACTIVE").length} active
            {pendingCount > 0 && <span style={{ color: "var(--amber)", marginLeft: "12px" }}>⏳ {pendingCount} pending invites</span>}
          </p>
        </div>
        <button className="admin-btn admin-btn-primary" onClick={() => setShowInvite(true)}>
          <Plus size={14} /> Invite Staff
        </button>
      </div>

      {/* Role overview */}
      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
        {(["ALL", ...Object.keys(ROLE_META)] as (AdminRole | "ALL")[]).map(role => {
          const count = role === "ALL" ? staff.length : staff.filter(s => s.role === role).length;
          return (
            <button
              key={role}
              className={`tab-pill ${roleFilter === role ? "active" : ""}`}
              onClick={() => setRoleFilter(role)}
            >
              {role !== "ALL" ? ROLE_META[role as AdminRole]?.icon + " " : ""}
              {role === "ALL" ? "All Staff" : ROLE_META[role as AdminRole]?.label}
              <span className="tab-count">{count}</span>
            </button>
          );
        })}
      </div>

      {/* Staff list */}
      <div className="admin-card" style={{ padding: "8px" }}>
        <div className="staff-grid">
          {filtered.map(s => <StaffCard key={s.id} member={s} />)}
          {filtered.length === 0 && (
            <div className="empty-state">
              <div className="empty-state-icon">👥</div>
              <div className="empty-state-title">No staff found</div>
            </div>
          )}
        </div>
      </div>

      {/* Permission reference */}
      <div className="admin-card" style={{ padding: "20px" }}>
        <div className="section-label">Permission Reference</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "10px" }}>
          {Object.entries(ROLE_META).map(([role, meta]) => (
            <div key={role} style={{
              padding: "12px 14px", borderRadius: "var(--r-md)",
              background: "var(--bg-elevated)", border: "1px solid var(--border-1)",
            }}>
              <div style={{ fontWeight: 700, fontSize: "0.84rem", color: meta.color, marginBottom: "4px" }}>
                {meta.icon} {meta.label}
              </div>
              <div style={{ fontSize: "0.72rem", color: "var(--text-3)" }}>
                {role === "SUPER_ADMIN" && "Full system access. Cannot be restricted."}
                {role === "MANAGER" && "Orders, products, vendors, riders, staff management."}
                {role === "INVENTORY_STAFF" && "Product catalog, inventory, stock alerts."}
                {role === "SUPPORT_STAFF" && "Order view, review moderation, customer support."}
                {role === "DELIVERY_COORDINATOR" && "Dispatch, rider assignment, delivery tracking."}
                {role === "FINANCE" && "Reports, vendor payouts, revenue analytics."}
              </div>
            </div>
          ))}
        </div>
      </div>

      {showInvite && <InviteModal onClose={() => setShowInvite(false)} />}
    </div>
  );
}
