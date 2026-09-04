"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch, type RiderProfile } from "@/lib/api";

export default function WithdrawPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<RiderProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<"select" | "amount" | "done">("select");
  const [method, setMethod] = useState<"BKASH" | "NAGAD" | "BANK">("BKASH");
  const [account, setAccount] = useState("");
  const [amount, setAmount] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch<RiderProfile>("/rider-portal/me").then(r => {
      if (r.success && r.data) {
        const p = r.data as RiderProfile;
        setProfile(p);
        if (p.paymentAccountLocked) setStep("amount");
      }
      setLoading(false);
    });
  }, []);

  async function saveAccount() {
    if (!account.trim()) { setError("একাউন্ট নম্বর দিন"); return; }
    setSaving(true); setError("");
    const res = await apiFetch("/rider-portal/payment-account", { method: "POST", body: JSON.stringify({ paymentMethod: method, paymentAccount: account }) });
    if (res.success) {
      apiFetch<RiderProfile>("/rider-portal/me").then(r => { if (r.success) setProfile(r.data as RiderProfile); });
      setStep("amount");
    } else { setError(res.error || "সংরক্ষণ ব্যর্থ"); }
    setSaving(false);
  }

  async function submitWithdraw() {
    const amt = Number(amount);
    if (!amt || amt < 100) { setError("সর্বনিম্ন উইথড্র ৳১০০"); return; }
    if (amt > Number(profile?.balance ?? 0)) { setError("পর্যাপ্ত ব্যালেন্স নেই"); return; }
    setSaving(true); setError("");
    const res = await apiFetch("/rider-portal/withdraw", { method: "POST", body: JSON.stringify({ amount: amt }) });
    if (res.success) setStep("done");
    else setError(res.error || "উইথড্র ব্যর্থ");
    setSaving(false);
  }

  if (loading) return <div className="page-content"><div className="loading-center"><div className="spinner" /></div></div>;

  const balance = Number(profile?.balance ?? 0);
  const OPTIONS = [
    { id: "BKASH" as const, icon: "📱", name: "bKash", desc: "মোবাইল ব্যাংকিং" },
    { id: "NAGAD" as const, icon: "💳", name: "Nagad", desc: "ডিজিটাল পেমেন্ট" },
    { id: "BANK" as const, icon: "🏦", name: "ব্যাংক", desc: "ব্যাংক ট্রান্সফার" },
  ];

  return (
    <div className="page-content">
      <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-1)", borderRadius: "var(--r-lg)", padding: "20px", textAlign: "center" }}>
        <div style={{ fontSize: ".72rem", color: "var(--text-3)", fontFamily: "var(--font-bn)" }}>উইথড্রযোগ্য ব্যালেন্স</div>
        <div style={{ fontSize: "2.2rem", fontWeight: 900, color: "var(--text-1)", marginTop: 4 }}>৳ {balance.toLocaleString()}</div>
      </div>

      {step === "done" && (
        <div style={{ background: "var(--emerald-glass)", border: "1px solid rgba(0,214,143,.3)", borderRadius: "var(--r-xl)", padding: "32px 20px", textAlign: "center" }}>
          <div style={{ fontSize: 56 }}>✅</div>
          <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--emerald)", fontFamily: "var(--font-bn)", marginTop: 12 }}>রিকোয়েস্ট পাঠানো হয়েছে!</div>
          <div style={{ fontSize: ".82rem", color: "var(--text-2)", fontFamily: "var(--font-bn)", marginTop: 8, lineHeight: 1.6 }}>অ্যাডমিন অনুমোদনের পরে আপনার {profile?.paymentMethod} একাউন্টে পাঠানো হবে।</div>
          <button id="back-home-btn" className="btn-primary" style={{ marginTop: 20 }} onClick={() => router.push("/home")}>হোমে ফিরুন</button>
        </div>
      )}

      {step === "select" && (
        <>
          <div className="form-section">
            <div className="form-section-title">💳 পেমেন্ট মাধ্যম বেছে নিন</div>
            <div className="payment-options">
              {OPTIONS.map(o => (
                <div key={o.id} id={`pay-method-${o.id.toLowerCase()}`} className={`payment-option${method === o.id ? " selected" : ""}`} onClick={() => setMethod(o.id)}>
                  <div className="payment-option-icon">{o.icon}</div>
                  <div className="payment-option-info">
                    <div className="payment-option-name">{o.name}</div>
                    <div className="payment-option-desc">{o.desc}</div>
                  </div>
                  <div className="payment-option-check">{method === o.id && <svg viewBox="0 0 24 24" style={{ width: 14, height: 14, stroke: "white", fill: "none" }}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}</div>
                </div>
              ))}
            </div>
            <div className="form-group">
              <div className="form-label">একাউন্ট নম্বর</div>
              <input id="account-number" className="form-input" value={account} onChange={e => setAccount(e.target.value)} placeholder="একাউন্ট নম্বর দিন" />
            </div>
            {error && <div className="login-error">{error}</div>}
            <div className="info-box">
              <svg fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              <div className="info-box-text">একবার সংরক্ষণের পরে এই একাউন্ট পরিবর্তন করা যাবে না। পরিবর্তন করতে কাস্টমার সাপোর্টে যোগাযোগ করুন।</div>
            </div>
            <button id="save-account-btn" className="btn-primary" onClick={saveAccount} disabled={saving}>{saving ? "সংরক্ষণ হচ্ছে..." : "✅ সংরক্ষণ করুন"}</button>
          </div>
        </>
      )}

      {step === "amount" && (
        <div className="form-section">
          <div className="form-section-title">💸 উইথড্র পরিমাণ</div>
          {profile?.paymentAccount && (
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", background: "var(--bg-raised)", borderRadius: "var(--r-sm)", border: "1px solid var(--border-2)" }}>
              <span style={{ fontSize: 20 }}>{OPTIONS.find(o => o.id === profile.paymentMethod)?.icon || "💳"}</span>
              <div>
                <div style={{ fontSize: ".76rem", fontWeight: 700, color: "var(--text-1)" }}>{profile.paymentMethod}</div>
                <div style={{ fontSize: ".70rem", color: "var(--text-3)", fontFamily: "var(--font-bn)" }}>{profile.paymentAccount}</div>
              </div>
              <span style={{ marginLeft: "auto", fontSize: ".68rem", color: "var(--text-3)", fontFamily: "var(--font-bn)" }}>🔒 লক</span>
            </div>
          )}
          <div className="form-group">
            <div className="form-label">পরিমাণ (সর্বনিম্ন ৳১০০)</div>
            <div className="amount-input-wrapper">
              <span className="amount-currency">৳</span>
              <input id="withdraw-amount" type="number" className="amount-input" value={amount} onChange={e => setAmount(e.target.value)} placeholder="০" min="100" max={balance} />
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {[500, 1000, 2000, 5000].map(a => (
              <button key={a} id={`quick-${a}`} style={{ flex: 1, padding: "10px 4px", background: "var(--bg-raised)", border: "1px solid var(--border-2)", borderRadius: "var(--r-sm)", fontSize: ".75rem", fontWeight: 700, color: "var(--text-2)", cursor: "pointer", fontFamily: "var(--font-bn)" }} onClick={() => setAmount(String(Math.min(a, balance)))}>
                ৳{a}
              </button>
            ))}
          </div>
          {error && <div className="login-error">{error}</div>}
          <button id="withdraw-submit-btn" className="btn-primary" onClick={submitWithdraw} disabled={saving || !amount}>{saving ? "পাঠানো হচ্ছে..." : "💸 উইথড্র রিকোয়েস্ট পাঠান"}</button>
        </div>
      )}
    </div>
  );
}
