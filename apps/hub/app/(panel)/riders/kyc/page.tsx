"use client";
import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { FileCheck, CheckCircle2, XCircle, MapPin, ChevronDown, Store, RefreshCw } from "lucide-react";
import type { HubRider } from "@/types/hub";

// BD Location data — same structure as vendor approval
const BD_DISTRICTS = [
  "Dhaka", "Chattogram", "Sylhet", "Rajshahi", "Khulna", "Barishal", "Rangpur", "Mymensingh"
];

const BD_THANAS: Record<string, string[]> = {
  "Dhaka": ["Mirpur", "Mohammadpur", "Dhanmondi", "Gulshan", "Uttara", "Motijheel", "Demra", "Badda", "Khilgaon", "Lalbagh"],
  "Chattogram": ["Kotwali", "Pahartali", "Hathazari", "Chandgaon"],
  "Sylhet": ["Kotwali", "Shah Poran"],
  "Rajshahi": ["Boalia", "Rajpara"],
  "Khulna": ["Sonadanga", "Khalishpur"],
  "Barishal": ["Kotwali", "Bandar"],
  "Rangpur": ["Kotwali", "Mithapukur"],
  "Mymensingh": ["Kotwali", "Trishal"],
};

const BD_BAZARS: Record<string, Record<string, string[]>> = {
  "Dhaka": {
    "Mirpur": ["Mirpur-1 Bazar", "Mirpur-10 Bazar", "Mirpur-11 Bazar", "Mirpur-12 Bazar", "Pallabi Bazar", "Kazipara Bazar"],
    "Mohammadpur": ["Mohammadpur Krishi Market", "Mohammadpur Town Hall Bazar", "Shyamoli Bazar", "Adabor Bazar"],
    "Dhanmondi": ["Dhanmondi Road 27 Bazar", "Jigatola Bazar", "Hazaribagh Bazar"],
    "Gulshan": ["Gulshan-1 Bazar", "Gulshan-2 Bazar", "Banani Bazar", "DOHS Bazar"],
    "Uttara": ["Uttara Sector-3 Bazar", "Uttara Sector-7 Bazar", "Uttara Sector-10 Bazar", "Abdullahpur Bazar"],
    "Motijheel": ["Motijheel Bazar", "Arambagh Bazar", "Fakirapool Bazar"],
    "Demra": ["Demra Bazar", "Jurain Bazar", "Shyampur Bazar"],
    "Badda": ["Badda Bazar", "Boro Beraid Bazar", "Satarkul Bazar"],
    "Khilgaon": ["Khilgaon Bazar", "Taltola Bazar", "Chowdhury Para Bazar"],
    "Lalbagh": ["Lalbagh Bazar", "Azimpur Bazar", "Newmarket Bazar"],
  },
};

// ─── Vendor type for the assignment list ──────────────────────────────────────

interface VendorOption {
  id: string;
  nameEn: string;
  phone: string;
  district?: string;
  thana?: string;
  bazar?: string;
}

// ─── Location + Vendor Assign Modal ──────────────────────────────────────────

