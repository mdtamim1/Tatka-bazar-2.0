"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Heart, Menu, X, Search, ChevronDown, ShoppingBag, Truck
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";
import { useCartStore } from "@/lib/cart-store";
import { CATEGORIES, PRODUCTS } from "@/lib/catalog";
import { CartIcon } from "@/components/layout/CartIcon";
import { useDebounce } from "@/hooks/useDebounce";
import { cn } from "@/lib/utils";

export const Header = () => {
  const router = useRouter();
  const { locale, t } = useLanguage();
  const { wishlistIds, openWishlist } = useCartStore();

  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [collectionsOpen, setCollectionsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [mounted, setMounted] = useState(false);
  const [wishlistTooltip, setWishlistTooltip] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const collectionsRef = useRef<HTMLDivElement>(null);
  const debouncedQuery = useDebounce(searchQuery, 200);

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  // Click outside collections dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (collectionsRef.current && !collectionsRef.current.contains(event.target as Node)) {
        setCollectionsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
      router.push(`/shop?q=${encodeURIComponent(searchQuery)}`);
      setSearchOpen(false);
      setSearchQuery("");
    }
  };

  const wishlistCount = mounted ? wishlistIds.length : 0;
  const wishlistedProducts = mounted
    ? PRODUCTS.filter((p) => wishlistIds.includes(p.id)).slice(0, 3)
    : [];

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-all duration-500",
        scrolled
          ? "bg-background/95 backdrop-blur-md border-b border-border shadow-sm"
          : "bg-background/80 backdrop-blur-sm border-b border-border/50"
      )}
    >
      <div className="container-full">
        <div className="flex items-center justify-between h-16 md:h-20">
          
          {/* Brand Logo (Serif editorial styling) */}
          <Link
            href="/"
            className="font-serif font-bold text-2xl md:text-3xl tracking-tight text-foreground hover:text-primary transition-colors duration-300 flex items-baseline gap-1.5"
          >
            <span className="font-bold">Tatka Bazar</span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 lg:gap-10">
            {/* Collections Dropdown */}
            <div className="relative" ref={collectionsRef}>
              <button
                type="button"
                onClick={() => setCollectionsOpen(!collectionsOpen)}
                className="flex items-center gap-1.5 text-xs font-medium tracking-[0.15em] uppercase text-muted-foreground hover:text-foreground transition-colors duration-300 py-2 link-underline"
              >
                <span>{locale === "bn" ? "কালেকশন" : "Collections"}</span>
                <ChevronDown
                  className={cn("w-3.5 h-3.5 transition-transform duration-300", collectionsOpen && "rotate-180")}
                />
              </button>

              <AnimatePresence>
                {collectionsOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full left-0 mt-2 w-[520px] bg-background/98 backdrop-blur-md border border-border p-4 shadow-xl grid grid-cols-2 gap-2 z-50 rounded-none"
                  >
                    {CATEGORIES.map((cat) => (
                      <Link
                        key={cat.id}
                        href={`/category/${cat.slug}`}
                        onClick={() => setCollectionsOpen(false)}
                        className="p-3 hover:bg-accent transition-colors block text-left group"
                      >
                        <div className="text-sm font-serif font-medium text-foreground group-hover:text-primary transition-colors">
                          {locale === "bn" ? cat.nameBn : cat.nameEn}
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                          {locale === "bn" ? cat.descriptionBn : cat.descriptionEn}
                        </p>
                      </Link>
                    ))}
                    <div className="col-span-2 pt-2 border-t border-border mt-1">
                      <Link
                        href="/shop"
                        onClick={() => setCollectionsOpen(false)}
                        className="text-xs font-medium tracking-[0.15em] uppercase text-primary hover:underline block text-center py-1"
                      >
                        {locale === "bn" ? "সব পণ্য দেখুন →" : "View All Products →"}
                      </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Link
              href="/shop"
              className="text-xs font-medium tracking-[0.15em] uppercase text-muted-foreground hover:text-foreground transition-colors duration-300 link-underline"
            >
              {locale === "bn" ? "সব পণ্য" : "Shop All"}
            </Link>

            <Link
              href="/recipes"
              className="text-xs font-medium tracking-[0.15em] uppercase text-muted-foreground hover:text-foreground transition-colors duration-300 link-underline"
            >
              {locale === "bn" ? "রেসিপি" : "Recipes"}
            </Link>

            <Link
              href="/about"
              className="text-xs font-medium tracking-[0.15em] uppercase text-muted-foreground hover:text-foreground transition-colors duration-300 link-underline"
            >
              {locale === "bn" ? "আমাদের গল্প" : "About"}
            </Link>
          </nav>

          {/* Right side actions */}
          <div className="flex items-center gap-1 sm:gap-2">
            
            {/* Search Trigger */}
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="p-2.5 hover:bg-accent transition-colors duration-300 group"
              aria-label="Search"
            >
              <Search className="w-5 h-5 text-foreground transition-transform duration-300 group-hover:scale-110" />
            </button>

            {/* Order Track Button */}
            <Link
              href="/track"
              className="px-2 py-0.5 sm:px-2.5 sm:py-1 hover:bg-accent/80 transition-all duration-300 flex items-center gap-1 text-[10.5px] font-medium tracking-wide uppercase text-muted-foreground hover:text-foreground group border border-border/60 hover:border-foreground/30 rounded-full"
              aria-label="Track Order"
              title={locale === "bn" ? "অর্ডার ট্র্যাক করুন" : "Track Order"}
            >
              <Truck className="w-3.5 h-3.5 text-foreground transition-transform duration-300 group-hover:scale-110 shrink-0" />
              <span className="font-sans font-medium text-[10.5px] text-foreground hidden sm:inline whitespace-nowrap">
                {locale === "bn" ? "ট্র্যাক অর্ডার" : "Track Order"}
              </span>
            </Link>

            {/* Wishlist Icon with Tooltip */}
            <div
              className="relative"
              onMouseEnter={() => setWishlistTooltip(true)}
              onMouseLeave={() => setWishlistTooltip(false)}
            >
              <button
                type="button"
                onClick={openWishlist}
                className="relative p-2.5 hover:bg-accent transition-colors duration-300 group"
                aria-label="Wishlist"
              >
                <Heart className={cn("w-5 h-5 transition-all duration-300 group-hover:scale-110", wishlistCount > 0 ? "text-primary" : "text-foreground")} />
                <AnimatePresence>
                  {wishlistCount > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-primary text-primary-foreground text-[10px] font-semibold rounded-full flex items-center justify-center pointer-events-none"
                    >
                      {wishlistCount > 9 ? "9+" : wishlistCount}
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>

              {/* Tooltip Hover Preview */}
              <AnimatePresence>
                {wishlistTooltip && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    className="absolute right-0 mt-1 w-64 bg-background border border-border p-3 shadow-xl z-50 hidden md:block rounded-none"
                  >
                    {wishlistCount === 0 ? (
                      <p className="text-xs text-muted-foreground">{locale === "bn" ? "উইশলিস্ট খালি" : "Your wishlist is empty"}</p>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-xs font-medium">
                          <span>{wishlistCount} {locale === "bn" ? "টি সংরক্ষিত" : (wishlistCount === 1 ? "saved item" : "saved items")}</span>
                          <button
                            type="button"
                            onClick={openWishlist}
                            className="text-primary hover:underline text-[11px]"
                          >
                            {locale === "bn" ? "দেখুন" : "View"}
                          </button>
                        </div>
                        <div className="space-y-1.5 pt-1 border-t border-border">
                          {wishlistedProducts.map((p) => (
                            <div key={p.id} className="text-xs text-muted-foreground truncate hover:text-foreground">
                              {locale === "bn" ? p.nameBn : p.nameEn}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Shopping Bag Cart Icon */}
            <CartIcon />

            {/* Mobile menu trigger */}
            <button
              type="button"
              className="md:hidden p-2.5 hover:bg-accent transition-colors duration-300"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle Menu"
            >
              <AnimatePresence mode="wait">
                {mobileMenuOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <X className="w-5 h-5" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Menu className="w-5 h-5" />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>

        {/* Mobile slide-down menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="md:hidden border-t border-border overflow-hidden bg-background"
            >
              <div className="py-6 space-y-6">
                <div className="space-y-1">
                  <p className="text-[10px] font-semibold tracking-[0.3em] uppercase text-muted-foreground/60 px-2 mb-2">
                    {locale === "bn" ? "কালেকশন" : "Collections"}
                  </p>
                  {CATEGORIES.slice(0, 6).map((cat, i) => (
                    <motion.div
                      key={cat.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                    >
                      <Link
                        href={`/category/${cat.slug}`}
                        className="block px-3 py-2 text-sm hover:bg-accent transition-colors"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {locale === "bn" ? cat.nameBn : cat.nameEn}
                      </Link>
                    </motion.div>
                  ))}
                </div>

                <div className="pt-4 border-t border-border space-y-1">
                  {[
                    { href: "/track", label: locale === "bn" ? "অর্ডার ট্র্যাক" : "Track Order" },
                    { href: "/shop", label: locale === "bn" ? "সব পণ্য" : "Shop All" },
                    { href: "/recipes", label: locale === "bn" ? "রেসিপি" : "Recipes" },
                    { href: "/about", label: locale === "bn" ? "আমাদের গল্প" : "About Our Story" },
                    { href: "/cart", label: locale === "bn" ? "শপিং ব্যাগ" : "Shopping Bag" },
                  ].map((link, i) => (
                    <motion.div
                      key={link.href}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.25 + i * 0.04 }}
                    >
                      <Link
                        href={link.href}
                        className="block px-3 py-2 text-sm font-medium hover:bg-accent transition-colors"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {link.label}
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Global Minimalist Search Modal */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-charcoal/60 backdrop-blur-sm flex flex-col justify-start pt-20 px-4"
            onClick={() => setSearchOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-background max-w-2xl w-full mx-auto p-6 md:p-8 shadow-2xl border border-border"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <p className="text-[10px] font-semibold tracking-[0.3em] uppercase text-primary">
                  {locale === "bn" ? "পণ্য খুঁজুন" : "Search Pieces"}
                </p>
                <button
                  type="button"
                  onClick={() => setSearchOpen(false)}
                  className="p-1 hover:bg-accent transition-colors"
                >
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>

              <form onSubmit={handleSearchSubmit} className="relative">
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={locale === "bn" ? "পদ্মার ইলিশ, অর্গানিক মধু, সুগন্ধি চাল..." : "Search organic honey, Padma Ilish, heritage rice..."}
                  className="w-full bg-background border-b-2 border-border focus:border-primary py-3 pr-10 text-lg md:text-xl font-serif text-foreground outline-none transition-colors"
                />
                <button
                  type="submit"
                  className="absolute right-0 top-1/2 -translate-y-1/2 p-2 text-muted-foreground hover:text-foreground"
                >
                  <Search className="w-5 h-5" />
                </button>
              </form>

              {searchResults.length > 0 && (
                <div className="mt-6 divide-y divide-border">
                  {searchResults.map((p) => (
                    <Link
                      key={p.id}
                      href={`/product/${p.slug}`}
                      onClick={() => setSearchOpen(false)}
                      className="flex items-center gap-4 py-3 hover:bg-accent px-2 transition-colors group"
                    >
                      <div className="w-12 h-12 bg-muted flex-shrink-0 overflow-hidden">
                        <img src={p.images[0]} alt={p.nameEn} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-serif text-base text-foreground group-hover:text-primary transition-colors truncate">
                          {locale === "bn" ? p.nameBn : p.nameEn}
                        </p>
                        <p className="text-xs text-muted-foreground">{locale === "bn" ? p.categoryNameBn : p.categoryNameEn}</p>
                      </div>
                      <p className="text-sm font-medium text-foreground">৳{p.basePrice}</p>
                    </Link>
                  ))}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
