"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { CATEGORIES, PRODUCTS } from "@/lib/catalog";
import { ProductCard } from "@/components/product/ProductCard";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type SortOption = "featured" | "newest" | "price-asc" | "price-desc" | "name-asc";

const sortOptions: { value: SortOption; labelBn: string; labelEn: string }[] = [
  { value: "featured", labelBn: "সেরা পছন্দ", labelEn: "Featured" },
  { value: "newest", labelBn: "নতুন", labelEn: "Newest" },
  { value: "price-asc", labelBn: "মূল্য: কম থেকে বেশি", labelEn: "Price: Low to High" },
  { value: "price-desc", labelBn: "মূল্য: বেশি থেকে কম", labelEn: "Price: High to Low" },
  { value: "name-asc", labelBn: "নাম: অ-হ / A-Z", labelEn: "Alphabetical A-Z" },
];

interface CategoryListingProps {
  initialSlug?: string;
}

export function CategoryListing({ initialSlug = "all" }: CategoryListingProps) {
  const { locale } = useLanguage();
  const activeSlug = initialSlug;

  const [activeSort, setActiveSort] = useState<SortOption>("featured");
  const [organicOnly, setOrganicOnly] = useState(false);

  const currentCategory = activeSlug !== "all"
    ? CATEGORIES.find((c) => c.slug === activeSlug)
    : null;

  const filteredAndSortedProducts = useMemo(() => {
    let result = [...PRODUCTS];

    if (activeSlug !== "all") {
      result = result.filter((p) => p.categorySlug === activeSlug);
    }

    if (organicOnly) {
      result = result.filter((p) => p.isOrganic);
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
  }, [activeSlug, activeSort, organicOnly, locale]);

  const bannerImg = currentCategory
    ? currentCategory.image
    : "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1920&q=80";

  return (
    <div className="w-full">
      {/* ── 1. Hero Banner ── */}
      <section className="relative h-[35vh] md:h-[50vh] overflow-hidden select-none">
        <div className="absolute inset-0">
          <img
            src={bannerImg}
            alt={currentCategory?.nameEn || "All Products"}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-charcoal/30 to-charcoal/20" />
        </div>

        <div className="relative container-full h-full flex flex-col justify-end pb-10 md:pb-14">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <p className="text-[10px] font-semibold tracking-[0.3em] uppercase text-white/60 mb-2">
              {currentCategory ? (locale === "bn" ? "কালেকশন" : "Collection") : (locale === "bn" ? "সব পণ্য" : "Shop All")}
            </p>
            <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl text-white mb-3 leading-[0.96]">
              {currentCategory
                ? (locale === "bn" ? currentCategory.nameBn : currentCategory.nameEn)
                : (locale === "bn" ? "সকল সতেজ সমাহার" : "All Pieces")}
            </h1>
            {currentCategory && (
              <p className="text-sm md:text-base text-white/80 max-w-xl leading-relaxed line-clamp-2">
                {locale === "bn" ? currentCategory.descriptionBn : currentCategory.descriptionEn}
              </p>
            )}
          </motion.div>
        </div>
      </section>

      {/* ── 2. Sticky Filters & Sorting Bar ── */}
      <section className="py-4 border-b border-border sticky top-16 md:top-20 bg-background/95 backdrop-blur-md z-40">
        <div className="container-full">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            
            {/* Collection Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-hide">
              <Link href="/category/all">
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "rounded-none px-4 whitespace-nowrap text-xs tracking-[0.1em] uppercase transition-all",
                    activeSlug === "all"
                      ? "bg-foreground text-background hover:bg-foreground/90 hover:text-background"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {locale === "bn" ? "সব পণ্য" : "All"}
                </Button>
              </Link>

              {CATEGORIES.map((cat) => (
                <Link key={cat.id} href={`/category/${cat.slug}`}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "rounded-none px-4 whitespace-nowrap text-xs tracking-[0.1em] uppercase transition-all",
                      activeSlug === cat.slug
                        ? "bg-foreground text-background hover:bg-foreground/90 hover:text-background"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {locale === "bn" ? cat.nameBn : cat.nameEn}
                  </Button>
                </Link>
              ))}

              <Button
                variant={organicOnly ? "default" : "outline"}
                size="sm"
                onClick={() => setOrganicOnly(!organicOnly)}
                className={cn(
                  "rounded-none px-3 whitespace-nowrap text-xs tracking-[0.1em] uppercase ml-2",
                  organicOnly && "bg-primary text-primary-foreground"
                )}
              >
                🌿 {locale === "bn" ? "অর্গানিক" : "Organic"}
              </Button>
            </div>

            {/* Sorting Selection */}
            <div className="flex items-center justify-between md:justify-end gap-3">
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {filteredAndSortedProducts.length} {locale === "bn" ? "টি পণ্য" : "pieces"}
              </span>

              <div className="relative inline-block">
                <select
                  value={activeSort}
                  onChange={(e) => setActiveSort(e.target.value as SortOption)}
                  className="bg-background border border-border text-foreground text-xs uppercase tracking-[0.1em] px-4 py-2 pr-8 rounded-none appearance-none focus:outline-none focus:border-primary cursor-pointer"
                >
                  {sortOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {locale === "bn" ? opt.labelBn : opt.labelEn}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground" />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── 3. Editorial Products Grid ── */}
      <section className="py-12 md:py-20">
        <div className="container-full">
          {filteredAndSortedProducts.length === 0 ? (
            <div className="py-24 text-center">
              <p className="font-serif text-2xl text-foreground mb-3">
                {locale === "bn" ? "কোনো পণ্য পাওয়া যায়নি" : "No Pieces Found"}
              </p>
              <p className="text-sm text-muted-foreground mb-6">
                {locale === "bn"
                  ? "অনুগ্রহ করে ফিল্টার পরিবর্তন করে আবার চেষ্টা করুন।"
                  : "Try clearing some filters to explore our curated pieces."}
              </p>
              <Button
                variant="outline"
                onClick={() => setOrganicOnly(false)}
                className="rounded-none text-xs tracking-[0.15em] uppercase"
              >
                {locale === "bn" ? "ফিল্টার মুছুন" : "Reset Filters"}
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
    </div>
  );
}
