"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, Check } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useCartStore } from "@/lib/cart-store";
import type { Product } from "@/types";
import styles from "./ProductCard.module.css";

interface ProductCardProps {
  product: Product;
}

// Swatch colors matching Dribbble prototype
const SWATCHES = [
  { color: "#F5B800", label: "Gold / Standard" },
  { color: "#10D876", label: "Fresh / Green" },
  { color: "#3056D3", label: "Premium / Blue" },
  { color: "#0f172a", label: "Exclusive / Dark" },
];

export function ProductCard({ product }: ProductCardProps) {
  const router = useRouter();
  const { locale, formatPrice } = useLanguage();
  const { addItem, wishlistIds, toggleWishlist, openCart } = useCartStore();

  const [activeSwatchIdx, setActiveSwatchIdx] = useState(0);
  const [isAdded, setIsAdded] = useState(false);

  // Weight / Pack Options
  const weightOptions = product.weightOptions && product.weightOptions.length > 0
    ? product.weightOptions
    : [
        { value: 1, unit: product.baseUnit || "kg", labelBn: "১ কেজি", labelEn: "1 kg", multiplier: 1 },
        { value: 2, unit: product.baseUnit || "kg", labelBn: "২ কেজি", labelEn: "2 kg", multiplier: 1.9 },
        { value: 5, unit: product.baseUnit || "kg", labelBn: "৫ কেজি", labelEn: "5 kg", multiplier: 4.6 },
      ];

  const activeWeightOpt = weightOptions[activeSwatchIdx % weightOptions.length] || weightOptions[0]!;

  const currentPrice = Math.round(product.basePrice * (activeWeightOpt.multiplier || 1));
  const comparePrice = product.comparePrice
    ? Math.round(product.comparePrice * (activeWeightOpt.multiplier || 1))
    : null;

  const discount = comparePrice && comparePrice > currentPrice
    ? Math.round((1 - currentPrice / comparePrice) * 100)
    : product.flashDiscount || null;

  const isFav = wishlistIds.includes(product.id);

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

  // Spec subtitle line
  const specSubtitle = locale === "bn"
    ? "১০০% রাসায়নিকমুক্ত • ভোরে সরাসরি সংগ্রহ • ৪ ঘণ্টায় ডেলিভারি • এ-গ্রেড কোয়ালিটি"
    : "100% Organic • Harvested Fresh Daily • 4-Hour Express Delivery • Grade-A Quality";

  return (
    <div className={styles.cardContainer}>
      
      {/* ── Top Squircle Image Frame ── */}
      <div className={styles.imageFrame}>
        <Link href={`/product/${product.slug}`} style={{ width: "100%", height: "100%", display: "block" }}>
          <img
            src={product.images[0]}
            alt={locale === "bn" ? product.nameBn : product.nameEn}
            loading="lazy"
            className={styles.productImg}
          />
        </Link>

        {/* Discount / Freshness Badge (Top Left) */}
        {discount ? (
          <span className={styles.discountBadge}>
            -{discount}%
          </span>
        ) : (
          <span className={styles.discountBadge}>
            FRESH
          </span>
        )}

        {/* Wishlist Heart Icon Button (Top Right) */}
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
          <Heart size={16} fill={isFav ? "#ef4444" : "none"} />
        </button>
      </div>

      {/* ── Card Body ── */}
      <div className={styles.bodyContent}>
        
        {/* Product Title */}
        <Link href={`/product/${product.slug}`} className={styles.productTitle}>
          {locale === "bn" ? product.nameBn : product.nameEn}
        </Link>

        {/* Subtitle / Spec Line (Dribbble prototype: AMOLED Display • e-SIM Support • GPS...) */}
        <div className={styles.specSubtitle}>
          {specSubtitle}
        </div>

        {/* ── Price & Swatches Row ── */}
        <div className={styles.priceRow}>
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

          {/* Interactive Dot Swatches (Dribbble Prototype: 🟡 🟢 🔵 ⚫) */}
          <div className={styles.swatchGroup}>
            {SWATCHES.map((swatch, idx) => (
              <button
                key={idx}
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setActiveSwatchIdx(idx);
                }}
                className={`${styles.swatchDot} ${activeSwatchIdx === idx ? styles.swatchDotActive : ""}`}
                style={{ backgroundColor: swatch.color }}
                title={swatch.label}
                aria-label={swatch.label}
              />
            ))}
          </div>
        </div>

        {/* ── Stacked Action Buttons (Buy Now & Add to Cart) ── */}
        <div className={styles.btnStack}>
          <button
            type="button"
            onClick={handleBuyNow}
            className={styles.buyNowBtn}
          >
            Buy Now
          </button>

          <button
            type="button"
            onClick={handleAddToCart}
            className={`${styles.addToCartBtn} ${isAdded ? styles.addedState : ""}`}
          >
            {isAdded ? "Added to Cart ✓" : "Add to Cart"}
          </button>
        </div>

      </div>

    </div>
  );
}
