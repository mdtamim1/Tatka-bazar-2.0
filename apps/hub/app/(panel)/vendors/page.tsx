"use client";
import React, { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { Store, Search, RefreshCw, Ban, CheckCircle2, TrendingUp, Settings } from "lucide-react";
import type { HubVendor } from "@/types/hub";

const STATUS_BADGE: Record<string, string> = {
  ACTIVE: "badge-green", SUSPENDED: "badge-red",
  PENDING_APPROVAL: "badge-orange", REJECTED: "badge-red",
};
const STATUS_LABEL: Record<string, string> = {
  ACTIVE: "Active", SUSPENDED: "Suspended",
  PENDING_APPROVAL: "Pending Approval", REJECTED: "Rejected",
};
const TIER_LABEL: Record<string, string> = {
  STANDARD: "⬜ Standard", TRUSTED: "🔵 Trusted", PREMIUM: "💜 Premium",
};

function CommissionModal({ vendor, token, onClose, onDone }: {
  vendor: HubVendor; token: string; onClose: () => void; onDone: () => void;
}) {
  const [rate, setRate] = useState(String(vendor.commissionRate));
  const [loading, setLoading] = useState(false);

  async function submit() {
    setLoading(true);
    await fetch("/api/vendors", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ id: vendor.id, commissionRate: Number(rate) }),
    });
    setLoading(false);
    onDone(); onClose();
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-title">⚙️ Change Commission Rate</div>
        <div className="modal-subtitle">{vendor.storeName}</div>
        <div className="form-group">
          <label className="form-label">Current Rate: {vendor.commissionRate}%</label>
          <input
            type="number"
            className="form-input"
            min={1} max={30} step={0.5}
            value={rate}
            onChange={(e) => setRate(e.target.value)}
          />
        </div>
        <div className="modal-actions">
          <button onClick={onClose} className="btn btn-ghost">Cancel</button>
          <button onClick={submit} disabled={loading} className="btn btn-purple">
            {loading ? "..." : "Update Rate"}
          </button>
        </div>
      </div>
    </div>
  );
}

function SuspendVendorModal({ vendor, token, onClose, onDone }: {
  vendor: HubVendor; token: string; onClose: () => void; onDone: () => void;
}) {
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit() {
    if (!reason) return;
    setLoading(true);
    await fetch("/api/vendors", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ id: vendor.id, status: "SUSPENDED", suspendReason: reason }),
    });
    setLoading(false);
    onDone(); onClose();
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-title">🚫 Suspend Vendor</div>
        <div className="modal-subtitle">{vendor.storeName}</div>
        <div className="form-group">
          <label className="form-label">Reason</label>
          <input type="text" className="form-input" placeholder="Enter reason..." value={reason} onChange={(e) => setReason(e.target.value)} />
        </div>
        <div className="modal-actions">
          <button onClick={onClose} className="btn btn-ghost">Cancel</button>
          <button onClick={submit} disabled={loading || !reason} className="btn btn-danger">Suspend Vendor</button>
        </div>
      </div>
    </div>
  );
}

