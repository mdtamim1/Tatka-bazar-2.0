"use client";
import React, { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { Store, Search, RefreshCw, Ban, CheckCircle2, TrendingUp, Settings } from "lucide-react";
import type { HubVendor } from "@/types/hub";

const STATUS_BADGE: Record<string, string> = {
  ACTIVE: "badge-green", SUSPENDED: "badge-red",
  PENDING_APPROVAL: "badge-orange", REJECTED: "badge-red",
};
const STATUS_BN: Record<string, string> = {
  ACTIVE: "সক্রিয়", SUSPENDED: "স্থগিত",
  PENDING_APPROVAL: "অনুমোদন বাকি", REJECTED: "বাতিল",
};
const TIER_BN: Record<string, string> = {
  STANDARD: "⬜ স্ট্যান্ডার্ড", TRUSTED: "🔵 ট্রাস্টেড", PREMIUM: "💜 প্রিমিয়াম",
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
        <div className="modal-title font-bn">⚙️ কমিশন রেট পরিবর্তন</div>
        <div className="modal-subtitle font-bn">{vendor.storeNameBn || vendor.storeName}</div>
        <div className="form-group">
          <label className="form-label font-bn">বর্তমান রেট: {vendor.commissionRate}%</label>
          <input
            type="number"
            className="form-input"
            min={1} max={30} step={0.5}
            value={rate}
            onChange={(e) => setRate(e.target.value)}
          />
        </div>
        <div className="modal-actions">
          <button onClick={onClose} className="btn btn-ghost">বাতিল</button>
          <button onClick={submit} disabled={loading} className="btn btn-purple">
            {loading ? "..." : "আপডেট করুন"}
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
        <div className="modal-title font-bn">🚫 ভেন্ডর স্থগিত করুন</div>
        <div className="modal-subtitle font-bn">{vendor.storeNameBn}</div>
        <div className="form-group">
          <label className="form-label font-bn">কারণ</label>
          <input type="text" className="form-input font-bn" placeholder="কারণ লিখুন..." value={reason} onChange={(e) => setReason(e.target.value)} />
        </div>
        <div className="modal-actions">
          <button onClick={onClose} className="btn btn-ghost">বাতিল</button>
          <button onClick={submit} disabled={loading || !reason} className="btn btn-danger">স্থগিত করুন</button>
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
            <h1 className="page-title"><Store size={22} /><span className="font-bn">সকল ভেন্ডর</span></h1>
            <p className="page-subtitle font-bn">মোট {vendors.length}টি ভেন্ডর নিবন্ধিত</p>
          </div>
          <button onClick={fetchVendors} className="btn btn-ghost btn-sm"><RefreshCw size={13} /></button>
        </div>
      </div>

      <div className="filter-bar">
        <div className="search-input-wrap" style={{ maxWidth: 300 }}>
          <Search size={14} />
          <input
            type="text" className="form-input search-input font-bn"
            placeholder="দোকানের নাম বা মালিক..."
            value={search} onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select className="form-input" style={{ maxWidth: 180 }} value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="ALL">সব স্ট্যাটাস</option>
          <option value="ACTIVE">সক্রিয়</option>
          <option value="PENDING_APPROVAL">অনুমোদন বাকি</option>
          <option value="SUSPENDED">স্থগিত</option>
        </select>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>দোকান / মালিক</th>
              <th>ফোন</th>
              <th>স্ট্যাটাস</th>
              <th>টায়ার</th>
              <th>কমিশন</th>
              <th>অর্ডার</th>
              <th>ব্যালেন্স</th>
              <th>ভ্যাকেশন</th>
              <th>অ্যাকশন</th>
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
                  <div className="empty-state-title font-bn">কোনো ভেন্ডর পাওয়া যায়নি</div>
                </div>
              </td></tr>
            ) : filtered.map((v) => (
              <tr key={v.id}>
                <td>
                  <div className="td-name font-bn">{v.storeNameBn || v.storeName}</div>
                  <div className="td-sub">{v.ownerName}</div>
                </td>
                <td><span style={{ fontSize: 13 }}>{v.phone}</span></td>
                <td>
                  <span className={`badge ${STATUS_BADGE[v.status] || "badge-gray"}`}>
                    <span className="font-bn">{STATUS_BN[v.status] || v.status}</span>
                  </span>
                </td>
                <td>
                  <span className={`tier-${v.tier}`} style={{ fontSize: 12, fontWeight: 600 }}>
                    {TIER_BN[v.tier] || v.tier}
                  </span>
                </td>
                <td>
                  <span style={{ fontWeight: 700, color: "var(--accent-green)" }}>{v.commissionRate}%</span>
                </td>
                <td>
                  <span style={{ fontWeight: 600 }}>{v.totalOrders}</span>
                  <div className="td-sub">৳{v.totalRevenue.toLocaleString()}</div>
                </td>
                <td>
                  <span style={{ fontWeight: 600, color: "var(--accent-green)" }}>৳{v.settlementBalance.toLocaleString()}</span>
                </td>
                <td>
                  <button
                    onClick={() => toggleVacation(v)}
                    className={`toggle ${v.vacationMode ? "on" : ""}`}
                    title={v.vacationMode ? "ভ্যাকেশন মোড চালু" : "ভ্যাকেশন মোড বন্ধ"}
                    style={{ background: v.vacationMode ? "var(--accent-orange)" : undefined }}
                  />
                </td>
                <td>
                  <div style={{ display: "flex", gap: 4 }}>
                    <button onClick={() => setCommModal(v)} className="btn-icon" title="কমিশন পরিবর্তন">
                      <Settings size={13} />
                    </button>
                    {v.status === "SUSPENDED" ? (
                      <button onClick={() => activate(v.id)} className="btn-icon" style={{ color: "var(--accent-green)" }} title="সক্রিয় করুন">
                        <CheckCircle2 size={13} />
                      </button>
                    ) : v.status === "ACTIVE" ? (
                      <button onClick={() => setSuspModal(v)} className="btn-icon" style={{ color: "var(--danger)" }} title="স্থগিত">
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
