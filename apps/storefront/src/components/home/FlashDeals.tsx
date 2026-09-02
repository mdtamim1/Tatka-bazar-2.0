"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Flame, ArrowRight, Zap } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { PRODUCTS } from "@/lib/catalog";
import { ProductCard } from "@/components/product/ProductCard";

export function FlashDeals() {
  const { locale, t } = useLanguage();
  const [timeLeft, setTimeLeft]  = useState({ hours: 8, minutes: 42, seconds: 15 });
  const [flipping, setFlipping]  = useState<Record<string, boolean>>({});
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef               = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry?.isIntersecting) setIsVisible(true); },
      { threshold: 0.1 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        const newFlips: Record<string, boolean> = { s: true };
        setFlipping(newFlips);
        setTimeout(() => setFlipping({}), 450);

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
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "2px" }}>
        <div
          style={{
            minWidth: "clamp(34px, 5.2vw, 48px)",
            height: "clamp(36px, 5.8vw, 52px)",
            background: "linear-gradient(180deg, #18080c 0%, #0d0407 50%, #060204 100%)",
            borderRadius: "8px",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "clamp(1rem, 2.2vw, 1.4rem)",
            fontWeight: 900,
            fontFamily: "var(--font-heading)",
            letterSpacing: "-0.04em",
            color: "var(--rose)",
            boxShadow: "0 4px 14px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.08)",
            animation: isFlipping ? "countPop 0.4s var(--ease-bounce)" : "none",
            position: "relative",
            overflow: "hidden",
            border: "1px solid rgba(255,77,109,0.22)",
            padding: "0 2px",
          }}
        >
          <div style={{ position: "absolute", left: 0, right: 0, top: "50%", height: "1px", background: "rgba(0,0,0,0.6)", zIndex: 2 }} />
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: "50%", background: "rgba(255,255,255,0.04)", zIndex: 1 }} />
          <div style={{ position: "absolute", top: "50%", left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.2)", zIndex: 1 }} />
          <span style={{ position: "relative", zIndex: 3 }}>
            {pad(value)}
          </span>
        </div>
        <span
          style={{
            fontSize: "0.52rem", fontWeight: 700,
            color: "var(--text-subtle)",
            letterSpacing: "0.06em", textTransform: "uppercase",
            fontFamily: "var(--font-heading)",
          }}
        >
          {label}
        </span>
      </div>
    );
  }

  return (
    <section ref={sectionRef} style={{ padding: "8px 0 36px" }}>
      <div className="container">
        <div
          style={{
            borderRadius: "var(--radius-2xl)",
            overflow: "hidden",
            background: "linear-gradient(145deg, #0C0508 0%, #150A0C 45%, #1E0E10 100%)",
            boxShadow: "var(--shadow-2xl), 0 0 0 1px rgba(255,77,109,0.1), 0 0 80px rgba(255,77,109,0.04)",
            position: "relative",
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? "translateY(0)" : "translateY(24px)",
            transition: "all 0.7s var(--ease-out)",
          }}
        >
          {/* Background ember glows */}
          <div style={{ position: "absolute", top: "-60px", left: "5%", width: "280px", height: "280px", borderRadius: "50%", background: "radial-gradient(circle, rgba(255,77,109,0.1) 0%, transparent 70%)", pointerEvents: "none", animation: "orbPulse 4s ease-in-out infinite" }} />
          <div style={{ position: "absolute", bottom: "-80px", right: "10%", width: "320px", height: "320px", borderRadius: "50%", background: "radial-gradient(circle, rgba(251,146,60,0.07) 0%, transparent 70%)", pointerEvents: "none", animation: "orbPulse 5s ease-in-out infinite 2s" }} />

          {/* Grid lines */}
          <div
            style={{
              position: "absolute", inset: 0, pointerEvents: "none",
              backgroundImage: "linear-gradient(rgba(255,77,109,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,77,109,0.03) 1px, transparent 1px)",
              backgroundSize: "50px 50px",
              maskImage: "linear-gradient(to bottom, transparent, black 20%, black 80%, transparent)",
            }}
          />

          {/* Top neon line */}
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "2px", background: "linear-gradient(90deg, transparent, var(--rose), #FB923C, var(--rose), transparent)", zIndex: 2 }} />

          <div style={{ padding: "clamp(16px, 3vw, 32px) clamp(12px, 2.5vw, 26px)" }}>

            {/* Header Area */}
            <div style={{ marginBottom: "20px" }}>
              {/* Top Row: Icon + Title */}
              <div style={{ display: "flex", alignItems: "center", gap: "12px", minWidth: 0 }}>
                <div
                  style={{
                    width: "clamp(38px, 5.5vw, 48px)", height: "clamp(38px, 5.5vw, 48px)",
                    borderRadius: "var(--radius-lg)",
                    background: "linear-gradient(135deg, #FF4D6D 0%, #FB923C 100%)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "#FFF",
                    boxShadow: "0 6px 24px rgba(255,77,109,0.45), inset 0 1px 0 rgba(255,255,255,0.25)",
                    flexShrink: 0,
                    animation: "glowPulse 2.5s ease-in-out infinite",
                  }}
                >
                  <Flame size={20} />
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div
                    style={{
                      display: "inline-flex", alignItems: "center", gap: "4px",
                      padding: "2px 8px", marginBottom: "4px",
                      background: "rgba(255,77,109,0.12)",
                      border: "1px solid rgba(255,77,109,0.22)",
                      borderRadius: "var(--radius-full)",
                      fontSize: "0.62rem", fontWeight: 700,
                      color: "var(--rose)", letterSpacing: "0.08em",
                      textTransform: "uppercase",
                    }}
                  >
                    <Zap size={9} fill="var(--rose)" /> Limited Time
                  </div>
                  <h2
                    style={{
                      fontFamily: "var(--font-heading)",
                      fontSize: "clamp(1.05rem, 2.5vw, 1.55rem)",
                      fontWeight: 800, color: "var(--text-main)",
                      lineHeight: 1.2, letterSpacing: "-0.03em",
                      margin: 0,
                    }}
                  >
                    {t.flashDealsTitle || "Flash Deals"}
                  </h2>
                  <p style={{ fontSize: "0.76rem", color: "var(--text-muted)", marginTop: "2px", lineHeight: 1.35, margin: "2px 0 0 0" }}>
                    {t.flashDealsSubtitle || "Limited stock — order before time runs out"}
                  </p>
                </div>
              </div>

              {/* Bottom Control Row: Countdown Timer (Left) + View All Button (Right) */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: "10px",
                  marginTop: "14px",
                  paddingTop: "12px",
                  borderTop: "1px solid rgba(255,77,109,0.15)",
                }}
              >
                {/* Countdown timer with label */}
                <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "nowrap" }}>
                  <span
                    style={{
                      fontSize: "0.64rem", color: "rgba(255, 255, 255, 0.6)", fontWeight: 700,
                      letterSpacing: "0.04em", textTransform: "uppercase",
                      whiteSpace: "nowrap",
                    }}
                  >
                    ⏰ Ends in:
                  </span>
                  <div style={{ display: "flex", alignItems: "center", gap: "3px" }}>
                    <FlipDigit value={timeLeft.hours}   label="HRS" />
                    <span style={{ color: "var(--rose)", fontWeight: 900, fontSize: "1rem", lineHeight: "36px", opacity: 0.75 }}>:</span>
                    <FlipDigit value={timeLeft.minutes} label="MIN" />
                    <span style={{ color: "var(--rose)", fontWeight: 900, fontSize: "1rem", lineHeight: "36px", opacity: 0.75 }}>:</span>
                    <FlipDigit value={timeLeft.seconds} label="SEC" {...(flipping["s"] ? { isFlipping: true } : {})} />
                  </div>
                </div>

                {/* View All Button */}
                <Link
                  href="/category/all?sort=discount"
                  style={{
                    display: "inline-flex", alignItems: "center", gap: "5px",
                    padding: "6px 14px",
                    borderRadius: "var(--radius-full)",
                    background: "rgba(255,77,109,0.12)",
                    border: "1px solid rgba(255,77,109,0.3)",
                    color: "var(--rose)",
                    fontWeight: 700, fontSize: "0.78rem",
                    transition: "all var(--t-smooth)",
                    whiteSpace: "nowrap",
                    marginLeft: "auto",
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = "rgba(255,77,109,0.22)";
                    e.currentTarget.style.transform = "translateX(2px)";
                    e.currentTarget.style.boxShadow = "0 4px 16px rgba(255,77,109,0.25)";
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = "rgba(255,77,109,0.12)";
                    e.currentTarget.style.transform = "translateX(0)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <span>View All</span>
                  <ArrowRight size={13} />
                </Link>
              </div>
            </div>

            {/* Products Responsive Grid */}
            <div className="flash-grid">
              {flashProducts.map(product => (
                <div key={product.id} style={{ minWidth: 0, width: "100%", boxSizing: "border-box" }}>
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
