"use client";

import React, { useState } from "react";
import { useVendorStore } from "@/store/vendorStore";
import { translations } from "@/utils/translations";

const STEPS = ["দোকান ও ব্যক্তিগত তথ্য", "ঠিকানা ও ডেলিভারি হাব", "পরিচয়পত্র ও লাইসেন্স"];

export default function VendorProfilePage() {
  const { language, profile, updateProfile, fullResetVendorStore } = useVendorStore();
  const t = translations[language];

  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Form states initialized with existing vendor profile
  const [form, setForm] = useState({
    storeName: profile.storeName || "",
    storeNameBn: profile.storeNameBn || "",
    ownerName: profile.ownerName || "",
    fatherName: profile.fatherName || "মোঃ রফিকুল হক",
    motherName: profile.motherName || "বেগম রোকেয়া সুলতানা",
    dateOfBirth: profile.dateOfBirth || "1988-06-15",
    phone: profile.phone || "",
    email: profile.email || "",
    address: profile.address || "",
    permanentAddress: profile.permanentAddress || "গ্রাম: শান্তিনগর, ডাকঘর: ধানমন্ডি, ঢাকা ১২০৯",
    nidNumber: profile.nidNumber || "1988269123849102",
    tradeLicense: profile.tradeLicense || "TRAD/DSCC/019283/2024",
    tinBin: profile.tinBin || "TIN-893019284102 / BIN-002910381",
    payoutMethod: profile.payoutMethod || "BKASH",
    payoutAccount: profile.payoutAccount || "+8801711223344 (Merchant)",
    openTime: profile.operatingHours?.open || "07:00",
    closeTime: profile.operatingHours?.close || "22:00",
    vacationMode: profile.vacationMode || false,
    nidFrontUrl: profile.nidFrontUrl || "https://images.unsplash.com/photo-1544717305-2782549b5136?w=400",
    nidBackUrl: profile.nidBackUrl || "https://images.unsplash.com/photo-1544717305-2782549b5136?w=400",
    photoUrl: profile.logoUrl || "https://images.unsplash.com/photo-1542838132-92c53300491e?w=150",
  });

  const inp = (field: string) => (val: any) => {
    setForm((f) => ({ ...f, [field]: val }));
  };

  const submitProfile = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      updateProfile({
        storeName: form.storeName,
        storeNameBn: form.storeNameBn,
        ownerName: form.ownerName,
        fatherName: form.fatherName,
        motherName: form.motherName,
        dateOfBirth: form.dateOfBirth,
        phone: form.phone,
        email: form.email,
        address: form.address,
        permanentAddress: form.permanentAddress,
        nidNumber: form.nidNumber,
        tradeLicense: form.tradeLicense,
        tinBin: form.tinBin,
        payoutMethod: form.payoutMethod as any,
        payoutAccount: form.payoutAccount,
        operatingHours: { open: form.openTime, close: form.closeTime },
        vacationMode: form.vacationMode,
        nidFrontUrl: form.nidFrontUrl,
        nidBackUrl: form.nidBackUrl,
        logoUrl: form.photoUrl,
        kycStatus: "APPROVED",
      });
      setSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 4000);
    }, 400);
  };

  const displayName = profile.storeNameBn || profile.storeName || "তাতকা মার্চেন্ট";
  const initials = displayName
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  const perf = {
    tier: "GOLD",
    tierTitleBn: "গোল্ড ভেন্ডর (Gold Merchant)",
    tierBadgeEmoji: "🥇",
    tierPerkBn: "টপ ক্যাটালগ প্রায়োরিটি + তাতকা এক্সপ্রেস ডিসপ্যাচ ও ১০% ফ্ল্যাট প্ল্যাটফর্ম কমিশন",
    totalDeliveries: 1420,
    rating: profile.rating || 4.9,
    totalRatings: 128,
    onTimeRate: 99.2,
    acceptanceRate: 99.8,
    starsBreakdown: {
      star5: 92,
      star4: 24,
      star3: 8,
      star2: 3,
      star1: 1,
    },
  };

  const handleResetVendorPanel = () => {
    if (confirm("আপনি কি নিশ্চিতভাবে ভেন্ডর প্যানেলের সকল ডেমো ডাটা ও সেটিংস রিসেট করতে চান?")) {
      fullResetVendorStore();
      window.location.reload();
    }
  };

  return (
    <div className="page-content select-none">
      {/* ─── Profile Hero (Rider Portal Design) ─── */}
      <div className="profile-hero">
        <div className="profile-avatar">{initials || "🏪"}</div>
        <div className="profile-name bn">{displayName}</div>
        <div className="profile-meta">
          {profile.phone} • {profile.category || "তাজা শাকসবজি ও মুদি পণ্য"}
        </div>
        <div style={{ display: "flex", gap: "8px", alignItems: "center", justifyContent: "center", marginTop: 10, flexWrap: "wrap" }}>
          <div className="kyc-status-badge approved">
            যাচাই সম্পন্ন ✓
          </div>
          <div className="tier-badge tier-gold">
            <span>{perf.tierBadgeEmoji}</span>
            <span>{perf.tierTitleBn}</span>
          </div>
        </div>
      </div>

      {/* ─── Ratings & Performance Scorecard ─── */}
      <div id="performance" className="perf-dashboard-card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 10, borderBottom: "1px solid var(--border-1)", paddingBottom: 14 }}>
          <div>
            <div style={{ fontSize: ".72rem", color: "var(--text-3)", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".06em" }}>
              মার্চেন্ট পারফরম্যান্স ও রেটিং স্কোরকার্ড
            </div>
            <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--text-1)", marginTop: 2 }}>
              {perf.tierBadgeEmoji} {perf.tierTitleBn}
            </div>
          </div>
          <div className="tier-badge tier-gold">
            <span>{perf.tierBadgeEmoji}</span>
            <span>গোল্ড মার্চেন্ট</span>
          </div>
        </div>

        {/* Tier Perks Note */}
        <div style={{
          marginTop: 12, padding: "10px 12px", borderRadius: "var(--r-md)",
          background: "linear-gradient(135deg, rgba(0,214,143,.08) 0%, rgba(16,185,129,.08) 100%)",
          border: "1px solid rgba(0,214,143,.25)",
          fontSize: ".74rem", color: "#00D68F", fontFamily: "var(--font-bn)",
          display: "flex", alignItems: "center", gap: 8
        }}>
          <span style={{ fontSize: "1.2rem" }}>🎁</span>
          <span><strong>টিয়ার সুবিধা:</strong> {perf.tierPerkBn}</span>
        </div>

        {/* 4-Box Core Metrics Grid */}
        <div className="perf-metric-grid">
          <div className="perf-metric-item">
            <div className="perf-metric-val" style={{ color: "#fbbf24", display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
              <span>⭐</span> {perf.rating.toFixed(1)}
            </div>
            <div className="perf-metric-lbl">গড় রেটিং ({perf.totalRatings} রিভিউ)</div>
          </div>
          <div className="perf-metric-item">
            <div className="perf-metric-val" style={{ color: "#10b981" }}>
              {perf.onTimeRate}%
            </div>
            <div className="perf-metric-lbl">অন-টাইম প্যাকেজিং</div>
          </div>
          <div className="perf-metric-item">
            <div className="perf-metric-val" style={{ color: "#38bdf8" }}>
              {perf.acceptanceRate}%
            </div>
            <div className="perf-metric-lbl">ফুলফিলমেন্ট রেট</div>
          </div>
          <div className="perf-metric-item">
            <div className="perf-metric-val" style={{ color: "#a855f7" }}>
              {perf.totalDeliveries} টি
            </div>
            <div className="perf-metric-lbl">মোট সফল ডেলিভারি</div>
          </div>
        </div>

        {/* Star Rating Breakdown Bars */}
        <div style={{ background: "var(--bg-base)", padding: "14px", borderRadius: "var(--r-md)", border: "1px solid var(--border-1)", marginTop: 12 }}>
          <div style={{ fontSize: ".76rem", fontWeight: 700, color: "var(--text-2)", marginBottom: 10 }}>
            ⭐ স্টার রেটিং অনুপাত
          </div>
          {[
            { label: "৫ স্টার", count: perf.starsBreakdown.star5, pct: (perf.starsBreakdown.star5 / perf.totalRatings) * 100 },
            { label: "৪ স্টার", count: perf.starsBreakdown.star4, pct: (perf.starsBreakdown.star4 / perf.totalRatings) * 100 },
            { label: "৩ স্টার", count: perf.starsBreakdown.star3, pct: (perf.starsBreakdown.star3 / perf.totalRatings) * 100 },
            { label: "২ স্টার", count: perf.starsBreakdown.star2, pct: (perf.starsBreakdown.star2 / perf.totalRatings) * 100 },
            { label: "১ স্টার", count: perf.starsBreakdown.star1, pct: (perf.starsBreakdown.star1 / perf.totalRatings) * 100 },
          ].map((bar) => (
            <div key={bar.label} className="star-bar-row">
              <span style={{ width: 44, flexShrink: 0 }}>{bar.label}</span>
              <div className="star-bar-track">
                <div className="star-bar-fill" style={{ width: `${Math.round(bar.pct)}%` }} />
              </div>
              <span style={{ width: 28, textAlign: "right", color: "var(--text-3)", fontSize: ".68rem" }}>{bar.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ─── Profile & Store KYC Information Wizard ─── */}
      {saved ? (
        <div style={{ background: "var(--emerald-glass)", border: "1px solid rgba(0,214,143,.3)", borderRadius: "var(--r-md)", padding: "16px", textAlign: "center", color: "var(--emerald)", fontFamily: "var(--font-bn)", fontWeight: 700 }}>
          ✅ স্টোর ও প্রোফাইল তথ্য সফলভাবে সংরক্ষিত হয়েছে!
        </div>
      ) : (
        <>
          <div className="kyc-steps">
            {STEPS.map((s, i) => (
              <div key={s} className="kyc-step">
                <div className={`kyc-step-dot ${i < step ? "done" : i === step ? "active" : ""}`}>
                  {i < step ? "✓" : i + 1}
                </div>
                {i < STEPS.length - 1 && <div className={`kyc-step-line${i < step ? " done" : ""}`} />}
              </div>
            ))}
          </div>
          <div style={{ fontSize: ".80rem", color: "var(--text-3)", fontFamily: "var(--font-bn)", textAlign: "center", marginBottom: 6 }}>
            {STEPS[step]}
          </div>

          {step === 0 && (
            <div className="form-section">
              <div className="form-section-title">👤 দোকান ও ব্যক্তিগত তথ্য</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="form-group">
                  <div className="form-label">দোকানের নাম (বাংলা) *</div>
                  <input
                    id="storeNameBn"
                    className="form-input font-bn"
                    value={form.storeNameBn}
                    onChange={(e) => inp("storeNameBn")(e.target.value)}
                    placeholder="যেমন: সবুজ খামার গ্রোসারি"
                  />
                </div>
                <div className="form-group">
                  <div className="form-label">দোকানের নাম (English) *</div>
                  <input
                    id="storeName"
                    className="form-input"
                    value={form.storeName}
                    onChange={(e) => inp("storeName")(e.target.value)}
                    placeholder="যেমন: Green Farm Groceries"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="form-group">
                  <div className="form-label">মালিকের নাম *</div>
                  <input
                    id="ownerName"
                    className="form-input"
                    value={form.ownerName}
                    onChange={(e) => inp("ownerName")(e.target.value)}
                    placeholder="মালিকের পুরো নাম"
                  />
                </div>
                <div className="form-group">
                  <div className="form-label">পিতার নাম</div>
                  <input
                    id="fatherName"
                    className="form-input font-bn"
                    value={form.fatherName}
                    onChange={(e) => inp("fatherName")(e.target.value)}
                    placeholder="পিতার নাম লিখুন"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="form-group">
                  <div className="form-label">মোবাইল নম্বর *</div>
                  <input
                    id="phone"
                    className="form-input font-mono"
                    value={form.phone}
                    onChange={(e) => inp("phone")(e.target.value)}
                    placeholder="+880 1700 000000"
                  />
                </div>
                <div className="form-group">
                  <div className="form-label">ইমেইল ঠিকানা *</div>
                  <input
                    id="email"
                    type="email"
                    className="form-input"
                    value={form.email}
                    onChange={(e) => inp("email")(e.target.value)}
                    placeholder="example@tatkabazar.com"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="form-section">
              <div className="form-section-title">🏠 ঠিকানা, হাব ও সময়সূচী</div>
              <div className="form-group">
                <div className="form-label">দোকানের বর্তমান ঠিকানা *</div>
                <textarea
                  id="address"
                  className="form-input font-bn"
                  rows={2}
                  value={form.address}
                  onChange={(e) => inp("address")(e.target.value)}
                  placeholder="দোকানের বিস্তারিত ঠিকানা দিন"
                />
              </div>

              <div className="form-group">
                <div className="form-label">স্থায়ী ঠিকানা</div>
                <textarea
                  id="permanentAddress"
                  className="form-input font-bn"
                  rows={2}
                  value={form.permanentAddress}
                  onChange={(e) => inp("permanentAddress")(e.target.value)}
                  placeholder="স্থায়ী ঠিকানা লিখুন"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="form-group">
                  <div className="form-label">দোকান খোলার সময়</div>
                  <input
                    id="openTime"
                    type="time"
                    className="form-input font-mono"
                    value={form.openTime}
                    onChange={(e) => inp("openTime")(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <div className="form-label">দোকান বন্ধের সময়</div>
                  <input
                    id="closeTime"
                    type="time"
                    className="form-input font-mono"
                    value={form.closeTime}
                    onChange={(e) => inp("closeTime")(e.target.value)}
                  />
                </div>
              </div>

              {/* Vacation Mode toggle */}
              <div style={{
                background: "var(--bg-raised)",
                border: "1px solid var(--border-2)",
                borderRadius: "var(--r-md)",
                padding: "14px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
              }}>
                <div>
                  <div style={{ fontSize: ".82rem", fontWeight: 700, color: form.vacationMode ? "#fbbf24" : "var(--text-1)", display: "flex", alignItems: "center", gap: 6 }}>
                    <span>🌴</span>
                    <span>ছুটির মোড (Vacation Mode)</span>
                  </div>
                  <div style={{ fontSize: ".70rem", color: "var(--text-3)", marginTop: 2 }}>
                    সক্রিয় থাকলে অ্যাপ ক্যাটালগে আপনার দোকান সাময়িকভাবে বন্ধ দেখাবে।
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={form.vacationMode}
                  onChange={(e) => inp("vacationMode")(e.target.checked)}
                  style={{ width: 20, height: 20, accentColor: "var(--orange)", cursor: "pointer" }}
                />
              </div>

              {/* Covered Hubs */}
              <div className="form-group">
                <div className="form-label">কাভার্ড ডেলিভারি জোন ও হাবসমূহ</div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 4 }}>
                  {profile.deliveryZones.map((zone) => (
                    <span key={zone} style={{
                      padding: "4px 10px",
                      background: "rgba(0,214,143,0.12)",
                      border: "1px solid rgba(0,214,143,0.3)",
                      borderRadius: "var(--r-full)",
                      fontSize: ".72rem",
                      color: "#00D68F",
                      fontWeight: 600,
                    }}>
                      📍 {zone}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="form-section">
              <div className="form-section-title">🪪 জাতীয় পরিচয়পত্র ও ট্রেড লাইসেন্স</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="form-group">
                  <div className="form-label">NID নম্বর *</div>
                  <input
                    id="nidNumber"
                    className="form-input font-mono"
                    value={form.nidNumber}
                    onChange={(e) => inp("nidNumber")(e.target.value)}
                    placeholder="১৩ বা ১৭ ডিজিটের জাতীয় পরিচয়পত্র নম্বর"
                  />
                </div>
                <div className="form-group">
                  <div className="form-label">ট্রেড লাইসেন্স নম্বর *</div>
                  <input
                    id="tradeLicense"
                    className="form-input font-mono"
                    value={form.tradeLicense}
                    onChange={(e) => inp("tradeLicense")(e.target.value)}
                    placeholder="TRAD/DSCC/019283/2024"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="form-group">
                  <div className="form-label">TIN / BIN নম্বর</div>
                  <input
                    id="tinBin"
                    className="form-input font-mono"
                    value={form.tinBin}
                    onChange={(e) => inp("tinBin")(e.target.value)}
                    placeholder="TIN-893019284102 / BIN-002910381"
                  />
                </div>
                <div className="form-group">
                  <div className="form-label">পে-আউট অ্যাকাউন্ট (বিকাশ/নগদ/ব্যাংক) *</div>
                  <input
                    id="payoutAccount"
                    className="form-input font-mono"
                    value={form.payoutAccount}
                    onChange={(e) => inp("payoutAccount")(e.target.value)}
                    placeholder="+8801711223344 (Merchant)"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="form-group">
                  <div className="form-label">NID সামনের ছবি (URL)</div>
                  <input
                    id="nidFrontUrl"
                    className="form-input"
                    value={form.nidFrontUrl}
                    onChange={(e) => inp("nidFrontUrl")(e.target.value)}
                    placeholder="ছবির লিংক দিন"
                  />
                </div>
                <div className="form-group">
                  <div className="form-label">দোকানের ছবি / লোগো (URL)</div>
                  <input
                    id="photoUrl"
                    className="form-input"
                    value={form.photoUrl}
                    onChange={(e) => inp("photoUrl")(e.target.value)}
                    placeholder="দোকান বা প্রোডাক্টের ছবি লিংক"
                  />
                </div>
              </div>

              <div className="info-box">
                <svg fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                <div className="info-box-text">
                  ভেন্ডর মার্চেন্ট হিসেবে আপনার অ্যাকাউন্ট যাচাইকৃত। তথ্য পরিবর্তন করলে কন্ট্রোল রুমে যাচাইয়ের জন্য জমা থাকবে।
                </div>
              </div>
            </div>
          )}

          <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
            {step > 0 && (
              <button id="profile-back" className="btn-secondary" onClick={() => setStep((s) => s - 1)}>
                ← পূর্ববর্তী
              </button>
            )}
            {step < STEPS.length - 1 ? (
              <button id="profile-next" className="btn-primary" onClick={() => setStep((s) => s + 1)}>
                পরবর্তী →
              </button>
            ) : (
              <button id="profile-submit" className="btn-primary" onClick={() => submitProfile()} disabled={saving}>
                {saving ? "সংরক্ষণ হচ্ছে..." : "✅ তথ্য সংরক্ষণ করুন"}
              </button>
            )}
          </div>
        </>
      )}

      {/* ─── Panel Reset ─── */}
      <div style={{ marginTop: 20, padding: "18px 16px", background: "rgba(239,68,68,.08)", border: "1px dashed rgba(239,68,68,.3)", borderRadius: "var(--r-lg)", textAlign: "center" }}>
        <div style={{ fontSize: ".88rem", fontWeight: 700, color: "#ef4444", fontFamily: "var(--font-bn)" }}>
          🔄 ভেন্ডর প্যানেল ডাটা রিসেট
        </div>
        <div style={{ fontSize: ".76rem", color: "var(--text-3)", fontFamily: "var(--font-bn)", marginTop: 4, marginBottom: 12 }}>
          সকল ডেমো অর্ডার, হিস্ট্রি ও স্টোর ডাটা প্রাথমিক ডিফল্ট অবস্থায় রিসেট করতে চান?
        </div>
        <button
          id="btn-reset-vendor-panel"
          type="button"
          onClick={handleResetVendorPanel}
          style={{
            padding: "9px 20px",
            background: "#ef4444",
            color: "#fff",
            border: "none",
            borderRadius: "var(--r-md)",
            fontSize: ".82rem",
            fontWeight: 700,
            fontFamily: "var(--font-bn)",
            cursor: "pointer",
            boxShadow: "0 4px 14px rgba(239,68,68,.35)",
          }}
        >
          প্যানেল সম্পূর্ণ রিসেট করুন
        </button>
      </div>
    </div>
  );
}
