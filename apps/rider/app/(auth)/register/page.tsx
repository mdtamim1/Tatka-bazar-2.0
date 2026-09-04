"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { registerRider } from "@/lib/api";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [vehicleType, setVehicleType] = useState<"BICYCLE" | "MOTORCYCLE" | "VAN">("MOTORCYCLE");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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

    setLoading(true);
    setError("");

    try {
      const res = await registerRider({
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
        password,
        vehicleType,
      });

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

  return (
    <div className="auth-viewport">
      <div className="auth-card" style={{ minHeight: 740 }}>
        <div>
          {/* Top Bar */}
          <div className="auth-topbar">
            <Link href="/login" className="auth-icon-btn" title="Back to login">
              <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </Link>

            <button
              type="button"
              className="auth-icon-btn"
              onClick={() => alert("সাহায্যের জন্য Tatka Bazar হেল্পলাইনে যোগাযোগ করুন: 01700-000000")}
              title="Help"
            >
              <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <circle cx="12" cy="12" r="9" strokeWidth="2" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3m.08 4h.01" />
              </svg>
            </button>
          </div>

          {/* Header */}
          <div className="auth-header" style={{ marginBottom: 20 }}>
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
            <h1 className="auth-title">Sign up</h1>
            <div className="auth-subtitle">নতুন ডেলিভারি পার্টনার হিসেবে যোগ দিন</div>
          </div>

          {error && <div className="auth-error">{error}</div>}

          <form onSubmit={handleRegister}>
            {/* Name */}
            <div className="auth-field" style={{ marginBottom: 12 }}>
              <label className="auth-label">Full name</label>
              <input
                id="reg-name"
                type="text"
                className="auth-input"
                placeholder="যেমন: মোঃ সাকিব হাসান"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            {/* Phone */}
            <div className="auth-field" style={{ marginBottom: 12 }}>
              <label className="auth-label">Phone number</label>
              <input
                id="reg-phone"
                type="tel"
                className="auth-input"
                placeholder="017XXXXXXXX"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>

            {/* Email */}
            <div className="auth-field" style={{ marginBottom: 12 }}>
              <label className="auth-label">Email address (optional)</label>
              <input
                id="reg-email"
                type="email"
                className="auth-input"
                placeholder="rider@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {/* Password */}
            <div className="auth-field" style={{ marginBottom: 16 }}>
              <label className="auth-label">Password (min 6 chars)</label>
              <div className="auth-input-wrapper">
                <input
                  id="reg-password"
                  type={showPassword ? "text" : "password"}
                  className="auth-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
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

            {/* Vehicle Selection */}
            <div style={{ marginBottom: 20 }}>
              <label className="auth-label" style={{ display: "block", marginBottom: 8 }}>
                Delivery vehicle
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
                {[
                  { id: "MOTORCYCLE", label: "Motorcycle", icon: "🏍️" },
                  { id: "BICYCLE", label: "Bicycle", icon: "🚲" },
                  { id: "VAN", label: "Van", icon: "🛺" },
                ].map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => setVehicleType(v.id as any)}
                    style={{
                      padding: "10px 4px",
                      borderRadius: 12,
                      border: vehicleType === v.id ? "2px solid #18181B" : "1.5px solid #E4E4E7",
                      background: vehicleType === v.id ? "#F4F4F5" : "#FFFFFF",
                      color: "#18181B",
                      cursor: "pointer",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 4,
                      fontSize: 12,
                      fontWeight: vehicleType === v.id ? 700 : 500,
                      transition: "all 0.15s ease",
                    }}
                  >
                    <span style={{ fontSize: 20 }}>{v.icon}</span>
                    <span>{v.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <button id="reg-submit-btn" type="submit" className="auth-btn-primary" disabled={loading}>
              {loading ? (
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
                  <span>প্রসেসিং হচ্ছে...</span>
                </div>
              ) : (
                "Create account"
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="auth-footer">
          Already have an account?{" "}
          <Link href="/login" className="auth-footer-link">
            Log in
          </Link>
        </div>
      </div>
    </div>
  );
}
