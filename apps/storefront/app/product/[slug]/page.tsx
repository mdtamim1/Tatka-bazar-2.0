"use client";

import React, { useState, use } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Star,
  Heart,
  Share2,
  ShieldCheck,
  Truck,
  RotateCcw,
  Sparkles,
  Store,
  MapPin,
  CheckCircle,
  Clock,
  Plus,
  Scale,
  Leaf,
  ChevronRight,
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

  const isFav = isInWishlist(product.id);
  const relatedProducts = PRODUCTS.filter((p) => p.id !== product.id && p.categorySlug === product.categorySlug).slice(0, 3);
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
  };

  return (
    <>
      <ProductJsonLd product={product} />
      <div style={{ padding: "20px 0 60px" }}>
      <div className="container">
        
        {/* Breadcrumb Navigation */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.82rem", color: "var(--text-muted)", marginBottom: "20px" }}>
          <Link href="/" style={{ color: "var(--primary)" }}>হোম</Link>
          <ChevronRight size={14} />
          <Link href={`/category/${product.categorySlug}`} style={{ color: "var(--primary)" }}>
            {locale === "bn" ? product.categoryNameBn : product.categoryNameEn}
          </Link>
          <ChevronRight size={14} />
          <span style={{ color: "var(--text-main)", fontWeight: 600 }}>
            {locale === "bn" ? product.nameBn : product.nameEn}
          </span>
        </div>

        {/* Product Hero Grid (Media Gallery + Decision / Pricing Engine) */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "40px",
            background: "var(--bg-surface)",
            borderRadius: "var(--radius-xl)",
            padding: "30px",
            border: "1px solid var(--border-subtle)",
            boxShadow: "var(--shadow-sm)",
            marginBottom: "40px",
          }}
        >
          {/* Left: Media Gallery */}
          <div>
            <div
              style={{
                position: "relative",
                aspectRatio: "1/1",
                borderRadius: "var(--radius-lg)",
                overflow: "hidden",
                background: "var(--bg-subtle)",
                marginBottom: "14px",
                border: "1px solid var(--border-subtle)",
              }}
            >
              <img
                src={product.images[activeImageIdx] || product.images[0]}
                alt={locale === "bn" ? product.nameBn : product.nameEn}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />

              {/* Floating Badges */}
              <div style={{ position: "absolute", top: "12px", left: "12px", display: "flex", flexDirection: "column", gap: "6px" }}>
                {product.flashDiscount && (
                  <span className="badge-discount" style={{ fontSize: "0.85rem", padding: "6px 12px" }}>
                    -{product.flashDiscount}% অফার
                  </span>
                )}
                {product.isOrganic && (
                  <span className="badge-organic" style={{ fontSize: "0.82rem", padding: "6px 12px" }}>
                    🌱 ১০০% সার্টিফাইড অর্গানিক
                  </span>
                )}
              </div>
            </div>

            {/* Thumbnail Carousel */}
            {product.images.length > 1 && (
              <div style={{ display: "flex", gap: "10px" }}>
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImageIdx(idx)}
                    style={{
                      width: "70px",
                      height: "70px",
                      borderRadius: "var(--radius-md)",
                      overflow: "hidden",
                      border: activeImageIdx === idx ? "2.5px solid var(--primary)" : "1.5px solid var(--border-subtle)",
                      opacity: activeImageIdx === idx ? 1 : 0.6,
                      transition: "all 0.2s",
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
                marginTop: "20px",
                background: "var(--primary-light)",
                borderRadius: "var(--radius-md)",
                padding: "14px",
                border: "1px solid rgba(27, 138, 76, 0.2)",
                fontSize: "0.85rem",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: 700, color: "var(--primary-dark)", marginBottom: "4px" }}>
                <ShieldCheck size={18} color="var(--primary)" />
                <span>{t.freshnessMeter}: {locale === "bn" ? product.freshnessGuaranteeBn : product.freshnessGuaranteeEn}</span>
              </div>
              <div style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>
                📍 {t.freshFrom}: <strong>{locale === "bn" ? product.originBn : product.originEn}</strong>
              </div>
            </div>
          </div>

          {/* Right: Product Info & Signature Weight Selector */}
          <div style={{ display: "flex", flexDirection: "column" }}>
            
            {/* Vendor / Seller Strip */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <Link
                href={`/shop/${product.vendorSlug}`}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "0.82rem",
                  fontWeight: 700,
                  color: "var(--primary-dark)",
                  background: "var(--bg-subtle)",
                  padding: "4px 10px",
                  borderRadius: "var(--radius-full)",
                }}
              >
                <Store size={14} color="var(--primary)" />
                <span>
                  {locale === "bn" ? "বিক্রেতা:" : "Sold by:"} {locale === "bn" ? product.vendorNameBn : product.vendorNameEn}
                </span>
                {product.isOfficialTatka && <span>✓</span>}
              </Link>

              {/* Wishlist & Share */}
              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  type="button"
                  onClick={() => toggleWishlist(product.id)}
                  style={{
                    padding: "8px",
                    borderRadius: "50%",
                    background: "var(--bg-subtle)",
                    color: isFav ? "var(--crimson)" : "var(--text-muted)",
                  }}
                  title={t.wishlist}
                >
                  <Heart size={18} fill={isFav ? "var(--crimson)" : "none"} />
                </button>
                <button
                  type="button"
                  onClick={handleShare}
                  style={{
                    padding: "8px",
                    borderRadius: "50%",
                    background: "var(--bg-subtle)",
                    color: "var(--text-muted)",
                    position: "relative",
                  }}
                  title="Share"
                >
                  <Share2 size={18} />
                  {copiedShare && (
                    <span
                      style={{
                        position: "absolute",
                        bottom: "100%",
                        right: 0,
                        background: "#000",
                        color: "#FFF",
                        padding: "2px 6px",
                        borderRadius: "4px",
                        fontSize: "0.7rem",
                        whiteSpace: "nowrap",
                      }}
                    >
                      Copied!
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Title */}
            <h1
              style={{
                fontSize: "clamp(1.4rem, 2.5vw, 1.85rem)",
                fontWeight: 800,
                color: "var(--text-main)",
                lineHeight: 1.25,
                marginBottom: "12px",
              }}
            >
              {locale === "bn" ? product.nameBn : product.nameEn}
            </h1>

            {/* Ratings & SKU */}
            <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "18px", fontSize: "0.85rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "4px", color: "var(--accent)", fontWeight: 700 }}>
                <Star size={16} fill="var(--accent)" />
                <span>{product.rating}</span>
                <span style={{ color: "var(--text-muted)", fontWeight: 500 }}>
                  ({product.reviewsCount} {locale === "bn" ? "রিভিউ" : "reviews"})
                </span>
              </div>
              <span style={{ color: "var(--border-medium)" }}>|</span>
              <span style={{ color: "var(--text-muted)", fontSize: "0.78rem" }}>
                SKU: {product.sku}
              </span>
              <span style={{ color: "var(--border-medium)" }}>|</span>
              <span style={{ color: "var(--primary)", fontWeight: 700, fontSize: "0.8rem", display: "flex", alignItems: "center", gap: "4px" }}>
                <CheckCircle size={14} />
                {t.stockAvailable} ({product.stock} {product.baseUnit})
              </span>
            </div>

            {/* Short Description */}
            <p style={{ fontSize: "0.92rem", color: "var(--text-muted)", lineHeight: 1.6, marginBottom: "22px" }}>
              {locale === "bn" ? product.descriptionBn : product.descriptionEn}
            </p>

            {/* Signature Weight-Based Pricing Engine Selector */}
            <WeightPricingSelector product={product} />

            {/* Key Trust Guarantees */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "12px",
                marginTop: "24px",
                paddingTop: "20px",
                borderTop: "1px solid var(--border-subtle)",
              }}
            >
              <div style={{ textAlign: "center", fontSize: "0.78rem" }}>
                <div style={{ color: "var(--primary)", marginBottom: "4px", display: "flex", justifyContent: "center" }}>
                  <Truck size={20} />
                </div>
                <div style={{ fontWeight: 700, color: "var(--text-main)" }}>৬০ মিনিট এক্সপ্রেস</div>
                <div style={{ color: "var(--text-muted)", fontSize: "0.7rem" }}>তাজা হোম ডেলিভারি</div>
              </div>
              <div style={{ textAlign: "center", fontSize: "0.78rem" }}>
                <div style={{ color: "var(--primary)", marginBottom: "4px", display: "flex", justifyContent: "center" }}>
                  <ShieldCheck size={20} />
                </div>
                <div style={{ fontWeight: 700, color: "var(--text-main)" }}>১০০% মানিব্যাক</div>
                <div style={{ color: "var(--text-muted)", fontSize: "0.7rem" }}>পছন্দ না হলে রিটার্ন</div>
              </div>
              <div style={{ textAlign: "center", fontSize: "0.78rem" }}>
                <div style={{ color: "var(--primary)", marginBottom: "4px", display: "flex", justifyContent: "center" }}>
                  <Leaf size={20} />
                </div>
                <div style={{ fontWeight: 700, color: "var(--text-main)" }}>সরাসরি নদী ও খামার</div>
                <div style={{ color: "var(--text-muted)", fontSize: "0.7rem" }}>মধ্যস্বত্বভোগী ছাড়া</div>
              </div>
            </div>

          </div>
        </div>

        {/* Frequently Bought Together Bundle */}
        <div
          style={{
            background: "var(--bg-surface)",
            borderRadius: "var(--radius-lg)",
            border: "1.5px dashed var(--primary)",
            padding: "24px",
            marginBottom: "40px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: 800, fontSize: "1.1rem", color: "var(--primary-dark)", marginBottom: "16px" }}>
            <Sparkles size={20} color="var(--primary)" />
            <span>{t.frequentlyBoughtTogether} (কম্বো সাশ্রয়)</span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
            {/* Item 1 */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <img src={product.images[0]} alt="Item 1" style={{ width: "60px", height: "60px", objectFit: "cover", borderRadius: "8px" }} />
              <div>
                <div style={{ fontSize: "0.85rem", fontWeight: 700 }}>{locale === "bn" ? product.nameBn : product.nameEn}</div>
                <div style={{ fontSize: "0.8rem", color: "var(--primary)", fontWeight: 700 }}>{formatPrice(product.basePrice)}</div>
              </div>
            </div>

            <Plus size={20} color="var(--text-muted)" />

            {/* Item 2 */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <img src={bundleProduct.images[0]} alt="Item 2" style={{ width: "60px", height: "60px", objectFit: "cover", borderRadius: "8px" }} />
              <div>
                <div style={{ fontSize: "0.85rem", fontWeight: 700 }}>{locale === "bn" ? bundleProduct.nameBn : bundleProduct.nameEn}</div>
                <div style={{ fontSize: "0.8rem", color: "var(--primary)", fontWeight: 700 }}>{formatPrice(bundleProduct.basePrice)}</div>
              </div>
            </div>

            {/* Bundle CTA */}
            <div style={{ marginLeft: "auto" }}>
              <button
                type="button"
                onClick={handleAddBundle}
                className="btn-primary"
                style={{ padding: "10px 18px", fontSize: "0.9rem" }}
              >
                <span>{t.addAllToCart} • {formatPrice(product.basePrice + bundleProduct.basePrice)}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Detailed Tabs: Specifications, Nutritional Facts, Storage Guide, Reviews */}
        <div
          style={{
            background: "var(--bg-surface)",
            borderRadius: "var(--radius-xl)",
            border: "1px solid var(--border-subtle)",
            overflow: "hidden",
            marginBottom: "40px",
          }}
        >
          {/* Tab Navigation */}
          <div style={{ display: "flex", borderBottom: "1px solid var(--border-subtle)", background: "var(--bg-subtle)", overflowX: "auto" }}>
            <button
              onClick={() => setActiveTab("desc")}
              style={{
                padding: "14px 24px",
                fontWeight: 700,
                fontSize: "0.9rem",
                borderBottom: activeTab === "desc" ? "3px solid var(--primary)" : "none",
                background: activeTab === "desc" ? "var(--bg-surface)" : "transparent",
                color: activeTab === "desc" ? "var(--primary-dark)" : "var(--text-muted)",
              }}
            >
              {t.specifications}
            </button>
            {product.nutritionInfo && (
              <button
                onClick={() => setActiveTab("nutrition")}
                style={{
                  padding: "14px 24px",
                  fontWeight: 700,
                  fontSize: "0.9rem",
                  borderBottom: activeTab === "nutrition" ? "3px solid var(--primary)" : "none",
                  background: activeTab === "nutrition" ? "var(--bg-surface)" : "transparent",
                  color: activeTab === "nutrition" ? "var(--primary-dark)" : "var(--text-muted)",
                }}
              >
                {t.nutritionFacts}
              </button>
            )}
            <button
              onClick={() => setActiveTab("origin")}
              style={{
                padding: "14px 24px",
                fontWeight: 700,
                fontSize: "0.9rem",
                borderBottom: activeTab === "origin" ? "3px solid var(--primary)" : "none",
                background: activeTab === "origin" ? "var(--bg-surface)" : "transparent",
                color: activeTab === "origin" ? "var(--primary-dark)" : "var(--text-muted)",
              }}
            >
              {t.originInfo}
            </button>
            <button
              onClick={() => setActiveTab("reviews")}
              style={{
                padding: "14px 24px",
                fontWeight: 700,
                fontSize: "0.9rem",
                borderBottom: activeTab === "reviews" ? "3px solid var(--primary)" : "none",
                background: activeTab === "reviews" ? "var(--bg-surface)" : "transparent",
                color: activeTab === "reviews" ? "var(--primary-dark)" : "var(--text-muted)",
              }}
            >
              {t.customerReviews} ({product.reviewsCount})
            </button>
          </div>

          {/* Tab Contents */}
          <div style={{ padding: "28px" }}>
            {activeTab === "desc" && (
              <div>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "10px" }}>
                  {locale === "bn" ? product.nameBn : product.nameEn}
                </h3>
                <p style={{ color: "var(--text-muted)", lineHeight: 1.7, marginBottom: "16px" }}>
                  {locale === "bn" ? product.descriptionBn : product.descriptionEn}
                </p>
                {product.storageTipsBn && (
                  <div style={{ background: "var(--primary-light)", padding: "12px 16px", borderRadius: "var(--radius-md)", fontSize: "0.85rem", color: "var(--primary-dark)" }}>
                    <strong>💡 {t.storageGuide}:</strong> {locale === "bn" ? product.storageTipsBn : product.storageTipsEn}
                  </div>
                )}
              </div>
            )}

            {activeTab === "nutrition" && product.nutritionInfo && (
              <div>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "14px" }}>
                  {t.nutritionFacts}
                </h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "12px" }}>
                  <div style={{ background: "var(--bg-subtle)", padding: "14px", borderRadius: "var(--radius-md)", textAlign: "center" }}>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>ক্যালরি</div>
                    <div style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--primary-dark)" }}>{product.nutritionInfo.calories}</div>
                  </div>
                  <div style={{ background: "var(--bg-subtle)", padding: "14px", borderRadius: "var(--radius-md)", textAlign: "center" }}>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>প্রোটিন</div>
                    <div style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--primary-dark)" }}>{product.nutritionInfo.protein}</div>
                  </div>
                  <div style={{ background: "var(--bg-subtle)", padding: "14px", borderRadius: "var(--radius-md)", textAlign: "center" }}>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>কার্বোহাইড্রেট</div>
                    <div style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--primary-dark)" }}>{product.nutritionInfo.carbs}</div>
                  </div>
                  <div style={{ background: "var(--bg-subtle)", padding: "14px", borderRadius: "var(--radius-md)", textAlign: "center" }}>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>ফ্যাট ও মিনারেল</div>
                    <div style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--primary-dark)" }}>{product.nutritionInfo.fat}</div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "origin" && (
              <div>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "10px" }}>
                  {t.originInfo}
                </h3>
                <p style={{ color: "var(--text-muted)", lineHeight: 1.6 }}>
                  {locale === "bn"
                    ? `এই পণ্যটি সরাসরি ${product.originBn} থেকে সংগৃহীত। তাতকা বাজার কোয়ালিটি টিম প্রতিটি ব্যাচ পরীক্ষার পর তাজা ডেলিভারি নিশ্চিত করে।`
                    : `Sourced directly from ${product.originEn}. Every batch is quality-tested to guarantee peak freshness.`}
                </p>
              </div>
            )}

            {activeTab === "reviews" && (
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                  <div>
                    <span style={{ fontSize: "1.8rem", fontWeight: 800, color: "var(--primary-dark)" }}>{product.rating}</span>
                    <span style={{ fontSize: "1rem", color: "var(--text-muted)" }}> / ৫.০</span>
                  </div>
                  <button className="btn-secondary" style={{ padding: "8px 16px", fontSize: "0.85rem" }}>
                    {t.writeReview}
                  </button>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  {REVIEWS.map((rev) => (
                    <div key={rev.id} style={{ borderBottom: "1px solid var(--border-subtle)", paddingBottom: "14px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                        <div style={{ fontWeight: 700, fontSize: "0.9rem" }}>{rev.userName}</div>
                        <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{rev.date}</div>
                      </div>
                      <div style={{ display: "flex", gap: "2px", color: "var(--accent)", marginBottom: "6px" }}>
                        {Array.from({ length: rev.rating }).map((_, i) => (
                          <Star key={i} size={14} fill="var(--accent)" />
                        ))}
                      </div>
                      <p style={{ fontSize: "0.85rem", color: "var(--text-main)" }}>
                        {locale === "bn" ? rev.commentBn : rev.commentEn}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Related Products Rail */}
        {relatedProducts.length > 0 && (
          <section>
            <h2 style={{ fontSize: "1.3rem", fontWeight: 800, color: "var(--text-main)", marginBottom: "16px" }}>
              {locale === "bn" ? "এই বিভাগের অন্যান্য তাজা পণ্য" : "More Fresh Items from this Category"}
            </h2>
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
