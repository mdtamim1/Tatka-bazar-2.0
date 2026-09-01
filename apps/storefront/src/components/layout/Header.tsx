"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search, ShoppingCart, Heart, MapPin, Globe, User,
  ChevronDown, CheckCircle2, X, Menu, Zap, Sparkles,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useCartStore } from "@/lib/cart-store";
import { CATEGORIES, PRODUCTS, BRANCHES } from "@/lib/catalog";
import { useDebounce } from "@/hooks/useDebounce";

export function Header() {
  const router = useRouter();
  const { locale, t, toggleLocale, formatPrice } = useLanguage();
  const { getItemCount, getGrandTotal, openCart, wishlistIds, selectedHub, setSelectedHub } = useCartStore();

  const [searchQuery, setSearchQuery]             = useState("");
  const debouncedSearchQuery                      = useDebounce(searchQuery, 250);
  const [isSearchOpen, setIsSearchOpen]           = useState(false);
  const [isHubDropdownOpen, setIsHubDropdownOpen] = useState(false);
  const [mounted, setMounted]                     = useState(false);
  const [cartPulse, setCartPulse]                 = useState(false);
  const [scrolled, setScrolled]                   = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const hubRef    = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) setIsSearchOpen(false);
      if (hubRef.current    && !hubRef.current.contains(event.target as Node))    setIsHubDropdownOpen(false);
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

  const selectedBranch = BRANCHES.find(b => b.id === selectedHub) || BRANCHES[0]!;

  const announcementItems = [
    locale === "bn" ? "⚡ আজ অর্ডার করুন, ৪ ঘন্টায় পান" : "⚡ Order today, get in 4 hours",
    locale === "bn" ? "🌿 ১০০% জৈব সবজি — রাসায়নিকমুক্ত" : "🌿 100% organic vegetables — pesticide-free",
    locale === "bn" ? "🐟 আজ ধরা তাজা ইলিশ উপলব্ধ" : "🐟 Fresh Hilsa caught today — limited stock",
    locale === "bn" ? "🏪 B2B পাইকারি অ্যাকাউন্ট — বিশেষ ছাড়" : "🏪 B2B wholesale accounts — special rates",
    locale === "bn" ? "📱 অ্যাপে প্রথম অর্ডারে ৳১০০ ক্যাশব্যাক" : "📱 ৳100 cashback on first app order",
  ];

  return (
    <header style={{ position: "sticky", top: 0, zIndex: 200, width: "100%" }}>

      {/* 1 ── Announcement Marquee */}
      <div
        style={{
          background: "linear-gradient(90deg, #030507 0%, #060E12 40%, #050A0E 60%, #030507 100%)",
          borderBottom: "1px solid rgba(16,216,118,0.12)",
          padding: "7px 0",
          overflow: "hidden",
          position: "relative",
        }}
      >
        <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: "100px", background: "linear-gradient(90deg, #030507, transparent)", zIndex: 2, pointerEvents: "none" }} />
        <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: "100px", background: "linear-gradient(270deg, #030507, transparent)", zIndex: 2, pointerEvents: "none" }} />

        <div className="marquee-track" style={{ gap: "0px" }}>
          {[...announcementItems, ...announcementItems].map((item, i) => (
            <span
              key={i}
              style={{
                display: "inline-flex",
                alignItems: "center",
                fontSize: "0.78rem",
                fontWeight: 500,
                whiteSpace: "nowrap",
                padding: "0 40px",
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
          boxShadow: scrolled
            ? "0 4px 40px rgba(0,0,0,0.7), 0 1px 0 rgba(16,216,118,0.08)"
            : "0 1px 0 rgba(255,255,255,0.04)",
          transition: "box-shadow 0.3s ease",
        }}
      >
        <div
          className="container"
          style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "14px" }}
        >

          {/* Logo */}
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: "11px", flexShrink: 0 }}>
            <div
              style={{
                width: "42px", height: "42px",
                borderRadius: "12px",
                background: "linear-gradient(135deg, #10D876 0%, #047A43 100%)",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#fff",
                boxShadow: "0 6px 24px rgba(16,216,118,0.4), inset 0 1px 0 rgba(255,255,255,0.25)",
                position: "relative",
                flexShrink: 0,
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <div className="hidden-mobile">
              <div
                style={{
                  fontSize: "1.22rem",
                  fontWeight: 800,
                  letterSpacing: "-0.04em",
                  lineHeight: 1.1,
                  fontFamily: "var(--font-heading)",
                }}
              >
                <span style={{ color: "var(--text-main)" }}>
                  {locale === "bn" ? "তাতকা" : "Tatka"}
                </span>
                <span style={{ color: "var(--emerald)", marginLeft: "4px" }}>
                  {locale === "bn" ? " বাজার" : " Bazar"}
                </span>
                <span
                  style={{
                    fontSize: "0.58rem",
                    padding: "2px 6px",
                    background: "linear-gradient(135deg, #F5C842, #D4A017)",
                    color: "#000",
                    borderRadius: "5px",
                    fontWeight: 800,
                    letterSpacing: "0.03em",
                    marginLeft: "5px",
                    verticalAlign: "middle",
                    boxShadow: "0 2px 8px rgba(245,200,66,0.4)",
                  }}
                >
                  2.0
                </span>
              </div>
              <p style={{ fontSize: "0.68rem", color: "var(--text-muted)", fontWeight: 500, letterSpacing: "0.01em" }}>
                {t.tagline}
              </p>
            </div>
          </Link>

          {/* Hub Picker */}
          <div ref={hubRef} style={{ position: "relative" }} className="hidden-mobile">
            <button
              onClick={() => setIsHubDropdownOpen(!isHubDropdownOpen)}
              style={{
                display: "flex", alignItems: "center", gap: "8px",
                padding: "8px 14px",
                background: "rgba(16, 216, 118, 0.06)",
                borderRadius: "var(--radius-full)",
                border: "1.5px solid rgba(16, 216, 118, 0.18)",
                fontSize: "0.8rem", color: "var(--emerald)", fontWeight: 600,
                transition: "all var(--t-fast)",
                cursor: "pointer",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(16,216,118,0.12)"; e.currentTarget.style.borderColor = "rgba(16,216,118,0.35)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(16,216,118,0.06)"; e.currentTarget.style.borderColor = "rgba(16,216,118,0.18)"; }}
            >
              <MapPin size={14} color="var(--emerald)" />
              <div style={{ textAlign: "left" }}>
                <div style={{ fontSize: "0.6rem", color: "var(--text-muted)", lineHeight: 1, marginBottom: "1px" }}>{t.deliverTo}:</div>
                <div>{locale === "bn" ? selectedBranch.areaBn : selectedBranch.areaEn}</div>
              </div>
              <ChevronDown
                size={13}
                style={{
                  transition: "transform var(--t-fast)",
                  transform: isHubDropdownOpen ? "rotate(180deg)" : "rotate(0deg)",
                  color: "var(--text-muted)",
                }}
              />
            </button>

            {isHubDropdownOpen && (
              <div
                style={{
                  position: "absolute", top: "calc(100% + 12px)", left: 0,
                  width: "295px",
                  background: "var(--bg-card)",
                  borderRadius: "var(--radius-lg)",
                  boxShadow: "var(--shadow-xl), 0 0 0 1px rgba(16,216,118,0.1)",
                  border: "1px solid rgba(16,216,118,0.12)",
                  padding: "10px",
                  zIndex: 250,
                  animation: "fadeDown 0.2s var(--ease-out)",
                }}
              >
                <div style={{ padding: "6px 10px 10px", fontSize: "0.68rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                  {t.selectArea}
                </div>
                {BRANCHES.map(b => (
                  <button
                    key={b.id}
                    onClick={() => { setSelectedHub(b.id); setIsHubDropdownOpen(false); }}
                    style={{
                      width: "100%", textAlign: "left",
                      padding: "10px 12px",
                      borderRadius: "var(--radius-md)",
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      background: selectedHub === b.id ? "rgba(16,216,118,0.08)" : "transparent",
                      color: selectedHub === b.id ? "var(--emerald)" : "var(--text-body)",
                      fontSize: "0.85rem",
                      fontWeight: selectedHub === b.id ? 700 : 400,
                      transition: "background var(--t-fast)",
                      cursor: "pointer",
                      border: "none",
                    }}
                    onMouseEnter={e => { if (selectedHub !== b.id) e.currentTarget.style.background = "var(--bg-subtle)"; }}
                    onMouseLeave={e => { if (selectedHub !== b.id) e.currentTarget.style.background = "transparent"; }}
                  >
                    <div>
                      <div style={{ fontWeight: 600 }}>{locale === "bn" ? b.nameBn : b.nameEn}</div>
                      <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: "2px" }}>
                        {locale === "bn" ? b.deliveryTimeBn : b.deliveryTimeEn}
                      </div>
                    </div>
                    {selectedHub === b.id && <CheckCircle2 size={16} color="var(--emerald)" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Search Bar */}
          <div ref={searchRef} style={{ position: "relative", flex: 1, maxWidth: "560px" }}>
            <form onSubmit={handleSearchSubmit}>
              <div
                style={{
                  display: "flex", alignItems: "center",
                  background: isSearchOpen ? "var(--bg-card)" : "var(--bg-subtle)",
                  borderRadius: "var(--radius-full)",
                  padding: "4px 5px 4px 18px",
                  border: isSearchOpen
                    ? "1.5px solid var(--emerald)"
                    : "1.5px solid var(--border-medium)",
                  boxShadow: isSearchOpen
                    ? "0 0 0 4px rgba(16,216,118,0.1), var(--shadow-sm)"
                    : "none",
                  transition: "all var(--t-smooth)",
                }}
              >
                <Search size={16} color={isSearchOpen ? "var(--emerald)" : "var(--text-muted)"} style={{ flexShrink: 0, transition: "color var(--t-fast)" }} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => { setSearchQuery(e.target.value); setIsSearchOpen(true); }}
                  onFocus={() => setIsSearchOpen(true)}
                  placeholder={t.searchPlaceholder}
                  style={{
                    width: "100%", background: "transparent",
                    border: "none", outline: "none",
                    padding: "9px 10px",
                    color: "var(--text-main)",
                    fontSize: "var(--text-sm)",
                  }}
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => { setSearchQuery(""); setIsSearchOpen(false); }}
                    style={{ padding: "4px", color: "var(--text-muted)", display: "flex", alignItems: "center" }}
                  >
                    <X size={14} />
                  </button>
                )}
                <button
                  type="submit"
                  style={{
                    background: "linear-gradient(135deg, #10D876, #059E57)",
                    color: "var(--bg-page)",
                    padding: "8px 18px",
                    borderRadius: "var(--radius-full)",
                    fontWeight: 700,
                    fontSize: "0.82rem",
                    display: "flex", alignItems: "center", gap: "5px",
                    boxShadow: "0 2px 12px rgba(16,216,118,0.4)",
                    transition: "all var(--t-fast)",
                    border: "none",
                    cursor: "pointer",
                    flexShrink: 0,
                  }}
                  onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.04)"; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; }}
                >
                  <Search size={14} />
                  <span className="hidden-mobile">{locale === "bn" ? "খুঁজুন" : "Search"}</span>
                </button>
              </div>
            </form>

            {isSearchOpen && searchResults.length > 0 && (
              <div
                style={{
                  position: "absolute", top: "calc(100% + 10px)", left: 0, right: 0,
                  background: "var(--bg-card)",
                  borderRadius: "var(--radius-lg)",
                  boxShadow: "var(--shadow-xl), 0 0 0 1px rgba(16,216,118,0.1)",
                  border: "1px solid rgba(16,216,118,0.12)",
                  overflow: "hidden",
                  zIndex: 250,
                  animation: "fadeDown 0.2s var(--ease-out)",
                }}
              >
                <div
                  style={{
                    padding: "8px 16px",
                    fontSize: "0.68rem", fontWeight: 700, color: "var(--text-muted)",
                    background: "var(--bg-subtle)",
                    textTransform: "uppercase", letterSpacing: "0.1em",
                    display: "flex", alignItems: "center", gap: "6px",
                    borderBottom: "1px solid var(--border-subtle)",
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
                      padding: "10px 16px",
                      borderBottom: "1px solid var(--border-subtle)",
                      transition: "background var(--t-fast)",
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = "var(--bg-subtle)")}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                  >
                    <img
                      src={prod.images[0]}
                      alt={locale === "bn" ? prod.nameBn : prod.nameEn}
                      style={{ width: "42px", height: "42px", objectFit: "cover", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-subtle)" }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: "0.88rem", fontWeight: 600, color: "var(--text-main)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {locale === "bn" ? prod.nameBn : prod.nameEn}
                      </div>
                      <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: "2px" }}>
                        {locale === "bn" ? prod.categoryNameBn : prod.categoryNameEn}
                      </div>
                    </div>
                    <div
                      style={{
                        fontWeight: 800, fontSize: "0.9rem",
                        color: "var(--emerald)",
                        background: "rgba(16,216,118,0.08)",
                        padding: "3px 10px",
                        borderRadius: "var(--radius-full)",
                        whiteSpace: "nowrap",
                        border: "1px solid rgba(16,216,118,0.15)",
                      }}
                    >
                      {formatPrice(prod.basePrice)}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Right Actions */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>

            {/* Language Toggle */}
            <button
              onClick={toggleLocale}
              title="Switch Language"
              style={{
                display: "flex", alignItems: "center", gap: "5px",
                padding: "7px 13px",
                borderRadius: "var(--radius-full)",
                border: "1.5px solid var(--border-medium)",
                background: "var(--bg-card)",
                color: "var(--text-main)",
                fontWeight: 700, fontSize: "0.8rem",
                transition: "all var(--t-fast)",
                cursor: "pointer",
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--emerald)"; e.currentTarget.style.background = "rgba(16,216,118,0.06)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border-medium)"; e.currentTarget.style.background = "var(--bg-card)"; }}
            >
              <Globe size={14} color="var(--emerald)" />
              <span>{locale === "bn" ? "EN" : "বাং"}</span>
            </button>

            {/* Wishlist */}
            <Link
              href="/account#wishlist"
              style={{
                position: "relative", padding: "9px",
                borderRadius: "50%",
                background: "var(--bg-card)",
                color: "var(--text-main)",
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "all var(--t-fast)",
                border: "1.5px solid var(--border-medium)",
              }}
              title={t.wishlist}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,77,109,0.08)"; e.currentTarget.style.borderColor = "rgba(255,77,109,0.25)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "var(--bg-card)"; e.currentTarget.style.borderColor = "var(--border-medium)"; }}
            >
              <Heart size={17} color={mounted && wishlistIds.length > 0 ? "var(--rose)" : "var(--text-muted)"} fill={mounted && wishlistIds.length > 0 ? "var(--rose)" : "none"} />
              {mounted && wishlistIds.length > 0 && (
                <span
                  style={{
                    position: "absolute", top: "-4px", right: "-4px",
                    width: "18px", height: "18px",
                    borderRadius: "50%",
                    background: "var(--rose)",
                    color: "#fff", fontSize: "0.65rem", fontWeight: 800,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    border: "2px solid var(--bg-page)",
                    animation: "badgePop 0.3s ease",
                  }}
                >
                  {wishlistIds.length}
                </span>
              )}
            </Link>

            {/* Track Order */}
            <Link
              href="/track"
              className="hidden-mobile"
              style={{
                display: "flex", alignItems: "center", gap: "5px",
                padding: "8px 13px",
                borderRadius: "var(--radius-full)",
                background: "rgba(16, 216, 118, 0.06)",
                color: "var(--emerald)",
                fontWeight: 600, fontSize: "0.8rem",
                border: "1.5px solid rgba(16, 216, 118, 0.18)",
                transition: "all var(--t-fast)",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(16,216,118,0.12)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(16,216,118,0.06)"; }}
            >
              <Zap size={14} color="var(--emerald)" />
              <span>{locale === "bn" ? "ট্র্যাক" : "Track"}</span>
            </Link>

            {/* Account */}
            <Link
              href="/login"
              className="hidden-mobile"
              style={{
                display: "flex", alignItems: "center", gap: "6px",
                padding: "8px 14px",
                borderRadius: "var(--radius-full)",
                background: "var(--bg-card)",
                color: "var(--text-body)",
                fontWeight: 600, fontSize: "0.82rem",
                border: "1.5px solid var(--border-medium)",
                transition: "all var(--t-fast)",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "var(--bg-subtle)"; e.currentTarget.style.borderColor = "var(--border-strong)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "var(--bg-card)"; e.currentTarget.style.borderColor = "var(--border-medium)"; }}
            >
              <User size={15} />
              <span>{t.login}</span>
            </Link>

            {/* Cart */}
            <button
              onClick={openCart}
              style={{
                display: "flex", alignItems: "center", gap: "10px",
                padding: "9px 18px",
                borderRadius: "var(--radius-full)",
                background: "linear-gradient(135deg, #10D876 0%, #059E57 100%)",
                color: "var(--bg-page)",
                fontWeight: 800,
                boxShadow: cartPulse
                  ? "0 0 0 8px rgba(16,216,118,0), 0 4px 24px rgba(16,216,118,0.55)"
                  : "0 4px 20px rgba(16,216,118,0.4)",
                position: "relative",
                transition: "all var(--t-smooth)",
                animation: cartPulse ? "glowRing 0.6s ease" : "none",
                border: "none",
                cursor: "pointer",
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px) scale(1.02)"; e.currentTarget.style.boxShadow = "0 10px 32px rgba(16,216,118,0.55)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0) scale(1)"; e.currentTarget.style.boxShadow = "0 4px 20px rgba(16,216,118,0.4)"; }}
            >
              <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                <ShoppingCart size={18} />
                {mounted && getItemCount() > 0 && (
                  <span
                    style={{
                      position: "absolute", top: "-9px", right: "-11px",
                      background: "var(--gold)",
                      color: "#000",
                      borderRadius: "50%",
                      minWidth: "19px", height: "19px",
                      fontSize: "0.65rem", fontWeight: 900,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      padding: "2px",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.5)",
                      animation: "countPop 0.4s var(--ease-bounce)",
                      border: "2px solid rgba(0,0,0,0.2)",
                    }}
                  >
                    {getItemCount()}
                  </span>
                )}
              </div>
              <span className="hidden-mobile" style={{ fontSize: "0.88rem" }}>
                {mounted && getItemCount() > 0 ? formatPrice(getGrandTotal()) : t.cart}
              </span>
            </button>

          </div>
        </div>
      </div>

      {/* 3 ── Category Nav Strip */}
      <div
        style={{
          background: "rgba(8, 9, 11, 0.95)",
          backdropFilter: "blur(16px)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          padding: "0",
          overflowX: "auto",
          scrollbarWidth: "none",
        }}
      >
        <div
          className="container"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "2px",
            whiteSpace: "nowrap",
            padding: "0 1.25rem",
          }}
        >
          <Link
            href="/category/all"
            style={{
              display: "flex", alignItems: "center", gap: "6px",
              color: "var(--emerald)",
              background: "rgba(16,216,118,0.07)",
              padding: "9px 16px",
              borderRadius: "0",
              fontSize: "0.82rem", fontWeight: 700,
              borderBottom: "2px solid var(--emerald)",
              transition: "all var(--t-fast)",
              flexShrink: 0,
            }}
          >
            <Zap size={13} fill="var(--emerald)" color="var(--emerald)" />
            <span>{locale === "bn" ? "সব অফার" : "All Deals"}</span>
          </Link>

          {CATEGORIES.map(cat => (
            <Link
              key={cat.id}
              href={`/category/${cat.slug}`}
              style={{
                display: "flex", alignItems: "center", gap: "5px",
                color: "var(--text-muted)",
                padding: "9px 13px",
                fontSize: "0.82rem", fontWeight: 500,
                borderBottom: "2px solid transparent",
                transition: "all var(--t-fast)",
                flexShrink: 0,
                whiteSpace: "nowrap",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.color = "var(--emerald)";
                e.currentTarget.style.borderBottomColor = "var(--emerald)";
                e.currentTarget.style.background = "rgba(16,216,118,0.05)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.color = "var(--text-muted)";
                e.currentTarget.style.borderBottomColor = "transparent";
                e.currentTarget.style.background = "transparent";
              }}
            >
              <span style={{ fontSize: "0.95em" }}>{cat.icon}</span>
              <span>{locale === "bn" ? cat.nameBn : cat.nameEn}</span>
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
}
