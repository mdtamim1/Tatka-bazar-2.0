"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Eye, EyeOff, AlertCircle, Shield } from "lucide-react";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    if (result.success) {
      router.replace("/dashboard");
    } else {
      setError(result.error || "লগইন ব্যর্থ হয়েছে");
    }
  }

  return (
    <div className="login-page">
      {/* Ambient glows */}
      <div className="login-bg-glow" style={{ background: "var(--accent-green)", top: "-200px", left: "-200px" }} />
      <div className="login-bg-glow" style={{ background: "var(--accent-purple)", bottom: "-200px", right: "-200px" }} />

      <div className="login-card">
        <div className="login-logo">🛡️</div>
        <h1 className="login-title">Tatka Bazar Hub</h1>
        <p className="login-subtitle font-bn">
          hub.tatkabazar.com — Control Panel
        </p>

        {error && (
          <div className="login-error">
            <AlertCircle size={15} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">ইমেইল (Hub Email)</label>
            <input
              id="hub-email"
              type="email"
              className="form-input"
              placeholder="admin@tatkabazar.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>
          <div className="form-group">
            <label className="form-label">পাসওয়ার্ড</label>
            <div style={{ position: "relative" }}>
              <input
                id="hub-password"
                type={showPass ? "text" : "password"}
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                style={{ paddingRight: 40 }}
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                style={{
                  position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)",
                  background: "none", border: "none", color: "var(--text-muted)",
                }}
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            id="hub-login-btn"
            type="submit"
            className="btn btn-primary w-full"
            style={{ justifyContent: "center", padding: "11px 20px", fontSize: 14 }}
            disabled={loading}
          >
            {loading ? (
              <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ width: 14, height: 14, border: "2px solid rgba(0,0,0,0.3)", borderTopColor: "#000", borderRadius: "50%", animation: "spin 0.6s linear infinite", display: "inline-block" }} />
                লগইন হচ্ছে...
              </span>
            ) : (
              <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Shield size={15} />
                Hub-এ প্রবেশ করুন
              </span>
            )}
          </button>
        </form>

        <div style={{ marginTop: 24, padding: "14px", background: "rgba(255,255,255,0.03)", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)" }}>
          <p style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 8, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Demo Credentials
          </p>
          {[
            { role: "Super Admin", email: "admin@tatkabazar.com", pass: "tatka@2026", color: "var(--accent-green)" },
            { role: "Ops Manager", email: "ops@tatkabazar.com", pass: "ops@2026", color: "var(--accent-blue)" },
            { role: "Support Agent", email: "support@tatkabazar.com", pass: "support@2026", color: "var(--accent-orange)" },
          ].map((c) => (
            <button
              key={c.email}
              onClick={() => { setEmail(c.email); setPassword(c.pass); }}
              style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                width: "100%", background: "none", border: "none",
                padding: "5px 0", cursor: "pointer",
              }}
            >
              <span style={{ fontSize: 11, color: c.color, fontWeight: 600 }}>{c.role}</span>
              <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{c.email}</span>
            </button>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
