"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import confetti from "canvas-confetti";
import { CheckCircle2, ShoppingBag, ArrowRight, ShieldCheck } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("order") || "TB-LIVE";
  const { t, locale } = useLanguage();

  useEffect(() => {
    try {
      confetti({
        particleCount: 150,
        spread: 90,
        origin: { y: 0.6 },
      });
    } catch (e) {}
  }, []);

  return (
    <div style={{ padding: "80px 0", minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div className="container" style={{ maxWidth: "600px" }}>
        <div
          style={{
            background: "var(--bg-surface)",
            borderRadius: "var(--radius-xl)",
            padding: "40px 30px",
            textAlign: "center",
            border: "2px solid var(--primary)",
            boxShadow: "var(--shadow-xl)",
            animation: "scaleIn 0.3s ease-out",
          }}
        >
          <div
            style={{
              width: "72px",
              height: "72px",
              borderRadius: "50%",
              background: "var(--primary-light)",
              color: "var(--primary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 20px",
            }}
          >
            <CheckCircle2 size={42} />
          </div>

          <span
            style={{
              background: "var(--primary-light)",
              color: "var(--primary)",
              padding: "4px 12px",
              borderRadius: "999px",
              fontSize: "0.75rem",
              fontWeight: 800,
              textTransform: "uppercase",
              display: "inline-block",
              marginBottom: "12px",
            }}
          >
            ✓ পেমেন্ট সফল ও যাচাইকৃত (SSLCommerz Verified)
          </span>

          <h2 style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--text-main)", marginBottom: "8px" }}>
            {locale === "bn" ? "অর্ডার ও পেমেন্ট সফলভাবে সম্পন্ন হয়েছে!" : "Payment & Order Successful!"}
          </h2>

          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: "24px" }}>
            আপনার পেমেন্ট সফলভাবে প্রাপ্ত হয়েছে। আমাদের এক্সপ্রেস টিম দ্রুত খাঁটি পণ্য সংগ্রহ ও প্যাকেজিং শুরু করেছে।
          </p>

          <div
            style={{
              background: "var(--bg-subtle)",
              borderRadius: "var(--radius-lg)",
              padding: "20px",
              textAlign: "left",
              marginBottom: "28px",
              fontSize: "0.88rem",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
              <span style={{ color: "var(--text-muted)" }}>অর্ডার নম্বর:</span>
              <span style={{ fontWeight: 800, color: "var(--primary-dark)", fontFamily: "var(--font-mono)" }}>
                #{orderNumber}
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
              <span style={{ color: "var(--text-muted)" }}>পেমেন্ট স্ট্যাটাস:</span>
              <span style={{ color: "var(--primary)", fontWeight: 800 }}>✓ PAID (পরিশোধিত)</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--text-muted)" }}>পেমেন্ট গেটওয়ে:</span>
              <span style={{ fontWeight: 600 }}>SSLCommerz Bangladesh</span>
            </div>
          </div>

          <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
            <Link
              href="/"
              className="btn-primary"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "12px 24px",
                borderRadius: "var(--radius-md)",
              }}
            >
              <ShoppingBag size={18} />
              <span>{t.continueShopping}</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