export default function VendorsPage() {
  const { session } = useAuth();
  const token = session?.token || "";
  const [vendors, setVendors] = useState<HubVendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [commModal, setCommModal] = useState<HubVendor | null>(null);
  const [suspModal, setSuspModal] = useState<HubVendor | null>(null);

  const fetchVendors = useCallback(async () => {
    const res = await fetch("/api/vendors", { headers: { Authorization: `Bearer ${token}` } });
    const json = await res.json();
    if (json.success) setVendors(json.data);
    setLoading(false);
  }, [token]);

  useEffect(() => { fetchVendors(); }, [fetchVendors]);

  async function toggleVacation(v: HubVendor) {
    await fetch("/api/vendors", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ id: v.id, vacationMode: !v.vacationMode }),
    });
    fetchVendors();
  }

  async function activate(id: string) {
    await fetch("/api/vendors", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ id, status: "ACTIVE" }),
    });
    fetchVendors();
  }

  const filtered = vendors.filter((v) => {
    const q = search.toLowerCase();
    const matchQ = !q ||
      v.storeName.toLowerCase().includes(q) ||
      (v.storeNameBn && v.storeNameBn.includes(q)) ||
      v.ownerName.toLowerCase().includes(q) ||
      v.phone.includes(q);
    const matchS = filterStatus === "ALL" || v.status === filterStatus;
    return matchQ && matchS;
  });

  return (
    <div className="hub-content">
      <div className="page-header">
        <div className="flex-between">
          <div>
            <h1 className="page-title"><Store size={22} /><span>All Vendors</span></h1>
            <p className="page-subtitle">Total {vendors.length} registered vendors</p>
          </div>
          <button onClick={fetchVendors} className="btn btn-ghost btn-sm"><RefreshCw size={13} /></button>
        </div>
      </div>

      <div className="filter-bar">
        <div className="search-input-wrap" style={{ maxWidth: 300 }}>
          <Search size={14} />
          <input
            type="text" className="form-input search-input"
            placeholder="Search by store or owner..."
            value={search} onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select className="form-input" style={{ maxWidth: 180 }} value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="ALL">All Statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="PENDING_APPROVAL">Pending Approval</option>
          <option value="SUSPENDED">Suspended</option>
        </select>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Store / Owner</th>
              <th>Phone</th>
              <th>Status</th>
              <th>Tier</th>
              <th>Commission</th>
              <th>Orders</th>
              <th>Balance</th>
              <th>Vacation</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <tr key={i}>{Array.from({ length: 9 }).map((_, j) => (
                  <td key={j}><div className="skeleton" style={{ height: 14, width: "80%" }} /></td>
                ))}</tr>
              ))
            ) : filtered.length === 0 ? (
              <tr><td colSpan={9}>
                <div className="empty-state">
                  <div className="empty-state-icon">🏪</div>
                  <div className="empty-state-title">No vendors found</div>
                </div>
              </td></tr>
            ) : filtered.map((v) => (
              <tr key={v.id}>
                <td>
                  <div className="td-name">{v.storeName}</div>
                  <div className="td-sub">{v.ownerName}</div>
                </td>
                <td><span style={{ fontSize: 13 }}>{v.phone}</span></td>
                <td>
                  <span className={`badge ${STATUS_BADGE[v.status] || "badge-gray"}`}>
                    <span>{STATUS_LABEL[v.status] || v.status}</span>
                  </span>
                </td>
                <td>
                  <span className={`tier-${v.tier}`} style={{ fontSize: 12, fontWeight: 600 }}>
                    {TIER_LABEL[v.tier] || v.tier}
                  </span>
                </td>
                <td>
                  <span style={{ fontWeight: 700, color: "var(--accent-green)" }}>{v.commissionRate}%</span>
                </td>
                <td>
                  <span style={{ fontWeight: 600 }}>{v.totalOrders}</span>
                  <div className="td-sub">Tk.{v.totalRevenue.toLocaleString()}</div>
                </td>
                <td>
                  <span style={{ fontWeight: 600, color: "var(--accent-green)" }}>Tk.{v.settlementBalance.toLocaleString()}</span>
                </td>
                <td>
                  <button
                    onClick={() => toggleVacation(v)}
                    className={`toggle ${v.vacationMode ? "on" : ""}`}
                    title={v.vacationMode ? "Vacation mode active" : "Vacation mode off"}
                    style={{ background: v.vacationMode ? "var(--accent-orange)" : undefined }}
                  />
                </td>
                <td>
                  <div style={{ display: "flex", gap: 4 }}>
                    <button onClick={() => setCommModal(v)} className="btn-icon" title="Change Commission">
                      <Settings size={13} />
                    </button>
                    {v.status === "SUSPENDED" ? (
                      <button onClick={() => activate(v.id)} className="btn-icon" style={{ color: "var(--accent-green)" }} title="Activate">
                        <CheckCircle2 size={13} />
                      </button>
                    ) : v.status === "ACTIVE" ? (
                      <button onClick={() => setSuspModal(v)} className="btn-icon" style={{ color: "var(--danger)" }} title="Suspend">
                        <Ban size={13} />
                      </button>
                    ) : null}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {commModal && <CommissionModal vendor={commModal} token={token} onClose={() => setCommModal(null)} onDone={fetchVendors} />}
      {suspModal && <SuspendVendorModal vendor={suspModal} token={token} onClose={() => setSuspModal(null)} onDone={fetchVendors} />}
    </div>
  );
}
