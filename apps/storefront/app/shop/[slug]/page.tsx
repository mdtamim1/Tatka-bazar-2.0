"use client";

import React, { use } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Store, Star, MapPin, CheckCircle, Calendar, PackageCheck, ChevronRight, ShieldCheck } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { VENDORS, PRODUCTS } from "@/lib/catalog";
import { ProductCard } from "@/components/product/ProductCard";

interface ShopPageProps {
  params: Promise<{ slug: string }>;
}

export default function VendorShopPage({ params }: ShopPageProps) {
  const resolvedParams = use(params);
  const { locale, t } = useLanguage();

  const isOfficial = resolvedParams.slug === "tatka-bazar-official";
  const vendor = isOfficial
    ? {
        id: "tatka-official",
        slug: "tatka-bazar-official",
        nameBn: "তাতকা বাজার নিজস্ব ফ্রেশ স্টক",
        nameEn: "Tatka Bazar Official Fresh Hub",
        taglineBn: "সরাসরি নদী, খামার ও কেন্দ্রীয় মিল থেকে বাছাইকৃত নিজস্ব সতেজ স্টক",
        taglineEn: "Directly sourced river catch, organic farm produce and central mill grains",
        logo: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=200&auto=format&fit=crop&q=80",
        banner: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1200&auto=format&fit=crop&q=80",
        rating: 5.0,
        reviewsCount: 420,
        locationBn: "তেজগাঁও সেন্ট্রাল হাব, ঢাকা",
        locationEn: "Tejgaon Central Hub, Dhaka",
        joinedYear: 2021,
        totalProducts: 120,
        verified: true,
        badgeBn: "🌟 অফিসিয়াল ফ্ল্যাগশিপ",
        badgeEn: "🌟 Official Flagship",
      }
    : VENDORS.find((v) => v.slug === resolvedParams.slug);

  if (!vendor) {
    return notFound();
  }

  const vendorProducts = PRODUCTS.filter((p) =>
    isOfficial ? p.isOfficialTatka : p.vendorSlug === resolvedParams.slug
  );

  return (
    <div style={{ padding: "20px 0 60px" }}>
      <div className="container">
        
        {/* Breadcrumb Navigation */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.82rem", color: "var(--text-muted)", marginBottom: "16px" }}>
          <Link href="/" style={{ color: "var(--primary)" }}>হোম</Link>
          <ChevronRight size={14} />
          <span style={{ color: "var(--text-muted)" }}>পার্টনার শপ</span>
          <ChevronRight size={14} />
          <span style={{ color: "var(--text-main)", fontWeight: 600 }}>
            {locale === "bn" ? vendor.nameBn : vendor.nameEn}
          </span>
        </div>

        {/* Vendor Header Card */}
        <div
          style={{
            background: "var(--bg-surface)",
            borderRadius: "var(--radius-xl)",
            border: "1px solid var(--border-subtle)",
            overflow: "hidden",
            boxShadow: "var(--shadow-md)",
            marginBottom: "36px",
          }}
        >
          {/* Banner */}
          <div style={{ height: "180px", position: "relative", overflow: "hidden", background: "var(--bg-subtle)" }}>
            <img
              src={vendor.banner}
              alt={locale === "bn" ? vendor.nameBn : vendor.nameEn}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
            <div style={{ position: "absolute", top: "14px", right: "14px" }}>
              <span
                style={{
                  background: "rgba(15, 26, 19, 0.85)",
                  backdropFilter: "blur(6px)",
                  color: "#FFF",
                  padding: "6px 14px",
                  borderRadius: "var(--radius-full)",
                  fontSize: "0.82rem",
                  fontWeight: 700,
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                }}
              >
                {locale === "bn" ? vendor.badgeBn : vendor.badgeEn}
              </span>
            </div>
          </div>

          {/* Profile & Info Strip */}
          <div style={{ padding: "0 28px 24px" }}>
            <div style={{ display: "flex", gap: "20px", alignItems: "flex-end", marginTop: "-44px", flexWrap: "wrap" }}>
              <img
                src={vendor.logo}
                alt="Logo"
                style={{
                  width: "88px",
                  height: "88px",
                  borderRadius: "var(--radius-lg)",
                  border: "4px solid #FFF",
                  boxShadow: "0 6px 16px rgba(0,0,0,0.12)",
                  objectFit: "cover",
                  background: "#FFF",
                }}
              />
              <div style={{ flex: 1, paddingTop: "10px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--text-main)" }}>
                    {locale === "bn" ? vendor.nameBn : vendor.nameEn}
                  </h1>
                  {vendor.verified && (
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", color: "var(--primary)", fontSize: "0.8rem", fontWeight: 700 }}>
                      <CheckCircle size={18} />
                      {locale === "bn" ? "ভেরিফাইড পার্টনার" : "Verified"}
                    </span>
                  )}
                </div>
                <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", marginTop: "4px" }}>
                  {locale === "bn" ? vendor.taglineBn : vendor.taglineEn}
                </p>
              </div>

              {/* Vendor Stats Pills */}
              <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                <div style={{ background: "var(--bg-subtle)", padding: "8px 14px", borderRadius: "var(--radius-md)", textAlign: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "4px", color: "var(--accent)", fontWeight: 800, fontSize: "0.95rem" }}>
                    <Star size={15} fill="var(--accent)" />
                    <span>{vendor.rating}</span>
                  </div>
                  <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>{vendor.reviewsCount} রিভিউ</div>
                </div>

                <div style={{ background: "var(--bg-subtle)", padding: "8px 14px", borderRadius: "var(--radius-md)", textAlign: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "4px", color: "var(--primary-dark)", fontWeight: 800, fontSize: "0.95rem" }}>
                    <PackageCheck size={15} />
                    <span>{vendorProducts.length}</span>
                  </div>
                  <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>তাজা পণ্য</div>
                </div>

                <div style={{ background: "var(--bg-subtle)", padding: "8px 14px", borderRadius: "var(--radius-md)", textAlign: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "4px", color: "var(--text-main)", fontWeight: 800, fontSize: "0.95rem" }}>
                    <MapPin size={15} color="var(--accent)" />
                    <span style={{ fontSize: "0.82rem" }}>{locale === "bn" ? vendor.locationBn.split(",")[0] : vendor.locationEn.split(",")[0]}</span>
                  </div>
                  <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>অবস্থান</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Vendor Products Showcase */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <h2 style={{ fontSize: "1.3rem", fontWeight: 800, color: "var(--text-main)" }}>
              {locale === "bn" ? `${vendor.nameBn} এর তাজা পণ্যসমূহ` : `Fresh Products by ${vendor.nameEn}`}
            </h2>
            <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
              {vendorProducts.length} {locale === "bn" ? "টি পণ্য" : "items available"}
            </span>
          </div>

          <div className="product-grid">
            {vendorProducts.map((prod) => (
              <ProductCard key={prod.id} product={prod} />
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
