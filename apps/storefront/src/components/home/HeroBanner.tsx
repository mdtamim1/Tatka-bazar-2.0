"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Sparkles, ArrowRight, ChevronLeft, ChevronRight, TrendingUp, Star, Clock } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export function HeroBanner() {
  const { locale } = useLanguage();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [progress, setProgress]         = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [animKey, setAnimKey]           = useState(0);

  const slides = [
    {
      badge:       locale === "bn" ? "আজকের সেরা অফার" : "Today's Best Deal",
      title:       locale === "bn" ? "তাজা সবজি সরাসরি কৃষকের কাছ থেকে" : "Farm-Fresh Vegetables, Delivered Daily",
      subtitle:    locale === "bn" ? "রাসায়নিকমুক্ত, জৈব সবজি সকালে সংগ্রহ করে বিকেলে আপনার দরজায়।" : "Chemical-free, organic produce harvested at dawn and at your door by afternoon.",
      ctaText:     locale === "bn" ? "সবজি কিনুন" : "Shop Vegetables",
      ctaLink:     "/category/vegetables",
      promoTag:    locale === "bn" ? "৳৫০ ছাড়" : "৳50 OFF",
      bgGradient:  "linear-gradient(135deg, #031A0A 0%, #062E12 40%, #0A4520 100%)",
      accentColor: "#4ADE80",
      accentGlow:  "rgba(74, 222, 128, 0.4)",
      image:       "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=1600&auto=format&fit=crop&q=90",
      stat:        locale === "bn" ? "১৮০+ ধরনের সবজি" : "180+ Varieties",
      statIcon:    "🥬",
      floatStat1:  { label: locale === "bn" ? "আজ ডেলিভারি" : "Same Day", icon: "⚡", value: locale === "bn" ? "৪ ঘণ্টায়" : "In 4h" },
      floatStat2:  { label: locale === "bn" ? "তাজা গ্যারান্টি" : "Freshness", icon: "🌿", value: locale === "bn" ? "১০০%" : "100%" },
    },
    {
      badge:       locale === "bn" ? "সীমিত সময়ের অফার" : "Limited Time Offer",
      title:       locale === "bn" ? "তাজা মাছ — নদী থেকে সরাসরি আপনার কাছে" : "River-Fresh Fish — Caught Today, Delivered Today",
      subtitle:    locale === "bn" ? "ইলিশ, রুই, কাতলা — প্রতিদিন ভোরে ধরা তাজা মাছ পাচ্ছেন হোম ডেলিভারিতে।" : "Hilsa, Rui, Katla — sourced at dawn from verified river fishermen across Bangladesh.",
      ctaText:     locale === "bn" ? "মাছ কিনুন" : "Shop Fresh Fish",
      ctaLink:     "/category/fish-and-meat",
      promoTag:    locale === "bn" ? "১৫% ছাড়" : "15% OFF",
      bgGradient:  "linear-gradient(135deg, #020C1B 0%, #0A1E3D 40%, #0E2B5A 100%)",
      accentColor: "#60A5FA",
      accentGlow:  "rgba(96, 165, 250, 0.4)",
      image:       "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=1600&auto=format&fit=crop&q=90",
      stat:        locale === "bn" ? "৫০+ প্রজাতির মাছ" : "50+ Fish Species",
      statIcon:    "🐟",
      floatStat1:  { label: locale === "bn" ? "আজ ধরা" : "Caught Today", icon: "🎣", value: locale === "bn" ? "সকালে" : "Morning" },
      floatStat2:  { label: locale === "bn" ? "সর্বোচ্চ তাজা" : "Ultra Fresh", icon: "❄️", value: locale === "bn" ? "বরফ-সংরক্ষিত" : "Iced Fresh" },
    },
    {
      badge:       locale === "bn" ? "হোলসেল মূল্যে" : "Wholesale Rates",
      title:       locale === "bn" ? "চাল, ডাল ও মশলা — পাইকারি দামে কিনুন" : "Rice, Lentils & Spices — Buy at Wholesale Prices",
      subtitle:    locale === "bn" ? "ব্যবসায়িক অ্যাকাউন্ট খুলুন এবং সর্বোচ্চ ছাড়ে পণ্য কিনুন।" : "Open a business account and unlock tiered wholesale pricing on all staples.",
      ctaText:     locale === "bn" ? "স্টেপল কিনুন" : "Shop Pantry & Grains",
      ctaLink:     "/category/rice-and-staples",
      promoTag:    locale === "bn" ? "বাল্ক ছাড়" : "Bulk Deals",
      bgGradient:  "linear-gradient(135deg, #1A0700 0%, #3B1004 40%, #5A1A06 100%)",
      accentColor: "#FCD34D",
      accentGlow:  "rgba(252, 211, 77, 0.4)",
      image:       "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=1600&auto=format&fit=crop&q=90",
      stat:        locale === "bn" ? "২৫ কেজি+ বাল্ক" : "25kg+ Bulk Orders",
      statIcon:    "🌾",
      floatStat1:  { label: locale === "bn" ? "পাইকারি মূল্য" : "Wholesale", icon: "📦", value: locale === "bn" ? "৩০% ছাড়" : "30% OFF" },
      floatStat2:  { label: locale === "bn" ? "B2B অ্যাকাউন্ট" : "B2B Account", icon: "🏢", value: locale === "bn" ? "ফ্রি" : "Free" },
    },
  ];

  const SLIDE_DURATION = 6000;

  const goToSlide = useCallback((idx: number) => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentSlide(idx);
    setProgress(0);
    setAnimKey(k => k + 1);
    setTimeout(() => setIsTransitioning(false), 600);
  }, [isTransitioning]);

  const nextSlide = useCallback(() => goToSlide((currentSlide + 1) % slides.length), [currentSlide, goToSlide, slides.length]);
  const prevSlide = useCallback(() => goToSlide((currentSlide - 1 + slides.length) % slides.length), [currentSlide, goToSlide, slides.length]);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) { nextSlide(); return 0; }
        return p + (100 / (SLIDE_DURATION / 100));
      });
    }, 100);
    return () => clearInterval(interval);
  }, [nextSlide]);

  const slide = slides[currentSlide]!;

  return (
    <div style={{ padding: "16px 0 0" }}>
      <div className="container">
        <div
          style={{
            position: "relative",
            borderRadius: "var(--radius-2xl)",
            overflow: "hidden",
            background: slide.bgGradient,
            color: "#FFFFFF",
            minHeight: "clamp(380px, 52vw, 580px)",
            display: "flex",
            alignItems: "center",
            boxShadow: "var(--shadow-2xl)",
            transition: "background 0.7s cubic-bezier(0.22, 1, 0.36, 1)",
          }}
        >
          {/* Background Image */}
          <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
            <img
              key={`img-${currentSlide}`}
              src={slide.image}
              alt=""
              aria-hidden="true"
              style={{
                position: "absolute", inset: 0,
                width: "100%", height: "100%",
                objectFit: "cover", objectPosition: "center right",
                opacity: 0.38,
                animation: "fadeIn 0.7s ease forwards",
              }}
            />
            {/* Layered gradient masks */}
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(105deg, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.72) 42%, rgba(0,0,0,0.28) 68%, transparent 100%)" }} />
            <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse 55% 70% at -5% 50%, ${slide.accentGlow.replace("0.4", "0.08")} 0%, transparent 60%)` }} />
          </div>

          {/* Decorative floating orbs */}
          <div style={{ position: "absolute", top: "-80px", right: "8%",  width: "300px", height: "300px", borderRadius: "50%", background: `radial-gradient(circle, ${slide.accentGlow.replace("0.4", "0.07")} 0%, transparent 70%)`, pointerEvents: "none", animation: "float 6s ease-in-out infinite" }} />
          <div style={{ position: "absolute", bottom: "-60px", right: "30%", width: "200px", height: "200px", borderRadius: "50%", background: `radial-gradient(circle, ${slide.accentGlow.replace("0.4", "0.05")} 0%, transparent 70%)`, pointerEvents: "none", animation: "float 8s ease-in-out infinite 2s" }} />

          {/* Text Content */}
          <div
            key={`content-${animKey}`}
            style={{
              position: "relative", zIndex: 10,
              padding: "clamp(32px, 5.5vw, 60px)",
              maxWidth: "700px", width: "100%",
              animation: "slideInLeft 0.55s var(--ease-out) forwards",
            }}
          >
            {/* Badge row */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px", flexWrap: "wrap" }}>
              <div
                style={{
                  display: "inline-flex", alignItems: "center", gap: "7px",
                  padding: "6px 14px",
                  borderRadius: "var(--radius-full)",
                  background: "rgba(255,255,255,0.1)",
                  backdropFilter: "blur(12px)",
                  fontSize: "var(--text-xs)",
                  fontWeight: 800,
                  letterSpacing: "0.07em",
                  textTransform: "uppercase",
                  border: `1px solid rgba(255,255,255,0.2)`,
                  color: slide.accentColor,
                }}
              >
                <Sparkles size={12} />
                <span>{slide.badge}</span>
              </div>
              <span
                style={{
                  background: "linear-gradient(135deg, #EF4444, #DC2626)",
                  color: "#fff",
                  padding: "5px 13px",
                  borderRadius: "var(--radius-full)",
                  fontSize: "var(--text-xs)",
                  fontWeight: 900,
                  letterSpacing: "0.04em",
                  boxShadow: "0 4px 16px rgba(220,38,38,0.45)",
                  animation: "badgePop 2s ease infinite",
                }}
              >
                {slide.promoTag}
              </span>
            </div>

            {/* Main heading */}
            <h1
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "var(--text-hero)",
                fontWeight: 700,
                lineHeight: 1.14,
                letterSpacing: "-0.025em",
                marginBottom: "16px",
                textShadow: "0 2px 20px rgba(0,0,0,0.4)",
              }}
            >
              {slide.title}
            </h1>

            {/* Subtitle */}
            <p
              style={{
                fontSize: "var(--text-base)",
                lineHeight: 1.7,
                color: "rgba(255,255,255,0.82)",
                marginBottom: "32px",
                maxWidth: "50ch",
              }}
            >
              {slide.subtitle}
            </p>

            {/* CTA Row */}
            <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
              <Link
                href={slide.ctaLink}
                style={{
                  display: "inline-flex", alignItems: "center", gap: "8px",
                  padding: "14px 28px",
                  borderRadius: "var(--radius-full)",
                  background: "#FFFFFF",
                  color: "var(--primary-deep)",
                  fontWeight: 900,
                  fontSize: "var(--text-base)",
                  boxShadow: "0 6px 24px rgba(0,0,0,0.28)",
                  transition: "all 0.28s var(--ease-out)",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = "translateY(-3px)";
                  e.currentTarget.style.boxShadow = "0 12px 36px rgba(0,0,0,0.32)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 6px 24px rgba(0,0,0,0.28)";
                }}
              >
                <span>{slide.ctaText}</span>
                <ArrowRight size={17} />
              </Link>

              <Link
                href="/b2b"
                className="btn-ghost"
                style={{ fontSize: "var(--text-sm)" }}
              >
                <TrendingUp size={14} />
                <span>{locale === "bn" ? "পাইকারি রেট" : "Wholesale Rates"}</span>
              </Link>
            </div>

            {/* Stats pills */}
            <div style={{ display: "flex", gap: "10px", marginTop: "28px", flexWrap: "wrap" }}>
              {[
                { icon: slide.statIcon, text: slide.stat },
                { icon: "⭐", text: locale === "bn" ? "৪.৯ রেটিং" : "4.9 Rating" },
                { icon: "🚀", text: locale === "bn" ? "১০,০০০+ পরিবার" : "10k+ Families" },
              ].map((s, i) => (
                <div
                  key={i}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: "6px",
                    padding: "6px 14px",
                    borderRadius: "var(--radius-full)",
                    background: "rgba(255,255,255,0.08)",
                    border: "1px solid rgba(255,255,255,0.15)",
                    fontSize: "var(--text-xs)",
                    color: "rgba(255,255,255,0.82)",
                    fontWeight: 600,
                    backdropFilter: "blur(8px)",
                  }}
                >
                  <span>{s.icon}</span>
                  <span>{s.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Floating stat cards */}
          <div
            key={`stats-${animKey}`}
            style={{
              position: "absolute", right: "clamp(20px, 4vw, 40px)",
              top: "50%", transform: "translateY(-50%)",
              display: "flex", flexDirection: "column", gap: "12px",
              zIndex: 15,
              animation: "slideInRight 0.6s 0.15s var(--ease-out) both",
              pointerEvents: "none",
            }}
            className="hidden-mobile"
          >
            {[slide.floatStat1, slide.floatStat2].map((s, i) => (
              <div
                key={i}
                className="floating-card"
                style={{
                  padding: "14px 18px",
                  display: "flex", alignItems: "center", gap: "12px",
                  minWidth: "170px",
                  animation: `float ${4 + i}s ease-in-out infinite ${i * 1.5}s`,
                }}
              >
                <div
                  style={{
                    width: "38px", height: "38px",
                    borderRadius: "var(--radius-md)",
                    background: `${slide.accentGlow.replace("0.4", "0.15")}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "1.3rem",
                    flexShrink: 0,
                  }}
                >
                  {s.icon}
                </div>
                <div>
                  <div style={{ fontSize: "0.65rem", color: "var(--text-muted)", fontWeight: 600, marginBottom: "2px" }}>{s.label}</div>
                  <div style={{ fontSize: "var(--text-sm)", fontWeight: 800, color: "var(--text-main)" }}>{s.value}</div>
                </div>
              </div>
            ))}

            {/* Rating float card */}
            <div
              className="floating-card"
              style={{
                padding: "12px 18px",
                display: "flex", alignItems: "center", gap: "10px",
                animation: "float 5s ease-in-out infinite 1s",
              }}
            >
              <div style={{ display: "flex", gap: "2px" }}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={12} fill="#F59E0B" color="#F59E0B" />
                ))}
              </div>
              <span style={{ fontSize: "var(--text-xs)", fontWeight: 800, color: "var(--text-main)" }}>
                {locale === "bn" ? "৪.৯/৫ রেটিং" : "4.9/5 Rating"}
              </span>
            </div>
          </div>

          {/* Progress bar */}
          <div
            style={{
              position: "absolute", bottom: 0, left: 0, right: 0,
              height: "3px",
              background: "rgba(255,255,255,0.12)",
              zIndex: 20,
            }}
          >
            <div
              style={{
                height: "100%", width: `${progress}%`,
                background: `linear-gradient(90deg, ${slide.accentColor}, rgba(255,255,255,0.8))`,
                transition: "width 0.1s linear",
                boxShadow: `0 0 8px ${slide.accentColor}`,
              }}
            />
          </div>

          {/* Arrow buttons */}
          {[
            { onClick: prevSlide, style: { left: "14px" }, Icon: ChevronLeft },
            { onClick: nextSlide, style: { right: "14px" }, Icon: ChevronRight },
          ].map(({ onClick, style: s, Icon }, i) => (
            <button
              key={i}
              onClick={onClick}
              aria-label={i === 0 ? "Previous slide" : "Next slide"}
              style={{
                position: "absolute", top: "50%", transform: "translateY(-50%)",
                ...s,
                width: "44px", height: "44px",
                borderRadius: "50%",
                background: "rgba(0,0,0,0.4)",
                backdropFilter: "blur(12px)",
                color: "#FFF",
                display: "flex", alignItems: "center", justifyContent: "center",
                zIndex: 20,
                border: "1px solid rgba(255,255,255,0.18)",
                transition: "all 0.2s ease",
                cursor: "pointer",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(0,0,0,0.65)"; e.currentTarget.style.transform = "translateY(-50%) scale(1.08)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(0,0,0,0.4)"; e.currentTarget.style.transform = "translateY(-50%) scale(1)"; }}
            >
              <Icon size={21} />
            </button>
          ))}

          {/* Slide indicators */}
          <div
            style={{
              position: "absolute", bottom: "18px", left: "50%",
              transform: "translateX(-50%)",
              display: "flex", gap: "8px", zIndex: 20,
            }}
          >
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => goToSlide(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                style={{
                  width: currentSlide === idx ? "32px" : "8px",
                  height: "8px",
                  borderRadius: "999px",
                  background: currentSlide === idx ? slide.accentColor : "rgba(255,255,255,0.35)",
                  border: "none", cursor: "pointer",
                  transition: "all 0.4s var(--ease-bounce)",
                  padding: 0,
                  boxShadow: currentSlide === idx ? `0 0 10px ${slide.accentColor}` : "none",
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
