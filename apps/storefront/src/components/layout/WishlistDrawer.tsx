"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  X,
  Share2,
  SlidersHorizontal,
  ShoppingBag,
  Heart,
  ArrowRight,
  Check,
  PackageX,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useCartStore } from "@/lib/cart-store";
import { PRODUCTS } from "@/lib/catalog";
import { Product } from "@/types";
import styles from "./WishlistDrawer.module.css";

type SortOption = "date-desc" | "price-low" | "price-high" | "name-asc";

// Sample mock added dates for visual fidelity matching the reference UI
const MOCK_DATES: Record<string, string> = {
  "prod-ilish-padma": "Dec 10, 2024",
  "prod-beef-sirloin": "Dec 8, 2024",
  "prod-honey-sundarban": "Dec 5, 2024",
  "prod-kataribhog-rice": "Dec 2, 2024",
  "prod-spinach-palong": "Nov 28, 2024",
};

export function WishlistDrawer() {
  const { locale, formatPrice } = useLanguage();
  const {
    isWishlistOpen,
    closeWishlist,
    wishlistIds,
    removeFromWishlist,
    moveWishlistToCart,
    moveAllWishlistToCart,
    clearWishlist,
  } = useCartStore();

  const [sortBy, setSortBy] = useState<SortOption>("date-desc");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isWishlistOpen) {
        closeWishlist();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isWishlistOpen, closeWishlist]);

  // Toast notification helper with auto-hide
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 2800);
  };

  // Get matching products for current wishlistIds
  const wishlistProducts = useMemo(() => {
    const matched = PRODUCTS.filter((p) => wishlistIds.includes(p.id));

    // Sort items
    return [...matched].sort((a, b) => {
      if (sortBy === "price-low") {
        return a.basePrice - b.basePrice;
      }
      if (sortBy === "price-high") {
        return b.basePrice - a.basePrice;
      }
      if (sortBy === "name-asc") {
        const nameA = locale === "bn" ? a.nameBn : a.nameEn;
        const nameB = locale === "bn" ? b.nameBn : b.nameEn;
        return nameA.localeCompare(nameB);
      }
      // date-desc (default order preserved from wishlistIds)
      return wishlistIds.indexOf(a.id) - wishlistIds.indexOf(b.id);
    });
  }, [wishlistIds, sortBy, locale]);

  // Handle Share List action
  const handleShareList = async () => {
    const shareUrl = typeof window !== "undefined" ? window.location.href : "";
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrl);
        showToast(
          locale === "bn"
            ? "উইশলিস্ট লিংক কপি করা হয়েছে!"
            : "Wishlist link copied to clipboard!"
        );
      } else {
        showToast(
          locale === "bn" ? "লিংক শেয়ার করা হয়েছে!" : "Wishlist link shared!"
        );
      }
    } catch {
      showToast(
        locale === "bn"
          ? "উইশলিস্ট লিংক কপি করা হয়েছে!"
          : "Wishlist link copied to clipboard!"
      );
    }
  };

  // Handle single item Add to Cart
  const handleAddToCart = (product: Product) => {
    moveWishlistToCart(product, false);
    const prodName = locale === "bn" ? product.nameBn : product.nameEn;
    showToast(
      locale === "bn"
        ? `✓ ${prodName} কার্টে যুক্ত হয়েছে এবং উইশলিস্ট থেকে সরানো হয়েছে`
        : `✓ ${prodName} added to cart & removed from wishlist`
    );
  };

  // Handle Move All to Cart
  const handleMoveAllToCart = () => {
    const inStockItems = wishlistProducts.filter((p) => p.stock > 0);
    if (inStockItems.length === 0) {
      showToast(
        locale === "bn"
          ? "স্টকে কোনো পণ্য পাওয়া যায়নি!"
          : "No in-stock items to move!"
      );
      return;
    }
    moveAllWishlistToCart(inStockItems);
    showToast(
      locale === "bn"
        ? `✓ ${inStockItems.length}টি পণ্য কার্টে যুক্ত করা হয়েছে!`
        : `✓ ${inStockItems.length} items moved to cart!`
    );
  };

  if (!mounted || !isWishlistOpen) return null;

  const totalItemCount = wishlistProducts.length;
  const inStockCount = wishlistProducts.filter((p) => p.stock > 0).length;

  return (
    <div className={styles.drawerBackdrop} onClick={closeWishlist}>
      {/* Toast Alert */}
      {toastMessage && (
        <div className={styles.shareToast}>
          <Check size={16} strokeWidth={2.5} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Drawer Panel */}
      <div
        className={styles.drawerContainer}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="Wishlist Drawer"
      >
        {/* ── HEADER ── */}
        <div className={styles.drawerHeader}>
          <div className={styles.headerTopRow}>
            <div>
              <h2 className={styles.drawerTitle}>
                {locale === "bn" ? "পছন্দের তালিকা" : "Saved Items"}
              </h2>
              <p className={styles.drawerSubtitle}>
                {locale === "bn"
                  ? `${totalItemCount}টি পণ্য আপনার পছন্দের তালিকায় রয়েছে`
                  : `${totalItemCount} ${
                      totalItemCount === 1 ? "item" : "items"
                    } in your wishlist`}
              </p>
            </div>

            <button
              type="button"
              onClick={closeWishlist}
              className={styles.closeBtn}
              aria-label="Close Wishlist"
              title="Close"
            >
              <X size={18} />
            </button>
          </div>

          {/* Action Toolbar: Share List & Date Added / Sort */}
          {totalItemCount > 0 && (
            <div className={styles.headerActionsRow}>
              <button
                type="button"
                onClick={handleShareList}
                className={styles.actionPillBtn}
                title="Share Wishlist"
              >
                <Share2 size={13} />
                <span>{locale === "bn" ? "শেয়ার করুন" : "Share List"}</span>
              </button>

              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <SlidersHorizontal size={13} color="#64748b" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className={styles.sortSelect}
                  aria-label="Sort Wishlist Items"
                >
                  <option value="date-desc">
                    {locale === "bn" ? "যুক্ত করার তারিখ" : "Date Added"}
                  </option>
                  <option value="price-low">
                    {locale === "bn" ? "দাম: কম থেকে বেশি" : "Price: Low to High"}
                  </option>
                  <option value="price-high">
                    {locale === "bn" ? "দাম: বেশি থেকে কম" : "Price: High to Low"}
                  </option>
                  <option value="name-asc">
                    {locale === "bn" ? "পণ্যের নাম (A-Z)" : "Product Name"}
                  </option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* ── WISHLIST ITEMS LIST ── */}
        {totalItemCount > 0 ? (
          <div className={styles.itemsScrollList}>
            {wishlistProducts.map((product) => {
              const isOutOfStock = product.stock <= 0;
              const addedDateStr =
                MOCK_DATES[product.id] || "Recently added";

              return (
                <div key={product.id} className={styles.wishlistItemRow}>
                  {/* Thumbnail Image */}
                  <div className={styles.itemThumbWrapper}>
                    <img
                      src={product.images[0]}
                      alt={locale === "bn" ? product.nameBn : product.nameEn}
                      className={styles.itemThumbImg}
                      loading="lazy"
                    />
                  </div>

                  {/* Item Details */}
                  <div className={styles.itemDetails}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                      <Link
                        href={`/product/${product.slug}`}
                        onClick={closeWishlist}
                        className={styles.itemTitle}
                      >
                        {locale === "bn" ? product.nameBn : product.nameEn}
                      </Link>
                      {isOutOfStock && (
                        <span className={styles.outOfStockBadge}>
                          {locale === "bn" ? "স্টক শেষ" : "Out of Stock"}
                        </span>
                      )}
                    </div>

                    <span className={styles.itemCategory}>
                      {locale === "bn"
                        ? product.categoryNameBn
                        : product.categoryNameEn}
                    </span>

                    {/* Price Row */}
                    <div className={styles.itemPriceRow}>
                      <span className={styles.currentPrice}>
                        {formatPrice(product.basePrice)}
                      </span>
                      {product.comparePrice &&
                        product.comparePrice > product.basePrice && (
                          <span className={styles.comparePrice}>
                            {formatPrice(product.comparePrice)}
                          </span>
                        )}
                    </div>

                    {/* Added Date */}
                    <span className={styles.addedDate}>
                      {locale === "bn"
                        ? `যুক্ত হয়েছে: ${addedDateStr}`
                        : `Added ${addedDateStr}`}
                    </span>
                  </div>

                  {/* Right Actions: Remove & Add To Cart */}
                  <div className={styles.itemActionColumn}>
                    <button
                      type="button"
                      onClick={() => {
                        removeFromWishlist(product.id);
                        showToast(
                          locale === "bn"
                            ? "পছন্দের তালিকা থেকে মুছে ফেলা হয়েছে"
                            : "Removed from wishlist"
                        );
                      }}
                      className={styles.removeSingleBtn}
                      aria-label={`Remove ${product.nameEn} from wishlist`}
                      title="Remove"
                    >
                      <X size={15} />
                    </button>

                    {isOutOfStock ? (
                      <button
                        type="button"
                        disabled
                        className={styles.soldOutBtn}
                        title="Item is currently out of stock"
                      >
                        <PackageX size={13} />
                        <span>{locale === "bn" ? "স্টক আউট" : "Sold Out"}</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleAddToCart(product)}
                        className={styles.addToCartPillBtn}
                        title="Add to cart and remove from wishlist"
                      >
                        <ShoppingBag size={13} />
                        <span>
                          {locale === "bn" ? "কার্টে যোগ করুন" : "Add to Cart"}
                        </span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* ── EMPTY STATE ── */
          <div className={styles.emptyStateContainer}>
            <div className={styles.emptyIconCircle}>
              <Heart size={32} strokeWidth={1.8} />
            </div>
            <h3 className={styles.emptyTitle}>
              {locale === "bn"
                ? "আপনার পছন্দের তালিকা খালি"
                : "Your wishlist is empty"}
            </h3>
            <p className={styles.emptySubtitle}>
              {locale === "bn"
                ? "তাজা শাকসবজি, মাছ, মাংস ও অর্গানিক গ্রোসারি খুঁজে পছন্দের তালিকায় সেভ করুন।"
                : "Explore our farm-fresh produce, authentic Padma fish, and premium groceries to save items."}
            </p>
            <Link
              href="/category/all"
              onClick={closeWishlist}
              className={styles.emptyShopBtn}
            >
              <span>{locale === "bn" ? "কেনাকাটা শুরু করুন" : "Explore Bazar"}</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        )}

        {/* ── FOOTER ── */}
        {totalItemCount > 0 && (
          <div className={styles.drawerFooter}>
            {inStockCount > 0 && (
              <button
                type="button"
                onClick={handleMoveAllToCart}
                className={styles.moveAllBtn}
              >
                <ShoppingBag size={16} />
                <span>
                  {locale === "bn"
                    ? `সবগুলো কার্টে যোগ করুন (${inStockCount})`
                    : `Move All to Cart (${inStockCount})`}
                </span>
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                clearWishlist();
                showToast(
                  locale === "bn"
                    ? "পছন্দের তালিকা খালি করা হয়েছে"
                    : "Wishlist cleared"
                );
              }}
              style={{
                background: "transparent",
                border: "none",
                color: "#64748b",
                fontSize: "0.78rem",
                fontWeight: 600,
                cursor: "pointer",
                padding: "4px",
                textAlign: "center",
              }}
            >
              {locale === "bn" ? "তালিকা সম্পূর্ণ মুছুন" : "Clear all saved items"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}