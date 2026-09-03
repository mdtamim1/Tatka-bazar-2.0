"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  SlidersHorizontal,
  X,
  RotateCcw,
  Check,
  Sparkles,
  Leaf,
  Sun,
  ShieldCheck,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { CATEGORIES, PRODUCTS } from "@/lib/catalog";
import { ProductCard } from "@/components/product/ProductCard";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type SortOption = "featured" | "newest" | "price-asc" | "price-desc" | "name-asc";
type PriceRangeOption = "all" | "under-200" | "200-500" | "500-1000" | "above-1000";

const sortOptions: { value: SortOption; labelBn: string; labelEn: string }[] = [
  { value: "featured", labelBn: "সেরা পছন্দ", labelEn: "Featured" },
  { value: "newest", labelBn: "নতুন পণ্য", labelEn: "Newest Arrivals" },
  { value: "price-asc", labelBn: "মূল্য: কম থেকে বেশি", labelEn: "Price: Low to High" },
  { value: "price-desc", labelBn: "মূল্য: বেশি থেকে কম", labelEn: "Price: High to Low" },
  { value: "name-asc", labelBn: "নাম: A-Z / অ-হ", labelEn: "Alphabetical A-Z" },
];

const priceOptions: { value: PriceRangeOption; labelBn: string; labelEn: string }[] = [
  { value: "all", labelBn: "সকল মূল্য", labelEn: "All Prices" },
  { value: "under-200", labelBn: "৳২০০ এর নিচে", labelEn: "Under ৳200" },
  { value: "200-500", labelBn: "৳২০০ - ৳৫০০", labelEn: "৳200 - ৳500" },
  { value: "500-1000", labelBn: "৳৫০০ - ৳১,০০০", labelEn: "৳500 - ৳1,000" },
  { value: "above-1000", labelBn: "৳১,০০০ এর উপরে", labelEn: "Above ৳1,000" },
];

interface CategoryListingProps {
  initialSlug?: string;
}

