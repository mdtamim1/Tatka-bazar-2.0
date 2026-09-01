"use client";

import React, { useState, use } from "react";
import Link from "next/link";
import { notFound, useRouter } from "next/navigation";
import {
  Search, Plus, Minus, Truck, RefreshCw,
  Store, ChevronRight, X, Check, ShoppingBag, Zap,
  Sparkles, ShieldCheck, Clock, MapPin, Scale
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

  // Weight Selection Mode: 'preset' vs 'custom'
  const [weightMode, setWeightMode] = useState<"preset" | "custom">("preset");

  // Preset Option State
  const defaultOption = product.weightOptions?.[0] || {
    value: 1,
    unit: product.baseUnit || "kg",
    labelBn: `১ ${product.baseUnit || "কেজি"}`,
    labelEn: `1 ${product.baseUnit || "kg"}`,
    multiplier: 1,
  };

  const [selectedWeight, setSelectedWeight] = useState<number>(defaultOption.value);
  const [selectedUnit, setSelectedUnit] = useState<string>(defaultOption.unit);
  const [multiplier, setMultiplier] = useState<number>(defaultOption.multiplier);

  // Custom Weight / Quantity State
  const [customVal, setCustomVal] = useState<string>("1.5");
  const [customUnit, setCustomUnit] = useState<string>(product.baseUnit || "kg");

  // Quantity Stepper
  const [quantity, setQuantity] = useState<number>(1);
  const [isAdded, setIsAdded] = useState(false);

  // Specifications Tab Active State (Image 5)
  const [activeSpecTab, setActiveSpecTab] = useState<string>("overview");

  // Calculate Active Price
  let activeMultiplier = multiplier;
  let finalWeight = selectedWeight;
  let finalUnit = selectedUnit;

  if (weightMode === "custom") {
    const num = parseFloat(customVal) || 1;
    finalWeight = num;
    finalUnit = customUnit;
    if (customUnit === "gm") {
      activeMultiplier = num / 1000;
    } else {
      activeMultiplier = num;
    }
  }

  const unitPrice = Math.max(1, Math.round(product.basePrice * activeMultiplier));
  const totalPrice = unitPrice * quantity;
  const compareTotal = product.comparePrice
    ? Math.round(product.comparePrice * activeMultiplier * quantity)
    : null;

  const handleSelectPreset = (opt: any) => {
    setWeightMode("preset");
    setSelectedWeight(opt.value);
    setSelectedUnit(opt.unit);
    setMultiplier(opt.multiplier || 1);
  };

  const handleCustomChange = (valStr: string) => {
    setCustomVal(valStr);
    const num = parseFloat(valStr);
    if (!isNaN(num) && num > 0) {
      if (customUnit === "gm") {
        setMultiplier(num / 1000);
      } else {
        setMultiplier(num);
      }
    }
  };

  const handleCustomUnitChange = (unit: string) => {
    setCustomUnit(unit);
    const num = parseFloat(customVal) || 1;
    if (unit === "gm") {
      setMultiplier(num / 1000);
    } else {
      setMultiplier(num);
    }
  };

  const handleAddToCart = () => {
    addItem(product, finalWeight, finalUnit as any, unitPrice, quantity);
    setIsAdded(true);
    openCart();
    setTimeout(() => setIsAdded(false), 2000);
  };

  const handleBuyItNow = () => {
    addItem(product, finalWeight, finalUnit as any, unitPrice, quantity);
    router.push("/checkout");
  };

  // Specifications Data (Shadcnblocks Image 5)
  const specTabs = [
    { id: "overview", label: "Overview" },
    { id: "freshness", label: "Freshness & Quality" },
    { id: "origin", label: "Origin & Farm Story" },
    { id: "storage", label: "Storage & Packaging" },
    { id: "nutrition", label: "Nutritional Value" },
  ];

  const getSpecRows = () => {
    switch (activeSpecTab) {
      case "freshness":
        return [
          { label: "Freshness Index", keySpec: true, value: "100% Fresh Same-Day Harvest" },
          { label: "Chemical Free", keySpec: true, value: "Zero Artificial Ripening & Preservative Free" },
          { label: "Harvest Window", keySpec: false, value: "Early morning daily (5:00 AM – 7:30 AM)" },
          { label: "Inspection", keySpec: false, value: "Multi-tier quality check at Central Sorting Hub" },
          { label: "Grading Standard", keySpec: true, value: "Grade-A Premium Export Standard" },
        ];
      case "origin":
        return [
          { label: "Direct Sourcing", keySpec: true, value: locale === "bn" ? (product.originBn || "তাতকা বাজার অংশীদার খামার") : (product.originEn || "Tatka Bazar Partner Farm") },
          { label: "Farm Location", keySpec: true, value: locale === "bn" ? (product.originBn || "সাভার ও মানিকগঞ্জ এগ্রো হাব") : (product.originEn || "Savar & Manikganj Agricultural Hub") },
          { label: "Farming Method", keySpec: false, value: "Organic soil nourishment with natural compost" },
          { label: "Farmer Support", keySpec: false, value: "Fair trade direct farmer remuneration" },
        ];
      case "storage":
        return [
          { label: "Recommended Storage", keySpec: true, value: "Cool, dry ambient temperature (15°C – 20°C)" },
          { label: "Shelf Life", keySpec: true, value: "3 – 5 Days from delivery date" },
          { label: "Eco-Friendly Pack", keySpec: false, value: "Biodegradable ventilated breathable paper box" },
          { label: "Handling", keySpec: false, value: "Chilled insulated transport vehicle" },
        ];
      case "nutrition":
        return [
          { label: "Vitamins", keySpec: true, value: "Rich in Vitamin C, Vitamin A & Potassium" },
          { label: "Dietary Suitability", keySpec: true, value: "100% Vegetarian, Vegan, Gluten-Free" },
          { label: "Antioxidants", keySpec: false, value: "High Lycopene & Essential Micronutrients" },
          { label: "Caloric Density", keySpec: false, value: "Low calorie, natural hydration dense" },
        ];
      case "overview":
      default:
        return [
          { label: "Product Category", keySpec: true, value: locale === "bn" ? product.categoryNameBn : product.categoryNameEn },
          { label: "Quality Grade", keySpec: true, value: "100% Organic (Grade-A Export Standard)" },
          { label: "Harvest Schedule", keySpec: true, value: "Daily Morning 5:00 AM Direct Pick" },
          { label: "Delivery Mode", keySpec: false, value: "Express 4-Hour Insulated Delivery" },
          { label: "Weight Customization", keySpec: false, value: "Preset packages (250g–5kg) or Custom Manual Weight" },
          { label: "Return Policy", keySpec: false, value: "Instant doorstep replacement on arrival" },
        ];
    }
  };

  return (
    <>
      <ProductJsonLd product={product} />

      <div className={styles.pageWrapper}>
        <div className={styles.container}>

          {/* ── Breadcrumb Navigation ── */}
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

          {/* ── 2-Column Product Detail Layout ── */}
          <div className={styles.productGrid}>

            {/* ── Left Column: Main Image & Gallery ── */}
            <div className={styles.galleryColumn}>
              {/* Main Image Card */}
              <div className={styles.mainImageCard}>
                <img
                  src={product.images[activeImageIdx] || product.images[0]}
                  alt={locale === "bn" ? product.nameBn : product.nameEn}
                  className={styles.mainImage}
                />

                {/* Lightbox Zoom Button */}
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

              {/* Bottom Gallery Image Thumbnails System */}
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

              {/* Price Row */}
              <div className={styles.price}>
                <span>{formatPrice(totalPrice)}</span>
                {compareTotal && compareTotal > totalPrice && (
                  <span className={styles.comparePrice}>{formatPrice(compareTotal)}</span>
                )}
              </div>

              {/* ── Weight & Custom Quantity Selector (Image 3) ── */}
              <div className={styles.weightSectionHeader}>
                <div className={styles.sizeLabel}>
                  {weightMode === "preset"
                    ? `Size: ${selectedWeight} ${selectedUnit}`
                    : `Custom Weight: ${finalWeight} ${finalUnit}`}
                </div>

                {/* Toggle to manual custom input */}
                <button
                  type="button"
                  onClick={() => setWeightMode(weightMode === "preset" ? "custom" : "preset")}
                  className={styles.customToggleBtn}
                >
                  <Scale size={14} />
                  <span>
                    {weightMode === "preset"
                      ? (locale === "bn" ? "কাস্টম পরিমাণ লিখুন ✎" : "Type Custom Weight ✎")
                      : (locale === "bn" ? "প্রিসেট অপশন দেখুন" : "Back to Presets")}
                  </span>
                </button>
              </div>

              {weightMode === "preset" ? (
                /* Preset Weight Chips */
                <div className={styles.sizeChipsRow}>
                  {product.weightOptions && product.weightOptions.length > 0 ? (
                    product.weightOptions.map((opt) => {
                      const isActive = selectedWeight === opt.value && selectedUnit === opt.unit;
                      return (
                        <button
                          key={`${opt.value}-${opt.unit}`}
                          type="button"
                          onClick={() => handleSelectPreset(opt)}
                          className={`${styles.sizeChip} ${isActive ? styles.sizeChipActive : ""}`}
                        >
                          {locale === "bn" ? opt.labelBn : opt.labelEn}
                        </button>
                      );
                    })
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => handleSelectPreset({ value: 0.25, unit: "kg", multiplier: 0.25 })}
                        className={`${styles.sizeChip} ${selectedWeight === 0.25 ? styles.sizeChipActive : ""}`}
                      >
                        250g
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSelectPreset({ value: 0.5, unit: "kg", multiplier: 0.5 })}
                        className={`${styles.sizeChip} ${selectedWeight === 0.5 ? styles.sizeChipActive : ""}`}
                      >
                        500g
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSelectPreset({ value: 1, unit: "kg", multiplier: 1 })}
                        className={`${styles.sizeChip} ${selectedWeight === 1 ? styles.sizeChipActive : ""}`}
                      >
                        1 kg
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSelectPreset({ value: 2, unit: "kg", multiplier: 2 })}
                        className={`${styles.sizeChip} ${selectedWeight === 2 ? styles.sizeChipActive : ""}`}
                      >
                        2 kg
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSelectPreset({ value: 5, unit: "kg", multiplier: 4.8 })}
                        className={`${styles.sizeChip} ${selectedWeight === 5 ? styles.sizeChipActive : ""}`}
                      >
                        5 kg (Family Pack)
                      </button>
                    </>
                  )}
                </div>
              ) : (
                /* Manual Custom Quantity / Weight Input (Image 3) */
                <div className={styles.customWeightBox}>
                  <div className={styles.customInputRow}>
                    <input
                      type="number"
                      min="0.1"
                      step={customUnit === "gm" ? "50" : "0.25"}
                      value={customVal}
                      onChange={(e) => handleCustomChange(e.target.value)}
                      placeholder={locale === "bn" ? "পরিমাণ লিখুন (যেমন: 1.5)" : "Enter amount (e.g. 1.5)"}
                      className={styles.customInput}
                    />
                    <select
                      value={customUnit}
                      onChange={(e) => handleCustomUnitChange(e.target.value)}
                      className={styles.unitSelect}
                    >
                      <option value="kg">kg (কেজি)</option>
                      <option value="gm">gm (গ্রাম)</option>
                      {product.baseUnit === "piece" && <option value="piece">piece (টি)</option>}
                    </select>
                  </div>
                  <div className={styles.customCalculationHint}>
                    <Sparkles size={13} color="#3056D3" />
                    <span>
                      {locale === "bn"
                        ? `১ কেজির মূল্য: ${formatPrice(product.basePrice)} • মোট দাম স্বয়ংক্রিয়ভাবে হিসাব হচ্ছে`
                        : `Rate: ${formatPrice(product.basePrice)}/kg • Live dynamic calculation`}
                    </span>
                  </div>
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

              {/* ── High-End Action Buttons (Image 4) ── */}
              <div className={styles.btnStack}>
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className={`${styles.addToCartBtn} ${isAdded ? styles.addedState : ""}`}
                >
                  {isAdded ? (
                    <>
                      <Check size={18} />
                      <span>Added to Cart ✓</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag size={18} />
                      <span>Add to Cart</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleBuyItNow}
                  className={styles.buyNowBtn}
                >
                  <Zap size={18} fill="#ffffff" />
                  <span>Buy it now</span>
                </button>
              </div>

              {/* Delivery & Policies Info List */}
              <div className={styles.policyList}>
                <div className={styles.policyItem}>
                  <Truck size={16} className={styles.policyIcon} />
                  <span>Free express delivery on orders over ৳500</span>
                </div>
                <div className={styles.policyItem}>
                  <RefreshCw size={16} className={styles.policyIcon} />
                  <span>Instant doorstep inspection & return guarantee</span>
                </div>
                <div className={styles.policyItem}>
                  <Store size={16} className={styles.policyIcon} />
                  <span>Ready for express 4-hour dispatch from Central Hub</span>
                </div>
              </div>

            </div>

          </div>

          {/* ═════════════════════════════════════════════════════════════════════
              SPECIFICATIONS SECTION (Shadcnblocks Tabbed Specs — Image 5)
              ═════════════════════════════════════════════════════════════════════ */}
          <section className={styles.specsSection}>
            <div className={styles.specsHeader}>
              <h2 className={styles.specsTitle}>Specifications</h2>
              <p className={styles.specsSubtitle}>
                Comprehensive farm-origin, quality grading, and freshness details
              </p>
            </div>

            {/* Category Tabs (Overview, Display, Chip & Performance...) */}
            <div className={styles.tabsNav}>
              {specTabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveSpecTab(tab.id)}
                  className={`${styles.tabBtn} ${activeSpecTab === tab.id ? styles.tabBtnActive : ""}`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Specifications Table */}
            <div className={styles.specsTableCard}>
              {getSpecRows().map((row, idx) => (
                <div key={idx} className={styles.specsTableRow}>
                  <div className={styles.specLabelCol}>
                    <span>{row.label}</span>
                    {row.keySpec && <span className={styles.keySpecBadge}>Key spec</span>}
                  </div>
                  <div className={styles.specValueCol}>
                    {row.value}
                  </div>
                </div>
              ))}
            </div>

            {/* Key Highlights Summary Row (Image 5) */}
            <div>
              <h3 className={styles.highlightsTitle}>Key Highlights</h3>
              <div className={styles.highlightsGrid}>
                <div className={styles.highlightCard}>
                  <div className={styles.highlightLabel}>Quality Standard</div>
                  <div className={styles.highlightValue}>100% Organic Grade-A</div>
                </div>
                <div className={styles.highlightCard}>
                  <div className={styles.highlightLabel}>Harvest Window</div>
                  <div className={styles.highlightValue}>Morning 5:00 AM Direct Pick</div>
                </div>
                <div className={styles.highlightCard}>
                  <div className={styles.highlightLabel}>Delivery Standard</div>
                  <div className={styles.highlightValue}>4-Hour Express Insulated</div>
                </div>
              </div>
            </div>
          </section>

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
