"use client";

import React, { useState, useEffect, useRef } from "react";
import { triggerSosAlert } from "@/lib/api";
import { sound } from "@/lib/sound";

interface SosModalProps {
  isOpen: boolean;
  onClose: () => void;
  riderId: string;
  riderName: string;
  riderPhone?: string;
  onSosTriggered: () => void;
}

export function SosModal({
  isOpen,
  onClose,
  riderId,
  riderName,
  riderPhone = "01812345678",
  onSosTriggered,
}: SosModalProps) {
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    if (!isOpen) {
      if (timerRef.current) clearInterval(timerRef.current);
      setCountdown(null);
      setIsBroadcasting(false);
    }
  }, [isOpen]);

  function startCountdown() {
    setCountdown(3);
    sound.playSosSiren();

    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev === null) return null;
        if (prev <= 1) {
          clearInterval(timerRef.current);
          timerRef.current = null;
          dispatchSos();
          return 0;
        }
        sound.playSosSiren();
        return prev - 1;
      });
    }, 1000);
  }

  function cancelCountdown() {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setCountdown(null);
  }

  function dispatchSos() {
    setIsBroadcasting(true);

    // Get current position or fallback to Dhaka center
    if (typeof navigator !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          recordAndFinish(pos.coords.latitude, pos.coords.longitude);
        },
        () => {
          recordAndFinish(23.8103, 90.4125);
        },
        { enableHighAccuracy: true, timeout: 4000 }
      );
    } else {
      recordAndFinish(23.8103, 90.4125);
    }
  }

  function recordAndFinish(lat: number, lng: number) {
    triggerSosAlert({
      riderId,
      riderName,
      riderPhone,
      lat,
      lng,
      reason: "ইমার্জেন্সি এসওএস অ্যালার্ট সক্রিয়",
    });
    sound.playSosSiren();
    setIsBroadcasting(false);
    onSosTriggered();
    onClose();
  }

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(10, 0, 0, 0.88)",
        backdropFilter: "blur(8px)",
        zIndex: 10000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "420px",
          background: "linear-gradient(180deg, #1f0b0b 0%, #0d0404 100%)",
          border: "2px solid rgba(239, 68, 68, 0.7)",
          borderRadius: "24px",
          padding: "24px 20px",
          textAlign: "center",
          boxShadow: "0 0 50px rgba(239, 68, 68, 0.35)",
          color: "#fff",
          position: "relative",
          animation: "sos-pulse-border 1.5s ease-in-out infinite",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Siren Icon */}
        <div
          style={{
            width: "72px",
            height: "72px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(239,68,68,0.4) 0%, rgba(239,68,68,0.1) 70%)",
            border: "2px solid #ef4444",
            margin: "0 auto 16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "2.4rem",
            boxShadow: "0 0 24px rgba(239, 68, 68, 0.5)",
            animation: "pulse 1s ease-in-out infinite",
          }}
        >
          🚨
        </div>

        <h3
          style={{
            fontSize: "1.35rem",
            fontWeight: 800,
            color: "#fca5a5",
            marginBottom: "6px",
            fontFamily: "var(--font-bn)",
          }}
        >
          রাইডার ইমার্জেন্সি এসওএস
        </h3>
        <p
          style={{
            fontSize: ".80rem",
            color: "rgba(255, 255, 255, 0.75)",
            marginBottom: "20px",
            lineHeight: 1.5,
            fontFamily: "var(--font-bn)",
          }}
        >
          রাস্তায় কোনো দুর্ঘটনা, ছিনতাই বা বিপদের মুখোমুখি হলে নিচের বাটনে ট্যাপ করুন। কন্ট্রোল রুমে আপনার লাইভ লোকেশন চলে যাবে।
        </p>

        {/* Quick Call Buttons Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "18px" }}>
          <a
            href="tel:999"
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "12px 8px",
              borderRadius: "14px",
              background: "rgba(239, 68, 68, 0.15)",
              border: "1.5px solid rgba(239, 68, 68, 0.5)",
              color: "#fff",
              textDecoration: "none",
              fontWeight: 700,
              fontSize: ".82rem",
              fontFamily: "var(--font-bn)",
              gap: "4px",
            }}
          >
            <span style={{ fontSize: "1.4rem" }}>🚔</span>
            <span>জাতীয় জরুরি সেবা</span>
            <strong style={{ color: "#ef4444", fontSize: "1.05rem" }}>৯৯৯</strong>
          </a>

          <a
            href="tel:09612345678"
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "12px 8px",
              borderRadius: "14px",
              background: "rgba(245, 158, 11, 0.15)",
              border: "1.5px solid rgba(245, 158, 11, 0.5)",
              color: "#fff",
              textDecoration: "none",
              fontWeight: 700,
              fontSize: ".82rem",
              fontFamily: "var(--font-bn)",
              gap: "4px",
            }}
          >
            <span style={{ fontSize: "1.4rem" }}>🏢</span>
            <span>কন্ট্রোল রুম হটলাইন</span>
            <strong style={{ color: "#f59e0b", fontSize: ".88rem" }}>০৯৬১২৩৪৫৬৭৮</strong>
          </a>
        </div>

        {/* Broadcast SOS Trigger */}
        {countdown === null ? (
          <button
            type="button"
            onClick={startCountdown}
            style={{
              width: "100%",
              padding: "14px 18px",
              borderRadius: "16px",
              background: "linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)",
              color: "#fff",
              border: "none",
              fontWeight: 800,
              fontSize: ".96rem",
              fontFamily: "var(--font-bn)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              cursor: "pointer",
              boxShadow: "0 6px 24px rgba(239, 68, 68, 0.5)",
              letterSpacing: ".02em",
            }}
          >
            <span>🚨</span>
            <span>বিপদ সংকেত পাঠান (Broadcast SOS)</span>
          </button>
        ) : (
          <div
            style={{
              background: "rgba(239, 68, 68, 0.2)",
              border: "2px solid #ef4444",
              borderRadius: "16px",
              padding: "16px",
              marginBottom: "10px",
            }}
          >
            <div style={{ fontSize: "1.8rem", fontWeight: 900, color: "#ef4444", marginBottom: "4px" }}>
              {countdown > 0 ? countdown : "পাঠানো হচ্ছে..."}
            </div>
            <div style={{ fontSize: ".80rem", color: "#fca5a5", fontFamily: "var(--font-bn)", marginBottom: "12px" }}>
              {countdown > 0 ? "সেকেন্ডের মধ্যে বিপদ সংকেত ডিসপ্যাচ হবে..." : "লাইভ লোকেশন কন্ট্রোল রুমে যাচ্ছে..."}
            </div>
            <button
              type="button"
              onClick={cancelCountdown}
              style={{
                background: "rgba(255,255,255,0.15)",
                border: "1px solid rgba(255,255,255,0.3)",
                color: "#fff",
                borderRadius: "999px",
                padding: "6px 18px",
                fontSize: ".80rem",
                fontWeight: 700,
                fontFamily: "var(--font-bn)",
                cursor: "pointer",
              }}
            >
              বাতিল করুন ✕
            </button>
          </div>
        )}

        <button
          type="button"
          onClick={onClose}
          style={{
            marginTop: "14px",
            background: "transparent",
            border: "none",
            color: "rgba(255, 255, 255, 0.5)",
            fontSize: ".82rem",
            cursor: "pointer",
            fontFamily: "var(--font-bn)",
          }}
        >
          এখন বন্ধ করুন
        </button>
      </div>
    </div>
  );
}
