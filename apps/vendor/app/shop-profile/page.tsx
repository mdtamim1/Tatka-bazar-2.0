"use client";

import React, { useState } from "react";
import { Palette, Save, Check, ExternalLink, Image as ImageIcon, MapPin, Store } from "lucide-react";
import { useVendor } from "@/context/VendorContext";

export default function VendorShopProfilePage() {
  const { currentVendor, updateShopProfile } = useVendor();

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [formData, setFormData] = useState({
    nameBn: currentVendor.nameEn || currentVendor.nameBn,
    nameEn: currentVendor.nameEn,
    taglineBn: currentVendor.taglineEn || currentVendor.taglineBn,
    taglineEn: currentVendor.taglineEn,
    descriptionBn: currentVendor.descriptionEn || currentVendor.descriptionBn,
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
            Shop Profile & Branding Customizer
          </h1>
          <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginTop: "2px" }}>
            Customize your banner, logo, and bio displayed live on the storefront public shop page.
          </p>
        </div>

        <a
          href={`http://localhost:3000/shop/${currentVendor.slug}`}
          target="_blank"
          rel="noreferrer"
          className="vendor-btn vendor-btn-secondary"
        >
          <span>View Public Shop Preview</span>
          <ExternalLink size={14} />
        </a>
      </div>

      {/* Main Grid: Customizer Form (Left) + Live Preview Card (Right) */}
      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: "24px", alignItems: "flex-start" }}>
        
        {/* Left: Edit Form */}
        <div className="vendor-card" style={{ padding: "24px" }}>
          <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            
            <div>
              <label style={{ fontSize: "0.8rem", fontWeight: 700, display: "block", marginBottom: "4px" }}>Shop Name *</label>
              <input
                type="text"
                required
                value={formData.nameEn}
                onChange={(e) => setFormData({ ...formData, nameEn: e.target.value, nameBn: e.target.value })}
                style={{ width: "100%", padding: "8px 12px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-medium)" }}
              />
            </div>

            <div>
              <label style={{ fontSize: "0.8rem", fontWeight: 700, display: "block", marginBottom: "4px" }}>Shop Location / Area</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                style={{ width: "100%", padding: "8px 12px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-medium)" }}
              />
            </div>

            <div>
              <label style={{ fontSize: "0.8rem", fontWeight: 700, display: "block", marginBottom: "4px" }}>Tagline / Slogan</label>
              <input
                type="text"
                value={formData.taglineEn}
                onChange={(e) => setFormData({ ...formData, taglineEn: e.target.value, taglineBn: e.target.value })}
                style={{ width: "100%", padding: "8px 12px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-medium)" }}
              />
            </div>

            <div>
              <label style={{ fontSize: "0.8rem", fontWeight: 700, display: "block", marginBottom: "4px" }}>Shop Bio & Farm Story</label>
              <textarea
                rows={3}
                value={formData.descriptionEn}
                onChange={(e) => setFormData({ ...formData, descriptionEn: e.target.value, descriptionBn: e.target.value })}
                style={{ width: "100%", padding: "8px 12px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-medium)" }}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div>
                <label style={{ fontSize: "0.8rem", fontWeight: 700, display: "block", marginBottom: "4px" }}>Logo Image URL</label>
                <input
                  type="url"
                  value={formData.logo}
                  onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-medium)" }}
                />
              </div>
              <div>
                <label style={{ fontSize: "0.8rem", fontWeight: 700, display: "block", marginBottom: "4px" }}>Banner Cover Image URL</label>
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
                <span>{savedSuccess ? "✓ Profile Updated!" : "Save Changes"}</span>
              </button>
            </div>

          </form>
        </div>

        {/* Right: Live Preview Card */}
        <div className="vendor-card" style={{ overflow: "hidden" }}>
          <div style={{ padding: "14px 18px", borderBottom: "1px solid var(--border-subtle)", fontWeight: 800, fontSize: "0.9rem" }}>
            Live Storefront Preview
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
              <h3 style={{ fontSize: "1.1rem", fontWeight: 800 }}>{formData.nameEn || formData.nameBn}</h3>
              <span className="status-badge success" style={{ fontSize: "0.65rem" }}>✓ VERIFIED</span>
            </div>
            <div style={{ fontSize: "0.78rem", color: "var(--accent)", fontWeight: 700, marginTop: "2px" }}>
              {formData.taglineEn || formData.taglineBn}
            </div>
            <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "8px", lineHeight: 1.4 }}>
              {formData.descriptionEn || formData.descriptionBn}
            </p>
            <div style={{ fontSize: "0.75rem", color: "var(--text-main)", fontWeight: 600, marginTop: "10px" }}>
              📍 Location: {formData.location}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
