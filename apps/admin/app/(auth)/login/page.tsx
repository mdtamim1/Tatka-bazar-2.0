"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";

export default function AdminLoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const API_URL = process.env["NEXT_PUBLIC_API_URL"] ?? "http://localhost:4000";

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const form = new FormData(e.currentTarget);
    const body = { email: form.get("email"), password: form.get("password") };

    try {
      const res = await fetch(`${API_URL}/auth/admin/login`, {
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
        localStorage.setItem("tatka_admin_token", data.data.accessToken);
        router.push("/dashboard");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className={styles.main}>
      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.logoMark}>
            <svg viewBox="0 0 32 32" fill="none" aria-hidden="true">
              <rect width="32" height="32" rx="8" fill="var(--color-primary)" />
              <path d="M9 22V12l7-5 7 5v10H19V15h-6v7H9z" fill="white" />
              <circle cx="16" cy="13" r="2" fill="var(--color-accent)" />
            </svg>
          </div>
          <div>
            <h1 className={styles.title}>Admin Panel</h1>
            <p className={styles.subtitle}>Tatka Bazar Internal</p>
          </div>
        </div>

        {error && (
          <div className={styles.error} role="alert">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
              <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm0 11a1 1 0 110-2 1 1 0 010 2zm.75-4.5h-1.5l-.25-4h2l-.25 4z"/>
            </svg>
            {error}
          </div>
        )}

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label htmlFor="admin-email" className={styles.label}>Email address</label>
            <input
              id="admin-email"
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="admin@tatkabazar.com"
              className={styles.input}
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="admin-password" className={styles.label}>Password</label>
            <input
              id="admin-password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              placeholder="••••••••"
              className={styles.input}
            />
          </div>
          <button id="admin-login-submit" type="submit" className={styles.btn} disabled={loading}>
            {loading ? <span className={styles.spinner} aria-hidden="true" /> : null}
            {loading ? "Signing in…" : "Sign In →"}
          </button>
        </form>

        <p className={styles.notice}>
          🔒 Restricted access. Unauthorised login attempts are logged.
        </p>
      </div>
    </main>
  );
}
