"use client";

import React, { useState, use } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Star, Heart, Share2, ShieldCheck, Truck, RotateCcw, Sparkles, Store,
  MapPin, CheckCircle, Clock, Plus, Scale, Leaf, ChevronRight, Check,
  Flame, Award, Eye, ThumbsUp, AlertCircle
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useCartStore } from "@/lib/cart-store";
import { PRODUCTS, CATEGORIES, REVIEWS } from "@/lib/catalog";
import { WeightPricingSelector } from "@/components/product/WeightPricingSelector";
import { ProductCard } from "@/components/product/ProductCard";
import { ProductJsonLd } from "@/components/seo/JsonLd";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export default function ProductDetailPage({ params }: ProductPageProps) {
  const resolvedParams = use(params);
  const { locale, t, formatPrice } = useLanguage();
  const { toggleWishlist, isInWishlist, addItem } = useCartStore();

  const product = PRODUCTS.find((p) => p.slug === resolvedParams.slug);
  if (!product) {
    return notFound();
  }

  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [activeTab, setActiveTab] = useState<"desc" | "nutrition" | "origin" | "reviews">("desc");
  const [copiedShare, setCopiedShare] = useState(false);
  const [bundleAdded, setBundleAdded] = useState(false);

  const isFav = isInWishlist(product.id);
  const relatedProducts = PRODUCTS.filter((p) => p.id !== product.id && p.categorySlug === product.categorySlug).slice(0, 4);
  const bundleProduct = PRODUCTS.find((p) => p.id !== product.id) || PRODUCTS[0]!;

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2000);
    }
  };

  const handleAddBundle = () => {
    addItem(product, product.weightOptions?.[0]?.value || 1, product.baseUnit, product.basePrice, 1);
    addItem(bundleProduct, bundleProduct.weightOptions?.[0]?.value || 1, bundleProduct.baseUnit, bundleProduct.basePrice, 1);
    setBundleAdded(true);
    setTimeout(() => setBundleAdded(false), 2000);
  };

  const bundleTotal = Math.round((product.basePrice + bundleProduct.basePrice) * 0.92); // 8% combo discount

  return (
    <>
      <ProductJsonLd product={product} />

      <div style={{ padding: "24px 0 80px" }}>
        <div className="container">

          {/* ── Breadcrumb Navigation ── */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "0.82rem",
              color: "var(--text-muted)",
              marginBottom: "24px",
              flexWrap: "wrap",
            }}
          >
            <Link href="/" style={{ color: "var(--emerald)", fontWeight: 600 }}>
              {locale === "bn" ? "হোম" : "Home"}
            </Link>
            <ChevronRight size={14} />
            <Link href={`/category/${product.categorySlug}`} style={{ color: "var(--emerald)", fontWeight: 600 }}>
              {locale === "bn" ? product.categoryNameBn : product.categoryNameEn}
            </Link>
            <ChevronRight size={14} />
            <span style={{ color: "var(--text-main)", fontWeight: 700 }}>
              {locale === "bn" ? product.nameBn : product.nameEn}
            </span>
          </div>

          {/* ── Product Hero Grid ── */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
              gap: "40px",
              background: "rgba(14, 17, 23, 0.95)",
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
              borderRadius: "var(--radius-2xl)",
              padding: "clamp(20px, 4vw, 36px)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              boxShadow: "var(--shadow-2xl), 0 0 60px rgba(16, 216, 118, 0.04)",
              marginBottom: "48px",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Top Neon Accent */}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: "2px",
                background: "linear-gradient(90deg, transparent, var(--emerald), var(--gold), transparent)",
              }}
            />

            {/* Left Column: Media Gallery & Quality Trust Badges */}
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {/* Main Image Stage */}
              <div
                style={{
                  position: "relative",
                  aspectRatio: "1/1",
                  borderRadius: "var(--radius-xl)",
                  overflow: "hidden",
                  background: "var(--bg-card)",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  boxShadow: "var(--shadow-lg)",
                }}
              >
                <img
                  src={product.images[activeImageIdx] || product.images[0]}
                  alt={locale === "bn" ? product.nameBn : product.nameEn}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    transition: "transform 0.5s ease-out",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.06)")}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                />

                {/* Floating Badges Top Left */}
                <div
                  style={{
                    position: "absolute",
                    top: "14px",
                    left: "14px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                    zIndex: 10,
                  }}
                >
                  {product.flashDiscount && (
                    <span
                      style={{
                        background: "linear-gradient(135deg, #FF4D6D, #E83055)",
                        color: "#FFF",
                        fontSize: "0.82rem",
                        fontWeight: 900,
                        padding: "6px 12px",
                        borderRadius: "var(--radius-full)",
                        boxShadow: "0 4px 16px rgba(255, 77, 109, 0.5)",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      <Flame size={13} fill="#FFF" />
                      <span>-{product.flashDiscount}% {locale === "bn" ? "ছাড়" : "OFF"}</span>
                    </span>
                  )}
                  {product.isOrganic && (
                    <span
                      style={{
                        background: "rgba(16, 216, 118, 0.15)",
                        border: "1px solid rgba(16, 216, 118, 0.4)",
                        color: "var(--emerald)",
                        fontSize: "0.78rem",
                        fontWeight: 800,
                        padding: "5px 12px",
                        borderRadius: "var(--radius-full)",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "5px",
                        backdropFilter: "blur(12px)",
                      }}
                    >
                      <Leaf size={12} />
                      <span>{locale === "bn" ? "১০০% জৈব খামার" : "100% Organic"}</span>
                    </span>
                  )}
                </div>

                {/* Live Origin Pin Bottom Left */}
                <div
                  style={{
                    position: "absolute",
                    bottom: "14px",
                    left: "14px",
                    background: "rgba(8, 10, 14, 0.8)",
                    backdropFilter: "blur(16px)",
                    border: "1px solid rgba(255, 255, 255, 0.12)",
                    padding: "6px 12px",
                    borderRadius: "var(--radius-full)",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    fontSize: "0.75rem",
                    color: "var(--text-main)",
                    fontWeight: 600,
                  }}
                >
                  <MapPin size={13} color="var(--emerald)" />
                  <span>{locale === "bn" ? product.originBn : product.originEn}</span>
                </div>
              </div>

              {/* Thumbnail Strip */}
              {product.images.length > 1 && (
                <div style={{ display: "flex", gap: "10px", overflowX: "auto", paddingBottom: "4px" }}>
                  {product.images.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveImageIdx(idx)}
                      style={{
                        width: "72px",
                        height: "72px",
                        borderRadius: "var(--radius-md)",
                        overflow: "hidden",
                        border: activeImageIdx === idx ? "2px solid var(--emerald)" : "1px solid rgba(255, 255, 255, 0.1)",
                        opacity: activeImageIdx === idx ? 1 : 0.6,
                        transition: "all var(--t-fast)",
                        cursor: "pointer",
                        background: "var(--bg-card)",
                        padding: 0,
                        boxShadow: activeImageIdx === idx ? "0 0 16px rgba(16,216,118,0.3)" : "none",
                      }}
                    >
                      <img src={img} alt="Thumbnail" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    </button>
                  ))}
                </div>
              )}

              {/* Sourcing & Freshness Meter Box */}
              <div
                style={{
                  background: "rgba(16, 216, 118, 0.05)",
                  borderRadius: "var(--radius-lg)",
                  padding: "16px",
                  border: "1px solid rgba(16, 216, 118, 0.2)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: 800, color: "var(--emerald)", fontSize: "0.88rem" }}>
                  <ShieldCheck size={18} />
                  <span>{t.freshnessMeter || (locale === "bn" ? "তাতকা ফ্রেশনেস গ্যারান্টি" : "Tatka Freshness Guarantee")}: {locale === "bn" ? product.freshnessGuaranteeBn : product.freshnessGuaranteeEn}</span>
                </div>
                <div style={{ color: "var(--text-muted)", fontSize: "0.8rem", lineHeight: 1.5 }}>
                  {locale === "bn"
                    ? "সরাসরি নদী ও নির্ভরযোগ্য খামার থেকে ভোরে সংগ্রহ করে তাপমাত্রা নিয়ন্ত্রিত ব্যাগে ৪ ঘণ্টার মধ্যে ডেলিভারি।"
                    : "Harvested at dawn from verified river & eco-farms, temperature-regulated delivery in under 4 hours."}
                </div>
              </div>
            </div>

            {/* Right Column: Title, Vendor, Pricing Engine, and Guarantees */}
            <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>

              {/* Vendor & Social Actions */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
                <Link
                  href={`/shop/${product.vendorSlug}`}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    fontSize: "0.82rem",
                    fontWeight: 700,
                    color: "var(--emerald)",
                    background: "rgba(16, 216, 118, 0.08)",
                    border: "1px solid rgba(16, 216, 118, 0.2)",
                    padding: "6px 14px",
                    borderRadius: "var(--radius-full)",
                    transition: "all var(--t-fast)",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(16, 216, 118, 0.16)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(16, 216, 118, 0.08)")}
                >
                  <Store size={14} />
                  <span>{locale === "bn" ? "বিক্রেতা:" : "Seller:"} {locale === "bn" ? product.vendorNameBn : product.vendorNameEn}</span>
                  {product.isOfficialTatka && <span style={{ color: "var(--gold)", fontWeight: 900 }}>✓ Verified</span>}
                </Link>

                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    type="button"
                    onClick={() => toggleWishlist(product.id)}
                    aria-label="Wishlist"
                    style={{
                      width: "38px",
                      height: "38px",
                      borderRadius: "50%",
                      background: "rgba(255, 255, 255, 0.06)",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      color: isFav ? "var(--rose)" : "var(--text-muted)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      transition: "all var(--t-fast)",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.1)")}
                    onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                  >
                    <Heart size={18} fill={isFav ? "var(--rose)" : "none"} />
                  </button>

                  <button
                    type="button"
                    onClick={handleShare}
                    aria-label="Share"
                    style={{
                      width: "38px",
                      height: "38px",
                      borderRadius: "50%",
                      background: "rgba(255, 255, 255, 0.06)",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      color: "var(--text-muted)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      position: "relative",
                      transition: "all var(--t-fast)",
                    }}
                  >
                    <Share2 size={18} />
                    {copiedShare && (
                      <span
                        style={{
                          position: "absolute",
                          bottom: "115%",
                          right: 0,
                          background: "var(--emerald)",
                          color: "var(--bg-page)",
                          padding: "3px 8px",
                          borderRadius: "4px",
                          fontSize: "0.68rem",
                          fontWeight: 800,
                          whiteSpace: "nowrap",
                        }}
                      >
                        Copied Link!
                      </span>
                    )}
                  </button>
                </div>
              </div>

              {/* Title */}
              <h1
                style={{
                  fontSize: "clamp(1.6rem, 3.5vw, 2.2rem)",
                  fontWeight: 900,
                  color: "var(--text-main)",
                  lineHeight: 1.2,
                  letterSpacing: "-0.04em",
                  fontFamily: "var(--font-heading)",
                }}
              >
                {locale === "bn" ? product.nameBn : product.nameEn}
              </h1>

              {/* Ratings, SKU, and Live Stock Availability */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "14px",
                  fontSize: "0.85rem",
                  flexWrap: "wrap",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "5px", color: "var(--gold)", fontWeight: 800 }}>
                  <Star size={16} fill="var(--gold)" />
                  <span>{product.rating}</span>
                  <span style={{ color: "var(--text-muted)", fontWeight: 500 }}>
                    ({product.reviewsCount} {locale === "bn" ? "রিভিউ" : "reviews"})
                  </span>
                </div>

                <span style={{ color: "rgba(255, 255, 255, 0.15)" }}>|</span>

                <span style={{ color: "var(--text-muted)", fontSize: "0.78rem" }}>
                  SKU: <strong style={{ color: "var(--text-body)" }}>{product.sku}</strong>
                </span>

                <span style={{ color: "rgba(255, 255, 255, 0.15)" }}>|</span>

                <span
                  style={{
                    color: "var(--emerald)",
                    fontWeight: 700,
                    fontSize: "0.8rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                    background: "rgba(16, 216, 118, 0.08)",
                    padding: "3px 10px",
                    borderRadius: "var(--radius-full)",
                  }}
                >
                  <CheckCircle size={13} />
                  {t.stockAvailable || (locale === "bn" ? "স্টক আছে" : "In Stock")} ({product.stock} {product.baseUnit})
                </span>
              </div>

              {/* Short Description */}
              <p
                style={{
                  fontSize: "0.95rem",
                  color: "var(--text-muted)",
                  lineHeight: 1.7,
                }}
              >
                {locale === "bn" ? product.descriptionBn : product.descriptionEn}
              </p>

              {/* ── Signature Smart Order Weight Selector Engine ── */}
              <WeightPricingSelector product={product} />

              {/* Key Trust Guarantees */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: "12px",
                  paddingTop: "16px",
                  borderTop: "1px solid rgba(255, 255, 255, 0.06)",
                }}
              >
                {[
                  { icon: Truck, titleBn: "৪ ঘণ্টায় এক্সপ্রেস", titleEn: "4h Express", subBn: "ঢাকা জুড়ে দ্রুত", subEn: "Dhaka wide" },
                  { icon: ShieldCheck, titleBn: "১০০% মানিব্যাক", titleEn: "100% Refund", subBn: "সতেজ না হলে ফেরত", subEn: "If not fresh" },
                  { icon: Leaf, titleBn: "সরাসরি খামার", titleEn: "Farm Direct", subBn: "কেমিক্যালমুক্ত", subEn: "Pure organic" },
                ].map((g, i) => {
                  const Icon = g.icon;
                  return (
                    <div
                      key={i}
                      style={{
                        textAlign: "center",
                        padding: "12px 8px",
                        background: "rgba(255, 255, 255, 0.02)",
                        borderRadius: "var(--radius-md)",
                        border: "1px solid rgba(255, 255, 255, 0.05)",
                      }}
                    >
                      <div style={{ color: "var(--emerald)", marginBottom: "4px", display: "flex", justifyContent: "center" }}>
                        <Icon size={18} />
                      </div>
                      <div style={{ fontWeight: 800, color: "var(--text-main)", fontSize: "0.8rem", fontFamily: "var(--font-heading)" }}>
                        {locale === "bn" ? g.titleBn : g.titleEn}
                      </div>
                      <div style={{ color: "var(--text-muted)", fontSize: "0.68rem", marginTop: "2px" }}>
                        {locale === "bn" ? g.subBn : g.subEn}
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          </div>

          {/* ── Frequently Bought Together Bundle Builder ── */}
          <div
            style={{
              background: "rgba(14, 17, 23, 0.9)",
              borderRadius: "var(--radius-xl)",
              border: "1px solid rgba(16, 216, 118, 0.25)",
              padding: "28px",
              marginBottom: "48px",
              boxShadow: "var(--shadow-lg)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontWeight: 800,
                fontSize: "1.15rem",
                color: "var(--text-main)",
                marginBottom: "20px",
                fontFamily: "var(--font-heading)",
              }}
            >
              <Sparkles size={20} color="var(--gold)" />
              <span>{t.frequentlyBoughtTogether || (locale === "bn" ? "একসাথে কিনুন (কম্বো সাশ্রয় ৮% ছাড়)" : "Frequently Bought Together (8% Off Bundle)")}</span>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "20px",
                flexWrap: "wrap",
              }}
            >
              {/* Product 1 */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  background: "rgba(255, 255, 255, 0.03)",
                  padding: "10px 16px",
                  borderRadius: "var(--radius-lg)",
                  border: "1px solid rgba(255, 255, 255, 0.06)",
                }}
              >
                <img
                  src={product.images[0]}
                  alt="Item 1"
                  style={{ width: "54px", height: "54px", objectFit: "cover", borderRadius: "8px" }}
                />
                <div>
                  <div style={{ fontSize: "0.88rem", fontWeight: 700, color: "var(--text-main)" }}>
                    {locale === "bn" ? product.nameBn : product.nameEn}
                  </div>
                  <div style={{ fontSize: "0.82rem", color: "var(--emerald)", fontWeight: 800, marginTop: "2px" }}>
                    {formatPrice(product.basePrice)}
                  </div>
                </div>
              </div>

              <div
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  background: "rgba(16, 216, 118, 0.15)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--emerald)",
                }}
              >
                <Plus size={18} />
              </div>

              {/* Product 2 */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  background: "rgba(255, 255, 255, 0.03)",
                  padding: "10px 16px",
                  borderRadius: "var(--radius-lg)",
                  border: "1px solid rgba(255, 255, 255, 0.06)",
                }}
              >
                <img
                  src={bundleProduct.images[0]}
                  alt="Item 2"
                  style={{ width: "54px", height: "54px", objectFit: "cover", borderRadius: "8px" }}
                />
                <div>
                  <div style={{ fontSize: "0.88rem", fontWeight: 700, color: "var(--text-main)" }}>
                    {locale === "bn" ? bundleProduct.nameBn : bundleProduct.nameEn}
                  </div>
                  <div style={{ fontSize: "0.82rem", color: "var(--emerald)", fontWeight: 800, marginTop: "2px" }}>
                    {formatPrice(bundleProduct.basePrice)}
                  </div>
                </div>
              </div>

              {/* Bundle Action */}
              <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "16px" }}>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", textTransform: "uppercase" }}>
                    {locale === "bn" ? "কম্বো মূল্য" : "Combo Price"}
                  </div>
                  <div style={{ fontSize: "1.35rem", fontWeight: 900, color: "var(--text-main)" }}>
                    <span className="gradient-text-emerald">{formatPrice(bundleTotal)}</span>
                    <span style={{ fontSize: "0.85rem", textDecoration: "line-through", color: "var(--text-subtle)", marginLeft: "6px" }}>
                      {formatPrice(product.basePrice + bundleProduct.basePrice)}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleAddBundle}
                  className="btn-primary"
                  style={{
                    padding: "12px 24px",
                    fontSize: "0.92rem",
                    fontWeight: 800,
                  }}
                >
                  {bundleAdded ? (
                    <>
                      <Check size={16} strokeWidth={3} />
                      <span>{locale === "bn" ? "কম্বো যোগ হয়েছে!" : "Combo Added!"}</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={16} />
                      <span>{t.addAllToCart || (locale === "bn" ? "দুটোই কার্টে যোগ করুন" : "Add Both to Cart")}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* ── Detailed Tabs: Specifications, Nutrition, Origin, Reviews ── */}
          <div
            style={{
              background: "rgba(14, 17, 23, 0.95)",
              borderRadius: "var(--radius-2xl)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              overflow: "hidden",
              marginBottom: "48px",
              boxShadow: "var(--shadow-xl)",
            }}
          >
            {/* Tab Navigation */}
            <div
              style={{
                display: "flex",
                borderBottom: "1px solid rgba(255, 255, 255, 0.07)",
                background: "rgba(8, 10, 14, 0.8)",
                overflowX: "auto",
              }}
            >
              {[
                { id: "desc", label: t.specifications || (locale === "bn" ? "বিবরণ ও ব্যবহার" : "Description & Care") },
                ...(product.nutritionInfo ? [{ id: "nutrition", label: t.nutritionFacts || (locale === "bn" ? "পুষ্টিগুণ ও স্বাস্থ্যতথ্য" : "Nutritional Profile") }] : []),
                { id: "origin", label: t.originInfo || (locale === "bn" ? "সংগ্রহ ও সোর্সিং তথ্য" : "Harvest & Sourcing") },
                { id: "reviews", label: `${t.customerReviews || (locale === "bn" ? "গ্রাহক মতামত" : "Verified Reviews")} (${product.reviewsCount})` },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  style={{
                    padding: "16px 28px",
                    fontWeight: 800,
                    fontSize: "0.92rem",
                    border: "none",
                    borderBottom: activeTab === tab.id ? "3px solid var(--emerald)" : "3px solid transparent",
                    background: activeTab === tab.id ? "rgba(16, 216, 118, 0.06)" : "transparent",
                    color: activeTab === tab.id ? "var(--emerald)" : "var(--text-muted)",
                    cursor: "pointer",
                    transition: "all var(--t-fast)",
                    whiteSpace: "nowrap",
                    fontFamily: "var(--font-heading)",
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Contents */}
            <div style={{ padding: "32px" }}>
              {activeTab === "desc" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <h3 style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--text-main)", fontFamily: "var(--font-heading)" }}>
                    {locale === "bn" ? product.nameBn : product.nameEn}
                  </h3>
                  <p style={{ color: "var(--text-body)", lineHeight: 1.8, fontSize: "0.95rem" }}>
                    {locale === "bn" ? product.descriptionBn : product.descriptionEn}
                  </p>
                  {product.storageTipsBn && (
                    <div
                      style={{
                        background: "rgba(16, 216, 118, 0.06)",
                        padding: "16px 20px",
                        borderRadius: "var(--radius-lg)",
                        fontSize: "0.88rem",
                        color: "var(--emerald)",
                        border: "1px solid rgba(16, 216, 118, 0.2)",
                        marginTop: "8px",
                      }}
                    >
                      <strong>💡 {t.storageGuide || (locale === "bn" ? "সংরক্ষণ টিপস" : "Storage Guidelines")}:</strong>{" "}
                      <span style={{ color: "var(--text-body)" }}>{locale === "bn" ? product.storageTipsBn : product.storageTipsEn}</span>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "nutrition" && product.nutritionInfo && (
                <div>
                  <h3 style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--text-main)", marginBottom: "18px", fontFamily: "var(--font-heading)" }}>
                    {locale === "bn" ? "প্রতি ১০০ গ্রামের পুষ্টিমান তথ্য" : "Nutritional Information (per 100g serving)"}
                  </h3>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "14px" }}>
                    {[
                      { label: locale === "bn" ? "ক্যালরি" : "Calories", val: product.nutritionInfo.calories, color: "#10D876" },
                      { label: locale === "bn" ? "প্রোটিন" : "Protein", val: product.nutritionInfo.protein, color: "#4F9EFF" },
                      { label: locale === "bn" ? "কার্বোহাইড্রেট" : "Carbs", val: product.nutritionInfo.carbs, color: "#F5C842" },
                      { label: locale === "bn" ? "ফ্যাট ও মিনারেল" : "Fat & Minerals", val: product.nutritionInfo.fat, color: "#FF4D6D" },
                    ].map((n, i) => (
                      <div
                        key={i}
                        style={{
                          background: "rgba(255, 255, 255, 0.03)",
                          padding: "18px 14px",
                          borderRadius: "var(--radius-lg)",
                          textAlign: "center",
                          border: "1px solid rgba(255, 255, 255, 0.06)",
                        }}
                      >
                        <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "4px" }}>{n.label}</div>
                        <div style={{ fontSize: "1.4rem", fontWeight: 900, color: n.color, fontFamily: "var(--font-heading)" }}>
                          {n.val}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "origin" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  <h3 style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--text-main)", fontFamily: "var(--font-heading)" }}>
                    {t.originInfo || (locale === "bn" ? "সোর্সিং ও সংগ্রহ নিশ্চয়তা" : "Direct Farm Sourcing Protocol")}
                  </h3>
                  <p style={{ color: "var(--text-body)", lineHeight: 1.8, fontSize: "0.95rem" }}>
                    {locale === "bn"
                      ? `এই পণ্যটি সরাসরি ${product.originBn} থেকে কোনো ক্ষতিকর কীটনাশক বা রাসায়নিক প্রিজারভেটিভ ছাড়াই সংগৃহীত হয়েছে। তাতকা বাজার কোয়ালিটি ল্যাব প্রতিটি লট পরীক্ষার মাধ্যমে খাদ্যমান নিশ্চিত করে আপনার ঠিকানায় পাঠায়।`
                      : `Sourced directly from verified sustainable farms in ${product.originEn}. Every single batch undergoes rigorous quality validation prior to temperature-regulated dispatch.`}
                  </p>
                </div>
              )}

              {activeTab === "reviews" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      flexWrap: "wrap",
                      gap: "16px",
                      paddingBottom: "20px",
                      borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
                    }}
                  >
                    <div>
                      <span style={{ fontSize: "2.4rem", fontWeight: 900, color: "var(--text-main)", fontFamily: "var(--font-heading)" }}>
                        {product.rating}
                      </span>
                      <span style={{ fontSize: "1.1rem", color: "var(--text-muted)", marginLeft: "6px" }}>/ ৫.০</span>
                    </div>

                    <button
                      className="btn-secondary"
                      style={{ padding: "10px 20px", fontSize: "0.85rem", fontWeight: 700 }}
                    >
                      {t.writeReview || (locale === "bn" ? "রিভিউ লিখুন" : "Write a Review")}
                    </button>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    {REVIEWS.map((rev) => (
                      <div
                        key={rev.id}
                        style={{
                          background: "rgba(255, 255, 255, 0.02)",
                          padding: "16px 20px",
                          borderRadius: "var(--radius-lg)",
                          border: "1px solid rgba(255, 255, 255, 0.04)",
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                          <div style={{ fontWeight: 800, fontSize: "0.92rem", color: "var(--text-main)" }}>{rev.userName}</div>
                          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{rev.date}</div>
                        </div>
                        <div style={{ display: "flex", gap: "3px", color: "var(--gold)", marginBottom: "8px" }}>
                          {Array.from({ length: rev.rating }).map((_, i) => (
                            <Star key={i} size={14} fill="var(--gold)" />
                          ))}
                        </div>
                        <p style={{ fontSize: "0.88rem", color: "var(--text-body)", lineHeight: 1.6 }}>
                          {locale === "bn" ? rev.commentBn : rev.commentEn}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── Related Products Rail ── */}
          {relatedProducts.length > 0 && (
            <section>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "24px" }}>
                <div>
                  <div className="section-eyebrow section-eyebrow--green" style={{ marginBottom: "8px" }}>
                    🌱 {locale === "bn" ? "সম্পর্কিত পণ্য" : "Related Fresh Picks"}
                  </div>
                  <h2 className="section-heading">
                    {locale === "bn" ? "এই বিভাগের অন্যান্য তাজা পণ্য" : "More Fresh Items from this Category"}
                  </h2>
                </div>
                <Link href={`/category/${product.categorySlug}`} className="view-all-link">
                  <span>{t.viewAll || (locale === "bn" ? "সব দেখুন" : "View All")}</span>
                  <ChevronRight size={15} />
                </Link>
              </div>

              <div className="product-grid">
                {relatedProducts.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </section>
          )}

        </div>
      </div>
    </>
  );
}
