"use client";
import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { AlertTriangle, CheckCircle2, XCircle, MapPin, ChevronDown } from "lucide-react";
import type { HubVendor } from "@/types/hub";

// BD Location cascading data — imported from shared package
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
  "Chattogram": {
    "Kotwali": ["Reazuddin Bazar", "Khatunganj Bazar", "Chaktai Bazar"],
    "Pahartali": ["Pahartali Bazar", "Oxygen Bazar", "Baizid Bazar"],
    "Hathazari": ["Hathazari Bazar", "Fatehabad Bazar"],
    "Chandgaon": ["Chandgaon Bazar", "Momin Road Bazar"],
  },
  "Sylhet": {
    "Kotwali": ["Sylhet Bazar", "Bondor Bazar", "Ambarkhana Bazar"],
    "Shah Poran": ["Shah Poran Bazar", "Tilaghar Bazar"],
  },
  "Rajshahi": {
    "Boalia": ["Saheb Bazar", "New Market Rajshahi", "Kazla Bazar"],
    "Rajpara": ["Rajpara Bazar", "Talaimari Bazar"],
  },
  "Khulna": {
    "Sonadanga": ["Sonadanga Bazar", "Boyra Bazar"],
    "Khalishpur": ["Khalishpur Bazar", "Daulatpur Bazar"],
  },
  "Barishal": {
    "Kotwali": ["Barishal Nathullabad Bazar", "Bandh Road Bazar"],
    "Bandar": ["Bandar Bazar", "Barisal Port Bazar"],
  },
  "Rangpur": {
    "Kotwali": ["Rangpur Shaheed Minar Bazar", "Dhap Bazar"],
    "Mithapukur": ["Mithapukur Bazar"],
  },
  "Mymensingh": {
    "Kotwali": ["Mymensingh Bazar", "Ganginar Par Bazar"],
    "Trishal": ["Trishal Bazar", "Darirampur Bazar"],
  },
};

// ─── Location Approval Modal ──────────────────────────────────────────────────

