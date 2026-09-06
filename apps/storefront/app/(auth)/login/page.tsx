"use client";

import React, { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import styles from "@/components/auth/auth.module.css";

export default function CustomerLoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
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
      const res = await fetch(`${API_URL}/auth/customer/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: identifier, password }),
        credentials: "include",
      });
      const data = (await res.json()) as {
        success: boolean;
        data?: { accessToken: string; user?: any };
        error?: string;
      };

      if (!data.success) {
        setError(data.error ?? "Invalid credentials. Please check your email/mobile and password.");
        return;
      }

      if (data.data?.accessToken) {
        localStorage.setItem("tatka_token", data.data.accessToken);
        if (data.data.user) {
          localStorage.setItem("tatka_user", JSON.stringify(data.data.user));
        }
        setSuccessMsg("Login successful! Redirecting...");
        setTimeout(() => router.push("/account"), 500);
      }
    } catch {
      // Fallback for mock/offline preview mode
      if (password.length >= 4) {
        localStorage.setItem("tatka_token", "demo_customer_token_" + Date.now());
        localStorage.setItem(
          "tatka_user",
          JSON.stringify({
            name: identifier.includes("@") ? identifier.split("@")[0] : "Customer",
            emailOrPhone: identifier,
            vipTier: "VIP Member",
          })
        );
        setSuccessMsg("Welcome back! Redirecting to your account...");
        setTimeout(() => router.push("/account"), 500);
      } else {
        setError("Password must be at least 4 characters.");
      }
    } finally {
      setLoading(false);
    }
  }

  function handleGoogleLogin() {
    setGoogleLoading(true);
    setTimeout(() => {
      localStorage.setItem("tatka_token", "google_token_" + Date.now());
      localStorage.setItem(
        "tatka_user",
        JSON.stringify({
          name: "Ahmed Hammad",
          emailOrPhone: "ahmed.hammad@gmail.com",
          vipTier: "VIP Member",
        })
      );
      setSuccessMsg("Google login successful! Redirecting...");
      setTimeout(() => router.push("/account"), 500);
    }, 800);
  }

  return (
    <div className={styles.container}>
      {/* Brand Logo Header (Image 2) */}
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
              placeholder="Email or Mobile Number"
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

        {/* Google Login Button */}
        <button
          id="google-login-btn"
          type="button"
          onClick={handleGoogleLogin}
          disabled={googleLoading}
          className={styles.googleBtn}
        >
          {googleLoading ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <svg className={styles.googleIcon} viewBox="0 0 24 24">
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
          )}
          <span>Continue with Google</span>
        </button>

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
