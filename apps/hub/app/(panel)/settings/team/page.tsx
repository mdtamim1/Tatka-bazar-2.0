"use client";
import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { UserCog, Plus, Edit2, Ban, CheckCircle2, Shield } from "lucide-react";

const DEFAULT_TEAM = [
  { id: "hub-admin-001", name: "Super Admin", nameBn: "সুপার অ্যাডমিন", email: "admin@tatkabazar.com", role: "SUPER_ADMIN", isActive: true, avatar: "🛡️" },
  { id: "hub-ops-001", name: "Ops Manager", nameBn: "অপস ম্যানেজার", email: "ops@tatkabazar.com", role: "OPS_MANAGER", isActive: true, avatar: "⚙️" },
  { id: "hub-support-001", name: "Support Agent", nameBn: "সাপোর্ট এজেন্ট", email: "support@tatkabazar.com", role: "SUPPORT_AGENT", isActive: true, avatar: "💬" },
];

const ROLE_BN: Record<string, string> = {
  SUPER_ADMIN: "সুপার অ্যাডমিন",
  OPS_MANAGER: "অপস ম্যানেজার",
  SUPPORT_AGENT: "সাপোর্ট এজেন্ট",
  VIEWER: "ভিউয়ার",
};
const ROLE_BADGE: Record<string, string> = {
  SUPER_ADMIN: "badge-purple", OPS_MANAGER: "badge-blue",
  SUPPORT_AGENT: "badge-orange", VIEWER: "badge-gray",
};

export default function TeamPage() {
  const { session } = useAuth();
  const [team] = useState(DEFAULT_TEAM);
  const [addModal, setAddModal] = useState(false);
  const [newMember, setNewMember] = useState({ name: "", email: "", password: "", role: "SUPPORT_AGENT" });

  if (!session || session.role !== "SUPER_ADMIN") {
    return (
      <div className="hub-content">
        <div className="card"><div className="empty-state">
          <div className="empty-state-icon">🔒</div>
          <div className="empty-state-title font-bn">শুধুমাত্র Super Admin দেখতে পারবেন</div>
        </div></div>
      </div>
    );
  }

  return (
    <div className="hub-content">
      <div className="page-header">
        <div className="flex-between">
          <div>
            <h1 className="page-title"><UserCog size={22} /><span className="font-bn">টিম ম্যানেজমেন্ট</span></h1>
            <p className="page-subtitle font-bn">Hub panel-এ কে কে অ্যাক্সেস করতে পারবেন</p>
          </div>
          <button onClick={() => setAddModal(true)} className="btn btn-primary btn-sm">
            <Plus size={14} /><span className="font-bn">নতুন সদস্য</span>
          </button>
        </div>
      </div>

      {/* Role Legend */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-title font-bn" style={{ marginBottom: 12 }}>🎭 ভূমিকা ও অনুমতি</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {[
            { role: "SUPER_ADMIN", perms: "সব কিছু — Team Management, Config, সব approval" },
            { role: "OPS_MANAGER", perms: "Rider/Vendor approval, balance adjust, commission change" },
            { role: "SUPPORT_AGENT", perms: "শুধু দেখতে পারবেন + dispatch monitor" },
            { role: "VIEWER", perms: "শুধু dashboard ও তালিকা দেখতে পারবেন" },
          ].map((r) => (
            <div key={r.role} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span className={`badge ${ROLE_BADGE[r.role]}`} style={{ minWidth: 130 }}>
                <Shield size={10} />
                <span className="font-bn">{ROLE_BN[r.role]}</span>
              </span>
              <span className="font-bn text-sm text-muted">{r.perms}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Team List */}
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>সদস্য</th>
              <th>ইমেইল</th>
              <th>ভূমিকা</th>
              <th>স্ট্যাটাস</th>
              <th>পাসওয়ার্ড</th>
              <th>অ্যাকশন</th>
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
                      <div className="td-name font-bn">{m.nameBn || m.name}</div>
                      <div className="td-sub">{m.name}</div>
                    </div>
                  </div>
                </td>
                <td>{m.email}</td>
                <td>
                  <span className={`badge ${ROLE_BADGE[m.role]}`}>
                    <span className="font-bn">{ROLE_BN[m.role]}</span>
                  </span>
                </td>
                <td>
                  <span className={`badge ${m.isActive ? "badge-green" : "badge-red"}`}>
                    <span className="font-bn">{m.isActive ? "সক্রিয়" : "নিষ্ক্রিয়"}</span>
                  </span>
                </td>
                <td>
                  <span className="text-xs text-muted">••••••••</span>
                </td>
                <td>
                  <div style={{ display: "flex", gap: 4 }}>
                    <button className="btn-icon" title="সম্পাদনা"><Edit2 size={12} /></button>
                    {m.id !== session.memberId && (
                      <button className="btn-icon" title="নিষ্ক্রিয় করুন" style={{ color: "var(--danger)" }}>
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
            <div className="modal-title font-bn">➕ নতুন টিম সদস্য</div>
            <div className="modal-subtitle font-bn">Hub panel-এ নতুন অ্যাক্সেস দিন</div>
            <div className="form-group">
              <label className="form-label font-bn">নাম</label>
              <input type="text" className="form-input" value={newMember.name} onChange={(e) => setNewMember({ ...newMember, name: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label font-bn">ইমেইল</label>
              <input type="email" className="form-input" value={newMember.email} onChange={(e) => setNewMember({ ...newMember, email: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label font-bn">পাসওয়ার্ড</label>
              <input type="password" className="form-input" value={newMember.password} onChange={(e) => setNewMember({ ...newMember, password: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label font-bn">ভূমিকা</label>
              <select className="form-input font-bn" value={newMember.role} onChange={(e) => setNewMember({ ...newMember, role: e.target.value })}>
                <option value="OPS_MANAGER">অপস ম্যানেজার</option>
                <option value="SUPPORT_AGENT">সাপোর্ট এজেন্ট</option>
                <option value="VIEWER">ভিউয়ার</option>
              </select>
            </div>
            <div className="modal-actions">
              <button onClick={() => setAddModal(false)} className="btn btn-ghost">বাতিল</button>
              <button onClick={() => setAddModal(false)} className="btn btn-primary">
                <Plus size={13} /><span className="font-bn">যোগ করুন</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
