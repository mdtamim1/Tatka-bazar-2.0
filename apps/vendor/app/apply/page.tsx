"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Store, CheckCircle2, ArrowRight, ShieldCheck, Upload, FileText } from "lucide-react";

export default function PublicVendorApplyPage() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    shopNameBn: "",
    shopNameEn: "",
    ownerName: "",
    phone: "",
    email: "",
    nid: "",
    tradeLicense: "",
    location: "Dhaka",
    address: "",
    categories: "Organic Vegetables & Fruits",
    tagline: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);

    try {
      await fetch("http://localhost:4000/api/vendors/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessName: formData.shopNameEn || formData.shopNameBn,
          phone: formData.phone,
          email: formData.email || `vendor_${formData.phone}@tatkabazar.com`,
          description: `${formData.tagline} | Location: ${formData.location}, ${formData.address} | Owner: ${formData.ownerName}`,
        }),
      });
    } catch (err) {
      console.warn("API apply sync error:", err);
    }
  };

  return (
    <div style={{ maxWidth: "760px", margin: "0 auto", padding: "20px 0" }}>
      {/* Header Banner */}
      <div
        style={{
          background: "linear-gradient(135deg, #064E3B 0%, #059669 100%)",
          borderRadius: "var(--radius-xl)",
          color: "#FFFFFF",
          padding: "36px",
          textAlign: "center",
          marginBottom: "30px",
          boxShadow: "var(--shadow-md)",
        }}
      >
        <div
          style={{
            width: "56px",
            height: "56px",
            borderRadius: "50%",
            background: "rgba(255, 255, 255, 0.15)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 14px",
          }}
        >
          <Store size={28} />
        </div>
        <span style={{ background: "var(--accent)", color: "#FFF", padding: "3px 12px", borderRadius: "999px", fontSize: "0.75rem", fontWeight: 800, display: "inline-block", marginBottom: "10px" }}>
          TATKA BAZAR PARTNER NETWORK
        </span>
        <h1 style={{ fontSize: "1.8rem", fontWeight: 800, marginBottom: "8px" }}>
          Vendor Partner Application
        </h1>
        <p style={{ color: "rgba(255, 255, 255, 0.9)", fontSize: "0.92rem", maxWidth: "560px", margin: "0 auto" }}>
          List your fresh river fish, organic vegetables, and farm staples on Tatka Bazar to reach thousands of daily shoppers.
        </p>
      </div>

      {submitted ? (
        <div
          className="vendor-card"
          style={{ padding: "40px 24px", textAlign: "center", border: "2px solid var(--primary)" }}
        >
          <div
            style={{
              width: "64px",
              height: "64px",
              borderRadius: "50%",
              background: "var(--primary-light)",
              color: "var(--primary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
            }}
          >
            <CheckCircle2 size={36} />
          </div>
          <h2 style={{ fontSize: "1.4rem", fontWeight: 800, color: "var(--primary-dark)", marginBottom: "8px" }}>
            Your Vendor Application Has Been Submitted!
          </h2>
          <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", marginBottom: "20px", maxWidth: "500px", margin: "0 auto 24px" }}>
            Our vendor relations team will verify your trade license and NID credentials within 24 hours. Once verified, you will receive dashboard credentials.
          </p>
          <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
            <Link href="/" className="vendor-btn vendor-btn-primary" style={{ padding: "10px 20px" }}>
              Go to Dashboard (Demo)
            </Link>
            <a href="http://localhost:3000" className="vendor-btn vendor-btn-secondary" style={{ padding: "10px 20px" }}>
              Back to Storefront
            </a>
          </div>
        </div>
      ) : (
        <div className="vendor-card" style={{ padding: "30px" }}>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
            <h2 style={{ fontSize: "1.15rem", fontWeight: 800, borderBottom: "1px solid var(--border-subtle)", paddingBottom: "10px" }}>
              1. Shop Details
            </h2>

            <div>
              <label style={{ fontSize: "0.8rem", fontWeight: 700, display: "block", marginBottom: "4px" }}>Shop Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Padma River Fish House"
                value={formData.shopNameEn}
                onChange={(e) => setFormData({ ...formData, shopNameEn: e.target.value, shopNameBn: e.target.value })}
                style={{ width: "100%", padding: "9px 12px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-medium)" }}
              />
            </div>

            <div>
              <label style={{ fontSize: "0.8rem", fontWeight: 700, display: "block", marginBottom: "4px" }}>Primary Product Category *</label>
              <select
                value={formData.categories}
                onChange={(e) => setFormData({ ...formData, categories: e.target.value })}
                style={{ width: "100%", padding: "9px 12px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-medium)", background: "#FFF" }}
              >
                <option value="River Fish & Meat">River Fish & Meat</option>
                <option value="Organic Vegetables & Fruits">Organic Vegetables & Fruits</option>
                <option value="Pure Oil, Ghee & Dairy">Pure Oil, Ghee & Dairy</option>
                <option value="Rice & Grains">Rice & Grains</option>
              </select>
            </div>

            <h2 style={{ fontSize: "1.15rem", fontWeight: 800, borderBottom: "1px solid var(--border-subtle)", paddingBottom: "10px", marginTop: "10px" }}>
              2. Owner & Legal Credentials
            </h2>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div>
                <label style={{ fontSize: "0.8rem", fontWeight: 700, display: "block", marginBottom: "4px" }}>Owner Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="Full Name"
                  value={formData.ownerName}
                  onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                  style={{ width: "100%", padding: "9px 12px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-medium)" }}
                />
              </div>
              <div>
                <label style={{ fontSize: "0.8rem", fontWeight: 700, display: "block", marginBottom: "4px" }}>Mobile Number *</label>
                <input
                  type="tel"
                  required
                  placeholder="01XXXXXXXXX"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  style={{ width: "100%", padding: "9px 12px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-medium)" }}
                />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div>
                <label style={{ fontSize: "0.8rem", fontWeight: 700, display: "block", marginBottom: "4px" }}>National ID (NID) Number *</label>
                <input
                  type="text"
                  required
                  placeholder="NID Number"
                  value={formData.nid}
                  onChange={(e) => setFormData({ ...formData, nid: e.target.value })}
                  style={{ width: "100%", padding: "9px 12px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-medium)" }}
                />
              </div>
              <div>
                <label style={{ fontSize: "0.8rem", fontWeight: 700, display: "block", marginBottom: "4px" }}>Trade License Number *</label>
                <input
                  type="text"
                  required
                  placeholder="TRAD/XXXX/123456"
                  value={formData.tradeLicense}
                  onChange={(e) => setFormData({ ...formData, tradeLicense: e.target.value })}
                  style={{ width: "100%", padding: "9px 12px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-medium)" }}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: "0.8rem", fontWeight: 700, display: "block", marginBottom: "4px" }}>Complete Shop Address *</label>
              <textarea
                rows={2}
                required
                placeholder="Market name, road number, and district..."
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                style={{ width: "100%", padding: "9px 12px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-medium)" }}
              />
            </div>

            <button type="submit" className="vendor-btn vendor-btn-primary" style={{ width: "100%", padding: "14px", fontSize: "1rem", marginTop: "10px" }}>
              <span>Submit Vendor Application</span>
              <ArrowRight size={18} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
