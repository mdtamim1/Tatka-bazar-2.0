"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Menu, Search, Heart, ShoppingBag, User,
  ChevronDown, X, Globe, ArrowRight
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useCartStore } from "@/lib/cart-store";
import { PRODUCTS, CATEGORIES, VENDORS } from "@/lib/catalog";
import { useDebounce } from "@/hooks/useDebounce";
import styles from "./Header.module.css";

export function Header() {
  const router = useRouter();
  const { locale, toggleLocale, formatPrice } = useLanguage();
  const { getItemCount, wishlistIds, openCart } = useCartStore();

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

              {/* BRANDS / FARMS Dropdown */}
              <li className={styles.navItem}>
                <Link href="/category/all" className={styles.navLink}>
                  <span>FARMS & BRANDS</span>
                  <ChevronDown size={12} className={styles.chevronIcon} />
                </Link>
                <div className={styles.dropdownMenu}>
                  {VENDORS.map((v) => (
                    <Link
                      key={v.id}
                      href={`/shop/${v.slug}`}
                      className={styles.dropdownItem}
                    >
                      <span>{locale === "bn" ? v.nameBn : v.nameEn}</span>
                      <span style={{ fontSize: "0.72rem", color: "#64748b" }}>{v.rating} ★</span>
                    </Link>
                  ))}
                </div>
              </li>

              {/* DAILY BAZAR */}
              <li className={styles.navItem}>
                <Link href="/bundles" className={styles.navLink}>
                  <span>DAILY BAZAR</span>
                </Link>
              </li>

              {/* RECIPES */}
              <li className={styles.navItem}>
                <Link href="/recipes" className={styles.navLink}>
                  <span>RECIPES</span>
                </Link>
              </li>

              {/* B2B & CORPORATE */}
              <li className={styles.navItem}>
                <Link href="/b2b" className={styles.navLink}>
                  <span>B2B SUPPLY</span>
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

              {/* 3. Wishlist Heart Icon */}
              <Link
                href="/account?tab=wishlist"
                className={styles.actionIconBtn}
                title="Wishlist"
                aria-label="Wishlist"
              >
                <Heart size={20} strokeWidth={1.8} />
                {wishlistCount > 0 && (
                  <span className={styles.wishlistBadge}>{wishlistCount}</span>
                )}
              </Link>

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

      {/* ── Mobile Slide-Out Drawer (Image 2) ── */}
      {mobileDrawerOpen && (
        <div className={styles.drawerBackdrop} onClick={() => setMobileDrawerOpen(false)}>
          <div className={styles.mobileDrawer} onClick={(e) => e.stopPropagation()}>
            {/* Drawer Header */}
            <div className={styles.drawerHeader}>
              <span className={styles.drawerLogoText}>TATKA BAZAR</span>
              <button
                type="button"
                onClick={() => setMobileDrawerOpen(false)}
                className={styles.drawerCloseBtn}
                aria-label="Close Menu"
              >
                <X size={22} />
              </button>
            </div>

            {/* Navigation Links */}
            <ul className={styles.drawerNavList}>
              <li>
                <Link
                  href="/category/all"
                  onClick={() => setMobileDrawerOpen(false)}
                  className={styles.drawerNavLink}
                >
                  SHOP ALL
                </Link>
              </li>
              <li>
                <Link
                  href="/bundles"
                  onClick={() => setMobileDrawerOpen(false)}
                  className={styles.drawerNavLink}
                >
                  DAILY BAZAR
                </Link>
              </li>
              <li>
                <Link
                  href="/recipes"
                  onClick={() => setMobileDrawerOpen(false)}
                  className={styles.drawerNavLink}
                >
                  RECIPES
                </Link>
              </li>
              <li>
                <Link
                  href="/b2b"
                  onClick={() => setMobileDrawerOpen(false)}
                  className={styles.drawerNavLink}
                >
                  B2B SUPPLY
                </Link>
              </li>
              <li>
                <Link
                  href="/account"
                  onClick={() => setMobileDrawerOpen(false)}
                  className={styles.drawerNavLink}
                >
                  MY ACCOUNT
                </Link>
              </li>
            </ul>

            {/* Categories Heading */}
            <div className={styles.drawerCategoryHeading}>Categories</div>
            <div className={styles.drawerCatList}>
              {CATEGORIES.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/category/${cat.slug}`}
                  onClick={() => setMobileDrawerOpen(false)}
                  className={styles.drawerCatItem}
                >
                  <span>{cat.icon}</span>
                  <span>{locale === "bn" ? cat.nameBn : cat.nameEn}</span>
                </Link>
              ))}
            </div>

            {/* Footer with Language Switcher */}
            <div className={styles.drawerFooter}>
              <button
                type="button"
                onClick={toggleLocale}
                className={styles.langSwitchBtn}
              >
                <Globe size={16} />
                <span>Language: {locale === "bn" ? "বাংলা (বাং)" : "English (EN)"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
