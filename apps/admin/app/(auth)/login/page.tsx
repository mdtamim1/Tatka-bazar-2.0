"use client";

import React, { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Zap, Eye, EyeOff, ShieldCheck, Loader2 } from "lucide-react";
import styles from "./page.module.css";

const API_URL = process.env["NEXT_PUBLIC_API_URL"] ?? "http://localhost:4000";

const DEMO_CREDS = [
  { label: "Super Admin", email: "admin@tatkabazar.com", password: "admin123" },
  { label: "Manager",     email: "manager@tatkabazar.com", password: "manager123" },
];

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd]   = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_URL}/auth/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });
      const data = await res.json() as {
        success: boolean;
        data?: { accessToken: string };
        error?: string;
      };

      if (!data.success) {
        setError(data.error ?? "Invalid credentials");
        setLoading(false);
        return;
      }

      if (data.data?.accessToken) {
        localStorage.setItem("tatka_admin_token", data.data.accessToken);
      }
      router.push("/dashboard");
    } catch {
      // Fallback for demo mode (no API running)
      if (email && password) {
        localStorage.setItem("tatka_admin_token", "demo-token");
        router.push("/dashboard");
      } else {
        setError("Unable to connect. Please enter credentials to proceed.");
        setLoading(false);
      }
    }
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--bg-body)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Background gradient */}
      <div style={{
        position: "absolute", inset: 0,
        background: "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(16,185,129,0.08) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", bottom: 0, right: 0,
        width: "400px", height: "400px",
        background: "radial-gradient(circle, rgba(99,102,241,0.06) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      <div style={{ width: "100%", maxWidth: "440px", position: "relative" }}>

        {/* Brand */}
        <div style={{ textAlign: "center", marginBottom: "36px" }}>
          <div style={{
            width: "58px", height: "58px",
            borderRadius: "16px",
            background: "linear-gradient(135deg, #10B981, #059669)",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 16px",
            boxShadow: "0 0 30px rgba(16,185,129,0.25)",
          }}>
            <Zap size={26} color="#fff" />
          </div>
          <h1 style={{ fontSize: "1.6rem", fontWeight: 900, color: "var(--text-0)", letterSpacing: "-0.02em", marginBottom: "6px" }}>
            Tatka Bazar
          </h1>
          <p style={{ fontSize: "0.85rem", color: "var(--text-3)" }}>Admin Control Panel · Secure Sign In</p>
        </div>

        {/* Card */}
        <div style={{
          background: "var(--bg-surface)",
          border: "1px solid var(--border-1)",
          borderRadius: "var(--r-xl)",
          padding: "32px",
          boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
        }}>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: "18px" }}>
              <label className="admin-label">Email Address</label>
              <input
                className="admin-input"
                type="email"
                name="email"
                placeholder="admin@tatkabazar.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div style={{ marginBottom: "24px" }}>
              <label className="admin-label">Password</label>
              <div style={{ position: "relative" }}>
                <input
                  className="admin-input"
                  type={showPwd ? "text" : "password"}
                  name="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  style={{ paddingRight: "44px" }}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  style={{
                    position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)",
                    background: "none", border: "none", cursor: "pointer", color: "var(--text-4)",
                    display: "flex", alignItems: "center",
                  }}
                  onClick={() => setShowPwd(v => !v)}
                >
                  {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {error && (
              <div style={{
                background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.3)",
                borderRadius: "var(--r-md)", padding: "10px 14px",
                fontSize: "0.82rem", color: "#F87171", marginBottom: "18px",
                display: "flex", alignItems: "center", gap: "8px",
              }}>
                ⚠ {error}
              </div>
            )}

            <button
              type="submit"
              className="admin-btn admin-btn-primary"
              style={{ width: "100%", justifyContent: "center", padding: "13px", fontSize: "0.9rem" }}
              disabled={loading}
            >
              {loading
                ? <><Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> Signing in…</>
                : <><ShieldCheck size={16} /> Sign In Securely</>
              }
            </button>
          </form>
        </div>

        {/* Demo credentials */}
        <div style={{
          marginTop: "16px", padding: "14px 18px",
          background: "var(--bg-surface)", border: "1px solid var(--border-1)",
          borderRadius: "var(--r-lg)",
        }}>
          <div style={{ fontSize: "0.70rem", fontWeight: 700, color: "var(--text-4)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "10px" }}>
            Demo Accounts
          </div>
          {DEMO_CREDS.map(c => (
            <button
              key={c.email}
              type="button"
              style={{
                display: "flex", alignItems: "center", gap: "10px", width: "100%",
                padding: "8px 10px", borderRadius: "var(--r-md)",
                background: "none", border: "none", cursor: "pointer",
                transition: "background 0.15s",
                marginBottom: "4px",
              }}
              onClick={() => { setEmail(c.email); setPassword(c.password); }}
              onMouseEnter={e => (e.currentTarget.style.background = "var(--bg-elevated)")}
              onMouseLeave={e => (e.currentTarget.style.background = "none")}
            >
              <div style={{
                width: "28px", height: "28px", borderRadius: "var(--r-sm)",
                background: "var(--green-glass)", display: "flex", alignItems: "center",
                justifyContent: "center", fontSize: "0.75rem", color: "var(--green)", fontWeight: 800,
              }}>
                {c.label[0]}
              </div>
              <div style={{ textAlign: "left" }}>
                <div style={{ fontSize: "0.80rem", fontWeight: 600, color: "var(--text-2)" }}>{c.label}</div>
                <div style={{ fontSize: "0.68rem", color: "var(--text-4)" }}>{c.email}</div>
              </div>
            </button>
          ))}
        </div>

        <p style={{ textAlign: "center", marginTop: "18px", fontSize: "0.70rem", color: "var(--text-4)" }}>
          🔒 Protected by Tatka Bazar Security · Bangladesh
        </p>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
