"use client";

import React, { useState, useEffect } from "react";

export function PwaPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [showOnlineToast, setShowOnlineToast] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Check if running as installed standalone PWA
    const standaloneCheck =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;
    setIsStandalone(standaloneCheck);

    // Initial online status
    setIsOnline(navigator.onLine);

    // Capture PWA beforeinstallprompt
    const handleBeforeInstall = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    // Network status listeners
    const handleOnline = () => {
      setIsOnline(true);
      setShowOnlineToast(true);
      setTimeout(() => setShowOnlineToast(false), 4000);
    };
    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Register Service Worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  async function handleInstallClick() {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setIsInstallable(false);
      setDeferredPrompt(null);
    }
  }

  return (
    <>
      {/* ── Offline Warning Bar ── */}
      {!isOnline && (
        <div
          style={{
            background: "linear-gradient(90deg, #b45309 0%, #d97706 100%)",
            color: "#ffffff",
            padding: "6px 14px",
            fontSize: ".74rem",
            fontWeight: 700,
            fontFamily: "var(--font-bn)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
          }}
        >
          <span>⚠️</span>
          <span>আপনি অফলাইনে আছেন — ক্যাশ করা ডেটা দেখানো হচ্ছে</span>
        </div>
      )}

      {/* ── Re-connected Toast ── */}
      {showOnlineToast && (
        <div
          style={{
            position: "fixed",
            top: "16px",
            left: "50%",
            transform: "translateX(-50%)",
            background: "#10b981",
            color: "#ffffff",
            padding: "8px 18px",
            borderRadius: "999px",
            fontSize: ".76rem",
            fontWeight: 800,
            fontFamily: "var(--font-bn)",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            boxShadow: "0 4px 16px rgba(16, 185, 129, 0.4)",
            zIndex: 10000,
            animation: "fadeIn 0.3s ease-out",
          }}
        >
          <span>🟢</span>
          <span>ইন্টারনেট পুনঃস্থাপিত হয়েছে — লাইভ ডেটা সিঙ্ক হচ্ছে</span>
        </div>
      )}

      {/* ── Install PWA Floating or Header Banner ── */}
      {isInstallable && !isStandalone && (
        <div
          style={{
            background: "linear-gradient(135deg, rgba(255, 107, 43, 0.15) 0%, rgba(255, 107, 43, 0.05) 100%)",
            border: "1px solid rgba(255, 107, 43, 0.35)",
            borderRadius: "var(--r-md)",
            padding: "8px 14px",
            margin: "8px 12px 0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "1.2rem" }}>📲</span>
            <div>
              <div style={{ fontSize: ".76rem", fontWeight: 800, color: "var(--text-1)", fontFamily: "var(--font-bn)" }}>
                তাতকা রাইডার অ্যাপ ইনস্টল করুন
              </div>
              <div style={{ fontSize: ".66rem", color: "var(--text-3)", fontFamily: "var(--font-bn)" }}>
                হোমস্ক্রিন থেকে ১-ট্যাপে সরাসরি অ্যাপ ওপেন করুন
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={handleInstallClick}
            style={{
              background: "var(--orange)",
              color: "#ffffff",
              border: "none",
              borderRadius: "999px",
              padding: "6px 14px",
              fontSize: ".72rem",
              fontWeight: 800,
              fontFamily: "var(--font-bn)",
              cursor: "pointer",
              boxShadow: "0 2px 8px rgba(255, 107, 43, 0.4)",
              whiteSpace: "nowrap",
            }}
          >
            ইনস্টল করুন
          </button>
        </div>
      )}
    </>
  );
}
