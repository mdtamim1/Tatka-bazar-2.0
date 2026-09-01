"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
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
  const [isAdded, setIsAdded] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Weight / Pack Options from Product or standard fallbacks
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

  // Spec subtitle line
  const specSubtitle =
    locale === "bn"
      ? "১০০% রাসায়নিকমুক্ত • ভোরে সরাসরি সংগ্রহ • ৪ ঘণ্টায় ডেলিভারি • এ-গ্রেড কোয়ালিটি"
      : "100% Organic • Harvested Fresh Daily • 4-Hour Express Delivery • Grade-A Quality";

  return (
    <div className={styles.cardContainer}>
      {/* ── Top Squircle Image Frame ── */}
      <div className={styles.imageFrame}>
        <Link
          href={`/product/${product.slug}`}
          style={{ width: "100%", height: "100%", display: "block" }}
        >
          <img
            src={product.images[0]}
            alt={locale === "bn" ? product.nameBn : product.nameEn}
            loading="lazy"
            className={styles.productImg}
          />
        </Link>

        {/* Discount / Freshness Badge (Top Left) */}
        {discount ? (
          <span className={styles.discountBadge}>-{discount}%</span>
        ) : (
          <span className={styles.discountBadge}>FRESH</span>
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

        {/* Subtitle / Spec Line */}
        <div className={styles.specSubtitle}>{specSubtitle}</div>

        {/* ── Price Row ── */}
        <div className={styles.priceRow}>
          <div className={styles.priceGroup}>
            <span className={styles.currentPrice}>{formatPrice(currentPrice)}</span>
            {comparePrice && comparePrice > currentPrice && (
              <span className={styles.comparePrice}>{formatPrice(comparePrice)}</span>
            )}
          </div>
          <span className={styles.unitHint}>
            /{activeWeightOpt.unit || product.baseUnit || "kg"}
          </span>
        </div>

        {/* ── Weight / Quantity Portion Selector ── */}
        <div className={styles.weightSelectorContainer}>
          <div className={styles.weightLabelRow}>
            <span className={styles.weightSectionTitle}>
              {locale === "bn" ? "পরিমাণ নির্বাচন করুন:" : "Portion / Weight:"}
            </span>
            <span className={styles.activeWeightBadge}>
              {locale === "bn" ? activeWeightOpt.labelBn : activeWeightOpt.labelEn}
            </span>
          </div>

          <div className={styles.weightPillList}>
            {weightOptions.map((opt, idx) => {
              const isSelected = selectedWeightIdx === idx;
              const pillPrice = Math.round(product.basePrice * (opt.multiplier || 1));
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setSelectedWeightIdx(idx);
                  }}
                  className={`${styles.weightPill} ${isSelected ? styles.weightPillActive : ""}`}
                  title={`${locale === "bn" ? opt.labelBn : opt.labelEn} — ${formatPrice(pillPrice)}`}
                >
                  {locale === "bn" ? opt.labelBn : opt.labelEn}
                </button>
              );
            })}
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
