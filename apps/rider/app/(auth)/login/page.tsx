"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { login } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [tab, setTab] = useState<"email" | "phone">("email");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [step, setStep] = useState<"identifier" | "password">("identifier");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleNext(e: React.FormEvent) {
    e.preventDefault();
    if (!identifier.trim()) {
      setError(tab === "email" ? "ইমেইল এড্রেস প্রদান করুন" : "মোবাইল নম্বর প্রদান করুন");
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
      setError("পাসওয়ার্ড প্রদান করুন");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await login(identifier.trim(), password);
      if (res.success) {
        router.replace("/home");
      } else {
        setError(res.error || "লগইন ব্যর্থ হয়েছে। আবার চেষ্টা করুন।");
      }
    } catch {
      setError("নেটওয়ার্ক সমস্যা। আবার চেষ্টা করুন।");
    }
    setLoading(false);
  }

  // Quick Demo Login helper for testing
  async function handleQuickDemo() {
    setLoading(true);
    setError("");
    try {
      // Login with default seeded rider
      const res = await login("01700000001", "password123");
      if (res.success) {
        router.replace("/home");
      } else {
        // Fallback to sample rider
        const res2 = await login("rider1@tatkabazar.com", "password123");
        if (res2.success) {
          router.replace("/home");
        } else {
          setError(res.error || "ডেমো রাইডার একাউন্ট পাওয়া যায়নি");
        }
      }
    } catch {
      setError("লগইন করা সম্ভব হয়নি");
    }
    setLoading(false);
  }

  return (
    <div className="auth-viewport">
      <div className="auth-card">
        <div>
          {/* Top Bar: Close (X) & Help (?) */}
          <div className="auth-topbar">
            <button
              type="button"
              className="auth-icon-btn"
              onClick={() => {
                if (step === "password") {
                  setStep("identifier");
                  setError("");
                } else {
                  router.push("/home");
                }
              }}
              title="Close"
            >
              {step === "password" ? (
                <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              ) : (
                <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>

            <button
              type="button"
              className="auth-icon-btn"
              onClick={() => alert("সাহায্যের জন্য Tatka Bazar হেল্পলাইনে যোগাযোগ করুন: 01700-000000")}
              title="Help"
            >
              <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <circle cx="12" cy="12" r="9" strokeWidth="2" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3m.08 4h.01" />
              </svg>
            </button>
          </div>

          {/* Logo & Title */}
          <div className="auth-header">
            <div className="auth-logo-badge">
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
                  fill="#FFFFFF"
                  opacity="0.95"
                />
                <circle cx="12" cy="9" r="3.2" fill="#E60023" />
              </svg>
            </div>
            <h1 className="auth-title">Log in</h1>
            <div className="auth-subtitle">Tatka Bazar Delivery Partner</div>
          </div>

          {error && <div className="auth-error">{error}</div>}

          {step === "identifier" ? (
            <form onSubmit={handleNext}>
              {/* Segmented Pill Switcher (Email | Phone) */}
              <div className="auth-tabs">
                <button
                  type="button"
                  className={`auth-tab ${tab === "email" ? "active" : ""}`}
                  onClick={() => {
                    setTab("email");
                    setIdentifier("");
                    setError("");
                  }}
                >
                  Email
                </button>
                <button
                  type="button"
                  className={`auth-tab ${tab === "phone" ? "active" : ""}`}
                  onClick={() => {
                    setTab("phone");
                    setIdentifier("");
                    setError("");
                  }}
                >
                  Phone
                </button>
              </div>

              {/* Input Field */}
              <div className="auth-field">
                <label className="auth-label">
                  {tab === "email" ? "Email address" : "Phone number"}
                </label>
                <div className="auth-input-wrapper">
                  <input
                    id="login-identifier"
                    type={tab === "email" ? "email" : "tel"}
                    className="auth-input"
                    placeholder={tab === "email" ? "singersujonkhan9@gmail.com" : "017XXXXXXXX"}
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    required
                    autoFocus
                    autoComplete={tab === "email" ? "email" : "tel"}
                  />
                </div>
              </div>

              {/* Next Button */}
              <button id="auth-next-btn" type="submit" className="auth-btn-primary">
                Next
              </button>
            </form>
          ) : (
            <form onSubmit={handleLoginSubmit}>
              {/* Active identifier pill with change button */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  background: "#F4F4F5",
                  padding: "10px 14px",
                  borderRadius: 12,
                  marginBottom: 16,
                  fontSize: 14,
                }}
              >
                <span style={{ fontWeight: 600, color: "#18181B" }}>{identifier}</span>
                <button
                  type="button"
                  onClick={() => setStep("identifier")}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#E60023",
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Edit
                </button>
              </div>

              {/* Password Input */}
              <div className="auth-field">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <label className="auth-label">Password</label>
                  <span style={{ fontSize: 13, color: "#71717A", cursor: "pointer" }} onClick={() => alert("পাসওয়ার্ড ভুলে গেলে এডমিনের সাথে যোগাযোগ করুন: 01700-000000")}>
                    Forgot?
                  </span>
                </div>
                <div className="auth-input-wrapper">
                  <input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    className="auth-input"
                    placeholder="পাসওয়ার্ড লিখুন"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoFocus
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="auth-input-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
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

              {/* Login Submit Button */}
              <button id="auth-submit-btn" type="submit" className="auth-btn-primary" disabled={loading}>
                {loading ? (
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
                    <span>লগইন হচ্ছে...</span>
                  </div>
                ) : (
                  "Log in"
                )}
              </button>
            </form>
          )}

          {/* Divider: or */}
          <div className="auth-divider">
            <div className="auth-divider-line" />
            <div className="auth-divider-text">or</div>
            <div className="auth-divider-line" />
          </div>

          {/* Continue with Google */}
          <button
            type="button"
            className="auth-btn-secondary"
            onClick={handleQuickDemo}
            title="Continue with Google"
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>

          {/* Continue with Apple */}
          <button
            type="button"
            className="auth-btn-secondary"
            onClick={handleQuickDemo}
            title="Continue with Apple"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#000000">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.62-.75 1.04-1.8 0.92-2.85-.9.04-2 0.6-2.65 1.35-.58.66-1.09 1.73-.95 2.76 1.01.08 2.06-.51 2.68-1.26z" />
            </svg>
            <span>Continue with Apple</span>
          </button>

          {/* Instant Demo Rider Quick Login */}
          <div style={{ marginTop: 8, textAlign: "center" }}>
            <button
              type="button"
              onClick={handleQuickDemo}
              style={{
                background: "transparent",
                border: "none",
                color: "#E60023",
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                padding: "4px 8px",
              }}
            >
              ⚡ টেস্ট রাইডার হিসেবে ১-ক্লিকে লগইন করুন
            </button>
          </div>
        </div>

        {/* Bottom Footer: Sign up */}
        <div className="auth-footer">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="auth-footer-link">
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
}
