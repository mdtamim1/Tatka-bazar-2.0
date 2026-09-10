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

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [step, setStep] = useState<"identifier" | "password">("identifier");
  const [showPassword, setShowPassword] = useState(false);
  const [loginType, setLoginType] = useState<"OWNER" | "STAFF">("OWNER");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);
  const [suspendedNotice, setSuspendedNotice] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("reason") === "suspended") {
        setSuspendedNotice(
          params.get("message") || "আপনার ভেন্ডর শপটি Hub অ্যাডমিন কর্তৃক সাময়িকভাবে স্থগিত (Suspended) করা হয়েছে।"
        );
      }
    }
  }, []);

  function handleNext(e: React.FormEvent) {
    e.preventDefault();
    const cleanPhone = identifier.trim().replace(/[^0-9]/g, "");
    if (!cleanPhone || cleanPhone.length < 11) {
      setError("১১ ডিজিটের সঠিক মোবাইল নম্বর দিন");
      return;
    }
    setError("");
    setStep("password");
  }

  async function checkVendorSuspension(vendorIdOrPhone: string): Promise<string | null> {
    try {
      const localRes = await fetch(`/api/sync/events?vendorId=${encodeURIComponent(vendorIdOrPhone)}`);
      if (localRes.ok) {
        const localJson = await localRes.json();
        if (localJson.isSuspended) {
          return localJson.data?.suspendReason || "ভেন্ডর শপ স্থগিত করা হয়েছে";
        }
      }
      const hubUrls = [
        `https://hub-gamma-umber.vercel.app/api/public/status?type=vendor&id=${encodeURIComponent(vendorIdOrPhone)}`,
        `http://localhost:3004/api/public/status?type=vendor&id=${encodeURIComponent(vendorIdOrPhone)}`,
      ];
      for (const hUrl of hubUrls) {
        try {
          const hubRes = await fetch(hUrl);
          if (hubRes.ok) {
            const hubJson = await hubRes.json();
            if (hubJson.success && hubJson.data?.isSuspended) {
              return hubJson.data.suspendReason || "Hub অ্যাডমিন কর্তৃক সাময়িক স্থগিত করা হয়েছে";
            }
          }
        } catch {}
      }
    } catch {}
    return null;
  }

  async function handleLoginSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!password) {
      setError("পাসওয়ার্ড দিন");
      return;
    }
    setLoading(true);
    setError("");

    // Suspension check
    const suspendReason = await checkVendorSuspension(identifier.trim());
    if (suspendReason) {
      setError(`🚫 শপ স্থগিত: ${suspendReason}। সহায়তার জন্য ভেন্ডর সাপোর্টে যোগাযোগ করুন: 01700-000000`);
      setLoading(false);
      return;
    }

    setTimeout(() => {
      setRole(loginType);
      router.replace("/");
    }, 600);
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

          {/* Suspended Notice Banner */}
          {suspendedNotice && (
            <div
              style={{
                background: "rgba(239,68,68,.18)",
                border: "1px solid rgba(239,68,68,.5)",
                boxShadow: "0 0 20px rgba(239,68,68,.2)",
                borderRadius: 14,
                padding: "12px 16px",
                fontSize: ".84rem",
                color: "#FCA5A5",
                textAlign: "left",
                marginBottom: 16,
                fontFamily: "var(--font-bn)",
                display: "flex",
                gap: 10,
                alignItems: "flex-start",
              }}
            >
              <span style={{ fontSize: "20px", flexShrink: 0 }}>🚫</span>
              <div>
                <div style={{ fontWeight: 800, color: "#FEE2E2", marginBottom: 2 }}>
                  ভেন্ডর শপ স্থগিত করা হয়েছে
                </div>
                <div>{suspendedNotice}</div>
                <div style={{ fontSize: ".76rem", color: "#A8C0D8", marginTop: 4 }}>
                  সহায়তার জন্য ভেন্ডর হেল্পডেস্কে যোগাযোগ করুন: 01700-000000
                </div>
              </div>
            </div>
          )}

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
              <div style={{ marginBottom: 20 }}>
                <label
                  style={{
                    display: "block",
                    fontSize: ".78rem",
                    fontWeight: 600,
                    color: "rgba(168,192,216,.8)",
                    marginBottom: 8,
                  }}
                >
                  মোবাইল নম্বর
                </label>
                <input
                  id="vendor-login-identifier"
                  type="tel"
                  className="login-input"
                  placeholder="017XXXXXXXX"
                  value={identifier}
                  onChange={(e) => {
                    setIdentifier(e.target.value);
                    setError("");
                  }}
                  required
                  autoFocus
                  autoComplete="tel"
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
