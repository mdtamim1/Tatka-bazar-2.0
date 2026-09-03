"use client";

import React, { useState } from "react";
import Link from "next/link";
import { X, Trash2, ShoppingBag, ArrowRight, Tag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";
import { useCartStore } from "@/lib/cart-store";
import { QuantitySelector } from "@/components/ui/QuantitySelector";
import { Button } from "@/components/ui/button";

export function CartDrawer() {
  const { locale, formatPrice } = useLanguage();
  const {
    items,
    isOpen,
    closeCart,
    updateQuantity,
    removeItem,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    getSubtotal,
    getDiscountAmount,
    getDeliveryFee,
    getGrandTotal,
  } = useCartStore();

  const [couponInput, setCouponInput] = useState("");
  const [couponError, setCouponError] = useState("");

  if (!isOpen) return null;

  const subtotal = getSubtotal();
  const discount = getDiscountAmount();
  const deliveryFee = getDeliveryFee();
  const grandTotal = getGrandTotal();

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    const res = applyCoupon(couponInput.trim());
    if (!res.success) {
      setCouponError(res.message);
    } else {
      setCouponError("");
      setCouponInput("");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={closeCart}
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
              {locale === "bn" ? "আপনার শপিং ব্যাগ" : "Shopping Bag"}
            </h2>
            <span className="text-xs text-muted-foreground">
              ({items.reduce((acc, it) => acc + it.quantity, 0)})
            </span>
          </div>

          <button
            type="button"
            onClick={closeCart}
            className="p-2 hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
            aria-label="Close cart"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cart Body */}
        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <ShoppingBag className="w-16 h-16 text-muted-foreground/30 mb-4" />
            <h3 className="font-serif text-2xl text-foreground mb-2">
              {locale === "bn" ? "আপনার ব্যাগ খালি" : "Your Bag is Empty"}
            </h3>
            <p className="text-sm text-muted-foreground max-w-xs mb-8">
              {locale === "bn"
                ? "আমাদের সতেজ প্রাকৃতিক পণ্যের সংগ্রহ থেকে পছন্দমতো পণ্য যোগ করুন।"
                : "Discover our curated collection of farm fresh goods and considered pantry staples."}
            </p>
            <Button
              asChild
              onClick={closeCart}
              className="btn-premium rounded-none px-8 py-4 text-xs tracking-[0.15em] uppercase"
            >
              <Link href="/shop">
                {locale === "bn" ? "কেনাকাটা শুরু করুন" : "Start Shopping"}
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
          </div>
        ) : (
          <>
            {/* Scrollable Items List */}
            <div className="flex-1 overflow-y-auto divide-y divide-border p-6">
              {items.map((item) => (
                <div key={item.id} className="py-4 first:pt-0 last:pb-0 flex gap-4">
                  {/* Thumbnail */}
                  <Link
                    href={`/product/${item.product.slug}`}
                    onClick={closeCart}
                    className="w-20 h-24 bg-muted flex-shrink-0 overflow-hidden group"
                  >
                    <img
                      src={item.product.images[0]}
                      alt={item.product.nameEn}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </Link>

                  {/* Details */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <Link
                          href={`/product/${item.product.slug}`}
                          onClick={closeCart}
                          className="font-serif text-base text-foreground hover:text-primary transition-colors line-clamp-1"
                        >
                          {locale === "bn" ? item.product.nameBn : item.product.nameEn}
                        </Link>
                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          className="text-muted-foreground hover:text-destructive p-1 transition-colors"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <p className="text-xs text-muted-foreground mt-0.5">
                        {item.selectedWeight} {item.selectedUnit}
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      <QuantitySelector
                        quantity={item.quantity}
                        onQuantityChange={(qty) => updateQuantity(item.id, qty)}
                        min={1}
                        max={99}
                      />
                      <span className="font-serif text-base text-foreground font-medium">
                        {formatPrice(item.unitPrice * item.quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer Summary & Actions */}
            <div className="border-t border-border p-6 bg-linen/50 space-y-4">
              {/* Coupon Form */}
              {appliedCoupon ? (
                <div className="flex items-center justify-between text-xs bg-accent/80 p-2.5 border border-border">
                  <span className="flex items-center gap-1.5 text-foreground font-medium">
                    <Tag className="w-3.5 h-3.5 text-primary" />
                    {appliedCoupon.code}
                    {appliedCoupon.discountPercent ? ` (-${appliedCoupon.discountPercent}%)` : ` (-৳${appliedCoupon.fixedDiscount})`}
                  </span>
                  <button
                    type="button"
                    onClick={removeCoupon}
                    className="text-muted-foreground hover:text-destructive text-[11px] underline"
                  >
                    {locale === "bn" ? "মুছুন" : "Remove"}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                    placeholder="WELCOME10 / TATKA50"
                    className="flex-1 px-3 py-2 text-xs bg-background border border-border text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary uppercase"
                  />
                  <Button type="submit" variant="outline" size="sm" className="rounded-none text-xs">
                    {locale === "bn" ? "প্রয়োগ" : "Apply"}
                  </Button>
                </form>
              )}
              {couponError && <p className="text-xs text-destructive">{couponError}</p>}

              {/* Subtotal & Delivery Breakdown */}
              <div className="space-y-1.5 text-xs text-muted-foreground">
                <div className="flex justify-between">
                  <span>{locale === "bn" ? "সাবটোটাল" : "Subtotal"}</span>
                  <span className="text-foreground font-medium">{formatPrice(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-primary">
                    <span>{locale === "bn" ? "ডিসকাউন্ট" : "Discount"}</span>
                    <span>-{formatPrice(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>{locale === "bn" ? "ডেলিভারি চার্জ" : "Delivery Fee"}</span>
                  <span className="text-foreground font-medium">
                    {deliveryFee === 0 ? (locale === "bn" ? "ফ্রি" : "Free") : formatPrice(deliveryFee)}
                  </span>
                </div>
                <div className="flex justify-between text-base font-serif text-foreground pt-2 border-t border-border font-medium">
                  <span>{locale === "bn" ? "সর্বমোট" : "Total"}</span>
                  <span>{formatPrice(grandTotal)}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                <Button
                  asChild
                  onClick={closeCart}
                  className="w-full btn-premium py-6 rounded-none text-xs tracking-[0.15em] uppercase font-semibold"
                >
                  <Link href="/checkout">
                    {locale === "bn" ? "অর্ডার সম্পন্ন করুন" : "Proceed to Checkout"}
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Link>
                </Button>

                <Button
                  asChild
                  variant="outline"
                  onClick={closeCart}
                  className="w-full py-5 rounded-none text-xs tracking-[0.15em] uppercase"
                >
                  <Link href="/cart">
                    {locale === "bn" ? "সম্পূর্ণ ব্যাগ দেখুন" : "View Full Bag"}
                  </Link>
                </Button>
              </div>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}
