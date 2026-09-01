"use client";

import React, { useState, use } from "react";
import Link from "next/link";
import { notFound, useRouter } from "next/navigation";
import {
  Star, Heart, ShieldCheck, Truck, Sparkles,
  ChevronRight, Plus, Minus, Check, RefreshCw,
  ShoppingBag, ArrowRight, Leaf, Award
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useCartStore } from "@/lib/cart-store";
import { PRODUCTS } from "@/lib/catalog";
import { ProductCard } from "@/components/product/ProductCard";
import { ProductJsonLd } from "@/components/seo/JsonLd";
import styles from "./page.module.css";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export default function ProductDetailPage({ params }: ProductPageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { locale, formatPrice } = useLanguage();
  const { toggleWishlist, isInWishlist, addItem, openCart } = useCartStore();

  const product = PRODUCTS.find((p) => p.slug === resolvedParams.slug);
  if (!product) {
    return notFound();
  }

  // Active Image
  const [activeImageIdx, setActiveImageIdx] = useState(0);

  // Weight & Pack Selector
  const defaultOption = product.weightOptions?.[0] || {
    value: 1,
    unit: product.baseUnit || "kg",
    labelBn: `১ ${product.baseUnit || "কেজি"}`,
    labelEn: `1 ${product.baseUnit || "kg"}`,
    multiplier: 1,
  };

  const [selectedWeight, setSelectedWeight] = useState<number>(defaultOption.value);
  const [selectedUnit, setSelectedUnit] = useState<any>(defaultOption.unit);
  const [multiplier, setMultiplier] = useState<number>(defaultOption.multiplier);
  const [quantity, setQuantity] = useState<number>(1);
  const [isAddedToast, setIsAddedToast] = useState(false);
  const [activeTab, setActiveTab] = useState<"desc" | "origin" | "nutrition">("desc");

  const isFav = isInWishlist(product.id);
  const unitPrice = Math.round(product.basePrice * multiplier);
  const totalPrice = unitPrice * quantity;
  const compareTotal = product.comparePrice
    ? Math.round(product.comparePrice * multiplier * quantity)
    : Math.round(unitPrice * 1.15 * quantity);

  const relatedProducts = PRODUCTS.filter(
    (p) => p.id !== product.id && p.categorySlug === product.categorySlug
  ).slice(0, 4);

  const handleSelectWeight = (opt: any) => {
    setSelectedWeight(opt.value);
    setSelectedUnit(opt.unit);
    setMultiplier(opt.multiplier || 1);
  };

  const handleAddToCart = () => {
    addItem(product, selectedWeight, selectedUnit, unitPrice, quantity);
    setIsAddedToast(true);
    openCart();
    setTimeout(() => setIsAddedToast(false), 2000);
  };

  const handleBuyNow = () => {
    addItem(product, selectedWeight, selectedUnit, unitPrice, quantity);
    router.push("/checkout");
  };

  return (
    <>
      <ProductJsonLd product={product} />

      <div className={styles.pageWrapper}>
        <div className={styles.container}>

          {/* ── Breadcrumb ── */}
          <div className={styles.breadcrumb}>
            <Link href="/">{locale === "bn" ? "হোম" : "Home"}</Link>
            <ChevronRight size={13} />
            <Link href={`/category/${product.categorySlug}`}>
              {locale === "bn" ? product.categoryNameBn : product.categoryNameEn}
            </Link>
            <ChevronRight size={13} />
            <span className={styles.breadcrumbCurrent}>
              {locale === "bn" ? product.nameBn : product.nameEn}
            </span>
          </div>

          {/* ── Product Hero Grid ── */}
          <div className={styles.productGrid}>

            {/* Left: Gallery Showcase */}
            <div className={styles.galleryColumn}>
              <div className={styles.mainImageCard}>
                <img
                  src={product.images[activeImageIdx] || product.images[0]}
                  alt={locale === "bn" ? product.nameBn : product.nameEn}
                  className={styles.mainImage}
                />

                <div className={styles.organicBadge}>
                  <Leaf size={13} />
                  <span>{locale === "bn" ? "১০০% তাজা ও অর্গানিক" : "100% Farm Fresh"}</span>
                </div>

                <button
                  type="button"
                  onClick={() => toggleWishlist(product.id)}
                  className={styles.wishlistBtn}
                  title="Wishlist"
                >
                  <Heart
                    size={17}
                    color={isFav ? "#f43f5e" : "#ffffff"}
                    fill={isFav ? "#f43f5e" : "none"}
                  />
                </button>
              </div>

              {/* Thumbnails */}
              {product.images.length > 1 && (
                <div className={styles.thumbnailRow}>
                  {product.images.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveImageIdx(idx)}
                      className={`${styles.thumbnailBtn} ${activeImageIdx === idx ? styles.thumbnailBtnActive : ""}`}
                    >
                      <img src={img} alt="" className={styles.thumbnailImg} />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Product Purchase Controls */}
            <div className={styles.detailsColumn}>
              
              {/* Category & Rating */}
              <div className={styles.categoryTagRow}>
                <span className={styles.categoryTag}>
                  {locale === "bn" ? product.categoryNameBn : product.categoryNameEn}
                </span>
                <span className={styles.ratingTag}>
                  <Star size={11} fill="#F5C842" color="#F5C842" />
                  <span>{product.rating} (১২০+ রিভিউ)</span>
                </span>
              </div>

              {/* Title */}
              <h1 className={styles.productTitle}>
                {locale === "bn" ? product.nameBn : product.nameEn}
              </h1>

              {/* Short Description */}
              <p className={styles.shortDesc}>
                {locale === "bn" ? product.descriptionBn : product.descriptionEn}
              </p>

              {/* Price Block */}
              <div className={styles.priceBox}>
                <div className={styles.priceLeft}>
                  <span className={styles.currentPrice}>
                    {formatPrice(totalPrice)}
                  </span>
                  <span className={styles.unitLabel}>
                    ({selectedWeight} {selectedUnit === "kg" ? "কেজি" : selectedUnit} প্যাক)
                  </span>
                  {compareTotal > totalPrice && (
                    <span className={styles.comparePrice}>
                      {formatPrice(compareTotal)}
                    </span>
                  )}
                </div>

                {compareTotal > totalPrice && (
                  <span className={styles.discountBadge}>
                    ৳{compareTotal - totalPrice} সাশ্রয়
                  </span>
                )}
              </div>

              {/* Weight / Pack Options */}
              {product.weightOptions && product.weightOptions.length > 0 && (
                <div className={styles.selectorSection}>
                  <div className={styles.sectionLabel}>
                    <span>প্যাকেজ সাইজ / ওজন নির্বাচন করুন:</span>
                    <span style={{ fontSize: "0.78rem", color: "#10D876" }}>
                      প্রতি কেজি {formatPrice(product.basePrice)}
                    </span>
                  </div>

                  <div className={styles.weightChipsGrid}>
                    {product.weightOptions.map((opt) => {
                      const isActive = selectedWeight === opt.value && selectedUnit === opt.unit;
                      return (
                        <button
                          key={`${opt.value}-${opt.unit}`}
                          type="button"
                          onClick={() => handleSelectWeight(opt)}
                          className={`${styles.weightChip} ${isActive ? styles.weightChipActive : ""}`}
                        >
                          {isActive && <Check size={14} />}
                          <span>{locale === "bn" ? opt.labelBn : opt.labelEn}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Quantity & Action Buttons */}
              <div className={styles.selectorSection}>
                <div className={styles.sectionLabel}>
                  <span>পরিমাণ (Quantity):</span>
                  <span style={{ fontSize: "0.78rem", color: "#94a3b8" }}>
                    মোট ওজন: {selectedWeight * quantity} {selectedUnit === "kg" ? "কেজি" : selectedUnit}
                  </span>
                </div>

                <div className={styles.actionRow}>
                  {/* Quantity Box */}
                  <div className={styles.quantityBox}>
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className={styles.qtyBtn}
                      aria-label="Decrease"
                    >
                      <Minus size={15} />
                    </button>
                    <span className={styles.qtyDisplay}>{quantity}</span>
                    <button
                      type="button"
                      onClick={() => setQuantity(quantity + 1)}
                      className={styles.qtyBtn}
                      aria-label="Increase"
                    >
                      <Plus size={15} />
                    </button>
                  </div>

                  {/* Buy Now (Direct Checkout) */}
                  <button
                    type="button"
                    onClick={handleBuyNow}
                    className={styles.buyNowBtn}
                  >
                    <span>এখনই কিনুন (Buy Now)</span>
                    <ArrowRight size={16} />
                  </button>

                  {/* Add to Cart */}
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    className={styles.addToCartBtn}
                  >
                    <ShoppingBag size={16} color="#10D876" />
                    <span>{isAddedToast ? "যোগ হয়েছে!" : "কার্টে যোগ করুন"}</span>
                  </button>
                </div>
              </div>

              {/* Freshness Assurance Badges */}
              <div className={styles.guaranteeRow}>
                <div className={styles.guaranteeCard}>
                  <Truck size={18} className={styles.guaranteeIcon} />
                  <span className={styles.guaranteeText}>৪ ঘণ্টায় এক্সপ্রেস ডেলিভারি</span>
                </div>
                <div className={styles.guaranteeCard}>
                  <ShieldCheck size={18} className={styles.guaranteeIcon} />
                  <span className={styles.guaranteeText}>ডোরস্টেপ রিটার্ন গ্যারান্টি</span>
                </div>
                <div className={styles.guaranteeCard}>
                  <Award size={18} className={styles.guaranteeIcon} />
                  <span className={styles.guaranteeText}>১০০% খাঁটি ও কীটনাশকমুক্ত</span>
                </div>
              </div>

            </div>

          </div>

          {/* ── Product Description & Info Tabs ── */}
          <div className={styles.tabsContainer}>
            <div className={styles.tabHeaderRow}>
              <button
                type="button"
                className={`${styles.tabBtn} ${activeTab === "desc" ? styles.tabBtnActive : ""}`}
                onClick={() => setActiveTab("desc")}
              >
                পণ্য বিবরণ ও বৈশিষ্ট্য
              </button>
              <button
                type="button"
                className={`${styles.tabBtn} ${activeTab === "origin" ? styles.tabBtnActive : ""}`}
                onClick={() => setActiveTab("origin")}
              >
                উৎস ও সংগ্রহের স্থান
              </button>
              <button
                type="button"
                className={`${styles.tabBtn} ${activeTab === "nutrition" ? styles.tabBtnActive : ""}`}
                onClick={() => setActiveTab("nutrition")}
              >
                পুষ্টিগুণ ও স্বাস্থ্য উপকারিতা
              </button>
            </div>

            <div className={styles.tabContentBody}>
              {activeTab === "desc" && (
                <div>
                  <p>{locale === "bn" ? product.descriptionBn : product.descriptionEn}</p>
                  <ul style={{ marginTop: "12px", paddingLeft: "20px", display: "flex", flexDirection: "column", gap: "8px" }}>
                    <li>🌿 কোনো প্রকার ফরমালিন বা বিষাক্ত প্রিজারভেটিভ ছাড়া সরাসরি সংগ্রহ।</li>
                    <li>❄️ হাইজিন থার্মাল ব্যাগে বরফমুক্ত ফ্রেশ প্যাকেজিং।</li>
                    <li>🛵 তাতকা স্পিড রাইডার দ্বারা দ্রুততম সময়ে ডেলিভারি।</li>
                  </ul>
                </div>
              )}

              {activeTab === "origin" && (
                <div>
                  <p>
                    <strong>উৎস:</strong> {product.vendorNameBn || "তাতকা সার্টিফাইড অর্গানিক ফার্মস"}, বাংলাদেশ।
                  </p>
                  <p style={{ marginTop: "8px" }}>
                    প্রতিদিন ভোর ৪:০০ টায় সরাসরি স্থানীয় কৃষক ও নদী জেলেদের কাছ থেকে সংগ্রহ করে গুণগত মান যাচাইয়ের পর ডেলিভারি হাব-এ পাঠানো হয়।
                  </p>
                </div>
              )}

              {activeTab === "nutrition" && (
                <div>
                  <p>
                    প্রতি ১০০ গ্রাম তাজা অংশে থাকে প্রচুর পরিমাণে প্রাকৃতিক প্রোটিন, ভিটামিন ও মিনারেলস যা দৈনন্দিন পুষ্টির চাহিদা পূরণে সহায়ক।
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* ── Related Fresh Products Grid ── */}
          {relatedProducts.length > 0 && (
            <div className={styles.relatedSection}>
              <h3 className={styles.relatedTitle}>আরও তাজা পণ্য আপনার পছন্দের হতে পারে</h3>
              <div className={styles.relatedGrid}>
                {relatedProducts.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  );
}
