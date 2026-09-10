"use client";

import React, { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import styles from "@/components/auth/auth.module.css";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";

export default function CustomerLoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const API_URL = process.env["NEXT_PUBLIC_API_URL"] ?? "http://localhost:4000";

  async function handleLogin(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    const form = new FormData(e.currentTarget);
    const identifier = String(form.get("identifier") || "").trim();
    const password = String(form.get("password") || "").trim();

    if (!identifier) {
      setError("Please enter your email or mobile number.");
      setLoading(false);
      return;
    }

    if (!password) {
      setError("Please enter your password.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/customer/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
        credentials: "include",
      });

      const data = (await res.json()) as {
        success: boolean;
        data?: { accessToken: string; user?: any };
        error?: string;
        message?: string;
      };

      if (!data.success) {
        setError(data.message || data.error || "Invalid credentials. Please check your email/mobile and password.");
        return;
      }

      if (data.data?.accessToken) {
        localStorage.setItem("tatka_token", data.data.accessToken);
        if (data.data.user) {
          localStorage.setItem("tatka_user", JSON.stringify(data.data.user));
        }
        setSuccessMsg("Login successful! Redirecting...");
        setTimeout(() => router.push("/account"), 600);
      }
    } catch (err: any) {
      setError(
        "Cannot connect to the server at " + API_URL + ". Please ensure the backend API is running."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.container}>
      {/* Brand Logo Header */}
      <Link href="/" className={styles.brandLogo} title="Tatka Bazar Home">
        <div className={styles.logoIcon}>🌿</div>
        <div className={styles.logoText}>
          Tatka-bazar<span className={styles.logoDot}>.com</span>
        </div>
      </Link>

      {/* Main Login Card */}
      <div className={styles.card}>
        <h1 className={styles.title}>Login</h1>

        {error && <div className={styles.errorBanner}>⚠️ {error}</div>}
        {successMsg && <div className={styles.successBanner}>✅ {successMsg}</div>}

        <form onSubmit={handleLogin} className={styles.form}>
          {/* Email or Mobile Number */}
          <div className={styles.formGroup}>
            <label htmlFor="identifier" className={styles.label}>
              Email or Mobile Number
            </label>
            <input
              id="identifier"
              name="identifier"
              type="text"
              required
              autoComplete="username"
              placeholder="e.g. 017XXXXXXXX or user@gmail.com"
              className={styles.input}
            />
          </div>

          {/* Password with Forgot password link */}
          <div className={styles.formGroup}>
            <div className={styles.labelRow}>
              <label htmlFor="password" className={styles.label}>
                Password
              </label>
              <Link href="/forgot-password" className={styles.forgotLink}>
                Forgot password?
              </Link>
            </div>
            <div className={styles.inputWrapper}>
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                required
                autoComplete="current-password"
                placeholder="Password"
                className={styles.input}
              />
              <button
                type="button"
                className={styles.eyeBtn}
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Login Submit Button */}
          <button
            id="login-submit-btn"
            type="submit"
            disabled={loading}
            className={styles.primaryBtn}
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Logging in...</span>
              </>
            ) : (
              "Login"
            )}
          </button>
        </form>

        {/* Divider */}
        <div className={styles.divider}>
          <span>Or continue with</span>
        </div>

        {/* Real Google Login Button */}
        <GoogleSignInButton
          mode="login"
          onError={(err) => setError(err)}
          onSuccess={() => {
            setSuccessMsg("Google login successful! Redirecting...");
            setTimeout(() => router.push("/account"), 600);
          }}
        />

        {/* Footer Link */}
        <div className={styles.footerText}>
          Need an account?{" "}
          <Link href="/signup" className={styles.footerLink}>
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
}
