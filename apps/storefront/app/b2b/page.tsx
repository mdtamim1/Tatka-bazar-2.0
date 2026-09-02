"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Store, ShieldCheck, CheckCircle2, Truck, FileText, ArrowRight, Building2 } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function B2BPage() {
  const { t } = useLanguage();
  const [submitted, setSubmitted] = useState(false);
  const [b2bForm, setB2bForm] = useState({
    companyName: "",
    tradeLicense: "",
    contactPerson: "",
    phone: "",
    email: "",
    categoryNeeded: "Rice & Grains",
    monthlyVolume: "500 kg - 1000 kg",
    notes: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div style={{ padding: "30px 0 60px" }}>
      <div className="container" style={{ maxWidth: "900px" }}>
        
        {/* Header Hero */}
        <div
          style={{
            background: "linear-gradient(135deg, #09331B 0%, #156939 100%)",
            borderRadius: "var(--radius-xl)",
            color: "#FFFFFF",
            padding: "40px",
            textAlign: "center",
            marginBottom: "40px",
            boxShadow: "var(--shadow-lg)",
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
              margin: "0 auto 16px",
              fontSize: "1.8rem",
            }}
          >
            🏢
          </div>
          <span style={{ background: "var(--accent)", color: "#FFF", padding: "4px 14px", borderRadius: "999px", fontSize: "0.78rem", fontWeight: 800, display: "inline-block", marginBottom: "12px" }}>
            TATKA BAZAR B2B ENTERPRISE
          </span>
          <h1 style={{ fontSize: "clamp(1.6rem, 3.5vw, 2.3rem)", fontWeight: 800, lineHeight: 1.2, marginBottom: "12px" }}>
            Wholesale & Institutional Bulk Supply
          </h1>
          <p style={{ color: "rgba(255, 255, 255, 0.85)", fontSize: "1rem", maxWidth: "640px", margin: "0 auto" }}>
            Direct mill-rate supply of fresh fish, meat, premium rice, and organic vegetables for restaurants, hotels, catering, and corporate pantries.
          </p>
        </div>

        {/* 3 Pillars for B2B */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "20px", marginBottom: "40px" }}>
          <div style={{ background: "var(--bg-surface)", padding: "20px", borderRadius: "var(--radius-lg)", border: "1px solid var(--border-subtle)", textAlign: "center" }}>
            <div style={{ fontSize: "2rem", marginBottom: "8px" }}>💰</div>
            <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "4px" }}>Lowest Wholesale Rates</h3>
            <p style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>Directly sourced from verified farms and mills with no middlemen margin.</p>
          </div>

          <div style={{ background: "var(--bg-surface)", padding: "20px", borderRadius: "var(--radius-lg)", border: "1px solid var(--border-subtle)", textAlign: "center" }}>
            <div style={{ fontSize: "2rem", marginBottom: "8px" }}>⏰</div>
            <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "4px" }}>Scheduled Dawn Delivery</h3>
            <p style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>Delivered fresh to your commercial kitchen between 6:00 AM - 7:30 AM daily.</p>
          </div>

          <div style={{ background: "var(--bg-surface)", padding: "20px", borderRadius: "var(--radius-lg)", border: "1px solid var(--border-subtle)", textAlign: "center" }}>
            <div style={{ fontSize: "2rem", marginBottom: "8px" }}>📋</div>
            <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "4px" }}>Invoicing & Credit Lines</h3>
            <p style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>Official VAT invoices, monthly consolidated billing, and flexible credit facilities.</p>
          </div>
        </div>

        {/* Application Form */}
        <div
          style={{
            background: "var(--bg-surface)",
            borderRadius: "var(--radius-xl)",
            border: "1px solid var(--border-subtle)",
            padding: "36px",
            boxShadow: "var(--shadow-md)",
          }}
        >
          {submitted ? (
            <div style={{ textAlign: "center", padding: "40px 20px" }}>
              <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: "var(--primary-light)", color: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                <CheckCircle2 size={36} />
              </div>
              <h2 style={{ fontSize: "1.4rem", fontWeight: 800, color: "var(--primary-dark)", marginBottom: "8px" }}>
                Your B2B Application Has Been Submitted!
              </h2>
              <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", marginBottom: "20px" }}>
                Our corporate accounts manager will contact your representative within 2 hours.
              </p>
              <Link href="/" className="btn-primary">
                Return to Home
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <h2 style={{ fontSize: "1.3rem", fontWeight: 800, marginBottom: "20px", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "10px" }}>
                🏢 Wholesale Quotation & Corporate Account Application
              </h2>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
                <div>
                  <label style={{ fontSize: "0.85rem", fontWeight: 700, display: "block", marginBottom: "6px" }}>Company / Restaurant Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Green Garden Restaurant"
                    value={b2bForm.companyName}
                    onChange={(e) => setB2bForm({ ...b2bForm, companyName: e.target.value })}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-medium)", outline: "none" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "0.85rem", fontWeight: 700, display: "block", marginBottom: "6px" }}>Trade License Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="TRAD/DNCC/123456/2024"
                    value={b2bForm.tradeLicense}
                    onChange={(e) => setB2bForm({ ...b2bForm, tradeLicense: e.target.value })}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-medium)", outline: "none" }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
                <div>
                  <label style={{ fontSize: "0.85rem", fontWeight: 700, display: "block", marginBottom: "6px" }}>Contact Person Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Name & Designation"
                    value={b2bForm.contactPerson}
                    onChange={(e) => setB2bForm({ ...b2bForm, contactPerson: e.target.value })}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-medium)", outline: "none" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "0.85rem", fontWeight: 700, display: "block", marginBottom: "6px" }}>Mobile Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="01XXXXXXXXX"
                    value={b2bForm.phone}
                    onChange={(e) => setB2bForm({ ...b2bForm, phone: e.target.value })}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-medium)", outline: "none" }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
                <div>
                  <label style={{ fontSize: "0.85rem", fontWeight: 700, display: "block", marginBottom: "6px" }}>Required Product Category</label>
                  <select
                    value={b2bForm.categoryNeeded}
                    onChange={(e) => setB2bForm({ ...b2bForm, categoryNeeded: e.target.value })}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-medium)", background: "var(--bg-surface)", outline: "none" }}
                  >
                    <option value="Rice & Grains">Rice & Grains</option>
                    <option value="Fish & Meat">Fish & Meat</option>
                    <option value="Fresh Vegetables">Fresh Vegetables</option>
                    <option value="Oils & Spices">Oils & Spices</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: "0.85rem", fontWeight: 700, display: "block", marginBottom: "6px" }}>Estimated Monthly Volume</label>
                  <select
                    value={b2bForm.monthlyVolume}
                    onChange={(e) => setB2bForm({ ...b2bForm, monthlyVolume: e.target.value })}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-medium)", background: "var(--bg-surface)", outline: "none" }}
                  >
                    <option value="100 kg - 500 kg">100 kg - 500 kg</option>
                    <option value="500 kg - 1000 kg">500 kg - 1000 kg</option>
                    <option value="1 Ton - 5 Ton">1 Ton - 5 Ton</option>
                    <option value="5 Ton+ (Mega Supply)">5 Ton+ (Mega Supply)</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: "24px" }}>
                <label style={{ fontSize: "0.85rem", fontWeight: 700, display: "block", marginBottom: "6px" }}>Special Requirements / Notes</label>
                <textarea
                  rows={3}
                  placeholder="Specify particular grain varieties, custom cutting requirements, or delivery instructions..."
                  value={b2bForm.notes}
                  onChange={(e) => setB2bForm({ ...b2bForm, notes: e.target.value })}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-medium)", outline: "none" }}
                />
              </div>

              <button
                type="submit"
                className="btn-primary"
                style={{ width: "100%", padding: "14px", fontSize: "1.05rem" }}
              >
                <span>Submit Quotation Request</span>
                <ArrowRight size={18} />
              </button>
            </form>
          )}
        </div>

      </div>
    </div>
  );
}
