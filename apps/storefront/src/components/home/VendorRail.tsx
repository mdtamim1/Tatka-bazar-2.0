"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Store, Star, CheckCircle, ArrowRight, MapPin, Package, TrendingUp } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { VENDORS } from "@/lib/catalog";

export function VendorRail() {
  const { locale, t } = useLanguage();
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <section style={{ padding: "32px 0" }}>
      <div className="container">

        {/* Section Header */}
        <div
          style={{
            display: "flex", justifyContent: "space-between",
            alignItems: "flex-end", marginBottom: "24px",
          }}
        >
          <div>
            <div className="section-eyebrow section-eyebrow--green" style={{ marginBottom: "10px" }}>
              <Store size={12} />
              <span>{locale === "bn" ? "মাল্টি-ভেন্ডর মার্কেটপ্লেস" : "Multi-Vendor Marketplace"}</span>
            </div>
            <h2 className="section-heading">
              {t.featuredVendors || (locale === "bn" ? "বিশ্বস্ত বিক্রেতাদের দোকান" : "Featured Partner Shops")}
            </h2>
            <p className="section-subheading">
              {locale === "bn"
                ? "যাচাইকৃত স্থানীয় কৃষক, মৎস্যজীবী ও উৎপাদকদের কাছ থেকে সরাসরি কিনুন।"
                : "Shop directly from verified local growers, fishermen and artisanal producers."}
            </p>
          </div>
          <Link href="/category/all?filter=vendor" className="view-all-link">
            <span>{locale === "bn" ? "সব দোকান" : "All Shops"}</span>
            <ArrowRight size={15} />
          </Link>
        </div>

        {/* Vendors Grid */}
        <div className="vendor-grid">
          {VENDORS.map(vendor => {
            const isHovered = hoveredId === vendor.id;
            return (
              <div
                key={vendor.id}
                className="vendor-card"
                onMouseEnter={() => setHoveredId(vendor.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                {/* Banner Image */}
                <div style={{ height: "120px", position: "relative", overflow: "hidden", background: "var(--bg-subtle)", flexShrink: 0 }}>
                  <img
                    src={vendor.banner}
                    alt={locale === "bn" ? vendor.nameBn : vendor.nameEn}
                    style={{
                      width: "100%", height: "100%", objectFit: "cover",
                      transition: "transform 0.6s var(--ease-out)",
                      transform: isHovered ? "scale(1.08)" : "scale(1)",
                    }}
                  />
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, transparent 35%, rgba(0,0,0,0.42) 100%)" }} />

                  {/* Badge overlay */}
                  <div style={{ position: "absolute", top: "10px", right: "10px" }}>
                    <span
                      style={{
                        background: "rgba(10, 20, 12, 0.82)",
                        backdropFilter: "blur(8px)",
                        color: "#fff",
                        padding: "4px 11px",
                        borderRadius: "var(--radius-full)",
                        fontSize: "0.67rem", fontWeight: 800,
                        border: "1px solid rgba(255,255,255,0.14)",
                        letterSpacing: "0.02em",
                      }}
                    >
                      {locale === "bn" ? vendor.badgeBn : vendor.badgeEn}
                    </span>
                  </div>

                  {/* Trending badge */}
                  <div style={{ position: "absolute", top: "10px", left: "10px" }}>
                    <span
                      style={{
                        display: "flex", alignItems: "center", gap: "4px",
                        background: "rgba(245, 158, 11, 0.9)",
                        color: "#fff",
                        padding: "3px 9px",
                        borderRadius: "var(--radius-full)",
                        fontSize: "0.62rem", fontWeight: 800,
                      }}
                    >
                      <TrendingUp size={9} />
                      {locale === "bn" ? "ট্রেন্ডিং" : "Trending"}
                    </span>
                  </div>
                </div>

                {/* Body */}
                <div style={{ padding: "0 18px 18px", flex: 1, display: "flex", flexDirection: "column" }}>
                  {/* Avatar + name */}
                  <div style={{ display: "flex", gap: "12px", alignItems: "flex-start", marginTop: "-30px", marginBottom: "16px" }}>
                    <div style={{ position: "relative", flexShrink: 0 }}>
                      <img
                        src={vendor.logo}
                        alt={locale === "bn" ? vendor.nameBn : vendor.nameEn}
                        style={{
                          width: "60px", height: "60px",
                          borderRadius: "var(--radius-md)",
                          border: "3px solid var(--bg-surface)",
                          boxShadow: isHovered
                            ? "0 6px 20px rgba(34,197,94,0.3)"
                            : "0 4px 14px rgba(0,0,0,0.14)",
                          objectFit: "cover", background: "#fff",
                          transition: "box-shadow var(--t-smooth)",
                        }}
                      />
                      {vendor.verified && (
                        <div
                          style={{
                            position: "absolute", bottom: "-4px", right: "-4px",
                            width: "22px", height: "22px",
                            borderRadius: "50%",
                            background: "var(--primary)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            border: "2px solid var(--bg-surface)",
                            boxShadow: "0 2px 8px rgba(34,197,94,0.4)",
                            animation: isHovered ? "glowRing 1.5s ease-in-out infinite" : "none",
                          }}
                        >
                          <CheckCircle size={13} color="#fff" fill="#fff" strokeWidth={1} />
                        </div>
                      )}
                    </div>
                    <div style={{ paddingTop: "26px", flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <h3
                          style={{
                            fontSize: "var(--text-base)", fontWeight: 800,
                            color: "var(--text-main)",
                            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                          }}
                        >
                          {locale === "bn" ? vendor.nameBn : vendor.nameEn}
                        </h3>
                      </div>
                      <div
                        style={{
                          display: "flex", alignItems: "center", gap: "10px",
                          fontSize: "var(--text-xs)", color: "var(--text-muted)",
                          marginTop: "4px", flexWrap: "wrap",
                        }}
                      >
                        <span style={{ display: "flex", alignItems: "center", gap: "3px" }}>
                          <MapPin size={10} color="var(--amber)" />
                          {locale === "bn" ? vendor.locationBn : vendor.locationEn}
                        </span>
                        <span
                          style={{
                            display: "flex", alignItems: "center", gap: "3px",
                            color: "var(--amber-deep)", fontWeight: 700,
                          }}
                        >
                          <Star size={11} fill="var(--amber)" color="var(--amber)" />
                          {vendor.rating}
                          <span style={{ color: "var(--text-subtle)", fontWeight: 500 }}>({vendor.reviewsCount})</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Meta chips */}
                  <div style={{ display: "flex", gap: "7px", marginBottom: "12px", flexWrap: "wrap" }}>
                    <span
                      style={{
                        display: "flex", alignItems: "center", gap: "4px",
                        padding: "4px 10px",
                        background: "var(--bg-subtle)",
                        borderRadius: "var(--radius-full)",
                        fontSize: "0.67rem", fontWeight: 700, color: "var(--text-muted)",
                        border: "1px solid var(--border-subtle)",
                      }}
                    >
                      <Package size={10} />
                      50+ {locale === "bn" ? "পণ্য" : "items"}
                    </span>
                    {vendor.verified && (
                      <span
                        style={{
                          padding: "4px 10px",
                          background: "rgba(34,197,94,0.1)",
                          borderRadius: "var(--radius-full)",
                          fontSize: "0.67rem", fontWeight: 800,
                          color: "var(--primary-dark)",
                          border: "1px solid rgba(34,197,94,0.22)",
                        }}
                      >
                        ✓ {locale === "bn" ? "যাচাইকৃত" : "Verified"}
                      </span>
                    )}
                  </div>

                  <p
                    style={{
                      fontSize: "var(--text-xs)", color: "var(--text-muted)",
                      lineHeight: 1.6, marginBottom: "16px",
                    }}
                  >
                    {locale === "bn" ? vendor.taglineBn : vendor.taglineEn}
                  </p>

                  {/* CTA */}
                  <Link
                    href={`/shop/${vendor.slug}`}
                    style={{
                      marginTop: "auto",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      gap: "7px", padding: "11px",
                      borderRadius: "var(--radius-md)",
                      background: isHovered
                        ? "linear-gradient(135deg, #22C55E, #15803D)"
                        : "rgba(34,197,94,0.08)",
                      color: isHovered ? "#fff" : "var(--primary-dark)",
                      fontWeight: 700, fontSize: "var(--text-sm)",
                      transition: "all var(--t-smooth)",
                      border: isHovered
                        ? "1.5px solid transparent"
                        : "1.5px solid rgba(34,197,94,0.2)",
                      textDecoration: "none",
                      boxShadow: isHovered ? "0 6px 20px rgba(34,197,94,0.35)" : "none",
                    }}
                  >
                    <span>{t.visitShop || (locale === "bn" ? "দোকান দেখুন" : "Visit Shop")}</span>
                    <ArrowRight
                      size={15}
                      style={{
                        transition: "transform var(--t-smooth)",
                        transform: isHovered ? "translateX(4px)" : "translateX(0)",
                      }}
                    />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
