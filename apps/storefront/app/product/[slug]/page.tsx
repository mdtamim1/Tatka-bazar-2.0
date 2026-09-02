"use client";

import React, { useState, use } from "react";
import Link from "next/link";
import { notFound, useRouter } from "next/navigation";
import {
  Star,
  Package,
  ZoomIn,
  ChevronRight,
  Minus,
  Plus,
  Zap,
  ShoppingBag,
  Heart,
  Share2,
  Truck,
  ShieldCheck,
  Leaf,
  Sparkles,
  Clock,
  MapPin,
  ChevronDown,
  Check,
  ArrowRight,
  Flame,
  Award,
  Utensils,
  CheckCircle2,
  Fish,
  Scale,
  RefreshCw,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useCartStore } from "@/lib/cart-store";
import { PRODUCTS, VENDORS } from "@/lib/catalog";
import { ProductJsonLd } from "@/components/seo/JsonLd";
import { ProductCard } from "@/components/product/ProductCard";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export default function ProductDetailPage({ params }: ProductPageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { formatPrice } = useLanguage();
  const { addItem, openCart, wishlistIds, toggleWishlist } = useCartStore();

  const product = PRODUCTS.find((p) => p.slug === resolvedParams.slug);
  if (!product) {
    return notFound();
  }

  // Active Image & Zoom state
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });

  // Weight & Portion Selection
  const weightOptions =
    product.weightOptions && product.weightOptions.length > 0
      ? product.weightOptions
      : [
          { value: 0.5, unit: product.baseUnit || "kg", labelBn: "500g", labelEn: "500g", multiplier: 0.5 },
          { value: 1.0, unit: product.baseUnit || "kg", labelBn: "1 kg", labelEn: "1 kg", multiplier: 1.0, popular: true },
          { value: 2.0, unit: product.baseUnit || "kg", labelBn: "2 kg", labelEn: "2 kg", multiplier: 2.0 },
          { value: 5.0, unit: product.baseUnit || "kg", labelBn: "5 kg", labelEn: "5 kg", multiplier: 4.8 },
        ];

  const [selectedWeightIdx, setSelectedWeightIdx] = useState(
    Math.max(0, weightOptions.findIndex((w) => w.popular))
  );
  const defaultWeightOpt = {
    value: 1,
    unit: product.baseUnit || ("kg" as const),
    labelBn: "1 unit",
    labelEn: "1 unit",
    multiplier: 1,
  };
  const activeWeight = weightOptions[selectedWeightIdx] || weightOptions[0] || defaultWeightOpt;

  // Cutting & Preparation Preference (for fish & meat)
  const isFishOrMeat =
    product.categorySlug === "fish-and-meat" ||
    product.subcategorySlug?.includes("fish") ||
    product.subcategorySlug?.includes("chicken") ||
    product.subcategorySlug?.includes("meat");

  // Quantity Stepper
  const [quantity, setQuantity] = useState(1);
  const [addedAnimation, setAddedAnimation] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Accordion open/close state
  const [openAccordions, setOpenAccordions] = useState<Record<string, boolean>>({
    freshness: true,
    nutrition: false,
    storage: false,
    cooking: false,
    specs: false,
  });

  const toggleAccordion = (key: string) => {
    setOpenAccordions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Pricing calculations
  const unitPrice = Math.max(1, Math.round(product.basePrice * (activeWeight.multiplier || 1)));
  const comparePrice = product.comparePrice
    ? Math.round(product.comparePrice * (activeWeight.multiplier || 1))
    : null;
  const totalPrice = unitPrice * quantity;
  const discountPct =
    comparePrice && comparePrice > unitPrice
      ? Math.round(((comparePrice - unitPrice) / comparePrice) * 100)
      : product.flashDiscount || 0;

  // Review State
  const defaultReviews = [
    {
      id: "rev-1",
      author: "Tanvir Rahman",
      rating: 5,
      date: "Aug 2026",
      verified: true,
      comment:
        "Extremely fresh and pure authentic aroma! Received within 35 minutes packed in an insulated box with food-grade gel ice. Excellent quality.",
    },
    {
      id: "rev-2",
      author: "Farhana Islam",
      rating: 5,
      date: "Aug 2026",
      verified: true,
      comment:
        "100% formalin-free as promised by Tatka Bazar. Cleaned and cut perfectly according to my instructions. Highly recommended for daily bazar.",
    },
    {
      id: "rev-3",
      author: "Mahmudul Hasan",
      rating: 4,
      date: "Jul 2026",
      verified: true,
      comment:
        "Harvested freshly at dawn and delivered right on time. Taste and texture are incomparably better than ordinary local wet market produce.",
    },
  ];

  const [reviews, setReviews] = useState(
    product.reviewsList && product.reviewsList.length > 0 ? product.reviewsList : defaultReviews
  );
  const [reviewName, setReviewName] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  // Q&A State
  const defaultQA = [
    {
      id: "qa-1",
      question: "How is freshness maintained during delivery in hot weather?",
      askedBy: "Nasrin Akhter",
      date: "Aug 2026",
      answer:
        "All fresh items are transported in certified thermal-insulated bags with pharmaceutical food-grade gel ice packs maintained strictly between 0°C to 4°C.",
      answeredBy: "Tatka Bazar Freshness Team",
    },
    {
      id: "qa-2",
      question: "Can I choose customized cutting and descaling for fish/meat?",
      askedBy: "Rafiqul Islam",
      date: "Aug 2026",
      answer:
        "Yes! Our master fishmongers and butchers provide whole-cleaned, curry cut, or fry cut free of charge. You can select your preference before placing the order.",
      answeredBy: "Tatka Bazar Freshness Team",
    },
  ];

  const [questions, setQuestions] = useState(
    product.qaList && product.qaList.length > 0 ? product.qaList : defaultQA
  );
  const [newQuestionText, setNewQuestionText] = useState("");
  const [questionSubmitted, setQuestionSubmitted] = useState(false);

  // Mouse move for zoom
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPos({ x, y });
  };

  // Add to Bag
  const handleAddToCart = () => {
    addItem(product, activeWeight.value, activeWeight.unit, unitPrice, quantity);
    setAddedAnimation(true);
    openCart();
    setTimeout(() => setAddedAnimation(false), 2200);
  };

  // Buy Now (Instant checkout)
  const handleBuyNow = () => {
    addItem(product, activeWeight.value, activeWeight.unit, unitPrice, quantity);
    router.push("/checkout");
  };

  // Toggle wishlist
  const isFav = wishlistIds.includes(product.id);
  const handleToggleWishlist = () => {
    toggleWishlist(product.id);
  };

  // Share link
  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  // Post review
  const handlePostReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewComment.trim()) return;
    const newRev = {
      id: `rev-${Date.now()}`,
      author: reviewName.trim() || "Verified Buyer",
      rating: Number(reviewRating),
      date: "Aug 2026",
      verified: true,
      comment: reviewComment.trim(),
    };
    setReviews([newRev, ...reviews]);
    setReviewComment("");
    setReviewName("");
    setReviewSubmitted(true);
    setTimeout(() => setReviewSubmitted(false), 4000);
  };

  // Post question
  const handlePostQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestionText.trim()) return;
    const newQ = {
      id: `qa-${Date.now()}`,
      question: newQuestionText.trim(),
      askedBy: "Verified Customer",
      date: "Aug 2026",
    };
    setQuestions([newQ, ...questions]);
    setNewQuestionText("");
    setQuestionSubmitted(true);
    setTimeout(() => setQuestionSubmitted(false), 4000);
  };

  // Related products from same or complementary categories
  const relatedProducts = PRODUCTS.filter((p) => p.id !== product.id).slice(0, 4);

  // Sourcing & Vendor details
  const vendor = VENDORS.find((v) => v.id === product.vendorId) || {
    nameEn: product.vendorNameEn || "Tatka Bazar Direct Hub",
    locationEn: product.originEn || "Chandpur / Savar / Bogura",
    rating: 4.9,
    verified: true,
  };

  return (
    <>
      <ProductJsonLd product={product} />

      <div className="tb-pdp-root">
        {/* ── Breadcrumb Bar ────────────────────────────────────────── */}
        <div className="tb-breadcrumb-wrapper">
          <div className="tb-container">
            <div className="tb-breadcrumb">
              <Link href="/" className="tb-crumb-link">
                Home
              </Link>
              <ChevronRight size={13} className="tb-crumb-sep" />
              <Link href={`/category/${product.categorySlug}`} className="tb-crumb-link">
                {product.categoryNameEn || "Fresh Products"}
              </Link>
              <ChevronRight size={13} className="tb-crumb-sep" />
              <span className="tb-crumb-active">{product.nameEn || product.nameBn}</span>
            </div>
          </div>
        </div>

        {/* ── Main Product Display ──────────────────────────────────── */}
        <section className="tb-main-section">
          <div className="tb-container">
            <div className="tb-main-grid">
              {/* ── Left Column: Interactive Visual Showcase ───────── */}
              <div className="tb-gallery-column">
                <div
                  className="tb-main-image-card"
                  onMouseEnter={() => setIsZoomed(true)}
                  onMouseLeave={() => setIsZoomed(false)}
                  onMouseMove={handleMouseMove}
                >
                  <img
                    alt={product.nameEn || product.nameBn}
                    src={product.images[activeImageIdx] || product.images[0]}
                    className="tb-main-image"
                    style={{
                      transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                      transform: isZoomed ? "scale(1.75)" : "scale(1)",
                    }}
                  />

                  {/* Freshness Badge Strip */}
                  <div className="tb-badge-stack">
                    <span className="tb-badge tb-badge--green">
                      <Leaf size={11} /> 100% Formalin-Free
                    </span>
                    {product.isDailyBazar && (
                      <span className="tb-badge tb-badge--gold">
                        <Flame size={11} /> Daily Bazar Deal
                      </span>
                    )}
                    {discountPct > 0 && (
                      <span className="tb-badge tb-badge--red">
                        Save {discountPct}%
                      </span>
                    )}
                  </div>

                  {/* Zoom prompt */}
                  <div className="tb-zoom-hint">
                    <ZoomIn size={13} />
                    <span>Hover to inspect freshness</span>
                  </div>
                </div>

                {/* Thumbnails */}
                {product.images.length > 1 && (
                  <div className="tb-thumbnail-row">
                    {product.images.map((img, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setActiveImageIdx(idx)}
                        className={`tb-thumb-btn ${activeImageIdx === idx ? "tb-thumb-btn--active" : ""}`}
                      >
                        <img src={img} alt={`View ${idx + 1}`} className="tb-thumb-img" />
                      </button>
                    ))}
                  </div>
                )}

                {/* Sourcing Seal Card */}
                <div className="tb-source-card">
                  <div className="tb-source-icon">
                    <MapPin size={18} />
                  </div>
                  <div>
                    <h4 className="tb-source-title">Authentic Origin Sourced</h4>
                    <p className="tb-source-desc">
                      Harvested directly from {product.originEn || "certified organic farms & riverbanks of Bangladesh"}. Delivered same-day in chilled insulated packaging.
                    </p>
                  </div>
                </div>
              </div>

              {/* ── Right Column: Purchase Info & Customization ───── */}
              <div className="tb-info-column">
                {/* Vendor / Sourcing Pill */}
                <div className="tb-vendor-tag-row">
                  <div className="tb-vendor-pill">
                    <Award size={13} className="tb-vendor-icon" />
                    <span>{vendor.nameEn}</span>
                    <span className="tb-verified-dot" title="Verified Producer">
                      ✓
                    </span>
                  </div>
                  <span className="tb-harvest-badge">
                    <Clock size={12} /> Morning Catch / Harvest
                  </span>
                </div>

                {/* Title */}
                <h1 className="tb-product-title">{product.nameEn || product.nameBn}</h1>

                {/* Rating & Stock Summary */}
                <div className="tb-meta-row">
                  <div className="tb-rating-stars">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={15}
                        className={i < Math.round(product.rating || 4.9) ? "tb-star--filled" : "tb-star--empty"}
                      />
                    ))}
                    <span className="tb-rating-text">{product.rating || 4.9}</span>
                    <span className="tb-review-count">({reviews.length} customer reviews)</span>
                  </div>
                  <span className="tb-stock-pill">
                    <span className="tb-stock-indicator" /> In Stock ({product.stock} available today)
                  </span>
                </div>

                {/* Freshness Guarantee Note */}
                <div className="tb-freshness-callout">
                  <ShieldCheck size={16} className="tb-callout-icon" />
                  <span>
                    <strong>Freshness Guarantee:</strong> {product.freshnessGuaranteeEn || "Harvested at dawn, delivered cold and pristine to your kitchen."}
                  </span>
                </div>

                {/* Pricing Display */}
                <div className="tb-price-box">
                  <div className="tb-price-left">
                    <span className="tb-main-price">৳{unitPrice.toLocaleString()}</span>
                    {comparePrice && comparePrice > unitPrice && (
                      <span className="tb-compare-price">৳{comparePrice.toLocaleString()}</span>
                    )}
                    <span className="tb-unit-reference">
                      / {activeWeight.labelEn || product.baseUnit}
                    </span>
                  </div>
                  {discountPct > 0 && (
                    <div className="tb-discount-badge">
                      <span>SAVE {discountPct}% TODAY</span>
                    </div>
                  )}
                </div>

                {/* ── Weight & Portion Picker ─────────────────────── */}
                <div className="tb-customizer-block">
                  <div className="tb-customizer-header">
                    <label className="tb-customizer-label">
                      <Scale size={15} />
                      <span>Select Weight / Quantity:</span>
                    </label>
                    <span className="tb-customizer-current">
                      Selected: <strong>{activeWeight.labelEn}</strong>
                    </span>
                  </div>

                  <div className="tb-weight-chips">
                    {weightOptions.map((opt, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSelectedWeightIdx(idx)}
                        className={`tb-weight-chip ${selectedWeightIdx === idx ? "tb-weight-chip--active" : ""}`}
                      >
                        <span className="tb-chip-label">{opt.labelEn}</span>
                        <span className="tb-chip-price">
                          ৳{Math.round(product.basePrice * (opt.multiplier || 1)).toLocaleString()}
                        </span>
                        {opt.popular && <span className="tb-chip-popular">Popular</span>}
                      </button>
                    ))}
                  </div>
                </div>

                {/* ── Quantity Stepper & Action Buttons ────────────── */}
                <div className="tb-actions-card">
                  <div className="tb-qty-row">
                    <div className="tb-qty-selector">
                      <button
                        type="button"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        disabled={quantity <= 1}
                        className="tb-qty-btn"
                        aria-label="Decrease quantity"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="tb-qty-value">{quantity}</span>
                      <button
                        type="button"
                        onClick={() => setQuantity(quantity + 1)}
                        className="tb-qty-btn"
                        aria-label="Increase quantity"
                      >
                        <Plus size={14} />
                      </button>
                    </div>

                    <div className="tb-total-preview">
                      <span className="tb-total-label">Subtotal:</span>
                      <span className="tb-total-amount">৳{totalPrice.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="tb-button-group">
                    {/* Instant Buy Now */}
                    <button
                      type="button"
                      onClick={handleBuyNow}
                      className="tb-btn tb-btn--order"
                    >
                      <Zap size={16} />
                      <span>Instant Order Now — ৳{totalPrice.toLocaleString()}</span>
                    </button>

                    {/* Add to Bag + Wishlist + Share */}
                    <div className="tb-secondary-btns">
                      <button
                        type="button"
                        onClick={handleAddToCart}
                        className={`tb-btn tb-btn--bag ${addedAnimation ? "tb-btn--added" : ""}`}
                      >
                        {addedAnimation ? <Check size={16} /> : <ShoppingBag size={16} />}
                        <span>{addedAnimation ? "Added to Bag!" : "Add to Bag"}</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleToggleWishlist}
                        className={`tb-icon-btn ${isFav ? "tb-icon-btn--fav" : ""}`}
                        title={isFav ? "Remove from wishlist" : "Add to wishlist"}
                      >
                        <Heart size={18} fill={isFav ? "#EF4444" : "none"} color={isFav ? "#EF4444" : "currentColor"} />
                      </button>

                      <button
                        type="button"
                        onClick={handleShare}
                        className="tb-icon-btn"
                        title="Share this product"
                      >
                        {copiedLink ? <Check size={18} color="#10D876" /> : <Share2 size={18} />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* ── Tatka Bazar 4-Point Freshness Guarantee Bar ───── */}
                <div className="tb-trust-grid">
                  <div className="tb-trust-item">
                    <Truck size={20} className="tb-trust-icon tb-trust-icon--green" />
                    <div>
                      <h5 className="tb-trust-label">30-45 Mins Express</h5>
                      <p className="tb-trust-sub">Insulated chilled delivery</p>
                    </div>
                  </div>

                  <div className="tb-trust-item">
                    <ShieldCheck size={20} className="tb-trust-icon tb-trust-icon--blue" />
                    <div>
                      <h5 className="tb-trust-label">100% Formalin-Free</h5>
                      <p className="tb-trust-sub">Lab tested chemical-free</p>
                    </div>
                  </div>

                  <div className="tb-trust-item">
                    <Leaf size={20} className="tb-trust-icon tb-trust-icon--emerald" />
                    <div>
                      <h5 className="tb-trust-label">Direct From Source</h5>
                      <p className="tb-trust-sub">Dawn catch from river/farm</p>
                    </div>
                  </div>

                  <div className="tb-trust-item">
                    <RefreshCw size={20} className="tb-trust-icon tb-trust-icon--gold" />
                    <div>
                      <h5 className="tb-trust-label">Doorstep Quality Check</h5>
                      <p className="tb-trust-sub">Inspect before accepting</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Product Specifications & Details Tabs ─────────────────── */}
        <section className="tb-details-section">
          <div className="tb-container">
            <div className="tb-section-header">
              <h2 className="tb-section-heading">Product Details & Culinary Story</h2>
              <p className="tb-section-subheading">
                Authentic sourcing, nutritional profile, and preservation tips from Tatka Bazar specialists.
              </p>
            </div>

            <div className="tb-accordions-card">
              {/* Accordion 1: Freshness & Sourcing */}
              <div className="tb-accordion-item">
                <button
                  type="button"
                  onClick={() => toggleAccordion("freshness")}
                  className="tb-accordion-trigger"
                >
                  <span className="tb-accordion-title">
                    <Leaf size={16} className="tb-acc-icon" /> Sourcing Origin & Freshness Guarantee
                  </span>
                  <ChevronDown
                    size={16}
                    className={`tb-chevron ${openAccordions.freshness ? "tb-chevron--open" : ""}`}
                  />
                </button>
                {openAccordions.freshness && (
                  <div className="tb-accordion-body">
                    <div className="tb-specs-2col">
                      <div className="tb-spec-point">
                        <span className="tb-point-label">Harvest & Catch Location:</span>
                        <span className="tb-point-val">{product.originEn || "Chandpur River Estuary, Padma River"}</span>
                      </div>
                      <div className="tb-spec-point">
                        <span className="tb-point-label">Daily Harvest Timing:</span>
                        <span className="tb-point-val">Dawn harvest between 4:00 AM – 6:00 AM today</span>
                      </div>
                      <div className="tb-spec-point">
                        <span className="tb-point-label">Transit & Cold Chain:</span>
                        <span className="tb-point-val">Transported strictly in insulated food-grade crates at 0–4°C</span>
                      </div>
                      <div className="tb-spec-point">
                        <span className="tb-point-label">Chemical & Formalin Inspection:</span>
                        <span className="tb-point-val">100% Certified Formalin-Free & zero harmful preservatives</span>
                      </div>
                    </div>
                    <p className="tb-body-desc">{product.descriptionEn || product.descriptionBn}</p>
                  </div>
                )}
              </div>

              {/* Accordion 2: Nutrition Facts */}
              <div className="tb-accordion-item">
                <button
                  type="button"
                  onClick={() => toggleAccordion("nutrition")}
                  className="tb-accordion-trigger"
                >
                  <span className="tb-accordion-title">
                    <Sparkles size={16} className="tb-acc-icon" /> Nutritional Value & Health Benefits
                  </span>
                  <ChevronDown
                    size={16}
                    className={`tb-chevron ${openAccordions.nutrition ? "tb-chevron--open" : ""}`}
                  />
                </button>
                {openAccordions.nutrition && (
                  <div className="tb-accordion-body">
                    <div className="tb-nutrition-grid">
                      <div className="tb-nutri-card">
                        <span className="tb-nutri-val">{product.nutritionInfo?.calories || "285 kcal"}</span>
                        <span className="tb-nutri-name">Energy (per 100g)</span>
                      </div>
                      <div className="tb-nutri-card">
                        <span className="tb-nutri-val">{product.nutritionInfo?.protein || "22.5g"}</span>
                        <span className="tb-nutri-name">Pure Protein</span>
                      </div>
                      <div className="tb-nutri-card">
                        <span className="tb-nutri-val">{product.nutritionInfo?.fat || "19.4g (Omega-3)"}</span>
                        <span className="tb-nutri-name">Healthy Lipids</span>
                      </div>
                      <div className="tb-nutri-card">
                        <span className="tb-nutri-val">{product.nutritionInfo?.carbs || "0.2g"}</span>
                        <span className="tb-nutri-name">Carbohydrates</span>
                      </div>
                    </div>
                    <p className="tb-body-desc">
                      Naturally rich in essential heart-healthy Omega-3 fatty acids, vital amino acids, and minerals that boost natural immunity and cardiovascular wellness.
                    </p>
                  </div>
                )}
              </div>

              {/* Accordion 3: Storage & Preservation */}
              <div className="tb-accordion-item">
                <button
                  type="button"
                  onClick={() => toggleAccordion("storage")}
                  className="tb-accordion-trigger"
                >
                  <span className="tb-accordion-title">
                    <Clock size={16} className="tb-acc-icon" /> Storage & Kitchen Preservation Tips
                  </span>
                  <ChevronDown
                    size={16}
                    className={`tb-chevron ${openAccordions.storage ? "tb-chevron--open" : ""}`}
                  />
                </button>
                {openAccordions.storage && (
                  <div className="tb-accordion-body">
                    <ul className="tb-tips-list">
                      <li>
                        <strong>Short-Term Chilling:</strong> Store in the coldest section of your refrigerator (0°C to 2°C) and consume within 24 to 48 hours for the most delectable natural taste.
                      </li>
                      <li>
                        <strong>Freezer Preservation:</strong> Rub lightly with turmeric and rock salt, place inside an airtight freezer-safe ziplock bag, and freeze at -18°C.
                      </li>
                      <li>
                        <strong>Vegetables & Fruits:</strong> Keep leafy greens wrapped loosely in a damp cotton towel in the crisper drawer to preserve crispness.
                      </li>
                    </ul>
                  </div>
                )}
              </div>

              {/* Accordion 4: Traditional Bengali Cooking */}
              <div className="tb-accordion-item">
                <button
                  type="button"
                  onClick={() => toggleAccordion("cooking")}
                  className="tb-accordion-trigger"
                >
                  <span className="tb-accordion-title">
                    <Utensils size={16} className="tb-acc-icon" /> Traditional Culinary Pairings & Recipes
                  </span>
                  <ChevronDown
                    size={16}
                    className={`tb-chevron ${openAccordions.cooking ? "tb-chevron--open" : ""}`}
                  />
                </button>
                {openAccordions.cooking && (
                  <div className="tb-accordion-body">
                    <div className="tb-recipe-box">
                      <h4 className="tb-recipe-title">Chef’s Authentic Bengali Preparation Recommendation:</h4>
                      <p className="tb-recipe-text">
                        {isFishOrMeat
                          ? "Best prepared as classic Shorshe Ilish (Mustard Hilsa Curry) with cold-pressed Kachi Ghani mustard oil, slit green chilies, and freshly ground yellow mustard paste. Also excellent for Bhapa (steamed) or crispy pan-fry with steaming Kataribhog polao rice."
                          : "Cook with pure cold-pressed mustard oil, panch phoron spices, and freshly ground turmeric. Pairs perfectly with warm steamed rice and thick lentil dal."}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ── Customer Reviews Section ──────────────────────────────── */}
        <section className="tb-reviews-section">
          <div className="tb-container">
            <div className="tb-reviews-grid">
              {/* Rating Summary Box */}
              <div className="tb-rating-card">
                <h3 className="tb-card-title">Customer Feedback</h3>
                <div className="tb-score-display">
                  <span className="tb-big-score">{product.rating || "4.9"}</span>
                  <div>
                    <div className="tb-stars-row">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={16} fill="#F5C842" color="#F5C842" />
                      ))}
                    </div>
                    <p className="tb-score-sub">{reviews.length} Verified Buyers</p>
                  </div>
                </div>

                {/* Rating Breakdown */}
                <div className="tb-bars-list">
                  {[
                    { star: 5, pct: 92 },
                    { star: 4, pct: 6 },
                    { star: 3, pct: 2 },
                    { star: 2, pct: 0 },
                    { star: 1, pct: 0 },
                  ].map((row) => (
                    <div key={row.star} className="tb-bar-row">
                      <span className="tb-bar-num">{row.star}★</span>
                      <div className="tb-bar-track">
                        <div className="tb-bar-fill" style={{ width: `${row.pct}%` }} />
                      </div>
                      <span className="tb-bar-pct">{row.pct}%</span>
                    </div>
                  ))}
                </div>

                <div className="tb-rating-promise">
                  <CheckCircle2 size={16} color="#10D876" />
                  <span>100% of customers recommend Tatka Bazar fresh quality</span>
                </div>
              </div>

              {/* Reviews List & Write Review */}
              <div className="tb-reviews-list-col">
                <div className="tb-reviews-container">
                  {reviews.map((rev) => (
                    <div key={rev.id} className="tb-review-item">
                      <div className="tb-review-header">
                        <div>
                          <p className="tb-reviewer-name">
                            {rev.author}
                            <span className="tb-verified-tag">✓ Verified Purchase</span>
                          </p>
                          <div className="tb-review-stars">
                            {[...Array(rev.rating)].map((_, i) => (
                              <Star key={i} size={13} fill="#F5C842" color="#F5C842" />
                            ))}
                          </div>
                        </div>
                        <span className="tb-review-date">{rev.date}</span>
                      </div>
                      <p className="tb-review-text">&ldquo;{rev.comment}&rdquo;</p>
                    </div>
                  ))}
                </div>

                {/* Write a Review Box */}
                <div className="tb-write-card">
                  <h4 className="tb-write-title">Write a Product Review</h4>
                  {reviewSubmitted && (
                    <div className="tb-success-msg">
                      ✓ Thank you! Your review has been posted to the Tatka community.
                    </div>
                  )}
                  <form onSubmit={handlePostReview} className="tb-review-form">
                    <div className="tb-form-row">
                      <input
                        type="text"
                        placeholder="Your Full Name"
                        required
                        value={reviewName}
                        onChange={(e) => setReviewName(e.target.value)}
                        className="tb-input"
                      />
                      <select
                        value={reviewRating}
                        onChange={(e) => setReviewRating(Number(e.target.value))}
                        className="tb-input"
                      >
                        <option value="5">⭐⭐⭐⭐⭐ — 5 Stars (Outstanding)</option>
                        <option value="4">⭐⭐⭐⭐ — 4 Stars (Very Fresh)</option>
                        <option value="3">⭐⭐⭐ — 3 Stars (Satisfactory)</option>
                        <option value="2">⭐⭐ — 2 Stars (Average)</option>
                        <option value="1">⭐ — 1 Star (Below Expectations)</option>
                      </select>
                    </div>
                    <textarea
                      rows={3}
                      placeholder="Share your experience with product freshness, river aroma, taste, and delivery..."
                      required
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      className="tb-input"
                    />
                    <button type="submit" className="tb-btn tb-btn--submit">
                      Post Review <ArrowRight size={14} />
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Community Questions & Answers ─────────────────────────── */}
        <section className="tb-qa-section">
          <div className="tb-container">
            <div className="tb-section-header">
              <h2 className="tb-section-heading">Questions & Answers</h2>
              <p className="tb-section-subheading">
                Have questions about custom cutting, morning delivery, or storage? Ask our Tatka team!
              </p>
            </div>

            <div className="tb-qa-grid">
              {/* Left: Ask Form */}
              <div className="tb-ask-card">
                <h4 className="tb-ask-title">Ask Our Freshness Team</h4>
                {questionSubmitted && (
                  <div className="tb-success-msg">
                    ✓ Your question has been submitted! Our team will respond shortly.
                  </div>
                )}
                <form onSubmit={handlePostQuestion} className="tb-qa-form">
                  <textarea
                    rows={3}
                    placeholder="Ask about cutting options, morning delivery slots, packaging..."
                    required
                    value={newQuestionText}
                    onChange={(e) => setNewQuestionText(e.target.value)}
                    className="tb-input"
                  />
                  <button type="submit" className="tb-btn tb-btn--submit" style={{ width: "100%" }}>
                    Submit Question
                  </button>
                </form>
              </div>

              {/* Right: Answered Questions */}
              <div className="tb-qa-list">
                {questions.map((q) => (
                  <div key={q.id} className="tb-qa-card">
                    <div className="tb-qa-q-row">
                      <span className="tb-qa-badge">Q:</span>
                      <h5 className="tb-qa-question">{q.question}</h5>
                    </div>
                    <p className="tb-qa-meta">Asked by {q.askedBy} on {q.date}</p>
                    {q.answer ? (
                      <div className="tb-qa-answer-box">
                        <div className="tb-qa-a-row">
                          <span className="tb-qa-ans-badge">A:</span>
                          <p className="tb-qa-answer">{q.answer}</p>
                        </div>
                        <span className="tb-qa-expert">
                          ✓ Answered by {q.answeredBy || "Tatka Bazar Freshness Team"}
                        </span>
                      </div>
                    ) : (
                      <div className="tb-qa-pending">
                        ⌛ Question is pending response from our market specialists.
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Related Fresh Products ("You May Also Like") ─────────── */}
        <section className="tb-related-section">
          <div className="tb-container">
            <div className="tb-related-header">
              <div>
                <h2 className="tb-section-heading">Frequently Bought Together</h2>
                <p className="tb-section-subheading">
                  Fresh essentials from the morning harvest that pair perfectly with this item.
                </p>
              </div>
              <Link href={`/category/${product.categorySlug}`} className="tb-view-all-link">
                View All in {product.categoryNameEn || "Category"} <ArrowRight size={14} />
              </Link>
            </div>

            <div className="tb-related-grid">
              {relatedProducts.map((rel) => (
                <ProductCard key={rel.id} product={rel} />
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* ── Scoped Styling with Tatka Bazar Design System ─────────── */}
      <style jsx global>{`
        .tb-pdp-root {
          background: #08090B;
          color: #F0F2F7;
          min-height: 100vh;
          font-family: 'Sora', system-ui, sans-serif;
        }

        .tb-container {
          max-width: 1240px;
          margin: 0 auto;
          padding: 0 24px;
        }

        @media (max-width: 640px) {
          .tb-container {
            padding: 0 16px;
          }
        }

        /* ── Breadcrumbs ── */
        .tb-breadcrumb-wrapper {
          background: #0B0E14;
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
          padding: 14px 0;
        }

        .tb-breadcrumb {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.82rem;
          color: #7E8899;
          flex-wrap: wrap;
        }

        .tb-crumb-link {
          color: #A0AEC0;
          text-decoration: none;
          transition: color 0.15s ease;
        }

        .tb-crumb-link:hover {
          color: #10D876;
        }

        .tb-crumb-sep {
          color: #4A5568;
        }

        .tb-crumb-active {
          color: #F0F2F7;
          font-weight: 600;
        }

        /* ── Main Layout Grid ── */
        .tb-main-section {
          padding: 44px 0 64px 0;
        }

        .tb-main-grid {
          display: grid;
          grid-template-columns: 1.05fr 1fr;
          gap: 52px;
          align-items: start;
        }

        @media (max-width: 960px) {
          .tb-main-grid {
            grid-template-columns: 1fr;
            gap: 36px;
          }
        }

        /* ── Gallery ── */
        .tb-gallery-column {
          display: flex;
          flex-direction: column;
          gap: 16px;
          position: sticky;
          top: 100px;
        }

        @media (max-width: 960px) {
          .tb-gallery-column {
            position: static;
          }
        }

        .tb-main-image-card {
          position: relative;
          aspect-ratio: 1 / 1;
          border-radius: 20px;
          overflow: hidden;
          background: #0E1117;
          border: 1px solid rgba(255, 255, 255, 0.08);
          cursor: zoom-in;
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.5);
        }

        .tb-main-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .tb-badge-stack {
          position: absolute;
          top: 16px;
          left: 16px;
          display: flex;
          flex-direction: column;
          gap: 6px;
          z-index: 5;
        }

        .tb-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 5px 12px;
          border-radius: 999px;
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.03em;
          text-transform: uppercase;
          backdrop-filter: blur(10px);
        }

        .tb-badge--green {
          background: rgba(16, 216, 118, 0.9);
          color: #08090B;
        }

        .tb-badge--gold {
          background: rgba(245, 200, 66, 0.95);
          color: #08090B;
        }

        .tb-badge--red {
          background: rgba(255, 77, 109, 0.95);
          color: #ffffff;
        }

        .tb-zoom-hint {
          position: absolute;
          bottom: 14px;
          right: 14px;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(8, 9, 11, 0.75);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #C8CDD9;
          padding: 4px 10px;
          border-radius: 999px;
          font-size: 0.72rem;
          pointer-events: none;
        }

        .tb-thumbnail-row {
          display: flex;
          gap: 12px;
          overflow-x: auto;
          padding-bottom: 6px;
        }

        .tb-thumb-btn {
          width: 76px;
          height: 76px;
          border-radius: 12px;
          overflow: hidden;
          background: #0E1117;
          border: 2px solid transparent;
          padding: 0;
          cursor: pointer;
          flex-shrink: 0;
          transition: all 0.2s ease;
        }

        .tb-thumb-btn--active {
          border-color: #10D876;
          box-shadow: 0 0 16px rgba(16, 216, 118, 0.35);
        }

        .tb-thumb-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .tb-source-card {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          background: #0E1117;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 14px;
          padding: 14px 16px;
        }

        .tb-source-icon {
          color: #10D876;
          background: rgba(16, 216, 118, 0.1);
          border-radius: 8px;
          padding: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .tb-source-title {
          font-size: 0.88rem;
          font-weight: 700;
          color: #F0F2F7;
          margin: 0 0 4px 0;
        }

        .tb-source-desc {
          font-size: 0.78rem;
          color: #94A3B8;
          line-height: 1.5;
          margin: 0;
        }

        /* ── Info Column ── */
        .tb-info-column {
          display: flex;
          flex-direction: column;
        }

        .tb-vendor-tag-row {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 12px;
          flex-wrap: wrap;
        }

        .tb-vendor-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 12px;
          border-radius: 999px;
          background: rgba(16, 216, 118, 0.1);
          border: 1px solid rgba(16, 216, 118, 0.25);
          color: #10D876;
          font-size: 0.78rem;
          font-weight: 700;
        }

        .tb-verified-dot {
          background: #10D876;
          color: #08090B;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 9px;
          font-weight: 900;
        }

        .tb-harvest-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: 0.76rem;
          color: #F5C842;
          background: rgba(245, 200, 66, 0.1);
          border: 1px solid rgba(245, 200, 66, 0.2);
          padding: 4px 10px;
          border-radius: 999px;
          font-weight: 600;
        }

        .tb-product-title {
          font-size: clamp(1.6rem, 2.5vw, 2.25rem);
          font-weight: 800;
          color: #F0F2F7;
          letter-spacing: -0.02em;
          margin: 0 0 12px 0;
          line-height: 1.25;
        }

        .tb-meta-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-bottom: 18px;
          margin-bottom: 18px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          flex-wrap: wrap;
          gap: 12px;
        }

        .tb-rating-stars {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .tb-star--filled {
          fill: #F5C842;
          color: #F5C842;
        }

        .tb-star--empty {
          color: #4A5568;
        }

        .tb-rating-text {
          font-weight: 800;
          color: #F0F2F7;
          margin-left: 6px;
          font-size: 0.9rem;
        }

        .tb-review-count {
          color: #7E8899;
          font-size: 0.82rem;
          margin-left: 4px;
        }

        .tb-stock-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 0.78rem;
          color: #10D876;
          font-weight: 700;
        }

        .tb-stock-indicator {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #10D876;
          box-shadow: 0 0 8px #10D876;
        }

        .tb-freshness-callout {
          display: flex;
          align-items: center;
          gap: 10px;
          background: rgba(16, 216, 118, 0.07);
          border-left: 3px solid #10D876;
          padding: 10px 14px;
          border-radius: 0 8px 8px 0;
          margin-bottom: 22px;
          font-size: 0.84rem;
          color: #D1D5DB;
        }

        .tb-callout-icon {
          color: #10D876;
          flex-shrink: 0;
        }

        /* ── Price Box ── */
        .tb-price-box {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: #0E1117;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 14px;
          padding: 16px 20px;
          margin-bottom: 24px;
        }

        .tb-price-left {
          display: flex;
          align-items: baseline;
          gap: 10px;
        }

        .tb-main-price {
          font-size: 2.1rem;
          font-weight: 900;
          color: #10D876;
          line-height: 1;
        }

        .tb-compare-price {
          font-size: 1.15rem;
          color: #7E8899;
          text-decoration: line-through;
          font-weight: 500;
        }

        .tb-unit-reference {
          font-size: 0.85rem;
          color: #94A3B8;
          font-weight: 600;
        }

        .tb-discount-badge {
          background: rgba(255, 77, 109, 0.15);
          border: 1px solid rgba(255, 77, 109, 0.3);
          color: #FF4D6D;
          font-size: 0.72rem;
          font-weight: 800;
          padding: 4px 10px;
          border-radius: 999px;
          letter-spacing: 0.05em;
        }

        /* ── Weight Chips ── */
        .tb-customizer-block {
          margin-bottom: 20px;
        }

        .tb-customizer-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 10px;
        }

        .tb-customizer-label {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.85rem;
          font-weight: 700;
          color: #F0F2F7;
        }

        .tb-customizer-current {
          font-size: 0.8rem;
          color: #A0AEC0;
        }

        .tb-free-tag {
          font-size: 0.7rem;
          color: #10D876;
          background: rgba(16, 216, 118, 0.12);
          padding: 2px 8px;
          border-radius: 999px;
          font-weight: 700;
          text-transform: uppercase;
        }

        .tb-weight-chips {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
          gap: 10px;
        }

        .tb-weight-chip {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 10px 12px;
          border-radius: 12px;
          background: #0E1117;
          border: 1.5px solid rgba(255, 255, 255, 0.1);
          color: #F0F2F7;
          cursor: pointer;
          transition: all 0.2s ease;
          position: relative;
        }

        .tb-weight-chip:hover {
          border-color: rgba(16, 216, 118, 0.4);
          background: #131720;
        }

        .tb-weight-chip--active {
          border-color: #10D876 !important;
          background: rgba(16, 216, 118, 0.08) !important;
          box-shadow: 0 0 16px rgba(16, 216, 118, 0.2);
        }

        .tb-chip-label {
          font-size: 0.88rem;
          font-weight: 800;
          margin-bottom: 2px;
        }

        .tb-chip-price {
          font-size: 0.78rem;
          color: #10D876;
          font-weight: 700;
        }

        .tb-chip-popular {
          position: absolute;
          top: -7px;
          right: 8px;
          background: #F5C842;
          color: #08090B;
          font-size: 0.62rem;
          font-weight: 900;
          text-transform: uppercase;
          padding: 1px 6px;
          border-radius: 999px;
        }

        /* ── Cutting Options ── */
        .tb-cut-options {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
        }

        @media (max-width: 500px) {
          .tb-cut-options {
            grid-template-columns: 1fr;
          }
        }

        .tb-cut-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 9px 12px;
          border-radius: 10px;
          background: #0E1117;
          border: 1px solid rgba(255, 255, 255, 0.08);
          color: #C8CDD9;
          font-size: 0.8rem;
          font-weight: 600;
          text-align: left;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .tb-cut-btn:hover {
          background: #131720;
          border-color: rgba(255, 255, 255, 0.2);
        }

        .tb-cut-btn--active {
          border-color: #10D876 !important;
          background: rgba(16, 216, 118, 0.07) !important;
          color: #10D876 !important;
        }

        .tb-cut-check {
          color: #10D876;
          font-weight: 800;
        }

        /* ── Tiered Pricing Box ── */
        .tb-tiered-box {
          background: rgba(245, 200, 66, 0.06);
          border: 1px dashed rgba(245, 200, 66, 0.3);
          border-radius: 12px;
          padding: 10px 14px;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 8px;
        }

        .tb-tiered-badge {
          font-size: 0.72rem;
          font-weight: 800;
          text-transform: uppercase;
          color: #F5C842;
        }

        .tb-tiered-list {
          font-size: 0.78rem;
          color: #E2E8F0;
        }

        /* ── Actions Card ── */
        .tb-actions-card {
          background: #0E1117;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          padding: 18px;
          margin-bottom: 24px;
        }

        .tb-qty-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
        }

        .tb-qty-selector {
          display: flex;
          align-items: center;
          background: #131720;
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 10px;
          padding: 4px;
        }

        .tb-qty-btn {
          width: 34px;
          height: 34px;
          border-radius: 8px;
          background: transparent;
          border: none;
          color: #F0F2F7;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background 0.15s ease;
        }

        .tb-qty-btn:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.1);
        }

        .tb-qty-btn:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }

        .tb-qty-value {
          width: 38px;
          text-align: center;
          font-weight: 800;
          font-size: 1rem;
          color: #F0F2F7;
        }

        .tb-total-preview {
          text-align: right;
        }

        .tb-total-label {
          font-size: 0.78rem;
          color: #7E8899;
          margin-right: 6px;
        }

        .tb-total-amount {
          font-size: 1.35rem;
          font-weight: 900;
          color: #10D876;
        }

        .tb-button-group {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .tb-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          height: 50px;
          border-radius: 12px;
          font-size: 0.92rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          border: none;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .tb-btn--order {
          background: linear-gradient(135deg, #10D876 0%, #059E57 100%);
          color: #08090B;
          box-shadow: 0 6px 20px rgba(16, 216, 118, 0.35);
        }

        .tb-btn--order:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 28px rgba(16, 216, 118, 0.5);
        }

        .tb-secondary-btns {
          display: flex;
          gap: 10px;
        }

        .tb-btn--bag {
          flex: 1;
          background: #131720;
          border: 1.5px solid rgba(255, 255, 255, 0.15);
          color: #F0F2F7;
        }

        .tb-btn--bag:hover {
          background: #1A2030;
          border-color: #10D876;
          color: #10D876;
        }

        .tb-btn--added {
          background: rgba(16, 216, 118, 0.15) !important;
          border-color: #10D876 !important;
          color: #10D876 !important;
        }

        .tb-icon-btn {
          width: 50px;
          height: 50px;
          border-radius: 12px;
          background: #131720;
          border: 1.5px solid rgba(255, 255, 255, 0.15);
          color: #94A3B8;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.15s ease;
          flex-shrink: 0;
        }

        .tb-icon-btn:hover {
          border-color: #10D876;
          color: #10D876;
        }

        .tb-icon-btn--fav {
          border-color: rgba(239, 68, 68, 0.4) !important;
          background: rgba(239, 68, 68, 0.08) !important;
        }

        /* ── Trust Grid ── */
        .tb-trust-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        @media (max-width: 500px) {
          .tb-trust-grid {
            grid-template-columns: 1fr;
          }
        }

        .tb-trust-item {
          display: flex;
          align-items: center;
          gap: 10px;
          background: #0E1117;
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 12px;
          padding: 12px 14px;
        }

        .tb-trust-icon {
          flex-shrink: 0;
        }

        .tb-trust-icon--green {
          color: #10D876;
        }

        .tb-trust-icon--blue {
          color: #4F9EFF;
        }

        .tb-trust-icon--emerald {
          color: #34D399;
        }

        .tb-trust-icon--gold {
          color: #F5C842;
        }

        .tb-trust-label {
          font-size: 0.82rem;
          font-weight: 800;
          color: #F0F2F7;
          margin: 0 0 2px 0;
        }

        .tb-trust-sub {
          font-size: 0.72rem;
          color: #7E8899;
          margin: 0;
        }

        /* ── Accordions & Details ── */
        .tb-details-section {
          padding: 60px 0;
          background: #0B0E14;
          border-top: 1px solid rgba(255, 255, 255, 0.06);
        }

        .tb-section-header {
          margin-bottom: 28px;
        }

        .tb-section-heading {
          font-size: clamp(1.4rem, 2.2vw, 1.85rem);
          font-weight: 800;
          color: #F0F2F7;
          letter-spacing: -0.02em;
          margin: 0 0 6px 0;
        }

        .tb-section-subheading {
          font-size: 0.86rem;
          color: #7E8899;
          margin: 0;
        }

        .tb-accordions-card {
          background: #0E1117;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 18px;
          overflow: hidden;
        }

        .tb-accordion-item {
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
        }

        .tb-accordion-item:last-child {
          border-bottom: none;
        }

        .tb-accordion-trigger {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 18px 24px;
          background: transparent;
          border: none;
          color: #F0F2F7;
          cursor: pointer;
          text-align: left;
          transition: background 0.15s ease;
        }

        .tb-accordion-trigger:hover {
          background: rgba(255, 255, 255, 0.02);
        }

        .tb-accordion-title {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 0.95rem;
          font-weight: 800;
        }

        .tb-acc-icon {
          color: #10D876;
        }

        .tb-chevron {
          color: #7E8899;
          transition: transform 0.25s ease;
        }

        .tb-chevron--open {
          transform: rotate(180deg);
          color: #10D876;
        }

        .tb-accordion-body {
          padding: 0 24px 22px 24px;
          font-size: 0.88rem;
          color: #C8CDD9;
          line-height: 1.7;
        }

        .tb-specs-2col {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-bottom: 16px;
        }

        @media (max-width: 640px) {
          .tb-specs-2col {
            grid-template-columns: 1fr;
          }
        }

        .tb-spec-point {
          background: #131720;
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 10px;
          padding: 12px 14px;
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .tb-point-label {
          font-size: 0.74rem;
          font-weight: 700;
          color: #7E8899;
          text-transform: uppercase;
        }

        .tb-point-val {
          font-size: 0.88rem;
          font-weight: 700;
          color: #F0F2F7;
        }

        .tb-body-desc {
          font-size: 0.88rem;
          color: #A0AEC0;
          line-height: 1.7;
          margin: 0;
        }

        .tb-nutrition-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
          margin-bottom: 16px;
        }

        @media (max-width: 640px) {
          .tb-nutrition-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        .tb-nutri-card {
          background: #131720;
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 12px;
          padding: 14px;
          text-align: center;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .tb-nutri-val {
          font-size: 1.15rem;
          font-weight: 900;
          color: #10D876;
        }

        .tb-nutri-name {
          font-size: 0.72rem;
          font-weight: 700;
          color: #7E8899;
          text-transform: uppercase;
        }

        .tb-tips-list {
          padding-left: 18px;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .tb-recipe-box {
          background: rgba(16, 216, 118, 0.05);
          border: 1px solid rgba(16, 216, 118, 0.2);
          border-radius: 12px;
          padding: 16px 20px;
        }

        .tb-recipe-title {
          font-size: 0.9rem;
          font-weight: 800;
          color: #10D876;
          margin: 0 0 8px 0;
        }

        .tb-recipe-text {
          font-size: 0.86rem;
          color: #E2E8F0;
          line-height: 1.65;
          margin: 0;
        }

        /* ── Reviews Section ── */
        .tb-reviews-section {
          padding: 64px 0;
          border-top: 1px solid rgba(255, 255, 255, 0.06);
        }

        .tb-reviews-grid {
          display: grid;
          grid-template-columns: 320px 1fr;
          gap: 44px;
        }

        @media (max-width: 900px) {
          .tb-reviews-grid {
            grid-template-columns: 1fr;
            gap: 32px;
          }
        }

        .tb-rating-card {
          background: #0E1117;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 18px;
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .tb-card-title {
          font-size: 1.15rem;
          font-weight: 800;
          color: #F0F2F7;
          margin: 0;
        }

        .tb-score-display {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .tb-big-score {
          font-size: 3.2rem;
          font-weight: 900;
          color: #F0F2F7;
          line-height: 1;
        }

        .tb-stars-row {
          display: flex;
          gap: 2px;
          margin-bottom: 4px;
        }

        .tb-score-sub {
          font-size: 0.78rem;
          color: #7E8899;
          margin: 0;
        }

        .tb-bars-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .tb-bar-row {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.78rem;
          color: #7E8899;
        }

        .tb-bar-num {
          width: 24px;
          font-weight: 700;
        }

        .tb-bar-track {
          flex: 1;
          height: 6px;
          background: #1A2030;
          border-radius: 999px;
          overflow: hidden;
        }

        .tb-bar-fill {
          height: 100%;
          background: #10D876;
          border-radius: 999px;
        }

        .tb-bar-pct {
          width: 32px;
          text-align: right;
        }

        .tb-rating-promise {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.78rem;
          color: #10D876;
          font-weight: 700;
          background: rgba(16, 216, 118, 0.08);
          padding: 10px 12px;
          border-radius: 8px;
        }

        .tb-reviews-container {
          display: flex;
          flex-direction: column;
          gap: 14px;
          margin-bottom: 32px;
        }

        .tb-review-item {
          background: #0E1117;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 14px;
          padding: 20px;
        }

        .tb-review-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 10px;
        }

        .tb-reviewer-name {
          font-size: 0.92rem;
          font-weight: 800;
          color: #F0F2F7;
          margin: 0 0 4px 0;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .tb-verified-tag {
          font-size: 0.68rem;
          font-weight: 700;
          color: #10D876;
          background: rgba(16, 216, 118, 0.12);
          padding: 2px 6px;
          border-radius: 999px;
        }

        .tb-review-stars {
          display: flex;
          gap: 2px;
        }

        .tb-review-date {
          font-size: 0.76rem;
          color: #7E8899;
        }

        .tb-review-text {
          font-size: 0.88rem;
          color: #C8CDD9;
          line-height: 1.65;
          margin: 0;
          font-style: italic;
        }

        .tb-write-card {
          background: #0E1117;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 16px;
          padding: 22px;
        }

        .tb-write-title {
          font-size: 1.05rem;
          font-weight: 800;
          color: #F0F2F7;
          margin: 0 0 16px 0;
        }

        .tb-review-form {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .tb-form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        @media (max-width: 600px) {
          .tb-form-row {
            grid-template-columns: 1fr;
          }
        }

        .tb-input {
          width: 100%;
          background: #131720;
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 10px;
          padding: 10px 14px;
          font-size: 0.85rem;
          color: #F0F2F7;
          font-family: inherit;
          outline: none;
          transition: border-color 0.2s ease;
        }

        .tb-input:focus {
          border-color: #10D876;
        }

        .tb-btn--submit {
          align-self: flex-start;
          background: #10D876;
          color: #08090B;
          padding: 0 24px;
          height: 42px;
          font-size: 0.82rem;
        }

        .tb-btn--submit:hover {
          background: #0DC968;
        }

        .tb-success-msg {
          background: rgba(16, 216, 118, 0.12);
          border: 1px solid rgba(16, 216, 118, 0.3);
          color: #10D876;
          padding: 10px 14px;
          border-radius: 8px;
          font-size: 0.82rem;
          font-weight: 700;
          margin-bottom: 12px;
        }

        /* ── Q&A ── */
        .tb-qa-section {
          padding: 60px 0;
          background: #0B0E14;
          border-top: 1px solid rgba(255, 255, 255, 0.06);
        }

        .tb-qa-grid {
          display: grid;
          grid-template-columns: 320px 1fr;
          gap: 44px;
        }

        @media (max-width: 900px) {
          .tb-qa-grid {
            grid-template-columns: 1fr;
            gap: 32px;
          }
        }

        .tb-ask-card {
          background: #0E1117;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 16px;
          padding: 22px;
          height: fit-content;
        }

        .tb-ask-title {
          font-size: 1.05rem;
          font-weight: 800;
          color: #F0F2F7;
          margin: 0 0 14px 0;
        }

        .tb-qa-form {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .tb-qa-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .tb-qa-card {
          background: #0E1117;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 14px;
          padding: 20px;
        }

        .tb-qa-q-row {
          display: flex;
          align-items: baseline;
          gap: 8px;
          margin-bottom: 6px;
        }

        .tb-qa-badge {
          font-weight: 900;
          color: #10D876;
          font-size: 0.95rem;
        }

        .tb-qa-question {
          font-size: 0.95rem;
          font-weight: 800;
          color: #F0F2F7;
          margin: 0;
        }

        .tb-qa-meta {
          font-size: 0.74rem;
          color: #7E8899;
          margin: 0 0 12px 24px;
        }

        .tb-qa-answer-box {
          background: #131720;
          border-left: 3px solid #10D876;
          border-radius: 0 10px 10px 0;
          padding: 12px 16px;
          margin-left: 24px;
        }

        .tb-qa-a-row {
          display: flex;
          align-items: baseline;
          gap: 8px;
          margin-bottom: 6px;
        }

        .tb-qa-ans-badge {
          font-weight: 900;
          color: #10D876;
          font-size: 0.9rem;
        }

        .tb-qa-answer {
          font-size: 0.85rem;
          color: #C8CDD9;
          line-height: 1.6;
          margin: 0;
        }

        .tb-qa-expert {
          font-size: 0.74rem;
          color: #10D876;
          font-weight: 700;
        }

        .tb-qa-pending {
          margin-left: 24px;
          font-size: 0.8rem;
          color: #7E8899;
          font-style: italic;
        }

        /* ── Related Section ── */
        .tb-related-section {
          padding: 68px 0;
          border-top: 1px solid rgba(255, 255, 255, 0.06);
        }

        .tb-related-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          margin-bottom: 32px;
          flex-wrap: wrap;
          gap: 16px;
        }

        .tb-view-all-link {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          color: #10D876;
          font-size: 0.84rem;
          font-weight: 700;
          text-decoration: none;
          padding: 6px 14px;
          border-radius: 999px;
          background: rgba(16, 216, 118, 0.08);
          border: 1px solid rgba(16, 216, 118, 0.2);
          transition: all 0.2s ease;
        }

        .tb-view-all-link:hover {
          background: rgba(16, 216, 118, 0.16);
          transform: translateX(2px);
        }

        .tb-related-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
        }

        @media (max-width: 1024px) {
          .tb-related-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 16px;
          }
        }

        @media (max-width: 580px) {
          .tb-related-grid {
            grid-template-columns: 1fr;
            gap: 14px;
          }
        }
      `}</style>
    </>
  );
}
