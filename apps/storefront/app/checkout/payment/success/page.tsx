"use client";

import React, { useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import confetti from "canvas-confetti";
import { CheckCircle2, ShoppingBag, Truck, ShieldCheck } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

function PaymentSuccessContent() {
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
            background: "rgba(14, 17, 23, 0.95)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            borderRadius: "var(--radius-2xl)",
            padding: "48px 36px",
            textAlign: "center",
            border: "1px solid rgba(16, 216, 118, 0.3)",
            boxShadow: "var(--shadow-2xl), 0 0 80px rgba(16, 216, 118, 0.15)",
            animation: "scaleIn 0.35s ease-out",
          }}
        >
          <div
            style={{
              width: "76px",
              height: "76px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, rgba(16,216,118,0.2), rgba(5,158,87,0.1))",
              color: "var(--emerald)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 20px",
              boxShadow: "0 0 30px rgba(16, 216, 118, 0.4)",
            }}
          >
            <CheckCircle2 size={44} strokeWidth={2.5} />
          </div>

          <span
            style={{
              background: "rgba(16, 216, 118, 0.15)",
              color: "var(--emerald)",
              padding: "4px 14px",
              borderRadius: "999px",
              fontSize: "0.75rem",
              fontWeight: 800,
              textTransform: "uppercase",
              display: "inline-block",
              marginBottom: "14px",
              border: "1px solid rgba(16, 216, 118, 0.3)",
            }}
          >
            ✓ {locale === "bn" ? "পেমেন্ট সফল ও যাচাইকৃত (Verified)" : "Payment Verified (SSLCommerz / Wallet)"}
          </span>

          <h2 style={{ fontSize: "1.7rem", fontWeight: 900, color: "var(--text-main)", marginBottom: "8px", fontFamily: "var(--font-heading)" }}>
            {locale === "bn" ? "অর্ডার ও পেমেন্ট সফল হয়েছে!" : "Payment & Order Confirmed!"}
          </h2>

          <p style={{ color: "var(--text-muted)", fontSize: "0.92rem", marginBottom: "28px", lineHeight: 1.6 }}>
            {locale === "bn"
              ? "আপনার পেমেন্ট সফলভাবে প্রাপ্ত হয়েছে। আমাদের এক্সপ্রেস টিম দ্রুত খাঁটি পণ্য সংগ্রহ ও প্যাকেজিং শুরু করেছে।"
              : "Payment received. Our express fresh dispatch team has initiated thermal insulated packaging."}
          </p>

          <div
            style={{
              background: "rgba(255, 255, 255, 0.03)",
              borderRadius: "var(--radius-lg)",
              padding: "20px",
              textAlign: "left",
              marginBottom: "32px",
              fontSize: "0.88rem",
              border: "1px solid rgba(255, 255, 255, 0.06)",
              display: "flex",
              flexDirection: "column",
              gap: "10px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--text-muted)" }}>{locale === "bn" ? "অর্ডার নম্বর:" : "Order Number:"}</span>
              <span style={{ fontWeight: 800, color: "var(--emerald)", fontFamily: "var(--font-heading)" }}>
                #{orderNumber}
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--text-muted)" }}>{locale === "bn" ? "পেমেন্ট স্ট্যাটাস:" : "Payment Status:"}</span>
              <span style={{ color: "var(--emerald)", fontWeight: 800 }}>✓ PAID ({locale === "bn" ? "পরিশোধিত" : "Verified"})</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--text-muted)" }}>{locale === "bn" ? "পেমেন্ট গেটওয়ে:" : "Payment Gateway:"}</span>
              <span style={{ fontWeight: 600, color: "var(--text-body)" }}>SSLCommerz / Tatka Gateway</span>
            </div>
          </div>

          <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
            <Link
              href={`/track?order=${orderNumber}`}
              className="btn-primary"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "12px 24px",
                borderRadius: "var(--radius-full)",
                fontWeight: 800,
              }}
            >
              <Truck size={18} />
              <span>{locale === "bn" ? "লাইভ ট্র্যাক করুন" : "Track Order"}</span>
            </Link>
            <Link
              href="/"
              className="btn-secondary"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "12px 24px",
                borderRadius: "var(--radius-full)",
                fontWeight: 700,
              }}
            >
              <ShoppingBag size={18} />
              <span>{t.startShopping || (locale === "bn" ? "আরও কেনাকাটা করুন" : "Continue Shopping")}</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)" }}>Loading...</div>}>
      <PaymentSuccessContent />
    </Suspense>
  );
}
