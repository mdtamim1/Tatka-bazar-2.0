"use client";
import React, { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  CreditCard, CheckCircle2, XCircle, Clock, RefreshCw,
  Wallet, TrendingDown, AlertCircle, Search,
} from "lucide-react";

interface WithdrawalRecord {
  id: string;
  riderId: string;
  riderName: string;
  riderPhone: string;
  amount: number;
  paymentMethod: string;
  paymentAccount: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "PROCESSING";
  adminNote?: string;
  processedAt?: string;
  proofUrl?: string;
  createdAt: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  PENDING:    { label: "Pending",    color: "#f59e0b", bg: "rgba(245,158,11,0.12)",  icon: <Clock size={13} /> },
  APPROVED:   { label: "Approved",   color: "#10b981", bg: "rgba(16,185,129,0.12)", icon: <CheckCircle2 size={13} /> },
  REJECTED:   { label: "Rejected",   color: "#ef4444", bg: "rgba(239,68,68,0.12)",  icon: <XCircle size={13} /> },
  PROCESSING: { label: "Processing", color: "#6366f1", bg: "rgba(99,102,241,0.12)", icon: <RefreshCw size={13} /> },
};

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.PENDING;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "3px 10px", borderRadius: 20,
      fontSize: "0.72rem", fontWeight: 600, letterSpacing: "0.02em",
      color: cfg.color, background: cfg.bg,
      border: `1px solid ${cfg.color}40`,
    }}>
      {cfg.icon} {cfg.label}
    </span>
  );
}

function ActionModal({
  withdrawal,
  action,
  token,
  onClose,
  onDone,
}: {
  withdrawal: WithdrawalRecord;
  action: "APPROVE" | "REJECT";
  token: string;
  onClose: () => void;
  onDone: () => void;
}) {
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const isApprove = action === "APPROVE";

  const handleSubmit = async () => {
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/riders/withdrawals", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ id: withdrawal.id, action, adminNote: note || undefined }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Failed");
      onDone();
      onClose();
    } catch (err: any) {
      setError(err.message || "সমস্যা হয়েছে।");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 440 }}>
        <div className="modal-title">
          {isApprove
            ? <><CheckCircle2 size={18} style={{ color: "#10b981" }} /> Withdrawal Approve করুন</>
            : <><XCircle size={18} style={{ color: "#ef4444" }} /> Withdrawal Reject করুন</>
          }
        </div>
        <div className="modal-subtitle" style={{ marginBottom: 16 }}>
          <strong>{withdrawal.riderName}</strong> — Tk.{withdrawal.amount.toLocaleString()} via {withdrawal.paymentMethod}
        </div>

        {/* Summary card */}
        <div style={{
          padding: "12px 14px", borderRadius: 10,
          background: isApprove ? "rgba(16,185,129,0.08)" : "rgba(239,68,68,0.08)",
          border: `1px solid ${isApprove ? "rgba(16,185,129,0.25)" : "rgba(239,68,68,0.25)"}`,
          marginBottom: 16, fontSize: "0.82rem", color: "var(--text-2)",
        }}>
          <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
            <span>📞 {withdrawal.riderPhone}</span>
            <span>💳 {withdrawal.paymentAccount}</span>
            <span>📅 {new Date(withdrawal.createdAt).toLocaleDateString("bn-BD")}</span>
          </div>
          {isApprove && (
            <div style={{ marginTop: 8, color: "#f59e0b", fontSize: "0.78rem" }}>
              ⚠️ Approve করলে রাইডারের ব্যালেন্স থেকে Tk.{withdrawal.amount.toLocaleString()} কাটা যাবে।
            </div>
          )}
        </div>

        <div className="form-group">
          <label className="form-label">{isApprove ? "Admin Note (ঐচ্ছিক)" : "Rejection Reason *"}</label>
          <textarea
            className="form-input"
            rows={3}
            placeholder={isApprove ? "কোনো নোট থাকলে লিখুন..." : "কেন reject করা হচ্ছে?"}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            style={{ resize: "vertical" }}
          />
        </div>

        {error && <div style={{ color: "#ef4444", fontSize: "0.82rem", marginBottom: 10 }}>{error}</div>}

        <div className="modal-actions">
          <button onClick={onClose} className="btn btn-ghost" disabled={saving}>Cancel</button>
          <button
            onClick={handleSubmit}
            disabled={(!isApprove && !note.trim()) || saving}
            className={`btn ${isApprove ? "btn-primary" : "btn-danger"}`}
          >
            {saving ? "Processing..." : isApprove
              ? <><CheckCircle2 size={14} /> Approve করুন</>
              : <><XCircle size={14} /> Reject করুন</>
            }
          </button>
        </div>
      </div>
    </div>
  );
}

