"use client";

import React, { useState } from "react";
import { Palette, Save, Check, ExternalLink, Image as ImageIcon, MapPin, Store } from "lucide-react";
import { useVendor } from "@/context/VendorContext";

export default function VendorShopProfilePage() {
  const { currentVendor, updateShopProfile } = useVendor();

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [formData, setFormData] = useState({
    nameBn: currentVendor.nameBn,
    nameEn: currentVendor.nameEn,
    taglineBn: currentVendor.taglineBn,
    taglineEn: currentVendor.taglineEn,
    descriptionBn: currentVendor.descriptionBn,
    descriptionEn: currentVendor.descriptionEn,
    location: currentVendor.location,
    banner: currentVendor.banner,
    logo: currentVendor.logo,
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateShopProfile(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 style={{ fontSize: "1.4rem", fontWeight: 800, color: "var(--text-main)" }}>
            শপ প্রোফাইল ও ব্র্যান্ডিং কাস্টমাইজার
          </h1>
          <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginTop: "2px" }}>
            ব্যানার, লোগো ও বায়ো পরিবর্তন করুন — যা সরাসরি স্টোরফ্রন্টের পাবলিক শপ পেজে প্রদর্শিত হবে
          </p>
        </div>

        <a
          href={`http://localhost:3000/shop/${currentVendor.slug}`}
          target="_blank"
          rel="noreferrer"
          className="vendor-btn vendor-btn-secondary"
        >
          <span>পাবলিক শপ প্রিভিউ দেখুন</span>
          <ExternalLink size={14} />
        </a>
      </div>

      {/* Main Grid: Customizer Form (Left) + Live Preview Card (Right) */}
      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: "24px", alignItems: "flex-start" }}>
        
        {/* Left: Edit Form */}
        <div className="vendor-card" style={{ padding: "24px" }}>
          <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div>
                <label style={{ fontSize: "0.8rem", fontWeight: 700, display: "block", marginBottom: "4px" }}>দোকানের নাম (বাংলা) *</label>
                <input
                  type="text"
                  required
                  value={formData.nameBn}
                  onChange={(e) => setFormData({ ...formData, nameBn: e.target.value })}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-medium)" }}
                />
              </div>
              <div>
                <label style={{ fontSize: "0.8rem", fontWeight: 700, display: "block", marginBottom: "4px" }}>Shop Name (English) *</label>
                <input
                  type="text"
                  required
                  value={formData.nameEn}
                  onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-medium)" }}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: "0.8rem", fontWeight: 700, display: "block", marginBottom: "4px" }}>দোকানের অবস্থান / জেলা</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                style={{ width: "100%", padding: "8px 12px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-medium)" }}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div>
                <label style={{ fontSize: "0.8rem", fontWeight: 700, display: "block", marginBottom: "4px" }}>ট্যাগলাইন / স্লোগান (বাংলা)</label>
                <input
                  type="text"
                  value={formData.taglineBn}
                  onChange={(e) => setFormData({ ...formData, taglineBn: e.target.value })}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-medium)" }}
                />
              </div>
              <div>
                <label style={{ fontSize: "0.8rem", fontWeight: 700, display: "block", marginBottom: "4px" }}>Tagline (English)</label>
                <input
                  type="text"
                  value={formData.taglineEn}
                  onChange={(e) => setFormData({ ...formData, taglineEn: e.target.value })}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-medium)" }}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: "0.8rem", fontWeight: 700, display: "block", marginBottom: "4px" }}>দোকানের বিবরণ (বাংলা)</label>
              <textarea
                rows={3}
                value={formData.descriptionBn}
                onChange={(e) => setFormData({ ...formData, descriptionBn: e.target.value })}
                style={{ width: "100%", padding: "8px 12px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-medium)" }}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div>
                <label style={{ fontSize: "0.8rem", fontWeight: 700, display: "block", marginBottom: "4px" }}>লোগোর ইমেজ লিংক</label>
                <input
                  type="url"
                  value={formData.logo}
                  onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-medium)" }}
                />
              </div>
              <div>
                <label style={{ fontSize: "0.8rem", fontWeight: 700, display: "block", marginBottom: "4px" }}>ব্যানার কভার ইমেজ লিংক</label>
                <input
                  type="url"
                  value={formData.banner}
                  onChange={(e) => setFormData({ ...formData, banner: e.target.value })}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-medium)" }}
                />
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "10px" }}>
              <button type="submit" className="vendor-btn vendor-btn-primary" style={{ padding: "10px 20px" }}>
                <Save size={16} />
                <span>{savedSuccess ? "✓ প্রোফাইল আপডেট সম্পন্ন!" : "পরিবর্তন সংরক্ষণ করুন"}</span>
              </button>
            </div>

          </form>
        </div>

        {/* Right: Live Preview Card */}
        <div className="vendor-card" style={{ overflow: "hidden" }}>
          <div style={{ padding: "14px 18px", borderBottom: "1px solid var(--border-subtle)", fontWeight: 800, fontSize: "0.9rem" }}>
            লাইভ স্টোরফ্রন্ট প্রিভিউ
          </div>

          <div style={{ position: "relative", height: "130px", background: "#333" }}>
            <img
              src={formData.banner}
              alt="Banner"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
            <div style={{ position: "absolute", bottom: "-20px", left: "18px" }}>
              <img
                src={formData.logo}
                alt="Logo"
                style={{ width: "60px", height: "60px", borderRadius: "12px", objectFit: "cover", border: "3px solid #FFF", boxShadow: "var(--shadow-md)" }}
              />
            </div>
          </div>

          <div style={{ padding: "28px 18px 18px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 800 }}>{formData.nameBn}</h3>
              <span className="status-badge success" style={{ fontSize: "0.65rem" }}>✓ VERIFIED</span>
            </div>
            <div style={{ fontSize: "0.78rem", color: "var(--accent)", fontWeight: 700, marginTop: "2px" }}>
              {formData.taglineBn}
            </div>
            <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "8px", lineHeight: 1.4 }}>
              {formData.descriptionBn}
            </p>
            <div style={{ fontSize: "0.75rem", color: "var(--text-main)", fontWeight: 600, marginTop: "10px" }}>
              📍 অবস্থান: {formData.location}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
