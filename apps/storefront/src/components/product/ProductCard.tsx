"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Heart, ShoppingBag, Check } from "lucide-react";
import { motion } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";
import { useCartStore } from "@/lib/cart-store";
import type { Product } from "@/types";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
  index?: number;
  variant?: "default" | "large";
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  index = 0,
  variant = "default",
}) => {
  const { locale, formatPrice } = useLanguage();
  const { addItem, wishlistIds, toggleWishlist, openCart } = useCartStore();
  const [mounted, setMounted] = useState(false);
  const [addedAnim, setAddedAnim] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const inWishlist = mounted ? wishlistIds.includes(product.id) : false;
  const hasSecondImage = product.images && product.images.length > 1;

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product.id);
  };

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(
      product,
      1,
      product.baseUnit || "kg",
      product.basePrice,
      1
    );
    setAddedAnim(true);
    openCart();
    setTimeout(() => setAddedAnim(false), 1500);
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.7, delay: (index % 4) * 0.08, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="group"
    >
      <Link href={`/product/${product.slug}`} className="block">
        {/* Image Container with editorial aspect ratio */}
        <div
          className={cn(
            "relative overflow-hidden bg-muted/40 mb-4 select-none",
            variant === "large" ? "aspect-[3/4]" : "aspect-[4/5]"
          )}
        >
          {/* Primary Image */}
          <img
            src={product.images[0]}
            alt={locale === "bn" ? product.nameBn : product.nameEn}
            className={cn(
              "w-full h-full object-cover transition-all duration-[1s] ease-out",
              hasSecondImage
                ? "group-hover:opacity-0 group-hover:scale-105"
                : "group-hover:scale-105"
            )}
          />

          {/* Secondary Image (Crossfade on hover) */}
          {hasSecondImage && (
            <img
              src={product.images[1]}
              alt={`${product.nameEn} alternate view`}
              className="absolute inset-0 w-full h-full object-cover opacity-0 scale-105 transition-all duration-[1s] ease-out group-hover:opacity-100 group-hover:scale-100"
            />
          )}

          {/* Gradient Overlay on Hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal/25 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

          {/* Wishlist toggle button */}
          <button
            type="button"
            onClick={handleWishlistToggle}
            aria-label="Toggle wishlist"
            className={cn(
              "absolute top-4 right-4 p-2.5 rounded-full transition-all duration-500",
              "bg-background/90 backdrop-blur-md hover:bg-background shadow-sm",
              "opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0",
              inWishlist && "opacity-100 translate-y-0"
            )}
          >
            <Heart
              className={cn(
                "w-4 h-4 transition-all duration-300",
                inWishlist ? "fill-primary text-primary scale-110" : "text-foreground"
              )}
            />
          </button>

          {/* Editorial Badges */}
          <div className="absolute top-4 left-4 flex flex-col gap-1.5">
            {product.isOrganic && (
              <span className="px-2.5 py-1 text-[9px] font-semibold tracking-[0.2em] uppercase bg-foreground text-background">
                {locale === "bn" ? "অর্গানিক" : "Organic"}
              </span>
            )}
            {product.isFeatured && (
              <span className="px-2.5 py-1 text-[9px] font-semibold tracking-[0.2em] uppercase bg-primary text-primary-foreground">
                {locale === "bn" ? "সেরা পছন্দ" : "Featured"}
              </span>
            )}
            {product.isDailyBazar && (
              <span className="px-2.5 py-1 text-[9px] font-semibold tracking-[0.2em] uppercase bg-amber-700 text-white">
                {locale === "bn" ? "তাজা সকাল" : "Daily Fresh"}
              </span>
            )}
          </div>

          {/* Quick Add Bar sliding up on hover */}
          <div className="absolute bottom-0 left-0 right-0 flex items-center justify-center pb-4 px-4 opacity-0 translate-y-3 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500">
            <button
              type="button"
              onClick={handleQuickAdd}
              className="w-full py-2.5 px-4 text-xs font-medium tracking-[0.15em] uppercase bg-background/95 backdrop-blur-md text-foreground shadow-md hover:bg-primary hover:text-primary-foreground transition-all duration-300 flex items-center justify-center gap-2 rounded-none"
            >
              {addedAnim ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>{locale === "bn" ? "যোগ হয়েছে" : "Added"}</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>{locale === "bn" ? "+ ব্যাগে যোগ" : "+ Add to Bag"}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Product Information */}
        <div className="space-y-1.5">
          {/* Category label */}
          <p className="text-[10px] font-semibold tracking-[0.2em] uppercase text-muted-foreground/70 transition-colors duration-300 group-hover:text-primary">
            {locale === "bn" ? product.categoryNameBn : product.categoryNameEn}
          </p>

          {/* Product Title */}
          <h3 className="font-serif text-lg md:text-xl text-foreground transition-colors duration-300 group-hover:text-primary leading-snug line-clamp-1">
            {locale === "bn" ? product.nameBn : product.nameEn}
          </h3>

          {/* Origin / Quality line */}
          <p className="text-xs text-muted-foreground line-clamp-1">
            {locale === "bn" ? product.originBn : product.originEn}
          </p>

          {/* Price & Unit */}
          <div className="flex items-center gap-2 pt-0.5">
            <p className="font-serif text-base font-medium text-foreground tracking-wide">
              {formatPrice(product.basePrice)}
            </p>
            <span className="text-xs text-muted-foreground/70">
              / {product.baseUnit || "kg"}
            </span>
            {product.comparePrice && product.comparePrice > product.basePrice && (
              <span className="text-xs text-muted-foreground/50 line-through">
                {formatPrice(product.comparePrice)}
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.article>
  );
};
