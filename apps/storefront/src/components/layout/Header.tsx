"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search, ShoppingBag, User, Globe, ChevronDown, X,
  MoreVertical, Heart, HelpCircle, CreditCard,
  History, Settings, LogOut, Bookmark, Bell, Eye,
  Sparkles, Zap, MessageSquare, PhoneCall, ShieldCheck,
  Store, Flame
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useCartStore } from "@/lib/cart-store";
import { PRODUCTS, CATEGORIES } from "@/lib/catalog";
import { useDebounce } from "@/hooks/useDebounce";

export function Header() {
  const router = useRouter();
  const { locale, t, toggleLocale, formatPrice } = useLanguage();
  const { getItemCount, getGrandTotal, openCart, wishlistIds } = useCartStore();

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
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 200,
          width: "100%",
          background: "#ffffff",
          borderBottom: "1px solid #e2e8f0",
          boxShadow: scrolled ? "0 4px 20px rgba(0, 0, 0, 0.05)" : "none",
          transition: "box-shadow 0.25s ease",
          fontFamily: "var(--font-body, system-ui, -apple-system, sans-serif)",
        }}
      >
        <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 24px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              height: "72px",
              gap: "20px",
            }}
          >
            {/* ── Left Side: 3-Dot Menu + Logo + Main Nav Links ── */}
            <div style={{ display: "flex", alignItems: "center", gap: "28px" }}>
              
              {/* 3-Dot Drawer Trigger (Image 2 style) */}
              <button
                type="button"
                onClick={() => setIsDrawerOpen(true)}
                aria-label="Open Navigation Drawer"
                style={{
                  width: "38px",
                  height: "38px",
                  borderRadius: "8px",
                  border: "1px solid #e2e8f0",
                  background: "#f8fafc",
                  color: "#0f172a",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
                onMouseEnter={e => { e.currentTarget.style.background = "#f1f5f9"; e.currentTarget.style.borderColor = "#cbd5e1"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "#f8fafc"; e.currentTarget.style.borderColor = "#e2e8f0"; }}
              >
                <MoreVertical size={18} />
              </button>

              {/* Logo (Image 1 style) */}
              <Link
                href="/"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  textDecoration: "none",
                  flexShrink: 0,
                }}
              >
                {/* Stylized Modern Geometry Logo Icon */}
                <div
                  style={{
                    width: "32px",
                    height: "32px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#0f172a",
                  }}
                >
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="12 2 2 7 12 12 22 7 12 2" />
                    <polyline points="2 17 12 22 22 17" />
                    <polyline points="2 12 12 17 22 12" />
                  </svg>
                </div>
                <span
                  style={{
                    fontSize: "1.25rem",
                    fontWeight: 900,
                    color: "#0f172a",
                    letterSpacing: "-0.03em",
                  }}
                >
                  TatkaBazar<span style={{ color: "#10D876" }}>.com</span>
                </span>
              </Link>

              {/* Desktop Nav Links (STORE ⌵, COLLECTIONS ⌵, SALE, BLOG) */}
              <nav
                className="hidden-mobile"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "24px",
                  marginLeft: "8px",
                }}
              >
                {/* STORE ⌵ */}
                <div
                  style={{ position: "relative" }}
                  onMouseEnter={() => setActiveDropdown("store")}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <button
                    type="button"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      background: "none",
                      border: "none",
                      fontSize: "0.86rem",
                      fontWeight: 700,
                      color: activeDropdown === "store" ? "#007A48" : "#0f172a",
                      textTransform: "uppercase",
                      letterSpacing: "0.04em",
                      cursor: "pointer",
                      padding: "8px 0",
                    }}
                  >
                    <span>{locale === "bn" ? "স্টোর" : "STORE"}</span>
                    <ChevronDown size={14} />
                  </button>

                  {/* Dropdown Menu */}
                  {activeDropdown === "store" && (
                    <div
                      style={{
                        position: "absolute",
                        top: "100%",
                        left: 0,
                        width: "240px",
                        background: "#ffffff",
                        border: "1px solid #e2e8f0",
                        borderRadius: "12px",
                        padding: "10px",
                        boxShadow: "0 12px 32px rgba(0, 0, 0, 0.08)",
                        zIndex: 250,
                      }}
                    >
                      {CATEGORIES.map(cat => (
                        <Link
                          key={cat.id}
                          href={`/category/${cat.slug}`}
                          onClick={() => setActiveDropdown(null)}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                            padding: "9px 12px",
                            borderRadius: "8px",
                            color: "#334155",
                            textDecoration: "none",
                            fontSize: "0.85rem",
                            fontWeight: 600,
                            transition: "all 0.15s ease",
                          }}
                          onMouseEnter={e => { e.currentTarget.style.background = "#f8fafc"; e.currentTarget.style.color = "#007A48"; }}
                          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#334155"; }}
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
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      background: "none",
                      border: "none",
                      fontSize: "0.86rem",
                      fontWeight: 700,
                      color: activeDropdown === "collections" ? "#007A48" : "#0f172a",
                      textTransform: "uppercase",
                      letterSpacing: "0.04em",
                      cursor: "pointer",
                      padding: "8px 0",
                    }}
                  >
                    <span>{locale === "bn" ? "কালেকশন" : "COLLECTIONS"}</span>
                    <ChevronDown size={14} />
                  </button>

                  {/* Dropdown Menu */}
                  {activeDropdown === "collections" && (
                    <div
                      style={{
                        position: "absolute",
                        top: "100%",
                        left: 0,
                        width: "230px",
                        background: "#ffffff",
                        border: "1px solid #e2e8f0",
                        borderRadius: "12px",
                        padding: "10px",
                        boxShadow: "0 12px 32px rgba(0, 0, 0, 0.08)",
                        zIndex: 250,
                      }}
                    >
                      <Link
                        href="/category/vegetables"
                        onClick={() => setActiveDropdown(null)}
                        style={{ display: "block", padding: "8px 12px", borderRadius: "6px", color: "#334155", textDecoration: "none", fontSize: "0.85rem", fontWeight: 600 }}
                        onMouseEnter={e => (e.currentTarget.style.background = "#f8fafc")}
                        onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                      >
                        🌿 Organic Farm Produce
                      </Link>
                      <Link
                        href="/category/fish-and-meat"
                        onClick={() => setActiveDropdown(null)}
                        style={{ display: "block", padding: "8px 12px", borderRadius: "6px", color: "#334155", textDecoration: "none", fontSize: "0.85rem", fontWeight: 600 }}
                        onMouseEnter={e => (e.currentTarget.style.background = "#f8fafc")}
                        onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                      >
                        🐟 River-Caught Fresh Fish
                      </Link>
                      <Link
                        href="/b2b"
                        onClick={() => setActiveDropdown(null)}
                        style={{ display: "block", padding: "8px 12px", borderRadius: "6px", color: "#334155", textDecoration: "none", fontSize: "0.85rem", fontWeight: 600 }}
                        onMouseEnter={e => (e.currentTarget.style.background = "#f8fafc")}
                        onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                      >
                        🏢 B2B Wholesale Bulk Deals
                      </Link>
                      <Link
                        href="/bundles"
                        onClick={() => setActiveDropdown(null)}
                        style={{ display: "block", padding: "8px 12px", borderRadius: "6px", color: "#334155", textDecoration: "none", fontSize: "0.85rem", fontWeight: 600 }}
                        onMouseEnter={e => (e.currentTarget.style.background = "#f8fafc")}
                        onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                      >
                        📦 Weekly Grocery Bundles
                      </Link>
                    </div>
                  )}
                </div>

                {/* SALE (Highlighted in Pink/Red) */}
                <Link
                  href="/category/all"
                  style={{
                    fontSize: "0.86rem",
                    fontWeight: 800,
                    color: "#e11d48",
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                    textDecoration: "none",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  <span>SALE</span>
                </Link>

                {/* BLOG / RECIPES */}
                <Link
                  href="/recipes"
                  style={{
                    fontSize: "0.86rem",
                    fontWeight: 700,
                    color: "#0f172a",
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                    textDecoration: "none",
                  }}
                >
                  <span>BLOG</span>
                </Link>
              </nav>

            </div>

            {/* ── Right Side: Language + Account + Cart + Search Icon ── */}
            <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
              
              {/* Language Switcher */}
              <button
                type="button"
                onClick={toggleLocale}
                title="Change Language"
                style={{
                  background: "none",
                  border: "none",
                  color: "#64748b",
                  fontWeight: 700,
                  fontSize: "0.8rem",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  padding: "4px",
                }}
              >
                <Globe size={15} />
                <span>{locale === "bn" ? "বাং" : "EN"}</span>
              </button>

              {/* Account Icon (Image 1 style) */}
              <Link
                href="/account"
                aria-label="My Account"
                style={{
                  color: "#0f172a",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  textDecoration: "none",
                  padding: "4px",
                }}
              >
                <User size={20} strokeWidth={2} />
              </Link>

              {/* Shopping Bag / Cart Icon with Black Badge (Image 1 style) */}
              <button
                type="button"
                onClick={openCart}
                aria-label="Open Shopping Bag"
                style={{
                  position: "relative",
                  background: "none",
                  border: "none",
                  color: "#0f172a",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  padding: "4px",
                }}
              >
                <ShoppingBag size={20} strokeWidth={2} />
                <span
                  style={{
                    position: "absolute",
                    top: "-4px",
                    right: "-6px",
                    width: "18px",
                    height: "18px",
                    borderRadius: "50%",
                    background: "#000000",
                    color: "#ffffff",
                    fontSize: "0.65rem",
                    fontWeight: 900,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {mounted ? getItemCount() : 0}
                </span>
              </button>

              {/* Search Icon (Image 1 style) */}
              <div ref={searchRef} style={{ position: "relative" }}>
                <button
                  type="button"
                  onClick={() => setIsSearchOpen(!isSearchOpen)}
                  aria-label="Search"
                  style={{
                    background: "none",
                    border: "none",
                    color: "#0f172a",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    padding: "4px",
                  }}
                >
                  <Search size={20} strokeWidth={2} />
                </button>

                {/* Expandable Search Input Bar */}
                {isSearchOpen && (
                  <div
                    style={{
                      position: "absolute",
                      right: 0,
                      top: "calc(100% + 14px)",
                      width: "320px",
                      background: "#ffffff",
                      border: "1px solid #e2e8f0",
                      borderRadius: "14px",
                      boxShadow: "0 16px 36px rgba(0, 0, 0, 0.12)",
                      padding: "10px",
                      zIndex: 300,
                      animation: "fadeIn 0.2s ease",
                    }}
                  >
                    <form onSubmit={handleSearchSubmit}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          background: "#f8fafc",
                          borderRadius: "10px",
                          padding: "6px 12px",
                          border: "1px solid #cbd5e1",
                        }}
                      >
                        <Search size={15} color="#64748b" style={{ flexShrink: 0 }} />
                        <input
                          ref={searchInputRef}
                          type="text"
                          value={searchQuery}
                          onChange={e => setSearchQuery(e.target.value)}
                          placeholder="Search fish, vegetables, fruits..."
                          style={{
                            width: "100%",
                            background: "transparent",
                            border: "none",
                            outline: "none",
                            padding: "6px 8px",
                            fontSize: "0.85rem",
                            color: "#0f172a",
                          }}
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
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            display: "flex",
          }}
        >
          {/* Backdrop */}
          <div
            onClick={() => setIsDrawerOpen(false)}
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(0, 0, 0, 0.5)",
              backdropFilter: "blur(4px)",
            }}
          />

          {/* Left Drawer Shell */}
          <div
            style={{
              position: "relative",
              width: "320px",
              height: "100%",
              background: "#ffffff",
              boxShadow: "8px 0 32px rgba(0, 0, 0, 0.15)",
              display: "flex",
              flexDirection: "column",
              zIndex: 10000,
              animation: "slideInLeft 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
              overflowY: "auto",
              fontFamily: "var(--font-body, system-ui, -apple-system, sans-serif)",
            }}
          >
            {/* Drawer Header (Logo + Close X) */}
            <div
              style={{
                padding: "20px 24px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                borderBottom: "1px solid #f1f5f9",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0f172a" strokeWidth="2.4">
                  <polygon points="12 2 2 7 12 12 22 7 12 2" />
                  <polyline points="2 17 12 22 22 17" />
                  <polyline points="2 12 12 17 22 12" />
                </svg>
                <span style={{ fontSize: "1.1rem", fontWeight: 900, color: "#0f172a" }}>
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
            <div style={{ padding: "16px 20px", borderBottom: "1px solid #f1f5f9" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                
                <Link
                  href="/account"
                  onClick={() => setIsDrawerOpen(false)}
                  style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px 12px", borderRadius: "8px", color: "#0f172a", textDecoration: "none", fontSize: "0.9rem", fontWeight: 600 }}
                  onMouseEnter={e => (e.currentTarget.style.background = "#f8fafc")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                >
                  <User size={17} color="#64748b" />
                  <span>Account</span>
                </Link>

                <Link
                  href="/account"
                  onClick={() => setIsDrawerOpen(false)}
                  style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px 12px", borderRadius: "8px", color: "#0f172a", textDecoration: "none", fontSize: "0.9rem", fontWeight: 600 }}
                  onMouseEnter={e => (e.currentTarget.style.background = "#f8fafc")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                >
                  <History size={17} color="#64748b" />
                  <span>Purchase History</span>
                </Link>

                <Link
                  href="/account"
                  onClick={() => setIsDrawerOpen(false)}
                  style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px 12px", borderRadius: "8px", color: "#0f172a", textDecoration: "none", fontSize: "0.9rem", fontWeight: 600 }}
                  onMouseEnter={e => (e.currentTarget.style.background = "#f8fafc")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                >
                  <CreditCard size={17} color="#64748b" />
                  <span>Payment Methods</span>
                </Link>

                <Link
                  href="/account"
                  onClick={() => setIsDrawerOpen(false)}
                  style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px 12px", borderRadius: "8px", color: "#0f172a", textDecoration: "none", fontSize: "0.9rem", fontWeight: 600 }}
                  onMouseEnter={e => (e.currentTarget.style.background = "#f8fafc")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                >
                  <Settings size={17} color="#64748b" />
                  <span>Account Settings</span>
                </Link>

                <button
                  type="button"
                  onClick={handleLogout}
                  style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px 12px", borderRadius: "8px", color: "#ef4444", background: "none", border: "none", fontSize: "0.9rem", fontWeight: 600, cursor: "pointer", width: "100%", textAlign: "left" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "#fef2f2")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                >
                  <LogOut size={17} />
                  <span>Sign Out</span>
                </button>

              </div>
            </div>

            {/* Section 2: Help Group (Image 2) */}
            <div style={{ padding: "16px 20px", borderBottom: "1px solid #f1f5f9" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                
                <Link
                  href="/account"
                  onClick={() => setIsDrawerOpen(false)}
                  style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px 12px", borderRadius: "8px", color: "#0f172a", textDecoration: "none", fontSize: "0.9rem", fontWeight: 600 }}
                  onMouseEnter={e => (e.currentTarget.style.background = "#f8fafc")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                >
                  <HelpCircle size={17} color="#64748b" />
                  <span>Help Center</span>
                </Link>

                <Link
                  href="/account"
                  onClick={() => setIsDrawerOpen(false)}
                  style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px 12px", borderRadius: "8px", color: "#0f172a", textDecoration: "none", fontSize: "0.9rem", fontWeight: 600 }}
                  onMouseEnter={e => (e.currentTarget.style.background = "#f8fafc")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                >
                  <MessageSquare size={17} color="#64748b" />
                  <span>FAQs</span>
                </Link>

                <Link
                  href="/account"
                  onClick={() => setIsDrawerOpen(false)}
                  style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px 12px", borderRadius: "8px", color: "#0f172a", textDecoration: "none", fontSize: "0.9rem", fontWeight: 600 }}
                  onMouseEnter={e => (e.currentTarget.style.background = "#f8fafc")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                >
                  <PhoneCall size={17} color="#64748b" />
                  <span>Support Tickets</span>
                </Link>

              </div>
            </div>

            {/* Section 3: Wishlist & Discovery Group (Image 2) */}
            <div style={{ padding: "16px 20px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                
                <Link
                  href="/account"
                  onClick={() => setIsDrawerOpen(false)}
                  style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px 12px", borderRadius: "8px", color: "#0f172a", textDecoration: "none", fontSize: "0.9rem", fontWeight: 600 }}
                  onMouseEnter={e => (e.currentTarget.style.background = "#f8fafc")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                >
                  <Heart size={17} color="#64748b" />
                  <span>Wishlist</span>
                </Link>

                <Link
                  href="/account"
                  onClick={() => setIsDrawerOpen(false)}
                  style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px 12px", borderRadius: "8px", color: "#0f172a", textDecoration: "none", fontSize: "0.9rem", fontWeight: 600 }}
                  onMouseEnter={e => (e.currentTarget.style.background = "#f8fafc")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                >
                  <Bookmark size={17} color="#64748b" />
                  <span>Saved Items</span>
                </Link>

                <Link
                  href="/account"
                  onClick={() => setIsDrawerOpen(false)}
                  style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px 12px", borderRadius: "8px", color: "#0f172a", textDecoration: "none", fontSize: "0.9rem", fontWeight: 600 }}
                  onMouseEnter={e => (e.currentTarget.style.background = "#f8fafc")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                >
                  <Bell size={17} color="#64748b" />
                  <span>Back in Stock Alerts</span>
                </Link>

                <Link
                  href="/account"
                  onClick={() => setIsDrawerOpen(false)}
                  style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px 12px", borderRadius: "8px", color: "#0f172a", textDecoration: "none", fontSize: "0.9rem", fontWeight: 600 }}
                  onMouseEnter={e => (e.currentTarget.style.background = "#f8fafc")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                >
                  <Eye size={17} color="#64748b" />
                  <span>Recently Viewed</span>
                </Link>

              </div>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
