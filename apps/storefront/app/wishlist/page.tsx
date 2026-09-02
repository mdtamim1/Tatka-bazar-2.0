"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Heart,
  ShoppingBag,
  Trash2,
  Share2,
  SlidersHorizontal,
  ChevronRight,
  ArrowRight,
  PackageX,
  X,
  Check,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useCartStore } from "@/lib/cart-store";
import { PRODUCTS } from "@/lib/catalog";
import type { Product } from "@/types";

type SortOption = "date-desc" | "price-low" | "price-high" | "name-asc";

const MOCK_DATES: Record<string, string> = {
  "prod-1": "2 days ago",
  "prod-2": "Yesterday",
  "prod-3": "3 days ago",
  "prod-4": "5 days ago",
  "prod-5": "1 week ago",
};

export default function WishlistPage() {
  const { formatPrice } = useLanguage();
  const {
    wishlistIds,
    removeFromWishlist,
    clearWishlist,
    moveWishlistToCart,
    moveAllWishlistToCart,
  } = useCartStore();

  const [mounted, setMounted] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>("date-desc");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const wishlistProducts = useMemo(() => {
    const list = PRODUCTS.filter((p) => wishlistIds.includes(p.id));
    return [...list].sort((a, b) => {
      if (sortBy === "price-low") return a.basePrice - b.basePrice;
      if (sortBy === "price-high") return b.basePrice - a.basePrice;
      if (sortBy === "name-asc") {
        const nameA = a.nameEn || a.nameBn;
        const nameB = b.nameEn || b.nameBn;
        return nameA.localeCompare(nameB);
      }
      return wishlistIds.indexOf(a.id) - wishlistIds.indexOf(b.id);
    });
  }, [wishlistIds, sortBy]);

  const handleShareList = async () => {
    const shareUrl = typeof window !== "undefined" ? window.location.href : "";
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrl);
        showToast("Wishlist link copied to clipboard!");
      } else {
        showToast("Wishlist link shared!");
      }
    } catch {
      showToast("Wishlist link copied to clipboard!");
    }
  };

  const handleAddToCart = (product: Product) => {
    moveWishlistToCart(product, false);
    const prodName = product.nameEn || product.nameBn;
    showToast(`✓ ${prodName} added to cart & removed from wishlist`);
  };

  const handleMoveAllToCart = () => {
    const inStockItems = wishlistProducts.filter((p) => p.stock > 0);
    if (inStockItems.length === 0) {
      showToast("No in-stock items to move!");
      return;
    }
    moveAllWishlistToCart(inStockItems);
    showToast(`✓ ${inStockItems.length} items moved to cart!`);
  };

  const totalItemCount = wishlistProducts.length;
  const inStockCount = wishlistProducts.filter((p) => p.stock > 0).length;

  return (
    <div style={{ padding: "24px 0 80px", background: "#f8fafc", minHeight: "80vh" }}>
      {toastMessage && (
        <div
          style={{
            position: "fixed",
            top: "80px",
            left: "50%",
            transform: "translateX(-50%)",
            background: "#0f172a",
            color: "#ffffff",
            padding: "10px 20px",
            borderRadius: "999px",
            fontSize: "0.85rem",
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            gap: "8px",
            zIndex: 99999,
            boxShadow: "0 8px 24px rgba(0, 0, 0, 0.2)",
          }}
        >
          <Check size={16} strokeWidth={2.5} />
          <span>{toastMessage}</span>
        </div>
      )}

      <div style={{ maxWidth: "860px", margin: "0 auto", padding: "0 20px" }}>
        {/* Breadcrumbs */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.82rem", color: "#64748b", marginBottom: "20px" }}>
          <Link href="/" style={{ color: "#3056D3", textDecoration: "none" }}>
            Home
          </Link>
          <ChevronRight size={14} />
          <span style={{ color: "#0f172a", fontWeight: 600 }}>
            Wishlist
          </span>
        </div>

        {/* Main Card */}
        <div
          style={{
            background: "#ffffff",
            borderRadius: "16px",
            border: "1px solid #e2e8f0",
            padding: "28px 32px",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.03)",
          }}
        >
          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px", paddingBottom: "20px", borderBottom: "1px solid #f1f5f9" }}>
            <div>
              <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "#0f172a", margin: "0 0 4px 0", letterSpacing: "-0.02em" }}>
                Saved Items
              </h1>
              <p style={{ color: "#64748b", fontSize: "0.9rem", margin: 0 }}>
                {totalItemCount} {totalItemCount === 1 ? "item" : "items"} in your wishlist
              </p>
            </div>

            {totalItemCount > 0 && (
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <button
                  type="button"
                  onClick={handleShareList}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "8px 16px",
                    borderRadius: "8px",
                    border: "1px solid #e2e8f0",
                    background: "#ffffff",
                    color: "#334155",
                    fontSize: "0.82rem",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  <Share2 size={14} />
                  <span>Share List</span>
                </button>

                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <SlidersHorizontal size={14} color="#64748b" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    style={{
                      padding: "8px 14px",
                      borderRadius: "8px",
                      border: "1px solid #e2e8f0",
                      background: "#ffffff",
                      color: "#334155",
                      fontSize: "0.82rem",
                      fontWeight: 700,
                      cursor: "pointer",
                      outline: "none",
                    }}
                  >
                    <option value="date-desc">Date Added</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="name-asc">Product Name (A-Z)</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Item Rows */}
          {totalItemCount > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginTop: "24px" }}>
              {wishlistProducts.map((product) => {
                const isOutOfStock = product.stock <= 0;
                const addedDateStr = MOCK_DATES[product.id] || "Recently added";

                return (
                  <div
                    key={product.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "20px",
                      padding: "18px 20px",
                      border: "1px solid #f1f5f9",
                      borderRadius: "12px",
                      background: "#ffffff",
                      transition: "all 0.2s ease",
                    }}
                  >
                    {/* Thumbnail */}
                    <div style={{ width: "80px", height: "80px", borderRadius: "10px", overflow: "hidden", background: "#f8fafc", flexShrink: 0, border: "1px solid #f1f5f9" }}>
                      <img
                        src={product.images[0]}
                        alt={product.nameEn || product.nameBn}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    </div>

                    {/* Details */}
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "4px", minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                        <Link
                          href={`/product/${product.slug}`}
                          style={{ fontSize: "1rem", fontWeight: 700, color: "#0f172a", textDecoration: "none" }}
                        >
                          {product.nameEn || product.nameBn}
                        </Link>
                        {isOutOfStock && (
                          <span style={{ fontSize: "0.7rem", fontWeight: 700, color: "#b91c1c", background: "#fee2e2", padding: "1px 8px", borderRadius: "4px" }}>
                            Out of Stock
                          </span>
                        )}
                      </div>

                      <span style={{ fontSize: "0.8rem", color: "#64748b" }}>
                        {product.categoryNameEn || product.categoryNameBn}
                      </span>

                      <div style={{ display: "flex", alignItems: "baseline", gap: "8px", marginTop: "2px" }}>
                        <span style={{ fontSize: "1.05rem", fontWeight: 800, color: "#0f172a" }}>
                          {formatPrice(product.basePrice)}
                        </span>
                        {product.comparePrice && product.comparePrice > product.basePrice && (
                          <span style={{ fontSize: "0.85rem", color: "#94a3b8", textDecoration: "line-through" }}>
                            {formatPrice(product.comparePrice)}
                          </span>
                        )}
                      </div>

                      <span style={{ fontSize: "0.72rem", color: "#94a3b8" }}>
                        Added {addedDateStr}
                      </span>
                    </div>

                    {/* Actions */}
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", justifyContent: "space-between", gap: "20px", flexShrink: 0 }}>
                      <button
                        type="button"
                        onClick={() => {
                          removeFromWishlist(product.id);
                          showToast("Removed from wishlist");
                        }}
                        style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer", padding: "4px" }}
                        title="Remove"
                      >
                        <X size={16} />
                      </button>

                      {isOutOfStock ? (
                        <button
                          type="button"
                          disabled
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
                            padding: "8px 16px",
                            borderRadius: "8px",
                            background: "#f1f5f9",
                            color: "#94a3b8",
                            border: "1px solid #e2e8f0",
                            fontSize: "0.82rem",
                            fontWeight: 700,
                            cursor: "not-allowed",
                          }}
                        >
                          <PackageX size={14} />
                          <span>Sold Out</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleAddToCart(product)}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
                            padding: "8px 16px",
                            borderRadius: "8px",
                            background: "#0f172a",
                            color: "#ffffff",
                            border: "none",
                            fontSize: "0.82rem",
                            fontWeight: 700,
                            cursor: "pointer",
                            boxShadow: "0 2px 6px rgba(15, 23, 42, 0.15)",
                          }}
                        >
                          <ShoppingBag size={14} />
                          <span>Add to Cart</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Bottom Actions */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "24px", paddingTop: "20px", borderTop: "1px solid #f1f5f9", flexWrap: "wrap", gap: "12px" }}>
                <button
                  type="button"
                  onClick={() => {
                    clearWishlist();
                    showToast("Wishlist cleared");
                  }}
                  style={{ background: "none", border: "none", color: "#64748b", fontSize: "0.85rem", fontWeight: 600, cursor: "pointer" }}
                >
                  Clear all saved items
                </button>

                {inStockCount > 0 && (
                  <button
                    type="button"
                    onClick={handleMoveAllToCart}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "8px",
                      padding: "12px 24px",
                      borderRadius: "10px",
                      background: "#0f172a",
                      color: "#ffffff",
                      border: "none",
                      fontSize: "0.92rem",
                      fontWeight: 800,
                      cursor: "pointer",
                      boxShadow: "0 4px 14px rgba(15, 23, 42, 0.2)",
                    }}
                  >
                    <ShoppingBag size={16} />
                    <span>
                      Move All to Cart ({inStockCount})
                    </span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "60px 20px" }}>
              <div
                style={{
                  width: "72px",
                  height: "72px",
                  borderRadius: "50%",
                  background: "#fef2f2",
                  color: "#ef4444",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 16px",
                }}
              >
                <Heart size={32} />
              </div>
              <h3 style={{ fontSize: "1.2rem", fontWeight: 800, color: "#0f172a", margin: "0 0 6px 0" }}>
                Your wishlist is empty
              </h3>
              <p style={{ color: "#64748b", fontSize: "0.9rem", maxWidth: "340px", margin: "0 auto 24px", lineHeight: 1.5 }}>
                Explore fresh local produce, organic specialties, and daily essentials.
              </p>
              <Link
                href="/category/all"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "12px 28px",
                  borderRadius: "999px",
                  background: "#0f172a",
                  color: "#ffffff",
                  fontSize: "0.9rem",
                  fontWeight: 700,
                  textDecoration: "none",
                }}
              >
                <span>Explore Bazar</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
