"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, ShoppingBag, Trash2, Tag, ShieldCheck } from "lucide-react";
import { useCartStore } from "@/lib/cart-store";
import { useLanguage } from "@/context/LanguageContext";
import { QuantitySelector } from "@/components/ui/QuantitySelector";
import { Button } from "@/components/ui/button";

export default function CartPage() {
  const {
    items,
    removeItem,
    updateQuantity,
    getSubtotal,
    getDeliveryFee,
    getDiscountAmount,
    getGrandTotal,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
  } = useCartStore();

  const { locale, formatPrice } = useLanguage();
  const [couponInput, setCouponInput] = useState("");
  const [couponError, setCouponError] = useState("");

  const subtotal = getSubtotal();
  const deliveryFee = getDeliveryFee();
  const discount = getDiscountAmount();
  const grandTotal = getGrandTotal();

  const handleCouponSubmit = (e: React.FormEvent) => {
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

  if (items.length === 0) {
    return (
      <div className="container-narrow py-28 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <ShoppingBag className="w-16 h-16 mx-auto mb-6 text-muted-foreground/30 stroke-1" />
          <h1 className="font-serif text-4xl mb-4 text-foreground">
            {locale === "bn" ? "আপনার ব্যাগ খালি" : "Your Bag is Empty"}
          </h1>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto text-sm leading-relaxed">
            {locale === "bn"
              ? "আমাদের তাজা প্রাকৃতিক খাদ্যপণ্য এবং ঐতিহ্যবাহী উপাদান সংগ্রহ থেকে পছন্দমতো পণ্য যোগ করুন।"
              : "Discover our curated collection of farm-fresh provisions and find pieces that speak to your home."}
          </p>
          <Button
            asChild
            size="lg"
            className="rounded-none px-10 py-6 text-xs md:text-sm tracking-[0.15em] uppercase btn-premium"
          >
            <Link href="/shop">
              {locale === "bn" ? "কেনাকাটা শুরু করুন" : "Start Shopping"}
              <ArrowRight className="ml-3 w-4 h-4" />
            </Link>
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Breadcrumb */}
      <div className="container-full py-5 border-b border-border">
        <div className="flex items-center gap-2.5 text-xs text-muted-foreground uppercase tracking-[0.1em]">
          <Link href="/shop" className="hover:text-foreground transition-colors">
            {locale === "bn" ? "দোকান" : "Shop"}
          </Link>
          <span>/</span>
          <span className="text-foreground font-medium">
            {locale === "bn" ? "শপিং ব্যাগ" : "Your Bag"}
          </span>
        </div>
      </div>

      <section className="py-12 md:py-16">
        <div className="container-full">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="font-serif text-4xl md:text-5xl mb-12 text-foreground"
          >
            {locale === "bn" ? "শপিং ব্যাগ" : "Your Bag"}
          </motion.h1>

          <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-start">
            {/* Left 7 cols: Items List */}
            <div className="lg:col-span-7">
              <div className="divide-y divide-border border-t border-b border-border">
                {items.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.08 }}
                    className="flex gap-6 py-8"
                  >
                    {/* Thumbnail */}
                    <Link
                      href={`/product/${item.product.slug}`}
                      className="w-28 h-36 md:w-36 md:h-44 flex-shrink-0 overflow-hidden bg-muted group"
                    >
                      <img
                        src={item.product.images[0]}
                        alt={item.product.nameEn}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </Link>

                    {/* Details */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start gap-2">
                          <Link
                            href={`/product/${item.product.slug}`}
                            className="font-serif text-xl md:text-2xl text-foreground hover:text-primary transition-colors"
                          >
                            {locale === "bn" ? item.product.nameBn : item.product.nameEn}
                          </Link>
                          <button
                            type="button"
                            onClick={() => removeItem(item.id)}
                            className="p-1.5 text-muted-foreground hover:text-destructive transition-colors"
                            aria-label="Remove"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <p className="text-xs text-muted-foreground mt-1">
                          {item.selectedWeight} {item.selectedUnit}
                        </p>

                        <p className="font-serif text-lg text-foreground mt-3 font-medium">
                          {formatPrice(item.unitPrice * item.quantity)}
                        </p>
                      </div>

                      {/* Quantity Selector */}
                      <div className="pt-4">
                        <QuantitySelector
                          quantity={item.quantity}
                          onQuantityChange={(qty) => updateQuantity(item.id, qty)}
                          min={1}
                          max={99}
                        />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="pt-8">
                <Link
                  href="/shop"
                  className="inline-flex items-center gap-2 text-xs tracking-[0.15em] uppercase text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ArrowRight className="w-4 h-4 rotate-180" />
                  {locale === "bn" ? "কেনাকাটা চালিয়ে যান" : "Continue Shopping"}
                </Link>
              </div>
            </div>

            {/* Right 5 cols: Order Summary */}
            <div className="lg:col-span-5 bg-linen p-8 border border-border space-y-6">
              <h2 className="font-serif text-2xl text-foreground">
                {locale === "bn" ? "অর্ডার সারাংশ" : "Order Summary"}
              </h2>

              {/* Coupon Form */}
              <div className="space-y-2">
                {appliedCoupon ? (
                  <div className="flex items-center justify-between text-xs bg-background p-3 border border-border">
                    <span className="flex items-center gap-1.5 font-medium">
                      <Tag className="w-3.5 h-3.5 text-primary" />
                      {appliedCoupon.code}
                      {appliedCoupon.discountPercent ? ` (-${appliedCoupon.discountPercent}%)` : ` (-৳${appliedCoupon.fixedDiscount})`}
                    </span>
                    <button
                      type="button"
                      onClick={removeCoupon}
                      className="text-destructive text-xs underline"
                    >
                      {locale === "bn" ? "মুছুন" : "Remove"}
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleCouponSubmit} className="flex gap-2">
                    <input
                      type="text"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                      placeholder="Coupon Code"
                      className="flex-1 px-4 py-2.5 text-xs bg-background border border-border text-foreground uppercase placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary"
                    />
                    <Button type="submit" variant="outline" className="rounded-none text-xs tracking-[0.1em] uppercase">
                      {locale === "bn" ? "প্রয়োগ" : "Apply"}
                    </Button>
                  </form>
                )}
                {couponError && <p className="text-xs text-destructive">{couponError}</p>}
              </div>

              {/* Cost Breakdown */}
              <div className="space-y-3 text-sm border-t border-border pt-4">
                <div className="flex justify-between text-muted-foreground">
                  <span>{locale === "bn" ? "সাবটোটাল" : "Subtotal"}</span>
                  <span className="text-foreground font-medium">{formatPrice(subtotal)}</span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between text-primary">
                    <span>{locale === "bn" ? "ডিসকাউন্ট" : "Discount"}</span>
                    <span>-{formatPrice(discount)}</span>
                  </div>
                )}

                <div className="flex justify-between text-muted-foreground">
                  <span>{locale === "bn" ? "ডেলিভারি চার্জ" : "Estimated Delivery"}</span>
                  <span className="text-foreground font-medium">
                    {deliveryFee === 0 ? (locale === "bn" ? "ফ্রি" : "Complimentary") : formatPrice(deliveryFee)}
                  </span>
                </div>

                <div className="flex justify-between text-xl font-serif text-foreground pt-4 border-t border-border font-medium">
                  <span>{locale === "bn" ? "সর্বমোট" : "Total"}</span>
                  <span>{formatPrice(grandTotal)}</span>
                </div>
              </div>

              {/* Checkout Button */}
              <Button
                asChild
                className="w-full btn-premium py-6 rounded-none text-xs tracking-[0.15em] uppercase font-semibold"
              >
                <Link href="/checkout">
                  {locale === "bn" ? "চেকআউট করুন" : "Proceed to Checkout"}
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>

              <div className="pt-2 text-center text-xs text-muted-foreground flex items-center justify-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-primary" />
                <span>100% Quality & Freshness Guarantee</span>
              </div>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}
