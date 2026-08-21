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
    location: "ঢাকা",
    address: "",
    categories: "তাজা শাকসবজি ও ফলমূল",
    tagline: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
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
          তাতকা বাজার ভেন্ডর পার্টনার আবেদন
        </h1>
        <p style={{ color: "rgba(255, 255, 255, 0.9)", fontSize: "0.92rem", maxWidth: "560px", margin: "0 auto" }}>
          আপনার তাজা মাছ, শাকসবজি ও খাঁটি পণ্যের দোকান তাতকা বাজারে যুক্ত করুন এবং প্রতিদিনের হাজারো গ্রাহকের কাছে পৌঁছে দিন।
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
            আপনার ভেন্ডর আবেদনটি সফলভাবে জমা হয়েছে!
          </h2>
          <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", marginBottom: "20px", maxWidth: "500px", margin: "0 auto 24px" }}>
            আমাদের ভেন্ডর রিলেশন টিম আপনার ট্রেড লাইসেন্স ও NID তথ্য যাচাই করে আগামী ২৪ ঘণ্টার মধ্যে অনুমোদন প্রদান করবে। অনুমোদন সম্পন্ন হলে আপনি ড্যাশবোর্ডে লগইন করতে পারবেন।
          </p>
          <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
            <Link href="/" className="vendor-btn vendor-btn-primary" style={{ padding: "10px 20px" }}>
              ড্যাশবোর্ডে যান (Review Demo)
            </Link>
            <a href="http://localhost:3000" className="vendor-btn vendor-btn-secondary" style={{ padding: "10px 20px" }}>
              স্টোরফ্রন্টে ফিরে যান
            </a>
          </div>
        </div>
      ) : (
        <div className="vendor-card" style={{ padding: "30px" }}>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
            <h2 style={{ fontSize: "1.15rem", fontWeight: 800, borderBottom: "1px solid var(--border-subtle)", paddingBottom: "10px" }}>
              ১. দোকানের প্রাথমিক তথ্য (Shop Details)
            </h2>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div>
                <label style={{ fontSize: "0.8rem", fontWeight: 700, display: "block", marginBottom: "4px" }}>দোকানের নাম (বাংলা) *</label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: পদ্মা ফিশ হাউজ"
                  value={formData.shopNameBn}
                  onChange={(e) => setFormData({ ...formData, shopNameBn: e.target.value })}
                  style={{ width: "100%", padding: "9px 12px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-medium)" }}
                />
              </div>
              <div>
                <label style={{ fontSize: "0.8rem", fontWeight: 700, display: "block", marginBottom: "4px" }}>Shop Name (English) *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Padma Fish House"
                  value={formData.shopNameEn}
                  onChange={(e) => setFormData({ ...formData, shopNameEn: e.target.value })}
                  style={{ width: "100%", padding: "9px 12px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-medium)" }}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: "0.8rem", fontWeight: 700, display: "block", marginBottom: "4px" }}>পণ্যের প্রধান ক্যাটাগরি *</label>
              <select
                value={formData.categories}
                onChange={(e) => setFormData({ ...formData, categories: e.target.value })}
                style={{ width: "100%", padding: "9px 12px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-medium)", background: "#FFF" }}
              >
                <option value="তাজা মাছ ও মাংস">তাজা মাছ ও মাংস (River Fish & Meat)</option>
                <option value="তাজা শাকসবজি ও ফলমূল">তাজা শাকসবজি ও ফলমূল (Organic Vegetables & Fruits)</option>
                <option value="খাঁটি তেল, ঘি ও দুগ্ধজাত">খাঁটি তেল, ঘি ও দুগ্ধজাত (Ghee & Dairy)</option>
                <option value="চাল ও খাদ্যশস্য">চাল ও খাদ্যশস্য (Rice & Grains)</option>
              </select>
            </div>

            <h2 style={{ fontSize: "1.15rem", fontWeight: 800, borderBottom: "1px solid var(--border-subtle)", paddingBottom: "10px", marginTop: "10px" }}>
              ২. মালিকের পরিচিতি ও ভেরিফিকেশন (Owner & Legal)
            </h2>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div>
                <label style={{ fontSize: "0.8rem", fontWeight: 700, display: "block", marginBottom: "4px" }}>মালিকের নাম *</label>
                <input
                  type="text"
                  required
                  placeholder="পূর্ণ নাম"
                  value={formData.ownerName}
                  onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                  style={{ width: "100%", padding: "9px 12px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-medium)" }}
                />
              </div>
              <div>
                <label style={{ fontSize: "0.8rem", fontWeight: 700, display: "block", marginBottom: "4px" }}>মোবাইল নম্বর *</label>
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
                <label style={{ fontSize: "0.8rem", fontWeight: 700, display: "block", marginBottom: "4px" }}>জাতীয় পরিচয়পত্র (NID) নম্বর *</label>
                <input
                  type="text"
                  required
                  placeholder="NID নম্বর"
                  value={formData.nid}
                  onChange={(e) => setFormData({ ...formData, nid: e.target.value })}
                  style={{ width: "100%", padding: "9px 12px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-medium)" }}
                />
              </div>
              <div>
                <label style={{ fontSize: "0.8rem", fontWeight: 700, display: "block", marginBottom: "4px" }}>ট্রেড লাইসেন্স নম্বর *</label>
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
              <label style={{ fontSize: "0.8rem", fontWeight: 700, display: "block", marginBottom: "4px" }}>দোকানের সম্পূর্ণ ঠিকানা *</label>
              <textarea
                rows={2}
                required
                placeholder="বাজারের নাম, রোড নম্বর ও জেলা..."
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                style={{ width: "100%", padding: "9px 12px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-medium)" }}
              />
            </div>

            <button type="submit" className="vendor-btn vendor-btn-primary" style={{ width: "100%", padding: "14px", fontSize: "1rem", marginTop: "10px" }}>
              <span>ভেন্ডর আবেদন জমা দিন</span>
              <ArrowRight size={18} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
