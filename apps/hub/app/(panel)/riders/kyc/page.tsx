"use client";
import React, { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { FileCheck, CheckCircle2, XCircle, RefreshCw } from "lucide-react";
import type { HubRider } from "@/types/hub";

export default function KycPage() {
  const { session } = useAuth();
  const token = session?.token || "";
  const [riders, setRiders] = useState<HubRider[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejectModal, setRejectModal] = useState<HubRider | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [processing, setProcessing] = useState<string | null>(null);

  const fetchRiders = useCallback(async () => {
    const res = await fetch("/api/riders", { headers: { Authorization: `Bearer ${token}` } });
    const json = await res.json();
    if (json.success) setRiders(json.data.filter((r: HubRider) => r.kycStatus === "SUBMITTED"));
    setLoading(false);
  }, [token]);

  useEffect(() => { fetchRiders(); }, [fetchRiders]);

  async function handleKYC(rider: HubRider, action: "APPROVED" | "REJECTED", reason?: string) {
    setProcessing(rider.id);
    await fetch("/api/riders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        id: rider.id,
        kycStatus: action,
        status: action === "APPROVED" ? "ACTIVE" : "PENDING_KYC",
        kycRejectionReason: reason,
        kycApprovedAt: action === "APPROVED" ? new Date().toISOString() : undefined,
      }),
    });
    setProcessing(null);
    setRejectModal(null);
    setRejectReason("");
    fetchRiders();
  }

  return (
    <div className="hub-content">
      <div className="page-header">
        <h1 className="page-title"><FileCheck size={22} /><span className="font-bn">KYC অনুমোদন কিউ</span></h1>
        <p className="page-subtitle font-bn">মোট {riders.length}টি KYC অনুমোদনের অপেক্ষায়</p>
      </div>

      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {[1,2,3].map((i) => <div key={i} className="skeleton" style={{ height: 100, borderRadius: 12 }} />)}
        </div>
      ) : riders.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon">✅</div>
            <div className="empty-state-title font-bn">সব KYC অনুমোদন সম্পন্ন</div>
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {riders.map((r) => (
            <div key={r.id} className="card">
              <div className="flex-between" style={{ flexWrap: "wrap", gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", marginBottom: 4 }}>
                    {r.nameBn || r.name}
                  </div>
                  <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                    <span className="text-sm text-muted">📞 {r.phone}</span>
                    <span className="text-sm text-muted font-bn">📍 {r.zone}</span>
                    <span className="text-sm text-muted">🚗 {r.vehicleType}</span>
                    <span className="text-sm text-muted">📋 {r.vehicleNumber}</span>
                  </div>
                  {r.kycSubmittedAt && (
                    <div className="text-xs text-muted mt-1 font-bn">
                      জমা দেওয়া হয়েছে: {new Date(r.kycSubmittedAt).toLocaleDateString("bn-BD")}
                    </div>
                  )}
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <button
                    onClick={() => setRejectModal(r)}
                    disabled={processing === r.id}
                    className="btn btn-danger btn-sm"
                  >
                    <XCircle size={14} />
                    <span className="font-bn">বাতিল</span>
                  </button>
                  <button
                    onClick={() => handleKYC(r, "APPROVED")}
                    disabled={processing === r.id}
                    className="btn btn-primary btn-sm"
                  >
                    <CheckCircle2 size={14} />
                    <span className="font-bn">অনুমোদন দিন</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reject Modal */}
      {rejectModal && (
        <div className="modal-overlay" onClick={() => setRejectModal(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-title font-bn">❌ KYC বাতিল</div>
            <div className="modal-subtitle font-bn">{rejectModal.nameBn || rejectModal.name}</div>
            <div className="form-group">
              <label className="form-label font-bn">বাতিলের কারণ</label>
              <input
                type="text"
                className="form-input font-bn"
                placeholder="কারণ লিখুন..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              />
            </div>
            <div className="modal-actions">
              <button onClick={() => setRejectModal(null)} className="btn btn-ghost">বাতিল</button>
              <button
                onClick={() => handleKYC(rejectModal, "REJECTED", rejectReason)}
                disabled={!rejectReason || processing === rejectModal.id}
                className="btn btn-danger"
              >
                নিশ্চিত করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
