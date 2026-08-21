"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { CATEGORIES } from "@/lib/catalog";

const CATEGORY_STYLES = [
  { bg: "linear-gradient(145deg, #D1FAE5, #6EE7B7)", shadow: "rgba(110, 231, 183, 0.5)", text: "#064E3B", ring: "#34D399" },
  { bg: "linear-gradient(145deg, #FEF9C3, #FDE047)", shadow: "rgba(253, 224, 71, 0.5)",  text: "#713F12", ring: "#FCD34D" },
  { bg: "linear-gradient(145deg, #FECACA, #FCA5A5)", shadow: "rgba(252, 165, 165, 0.5)", text: "#7F1D1D", ring: "#F87171" },
  { bg: "linear-gradient(145deg, #BAE6FD, #7DD3FC)", shadow: "rgba(125, 211, 252, 0.5)", text: "#0C4A6E", ring: "#38BDF8" },
  { bg: "linear-gradient(145deg, #E9D5FF, #C4B5FD)", shadow: "rgba(196, 181, 253, 0.5)", text: "#3B0764", ring: "#A78BFA" },
  { bg: "linear-gradient(145deg, #FFEDD5, #FED7AA)", shadow: "rgba(254, 215, 170, 0.5)", text: "#7C2D12", ring: "#FB923C" },
  { bg: "linear-gradient(145deg, #DCFCE7, #86EFAC)", shadow: "rgba(134, 239, 172, 0.5)", text: "#14532D", ring: "#4ADE80" },
  { bg: "linear-gradient(145deg, #FCE7F3, #F9A8D4)", shadow: "rgba(249, 168, 212, 0.5)", text: "#831843", ring: "#F472B6" },
];

export function CategoryQuickNav() {
  const { locale, t } = useLanguage();
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  return (
    <section style={{ padding: "28px 0 36px" }}>
      <div className="container">

        {/* Section Header */}
        <div
          style={{
            display: "flex", justifyContent: "space-between",
            alignItems: "flex-end", marginBottom: "24px",
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
                  gap: "10px",
                  padding: "clamp(14px, 2.8vw, 22px) clamp(8px, 1.5vw, 14px)",
                  borderRadius: "var(--radius-xl)",
                  background: "var(--bg-surface)",
                  border: isHovered ? `1.5px solid ${style.ring}` : "1.5px solid var(--border-subtle)",
                  textDecoration: "none",
                  textAlign: "center",
                  transition: "all 0.3s var(--ease-out)",
                  boxShadow: isHovered
                    ? `0 14px 32px ${style.shadow.replace("0.5", "0.3")}, 0 0 0 3px ${style.shadow.replace("0.5", "0.15")}`
                    : "var(--shadow-xs)",
                  transform: isHovered ? "translateY(-8px) scale(1.03)" : "translateY(0) scale(1)",
                  position: "relative",
                  overflow: "hidden",
                }}
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)}
              >
                {/* Subtle background glow on hover */}
                {isHovered && (
                  <div
                    style={{
                      position: "absolute", inset: 0,
                      background: `${style.bg}`.replace("145deg", "180deg").replace(", #", ", rgba(").replace(")", ", 0.04)"),
                      opacity: 0.5,
                      pointerEvents: "none",
                    }}
                  />
                )}

                {/* Icon circle */}
                <div
                  style={{
                    width: "clamp(52px, 7.5vw, 70px)",
                    height: "clamp(52px, 7.5vw, 70px)",
                    borderRadius: "50%",
                    background: style.bg,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "clamp(1.6rem, 3.8vw, 2.2rem)",
                    boxShadow: isHovered ? `0 8px 24px ${style.shadow}` : `0 4px 14px ${style.shadow.replace("0.5", "0.3")}`,
                    transition: "all 0.4s var(--ease-bounce)",
                    transform: isHovered ? "scale(1.14) rotate(-4deg)" : "scale(1) rotate(0deg)",
                    flexShrink: 0,
                    position: "relative",
                    zIndex: 1,
                  }}
                >
                  {cat.icon}
                  {/* Ring glow on hover */}
                  {isHovered && (
                    <div
                      style={{
                        position: "absolute", inset: "-4px",
                        borderRadius: "50%",
                        border: `2px solid ${style.ring}`,
                        opacity: 0.6,
                        animation: "glowRing 1.2s ease-in-out infinite",
                      }}
                    />
                  )}
                </div>

                {/* Label */}
                <div style={{ position: "relative", zIndex: 1 }}>
                  <h3
                    style={{
                      fontSize: "clamp(0.7rem, 1.4vw, 0.84rem)",
                      fontWeight: 800,
                      color: isHovered ? style.text : "var(--text-main)",
                      lineHeight: 1.25,
                      transition: "color var(--t-fast)",
                    }}
                  >
                    {locale === "bn" ? cat.nameBn : cat.nameEn}
                  </h3>
                  <p
                    style={{
                      fontSize: "0.62rem",
                      color: isHovered ? `${style.text}99` : "var(--text-subtle)",
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
