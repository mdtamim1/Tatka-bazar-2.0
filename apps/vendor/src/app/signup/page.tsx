"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useVendorStore } from "@/store/vendorStore";

// Animated floating orbs (Same as Rider Portal)
function Orbs() {
  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
      <div
        style={{
          position: "absolute",
          width: 320,
          height: 320,
          borderRadius: "50%",
          top: "-60px",
          right: "-60px",
          background: "radial-gradient(circle, rgba(0,214,143,.22) 0%, transparent 70%)",
          animation: "orbFloat1 9s ease-in-out infinite",
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 260,
          height: 260,
          borderRadius: "50%",
          bottom: "8%",
          left: "-50px",
          background: "radial-gradient(circle, rgba(0,214,143,.16) 0%, transparent 70%)",
          animation: "orbFloat2 11s ease-in-out infinite",
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 180,
          height: 180,
          borderRadius: "50%",
          top: "45%",
          right: "20%",
          background: "radial-gradient(circle, rgba(129,140,248,.1) 0%, transparent 70%)",
          animation: "orbFloat3 13s ease-in-out infinite",
        }}
      />
    </div>
  );
}

export default function SignupPage() {
  const router = useRouter();
  const { updateProfile, setRole } = useVendorStore();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [storeName, setStoreName] = useState("");
  const [category, setCategory] = useState("কাঁচাবাজার");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const categories = [
    { id: "কাঁচাবাজার", label: "কাঁচাবাজার", icon: "🥬" },
    { id: "মাছ ও মাংস", label: "মাছ ও মাংস", icon: "🐟" },
    { id: "ফলমূল", label: "ফলমূল", icon: "🍎" },
    { id: "গ্রোসারি", label: "ডেইরি ও গ্রোসারি", icon: "🥛" },
  ];

  function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError("আপনার পুরো নাম লিখুন");
      return;
    }
    if (phone.trim().length < 11) {
      setError("১১ ডিজিটের সঠিক মোবাইল নম্বর দিন");
      return;
    }
    if (!storeName.trim()) {
      setError("আপনার দোকানের নাম লিখুন");
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

    setTimeout(() => {
      updateProfile({
        ownerName: name.trim(),
        phone: phone.trim(),
        storeName: storeName.trim(),
        storeNameBn: storeName.trim(),
        category: category,
      });
      setRole("OWNER");
      router.replace("/");
    }, 600);
  }

  function handleQuickFill() {
    setName("রফিকুল ইসলাম");
    setPhone("01711223344");
    setStoreName("সবুজ খামার অর্গানিক");
    setCategory("কাঁচাবাজার");
    setPassword("password123");
    setAgreeTerms(true);
    setError("");
  }

  return (
    <>
      <style>{`
        @keyframes orbFloat1 { 0%,100%{transform:translate(0,0) scale(1);} 50%{transform:translate(-25px,20px) scale(1.06);} }
        @keyframes orbFloat2 { 0%,100%{transform:translate(0,0) scale(1);} 50%{transform:translate(20px,-25px) scale(1.04);} }
        @keyframes orbFloat3 { 0%,100%{transform:translate(0,0) scale(1);} 50%{transform:translate(-12px,18px) scale(1.09);} }
        @keyframes slideUp { from{opacity:0;transform:translateY(28px);} to{opacity:1;transform:translateY(0);} }

        .reg-input {
          width: 100%;
          background: rgba(255,255,255,.05);
          border: 1.5px solid rgba(255,255,255,.10);
          border-radius: 14px;
          padding: 13px 16px;
          font-size: .95rem;
          color: #F0F6FF;
          outline: none;
          transition: all .25s ease;
          box-sizing: border-box;
          font-family: inherit;
        }
        .reg-input::placeholder { color: rgba(168,192,216,.38); }
        .reg-input:focus {
          border-color: rgba(0,214,143,.6);
          background: rgba(0,214,143,.06);
          box-shadow: 0 0 0 3px rgba(0,214,143,.12);
        }
        .reg-input-pw { padding-right: 50px; }

        .reg-btn {
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
        .reg-btn:hover:not(:disabled) {
          transform: translateY(-2px) scale(1.01);
          box-shadow: 0 14px 40px rgba(0,214,143,.5);
        }
        .reg-btn:active:not(:disabled) { transform: scale(.97); }
        .reg-btn:disabled { opacity: .55; cursor: not-allowed; }

        .reg-category-btn {
          padding: 10px 4px;
          border-radius: 12px;
          border: 1.5px solid rgba(255,255,255,.10);
          background: rgba(255,255,255,.03);
          color: rgba(168,192,216,.7);
          cursor: pointer;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          font-size: 11px;
          font-weight: 500;
          transition: all .2s ease;
          font-family: inherit;
        }
        .reg-category-btn.active {
          border-color: rgba(0,214,143,.7);
          background: rgba(0,214,143,.12);
          color: #FF8C5A;
          font-weight: 700;
          box-shadow: 0 0 18px rgba(0,214,143,.2);
        }
        .reg-category-btn:hover:not(.active) {
          border-color: rgba(255,255,255,.25);
          background: rgba(255,255,255,.06);
          color: #F0F6FF;
        }

        .reg-terms-box {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 12px 14px;
          background: rgba(255,255,255,.03);
          border: 1.5px solid rgba(255,255,255,.08);
          border-radius: 14px;
          cursor: pointer;
          transition: all .2s ease;
          user-select: none;
        }
        .reg-terms-box:hover {
          background: rgba(0,214,143,.05);
          border-color: rgba(0,214,143,.25);
        }
        .reg-terms-box.checked {
          background: rgba(0,214,143,.07);
          border-color: rgba(0,214,143,.45);
          box-shadow: 0 0 16px rgba(0,214,143,.1);
        }
        .reg-checkbox {
          width: 18px;
          height: 18px;
          border-radius: 5px;
          border: 2px solid rgba(255,255,255,.2);
          background: rgba(255,255,255,.05);
          flex-shrink: 0;
          margin-top: 2px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all .2s ease;
        }
        .reg-checkbox.checked {
          background: linear-gradient(135deg, #00D68F, #00B87A);
          border-color: #00D68F;
          box-shadow: 0 0 12px rgba(0,214,143,.4);
        }
      `}</style>

      {/* Dark gradient background */}
      <div
        style={{
          minHeight: "100dvh",
          background: "linear-gradient(160deg, #050810 0%, #0D0F1E 40%, #080C18 75%, #050810 100%)",
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px 16px",
          fontFamily: "var(--font-bn), 'Inter', system-ui, sans-serif",
        }}
      >
        <Orbs />

        {/* Dot-grid overlay */}
        <div
          style={{
            position: "fixed",
            inset: 0,
            pointerEvents: "none",
            zIndex: 0,
            backgroundImage: "radial-gradient(rgba(255,255,255,.04) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />

        {/* Glass Card */}
        <div
          style={{
            position: "relative",
            zIndex: 1,
            width: "100%",
            maxWidth: 440,
            background: "rgba(15,30,50,.80)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            border: "1px solid rgba(255,255,255,.09)",
            borderRadius: 28,
            boxShadow: "0 32px 80px rgba(0,0,0,.5), inset 0 1px 0 rgba(255,255,255,.07)",
            padding: "32px 28px",
            animation: mounted ? "slideUp .55s cubic-bezier(.22,1,.36,1) both" : "none",
          }}
        >
          {/* Top Bar */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <Link
              href="/login"
              style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                background: "rgba(255,255,255,.06)",
                border: "1px solid rgba(255,255,255,.08)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "rgba(168,192,216,.8)",
                textDecoration: "none",
                transition: "all .2s ease",
              }}
              title="লগইন পেজে যান"
            >
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </Link>

            <button
              type="button"
              onClick={() => alert("ভেন্ডর পার্টনারশিপ হেল্পলাইন: 01700-000000")}
              style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                background: "rgba(255,255,255,.06)",
                border: "1px solid rgba(255,255,255,.08)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "rgba(168,192,216,.8)",
                cursor: "pointer",
                transition: "all .2s ease",
              }}
              title="হেল্পলাইন"
            >
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <circle cx="12" cy="12" r="9" strokeWidth="2" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3m.08 4h.01" />
              </svg>
            </button>
          </div>

          {/* Logo + Title */}
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <div
              style={{
                width: 68,
                height: 68,
                borderRadius: 20,
                background: "linear-gradient(135deg, #00D68F, #00B87A)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 12px",
                fontSize: "2rem",
                boxShadow: "0 12px 36px rgba(0,214,143,.4)",
              }}
            >
              🏪
            </div>
            <h1 style={{ fontSize: "1.6rem", fontWeight: 900, color: "#F0F6FF", margin: "0 0 4px", letterSpacing: "-0.5px" }}>
              ভেন্ডর রেজিস্ট্রেশন
            </h1>
            <p style={{ fontSize: ".82rem", color: "rgba(168,192,216,.65)", margin: 0 }}>
              Tatka Bazar Merchant Network
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div
              style={{
                background: "rgba(239,68,68,.12)",
                border: "1px solid rgba(239,68,68,.3)",
                color: "#FCA5A5",
                borderRadius: 12,
                padding: "10px 14px",
                fontSize: ".82rem",
                marginBottom: 16,
                textAlign: "center",
              }}
            >
              {error}
            </div>
          )}

          {/* Registration Form */}
          <form onSubmit={handleRegister} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <label style={{ display: "block", fontSize: ".76rem", fontWeight: 600, color: "rgba(168,192,216,.8)", marginBottom: 6 }}>
                আপনার নাম (মালিক)
              </label>
              <input
                type="text"
                className="reg-input"
                placeholder="যেমন: রফিকুল ইসলাম"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setError("");
                }}
                required
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: ".76rem", fontWeight: 600, color: "rgba(168,192,216,.8)", marginBottom: 6 }}>
                মোবাইল নম্বর
              </label>
              <input
                type="tel"
                className="reg-input"
                placeholder="017XXXXXXXX"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  setError("");
                }}
                required
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: ".76rem", fontWeight: 600, color: "rgba(168,192,216,.8)", marginBottom: 6 }}>
                দোকানের নাম
              </label>
              <input
                type="text"
                className="reg-input"
                placeholder="যেমন: সবুজ খামার ফ্রেশ বাজার"
                value={storeName}
                onChange={(e) => {
                  setStoreName(e.target.value);
                  setError("");
                }}
                required
              />
            </div>

            {/* Shop Category Selection */}
            <div>
              <label style={{ display: "block", fontSize: ".76rem", fontWeight: 600, color: "rgba(168,192,216,.8)", marginBottom: 6 }}>
                দোকানের ক্যাটাগরি
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6 }}>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    className={`reg-category-btn ${category === cat.id ? "active" : ""}`}
                    onClick={() => setCategory(cat.id)}
                  >
                    <span style={{ fontSize: "1.2rem" }}>{cat.icon}</span>
                    <span style={{ fontSize: "10px", lineHeight: 1.2 }}>{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Password */}
            <div>
              <label style={{ display: "block", fontSize: ".76rem", fontWeight: 600, color: "rgba(168,192,216,.8)", marginBottom: 6 }}>
                পাসওয়ার্ড
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  className="reg-input reg-input-pw"
                  placeholder="কমপক্ষে ৬ অক্ষর"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError("");
                  }}
                  required
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
                    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                    </svg>
                  ) : (
                    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Terms & Conditions Checkbox */}
            <div
              className={`reg-terms-box ${agreeTerms ? "checked" : ""}`}
              onClick={() => setAgreeTerms(!agreeTerms)}
            >
              <div className={`reg-checkbox ${agreeTerms ? "checked" : ""}`}>
                {agreeTerms && (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <span style={{ fontSize: ".78rem", color: "rgba(168,192,216,.8)", lineHeight: 1.4 }}>
                আমি Tatka Bazar এর{" "}
                <span style={{ color: "#00D68F", fontWeight: 700 }}>Terms & Conditions</span> এবং{" "}
                <span style={{ color: "#00D68F", fontWeight: 700 }}>Privacy Policy</span> মেনে নিচ্ছি
              </span>
            </div>

            {/* Submit Button */}
            <button id="vendor-reg-btn" type="submit" className="reg-btn" disabled={loading}>
              {loading ? "একাউন্ট তৈরি হচ্ছে..." : "✨ ভেন্ডর একাউন্ট তৈরি করুন"}
            </button>
          </form>

          {/* 1-Click Fast Demo Fill Button */}
          <div style={{ marginTop: 14, textAlign: "center" }}>
            <button
              type="button"
              onClick={handleQuickFill}
              style={{
                background: "rgba(0,214,143,.08)",
                border: "1px solid rgba(0,214,143,.2)",
                color: "#00D68F",
                fontSize: ".76rem",
                fontWeight: 700,
                cursor: "pointer",
                padding: "6px 14px",
                borderRadius: 999,
                fontFamily: "var(--font-bn)",
              }}
            >
              ⚡ ডেমো ডাটা অটো-ফিল
            </button>
          </div>

          {/* Footer */}
          <div style={{ marginTop: 24, textAlign: "center", fontSize: ".82rem", color: "rgba(168,192,216,.5)" }}>
            ইতিমধ্যে একাউন্ট আছে?{" "}
            <Link href="/login" style={{ color: "#00D68F", fontWeight: 700, textDecoration: "none" }}>
              লগইন করুন
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
