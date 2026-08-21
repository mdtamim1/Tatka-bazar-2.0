"use client";

import React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AlertCircle, RotateCcw, ShoppingBag } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function PaymentFailPage() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("order") || "";
  const { t, locale } = useLanguage();

  return (
    <div style={{ padding: "80px 0", minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div className="container" style={{ maxWidth: "540px" }}>
        <div
          style={{
            background: "var(--bg-surface)",
            borderRadius: "var(--radius-xl)",
            padding: "40px 30px",
            textAlign: "center",
            border: "2px solid #EF4444",
            boxShadow: "var(--shadow-xl)",
          }}
        >
          <div
            style={{
              width: "72px",
              height: "72px",
              borderRadius: "50%",
              background: "#FEE2E2",
              color: "#DC2626",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 20px",
            }}
          >
            <AlertCircle size={42} />
          </div>

          <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--text-main)", marginBottom: "8px" }}>
            {locale === "bn" ? "পেমেন্ট ব্যর্থ হয়েছে!" : "Payment Failed or Cancelled"}
          </h2>

          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: "24px" }}>
            আপনার একাউন্ট থেকে কোনো অর্থ কাটা হয়নি। আপনি পুনরায় চেষ্টা করতে পারেন অথবা ক্যাশ অন ডেলিভারি (COD) বেছে নিতে পারেন।
          </p>

          <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
            <Link
              href="/checkout"
              className="btn-primary"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "12px 20px",
                borderRadius: "var(--radius-md)",
              }}
            >
              <RotateCcw size={18} />
              <span>পুনরায় চেষ্টা করুন (Retry)</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
