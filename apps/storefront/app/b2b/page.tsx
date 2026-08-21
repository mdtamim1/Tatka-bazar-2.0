"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Store, ShieldCheck, CheckCircle2, Truck, FileText, ArrowRight, Building2 } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function B2BPage() {
  const { locale, t } = useLanguage();
  const [submitted, setSubmitted] = useState(false);
  const [b2bForm, setB2bForm] = useState({
    companyName: "",
    tradeLicense: "",
    contactPerson: "",
    phone: "",
    email: "",
    categoryNeeded: "চাল ও খাদ্যশস্য (Rice & Grains)",
    monthlyVolume: "৫০০ কেজি - ১০০০ কেজি",
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
            {locale === "bn"
              ? "পাইকারি সাপ্লাই ও প্রাতিষ্ঠানিক চুক্তি"
              : "Wholesale & Institutional Bulk Supply"}
          </h1>
          <p style={{ color: "rgba(255, 255, 255, 0.85)", fontSize: "1rem", maxWidth: "640px", margin: "0 auto" }}>
            {locale === "bn"
              ? "রেস্তোরাঁ, সুপারশপ, হোটেল, ক্যাটারিং ও করপোরেট অফিসের জন্য সরাসরি মিল ও নদী থেকে পাইকারি মূল্যে বাল্ক সাপ্লাই।"
              : "Direct mill-rate supply of fresh fish, meat, premium rice and organic vegetables for restaurants, hotels and corporate pantries."}
          </p>
        </div>

        {/* 3 Pillars for B2B */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "20px", marginBottom: "40px" }}>
          <div style={{ background: "var(--bg-surface)", padding: "20px", borderRadius: "var(--radius-lg)", border: "1px solid var(--border-subtle)", textAlign: "center" }}>
            <div style={{ fontSize: "2rem", marginBottom: "8px" }}>💰</div>
            <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "4px" }}>সর্বনিম্ন পাইকারি মূল্য</h3>
            <p style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>সরাসরি কৃষক ও মিল থেকে মধ্যস্বত্বভোগী ছাড়া সর্বোচ্চ সাশ্রয়।</p>
          </div>

          <div style={{ background: "var(--bg-surface)", padding: "20px", borderRadius: "var(--radius-lg)", border: "1px solid var(--border-subtle)", textAlign: "center" }}>
            <div style={{ fontSize: "2rem", marginBottom: "8px" }}>⏰</div>
            <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "4px" }}>নির্ধারিত ভোর ডেলিভারি</h3>
            <p style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>আপনার রান্নাঘরের জন্য প্রতিদিন ভোর ৬:০০ - ৭:৩০ এর মধ্যে ডেলিভারি।</p>
          </div>

          <div style={{ background: "var(--bg-surface)", padding: "20px", borderRadius: "var(--radius-lg)", border: "1px solid var(--border-subtle)", textAlign: "center" }}>
            <div style={{ fontSize: "2rem", marginBottom: "8px" }}>📋</div>
            <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "4px" }}>ইনভয়েস ও ক্রেডিট সুবিধা</h3>
            <p style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>ভ্যাট চালান, মাসিক বিলিং ও অনুমোদিত ব্যবসার জন্য ক্রেডিট লাইন।</p>
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
                আপনার B2B আবেদন সফলভাবে জমা হয়েছে!
              </h2>
              <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", marginBottom: "20px" }}>
                আমাদের B2B করপোরেট রিলেশনস ম্যানেজার আগামী ২ ঘণ্টার মধ্যে আপনার সাথে যোগাযোগ করবেন।
              </p>
              <Link href="/" className="btn-primary">
                হোমপেজে ফিরে যান
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <h2 style={{ fontSize: "1.3rem", fontWeight: 800, marginBottom: "20px", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "10px" }}>
                🏢 পাইকারি কোটেশন ও করপোরেট অ্যাকাউন্ট ফর্ম
              </h2>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
                <div>
                  <label style={{ fontSize: "0.85rem", fontWeight: 700, display: "block", marginBottom: "6px" }}>প্রতিষ্ঠানের নাম (Company / Restaurant Name) *</label>
                  <input
                    type="text"
                    required
                    placeholder="যেমন: গ্রিন গার্ডেন রেস্তোরাঁ"
                    value={b2bForm.companyName}
                    onChange={(e) => setB2bForm({ ...b2bForm, companyName: e.target.value })}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-medium)", outline: "none" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "0.85rem", fontWeight: 700, display: "block", marginBottom: "6px" }}>ট্রেড লাইসেন্স নম্বর (Trade License No) *</label>
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
                  <label style={{ fontSize: "0.85rem", fontWeight: 700, display: "block", marginBottom: "6px" }}>যোগাযোগকারী ব্যক্তির নাম (Contact Person) *</label>
                  <input
                    type="text"
                    required
                    placeholder="নাম ও পদবি"
                    value={b2bForm.contactPerson}
                    onChange={(e) => setB2bForm({ ...b2bForm, contactPerson: e.target.value })}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-medium)", outline: "none" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "0.85rem", fontWeight: 700, display: "block", marginBottom: "6px" }}>মোবাইল নম্বর (Phone Number) *</label>
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
                  <label style={{ fontSize: "0.85rem", fontWeight: 700, display: "block", marginBottom: "6px" }}>প্রয়োজনীয় পণ্যের বিভাগ</label>
                  <select
                    value={b2bForm.categoryNeeded}
                    onChange={(e) => setB2bForm({ ...b2bForm, categoryNeeded: e.target.value })}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-medium)", background: "var(--bg-surface)", outline: "none" }}
                  >
                    <option value="চাল ও খাদ্যশস্য">চাল ও খাদ্যশস্য (Rice & Grains)</option>
                    <option value="তাজা মাছ ও মাংস">তাজা মাছ ও মাংস (Fish & Meat)</option>
                    <option value="শাকসবজি ও সালাদ">শাকসবজি ও সালাদ (Fresh Vegetables)</option>
                    <option value="খাঁটি তেল ও মসলা">খাঁটি তেল ও মসলা (Oils & Spices)</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: "0.85rem", fontWeight: 700, display: "block", marginBottom: "6px" }}>আনুমানিক মাসিক চাহিদা (Estimated Monthly Volume)</label>
                  <select
                    value={b2bForm.monthlyVolume}
                    onChange={(e) => setB2bForm({ ...b2bForm, monthlyVolume: e.target.value })}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-medium)", background: "var(--bg-surface)", outline: "none" }}
                  >
                    <option value="১০০ কেজি - ৫০০ কেজি">১০০ কেজি - ৫০০ কেজি</option>
                    <option value="৫০০ কেজি - ১০০০ কেজি">৫০০ কেজি - ১০০০ কেজি</option>
                    <option value="১ টন - ৫ টন">১ টন - ৫ টন</option>
                    <option value="৫ টন+ (মেগা সাপ্লাই)">৫ টন+ (মেগা সাপ্লাই)</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: "24px" }}>
                <label style={{ fontSize: "0.85rem", fontWeight: 700, display: "block", marginBottom: "6px" }}>বিশেষ চাহিদা বা বিবরণ (Notes / Special Requests)</label>
                <textarea
                  rows={3}
                  placeholder="নির্দিষ্ট কোনো জাতের চাল বা কাটিং সাইজ থাকলে উল্লেখ করুন..."
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
                <span>কোটেশন রিকুয়েস্ট জমা দিন</span>
                <ArrowRight size={18} />
              </button>
            </form>
          )}
        </div>

      </div>
    </div>
  );
}

