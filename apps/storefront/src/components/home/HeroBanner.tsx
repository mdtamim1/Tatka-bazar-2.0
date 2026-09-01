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
  const [mousePos, setMousePos]                 = useState({ x: 0, y: 0 });
  const bannerRef                               = useRef<HTMLDivElement>(null);

  const slides = [
    {
      badge:      locale === "bn" ? "আজকের সেরা অফার" : "Today's Best Deal",
      title:      locale === "bn" ? "তাজা সবজি — কৃষকের কাছ থেকে সরাসরি" : "Farm-Fresh & River-Caught Produce Delivered Daily",
      titleAccent:locale === "bn" ? "সরাসরি" : "Delivered Daily",
      subtitle:   locale === "bn" ? "রাসায়নিকমুক্ত, জৈব সবজি সকালে সংগ্রহ করে বিকেলে আপনার দরজায়।" : "Chemical-free vegetables, live river fish and authentic pantry staples directly sourced from farmers across Bangladesh.",
      ctaText:    locale === "bn" ? "সবজি কিনুন" : "Shop Fresh Now",
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
      title:      locale === "bn" ? "তাজা মাছ — নদী থেকে সরাসরি আপনার কাছে" : "River-Fresh Fish — Caught Today,",
      titleAccent:locale === "bn" ? "আপনার কাছে" : "Delivered Today",
      subtitle:   locale === "bn" ? "ইলিশ, রুই, কাতলা — প্রতিদিন ভোরে ধরা তাজা মাছ পাচ্ছেন হোম ডেলিভারিতে।" : "Hilsa, Rui, Katla — sourced at dawn from verified river fishermen across Bangladesh.",
      ctaText:    locale === "bn" ? "মাছ কিনুন" : "Shop Fresh Fish",
      ctaLink:    "/category/fish-and-meat",
      promoTag:   locale === "bn" ? "১৫% ছাড়" : "15% OFF",
      accentColor:"#4F9EFF",
      accentGlow: "rgba(79, 158, 255, 0.45)",
      gradientBg: "linear-gradient(135deg, #010609 0%, #030D1E 35%, #061535 65%, #081A40 100%)",
      image:      "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=1600&auto=format&fit=crop&q=90",
      floats: [
        { icon: "🎣", label: locale === "bn" ? "আজ ধরা" : "Caught Today", value: locale === "bn" ? "সকালে" : "Morning" },
        { icon: "❄️", label: locale === "bn" ? "সর্বোচ্চ তাজা" : "Ultra Fresh", value: locale === "bn" ? "বরফ-সংরক্ষিত" : "Iced Fresh" },
        { icon: "🐟", label: locale === "bn" ? "মাছের প্রজাতি" : "Fish Species", value: locale === "bn" ? "৫০+" : "50+" },
      ],
    },
    {
      badge:      locale === "bn" ? "হোলসেল মূল্যে" : "Wholesale Rates",
      title:      locale === "bn" ? "চাল, ডাল ও মশলা — পাইকারি দামে কিনুন" : "Rice, Lentils & Spices —",
      titleAccent:locale === "bn" ? "পাইকারি দামে" : "Buy at Wholesale",
      subtitle:   locale === "bn" ? "ব্যবসায়িক অ্যাকাউন্ট খুলুন এবং সর্বোচ্চ ছাড়ে পণ্য কিনুন।" : "Open a business account and unlock tiered wholesale pricing on all staples.",
      ctaText:    locale === "bn" ? "স্টেপল কিনুন" : "Shop Pantry & Grains",
      ctaLink:    "/category/rice-and-staples",
      promoTag:   locale === "bn" ? "বাল্ক ছাড়" : "Bulk Deals",
      accentColor:"#F5C842",
      accentGlow: "rgba(245, 200, 66, 0.45)",
      gradientBg: "linear-gradient(135deg, #090401 0%, #18080200 35%, #220C02 65%, #2E1005 100%)",
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
    setTimeout(() => setIsTransitioning(false), 700);
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

  // 3D Parallax on mouse move
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!bannerRef.current) return;
    const rect = bannerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    setMousePos({ x, y });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setMousePos({ x: 0, y: 0 });
  }, []);

  const slide = slides[currentSlide]!;

  return (
    <div style={{ padding: "16px 0 0" }}>
      <div className="container">
        <div
          ref={bannerRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{
            position: "relative",
            borderRadius: "var(--radius-3xl)",
            overflow: "hidden",
            background: slide.gradientBg,
            color: "#FFFFFF",
            minHeight: "clamp(400px, 55vw, 600px)",
            display: "flex",
            alignItems: "center",
            boxShadow: `var(--shadow-2xl), 0 0 0 1px rgba(255,255,255,0.05), 0 0 120px ${slide.accentGlow.replace("0.45", "0.08")}`,
            transition: "background 0.8s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.8s ease",
          }}
        >
          {/* ── Background Image with 3D parallax ── */}
          <div
            style={{
              position: "absolute", inset: 0, zIndex: 0,
              transform: `translate(${mousePos.x * -12}px, ${mousePos.y * -8}px) scale(1.06)`,
              transition: "transform 0.4s ease-out",
              willChange: "transform",
            }}
          >
            <img
              key={`img-${currentSlide}`}
              src={slide.image}
              alt=""
              aria-hidden="true"
              style={{
                position: "absolute", inset: 0,
                width: "100%", height: "100%",
                objectFit: "cover", objectPosition: "center right",
                opacity: 0.3,
                animation: "fadeIn 0.8s ease forwards",
              }}
            />
          </div>

          {/* ── Gradient overlays ── */}
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(105deg, rgba(0,0,0,0.96) 0%, rgba(0,0,0,0.78) 42%, rgba(0,0,0,0.25) 68%, transparent 100%)", zIndex: 1 }} />
          <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse 60% 80% at -10% 50%, ${slide.accentGlow.replace("0.45", "0.1")} 0%, transparent 65%)`, zIndex: 1 }} />
          <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 70% 50% at 50% 100%, rgba(0,0,0,0.6) 0%, transparent 70%)", zIndex: 1 }} />

          {/* ── Floating 3D Orbs ── */}
          <div
            style={{
              position: "absolute", top: "-100px", right: "5%",
              width: "400px", height: "400px", borderRadius: "50%",
              background: `radial-gradient(circle, ${slide.accentGlow.replace("0.45","0.08")} 0%, transparent 70%)`,
              pointerEvents: "none", zIndex: 1,
              animation: "gravityFloat 7s ease-in-out infinite",
              transform: `translateX(${mousePos.x * 20}px) translateY(${mousePos.y * 15}px)`,
              transition: "transform 0.5s ease-out",
            }}
          />
          <div
            style={{
              position: "absolute", bottom: "-80px", right: "28%",
              width: "250px", height: "250px", borderRadius: "50%",
              background: `radial-gradient(circle, ${slide.accentGlow.replace("0.45","0.06")} 0%, transparent 70%)`,
              pointerEvents: "none", zIndex: 1,
              animation: "gravityFloatSlow 9s ease-in-out infinite 2s",
            }}
          />
          <div
            style={{
              position: "absolute", top: "10%", right: "35%",
              width: "180px", height: "180px", borderRadius: "50%",
              background: `radial-gradient(circle, rgba(255,255,255,0.03) 0%, transparent 70%)`,
              pointerEvents: "none", zIndex: 1,
              animation: "gravityFloat 5s ease-in-out infinite 1s",
            }}
          />

          {/* ── Grid lines decoration ── */}
          <div
            style={{
              position: "absolute", inset: 0, zIndex: 1, pointerEvents: "none",
              backgroundImage: `
                linear-gradient(rgba(255,255,255,0.018) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255,255,255,0.018) 1px, transparent 1px)
              `,
              backgroundSize: "60px 60px",
              maskImage: "linear-gradient(to right, transparent 0%, black 30%, black 70%, transparent 100%)",
            }}
          />

          {/* ── Main Content ── */}
          <div
            key={`content-${animKey}`}
            style={{
              position: "relative", zIndex: 10,
              padding: "clamp(36px, 6vw, 68px)",
              maxWidth: "700px", width: "100%",
              animation: "slideInLeft 0.65s var(--ease-out) forwards",
            }}
          >
            {/* Badge row */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "22px", flexWrap: "wrap" }}>
              <div
                style={{
                  display: "inline-flex", alignItems: "center", gap: "7px",
                  padding: "6px 16px",
                  borderRadius: "var(--radius-full)",
                  background: "rgba(255,255,255,0.07)",
                  backdropFilter: "blur(16px)",
                  fontSize: "var(--text-xs)",
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  border: `1px solid rgba(255,255,255,0.12)`,
                  color: slide.accentColor,
                }}
              >
                <Sparkles size={12} />
                <span>{slide.badge}</span>
              </div>
              <span
                style={{
                  background: "linear-gradient(135deg, #FF4D6D, #E83055)",
                  color: "#fff",
                  padding: "5px 14px",
                  borderRadius: "var(--radius-full)",
                  fontSize: "var(--text-xs)",
                  fontWeight: 900,
                  letterSpacing: "0.04em",
                  boxShadow: "0 4px 20px rgba(255,77,109,0.5)",
                  animation: "badgePop 2.5s ease infinite",
                }}
              >
                {slide.promoTag}
              </span>
            </div>

            {/* Main heading */}
            <h1
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: "var(--text-hero)",
                fontWeight: 800,
                lineHeight: 1.1,
                letterSpacing: "-0.04em",
                marginBottom: "18px",
              }}
            >
              {slide.title.replace(slide.titleAccent, "")}
              <span
                style={{
                  color: slide.accentColor,
                  textShadow: `0 0 40px ${slide.accentGlow}`,
                  display: "inline",
                }}
              >
                {" "}{slide.titleAccent}
              </span>
            </h1>

            {/* Subtitle */}
            <p
              style={{
                fontSize: "var(--text-base)",
                lineHeight: 1.75,
                color: "rgba(240,242,247,0.72)",
                marginBottom: "36px",
                maxWidth: "52ch",
              }}
            >
              {slide.subtitle}
            </p>

            {/* CTA Row */}
            <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
              <Link
                href={slide.ctaLink}
                style={{
                  display: "inline-flex", alignItems: "center", gap: "9px",
                  padding: "15px 30px",
                  borderRadius: "var(--radius-full)",
                  background: slide.accentColor,
                  color: "#000",
                  fontWeight: 800,
                  fontSize: "var(--text-base)",
                  boxShadow: `0 8px 28px ${slide.accentGlow}, inset 0 1px 0 rgba(255,255,255,0.3)`,
                  transition: "all 0.3s var(--ease-out)",
                  fontFamily: "var(--font-heading)",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = "translateY(-4px) scale(1.02)";
                  e.currentTarget.style.boxShadow = `0 16px 44px ${slide.accentGlow}, 0 0 60px ${slide.accentGlow.replace("0.45","0.15")}`;
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = "translateY(0) scale(1)";
                  e.currentTarget.style.boxShadow = `0 8px 28px ${slide.accentGlow}, inset 0 1px 0 rgba(255,255,255,0.3)`;
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
                <span>{locale === "bn" ? "পাইকারি রেট" : "Wholesale Rates"}</span>
              </Link>
            </div>

            {/* Stats pills */}
            <div style={{ display: "flex", gap: "10px", marginTop: "32px", flexWrap: "wrap" }}>
              {[
                { icon: "⭐", text: locale === "bn" ? "৪.৯/৫ রেটিং" : "4.9/5 Rating" },
                { icon: "🚀", text: locale === "bn" ? "১০,০০০+ পরিবার" : "10k+ Families" },
                { icon: "✅", text: locale === "bn" ? "১০০% চেমিকালমুক্ত" : "100% Chemical-Free" },
              ].map((s, i) => (
                <div
                  key={i}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: "6px",
                    padding: "6px 14px",
                    borderRadius: "var(--radius-full)",
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    fontSize: "var(--text-xs)",
                    color: "rgba(240,242,247,0.75)",
                    fontWeight: 600,
                    backdropFilter: "blur(12px)",
                  }}
                >
                  <span>{s.icon}</span>
                  <span>{s.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Floating Stat Cards (3D gravity) ── */}
          <div
            key={`stats-${animKey}`}
            style={{
              position: "absolute", right: "clamp(20px, 4.5vw, 48px)",
              top: "50%", transform: `translateY(-50%) translateX(${mousePos.x * -10}px)`,
              display: "flex", flexDirection: "column", gap: "14px",
              zIndex: 15,
              animation: "slideInRight 0.7s 0.18s var(--ease-out) both",
              pointerEvents: "none",
              transition: "transform 0.4s ease-out",
            }}
            className="hidden-mobile"
          >
            {slide.floats.map((s, i) => (
              <div
                key={i}
                className="floating-card"
                style={{
                  padding: "16px 20px",
                  display: "flex", alignItems: "center", gap: "14px",
                  minWidth: "185px",
                  animation: `gravityFloat ${4 + i * 1.5}s ease-in-out infinite ${i * 1.2}s`,
                  boxShadow: `var(--shadow-xl), inset 0 1px 0 rgba(255,255,255,0.08), 0 0 30px ${slide.accentGlow.replace("0.45","0.06")}`,
                  border: `1px solid rgba(255,255,255,0.1)`,
                }}
              >
                <div
                  style={{
                    width: "42px", height: "42px",
                    borderRadius: "var(--radius-md)",
                    background: `${slide.accentGlow.replace("0.45", "0.12")}`,
                    border: `1px solid ${slide.accentGlow.replace("0.45", "0.25")}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "1.4rem",
                    flexShrink: 0,
                  }}
                >
                  {s.icon}
                </div>
                <div>
                  <div style={{ fontSize: "0.65rem", color: "var(--text-muted)", fontWeight: 600, marginBottom: "3px", textTransform: "uppercase", letterSpacing: "0.06em" }}>{s.label}</div>
                  <div style={{ fontSize: "var(--text-sm)", fontWeight: 800, color: "var(--text-main)" }}>{s.value}</div>
                </div>
              </div>
            ))}

            {/* Rating float card */}
            <div
              className="floating-card"
              style={{
                padding: "13px 20px",
                display: "flex", alignItems: "center", gap: "12px",
                animation: "gravityFloatSlow 6s ease-in-out infinite 1.5s",
              }}
            >
              <div style={{ display: "flex", gap: "2px" }}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={13} fill="#F5C842" color="#F5C842" />
                ))}
              </div>
              <div>
                <div style={{ fontSize: "var(--text-xs)", fontWeight: 800, color: "var(--text-main)" }}>
                  {locale === "bn" ? "৪.৯/৫" : "4.9/5"}
                </div>
                <div style={{ fontSize: "0.62rem", color: "var(--text-muted)" }}>
                  {locale === "bn" ? "গ্রাহক রেটিং" : "Customer Rating"}
                </div>
              </div>
            </div>
          </div>

          {/* ── Progress bar ── */}
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
                background: `linear-gradient(90deg, ${slide.accentColor}, rgba(255,255,255,0.7))`,
                transition: "width 0.1s linear",
                boxShadow: `0 0 12px ${slide.accentColor}, 0 0 24px ${slide.accentGlow}`,
              }}
            />
          </div>

          {/* ── Arrow buttons ── */}
          {[
            { onClick: prevSlide, style: { left: "18px" }, Icon: ChevronLeft },
            { onClick: nextSlide, style: { right: "18px" }, Icon: ChevronRight },
          ].map(({ onClick, style: s, Icon }, i) => (
            <button
              key={i}
              onClick={onClick}
              aria-label={i === 0 ? "Previous slide" : "Next slide"}
              style={{
                position: "absolute", top: "50%", transform: "translateY(-50%)",
                ...s,
                width: "46px", height: "46px",
                borderRadius: "50%",
                background: "rgba(8, 9, 11, 0.55)",
                backdropFilter: "blur(16px)",
                color: "#FFF",
                display: "flex", alignItems: "center", justifyContent: "center",
                zIndex: 20,
                border: "1px solid rgba(255,255,255,0.1)",
                transition: "all 0.25s ease",
                cursor: "pointer",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = "rgba(8,9,11,0.85)";
                e.currentTarget.style.transform = "translateY(-50%) scale(1.1)";
                e.currentTarget.style.borderColor = `rgba(255,255,255,0.2)`;
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = "rgba(8,9,11,0.55)";
                e.currentTarget.style.transform = "translateY(-50%) scale(1)";
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
              }}
            >
              <Icon size={22} />
            </button>
          ))}

          {/* ── Slide indicators ── */}
          <div
            style={{
              position: "absolute", bottom: "22px", left: "50%",
              transform: "translateX(-50%)",
              display: "flex", gap: "8px", zIndex: 20,
            }}
          >
            {slides.map((sl, idx) => (
              <button
                key={idx}
                onClick={() => goToSlide(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                style={{
                  width: currentSlide === idx ? "30px" : "7px",
                  height: "7px",
                  borderRadius: "999px",
                  background: currentSlide === idx ? sl.accentColor : "rgba(255,255,255,0.25)",
                  border: "none", cursor: "pointer",
                  transition: "all 0.45s var(--ease-bounce)",
                  padding: 0,
                  boxShadow: currentSlide === idx ? `0 0 12px ${sl.accentColor}` : "none",
                }}
              />
            ))}
          </div>

          {/* ── Top neon accent ── */}
          <div
            style={{
              position: "absolute", top: 0, left: 0, right: 0,
              height: "1px",
              background: `linear-gradient(90deg, transparent, ${slide.accentColor}, transparent)`,
              zIndex: 20,
            }}
          />
        </div>
      </div>
    </div>
  );
}
