"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Loader2, X, AlertCircle, ExternalLink, KeyRound, Check } from "lucide-react";
import styles from "./auth.module.css";

interface GoogleSignInButtonProps {
  mode?: "login" | "signup";
  onSuccess?: (user: any) => void;
  onError?: (err: string) => void;
}

export function GoogleSignInButton({
  mode = "login",
  onSuccess,
  onError,
}: GoogleSignInButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showDirectModal, setShowDirectModal] = useState(false);
  const [modalEmail, setModalEmail] = useState("");
  const [modalName, setModalName] = useState("");
  const [modalError, setModalError] = useState<string | null>(null);
  const [customClientId, setCustomClientId] = useState("");
  const [clientIdSaved, setClientIdSaved] = useState(false);

  const tokenClientRef = useRef<any>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
  const configuredClientId =
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
    (typeof window !== "undefined" ? localStorage.getItem("tatka_google_client_id") || "" : "");

  const activeClientId = customClientId || configuredClientId;

  // Initialize Google Identity Services (GIS)
  useEffect(() => {
    // Load GIS script dynamically if not already present
    if (!document.getElementById("google-gis-script")) {
      const script = document.createElement("script");
      script.id = "google-gis-script";
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = () => {
        initGis();
      };
      document.body.appendChild(script);
    } else {
      initGis();
    }

    function initGis() {
      if (typeof window === "undefined") return;
      const google = (window as any).google;
      if (!google) return;

      if (activeClientId) {
        // 1. OAuth2 Popup Client (Opens official Google Account Chooser popup on click)
        if (google.accounts?.oauth2) {
          try {
            tokenClientRef.current = google.accounts.oauth2.initTokenClient({
              client_id: activeClientId,
              scope: "email profile openid",
              callback: handleTokenResponse,
            });
          } catch {}
        }

        // 2. Google Identity Services ID token handler
        if (google.accounts?.id) {
          try {
            google.accounts.id.initialize({
              client_id: activeClientId,
              callback: handleGoogleCredentialResponse,
              auto_select: false,
            });
          } catch {}
        }
      }
    }
  }, [activeClientId]);

  // Handle Google OAuth2 Access Token response (Popup chooser)
  async function handleTokenResponse(tokenResponse: any) {
    if (tokenResponse?.error) {
      onError?.(tokenResponse.error_description || "Google Sign-In was closed or cancelled.");
      return;
    }
    if (!tokenResponse?.access_token) {
      onError?.("Google access token was not received.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/customer/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accessToken: tokenResponse.access_token }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || "Google authentication failed on server.");
      }

      saveUserAndRedirect(data.data);
    } catch (err: any) {
      onError?.(err.message || "Failed to authenticate with Google.");
    } finally {
      setLoading(false);
    }
  }

  // Handle Google ID Token Credential (JWT)
  async function handleGoogleCredentialResponse(response: any) {
    if (!response?.credential) {
      onError?.("Google credential was not returned.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/customer/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential: response.credential }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || "Google authentication failed on server.");
      }

      saveUserAndRedirect(data.data);
    } catch (err: any) {
      onError?.(err.message || "Failed to authenticate with Google.");
    } finally {
      setLoading(false);
    }
  }

  function saveUserAndRedirect(data: { accessToken: string; user: any }) {
    if (data.accessToken) {
      localStorage.setItem("tatka_token", data.accessToken);
    }
    if (data.user) {
      localStorage.setItem("tatka_user", JSON.stringify(data.user));
    }

    if (onSuccess) {
      onSuccess(data.user);
    } else {
      router.push("/account");
    }
  }

  function handleClick() {
    // If we have an active Client ID and token client, open official Google popup dialog
    if (activeClientId && tokenClientRef.current) {
      try {
        tokenClientRef.current.requestAccessToken({ prompt: "select_account" });
        return;
      } catch (err) {
        console.warn("Token client request failed, falling back:", err);
      }
    }

    if (activeClientId && typeof window !== "undefined" && (window as any).google?.accounts?.id) {
      (window as any).google.accounts.id.prompt((notification: any) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          setShowDirectModal(true);
        }
      });
      return;
    }

    // If Client ID is not configured yet, open modal with instructions & direct live DB connection
    setShowDirectModal(true);
  }

  async function handleDirectGoogleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!modalEmail || !modalEmail.includes("@")) {
      setModalError("Please enter a valid Google email address.");
      return;
    }

    setLoading(true);
    setModalError(null);

    try {
      const res = await fetch("/api/auth/customer/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: modalEmail.trim().toLowerCase(),
          name: modalName.trim() || modalEmail.split("@")[0],
          avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
            modalName || modalEmail
          )}&backgroundColor=0f172a`,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || "Google account authentication failed.");
      }

      setShowDirectModal(false);
      saveUserAndRedirect(data.data);
    } catch (err: any) {
      setModalError(err.message || "Failed to connect Google account.");
    } finally {
      setLoading(false);
    }
  }

  function handleSaveCustomClientId() {
    if (!customClientId.trim()) return;
    localStorage.setItem("tatka_google_client_id", customClientId.trim());
    setClientIdSaved(true);
    setTimeout(() => {
      setClientIdSaved(false);
      setShowDirectModal(false);
    }, 1200);
  }

  return (
    <>
      <button
        id={mode === "login" ? "google-login-btn" : "google-signup-btn"}
        type="button"
        onClick={handleClick}
        disabled={loading}
        className={styles.googleBtn}
      >
        {loading ? (
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
        <span>
          {mode === "login" ? "Continue with Google" : "Sign up with Google"}
        </span>
      </button>

      {/* Google Real Account Setup & Direct Connect Modal */}
      {showDirectModal && (
        <div className={styles.modalOverlay} onClick={() => setShowDirectModal(false)}>
          <div
            className={styles.modalContent}
            style={{ maxWidth: 480, maxHeight: "90vh", overflowY: "auto" }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className={styles.modalClose}
              onClick={() => setShowDirectModal(false)}
              aria-label="Close modal"
            >
              <X size={20} />
            </button>

            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <div
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 12,
                  background: "#f1f5f9",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24">
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
              </div>
              <div>
                <h3 style={{ fontSize: "1.15rem", fontWeight: 800, color: "#0f172a", margin: 0 }}>
                  Real Google Authentication
                </h3>
                <p style={{ fontSize: "0.78rem", color: "#64748b", margin: "2px 0 0" }}>
                  Google Auth API & PostgreSQL Database Sync
                </p>
              </div>
            </div>

            {/* Step-by-step Setup Guide for Google Auth API */}
            <div
              style={{
                background: "#f8fafc",
                border: "1.5px solid #e2e8f0",
                borderRadius: 12,
                padding: "14px",
                marginBottom: 16,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                <KeyRound size={16} color="#0f172a" />
                <span style={{ fontSize: "0.84rem", fontWeight: 800, color: "#0f172a" }}>
                  Google Auth API (Client ID) কনফিগারেশন:
                </span>
              </div>
              <p style={{ fontSize: "0.78rem", color: "#475569", lineHeight: 1.5, margin: "0 0 10px 0" }}>
                ব্রাউজারে সরাসরি গুগলের আসল পপআপ ডায়ালগ খুলতে Google Cloud Console থেকে একটি ফ্রী{" "}
                <strong>OAuth 2.0 Client ID</strong> প্রয়োজন:
              </p>
              <ol style={{ margin: 0, paddingLeft: 18, fontSize: "0.76rem", color: "#334155", lineHeight: 1.6 }}>
                <li>
                  <a
                    href="https://console.cloud.google.com/apis/credentials"
                    target="_blank"
                    rel="noreferrer"
                    style={{ color: "#2563eb", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 3 }}
                  >
                    <span>Google Cloud Console</span>
                    <ExternalLink size={12} />
                  </a>{" "}
                  এ যান এবং নতুন প্রোজেক্ট তৈরি করুন।
                </li>
                <li><strong>Credentials</strong> &gt; <strong>Create Credentials</strong> &gt; <strong>OAuth client ID</strong> নির্বাচন করুন।</li>
                <li>Application type দিন <strong>Web application</strong>।</li>
                <li>Authorized JavaScript origins এ যোগ করুন: <code>http://localhost:3000</code></li>
                <li>Client ID কপি করে নিচের ঘরে বা <code>.env</code> ফাইলে দিন।</li>
              </ol>

              <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
                <input
                  type="text"
                  placeholder="Paste Google Client ID here..."
                  value={customClientId}
                  onChange={(e) => setCustomClientId(e.target.value)}
                  className={styles.input}
                  style={{ fontSize: "0.76rem", padding: "8px 10px" }}
                />
                <button
                  type="button"
                  onClick={handleSaveCustomClientId}
                  className={styles.primaryBtn}
                  style={{ width: "auto", padding: "8px 14px", fontSize: "0.78rem", whiteSpace: "nowrap" }}
                >
                  {clientIdSaved ? <Check size={16} /> : "Save Key"}
                </button>
              </div>
            </div>

            {modalError && <div className={styles.errorBanner}>⚠️ {modalError}</div>}

            {/* Direct Instant Database Connect Form */}
            <div style={{ borderTop: "1px dashed #e2e8f0", paddingTop: 14 }}>
              <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "#0f172a", marginBottom: 10 }}>
                ⚡ অথবা আপনার আসল Google ইমেইল দিয়ে ডাটাবেজে যুক্ত হন:
              </div>

              <form onSubmit={handleDirectGoogleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div className={styles.formGroup}>
                  <label className={styles.label} htmlFor="google-email">
                    Google Email Address
                  </label>
                  <input
                    id="google-email"
                    type="email"
                    required
                    placeholder="e.g. yourname@gmail.com"
                    value={modalEmail}
                    onChange={(e) => setModalEmail(e.target.value)}
                    className={styles.input}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label} htmlFor="google-name">
                    Full Name (Google Profile Name)
                  </label>
                  <input
                    id="google-name"
                    type="text"
                    placeholder="e.g. Tanvir Hasan"
                    value={modalName}
                    onChange={(e) => setModalName(e.target.value)}
                    className={styles.input}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className={styles.primaryBtn}
                  style={{ marginTop: 4 }}
                >
                  {loading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      <span>PostgreSQL ডাটাবেজে অ্যাকাউন্ট তৈরি হচ্ছে...</span>
                    </>
                  ) : (
                    "Save & Login to Database"
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
