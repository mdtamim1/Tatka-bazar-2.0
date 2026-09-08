"use client";
import React, { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { Banknote, CheckCircle2, XCircle } from "lucide-react";
import type { VendorSettlementRequest } from "@/types/hub";

export default function SettlementsPage() {
  const { session } = useAuth();
  const token = session?.token || "";
  const [settlements, setSettlements] = useState<VendorSettlementRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"PENDING" | "ALL">("PENDING");
  const [processing, setProcessing] = useState<string | null>(null);

  const fetchSettlements = useCallback(async () => {
    const res = await fetch("/api/vendors/settlements", { headers: { Authorization: `Bearer ${token}` } });
    const json = await res.json();
    if (json.success) setSettlements(json.data);
    setLoading(false);
  }, [token]);

  useEffect(() => { fetchSettlements(); }, [fetchSettlements]);

  async function handle(id: string, action: "APPROVE" | "REJECT") {
    setProcessing(id);
    await fetch("/api/vendors/settlements", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ id, action }),
    });
    setProcessing(null);
    fetchSettlements();
  }

  const pendingCount = settlements.filter((s) => s.status === "PENDING").length;
  const pendingTotal = settlements.filter((s) => s.status === "PENDING").reduce((s, d) => s + d.amount, 0);
  const filtered = tab === "PENDING" ? settlements.filter((s) => s.status === "PENDING") : settlements;

  return (
    <div className="hub-content">
      <div className="page-header">
        <h1 className="page-title"><Banknote size={22} /><span>Vendor Settlements</span></h1>
        <p className="page-subtitle">
          {pendingCount} pending — Total Tk.{pendingTotal.toLocaleString()} pending
        </p>
      </div>

      <div className="tabs">
        {([["PENDING", `Pending (${pendingCount})`], ["ALL", `All (${settlements.length})`]] as const).map(([val, label]) => (
          <button key={val} className={`tab-btn${tab === val ? " active" : ""}`} onClick={() => setTab(val)}>{label}</button>
        ))}
      </div>

      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[1,2].map((i) => <div key={i} className="skeleton" style={{ height: 90, borderRadius: 12 }} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card"><div className="empty-state">
          <div className="empty-state-icon">✅</div>
          <div className="empty-state-title">No pending settlements</div>
        </div></div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {filtered.map((s) => (
            <div key={s.id} className="card" style={{ padding: 16 }}>
              <div className="flex-between" style={{ flexWrap: "wrap", gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                    <span style={{ fontSize: 22, fontWeight: 800, color: "var(--accent-green)" }}>Tk.{s.amount.toLocaleString()}</span>
                    <span className={`badge ${s.status === "PENDING" ? "badge-orange" : s.status === "APPROVED" ? "badge-green" : "badge-red"}`}>
                      <span>{s.status === "PENDING" ? "Pending" : s.status === "APPROVED" ? "Paid" : "Rejected"}</span>
                    </span>
                  </div>
                  <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                    <span className="text-sm text-muted">🏪 {s.vendorName}</span>
                    <span className="text-sm text-muted">📞 {s.vendorPhone}</span>
                    <span className="text-sm text-muted">💳 {s.payoutMethod}: {s.payoutAccount}</span>
                    <span className="text-sm text-muted">📦 {s.ordersCount} orders</span>
                  </div>
                  <div className="text-xs text-muted mt-1">
                    {new Date(s.requestedAt).toLocaleString()}
                    {s.processedBy && ` • Processed by: ${s.processedBy}`}
                  </div>
                </div>
                {s.status === "PENDING" && (
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={() => handle(s.id, "REJECT")} disabled={processing === s.id} className="btn btn-danger btn-sm">
                      <XCircle size={14} /><span>Reject</span>
                    </button>
                    <button onClick={() => handle(s.id, "APPROVE")} disabled={processing === s.id} className="btn btn-primary btn-sm">
                      <CheckCircle2 size={14} /><span>Mark Paid</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
