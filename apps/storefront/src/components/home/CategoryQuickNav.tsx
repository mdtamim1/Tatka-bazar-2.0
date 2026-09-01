"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { CATEGORIES } from "@/lib/catalog";

// Premium dark-mode category palette
const CATEGORY_STYLES = [
  { grad: "linear-gradient(145deg, rgba(16,216,118,0.18), rgba(5,158,87,0.1))",  border: "rgba(16,216,118,0.3)",  glow: "rgba(16,216,118,0.4)",  accent: "#10D876" },
  { grad: "linear-gradient(145deg, rgba(245,200,66,0.18), rgba(212,160,23,0.1))", border: "rgba(245,200,66,0.3)",  glow: "rgba(245,200,66,0.4)",  accent: "#F5C842" },
  { grad: "linear-gradient(145deg, rgba(255,77,109,0.18), rgba(232,48,85,0.1))",  border: "rgba(255,77,109,0.3)",  glow: "rgba(255,77,109,0.4)",  accent: "#FF4D6D" },
  { grad: "linear-gradient(145deg, rgba(79,158,255,0.18), rgba(49,130,246,0.1))", border: "rgba(79,158,255,0.3)",  glow: "rgba(79,158,255,0.4)",  accent: "#4F9EFF" },
  { grad: "linear-gradient(145deg, rgba(168,85,247,0.18), rgba(139,92,246,0.1))", border: "rgba(168,85,247,0.3)",  glow: "rgba(168,85,247,0.4)",  accent: "#A855F7" },
  { grad: "linear-gradient(145deg, rgba(251,146,60,0.18), rgba(234,88,12,0.1))",  border: "rgba(251,146,60,0.3)",  glow: "rgba(251,146,60,0.4)",  accent: "#FB923C" },
  { grad: "linear-gradient(145deg, rgba(52,211,153,0.18), rgba(16,185,129,0.1))", border: "rgba(52,211,153,0.3)",  glow: "rgba(52,211,153,0.4)",  accent: "#34D399" },
  { grad: "linear-gradient(145deg, rgba(244,114,182,0.18), rgba(236,72,153,0.1))",border: "rgba(244,114,182,0.3)", glow: "rgba(244,114,182,0.4)", accent: "#F472B6" },
];

export function CategoryQuickNav() {
  const { locale, t } = useLanguage();
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [isVisible, setIsVisible]   = useState(false);
  const sectionRef                  = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry?.isIntersecting) setIsVisible(true); },
      { threshold: 0.1 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} style={{ padding: "36px 0 44px" }}>
      <div className="container">

        {/* Section Header */}
        <div
          style={{
            display: "flex", justifyContent: "space-between",
            alignItems: "flex-end", marginBottom: "28px",
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? "translateY(0)" : "translateY(16px)",
            transition: "all 0.6s var(--ease-out)",
          }}
        >
          <div>
            <div className="section-eyebrow section-eyebrow--green" style={{ marginBottom: "10px" }}>
              🛒 {locale === "bn" ? "বিভাগ অনুযায়ী কিনুন" : "Shop by Category"}
            </div>
            <h2 className="section-heading">
              {t.shopByCategory || (locale === "bn" ? "কী দরকার আজ?" : "What do you need today?")}
            </h2>
          </div>
          <Link href="/category/all" className="view-all-link">
            <span>{t.viewAll || (locale === "bn" ? "সব দেখুন" : "View All")}</span>
            <ArrowRight size={15} />
          </Link>
        </div>

        {/* Category Grid */}
        <div className="cat-grid">
          {CATEGORIES.map((cat, i) => {
            const style = CATEGORY_STYLES[i % CATEGORY_STYLES.length]!;
            const isHovered = hoveredIdx === i;
            return (
              <Link
                key={cat.id}
                href={`/category/${cat.slug}`}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "11px",
                  padding: "clamp(16px, 3vw, 24px) clamp(10px, 1.5vw, 16px)",
                  borderRadius: "var(--radius-xl)",
                  background: isHovered ? style.grad : "var(--bg-card)",
                  border: isHovered ? `1px solid ${style.border}` : "1px solid var(--border-subtle)",
                  textDecoration: "none",
                  textAlign: "center",
                  transition: "all 0.35s var(--ease-out)",
                  boxShadow: isHovered
                    ? `0 16px 40px rgba(0,0,0,0.5), 0 0 40px ${style.glow.replace("0.4","0.12")}, inset 0 1px 0 rgba(255,255,255,0.08)`
                    : "var(--shadow-card)",
                  transform: isHovered ? "translateY(-10px) scale(1.03)" : "translateY(0) scale(1)",
                  position: "relative",
                  overflow: "hidden",
                  opacity: isVisible ? 1 : 0,
                  transitionDelay: isVisible ? `${i * 0.06}s` : "0s",
                }}
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)}
              >
                {/* Card shimmer overlay */}
                <div
                  style={{
                    position: "absolute", top: 0, left: "-100%",
                    width: "60%", height: "100%",
                    background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.04), transparent)",
                    transform: isHovered ? "translateX(300%)" : "translateX(0)",
                    transition: "transform 0.6s ease",
                    pointerEvents: "none",
                  }}
                />

                {/* Top accent line */}
                <div
                  style={{
                    position: "absolute", top: 0, left: 0, right: 0,
                    height: "2px",
                    background: `linear-gradient(90deg, transparent, ${style.accent}, transparent)`,
                    opacity: isHovered ? 1 : 0,
                    transition: "opacity 0.3s ease",
                  }}
                />

                {/* Icon circle */}
                <div
                  style={{
                    width: "clamp(52px, 7.5vw, 68px)",
                    height: "clamp(52px, 7.5vw, 68px)",
                    borderRadius: "50%",
                    background: isHovered ? style.grad : "var(--bg-subtle)",
                    border: isHovered ? `1.5px solid ${style.border}` : "1.5px solid var(--border-medium)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "clamp(1.5rem, 3.5vw, 2.1rem)",
                    boxShadow: isHovered ? `0 8px 28px ${style.glow}` : "none",
                    transition: "all 0.4s var(--ease-bounce)",
                    transform: isHovered ? "scale(1.15) rotate(-5deg)" : "scale(1) rotate(0deg)",
                    flexShrink: 0,
                    position: "relative",
                    zIndex: 1,
                  }}
                >
                  {cat.icon}
                  {/* Glow ring */}
                  {isHovered && (
                    <div
                      style={{
                        position: "absolute", inset: "-5px",
                        borderRadius: "50%",
                        border: `1.5px solid ${style.border}`,
                        animation: "glowRing 1.5s ease-in-out infinite",
                      }}
                    />
                  )}
                </div>

                {/* Label */}
                <div style={{ position: "relative", zIndex: 1 }}>
                  <h3
                    style={{
                      fontSize: "clamp(0.68rem, 1.35vw, 0.82rem)",
                      fontWeight: 700,
                      color: isHovered ? style.accent : "var(--text-main)",
                      lineHeight: 1.25,
                      transition: "color var(--t-fast)",
                      fontFamily: "var(--font-heading)",
                    }}
                  >
                    {locale === "bn" ? cat.nameBn : cat.nameEn}
                  </h3>
                  <p
                    style={{
                      fontSize: "0.6rem",
                      color: isHovered ? `${style.accent}99` : "var(--text-subtle)",
                      marginTop: "3px", fontWeight: 600,
                      transition: "color var(--t-fast)",
                    }}
                  >
                    {cat.itemCount} {locale === "bn" ? "পণ্য" : "items"}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