function LocationKycApproveModal({
  rider,
  token,
  onClose,
  onSuccess,
}: {
  rider: HubRider;
  token: string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [district, setDistrict] = useState("");
  const [thana, setThana] = useState("");
  const [bazar, setBazar] = useState("");
  const [vendors, setVendors] = useState<VendorOption[]>([]);
  const [selectedVendorIds, setSelectedVendorIds] = useState<string[]>([]);
  const [loadingVendors, setLoadingVendors] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const thanas = useMemo(() => (district ? BD_THANAS[district] || [] : []), [district]);
  const bazars = useMemo(() => (district && thana ? BD_BAZARS[district]?.[thana] || [] : []), [district, thana]);

  // Fetch vendors for the selected location
  const fetchVendors = useCallback(async () => {
    if (!district) return;
    setLoadingVendors(true);
    try {
      const params = new URLSearchParams({ status: "APPROVED" });
      if (district) params.set("district", district);
      if (thana) params.set("thana", thana);
      if (bazar) params.set("bazar", bazar);
      const res = await fetch(`/api/vendors?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (json.success) setVendors(json.data);
    } catch { /* ignore */ } finally {
      setLoadingVendors(false);
    }
  }, [district, thana, bazar, token]);

  useEffect(() => { fetchVendors(); }, [fetchVendors]);

  const toggleVendor = (id: string) => {
    setSelectedVendorIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleApprove = async () => {
    if (!district) { setError("জেলা বাধ্যতামূলক।"); return; }
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/riders`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          id: rider.id,
          kycStatus: "APPROVED",
          status: "ACTIVE",
          kycApprovedAt: new Date().toISOString(),
          district,
          thana: thana || undefined,
          bazar: bazar || undefined,
          vendorIds: selectedVendorIds.length > 0 ? selectedVendorIds : undefined,
        }),
      });
      if (!res.ok) throw new Error("KYC Approval failed");
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "সমস্যা হয়েছে। আবার চেষ্টা করুন।");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal"
        onClick={e => e.stopPropagation()}
        style={{ maxWidth: 540, maxHeight: "90vh", overflowY: "auto" }}
      >
        <div className="modal-title">
          <MapPin size={18} style={{ color: "var(--accent)" }} />
          <span>KYC Approve — Location ও Vendor Set করুন</span>
        </div>
        <div className="modal-subtitle" style={{ marginBottom: 16 }}>
          <strong>{rider.name}</strong> · {rider.phone} · 🚗 {rider.vehicleType}
        </div>

        {/* District */}
        <div className="form-group">
          <label className="form-label">জেলা (District) *</label>
          <div style={{ position: "relative" }}>
            <select
              className="form-input"
              value={district}
              onChange={e => { setDistrict(e.target.value); setThana(""); setBazar(""); setSelectedVendorIds([]); }}
              style={{ appearance: "none", paddingRight: 32 }}
            >
              <option value="">— জেলা নির্বাচন করুন —</option>
              {BD_DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            <ChevronDown size={14} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "var(--text-3)" }} />
          </div>
        </div>

        {/* Thana */}
        {district && (
          <div className="form-group">
            <label className="form-label">থানা (Thana)</label>
            <div style={{ position: "relative" }}>
              <select
                className="form-input"
                value={thana}
                onChange={e => { setThana(e.target.value); setBazar(""); setSelectedVendorIds([]); }}
                style={{ appearance: "none", paddingRight: 32 }}
              >
                <option value="">— থানা নির্বাচন করুন —</option>
                {thanas.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <ChevronDown size={14} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "var(--text-3)" }} />
            </div>
          </div>
        )}

        {/* Bazar */}
        {thana && bazars.length > 0 && (
          <div className="form-group">
            <label className="form-label">বাজার (Bazar)</label>
            <div style={{ position: "relative" }}>
              <select
                className="form-input"
                value={bazar}
                onChange={e => { setBazar(e.target.value); setSelectedVendorIds([]); }}
                style={{ appearance: "none", paddingRight: 32 }}
              >
                <option value="">— বাজার নির্বাচন করুন —</option>
                {bazars.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
              <ChevronDown size={14} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "var(--text-3)" }} />
            </div>
          </div>
        )}

        {/* Vendor Assignment */}
        {district && (
          <>
            <div style={{
              fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase",
              color: "var(--text-3)", letterSpacing: "0.05em", marginBottom: 8, marginTop: 8,
              display: "flex", alignItems: "center", gap: 6,
            }}>
              <Store size={12} />
              {bazar ? `${bazar}` : thana ? `${thana}, ${district}` : district} এর Vendors
              {loadingVendors && <RefreshCw size={11} style={{ animation: "spin 1s linear infinite" }} />}
            </div>

            {vendors.length === 0 && !loadingVendors ? (
              <div style={{ padding: "12px", fontSize: "0.80rem", color: "var(--text-3)", textAlign: "center", borderRadius: 8, border: "1px dashed var(--border)" }}>
                এই location-এ কোনো approved vendor নেই। Rider Approve করা যাবে, vendor পরে assign করা যাবে।
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 220, overflowY: "auto" }}>
                {vendors.map(v => {
                  const isSelected = selectedVendorIds.includes(v.id);
                  return (
                    <div
                      key={v.id}
                      onClick={() => toggleVendor(v.id)}
                      style={{
                        display: "flex", alignItems: "center", gap: 10, padding: "10px 12px",
                        borderRadius: 8, cursor: "pointer",
                        background: isSelected ? "rgba(16,185,129,0.1)" : "var(--surface-2)",
                        border: `1px solid ${isSelected ? "rgba(16,185,129,0.4)" : "var(--border)"}`,
                        transition: "all 0.15s ease",
                      }}
                    >
                      <input type="checkbox" checked={isSelected} onChange={() => {}} style={{ cursor: "pointer" }} />
                      <div>
                        <div style={{ fontWeight: 700, fontSize: "0.85rem", color: "var(--text-primary)" }}>{v.nameEn}</div>
                        <div style={{ fontSize: "0.72rem", color: "var(--text-3)" }}>
                          📞 {v.phone} · 📍 {[v.bazar, v.thana, v.district].filter(Boolean).join(", ")}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {selectedVendorIds.length > 0 && (
              <div style={{ marginTop: 10, padding: "8px 12px", borderRadius: 8, background: "rgba(16,185,129,0.08)", fontSize: "0.80rem", color: "#10b981" }}>
                ✅ {selectedVendorIds.length}টি vendor-এ assign হবে
              </div>
            )}
          </>
        )}

        {error && (
          <div style={{ color: "#ef4444", fontSize: "0.82rem", marginTop: 10 }}>{error}</div>
        )}

        <div className="modal-actions" style={{ marginTop: 16 }}>
          <button onClick={onClose} className="btn btn-ghost" disabled={saving}>Cancel</button>
          <button
            onClick={handleApprove}
            disabled={!district || saving}
            className="btn btn-primary"
          >
            {saving ? "Processing..." : <><CheckCircle2 size={14} /> KYC Approve করুন</>}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function KycPage() {
  const { session } = useAuth();
  const token = session?.token || "";
  const [riders, setRiders] = useState<HubRider[]>([]);
  const [loading, setLoading] = useState(true);
  const [approveModal, setApproveModal] = useState<HubRider | null>(null);
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

  async function handleReject(rider: HubRider, reason: string) {
    setProcessing(rider.id);
    await fetch("/api/riders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        id: rider.id,
        kycStatus: "REJECTED",
        status: "PENDING_KYC",
        kycRejectionReason: reason,
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
        <h1 className="page-title"><FileCheck size={22} /><span>KYC Verification Queue</span></h1>
        <p className="page-subtitle">Total {riders.length} KYC submissions pending review</p>
      </div>

      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {[1,2,3].map((i) => <div key={i} className="skeleton" style={{ height: 100, borderRadius: 12 }} />)}
        </div>
      ) : riders.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon">✅</div>
            <div className="empty-state-title">All KYC submissions processed</div>
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {riders.map((r) => (
            <div key={r.id} className="card">
              <div className="flex-between" style={{ flexWrap: "wrap", gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", marginBottom: 4 }}>
                    {r.name}
                  </div>
                  <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                    <span className="text-sm text-muted">📞 {r.phone}</span>
                    <span className="text-sm text-muted">📍 {r.zone}</span>
                    <span className="text-sm text-muted">🚗 {r.vehicleType}</span>
                    <span className="text-sm text-muted">📋 {r.vehicleNumber}</span>
                  </div>
                  {r.kycSubmittedAt && (
                    <div className="text-xs text-muted mt-1">
                      Submitted: {new Date(r.kycSubmittedAt).toLocaleDateString()}
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
                    <span>Reject</span>
                  </button>
                  <button
                    onClick={() => setApproveModal(r)}
                    disabled={processing === r.id}
                    className="btn btn-primary btn-sm"
                  >
                    <CheckCircle2 size={14} />
                    <span>Approve + Location</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Location + Vendor Assignment Approval Modal */}
      {approveModal && (
        <LocationKycApproveModal
          rider={approveModal}
          token={token}
          onClose={() => setApproveModal(null)}
          onSuccess={fetchRiders}
        />
      )}

      {/* Reject Modal */}
      {rejectModal && (
        <div className="modal-overlay" onClick={() => setRejectModal(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-title">❌ Reject KYC</div>
            <div className="modal-subtitle">{rejectModal.name}</div>
            <div className="form-group">
              <label className="form-label">Rejection Reason</label>
              <input
                type="text"
                className="form-input"
                placeholder="Enter reason..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              />
            </div>
            <div className="modal-actions">
              <button onClick={() => setRejectModal(null)} className="btn btn-ghost">Cancel</button>
              <button
                onClick={() => handleReject(rejectModal, rejectReason)}
                disabled={!rejectReason || processing === rejectModal.id}
                className="btn btn-danger"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
