"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ShoppingBag, Check, Heart, MapPin, Star, Store, Leaf, Eye } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useCartStore } from "@/lib/cart-store";
import type { Product } from "@/types";

interface ProductCardProps { product: Product; }

function formatPrice(p: number) { return `৳${p.toLocaleString("en-BD")}`; }

export function ProductCard({ product }: ProductCardProps) {
  const { locale } = useLanguage();
  const { addItem, wishlistIds, toggleWishlist } = useCartStore();
  const [isAdded, setIsAdded]             = useState(false);
  const [isHovered, setIsHovered]         = useState(false);
  const [selectedWeight, setSelectedWeight] = useState(
    product.weightOptions?.[0]?.value || 1
  );

  const isFav = wishlistIds.includes(product.id);

  const activeWeightOpt = product.weightOptions?.find(w => w.value === selectedWeight) || {
    value: 1, unit: product.baseUnit, multiplier: 1,
  };
  const currentPrice      = Math.round(product.basePrice * activeWeightOpt.multiplier);
  const compareCurrentPrice = product.comparePrice
    ? Math.round(product.comparePrice * activeWeightOpt.multiplier)
    : null;

  const discount = compareCurrentPrice
    ? Math.round((1 - currentPrice / compareCurrentPrice) * 100)
    : product.flashDiscount || null;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, activeWeightOpt.value, activeWeightOpt.unit, currentPrice, 1);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1800);
  };

  return (
    <div
      className="premium-card"
      style={{ display: "flex", flexDirection: "column", position: "relative" }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* ── Image ─────────────────────────────────────────── */}
      <Link
        href={`/product/${product.slug}`}
        style={{
          position: "relative",
          display: "block",
          aspectRatio: "4/3",
          overflow: "hidden",
          background: "var(--bg-subtle)",
        }}
      >
        <img
          src={product.images[0]}
          alt={locale === "bn" ? product.nameBn : product.nameEn}
          loading="lazy"
          style={{
            width: "100%", height: "100%",
            objectFit: "cover",
            transition: "transform 0.55s var(--ease-out)",
            transform: isHovered ? "scale(1.09)" : "scale(1)",
          }}
        />

        {/* Hover overlay */}
        <div
          style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(180deg, transparent 40%, rgba(8,9,11,0.75) 100%)",
            transition: "opacity var(--t-smooth)",
            opacity: isHovered ? 1 : 0.65,
          }}
        />

        {/* Badges top-left */}
        <div
          style={{
            position: "absolute", top: "8px", left: "8px",
            display: "flex", flexDirection: "column", gap: "5px",
            zIndex: 10,
          }}
        >
          {discount && (
            <span
              className="badge-discount"
              style={{ animation: "badgePop 2.5s ease infinite" }}
            >
              -{discount}%
            </span>
          )}
          {product.isOrganic && (
            <span className="badge-organic" style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
              <Leaf size={10} />
              <span>{locale === "bn" ? "জৈব" : "Organic"}</span>
            </span>
          )}
          {product.isDailyBazar && <span className="badge-new">DAILY</span>}
        </div>

        {/* Wishlist button */}
        <button
          type="button"
          onClick={e => { e.preventDefault(); e.stopPropagation(); toggleWishlist(product.id); }}
          aria-label={isFav ? "Remove from wishlist" : "Add to wishlist"}
          style={{
            position: "absolute", top: "8px", right: "8px",
            width: "36px", height: "36px",
            borderRadius: "50%",
            background: isFav ? "rgba(255,77,109,0.15)" : "rgba(8,9,11,0.7)",
            backdropFilter: "blur(12px)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: isFav ? "var(--rose)" : "var(--text-muted)",
            boxShadow: "0 2px 12px rgba(0,0,0,0.4)",
            zIndex: 10, border: isFav ? "1px solid rgba(255,77,109,0.35)" : "1px solid rgba(255,255,255,0.12)",
            cursor: "pointer",
            transition: "all 0.25s var(--ease-bounce)",
            transform: isHovered ? "scale(1.08)" : "scale(1)",
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.18)"; }}
          onMouseLeave={e => { e.currentTarget.style.transform = isHovered ? "scale(1.08)" : "scale(1)"; }}
        >
          <Heart size={15} fill={isFav ? "var(--rose)" : "none"} strokeWidth={2.5} />
        </button>

        {/* Bottom info overlay */}
        <div
          style={{
            position: "absolute", bottom: 0, left: 0, right: 0,
            padding: "22px 10px 8px",
            display: "flex", alignItems: "flex-end", justifyContent: "space-between",
          }}
        >
          <span
            style={{
              display: "flex", alignItems: "center", gap: "4px",
              fontSize: "0.67rem", color: "rgba(255,255,255,0.88)", fontWeight: 600,
            }}
          >
            <MapPin size={10} />
            {locale === "bn" ? product.originBn : product.originEn}
          </span>
          <span
            style={{
              display: "flex", alignItems: "center", gap: "3px",
              fontSize: "0.72rem", color: "#FCD34D", fontWeight: 700,
            }}
          >
            <Star size={11} fill="#FCD34D" />
            {product.rating}
          </span>
        </div>

        {/* Quick-view pill — appears on hover */}
        <div
          style={{
            position: "absolute",
            bottom: "36px",
            left: "50%",
            transform: isHovered ? "translateX(-50%) translateY(0)" : "translateX(-50%) translateY(10px)",
            opacity: isHovered ? 1 : 0,
            transition: "all 0.3s var(--ease-out)",
            pointerEvents: isHovered ? "auto" : "none",
            zIndex: 15,
          }}
        >
          <div
            style={{
              display: "flex", alignItems: "center", gap: "5px",
              padding: "5px 14px",
              borderRadius: "var(--radius-full)",
              background: "rgba(255,255,255,0.15)",
              backdropFilter: "blur(12px)",
              border: "1px solid rgba(255,255,255,0.3)",
              fontSize: "0.68rem", fontWeight: 700, color: "#fff",
              whiteSpace: "nowrap",
            }}
          >
            <Eye size={11} />
            {locale === "bn" ? "দ্রুত দেখুন" : "Quick View"}
          </div>
        </div>
      </Link>

      {/* ── Body ──────────────────────────────────────────── */}
      <div
        style={{
          padding: "14px 14px 12px",
          display: "flex", flexDirection: "column",
          flex: 1, gap: "6px",
        }}
      >
        {/* Vendor */}
        <div
          style={{
            display: "flex", alignItems: "center", gap: "5px",
            fontSize: "0.67rem", color: "var(--text-muted)", fontWeight: 600,
          }}
        >
          <Store size={11} color="var(--primary)" />
          <span>{locale === "bn" ? product.vendorNameBn : product.vendorNameEn}</span>
        </div>

        {/* Title */}
        <Link href={`/product/${product.slug}`} style={{ textDecoration: "none" }}>
          <h3
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "var(--text-sm)",
              fontWeight: 700,
              color: "var(--text-main)",
              lineHeight: 1.35,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              minHeight: "2.4rem",
              transition: "color var(--t-fast)",
            }}
            onMouseEnter={e => (e.currentTarget.style.color = "var(--emerald)")}
            onMouseLeave={e => (e.currentTarget.style.color = "var(--text-main)")}
          >
            {locale === "bn" ? product.nameBn : product.nameEn}
          </h3>
        </Link>

        {/* Weight chips */}
        {product.weightOptions && product.weightOptions.length > 1 && (
          <div
            style={{
              display: "flex", gap: "5px",
              overflowX: "auto", paddingBottom: "2px",
              scrollbarWidth: "none",
            }}
          >
            {product.weightOptions.slice(0, 4).map((w, idx) => {
              const chipPrice = Math.round(product.basePrice * w.multiplier);
              const isActive  = selectedWeight === w.value;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedWeight(w.value)}
                  style={{
                    display: "flex", flexDirection: "column", alignItems: "center",
                    padding: "5px 10px",
                    borderRadius: "var(--radius-sm)",
                    border: isActive
                      ? "1.5px solid var(--emerald)"
                      : "1px solid var(--border-medium)",
                    background: isActive ? "rgba(16,216,118,0.1)" : "var(--bg-subtle)",
                    color: isActive ? "var(--emerald)" : "var(--text-muted)",
                    fontSize: "0.7rem", fontWeight: 700,
                    whiteSpace: "nowrap", cursor: "pointer",
                    transition: "all 0.18s ease",
                    flexShrink: 0, gap: "1px",
                    boxShadow: isActive ? "0 2px 8px rgba(16,216,118,0.2)" : "none",
                  }}
                >
                  <span>{locale === "bn" ? w.labelBn.split(" ")[0] : w.labelEn.split(" ")[0]}</span>
                  <span
                    style={{
                      fontSize: "0.6rem",
                      opacity: isActive ? 1 : 0.7,
                      color: isActive ? "var(--primary)" : "var(--text-subtle)",
                    }}
                  >
                    {formatPrice(chipPrice)}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* Price + CTA */}
        <div
          style={{
            marginTop: "auto", paddingTop: "10px",
            borderTop: "1px solid var(--border-subtle)",
            display: "flex", alignItems: "center", justifyContent: "space-between",
            gap: "8px",
          }}
        >
          <div>
            <div
              style={{
                fontSize: "var(--text-lg)", fontWeight: 900,
                lineHeight: 1,
                background: "linear-gradient(135deg, #10D876, #4EEEA0)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                fontFamily: "var(--font-heading)",
              }}
            >
              {formatPrice(currentPrice)}
            </div>
            {compareCurrentPrice && (
              <div
                style={{
                  fontSize: "var(--text-xs)",
                  color: "var(--text-subtle)",
                  textDecoration: "line-through",
                  marginTop: "2px",
                }}
              >
                {formatPrice(compareCurrentPrice)}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={handleQuickAdd}
            style={{
              display: "flex", alignItems: "center", gap: "5px",
              padding: "9px 14px",
              borderRadius: "var(--radius-md)",
              background: isAdded
                ? "linear-gradient(135deg, #059E57, #047A43)"
                : "linear-gradient(135deg, #10D876, #059E57)",
              color: "var(--bg-page)",
              fontWeight: 800,
              fontSize: "var(--text-xs)",
              boxShadow: isAdded ? "none" : "0 4px 16px rgba(16,216,118,0.45)",
              transition: "all 0.3s var(--ease-bounce)",
              border: "none", cursor: "pointer",
              whiteSpace: "nowrap",
              transform: isAdded ? "scale(0.97)" : "scale(1)",
              fontFamily: "var(--font-heading)",
            }}
            onMouseEnter={e => { if (!isAdded) { e.currentTarget.style.transform = "translateY(-2px) scale(1.03)"; e.currentTarget.style.boxShadow = "0 10px 28px rgba(16,216,118,0.55)"; } }}
            onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.boxShadow = isAdded ? "none" : "0 4px 16px rgba(16,216,118,0.45)"; }}
          >
            {isAdded
              ? <Check size={14} strokeWidth={3} style={{ animation: "scaleIn 0.3s var(--ease-bounce)" }} />
              : <ShoppingBag size={14} />
            }
            <span>
              {isAdded
                ? (locale === "bn" ? "যোগ হয়েছে ✓" : "Added!")
                : (locale === "bn" ? "কার্টে যোগ" : "Add")}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
