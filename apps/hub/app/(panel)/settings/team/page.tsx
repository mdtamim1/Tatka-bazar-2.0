"use client";
import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { UserCog, Plus, Edit2, Ban, CheckCircle2, Shield } from "lucide-react";

const DEFAULT_TEAM = [
  { id: "hub-admin-001", name: "Super Admin", nameBn: "Super Admin", email: "admin@tatkabazar.com", role: "SUPER_ADMIN", isActive: true, avatar: "🛡️" },
  { id: "hub-ops-001", name: "Ops Manager", nameBn: "Ops Manager", email: "ops@tatkabazar.com", role: "OPS_MANAGER", isActive: true, avatar: "⚙️" },
  { id: "hub-support-001", name: "Support Agent", nameBn: "Support Agent", email: "support@tatkabazar.com", role: "SUPPORT_AGENT", isActive: true, avatar: "💬" },
];

const ROLE_LABEL: Record<string, string> = {
  SUPER_ADMIN: "Super Admin",
  OPS_MANAGER: "Ops Manager",
  SUPPORT_AGENT: "Support Agent",
  VIEWER: "Viewer",
};
const ROLE_BADGE: Record<string, string> = {
  SUPER_ADMIN: "badge-purple", OPS_MANAGER: "badge-blue",
  SUPPORT_AGENT: "badge-orange", VIEWER: "badge-gray",
};

export default function TeamPage() {
  const { session } = useAuth();
  const [team, setTeam] = useState<any[]>(DEFAULT_TEAM);
  const [loading, setLoading] = useState(false);
  const [addModal, setAddModal] = useState(false);
  const [newMember, setNewMember] = useState({ name: "", email: "", password: "", role: "SUPPORT_AGENT" });

  const loadTeam = React.useCallback(async () => {
    if (!session?.token) return;
    try {
      const res = await fetch("/api/hub", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.token}` },
        body: JSON.stringify({ action: "GET_TEAM" }),
      });
      const json = await res.json();
      if (json.success && Array.isArray(json.data) && json.data.length > 0) {
        setTeam(json.data);
      }
    } catch {}
  }, [session?.token]);

  React.useEffect(() => {
    loadTeam();
  }, [loadTeam]);

  async function handleAddMember() {
    if (!newMember.name || !newMember.email || !newMember.password || !session?.token) return;
    setLoading(true);
    try {
      const res = await fetch("/api/hub", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.token}` },
        body: JSON.stringify({ action: "ADD_TEAM_MEMBER", member: newMember }),
      });
      const json = await res.json();
      if (json.success) {
        setAddModal(false);
        setNewMember({ name: "", email: "", password: "", role: "SUPPORT_AGENT" });
        loadTeam();
      } else {
        alert(json.error || "Failed to add member");
      }
    } catch (e: any) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleToggleStatus(id: string, currentActive: boolean) {
    if (!session?.token) return;
    try {
      await fetch("/api/hub", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.token}` },
        body: JSON.stringify({ action: "UPDATE_TEAM_MEMBER", id, updates: { isActive: !currentActive } }),
      });
      loadTeam();
    } catch {}
  }

  if (!session || session.role !== "SUPER_ADMIN") {
    return (
      <div className="hub-content">
        <div className="card"><div className="empty-state">
          <div className="empty-state-icon">🔒</div>
          <div className="empty-state-title">Restricted to Super Admins only</div>
        </div></div>
      </div>
    );
  }

  return (
    <div className="hub-content">
      <div className="page-header">
        <div className="flex-between">
          <div>
            <h1 className="page-title"><UserCog size={22} /><span>Team Management</span></h1>
            <p className="page-subtitle">Manage administrative access to the Hub panel</p>
          </div>
          <button onClick={() => setAddModal(true)} className="btn btn-primary btn-sm">
            <Plus size={14} /><span>New Member</span>
          </button>
        </div>
      </div>

      {/* Role Legend */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-title" style={{ marginBottom: 12 }}>🎭 Roles & Permissions</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {[
            { role: "SUPER_ADMIN", perms: "Full access — Team Management, Config, all approvals" },
            { role: "OPS_MANAGER", perms: "Rider/Vendor approvals, balance adjustments, commission changes" },
            { role: "SUPPORT_AGENT", perms: "Read-only access + dispatch monitoring" },
            { role: "VIEWER", perms: "Read-only access to dashboard and lists" },
          ].map((r) => (
            <div key={r.role} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span className={`badge ${ROLE_BADGE[r.role]}`} style={{ minWidth: 130 }}>
                <Shield size={10} />
                <span>{ROLE_LABEL[r.role]}</span>
              </span>
              <span className="text-sm text-muted">{r.perms}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Team List */}
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Member</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Password</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {team.map((m) => (
              <tr key={m.id}>
                <td>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{
                      width: 34, height: 34, borderRadius: 8,
                      background: "var(--bg-elevated)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 16, flexShrink: 0,
                    }}>
                      {m.avatar}
                    </div>
                    <div>
                      <div className="td-name">{m.name}</div>
                      <div className="td-sub">{ROLE_LABEL[m.role]}</div>
                    </div>
                  </div>
                </td>
                <td>{m.email}</td>
                <td>
                  <span className={`badge ${ROLE_BADGE[m.role]}`}>
                    <span>{ROLE_LABEL[m.role]}</span>
                  </span>
                </td>
                <td>
                  <span className={`badge ${m.isActive ? "badge-green" : "badge-red"}`}>
                    <span>{m.isActive ? "Active" : "Inactive"}</span>
                  </span>
                </td>
                <td>
                  <span className="text-xs text-muted">••••••••</span>
                </td>
                <td>
                  <div style={{ display: "flex", gap: 4 }}>
                    {m.id !== session.memberId && (
                      <button
                        onClick={() => handleToggleStatus(m.id, m.isActive)}
                        className="btn-icon"
                        title={m.isActive ? "Deactivate" : "Activate"}
                        style={{ color: m.isActive ? "var(--danger)" : "var(--success)" }}
                      >
                        <Ban size={12} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Modal */}
      {addModal && (
        <div className="modal-overlay" onClick={() => setAddModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-title">➕ New Team Member</div>
            <div className="modal-subtitle">Grant access to the Hub panel</div>
            <div className="form-group">
              <label className="form-label">Name</label>
              <input type="text" className="form-input" value={newMember.name} onChange={(e) => setNewMember({ ...newMember, name: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input type="email" className="form-input" value={newMember.email} onChange={(e) => setNewMember({ ...newMember, email: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input type="password" className="form-input" value={newMember.password} onChange={(e) => setNewMember({ ...newMember, password: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Role</label>
              <select className="form-input" value={newMember.role} onChange={(e) => setNewMember({ ...newMember, role: e.target.value })}>
                <option value="OPS_MANAGER">Ops Manager</option>
                <option value="SUPPORT_AGENT">Support Agent</option>
                <option value="VIEWER">Viewer</option>
              </select>
            </div>
            <div className="modal-actions">
              <button onClick={() => setAddModal(false)} className="btn btn-ghost" disabled={loading}>Cancel</button>
              <button onClick={handleAddMember} className="btn btn-primary" disabled={loading}>
                <Plus size={13} /><span>{loading ? "Adding..." : "Add Member"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
