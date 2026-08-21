"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";

export default function VendorLoginPage() {
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
      const res = await fetch(`${API_URL}/auth/vendor/login`, {
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
        localStorage.setItem("tatka_vendor_token", data.data.accessToken);
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
          <div className={styles.badge}>VENDOR PORTAL</div>
          <h1 className={styles.title}>Welcome back</h1>
          <p className={styles.subtitle}>Sign in to manage your products and orders</p>
        </div>

        {error && (
          <div className={styles.error} role="alert">{error}</div>
        )}

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label htmlFor="vendor-email" className={styles.label}>Business Email</label>
            <input id="vendor-email" name="email" type="email" required
              placeholder="vendor@yourbusiness.com" className={styles.input} />
          </div>
          <div className={styles.field}>
            <label htmlFor="vendor-password" className={styles.label}>Password</label>
            <input id="vendor-password" name="password" type="password" required
              placeholder="••••••••" className={styles.input} />
          </div>
          <button id="vendor-login-submit" type="submit" className={styles.btn} disabled={loading}>
            {loading ? <span className={styles.spinner} aria-hidden="true" /> : null}
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>

        <p className={styles.help}>
          Don't have an account? Contact{" "}
          <a href="mailto:vendors@tatkabazar.com">vendors@tatkabazar.com</a>
        </p>
      </div>
    </main>
  );
}
