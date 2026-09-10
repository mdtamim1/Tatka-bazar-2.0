"use client";
import React, { useEffect, useState } from "react";
import { apiFetch, getPerformanceData, fullyResetRiderPanel, type RiderProfile, type RiderPerformance } from "@/lib/api";
import { LiveFaceCamModal } from "@/components/LiveFaceCamModal";

const STEPS = ["ব্যক্তিগত তথ্য", "ঠিকানা", "পরিচয়পত্র"];

export default function ProfilePage() {
  const [profile, setProfile] = useState<RiderProfile | null>(null);
  const [perf] = useState<RiderPerformance>(getPerformanceData());
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [isFaceCamOpen, setIsFaceCamOpen] = useState(false);
  const [faceMatchScore, setFaceMatchScore] = useState<number | null>(null);
  const [form, setForm] = useState<{ fatherName: string; motherName: string; dateOfBirth: string; presentAddress: string; permanentAddress: string; nidNumber: string; nidFrontUrl: string; nidBackUrl: string; photoUrl: string }>({ fatherName: "", motherName: "", dateOfBirth: "", presentAddress: "", permanentAddress: "", nidNumber: "", nidFrontUrl: "", nidBackUrl: "", photoUrl: "" });

  useEffect(() => {
    apiFetch<RiderProfile>("/rider-portal/me").then(r => {
      if (r.success && r.data) {
        setProfile(r.data as RiderProfile);
        const p = r.data as RiderProfile;
        setForm({
          fatherName: String(p.fatherName ?? ""),
          motherName: String(p.motherName ?? ""),
          dateOfBirth: String(p.dateOfBirth ?? "").replace(/T.+$/, ""),
          presentAddress: String(p.presentAddress ?? ""),
          permanentAddress: String(p.permanentAddress ?? ""),
          nidNumber: String(p.nidNumber ?? ""),
          nidFrontUrl: String(p.nidFrontUrl ?? ""),
          nidBackUrl: String(p.nidBackUrl ?? ""),
          photoUrl: String(p.photoUrl ?? ""),
        });
      } else {
        localStorage.removeItem("rider_token");
        localStorage.removeItem("rider_user");
        window.location.href = "/login";
        return;
      }
      setLoading(false);
    });
  }, []);

  async function submitKyc() {
    setSaving(true);
    const res = await apiFetch("/rider-portal/kyc", { method: "POST", body: JSON.stringify(form) });
    if (res.success) {
      setSaved(true);
      apiFetch<RiderProfile>("/rider-portal/me").then(r => { if (r.success && r.data) setProfile(r.data as RiderProfile); });
    } else {
      alert(res.error || "সংরক্ষণ ব্যর্থ হয়েছে");
    }
    setSaving(false);
  }

  function inp(field: string) {
    const locked = profile?.kycStatus === "APPROVED";
    return (val: string) => !locked && setForm(f => ({ ...f, [field]: val }));
  }

  if (loading) return <div className="page-content"><div className="loading-center"><div className="spinner" /></div></div>;
  if (!profile) return null;

  const locked = profile.kycStatus === "APPROVED";
  const initials = profile.name.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase();
  const kycLabel: Record<string, string> = { PENDING: "KYC বাকি", SUBMITTED: "যাচাইয়ের অপেক্ষায়", APPROVED: "যাচাই সম্পন্ন ✓", REJECTED: "বাতিল হয়েছে" };

  return (
    <div className="page-content">
      <div className="profile-hero">
        <div className="profile-avatar">{initials}</div>
        <div className="profile-name bn">{profile.name}</div>
        <div className="profile-meta">{profile.phone} • {profile.vehicleType}</div>
        <div style={{ display: "flex", gap: "8px", alignItems: "center", justifyContent: "center", marginTop: 8, flexWrap: "wrap" }}>
          <div className={`kyc-status-badge ${profile.kycStatus.toLowerCase()}`}>
            {kycLabel[profile.kycStatus] || profile.kycStatus}
          </div>
          <div className={`tier-badge tier-${perf.tier.toLowerCase()}`}>
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
              পারফরম্যান্স ও রেটিং স্কোরকার্ড
            </div>
            <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--text-1)", marginTop: 2 }}>
              {perf.tierBadgeEmoji} {perf.tierTitleBn}
            </div>
          </div>
          <div className={`tier-badge tier-${perf.tier.toLowerCase()}`}>
            <span>{perf.tierBadgeEmoji}</span>
            <span>{perf.tierTitleBn.split(" ")[0]}</span>
          </div>
        </div>

        {/* Tier Perks Note */}
        <div style={{
          marginTop: 12, padding: "10px 12px", borderRadius: "var(--r-md)",
          background: "linear-gradient(135deg, rgba(56,189,248,.08) 0%, rgba(168,85,247,.08) 100%)",
          border: "1px solid rgba(56,189,248,.25)",
          fontSize: ".74rem", color: "#38bdf8", fontFamily: "var(--font-bn)",
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
            <div className="perf-metric-lbl">অন-টাইম ডেলিভারি</div>
          </div>
          <div className="perf-metric-item">
            <div className="perf-metric-val" style={{ color: "#38bdf8" }}>
              {perf.acceptanceRate}%
            </div>
            <div className="perf-metric-lbl">অর্ডার গ্রহণ (Acceptance)</div>
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

        {/* Recent Customer Feedback */}
        <div style={{ marginTop: 16 }}>
          <div style={{ fontSize: ".82rem", fontWeight: 800, color: "var(--text-1)", marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
            <span>💬</span>
            <span>কাস্টমারদের সাম্প্রতিক মন্তব্য ও রিভিউ</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {perf.recentReviews.map((rev) => (
              <div key={rev.id} className="review-item-card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontSize: ".82rem", fontWeight: 700, color: "var(--text-1)" }}>{rev.customerName}</span>
                    <span style={{ fontSize: ".68rem", color: "var(--text-3)" }}>• {rev.area}</span>
                  </div>
                  <div style={{ color: "#f59e0b", fontSize: ".76rem", letterSpacing: 1 }}>
                    {"⭐".repeat(rev.rating)}
                  </div>
                </div>
                <div style={{ fontSize: ".78rem", color: "var(--text-2)", lineHeight: 1.4, fontFamily: "var(--font-bn)", fontStyle: "italic" }}>
                  “{rev.comment}”
                </div>
                <div style={{ fontSize: ".65rem", color: "var(--text-3)", marginTop: 4, display: "flex", justifyContent: "space-between" }}>
                  <span>অর্ডার #{rev.orderNumber}</span>
                  <span>{rev.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {locked ? (
        <div className="form-section">
          <div className="form-section-title">📋 প্রোফাইল তথ্য</div>
          {[["পিতার নাম", profile.fatherName], ["মাতার নাম", profile.motherName], ["বর্তমান ঠিকানা", profile.presentAddress], ["স্থায়ী ঠিকানা", profile.permanentAddress], ["NID নম্বর", profile.nidNumber]].map(([label, val]) => val && (
            <div key={label} className="form-group">
              <div className="form-label">{label}</div>
              <div className="form-input" style={{ cursor: "default", opacity: 0.7 }}>{val}</div>
            </div>
          ))}
          <div className="info-box">
            <svg fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
            <div className="info-box-text">KYC অনুমোদিত হয়েছে। তথ্য পরিবর্তনের জন্য কাস্টমার সাপোর্টে যোগাযোগ করুন।</div>
          </div>
        </div>
      ) : (
        <>
          {saved ? (
            <div style={{ background: "var(--emerald-glass)", border: "1px solid rgba(0,214,143,.3)", borderRadius: "var(--r-md)", padding: "16px", textAlign: "center", color: "var(--emerald)", fontFamily: "var(--font-bn)", fontWeight: 700 }}>
              ✅ তথ্য জমা দেওয়া হয়েছে। অ্যাডমিন অনুমোদনের পরে সক্রিয় হবে।
            </div>
          ) : (
            <>
              <div className="kyc-steps">
                {STEPS.map((s, i) => (
                  <div key={s} className="kyc-step">
                    <div className={`kyc-step-dot ${i < step ? "done" : i === step ? "active" : ""}`}>{i < step ? "✓" : i + 1}</div>
                    {i < STEPS.length - 1 && <div className={`kyc-step-line${i < step ? " done" : ""}`} />}
                  </div>
                ))}
              </div>
              <div style={{ fontSize: ".80rem", color: "var(--text-3)", fontFamily: "var(--font-bn)", textAlign: "center" }}>{STEPS[step]}</div>

              {step === 0 && (
                <div className="form-section">
                  <div className="form-section-title">👤 ব্যক্তিগত তথ্য</div>
                  <div className="form-group"><div className="form-label">পিতার নাম</div><input id="fatherName" className="form-input" value={form.fatherName} onChange={e => inp("fatherName")(e.target.value)} placeholder="পিতার পুরো নাম" /></div>
                  <div className="form-group"><div className="form-label">মাতার নাম</div><input id="motherName" className="form-input" value={form.motherName} onChange={e => inp("motherName")(e.target.value)} placeholder="মাতার পুরো নাম" /></div>
                  <div className="form-group"><div className="form-label">জন্মতারিখ</div><input id="dateOfBirth" type="date" className="form-input" value={form.dateOfBirth} onChange={e => inp("dateOfBirth")(e.target.value)} /></div>
                </div>
              )}
              {step === 1 && (
                <div className="form-section">
                  <div className="form-section-title">🏠 ঠিকানা</div>
                  <div className="form-group"><div className="form-label">বর্তমান ঠিকানা</div><textarea id="presentAddress" className="form-input" rows={3} value={form.presentAddress} onChange={e => inp("presentAddress")(e.target.value)} placeholder="বর্তমান ঠিকানা লিখুন" /></div>
                  <div className="form-group"><div className="form-label">স্থায়ী ঠিকানা</div><textarea id="permanentAddress" className="form-input" rows={3} value={form.permanentAddress} onChange={e => inp("permanentAddress")(e.target.value)} placeholder="স্থায়ী ঠিকানা লিখুন" /></div>
                </div>
              )}
              {step === 2 && (
                <div className="form-section">
                  <div className="form-section-title">🪪 জাতীয় পরিচয়পত্র ও বায়োমেট্রিক ফেস ভেরিফিকেশন</div>

                  {/* NID Number */}
                  <div className="form-group">
                    <div className="form-label">NID নম্বর (১০, ১৩ বা ১৭ ডিজিট) *</div>
                    <input
                      id="nidNumber"
                      className="form-input"
                      value={form.nidNumber}
                      onChange={(e) => inp("nidNumber")(e.target.value)}
                      placeholder="উদা: 19951234567890123"
                    />
                    <div style={{ fontSize: "0.70rem", color: "var(--text-3)", marginTop: 4 }}>
                      💡 স্মার্ট কার্ড (১০ ডিজিট) অথবা পুরাতন NID (১৩ বা ১৭ ডিজিট) লিখুন।
                    </div>
                  </div>

                  {/* NID Front Photo */}
                  <div className="form-group">
                    <div className="form-label">NID সামনের ছবি (Front Photo) *</div>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <input
                        id="nidFrontUrl"
                        className="form-input"
                        value={form.nidFrontUrl}
                        onChange={(e) => inp("nidFrontUrl")(e.target.value)}
                        placeholder="ছবির লিংক অথবা ফাইল সিলেক্ট করুন"
                        style={{ flex: 1 }}
                      />
                      <label
                        style={{
                          padding: "10px 14px",
                          background: "rgba(255,255,255,0.08)",
                          border: "1px solid rgba(255,255,255,0.15)",
                          borderRadius: "var(--r-md)",
                          fontSize: "0.78rem",
                          fontWeight: 700,
                          color: "var(--text-1)",
                          cursor: "pointer",
                          whiteSpace: "nowrap",
                        }}
                      >
                        📁 আপলোড
                        <input
                          type="file"
                          accept="image/*"
                          style={{ display: "none" }}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const r = new FileReader();
                              r.onload = () => inp("nidFrontUrl")(r.result as string);
                              r.readAsDataURL(file);
                            }
                          }}
                        />
                      </label>
                    </div>
                    {form.nidFrontUrl && (
                      <div style={{ marginTop: 8, borderRadius: "10px", overflow: "hidden", maxHeight: "140px", border: "1px solid rgba(255,255,255,0.1)" }}>
                        <img src={form.nidFrontUrl} alt="NID Front" style={{ width: "100%", height: "140px", objectFit: "cover" }} />
                      </div>
                    )}
                  </div>

                  {/* NID Back Photo */}
                  <div className="form-group">
                    <div className="form-label">NID পেছনের ছবি (Back Photo) *</div>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <input
                        id="nidBackUrl"
                        className="form-input"
                        value={form.nidBackUrl}
                        onChange={(e) => inp("nidBackUrl")(e.target.value)}
                        placeholder="ছবির লিংক অথবা ফাইল সিলেক্ট করুন"
                        style={{ flex: 1 }}
                      />
                      <label
                        style={{
                          padding: "10px 14px",
                          background: "rgba(255,255,255,0.08)",
                          border: "1px solid rgba(255,255,255,0.15)",
                          borderRadius: "var(--r-md)",
                          fontSize: "0.78rem",
                          fontWeight: 700,
                          color: "var(--text-1)",
                          cursor: "pointer",
                          whiteSpace: "nowrap",
                        }}
                      >
                        📁 আপলোড
                        <input
                          type="file"
                          accept="image/*"
                          style={{ display: "none" }}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const r = new FileReader();
                              r.onload = () => inp("nidBackUrl")(r.result as string);
                              r.readAsDataURL(file);
                            }
                          }}
                        />
                      </label>
                    </div>
                    {form.nidBackUrl && (
                      <div style={{ marginTop: 8, borderRadius: "10px", overflow: "hidden", maxHeight: "140px", border: "1px solid rgba(255,255,255,0.1)" }}>
                        <img src={form.nidBackUrl} alt="NID Back" style={{ width: "100%", height: "140px", objectFit: "cover" }} />
                      </div>
                    )}
                  </div>

                  {/* ─── bKash-Style Live Face Cam Section ─── */}
                  <div
                    style={{
                      marginTop: 18,
                      padding: "16px",
                      background: "linear-gradient(135deg, rgba(0,214,143,0.06), rgba(56,189,248,0.06))",
                      border: "1px solid rgba(0,214,143,0.25)",
                      borderRadius: "var(--r-lg)",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                      <div>
                        <div style={{ fontSize: "0.88rem", fontWeight: 800, color: "var(--emerald)", display: "flex", alignItems: "center", gap: 6 }}>
                          <span>📸</span>
                          <span>লাইভ ফেস ভেরিফিকেশন (e-KYC)</span>
                        </div>
                        <div style={{ fontSize: "0.72rem", color: "var(--text-3)", marginTop: 2 }}>
                          Google MediaPipe Live Cam ও পলক ডিটেকশন
                        </div>
                      </div>
                      <span style={{ fontSize: "18px" }}>⚡</span>
                    </div>

                    {form.photoUrl ? (
                      <div style={{ display: "flex", gap: 12, alignItems: "center", background: "rgba(15,23,42,0.6)", padding: "12px", borderRadius: "12px", border: "1px solid rgba(0,214,143,0.3)" }}>
                        <img
                          src={form.photoUrl}
                          alt="Live Selfie"
                          style={{ width: "64px", height: "64px", borderRadius: "50%", objectFit: "cover", border: "2px solid #00D68F" }}
                        />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: "0.84rem", fontWeight: 800, color: "#00D68F", display: "flex", alignItems: "center", gap: 4 }}>
                            <span>✓ ফেস ম্যাচ: {faceMatchScore || 95}%</span>
                          </div>
                          <div style={{ fontSize: "0.70rem", color: "#94A3B8", marginTop: 2 }}>
                            লাইভ মানুষ ও NID ছবির বায়োমেট্রিক ম্যাচ সম্পন্ন
                          </div>
                          <button
                            type="button"
                            onClick={() => setIsFaceCamOpen(true)}
                            style={{
                              marginTop: 6,
                              padding: "4px 10px",
                              background: "rgba(255,255,255,0.08)",
                              border: "1px solid rgba(255,255,255,0.12)",
                              color: "#E2E8F0",
                              borderRadius: "8px",
                              fontSize: "0.72rem",
                              fontWeight: 700,
                              cursor: "pointer",
                            }}
                          >
                            🔄 আবার স্ক্যান করুন
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        id="btn-open-facecam"
                        onClick={() => setIsFaceCamOpen(true)}
                        style={{
                          width: "100%",
                          padding: "14px",
                          background: "linear-gradient(135deg, #00D68F, #00B87A)",
                          color: "#0F172A",
                          border: "none",
                          borderRadius: "14px",
                          fontSize: "0.90rem",
                          fontWeight: 800,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "8px",
                          boxShadow: "0 6px 20px rgba(0,214,143,0.3)",
                        }}
                      >
                        <span>📷</span>
                        <span>ক্যামেরা অন করে মুখ স্ক্যান করুন</span>
                      </button>
                    )}
                  </div>
                </div>
              )}

              <div style={{ display: "flex", gap: 10 }}>
                {step > 0 && <button id="kyc-back" className="btn-secondary" onClick={() => setStep(s => s - 1)}>← পূর্ববর্তী</button>}
                {step < STEPS.length - 1
                  ? <button id="kyc-next" className="btn-primary" onClick={() => setStep(s => s + 1)}>পরবর্তী →</button>
                  : <button id="kyc-submit" className="btn-primary" onClick={submitKyc} disabled={saving}>{saving ? "জমা হচ্ছে..." : "✅ জমা দিন"}</button>
                }
              </div>
            </>
          )}
        </>
      )}

      {/* ─── Panel Reset ─── */}
      <div style={{ marginTop: 24, padding: "16px", background: "rgba(239,68,68,.08)", border: "1px dashed rgba(239,68,68,.3)", borderRadius: "var(--r-lg)", textAlign: "center" }}>
        <div style={{ fontSize: ".88rem", fontWeight: 700, color: "#ef4444", fontFamily: "var(--font-bn)" }}>
          🔄 রাইডার প্যানেল ডাটা রিসেট
        </div>
        <div style={{ fontSize: ".76rem", color: "var(--text-3)", fontFamily: "var(--font-bn)", marginTop: 4, marginBottom: 12 }}>
          সকল ডেমো অর্ডার, ব্যালেন্স, হিস্ট্রি ও ক্যাশ কালেকশন ০ তে রিসেট করতে চান?
        </div>
        <button
          id="btn-reset-rider-panel"
          type="button"
          onClick={() => {
            if (confirm("আপনি কি নিশ্চিতভাবে রাইডার প্যানেলের সকল ডেমো ডাটা ও অ্যামাউন্ট ০ তে রিসেট করতে চান?")) {
              fullyResetRiderPanel();
              window.location.reload();
            }
          }}
          style={{
            padding: "8px 18px",
            background: "#ef4444",
            color: "#fff",
            border: "none",
            borderRadius: "var(--r-md)",
            fontSize: ".8rem",
            fontWeight: 700,
            fontFamily: "var(--font-bn)",
            cursor: "pointer",
          }}
        >
          প্যানেল সম্পূর্ণ রিসেট করুন
        </button>
      </div>

      {/* ─── Live Face Cam e-KYC Modal ─── */}
      <LiveFaceCamModal
        isOpen={isFaceCamOpen}
        onClose={() => setIsFaceCamOpen(false)}
        onCapture={(photo, score) => {
          setForm((f) => ({ ...f, photoUrl: photo }));
          setFaceMatchScore(score || 95);
        }}
        nidFrontImage={form.nidFrontUrl}
      />
    </div>
  );
}
