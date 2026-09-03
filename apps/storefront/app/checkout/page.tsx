"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Check,
  ShieldCheck,
  Truck,
  ArrowRight,
  CreditCard,
  Building,
  CheckCircle2,
  Package
} from "lucide-react";
import confetti from "canvas-confetti";
import { motion } from "framer-motion";
import { useCartStore } from "@/lib/cart-store";
import { useLanguage } from "@/context/LanguageContext";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type CheckoutStep = "details" | "payment" | "complete";

export default function CheckoutPage() {
  const { locale, formatPrice } = useLanguage();
  const {
    items,
    getSubtotal,
    getDiscountAmount,
    getDeliveryFee,
    getGrandTotal,
    clearCart,
    submitOrder,
  } = useCartStore();

  const [currentStep, setCurrentStep] = useState<CheckoutStep>("details");
  const [isProcessing, setIsProcessing] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    fullName: "Rafiq Ahmed",
    phone: "01712-345678",
    email: "rafiq.ahmed@example.com",
    city: "Dhaka",
    area: "Dhanmondi",
    address: "House 42, Road 7/A, Dhanmondi",
    deliverySlot: "morning",
    specialNote: "Please pack with extra ice care.",
  });

  // Payment Method
  const [paymentMethod, setPaymentMethod] = useState<"BKASH" | "NAGAD" | "COD">("BKASH");
  const [placedOrder, setPlacedOrder] = useState<any | null>(null);

  const subtotal = getSubtotal();
  const discount = getDiscountAmount();
  const deliveryFee = getDeliveryFee();
  const grandTotal = getGrandTotal();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentStep("payment");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleFinalOrder = async () => {
    setIsProcessing(true);
    try {
      const orderPayload = {
        customer: formData,
        paymentMethod,
        items,
        subtotal,
        discount,
        deliveryFee,
        grandTotal,
        date: new Date().toISOString(),
      };

      const res = await submitOrder(orderPayload);
      if (res.success) {
        setPlacedOrder({
          orderNumber: res.orderNumber,
          ...orderPayload,
        });
        setCurrentStep("complete");
        clearCart();
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  if (currentStep === "complete" && placedOrder) {
    return (
      <div className="container-narrow py-20 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-linen p-10 md:p-14 border border-border space-y-6 max-w-xl mx-auto"
        >
          <div className="w-16 h-16 bg-primary/10 text-primary flex items-center justify-center rounded-full mx-auto">
            <CheckCircle2 className="w-10 h-10 stroke-1" />
          </div>

          <p className="text-[10px] font-semibold tracking-[0.3em] uppercase text-primary">
            {locale === "bn" ? "অর্ডার নিশ্চিতকরণ" : "Order Confirmed"}
          </p>

          <h1 className="font-serif text-3xl md:text-4xl text-foreground">
            {locale === "bn" ? "ধন্যবাদ, আপনার অর্ডার গৃহীত হয়েছে" : "Thank You For Your Order"}
          </h1>

          <p className="text-sm text-muted-foreground leading-relaxed">
            {locale === "bn"
              ? `অর্ডার নম্বর #${placedOrder.orderNumber}। আমাদের ডেলিভারি প্রতিনিধি শীঘ্রই যোগাযোগ করবেন।`
              : `Order #${placedOrder.orderNumber}. A confirmation has been recorded. Our cold-chain team is preparing your pieces with care.`}
          </p>

          <div className="border-t border-border pt-6 text-left text-xs space-y-2 text-muted-foreground">
            <div className="flex justify-between">
              <span>{locale === "bn" ? "প্রাপক:" : "Recipient:"}</span>
              <span className="text-foreground font-medium">{placedOrder.customer.fullName}</span>
            </div>
            <div className="flex justify-between">
              <span>{locale === "bn" ? "ঠিকানা:" : "Address:"}</span>
              <span className="text-foreground font-medium">{placedOrder.customer.address}, {placedOrder.customer.city}</span>
            </div>
            <div className="flex justify-between">
              <span>{locale === "bn" ? "পদ্ধতি:" : "Payment:"}</span>
              <span className="text-foreground font-medium">{placedOrder.paymentMethod}</span>
            </div>
            <div className="flex justify-between text-base font-serif text-foreground pt-3 border-t border-border">
              <span>{locale === "bn" ? "পরিশোধিত মূল্য:" : "Total:"}</span>
              <span>{formatPrice(placedOrder.grandTotal)}</span>
            </div>
          </div>

          <Button
            asChild
            className="w-full btn-premium py-6 rounded-none text-xs tracking-[0.15em] uppercase font-semibold mt-4"
          >
            <Link href="/shop">
              {locale === "bn" ? "আরও কেনাকাটা করুন" : "Return to Shop"}
              <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </Button>
        </motion.div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container-narrow py-28 text-center">
        <p className="font-serif text-3xl text-foreground mb-4">
          {locale === "bn" ? "আপনার শপিং ব্যাগ খালি" : "Your Bag is Empty"}
        </p>
        <Button asChild className="rounded-none btn-premium px-8 py-5 text-xs tracking-[0.15em] uppercase">
          <Link href="/shop">{locale === "bn" ? "দোকানে ফিরে যান" : "Browse Pieces"}</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Breadcrumb */}
      <div className="container-full py-5 border-b border-border">
        <div className="flex items-center gap-2.5 text-xs text-muted-foreground uppercase tracking-[0.1em]">
          <Link href="/cart" className="hover:text-foreground transition-colors">
            {locale === "bn" ? "শপিং ব্যাগ" : "Bag"}
          </Link>
          <span>/</span>
          <span className="text-foreground font-medium">
            {locale === "bn" ? "চেকআউট" : "Checkout"}
          </span>
        </div>
      </div>

      <section className="py-12 md:py-16">
        <div className="container-full">
          {/* Step Indicator */}
          <div className="flex items-center justify-center gap-8 mb-12 text-xs tracking-[0.2em] uppercase">
            <span className={cn(currentStep === "details" ? "text-primary font-semibold border-b-2 border-primary pb-1" : "text-muted-foreground")}>
              1. {locale === "bn" ? "ডেলিভারি তথ্য" : "Delivery Details"}
            </span>
            <span className="text-border">/</span>
            <span className={cn(currentStep === "payment" ? "text-primary font-semibold border-b-2 border-primary pb-1" : "text-muted-foreground")}>
              2. {locale === "bn" ? "পেমেন্ট পদ্ধতি" : "Payment"}
            </span>
          </div>

          <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-start">
            {/* Left 7 cols: Form content */}
            <div className="lg:col-span-7">
              {currentStep === "details" ? (
                <form onSubmit={handleDetailsSubmit} className="space-y-6">
                  <h2 className="font-serif text-2xl md:text-3xl text-foreground mb-6">
                    {locale === "bn" ? "ডেলিভারি ঠিকানা ও সময়" : "Shipping Destination"}
                  </h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-semibold tracking-[0.2em] uppercase text-muted-foreground">
                        {locale === "bn" ? "পূর্ণ নাম" : "Full Name"}
                      </label>
                      <input
                        type="text"
                        name="fullName"
                        required
                        value={formData.fullName}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 text-sm bg-background border border-border text-foreground rounded-none focus:outline-none focus:border-primary"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-semibold tracking-[0.2em] uppercase text-muted-foreground">
                        {locale === "bn" ? "মোবাইল নম্বর" : "Phone Number"}
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        required
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 text-sm bg-background border border-border text-foreground rounded-none focus:outline-none focus:border-primary"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-semibold tracking-[0.2em] uppercase text-muted-foreground">
                        {locale === "bn" ? "শহর" : "City"}
                      </label>
                      <select
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 text-sm bg-background border border-border text-foreground rounded-none focus:outline-none focus:border-primary"
                      >
                        <option value="Dhaka">Dhaka</option>
                        <option value="Chittagong">Chittagong</option>
                        <option value="Sylhet">Sylhet</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-semibold tracking-[0.2em] uppercase text-muted-foreground">
                        {locale === "bn" ? "এলাকা" : "Area / Zone"}
                      </label>
                      <input
                        type="text"
                        name="area"
                        required
                        value={formData.area}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 text-sm bg-background border border-border text-foreground rounded-none focus:outline-none focus:border-primary"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-semibold tracking-[0.2em] uppercase text-muted-foreground">
                      {locale === "bn" ? "বিস্তারিত ঠিকানা" : "Street Address"}
                    </label>
                    <textarea
                      name="address"
                      rows={2}
                      required
                      value={formData.address}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 text-sm bg-background border border-border text-foreground rounded-none focus:outline-none focus:border-primary resize-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-semibold tracking-[0.2em] uppercase text-muted-foreground">
                      {locale === "bn" ? "ডেলিভারি সময় স্লট" : "Delivery Window"}
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { val: "morning", labelBn: "সকাল (৮-১১ টা)", labelEn: "Morning (8-11 AM)" },
                        { val: "afternoon", labelBn: "দুপুর (১২-৩ টা)", labelEn: "Afternoon (12-3 PM)" },
                        { val: "evening", labelBn: "সন্ধ্যা (৪-৮ টা)", labelEn: "Evening (4-8 PM)" },
                      ].map((slot) => (
                        <button
                          key={slot.val}
                          type="button"
                          onClick={() => setFormData((p) => ({ ...p, deliverySlot: slot.val }))}
                          className={cn(
                            "py-3 px-2 text-xs border text-center transition-colors rounded-none",
                            formData.deliverySlot === slot.val
                              ? "border-primary bg-primary/5 text-primary font-semibold"
                              : "border-border text-muted-foreground hover:border-foreground/40"
                          )}
                        >
                          {locale === "bn" ? slot.labelBn : slot.labelEn}
                        </button>
                      ))}
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full btn-premium py-6 rounded-none text-xs tracking-[0.15em] uppercase font-semibold mt-4"
                  >
                    {locale === "bn" ? "পেমেন্ট ধাপে যান" : "Continue to Payment"}
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </form>
              ) : (
                <div className="space-y-6">
                  <h2 className="font-serif text-2xl md:text-3xl text-foreground mb-6">
                    {locale === "bn" ? "পেমেন্ট পদ্ধতি নির্বাচন করুন" : "Select Payment Method"}
                  </h2>

                  <div className="space-y-3">
                    {[
                      { id: "BKASH", name: "bKash Digital Payment", desc: "Instant automated 1.5% cashback" },
                      { id: "NAGAD", name: "Nagad Gateway", desc: "Instant direct checkout" },
                      { id: "COD", name: "Cash on Delivery (ক্যাশ অন ডেলিভারি)", desc: "Inspect items at your doorstep before payment" },
                    ].map((m) => (
                      <div
                        key={m.id}
                        onClick={() => setPaymentMethod(m.id as any)}
                        className={cn(
                          "p-4 border cursor-pointer transition-all flex items-center justify-between",
                          paymentMethod === m.id
                            ? "border-primary bg-primary/5 shadow-sm"
                            : "border-border hover:border-foreground/30 bg-background"
                        )}
                      >
                        <div>
                          <p className="font-serif text-base text-foreground font-medium">{m.name}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{m.desc}</p>
                        </div>
                        <div
                          className={cn(
                            "w-5 h-5 rounded-full border flex items-center justify-center",
                            paymentMethod === m.id ? "border-primary bg-primary text-white" : "border-border"
                          )}
                        >
                          {paymentMethod === m.id && <Check className="w-3 h-3" />}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4 flex gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setCurrentStep("details")}
                      className="rounded-none py-6 text-xs tracking-[0.1em] uppercase"
                    >
                      {locale === "bn" ? "পূর্ববর্তী ধাপ" : "Back to Details"}
                    </Button>

                    <Button
                      type="button"
                      onClick={handleFinalOrder}
                      disabled={isProcessing}
                      className="flex-1 btn-premium py-6 rounded-none text-xs tracking-[0.15em] uppercase font-semibold"
                    >
                      {isProcessing ? (locale === "bn" ? "প্রক্রিয়াকরণ হচ্ছে..." : "Processing...") : (locale === "bn" ? "অর্ডার সম্পন্ন করুন" : "Place Order Now")}
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Right 5 cols: Order Review */}
            <div className="lg:col-span-5 bg-linen p-8 border border-border space-y-6">
              <h3 className="font-serif text-2xl text-foreground">
                {locale === "bn" ? "অর্ডার সংক্ষেপ" : "Order Summary"}
              </h3>

              <div className="divide-y divide-border/70 max-h-80 overflow-y-auto pr-2">
                {items.map((it) => (
                  <div key={it.id} className="py-3 flex gap-3 items-center">
                    <img
                      src={it.product.images[0]}
                      alt={it.product.nameEn}
                      className="w-12 h-14 object-cover bg-muted flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-serif text-sm text-foreground truncate">
                        {locale === "bn" ? it.product.nameBn : it.product.nameEn}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {it.quantity} × {it.selectedWeight} {it.selectedUnit}
                      </p>
                    </div>
                    <span className="font-serif text-sm text-foreground font-medium">
                      {formatPrice(it.unitPrice * it.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="space-y-2 text-xs border-t border-border pt-4 text-muted-foreground">
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
                  <span>{locale === "bn" ? "ডেলিভারি" : "Delivery"}</span>
                  <span className="text-foreground font-medium">
                    {deliveryFee === 0 ? (locale === "bn" ? "ফ্রি" : "Complimentary") : formatPrice(deliveryFee)}
                  </span>
                </div>
                <div className="flex justify-between text-xl font-serif text-foreground pt-4 border-t border-border font-medium">
                  <span>{locale === "bn" ? "সর্বমোট" : "Total"}</span>
                  <span>{formatPrice(grandTotal)}</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}
