"use client";

import { useEffect } from "react";

export default function OfflinePage() {
  useEffect(() => {
    const handleOnline = () => {
      window.location.reload();
    };
    window.addEventListener("online", handleOnline);
    return () => window.removeEventListener("online", handleOnline);
  }, []);

  return (
    <div style={{
      minHeight: "100dvh",
      background: "linear-gradient(160deg, #050810 0%, #08111E 50%, #0D1929 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "column",
      padding: "24px",
      textAlign: "center",
      color: "#F0F6FF",
    }}>
      {/* Animated icon */}
      <div style={{
        width: 100, height: 100, borderRadius: "50%",
        background: "rgba(255,107,43,0.15)",
        border: "2px solid rgba(255,107,43,0.4)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: "3rem", marginBottom: 28,
      }}>
        🛵
      </div>

      <h1 style={{
        fontSize: "1.5rem", fontWeight: 900,
        margin: "0 0 12px",
        background: "linear-gradient(135deg, #FF6B2B, #ffb300)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
      }}>
        ইন্টারনেট সংযোগ নেই
      </h1>

      <p style={{
        fontSize: ".9rem", color: "rgba(168,192,216,.75)",
        maxWidth: 300, margin: "0 0 32px", lineHeight: 1.6,
      }}>
        আপনার নেটওয়ার্ক সংযোগ চেক করুন। সংযোগ ফিরলে অ্যাপ স্বয়ংক্রিয়ভাবে রিফ্রেশ হবে।
      </p>

      <button
        type="button"
        onClick={() => window.location.reload()}
        style={{
          padding: "14px 32px",
          background: "linear-gradient(135deg, #FF6B2B, #E05520)",
          color: "#fff", border: "none", borderRadius: "14px",
          fontSize: ".95rem", fontWeight: 700, cursor: "pointer",
          boxShadow: "0 8px 30px rgba(255,107,43,.4)",
        }}
      >
        🔄 পুনরায় চেষ্টা করুন
      </button>
    </div>
  );
}
