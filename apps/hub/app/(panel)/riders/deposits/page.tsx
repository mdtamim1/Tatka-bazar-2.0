"use client";
import React, { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { ArrowDownToLine, CheckCircle2, XCircle } from "lucide-react";
import type { RiderDepositRequest } from "@/types/hub";

export default function DepositsPage() {
  const { session } = useAuth();
  const token = session?.token || "";
  const [deposits, setDeposits] = useState<RiderDepositRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"PENDING" | "ALL">("PENDING");
  const [processing, setProcessing] = useState<string | null>(null);
  const [rejectModal, setRejectModal] = useState<RiderDepositRequest | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const fetchDeposits = useCallback(async () => {
    const res = await fetch("/api/riders/deposits", { headers: { Authorization: `Bearer ${token}` } });
    const json = await res.json();
    if (json.success) setDeposits(json.data);
    setLoading(false);
  }, [token]);

  useEffect(() => { fetchDeposits(); }, [fetchDeposits]);

  async function handleDeposit(id: string, action: "APPROVE" | "REJECT", reason?: string) {
    setProcessing(id);
    await fetch("/api/riders/deposits", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ id, action, reason }),
    });
    setProcessing(null);
    setRejectModal(null);
    setRejectReason("");
    fetchDeposits();
  }

  const filtered = tab === "PENDING" ? deposits.filter((d) => d.status === "PENDING") : deposits;
  const pendingCount = deposits.filter((d) => d.status === "PENDING").length;
  const pendingTotal = deposits.filter((d) => d.status === "PENDING").reduce((s, d) => s + d.amount, 0);

  return (
    <div className="hub-content">
      <div className="page-header">
        <div className="flex-between">
          <div>
            <h1 className="page-title"><ArrowDownToLine size={22} /><span className="font-bn">ডিপোজিট অনুমোদন</span></h1>
            <p className="page-subtitle font-bn">
              {pendingCount}টি অনুমোদন বাকি — মোট ৳{pendingTotal.toLocaleString()} অপেক্ষায়
            </p>
          </div>
        </div>
      </div>

      <div className="tabs">
        {([["PENDING", `বাকি (${pendingCount})`], ["ALL", `সব (${deposits.length})`]] as const).map(([val, label]) => (
          <button
            key={val}
            className={`tab-btn font-bn${tab === val ? " active" : ""}`}
            onClick={() => setTab(val)}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[1,2,3].map((i) => <div key={i} className="skeleton" style={{ height: 90, borderRadius: 12 }} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon">✅</div>
            <div className="empty-state-title font-bn">কোনো পেন্ডিং ডিপোজিট নেই</div>
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {filtered.map((d) => (
            <div key={d.id} className="card" style={{ padding: 16 }}>
              <div className="flex-between" style={{ flexWrap: "wrap", gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                    <span style={{ fontSize: 22, fontWeight: 800, color: "var(--accent-green)" }}>৳{d.amount.toLocaleString()}</span>
                    <span className={`badge ${d.status === "PENDING" ? "badge-orange" : d.status === "APPROVED" ? "badge-green" : "badge-red"}`}>
                      <span className="font-bn">{d.status === "PENDING" ? "বাকি" : d.status === "APPROVED" ? "অনুমোদিত" : "বাতিল"}</span>
                    </span>
                  </div>
                  <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                    <span className="text-sm font-bn text-muted">🧑 {d.riderName}</span>
                    <span className="text-sm text-muted">📞 {d.riderPhone}</span>
                    <span className="text-sm text-muted">💳 {d.paymentMethod}</span>
                    <span className="text-sm text-muted">TXN: {d.transactionId}</span>
                    <span className="text-sm text-muted">শেষ ৪ সংখ্যা: {d.lastFour}</span>
                  </div>
                  <div className="text-xs text-muted mt-1">
                    {new Date(d.requestedAt).toLocaleString("bn-BD")}
                    {d.processedBy && ` • প্রক্রিয়া: ${d.processedBy}`}
                  </div>
                </div>
                {d.status === "PENDING" && (
                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      onClick={() => setRejectModal(d)}
                      disabled={processing === d.id}
                      className="btn btn-danger btn-sm"
                    >
                      <XCircle size={14} />
                      <span className="font-bn">বাতিল</span>
                    </button>
                    <button
                      onClick={() => handleDeposit(d.id, "APPROVE")}
                      disabled={processing === d.id}
                      className="btn btn-primary btn-sm"
                    >
                      <CheckCircle2 size={14} />
                      <span className="font-bn">অনুমোদন</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {rejectModal && (
        <div className="modal-overlay" onClick={() => setRejectModal(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-title font-bn">❌ ডিপোজিট বাতিল</div>
            <div className="modal-subtitle font-bn">{rejectModal.riderName} — ৳{rejectModal.amount}</div>
            <div className="form-group">
              <label className="form-label font-bn">বাতিলের কারণ</label>
              <input type="text" className="form-input font-bn" placeholder="কারণ..." value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} />
            </div>
            <div className="modal-actions">
              <button onClick={() => setRejectModal(null)} className="btn btn-ghost">বাতিল</button>
              <button onClick={() => handleDeposit(rejectModal.id, "REJECT", rejectReason)} disabled={!rejectReason} className="btn btn-danger">নিশ্চিত</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
