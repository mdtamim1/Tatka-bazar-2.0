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
  Minus,
  Sparkles,
  ChefHat,
  Utensils,
  Clock,
  MapPin,
  ChevronDown,
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
  const { addItem, setBuyNowItem, openCart, closeCart, wishlistIds, toggleWishlist } = useCartStore();

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

  // Food presentation accordion open states
  const [accordionOpen, setAccordionOpen] = useState<{ [key: string]: boolean }>({
    nutrition: true,
    culinary: false,
    origin: false,
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

  // Food culinary tips & recommended recipes based on category
  const getCulinaryInfo = (catSlug: string) => {
    switch (catSlug) {
      case "fish-and-meat":
        return {
          dishesBn: ["সর্ষে বা পাতুরি", "আলু দিয়ে ঝোল", "দো-পেঁয়াজা ভুনা"],
          dishesEn: ["Mustard Steam (Shorshe)", "Traditional Curry", "Spicy Bhuna"],
          tipBn: "হালকা হলুদ ও লবণ মাখিয়ে কম আঁচে রান্না করলে মাছ ও মাংসের স্বাভাবিক স্বাদ ও কোমলতা পুরোপুরি বজায় থাকে।",
          tipEn: "Marinate gently with sea salt and turmeric; cook on gentle medium heat to preserve moisture and rich natural aroma.",
        };
      case "vegetables":
        return {
          dishesBn: ["রসুন-মরিচ দিয়ে ভাজি", "হালকা পাঁচমিশালি চচ্চড়ি", "তাজা কাঁচা সালাদ"],
          dishesEn: ["Garlic Stir Fry", "Light Mixed Chorchori", "Crisp Garden Salad"],
          tipBn: "সবুজ শাকসবজি বেশিক্ষণ উচ্চতাপে ভাজবেন না; এতে সবজির ভিটামিন, সতেজ সবুজ রঙ ও প্রাকৃতিক ক্রাঞ্চ অটুট থাকে।",
          tipEn: "Steam or flash sauté over moderate heat to lock in crisp texture, natural vitamins, and vibrant farm color.",
        };
      case "fruits":
        return {
          dishesBn: ["তাজা স্লাইস ডেজার্ট", "ফ্রুট কাস্টার্ড", "প্রাকৃতিক ফ্রেশ জুস"],
          dishesEn: ["Fresh Slices", "Seasonal Fruit Bowl", "Cold Pressed Juice"],
          tipBn: "খাওয়ার আগে হালকা পানিতে ভিজিয়ে ধুয়ে নিন; স্বাভাবিক তাপমাত্রায় রাখলে ফলের আসল মিষ্টতা ও সুবাস সবচেয়ে ভালো পাওয়া যায়।",
          tipEn: "Rinse gently in cold water before slicing; best enjoyed at natural cellar temperature for peak sweetness.",
        };
      case "rice-and-staples":
        return {
          dishesBn: ["সুগন্ধি সাদা ভাত", "শাহি পোলাও", "ঘিয়ে ভাজা ভুনা খিচুড়ি"],
          dishesEn: ["Steaming Fragrant Rice", "Shahi Polao", "Ghee Tempered Khichuri"],
          tipBn: "রান্নার আগে চাল ভালো করে ধুয়ে ১০ মিনিট জল ঝরিয়ে নিলে প্রতিটি ভাত হবে ঝরঝরে, লম্বা ও সুবাসিত।",
          tipEn: "Rinse gently and rest for 10 minutes before boiling; grains expand gracefully into fluffy, non-sticky texture.",
        };
      case "oil-and-ghee":
        return {
          dishesBn: ["গরম ভাতে ১ চামচ ঘি", "ঝাঁঝালো সরিষার ভর্তা", "মধু-লেবু কুসুম গরম পানি"],
          dishesEn: ["Dollop on Warm Rice", "Mustard Mash (Bhorta)", "Honey Detox Water"],
          tipBn: "রান্না নামানোর ঠিক আগে ১ চামচ খাঁটি ঘি ছড়িয়ে ঢাকনা বন্ধ রাখুন; এতে সারা ঘরে ছড়িয়ে পড়বে অতুলনীয় ঘ্রাণ।",
          tipEn: "Drizzle raw just before serving to impart an unmistakable artisanal bouquet and wholesome nutritional warmth.",
        };
      default: // dairy-and-eggs etc.
        return {
          dishesBn: ["ডিম ভুনা ও ওমলেট", "মিষ্টি দই ডেজার্ট", "ঘি দিয়ে পোচ"],
          dishesEn: ["Golden Egg Bhuna", "Chilled Curd Dessert", "Ghee Poached Eggs"],
          tipBn: "মাটির হাঁড়ির দই ঠাণ্ডা পরিবেশন করুন এবং দেশি ডিম হালকা আঁচে রান্না করলে কুসুমের কোমল স্বাদ চমৎকার থাকে।",
          tipEn: "Keep clay pot curd refrigerated and cook country eggs gently to enjoy rich velvety yolks and sweet finish.",
        };
    }
  };

  const culinary = getCulinaryInfo(product.categorySlug);

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
    setBuyNowItem(
      product,
      activeWeight.value,
      (activeWeight.unit || product.baseUnit || "kg") as any,
      currentPrice,
      quantity
    );
    closeCart();
    router.push("/checkout?mode=direct");
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

              {/* ── Premium Food-Centric Presentation Module (3 Food Options) ── */}
              <div className="border-t border-border pt-6 space-y-3">
                <div className="flex items-center justify-between pb-1">
                  <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-primary flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{locale === "bn" ? "খাবারের বৈশিষ্ট্য ও সতেজতা" : "Food Details & Integrity"}</span>
                  </p>
                  <span className="text-[10px] font-medium text-muted-foreground bg-muted/60 px-2.5 py-1 rounded-full border border-border">
                    {locale === "bn" ? "৩টি বিশেষ তথ্য" : "3 Key Highlights"}
                  </span>
                </div>

                {/* Option 1: Nutrition & Health Benefits */}
                <div className="rounded-xl border border-border bg-background/50 overflow-hidden transition-all duration-300 shadow-xs hover:border-primary/40">
                  <button
                    type="button"
                    onClick={() => toggleAccordion("nutrition")}
                    className="w-full p-4 flex items-center justify-between text-left group transition-colors hover:bg-muted/30"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-serif text-base font-semibold text-foreground group-hover:text-primary transition-colors">
                          {locale === "bn" ? "১. পুষ্টিগুণ ও স্বাস্থ্য উপকারিতা" : "1. Nutrition & Health Benefits"}
                        </h4>
                        <p className="text-[11px] text-muted-foreground">
                          {locale === "bn" ? "প্রাকৃতিক ভিটামিন, প্রোটিন ও ম্যাক্রো উপাদান" : "Natural vitamins, proteins & vital macros"}
                        </p>
                      </div>
                    </div>
                    <div className="w-7 h-7 rounded-full bg-muted/40 flex items-center justify-center text-muted-foreground transition-transform duration-300 group-hover:text-foreground">
                      <ChevronDown className={cn("w-4 h-4 transition-transform duration-300", accordionOpen["nutrition"] ? "rotate-180" : "")} />
                    </div>
                  </button>

                  {accordionOpen["nutrition"] && (
                    <div className="px-4 pb-4 pt-1 border-t border-border/40 bg-muted/15 space-y-3 animate-in fade-in-50 duration-200">
                      {/* Macro Pills Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                        <div className="p-2.5 bg-background border border-border rounded-lg text-center">
                          <span className="block text-[10px] text-muted-foreground uppercase tracking-wider">{locale === "bn" ? "ক্যালোরি" : "Calories"}</span>
                          <span className="text-xs font-bold text-foreground mt-0.5 block">{product.nutritionInfo?.calories || "১০০% প্রাকৃতিক"}</span>
                        </div>
                        <div className="p-2.5 bg-background border border-border rounded-lg text-center">
                          <span className="block text-[10px] text-muted-foreground uppercase tracking-wider">{locale === "bn" ? "প্রোটিন" : "Protein"}</span>
                          <span className="text-xs font-bold text-foreground mt-0.5 block">{product.nutritionInfo?.protein || "উচ্চমান সম্পন্ন"}</span>
                        </div>
                        <div className="p-2.5 bg-background border border-border rounded-lg text-center">
                          <span className="block text-[10px] text-muted-foreground uppercase tracking-wider">{locale === "bn" ? "কার্বস" : "Carbs"}</span>
                          <span className="text-xs font-bold text-foreground mt-0.5 block">{product.nutritionInfo?.carbs || "প্রাকৃতিক শর্করা"}</span>
                        </div>
                        <div className="p-2.5 bg-background border border-border rounded-lg text-center">
                          <span className="block text-[10px] text-muted-foreground uppercase tracking-wider">{locale === "bn" ? "স্বাস্থ্যকর ফ্যাট/উপাদান" : "Healthy Fats"}</span>
                          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 block truncate" title={product.nutritionInfo?.fat}>
                            {product.nutritionInfo?.fat || "জিরো কেমিক্যাল"}
                          </span>
                        </div>
                      </div>

                      {/* Health & Safety Badges */}
                      <div className="flex flex-wrap gap-2 pt-1">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                          <Check className="w-3 h-3" />
                          {locale === "bn" ? "১০০% ফরমালিন ও রাসায়নিকমুক্ত" : "100% Formalin & Chemical Free"}
                        </span>
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-semibold bg-primary/10 text-primary border border-primary/20">
                          <Leaf className="w-3 h-3" />
                          {locale === "bn" ? "প্রাকৃতিক ও ভেজালহীন পুষ্টি" : "Pure Unadulterated Nutrition"}
                        </span>
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20">
                          <ShieldCheck className="w-3 h-3" />
                          {locale === "bn" ? "ল্যাব সার্টিফাইড বিশুদ্ধতা" : "Lab Certified Quality"}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Option 2: Culinary & Cooking Tips */}
                <div className="rounded-xl border border-border bg-background/50 overflow-hidden transition-all duration-300 shadow-xs hover:border-primary/40">
                  <button
                    type="button"
                    onClick={() => toggleAccordion("culinary")}
                    className="w-full p-4 flex items-center justify-between text-left group transition-colors hover:bg-muted/30"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center shrink-0 border border-orange-500/20">
                        <ChefHat className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-serif text-base font-semibold text-foreground group-hover:text-primary transition-colors">
                          {locale === "bn" ? "২. রান্না ও পরিবেশন পরামর্শ" : "2. Culinary & Cooking Tips"}
                        </h4>
                        <p className="text-[11px] text-muted-foreground">
                          {locale === "bn" ? "সেরা রন্ধনশৈলী, পেয়ারিং ও শেফের টিপস" : "Signature dishes, pairings & chef advice"}
                        </p>
                      </div>
                    </div>
                    <div className="w-7 h-7 rounded-full bg-muted/40 flex items-center justify-center text-muted-foreground transition-transform duration-300 group-hover:text-foreground">
                      <ChevronDown className={cn("w-4 h-4 transition-transform duration-300", accordionOpen["culinary"] ? "rotate-180" : "")} />
                    </div>
                  </button>

                  {accordionOpen["culinary"] && (
                    <div className="px-4 pb-4 pt-1 border-t border-border/40 bg-muted/15 space-y-3 animate-in fade-in-50 duration-200">
                      {/* Signature Dishes Tags */}
                      <div className="space-y-1.5 pt-1">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                          <Utensils className="w-3 h-3 text-orange-500" />
                          <span>{locale === "bn" ? "যেসব রান্নায় দারুণ জমে:" : "Recommended Preparations:"}</span>
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {culinary.dishesBn.map((d, i) => (
                            <span key={i} className="px-2.5 py-1 text-[11px] font-medium bg-background border border-border rounded-md text-foreground shadow-xs">
                              {locale === "bn" ? d : culinary.dishesEn[i]}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Chef's Tip Quote Box */}
                      <div className="p-3 bg-orange-500/5 border border-orange-500/15 rounded-lg flex items-start gap-2.5">
                        <ChefHat className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
                        <div className="text-xs text-foreground/90 leading-relaxed">
                          <strong className="text-orange-600 block text-[11px] mb-0.5">
                            {locale === "bn" ? "শেফের বিশেষ টিপস:" : "Chef's Secret:"}
                          </strong>
                          {locale === "bn" ? culinary.tipBn : culinary.tipEn}
                        </div>
                      </div>

                      {/* Storage instruction */}
                      <div className="text-[11px] text-muted-foreground pt-1 flex items-center justify-between">
                        <span>
                          <strong>{locale === "bn" ? "সংরক্ষণ:" : "Storage:"}</strong>{" "}
                          {locale === "bn" ? product.storageTipsBn || "শীতল স্থানে স্বাভাবিক তাপমাত্রায় রাখুন।" : product.storageTipsEn || "Store in a cool dry place."}
                        </span>
                        <Link href="/recipes" className="text-primary hover:underline text-[11px] font-semibold shrink-0 ml-2">
                          {locale === "bn" ? "রেসিপি দেখুন →" : "View Recipes →"}
                        </Link>
                      </div>
                    </div>
                  )}
                </div>

                {/* Option 3: Farm Origin & Freshness Promise */}
                <div className="rounded-xl border border-border bg-background/50 overflow-hidden transition-all duration-300 shadow-xs hover:border-primary/40">
                  <button
                    type="button"
                    onClick={() => toggleAccordion("origin")}
                    className="w-full p-4 flex items-center justify-between text-left group transition-colors hover:bg-muted/30"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/20">
                        <Leaf className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-serif text-base font-semibold text-foreground group-hover:text-primary transition-colors">
                          {locale === "bn" ? "৩. খামারের উৎস ও টাটকা নিশ্চয়তা" : "3. Farm Origin & Freshness Promise"}
                        </h4>
                        <p className="text-[11px] text-muted-foreground">
                          {locale === "bn" ? "আসল সোর্সিং স্থান ও কোল্ড-চেইন নিশ্চয়তা" : "Verified terroir sourcing & cold-chain guarantee"}
                        </p>
                      </div>
                    </div>
                    <div className="w-7 h-7 rounded-full bg-muted/40 flex items-center justify-center text-muted-foreground transition-transform duration-300 group-hover:text-foreground">
                      <ChevronDown className={cn("w-4 h-4 transition-transform duration-300", accordionOpen["origin"] ? "rotate-180" : "")} />
                    </div>
                  </button>

                  {accordionOpen["origin"] && (
                    <div className="px-4 pb-4 pt-1 border-t border-border/40 bg-muted/15 space-y-3 animate-in fade-in-50 duration-200">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                        <div className="p-3 bg-background border border-border rounded-lg space-y-1">
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-primary" />
                            {locale === "bn" ? "সোর্সিং এলাকা" : "Harvest Location"}
                          </span>
                          <p className="text-xs font-semibold text-foreground">
                            {locale === "bn" ? product.originBn : product.originEn}
                          </p>
                        </div>

                        <div className="p-3 bg-background border border-border rounded-lg space-y-1">
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3 text-primary" />
                            {locale === "bn" ? "তাজা থাকার প্রতিশ্রুতি" : "Freshness Promise"}
                          </span>
                          <p className="text-xs font-semibold text-foreground">
                            {locale === "bn" ? product.freshnessGuaranteeBn : product.freshnessGuaranteeEn}
                          </p>
                        </div>
                      </div>

                      {/* Delivery & Doorstep Check Assurance */}
                      <div className="p-3 bg-primary/5 border border-primary/15 rounded-lg space-y-1.5 text-xs text-foreground/90">
                        <div className="flex items-center gap-2 text-primary font-semibold text-xs">
                          <Truck className="w-4 h-4" />
                          <span>{locale === "bn" ? "কোল্ড-চেইন এক্সপ্রেস ডেলিভারি" : "Cold-Chain Express Delivery"}</span>
                        </div>
                        <p className="text-[11px] text-muted-foreground leading-relaxed">
                          {locale === "bn"
                            ? "অর্ডার পাওয়ার পর তাপমাত্রা-নিয়ন্ত্রিত প্যাকেজিংয়ে ৬০-১২০ মিনিটে আপনার দোরগোড়ায় পৌঁছে দেওয়া হবে। পার্সেল দেখে নেওয়ার ১০০% সুযোগ।"
                            : "Dispatched within 60-120 minutes in temperature-controlled packaging. Full inspection on doorstep guaranteed."}
                        </p>
                      </div>
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