function LocationApproveModal({
  vendor,
  token,
  onClose,
  onSuccess,
}: {
  vendor: HubVendor;
  token: string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [district, setDistrict] = useState("");
  const [thana, setThana] = useState("");
  const [bazar, setBazar] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const thanas = useMemo(() => (district ? BD_THANAS[district] || [] : []), [district]);
  const bazars = useMemo(() => (district && thana ? BD_BAZARS[district]?.[thana] || [] : []), [district, thana]);

  const handleApprove = async () => {
    if (!district) { setError("জেলা বাধ্যতামূলক।"); return; }
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/vendors`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          id: vendor.id,
          status: "ACTIVE",
          district,
          thana: thana || undefined,
          bazar: bazar || undefined,
        }),
      });
      if (!res.ok) throw new Error("Approval failed");
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
      <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 480 }}>
        <div className="modal-title">
          <MapPin size={18} style={{ color: "var(--accent)" }} />
          <span>Vendor Approve — Location Set করুন</span>
        </div>
        <div className="modal-subtitle" style={{ marginBottom: 16 }}>
          <strong>{vendor.storeName}</strong> — এই location-এর orders পাবে
        </div>

        {/* District */}
        <div className="form-group">
          <label className="form-label">জেলা (District) *</label>
          <div style={{ position: "relative" }}>
            <select
              className="form-input"
              value={district}
              onChange={e => { setDistrict(e.target.value); setThana(""); setBazar(""); }}
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
                onChange={e => { setThana(e.target.value); setBazar(""); }}
                style={{ appearance: "none", paddingRight: 32 }}
              >
                <option value="">— থানা নির্বাচন করুন (ঐচ্ছিক) —</option>
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
                onChange={e => setBazar(e.target.value)}
                style={{ appearance: "none", paddingRight: 32 }}
              >
                <option value="">— বাজার নির্বাচন করুন (ঐচ্ছিক) —</option>
                {bazars.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
              <ChevronDown size={14} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "var(--text-3)" }} />
            </div>
          </div>
        )}

        {/* Summary */}
        {district && (
          <div style={{ padding: "10px 14px", borderRadius: 8, background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)", fontSize: "0.82rem", color: "var(--text-2)", marginBottom: 12 }}>
            📍 Assigned Location: <strong style={{ color: "#10b981" }}>
              {[bazar, thana, district].filter(Boolean).join(", ")}
            </strong>
          </div>
        )}

        {error && (
          <div style={{ color: "#ef4444", fontSize: "0.82rem", marginBottom: 10 }}>{error}</div>
        )}

        <div className="modal-actions">
          <button onClick={onClose} className="btn btn-ghost" disabled={saving}>Cancel</button>
          <button
            onClick={handleApprove}
            disabled={!district || saving}
            className="btn btn-primary"
          >
            {saving ? "Processing..." : <><CheckCircle2 size={14} /> Approve করুন</>}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function VendorApprovalsPage() {
  const { session } = useAuth();
  const token = session?.token || "";
  const [vendors, setVendors] = useState<HubVendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [approveModal, setApproveModal] = useState<HubVendor | null>(null);
  const [rejectModal, setRejectModal] = useState<HubVendor | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [processing, setProcessing] = useState<string | null>(null);

  const fetchVendors = useCallback(async () => {
    const res = await fetch("/api/vendors", { headers: { Authorization: `Bearer ${token}` } });
    const json = await res.json();
    if (json.success) {
      setVendors(json.data.filter((v: HubVendor) =>
        v.status === "PENDING_APPROVAL" || v.status === "PENDING"
      ));
    }
    setLoading(false);
  }, [token]);

  useEffect(() => { fetchVendors(); }, [fetchVendors]);

  async function handleReject(id: string, reason: string) {
    setProcessing(id);
    await fetch("/api/vendors", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ id, status: "REJECTED", rejectionReason: reason }),
    });
    setProcessing(null);
    setRejectModal(null);
    setRejectReason("");
    fetchVendors();
  }

  return (
    <div className="hub-content">
      <div className="page-header">
        <h1 className="page-title"><AlertTriangle size={22} /><span>Vendor Approval Queue</span></h1>
        <p className="page-subtitle">{vendors.length} vendors pending approval</p>
      </div>

      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {[1,2].map((i) => <div key={i} className="skeleton" style={{ height: 130, borderRadius: 12 }} />)}
        </div>
      ) : vendors.length === 0 ? (
        <div className="card"><div className="empty-state">
          <div className="empty-state-icon">✅</div>
          <div className="empty-state-title">All vendor applications processed</div>
        </div></div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {vendors.map((v) => (
            <div key={v.id} className="card">
              <div className="flex-between" style={{ flexWrap: "wrap", gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", marginBottom: 6 }}>
                    <span>{v.storeName}</span>
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
                    Applied: {new Date(v.joinedAt).toLocaleDateString()}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <button onClick={() => setRejectModal(v)} disabled={processing === v.id} className="btn btn-danger btn-sm">
                    <XCircle size={14} /><span>Reject</span>
                  </button>
                  <button onClick={() => setApproveModal(v)} disabled={processing === v.id} className="btn btn-primary btn-sm">
                    <CheckCircle2 size={14} /><span>Approve + Location</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Location Approval Modal */}
      {approveModal && (
        <LocationApproveModal
          vendor={approveModal}
          token={token}
          onClose={() => setApproveModal(null)}
          onSuccess={fetchVendors}
        />
      )}

      {/* Reject Modal */}
      {rejectModal && (
        <div className="modal-overlay" onClick={() => setRejectModal(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-title">❌ Reject Vendor Application</div>
            <div className="modal-subtitle">{rejectModal.storeName}</div>
            <div className="form-group">
              <label className="form-label">Rejection Reason</label>
              <input type="text" className="form-input" placeholder="Reason..." value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} />
            </div>
            <div className="modal-actions">
              <button onClick={() => setRejectModal(null)} className="btn btn-ghost">Cancel</button>
              <button onClick={() => handleReject(rejectModal.id, rejectReason)} disabled={!rejectReason} className="btn btn-danger">Confirm</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
