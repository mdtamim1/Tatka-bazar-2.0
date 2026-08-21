"use client";

import React, { useState, useMemo, use } from "react";
import Link from "next/link";
import { Filter, SlidersHorizontal, ChevronRight, X, Sparkles, Store, Leaf } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { CATEGORIES, PRODUCTS, VENDORS } from "@/lib/catalog";
import { ProductCard } from "@/components/product/ProductCard";

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

export default function CategoryListingPage({ params }: CategoryPageProps) {
  const resolvedParams = use(params);
  const { locale, t, formatPrice } = useLanguage();

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

  return (
    <div style={{ padding: "20px 0 60px" }}>
      <div className="container">
        
        {/* Breadcrumb Navigation */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.82rem", color: "var(--text-muted)", marginBottom: "16px" }}>
          <Link href="/" style={{ color: "var(--primary)" }}>হোম</Link>
          <ChevronRight size={14} />
          <span style={{ color: "var(--text-main)", fontWeight: 600 }}>
            {locale === "bn" ? category.nameBn : category.nameEn}
          </span>
        </div>

        {/* Category Hero Header Banner */}
        <div
          style={{
            background: "linear-gradient(135deg, #104C2A 0%, #1B8A4C 100%)",
            borderRadius: "var(--radius-xl)",
            color: "#FFFFFF",
            padding: "32px",
            marginBottom: "30px",
            boxShadow: "var(--shadow-md)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
              <span style={{ fontSize: "2rem" }}>{category.icon}</span>
              <h1 style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)", fontWeight: 800 }}>
                {locale === "bn" ? category.nameBn : category.nameEn}
              </h1>
            </div>
            <p style={{ color: "rgba(255, 255, 255, 0.85)", fontSize: "0.95rem", maxWidth: "600px" }}>
              {locale === "bn" ? category.descriptionBn : category.descriptionEn}
            </p>
          </div>
          <div className="hidden md:block">
            <span style={{ background: "rgba(255, 255, 255, 0.18)", backdropFilter: "blur(6px)", padding: "8px 16px", borderRadius: "var(--radius-full)", fontWeight: 700, fontSize: "0.9rem" }}>
              {filteredProducts.length} {locale === "bn" ? "টি পণ্য উপলব্ধ" : "Products available"}
            </span>
          </div>
        </div>

        {/* Layout: Sidebar Filters + Main Product Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: "30px", alignItems: "flex-start" }}>
          
          {/* Left Filter Sidebar */}
          <div
            style={{
              background: "var(--bg-surface)",
              borderRadius: "var(--radius-lg)",
              border: "1px solid var(--border-subtle)",
              padding: "20px",
              boxShadow: "var(--shadow-sm)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px", paddingBottom: "10px", borderBottom: "1px solid var(--border-subtle)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", fontWeight: 800, fontSize: "0.95rem" }}>
                <SlidersHorizontal size={16} color="var(--primary)" />
                <span>{locale === "bn" ? "ফিল্টার সমূহ" : "Filters"}</span>
              </div>
              {(selectedVendors.length > 0 || organicOnly || dailyDealsOnly) && (
                <button
                  onClick={() => {
                    setSelectedVendors([]);
                    setOrganicOnly(false);
                    setDailyDealsOnly(false);
                    setMaxPrice(2000);
                  }}
                  style={{ fontSize: "0.75rem", color: "var(--crimson)", fontWeight: 700 }}
                >
                  রিসেট
                </button>
              )}
            </div>

            {/* Quick Toggle Checkboxes */}
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "20px" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.85rem", cursor: "pointer", fontWeight: 600 }}>
                <input
                  type="checkbox"
                  checked={organicOnly}
                  onChange={(e) => setOrganicOnly(e.target.checked)}
                  style={{ accentColor: "var(--primary)", width: "16px", height: "16px" }}
                />
                <span>🌱 {locale === "bn" ? "শুধুমাত্র অর্গানিক" : "Organic Only"}</span>
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.85rem", cursor: "pointer", fontWeight: 600 }}>
                <input
                  type="checkbox"
                  checked={dailyDealsOnly}
                  onChange={(e) => setDailyDealsOnly(e.target.checked)}
                  style={{ accentColor: "var(--primary)", width: "16px", height: "16px" }}
                />
                <span>⚡ {locale === "bn" ? "আজকের ফ্ল্যাশ অফার" : "Flash Deals Only"}</span>
              </label>
            </div>

            {/* Price Range Slider */}
            <div style={{ marginBottom: "24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", fontWeight: 700, marginBottom: "8px" }}>
                <span>{locale === "bn" ? "সর্বোচ্চ মূল্য:" : "Max Price:"}</span>
                <span style={{ color: "var(--primary-dark)" }}>{formatPrice(maxPrice)}</span>
              </div>
              <input
                type="range"
                min={50}
                max={2000}
                step={50}
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                style={{ width: "100%", accentColor: "var(--primary)" }}
              />
            </div>

            {/* Multi-Vendor Partner Filter */}
            <div>
              <div style={{ fontWeight: 700, fontSize: "0.85rem", marginBottom: "10px", color: "var(--text-main)" }}>
                {locale === "bn" ? "বিক্রেতা দোকানসমূহ" : "Partner Sellers"}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.82rem", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={selectedVendors.includes("tatka-bazar-official")}
                    onChange={() => toggleVendorFilter("tatka-bazar-official")}
                    style={{ accentColor: "var(--primary)" }}
                  />
                  <span>✓ {locale === "bn" ? "তাতকা বাজার অফিসিয়াল" : "Tatka Bazar Official"}</span>
                </label>
                {VENDORS.map((v) => (
                  <label key={v.id} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.82rem", cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={selectedVendors.includes(v.slug)}
                      onChange={() => toggleVendorFilter(v.slug)}
                      style={{ accentColor: "var(--primary)" }}
                    />
                    <span>{locale === "bn" ? v.nameBn : v.nameEn}</span>
                  </label>
                ))}
              </div>
            </div>

          </div>

          {/* Right Main Product Area */}
          <div>
            {/* Top Sort & Count Bar */}
            <div
              style={{
                background: "var(--bg-surface)",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--border-subtle)",
                padding: "12px 18px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px",
                flexWrap: "wrap",
                gap: "12px",
              }}
            >
              <div style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--text-main)" }}>
                {filteredProducts.length} {locale === "bn" ? "টি তাজা পণ্য প্রদর্শিত হচ্ছে" : "fresh products found"}
              </div>

              {/* Sort Selector */}
              <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.85rem" }}>
                <span style={{ color: "var(--text-muted)" }}>{locale === "bn" ? "সাজান:" : "Sort by:"}</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  style={{
                    padding: "6px 12px",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid var(--border-medium)",
                    background: "var(--bg-surface)",
                    color: "var(--text-main)",
                    fontWeight: 600,
                    outline: "none",
                  }}
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
              <div
                style={{
                  background: "var(--bg-surface)",
                  borderRadius: "var(--radius-lg)",
                  padding: "60px 20px",
                  textAlign: "center",
                  border: "1px solid var(--border-subtle)",
                }}
              >
                <div style={{ fontSize: "2.5rem", marginBottom: "10px" }}>🥬</div>
                <h3 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "6px" }}>
                  {locale === "bn" ? "কোনো পণ্য পাওয়া যায়নি" : "No matching fresh products"}
                </h3>
                <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: "16px" }}>
                  {locale === "bn" ? "ফিল্টার পরিবর্তন করে আবার চেষ্টা করুন।" : "Try adjusting your filters to see more results."}
                </p>
                <button
                  onClick={() => {
                    setSelectedVendors([]);
                    setOrganicOnly(false);
                    setDailyDealsOnly(false);
                    setMaxPrice(2000);
                  }}
                  className="btn-primary"
                >
                  ফিল্টার রিসেট করুন
                </button>
              </div>
            ) : (
              <div className="product-grid">
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
