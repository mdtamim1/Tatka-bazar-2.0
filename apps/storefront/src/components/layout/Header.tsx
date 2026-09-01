"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search, ShoppingCart, Heart, Globe, User,
  ChevronDown, X, Zap, Sparkles,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useCartStore } from "@/lib/cart-store";
import { PRODUCTS } from "@/lib/catalog";
import { useDebounce } from "@/hooks/useDebounce";

export function Header() {
  const router = useRouter();
  const { locale, t, toggleLocale, formatPrice } = useLanguage();
  const { getItemCount, getGrandTotal, openCart, wishlistIds } = useCartStore();

  const [searchQuery, setSearchQuery]           = useState("");
  const debouncedSearchQuery                    = useDebounce(searchQuery, 250);
  const [isSearchOpen, setIsSearchOpen]         = useState(false);
  const [mounted, setMounted]                   = useState(false);
  const [cartPulse, setCartPulse]               = useState(false);
  const [scrolled, setScrolled]                 = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    const handleScroll = () => setScrolled(window.scrollY > 10);
    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const prevCount = useRef(0);
  useEffect(() => {
    if (!mounted) return;
    const count = getItemCount();
    if (count !== prevCount.current) {
      setCartPulse(true);
      setTimeout(() => setCartPulse(false), 600);
      prevCount.current = count;
    }
  });

  const searchResults = debouncedSearchQuery.trim()
    ? PRODUCTS.filter(p => {
        const q = debouncedSearchQuery.toLowerCase();
        return (
          p.nameBn.toLowerCase().includes(q) ||
          p.nameEn.toLowerCase().includes(q) ||
          p.categoryNameBn.toLowerCase().includes(q) ||
          p.categoryNameEn.toLowerCase().includes(q)
        );
      }).slice(0, 6)
    : [];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsSearchOpen(false);
      router.push(`/category/all?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const announcementItems = [
    locale === "bn" ? "⚡ আজ অর্ডার করুন, ৪ ঘন্টায় পান" : "⚡ Order today, get in 4 hours",
    locale === "bn" ? "🌿 ১০০% জৈব সবজি — রাসায়নিকমুক্ত" : "🌿 100% organic vegetables — pesticide-free",
    locale === "bn" ? "🐟 আজ ধরা তাজা ইলিশ উপলব্ধ" : "🐟 Fresh Hilsa caught today — limited stock",
    locale === "bn" ? "🏪 B2B পাইকারি অ্যাকাউন্ট — বিশেষ ছাড়" : "🏪 B2B wholesale accounts — special rates",
    locale === "bn" ? "📱 অ্যাপে প্রথম অর্ডারে ৳১০০ ক্যাশব্যাক" : "📱 ৳100 cashback on first app order",
  ];

  return (
    <header style={{ position: "sticky", top: 0, zIndex: 200, width: "100%" }}>

      {/* 1 ── Announcement Marquee Bar */}
      <div
        style={{
          background: "linear-gradient(90deg, #030507 0%, #060E12 40%, #050A0E 60%, #030507 100%)",
          borderBottom: "1px solid rgba(16,216,118,0.12)",
          padding: "6px 0",
          overflow: "hidden",
          position: "relative",
        }}
      >
        <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: "60px", background: "linear-gradient(90deg, #030507, transparent)", zIndex: 2, pointerEvents: "none" }} />
        <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: "60px", background: "linear-gradient(270deg, #030507, transparent)", zIndex: 2, pointerEvents: "none" }} />

        <div className="marquee-track" style={{ gap: "0px" }}>
          {[...announcementItems, ...announcementItems].map((item, i) => (
            <span
              key={i}
              style={{
                display: "inline-flex",
                alignItems: "center",
                fontSize: "0.75rem",
                fontWeight: 500,
                whiteSpace: "nowrap",
                padding: "0 30px",
                color: i % 2 === 0 ? "rgba(240,242,247,0.75)" : "var(--emerald)",
                letterSpacing: "0.01em",
              }}
            >
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* 2 ── Main Nav */}
      <div
        className="glass-header"
        style={{
          padding: "10px 0",
          background: "rgba(10, 14, 20, 0.94)",
          backdropFilter: "blur(18px)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          boxShadow: scrolled
            ? "0 4px 30px rgba(0,0,0,0.7), 0 1px 0 rgba(16,216,118,0.1)"
            : "0 1px 0 rgba(255,255,255,0.04)",
          transition: "all 0.3s ease",
        }}
      >
        <div className="container">
          {/* Main Flex Row */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "12px",
            }}
          >
            {/* Logo */}
            <Link href="/" style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: 0, textDecoration: "none" }}>
              <div
                style={{
                  width: "38px", height: "38px",
                  borderRadius: "10px",
                  background: "linear-gradient(135deg, #10D876 0%, #047A43 100%)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#fff",
                  boxShadow: "0 4px 18px rgba(16,216,118,0.35)",
                  flexShrink: 0,
                }}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
              </div>
              <div>
                <div
                  style={{
                    fontSize: "1.18rem",
                    fontWeight: 800,
                    letterSpacing: "-0.03em",
                    lineHeight: 1.1,
                    fontFamily: "var(--font-heading)",
                  }}
                >
                  <span style={{ color: "var(--text-main)" }}>
                    {locale === "bn" ? "তাতকা" : "Tatka"}
                  </span>
                  <span style={{ color: "var(--emerald)", marginLeft: "3px" }}>
                    {locale === "bn" ? " বাজার" : " Bazar"}
                  </span>
                  <span
                    style={{
                      fontSize: "0.55rem",
                      padding: "2px 5px",
                      background: "linear-gradient(135deg, #F5C842, #D4A017)",
                      color: "#000",
                      borderRadius: "4px",
                      fontWeight: 800,
                      letterSpacing: "0.02em",
                      marginLeft: "5px",
                      verticalAlign: "middle",
                    }}
                  >
                    2.0
                  </span>
                </div>
                <p className="hidden-mobile" style={{ fontSize: "0.66rem", color: "var(--text-muted)", fontWeight: 500, margin: "2px 0 0 0" }}>
                  {t.tagline}
                </p>
              </div>
            </Link>

            {/* Desktop Search Bar (Hidden on Mobile) */}
            <div ref={searchRef} className="hidden-mobile" style={{ position: "relative", flex: 1, maxWidth: "520px", margin: "0 10px" }}>
              <form onSubmit={handleSearchSubmit}>
                <div
                  style={{
                    display: "flex", alignItems: "center",
                    background: isSearchOpen ? "#131b26" : "rgba(255, 255, 255, 0.05)",
                    borderRadius: "var(--radius-full)",
                    padding: "3px 4px 3px 16px",
                    border: isSearchOpen
                      ? "1.5px solid var(--emerald)"
                      : "1.5px solid rgba(255, 255, 255, 0.1)",
                    boxShadow: isSearchOpen
                      ? "0 0 0 3px rgba(16,216,118,0.15)"
                      : "none",
                    transition: "all 0.2s ease",
                  }}
                >
                  <Search size={16} color={isSearchOpen ? "var(--emerald)" : "var(--text-muted)"} style={{ flexShrink: 0 }} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => { setSearchQuery(e.target.value); setIsSearchOpen(true); }}
                    onFocus={() => setIsSearchOpen(true)}
                    placeholder={t.searchPlaceholder}
                    style={{
                      width: "100%", background: "transparent",
                      border: "none", outline: "none",
                      padding: "8px 10px",
                      color: "#ffffff",
                      fontSize: "0.85rem",
                    }}
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => { setSearchQuery(""); setIsSearchOpen(false); }}
                      style={{ padding: "4px", color: "var(--text-muted)", display: "flex", alignItems: "center", background: "none", border: "none", cursor: "pointer" }}
                    >
                      <X size={14} />
                    </button>
                  )}
                  <button
                    type="submit"
                    style={{
                      background: "linear-gradient(135deg, #10D876, #059E57)",
                      color: "#03140a",
                      padding: "7px 16px",
                      borderRadius: "var(--radius-full)",
                      fontWeight: 700,
                      fontSize: "0.8rem",
                      display: "flex", alignItems: "center", gap: "4px",
                      border: "none",
                      cursor: "pointer",
                      flexShrink: 0,
                    }}
                  >
                    <Search size={13} />
                    <span>{locale === "bn" ? "খুঁজুন" : "Search"}</span>
                  </button>
                </div>
              </form>

              {/* Desktop Suggestions Dropdown */}
              {isSearchOpen && searchResults.length > 0 && (
                <div
                  style={{
                    position: "absolute", top: "calc(100% + 8px)", left: 0, right: 0,
                    background: "#141b26",
                    borderRadius: "14px",
                    boxShadow: "0 16px 40px rgba(0,0,0,0.7), 0 0 0 1px rgba(16,216,118,0.15)",
                    border: "1px solid rgba(16,216,118,0.18)",
                    overflow: "hidden",
                    zIndex: 250,
                  }}
                >
                  <div
                    style={{
                      padding: "8px 14px",
                      fontSize: "0.68rem", fontWeight: 700, color: "var(--text-muted)",
                      background: "rgba(255,255,255,0.03)",
                      textTransform: "uppercase", letterSpacing: "0.08em",
                      display: "flex", alignItems: "center", gap: "6px",
                      borderBottom: "1px solid rgba(255,255,255,0.06)",
                    }}
                  >
                    <Sparkles size={11} color="var(--emerald)" />
                    {locale === "bn" ? "তাজা পণ্যের সাজেশন" : "Fresh Matches"}
                  </div>
                  {searchResults.map(prod => (
                    <Link
                      key={prod.id}
                      href={`/product/${prod.slug}`}
                      onClick={() => setIsSearchOpen(false)}
                      style={{
                        display: "flex", alignItems: "center", gap: "12px",
                        padding: "9px 14px",
                        borderBottom: "1px solid rgba(255,255,255,0.04)",
                        textDecoration: "none",
                        color: "inherit",
                        transition: "background 0.15s ease",
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.05)")}
                      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                    >
                      <img
                        src={prod.images[0]}
                        alt={locale === "bn" ? prod.nameBn : prod.nameEn}
                        style={{ width: "38px", height: "38px", objectFit: "cover", borderRadius: "8px" }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "#ffffff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {locale === "bn" ? prod.nameBn : prod.nameEn}
                        </div>
                        <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
                          {locale === "bn" ? prod.categoryNameBn : prod.categoryNameEn}
                        </div>
                      </div>
                      <div
                        style={{
                          fontWeight: 800, fontSize: "0.86rem",
                          color: "var(--emerald)",
                        }}
                      >
                        {formatPrice(prod.basePrice)}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Right Action Controls */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>

              {/* Language Switcher */}
              <button
                onClick={toggleLocale}
                title="Switch Language"
                style={{
                  display: "flex", alignItems: "center", gap: "4px",
                  padding: "6px 10px",
                  borderRadius: "var(--radius-full)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  background: "rgba(255,255,255,0.05)",
                  color: "#ffffff",
                  fontWeight: 700, fontSize: "0.76rem",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
              >
                <Globe size={13} color="var(--emerald)" />
                <span>{locale === "bn" ? "EN" : "বাং"}</span>
              </button>

              {/* Wishlist */}
              <Link
                href="/account"
                style={{
                  position: "relative",
                  padding: "8px",
                  borderRadius: "50%",
                  background: "rgba(255,255,255,0.05)",
                  color: "#ffffff",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  border: "1px solid rgba(255,255,255,0.1)",
                  textDecoration: "none",
                }}
                title={t.wishlist}
              >
                <Heart size={16} color={mounted && wishlistIds.length > 0 ? "var(--rose)" : "var(--text-muted)"} fill={mounted && wishlistIds.length > 0 ? "var(--rose)" : "none"} />
                {mounted && wishlistIds.length > 0 && (
                  <span
                    style={{
                      position: "absolute", top: "-3px", right: "-3px",
                      width: "16px", height: "16px",
                      borderRadius: "50%",
                      background: "var(--rose)",
                      color: "#fff", fontSize: "0.62rem", fontWeight: 800,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      border: "2px solid #080c11",
                    }}
                  >
                    {wishlistIds.length}
                  </span>
                )}
              </Link>

              {/* Track Order (Desktop) */}
              <Link
                href="/track"
                className="hidden-mobile"
                style={{
                  display: "flex", alignItems: "center", gap: "5px",
                  padding: "7px 12px",
                  borderRadius: "var(--radius-full)",
                  background: "rgba(16, 216, 118, 0.08)",
                  color: "var(--emerald)",
                  fontWeight: 600, fontSize: "0.78rem",
                  border: "1px solid rgba(16, 216, 118, 0.2)",
                  textDecoration: "none",
                }}
              >
                <Zap size={13} color="var(--emerald)" />
                <span>{locale === "bn" ? "ট্র্যাক" : "Track"}</span>
              </Link>

              {/* Account Link */}
              <Link
                href="/account"
                style={{
                  display: "flex", alignItems: "center", gap: "6px",
                  padding: "7px 12px",
                  borderRadius: "var(--radius-full)",
                  background: "rgba(255,255,255,0.05)",
                  color: "#ffffff",
                  fontWeight: 600, fontSize: "0.8rem",
                  border: "1px solid rgba(255,255,255,0.12)",
                  textDecoration: "none",
                }}
              >
                <User size={14} color="var(--emerald)" />
                <span className="hidden-mobile">{locale === "bn" ? "অ্যাকাউন্ট" : "Account"}</span>
              </Link>

              {/* Cart Button */}
              <button
                onClick={openCart}
                style={{
                  display: "flex", alignItems: "center", gap: "8px",
                  padding: "7px 14px",
                  borderRadius: "var(--radius-full)",
                  background: "linear-gradient(135deg, #10D876 0%, #059E57 100%)",
                  color: "#03140a",
                  fontWeight: 800,
                  boxShadow: "0 4px 16px rgba(16,216,118,0.4)",
                  border: "none",
                  cursor: "pointer",
                  flexShrink: 0,
                }}
              >
                <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                  <ShoppingCart size={16} />
                  {mounted && getItemCount() > 0 && (
                    <span
                      style={{
                        position: "absolute", top: "-8px", right: "-10px",
                        background: "#000",
                        color: "#fff",
                        borderRadius: "50%",
                        minWidth: "17px", height: "17px",
                        fontSize: "0.62rem", fontWeight: 900,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        padding: "2px",
                        border: "1px solid #10D876",
                      }}
                    >
                      {getItemCount()}
                    </span>
                  )}
                </div>
                <span className="hidden-mobile" style={{ fontSize: "0.82rem" }}>
                  {mounted && getItemCount() > 0 ? formatPrice(getGrandTotal()) : t.cart}
                </span>
              </button>

            </div>
          </div>

          {/* Mobile Search Bar Row (Show on Mobile only) */}
          <div className="show-mobile" style={{ marginTop: "10px" }}>
            <form onSubmit={handleSearchSubmit}>
              <div
                style={{
                  display: "flex", alignItems: "center",
                  background: "rgba(255, 255, 255, 0.06)",
                  borderRadius: "var(--radius-full)",
                  padding: "2px 4px 2px 14px",
                  border: "1px solid rgba(255, 255, 255, 0.12)",
                }}
              >
                <Search size={15} color="var(--text-muted)" style={{ flexShrink: 0 }} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder={locale === "bn" ? "মাছ, মাংস, সবজি বা ফল খুঁজুন..." : "Search fish, meat, veggies..."}
                  style={{
                    width: "100%", background: "transparent",
                    border: "none", outline: "none",
                    padding: "8px 10px",
                    color: "#ffffff",
                    fontSize: "0.82rem",
                  }}
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    style={{ padding: "4px", color: "var(--text-muted)", display: "flex", alignItems: "center", background: "none", border: "none" }}
                  >
                    <X size={14} />
                  </button>
                )}
                <button
                  type="submit"
                  style={{
                    background: "linear-gradient(135deg, #10D876, #059E57)",
                    color: "#03140a",
                    padding: "6px 14px",
                    borderRadius: "var(--radius-full)",
                    fontWeight: 700,
                    fontSize: "0.78rem",
                    border: "none",
                    cursor: "pointer",
                    flexShrink: 0,
                  }}
                >
                  <Search size={12} />
                </button>
              </div>
            </form>
          </div>

        </div>
      </div>

    </header>
  );
}
