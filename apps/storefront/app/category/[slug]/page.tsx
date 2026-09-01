"use client";

import React, { useState, useMemo, use } from "react";
import Link from "next/link";
import { SlidersHorizontal, ChevronRight, Filter, X } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { CATEGORIES, PRODUCTS, VENDORS } from "@/lib/catalog";
import { ProductCard } from "@/components/product/ProductCard";
import styles from "./page.module.css";

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

export default function CategoryListingPage({ params }: CategoryPageProps) {
  const resolvedParams = use(params);
  const { locale, formatPrice } = useLanguage();

  const isAll = resolvedParams.slug === "all";
  const category = CATEGORIES.find((c) => c.slug === resolvedParams.slug) || {
    id: "all",
    slug: "all",
    nameBn: "সকল তাজা পণ্য ও বাজার অফার",
    nameEn: "All Fresh Products & Daily Deals",
    descriptionBn: "নদী ও খামার থেকে প্রতিদিনের সতেজ পণ্যের সম্পূর্ণ সংগ্রহ",
    descriptionEn: "Complete fresh collection from trusted local rivers and organic farms",
    icon: "🛒",
    image: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&auto=format&fit=crop&q=80",
    itemCount: PRODUCTS.length,
  };

  // Filter & Sort state
  const [selectedVendors, setSelectedVendors] = useState<string[]>([]);
  const [organicOnly, setOrganicOnly] = useState(false);
  const [dailyDealsOnly, setDailyDealsOnly] = useState(false);
  const [maxPrice, setMaxPrice] = useState<number>(2000);
  const [sortBy, setSortBy] = useState<"featured" | "price-asc" | "price-desc" | "rating">("featured");
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const filteredProducts = useMemo(() => {
    return PRODUCTS.filter((p) => {
      // Category filter
      if (!isAll && p.categorySlug !== resolvedParams.slug) return false;
      // Vendor filter
      if (selectedVendors.length > 0 && !selectedVendors.includes(p.vendorSlug)) return false;
      // Organic filter
      if (organicOnly && !p.isOrganic) return false;
      // Daily Deals filter
      if (dailyDealsOnly && !p.isDailyBazar) return false;
      // Price range
      if (p.basePrice > maxPrice) return false;
      return true;
    }).sort((a, b) => {
      if (sortBy === "price-asc") return a.basePrice - b.basePrice;
      if (sortBy === "price-desc") return b.basePrice - a.basePrice;
      if (sortBy === "rating") return b.rating - a.rating;
      return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
    });
  }, [isAll, resolvedParams.slug, selectedVendors, organicOnly, dailyDealsOnly, maxPrice, sortBy]);

  const toggleVendorFilter = (vSlug: string) => {
    setSelectedVendors((prev) =>
      prev.includes(vSlug) ? prev.filter((s) => s !== vSlug) : [...prev, vSlug]
    );
  };

  const handleResetFilters = () => {
    setSelectedVendors([]);
    setOrganicOnly(false);
    setDailyDealsOnly(false);
    setMaxPrice(2000);
  };

  const hasActiveFilters = selectedVendors.length > 0 || organicOnly || dailyDealsOnly || maxPrice < 2000;

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.container}>
        
        {/* Breadcrumb Navigation */}
        <div className={styles.breadcrumb}>
          <Link href="/">হোম</Link>
          <ChevronRight size={14} />
          <span className={styles.breadcrumbCurrent}>
            {locale === "bn" ? category.nameBn : category.nameEn}
          </span>
        </div>

        {/* Category Hero Header Banner */}
        <div className={styles.heroBanner}>
          <div>
            <div className={styles.bannerTitleRow}>
              <span className={styles.bannerIcon}>{category.icon}</span>
              <h1 className={styles.bannerTitle}>
                {locale === "bn" ? category.nameBn : category.nameEn}
              </h1>
            </div>
            <p className={styles.bannerDesc}>
              {locale === "bn" ? category.descriptionBn : category.descriptionEn}
            </p>
          </div>
          <div className={styles.bannerCountBadge}>
            {filteredProducts.length} {locale === "bn" ? "টি পণ্য উপলব্ধ" : "Products available"}
          </div>
        </div>

        {/* Mobile Quick Filter Bar (Visible only on mobile <= 900px) */}
        <div className={styles.mobileFilterBar}>
          <button
            type="button"
            onClick={() => setMobileFilterOpen((prev) => !prev)}
            className={styles.mobileFilterBtn}
          >
            <SlidersHorizontal size={14} />
            <span>{mobileFilterOpen ? "ফিল্টার বন্ধ" : "ফিল্টার"}</span>
          </button>

          <button
            type="button"
            onClick={() => setOrganicOnly((prev) => !prev)}
            className={`${styles.mobileFilterChip} ${organicOnly ? styles.mobileFilterChipActive : ""}`}
          >
            🌱 অর্গানিক
          </button>

          <button
            type="button"
            onClick={() => setDailyDealsOnly((prev) => !prev)}
            className={`${styles.mobileFilterChip} ${dailyDealsOnly ? styles.mobileFilterChipActive : ""}`}
          >
            ⚡ ফ্ল্যাশ অফার
          </button>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleResetFilters}
              className={styles.mobileFilterChip}
              style={{ color: "#ef4444", borderColor: "#fca5a5" }}
            >
              <X size={12} /> রিসেট
            </button>
          )}
        </div>

        {/* Layout: Sidebar Filters + Main Product Grid */}
        <div className={styles.mainGrid}>
          
          {/* Filter Sidebar (Desktop + Expandable on Mobile) */}
          <div className={`${styles.sidebarCard} ${mobileFilterOpen ? styles.sidebarCardOpen : ""}`}>
            <div className={styles.filterHeader}>
              <div className={styles.filterTitle}>
                <SlidersHorizontal size={16} color="#3056D3" />
                <span>{locale === "bn" ? "ফিল্টার সমূহ" : "Filters"}</span>
              </div>
              {hasActiveFilters && (
                <button onClick={handleResetFilters} className={styles.resetBtn}>
                  রিসেট
                </button>
              )}
            </div>

            {/* Quick Toggle Checkboxes */}
            <div className={styles.toggleGroup}>
              <label className={styles.filterCheckboxLabel}>
                <input
                  type="checkbox"
                  checked={organicOnly}
                  onChange={(e) => setOrganicOnly(e.target.checked)}
                />
                <span>🌱 {locale === "bn" ? "শুধুমাত্র অর্গানিক" : "Organic Only"}</span>
              </label>
              <label className={styles.filterCheckboxLabel}>
                <input
                  type="checkbox"
                  checked={dailyDealsOnly}
                  onChange={(e) => setDailyDealsOnly(e.target.checked)}
                />
                <span>⚡ {locale === "bn" ? "আজকের ফ্ল্যাশ অফার" : "Flash Deals Only"}</span>
              </label>
            </div>

            {/* Price Range Slider */}
            <div className={styles.priceFilterGroup}>
              <div className={styles.priceLabelRow}>
                <span>{locale === "bn" ? "সর্বোচ্চ মূল্য:" : "Max Price:"}</span>
                <span className={styles.priceValue}>{formatPrice(maxPrice)}</span>
              </div>
              <input
                type="range"
                min={50}
                max={2000}
                step={50}
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className={styles.rangeInput}
              />
            </div>

            {/* Multi-Vendor Partner Filter */}
            <div>
              <div className={styles.vendorGroupTitle}>
                {locale === "bn" ? "বিক্রেতা দোকানসমূহ" : "Partner Sellers"}
              </div>
              <div className={styles.vendorList}>
                <label className={styles.filterCheckboxLabel}>
                  <input
                    type="checkbox"
                    checked={selectedVendors.includes("tatka-bazar-official")}
                    onChange={() => toggleVendorFilter("tatka-bazar-official")}
                  />
                  <span>✓ {locale === "bn" ? "তাতকা বাজার অফিসিয়াল" : "Tatka Bazar Official"}</span>
                </label>
                {VENDORS.map((v) => (
                  <label key={v.id} className={styles.filterCheckboxLabel}>
                    <input
                      type="checkbox"
                      checked={selectedVendors.includes(v.slug)}
                      onChange={() => toggleVendorFilter(v.slug)}
                    />
                    <span>{locale === "bn" ? v.nameBn : v.nameEn}</span>
                  </label>
                ))}
              </div>
            </div>

          </div>

          {/* Right Main Product Area */}
          <div className={styles.productArea}>
            {/* Top Sort & Count Bar */}
            <div className={styles.sortBar}>
              <div className={styles.productCount}>
                {filteredProducts.length} {locale === "bn" ? "টি তাজা পণ্য প্রদর্শিত হচ্ছে" : "fresh products found"}
              </div>

              {/* Sort Selector */}
              <div className={styles.sortGroup}>
                <span className={styles.sortLabel}>{locale === "bn" ? "সাজান:" : "Sort by:"}</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className={styles.sortSelect}
                >
                  <option value="featured">{locale === "bn" ? "জনপ্রিয় ও সেরা" : "Popular & Featured"}</option>
                  <option value="price-asc">{locale === "bn" ? "দাম: কম থেকে বেশি" : "Price: Low to High"}</option>
                  <option value="price-desc">{locale === "bn" ? "দাম: বেশি থেকে কম" : "Price: High to Low"}</option>
                  <option value="rating">{locale === "bn" ? "সর্বোচ্চ রেটিং" : "Customer Rating"}</option>
                </select>
              </div>
            </div>

            {/* Product Grid */}
            {filteredProducts.length === 0 ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>🥬</div>
                <h3 className={styles.emptyTitle}>
                  {locale === "bn" ? "কোনো পণ্য পাওয়া যায়নি" : "No matching fresh products"}
                </h3>
                <p className={styles.emptyDesc}>
                  {locale === "bn" ? "ফিল্টার পরিবর্তন করে আবার চেষ্টা করুন।" : "Try adjusting your filters to see more results."}
                </p>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className={styles.emptyResetBtn}
                >
                  ফিল্টার রিসেট করুন
                </button>
              </div>
            ) : (
              <div className={styles.productsGrid}>
                {filteredProducts.map((prod) => (
                  <ProductCard key={prod.id} product={prod} />
                ))}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
