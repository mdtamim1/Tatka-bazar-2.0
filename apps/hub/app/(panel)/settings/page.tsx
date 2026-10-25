"use client";
import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Settings, Save, RotateCcw, AlertCircle, RefreshCw } from "lucide-react";

export default function SettingsPage() {
  const { session } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [resetting, setResetting] = useState(false);
  const [resetMessage, setResetMessage] = useState("");

  // Config parameters
  const [deliveryFee, setDeliveryFee] = useState("60");
  const [commissionRate, setCommissionRate] = useState("10");
  const [riderUrl, setRiderUrl] = useState("https://tatka-bazar-2-0-rider-seven.vercel.app");
  const [vendorUrl, setVendorUrl] = useState("https://tatka-bazar-2-0-vendor.vercel.app");

  useEffect(() => {
    async function loadConfig() {
      if (!session?.token) return;
      try {
        const res = await fetch("/api/hub/config", {
          headers: { Authorization: `Bearer ${session.token}` },
        });
        const json = await res.json();
        if (json.success && json.data) {
          if (json.data.defaultDeliveryFee !== undefined) setDeliveryFee(String(json.data.defaultDeliveryFee));
          if (json.data.defaultCommissionRate !== undefined) setCommissionRate(String(json.data.defaultCommissionRate));
          if (json.data.riderVercelUrl) setRiderUrl(json.data.riderVercelUrl);
          if (json.data.vendorVercelUrl) setVendorUrl(json.data.vendorVercelUrl);
        }
      } catch (err) {
        console.warn("Failed to load hub config:", err);
      } finally {
        setLoading(false);
      }
    }
    loadConfig();
  }, [session?.token]);

  async function handleSave() {
    setSaving(true);
    setError("");
    setSaved(false);

    try {
      const res = await fetch("/api/hub/config", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(session?.token ? { Authorization: `Bearer ${session.token}` } : {}),
        },
        body: JSON.stringify({
          defaultDeliveryFee: Number(deliveryFee),
          defaultCommissionRate: Number(commissionRate),
          riderVercelUrl: riderUrl,
          vendorVercelUrl: vendorUrl,
        }),
      });

      const json = await res.json();
      if (!json.success) {
        throw new Error(json.error || "Failed to save settings");
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      setError(err.message || "Something went wrong while saving.");
    } finally {
      setSaving(false);
    }
  }

  async function handleResetHub() {
    if (!confirm("Are you sure you want to completely reset Hub portal data, logs, and database records? This action requires SUPER_ADMIN privilege.")) return;
    setResetting(true);
    setResetMessage("");
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
      } else {
        setResetMessage(`❌ Reset failed: ${data.error || "Permission denied"}`);
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
        <p className="page-subtitle">Global configuration, delivery parameters, and database persistence</p>
      </div>

      {saved && (
        <div style={{
          display: "flex", alignItems: "center", gap: 8,
          background: "rgba(0,214,143,0.1)", border: "1px solid rgba(0,214,143,0.25)",
          color: "var(--accent-green)", padding: "12px 16px", borderRadius: "var(--radius-sm)",
          fontSize: 13, marginBottom: 20,
        }}>
          <span>✅ Settings saved successfully & persisted to database.</span>
        </div>
      )}

      {error && (
        <div style={{
          display: "flex", alignItems: "center", gap: 8,
          background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)",
          color: "#ef4444", padding: "12px 16px", borderRadius: "var(--radius-sm)",
          fontSize: 13, marginBottom: 20,
        }}>
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 600 }}>
          {[1, 2, 3].map((i) => <div key={i} className="skeleton" style={{ height: 100, borderRadius: 12 }} />)}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 600 }}>
          {/* Delivery Settings */}
          <div className="card">
            <div className="card-title" style={{ marginBottom: 16 }}>💰 Delivery & Commission</div>
            <div className="grid-2" style={{ gap: 16 }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Default Delivery Fee (Tk.)</label>
                <input
                  type="number"
                  className="form-input"
                  value={deliveryFee}
                  onChange={(e) => setDeliveryFee(e.target.value)}
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Default Commission Rate (%)</label>
                <input
                  type="number"
                  className="form-input"
                  value={commissionRate}
                  onChange={(e) => setCommissionRate(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Portal URLs */}
          <div className="card">
            <div className="card-title" style={{ marginBottom: 16 }}>🌐 Portal URLs (Dispatch Bridge)</div>
            <div className="form-group">
              <label className="form-label">Rider Portal URL (Production)</label>
              <input
                type="url"
                className="form-input"
                value={riderUrl}
                onChange={(e) => setRiderUrl(e.target.value)}
              />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Vendor Portal URL (Production)</label>
              <input
                type="url"
                className="form-input"
                value={vendorUrl}
                onChange={(e) => setVendorUrl(e.target.value)}
              />
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
              <span className="info-value">Hub Token Authentication</span>
            </div>
            <div className="info-row">
              <span className="info-label">Dispatch Bridge</span>
              <span className="info-value">HTTP Proxy + Secret Authenticated</span>
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
              Reset Hub portal in-memory state, clear test activity logs, and restore clean empty collections.
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

          <button
            onClick={handleSave}
            disabled={saving}
            className="btn btn-primary"
            style={{ alignSelf: "flex-start" }}
          >
            {saving ? <RefreshCw size={14} className="spin" /> : <Save size={14} />}
            <span>{saving ? "Saving..." : "Save Settings"}</span>
          </button>
        </div>
      )}
    </div>
  );
}
