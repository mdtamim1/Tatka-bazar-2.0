"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import type { Metadata } from "next";
import styles from "./page.module.css";

export default function CustomerLoginPage() {
  const router = useRouter();
  const [tab, setTab] = useState<"login" | "register">("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const API_URL = process.env["NEXT_PUBLIC_API_URL"] ?? "http://localhost:4000";

  async function handleLogin(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const form = new FormData(e.currentTarget);
    const body = { email: form.get("email"), password: form.get("password") };

    try {
      const res = await fetch(`${API_URL}/auth/customer/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        credentials: "include",
      });
      const data = await res.json() as { success: boolean; data?: { accessToken: string }; error?: string };

      if (!data.success) {
        setError(data.error ?? "Login failed");
        return;
      }

      if (data.data?.accessToken) {
        localStorage.setItem("tatka_token", data.data.accessToken);
        router.push("/");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const form = new FormData(e.currentTarget);
    const body = {
      name: form.get("name"),
      email: form.get("email"),
      phone: form.get("phone"),
      password: form.get("password"),
    };

    try {
      const res = await fetch(`${API_URL}/auth/customer/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        credentials: "include",
      });
      const data = await res.json() as { success: boolean; data?: { accessToken: string }; error?: string };

      if (!data.success) {
        setError(data.error ?? "Registration failed");
        return;
      }

      if (data.data?.accessToken) {
        localStorage.setItem("tatka_token", data.data.accessToken);
        router.push("/");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className={styles.main}>
      {/* Background decoration */}
      <div className={styles.bgOrb1} aria-hidden="true" />
      <div className={styles.bgOrb2} aria-hidden="true" />
      <div className={styles.bgGrid} aria-hidden="true" />

      <div className={styles.card}>
        {/* Logo */}
        <div className={styles.logo}>
          <div className={styles.logoIcon}>
            <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <rect width="40" height="40" rx="12" fill="var(--color-primary)" />
              <path d="M12 28V16l8-6 8 6v12H24v-7h-8v7H12z" fill="white" />
              <circle cx="20" cy="17" r="2.5" fill="var(--color-accent)" />
            </svg>
          </div>
          <div>
            <h1 className={styles.logoText}>Tatka Bazar</h1>
            <p className={styles.logoTagline}>আপনার বিশ্বস্ত মার্কেটপ্লেস</p>
          </div>
        </div>

        {/* Tabs */}
        <div className={styles.tabs} role="tablist">
          <button
            id="tab-login"
            role="tab"
            aria-selected={tab === "login"}
            aria-controls="panel-login"
            className={`${styles.tab} ${tab === "login" ? styles.tabActive : ""}`}
            onClick={() => { setTab("login"); setError(null); }}
          >
            Login
          </button>
          <button
            id="tab-register"
            role="tab"
            aria-selected={tab === "register"}
            aria-controls="panel-register"
            className={`${styles.tab} ${tab === "register" ? styles.tabActive : ""}`}
            onClick={() => { setTab("register"); setError(null); }}
          >
            Register
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className={styles.errorBanner} role="alert">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
              <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm0 11a1 1 0 110-2 1 1 0 010 2zm.75-4.5h-1.5l-.25-4h2l-.25 4z"/>
            </svg>
            {error}
          </div>
        )}

        {/* Login Panel */}
        {tab === "login" && (
          <form
            id="panel-login"
            role="tabpanel"
            aria-labelledby="tab-login"
            className={styles.form}
            onSubmit={handleLogin}
          >
            <div className={styles.field}>
              <label htmlFor="login-email" className={styles.label}>Email</label>
              <input
                id="login-email"
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="you@example.com"
                className={styles.input}
              />
            </div>
            <div className={styles.field}>
              <label htmlFor="login-password" className={styles.label}>Password</label>
              <input
                id="login-password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                placeholder="••••••••"
                className={styles.input}
              />
              <a href="/forgot-password" className={styles.forgotLink}>Forgot password?</a>
            </div>
            <button id="login-submit" type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? <span className={styles.spinner} aria-hidden="true" /> : null}
              {loading ? "Signing in…" : "Sign In"}
            </button>
          </form>
        )}

        {/* Register Panel */}
        {tab === "register" && (
          <form
            id="panel-register"
            role="tabpanel"
            aria-labelledby="tab-register"
            className={styles.form}
            onSubmit={handleRegister}
          >
            <div className={styles.field}>
              <label htmlFor="reg-name" className={styles.label}>Full Name</label>
              <input
                id="reg-name"
                name="name"
                type="text"
                required
                autoComplete="name"
                placeholder="Your name"
                className={styles.input}
              />
            </div>
            <div className={styles.field}>
              <label htmlFor="reg-email" className={styles.label}>Email</label>
              <input
                id="reg-email"
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="you@example.com"
                className={styles.input}
              />
            </div>
            <div className={styles.field}>
              <label htmlFor="reg-phone" className={styles.label}>Phone</label>
              <input
                id="reg-phone"
                name="phone"
                type="tel"
                required
                autoComplete="tel"
                placeholder="01XXXXXXXXX"
                className={styles.input}
              />
            </div>
            <div className={styles.field}>
              <label htmlFor="reg-password" className={styles.label}>Password</label>
              <input
                id="reg-password"
                name="password"
                type="password"
                required
                autoComplete="new-password"
                minLength={8}
                placeholder="Min. 8 characters"
                className={styles.input}
              />
            </div>
            <button id="register-submit" type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? <span className={styles.spinner} aria-hidden="true" /> : null}
              {loading ? "Creating account…" : "Create Account"}
            </button>
          </form>
        )}

        <p className={styles.footer}>
          By continuing, you agree to our{" "}
          <a href="/terms">Terms of Service</a> and{" "}
          <a href="/privacy">Privacy Policy</a>.
        </p>
      </div>
    </main>
  );
}
