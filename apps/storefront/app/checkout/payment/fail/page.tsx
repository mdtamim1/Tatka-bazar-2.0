"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AlertCircle, RotateCcw, ShoppingBag } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

function PaymentFailContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("order") || "";
  const { t } = useLanguage();

  return (
    <div style={{ padding: "80px 0", minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div className="container" style={{ maxWidth: "540px" }}>
        <div
          style={{
            background: "rgba(14, 17, 23, 0.95)",
            borderRadius: "var(--radius-2xl)",
            padding: "40px 30px",
            textAlign: "center",
            border: "1px solid rgba(255, 77, 109, 0.3)",
            boxShadow: "var(--shadow-xl), 0 0 60px rgba(255, 77, 109, 0.15)",
          }}
        >
          <div
            style={{
              width: "72px",
              height: "72px",
              borderRadius: "50%",
              background: "rgba(255, 77, 109, 0.15)",
              color: "var(--rose)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 20px",
            }}
          >
            <AlertCircle size={42} />
          </div>

          <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--text-main)", marginBottom: "8px", fontFamily: "var(--font-heading)" }}>
            Payment Failed or Cancelled
          </h2>

          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: "24px", lineHeight: 1.6 }}>
            No funds were deducted. You can retry the payment or choose Cash on Delivery (COD).
          </p>

          <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
            <Link
              href="/checkout"
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
              <RotateCcw size={18} />
              <span>Retry Checkout</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PaymentFailPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)" }}>Loading...</div>}>
      <PaymentFailContent />
    </Suspense>
  );
}
