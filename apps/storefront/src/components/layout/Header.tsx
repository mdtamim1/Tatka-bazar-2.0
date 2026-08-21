"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search, ShoppingCart, Heart, MapPin, Globe, User,
  ChevronDown, Store, CheckCircle2, X, PhoneCall, Menu,
  Zap, Bell, TrendingUp, Sparkles,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useCartStore } from "@/lib/cart-store";
import { CATEGORIES, PRODUCTS, BRANCHES } from "@/lib/catalog";

export function Header() {
  const router = useRouter();
  const { locale, t, toggleLocale, formatPrice } = useLanguage();
  const { getItemCount, getGrandTotal, openCart, wishlistIds, selectedHub, setSelectedHub } = useCartStore();

  const [searchQuery, setSearchQuery]         = useState("");
  const [isSearchOpen, setIsSearchOpen]       = useState(false);
  const [isHubDropdownOpen, setIsHubDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mounted, setMounted]                 = useState(false);
  const [cartPulse, setCartPulse]             = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const hubRef    = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) setIsSearchOpen(false);
      if (hubRef.current    && !hubRef.current.contains(event.target as Node))    setIsHubDropdownOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Pulse animation when cart changes
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

  const searchResults = searchQuery.trim()
    ? PRODUCTS.filter(p => {
        const q = searchQuery.toLowerCase();
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
          background: "linear-gradient(90deg, #071A0A 0%, #0E3D1C 40%, #0F4A20 60%, #071A0A 100%)",
          color: "#fff",
          padding: "7px 0",
          overflow: "hidden",
          position: "relative",
        }}
      >
        {/* Edge fade masks */}
        <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: "80px", background: "linear-gradient(90deg, #071A0A, transparent)", zIndex: 2, pointerEvents: "none" }} />
        <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: "80px", background: "linear-gradient(270deg, #071A0A, transparent)", zIndex: 2, pointerEvents: "none" }} />

        <div className="marquee-track" style={{ gap: "0px" }}>
          {[...announcementItems, ...announcementItems].map((item, i) => (
            <span
              key={i}
              style={{
                display: "inline-flex",
                alignItems: "center",
                fontSize: "0.8rem",
                fontWeight: 600,
                whiteSpace: "nowrap",
                padding: "0 36px",
                color: i % 2 === 0 ? "rgba(255,255,255,0.92)" : "#86EFAC",
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
        style={{ padding: "10px 0", boxShadow: "0 1px 24px rgba(0,0,0,0.06)" }}
      >
        <div
          className="container"
          style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "14px" }}
        >

          {/* Logo */}
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: 0 }}>
            <div
              style={{
                width: "44px", height: "44px",
                borderRadius: "14px",
                background: "linear-gradient(135deg, #22C55E 0%, #15803D 100%)",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#fff",
                boxShadow: "0 6px 20px rgba(34, 197, 94, 0.4), inset 0 1px 0 rgba(255,255,255,0.25)",
                position: "relative",
                flexShrink: 0,
              }}
            >
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <div className="hidden-mobile">
              <div
                style={{
                  fontSize: "1.3rem",
                  fontWeight: 900,
                  letterSpacing: "-0.03em",
                  lineHeight: 1.1,
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                  background: "linear-gradient(135deg, #0F4A20 0%, #22C55E 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                <span>{locale === "bn" ? "তাতকা বাজার" : "Tatka Bazar"}</span>
                <span
                  style={{
                    fontSize: "0.6rem",
                    padding: "2px 6px",
                    background: "linear-gradient(135deg, #F59E0B, #D97706)",
                    WebkitBackgroundClip: "unset",
                    WebkitTextFillColor: "#fff",
                    backgroundClip: "unset",
                    color: "#fff",
                    borderRadius: "6px",
                    fontWeight: 800,
                    letterSpacing: "0.02em",
                    boxShadow: "0 2px 8px rgba(245, 158, 11, 0.4)",
                  }}
                >
                  2.0
                </span>
              </div>
              <p style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontWeight: 500, letterSpacing: "0.01em" }}>
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
                background: "rgba(34, 197, 94, 0.08)",
                borderRadius: "var(--radius-full)",
                border: "1.5px solid rgba(34, 197, 94, 0.2)",
                fontSize: "0.8rem", color: "var(--primary-dark)", fontWeight: 700,
                transition: "all var(--t-fast)",
                cursor: "pointer",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(34, 197, 94, 0.14)"; e.currentTarget.style.borderColor = "rgba(34, 197, 94, 0.4)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(34, 197, 94, 0.08)"; e.currentTarget.style.borderColor = "rgba(34, 197, 94, 0.2)"; }}
            >
              <MapPin size={14} color="var(--primary)" />
              <div style={{ textAlign: "left" }}>
                <div style={{ fontSize: "0.62rem", color: "var(--text-muted)", lineHeight: 1, marginBottom: "1px" }}>{t.deliverTo}:</div>
                <div>{locale === "bn" ? selectedBranch.areaBn : selectedBranch.areaEn}</div>
              </div>
              <ChevronDown
                size={13}
                style={{
                  transition: "transform var(--t-fast)",
                  transform: isHubDropdownOpen ? "rotate(180deg)" : "rotate(0deg)",
                }}
              />
            </button>

            {isHubDropdownOpen && (
              <div
                style={{
                  position: "absolute", top: "calc(100% + 10px)", left: 0,
                  width: "290px",
                  background: "var(--bg-surface)",
                  borderRadius: "var(--radius-lg)",
                  boxShadow: "var(--shadow-xl), 0 0 0 1px rgba(34,197,94,0.1)",
                  border: "1px solid rgba(34,197,94,0.12)",
                  padding: "10px",
                  zIndex: 250,
                  animation: "fadeDown 0.2s var(--ease-out)",
                }}
              >
                <div style={{ padding: "6px 10px 10px", fontSize: "0.7rem", fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
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
                      background: selectedHub === b.id ? "rgba(34,197,94,0.08)" : "transparent",
                      color: selectedHub === b.id ? "var(--primary-dark)" : "var(--text-main)",
                      fontSize: "0.85rem",
                      fontWeight: selectedHub === b.id ? 700 : 500,
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
                    {selectedHub === b.id && <CheckCircle2 size={16} color="var(--primary)" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Search Bar */}
          <div ref={searchRef} style={{ position: "relative", flex: 1, maxWidth: "540px" }}>
            <form onSubmit={handleSearchSubmit}>
              <div
                style={{
                  display: "flex", alignItems: "center",
                  background: isSearchOpen ? "var(--bg-surface)" : "var(--bg-subtle)",
                  borderRadius: "var(--radius-full)",
                  padding: "4px 5px 4px 16px",
                  border: isSearchOpen
                    ? "1.5px solid var(--primary)"
                    : "1.5px solid var(--border-subtle)",
                  boxShadow: isSearchOpen
                    ? "0 0 0 4px rgba(34,197,94,0.12), var(--shadow-sm)"
                    : "none",
                  transition: "all var(--t-smooth)",
                }}
              >
                <Search size={17} color={isSearchOpen ? "var(--primary)" : "var(--text-muted)"} style={{ flexShrink: 0, transition: "color var(--t-fast)" }} />
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
                    <X size={15} />
                  </button>
                )}
                <button
                  type="submit"
                  style={{
                    background: "linear-gradient(135deg, #22C55E, #15803D)",
                    color: "#fff",
                    padding: "8px 16px",
                    borderRadius: "var(--radius-full)",
                    fontWeight: 700,
                    fontSize: "0.82rem",
                    display: "flex", alignItems: "center", gap: "5px",
                    boxShadow: "0 2px 10px rgba(34,197,94,0.35)",
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

            {/* Instant Search Dropdown */}
            {isSearchOpen && searchResults.length > 0 && (
              <div
                style={{
                  position: "absolute", top: "calc(100% + 10px)", left: 0, right: 0,
                  background: "var(--bg-surface)",
                  borderRadius: "var(--radius-lg)",
                  boxShadow: "var(--shadow-xl), 0 0 0 1px rgba(34,197,94,0.1)",
                  border: "1px solid rgba(34,197,94,0.12)",
                  overflow: "hidden",
                  zIndex: 250,
                  animation: "fadeDown 0.2s var(--ease-out)",
                }}
              >
                <div
                  style={{
                    padding: "8px 16px",
                    fontSize: "0.7rem", fontWeight: 800, color: "var(--text-muted)",
                    background: "var(--bg-subtle)",
                    textTransform: "uppercase", letterSpacing: "0.08em",
                    display: "flex", alignItems: "center", gap: "6px",
                  }}
                >
                  <Sparkles size={11} color="var(--primary)" />
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
                    onMouseEnter={e => (e.currentTarget.style.background = "rgba(34,197,94,0.05)")}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                  >
                    <img
                      src={prod.images[0]}
                      alt={locale === "bn" ? prod.nameBn : prod.nameEn}
                      style={{ width: "42px", height: "42px", objectFit: "cover", borderRadius: "var(--radius-sm)" }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: "0.88rem", fontWeight: 700, color: "var(--text-main)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {locale === "bn" ? prod.nameBn : prod.nameEn}
                      </div>
                      <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: "2px" }}>
                        {locale === "bn" ? prod.categoryNameBn : prod.categoryNameEn}
                      </div>
                    </div>
                    <div
                      style={{
                        fontWeight: 800, fontSize: "0.9rem",
                        color: "var(--primary-dark)",
                        background: "rgba(34,197,94,0.1)",
                        padding: "3px 9px",
                        borderRadius: "var(--radius-full)",
                        whiteSpace: "nowrap",
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
                padding: "7px 12px",
                borderRadius: "var(--radius-full)",
                border: "1.5px solid var(--border-medium)",
                background: "var(--bg-surface)",
                color: "var(--text-main)",
                fontWeight: 800, fontSize: "0.8rem",
                transition: "all var(--t-fast)",
                cursor: "pointer",
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--primary)"; e.currentTarget.style.background = "rgba(34,197,94,0.06)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border-medium)"; e.currentTarget.style.background = "var(--bg-surface)"; }}
            >
              <Globe size={14} color="var(--primary)" />
              <span>{locale === "bn" ? "EN" : "বাং"}</span>
            </button>

            {/* Wishlist */}
            <Link
              href="/account#wishlist"
              style={{
                position: "relative", padding: "9px",
                borderRadius: "50%",
                background: "var(--bg-subtle)",
                color: "var(--text-main)",
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "all var(--t-fast)",
                border: "1.5px solid var(--border-subtle)",
              }}
              title={t.wishlist}
              onMouseEnter={e => { e.currentTarget.style.background = "var(--crimson-light)"; e.currentTarget.style.borderColor = "rgba(239,68,68,0.25)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "var(--bg-subtle)"; e.currentTarget.style.borderColor = "var(--border-subtle)"; }}
            >
              <Heart size={18} color={mounted && wishlistIds.length > 0 ? "var(--crimson)" : "var(--text-muted)"} fill={mounted && wishlistIds.length > 0 ? "var(--crimson)" : "none"} />
              {mounted && wishlistIds.length > 0 && (
                <span
                  style={{
                    position: "absolute", top: "-4px", right: "-4px",
                    width: "18px", height: "18px",
                    borderRadius: "50%",
                    background: "var(--crimson)",
                    color: "#fff", fontSize: "0.65rem", fontWeight: 800,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    border: "2px solid var(--bg-surface)",
                    animation: "badgePop 0.3s ease",
                  }}
                >
                  {wishlistIds.length}
                </span>
              )}
            </Link>

            {/* Account */}
            <Link
              href="/login"
              className="hidden-mobile"
              style={{
                display: "flex", alignItems: "center", gap: "6px",
                padding: "8px 14px",
                borderRadius: "var(--radius-full)",
                background: "var(--bg-subtle)",
                color: "var(--text-main)",
                fontWeight: 700, fontSize: "0.83rem",
                border: "1.5px solid var(--border-subtle)",
                transition: "all var(--t-fast)",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "var(--bg-muted)"; e.currentTarget.style.borderColor = "var(--border-medium)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "var(--bg-subtle)"; e.currentTarget.style.borderColor = "var(--border-subtle)"; }}
            >
              <User size={16} />
              <span>{t.login}</span>
            </Link>

            {/* Cart */}
            <button
              onClick={openCart}
              style={{
                display: "flex", alignItems: "center", gap: "10px",
                padding: "9px 18px",
                borderRadius: "var(--radius-full)",
                background: "linear-gradient(135deg, #22C55E 0%, #15803D 100%)",
                color: "#fff",
                fontWeight: 800,
                boxShadow: cartPulse
                  ? "0 0 0 8px rgba(34,197,94,0), 0 4px 20px rgba(34,197,94,0.5)"
                  : "0 4px 16px rgba(34,197,94,0.35)",
                position: "relative",
                transition: "all var(--t-smooth)",
                animation: cartPulse ? "glowRing 0.6s ease" : "none",
                border: "none",
                cursor: "pointer",
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 28px rgba(34,197,94,0.45)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 16px rgba(34,197,94,0.35)"; }}
            >
              <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                <ShoppingCart size={19} />
                {mounted && getItemCount() > 0 && (
                  <span
                    style={{
                      position: "absolute", top: "-9px", right: "-11px",
                      background: "var(--gold)",
                      color: "#000",
                      borderRadius: "50%",
                      minWidth: "19px", height: "19px",
                      fontSize: "0.68rem", fontWeight: 900,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      padding: "2px",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.25)",
                      animation: "countPop 0.4s var(--ease-bounce)",
                      border: "2px solid rgba(34,197,94,0.3)",
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
          background: "rgba(247, 246, 242, 0.98)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid var(--border-subtle)",
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
              color: "var(--primary-dark)",
              background: "rgba(34,197,94,0.1)",
              padding: "8px 14px",
              borderRadius: "0",
              fontSize: "0.83rem", fontWeight: 800,
              borderBottom: "2.5px solid var(--primary)",
              transition: "all var(--t-fast)",
              flexShrink: 0,
            }}
          >
            <Zap size={13} fill="var(--primary)" color="var(--primary)" />
            <span>{locale === "bn" ? "সব অফার" : "All Deals"}</span>
          </Link>

          {CATEGORIES.map(cat => (
            <Link
              key={cat.id}
              href={`/category/${cat.slug}`}
              style={{
                display: "flex", alignItems: "center", gap: "5px",
                color: "var(--text-body)",
                padding: "8px 12px",
                fontSize: "0.82rem", fontWeight: 600,
                borderBottom: "2.5px solid transparent",
                transition: "all var(--t-fast)",
                flexShrink: 0,
                whiteSpace: "nowrap",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.color = "var(--primary-dark)";
                e.currentTarget.style.borderBottomColor = "var(--primary)";
                e.currentTarget.style.background = "rgba(34,197,94,0.05)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.color = "var(--text-body)";
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
