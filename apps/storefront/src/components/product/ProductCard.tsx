"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, ShoppingBag, Check, Zap, SlidersHorizontal } from "lucide-react";
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
  const { addItem, setBuyNowItem, wishlistIds, toggleWishlist, openCart, closeCart } = useCartStore();
  const [mounted, setMounted] = useState(false);
  const [addedAnim, setAddedAnim] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const inWishlist = mounted ? wishlistIds.includes(product.id) : false;
  const hasSecondImage = product.images && product.images.length > 1;
  const hasMultipleWeights = Boolean(product.weightOptions && product.weightOptions.length > 1);

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

  const router = useRouter();

  const handleActionClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const firstOption = product.weightOptions && product.weightOptions.length > 0 ? product.weightOptions[0] : undefined;
    const chosenWeight = firstOption ? firstOption.value : 1;
    const chosenUnit = (firstOption ? firstOption.unit : product.baseUnit) || "kg";
    const multiplier = firstOption?.multiplier ?? 1;
    const chosenPrice = Math.max(1, Math.round(product.basePrice * multiplier));

    setBuyNowItem(
      product,
      chosenWeight,
      chosenUnit as any,
      chosenPrice,
      1
    );
    closeCart();
    router.push("/checkout");
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
        {/* Image Container with compact aspect ratio matching user yellow line mark */}
        <div
          className={cn(
            "relative overflow-hidden bg-muted/40 mb-2 sm:mb-3 select-none",
            variant === "large" ? "aspect-[4/3] sm:aspect-[1/1]" : "aspect-square"
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
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          )}

          {/* Wishlist toggle button (Ultra Clear - No Border, No Blur) */}
          <button
            type="button"
            onClick={handleWishlistToggle}
            aria-label="Toggle wishlist"
            className={cn(
              "absolute top-2 right-2 sm:top-3 sm:right-3 w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center transition-all duration-300",
              "bg-white/10 hover:bg-white/25 text-white",
              "shadow-[0_4px_16px_rgba(0,0,0,0.2)]",
              "hover:scale-105 active:scale-95 active:translate-y-0.5",
              "opacity-90 sm:opacity-0 sm:translate-y-1 group-hover:opacity-100 group-hover:translate-y-0",
              inWishlist && "opacity-100 translate-y-0 bg-white/30 shadow-[0_4px_20px_rgba(244,63,94,0.4)]"
            )}
          >
            <Heart
              className={cn(
                "w-3.5 h-3.5 sm:w-4 sm:h-4 transition-all duration-300",
                inWishlist
                  ? "fill-rose-500 text-rose-500 scale-110 drop-shadow-[0_2px_8px_rgba(244,63,94,0.6)]"
                  : "text-white drop-shadow-[0_1.5px_3px_rgba(0,0,0,0.9)]"
              )}
            />
          </button>

          {/* Editorial Badges */}
          <div className="absolute top-2 left-2 sm:top-3.5 sm:left-3.5 flex flex-col gap-1">
            {product.isOrganic && (
              <span className="px-1.5 sm:px-2 py-0.5 text-[8px] sm:text-[9px] font-semibold tracking-[0.15em] sm:tracking-[0.2em] uppercase bg-foreground text-background">
                {locale === "bn" ? "অর্গানিক" : "Organic"}
              </span>
            )}
            {product.isFeatured && (
              <span className="px-1.5 sm:px-2 py-0.5 text-[8px] sm:text-[9px] font-semibold tracking-[0.15em] sm:tracking-[0.2em] uppercase bg-primary text-primary-foreground">
                {locale === "bn" ? "সেরা" : "Featured"}
              </span>
            )}
            {product.isDailyBazar && (
              <span className="px-1.5 sm:px-2 py-0.5 text-[8px] sm:text-[9px] font-semibold tracking-[0.15em] sm:tracking-[0.2em] uppercase bg-emerald-700 text-white">
                {locale === "bn" ? "তাজা" : "Fresh"}
              </span>
            )}
          </div>

          {/* Quick Add Bar (Ultra Clear - No Border, No Blur, Zero Darkening) */}
          <div className="absolute bottom-0 left-0 right-0 flex items-center justify-center pb-2.5 px-3 sm:pb-3.5 sm:px-4 opacity-0 group-hover:opacity-100 transition-all duration-300">
            <button
              type="button"
              onClick={handleQuickAdd}
              className="w-full py-2 sm:py-2.5 px-4 text-[10px] sm:text-xs font-semibold tracking-[0.15em] uppercase transition-all duration-300 flex items-center justify-center gap-1.5 rounded-full bg-white/15 hover:bg-white/30 text-white shadow-[0_4px_20px_rgba(0,0,0,0.22)] active:translate-y-0.5 active:scale-[0.98] drop-shadow-[0_1.5px_3px_rgba(0,0,0,0.9)]"
            >
              {addedAnim ? (
                <>
                  <Check className="w-3.5 h-3.5 drop-shadow-[0_1.5px_3px_rgba(0,0,0,0.9)]" />
                  <span className="drop-shadow-[0_1.5px_3px_rgba(0,0,0,0.9)]">{locale === "bn" ? "যোগ হয়েছে" : "Added"}</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-3.5 h-3.5 drop-shadow-[0_1.5px_3px_rgba(0,0,0,0.9)]" />
                  <span className="drop-shadow-[0_1.5px_3px_rgba(0,0,0,0.9)]">{locale === "bn" ? "+ ব্যাগে" : "+ Add"}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Product Information */}
        <div className="space-y-0.5 sm:space-y-1">
          {/* Category label */}
          <p className="text-[9px] sm:text-[10px] font-semibold tracking-[0.15em] sm:tracking-[0.2em] uppercase text-muted-foreground/70 transition-colors duration-300 group-hover:text-primary truncate">
            {locale === "bn" ? product.categoryNameBn : product.categoryNameEn}
          </p>

          {/* Product Title */}
          <h3 className="font-serif text-sm sm:text-base md:text-lg text-foreground transition-colors duration-300 group-hover:text-primary leading-snug line-clamp-1">
            {locale === "bn" ? product.nameBn : product.nameEn}
          </h3>

          {/* Origin */}
          <p className="text-[10px] sm:text-xs text-muted-foreground line-clamp-1">
            {locale === "bn" ? product.originBn : product.originEn}
          </p>

          {/* Price & Unit */}
          <div className="flex items-center gap-1.5 pt-0.5">
            <p className="font-serif text-xs sm:text-sm md:text-base font-medium text-foreground tracking-wide">
              {formatPrice(product.basePrice)}
            </p>
            <span className="text-[10px] sm:text-xs text-muted-foreground/70">
              / {product.baseUnit || "kg"}
            </span>
            {product.comparePrice && product.comparePrice > product.basePrice && (
              <span className="text-[10px] sm:text-xs text-muted-foreground/50 line-through">
                {formatPrice(product.comparePrice)}
              </span>
            )}
          </div>

          {/* Action Button: Direct Order Now */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleActionClick}
              className="w-full py-1.5 sm:py-2 px-1.5 sm:px-2.5 text-[9px] sm:text-[11px] font-semibold tracking-[0.03em] sm:tracking-[0.08em] uppercase bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-300 flex items-center justify-center gap-1 sm:gap-1.5 shadow-sm active:scale-[0.98] rounded-none"
            >
              <Zap className="w-3 h-3 fill-current flex-shrink-0" />
              <span className="truncate">
                {locale === "bn" ? "অর্ডার করুন" : "Order Now"}
              </span>
            </button>
          </div>
        </div>
      </Link>
    </motion.article>
  );
};
