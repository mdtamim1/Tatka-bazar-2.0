"use client";
import React, { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  Search, Plus, RefreshCw, Eye, Ban, CheckCircle2,
  Bike, Filter, ArrowUpDown, Phone, MapPin, Wallet,
  TrendingUp, AlertTriangle, Star,
} from "lucide-react";
import type { HubRider, RiderStatus, DutyStatus } from "@/types/hub";

const STATUS_BADGE: Record<string, string> = {
  ACTIVE: "badge-green",
  SUSPENDED: "badge-red",
  PENDING_KYC: "badge-orange",
  INACTIVE: "badge-gray",
};
const STATUS_BN: Record<string, string> = {
  ACTIVE: "সক্রিয়",
  SUSPENDED: "স্থগিত",
  PENDING_KYC: "KYC বাকি",
  INACTIVE: "নিষ্ক্রিয়",
};
const KYC_BADGE: Record<string, string> = {
  NOT_SUBMITTED: "badge-gray",
  SUBMITTED: "badge-orange",
  APPROVED: "badge-green",
  REJECTED: "badge-red",
};
const KYC_BN: Record<string, string> = {
  NOT_SUBMITTED: "জমা দেওয়া হয়নি",
  SUBMITTED: "অপেক্ষমাণ",
  APPROVED: "অনুমোদিত",
  REJECTED: "বাতিল",
};
const TIER_BN: Record<string, string> = {
  BRONZE: "🥉 ব্রোঞ্জ", SILVER: "🥈 সিলভার",
  GOLD: "🥇 গোল্ড", PLATINUM: "💎 প্লাটিনাম",
};
const DUTY_BN: Record<string, string> = {
  ONLINE: "অনলাইন", OFFLINE: "অফলাইন",
};

