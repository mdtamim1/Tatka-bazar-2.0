"use client";

import React, { useState, useMemo, use, useRef, useEffect } from "react";
import Link from "next/link";
import {
  SlidersHorizontal, ChevronRight, ChevronDown, X,
  Star, Check, Truck, ShieldCheck, Leaf, Zap
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { CATEGORIES, PRODUCTS } from "@/lib/catalog";
import { ProductCard } from "@/components/product/ProductCard";
import styles from "./page.module.css";

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

export default function CategoryListingPage({ params }: CategoryPageProps) {
  const resolvedParams = use(params);
  const { formatPrice } = useLanguage();

  const isAll = resolvedParams.slug === "all";
  const category = CATEGORIES.find((c) => c.slug === resolvedParams.slug) || {
    id: "all",
    slug: "all",
    nameBn: "All Fresh Products & Daily Deals",
    nameEn: "All Fresh Products & Daily Deals",
    descriptionBn: "Complete fresh collection from trusted local rivers and organic farms",
    descriptionEn: "Complete fresh collection from trusted local rivers and organic farms",
    icon: "🛒",
    image: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&auto=format&fit=crop&q=80",
    itemCount: PRODUCTS.length,
    subcategories: [],
  };

  // ── Filter State ──
  const [selectedSubcategories, setSelectedSubcategories] = useState<string[]>([]);
  const [organicOnly, setOrganicOnly] = useState(false);
  const [dailyDealsOnly, setDailyDealsOnly] = useState(false);
  const [fastDeliveryOnly, setFastDeliveryOnly] = useState(false);
  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(2000);
  const [minRating, setMinRating] = useState<number>(0);
  const [sortBy, setSortBy] = useState<"featured" | "price-asc" | "price-desc" | "rating">("featured");
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // ── Accordion Collapse/Expand State ──
  const [openAccordions, setOpenAccordions] = useState<{ [key: string]: boolean }>({
    subcategories: true,
    price: true,
    tags: true,
    rating: true,
  });

  const toggleAccordion = (section: string) => {
    setOpenAccordions((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  // ── Filtered Products Computation ──
  const filteredProducts = useMemo(() => {
    return PRODUCTS.filter((p) => {
      // 1. Category filter
      if (!isAll && p.categorySlug !== resolvedParams.slug) return false;
      // 2. Subcategory filter
      if (selectedSubcategories.length > 0 && p.subcategorySlug && !selectedSubcategories.includes(p.subcategorySlug)) {
        return false;
      }
      // 3. Quick tags
      if (organicOnly && !p.isOrganic) return false;
      if (dailyDealsOnly && !p.isDailyBazar) return false;
      // 4. Price range
      if (p.basePrice < minPrice || p.basePrice > maxPrice) return false;
      // 5. Rating filter
      if (minRating > 0 && (p.rating || 5) < minRating) return false;

      return true;
    }).sort((a, b) => {
      if (sortBy === "price-asc") return a.basePrice - b.basePrice;
      if (sortBy === "price-desc") return b.basePrice - a.basePrice;
      if (sortBy === "rating") return (b.rating || 5) - (a.rating || 5);
      return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
    });
  }, [
    isAll, resolvedParams.slug, selectedSubcategories,
    organicOnly, dailyDealsOnly, minPrice, maxPrice, minRating, sortBy
  ]);

  // Toggle handlers
  const toggleSubcategory = (sSlug: string) => {
    setSelectedSubcategories((prev) =>
      prev.includes(sSlug) ? prev.filter((s) => s !== sSlug) : [...prev, sSlug]
    );
  };

  const handleResetFilters = () => {
    setSelectedSubcategories([]);
    setOrganicOnly(false);
    setDailyDealsOnly(false);
    setFastDeliveryOnly(false);
    setMinPrice(0);
    setMaxPrice(2000);
    setMinRating(0);
  };

  // Active filter items count
  const activeFiltersCount =
    selectedSubcategories.length +
    (organicOnly ? 1 : 0) +
    (dailyDealsOnly ? 1 : 0) +
    (fastDeliveryOnly ? 1 : 0) +
    (minPrice > 0 || maxPrice < 2000 ? 1 : 0) +
    (minRating > 0 ? 1 : 0);

  const hasActiveFilters = activeFiltersCount > 0;

  // All Category Tabs for Quick Switcher Bar
  const allCategoryTabs = useMemo(() => [
    {
      slug: "all",
      nameEn: "All Products",
      icon: "🛒",
      itemCount: PRODUCTS.length,
    },
    ...CATEGORIES.map((c) => ({
      slug: c.slug,
      nameEn: c.nameEn,
      icon: c.icon,
      itemCount: c.itemCount,
    })),
  ], []);

  const activeTabRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    if (activeTabRef.current) {
      activeTabRef.current.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    }
  }, [resolvedParams.slug]);

  // ── Reusable Filter Content ──
  const renderFilterContent = () => (
    <>
      <div className={styles.filterHeader}>
        <div className={styles.filterTitleGroup}>
          <SlidersHorizontal size={17} color="#0f172a" />
          <span className={styles.filterTitle}>Filters</span>
          {activeFiltersCount > 0 && (
            <span className={styles.filterCountBadge}>
              {activeFiltersCount} active
            </span>
          )}
        </div>
        {hasActiveFilters && (
          <button type="button" onClick={handleResetFilters} className={styles.resetBtn}>
            Clear All
          </button>
        )}
      </div>

      <div className={styles.accordionGroup}>
        {/* 1. Subcategories Accordion */}
        {category.subcategories && category.subcategories.length > 0 && (
          <div className={styles.accordionItem}>
            <button
              type="button"
              onClick={() => toggleAccordion("subcategories")}
              className={styles.accordionHeader}
            >
              <span className={styles.accordionTitle}>
                📂 Subcategories
              </span>
              <ChevronDown
                size={16}
                className={`${styles.accordionChevron} ${openAccordions.subcategories ? styles.accordionChevronOpen : ""}`}
              />
            </button>

            {openAccordions.subcategories && (
              <div className={styles.accordionBody}>
                <div className={styles.pillGrid}>
                  {category.subcategories.map((sub) => {
                    const isSelected = selectedSubcategories.includes(sub.slug);
                    return (
                      <button
                        key={sub.slug}
                        type="button"
                        onClick={() => toggleSubcategory(sub.slug)}
                        className={`${styles.pillBtn} ${isSelected ? styles.pillBtnActive : ""}`}
                      >
                        {isSelected && <Check size={11} />}
                        <span>{sub.nameEn || sub.nameBn}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 2. Quick Filter Tags */}
        <div className={styles.accordionItem}>
          <button
            type="button"
            onClick={() => toggleAccordion("tags")}
            className={styles.accordionHeader}
          >
            <span className={styles.accordionTitle}>
              ✨ Highlights & Tags
            </span>
            <ChevronDown
              size={16}
              className={`${styles.accordionChevron} ${openAccordions.tags ? styles.accordionChevronOpen : ""}`}
            />
          </button>

          {openAccordions.tags && (
            <div className={styles.accordionBody}>
              <div className={styles.pillGrid}>
                <button
                  type="button"
                  onClick={() => setOrganicOnly((prev) => !prev)}
                  className={`${styles.pillBtn} ${organicOnly ? styles.pillBtnActive : ""}`}
                >
                  {organicOnly && <Check size={11} />}
                  <span>🌱 Organic</span>
                </button>

                <button
                  type="button"
                  onClick={() => setDailyDealsOnly((prev) => !prev)}
                  className={`${styles.pillBtn} ${dailyDealsOnly ? styles.pillBtnActive : ""}`}
                >
                  {dailyDealsOnly && <Check size={11} />}
                  <span>⚡ Flash Deals</span>
                </button>

                <button
                  type="button"
                  onClick={() => setFastDeliveryOnly((prev) => !prev)}
                  className={`${styles.pillBtn} ${fastDeliveryOnly ? styles.pillBtnActive : ""}`}
                >
                  {fastDeliveryOnly && <Check size={11} />}
                  <span>🚚 Same-Day</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 3. Price Range Filter */}
        <div className={styles.accordionItem}>
          <button
            type="button"
            onClick={() => toggleAccordion("price")}
            className={styles.accordionHeader}
          >
            <span className={styles.accordionTitle}>
              💰 Price Range
            </span>
            <ChevronDown
              size={16}
              className={`${styles.accordionChevron} ${openAccordions.price ? styles.accordionChevronOpen : ""}`}
            />
          </button>

          {openAccordions.price && (
            <div className={styles.accordionBody}>
              <div className={styles.priceInputRow}>
                <div className={styles.priceBox}>
                  <span className={styles.priceBoxLabel}>Min</span>
                  <div className={styles.priceInputWrapper}>
                    <span className={styles.priceCurrencyPrefix}>৳</span>
                    <input
                      type="number"
                      min={0}
                      max={maxPrice}
                      value={minPrice}
                      onChange={(e) => setMinPrice(Math.max(0, Number(e.target.value) || 0))}
                      className={styles.priceNumberInput}
                    />
                  </div>
                </div>

                <span className={styles.priceDivider}>—</span>

                <div className={styles.priceBox}>
                  <span className={styles.priceBoxLabel}>Max</span>
                  <div className={styles.priceInputWrapper}>
                    <span className={styles.priceCurrencyPrefix}>৳</span>
                    <input
                      type="number"
                      min={minPrice}
                      max={3000}
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(Math.min(3000, Number(e.target.value) || 0))}
                      className={styles.priceNumberInput}
                    />
                  </div>
                </div>
              </div>

              {/* Range Slider */}
              <input
                type="range"
                min={50}
                max={2000}
                step={50}
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className={styles.rangeInput}
              />

              {/* Price Quick Presets */}
              <div className={styles.pricePresetsRow}>
                <button
                  type="button"
                  onClick={() => { setMinPrice(0); setMaxPrice(100); }}
                  className={styles.pricePresetBtn}
                >
                  Under ৳100
                </button>
                <button
                  type="button"
                  onClick={() => { setMinPrice(100); setMaxPrice(500); }}
                  className={styles.pricePresetBtn}
                >
                  ৳100 - ৳500
                </button>
                <button
                  type="button"
                  onClick={() => { setMinPrice(500); setMaxPrice(1000); }}
                  className={styles.pricePresetBtn}
                >
                  ৳500 - ৳1000
                </button>
                <button
                  type="button"
                  onClick={() => { setMinPrice(1000); setMaxPrice(2000); }}
                  className={styles.pricePresetBtn}
                >
                  ৳1000+
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 4. Customer Rating Filter */}
        <div className={styles.accordionItem}>
          <button
            type="button"
            onClick={() => toggleAccordion("rating")}
            className={styles.accordionHeader}
          >
            <span className={styles.accordionTitle}>
              ⭐ Customer Ratings
            </span>
            <ChevronDown
              size={16}
              className={`${styles.accordionChevron} ${openAccordions.rating ? styles.accordionChevronOpen : ""}`}
            />
          </button>

          {openAccordions.rating && (
            <div className={styles.accordionBody}>
              <div className={styles.ratingOptionList}>
                {[
                  { stars: 5, label: "5.0 only" },
                  { stars: 4, label: "4.0 & above" },
                  { stars: 3, label: "3.0 & above" },
                ].map(({ stars, label }) => {
                  const isActive = minRating === stars;
                  return (
                    <button
                      key={stars}
                      type="button"
                      onClick={() => setMinRating((prev) => (prev === stars ? 0 : stars))}
                      className={`${styles.ratingOptionBtn} ${isActive ? styles.ratingOptionBtnActive : ""}`}
                    >
                      <div className={styles.starsRow}>
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={13}
                            className={i < stars ? styles.starFilled : styles.starEmpty}
                          />
                        ))}
                      </div>
                      <span className={styles.ratingLabelText}>{label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );

  return (
    <div className={styles.pageWrapper}>
      {/* ── Top Category Quick-Switch Bar ── */}
      <div className={styles.categoryNavSection}>
        <div className={styles.container}>
          <div className={styles.categoryNavScroll}>
            {allCategoryTabs.map((catTab) => {
              const isActive = resolvedParams.slug === catTab.slug;
              return (
                <Link
                  key={catTab.slug}
                  ref={isActive ? activeTabRef : undefined}
                  href={`/category/${catTab.slug}`}
                  className={`${styles.categoryTab} ${isActive ? styles.categoryTabActive : ""}`}
                  title={catTab.nameEn}
                >
                  <span className={styles.categoryTabIcon}>{catTab.icon}</span>
                  <span>{catTab.nameEn}</span>
                  {typeof catTab.itemCount === "number" && (
                    <span className={styles.categoryTabCount}>{catTab.itemCount}</span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      <div className={styles.container}>
        {/* Breadcrumb Navigation */}
        <div className={styles.breadcrumb}>
          <Link href="/">Home</Link>
          <ChevronRight size={14} />
          <span className={styles.breadcrumbCurrent}>
            {category.nameEn || category.nameBn}
          </span>
        </div>

        {/* Category Hero Header Banner */}
        <div className={styles.heroBanner}>
          <div>
            <div className={styles.bannerTitleRow}>
              <span className={styles.bannerIcon}>{category.icon}</span>
              <h1 className={styles.bannerTitle}>
                {category.nameEn || category.nameBn}
              </h1>
            </div>
            <p className={styles.bannerDesc}>
              {category.descriptionEn || category.descriptionBn}
            </p>
          </div>
          <div className={styles.bannerCountBadge}>
            {filteredProducts.length} Products available
          </div>
        </div>

        {/* Mobile Quick Filter Bar */}
        <div className={styles.mobileFilterBar}>
          <button
            type="button"
            onClick={() => setMobileFilterOpen(true)}
            className={styles.mobileFilterBtn}
          >
            <SlidersHorizontal size={15} />
            <span>Filters</span>
            {activeFiltersCount > 0 && (
              <span className={styles.mobileFilterBtnBadge}>{activeFiltersCount}</span>
            )}
          </button>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleResetFilters}
              className={styles.mobileResetChip}
            >
              <X size={12} /> Reset
            </button>
          )}
        </div>

        {/* ── Main Layout: Sidebar & Products ── */}
        <div className={styles.mainGrid}>
          {/* Desktop Filter Sidebar */}
          <aside className={styles.sidebarCard}>
            {renderFilterContent()}
          </aside>

          {/* Right Main Product Area */}
          <main className={styles.productArea}>
            {/* ── Active Filter Tags Bar ── */}
            {hasActiveFilters && (
              <div className={styles.activeTagsRow}>
                <span className={styles.activeTagsLabel}>Active:</span>

                {selectedSubcategories.map((slug) => {
                  const subObj = category.subcategories?.find((s) => s.slug === slug);
                  return (
                    <button
                      key={slug}
                      type="button"
                      onClick={() => toggleSubcategory(slug)}
                      className={styles.activeFilterChip}
                    >
                      <span>{subObj ? (subObj.nameEn || subObj.nameBn) : slug}</span>
                      <X size={12} />
                    </button>
                  );
                })}

                {organicOnly && (
                  <button
                    type="button"
                    onClick={() => setOrganicOnly(false)}
                    className={styles.activeFilterChip}
                  >
                    <span>🌱 Organic</span>
                    <X size={12} />
                  </button>
                )}

                {dailyDealsOnly && (
                  <button
                    type="button"
                    onClick={() => setDailyDealsOnly(false)}
                    className={styles.activeFilterChip}
                  >
                    <span>⚡ Flash Deals</span>
                    <X size={12} />
                  </button>
                )}

                {fastDeliveryOnly && (
                  <button
                    type="button"
                    onClick={() => setFastDeliveryOnly(false)}
                    className={styles.activeFilterChip}
                  >
                    <span>🚚 Same-Day</span>
                    <X size={12} />
                  </button>
                )}

                {(minPrice > 0 || maxPrice < 2000) && (
                  <button
                    type="button"
                    onClick={() => { setMinPrice(0); setMaxPrice(2000); }}
                    className={styles.activeFilterChip}
                  >
                    <span>৳{minPrice} - ৳{maxPrice}</span>
                    <X size={12} />
                  </button>
                )}

                {minRating > 0 && (
                  <button
                    type="button"
                    onClick={() => setMinRating(0)}
                    className={styles.activeFilterChip}
                  >
                    <span>⭐ {minRating}+ Stars</span>
                    <X size={12} />
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleResetFilters}
                  className={styles.clearAllTagsBtn}
                >
                  Clear All
                </button>
              </div>
            )}

            {/* Top Sort & Count Bar */}
            <div className={styles.sortBar}>
              <div className={styles.productCount}>
                {filteredProducts.length} fresh products found
              </div>

              {/* Sort Selector */}
              <div className={styles.sortGroup}>
                <span className={styles.sortLabel}>Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className={styles.sortSelect}
                >
                  <option value="featured">Popular & Featured</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="rating">Customer Rating</option>
                </select>
              </div>
            </div>

            {/* Product Grid */}
            {filteredProducts.length === 0 ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>🥬</div>
                <h3 className={styles.emptyTitle}>
                  No matching fresh products
                </h3>
                <p className={styles.emptyDesc}>
                  Try adjusting your filters to see more results.
                </p>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className={styles.emptyResetBtn}
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className={styles.productsGrid}>
                {filteredProducts.map((prod) => (
                  <ProductCard key={prod.id} product={prod} />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* ── Slide-in Filter Sidebar Drawer ── */}
      {mobileFilterOpen && (
        <div className={styles.sideDrawerWrapper}>
          <div className={styles.sideDrawerBackdrop} onClick={() => setMobileFilterOpen(false)} />
          <div className={styles.sideDrawerPanel}>
            <div className={styles.sideDrawerHeader}>
              <div className={styles.sideDrawerTitleGroup}>
                <SlidersHorizontal size={18} color="#0f172a" />
                <h3 className={styles.sideDrawerTitle}>Filters</h3>
                {activeFiltersCount > 0 && (
                  <span className={styles.sideDrawerBadge}>{activeFiltersCount}</span>
                )}
              </div>
              <button
                type="button"
                onClick={() => setMobileFilterOpen(false)}
                className={styles.sideDrawerCloseBtn}
                aria-label="Close Filters"
              >
                <X size={18} />
              </button>
            </div>

            <div className={styles.sideDrawerBody}>
              {renderFilterContent()}
            </div>

            <div className={styles.sideDrawerFooter}>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className={styles.sideDrawerResetBtn}
                >
                  Reset
                </button>
              )}
              <button
                type="button"
                onClick={() => setMobileFilterOpen(false)}
                className={styles.sideDrawerApplyBtn}
              >
                <span>Apply Filters</span>
                <span>({filteredProducts.length})</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