export default function WithdrawalsPage() {
  const { session } = useAuth();
  const token = session?.token || "";

  const [withdrawals, setWithdrawals] = useState<WithdrawalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"ALL" | "PENDING" | "APPROVED" | "REJECTED">("PENDING");
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState<{ withdrawal: WithdrawalRecord; action: "APPROVE" | "REJECT" } | null>(null);
  const canEdit = session?.role !== "VIEWER" && session?.role !== "SUPPORT_AGENT";

  const fetchWithdrawals = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/riders/withdrawals", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (json.success) setWithdrawals(json.data);
    } catch { /* ignore */ } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchWithdrawals(); }, [fetchWithdrawals]);

  const filtered = withdrawals.filter((w) => {
    const matchStatus = filter === "ALL" || w.status === filter;
    const q = search.toLowerCase();
    const matchSearch = !q || w.riderName.toLowerCase().includes(q) || w.riderPhone.includes(q) || w.paymentAccount.includes(q);
    return matchStatus && matchSearch;
  });

  // KPI stats
  const stats = {
    pending:  withdrawals.filter(w => w.status === "PENDING").length,
    approved: withdrawals.filter(w => w.status === "APPROVED").length,
    rejected: withdrawals.filter(w => w.status === "REJECTED").length,
    totalPending: withdrawals.filter(w => w.status === "PENDING").reduce((s, w) => s + w.amount, 0),
  };

  return (
    <div className="hub-content">
      <div className="page-header">
        <h1 className="page-title"><CreditCard size={22} /><span>Withdrawal Management</span></h1>
        <p className="page-subtitle">Rider payout and withdrawal requests</p>
        <button className="btn btn-ghost btn-sm" onClick={fetchWithdrawals} style={{ marginLeft: "auto" }}>
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 12, marginBottom: 20 }}>
        {[
          { label: "Pending Requests", value: stats.pending, icon: <Clock size={18} />, color: "#f59e0b" },
          { label: "Pending Amount", value: `Tk.${stats.totalPending.toLocaleString()}`, icon: <Wallet size={18} />, color: "#6366f1" },
          { label: "Approved", value: stats.approved, icon: <CheckCircle2 size={18} />, color: "#10b981" },
          { label: "Rejected", value: stats.rejected, icon: <TrendingDown size={18} />, color: "#ef4444" },
        ].map((kpi) => (
          <div key={kpi.label} className="card" style={{ padding: "14px 16px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ fontSize: "0.72rem", fontWeight: 600, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                {kpi.label}
              </span>
              <span style={{ color: kpi.color }}>{kpi.icon}</span>
            </div>
            <div style={{ fontSize: "1.5rem", fontWeight: 800, color: kpi.color }}>{kpi.value}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 16, alignItems: "center" }}>
        <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
          <Search size={14} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--text-3)" }} />
          <input
            type="text"
            className="form-input"
            placeholder="রাইডার নাম বা নম্বর খুঁজুন..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: 32 }}
          />
        </div>
        {(["ALL", "PENDING", "APPROVED", "REJECTED"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`btn btn-sm ${filter === s ? "btn-primary" : "btn-ghost"}`}
          >
            {s === "ALL" ? "All" : STATUS_CONFIG[s]?.label || s}
          </button>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 72, borderRadius: 10 }} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon">💸</div>
            <div className="empty-state-title">
              {filter === "PENDING" ? "কোনো pending withdrawal নেই" : "কোনো withdrawal পাওয়া যায়নি"}
            </div>
            <p className="text-sm text-muted" style={{ marginTop: 6 }}>
              Rider withdrawal requests এখানে দেখাবে
            </p>
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {filtered.map((w) => (
            <div key={w.id} className="card" style={{ padding: "14px 18px" }}>
              <div className="flex-between" style={{ flexWrap: "wrap", gap: 12 }}>
                <div style={{ flex: 1, minWidth: 220 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                    <div style={{ fontWeight: 700, fontSize: "0.95rem", color: "var(--text-primary)" }}>{w.riderName}</div>
                    <StatusBadge status={w.status} />
                  </div>
                  <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                    <span className="text-sm text-muted">📞 {w.riderPhone}</span>
                    <span className="text-sm text-muted">💳 {w.paymentMethod}: {w.paymentAccount}</span>
                    <span className="text-sm text-muted">📅 {new Date(w.createdAt).toLocaleDateString("en-BD")}</span>
                    {w.processedAt && (
                      <span className="text-sm text-muted">✅ {new Date(w.processedAt).toLocaleDateString("en-BD")}</span>
                    )}
                  </div>
                  {w.adminNote && (
                    <div style={{ marginTop: 6, fontSize: "0.78rem", color: "var(--text-3)", fontStyle: "italic" }}>
                      📝 {w.adminNote}
                    </div>
                  )}
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "1.3rem", fontWeight: 800, color: "var(--text-primary)" }}>
                      Tk.{w.amount.toLocaleString()}
                    </div>
                    <div className="text-xs text-muted">Withdrawal</div>
                  </div>

                  {w.status === "PENDING" && canEdit && (
                    <div style={{ display: "flex", gap: 6 }}>
                      <button
                        onClick={() => setModal({ withdrawal: w, action: "REJECT" })}
                        className="btn btn-danger btn-sm"
                      >
                        <XCircle size={13} /><span>Reject</span>
                      </button>
                      <button
                        onClick={() => setModal({ withdrawal: w, action: "APPROVE" })}
                        className="btn btn-primary btn-sm"
                      >
                        <CheckCircle2 size={13} /><span>Approve</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <ActionModal
          withdrawal={modal.withdrawal}
          action={modal.action}
          token={token}
          onClose={() => setModal(null)}
          onDone={fetchWithdrawals}
        />
      )}
    </div>
  );
}
