"use client";
import { useEffect, useState } from "react";

/**
 * UpdatePrompt — Detects when a new service worker version is deployed
 * and prompts the rider to refresh for the latest version.
 */
export function UpdatePrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    // Listen for SW update event dispatched by root layout.tsx
    const handleUpdate = () => setShowPrompt(true);
    window.addEventListener("sw_update_available", handleUpdate);
    return () => window.removeEventListener("sw_update_available", handleUpdate);
  }, []);

  const handleUpdate = async () => {
    setIsUpdating(true);
    try {
      const reg = await navigator.serviceWorker.getRegistration();
      if (reg?.waiting) {
        // Tell new SW to take control
        reg.waiting.postMessage({ type: "SKIP_WAITING" });
        // Reload when new SW activates
        navigator.serviceWorker.addEventListener("controllerchange", () => {
          window.location.reload();
        }, { once: true });
      } else {
        window.location.reload();
      }
    } catch {
      window.location.reload();
    }
  };

  if (!showPrompt) return null;

  return (
    <div style={{
      position: "fixed", bottom: "90px", left: "50%", transform: "translateX(-50%)",
      zIndex: 10005, width: "calc(100% - 32px)", maxWidth: 360,
      background: "linear-gradient(135deg, rgba(15,30,50,.96), rgba(8,17,30,.98))",
      backdropFilter: "blur(20px)",
      border: "1px solid rgba(255,107,43,.4)",
      borderRadius: "18px", padding: "16px 20px",
      boxShadow: "0 16px 48px rgba(0,0,0,.6), 0 0 0 1px rgba(255,107,43,.15)",
      animation: "slideUp .35s cubic-bezier(.34,1.56,.64,1)",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{
          width: 44, height: 44, borderRadius: "12px", flexShrink: 0,
          background: "linear-gradient(135deg, #FF6B2B, #E05520)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "1.3rem",
        }}>
          🛵
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: ".82rem", fontWeight: 800, color: "#F0F6FF", marginBottom: 2 }}>
            নতুন আপডেট পাওয়া গেছে!
          </div>
          <div style={{ fontSize: ".72rem", color: "rgba(168,192,216,.7)", fontFamily: "var(--font-bn)" }}>
            সেরা পারফরমেন্সের জন্য রিফ্রেশ করুন।
          </div>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 10, marginTop: 14 }}>
        <button
          onClick={() => setShowPrompt(false)}
          style={{
            padding: "10px 0", background: "rgba(255,255,255,.07)",
            border: "1px solid rgba(255,255,255,.1)", color: "rgba(168,192,216,.8)",
            borderRadius: "10px", fontSize: ".8rem", fontWeight: 600, cursor: "pointer",
            fontFamily: "var(--font-bn)",
          }}
        >
          পরে
        </button>
        <button
          onClick={handleUpdate}
          disabled={isUpdating}
          style={{
            padding: "10px 0",
            background: isUpdating ? "rgba(255,107,43,.4)" : "linear-gradient(135deg, #FF6B2B, #E05520)",
            border: "none", color: "#fff",
            borderRadius: "10px", fontSize: ".88rem", fontWeight: 700, cursor: "pointer",
            boxShadow: "0 4px 16px rgba(255,107,43,.4)",
            fontFamily: "var(--font-bn)",
          }}
        >
          {isUpdating ? "আপডেট হচ্ছে..." : "⚡ এখনই আপডেট করুন"}
        </button>
      </div>
    </div>
  );
}
