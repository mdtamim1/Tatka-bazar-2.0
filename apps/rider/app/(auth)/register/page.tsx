"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { registerRider } from "@/lib/api";

// Animated floating orbs — same as login page
function Orbs() {
  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
      <div style={{
        position: "absolute", width: 320, height: 320,
        borderRadius: "50%", top: "-60px", right: "-60px",
        background: "radial-gradient(circle, rgba(255,107,43,.22) 0%, transparent 70%)",
        animation: "orbFloat1 9s ease-in-out infinite",
      }} />
      <div style={{
        position: "absolute", width: 260, height: 260,
        borderRadius: "50%", bottom: "8%", left: "-50px",
        background: "radial-gradient(circle, rgba(0,214,143,.16) 0%, transparent 70%)",
        animation: "orbFloat2 11s ease-in-out infinite",
      }} />
      <div style={{
        position: "absolute", width: 180, height: 180,
        borderRadius: "50%", top: "45%", right: "20%",
        background: "radial-gradient(circle, rgba(129,140,248,.1) 0%, transparent 70%)",
        animation: "orbFloat3 13s ease-in-out infinite",
      }} />
    </div>
  );
}

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [vehicleType, setVehicleType] = useState<"BICYCLE" | "MOTORCYCLE" | "VAN">("MOTORCYCLE");
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError("আপনার পুরো নাম লিখুন");
      return;
    }
    if (phone.trim().length < 11) {
      setError("১১ ডিজিটের সঠিক মোবাইল নম্বর দিন");
      return;
    }
    if (password.length < 6) {
      setError("পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে");
      return;
    }
    if (!agreeTerms) {
      setError("অ্যাকাউন্ট তৈরি করতে Terms & Conditions এ সম্মতি দিন");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const payload: {
        name: string;
        phone: string;
        password: string;
        email?: string;
        vehicleType?: "BICYCLE" | "MOTORCYCLE" | "VAN";
      } = {
        name: name.trim(),
        phone: phone.trim(),
        password,
        vehicleType,
      };
      if (email.trim().length > 0) {
        payload.email = email.trim();
      }
      const res = await registerRider(payload);

      if (res.success) {
        router.replace("/profile?registered=1");
      } else {
        setError(res.error || "রেজিস্ট্রেশন ব্যর্থ হয়েছে। আবার চেষ্টা করুন।");
      }
    } catch {
      setError("নেটওয়ার্ক সমস্যা। আবার চেষ্টা করুন।");
    }
    setLoading(false);
  }

  const vehicles = [
    { id: "MOTORCYCLE", label: "মোটরসাইকেল", icon: "🏍️" },
    { id: "BICYCLE",   label: "সাইকেল",      icon: "🚲" },
    { id: "VAN",       label: "ভ্যান",        icon: "🛺" },
  ];

  return (
    <>
      <style>{`
        @keyframes orbFloat1 { 0%,100%{transform:translate(0,0) scale(1);} 50%{transform:translate(-25px,20px) scale(1.06);} }
        @keyframes orbFloat2 { 0%,100%{transform:translate(0,0) scale(1);} 50%{transform:translate(20px,-25px) scale(1.04);} }
        @keyframes orbFloat3 { 0%,100%{transform:translate(0,0) scale(1);} 50%{transform:translate(-12px,18px) scale(1.09);} }
        @keyframes slideUp { from{opacity:0;transform:translateY(28px);} to{opacity:1;transform:translateY(0);} }
        @keyframes fadeIn  { from{opacity:0;} to{opacity:1;} }
        @keyframes dotBlink { 0%,80%,100%{opacity:0;} 40%{opacity:1;} }
        @keyframes shake { 0%,100%{transform:translateX(0);} 20%,60%{transform:translateX(-6px);} 40%,80%{transform:translateX(6px);} }

        .reg-input {
          width: 100%;
          background: rgba(255,255,255,.05);
          border: 1.5px solid rgba(255,255,255,.10);
          border-radius: 14px;
          padding: 14px 18px;
          font-size: .97rem;
          color: #F0F6FF;
          outline: none;
          transition: all .25s ease;
          box-sizing: border-box;
          font-family: inherit;
        }
        .reg-input::placeholder { color: rgba(168,192,216,.38); }
        .reg-input:focus {
          border-color: rgba(255,107,43,.6);
          background: rgba(255,107,43,.06);
          box-shadow: 0 0 0 3px rgba(255,107,43,.12);
        }
        .reg-input-pw { padding-right: 52px; }

        .reg-btn {
          width: 100%;
          padding: 16px;
          background: linear-gradient(135deg, #FF6B2B, #E05520);
          color: #fff;
          border: none;
          border-radius: 14px;
          font-size: 1rem;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          box-shadow: 0 8px 30px rgba(255,107,43,.4);
          transition: all .25s cubic-bezier(.34,1.56,.64,1);
          font-family: var(--font-bn), inherit;
          letter-spacing: .02em;
        }
        .reg-btn:hover:not(:disabled) {
          transform: translateY(-2px) scale(1.01);
          box-shadow: 0 14px 40px rgba(255,107,43,.5);
        }
        .reg-btn:active:not(:disabled) { transform: scale(.97); }
        .reg-btn:disabled { opacity: .55; cursor: not-allowed; }

        .reg-vehicle-btn {
          padding: 12px 4px;
          border-radius: 14px;
          border: 1.5px solid rgba(255,255,255,.10);
          background: rgba(255,255,255,.03);
          color: rgba(168,192,216,.7);
          cursor: pointer;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 5px;
          font-size: 11.5px;
          font-weight: 500;
          transition: all .2s ease;
          font-family: inherit;
        }
        .reg-vehicle-btn.active {
          border-color: rgba(255,107,43,.7);
          background: rgba(255,107,43,.12);
          color: #FF8C5A;
          font-weight: 700;
          box-shadow: 0 0 18px rgba(255,107,43,.2);
        }
        .reg-vehicle-btn:hover:not(.active) {
          border-color: rgba(255,255,255,.25);
          background: rgba(255,255,255,.06);
          color: #F0F6FF;
        }

        .reg-error {
          background: rgba(239,68,68,.12);
          border: 1px solid rgba(239,68,68,.3);
          color: #FCA5A5;
          border-radius: 12px;
          padding: 11px 16px;
          font-size: .85rem;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 8px;
          animation: shake .35s ease;
        }

        .reg-terms-box {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 14px 16px;
          background: rgba(255,255,255,.03);
          border: 1.5px solid rgba(255,255,255,.08);
          border-radius: 14px;
          cursor: pointer;
          transition: all .2s ease;
          user-select: none;
        }
        .reg-terms-box:hover {
          background: rgba(255,107,43,.05);
          border-color: rgba(255,107,43,.25);
        }
        .reg-terms-box.checked {
          background: rgba(255,107,43,.07);
          border-color: rgba(255,107,43,.45);
          box-shadow: 0 0 16px rgba(255,107,43,.1);
        }
        .reg-checkbox {
          width: 20px;
          height: 20px;
          border-radius: 6px;
          border: 2px solid rgba(255,255,255,.2);
          background: rgba(255,255,255,.05);
          flex-shrink: 0;
          margin-top: 1px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all .2s ease;
        }
        .reg-checkbox.checked {
          background: linear-gradient(135deg, #FF6B2B, #E05520);
          border-color: #FF6B2B;
          box-shadow: 0 0 12px rgba(255,107,43,.4);
        }

        .dot { display: inline-block; animation: dotBlink 1.2s infinite; }
        .dot:nth-child(2) { animation-delay: .2s; }
        .dot:nth-child(3) { animation-delay: .4s; }
      `}</style>

      {/* Dark gradient background */}
      <div style={{
        minHeight: "100dvh",
        background: "linear-gradient(160deg, #050810 0%, #0D0F1E 40%, #080C18 75%, #050810 100%)",
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
        fontFamily: "var(--font-bn), 'Inter', system-ui, sans-serif",
      }}>
        <Orbs />

        {/* Dot-grid overlay */}
        <div style={{
          position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0,
          backgroundImage: "radial-gradient(rgba(255,255,255,.04) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }} />

        {/* Glass Card */}
        <div style={{
          position: "relative", zIndex: 1,
          width: "100%", maxWidth: 420,
          background: "rgba(255,255,255,.04)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          border: "1px solid rgba(255,255,255,.09)",
          borderRadius: 28,
          boxShadow: "0 32px 80px rgba(0,0,0,.5), inset 0 1px 0 rgba(255,255,255,.07)",
          padding: "32px 28px",
          animation: mounted ? "slideUp .55s cubic-bezier(.22,1,.36,1) both" : "none",
        }}>

          {/* Top bar */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
            <Link href="/login" style={{
              width: 38, height: 38, borderRadius: 10,
              background: "rgba(255,255,255,.06)",
              border: "1px solid rgba(255,255,255,.08)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "rgba(168,192,216,.8)", textDecoration: "none",
              transition: "all .2s ease",
            }}>
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </Link>
            <button
              type="button"
              onClick={() => alert("সাহায্যের জন্য Tatka Bazar হেল্পলাইনে যোগাযোগ করুন: 01700-000000")}
              style={{
                width: 38, height: 38, borderRadius: 10,
                background: "rgba(255,255,255,.06)",
                border: "1px solid rgba(255,255,255,.08)",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "rgba(168,192,216,.8)", cursor: "pointer",
                transition: "all .2s ease",
              }}
            >
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <circle cx="12" cy="12" r="9" strokeWidth="2" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3m.08 4h.01" />
              </svg>
            </button>
          </div>

          {/* Logo & heading */}
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <div style={{
              width: 68, height: 68, borderRadius: 20,
              background: "linear-gradient(135deg, #FF6B2B, #E05520)",
              boxShadow: "0 16px 40px rgba(255,107,43,.45)",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 16px",
              position: "relative",
            }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#fff" opacity=".95" />
                <circle cx="12" cy="9" r="3.2" fill="rgba(255,107,43,.85)" />
              </svg>
              {/* Glow ring */}
              <div style={{
                position: "absolute", inset: -4,
                borderRadius: 24,
                background: "transparent",
                border: "1px solid rgba(255,107,43,.35)",
                animation: "fadeIn 1.5s ease 0.5s both",
              }} />
            </div>
            <h1 style={{
              margin: 0, fontSize: "1.7rem", fontWeight: 800,
              color: "#F0F6FF", letterSpacing: "-.03em", lineHeight: 1.2,
            }}>
              রাইডার হিসেবে যোগ দিন
            </h1>
            <p style={{
              margin: "8px 0 0", fontSize: ".85rem",
              color: "rgba(168,192,216,.55)", lineHeight: 1.5,
            }}>
              নতুন ডেলিভারি পার্টনার হিসেবে রেজিস্ট্রেশন করুন
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="reg-error" style={{ marginBottom: 18 }}>
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ flexShrink: 0 }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} style={{ display: "flex", flexDirection: "column", gap: 14 }}>

            {/* Full Name */}
            <div>
              <label style={{ display: "block", fontSize: ".78rem", fontWeight: 600, color: "rgba(168,192,216,.65)", letterSpacing: ".06em", textTransform: "uppercase", marginBottom: 7 }}>
                পুরো নাম
              </label>
              <input
                id="reg-name"
                type="text"
                className="reg-input"
                placeholder="যেমন: মোঃ সাকিব হাসান"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            {/* Phone */}
            <div>
              <label style={{ display: "block", fontSize: ".78rem", fontWeight: 600, color: "rgba(168,192,216,.65)", letterSpacing: ".06em", textTransform: "uppercase", marginBottom: 7 }}>
                মোবাইল নম্বর
              </label>
              <input
                id="reg-phone"
                type="tel"
                className="reg-input"
                placeholder="017XXXXXXXX"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>

            {/* Email (optional) */}
            <div>
              <label style={{ display: "block", fontSize: ".78rem", fontWeight: 600, color: "rgba(168,192,216,.65)", letterSpacing: ".06em", textTransform: "uppercase", marginBottom: 7 }}>
                ইমেইল <span style={{ color: "rgba(168,192,216,.35)", fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>(ঐচ্ছিক)</span>
              </label>
              <input
                id="reg-email"
                type="email"
                className="reg-input"
                placeholder="rider@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {/* Password */}
            <div>
              <label style={{ display: "block", fontSize: ".78rem", fontWeight: 600, color: "rgba(168,192,216,.65)", letterSpacing: ".06em", textTransform: "uppercase", marginBottom: 7 }}>
                পাসওয়ার্ড <span style={{ color: "rgba(168,192,216,.35)", fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>(কমপক্ষে ৬ অক্ষর)</span>
              </label>
              <div style={{ position: "relative" }}>
                <input
                  id="reg-password"
                  type={showPassword ? "text" : "password"}
                  className="reg-input reg-input-pw"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                  style={{
                    position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)",
                    background: "none", border: "none", cursor: "pointer",
                    color: "rgba(168,192,216,.5)", padding: 4, display: "flex",
                    transition: "color .2s",
                  }}
                >
                  {showPassword ? (
                    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                    </svg>
                  ) : (
                    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Delivery Vehicle */}
            <div>
              <label style={{ display: "block", fontSize: ".78rem", fontWeight: 600, color: "rgba(168,192,216,.65)", letterSpacing: ".06em", textTransform: "uppercase", marginBottom: 10 }}>
                ডেলিভারি যান নির্বাচন করুন
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
                {vehicles.map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => setVehicleType(v.id as any)}
                    className={`reg-vehicle-btn${vehicleType === v.id ? " active" : ""}`}
                  >
                    <span style={{ fontSize: 22 }}>{v.icon}</span>
                    <span>{v.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* ─── Terms & Conditions ─── */}
            <div
              className={`reg-terms-box${agreeTerms ? " checked" : ""}`}
              onClick={() => setAgreeTerms(!agreeTerms)}
              role="checkbox"
              aria-checked={agreeTerms}
              tabIndex={0}
              onKeyDown={(e) => e.key === " " && setAgreeTerms(!agreeTerms)}
            >
              {/* Custom checkbox */}
              <div className={`reg-checkbox${agreeTerms ? " checked" : ""}`}>
                {agreeTerms && (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
              <p style={{ margin: 0, fontSize: ".83rem", color: "rgba(168,192,216,.75)", lineHeight: 1.55 }}>
                আমি Tatka Bazar-এর{" "}
                <a
                  href="#"
                  onClick={(e) => e.stopPropagation()}
                  style={{ color: "#FF8C5A", textDecoration: "underline", fontWeight: 600 }}
                >
                  Terms & Conditions
                </a>{" "}
                এবং{" "}
                <a
                  href="#"
                  onClick={(e) => e.stopPropagation()}
                  style={{ color: "#FF8C5A", textDecoration: "underline", fontWeight: 600 }}
                >
                  Privacy Policy
                </a>{" "}
                পড়েছি এবং সম্মত আছি
              </p>
            </div>

            {/* Submit */}
            <button
              id="reg-submit-btn"
              type="submit"
              className="reg-btn"
              disabled={loading || !agreeTerms}
              style={{ marginTop: 4 }}
            >
              {loading ? (
                <>
                  <div style={{
                    width: 18, height: 18, borderRadius: "50%",
                    border: "2.5px solid rgba(255,255,255,.3)",
                    borderTopColor: "#fff",
                    animation: "orbFloat1 .7s linear infinite",
                    flexShrink: 0,
                  }} />
                  <span>প্রসেসিং হচ্ছে<span className="dot">.</span><span className="dot">.</span><span className="dot">.</span></span>
                </>
              ) : (
                <>
                  <span>অ্যাকাউন্ট তৈরি করুন</span>
                  <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </>
              )}
            </button>

            {/* Terms note when not agreed */}
            {!agreeTerms && (
              <p style={{ margin: "-6px 0 0", textAlign: "center", fontSize: ".76rem", color: "rgba(168,192,216,.35)" }}>
                অ্যাকাউন্ট তৈরি করতে শর্তাবলীতে সম্মত হওয়া আবশ্যক
              </p>
            )}
          </form>

          {/* Divider */}
          <div style={{
            display: "flex", alignItems: "center", gap: 12, margin: "22px 0 18px",
            color: "rgba(168,192,216,.2)", fontSize: ".75rem",
          }}>
            <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,.07)" }} />
            <span>ইতিমধ্যে অ্যাকাউন্ট আছে?</span>
            <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,.07)" }} />
          </div>

          {/* Footer Link */}
          <Link href="/login" style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            width: "100%", padding: "13px 0",
            border: "1.5px solid rgba(255,107,43,.3)",
            borderRadius: 14,
            background: "rgba(255,107,43,.04)",
            color: "#FF8C5A",
            fontWeight: 700,
            fontSize: ".92rem",
            textDecoration: "none",
            transition: "all .2s ease",
          }}>
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            লগ ইন করুন
          </Link>

          {/* Bottom badge */}
          <div style={{ textAlign: "center", marginTop: 20 }}>
            <span style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              fontSize: ".72rem", color: "rgba(168,192,216,.3)",
            }}>
              <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              SSL এনক্রিপ্টেড • সুরক্ষিত সংযোগ
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