export function CategoryListing({ initialSlug = "all" }: CategoryListingProps) {
  const { locale, formatPrice } = useLanguage();

  // Filter States
  const [selectedCategory, setSelectedCategory] = useState<string>(initialSlug);
  const [activeSort, setActiveSort] = useState<SortOption>("featured");
  const [priceRange, setPriceRange] = useState<PriceRangeOption>("all");
  const [organicOnly, setOrganicOnly] = useState(false);
  const [dailyBazarOnly, setDailyBazarOnly] = useState(false);
  const [featuredOnly, setFeaturedOnly] = useState(false);

  // Filter Drawer Open State
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  // Sync initialSlug when prop changes
  useEffect(() => {
    setSelectedCategory(initialSlug);
  }, [initialSlug]);

  // Lock body scroll when drawer is open on mobile
  useEffect(() => {
    if (isFilterDrawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isFilterDrawerOpen]);

  // Count active filters
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (selectedCategory !== "all") count++;
    if (priceRange !== "all") count++;
    if (organicOnly) count++;
    if (dailyBazarOnly) count++;
    if (featuredOnly) count++;
    return count;
  }, [selectedCategory, priceRange, organicOnly, dailyBazarOnly, featuredOnly]);

  const resetAllFilters = () => {
    setSelectedCategory("all");
    setPriceRange("all");
    setOrganicOnly(false);
    setDailyBazarOnly(false);
    setFeaturedOnly(false);
    setActiveSort("featured");
  };

  const currentCategory = selectedCategory !== "all"
    ? CATEGORIES.find((c) => c.slug === selectedCategory)
    : null;

  // Filter & Sort computation
  const filteredAndSortedProducts = useMemo(() => {
    let result = [...PRODUCTS];

    if (selectedCategory !== "all") {
      result = result.filter((p) => p.categorySlug === selectedCategory);
    }

    if (organicOnly) {
      result = result.filter((p) => p.isOrganic);
    }

    if (dailyBazarOnly) {
      result = result.filter((p) => p.isDailyBazar);
    }

    if (featuredOnly) {
      result = result.filter((p) => p.isFeatured);
    }

    if (priceRange === "under-200") {
      result = result.filter((p) => p.basePrice < 200);
    } else if (priceRange === "200-500") {
      result = result.filter((p) => p.basePrice >= 200 && p.basePrice <= 500);
    } else if (priceRange === "500-1000") {
      result = result.filter((p) => p.basePrice > 500 && p.basePrice <= 1000);
    } else if (priceRange === "above-1000") {
      result = result.filter((p) => p.basePrice > 1000);
    }

    switch (activeSort) {
      case "newest":
        result = result.filter((p) => p.isDailyBazar).concat(result.filter((p) => !p.isDailyBazar));
        break;
      case "price-asc":
        result.sort((a, b) => a.basePrice - b.basePrice);
        break;
      case "price-desc":
        result.sort((a, b) => b.basePrice - a.basePrice);
        break;
      case "name-asc":
        result.sort((a, b) =>
          (locale === "bn" ? a.nameBn : a.nameEn).localeCompare(locale === "bn" ? b.nameBn : b.nameEn)
        );
        break;
      case "featured":
      default:
        result = result.filter((p) => p.isFeatured).concat(result.filter((p) => !p.isFeatured));
        break;
    }

    return result;
  }, [selectedCategory, priceRange, organicOnly, dailyBazarOnly, featuredOnly, activeSort, locale]);

  const bannerImg = currentCategory
    ? currentCategory.image
    : "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1920&q=80";

  return (
    <div className="w-full">
      {/* ── 1. Hero Banner ── */}
      <section className="relative h-[28vh] sm:h-[38vh] md:h-[48vh] overflow-hidden select-none">
        <div className="absolute inset-0">
          <img
            src={bannerImg}
            alt={currentCategory?.nameEn || "All Products"}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal/85 via-charcoal/40 to-charcoal/30" />
        </div>

        {/* Top Controls: Filter on Top-Left (Yellow Mark) & Sort on Top-Right (Blue Mark) - 3D Transparent */}
        <div className="absolute top-4 sm:top-6 inset-x-0 z-20">
          <div className="container-full flex items-center justify-between">
            {/* Yellow Mark: Top-Left 3D Transparent Filter Button */}
            <Button
              type="button"
              onClick={() => setIsFilterDrawerOpen(true)}
              variant="outline"
              size="sm"
              className={cn(
                "rounded-none h-10 px-4 sm:px-5 text-[11px] sm:text-xs tracking-[0.12em] uppercase flex items-center gap-2",
                "bg-white/20 hover:bg-white/35 text-white border border-white/40 backdrop-blur-xl transition-all duration-300",
                "shadow-[0_8px_32px_rgba(0,0,0,0.25),inset_0_1px_1px_rgba(255,255,255,0.6)] active:translate-y-0.5 active:scale-95",
                activeFilterCount > 0 && "bg-primary/80 hover:bg-primary border-white/40 text-primary-foreground shadow-[0_8px_32px_rgba(24,131,80,0.4),inset_0_1px_1px_rgba(255,255,255,0.5)] font-semibold"
              )}
            >
              <SlidersHorizontal className="w-3.5 h-3.5 drop-shadow" />
              <span className="drop-shadow-sm">{locale === "bn" ? "ফিল্টার" : "Filters"}</span>
              {activeFilterCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-white text-primary text-[10px] font-bold flex items-center justify-center shadow">
                  {activeFilterCount}
                </span>
              )}
            </Button>

            {/* Blue Mark: Top-Right 3D Transparent Sorting Dropdown */}
            <div className="relative inline-block">
              <select
                value={activeSort}
                onChange={(e) => setActiveSort(e.target.value as SortOption)}
                className="bg-white/20 hover:bg-white/35 text-white border border-white/40 backdrop-blur-xl text-[11px] sm:text-xs uppercase tracking-[0.12em] px-4 sm:px-5 py-2 pr-9 h-10 rounded-none appearance-none focus:outline-none focus:border-white/80 cursor-pointer shadow-[0_8px_32px_rgba(0,0,0,0.25),inset_0_1px_1px_rgba(255,255,255,0.6)] active:translate-y-0.5 transition-all duration-300"
              >
                {sortOptions.map((opt) => (
                  <option key={opt.value} value={opt.value} className="bg-charcoal text-white">
                    {locale === "bn" ? opt.labelBn : opt.labelEn}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-white drop-shadow" />
            </div>
          </div>
        </div>

        <div className="relative container-full h-full flex flex-col justify-end pb-8 sm:pb-12">
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <p className="text-[10px] font-semibold tracking-[0.25em] uppercase text-white/70 mb-1.5">
              {currentCategory ? (locale === "bn" ? "কালেকশন" : "Collection") : (locale === "bn" ? "সব পণ্য" : "Shop All")}
            </p>
            <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl text-white mb-2 leading-[0.98]">
              {currentCategory
                ? (locale === "bn" ? currentCategory.nameBn : currentCategory.nameEn)
                : (locale === "bn" ? "সকল সতেজ সমাহার" : "All Pieces")}
            </h1>
            {currentCategory && (
              <p className="text-xs sm:text-sm text-white/80 max-w-xl leading-relaxed line-clamp-2">
                {locale === "bn" ? currentCategory.descriptionBn : currentCategory.descriptionEn}
              </p>
            )}
          </motion.div>
        </div>
      </section>

      {/* ── 2. Sticky Filters & Sorting Bar ── */}
      <section className="py-3 sm:py-3.5 border-b border-border sticky top-16 md:top-20 bg-background/95 backdrop-blur-md z-40">
        <div className="container-full">
          <div className="flex items-center justify-between gap-3">
            
            {/* Category Quick Pills (horizontal scroll on mobile) */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-hide flex-1 mr-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedCategory("all")}
                className={cn(
                  "rounded-none h-8 px-3.5 whitespace-nowrap text-[11px] tracking-[0.08em] uppercase transition-all",
                  selectedCategory === "all"
                    ? "bg-foreground text-background hover:bg-foreground/90 hover:text-background font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {locale === "bn" ? "সব" : "All"}
              </Button>

              {CATEGORIES.map((cat) => (
                <Button
                  key={cat.id}
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedCategory(cat.slug)}
                  className={cn(
                    "rounded-none h-8 px-3 whitespace-nowrap text-[11px] tracking-[0.08em] uppercase transition-all",
                    selectedCategory === cat.slug
                      ? "bg-foreground text-background hover:bg-foreground/90 hover:text-background font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {locale === "bn" ? cat.nameBn : cat.nameEn}
                </Button>
              ))}
            </div>

            {/* Right: Items Count & Sticky Quick Filter */}
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              <span className="text-[11px] sm:text-xs text-muted-foreground whitespace-nowrap">
                {filteredAndSortedProducts.length} {locale === "bn" ? "টি পণ্য" : "pieces"}
              </span>

              <Button
                type="button"
                onClick={() => setIsFilterDrawerOpen(true)}
                variant="ghost"
                size="sm"
                className={cn(
                  "rounded-none h-8 px-2 sm:px-2.5 text-[11px] tracking-[0.08em] uppercase flex items-center gap-1 text-muted-foreground hover:text-foreground",
                  activeFilterCount > 0 && "text-primary font-semibold"
                )}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                {activeFilterCount > 0 && (
                  <span className="w-4 h-4 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </Button>
            </div>

          </div>

          {/* Active Filters Pill Bar (shown if any filter applied) */}
          {activeFilterCount > 0 && (
            <div className="flex flex-wrap items-center gap-2 pt-2.5 mt-2 border-t border-border/50 text-xs">
              <span className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground font-semibold">
                {locale === "bn" ? "সক্রিয় ফিল্টার:" : "Active:"}
              </span>

              {selectedCategory !== "all" && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-muted text-[11px] font-medium border border-border">
                  {currentCategory ? (locale === "bn" ? currentCategory.nameBn : currentCategory.nameEn) : selectedCategory}
                  <button type="button" onClick={() => setSelectedCategory("all")} className="hover:text-primary">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {organicOnly && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-primary/10 text-primary text-[11px] font-medium border border-primary/20">
                  🌿 {locale === "bn" ? "অর্গানিক" : "Organic"}
                  <button type="button" onClick={() => setOrganicOnly(false)}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {dailyBazarOnly && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-700/10 text-emerald-800 text-[11px] font-medium border border-emerald-700/20">
                  ☀️ {locale === "bn" ? "তাজা সকাল" : "Daily Fresh"}
                  <button type="button" onClick={() => setDailyBazarOnly(false)}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {featuredOnly && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-primary/10 text-primary text-[11px] font-medium border border-primary/20">
                  ✦ {locale === "bn" ? "সেরা পছন্দ" : "Featured"}
                  <button type="button" onClick={() => setFeaturedOnly(false)}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {priceRange !== "all" && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-muted text-[11px] font-medium border border-border">
                  {priceOptions.find((p) => p.value === priceRange)?.labelEn}
                  <button type="button" onClick={() => setPriceRange("all")} className="hover:text-primary">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              <button
                type="button"
                onClick={resetAllFilters}
                className="text-[10px] uppercase tracking-[0.1em] text-primary hover:underline font-semibold ml-2"
              >
                {locale === "bn" ? "সব মুছুন" : "Reset All"}
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ── 3. Editorial Products Grid (2-column on mobile) ── */}
      <section className="py-8 sm:py-14 md:py-20">
        <div className="container-full">
          {filteredAndSortedProducts.length === 0 ? (
            <div className="py-20 text-center">
              <p className="font-serif text-2xl text-foreground mb-2">
                {locale === "bn" ? "কোনো পণ্য পাওয়া যায়নি" : "No Pieces Found"}
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground mb-5">
                {locale === "bn"
                  ? "ফিল্টার পরিবর্তন করে আবার চেষ্টা করুন।"
                  : "Try loosening your filters to discover our fresh collections."}
              </p>
              <Button
                variant="outline"
                onClick={resetAllFilters}
                className="rounded-none text-xs tracking-[0.15em] uppercase"
              >
                {locale === "bn" ? "ফিল্টার রিসেট করুন" : "Reset Filters"}
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6 md:gap-8">
              {filteredAndSortedProducts.map((prod, idx) => (
                <ProductCard key={prod.id} product={prod} index={idx} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── 4. Slide-Over Mobile & Desktop Filter Drawer ── */}
      <AnimatePresence>
        {isFilterDrawerOpen && (
          <div className="fixed inset-0 z-50 overflow-hidden select-none">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={() => setIsFilterDrawerOpen(false)}
              className="absolute inset-0 bg-charcoal/60 backdrop-blur-sm"
            />

            {/* Slide-over panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 280 }}
              className="absolute inset-y-0 right-0 max-w-md w-full bg-background shadow-2xl flex flex-col border-l border-border"
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between p-5 border-b border-border">
                <div>
                  <h2 className="font-serif text-2xl text-foreground">
                    {locale === "bn" ? "ফিল্টার ও বাছাই" : "Filter & Refine"}
                  </h2>
                  <p className="text-[11px] text-muted-foreground uppercase tracking-[0.1em] mt-0.5">
                    {filteredAndSortedProducts.length} {locale === "bn" ? "টি পণ্য পাওয়া গেছে" : "pieces available"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsFilterDrawerOpen(false)}
                  className="p-2 text-foreground/70 hover:text-foreground transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-5 space-y-6">
                
                {/* 1. Category Filter */}
                <div>
                  <h3 className="text-xs font-semibold tracking-[0.15em] uppercase text-foreground mb-3">
                    {locale === "bn" ? "বিভাগ / কালেকশন" : "Collections"}
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedCategory("all")}
                      className={cn(
                        "p-2.5 text-xs text-left border rounded-none transition-all flex items-center justify-between",
                        selectedCategory === "all"
                          ? "bg-foreground text-background border-foreground font-semibold"
                          : "bg-background text-foreground border-border hover:border-foreground/40"
                      )}
                    >
                      <span>{locale === "bn" ? "সকল পণ্য" : "All Pieces"}</span>
                      {selectedCategory === "all" && <Check className="w-3.5 h-3.5" />}
                    </button>

                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setSelectedCategory(cat.slug)}
                        className={cn(
                          "p-2.5 text-xs text-left border rounded-none transition-all flex items-center justify-between truncate",
                          selectedCategory === cat.slug
                            ? "bg-foreground text-background border-foreground font-semibold"
                            : "bg-background text-foreground border-border hover:border-foreground/40"
                        )}
                      >
                        <span className="truncate">{locale === "bn" ? cat.nameBn : cat.nameEn}</span>
                        {selectedCategory === cat.slug && <Check className="w-3.5 h-3.5 flex-shrink-0" />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Special Badges & Provenance */}
                <div>
                  <h3 className="text-xs font-semibold tracking-[0.15em] uppercase text-foreground mb-3">
                    {locale === "bn" ? "গুণগত মান ও ধরন" : "Special Attributes"}
                  </h3>
                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={() => setOrganicOnly(!organicOnly)}
                      className={cn(
                        "w-full p-2.5 text-xs border rounded-none transition-all flex items-center justify-between",
                        organicOnly
                          ? "bg-primary text-primary-foreground border-primary font-semibold"
                          : "bg-background text-foreground border-border hover:border-foreground/40"
                      )}
                    >
                      <span className="flex items-center gap-2">
                        <Leaf className="w-3.5 h-3.5" />
                        <span>{locale === "bn" ? "১০০% অর্গানিক ও বিষমুক্ত" : "100% Organic Produce"}</span>
                      </span>
                      {organicOnly && <Check className="w-3.5 h-3.5" />}
                    </button>

                    <button
                      type="button"
                      onClick={() => setDailyBazarOnly(!dailyBazarOnly)}
                      className={cn(
                        "w-full p-2.5 text-xs border rounded-none transition-all flex items-center justify-between",
                        dailyBazarOnly
                          ? "bg-emerald-700 text-white border-emerald-700 font-semibold"
                          : "bg-background text-foreground border-border hover:border-foreground/40"
                      )}
                    >
                      <span className="flex items-center gap-2">
                        <Sun className="w-3.5 h-3.5" />
                        <span>{locale === "bn" ? "দৈনিক তাজা সকালের বাজার" : "Daily Morning Harvest"}</span>
                      </span>
                      {dailyBazarOnly && <Check className="w-3.5 h-3.5" />}
                    </button>

                    <button
                      type="button"
                      onClick={() => setFeaturedOnly(!featuredOnly)}
                      className={cn(
                        "w-full p-2.5 text-xs border rounded-none transition-all flex items-center justify-between",
                        featuredOnly
                          ? "bg-primary text-primary-foreground border-primary font-semibold"
                          : "bg-background text-foreground border-border hover:border-foreground/40"
                      )}
                    >
                      <span className="flex items-center gap-2">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>{locale === "bn" ? "সেরা পছন্দ (Featured)" : "Featured Curations"}</span>
                      </span>
                      {featuredOnly && <Check className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* 3. Price Range Filter */}
                <div>
                  <h3 className="text-xs font-semibold tracking-[0.15em] uppercase text-foreground mb-3">
                    {locale === "bn" ? "মূল্যের পরিসীমা" : "Price Range"}
                  </h3>
                  <div className="space-y-1.5">
                    {priceOptions.map((po) => (
                      <button
                        key={po.value}
                        type="button"
                        onClick={() => setPriceRange(po.value)}
                        className={cn(
                          "w-full p-2.5 text-xs text-left border rounded-none transition-all flex items-center justify-between",
                          priceRange === po.value
                            ? "bg-foreground text-background border-foreground font-semibold"
                            : "bg-background text-foreground border-border hover:border-foreground/40"
                        )}
                      >
                        <span>{locale === "bn" ? po.labelBn : po.labelEn}</span>
                        {priceRange === po.value && <Check className="w-3.5 h-3.5" />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 4. Sort Inside Drawer */}
                <div>
                  <h3 className="text-xs font-semibold tracking-[0.15em] uppercase text-foreground mb-3">
                    {locale === "bn" ? "সাজানোর ক্রম" : "Sort By"}
                  </h3>
                  <div className="space-y-1.5">
                    {sortOptions.map((so) => (
                      <button
                        key={so.value}
                        type="button"
                        onClick={() => setActiveSort(so.value)}
                        className={cn(
                          "w-full p-2.5 text-xs text-left border rounded-none transition-all flex items-center justify-between",
                          activeSort === so.value
                            ? "bg-foreground text-background border-foreground font-semibold"
                            : "bg-background text-foreground border-border hover:border-foreground/40"
                        )}
                      >
                        <span>{locale === "bn" ? so.labelBn : so.labelEn}</span>
                        {activeSort === so.value && <Check className="w-3.5 h-3.5" />}
                      </button>
                    ))}
                  </div>
                </div>

              </div>

              {/* Drawer Footer Actions */}
              <div className="p-4 border-t border-border bg-background flex items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetAllFilters}
                  className="rounded-none h-12 px-4 text-xs tracking-[0.1em] uppercase flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{locale === "bn" ? "রিসেট" : "Reset"}</span>
                </Button>

                <Button
                  type="button"
                  onClick={() => setIsFilterDrawerOpen(false)}
                  className="flex-1 rounded-none h-12 text-xs tracking-[0.15em] uppercase bg-primary hover:bg-primary/90 text-primary-foreground btn-premium font-semibold"
                >
                  {locale === "bn"
                    ? `প্রয়োগ করুন (${filteredAndSortedProducts.length})`
                    : `Apply Filters (${filteredAndSortedProducts.length})`}
                </Button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
