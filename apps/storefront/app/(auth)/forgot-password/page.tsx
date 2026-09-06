"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Loader2, CheckCircle2 } from "lucide-react";
import styles from "@/components/auth/auth.module.css";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [identifier, setIdentifier] = useState("");
  const [digits, setDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Step 1: Send OTP to email or mobile
  function handleSendOtp(e: React.FormEvent) {
    e.preventDefault();
    if (!identifier.trim()) {
      setError("Please enter your registered email or mobile number.");
      return;
    }
    setError(null);
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      setStep(2);
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    }, 600);
  }

  // Step 2: Handle OTP input
  function handleDigitChange(index: number, val: string) {
    setError(null);
    const cleaned = val.replace(/[^0-9]/g, "");

    if (cleaned.length > 1) {
      const pasteDigits = cleaned.slice(0, 6).split("");
      const nextDigits = [...digits];
      pasteDigits.forEach((d, i) => {
        if (i < 6) nextDigits[i] = d;
      });
      setDigits(nextDigits);
      const nextFocus = Math.min(pasteDigits.length, 5);
      inputRefs.current[nextFocus]?.focus();
      return;
    }

    const nextDigits = [...digits];
    nextDigits[index] = cleaned;
    setDigits(nextDigits);

    if (cleaned && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  function fillDemoOtp() {
    setDigits(["6", "5", "4", "3", "2", "1"]);
    setError(null);
    inputRefs.current[5]?.focus();
  }

  function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    const code = digits.join("");
    if (code.length < 6) {
      setError("Please enter all 6 digits of the OTP code.");
      return;
    }

    setLoading(true);
    setError(null);

    setTimeout(() => {
      setLoading(false);
      setStep(3);
    }, 500);
  }

  // Step 3: Save New Password
  function handleResetPassword(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    setError(null);

    setTimeout(() => {
      setLoading(false);
      setSuccessMsg("Password reset successfully! Redirecting to login...");
      setTimeout(() => {
        router.push("/login");
      }, 1200);
    }, 700);
  }

  return (
    <div className={styles.container}>
      {/* Brand Logo */}
      <Link href="/" className={styles.brandLogo} title="Tatka Bazar Home">
        <div className={styles.logoIcon}>🌿</div>
        <div className={styles.logoText}>
          Tatka-bazar<span className={styles.logoDot}>.com</span>
        </div>
      </Link>

      {/* Main Card */}
      <div className={styles.card}>
        <h1 className={styles.title}>
          {step === 1 && "Reset Password"}
          {step === 2 && "Enter Reset Code"}
          {step === 3 && "Set New Password"}
        </h1>

        {step === 1 && (
          <p className={styles.subtitle}>
            Enter your email address or mobile number to receive a 6-digit password reset code.
          </p>
        )}

        {step === 2 && (
          <p className={styles.subtitle}>
            We sent a 6-digit code to <strong style={{ color: "#0f172a" }}>{identifier}</strong>.
            Enter it below to proceed.
          </p>
        )}

        {step === 3 && (
          <p className={styles.subtitle}>
            Create a secure new password for your Tatka Bazar account.
          </p>
        )}

        {error && <div className={styles.errorBanner}>⚠️ {error}</div>}
        {successMsg && (
          <div className={styles.successBanner}>
            <CheckCircle2 size={18} style={{ display: "inline", verticalAlign: "middle", marginRight: 6 }} />
            {successMsg}
          </div>
        )}

        {/* STEP 1: Enter Email or Phone */}
        {step === 1 && (
          <form onSubmit={handleSendOtp} className={styles.form}>
            <div className={styles.formGroup}>
              <label htmlFor="identifier" className={styles.label}>
                Email or Mobile Number
              </label>
              <input
                id="identifier"
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="Email or Mobile Number"
                className={styles.input}
              />
            </div>

            <button
              id="send-reset-otp-btn"
              type="submit"
              disabled={loading}
              className={styles.primaryBtn}
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Sending reset code...</span>
                </>
              ) : (
                "Send Reset Code"
              )}
            </button>
          </form>
        )}

        {/* STEP 2: 6-Digit Split OTP (Matching Image 4) */}
        {step === 2 && (
          <form onSubmit={handleVerifyOtp}>
            <div className={styles.otpRow}>
              <div className={styles.otpGroup}>
                {[0, 1, 2].map((idx) => (
                  <input
                    key={idx}
                    ref={(el) => {
                      inputRefs.current[idx] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={1}
                    value={digits[idx]}
                    onChange={(e) => handleDigitChange(idx, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(idx, e)}
                    className={styles.otpInput}
                    aria-label={`Digit ${idx + 1}`}
                  />
                ))}
              </div>

              <div className={styles.otpDash}>—</div>

              <div className={styles.otpGroup}>
                {[3, 4, 5].map((idx) => (
                  <input
                    key={idx}
                    ref={(el) => {
                      inputRefs.current[idx] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={1}
                    value={digits[idx]}
                    onChange={(e) => handleDigitChange(idx, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(idx, e)}
                    className={styles.otpInput}
                    aria-label={`Digit ${idx + 1}`}
                  />
                ))}
              </div>
            </div>

            <div style={{ textAlign: "center" }}>
              <div
                className={styles.demoOtpPill}
                onClick={fillDemoOtp}
                title="Click to auto-fill test code"
              >
                <span>💡 [টেস্ট কোড]:</span>
                <strong style={{ letterSpacing: 2 }}>654321</strong>
              </div>
            </div>

            <button
              id="verify-reset-otp-btn"
              type="submit"
              disabled={loading || digits.some((d) => !d)}
              className={styles.primaryBtn}
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Verifying...</span>
                </>
              ) : (
                "Verify Code"
              )}
            </button>

            <div style={{ textAlign: "center", marginTop: 16 }}>
              <button
                type="button"
                onClick={() => setStep(1)}
                style={{
                  background: "none",
                  border: "none",
                  color: "#64748b",
                  fontSize: "0.82rem",
                  textDecoration: "underline",
                  cursor: "pointer",
                }}
              >
                ← Back to edit email/number
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: Set New Password */}
        {step === 3 && (
          <form onSubmit={handleResetPassword} className={styles.form}>
            <div className={styles.formGroup}>
              <label htmlFor="newPassword" className={styles.label}>
                New Password
              </label>
              <div className={styles.inputWrapper}>
                <input
                  id="newPassword"
                  type={showPassword ? "text" : "password"}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="New Password (min 6 characters)"
                  className={styles.input}
                />
                <button
                  type="button"
                  className={styles.eyeBtn}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="confirmPassword" className={styles.label}>
                Confirm New Password
              </label>
              <input
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm New Password"
                className={styles.input}
              />
            </div>

            <button
              id="save-new-password-btn"
              type="submit"
              disabled={loading}
              className={styles.primaryBtn}
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Saving new password...</span>
                </>
              ) : (
                "Save Password & Login"
              )}
            </button>
          </form>
        )}

        {/* Return to Login */}
        <div className={styles.footerText}>
          Remember your password?{" "}
          <Link href="/login" className={styles.footerLink}>
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
