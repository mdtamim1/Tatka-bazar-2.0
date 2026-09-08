"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface SuspensionModalProps {
  isOpen: boolean;
  riderName?: string | undefined;
  reason?: string | undefined;
  suspendedAt?: string | undefined;
  onLogout: () => void;
}

export function SuspensionModal({
  isOpen,
  riderName,
  reason,
  suspendedAt,
  onLogout,
}: SuspensionModalProps) {
  const router = useRouter();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (!isOpen) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onLogout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, onLogout]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 999999,
        background: "rgba(5, 2, 4, 0.94)",
        backdropFilter: "blur(14px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "460px",
          background: "linear-gradient(180deg, #18090d 0%, #0c0406 100%)",
          border: "1px solid rgba(239, 68, 68, 0.4)",
          boxShadow: "0 0 50px rgba(239, 68, 68, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
          borderRadius: "20px",
          padding: "28px 24px",
          textAlign: "center",
          color: "#fff",
          position: "relative",
          animation: "cyberPulse 2s ease-in-out infinite",
        }}
      >
        {/* Neon Warning Icon */}
        <div
          style={{
            width: "68px",
            height: "68px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(239, 68, 68, 0.25) 0%, rgba(239, 68, 68, 0.05) 70%)",
            border: "2px solid #ef4444",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 16px",
            boxShadow: "0 0 25px rgba(239, 68, 68, 0.4)",
            fontSize: "30px",
          }}
        >
          🚫
        </div>

        {/* Title */}
        <h2
          style={{
            fontSize: "20px",
            fontWeight: 800,
            color: "#fca5a5",
            letterSpacing: "0.5px",
            marginBottom: "6px",
          }}
        >
          অ্যাকাউন্ট স্থগিত করা হয়েছে
        </h2>
        <p style={{ fontSize: "13px", color: "#9ca3af", marginBottom: "20px" }}>
          {riderName ? `${riderName}, আপনার` : "আপনার"} রাইডার অ্যাকাউন্টটি Hub অ্যাডমিন কর্তৃক সাময়িকভাবে সাসপেন্ড (স্থগিত) করা হয়েছে।
        </p>

        {/* Reason Card */}
        <div
          style={{
            background: "rgba(239, 68, 68, 0.08)",
            border: "1px solid rgba(239, 68, 68, 0.2)",
            borderRadius: "12px",
            padding: "14px",
            marginBottom: "20px",
            textAlign: "left",
          }}
        >
          <div style={{ fontSize: "11px", fontWeight: 700, color: "#ef4444", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "4px" }}>
            স্থগিতের কারণ:
          </div>
          <div style={{ fontSize: "14px", color: "#fee2e2", fontWeight: 600 }}>
            {reason || "অপারেশনাল নিয়ম লঙ্ঘনের কারণে সাময়িক স্থগিত"}
          </div>
          {suspendedAt && (
            <div style={{ fontSize: "11px", color: "#9ca3af", marginTop: "6px" }}>
              সময়: {new Date(suspendedAt).toLocaleString("bn-BD")}
            </div>
          )}
        </div>

        {/* Help & Support Info */}
        <div
          style={{
            fontSize: "12px",
            color: "#9ca3af",
            background: "rgba(255, 255, 255, 0.03)",
            borderRadius: "10px",
            padding: "10px",
            marginBottom: "20px",
          }}
        >
          📞 যেকোনো সহায়তার জন্য সাপোর্ট সেন্টারে যোগাযোগ করুন:
          <div style={{ color: "#38bdf8", fontWeight: 700, fontSize: "13px", marginTop: "2px" }}>
            01700-000000 (সকাল ৯টা - রাত ১১টা)
          </div>
        </div>

        {/* Logout countdown & button */}
        <div style={{ marginBottom: "12px", fontSize: "12px", color: "#f87171" }}>
          স্বয়ংক্রিয় লগআউট হচ্ছে: <span style={{ fontWeight: 800, fontSize: "15px" }}>{countdown}</span> সেকেন্ড...
        </div>

        <button
          onClick={onLogout}
          style={{
            width: "100%",
            padding: "12px",
            background: "linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)",
            color: "#fff",
            border: "none",
            borderRadius: "10px",
            fontSize: "14px",
            fontWeight: 700,
            cursor: "pointer",
            boxShadow: "0 4px 15px rgba(239, 68, 68, 0.4)",
            transition: "all 0.2s",
          }}
        >
          এখনই লগআউট করুন
        </button>
      </div>
    </div>
  );
}
