"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { X, Heart, ShoppingBag, Trash2, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";
import { useCartStore } from "@/lib/cart-store";
import { PRODUCTS } from "@/lib/catalog";
import { Button } from "@/components/ui/button";

export function WishlistDrawer() {
  const { locale, formatPrice } = useLanguage();
  const {
    isWishlistOpen,
    closeWishlist,
    wishlistIds,
    removeFromWishlist,
    moveWishlistToCart,
    moveAllWishlistToCart,
  } = useCartStore();

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isWishlistOpen) return null;

  const wishlistProducts = mounted
    ? PRODUCTS.filter((p) => wishlistIds.includes(p.id))
    : [];

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={closeWishlist}
        className="fixed inset-0 bg-charcoal/50 backdrop-blur-sm"
      />

      {/* Slide-out Drawer */}
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="relative w-full max-w-md h-full bg-background border-l border-border shadow-2xl flex flex-col z-10"
      >
        {/* Header */}
        <div className="p-6 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="font-serif text-2xl tracking-tight text-foreground">
              {locale === "bn" ? "সংরক্ষিত পণ্য" : "Saved Pieces"}
            </h2>
            <span className="text-xs text-muted-foreground">
              ({wishlistProducts.length})
            </span>
          </div>

          <button
            type="button"
            onClick={closeWishlist}
            className="p-2 hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
            aria-label="Close wishlist"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {wishlistProducts.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <Heart className="w-16 h-16 text-muted-foreground/30 mb-4 stroke-1" />
            <h3 className="font-serif text-2xl text-foreground mb-2">
              {locale === "bn" ? "উইশলিস্ট খালি" : "No Saved Pieces"}
            </h3>
            <p className="text-sm text-muted-foreground max-w-xs mb-8">
              {locale === "bn"
                ? "আপনার পছন্দের পণ্যগুলোতে হার্ট আইকন ক্লিক করে সংরক্ষণ করুন।"
                : "Save the objects and harvest items you love to revisit anytime."}
            </p>
            <Button
              asChild
              onClick={closeWishlist}
              className="btn-premium rounded-none px-8 py-4 text-xs tracking-[0.15em] uppercase"
            >
              <Link href="/shop">
                {locale === "bn" ? "সংগ্রহ ব্রাউজ করুন" : "Browse Pieces"}
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto divide-y divide-border p-6">
              {wishlistProducts.map((product) => (
                <div key={product.id} className="py-4 first:pt-0 last:pb-0 flex gap-4">
                  <Link
                    href={`/product/${product.slug}`}
                    onClick={closeWishlist}
                    className="w-20 h-24 bg-muted flex-shrink-0 overflow-hidden group"
                  >
                    <img
                      src={product.images[0]}
                      alt={product.nameEn}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </Link>

                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <Link
                          href={`/product/${product.slug}`}
                          onClick={closeWishlist}
                          className="font-serif text-base text-foreground hover:text-primary transition-colors line-clamp-1"
                        >
                          {locale === "bn" ? product.nameBn : product.nameEn}
                        </Link>
                        <button
                          type="button"
                          onClick={() => removeFromWishlist(product.id)}
                          className="text-muted-foreground hover:text-destructive p-1 transition-colors"
                          aria-label="Remove"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <p className="text-xs text-muted-foreground mt-0.5">
                        {locale === "bn" ? product.categoryNameBn : product.categoryNameEn}
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      <span className="font-serif text-base text-foreground font-medium">
                        {formatPrice(product.basePrice)}
                      </span>
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => moveWishlistToCart(product, true)}
                        className="rounded-none text-[10px] tracking-[0.15em] uppercase px-3 py-1.5 h-auto bg-primary text-primary-foreground hover:bg-primary/90"
                      >
                        {locale === "bn" ? "+ ব্যাগে যোগ" : "+ Add to Bag"}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="border-t border-border p-6 bg-linen/50 space-y-3">
              <Button
                type="button"
                onClick={() => moveAllWishlistToCart(wishlistProducts)}
                className="w-full btn-premium py-5 rounded-none text-xs tracking-[0.15em] uppercase font-semibold"
              >
                {locale === "bn" ? "সব পণ্য ব্যাগে নিন" : "Move All to Bag"}
              </Button>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}