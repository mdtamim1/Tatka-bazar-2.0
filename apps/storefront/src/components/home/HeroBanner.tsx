"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight, Star, Sparkles } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export function HeroBanner() {
  const { locale } = useLanguage();
  const [currentSlide, setCurrentSlide]         = useState(0);
  const [progress, setProgress]                 = useState(0);
  const [isTransitioning, setIsTransitioning]   = useState(false);
  const [animKey, setAnimKey]                   = useState(0);
  const bannerRef                               = useRef<HTMLDivElement>(null);

  const slides = [
    {
      badge:      locale === "bn" ? "আজকের সেরা অফার" : "Today's Best Deal",
      title:      locale === "bn" ? "তাজা সবজি ও নদী মাছ" : "Farm-Fresh & River-Caught Produce",
      titleAccent:locale === "bn" ? "সরাসরি আপনার দরজায়" : "Delivered Daily",
      subtitle:   locale === "bn" ? "রাসায়নিকমুক্ত শাকসবজি ও নদীর টাটকা মাছ সকালে সংগ্রহ করে দ্রুত পৌঁছে দিচ্ছি।" : "Chemical-free organic vegetables & authentic river fish delivered fresh.",
      ctaText:    locale === "bn" ? "বাজার করুন" : "Shop Fresh Now",
      ctaLink:    "/category/vegetables",
      promoTag:   locale === "bn" ? "৳৫০ ছাড়" : "৳50 OFF",
      accentColor:"#10D876",
      accentGlow: "rgba(16, 216, 118, 0.45)",
      gradientBg: "linear-gradient(135deg, #020A04 0%, #041508 35%, #071E0C 65%, #0A2810 100%)",
      image:      "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=1600&auto=format&fit=crop&q=90",
      floats: [
        { icon: "⚡", label: locale === "bn" ? "আজ ডেলিভারি" : "Same Day", value: locale === "bn" ? "৪ ঘণ্টায়" : "In 4 hrs" },
        { icon: "🌿", label: locale === "bn" ? "তাজা গ্যারান্টি" : "Freshness", value: locale === "bn" ? "১০০%" : "100%" },
        { icon: "🌾", label: locale === "bn" ? "জৈব পণ্য" : "Organic", value: locale === "bn" ? "১৮০+" : "180+ Items" },
      ],
    },
    {
      badge:      locale === "bn" ? "সীমিত সময়ের অফার" : "Limited Time Offer",
      title:      locale === "bn" ? "পদ্মা ও মেঘনার তাজা মাছ" : "River-Fresh Fish Caught Today",
      titleAccent:locale === "bn" ? "ভোরে ধরা" : "Morning Catch",
      subtitle:   locale === "bn" ? "ইলিশ, রুই, কাতলা — বরফ ছাড়া তাজা মাছ পাচ্ছেন দ্রুততম হোম ডেলিভারিতে।" : "Padma Hilsa, Rui & Katla — direct from verified river fishermen.",
      ctaText:    locale === "bn" ? "মাছ কিনুন" : "Shop Fresh Fish",
      ctaLink:    "/category/fish-and-meat",
      promoTag:   locale === "bn" ? "১৫% ছাড়" : "15% OFF",
      accentColor:"#4F9EFF",
      accentGlow: "rgba(79, 158, 255, 0.45)",
      gradientBg: "linear-gradient(135deg, #010609 0%, #030D1E 35%, #061535 65%, #081A40 100%)",
      image:      "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=1600&auto=format&fit=crop&q=90",
      floats: [
        { icon: "🎣", label: locale === "bn" ? "আজ ধরা" : "Caught Today", value: locale === "bn" ? "সকালে" : "Morning" },
        { icon: "❄️", label: locale === "bn" ? "সর্বোচ্চ তাজা" : "Ultra Fresh", value: locale === "bn" ? "বরফমুক্ত" : "Iced Fresh" },
        { icon: "🐟", label: locale === "bn" ? "মাছের প্রজাতি" : "Fish Species", value: locale === "bn" ? "৫০+" : "50+" },
      ],
    },
    {
      badge:      locale === "bn" ? "হোলসেল মূল্যে" : "Wholesale Rates",
      title:      locale === "bn" ? "চাল, ডাল ও খাঁটি মশলা" : "Rice, Lentils & Spices",
      titleAccent:locale === "bn" ? "পাইকারি দামে" : "Bulk Rates",
      subtitle:   locale === "bn" ? "ব্যবসায়িক অ্যাকাউন্ট ও পারিবারিক বড় বাজারে সর্বোচ্চ সাশ্রয়ী অফার।" : "Unlock tiered wholesale pricing and special deals on pantry staples.",
      ctaText:    locale === "bn" ? "স্টেপল কিনুন" : "Shop Staples",
      ctaLink:    "/category/rice-and-staples",
      promoTag:   locale === "bn" ? "বাল্ক ছাড়" : "Bulk Deals",
      accentColor:"#F5C842",
      accentGlow: "rgba(245, 200, 66, 0.45)",
      gradientBg: "linear-gradient(135deg, #090401 0%, #180802 35%, #220C02 65%, #2E1005 100%)",
      image:      "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=1600&auto=format&fit=crop&q=90",
      floats: [
        { icon: "📦", label: locale === "bn" ? "পাইকারি মূল্য" : "Wholesale", value: locale === "bn" ? "৩০% ছাড়" : "30% OFF" },
        { icon: "🏢", label: locale === "bn" ? "B2B অ্যাকাউন্ট" : "B2B Account", value: locale === "bn" ? "ফ্রি" : "Free" },
        { icon: "🌾", label: locale === "bn" ? "বাল্ক অর্ডার" : "Bulk Orders", value: locale === "bn" ? "২৫ কেজি+" : "25kg+" },
      ],
    },
  ];

  const SLIDE_DURATION = 6000;

  const goToSlide = useCallback((idx: number) => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentSlide(idx);
    setProgress(0);
    setAnimKey(k => k + 1);
    setTimeout(() => setIsTransitioning(false), 500);
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
    <div style={{ padding: "14px 0 0" }}>
      <div className="container">
        <div
          ref={bannerRef}
          style={{
            position: "relative",
            borderRadius: "18px",
            overflow: "hidden",
            background: slide.gradientBg,
            color: "#FFFFFF",
            minHeight: "clamp(220px, 32vw, 340px)",
            display: "flex",
            alignItems: "center",
            boxShadow: `0 12px 36px -8px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.06), 0 0 80px ${slide.accentGlow.replace("0.45", "0.08")}`,
            transition: "background 0.6s ease",
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
                opacity: 0.28,
                animation: "fadeIn 0.6s ease forwards",
              }}
            />
          </div>

          {/* Gradients */}
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(95deg, rgba(0,0,0,0.94) 0%, rgba(0,0,0,0.75) 45%, rgba(0,0,0,0.2) 75%, transparent 100%)", zIndex: 1 }} />
          <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse 60% 80% at -10% 50%, ${slide.accentGlow.replace("0.45", "0.12")} 0%, transparent 65%)`, zIndex: 1 }} />

          {/* Content */}
          <div
            key={`content-${animKey}`}
            style={{
              position: "relative", zIndex: 10,
              padding: "clamp(20px, 3.5vw, 40px)",
              maxWidth: "580px", width: "100%",
            }}
          >
            {/* Badge & Promo Row */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px", flexWrap: "wrap" }}>
              <div
                style={{
                  display: "inline-flex", alignItems: "center", gap: "5px",
                  padding: "4px 10px",
                  borderRadius: "var(--radius-full)",
                  background: "rgba(255,255,255,0.08)",
                  backdropFilter: "blur(12px)",
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  letterSpacing: "0.04em",
                  border: `1px solid rgba(255,255,255,0.12)`,
                  color: slide.accentColor,
                }}
              >
                <Sparkles size={11} />
                <span>{slide.badge}</span>
              </div>
              <span
                style={{
                  background: "linear-gradient(135deg, #FF4D6D, #E83055)",
                  color: "#fff",
                  padding: "3px 10px",
                  borderRadius: "var(--radius-full)",
                  fontSize: "0.7rem",
                  fontWeight: 900,
                  boxShadow: "0 2px 10px rgba(255,77,109,0.4)",
                }}
              >
                {slide.promoTag}
              </span>
            </div>

            {/* Heading */}
            <h1
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: "clamp(1.2rem, 3.2vw, 2.1rem)",
                fontWeight: 800,
                lineHeight: 1.15,
                letterSpacing: "-0.03em",
                margin: "0 0 8px 0",
              }}
            >
              {slide.title}{" "}
              <span style={{ color: slide.accentColor }}>
                {slide.titleAccent}
              </span>
            </h1>

            {/* Subtitle */}
            <p
              style={{
                fontSize: "clamp(0.75rem, 1.6vw, 0.88rem)",
                lineHeight: 1.5,
                color: "rgba(240,242,247,0.72)",
                margin: "0 0 16px 0",
                maxWidth: "45ch",
              }}
            >
              {slide.subtitle}
            </p>

            {/* CTA Button */}
            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              <Link
                href={slide.ctaLink}
                style={{
                  display: "inline-flex", alignItems: "center", gap: "7px",
                  padding: "9px 20px",
                  borderRadius: "var(--radius-full)",
                  background: slide.accentColor,
                  color: "#03140a",
                  fontWeight: 800,
                  fontSize: "0.84rem",
                  boxShadow: `0 4px 18px ${slide.accentGlow}`,
                  textDecoration: "none",
                  transition: "all 0.2s ease",
                }}
              >
                <span>{slide.ctaText}</span>
                <ArrowRight size={15} />
              </Link>
            </div>
          </div>

          {/* Floating Stat Badges (Desktop Only) */}
          <div
            key={`stats-${animKey}`}
            style={{
              position: "absolute", right: "28px",
              top: "50%", transform: "translateY(-50%)",
              display: "flex", flexDirection: "column", gap: "10px",
              zIndex: 15,
              pointerEvents: "none",
            }}
            className="hidden-mobile"
          >
            {slide.floats.slice(0, 2).map((s, i) => (
              <div
                key={i}
                className="floating-card"
                style={{
                  padding: "10px 16px",
                  display: "flex", alignItems: "center", gap: "10px",
                  minWidth: "160px",
                  background: "rgba(12, 16, 23, 0.88)",
                  backdropFilter: "blur(16px)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "12px",
                }}
              >
                <div
                  style={{
                    width: "32px", height: "32px",
                    borderRadius: "8px",
                    background: `${slide.accentGlow.replace("0.45", "0.15")}`,
                    border: `1px solid ${slide.accentGlow.replace("0.45", "0.3")}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "1.1rem",
                    flexShrink: 0,
                  }}
                >
                  {s.icon}
                </div>
                <div>
                  <div style={{ fontSize: "0.62rem", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase" }}>{s.label}</div>
                  <div style={{ fontSize: "0.82rem", fontWeight: 800, color: "#ffffff" }}>{s.value}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Progress bar */}
          <div
            style={{
              position: "absolute", bottom: 0, left: 0, right: 0,
              height: "2px",
              background: "rgba(255,255,255,0.08)",
              zIndex: 20,
            }}
          >
            <div
              style={{
                height: "100%", width: `${progress}%`,
                background: slide.accentColor,
                transition: "width 0.1s linear",
              }}
            />
          </div>

          {/* Arrow buttons */}
          {[
            { onClick: prevSlide, style: { left: "10px" }, Icon: ChevronLeft },
            { onClick: nextSlide, style: { right: "10px" }, Icon: ChevronRight },
          ].map(({ onClick, style: s, Icon }, i) => (
            <button
              key={i}
              onClick={onClick}
              aria-label={i === 0 ? "Previous Slide" : "Next Slide"}
              style={{
                position: "absolute", top: "50%", transform: "translateY(-50%)",
                width: "30px", height: "30px",
                borderRadius: "50%",
                background: "rgba(0,0,0,0.5)",
                border: "1px solid rgba(255,255,255,0.12)",
                color: "#ffffff",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer",
                zIndex: 25,
                transition: "all 0.2s ease",
                ...s,
              }}
            >
              <Icon size={16} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
