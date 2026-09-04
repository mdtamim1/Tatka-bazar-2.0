"use client";
import React, { useEffect, useState } from "react";
import { apiFetch, type RiderProfile } from "@/lib/api";

const STEPS = ["ব্যক্তিগত তথ্য", "ঠিকানা", "পরিচয়পত্র"];

export default function ProfilePage() {
  const [profile, setProfile] = useState<RiderProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
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
        <div className={`kyc-status-badge ${profile.kycStatus.toLowerCase()}`}>
          {kycLabel[profile.kycStatus] || profile.kycStatus}
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
                  <div className="form-section-title">🪪 জাতীয় পরিচয়পত্র (NID)</div>
                  <div className="form-group"><div className="form-label">NID নম্বর</div><input id="nidNumber" className="form-input" value={form.nidNumber} onChange={e => inp("nidNumber")(e.target.value)} placeholder="১৩ বা ১৭ ডিজিটের NID নম্বর" /></div>
                  <div className="form-group"><div className="form-label">NID সামনের ছবি (URL)</div><input id="nidFrontUrl" className="form-input" value={form.nidFrontUrl} onChange={e => inp("nidFrontUrl")(e.target.value)} placeholder="ছবির লিংক দিন" /></div>
                  <div className="form-group"><div className="form-label">NID পেছনের ছবি (URL)</div><input id="nidBackUrl" className="form-input" value={form.nidBackUrl} onChange={e => inp("nidBackUrl")(e.target.value)} placeholder="ছবির লিংক দিন" /></div>
                  <div className="form-group"><div className="form-label">নিজের ছবি (URL)</div><input id="photoUrl" className="form-input" value={form.photoUrl} onChange={e => inp("photoUrl")(e.target.value)} placeholder="সেলফি বা প্রোফাইল ছবির লিংক" /></div>
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
    </div>
  );
}
