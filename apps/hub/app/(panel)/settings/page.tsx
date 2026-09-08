"use client";
import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Settings, Save, Globe, Percent, DollarSign } from "lucide-react";

export default function SettingsPage() {
  const { session } = useAuth();
  const [saved, setSaved] = useState(false);

  // Local state for config (in production, fetched from /api/hub)
  const [deliveryFee, setDeliveryFee] = useState("60");
  const [commissionRate, setCommissionRate] = useState("10");
  const [riderUrl, setRiderUrl] = useState("https://tatka-bazar-2-0-rider-seven.vercel.app");
  const [vendorUrl, setVendorUrl] = useState("https://tatka-bazar-2-0-vendor.vercel.app");

  function save() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  if (!session || (session.role !== "SUPER_ADMIN" && session.role !== "OPS_MANAGER")) {
    return (
      <div className="hub-content">
        <div className="card"><div className="empty-state">
          <div className="empty-state-icon">🔒</div>
          <div className="empty-state-title font-bn">এই পেইজটি শুধু Admin-দের জন্য</div>
        </div></div>
      </div>
    );
  }

  return (
    <div className="hub-content">
      <div className="page-header">
        <h1 className="page-title"><Settings size={22} /><span className="font-bn">Hub সেটিংস</span></h1>
        <p className="page-subtitle font-bn">গ্লোবাল কনফিগারেশন এবং ডিফল্ট মান</p>
      </div>

      {saved && (
        <div style={{
          display: "flex", alignItems: "center", gap: 8,
          background: "rgba(0,214,143,0.1)", border: "1px solid rgba(0,214,143,0.25)",
          color: "var(--accent-green)", padding: "12px 16px", borderRadius: "var(--radius-sm)",
          fontSize: 13, marginBottom: 20,
        }}>
          <span className="font-bn">✅ সেটিংস সংরক্ষিত হয়েছে</span>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 600 }}>
        {/* Delivery Settings */}
        <div className="card">
          <div className="card-title font-bn" style={{ marginBottom: 16 }}>💰 ডেলিভারি ও কমিশন</div>
          <div className="grid-2" style={{ gap: 16 }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label font-bn">ডিফল্ট ডেলিভারি ফি (৳)</label>
              <input type="number" className="form-input" value={deliveryFee} onChange={(e) => setDeliveryFee(e.target.value)} />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label font-bn">ডিফল্ট কমিশন রেট (%)</label>
              <input type="number" className="form-input" value={commissionRate} onChange={(e) => setCommissionRate(e.target.value)} />
            </div>
          </div>
        </div>

        {/* Portal URLs */}
        <div className="card">
          <div className="card-title font-bn" style={{ marginBottom: 16 }}>🌐 Portal URLs (Dispatch Bridge)</div>
          <div className="form-group">
            <label className="form-label">Rider Portal URL (Production)</label>
            <input type="url" className="form-input" value={riderUrl} onChange={(e) => setRiderUrl(e.target.value)} />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Vendor Portal URL (Production)</label>
            <input type="url" className="form-input" value={vendorUrl} onChange={(e) => setVendorUrl(e.target.value)} />
          </div>
        </div>

        {/* Hub Info */}
        <div className="card">
          <div className="card-title font-bn" style={{ marginBottom: 16 }}>ℹ️ Hub তথ্য</div>
          <div className="info-row">
            <span className="info-label font-bn">Subdomain</span>
            <span className="info-value">hub.tatkabazar.com</span>
          </div>
          <div className="info-row">
            <span className="info-label font-bn">Local Port</span>
            <span className="info-value">3004</span>
          </div>
          <div className="info-row">
            <span className="info-label font-bn">Auth Type</span>
            <span className="info-value">Hub-local (globalThis session)</span>
          </div>
          <div className="info-row">
            <span className="info-label font-bn">Dispatch Bridge</span>
            <span className="info-value">HTTP Proxy (Rider + Vendor APIs)</span>
          </div>
          <div className="info-row">
            <span className="info-label font-bn">Cross-tab Sync</span>
            <span className="info-value">tatka_hub_command_channel (BroadcastChannel)</span>
          </div>
        </div>

        <button onClick={save} className="btn btn-primary" style={{ alignSelf: "flex-start" }}>
          <Save size={14} />
          <span className="font-bn">সেটিংস সংরক্ষণ করুন</span>
        </button>
      </div>
    </div>
  );
}
