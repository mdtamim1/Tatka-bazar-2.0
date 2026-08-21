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

  // Translation Strings Editor State
  const [translationsList, setTranslationsList] = useState([
    { key: "topAnnouncement", bn: "⚡ সকাল ৭টা - ৯টার মধ্যে তাজা সকাল এক্সপ্রেস ডেলিভারি! ৳৯৯৯+ অর্ডারে ফ্রি ডেলিভারি", en: "⚡ 7 AM - 9 AM Fresh Morning Express Delivery! Free shipping on ৳999+ orders" },
    { key: "heroTitle1", bn: "পদ্মার তাজা ইলিশ ও সকালের তাজা বাজার", en: "Fresh Padma River Hilsa & Morning Fish Market" },
    { key: "heroBadge", bn: "সরাসরি মাঠ ও নদী থেকে", en: "Direct from Rivers & Organic Farms" },
    { key: "trust1Title", bn: "১০০% তাজা পণ্য গ্যারান্টি", en: "100% Freshness Guarantee" },
  ]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleTranslationChange = (index: number, lang: "bn" | "en", value: string) => {
    const updated = [...translationsList];
    updated[index]![lang] = value;
    setTranslationsList(updated);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ fontSize: "1.4rem", fontWeight: 800, color: "var(--text-main)" }}>
            সিস্টেম সেটিংস ও অনুবাদ ম্যানেজার (Translations)
          </h1>
          <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginTop: "2px" }}>
            পেমেন্ট গেটওয়ে, ডেলিভারি ফি নিয়মাবলী ও ডেভেলপার ছাড়া স্টোরফ্রন্ট টেক্সট পরিবর্তন
          </p>
        </div>

        <button onClick={handleSave} className="admin-btn admin-btn-primary">
          <Save size={16} />
          <span>{savedSuccess ? "✓ সেটিংস সংরক্ষিত হয়েছে!" : "পরিবর্তন সংরক্ষণ করুন"}</span>
        </button>
      </div>

      {/* Grid: Payment & Delivery Settings (Left) + Translation Editor (Right) */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.3fr", gap: "24px", alignItems: "flex-start" }}>
        
        {/* Left: General & Gateways */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          
          {/* Delivery Rules */}
          <div className="admin-card" style={{ padding: "20px" }}>
            <h2 style={{ fontSize: "1rem", fontWeight: 800, marginBottom: "14px", display: "flex", alignItems: "center", gap: "8px" }}>
              <DollarSign size={18} color="var(--primary)" />
              <span>ডেলিভারি ফি ও ফ্রি শিপিং নিয়ম</span>
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div>
                <label style={{ fontSize: "0.8rem", fontWeight: 700, display: "block", marginBottom: "4px" }}>
                  ফ্রি ডেলিভারি ন্যূনতম অর্ডার পরিমাণ (৳)
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
                  স্ট্যান্ডার্ড ডেলিভারি ফি (৳)
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
              <span>পেমেন্ট গেটওয়ে কনফিগারেশন</span>
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div>
                <label style={{ fontSize: "0.8rem", fontWeight: 700, display: "block", marginBottom: "4px" }}>
                  বিকাশ মার্চেন্ট আইডি (bKash Merchant Wallet)
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
                  নগদ মার্চেন্ট অ্যাকাউন্ট (Nagad Merchant ID)
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
                  SSLCommerz স্টোর আইডি (Store ID)
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

        {/* Right: Visual Translation Management (Non-technical staff can edit Bangla/English copy) */}
        <div className="admin-card" style={{ padding: "20px" }}>
          <h2 style={{ fontSize: "1rem", fontWeight: 800, marginBottom: "14px", display: "flex", alignItems: "center", gap: "8px" }}>
            <Globe size={18} color="var(--primary)" />
            <span>দ্বিভাষিক টেক্সট এডিটর (Visual Translation Editor)</span>
          </h2>
          <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginBottom: "16px" }}>
            নন-টেকনিক্যাল টিম মেম্বাররা কোড ছাড়াই স্টোরফ্রন্টের বাংলা ও ইংরেজি টেক্সট সরাসরি এখান থেকে আপডেট করতে পারবেন।
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {translationsList.map((item, idx) => (
              <div key={item.key} style={{ background: "#F8FAFC", padding: "14px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)" }}>
                <div style={{ fontSize: "0.75rem", fontFamily: "var(--font-mono)", fontWeight: 700, color: "var(--primary-dark)", marginBottom: "8px" }}>
                  কপি কী: {item.key}
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <div>
                    <label style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontWeight: 700 }}>বাংলা টেক্সট (BN):</label>
                    <input
                      type="text"
                      value={item.bn}
                      onChange={(e) => handleTranslationChange(idx, "bn", e.target.value)}
                      style={{ width: "100%", padding: "7px 10px", borderRadius: "6px", border: "1px solid var(--border-medium)", background: "#FFF" }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontWeight: 700 }}>English Text (EN):</label>
                    <input
                      type="text"
                      value={item.en}
                      onChange={(e) => handleTranslationChange(idx, "en", e.target.value)}
                      style={{ width: "100%", padding: "7px 10px", borderRadius: "6px", border: "1px solid var(--border-medium)", background: "#FFF" }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
