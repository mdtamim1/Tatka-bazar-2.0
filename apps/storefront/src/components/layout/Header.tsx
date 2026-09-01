"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search, ShoppingBag, User, Globe, ChevronDown, X,
  MoreVertical, Heart, HelpCircle, CreditCard,
  History, Settings, LogOut, Bookmark, Bell, Eye,
  MessageSquare, PhoneCall
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useCartStore } from "@/lib/cart-store";
import { PRODUCTS, CATEGORIES } from "@/lib/catalog";
import { useDebounce } from "@/hooks/useDebounce";
import styles from "./Header.module.css";

export function Header() {
  const router = useRouter();
  const { locale, toggleLocale, formatPrice } = useLanguage();
  const { getItemCount, openCart } = useCartStore();

  // Navigation State
  const [searchQuery, setSearchQuery]           = useState("");
  const debouncedSearchQuery                    = useDebounce(searchQuery, 250);
  const [isSearchOpen, setIsSearchOpen]         = useState(false);
  const [isDrawerOpen, setIsDrawerOpen]         = useState(false);
  const [activeDropdown, setActiveDropdown]     = useState<string | null>(null);
  const [mounted, setMounted]                   = useState(false);
  const [scrolled, setScrolled]                 = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    const handleScroll = () => setScrolled(window.scrollY > 8);
    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  const searchResults = debouncedSearchQuery.trim()
    ? PRODUCTS.filter(p => {
        const q = debouncedSearchQuery.toLowerCase();
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
      setIsSearchOpen(false);
      router.push(`/category/all?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("tatka_token");
    }
    setIsDrawerOpen(false);
    router.push("/login");
  };

  return (
    <>
      <header className={`${styles.headerWrapper} ${scrolled ? styles.headerScrolled : ""}`}>
        <div className={styles.container}>
          <div className={styles.navbarRow}>
            
            {/* ── Left Side: 3-Dot Menu + Logo + Desktop Nav ── */}
            <div className={styles.leftGroup}>
              
              {/* 3-Dot Drawer Trigger (Image 2 style) */}
              <button
                type="button"
                onClick={() => setIsDrawerOpen(true)}
                aria-label="Open Navigation Drawer"
                className={styles.threeDotBtn}
              >
                <MoreVertical size={18} />
              </button>

              {/* Logo (Image 1 style) */}
              <Link href="/" className={styles.logoLink}>
                <div style={{ width: "26px", height: "26px", color: "#0f172a", display: "flex", alignItems: "center" }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="12 2 2 7 12 12 22 7 12 2" />
                    <polyline points="2 17 12 22 22 17" />
                    <polyline points="2 12 12 17 22 12" />
                  </svg>
                </div>
                <span className={styles.logoText}>
                  TatkaBazar<span className={styles.logoDot}>.com</span>
                </span>
              </Link>

              {/* Desktop Nav Links (Hidden on Mobile) */}
              <nav className={styles.desktopNav}>
                
                {/* STORE ⌵ */}
                <div
                  style={{ position: "relative" }}
                  onMouseEnter={() => setActiveDropdown("store")}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <button
                    type="button"
                    className={`${styles.navLinkBtn} ${activeDropdown === "store" ? styles.navLinkBtnActive : ""}`}
                  >
                    <span>{locale === "bn" ? "স্টোর" : "STORE"}</span>
                    <ChevronDown size={14} />
                  </button>

                  {/* Dropdown Menu */}
                  {activeDropdown === "store" && (
                    <div className={styles.dropdownMenu}>
                      {CATEGORIES.map(cat => (
                        <Link
                          key={cat.id}
                          href={`/category/${cat.slug}`}
                          onClick={() => setActiveDropdown(null)}
                          className={styles.dropdownItem}
                        >
                          <span style={{ fontSize: "1.1rem" }}>{cat.icon}</span>
                          <span>{locale === "bn" ? cat.nameBn : cat.nameEn}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>

                {/* COLLECTIONS ⌵ */}
                <div
                  style={{ position: "relative" }}
                  onMouseEnter={() => setActiveDropdown("collections")}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <button
                    type="button"
                    className={`${styles.navLinkBtn} ${activeDropdown === "collections" ? styles.navLinkBtnActive : ""}`}
                  >
                    <span>{locale === "bn" ? "কালেকশন" : "COLLECTIONS"}</span>
                    <ChevronDown size={14} />
                  </button>

                  {/* Dropdown Menu */}
                  {activeDropdown === "collections" && (
                    <div className={styles.dropdownMenu}>
                      <Link
                        href="/category/vegetables"
                        onClick={() => setActiveDropdown(null)}
                        className={styles.dropdownItem}
                      >
                        🌿 Organic Farm Produce
                      </Link>
                      <Link
                        href="/category/fish-and-meat"
                        onClick={() => setActiveDropdown(null)}
                        className={styles.dropdownItem}
                      >
                        🐟 River-Caught Fresh Fish
                      </Link>
                      <Link
                        href="/b2b"
                        onClick={() => setActiveDropdown(null)}
                        className={styles.dropdownItem}
                      >
                        🏢 B2B Wholesale Bulk Deals
                      </Link>
                      <Link
                        href="/bundles"
                        onClick={() => setActiveDropdown(null)}
                        className={styles.dropdownItem}
                      >
                        📦 Weekly Grocery Bundles
                      </Link>
                    </div>
                  )}
                </div>

                {/* SALE (Highlighted in Pink/Red) */}
                <Link href="/category/all" className={styles.saleLink}>
                  <span>SALE</span>
                </Link>

                {/* BLOG / RECIPES */}
                <Link href="/recipes" className={styles.blogLink}>
                  <span>BLOG</span>
                </Link>
              </nav>

            </div>

            {/* ── Right Side: Language + Account + Cart + Search ── */}
            <div className={styles.rightGroup}>
              
              {/* Language Switcher */}
              <button
                type="button"
                onClick={toggleLocale}
                title="Change Language"
                className={styles.langBtn}
              >
                <Globe size={15} />
                <span>{locale === "bn" ? "বাং" : "EN"}</span>
              </button>

              {/* Account Icon */}
              <Link href="/account" aria-label="My Account" className={styles.iconBtn}>
                <User size={20} strokeWidth={2} />
              </Link>

              {/* Shopping Bag / Cart Icon with Black Badge */}
              <button
                type="button"
                onClick={openCart}
                aria-label="Open Shopping Bag"
                className={styles.iconBtn}
              >
                <ShoppingBag size={20} strokeWidth={2} />
                <span className={styles.cartBadge}>
                  {mounted ? getItemCount() : 0}
                </span>
              </button>

              {/* Search Icon */}
              <div ref={searchRef} style={{ position: "relative" }}>
                <button
                  type="button"
                  onClick={() => setIsSearchOpen(!isSearchOpen)}
                  aria-label="Search"
                  className={styles.iconBtn}
                >
                  <Search size={20} strokeWidth={2} />
                </button>

                {/* Expandable Search Input Bar */}
                {isSearchOpen && (
                  <div className={styles.searchDropdown}>
                    <form onSubmit={handleSearchSubmit}>
                      <div className={styles.searchFormBox}>
                        <Search size={15} color="#64748b" style={{ flexShrink: 0 }} />
                        <input
                          ref={searchInputRef}
                          type="text"
                          value={searchQuery}
                          onChange={e => setSearchQuery(e.target.value)}
                          placeholder="Search fish, vegetables, fruits..."
                          className={styles.searchInput}
                        />
                        {searchQuery && (
                          <button
                            type="button"
                            onClick={() => setSearchQuery("")}
                            style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", display: "flex", alignItems: "center" }}
                          >
                            <X size={14} />
                          </button>
                        )}
                      </div>
                    </form>

                    {/* Instant Suggestions */}
                    {searchResults.length > 0 && (
                      <div style={{ marginTop: "8px", paddingTop: "8px", borderTop: "1px solid #f1f5f9" }}>
                        {searchResults.map(p => (
                          <Link
                            key={p.id}
                            href={`/product/${p.slug}`}
                            onClick={() => setIsSearchOpen(false)}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              padding: "8px 10px",
                              borderRadius: "6px",
                              color: "#0f172a",
                              textDecoration: "none",
                              fontSize: "0.82rem",
                              fontWeight: 600,
                            }}
                            onMouseEnter={e => (e.currentTarget.style.background = "#f1f5f9")}
                            onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                          >
                            <span>{locale === "bn" ? p.nameBn : p.nameEn}</span>
                            <span style={{ color: "#007A48", fontWeight: 700 }}>{formatPrice(p.basePrice)}</span>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

            </div>

          </div>
        </div>
      </header>

      {/* ── Slide-Out Drawer Store Navbar (Matching Image 2 Layered Dropdown) ── */}
      {isDrawerOpen && (
        <>
          {/* Backdrop */}
          <div
            className={styles.drawerBackdrop}
            onClick={() => setIsDrawerOpen(false)}
          />

          {/* Left Drawer Shell */}
          <div className={styles.drawerShell}>
            
            {/* Drawer Header (Logo + Close X) */}
            <div className={styles.drawerHeader}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0f172a" strokeWidth="2.4">
                  <polygon points="12 2 2 7 12 12 22 7 12 2" />
                  <polyline points="2 17 12 22 22 17" />
                  <polyline points="2 12 12 17 22 12" />
                </svg>
                <span style={{ fontSize: "1.05rem", fontWeight: 900, color: "#0f172a" }}>
                  TatkaBazar
                </span>
              </div>

              <button
                type="button"
                onClick={() => setIsDrawerOpen(false)}
                aria-label="Close"
                style={{
                  background: "none",
                  border: "none",
                  color: "#64748b",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  padding: "4px",
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Section 1: Account Group (Image 2) */}
            <div className={styles.drawerSection}>
              <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                
                <Link
                  href="/account"
                  onClick={() => setIsDrawerOpen(false)}
                  className={styles.drawerLink}
                >
                  <User size={16} color="#64748b" />
                  <span>Account</span>
                </Link>

                <Link
                  href="/account"
                  onClick={() => setIsDrawerOpen(false)}
                  className={styles.drawerLink}
                >
                  <History size={16} color="#64748b" />
                  <span>Purchase History</span>
                </Link>

                <Link
                  href="/account"
                  onClick={() => setIsDrawerOpen(false)}
                  className={styles.drawerLink}
                >
                  <CreditCard size={16} color="#64748b" />
                  <span>Payment Methods</span>
                </Link>

                <Link
                  href="/account"
                  onClick={() => setIsDrawerOpen(false)}
                  className={styles.drawerLink}
                >
                  <Settings size={16} color="#64748b" />
                  <span>Account Settings</span>
                </Link>

                <button
                  type="button"
                  onClick={handleLogout}
                  className={styles.drawerLogoutBtn}
                >
                  <LogOut size={16} />
                  <span>Sign Out</span>
                </button>

              </div>
            </div>

            {/* Section 2: Help Group (Image 2) */}
            <div className={styles.drawerSection}>
              <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                
                <Link
                  href="/account"
                  onClick={() => setIsDrawerOpen(false)}
                  className={styles.drawerLink}
                >
                  <HelpCircle size={16} color="#64748b" />
                  <span>Help Center</span>
                </Link>

                <Link
                  href="/account"
                  onClick={() => setIsDrawerOpen(false)}
                  className={styles.drawerLink}
                >
                  <MessageSquare size={16} color="#64748b" />
                  <span>FAQs</span>
                </Link>

                <Link
                  href="/account"
                  onClick={() => setIsDrawerOpen(false)}
                  className={styles.drawerLink}
                >
                  <PhoneCall size={16} color="#64748b" />
                  <span>Support Tickets</span>
                </Link>

              </div>
            </div>

            {/* Section 3: Wishlist & Discovery Group (Image 2) */}
            <div style={{ padding: "14px 16px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                
                <Link
                  href="/account"
                  onClick={() => setIsDrawerOpen(false)}
                  className={styles.drawerLink}
                >
                  <Heart size={16} color="#64748b" />
                  <span>Wishlist</span>
                </Link>

                <Link
                  href="/account"
                  onClick={() => setIsDrawerOpen(false)}
                  className={styles.drawerLink}
                >
                  <Bookmark size={16} color="#64748b" />
                  <span>Saved Items</span>
                </Link>

                <Link
                  href="/account"
                  onClick={() => setIsDrawerOpen(false)}
                  className={styles.drawerLink}
                >
                  <Bell size={16} color="#64748b" />
                  <span>Back in Stock Alerts</span>
                </Link>

                <Link
                  href="/account"
                  onClick={() => setIsDrawerOpen(false)}
                  className={styles.drawerLink}
                >
                  <Eye size={16} color="#64748b" />
                  <span>Recently Viewed</span>
                </Link>

              </div>
            </div>

          </div>
        </>
      )}
    </>
  );
}
