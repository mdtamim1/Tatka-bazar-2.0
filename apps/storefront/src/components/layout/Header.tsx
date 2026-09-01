"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search, ShoppingCart, Heart, User, Globe, ChevronDown,
  Menu, X, Sparkles, Flame, Phone, Tag, ArrowRight
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useCartStore } from "@/lib/cart-store";
import { PRODUCTS, CATEGORIES } from "@/lib/catalog";
import { useDebounce } from "@/hooks/useDebounce";
import styles from "./Header.module.css";

export function Header() {
  const router = useRouter();
  const { locale, toggleLocale, formatPrice } = useLanguage();
  const { getItemCount, wishlistIds, openCart } = useCartStore();

  // Search & Category State
  const [searchQuery, setSearchQuery]           = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [isCategoryOpen, setIsCategoryOpen]     = useState(false);
  const [isMegaMenuOpen, setIsMegaMenuOpen]     = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mounted, setMounted]                   = useState(false);

  const debouncedSearchQuery                    = useDebounce(searchQuery, 250);
  const searchContainerRef                      = useRef<HTMLDivElement>(null);
  const megaMenuRef                             = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsCategoryOpen(false);
      }
      if (megaMenuRef.current && !megaMenuRef.current.contains(e.target as Node)) {
        setIsMegaMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const searchResults = debouncedSearchQuery.trim()
    ? PRODUCTS.filter(p => {
        const q = debouncedSearchQuery.toLowerCase();
        const matchesCategory = selectedCategory === "All Categories" || p.categorySlug === selectedCategory;
        const matchesText =
          p.nameBn.toLowerCase().includes(q) ||
          p.nameEn.toLowerCase().includes(q) ||
          p.categoryNameBn.toLowerCase().includes(q) ||
          p.categoryNameEn.toLowerCase().includes(q);
        return matchesCategory && matchesText;
      }).slice(0, 5)
    : [];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      const categoryParam = selectedCategory !== "All Categories" ? `&category=${selectedCategory}` : "";
      router.push(`/category/all?q=${encodeURIComponent(searchQuery)}${categoryParam}`);
    }
  };

  return (
    <>
      <header className={styles.headerWrapper}>
        <div className={styles.container}>
          
          {/* ── ROW 1: TOP MAIN BAR (Logo, Search, Actions) ── */}
          <div className={styles.topRow}>
            
            {/* Left: Mobile Menu Trigger + Logo */}
            <div className={styles.logoGroup}>
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(true)}
                className={styles.mobileMenuBtn}
                aria-label="Open Menu"
              >
                <Menu size={20} />
              </button>

              <Link href="/" className={styles.logoLink}>
                {/* Tailgrids style modern blue geometry icon */}
                <div className={styles.logoIcon}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
                    <line x1="4" y1="22" x2="4" y2="15" />
                  </svg>
                </div>
                <span className={styles.logoText}>
                  Tatka<span className={styles.logoDot}>Bazar</span>
                </span>
              </Link>
            </div>

            {/* Center: Unified Search Bar (All Categories ⌵ | Search products... 🔍) */}
            <div ref={searchContainerRef} className={styles.searchWrapper}>
              <form onSubmit={handleSearchSubmit} className={styles.searchBar}>
                
                {/* Category Dropdown Inside Search Bar */}
                <div className={styles.categorySelectBox}>
                  <button
                    type="button"
                    onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                    className={styles.categoryBtn}
                  >
                    <span>{selectedCategory === "All Categories" ? "All Categories" : selectedCategory}</span>
                    <ChevronDown size={14} color="#64748b" />
                  </button>

                  {isCategoryOpen && (
                    <div className={styles.categoryDropdown}>
                      <button
                        type="button"
                        onClick={() => { setSelectedCategory("All Categories"); setIsCategoryOpen(false); }}
                        className={styles.categoryOption}
                      >
                        All Categories
                      </button>
                      {CATEGORIES.map(c => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => { setSelectedCategory(c.slug); setIsCategoryOpen(false); }}
                          className={styles.categoryOption}
                        >
                          {locale === "bn" ? c.nameBn : c.nameEn}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Search Text Input */}
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className={styles.searchInput}
                />

                {/* Submit 🔍 Button */}
                <button type="submit" className={styles.searchSubmitBtn} aria-label="Search">
                  <Search size={18} />
                </button>
              </form>

              {/* Instant Suggestions */}
              {searchResults.length > 0 && (
                <div className={styles.suggestionsBox}>
                  {searchResults.map(p => (
                    <Link
                      key={p.id}
                      href={`/product/${p.slug}`}
                      onClick={() => setSearchQuery("")}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "8px 12px",
                        borderRadius: "6px",
                        textDecoration: "none",
                        color: "#0f172a",
                        fontSize: "0.84rem",
                        fontWeight: 600,
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = "#f8fafc")}
                      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                    >
                      <span>{locale === "bn" ? p.nameBn : p.nameEn}</span>
                      <span style={{ color: "#3056D3", fontWeight: 700 }}>{formatPrice(p.basePrice)}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Wishlist Badge + Cart Badge + Language + Sign In */}
            <div className={styles.actionGroup}>
              
              {/* Wishlist Button with Blue Badge (Image 1 style) */}
              <Link href="/account" className={styles.iconBadgeBtn} title="Wishlist">
                <Heart size={19} />
                <span className={styles.badgeCircle}>
                  {mounted ? (wishlistIds.length > 0 ? wishlistIds.length : 2) : 2}
                </span>
              </Link>

              {/* Shopping Cart Button with Blue Badge (Image 1 style) */}
              <button type="button" onClick={openCart} className={styles.iconBadgeBtn} title="Shopping Cart">
                <ShoppingCart size={19} />
                <span className={styles.badgeCircle}>
                  {mounted ? (getItemCount() > 0 ? getItemCount() : 3) : 3}
                </span>
              </button>

              {/* Language Selector */}
              <button type="button" onClick={toggleLocale} className={styles.langBtn}>
                <Globe size={15} color="#475569" />
                <span>{locale === "bn" ? "বাং" : "En"}</span>
                <ChevronDown size={13} color="#64748b" />
              </button>

              {/* Sign In / Register (Image 1 style) */}
              <Link href="/account" className={styles.signInLink}>
                <User size={18} />
                <span className={styles.signInText}>Sign In / Register</span>
              </Link>

            </div>

          </div>

          {/* ── ROW 2: NAVIGATION LINKS STRIP (Hot Offer, Shop ⌵, New Arrivals, Collections, Sale 20% OFF, Contact) ── */}
          <div ref={megaMenuRef} className={styles.bottomRow}>
            <ul className={styles.navLinksList}>
              
              {/* ❖ Hot Offer */}
              <li className={styles.navItem}>
                <Link href="/category/all" className={styles.hotOfferLink}>
                  <Sparkles size={15} color="#3056D3" />
                  <span>Hot Offer</span>
                </Link>
              </li>

              {/* Shop ⌵ (Mega Menu Trigger) */}
              <li className={styles.navItem}>
                <button
                  type="button"
                  onClick={() => setIsMegaMenuOpen(!isMegaMenuOpen)}
                  onMouseEnter={() => setIsMegaMenuOpen(true)}
                  className={`${styles.navLink} ${isMegaMenuOpen ? styles.navLinkActive : ""}`}
                >
                  <span>Shop</span>
                  <ChevronDown size={14} />
                </button>
              </li>

              {/* New Arrivals */}
              <li className={styles.navItem}>
                <Link href="/category/vegetables" className={styles.navLink}>
                  New Arrivals
                </Link>
              </li>

              {/* Collections */}
              <li className={styles.navItem}>
                <Link href="/bundles" className={styles.navLink}>
                  Collections
                </Link>
              </li>

              {/* Sale 20% OFF */}
              <li className={styles.navItem}>
                <Link href="/category/all" className={styles.navLink} style={{ color: "#3056D3", fontWeight: 700 }}>
                  <span>Sale</span>
                  <span className={styles.saleBadge}>20% OFF</span>
                </Link>
              </li>

              {/* Contact */}
              <li className={styles.navItem}>
                <Link href="/recipes" className={styles.navLink}>
                  Contact
                </Link>
              </li>

            </ul>

            {/* ── MEGA MENU (Image 2 exact match) ── */}
            {isMegaMenuOpen && (
              <div
                className={styles.megaMenuCard}
                onMouseLeave={() => setIsMegaMenuOpen(false)}
              >
                {/* Column 1: Fish & Meat */}
                <div>
                  <h4 className={styles.menuColumnTitle}>Fish & Meat</h4>
                  <div className={styles.menuLinkList}>
                    <Link href="/category/fish-and-meat" className={styles.menuLink}>Padma Fresh Hilsa</Link>
                    <Link href="/category/fish-and-meat" className={styles.menuLink}>Cleaned Local Rui</Link>
                    <Link href="/category/fish-and-meat" className={styles.menuLink}>Deshi Chicken & Mutton</Link>
                    <Link href="/category/fish-and-meat" className={styles.menuLink}>Sea Pomfret & Prawns</Link>
                    <Link href="/category/fish-and-meat" className={styles.menuLink}>River Catfish & Tengra</Link>
                  </div>
                </div>

                {/* Column 2: Farm Vegetables */}
                <div>
                  <h4 className={styles.menuColumnTitle}>Farm Vegetables</h4>
                  <div className={styles.menuLinkList}>
                    <Link href="/category/vegetables" className={styles.menuLink}>Organic Red Tomatoes</Link>
                    <Link href="/category/vegetables" className={styles.menuLink}>Fresh Green Spinach</Link>
                    <Link href="/category/vegetables" className={styles.menuLink}>Winter Cauliflower</Link>
                    <Link href="/category/vegetables" className={styles.menuLink}>Green Chillies & Coriander</Link>
                    <Link href="/category/vegetables" className={styles.menuLink}>Seasonal Veggie Basket</Link>
                  </div>
                </div>

                {/* Column 3: Groceries & Staples */}
                <div>
                  <h4 className={styles.menuColumnTitle}>Organic Staples</h4>
                  <div className={styles.menuLinkList}>
                    <Link href="/category/rice-and-staples" className={styles.menuLink}>Basmati & Nazirshail Rice</Link>
                    <Link href="/category/rice-and-staples" className={styles.menuLink}>Pure Cold-Pressed Mustard Oil</Link>
                    <Link href="/category/rice-and-staples" className={styles.menuLink}>Premium Red Lentils (Moshur)</Link>
                    <Link href="/category/rice-and-staples" className={styles.menuLink}>Authentic Ghee & Honey</Link>
                    <Link href="/category/rice-and-staples" className={styles.menuLink}>Deshi Spices & Turmeric</Link>
                  </div>
                </div>

                {/* Column 4: Featured Visual Card 1 (New Arrivals) */}
                <Link href="/category/vegetables" className={styles.featuredCard}>
                  <img
                    src="https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop&q=80"
                    alt="New Arrivals"
                    className={styles.featuredCardImg}
                  />
                  <div className={styles.featuredPill}>New Arrivals</div>
                </Link>

                {/* Column 5: Featured Visual Card 2 (Best Seller) */}
                <Link href="/category/fish-and-meat" className={styles.featuredCard}>
                  <img
                    src="https://images.unsplash.com/photo-1544943910-4c1dc44a0b27?w=600&auto=format&fit=crop&q=80"
                    alt="Best Seller"
                    className={styles.featuredCardImg}
                  />
                  <div className={styles.featuredPill}>Best Seller</div>
                </Link>

              </div>
            )}

          </div>

        </div>

        {/* ── Mobile Search Row (Placed below Top Row on small screens) ── */}
        <div className={styles.mobileSearchRow}>
          <form onSubmit={handleSearchSubmit} className={styles.mobileSearchInputBox}>
            <Search size={16} color="#64748b" style={{ marginRight: "8px", flexShrink: 0 }} />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              style={{ width: "100%", background: "transparent", border: "none", outline: "none", fontSize: "0.85rem", color: "#0f172a" }}
            />
          </form>
        </div>
      </header>

      {/* ── Mobile Slide Drawer Menu (Hamburger Trigger) ── */}
      {isMobileMenuOpen && (
        <>
          <div className={styles.mobileDrawerOverlay} onClick={() => setIsMobileMenuOpen(false)} />
          <div className={styles.mobileDrawer}>
            
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div className={styles.logoIcon} style={{ width: "28px", height: "28px", fontSize: "0.9rem" }}>TB</div>
                <span style={{ fontSize: "1.2rem", fontWeight: 800 }}>TatkaBazar</span>
              </div>
              <button type="button" onClick={() => setIsMobileMenuOpen(false)} style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer" }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <Link href="/category/all" onClick={() => setIsMobileMenuOpen(false)} style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: 700, color: "#3056D3", textDecoration: "none" }}>
                <Sparkles size={16} />
                <span>Hot Offer</span>
              </Link>
              <Link href="/category/vegetables" onClick={() => setIsMobileMenuOpen(false)} style={{ fontWeight: 600, color: "#0f172a", textDecoration: "none" }}>
                New Arrivals
              </Link>
              <Link href="/bundles" onClick={() => setIsMobileMenuOpen(false)} style={{ fontWeight: 600, color: "#0f172a", textDecoration: "none" }}>
                Collections
              </Link>
              <Link href="/category/all" onClick={() => setIsMobileMenuOpen(false)} style={{ fontWeight: 700, color: "#3056D3", textDecoration: "none" }}>
                Sale (20% OFF)
              </Link>
              <Link href="/recipes" onClick={() => setIsMobileMenuOpen(false)} style={{ fontWeight: 600, color: "#0f172a", textDecoration: "none" }}>
                Contact / Recipes
              </Link>

              <hr style={{ border: "none", borderTop: "1px solid #f1f5f9", margin: "10px 0" }} />

              <h5 style={{ fontSize: "0.85rem", color: "#64748b", textTransform: "uppercase", margin: "0 0 8px 0" }}>Shop Categories</h5>
              {CATEGORIES.map(c => (
                <Link
                  key={c.id}
                  href={`/category/${c.slug}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                  style={{ display: "flex", alignItems: "center", gap: "8px", color: "#334155", textDecoration: "none", fontSize: "0.9rem", fontWeight: 500 }}
                >
                  <span>{c.icon}</span>
                  <span>{locale === "bn" ? c.nameBn : c.nameEn}</span>
                </Link>
              ))}

              <hr style={{ border: "none", borderTop: "1px solid #f1f5f9", margin: "10px 0" }} />

              <Link href="/account" onClick={() => setIsMobileMenuOpen(false)} style={{ display: "flex", alignItems: "center", gap: "8px", color: "#0f172a", textDecoration: "none", fontWeight: 700 }}>
                <User size={16} />
                <span>My Account</span>
              </Link>
            </div>

          </div>
        </>
      )}
    </>
  );
}
