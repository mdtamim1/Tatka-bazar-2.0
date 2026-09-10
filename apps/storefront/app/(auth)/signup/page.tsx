"use client";

import React, { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import styles from "@/components/auth/auth.module.css";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";

export default function CustomerSignupPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const API_URL = process.env["NEXT_PUBLIC_API_URL"] ?? "http://localhost:4000";

  async function handleSignup(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const form = new FormData(e.currentTarget);
    const name = String(form.get("name") || "").trim();
    const emailOrPhone = String(form.get("emailOrPhone") || "").trim();
    const password = String(form.get("password") || "").trim();
    const confirmPassword = String(form.get("confirmPassword") || "").trim();

    if (!name) {
      setError("Please enter your full name.");
      setLoading(false);
      return;
    }

    if (!emailOrPhone) {
      setError("Please enter your email address or mobile number.");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match. Please re-enter.");
      setLoading(false);
      return;
    }

    if (!agreedTerms) {
      setError("You must agree to the Terms of Service and Privacy Policy to continue.");
      setLoading(false);
      return;
    }

    // If phone number, trigger OTP dispatch via backend
    const isPhone = !emailOrPhone.includes("@") && emailOrPhone.replace(/[^0-9]/g, "").length >= 8;
    if (isPhone) {
      try {
        await fetch(`${API_URL}/api/otp/send`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone: emailOrPhone }),
        });
      } catch {
        // Continue to verify screen even if SMS gateway is in sandbox
      }
    }

    // Store pending registration data for verification page
    sessionStorage.setItem(
      "tatka_pending_signup",
      JSON.stringify({
        name,
        emailOrPhone,
        password,
        createdAt: Date.now(),
      })
    );

    // Redirect to Verify Page
    router.push(`/verify?target=${encodeURIComponent(emailOrPhone)}`);
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

      {/* Main Signup Card */}
      <div className={styles.card}>
        <h1 className={styles.title}>Signup</h1>

        {error && <div className={styles.errorBanner}>⚠️ {error}</div>}

        <form onSubmit={handleSignup} className={styles.form}>
          {/* Full Name */}
          <div className={styles.formGroup}>
            <label htmlFor="name" className={styles.label}>
              Full Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              autoComplete="name"
              placeholder="e.g. Tanvir Hasan"
              className={styles.input}
            />
          </div>

          {/* Email or Mobile Number */}
          <div className={styles.formGroup}>
            <label htmlFor="emailOrPhone" className={styles.label}>
              Email or Mobile Number
            </label>
            <input
              id="emailOrPhone"
              name="emailOrPhone"
              type="text"
              required
              autoComplete="username"
              placeholder="e.g. 017XXXXXXXX or user@gmail.com"
              className={styles.input}
            />
          </div>

          {/* Password */}
          <div className={styles.formGroup}>
            <label htmlFor="password" className={styles.label}>
              Password
            </label>
            <div className={styles.inputWrapper}>
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                required
                autoComplete="new-password"
                placeholder="At least 6 characters"
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

          {/* Confirm Password */}
          <div className={styles.formGroup}>
            <label htmlFor="confirmPassword" className={styles.label}>
              Confirm Password
            </label>
            <div className={styles.inputWrapper}>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                required
                autoComplete="new-password"
                placeholder="Confirm your password"
                className={styles.input}
              />
              <button
                type="button"
                className={styles.eyeBtn}
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Terms and Conditions Checkbox */}
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={agreedTerms}
              onChange={(e) => setAgreedTerms(e.target.checked)}
              className={styles.checkboxInput}
            />
            <span>
              I agree to the{" "}
              <Link href="/about" className={styles.footerLink} target="_blank">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/about" className={styles.footerLink} target="_blank">
                Privacy Policy
              </Link>
            </span>
          </label>

          {/* Create Account Submit Button */}
          <button
            id="signup-submit-btn"
            type="submit"
            disabled={loading}
            className={styles.primaryBtn}
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Creating your account...</span>
              </>
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        {/* Divider */}
        <div className={styles.divider}>
          <span>Or continue with</span>
        </div>

        {/* Real Google Signup Button */}
        <GoogleSignInButton
          mode="signup"
          onError={(err) => setError(err)}
          onSuccess={() => {
            router.push("/account");
          }}
        />

        {/* Footer Link */}
        <div className={styles.footerText}>
          Already a user?{" "}
          <Link href="/login" className={styles.footerLink}>
            Login
          </Link>
        </div>
      </div>
    </div>
  );
}
