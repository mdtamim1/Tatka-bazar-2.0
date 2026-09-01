"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Heart, Star, ShoppingBag, ArrowRight } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useCartStore } from "@/lib/cart-store";
import { PRODUCTS } from "@/lib/catalog";

export function HeroBanner() {
  const { locale, formatPrice } = useLanguage();
  const { toggleWishlist, isInWishlist, addItem, openCart } = useCartStore();

  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [animKey, setAnimKey] = useState(0);

  const slides = [
    {
      id: "slide-1",
      title: locale === "bn" ? "আপনার প্রতিদিনের তাজা বাজার" : "Your Complete Fresh Routine",
      subtitle: locale === "bn"
        ? "রাসায়নিকমুক্ত শাকসবজি ও পদ্মার তাজা মাছ প্রতিদিন ভোরে সরাসরি সংগ্রহ করে আপনার দরজায় পৌঁছে দিচ্ছি।"
        : "A curated farm-fresh collection designed to nourish, energize, and provide chemical-free freshness daily.",
      ctaText: locale === "bn" ? "বাজার করুন" : "Shop Now",
      ctaLink: "/category/vegetables",
      bgImage: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=1920&auto=format&fit=crop&q=90",
      featuredProduct: {
        id: PRODUCTS[0]?.id || "p1",
        category: locale === "bn" ? "নদীর তাজা মাছ" : "RIVER FRESH FISH",
        title: locale === "bn" ? "পদ্মার রূপালি ইলিশ সেট" : "Padma River Hilsa Set",
        price: 1450,
        comparePrice: 1750,
        rating: "5.8K REVIEWS",
        badge1: "BEST SELLER",
        badge2: "FRESH",
        image: PRODUCTS[0]?.images[0] || "https://images.unsplash.com/photo-1544943910-4c1dc44a0b27?w=600&auto=format&fit=crop&q=80",
        productRef: PRODUCTS[0],
      },
    },
    {
      id: "slide-2",
      title: locale === "bn" ? "১০০% খাঁটি ও অর্গানিক সবজি" : "Pure Organic Farm Produce",
      subtitle: locale === "bn"
        ? "কীটনাশকমুক্ত তাজা টমেটো, ফুলকপি ও শাকসবজি সরাসরি প্রত্যয়িত কৃষক থেকে আপনার রান্নাঘরে।"
        : "Freshly harvested organic vegetables and greens directly sourced from certified farmers across Bangladesh.",
      ctaText: locale === "bn" ? "সবজি কিনুন" : "Shop Vegetables",
      ctaLink: "/category/vegetables",
      bgImage: "https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?w=1920&auto=format&fit=crop&q=90",
      featuredProduct: {
        id: PRODUCTS[2]?.id || "p3",
        category: locale === "bn" ? "অর্গানিক সবজি" : "ORGANIC VEGGIES",
        title: locale === "bn" ? "ফার্ম ফ্রেশ টমেটো প্যাক" : "Farm Fresh Tomato Set",
        price: 130,
        comparePrice: 160,
        rating: "4.9K REVIEWS",
        badge1: "ORGANIC",
        badge2: "NEW",
        image: PRODUCTS[2]?.images[0] || "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop&q=80",
        productRef: PRODUCTS[2],
      },
    },
    {
      id: "slide-3",
      title: locale === "bn" ? "পাইকারি দামে পরিবারের বাজার" : "Family Grocery Essentials",
      subtitle: locale === "bn"
        ? "চাল, ডাল, তেল ও খাঁটি মশলার সেরা হোলসেল ডিল। বড় অর্ডারে সর্বোচ্চ সাশ্রয় নিশ্চিত।"
        : "Premium rice, lentils, pure mustard oil and authentic spices at unbeatable wholesale rates.",
      ctaText: locale === "bn" ? "হোলসেল ডিল" : "Shop Essentials",
      ctaLink: "/category/rice-and-staples",
      bgImage: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=1920&auto=format&fit=crop&q=90",
      featuredProduct: {
        id: PRODUCTS[1]?.id || "p2",
        category: locale === "bn" ? "দেশি তাজা মাছ" : "FRESH RUI FISH",
        title: locale === "bn" ? "দেশি রুই মাছ (কেটে পরিষ্কার)" : "Cleaned Local Rui Pack",
        price: 485,
        comparePrice: 560,
        rating: "6.2K REVIEWS",
        badge1: "HOT DEAL",
        badge2: "CLEANED",
        image: PRODUCTS[1]?.images[0] || "https://images.unsplash.com/photo-1534939561126-855b8675edd7?w=600&auto=format&fit=crop&q=80",
        productRef: PRODUCTS[1],
      },
    },
  ];

  const SLIDE_DURATION = 6500;

  const goToSlide = useCallback((idx: number) => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentSlide(idx);
    setAnimKey(k => k + 1);
    setTimeout(() => setIsTransitioning(false), 500);
  }, [isTransitioning]);

  const nextSlide = useCallback(() => goToSlide((currentSlide + 1) % slides.length), [currentSlide, goToSlide, slides.length]);
  const prevSlide = useCallback(() => goToSlide((currentSlide - 1 + slides.length) % slides.length), [currentSlide, goToSlide, slides.length]);

  useEffect(() => {
    const timer = setInterval(() => {
      nextSlide();
    }, SLIDE_DURATION);
    return () => clearInterval(timer);
  }, [nextSlide]);

  const slide = slides[currentSlide]!;
  const feat = slide.featuredProduct;
  const isFav = isInWishlist(feat.id);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (feat.productRef) {
      addItem(feat.productRef, 1, (feat.productRef.baseUnit || "kg") as any, feat.price, 1);
      openCart();
    }
  };

  return (
    <div style={{ position: "relative", width: "100%", overflow: "hidden" }}>
      
      {/* ── Main Hero Container (Full Bleed) ── */}
      <div
        style={{
          position: "relative",
          width: "100%",
          minHeight: "clamp(460px, 48vw, 640px)",
          display: "flex",
          alignItems: "center",
          color: "#ffffff",
          background: "#0a0e14",
        }}
      >
        {/* Background Image with Cinematic Dark Gradient */}
        <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
          <img
            key={`bg-${currentSlide}`}
            src={slide.bgImage}
            alt=""
            aria-hidden="true"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "center",
              animation: "fadeIn 0.7s ease",
            }}
          />
          {/* Subtle Dark Vignette & Gradient Overlays */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(90deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.55) 45%, rgba(0,0,0,0.2) 75%, rgba(0,0,0,0.4) 100%)",
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.6) 100%)",
            }}
          />
        </div>

        {/* Content Max-Width Container */}
        <div
          style={{
            position: "relative",
            zIndex: 10,
            maxWidth: "1280px",
            width: "100%",
            margin: "0 auto",
            padding: "0 32px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "36px",
            flexWrap: "wrap",
          }}
        >
          {/* ── Left Content (Headline, Subtitle, Shop Now Pill) ── */}
          <div
            key={`text-${animKey}`}
            style={{
              flex: "1 1 480px",
              maxWidth: "620px",
              animation: "slideInLeft 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          >
            <h1
              style={{
                fontFamily: "var(--font-heading, serif, Georgia, 'Times New Roman')",
                fontSize: "clamp(2.1rem, 4vw, 3.4rem)",
                fontWeight: 700,
                lineHeight: 1.15,
                color: "#ffffff",
                letterSpacing: "-0.02em",
                margin: "0 0 16px 0",
                textShadow: "0 2px 14px rgba(0,0,0,0.5)",
              }}
            >
              {slide.title}
            </h1>

            <p
              style={{
                fontSize: "clamp(0.88rem, 1.4vw, 1.05rem)",
                lineHeight: 1.6,
                color: "rgba(255, 255, 255, 0.88)",
                margin: "0 0 28px 0",
                maxWidth: "480px",
                textShadow: "0 1px 8px rgba(0,0,0,0.5)",
              }}
            >
              {slide.subtitle}
            </p>

            <Link
              href={slide.ctaLink}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "11px 28px",
                borderRadius: "999px",
                background: "#ffffff",
                color: "#000000",
                fontSize: "0.92rem",
                fontWeight: 800,
                textDecoration: "none",
                boxShadow: "0 6px 20px rgba(0, 0, 0, 0.35)",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.04)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; }}
            >
              <span>{slide.ctaText}</span>
            </Link>
          </div>

          {/* ── Right Floating Product Card (Shadcnblocks Exact Component) ── */}
          <div
            key={`card-${animKey}`}
            style={{
              flex: "0 0 auto",
              width: "100%",
              maxWidth: "310px",
              background: "#ffffff",
              borderRadius: "16px",
              overflow: "hidden",
              boxShadow: "0 16px 40px rgba(0, 0, 0, 0.35), 0 0 0 1px rgba(255, 255, 255, 0.1)",
              animation: "slideInRight 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
              color: "#0f172a",
            }}
          >
            {/* Card Product Image */}
            <div style={{ position: "relative", width: "100%", height: "220px", background: "#f8fafc" }}>
              <img
                src={feat.image}
                alt={feat.title}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />

              {/* Badges (BEST SELLER / NEW) */}
              <div style={{ position: "absolute", top: "12px", left: "12px", display: "flex", flexDirection: "column", gap: "4px" }}>
                <span
                  style={{
                    background: "#000000",
                    color: "#ffffff",
                    fontSize: "0.62rem",
                    fontWeight: 800,
                    padding: "3px 8px",
                    borderRadius: "4px",
                    letterSpacing: "0.05em",
                  }}
                >
                  {feat.badge1}
                </span>
                <span
                  style={{
                    background: "#ffffff",
                    color: "#000000",
                    fontSize: "0.62rem",
                    fontWeight: 800,
                    padding: "3px 8px",
                    borderRadius: "4px",
                    letterSpacing: "0.05em",
                    border: "1px solid #e2e8f0",
                  }}
                >
                  {feat.badge2}
                </span>
              </div>

              {/* Wishlist Heart Icon (Top-Right) */}
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  toggleWishlist(feat.id);
                }}
                aria-label="Wishlist"
                style={{
                  position: "absolute",
                  top: "12px",
                  right: "12px",
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  background: "rgba(255, 255, 255, 0.9)",
                  border: "none",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  color: isFav ? "#ef4444" : "#64748b",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                }}
              >
                <Heart size={15} fill={isFav ? "#ef4444" : "none"} />
              </button>
            </div>

            {/* Card Product Info */}
            <div style={{ padding: "16px" }}>
              <div
                style={{
                  fontSize: "0.68rem",
                  fontWeight: 700,
                  color: "#64748b",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  marginBottom: "4px",
                }}
              >
                {feat.category}
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  justifyContent: "space-between",
                  gap: "10px",
                  marginBottom: "8px",
                }}
              >
                <h4
                  style={{
                    fontSize: "0.95rem",
                    fontWeight: 800,
                    color: "#0f172a",
                    margin: 0,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {feat.title}
                </h4>

                <div style={{ display: "flex", alignItems: "baseline", gap: "6px", flexShrink: 0 }}>
                  <span style={{ fontSize: "0.95rem", fontWeight: 800, color: "#0f172a" }}>
                    {formatPrice(feat.price)}
                  </span>
                  {feat.comparePrice && (
                    <span style={{ fontSize: "0.75rem", color: "#94a3b8", textDecoration: "line-through" }}>
                      {formatPrice(feat.comparePrice)}
                    </span>
                  )}
                </div>
              </div>

              {/* Rating & Quick Buy */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "8px", borderTop: "1px solid #f1f5f9" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  <div style={{ display: "flex", gap: "1px" }}>
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={11} fill="#0f172a" color="#0f172a" />
                    ))}
                  </div>
                  <span style={{ fontSize: "0.65rem", fontWeight: 700, color: "#64748b" }}>
                    {feat.rating}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleQuickAdd}
                  style={{
                    padding: "4px 10px",
                    borderRadius: "6px",
                    background: "#0f172a",
                    color: "#ffffff",
                    border: "none",
                    fontSize: "0.72rem",
                    fontWeight: 700,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  <ShoppingBag size={11} />
                  <span>{locale === "bn" ? "কিনুন" : "Buy"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── Left & Right Minimal Chevron Arrows (Image 1 Style) ── */}
        <button
          type="button"
          onClick={prevSlide}
          aria-label="Previous Slide"
          style={{
            position: "absolute",
            left: "18px",
            top: "50%",
            transform: "translateY(-50%)",
            width: "42px",
            height: "42px",
            borderRadius: "50%",
            background: "rgba(0, 0, 0, 0.35)",
            backdropFilter: "blur(4px)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            color: "#ffffff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            zIndex: 20,
            transition: "all 0.2s ease",
          }}
          onMouseEnter={e => { e.currentTarget.style.background = "rgba(0,0,0,0.6)"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "rgba(0,0,0,0.35)"; }}
        >
          <ChevronLeft size={20} />
        </button>

        <button
          type="button"
          onClick={nextSlide}
          aria-label="Next Slide"
          style={{
            position: "absolute",
            right: "18px",
            top: "50%",
            transform: "translateY(-50%)",
            width: "42px",
            height: "42px",
            borderRadius: "50%",
            background: "rgba(0, 0, 0, 0.35)",
            backdropFilter: "blur(4px)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            color: "#ffffff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            zIndex: 20,
            transition: "all 0.2s ease",
          }}
          onMouseEnter={e => { e.currentTarget.style.background = "rgba(0,0,0,0.6)"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "rgba(0,0,0,0.35)"; }}
        >
          <ChevronRight size={20} />
        </button>

      </div>
    </div>
  );
}
