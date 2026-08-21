"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Flame, ArrowRight } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { PRODUCTS } from "@/lib/catalog";
import { ProductCard } from "@/components/product/ProductCard";

export function FlashDeals() {
  const { locale, t } = useLanguage();
  const [timeLeft, setTimeLeft] = useState({ hours: 8, minutes: 42, seconds: 15 });
  const [prevTime, setPrevTime] = useState({ hours: 8, minutes: 42, seconds: 16 });
  const [flipping, setFlipping] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        setPrevTime(prev);
        const newFlips: Record<string, boolean> = {};
        if (prev.seconds !== (prev.seconds > 0 ? prev.seconds - 1 : 59)) {
          newFlips["s"] = true;
        }
        setFlipping(newFlips);
        setTimeout(() => setFlipping({}), 500);

        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours   > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 12, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const flashProducts = PRODUCTS.filter(p => p.isDailyBazar);
  const pad = (n: number) => String(n).padStart(2, "0");

  function FlipDigit({ value, label, isFlipping }: { value: number; label: string; isFlipping?: boolean }) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "5px" }}>
        <div
          style={{
            minWidth: "clamp(46px, 6.5vw, 58px)",
            height: "clamp(50px, 7.5vw, 64px)",
            display: "flex", alignItems: "center", justifyContent: "center",
            position: "relative",
            perspective: "200px",
          }}
        >
          {/* Card */}
          <div
            style={{
              width: "100%", height: "100%",
              background: "linear-gradient(180deg, #1C0808 0%, #0D0404 50%, #0A0303 100%)",
              borderRadius: "var(--radius-md)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "clamp(1.2rem, 3.2vw, 1.7rem)",
              fontWeight: 900,
              fontFamily: "var(--font-en)",
              letterSpacing: "-0.03em",
              color: "#FFFFFF",
              boxShadow: "0 6px 20px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.06), inset 0 -1px 0 rgba(0,0,0,0.4)",
              animation: isFlipping ? "countPop 0.4s var(--ease-bounce)" : "none",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Horizontal divider line */}
            <div style={{ position: "absolute", left: 0, right: 0, top: "50%", height: "1px", background: "rgba(0,0,0,0.5)", zIndex: 2 }} />
            {/* Top half highlight */}
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: "50%", background: "rgba(255,255,255,0.04)", zIndex: 1 }} />
            {/* Bottom half shadow */}
            <div style={{ position: "absolute", top: "50%", left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.2)", zIndex: 1 }} />
            <span style={{ position: "relative", zIndex: 3, textShadow: "0 2px 8px rgba(0,0,0,0.5)" }}>
              {pad(value)}
            </span>
          </div>
        </div>
        <span
          style={{
            fontSize: "0.56rem", fontWeight: 800,
            color: "rgba(255,255,255,0.38)",
            letterSpacing: "0.14em", textTransform: "uppercase",
            fontFamily: "var(--font-en)",
          }}
        >
          {label}
        </span>
      </div>
    );
  }

  return (
    <section style={{ padding: "8px 0 36px" }}>
      <div className="container">
        <div
          style={{
            borderRadius: "var(--radius-2xl)",
            overflow: "hidden",
            background: "linear-gradient(145deg, #120404 0%, #1E0606 45%, #2A0C0C 100%)",
            boxShadow: "var(--shadow-2xl), 0 0 0 1px rgba(239,68,68,0.12)",
            position: "relative",
          }}
        >
          {/* Background ember glow */}
          <div style={{ position: "absolute", top: "-60px", left: "5%",  width: "250px", height: "250px", borderRadius: "50%", background: "radial-gradient(circle, rgba(239,68,68,0.12) 0%, transparent 70%)", pointerEvents: "none" }} />
          <div style={{ position: "absolute", bottom: "-80px", right: "10%", width: "300px", height: "300px", borderRadius: "50%", background: "radial-gradient(circle, rgba(249,115,22,0.08) 0%, transparent 70%)", pointerEvents: "none" }} />
          <div style={{ position: "absolute", top: "30%", right: "20%", width: "180px", height: "180px", borderRadius: "50%", background: "radial-gradient(circle, rgba(239,68,68,0.06) 0%, transparent 70%)", pointerEvents: "none" }} />

          <div style={{ padding: "clamp(24px, 4vw, 36px) clamp(20px, 3.5vw, 32px) clamp(20px, 3.5vw, 28px)" }}>

            {/* Header */}
            <div
              style={{
                display: "flex", justifyContent: "space-between",
                alignItems: "center", flexWrap: "wrap", gap: "16px",
                marginBottom: "24px",
              }}
            >
              {/* Left: icon + text */}
              <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                <div
                  style={{
                    width: "clamp(44px, 6.5vw, 56px)", height: "clamp(44px, 6.5vw, 56px)",
                    borderRadius: "var(--radius-lg)",
                    background: "linear-gradient(135deg, #EF4444 0%, #F97316 100%)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "#FFF",
                    boxShadow: "0 6px 24px rgba(239,68,68,0.5)",
                    flexShrink: 0,
                    animation: "glowPulse 2s ease-in-out infinite",
                  }}
                >
                  <Flame size={24} />
                </div>
                <div>
                  <div
                    style={{
                      display: "inline-flex", alignItems: "center", gap: "6px",
                      padding: "3px 10px", marginBottom: "6px",
                      background: "rgba(239,68,68,0.15)",
                      border: "1px solid rgba(239,68,68,0.25)",
                      borderRadius: "var(--radius-full)",
                      fontSize: "0.68rem", fontWeight: 800,
                      color: "#FCA5A5", letterSpacing: "0.08em",
                      textTransform: "uppercase",
                    }}
                  >
                    🔥 {locale === "bn" ? "সীমিত সময়" : "Limited Time"}
                  </div>
                  <h2
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "clamp(1.2rem, 3.2vw, 1.65rem)",
                      fontWeight: 700, color: "#FFFFFF",
                      lineHeight: 1.2, letterSpacing: "-0.02em",
                    }}
                  >
                    {t.flashDealsTitle || (locale === "bn" ? "আজকের ফ্ল্যাশ অফার" : "Flash Deals")}
                  </h2>
                  <p style={{ fontSize: "var(--text-xs)", color: "rgba(255,255,255,0.45)", marginTop: "3px" }}>
                    {t.flashDealsSubtitle || (locale === "bn" ? "সীমিত স্টক — তাড়াতাড়ি অর্ডার করুন" : "Limited stock — order before time runs out")}
                  </p>
                </div>
              </div>

              {/* Right: countdown + link */}
              <div style={{ display: "flex", alignItems: "center", gap: "clamp(14px, 3vw, 28px)", flexWrap: "wrap" }}>
                {/* Countdown */}
                <div>
                  <div
                    style={{
                      fontSize: "0.65rem", color: "rgba(255,255,255,0.42)", fontWeight: 700,
                      textAlign: "center", marginBottom: "8px", letterSpacing: "0.06em",
                      textTransform: "uppercase",
                    }}
                  >
                    {locale === "bn" ? "শেষ হবে" : "Ends in"}
                  </div>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: "6px" }}>
                    <FlipDigit value={timeLeft.hours}   label={locale === "bn" ? "ঘণ্টা" : "HRS"} />
                    <span style={{ color: "#EF4444", fontWeight: 900, fontSize: "1.6rem", lineHeight: "64px", opacity: 0.8 }}>:</span>
                    <FlipDigit value={timeLeft.minutes} label={locale === "bn" ? "মিনিট" : "MIN"} />
                    <span style={{ color: "#EF4444", fontWeight: 900, fontSize: "1.6rem", lineHeight: "64px", opacity: 0.8 }}>:</span>
                    <FlipDigit value={timeLeft.seconds} label={locale === "bn" ? "সেকেন্ড" : "SEC"} isFlipping={flipping["s"]} />
                  </div>
                </div>

                <Link
                  href="/category/all?sort=discount"
                  style={{
                    display: "inline-flex", alignItems: "center", gap: "6px",
                    padding: "10px 18px",
                    borderRadius: "var(--radius-full)",
                    background: "rgba(239,68,68,0.15)",
                    border: "1.5px solid rgba(239,68,68,0.28)",
                    color: "#FCA5A5",
                    fontWeight: 700, fontSize: "var(--text-sm)",
                    transition: "all var(--t-smooth)",
                    whiteSpace: "nowrap",
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = "rgba(239,68,68,0.25)";
                    e.currentTarget.style.color = "#FECACA";
                    e.currentTarget.style.transform = "translateX(3px)";
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = "rgba(239,68,68,0.15)";
                    e.currentTarget.style.color = "#FCA5A5";
                    e.currentTarget.style.transform = "translateX(0)";
                  }}
                >
                  <span>{locale === "bn" ? "সব দেখুন" : "View All"}</span>
                  <ArrowRight size={15} />
                </Link>
              </div>
            </div>

            {/* Divider */}
            <div
              style={{
                height: "1px",
                background: "linear-gradient(90deg, transparent, rgba(239,68,68,0.25) 30%, rgba(249,115,22,0.2) 70%, transparent)",
                marginBottom: "24px",
              }}
            />

            {/* Products */}
            <div className="flash-grid">
              {flashProducts.map(product => (
                <div key={product.id}>
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