// ─── Balance Modal ────────────────────────────────────────────
function BalanceModal({ rider, token, onClose, onDone }: {
  rider: HubRider; token: string;
  onClose: () => void; onDone: () => void;
}) {
  const [type, setType] = useState<"ADD" | "DEDUCT">("ADD");
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit() {
    if (!amount || !reason) { setError("পরিমাণ এবং কারণ লিখুন"); return; }
    setLoading(true);
    const delta = type === "ADD" ? +amount : -Math.abs(+amount);
    const res = await fetch("/api/riders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ id: rider.id, balanceDelta: delta, balanceReason: reason }),
    });
    const json = await res.json();
    setLoading(false);
    if (json.success) { onDone(); onClose(); }
    else setError(json.error || "ব্যর্থ হয়েছে");
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-title font-bn">💳 ব্যালেন্স সমন্বয়</div>
        <div className="modal-subtitle font-bn">{rider.nameBn || rider.name} — বর্তমান: ৳{rider.balance}</div>
        {error && <div style={{ color: "var(--danger)", fontSize: 13, marginBottom: 12 }}>{error}</div>}
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          {(["ADD", "DEDUCT"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setType(t)}
              className={`btn ${type === t ? (t === "ADD" ? "btn-primary" : "btn-danger") : "btn-ghost"} btn-sm`}
              style={{ flex: 1 }}
            >
              {t === "ADD" ? "➕ যোগ করুন" : "➖ কর্তন করুন"}
            </button>
          ))}
        </div>
        <div className="form-group">
          <label className="form-label font-bn">পরিমাণ (৳)</label>
          <input type="number" className="form-input" placeholder="500" value={amount} onChange={(e) => setAmount(e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label font-bn">কারণ</label>
          <input type="text" className="form-input font-bn" placeholder="কারণ লিখুন..." value={reason} onChange={(e) => setReason(e.target.value)} />
        </div>
        <div className="modal-actions">
          <button onClick={onClose} className="btn btn-ghost">বাতিল</button>
          <button onClick={submit} disabled={loading} className={`btn ${type === "ADD" ? "btn-primary" : "btn-danger"}`}>
            {loading ? "অপেক্ষা করুন..." : "নিশ্চিত করুন"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Suspend Modal ────────────────────────────────────────────
function SuspendModal({ rider, token, onClose, onDone }: {
  rider: HubRider; token: string;
  onClose: () => void; onDone: () => void;
}) {
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit() {
    if (!reason) return;
    setLoading(true);
    await fetch("/api/riders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ id: rider.id, status: "SUSPENDED", suspendReason: reason }),
    });
    setLoading(false);
    onDone(); onClose();
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-title font-bn">🚫 রাইডার স্থগিত করুন</div>
        <div className="modal-subtitle font-bn">{rider.nameBn || rider.name}</div>
        <div className="form-group">
          <label className="form-label font-bn">স্থগিতের কারণ</label>
          <input type="text" className="form-input font-bn" placeholder="কারণ লিখুন..." value={reason} onChange={(e) => setReason(e.target.value)} />
        </div>
        <div className="modal-actions">
          <button onClick={onClose} className="btn btn-ghost">বাতিল</button>
          <button onClick={submit} disabled={loading || !reason} className="btn btn-danger">
            {loading ? "অপেক্ষা করুন..." : "স্থগিত করুন"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function RidersPage() {
  const { session } = useAuth();
  const token = session?.token || "";
  const [riders, setRiders] = useState<HubRider[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [balanceModal, setBalanceModal] = useState<HubRider | null>(null);
  const [suspendModal, setSuspendModal] = useState<HubRider | null>(null);

  const fetchRiders = useCallback(async () => {
    const res = await fetch("/api/riders", { headers: { Authorization: `Bearer ${token}` } });
    const json = await res.json();
    if (json.success) setRiders(json.data);
    setLoading(false);
  }, [token]);

  useEffect(() => { fetchRiders(); }, [fetchRiders]);

  async function setStatus(id: string, status: string, extra?: object) {
    await fetch("/api/riders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ id, status, ...extra }),
    });
    fetchRiders();
  }

  async function toggleDuty(rider: HubRider) {
    const newDuty: DutyStatus = rider.dutyStatus === "ONLINE" ? "OFFLINE" : "ONLINE";
    await fetch("/api/riders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ id: rider.id, dutyStatus: newDuty }),
    });
    fetchRiders();
  }

  const filtered = riders.filter((r) => {
    const q = search.toLowerCase();
    const matchQ = !q || r.name.toLowerCase().includes(q) || r.phone.includes(q) || r.zone.toLowerCase().includes(q) || (r.nameBn && r.nameBn.includes(q));
    const matchS = filterStatus === "ALL" || r.status === filterStatus;
    return matchQ && matchS;
  });

  return (
    <div className="hub-content">
      <div className="page-header">
        <div className="flex-between">
          <div>
            <h1 className="page-title"><Bike size={22} /><span className="font-bn">সকল রাইডার</span></h1>
            <p className="page-subtitle font-bn">মোট {riders.length} জন রাইডার নিবন্ধিত</p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={fetchRiders} className="btn btn-ghost btn-sm"><RefreshCw size={13} /></button>
          </div>
        </div>
      </div>

      {/* Filter bar */}
      <div className="filter-bar">
        <div className="search-input-wrap" style={{ maxWidth: 320 }}>
          <Search size={14} />
          <input
            type="text"
            className="form-input search-input font-bn"
            placeholder="নাম, ফোন বা এলাকা খুঁজুন..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="form-input"
          style={{ maxWidth: 180 }}
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="ALL">সব স্ট্যাটাস</option>
          <option value="ACTIVE">সক্রিয়</option>
          <option value="SUSPENDED">স্থগিত</option>
          <option value="PENDING_KYC">KYC বাকি</option>
          <option value="INACTIVE">নিষ্ক্রিয়</option>
        </select>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8, flexShrink: 0 }}>
          <span className="badge badge-green">{riders.filter(r=>r.dutyStatus==="ONLINE").length} Online</span>
          <span className="badge badge-red">{riders.filter(r=>r.status==="SUSPENDED").length} Suspended</span>
        </div>
      </div>

      {/* Table */}
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>রাইডার</th>
              <th>ফোন / এলাকা</th>
              <th>ডিউটি</th>
              <th>স্ট্যাটাস</th>
              <th>KYC</th>
              <th>ব্যালেন্স</th>
              <th>ডেলিভারি</th>
              <th>টায়ার</th>
              <th>অ্যাকশন</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 9 }).map((_, j) => (
                    <td key={j}><div className="skeleton" style={{ height: 16, width: "80%" }} /></td>
                  ))}
                </tr>
              ))
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={9}>
                  <div className="empty-state">
                    <div className="empty-state-icon">🛵</div>
                    <div className="empty-state-title font-bn">কোনো রাইডার পাওয়া যায়নি</div>
                  </div>
                </td>
              </tr>
            ) : filtered.map((r) => (
              <tr key={r.id}>
                <td>
                  <div className="td-name">{r.nameBn || r.name}</div>
                  <div className="td-sub">{r.email}</div>
                </td>
                <td>
                  <div style={{ fontSize: 13, color: "var(--text-primary)" }}>{r.phone}</div>
                  <div className="td-sub font-bn">📍 {r.zone}</div>
                </td>
                <td>
                  <button
                    onClick={() => toggleDuty(r)}
                    className={`toggle ${r.dutyStatus === "ONLINE" ? "on" : ""}`}
                    title={`ডিউটি: ${DUTY_BN[r.dutyStatus]}`}
                  />
                </td>
                <td>
                  <span className={`badge ${STATUS_BADGE[r.status] || "badge-gray"}`}>
                    <span className="font-bn">{STATUS_BN[r.status] || r.status}</span>
                  </span>
                </td>
                <td>
                  <span className={`badge ${KYC_BADGE[r.kycStatus] || "badge-gray"}`}>
                    <span className="font-bn">{KYC_BN[r.kycStatus] || r.kycStatus}</span>
                  </span>
                </td>
                <td>
                  <span style={{ fontWeight: 600, color: r.balance < 0 ? "var(--danger)" : "var(--text-primary)" }}>
                    ৳{r.balance.toLocaleString()}
                  </span>
                </td>
                <td>
                  <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>{r.totalDeliveries}</span>
                  <div className="td-sub">৳{r.totalEarned.toLocaleString()}</div>
                </td>
                <td>
                  <span className={`tier-${r.tier}`} style={{ fontSize: 12, fontWeight: 600 }}>
                    {TIER_BN[r.tier] || r.tier}
                  </span>
                </td>
                <td>
                  <div style={{ display: "flex", gap: 4 }}>
                    <button onClick={() => setBalanceModal(r)} className="btn-icon" title="ব্যালেন্স সমন্বয়">
                      <Wallet size={13} />
                    </button>
                    {r.status === "SUSPENDED" ? (
                      <button
                        onClick={() => setStatus(r.id, "ACTIVE")}
                        className="btn-icon"
                        title="সক্রিয় করুন"
                        style={{ color: "var(--accent-green)" }}
                      >
                        <CheckCircle2 size={13} />
                      </button>
                    ) : (
                      <button
                        onClick={() => setSuspendModal(r)}
                        className="btn-icon"
                        title="স্থগিত করুন"
                        style={{ color: "var(--danger)" }}
                      >
                        <Ban size={13} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modals */}
      {balanceModal && (
        <BalanceModal
          rider={balanceModal}
          token={token}
          onClose={() => setBalanceModal(null)}
          onDone={fetchRiders}
        />
      )}
      {suspendModal && (
        <SuspendModal
          rider={suspendModal}
          token={token}
          onClose={() => setSuspendModal(null)}
          onDone={fetchRiders}
        />
      )}
    </div>
  );
}
