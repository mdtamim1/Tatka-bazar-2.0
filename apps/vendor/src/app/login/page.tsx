"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useVendorStore } from "@/store/vendorStore";

// Animated floating orbs in background (Same as Rider Portal)
function Orbs() {
  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
      <div
        style={{
          position: "absolute",
          width: 340,
          height: 340,
          borderRadius: "50%",
          top: "-80px",
          left: "-80px",
          background: "radial-gradient(circle, rgba(0,214,143,.25) 0%, transparent 70%)",
          animation: "orbFloat1 8s ease-in-out infinite",
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 280,
          height: 280,
          borderRadius: "50%",
          bottom: "10%",
          right: "-60px",
          background: "radial-gradient(circle, rgba(0,214,143,.18) 0%, transparent 70%)",
          animation: "orbFloat2 10s ease-in-out infinite",
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 200,
          height: 200,
          borderRadius: "50%",
          bottom: "40%",
          left: "30%",
          background: "radial-gradient(circle, rgba(129,140,248,.12) 0%, transparent 70%)",
          animation: "orbFloat3 12s ease-in-out infinite",
        }}
      />
    </div>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const { setRole } = useVendorStore();

  const [tab, setTab] = useState<"phone" | "email">("phone");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [step, setStep] = useState<"identifier" | "password">("identifier");
  const [showPassword, setShowPassword] = useState(false);
  const [loginType, setLoginType] = useState<"OWNER" | "STAFF">("OWNER");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  function handleNext(e: React.FormEvent) {
    e.preventDefault();
    if (!identifier.trim()) {
      setError(tab === "email" ? "ইমেইল এড্রেস দিন" : "মোবাইল নম্বর দিন");
      return;
    }
    if (tab === "email" && !identifier.includes("@")) {
      setError("সঠিক ইমেইল এড্রেস লিখুন");
      return;
    }
    if (tab === "phone" && identifier.trim().length < 11) {
      setError("১১ ডিজিটের মোবাইল নম্বর দিন");
      return;
    }
    setError("");
    setStep("password");
  }

  async function handleLoginSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!password) {
      setError("পাসওয়ার্ড দিন");
      return;
    }
    setLoading(true);
    setError("");

    setTimeout(() => {
      setRole(loginType);
      router.replace("/");
    }, 600);
  }

  function handleQuickDemo() {
    setLoading(true);
    setError("");
    setIdentifier("01711223344");
    setPassword("password123");
    setRole("OWNER");
    setTimeout(() => {
      router.replace("/");
    }, 500);
  }

  return (
    <>
      <style>{`
        @keyframes orbFloat1 { 0%,100%{transform:translate(0,0) scale(1);} 50%{transform:translate(30px,20px) scale(1.08);} }
        @keyframes orbFloat2 { 0%,100%{transform:translate(0,0) scale(1);} 50%{transform:translate(-20px,-30px) scale(1.05);} }
        @keyframes orbFloat3 { 0%,100%{transform:translate(0,0) scale(1);} 50%{transform:translate(15px,25px) scale(1.1);} }
        @keyframes slideUp { from{opacity:0;transform:translateY(32px);} to{opacity:1;transform:translateY(0);} }
        @keyframes fadeIn  { from{opacity:0;} to{opacity:1;} }

        .login-input {
          width: 100%;
          background: rgba(255,255,255,.05);
          border: 1.5px solid rgba(255,255,255,.10);
          border-radius: 14px;
          padding: 15px 18px;
          font-size: 1rem;
          color: #F0F6FF;
          outline: none;
          transition: all .25s ease;
          box-sizing: border-box;
          font-family: inherit;
        }
        .login-input::placeholder { color: rgba(168,192,216,.4); }
        .login-input:focus {
          border-color: rgba(0,214,143,.6);
          background: rgba(0,214,143,.06);
          box-shadow: 0 0 0 3px rgba(0,214,143,.12);
        }
        .login-input-pw {
          padding-right: 52px;
        }
        .login-btn-primary {
          width: 100%;
          padding: 16px;
          background: linear-gradient(135deg, #00D68F, #00B87A);
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
          box-shadow: 0 8px 30px rgba(0,214,143,.4);
          transition: all .25s cubic-bezier(.34,1.56,.64,1);
          font-family: var(--font-bn), inherit;
          letter-spacing: .02em;
        }
        .login-btn-primary:hover:not(:disabled) {
          transform: translateY(-2px) scale(1.01);
          box-shadow: 0 14px 40px rgba(0,214,143,.5);
        }
        .login-btn-primary:active:not(:disabled) { transform: scale(.97); }
        .login-btn-primary:disabled { opacity: .6; cursor: not-allowed; }
        .login-tab {
          flex: 1; padding: 10px 0;
          border-radius: 10px;
          font-size: .88rem; font-weight: 500;
          color: rgba(168,192,216,.6);
          border: none; background: transparent; cursor: pointer;
          transition: all .2s ease; font-family: inherit;
        }
        .login-tab.active {
          background: rgba(0,214,143,.15);
          color: #00D68F;
          font-weight: 700;
          box-shadow: 0 0 16px rgba(0,214,143,.15);
        }
        .login-social-btn {
          width: 100%;
          padding: 13px 16px;
          background: rgba(255,255,255,.05);
          border: 1.5px solid rgba(255,255,255,.08);
          color: #A8C0D8;
          border-radius: 14px;
          font-size: .9rem;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          transition: all .2s ease;
          font-family: inherit;
          margin-bottom: 10px;
        }
        .login-social-btn:hover {
          background: rgba(255,255,255,.09);
          border-color: rgba(255,255,255,.15);
          color: #F0F6FF;
          transform: translateY(-1px);
        }
      `}</style>

      {/* Full-screen dark background */}
      <div
        style={{
          minHeight: "100dvh",
          background: "linear-gradient(160deg, #050810 0%, #08111E 40%, #0D1929 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px 16px",
          position: "relative",
          fontFamily: "var(--font-bn), Inter, sans-serif",
        }}
      >
        <Orbs />

        {/* Grid pattern overlay */}
        <div
          style={{
            position: "fixed",
            inset: 0,
            pointerEvents: "none",
            zIndex: 0,
            backgroundImage: "radial-gradient(rgba(255,255,255,.03) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />

        {/* Auth Card */}
        <div
          style={{
            position: "relative",
            zIndex: 10,
            width: "100%",
            maxWidth: 420,
            background: "rgba(15,30,50,.80)",
            backdropFilter: "blur(40px)",
            WebkitBackdropFilter: "blur(40px)",
            borderRadius: 28,
            border: "1px solid rgba(255,255,255,.08)",
            boxShadow:
              "0 32px 80px rgba(0,0,0,.7), 0 0 0 1px rgba(255,255,255,.04), inset 0 1px 0 rgba(255,255,255,.06)",
            padding: "32px 28px 36px",
            animation: mounted ? "slideUp .5s cubic-bezier(.34,1.56,.64,1) both" : "none",
          }}
        >
          {/* Top Bar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 28,
            }}
          >
            <button
              type="button"
              onClick={() => {
                if (step === "password") {
                  setStep("identifier");
                  setError("");
                } else router.push("/");
              }}
              style={{
                width: 38,
                height: 38,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "rgba(255,255,255,.06)",
                border: "1px solid rgba(255,255,255,.08)",
                cursor: "pointer",
                color: "#A8C0D8",
                transition: "all .2s",
              }}
              title="ফিরে যান"
            >
              {step === "password" ? (
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              ) : (
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>

            <button
              type="button"
              onClick={() => alert("সাহায্যের জন্য Tatka Bazar হেল্পলাইনে যোগাযোগ করুন: 01700-000000")}
              style={{
                width: 38,
                height: 38,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "rgba(255,255,255,.06)",
                border: "1px solid rgba(255,255,255,.08)",
                cursor: "pointer",
                color: "#A8C0D8",
                transition: "all .2s",
              }}
              title="সাহায্য"
            >
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <circle cx="12" cy="12" r="9" strokeWidth="2" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3m.08 4h.01" />
              </svg>
            </button>
          </div>

          {/* Logo + Title */}
          <div style={{ textAlign: "center", marginBottom: 30 }}>
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: 20,
                background: "linear-gradient(135deg, #00D68F, #00B87A)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px",
                boxShadow: "0 12px 40px rgba(0,214,143,.45), 0 0 0 1px rgba(0,214,143,.2)",
                fontSize: "2rem",
              }}
            >
              🏪
            </div>
            <h1
              style={{
                fontSize: "1.75rem",
                fontWeight: 900,
                color: "#F0F6FF",
                letterSpacing: "-0.5px",
                margin: "0 0 6px",
              }}
            >
              লগইন করুন
            </h1>
            <p style={{ fontSize: ".85rem", color: "rgba(168,192,216,.7)", margin: 0 }}>
              Tatka Bazar Vendor Partner
            </p>
          </div>

          {/* Role selector: Owner vs Staff */}
          <div
            style={{
              display: "flex",
              background: "rgba(255,255,255,.04)",
              borderRadius: 12,
              padding: 3,
              marginBottom: 16,
              border: "1px solid rgba(255,255,255,.06)",
            }}
          >
            <button
              type="button"
              onClick={() => setLoginType("OWNER")}
              style={{
                flex: 1,
                padding: "8px 0",
                borderRadius: 9,
                fontSize: ".80rem",
                fontWeight: 700,
                border: "none",
                cursor: "pointer",
                background: loginType === "OWNER" ? "rgba(0,214,143,.18)" : "transparent",
                color: loginType === "OWNER" ? "#00D68F" : "rgba(168,192,216,.6)",
                transition: "all .2s",
                fontFamily: "var(--font-bn)",
              }}
            >
              🛡️ দোকান মালিক
            </button>
            <button
              type="button"
              onClick={() => setLoginType("STAFF")}
              style={{
                flex: 1,
                padding: "8px 0",
                borderRadius: 9,
                fontSize: ".80rem",
                fontWeight: 700,
                border: "none",
                cursor: "pointer",
                background: loginType === "STAFF" ? "rgba(0,214,143,.18)" : "transparent",
                color: loginType === "STAFF" ? "#00D68F" : "rgba(168,192,216,.6)",
                transition: "all .2s",
                fontFamily: "var(--font-bn)",
              }}
            >
              👥 কর্মী / সাব-লগইন
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div
              style={{
                background: "rgba(239,68,68,.12)",
                border: "1px solid rgba(239,68,68,.3)",
                borderRadius: 12,
                padding: "10px 14px",
                fontSize: ".82rem",
                color: "#FCA5A5",
                textAlign: "center",
                marginBottom: 16,
              }}
            >
              {error}
            </div>
          )}

          {step === "identifier" ? (
            <form onSubmit={handleNext}>
              {/* Tab switcher: Phone vs Email */}
              <div
                style={{
                  display: "flex",
                  background: "rgba(255,255,255,.05)",
                  borderRadius: 14,
                  padding: 4,
                  marginBottom: 20,
                  gap: 4,
                  border: "1px solid rgba(255,255,255,.06)",
                }}
              >
                <button
                  type="button"
                  className={`login-tab ${tab === "phone" ? "active" : ""}`}
                  onClick={() => {
                    setTab("phone");
                    setIdentifier("");
                    setError("");
                  }}
                >
                  📱 মোবাইল
                </button>
                <button
                  type="button"
                  className={`login-tab ${tab === "email" ? "active" : ""}`}
                  onClick={() => {
                    setTab("email");
                    setIdentifier("");
                    setError("");
                  }}
                >
                  ✉️ ইমেইল
                </button>
              </div>

              <div style={{ marginBottom: 18 }}>
                <label
                  style={{
                    display: "block",
                    fontSize: ".78rem",
                    fontWeight: 600,
                    color: "rgba(168,192,216,.8)",
                    marginBottom: 8,
                  }}
                >
                  {tab === "phone" ? "মোবাইল নম্বর" : "ইমেইল এড্রেস"}
                </label>
                <input
                  id="vendor-login-identifier"
                  type={tab === "email" ? "email" : "tel"}
                  className="login-input"
                  placeholder={tab === "phone" ? "017XXXXXXXX" : "merchant@tatkabazar.com"}
                  value={identifier}
                  onChange={(e) => {
                    setIdentifier(e.target.value);
                    setError("");
                  }}
                  required
                  autoFocus
                />
              </div>

              <button id="vendor-auth-next-btn" type="submit" className="login-btn-primary">
                পরবর্তী →
              </button>
            </form>
          ) : (
            <form onSubmit={handleLoginSubmit}>
              {/* Identifier chip */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  background: "rgba(255,255,255,.05)",
                  border: "1px solid rgba(255,255,255,.08)",
                  padding: "10px 16px",
                  borderRadius: 12,
                  marginBottom: 20,
                }}
              >
                <span style={{ fontWeight: 600, color: "#F0F6FF", fontSize: ".9rem" }}>
                  {identifier}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setStep("identifier");
                    setError("");
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#00D68F",
                    fontSize: ".82rem",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  পরিবর্তন করুন
                </button>
              </div>

              <div style={{ marginBottom: 20 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 8,
                  }}
                >
                  <label style={{ fontSize: ".78rem", fontWeight: 600, color: "rgba(168,192,216,.8)" }}>
                    {loginType === "STAFF" ? "৪-ডিজিট স্টাফ পিন" : "পাসওয়ার্ড"}
                  </label>
                  <span
                    style={{ fontSize: ".75rem", color: "rgba(0,214,143,.8)", cursor: "pointer" }}
                    onClick={() => alert("পাসওয়ার্ড ভুলে গেলে এডমিনের সাথে যোগাযোগ করুন: 01700-000000")}
                  >
                    ভুলে গেছেন?
                  </span>
                </div>
                <div style={{ position: "relative" }}>
                  <input
                    id="vendor-login-password"
                    type={showPassword ? "text" : "password"}
                    className="login-input login-input-pw"
                    placeholder={loginType === "STAFF" ? "••••" : "••••••••"}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError("");
                    }}
                    required
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                    style={{
                      position: "absolute",
                      right: 14,
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "rgba(168,192,216,.5)",
                      padding: 0,
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

              <button id="vendor-auth-submit-btn" type="submit" className="login-btn-primary" disabled={loading}>
                {loading ? "লগইন হচ্ছে..." : "🔐 লগইন করুন"}
              </button>
            </form>
          )}

          {/* Divider */}
          <div style={{ display: "flex", alignItems: "center", margin: "22px 0 18px", gap: 12 }}>
            <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,.06)" }} />
            <span style={{ fontSize: ".75rem", color: "rgba(168,192,216,.4)", fontWeight: 500 }}>
              অথবা
            </span>
            <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,.06)" }} />
          </div>

          {/* Google & Apple Social Login Buttons */}
          <button type="button" className="login-social-btn" onClick={handleQuickDemo} title="Google দিয়ে লগইন">
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            <span>Google দিয়ে লগইন</span>
          </button>

          <button type="button" className="login-social-btn" onClick={handleQuickDemo} title="Apple দিয়ে লগইন" style={{ marginBottom: 0 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.62-.75 1.04-1.8.92-2.85-.9.04-2 .6-2.65 1.35-.58.66-1.09 1.73-.95 2.76 1.01.08 2.06-.51 2.68-1.26z"/>
            </svg>
            <span>Apple দিয়ে লগইন</span>
          </button>

          {/* Quick Demo Button */}
          <div style={{ marginTop: 14, textAlign: "center" }}>
            <button
              type="button"
              onClick={handleQuickDemo}
              disabled={loading}
              style={{
                background: "rgba(0,214,143,.08)",
                border: "1px solid rgba(0,214,143,.2)",
                color: "#00D68F",
                fontSize: ".78rem",
                fontWeight: 700,
                cursor: "pointer",
                padding: "8px 18px",
                borderRadius: 999,
                transition: "all .2s",
              }}
            >
              ⚡ ১-ক্লিকে টেস্ট ভেন্ডর লগইন
            </button>
          </div>

          {/* Footer */}
          <div
            style={{
              marginTop: 26,
              textAlign: "center",
              fontSize: ".82rem",
              color: "rgba(168,192,216,.5)",
            }}
          >
            নতুন ভেন্ডর?{" "}
            <Link href="/signup" style={{ color: "#00D68F", fontWeight: 700, textDecoration: "none" }}>
              রেজিস্ট্রেশন করুন
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
