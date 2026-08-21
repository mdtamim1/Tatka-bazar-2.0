"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";

export default function RiderLoginPage() {
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
      const res = await fetch(`${API_URL}/auth/rider/login`, {
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
        localStorage.setItem("tatka_rider_token", data.data.accessToken);
        router.push("/dashboard");
      }
    } catch {
      setError("Network error. Check your connection.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className={styles.main}>
      <div className={styles.card}>
        {/* Icon */}
        <div className={styles.icon} aria-hidden="true">🛵</div>
        <h1 className={styles.title}>Rider Sign In</h1>
        <p className={styles.subtitle}>Tatka Bazar Delivery</p>

        {error && (
          <div className={styles.error} role="alert">{error}</div>
        )}

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label htmlFor="rider-email" className={styles.label}>Email</label>
            <input
              id="rider-email"
              name="email"
              type="email"
              required
              inputMode="email"
              autoComplete="email"
              placeholder="rider@tatkabazar.com"
              className={styles.input}
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="rider-password" className={styles.label}>Password</label>
            <input
              id="rider-password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              placeholder="••••••••"
              className={styles.input}
            />
          </div>
          <button id="rider-login-submit" type="submit" className={styles.btn} disabled={loading}>
            {loading
              ? <span className={styles.spinner} aria-hidden="true" />
              : <span aria-hidden="true">▶</span>}
            {loading ? "Signing in…" : "Start Deliveries"}
          </button>
        </form>
      </div>
    </main>
  );
}
