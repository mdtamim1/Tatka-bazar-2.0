"use client";

import React, { useState, use } from "react";
import Link from "next/link";
import { notFound, useRouter } from "next/navigation";
import {
  Search, Plus, Minus, Truck, RefreshCw,
  Store, ChevronLeft, ChevronRight, ChevronDown,
  X, Check, ShoppingBag, ArrowRight
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useCartStore } from "@/lib/cart-store";
import { PRODUCTS } from "@/lib/catalog";
import { ProductJsonLd } from "@/components/seo/JsonLd";
import styles from "./page.module.css";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export default function ProductDetailPage({ params }: ProductPageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { locale, formatPrice } = useLanguage();
  const { addItem, openCart } = useCartStore();

  const product = PRODUCTS.find((p) => p.slug === resolvedParams.slug);
  if (!product) {
    return notFound();
  }

  // Active Image & Lightbox State
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  // Weight / Pack Option
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
  const [isAdded, setIsAdded] = useState(false);

  // Accordion State
  const [openAccordion, setOpenAccordion] = useState<string | null>("overview");

  // Related Product Carousel
  const [relatedIdx, setRelatedIdx] = useState(0);
  const relatedProducts = PRODUCTS.filter((p) => p.id !== product.id && p.categorySlug === product.categorySlug);
  const currentRelated = relatedProducts[relatedIdx] || PRODUCTS[0]!;

  const unitPrice = Math.round(product.basePrice * multiplier);
  const totalPrice = unitPrice * quantity;
  const compareTotal = product.comparePrice
    ? Math.round(product.comparePrice * multiplier * quantity)
    : null;

  const handleSelectOption = (opt: any) => {
    setSelectedWeight(opt.value);
    setSelectedUnit(opt.unit);
    setMultiplier(opt.multiplier || 1);
  };

  const handleAddToCart = () => {
    addItem(product, selectedWeight, selectedUnit, unitPrice, quantity);
    setIsAdded(true);
    openCart();
    setTimeout(() => setIsAdded(false), 2000);
  };

  const handleBuyItNow = () => {
    addItem(product, selectedWeight, selectedUnit, unitPrice, quantity);
    router.push("/checkout");
  };

  const handleNextRelated = () => {
    if (relatedProducts.length > 0) {
      setRelatedIdx((relatedIdx + 1) % relatedProducts.length);
    }
  };

  const handlePrevRelated = () => {
    if (relatedProducts.length > 0) {
      setRelatedIdx((relatedIdx - 1 + relatedProducts.length) % relatedProducts.length);
    }
  };

  return (
    <>
      <ProductJsonLd product={product} />

      <div className={styles.pageWrapper}>
        <div className={styles.container}>

          {/* ── Breadcrumb ── */}
          <div className={styles.breadcrumb}>
            <Link href="/">Home</Link>
            <span>/</span>
            <Link href={`/category/${product.categorySlug}`}>
              {locale === "bn" ? product.categoryNameBn : product.categoryNameEn}
            </Link>
            <span>/</span>
            <span className={styles.breadcrumbCurrent}>
              {locale === "bn" ? product.nameBn : product.nameEn}
            </span>
          </div>

          {/* ── 2-Column Product Detail Layout (Matching Screenshot) ── */}
          <div className={styles.productGrid}>

            {/* ── Left Column: Main Image & Gallery ── */}
            <div className={styles.galleryColumn}>
              {/* Main Image Box */}
              <div className={styles.mainImageCard}>
                <img
                  src={product.images[activeImageIdx] || product.images[0]}
                  alt={locale === "bn" ? product.nameBn : product.nameEn}
                  className={styles.mainImage}
                />

                {/* Lightbox Zoom Icon Button (Image 1 top right of photo) */}
                <button
                  type="button"
                  onClick={() => setIsLightboxOpen(true)}
                  className={styles.zoomBtn}
                  title="Zoom Image"
                  aria-label="Zoom Image"
                >
                  <Search size={16} />
                </button>
              </div>

              {/* Bottom Gallery Image Thumbnails System (Mobile Responsive) */}
              {product.images.length > 1 && (
                <div className={styles.thumbnailGrid}>
                  {product.images.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveImageIdx(idx)}
                      className={`${styles.thumbnailBtn} ${activeImageIdx === idx ? styles.thumbnailBtnActive : ""}`}
                      aria-label={`View photo ${idx + 1}`}
                    >
                      <img src={img} alt="" className={styles.thumbnailImg} />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* ── Right Column: Purchase Details ── */}
            <div className={styles.infoColumn}>
              
              {/* Title */}
              <h1 className={styles.productTitle}>
                {locale === "bn" ? product.nameBn : product.nameEn}
              </h1>

              {/* Price */}
              <div className={styles.price}>
                <span>{formatPrice(totalPrice)}</span>
                {compareTotal && compareTotal > totalPrice && (
                  <span className={styles.comparePrice}>{formatPrice(compareTotal)}</span>
                )}
              </div>

              {/* Short Description */}
              <p className={styles.description}>
                {locale === "bn" ? product.descriptionBn : product.descriptionEn}
              </p>

              {/* Size / Weight Selector (e.g. Size: 200ml) */}
              <div className={styles.sizeLabel}>
                <span>Size: {selectedWeight} {selectedUnit}</span>
              </div>

              {product.weightOptions && product.weightOptions.length > 0 && (
                <div className={styles.sizeChipsRow}>
                  {product.weightOptions.map((opt) => {
                    const isActive = selectedWeight === opt.value && selectedUnit === opt.unit;
                    return (
                      <button
                        key={`${opt.value}-${opt.unit}`}
                        type="button"
                        onClick={() => handleSelectOption(opt)}
                        className={`${styles.sizeChip} ${isActive ? styles.sizeChipActive : ""}`}
                      >
                        {locale === "bn" ? opt.labelBn : opt.labelEn}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Quantity Selector Pill [ −  1  + ] */}
              <div className={styles.quantityBox}>
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className={styles.qtyBtn}
                  aria-label="Decrease quantity"
                >
                  <Minus size={15} />
                </button>
                <span className={styles.qtyNumber}>{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  className={styles.qtyBtn}
                  aria-label="Increase quantity"
                >
                  <Plus size={15} />
                </button>
              </div>

              {/* Stacked Action Buttons */}
              <div className={styles.btnStack}>
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className={styles.addToCartBtn}
                >
                  {isAdded ? "Added to Cart ✓" : "Add to Cart"}
                </button>

                <button
                  type="button"
                  onClick={handleBuyItNow}
                  className={styles.buyNowBtn}
                >
                  Buy it now
                </button>
              </div>

              {/* Delivery & Policies Info List (Exact 3 items from screenshot) */}
              <div className={styles.policyList}>
                <div className={styles.policyItem}>
                  <Truck size={16} className={styles.policyIcon} />
                  <span>Free shipping on orders over ৳500</span>
                </div>
                <div className={styles.policyItem}>
                  <RefreshCw size={16} className={styles.policyIcon} />
                  <span>Easy 30-day / doorstep returns</span>
                </div>
                <div className={styles.policyItem}>
                  <Store size={16} className={styles.policyIcon} />
                  <span>Ready for express pickup or dispatch at Dhanmondi Location</span>
                </div>
              </div>

              {/* Related Items Mini Box (Screenshot: Related Items < 1/2 >) */}
              {relatedProducts.length > 0 && (
                <div className={styles.relatedSection}>
                  <div className={styles.relatedHeader}>
                    <h3 className={styles.relatedTitle}>Related Items</h3>
                    <div className={styles.carouselNav}>
                      <button
                        type="button"
                        onClick={handlePrevRelated}
                        className={styles.navArrowBtn}
                        aria-label="Previous related item"
                      >
                        <ChevronLeft size={14} />
                      </button>
                      <span style={{ fontSize: "0.78rem", color: "#64748b" }}>
                        {relatedIdx + 1} / {relatedProducts.length}
                      </span>
                      <button
                        type="button"
                        onClick={handleNextRelated}
                        className={styles.navArrowBtn}
                        aria-label="Next related item"
                      >
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>

                  <Link href={`/product/${currentRelated.slug}`} className={styles.relatedCard}>
                    <img
                      src={currentRelated.images[0]}
                      alt={currentRelated.nameEn}
                      className={styles.relatedImg}
                    />
                    <div>
                      <div className={styles.relatedCat}>
                        {locale === "bn" ? currentRelated.categoryNameBn : currentRelated.categoryNameEn}
                      </div>
                      <h4 className={styles.relatedName}>
                        {locale === "bn" ? currentRelated.nameBn : currentRelated.nameEn}
                      </h4>
                      <div className={styles.relatedPrice}>
                        {formatPrice(currentRelated.basePrice)}
                      </div>
                    </div>
                  </Link>
                </div>
              )}

              {/* Accordion / Collapsible (Product Overview ⌵) */}
              <div className={styles.accordionList}>
                <div className={styles.accordionItem}>
                  <button
                    type="button"
                    onClick={() => setOpenAccordion(openAccordion === "overview" ? null : "overview")}
                    className={styles.accordionBtn}
                  >
                    <span>Product Overview</span>
                    <ChevronDown
                      size={16}
                      style={{
                        transform: openAccordion === "overview" ? "rotate(180deg)" : "rotate(0deg)",
                        transition: "transform 0.2s ease",
                      }}
                    />
                  </button>
                  {openAccordion === "overview" && (
                    <div className={styles.accordionBody}>
                      <p>{locale === "bn" ? product.descriptionBn : product.descriptionEn}</p>
                      <p style={{ marginTop: "6px" }}>
                        100% natural, chemical-free and freshly sourced every morning. Inspected and handled with utmost hygiene.
                      </p>
                    </div>
                  )}
                </div>

                <div className={styles.accordionItem}>
                  <button
                    type="button"
                    onClick={() => setOpenAccordion(openAccordion === "origin" ? null : "origin")}
                    className={styles.accordionBtn}
                  >
                    <span>Origin & Farm Story</span>
                    <ChevronDown
                      size={16}
                      style={{
                        transform: openAccordion === "origin" ? "rotate(180deg)" : "rotate(0deg)",
                        transition: "transform 0.2s ease",
                      }}
                    />
                  </button>
                  {openAccordion === "origin" && (
                    <div className={styles.accordionBody}>
                      <p>
                        Harvested directly from certified farmers and river fishermen across Bangladesh. Dispatched within 4 hours of arrival at central hub.
                      </p>
                    </div>
                  )}
                </div>
              </div>

            </div>

          </div>

        </div>
      </div>

      {/* ── Fullscreen Lightbox Modal (Image Zoom) ── */}
      {isLightboxOpen && (
        <div className={styles.lightboxBackdrop} onClick={() => setIsLightboxOpen(false)}>
          <button
            type="button"
            className={styles.lightboxClose}
            onClick={() => setIsLightboxOpen(false)}
            aria-label="Close Lightbox"
          >
            <X size={22} />
          </button>
          <img
            src={product.images[activeImageIdx] || product.images[0]}
            alt={product.nameEn}
            className={styles.lightboxImage}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}
