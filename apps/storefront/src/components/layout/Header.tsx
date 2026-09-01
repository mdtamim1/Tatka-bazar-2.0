"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Menu, Search, Heart, ShoppingBag, User,
  ChevronDown, X, Globe, ArrowRight, Store,
  Utensils, Truck, Sparkles
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useCartStore } from "@/lib/cart-store";
import { PRODUCTS, CATEGORIES } from "@/lib/catalog";
import { useDebounce } from "@/hooks/useDebounce";
import styles from "./Header.module.css";

export function Header() {
  const router = useRouter();
  const { locale, toggleLocale, formatPrice } = useLanguage();
  const { getItemCount, wishlistIds, openCart, openWishlist } = useCartStore();

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const debouncedQuery = useDebounce(searchQuery, 250);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  const searchResults = debouncedQuery.trim()
    ? PRODUCTS.filter((p) => {
        const q = debouncedQuery.toLowerCase();
        return (
          p.nameBn.toLowerCase().includes(q) ||
          p.nameEn.toLowerCase().includes(q) ||
          p.categoryNameBn.toLowerCase().includes(q) ||
          p.categoryNameEn.toLowerCase().includes(q)
        );
      }).slice(0, 5)
    : [];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/category/all?q=${encodeURIComponent(searchQuery)}`);
      setSearchOpen(false);
      setSearchQuery("");
    }
  };

  const itemCount = mounted ? getItemCount() : 0;
  const wishlistCount = mounted ? wishlistIds.length : 0;

  return (
    <>
      <header className={styles.headerWrapper}>
        <div className={styles.container}>
          <div className={styles.navRow}>

            {/* ── Left: Mobile Hamburger OR Desktop Logo ── */}
            <button
              type="button"
              onClick={() => setMobileDrawerOpen(true)}
              className={styles.mobileMenuBtn}
              aria-label="Open Navigation Menu"
            >
              <Menu size={22} strokeWidth={2} />
            </button>

            {/* Brand Logo (Left on Desktop, Center on Mobile) */}
            <div className={styles.logoContainer}>
              <Link href="/" className={styles.logoLink}>
                <span className={styles.logoText}>TATKA BAZAR</span>
              </Link>
            </div>

            {/* ── Center: Desktop Navigation Links (Image 1) ── */}
            <ul className={styles.desktopNav}>
              {/* SHOP Dropdown */}
              <li className={styles.navItem}>
                <Link href="/category/all" className={styles.navLink}>
                  <span>SHOP</span>
                  <ChevronDown size={12} className={styles.chevronIcon} />
                </Link>
                <div className={styles.dropdownMenu}>
                  {CATEGORIES.slice(0, 6).map((cat) => (
                    <Link
                      key={cat.id}
                      href={`/category/${cat.slug}`}
                      className={styles.dropdownItem}
                    >
                      <span>{locale === "bn" ? cat.nameBn : cat.nameEn}</span>
                      <span>{cat.icon}</span>
                    </Link>
                  ))}
                  <Link
                    href="/category/all"
                    className={styles.dropdownItem}
                    style={{ borderTop: "1px solid #f1f5f9", fontWeight: 700, color: "#3056D3" }}
                  >
                    <span>{locale === "bn" ? "সকল ক্যাটাগরি দেখুন →" : "View All Categories →"}</span>
                  </Link>
                </div>
              </li>

              {/* DAILY BAZAR */}
              <li className={styles.navItem}>
                <Link href="/bundles" className={styles.navLink}>
                  <span>DAILY BAZAR</span>
                </Link>
              </li>

              {/* ORGANIC HARVEST */}
              <li className={styles.navItem}>
                <Link href="/category/vegetables" className={styles.navLink}>
                  <span>ORGANIC HARVEST</span>
                </Link>
              </li>

              {/* RECIPES */}
              <li className={styles.navItem}>
                <Link href="/recipes" className={styles.navLink}>
                  <span>RECIPES</span>
                </Link>
              </li>

              {/* BLOG / STORIES */}
              <li className={styles.navItem}>
                <Link href="/recipes" className={styles.navLink}>
                  <span>BLOG</span>
                </Link>
              </li>
            </ul>

            {/* ── Right: 4 Action Icons (Image 1 & Image 2) ── */}
            <div className={styles.actionGroup}>
              {/* 1. User / Account Icon */}
              <Link
                href="/account"
                className={styles.actionIconBtn}
                title="Account"
                aria-label="User Account"
              >
                <User size={20} strokeWidth={1.8} />
              </Link>

              {/* 2. Search Icon (Toggle Search Bar) */}
              <button
                type="button"
                onClick={() => setSearchOpen((prev) => !prev)}
                className={styles.actionIconBtn}
                title="Search products"
                aria-label="Search products"
              >
                <Search size={20} strokeWidth={1.8} />
              </button>

              {/* 3. Wishlist Heart Icon (Opens Wishlist Drawer) */}
              <button
                type="button"
                onClick={openWishlist}
                className={styles.actionIconBtn}
                title="Saved Items / Wishlist"
                aria-label="Wishlist"
              >
                <Heart size={20} strokeWidth={1.8} />
                {wishlistCount > 0 && (
                  <span className={styles.wishlistBadge}>{wishlistCount}</span>
                )}
              </button>

              {/* 4. Shopping Bag Icon with Count Badge */}
              <button
                type="button"
                onClick={openCart}
                className={styles.actionIconBtn}
                title="Shopping Bag"
                aria-label="Shopping Bag"
              >
                <ShoppingBag size={20} strokeWidth={1.8} />
                <span className={styles.cartBadge}>{itemCount}</span>
              </button>
            </div>

          </div>
        </div>

        {/* ── Slide-Down Search Overlay ── */}
        {searchOpen && (
          <div className={styles.searchBarOverlay}>
            <div className={styles.container}>
              <form onSubmit={handleSearchSubmit} className={styles.searchForm}>
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={
                    locale === "bn"
                      ? "পণ্য বা ব্র্যান্ড খুঁজুন (যেমন: ইলিশ, ঘি, চাল)..."
                      : "Search fresh items, organic products, brands..."
                  }
                  className={styles.searchInput}
                />
                <button
                  type="submit"
                  className={styles.searchSubmitBtn}
                  aria-label="Submit search"
                >
                  <Search size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => setSearchOpen(false)}
                  className={styles.searchCloseBtn}
                  aria-label="Close search"
                >
                  <X size={20} />
                </button>
              </form>

              {/* Instant Search Results Dropdown */}
              {searchResults.length > 0 && (
                <div className={styles.searchResultsBox}>
                  {searchResults.map((prod) => (
                    <Link
                      key={prod.id}
                      href={`/product/${prod.slug}`}
                      onClick={() => {
                        setSearchOpen(false);
                        setSearchQuery("");
                      }}
                      className={styles.searchResultItem}
                    >
                      <img src={prod.images[0]} alt="" className={styles.searchResultThumb} />
                      <div style={{ flex: 1 }}>
                        <div className={styles.searchResultTitle}>
                          {locale === "bn" ? prod.nameBn : prod.nameEn}
                        </div>
                        <div className={styles.searchResultPrice}>
                          {formatPrice(prod.basePrice)}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* ── Mobile Slide-Out Drawer ── */}
      {mobileDrawerOpen && (
        <div className={styles.drawerBackdrop} onClick={() => setMobileDrawerOpen(false)}>
          <div className={styles.mobileDrawer} onClick={(e) => e.stopPropagation()}>
            {/* Drawer Header */}
            <div className={styles.drawerHeader}>
              <div className={styles.drawerLogoText}>
                <span>TATKA BAZAR</span>
                <span className={styles.drawerFreshBadge}>100% FRESH</span>
              </div>
              <button
                type="button"
                onClick={() => setMobileDrawerOpen(false)}
                className={styles.drawerCloseBtn}
                aria-label="Close Menu"
              >
                <X size={18} />
              </button>
            </div>

            {/* Scrollable Navigation Body */}
            <nav className={styles.drawerNavBody}>
              {/* 1. Primary Navigation Links */}
              <div className={styles.drawerPrimaryLinks}>
                <Link
                  href="/"
                  onClick={() => setMobileDrawerOpen(false)}
                  className={styles.drawerPrimaryLink}
                >
                  <span>{locale === "bn" ? "হোম" : "Home"}</span>
                </Link>
                <Link
                  href="/category/all"
                  onClick={() => setMobileDrawerOpen(false)}
                  className={styles.drawerPrimaryLink}
                >
                  <span>{locale === "bn" ? "সকল তাজা পণ্য" : "Shop All Products"}</span>
                </Link>
                <Link
                  href="/bundles"
                  onClick={() => setMobileDrawerOpen(false)}
                  className={styles.drawerPrimaryLink}
                >
                  <span>{locale === "bn" ? "ডেইলি বাজার ডিল" : "Daily Bazar Deals"}</span>
                  <span style={{ fontSize: "0.62rem", background: "#ef4444", color: "#fff", padding: "1px 6px", borderRadius: "4px", fontWeight: 800 }}>HOT</span>
                </Link>
              </div>

              {/* 2. Categories (A-Z) */}
              <div className={styles.drawerSection}>
                <span className={styles.drawerSectionTitle}>
                  {locale === "bn" ? "পণ্যের বিভাগ (A-Z)" : "Categories (A-Z)"}
                </span>
                <div className={styles.drawerItemList}>
                  {CATEGORIES.map((cat) => (
                    <Link
                      key={cat.id}
                      href={`/category/${cat.slug}`}
                      onClick={() => setMobileDrawerOpen(false)}
                      className={styles.drawerItemLink}
                    >
                      <span>{locale === "bn" ? cat.nameBn : cat.nameEn}</span>
                      <span>{cat.icon}</span>
                    </Link>
                  ))}
                </div>
              </div>

              {/* 3. Bazar Tools & Services */}
              <div className={styles.drawerSection}>
                <span className={styles.drawerSectionTitle}>
                  {locale === "bn" ? "বাজার টুলস ও সেবা" : "Bazar Tools & Services"}
                </span>
                <div className={styles.drawerItemList}>
                  <Link
                    href="/recipes"
                    onClick={() => setMobileDrawerOpen(false)}
                    className={styles.drawerItemLink}
                  >
                    <span>🍳 {locale === "bn" ? "রেসিপি টু কার্ট" : "Recipe to Cart"}</span>
                  </Link>
                  <Link
                    href="/track"
                    onClick={() => setMobileDrawerOpen(false)}
                    className={styles.drawerItemLink}
                  >
                    <span>📦 {locale === "bn" ? "লাইভ অর্ডার ট্র্যাকিং" : "Track Order"}</span>
                  </Link>
                  <Link
                    href="/b2b"
                    onClick={() => setMobileDrawerOpen(false)}
                    className={styles.drawerItemLink}
                  >
                    <span>🏬 {locale === "bn" ? "পাইকারি সাপ্লাই (B2B)" : "B2B Wholesale"}</span>
                  </Link>
                </div>
              </div>

              {/* 5. Wishlist & Shopping Cart */}
              <div className={styles.drawerSection}>
                <button
                  type="button"
                  onClick={() => {
                    setMobileDrawerOpen(false);
                    openWishlist();
                  }}
                  className={styles.drawerActionButton}
                >
                  <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <Heart size={16} color="#ef4444" />
                    <span>{locale === "bn" ? "পছন্দের তালিকা" : "My Wishlist"}</span>
                  </span>
                  <span className={styles.drawerBadgePill}>{wishlistCount}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMobileDrawerOpen(false);
                    openCart();
                  }}
                  className={styles.drawerActionButton}
                >
                  <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <ShoppingBag size={16} color="#3056D3" />
                    <span>{locale === "bn" ? "শপিং কার্ট" : "My Cart"}</span>
                  </span>
                  <span className={styles.drawerBadgePill}>{itemCount}</span>
                </button>

                <Link
                  href="/account"
                  onClick={() => setMobileDrawerOpen(false)}
                  className={styles.drawerActionButton}
                  style={{ textDecoration: "none" }}
                >
                  <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <User size={16} />
                    <span>{locale === "bn" ? "আমার অ্যাকাউন্ট / সাইন ইন" : "My Account / Sign In"}</span>
                  </span>
                </Link>
              </div>
            </nav>

            {/* Footer with Language Switcher & Copyright */}
            <div className={styles.drawerFooter}>
              <button
                type="button"
                onClick={toggleLocale}
                className={styles.langSwitchBtn}
              >
                <Globe size={15} />
                <span>{locale === "bn" ? "ভাষা: বাংলা (বাং)" : "Language: English (EN)"}</span>
              </button>
              <div className={styles.drawerCopyright}>
                © 2026 Tatka Bazar — 100% Fresh Chemical Free
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
