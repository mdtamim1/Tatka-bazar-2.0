"use client";

import React, { useState, use, useEffect } from "react";
import Link from "next/link";
import { notFound, useRouter } from "next/navigation";
import {
  Heart,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  ShoppingBag,
  Check,
  Zap,
  ShieldCheck,
  Truck,
  Leaf,
  Plus,
  Minus
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";
import { useCartStore } from "@/lib/cart-store";
import { PRODUCTS, CATEGORIES } from "@/lib/catalog";
import { ProductCard } from "@/components/product/ProductCard";
import { QuantitySelector } from "@/components/ui/QuantitySelector";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export default function ProductDetailPage({ params }: ProductPageProps) {
  const resolvedParams = use(params);
  const { locale, formatPrice } = useLanguage();
  const { addItem, openCart, closeCart, wishlistIds, toggleWishlist } = useCartStore();

  const product = PRODUCTS.find((p) => p.slug === resolvedParams.slug);
  if (!product) {
    return notFound();
  }

  const router = useRouter();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedWeightIdx, setSelectedWeightIdx] = useState(0);
  const [isCustomWeight, setIsCustomWeight] = useState(false);
  const [customWeightValue, setCustomWeightValue] = useState(1.5);
  const [addedAnim, setAddedAnim] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Accordion open states
  const [accordionOpen, setAccordionOpen] = useState<{ [key: string]: boolean }>({
    origin: true,
    nutrition: false,
    shipping: false,
  });

  const toggleAccordion = (key: string) => {
    setAccordionOpen((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  const inWishlist = mounted ? wishlistIds.includes(product.id) : false;
  const category = CATEGORIES.find((c) => c.slug === product.categorySlug);

  // Weight options
  const weightOptions =
    product.weightOptions && product.weightOptions.length > 0
      ? product.weightOptions
      : [
          { value: 0.5, unit: product.baseUnit || "kg", labelBn: "500g", labelEn: "500g", multiplier: 0.5 },
          { value: 1.0, unit: product.baseUnit || "kg", labelBn: "1 kg", labelEn: "1 kg", multiplier: 1.0, popular: true },
          { value: 2.0, unit: product.baseUnit || "kg", labelBn: "2 kg", labelEn: "2 kg", multiplier: 2.0 },
        ];

  const activeWeight = isCustomWeight
    ? {
        value: customWeightValue,
        unit: product.baseUnit || "kg",
        labelBn: `${customWeightValue} ${product.baseUnit || "কেজি"}`,
        labelEn: `${customWeightValue} ${product.baseUnit || "kg"}`,
        multiplier: customWeightValue,
      }
    : (weightOptions[selectedWeightIdx] || weightOptions[0]!);

  const currentPrice = isCustomWeight
    ? Math.max(1, Math.round(product.basePrice * customWeightValue))
    : Math.max(1, Math.round(product.basePrice * (activeWeight.multiplier || 1)));

  // Related products
  const relatedProducts = PRODUCTS.filter(
    (p) => p.categorySlug === product.categorySlug && p.id !== product.id
  ).slice(0, 4);

  const nextImage = () => {
    setCurrentImageIndex((prev) =>
      prev === product.images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? product.images.length - 1 : prev - 1
    );
  };

  const handleAddToCart = () => {
    addItem(
      product,
      activeWeight.value,
      (activeWeight.unit || product.baseUnit || "kg") as any,
      currentPrice,
      quantity
    );
    setAddedAnim(true);
    openCart();
    setTimeout(() => setAddedAnim(false), 2000);
  };

  const handleOrderNow = () => {
    addItem(
      product,
      activeWeight.value,
      (activeWeight.unit || product.baseUnit || "kg") as any,
      currentPrice,
      quantity,
      false // Do not open cart drawer
    );
    closeCart();
    router.push("/checkout");
  };

  return (
    <div className="w-full">
      {/* ── Breadcrumb ── */}
      <div className="container-full py-5 border-b border-border">
        <div className="flex items-center gap-2.5 text-xs text-muted-foreground uppercase tracking-[0.1em]">
          <Link href="/shop" className="hover:text-foreground transition-colors">
            {locale === "bn" ? "দোকান" : "Shop"}
          </Link>
          <span>/</span>
          {category && (
            <>
              <Link
                href={`/category/${category.slug}`}
                className="hover:text-foreground transition-colors"
              >
                {locale === "bn" ? category.nameBn : category.nameEn}
              </Link>
              <span>/</span>
            </>
          )}
          <span className="text-foreground font-medium truncate max-w-xs">
            {locale === "bn" ? product.nameBn : product.nameEn}
          </span>
        </div>
      </div>

      {/* ── Product Content Section ── */}
      <section className="py-10 md:py-16">
        <div className="container-full">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-start">
            
            {/* Left 7 Columns: Image Gallery */}
            <div className="lg:col-span-7 space-y-4">
              {/* Main Image Frame */}
              <div className="relative aspect-[4/5] overflow-hidden bg-muted/30 group">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={currentImageIndex}
                    src={product.images[currentImageIndex] || product.images[0]}
                    alt={product.nameEn}
                    initial={{ opacity: 0, scale: 1.02 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
                    className="w-full h-full object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-105"
                  />
                </AnimatePresence>

                {/* Left/Right Navigation buttons if multiple images */}
                {product.images.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={prevImage}
                      aria-label="Previous image"
                      className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-background/90 backdrop-blur-md hover:bg-background transition-all duration-300 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0"
                    >
                      <ChevronLeft className="w-5 h-5 text-foreground" />
                    </button>
                    <button
                      type="button"
                      onClick={nextImage}
                      aria-label="Next image"
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-background/90 backdrop-blur-md hover:bg-background transition-all duration-300 opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0"
                    >
                      <ChevronRight className="w-5 h-5 text-foreground" />
                    </button>
                  </>
                )}

                {/* Badges */}
                <div className="absolute top-5 left-5 flex flex-col gap-2">
                  {product.isOrganic && (
                    <span className="px-3 py-1.5 text-[10px] font-semibold tracking-[0.2em] uppercase bg-foreground text-background">
                      {locale === "bn" ? "অর্গানিক" : "Organic"}
                    </span>
                  )}
                  {product.isFeatured && (
                    <span className="px-3 py-1.5 text-[10px] font-semibold tracking-[0.2em] uppercase bg-primary text-primary-foreground">
                      {locale === "bn" ? "সেরা পছন্দ" : "Featured"}
                    </span>
                  )}
                </div>
              </div>

              {/* Thumbnails row */}
              {product.images.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                  {product.images.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setCurrentImageIndex(idx)}
                      className={cn(
                        "w-20 h-24 flex-shrink-0 overflow-hidden bg-muted transition-all border-2 rounded-none",
                        currentImageIndex === idx ? "border-primary" : "border-transparent opacity-70 hover:opacity-100"
                      )}
                    >
                      <img src={img} alt="Thumbnail" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right 5 Columns: Product Information */}
            <div className="lg:col-span-5 space-y-6">
              <div>
                <p className="text-[11px] font-semibold tracking-[0.3em] uppercase text-primary mb-3">
                  {locale === "bn" ? product.categoryNameBn : product.categoryNameEn}
                </p>

                <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-foreground leading-[1.1] mb-4">
                  {locale === "bn" ? product.nameBn : product.nameEn}
                </h1>

                {/* Price */}
                <div className="flex items-baseline gap-3">
                  <span className="font-serif text-2xl sm:text-3xl text-foreground font-medium">
                    {formatPrice(currentPrice)}
                  </span>
                  {product.comparePrice && (
                    <span className="text-sm text-muted-foreground/60 line-through">
                      {formatPrice(product.comparePrice)}
                    </span>
                  )}
                  <span className="text-xs text-muted-foreground uppercase tracking-[0.1em]">
                    / {activeWeight.labelEn || activeWeight.unit}
                  </span>
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-muted-foreground leading-relaxed">
                {locale === "bn" ? product.descriptionBn : product.descriptionEn}
              </p>

              {/* Weight / Portion Selector */}
              <div className="space-y-2 pt-2">
                <p className="text-[10px] font-semibold tracking-[0.2em] uppercase text-muted-foreground">
                  {locale === "bn" ? "পরিমাণ / ওজন নির্বাচন করুন" : "Select Portion / Weight"}
                </p>
                <div className="flex flex-wrap gap-2">
                  {weightOptions.map((opt, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        setIsCustomWeight(false);
                        setSelectedWeightIdx(i);
                      }}
                      className={cn(
                        "px-4 py-2 text-xs uppercase tracking-[0.1em] border transition-all rounded-none",
                        !isCustomWeight && selectedWeightIdx === i
                          ? "bg-orange-500 text-white border-orange-500 font-semibold shadow-sm"
                          : "bg-background text-foreground border-border hover:border-orange-500/50"
                      )}
                    >
                      {locale === "bn" ? opt.labelBn : opt.labelEn}
                    </button>
                  ))}

                  {/* Custom Weight Option Button */}
                  <button
                    type="button"
                    onClick={() => setIsCustomWeight(true)}
                    className={cn(
                      "px-4 py-2 text-xs uppercase tracking-[0.1em] border transition-all rounded-none flex items-center gap-1.5",
                      isCustomWeight
                        ? "bg-orange-500 text-white border-orange-500 font-semibold shadow-sm"
                        : "bg-background text-foreground border-border hover:border-orange-500/50"
                    )}
                  >
                    <span>+</span>
                    <span>{locale === "bn" ? "কাস্টম পরিমাণ" : "Custom Weight"}</span>
                  </button>
                </div>

                {/* Custom Weight Input Box */}
                {isCustomWeight && (
                  <div className="pt-2 flex flex-wrap items-center gap-3 p-3 bg-muted/40 border border-border">
                    <span className="text-xs text-muted-foreground uppercase tracking-[0.1em]">
                      {locale === "bn" ? "কাঙ্ক্ষিত পরিমাণ লিখুন:" : "Enter Desired Weight:"}
                    </span>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={0.1}
                        max={100}
                        step={0.1}
                        value={customWeightValue}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value);
                          setCustomWeightValue(isNaN(val) || val <= 0 ? 0.1 : Math.round(val * 100) / 100);
                        }}
                        className="w-24 px-3 py-1.5 bg-background border border-border text-foreground text-sm font-semibold text-center focus:outline-none focus:border-orange-500"
                      />
                      <span className="text-xs font-semibold uppercase text-foreground">
                        {product.baseUnit || "kg"}
                      </span>
                    </div>
                    <span className="text-xs font-serif font-medium text-foreground ml-auto">
                      {formatPrice(Math.round(product.basePrice * customWeightValue))}
                    </span>
                  </div>
                )}
              </div>

              {/* Quantity & Add to Bag Actions */}
              <div className="pt-4 space-y-3">
                <div className="flex items-center gap-3">
                  <QuantitySelector
                    quantity={quantity}
                    onQuantityChange={setQuantity}
                    min={1}
                    max={99}
                  />

                  <Button
                    type="button"
                    onClick={handleAddToCart}
                    className="flex-1 py-6 rounded-none text-xs tracking-[0.15em] uppercase font-semibold flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white border border-orange-500 shadow-sm transition-all duration-300 active:scale-[0.99]"
                  >
                    {addedAnim ? (
                      <>
                        <Check className="w-4 h-4 text-white" />
                        <span>{locale === "bn" ? "ব্যাগে যোগ হয়েছে" : "Added to Bag"}</span>
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="w-4 h-4" />
                        <span>{locale === "bn" ? "ব্যাগে যোগ করুন" : "Add to Bag"}</span>
                      </>
                    )}
                  </Button>

                  <button
                    type="button"
                    onClick={() => toggleWishlist(product.id)}
                    aria-label="Wishlist"
                    className="p-3.5 border border-border hover:bg-accent transition-colors"
                  >
                    <Heart
                      className={cn(
                        "w-5 h-5 transition-colors",
                        inWishlist ? "fill-primary text-primary" : "text-foreground"
                      )}
                    />
                  </button>
                </div>

                {/* Direct Order Now Button */}
                <Button
                  type="button"
                  onClick={handleOrderNow}
                  className="w-full py-6 rounded-none text-xs sm:text-sm tracking-[0.15em] uppercase font-semibold flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground btn-premium shadow-sm active:scale-[0.99]"
                >
                  <Zap className="w-4 h-4 fill-current" />
                  <span>{locale === "bn" ? "সরাসরি অর্ডার করুন" : "Order Now"}</span>
                </Button>
              </div>

              {/* Accordions (Origin, Integrity, Delivery) */}
              <div className="border-t border-border pt-6 divide-y divide-border text-sm">
                {/* Origin / Provenance */}
                <div className="py-4">
                  <button
                    type="button"
                    onClick={() => toggleAccordion("origin")}
                    className="w-full flex justify-between items-center text-left font-serif text-lg text-foreground"
                  >
                    <span>{locale === "bn" ? "উৎপত্তি ও সোর্সিং" : "Origin & Provenance"}</span>
                    <span>{accordionOpen["origin"] ? "−" : "+"}</span>
                  </button>
                  {accordionOpen["origin"] && (
                    <div className="pt-3 text-xs text-muted-foreground leading-relaxed space-y-2">
                      <p><strong>{locale === "bn" ? "স্থান:" : "Origin:"}</strong> {locale === "bn" ? product.originBn : product.originEn}</p>
                      <p><strong>{locale === "bn" ? "তাজা নিশ্চয়তা:" : "Freshness Promise:"}</strong> {locale === "bn" ? product.freshnessGuaranteeBn : product.freshnessGuaranteeEn}</p>
                    </div>
                  )}
                </div>

                {/* Storage & Care */}
                <div className="py-4">
                  <button
                    type="button"
                    onClick={() => toggleAccordion("nutrition")}
                    className="w-full flex justify-between items-center text-left font-serif text-lg text-foreground"
                  >
                    <span>{locale === "bn" ? "সংরক্ষণ পদ্ধতি" : "Storage & Care"}</span>
                    <span>{accordionOpen["nutrition"] ? "−" : "+"}</span>
                  </button>
                  {accordionOpen["nutrition"] && (
                    <div className="pt-3 text-xs text-muted-foreground leading-relaxed">
                      <p>{locale === "bn" ? product.storageTipsBn || "শীতল ও শুষ্ক স্থানে সংরক্ষণ করুন।" : product.storageTipsEn || "Keep refrigerated in optimal temperature control."}</p>
                    </div>
                  )}
                </div>

                {/* Shipping & Delivery */}
                <div className="py-4">
                  <button
                    type="button"
                    onClick={() => toggleAccordion("shipping")}
                    className="w-full flex justify-between items-center text-left font-serif text-lg text-foreground"
                  >
                    <span>{locale === "bn" ? "ডেলিভারি ও নিশ্চয়তা" : "Delivery & Guarantee"}</span>
                    <span>{accordionOpen["shipping"] ? "−" : "+"}</span>
                  </button>
                  {accordionOpen["shipping"] && (
                    <div className="pt-3 text-xs text-muted-foreground leading-relaxed space-y-1">
                      <p>• {locale === "bn" ? "৬০-১২০ মিনিট কোল্ড-চেইন এক্সপ্রেস ডেলিভারি।" : "60-120 minute temperature-controlled express dispatch."}</p>
                      <p>• {locale === "bn" ? "দোরগোড়ায় চেক করে গ্রহণের সুযোগ।" : "Quality check on doorstep before payment."}</p>
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* ── Related Pieces Section ── */}
      {relatedProducts.length > 0 && (
        <section className="py-20 md:py-28 bg-linen border-t border-border">
          <div className="container-full">
            <div className="text-center mb-12">
              <p className="text-[11px] font-semibold tracking-[0.3em] uppercase text-primary mb-3">
                {locale === "bn" ? "সম্পর্কিত সংগ্রহ" : "Complementary Pieces"}
              </p>
              <h2 className="font-serif text-3xl md:text-4xl text-foreground">
                {locale === "bn" ? "আপনার পছন্দের মতো পণ্য" : "You May Also Consider"}
              </h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6 md:gap-8">
              {relatedProducts.map((p, idx) => (
                <ProductCard key={p.id} product={p} index={idx} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
