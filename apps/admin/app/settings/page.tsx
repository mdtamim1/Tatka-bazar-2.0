"use client";

import React, { useState } from "react";
import { Settings, Globe, Shield, Save, Check, Key, DollarSign } from "lucide-react";

export default function AdminSettingsPage() {
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Delivery & Platform settings state
  const [generalSettings, setGeneralSettings] = useState({
    freeDeliveryThreshold: 999,
    baseDeliveryFee: 49,
    bKashMerchantId: "01700000001",
    nagadMerchantId: "01700000002",
    sslCommerzStoreId: "tatkabazar_live",
  });

  // Content Strings Editor State
  const [translationsList, setTranslationsList] = useState([
    { key: "topAnnouncement", text: "⚡ 7 AM - 9 AM Fresh Morning Express Delivery! Free shipping on ৳999+ orders" },
    { key: "heroTitle1", text: "Fresh Padma River Hilsa & Morning Fish Market" },
    { key: "heroBadge", text: "Direct from Rivers & Organic Farms" },
    { key: "trust1Title", text: "100% Freshness Guarantee" },
  ]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleTranslationChange = (index: number, value: string) => {
    const updated = [...translationsList];
    updated[index]!.text = value;
    setTranslationsList(updated);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ fontSize: "1.4rem", fontWeight: 800, color: "var(--text-main)" }}>
            System Settings & Content Manager
          </h1>
          <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginTop: "2px" }}>
            Payment gateways, delivery thresholds, and storefront content copy configuration
          </p>
        </div>

        <button onClick={handleSave} className="admin-btn admin-btn-primary">
          <Save size={16} />
          <span>{savedSuccess ? "✓ Settings Saved!" : "Save Changes"}</span>
        </button>
      </div>

      {/* Grid: Payment & Delivery Settings (Left) + Content Editor (Right) */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.3fr", gap: "24px", alignItems: "flex-start" }}>
        
        {/* Left: General & Gateways */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          
          {/* Delivery Rules */}
          <div className="admin-card" style={{ padding: "20px" }}>
            <h2 style={{ fontSize: "1rem", fontWeight: 800, marginBottom: "14px", display: "flex", alignItems: "center", gap: "8px" }}>
              <DollarSign size={18} color="var(--primary)" />
              <span>Delivery Fees & Free Shipping Threshold</span>
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div>
                <label style={{ fontSize: "0.8rem", fontWeight: 700, display: "block", marginBottom: "4px" }}>
                  Free Delivery Minimum Order (৳)
                </label>
                <input
                  type="number"
                  value={generalSettings.freeDeliveryThreshold}
                  onChange={(e) => setGeneralSettings({ ...generalSettings, freeDeliveryThreshold: Number(e.target.value) })}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-medium)" }}
                />
              </div>

              <div>
                <label style={{ fontSize: "0.8rem", fontWeight: 700, display: "block", marginBottom: "4px" }}>
                  Standard Delivery Fee (৳)
                </label>
                <input
                  type="number"
                  value={generalSettings.baseDeliveryFee}
                  onChange={(e) => setGeneralSettings({ ...generalSettings, baseDeliveryFee: Number(e.target.value) })}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-medium)" }}
                />
              </div>
            </div>
          </div>

          {/* Payment Gateways */}
          <div className="admin-card" style={{ padding: "20px" }}>
            <h2 style={{ fontSize: "1rem", fontWeight: 800, marginBottom: "14px", display: "flex", alignItems: "center", gap: "8px" }}>
              <Key size={18} color="var(--accent)" />
              <span>Payment Gateway Configuration</span>
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div>
                <label style={{ fontSize: "0.8rem", fontWeight: 700, display: "block", marginBottom: "4px" }}>
                  bKash Merchant Wallet ID
                </label>
                <input
                  type="text"
                  value={generalSettings.bKashMerchantId}
                  onChange={(e) => setGeneralSettings({ ...generalSettings, bKashMerchantId: e.target.value })}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-medium)" }}
                />
              </div>

              <div>
                <label style={{ fontSize: "0.8rem", fontWeight: 700, display: "block", marginBottom: "4px" }}>
                  Nagad Merchant ID
                </label>
                <input
                  type="text"
                  value={generalSettings.nagadMerchantId}
                  onChange={(e) => setGeneralSettings({ ...generalSettings, nagadMerchantId: e.target.value })}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-medium)" }}
                />
              </div>

              <div>
                <label style={{ fontSize: "0.8rem", fontWeight: 700, display: "block", marginBottom: "4px" }}>
                  SSLCommerz Store ID
                </label>
                <input
                  type="text"
                  value={generalSettings.sslCommerzStoreId}
                  onChange={(e) => setGeneralSettings({ ...generalSettings, sslCommerzStoreId: e.target.value })}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-medium)" }}
                />
              </div>
            </div>
          </div>

        </div>

        {/* Right: Visual Content Management */}
        <div className="admin-card" style={{ padding: "20px" }}>
          <h2 style={{ fontSize: "1rem", fontWeight: 800, marginBottom: "14px", display: "flex", alignItems: "center", gap: "8px" }}>
            <Globe size={18} color="var(--primary)" />
            <span>Storefront Visual Content Editor</span>
          </h2>
          <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginBottom: "16px" }}>
            Non-technical team members can update storefront banners, copy, and promotional text live without code changes.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {translationsList.map((item, idx) => (
              <div key={item.key} style={{ background: "#F8FAFC", padding: "14px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)" }}>
                <div style={{ fontSize: "0.75rem", fontFamily: "var(--font-mono)", fontWeight: 700, color: "var(--primary-dark)", marginBottom: "8px" }}>
                  Copy Key: {item.key}
                </div>

                <div>
                  <label style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontWeight: 700 }}>Content Text:</label>
                  <input
                    type="text"
                    value={item.text}
                    onChange={(e) => handleTranslationChange(idx, e.target.value)}
                    style={{ width: "100%", padding: "7px 10px", borderRadius: "6px", border: "1px solid var(--border-medium)", background: "#FFF" }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
