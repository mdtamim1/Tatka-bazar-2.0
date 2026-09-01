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
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "5px" }}>
        <div
          style={{
            minWidth: "clamp(46px, 6.5vw, 58px)",
            height: "clamp(50px, 7vw, 62px)",
            background: "linear-gradient(180deg, #0D1018 0%, #080B10 50%, #050709 100%)",
            borderRadius: "var(--radius-md)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "clamp(1.2rem, 3vw, 1.65rem)",
            fontWeight: 900,
            fontFamily: "var(--font-heading)",
            letterSpacing: "-0.04em",
            color: "var(--rose)",
            boxShadow: "0 6px 20px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05), inset 0 -1px 0 rgba(0,0,0,0.4)",
            animation: isFlipping ? "countPop 0.4s var(--ease-bounce)" : "none",
            position: "relative",
            overflow: "hidden",
            border: "1px solid rgba(255,77,109,0.15)",
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
            fontSize: "0.55rem", fontWeight: 700,
            color: "var(--text-subtle)",
            letterSpacing: "0.14em", textTransform: "uppercase",
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

          <div style={{ padding: "clamp(24px, 4vw, 38px) clamp(20px, 3.5vw, 34px) clamp(20px, 3.5vw, 28px)" }}>

            {/* Header */}
            <div
              style={{
                display: "flex", justifyContent: "space-between",
                alignItems: "center", flexWrap: "wrap", gap: "16px",
                marginBottom: "26px",
              }}
            >
              {/* Left: icon + text */}
              <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                <div
                  style={{
                    width: "clamp(44px, 6.5vw, 54px)", height: "clamp(44px, 6.5vw, 54px)",
                    borderRadius: "var(--radius-lg)",
                    background: "linear-gradient(135deg, #FF4D6D 0%, #FB923C 100%)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "#FFF",
                    boxShadow: "0 6px 28px rgba(255,77,109,0.55), inset 0 1px 0 rgba(255,255,255,0.25)",
                    flexShrink: 0,
                    animation: "glowPulse 2.5s ease-in-out infinite",
                  }}
                >
                  <Flame size={22} />
                </div>
                <div>
                  <div
                    style={{
                      display: "inline-flex", alignItems: "center", gap: "6px",
                      padding: "3px 10px", marginBottom: "6px",
                      background: "rgba(255,77,109,0.12)",
                      border: "1px solid rgba(255,77,109,0.22)",
                      borderRadius: "var(--radius-full)",
                      fontSize: "0.66rem", fontWeight: 700,
                      color: "var(--rose)", letterSpacing: "0.1em",
                      textTransform: "uppercase",
                    }}
                  >
                    <Zap size={10} fill="var(--rose)" /> {locale === "bn" ? "সীমিত সময়" : "Limited Time"}
                  </div>
                  <h2
                    style={{
                      fontFamily: "var(--font-heading)",
                      fontSize: "clamp(1.1rem, 3vw, 1.6rem)",
                      fontWeight: 800, color: "var(--text-main)",
                      lineHeight: 1.15, letterSpacing: "-0.04em",
                    }}
                  >
                    {t.flashDealsTitle || (locale === "bn" ? "আজকের ফ্ল্যাশ অফার" : "Flash Deals")}
                  </h2>
                  <p style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", marginTop: "3px" }}>
                    {t.flashDealsSubtitle || (locale === "bn" ? "সীমিত স্টক — তাড়াতাড়ি অর্ডার করুন" : "Limited stock — order before time runs out")}
                  </p>
                </div>
              </div>

              {/* Right: countdown + link */}
              <div style={{ display: "flex", alignItems: "center", gap: "clamp(14px, 3vw, 28px)", flexWrap: "wrap" }}>
                <div>
                  <div
                    style={{
                      fontSize: "0.62rem", color: "var(--text-subtle)", fontWeight: 700,
                      textAlign: "center", marginBottom: "8px", letterSpacing: "0.08em",
                      textTransform: "uppercase",
                    }}
                  >
                    {locale === "bn" ? "শেষ হবে" : "Ends in"}
                  </div>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: "6px" }}>
                    <FlipDigit value={timeLeft.hours}   label={locale === "bn" ? "ঘণ্টা" : "HRS"} />
                    <span style={{ color: "var(--rose)", fontWeight: 900, fontSize: "1.5rem", lineHeight: "62px", opacity: 0.75 }}>:</span>
                    <FlipDigit value={timeLeft.minutes} label={locale === "bn" ? "মিনিট" : "MIN"} />
                    <span style={{ color: "var(--rose)", fontWeight: 900, fontSize: "1.5rem", lineHeight: "62px", opacity: 0.75 }}>:</span>
                    <FlipDigit value={timeLeft.seconds} label={locale === "bn" ? "সেকেন্ড" : "SEC"} {...(flipping["s"] ? { isFlipping: true } : {})} />
                  </div>
                </div>

                <Link
                  href="/category/all?sort=discount"
                  style={{
                    display: "inline-flex", alignItems: "center", gap: "6px",
                    padding: "10px 18px",
                    borderRadius: "var(--radius-full)",
                    background: "rgba(255,77,109,0.1)",
                    border: "1.5px solid rgba(255,77,109,0.25)",
                    color: "var(--rose)",
                    fontWeight: 700, fontSize: "var(--text-sm)",
                    transition: "all var(--t-smooth)",
                    whiteSpace: "nowrap",
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = "rgba(255,77,109,0.2)";
                    e.currentTarget.style.transform = "translateX(3px)";
                    e.currentTarget.style.boxShadow = "0 6px 20px rgba(255,77,109,0.25)";
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = "rgba(255,77,109,0.1)";
                    e.currentTarget.style.transform = "translateX(0)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <span>{locale === "bn" ? "সব দেখুন" : "View All"}</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>

            {/* Divider */}
            <div
              style={{
                height: "1px",
                background: "linear-gradient(90deg, transparent, rgba(255,77,109,0.2) 30%, rgba(251,146,60,0.15) 70%, transparent)",
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
