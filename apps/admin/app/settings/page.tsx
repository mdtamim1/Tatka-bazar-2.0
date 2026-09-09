"use client";

import React, { useState } from "react";
import { Settings, User, Bell, Palette, Globe, Key, Save, Check } from "lucide-react";
import { useAdmin } from "@/context/AdminContext";
import { AdminRole } from "@/types";

const ROLES: AdminRole[] = ["SUPER_ADMIN", "MANAGER", "INVENTORY_STAFF", "SUPPORT_STAFF", "DELIVERY_COORDINATOR", "FINANCE"];

export default function SettingsPage() {
  const { currentUser, setCurrentRole } = useAdmin();
  const [saved, setSaved] = useState(false);
  const [storeSettings, setStoreSettings] = useState({
    storeName: "Tatka Bazar",
    supportPhone: "16XXX",
    currency: "BDT",
    timezone: "Asia/Dhaka",
    defaultDeliveryFee: 49,
    minOrderAmount: 299,
    orderAlertSound: true,
    lowStockAlert: true,
    emailNotifications: true,
  });
  const set = (k: string, v: any) => setStoreSettings(p => ({ ...p, [k]: v }));

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", maxWidth: "760px" }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Settings</h1>
          <p className="page-subtitle">Platform configuration and preferences</p>
        </div>
      </div>

      {/* Role switcher (dev) */}
      <div className="admin-card" style={{ padding: "20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
          <User size={16} color="var(--green)" />
          <div style={{ fontWeight: 800, color: "var(--text-0)" }}>Viewing as Role</div>
          <span className="tag green" style={{ fontSize: "0.62rem" }}>DEV TOOL</span>
        </div>
        <p style={{ fontSize: "0.80rem", color: "var(--text-3)", marginBottom: "12px" }}>
          Simulate different admin roles to test permission boundaries. This only affects your current session.
        </p>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {ROLES.map(role => (
            <button
              key={role}
              className={`tab-pill ${currentUser.role === role ? "active" : ""}`}
              onClick={() => setCurrentRole(role)}
            >
              {role.replace(/_/g, " ")}
            </button>
          ))}
        </div>
        <div style={{ marginTop: "12px", padding: "8px 12px", background: "var(--bg-elevated)", borderRadius: "var(--r-md)", fontSize: "0.78rem", color: "var(--text-3)" }}>
          Current: <span style={{ fontWeight: 700, color: "var(--green)" }}>{currentUser.name} — {currentUser.role.replace(/_/g, " ")}</span>
        </div>
      </div>

      {/* Connected Vercel Ecosystem */}
      <div className="admin-card" style={{ padding: "20px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Globe size={16} color="var(--green)" />
            <div style={{ fontWeight: 800, color: "var(--text-0)" }}>Connected Ecosystem Services (Vercel)</div>
          </div>
          <span className="tag green" style={{ fontSize: "0.65rem", fontWeight: 700 }}>5/5 ONLINE</span>
        </div>
        <p style={{ fontSize: "0.80rem", color: "var(--text-3)", marginBottom: "14px" }}>
          All portals in the Tatka Bazar ecosystem are synchronized and connected via live cloud endpoints.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {[
            { name: "Admin Control Panel", url: "https://tatka-bazar-2-0-admin.vercel.app", desc: "Current Panel (Operations & Management)", isCurrent: true },
            { name: "Customer Storefront", url: "https://tatka-bazar-2-0-storefront.vercel.app", desc: "E-Commerce Shopping Frontend", isCurrent: false },
            { name: "Vendor Partner Portal", url: "https://tatka-bazar-2-0-vendor.vercel.app", desc: "Vendor Store, Products & Packing Station", isCurrent: false },
            { name: "Rider Fleet Portal", url: "https://tatka-bazar-2-0-rider-seven.vercel.app", desc: "Rider Order Claiming & Delivery Tracker", isCurrent: false },
            { name: "Operations & Dispatch Hub", url: "https://hub-gamma-umber.vercel.app", desc: "Central Hub Coordination & Monitoring", isCurrent: false },
          ].map((svc) => (
            <div
              key={svc.url}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "12px 14px",
                background: "var(--bg-elevated)",
                borderRadius: "var(--r-md)",
                border: "1px solid var(--border-subtle)",
              }}
            >
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontWeight: 700, fontSize: "0.86rem", color: "var(--text-1)" }}>{svc.name}</span>
                  {svc.isCurrent && (
                    <span className="tag blue" style={{ fontSize: "0.60rem", padding: "1px 6px" }}>THIS PANEL</span>
                  )}
                </div>
                <div style={{ fontSize: "0.74rem", color: "var(--text-3)", marginTop: "2px" }}>{svc.desc}</div>
                <code style={{ fontSize: "0.70rem", color: "var(--green)", marginTop: "2px", display: "inline-block" }}>{svc.url}</code>
              </div>
              <a
                href={svc.url}
                target="_blank"
                rel="noopener noreferrer"
                className="admin-btn admin-btn-secondary"
                style={{ fontSize: "0.72rem", padding: "6px 12px", textDecoration: "none" }}
              >
                Open ↗
              </a>
            </div>
          ))}
        </div>
      </div>

      {/* Store Config */}
      <div className="admin-card" style={{ padding: "20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "18px" }}>
          <Globe size={16} color="var(--indigo)" />
          <div style={{ fontWeight: 800, color: "var(--text-0)" }}>Store Configuration</div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
          <div>
            <label className="admin-label">Store Name</label>
            <input className="admin-input" value={storeSettings.storeName} onChange={e => set("storeName", e.target.value)} />
          </div>
          <div>
            <label className="admin-label">Support Phone</label>
            <input className="admin-input" value={storeSettings.supportPhone} onChange={e => set("supportPhone", e.target.value)} />
          </div>
          <div>
            <label className="admin-label">Currency</label>
            <select className="admin-select" value={storeSettings.currency} onChange={e => set("currency", e.target.value)}>
              <option value="BDT">BDT (৳)</option>
              <option value="USD">USD ($)</option>
            </select>
          </div>
          <div>
            <label className="admin-label">Timezone</label>
            <select className="admin-select" value={storeSettings.timezone} onChange={e => set("timezone", e.target.value)}>
              <option value="Asia/Dhaka">Asia/Dhaka (UTC+6)</option>
            </select>
          </div>
          <div>
            <label className="admin-label">Default Delivery Fee (৳)</label>
            <input className="admin-input" type="number" min="0" value={storeSettings.defaultDeliveryFee} onChange={e => set("defaultDeliveryFee", parseInt(e.target.value))} />
          </div>
          <div>
            <label className="admin-label">Min Order Amount (৳)</label>
            <input className="admin-input" type="number" min="0" value={storeSettings.minOrderAmount} onChange={e => set("minOrderAmount", parseInt(e.target.value))} />
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="admin-card" style={{ padding: "20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "18px" }}>
          <Bell size={16} color="var(--amber)" />
          <div style={{ fontWeight: 800, color: "var(--text-0)" }}>Notifications & Alerts</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {[
            { key: "orderAlertSound", label: "🔔 New Order Sound Alert", desc: "Play a chime when a new order arrives" },
            { key: "lowStockAlert", label: "⚠ Low Stock Notifications", desc: "Notify when product stock falls below threshold" },
            { key: "emailNotifications", label: "✉️ Email Notifications", desc: "Send daily digest emails to admin team" },
          ].map(({ key, label, desc }) => (
            <div key={key} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px", background: "var(--bg-elevated)", borderRadius: "var(--r-md)" }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: "0.85rem", color: "var(--text-1)" }}>{label}</div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-3)", marginTop: "2px" }}>{desc}</div>
              </div>
              <label className="admin-toggle">
                <input type="checkbox" checked={(storeSettings as any)[key]} onChange={e => set(key, e.target.checked)} />
                <span className="admin-toggle-slider" />
              </label>
            </div>
          ))}
        </div>
      </div>

      <button className="admin-btn admin-btn-primary" style={{ alignSelf: "flex-start" }} onClick={handleSave}>
        {saved ? <><Check size={14} /> Saved!</> : <><Save size={14} /> Save Changes</>}
      </button>
    </div>
  );
}
