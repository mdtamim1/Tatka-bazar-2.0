"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Loader2, CheckCircle2 } from "lucide-react";
import styles from "@/components/auth/auth.module.css";

function VerifyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [target, setTarget] = useState("your email or phone");
  const [isPhone, setIsPhone] = useState(false);
  const [digits, setDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [countdown, setCountdown] = useState(45);
  const [canResend, setCanResend] = useState(false);

  const API_URL = process.env["NEXT_PUBLIC_API_URL"] ?? "http://localhost:4000";
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // 1. Check query param or sessionStorage
    const queryTarget = searchParams.get("target");
    let pendingUser: any = null;
    try {
      const raw = sessionStorage.getItem("tatka_pending_signup");
      if (raw) pendingUser = JSON.parse(raw);
    } catch {}

    const resolved = queryTarget || pendingUser?.emailOrPhone || "user@example.com";
    setTarget(resolved);

    // Check if phone or email
    const phoneRegex = /^[0-9+ ]{8,15}$/;
    setIsPhone(!resolved.includes("@") && phoneRegex.test(resolved.replace(/[^0-9+]/g, "")));

    // Auto-focus first input
    setTimeout(() => {
      inputRefs.current[0]?.focus();
    }, 150);

    // Resend countdown timer
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [searchParams]);

  function handleDigitChange(index: number, val: string) {
    setError(null);
    const cleaned = val.replace(/[^0-9]/g, "");

    // Handle paste of full 6-digit code
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

    // Auto-advance to next input
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
    setDigits(["1", "2", "3", "4", "5", "6"]);
    setError(null);
    inputRefs.current[5]?.focus();
  }

  async function handleVerify(e?: React.FormEvent) {
    if (e) e.preventDefault();
    const code = digits.join("");
    if (code.length < 6) {
      setError("Please enter all 6 digits of the verification code.");
      return;
    }

    setLoading(true);
    setError(null);

    // Retrieve pending signup info
    let pendingData: any = null;
    try {
      const raw = sessionStorage.getItem("tatka_pending_signup");
      if (raw) pendingData = JSON.parse(raw);
    } catch {}

    // Verify OTP via backend if phone, or allow sandbox code 123456
    if (isPhone && code !== "123456") {
      try {
        const verifyRes = await fetch(`${API_URL}/api/otp/verify`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone: target, otp: code }),
        });
        const verifyData = await verifyRes.json();
        if (!verifyData.success) {
          setError(verifyData.message || verifyData.error || "Invalid OTP code. Please try again.");
          setLoading(false);
          return;
        }
      } catch (err: any) {
        // In local development or offline preview, allow fallback
        if (code !== "123456") {
          setError("Verification service error: " + err.message);
          setLoading(false);
          return;
        }
      }
    } else if (!isPhone && code !== "123456") {
      // Email verify code check (sandbox acceptance)
      if (pendingData?.otp && code !== pendingData.otp) {
        setError("Invalid verification code. Please check and try again.");
        setLoading(false);
        return;
      }
    }

    // Connect to real PostgreSQL database: Register user!
    try {
      const regRes = await fetch("/api/auth/customer/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: pendingData?.name || (target.includes("@") ? target.split("@")[0] : "Customer"),
          identifier: target,
          password: pendingData?.password || "TatkaSecure123!",
        }),
      });

      const regData = await regRes.json();

      if (!regData.success) {
        // If user is already registered in DB, try logging in
        if (regData.error?.includes("already exists")) {
          const loginRes = await fetch("/api/auth/customer/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              identifier: target,
              password: pendingData?.password || "TatkaSecure123!",
            }),
          });
          const loginData = await loginRes.json();
          if (loginData.success && loginData.data?.accessToken) {
            localStorage.setItem("tatka_token", loginData.data.accessToken);
            localStorage.setItem("tatka_user", JSON.stringify(loginData.data.user));
            sessionStorage.removeItem("tatka_pending_signup");
            setSuccess(true);
            setTimeout(() => router.push("/account"), 800);
            return;
          }
        }
        setError(regData.error || "Registration failed. Please try again.");
        setLoading(false);
        return;
      }

      // Success! Persist real token & user
      if (regData.data?.accessToken) {
        localStorage.setItem("tatka_token", regData.data.accessToken);
      }
      if (regData.data?.user) {
        localStorage.setItem("tatka_user", JSON.stringify(regData.data.user));
      }

      sessionStorage.removeItem("tatka_pending_signup");
      setSuccess(true);
      setTimeout(() => {
        router.push("/account");
      }, 900);
    } catch (err: any) {
      setError("Database connection error: " + (err.message || "Failed to save user"));
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    if (!canResend) return;
    setCanResend(false);
    setCountdown(45);
    setError(null);

    if (isPhone) {
      try {
        await fetch(`${API_URL}/api/otp/send`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone: target }),
        });
      } catch {}
    }
    alert(`A new verification code has been dispatched to ${target}! (Sandbox OTP: 123456)`);
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

      {/* Main Verify Card */}
      <div className={styles.card}>
        <h1 className={styles.title}>
          {isPhone ? "Verify your phone" : "Verify your email"}
        </h1>

        <p className={styles.subtitle}>
          We sent a six-digit code to your {isPhone ? "mobile phone" : "inbox"}. Enter it below to
          finish opening the workspace. <strong style={{ color: "#0f172a" }}>{target}</strong>
        </p>

        {error && <div className={styles.errorBanner}>⚠️ {error}</div>}

        {success ? (
          <div className={styles.successBanner} style={{ textAlign: "center", padding: "18px" }}>
            <CheckCircle2 size={32} style={{ margin: "0 auto 8px", color: "#10b981" }} />
            <div style={{ fontSize: "1rem", fontWeight: 800 }}>Account verified & saved to database!</div>
            <div style={{ fontSize: "0.82rem", color: "#065f46", marginTop: 4 }}>
              Redirecting to your account dashboard...
            </div>
          </div>
        ) : (
          <form onSubmit={handleVerify}>
            {/* 6-Digit Split Inputs: [3 boxes] - [3 boxes] */}
            <div className={styles.otpRow}>
              {/* Group 1: 3 boxes */}
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

              {/* Middle Dash (-) */}
              <div className={styles.otpDash}>—</div>

              {/* Group 2: 3 boxes */}
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

            {/* Sandbox OTP Helper Pill */}
            <div style={{ textAlign: "center" }}>
              <div
                id="demo-otp-pill-btn"
                className={styles.demoOtpPill}
                onClick={fillDemoOtp}
                title="Click to auto-fill sandbox code"
              >
                <span>💡 [স্যান্ডবক্স ওটিপি]:</span>
                <strong style={{ letterSpacing: 2 }}>123456</strong>
              </div>
            </div>

            {/* Verify Button */}
            <button
              id="verify-submit-btn"
              type="submit"
              disabled={loading || digits.some((d) => !d)}
              className={styles.primaryBtn}
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Connecting to database...</span>
                </>
              ) : (
                isPhone ? "Verify phone" : "Verify email"
              )}
            </button>
          </form>
        )}

        {/* Resend Code Link */}
        <div className={styles.footerText}>
          {canResend ? (
            <button
              type="button"
              onClick={handleResend}
              style={{
                background: "none",
                border: "none",
                color: "#0f172a",
                fontWeight: 600,
                textDecoration: "underline",
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              Resend code
            </button>
          ) : (
            <span style={{ color: "#94a3b8" }}>
              Resend code in <strong style={{ color: "#0f172a" }}>{countdown}s</strong>
            </span>
          )}
        </div>

        {/* Edit email/phone */}
        <div style={{ textAlign: "center", marginTop: 10 }}>
          <Link
            href="/signup"
            style={{ fontSize: "0.8rem", color: "#64748b", textDecoration: "underline" }}
          >
            Wrong email or number? Edit
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function CustomerVerifyPage() {
  return (
    <Suspense
      fallback={
        <div className={styles.container}>
          <div className={styles.card} style={{ textAlign: "center", padding: 40 }}>
            <Loader2 size={32} className="animate-spin" style={{ margin: "0 auto" }} />
          </div>
        </div>
      }
    >
      <VerifyContent />
    </Suspense>
  );
}
