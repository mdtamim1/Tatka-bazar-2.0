"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Heart, Star, ShoppingBag, Sparkles, ArrowRight } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useCartStore } from "@/lib/cart-store";
import { PRODUCTS } from "@/lib/catalog";
import styles from "./HeroBanner.module.css";

export function HeroBanner() {
  const { locale, formatPrice } = useLanguage();
  const { toggleWishlist, wishlistIds, addItem, openCart } = useCartStore();

  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [animKey, setAnimKey] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const slides = [
    {
      id: "slide-1",
      tag: locale === "bn" ? "🌿 ১০০% তাজা ও অর্গানিক | প্রতিদিন ভোরে সংগ্রহ" : "🌿 100% Organic & Chemical-Free",
      title: locale === "bn" ? "আপনার প্রতিদিনের তাজা বাজার" : "Your Daily Farm-Fresh Routine",
      subtitle: locale === "bn"
        ? "রাসায়নিকমুক্ত শাকসবজি ও পদ্মার তাজা রূপালি ইলিশ প্রতিদিন ভোরে সরাসরি সংগ্রহ করে আপনার দরজায় পৌঁছে দিচ্ছি।"
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
        image: PRODUCTS[0]?.images[0] || "https://images.unsplash.com/photo-1534939561126-855b8675edd7?w=800&auto=format&fit=crop&q=80",
        productRef: PRODUCTS[0],
      },
    },
    {
      id: "slide-2",
      tag: locale === "bn" ? "🍅 বিষমুক্ত ও কীটনাশকমুক্ত খামারের ফসল" : "🍅 Direct Farm-to-Table Harvest",
      title: locale === "bn" ? "১০০% খাঁটি ও অর্গানিক সবজি" : "Pure Organic Farm Produce",
      subtitle: locale === "bn"
        ? "কীটনাশকমুক্ত তাজা টমেটো, ফুলকপি ও শাকসবজি সরাসরি প্রত্যয়িত কৃষক থেকে আপনার রান্নাঘরে।"
        : "Freshly harvested organic vegetables and greens directly sourced from certified farmers across Bangladesh.",
      ctaText: locale === "bn" ? "সবজি কিনুন" : "Shop Vegetables",
      ctaLink: "/category/vegetables",
      bgImage: "https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?w=1920&auto=format&fit=crop&q=90",
      featuredProduct: {
        id: PRODUCTS[1]?.id || "p2",
        category: locale === "bn" ? "অর্গানিক সবজি" : "ORGANIC VEGGIES",
        title: locale === "bn" ? "ফার্ম ফ্রেশ পাকা টমেটো" : "Farm Fresh Vine Tomatoes",
        price: 65,
        comparePrice: 80,
        rating: "4.9K REVIEWS",
        badge1: "ORGANIC",
        badge2: "NEW",
        image: PRODUCTS[1]?.images[0] || "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800&auto=format&fit=crop&q=80",
        productRef: PRODUCTS[1],
      },
    },
    {
      id: "slide-3",
      tag: locale === "bn" ? "🌾 পরিবারের জন্য সাশ্রয়ী পাইকারি বাজার" : "🌾 Wholesale Family Bundles",
      title: locale === "bn" ? "পাইকারি দামে পরিবারের বাজার" : "Family Grocery Essentials",
      subtitle: locale === "bn"
        ? "দিনাজপুরের সুগন্ধি চাল, দেশি ডাল ও ঘানিভাঙা সরিষার তেলের সেরা হোলসেল ডিল। বড় অর্ডারে সর্বোচ্চ সাশ্রয়।"
        : "Premium aromatic rice, organic lentils and cold-pressed mustard oil at unbeatable wholesale rates.",
      ctaText: locale === "bn" ? "হোলসেল ডিল" : "Shop Deals",
      ctaLink: "/category/rice-and-staples",
      bgImage: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=1920&auto=format&fit=crop&q=90",
      featuredProduct: {
        id: PRODUCTS[2]?.id || "p3",
        category: locale === "bn" ? "দেশি তাজা মাছ" : "FRESH RUI FISH",
        title: locale === "bn" ? "দেশি রুই মাছ (কাটা ও ধোয়া)" : "Cleaned Local Rui Pack",
        price: 485,
        comparePrice: 560,
        rating: "6.2K REVIEWS",
        badge1: "HOT DEAL",
        badge2: "CLEANED",
        image: PRODUCTS[2]?.images[0] || "https://images.unsplash.com/photo-1534939561126-855b8675edd7?w=800&auto=format&fit=crop&q=80",
        productRef: PRODUCTS[2],
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

  const slide = slides[currentSlide] || slides[0]!;
  const feat = slide.featuredProduct;
  const isFav = mounted ? wishlistIds.includes(feat.id) : false;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (feat.productRef) {
      addItem(feat.productRef, 1, (feat.productRef.baseUnit || "kg") as any, feat.price, 1);
      openCart();
    }
  };

  return (
    <div className={styles.heroWrapper}>
      {/* ── Main Hero Container ── */}
      <div className={styles.heroContainer}>
        {/* Background Image with Cinematic Dark Gradient */}
        <div className={styles.bgLayer}>
          <img
            key={`bg-${currentSlide}`}
            src={slide.bgImage}
            alt=""
            aria-hidden="true"
            className={styles.bgImage}
            suppressHydrationWarning
          />
          <div className={styles.bgOverlayGradient} />
          <div className={styles.bgVignette} />
        </div>

        {/* Content Max-Width Container */}
        <div className={styles.contentWrapper}>
          {/* ── Left Content ── */}
          <div key={`text-${animKey}`} className={styles.textContent}>
            <div className={styles.heroTagBadge}>
              <Sparkles size={13} />
              <span>{slide.tag}</span>
            </div>

            <h1 className={styles.heroTitle}>{slide.title}</h1>

            <p className={styles.heroSubtitle}>{slide.subtitle}</p>

            <div className={styles.ctaGroup}>
              <Link href={slide.ctaLink} className={styles.shopNowBtn}>
                <span>{slide.ctaText}</span>
                <ArrowRight size={16} />
              </Link>

              <Link href="/bundles" className={styles.dealsBtn}>
                <span>{locale === "bn" ? "🔥 আজকের ডিল" : "Daily Deals"}</span>
              </Link>
            </div>
          </div>

          {/* ── Right Floating Highlight Card (Desktop Only) ── */}
          <div key={`card-${animKey}`} className={styles.floatingCard}>
            {/* Card Product Image */}
            <div className={styles.cardImageWrapper}>
              <img
                src={feat.image}
                alt={feat.title}
                className={styles.cardImg}
                suppressHydrationWarning
              />

              {/* Badges */}
              <div className={styles.cardBadges}>
                <span className={styles.badgeDark}>{feat.badge1}</span>
                <span className={styles.badgeLight}>{feat.badge2}</span>
              </div>

              {/* Wishlist Heart Icon Button */}
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  toggleWishlist(feat.id);
                }}
                aria-label="Wishlist"
                className={styles.cardWishlistBtn}
              >
                <Heart size={15} fill={isFav ? "#ef4444" : "none"} color={isFav ? "#ef4444" : "#64748b"} />
              </button>
            </div>

            {/* Card Product Info */}
            <div className={styles.cardBody}>
              <div className={styles.cardCategory}>{feat.category}</div>

              <div className={styles.cardTitlePriceRow}>
                <h4 className={styles.cardTitle}>{feat.title}</h4>

                <div className={styles.cardPriceGroup}>
                  <span className={styles.cardCurrentPrice}>{formatPrice(feat.price)}</span>
                  {feat.comparePrice && (
                    <span className={styles.cardComparePrice}>
                      {formatPrice(feat.comparePrice)}
                    </span>
                  )}
                </div>
              </div>

              {/* Rating & Quick Buy */}
              <div className={styles.cardFooter}>
                <div className={styles.cardRating}>
                  <div className={styles.cardStars}>
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={11} fill="#F5C842" color="#F5C842" />
                    ))}
                  </div>
                  <span className={styles.cardReviewsText}>{feat.rating}</span>
                </div>

                <button
                  type="button"
                  onClick={handleQuickAdd}
                  className={styles.quickBuyBtn}
                >
                  <ShoppingBag size={12} />
                  <span>{locale === "bn" ? "কিনুন" : "Buy"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── Left & Right Chevron Arrows ── */}
        <button
          type="button"
          onClick={prevSlide}
          aria-label="Previous Slide"
          className={styles.arrowBtn}
          style={{ left: "14px" }}
        >
          <ChevronLeft size={20} />
        </button>

        <button
          type="button"
          onClick={nextSlide}
          aria-label="Next Slide"
          className={styles.arrowBtn}
          style={{ right: "14px" }}
        >
          <ChevronRight size={20} />
        </button>

        {/* ── Slide Indicator Dots ── */}
        <div className={styles.dotsContainer}>
          {slides.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => goToSlide(idx)}
              className={`${styles.dot} ${currentSlide === idx ? styles.dotActive : ""}`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
