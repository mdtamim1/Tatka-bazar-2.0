"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, ShoppingBag, Zap, Star, Scale, ChevronDown } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useCartStore } from "@/lib/cart-store";
import type { Product } from "@/types";
import styles from "./ProductCard.module.css";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const router = useRouter();
  const { locale, formatPrice } = useLanguage();
  const { addItem, wishlistIds, toggleWishlist, openCart } = useCartStore();

  const [selectedWeightIdx, setSelectedWeightIdx] = useState(0);
  const [isPortionPickerOpen, setIsPortionPickerOpen] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Weight / Portion Options from Product or standard defaults
  const weightOptions =
    product.weightOptions && product.weightOptions.length > 0
      ? product.weightOptions
      : [
          { value: 0.5, unit: product.baseUnit || "kg", labelBn: "৫০০ গ্রাম", labelEn: "500g", multiplier: 0.5 },
          { value: 1, unit: product.baseUnit || "kg", labelBn: "১ কেজি", labelEn: "1 kg", multiplier: 1, popular: true },
          { value: 2, unit: product.baseUnit || "kg", labelBn: "২ কেজি", labelEn: "2 kg", multiplier: 2 },
          { value: 5, unit: product.baseUnit || "kg", labelBn: "৫ কেজি", labelEn: "5 kg", multiplier: 4.8 },
        ];

  const activeWeightOpt = weightOptions[selectedWeightIdx] || weightOptions[0]!;

  const currentPrice = Math.max(1, Math.round(product.basePrice * (activeWeightOpt.multiplier || 1)));
  const comparePrice = product.comparePrice
    ? Math.round(product.comparePrice * (activeWeightOpt.multiplier || 1))
    : null;

  const discount =
    comparePrice && comparePrice > currentPrice
      ? Math.round((1 - currentPrice / comparePrice) * 100)
      : product.flashDiscount || null;

  const isFav = mounted ? wishlistIds.includes(product.id) : false;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(
      product,
      activeWeightOpt.value,
      (activeWeightOpt.unit || product.baseUnit || "kg") as any,
      currentPrice,
      1
    );
    setIsAdded(true);
    openCart();
    setTimeout(() => setIsAdded(false), 2000);
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(
      product,
      activeWeightOpt.value,
      (activeWeightOpt.unit || product.baseUnit || "kg") as any,
      currentPrice,
      1
    );
    router.push("/checkout");
  };

  // Vendor brand name
  const vendorName = product.vendorNameBn || product.vendorNameEn || "TATKA BAZAR";
  const [imgSrc, setImgSrc] = useState(product.images?.[0] || "https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&auto=format&fit=crop&q=80");

  useEffect(() => {
    if (product.images?.[0]) {
      setImgSrc(product.images[0]);
    }
  }, [product.images]);

  return (
    <div className={styles.cardContainer}>
      {/* ── 1. Top Image Frame with Overlay Badges and Pinned Action Bar ── */}
      <div className={styles.imageFrame}>
        <Link
          href={`/product/${product.slug}`}
          style={{ width: "100%", height: "100%", display: "block" }}
        >
          <img
            src={imgSrc}
            alt={locale === "bn" ? product.nameBn : product.nameEn}
            loading="lazy"
            className={styles.productImg}
            onError={() => {
              setImgSrc("https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&auto=format&fit=crop&q=80");
            }}
          />
        </Link>

        {/* Top-Left Badges Stack (★ BEST / NEW / ORGANIC) */}
        <div className={styles.topBadgesStack}>
          <span className={styles.badgeBest}>★ BEST</span>
          {product.isOrganic ? (
            <span className={styles.badgeNew}>ORGANIC</span>
          ) : (
            <span className={styles.badgeNew}>FRESH</span>
          )}
        </div>

        {/* Top-Right Discount Badge */}
        {discount ? (
          <span className={styles.badgeDiscount}>-{discount}%</span>
        ) : null}

        {/* Wishlist Heart Icon (Top-Right) */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
          className={`${styles.wishlistBtn} ${isFav ? styles.wishlistBtnActive : ""}`}
          aria-label="Save to Wishlist"
          title="Save to Wishlist"
        >
          <Heart size={12} fill={isFav ? "#ef4444" : "none"} color={isFav ? "#ef4444" : "#64748b"} />
        </button>

        {/* Pinned Bottom Action Bar on Image (ADD | BUY NOW) */}
        <div className={styles.imageActionBar}>
          <button
            type="button"
            onClick={handleAddToCart}
            className={`${styles.actionAddBtn} ${isAdded ? styles.addedState : ""}`}
            title="Add to Cart"
          >
            <ShoppingBag size={10} />
            <span>{isAdded ? (locale === "bn" ? "যোগ হয়েছে ✓" : "ADDED ✓") : (locale === "bn" ? "কার্ট" : "ADD")}</span>
          </button>

          <div className={styles.actionBarDivider} />

          <button
            type="button"
            onClick={handleBuyNow}
            className={styles.actionBuyBtn}
            title="Buy Now"
          >
            <Zap size={10} />
            <span>{locale === "bn" ? "কিনুন" : "BUY NOW"}</span>
          </button>
        </div>
      </div>

      {/* ── 2. Card Body ── */}
      <div className={styles.bodyContent}>
        {/* Brand / Quality Badge & Star Rating Row */}
        <div className={styles.brandRatingRow}>
          <span className={styles.brandName}>
            {product.isOrganic ? (locale === "bn" ? "🌿 ১০০% অর্গানিক" : "🌿 100% ORGANIC") : (locale === "bn" ? "✨ তাতকা ফ্রেশ" : "✨ TATKA FRESH")}
          </span>

          <div className={styles.ratingGroup}>
            <Star size={10} className={styles.starIcon} fill="#d49567" />
            <span>{product.rating || 5}</span>
          </div>
        </div>

        {/* Product Title (2 lines max) */}
        <Link href={`/product/${product.slug}`} className={styles.productTitle}>
          {locale === "bn" ? product.nameBn : product.nameEn}
        </Link>

        {/* ── 3. Bottom Price & Interactive Weight Dropdown Row ── */}
        <div className={styles.priceWeightRow}>
          <div className={styles.priceGroup}>
            <span className={styles.currentPrice}>
              {formatPrice(currentPrice)}
            </span>
            {comparePrice && comparePrice > currentPrice && (
              <span className={styles.comparePrice}>
                {formatPrice(comparePrice)}
              </span>
            )}
          </div>

          {/* Interactive Weight / Portion Dropdown Trigger */}
          <div className={styles.weightPickerWrapper}>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsPortionPickerOpen((prev) => !prev);
              }}
              className={`${styles.weightPillBtn} ${isPortionPickerOpen ? styles.weightPillBtnActive : ""}`}
              aria-label="Change Weight Portion"
              title={locale === "bn" ? "ওজন বা পরিমাণ পরিবর্তন করতে ক্লিক করুন" : "Click to select weight / portion"}
            >
              <Scale size={10} className={styles.scaleIcon} />
              <span className={styles.weightPillLabel}>{locale === "bn" ? activeWeightOpt.labelBn : activeWeightOpt.labelEn}</span>
              <ChevronDown size={10} className={`${styles.chevronIcon} ${isPortionPickerOpen ? styles.chevronRotated : ""}`} />
            </button>

            {/* Floating Luxury Portion Selector Menu */}
            {isPortionPickerOpen && (
              <>
                <div
                  className={styles.pickerBackdrop}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsPortionPickerOpen(false);
                  }}
                />
                <div
                  className={styles.portionDropdown}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className={styles.portionDropdownHeader}>
                    <Scale size={12} color="#15803d" />
                    <span>{locale === "bn" ? "পরিমাণ নির্বাচন করুন" : "Select Portion"}</span>
                  </div>

                  <div className={styles.portionOptionList}>
                    {weightOptions.map((opt, idx) => {
                      const isSelected = selectedWeightIdx === idx;
                      const optPrice = Math.max(1, Math.round(product.basePrice * (opt.multiplier || 1)));
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setSelectedWeightIdx(idx);
                            setIsPortionPickerOpen(false);
                          }}
                          className={`${styles.portionOptionBtn} ${isSelected ? styles.portionOptionSelected : ""}`}
                        >
                          <div className={styles.portionOptionLabel}>
                            <span className={`${styles.optionRadioDot} ${isSelected ? styles.optionRadioDotActive : ""}`} />
                            <span className={styles.optionWeightName}>
                              {locale === "bn" ? opt.labelBn : opt.labelEn}
                            </span>
                          </div>
                          <span className={styles.optionPriceTag}>
                            {formatPrice(optPrice)}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
