"use client";
import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Settings, Save, Globe, Percent, DollarSign, RotateCcw } from "lucide-react";

export default function SettingsPage() {
  const { session } = useAuth();
  const [saved, setSaved] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [resetMessage, setResetMessage] = useState("");

  // Local state for config (in production, fetched from /api/hub)
  const [deliveryFee, setDeliveryFee] = useState("60");
  const [commissionRate, setCommissionRate] = useState("10");
  const [riderUrl, setRiderUrl] = useState("https://tatka-bazar-2-0-rider-seven.vercel.app");
  const [vendorUrl, setVendorUrl] = useState("https://tatka-bazar-2-0-vendor.vercel.app");

  function save() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  async function handleResetHub() {
    if (!confirm("Are you sure you want to completely reset Hub portal data, logs, and database records?")) return;
    setResetting(true);
    try {
      const res = await fetch("/api/hub/reset", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(session?.token ? { Authorization: `Bearer ${session.token}` } : {}),
        },
      });
      const data = await res.json();
      if (data.success) {
        setResetMessage("✅ Hub portal, stores, and database have been fully reset.");
        setTimeout(() => setResetMessage(""), 4000);
      }
    } catch {
      setResetMessage("❌ Reset failed. Please check network/server.");
    } finally {
      setResetting(false);
    }
  }

  if (!session || (session.role !== "SUPER_ADMIN" && session.role !== "OPS_MANAGER")) {
    return (
      <div className="hub-content">
        <div className="card"><div className="empty-state">
          <div className="empty-state-icon">🔒</div>
          <div className="empty-state-title">This page is restricted to Admins only</div>
        </div></div>
      </div>
    );
  }

  return (
    <div className="hub-content">
      <div className="page-header">
        <h1 className="page-title"><Settings size={22} /><span>Hub Settings</span></h1>
        <p className="page-subtitle">Global configuration and default parameters</p>
      </div>

      {saved && (
        <div style={{
          display: "flex", alignItems: "center", gap: 8,
          background: "rgba(0,214,143,0.1)", border: "1px solid rgba(0,214,143,0.25)",
          color: "var(--accent-green)", padding: "12px 16px", borderRadius: "var(--radius-sm)",
          fontSize: 13, marginBottom: 20,
        }}>
          <span>✅ Settings saved successfully</span>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 600 }}>
        {/* Delivery Settings */}
        <div className="card">
          <div className="card-title" style={{ marginBottom: 16 }}>💰 Delivery & Commission</div>
          <div className="grid-2" style={{ gap: 16 }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Default Delivery Fee (Tk.)</label>
              <input type="number" className="form-input" value={deliveryFee} onChange={(e) => setDeliveryFee(e.target.value)} />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Default Commission Rate (%)</label>
              <input type="number" className="form-input" value={commissionRate} onChange={(e) => setCommissionRate(e.target.value)} />
            </div>
          </div>
        </div>

        {/* Portal URLs */}
        <div className="card">
          <div className="card-title" style={{ marginBottom: 16 }}>🌐 Portal URLs (Dispatch Bridge)</div>
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
          <div className="card-title" style={{ marginBottom: 16 }}>ℹ️ Hub Information</div>
          <div className="info-row">
            <span className="info-label">Subdomain</span>
            <span className="info-value">hub.tatkabazar.com</span>
          </div>
          <div className="info-row">
            <span className="info-label">Local Port</span>
            <span className="info-value">3004</span>
          </div>
          <div className="info-row">
            <span className="info-label">Auth Type</span>
            <span className="info-value">Hub-local (globalThis session)</span>
          </div>
          <div className="info-row">
            <span className="info-label">Dispatch Bridge</span>
            <span className="info-value">HTTP Proxy (Rider + Vendor APIs)</span>
          </div>
          <div className="info-row">
            <span className="info-label">Cross-tab Sync</span>
            <span className="info-value">tatka_hub_command_channel (BroadcastChannel)</span>
          </div>
        </div>

        {/* System Reset / Danger Zone */}
        <div className="card" style={{ borderColor: "rgba(255, 77, 77, 0.3)" }}>
          <div className="card-title" style={{ marginBottom: 8, color: "#ff4d4d" }}>
            ⚠️ System Reset & Data Purge
          </div>
          <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 16, lineHeight: 1.5 }}>
            Reset Hub portal in-memory state, clear test activity logs, and restore clean default seed values.
          </p>

          {resetMessage && (
            <div style={{
              padding: "10px 14px",
              borderRadius: "var(--radius-sm)",
              background: resetMessage.startsWith("✅") ? "rgba(0,214,143,0.1)" : "rgba(255,77,77,0.1)",
              border: `1px solid ${resetMessage.startsWith("✅") ? "rgba(0,214,143,0.3)" : "rgba(255,77,77,0.3)"}`,
              fontSize: 13,
              marginBottom: 14,
            }}>
              {resetMessage}
            </div>
          )}

          <button
            onClick={handleResetHub}
            disabled={resetting}
            className="btn btn-secondary"
            style={{
              borderColor: "rgba(255, 77, 77, 0.4)",
              color: "#ff4d4d",
              alignSelf: "flex-start",
            }}
          >
            <RotateCcw size={14} />
            <span>{resetting ? "Resetting..." : "Reset Hub Portal & Database"}</span>
          </button>
        </div>

        <button onClick={save} className="btn btn-primary" style={{ alignSelf: "flex-start" }}>
          <Save size={14} />
          <span>Save Settings</span>
        </button>
      </div>
    </div>
  );
}
