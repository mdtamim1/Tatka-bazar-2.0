"use client";
import React, { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import type { HubVendor } from "@/types/hub";

export default function VendorApprovalsPage() {
  const { session } = useAuth();
  const token = session?.token || "";
  const [vendors, setVendors] = useState<HubVendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejectModal, setRejectModal] = useState<HubVendor | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [processing, setProcessing] = useState<string | null>(null);

  const fetchVendors = useCallback(async () => {
    const res = await fetch("/api/vendors", { headers: { Authorization: `Bearer ${token}` } });
    const json = await res.json();
    if (json.success) setVendors(json.data.filter((v: HubVendor) => v.status === "PENDING_APPROVAL"));
    setLoading(false);
  }, [token]);

  useEffect(() => { fetchVendors(); }, [fetchVendors]);

  async function handleVendor(id: string, action: "ACTIVE" | "REJECTED", reason?: string) {
    setProcessing(id);
    await fetch("/api/vendors", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ id, status: action, rejectionReason: reason }),
    });
    setProcessing(null);
    setRejectModal(null);
    setRejectReason("");
    fetchVendors();
  }

  return (
    <div className="hub-content">
      <div className="page-header">
        <h1 className="page-title"><AlertTriangle size={22} /><span className="font-bn">ভেন্ডর অনুমোদন কিউ</span></h1>
        <p className="page-subtitle font-bn">{vendors.length}টি ভেন্ডর অনুমোদনের অপেক্ষায়</p>
      </div>

      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {[1,2].map((i) => <div key={i} className="skeleton" style={{ height: 130, borderRadius: 12 }} />)}
        </div>
      ) : vendors.length === 0 ? (
        <div className="card"><div className="empty-state">
          <div className="empty-state-icon">✅</div>
          <div className="empty-state-title font-bn">সব ভেন্ডর অনুমোদন সম্পন্ন</div>
        </div></div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {vendors.map((v) => (
            <div key={v.id} className="card">
              <div className="flex-between" style={{ flexWrap: "wrap", gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", marginBottom: 6 }}>
                    <span className="font-bn">{v.storeNameBn || v.storeName}</span>
                    <span style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 400, marginLeft: 8 }}>{v.storeName}</span>
                  </div>
                  <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 4 }}>
                    <span className="text-sm text-muted">👤 {v.ownerName}</span>
                    <span className="text-sm text-muted">📞 {v.phone}</span>
                    <span className="text-sm text-muted">📍 {v.address}</span>
                  </div>
                  <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                    <span className="text-sm text-muted">🏷️ {v.category}</span>
                    {v.tradeLicense && <span className="text-sm text-muted">📋 {v.tradeLicense}</span>}
                    <span className="text-sm text-muted">💳 {v.payoutMethod}: {v.payoutAccount}</span>
                  </div>
                  <div className="text-xs text-muted mt-1">
                    আবেদন: {new Date(v.joinedAt).toLocaleDateString("bn-BD")}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <button onClick={() => setRejectModal(v)} disabled={processing === v.id} className="btn btn-danger btn-sm">
                    <XCircle size={14} /><span className="font-bn">বাতিল</span>
                  </button>
                  <button onClick={() => handleVendor(v.id, "ACTIVE")} disabled={processing === v.id} className="btn btn-primary btn-sm">
                    <CheckCircle2 size={14} /><span className="font-bn">অনুমোদন দিন</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {rejectModal && (
        <div className="modal-overlay" onClick={() => setRejectModal(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-title font-bn">❌ ভেন্ডর আবেদন বাতিল</div>
            <div className="modal-subtitle font-bn">{rejectModal.storeNameBn}</div>
            <div className="form-group">
              <label className="form-label font-bn">বাতিলের কারণ</label>
              <input type="text" className="form-input font-bn" placeholder="কারণ..." value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} />
            </div>
            <div className="modal-actions">
              <button onClick={() => setRejectModal(null)} className="btn btn-ghost">বাতিল</button>
              <button onClick={() => handleVendor(rejectModal.id, "REJECTED", rejectReason)} disabled={!rejectReason} className="btn btn-danger">নিশ্চিত</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
