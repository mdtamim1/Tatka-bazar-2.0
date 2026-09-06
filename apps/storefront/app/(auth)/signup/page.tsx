"use client";

import React, { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import styles from "@/components/auth/auth.module.css";

export default function CustomerSignupPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

    // Generate 6-digit OTP for mandatory verification (user requirement: "obossoi otp verify kora lagfbe")
    const generatedOtp = "123456"; // Default testing demo code; in real setup, SMS/Email provider dispatches this

    // Store pending registration data for verification page
    sessionStorage.setItem(
      "tatka_pending_signup",
      JSON.stringify({
        name,
        emailOrPhone,
        password,
        otp: generatedOtp,
        createdAt: Date.now(),
      })
    );

    // Redirect to Image 4 Verify Page
    setTimeout(() => {
      router.push(`/verify?target=${encodeURIComponent(emailOrPhone)}`);
    }, 400);
  }

  function handleGoogleSignup() {
    setGoogleLoading(true);
    setTimeout(() => {
      const demoEmail = "ahmed.hammad@gmail.com";
      sessionStorage.setItem(
        "tatka_pending_signup",
        JSON.stringify({
          name: "Ahmed Hammad",
          emailOrPhone: demoEmail,
          password: "google_oauth_verified",
          otp: "123456",
          createdAt: Date.now(),
        })
      );
      router.push(`/verify?target=${encodeURIComponent(demoEmail)}`);
    }, 600);
  }

  return (
    <div className={styles.container}>
      {/* Brand Logo Header (Image 3) */}
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
              placeholder="Full Name"
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
              placeholder="Email or Mobile Number"
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
                placeholder="Confirm Password"
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

          {/* Terms and Conditions Checkbox (User Requirement) */}
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
                <span>Sending OTP verification...</span>
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

        {/* Google Signup Button (User Requirement: niche google login button diba) */}
        <button
          id="google-signup-btn"
          type="button"
          onClick={handleGoogleSignup}
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
          <span>Sign up with Google</span>
        </button>

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
