"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import confetti from "canvas-confetti";
import {
  MapPin, Clock, CreditCard, CheckCircle2, Truck, ShieldCheck,
  Store, ArrowLeft, Sparkles, ShoppingBag, Lock, Check, ChevronRight,
  Sun, Sunset, Sunrise, AlertCircle, Phone, ArrowRight, Zap, RefreshCw, X
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useCartStore } from "@/lib/cart-store";
import { submitOrder } from "@/lib/api-client";
import { TrafficQueueGate } from "@/components/checkout/TrafficQueueGate";

export default function CheckoutPage() {
  const router = useRouter();
  const { locale, t, formatPrice } = useLanguage();
  const {
    items,
    getSubtotal,
    getDiscountAmount,
    getDeliveryFee,
    getGrandTotal,
    getVendorGroups,
    clearCart,
  } = useCartStore();

  // Checkout Form State
  const [formData, setFormData] = useState({
    fullName: "রাফিক আহমেদ",
    phone: "01700000002",
    email: "customer@example.com",
    division: "ঢাকা (Dhaka)",
    district: "ঢাকা (Dhaka)",
    area: "ধানমন্ডি (Dhanmondi)",
    address: "বাড়ি ২৭, রোড ৮/এ, ফ্ল্যাট ৪বি, ধানমন্ডি আ/এ",
    landmark: "ইবনে সিনা হাসপাতালের বিপরীতে",
    note: "মাছ ও শাকসবজি যেন আলাদা থার্মাল ব্যাগে প্যাকেজিং করা থাকে।",
  });

  const [deliverySlot, setDeliverySlot] = useState<string>("morning");
  const [paymentMethod, setPaymentMethod] = useState<"BKASH" | "NAGAD" | "SSLCOMMERZ" | "COD">("BKASH");
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<any | null>(null);

  // bKash / Nagad Interactive Sandbox Modal
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showQueueGate, setShowQueueGate]       = useState(false);
  const [modalStep, setModalStep] = useState<"PHONE" | "OTP" | "PIN">("PHONE");
  const [walletPhone, setWalletPhone] = useState("01700000002");
  const [walletOtp, setWalletOtp] = useState("123456");
  const [walletPin, setWalletPin] = useState("12121");
  const [pendingOrderNo, setPendingOrderNo] = useState("");

  const subtotal = getSubtotal();
  const discount = getDiscountAmount();
  const deliveryFee = getDeliveryFee();
  const grandTotal = getGrandTotal();
  const vendorGroups = getVendorGroups();

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;
    setShowQueueGate(true);
  };

  const executeOrderPlacement = async () => {
    setShowQueueGate(false);
    setIsProcessing(true);

    try {
      const slotMap: Record<string, string> = {
        morning: "তাজা সকাল (০৭:০০ - ০৯:০০)",
        midday: "দুপুর এক্সপ্রেস (১২:০০ - ১৪:০০)",
        evening: "সন্ধ্যা স্লট (১৮:০০ - ২০:৩০)",
      };

      const result = await submitOrder({
        customerName: formData.fullName,
        customerPhone: formData.phone,
        customerEmail: formData.email,
        customerAddress: `${formData.address}${formData.landmark ? ` (${formData.landmark})` : ""}`,
        deliveryArea: formData.area,
        deliverySlot: slotMap[deliverySlot] || "Standard Delivery",
        paymentMethod,
        items: items.map(it => ({
          productId: it.product.id,
          name: it.product.nameBn || it.product.nameEn,
          price: it.totalPrice,
          quantity: it.quantity,
          unit: it.selectedUnit,
          vendorId: it.product.vendorId || "default-vendor",
        })),
        totalAmount: grandTotal,
        deliveryFee,
        discount,
        internalNotes: formData.note,
      });

      setIsProcessing(false);
      const generatedOrderNo = result.data?.orderNumber || `TB-${Math.floor(100000 + Math.random() * 900000)}`;

      if (paymentMethod === "SSLCOMMERZ") {
        try {
          const sslRes = await fetch("http://localhost:4000/api/payment/sslcommerz/init", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              amount: grandTotal,
              orderNumber: generatedOrderNo,
              customerName: formData.fullName,
              customerPhone: formData.phone,
              customerEmail: formData.email,
              customerAddress: formData.address,
            }),
          });
          const sslData = await sslRes.json();
          if (sslData.gatewayUrl) {
            window.location.href = sslData.gatewayUrl;
            return;
          }
        } catch (err) {
          console.warn("SSLCommerz redirect error:", err);
        }
      }

      if (paymentMethod === "BKASH" || paymentMethod === "NAGAD") {
        setPendingOrderNo(generatedOrderNo);
        setModalStep("PHONE");
        setShowPaymentModal(true);
        return;
      }

      setOrderSuccess({
        orderNumber: generatedOrderNo,
        date: new Date().toLocaleDateString(locale === "bn" ? "bn-BD" : "en-US", {
          day: "numeric",
          month: "long",
          year: "numeric",
        }),
        total: grandTotal,
        paymentMethod,
        slot: slotMap[deliverySlot] || deliverySlot,
        address: formData.address,
      });

      try {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
        });
      } catch (err) {}

      clearCart();
    } catch (err) {
      setIsProcessing(false);
    }
  };

  const handleExecutePayment = async () => {
    setIsProcessing(true);
    try {
      await fetch("http://localhost:4000/api/payment/bkash/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentID: `BKASH_${Date.now()}`,
          orderNumber: pendingOrderNo,
        }),
      });
    } catch (e) {
      console.warn("bKash execute error:", e);
    }

    setIsProcessing(false);
    setShowPaymentModal(false);

    const slotMap: Record<string, string> = {
      morning: "তাজা সকাল (০৭:০০ - ০৯:০০)",
      midday: "দুপুর এক্সপ্রেস (১২:০০ - ১৪:০০)",
      evening: "সন্ধ্যা স্লট (১৮:০০ - ২০:৩০)",
    };

    setOrderSuccess({
      orderNumber: pendingOrderNo,
      date: new Date().toLocaleDateString(locale === "bn" ? "bn-BD" : "en-US", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
      total: grandTotal,
      paymentMethod,
      slot: slotMap[deliverySlot] || deliverySlot,
      address: formData.address,
    });

    try {
      confetti({
        particleCount: 150,
        spread: 90,
        origin: { y: 0.6 },
      });
    } catch (err) {}

    clearCart();
  };

  // ── Success View ──
  if (orderSuccess) {
    return (
      <div style={{ padding: "60px 0", minHeight: "80vh", display: "flex", alignItems: "center" }}>
        <div className="container" style={{ maxWidth: "620px" }}>
          <div
            style={{
              background: "rgba(14, 17, 23, 0.95)",
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
              borderRadius: "var(--radius-2xl)",
              padding: "48px 36px",
              textAlign: "center",
              border: "1px solid rgba(16, 216, 118, 0.3)",
              boxShadow: "var(--shadow-2xl), 0 0 80px rgba(16, 216, 118, 0.15)",
              animation: "scaleIn 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Top Neon Accent */}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: "2px",
                background: "linear-gradient(90deg, #10D876, #F5C842, #10D876)",
              }}
            />

            <div
              style={{
                width: "80px",
                height: "80px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, rgba(16,216,118,0.25), rgba(5,158,87,0.1))",
                border: "1px solid rgba(16, 216, 118, 0.4)",
                color: "var(--emerald)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 24px",
                boxShadow: "0 0 40px rgba(16, 216, 118, 0.4)",
              }}
            >
              <CheckCircle2 size={46} strokeWidth={2.5} />
            </div>

            <h1
              style={{
                fontSize: "1.8rem",
                fontWeight: 900,
                color: "var(--text-main)",
                marginBottom: "8px",
                letterSpacing: "-0.04em",
                fontFamily: "var(--font-heading)",
              }}
            >
              {locale === "bn" ? "অর্ডার সফলভাবে সম্পন্ন হয়েছে!" : "Order Confirmed Successfully!"}
            </h1>

            <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", marginBottom: "28px", lineHeight: 1.6 }}>
              {locale === "bn"
                ? "ধন্যবাদ! আপনার তাজা বাজার অর্ডারটি আমাদের হাব প্রসেসিং টিমে পাঠানো হয়েছে।"
                : "Thank you! Your farm-fresh basket has been queued for immediate express packing."}
            </p>

            {/* Order Receipt Card */}
            <div
              style={{
                background: "rgba(255, 255, 255, 0.03)",
                borderRadius: "var(--radius-xl)",
                padding: "20px 24px",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                marginBottom: "32px",
                textAlign: "left",
                display: "flex",
                flexDirection: "column",
                gap: "12px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: "var(--text-muted)", fontSize: "0.82rem" }}>
                  {locale === "bn" ? "অর্ডার আইডি" : "Order ID"}
                </span>
                <span
                  style={{
                    fontFamily: "var(--font-heading)",
                    fontWeight: 900,
                    color: "var(--emerald)",
                    fontSize: "1rem",
                  }}
                >
                  {orderSuccess.orderNumber}
                </span>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: "var(--text-muted)", fontSize: "0.82rem" }}>
                  {locale === "bn" ? "ডেলিভারি স্লট" : "Delivery Slot"}
                </span>
                <span style={{ fontWeight: 700, color: "var(--text-main)", fontSize: "0.88rem" }}>
                  {orderSuccess.slot}
                </span>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: "var(--text-muted)", fontSize: "0.82rem" }}>
                  {locale === "bn" ? "মোট পরিশোধিত" : "Total Amount"}
                </span>
                <span
                  style={{
                    fontWeight: 900,
                    fontSize: "1.1rem",
                    color: "var(--text-main)",
                  }}
                >
                  <span className="gradient-text-emerald">{formatPrice(orderSuccess.total)}</span>
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
              <Link
                href={`/track?order=${orderSuccess.orderNumber}`}
                className="btn-primary"
                style={{ padding: "14px 28px", fontSize: "0.95rem", fontWeight: 800 }}
              >
                <Truck size={18} />
                <span>{locale === "bn" ? "লাইভ অর্ডার ট্র্যাক করুন" : "Track Live Delivery"}</span>
              </Link>
              <Link
                href="/"
                className="btn-secondary"
                style={{ padding: "14px 24px", fontSize: "0.95rem", fontWeight: 700 }}
              >
                <span>{locale === "bn" ? "হোমপেজে ফিরে যান" : "Back to Home"}</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Main Checkout Form View ──
  return (
    <>
      <div style={{ padding: "32px 0 80px" }}>
        <div className="container">

          {/* Header Strip */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "32px",
              flexWrap: "wrap",
              gap: "16px",
            }}
          >
            <div>
              <Link
                href="/cart"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "0.82rem",
                  color: "var(--emerald)",
                  fontWeight: 700,
                  marginBottom: "8px",
                }}
              >
                <ArrowLeft size={14} />
                <span>{locale === "bn" ? "কার্টে ফিরে যান" : "Return to Cart"}</span>
              </Link>
              <h1
                style={{
                  fontSize: "clamp(1.6rem, 3vw, 2.2rem)",
                  fontWeight: 900,
                  color: "var(--text-main)",
                  letterSpacing: "-0.04em",
                  fontFamily: "var(--font-heading)",
                }}
              >
                {locale === "bn" ? "নিরাপদ চেকআউট" : "Express Secure Checkout"}
              </h1>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "8px 16px",
                borderRadius: "var(--radius-full)",
                background: "rgba(16, 216, 118, 0.08)",
                border: "1px solid rgba(16, 216, 118, 0.2)",
                color: "var(--emerald)",
                fontSize: "0.8rem",
                fontWeight: 700,
              }}
            >
              <Lock size={14} />
              <span>256-Bit SSL Encrypted Purchase</span>
            </div>
          </div>

          {items.length === 0 ? (
            <div
              style={{
                background: "rgba(14, 17, 23, 0.95)",
                borderRadius: "var(--radius-2xl)",
                padding: "60px 20px",
                textAlign: "center",
                border: "1px solid rgba(255, 255, 255, 0.08)",
              }}
            >
              <ShoppingBag size={48} color="var(--emerald)" style={{ margin: "0 auto 16px" }} />
              <h2 style={{ fontSize: "1.4rem", fontWeight: 800, color: "var(--text-main)", marginBottom: "8px" }}>
                {t.emptyCart || (locale === "bn" ? "আপনার কার্ট খালি" : "Your cart is empty")}
              </h2>
              <p style={{ color: "var(--text-muted)", marginBottom: "24px", fontSize: "0.9rem" }}>
                {locale === "bn" ? "চেকআউট করতে প্রথমে তাজা পণ্য কার্টে যোগ করুন।" : "Please add fresh items before proceeding to checkout."}
              </p>
              <Link href="/" className="btn-primary" style={{ padding: "12px 28px" }}>
                {t.startShopping}
              </Link>
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
                gap: "36px",
                alignItems: "flex-start",
              }}
            >
              {/* ── Left Column: Checkout Inputs ── */}
              <form onSubmit={handlePlaceOrder} style={{ display: "flex", flexDirection: "column", gap: "28px" }}>

                {/* Section 1: Shipping Address */}
                <div
                  style={{
                    background: "rgba(14, 17, 23, 0.95)",
                    borderRadius: "var(--radius-2xl)",
                    padding: "28px",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    boxShadow: "var(--shadow-lg)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      marginBottom: "20px",
                      paddingBottom: "14px",
                      borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
                    }}
                  >
                    <div
                      style={{
                        width: "36px",
                        height: "36px",
                        borderRadius: "10px",
                        background: "rgba(16, 216, 118, 0.15)",
                        color: "var(--emerald)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <MapPin size={18} />
                    </div>
                    <div>
                      <h2 style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--text-main)", fontFamily: "var(--font-heading)" }}>
                        ১. {locale === "bn" ? "ডেলিভারি ঠিকানা ও তথ্য" : "Delivery Address & Contact"}
                      </h2>
                      <span style={{ fontSize: "0.74rem", color: "var(--text-muted)" }}>
                        {locale === "bn" ? "রাইডারের জন্য সঠিক ঠিকানা দিন" : "Enter accurate delivery details"}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "var(--text-body)", marginBottom: "6px" }}>
                        {locale === "bn" ? "পূর্ণ নাম *" : "Full Name *"}
                      </label>
                      <input
                        type="text"
                        required
                        className="input-premium"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      />
                    </div>

                    <div>
                      <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "var(--text-body)", marginBottom: "6px" }}>
                        {locale === "bn" ? "মোবাইল নম্বর *" : "Mobile Number *"}
                      </label>
                      <input
                        type="tel"
                        required
                        className="input-premium"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      />
                    </div>

                    <div>
                      <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "var(--text-body)", marginBottom: "6px" }}>
                        {locale === "bn" ? "ডেলিভারি এলাকা *" : "Delivery Area *"}
                      </label>
                      <input
                        type="text"
                        required
                        className="input-premium"
                        value={formData.area}
                        onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                      />
                    </div>

                    <div>
                      <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "var(--text-body)", marginBottom: "6px" }}>
                        {locale === "bn" ? "নিকটবর্তী ল্যান্ডমার্ক" : "Nearby Landmark"}
                      </label>
                      <input
                        type="text"
                        className="input-premium"
                        value={formData.landmark}
                        placeholder={locale === "bn" ? "যেমন: মসজিদের পাশে" : "e.g. Near Mosque"}
                        onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
                      />
                    </div>

                    <div style={{ gridColumn: "1 / -1" }}>
                      <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "var(--text-body)", marginBottom: "6px" }}>
                        {locale === "bn" ? "বাসা ও সড়কের পূর্ণ বিবরণ *" : "Full Street Address *"}
                      </label>
                      <input
                        type="text"
                        required
                        className="input-premium"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      />
                    </div>

                    <div style={{ gridColumn: "1 / -1" }}>
                      <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "var(--text-body)", marginBottom: "6px" }}>
                        {locale === "bn" ? "বিশেষ ডেলিভারি নির্দেশিকা / প্যাকেজিং নোট" : "Special Packaging / Rider Instructions"}
                      </label>
                      <input
                        type="text"
                        className="input-premium"
                        value={formData.note}
                        placeholder={locale === "bn" ? "মাছ যেন ড্রাম প্যাকেজিং করা থাকে..." : "Pack fish in insulated box..."}
                        onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                {/* Section 2: Delivery Slot Selection */}
                <div
                  style={{
                    background: "rgba(14, 17, 23, 0.95)",
                    borderRadius: "var(--radius-2xl)",
                    padding: "28px",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    boxShadow: "var(--shadow-lg)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      marginBottom: "20px",
                      paddingBottom: "14px",
                      borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
                    }}
                  >
                    <div
                      style={{
                        width: "36px",
                        height: "36px",
                        borderRadius: "10px",
                        background: "rgba(245, 200, 66, 0.15)",
                        color: "var(--gold)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Clock size={18} />
                    </div>
                    <div>
                      <h2 style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--text-main)", fontFamily: "var(--font-heading)" }}>
                        ২. {locale === "bn" ? "ডেলিভারির সময় ও স্লট" : "Freshness Express Delivery Slot"}
                      </h2>
                      <span style={{ fontSize: "0.74rem", color: "var(--text-muted)" }}>
                        {locale === "bn" ? "আপনার সুবিধাজনক সময় নির্বাচন করুন" : "Select your preferred delivery time"}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px" }}>
                    {[
                      { id: "morning", icon: Sunrise, titleBn: "তাজা সকাল", titleEn: "Fresh Morning", time: "০৭:০০ - ০৯:০০", tagBn: "সর্বাধিক তাজা", tagEn: "Peak Fresh" },
                      { id: "midday",  icon: Sun,     titleBn: "দুপুর এক্সপ্রেস", titleEn: "Midday Express", time: "১২:০০ - ১৪:০০", tagBn: "রান্নার আগে", tagEn: "Pre-Lunch" },
                      { id: "evening", icon: Sunset,  titleBn: "সন্ধ্যা স্লট", titleEn: "Evening Slot", time: "১৮:০০ - ২০:৩০", tagBn: "অফিসের পর", tagEn: "After Work" },
                    ].map((slot) => {
                      const Icon = slot.icon;
                      const isSelected = deliverySlot === slot.id;
                      return (
                        <button
                          key={slot.id}
                          type="button"
                          onClick={() => setDeliverySlot(slot.id)}
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            padding: "16px",
                            borderRadius: "var(--radius-lg)",
                            background: isSelected ? "rgba(16, 216, 118, 0.12)" : "rgba(255, 255, 255, 0.03)",
                            border: isSelected ? "1.5px solid var(--emerald)" : "1px solid rgba(255, 255, 255, 0.08)",
                            textAlign: "left",
                            cursor: "pointer",
                            transition: "all var(--t-fast)",
                            boxShadow: isSelected ? "0 4px 20px rgba(16,216,118,0.25)" : "none",
                            transform: isSelected ? "translateY(-2px)" : "translateY(0)",
                          }}
                        >
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                            <Icon size={20} color={isSelected ? "var(--emerald)" : "var(--text-muted)"} />
                            <span
                              style={{
                                fontSize: "0.65rem",
                                fontWeight: 800,
                                padding: "2px 7px",
                                borderRadius: "999px",
                                background: isSelected ? "rgba(16,216,118,0.2)" : "rgba(255,255,255,0.06)",
                                color: isSelected ? "var(--emerald)" : "var(--text-muted)",
                              }}
                            >
                              {locale === "bn" ? slot.tagBn : slot.tagEn}
                            </span>
                          </div>
                          <div style={{ fontWeight: 800, color: "var(--text-main)", fontSize: "0.92rem", fontFamily: "var(--font-heading)" }}>
                            {locale === "bn" ? slot.titleBn : slot.titleEn}
                          </div>
                          <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: "2px" }}>
                            {slot.time}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Section 3: Payment Method Selection */}
                <div
                  style={{
                    background: "rgba(14, 17, 23, 0.95)",
                    borderRadius: "var(--radius-2xl)",
                    padding: "28px",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    boxShadow: "var(--shadow-lg)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      marginBottom: "20px",
                      paddingBottom: "14px",
                      borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
                    }}
                  >
                    <div
                      style={{
                        width: "36px",
                        height: "36px",
                        borderRadius: "10px",
                        background: "rgba(79, 158, 255, 0.15)",
                        color: "var(--sapphire)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <CreditCard size={18} />
                    </div>
                    <div>
                      <h2 style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--text-main)", fontFamily: "var(--font-heading)" }}>
                        ৩. {locale === "bn" ? "পেমেন্ট মাধ্যম নির্বাচন" : "Payment Method"}
                      </h2>
                      <span style={{ fontSize: "0.74rem", color: "var(--text-muted)" }}>
                        {locale === "bn" ? "১০০% নিরাপদ ও ইনস্ট্যান্ট গেটওয়ে" : "Instant verification & cash on delivery"}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px" }}>
                    {[
                      { id: "BKASH", name: "bKash", color: "#E2136E", subBn: "ইনস্ট্যান্ট ওটিপি গেটওয়ে", subEn: "Instant OTP sandbox" },
                      { id: "NAGAD", name: "Nagad", color: "#F7941D", subBn: "ডাক বিভাগ ডিজিটাল ওয়ালেট", subEn: "Postal wallet checkout" },
                      { id: "SSLCOMMERZ", name: "Cards / NetBanking", color: "#1A1F71", subBn: "VISA, Mastercard, Amex", subEn: "VISA, Mastercard, Amex" },
                      { id: "COD", name: "Cash on Delivery", color: "#10D876", subBn: "পণ্য হাতে পেয়ে টাকা দিন", subEn: "Pay upon receiving basket" },
                    ].map((m) => {
                      const isSelected = paymentMethod === m.id;
                      return (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => setPaymentMethod(m.id as any)}
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            padding: "16px",
                            borderRadius: "var(--radius-lg)",
                            background: isSelected ? "rgba(16, 216, 118, 0.1)" : "rgba(255, 255, 255, 0.03)",
                            border: isSelected ? "1.5px solid var(--emerald)" : "1px solid rgba(255, 255, 255, 0.08)",
                            textAlign: "left",
                            cursor: "pointer",
                            transition: "all var(--t-fast)",
                            boxShadow: isSelected ? "0 4px 20px rgba(16,216,118,0.25)" : "none",
                            transform: isSelected ? "translateY(-2px)" : "translateY(0)",
                          }}
                        >
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                            <span
                              style={{
                                padding: "4px 10px",
                                borderRadius: "6px",
                                background: m.color,
                                color: "#FFF",
                                fontSize: "0.75rem",
                                fontWeight: 900,
                              }}
                            >
                              {m.name}
                            </span>
                            {isSelected && <CheckCircle2 size={16} color="var(--emerald)" />}
                          </div>
                          <div style={{ fontSize: "0.74rem", color: "var(--text-muted)", marginTop: "4px" }}>
                            {locale === "bn" ? m.subBn : m.subEn}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Submit Action Button for Mobile / Inline */}
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="btn-primary"
                  style={{
                    padding: "18px 28px",
                    fontSize: "1.05rem",
                    fontWeight: 900,
                    boxShadow: "0 8px 32px rgba(16,216,118,0.5)",
                  }}
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw size={20} className="animate-spin" />
                      <span>{locale === "bn" ? "অর্ডার প্রসেসিং হচ্ছে..." : "Processing Order..."}</span>
                    </>
                  ) : (
                    <>
                      <Lock size={18} />
                      <span>{locale === "bn" ? "অর্ডার কনফার্ম করুন" : "Confirm & Place Order"} • {formatPrice(grandTotal)}</span>
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </form>

              {/* ── Right Column: Sticky Order Summary & Vendor Breakdown ── */}
              <div
                style={{
                  position: "sticky",
                  top: "100px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "20px",
                }}
              >
                <div
                  style={{
                    background: "rgba(14, 17, 23, 0.95)",
                    backdropFilter: "blur(24px)",
                    WebkitBackdropFilter: "blur(24px)",
                    borderRadius: "var(--radius-2xl)",
                    padding: "28px",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    boxShadow: "var(--shadow-xl)",
                  }}
                >
                  <h3
                    style={{
                      fontSize: "1.15rem",
                      fontWeight: 800,
                      color: "var(--text-main)",
                      marginBottom: "16px",
                      paddingBottom: "12px",
                      borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
                      fontFamily: "var(--font-heading)",
                    }}
                  >
                    {locale === "bn" ? "অর্ডার সামারি" : "Order Basket Summary"}
                  </h3>

                  {/* Items List Preview */}
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "12px",
                      maxHeight: "260px",
                      overflowY: "auto",
                      paddingRight: "4px",
                      marginBottom: "20px",
                    }}
                  >
                    {items.map((item) => (
                      <div
                        key={item.id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                          background: "rgba(255, 255, 255, 0.02)",
                          padding: "10px 12px",
                          borderRadius: "var(--radius-md)",
                          border: "1px solid rgba(255, 255, 255, 0.04)",
                        }}
                      >
                        <img
                          src={item.product.images[0]}
                          alt=""
                          style={{ width: "44px", height: "44px", borderRadius: "6px", objectFit: "cover" }}
                        />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div
                            style={{
                              fontSize: "0.84rem",
                              fontWeight: 700,
                              color: "var(--text-main)",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {locale === "bn" ? item.product.nameBn : item.product.nameEn}
                          </div>
                          <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: "2px" }}>
                            {item.selectedWeight} {item.selectedUnit} × {item.quantity}
                          </div>
                        </div>
                        <div style={{ fontSize: "0.88rem", fontWeight: 800, color: "var(--emerald)" }}>
                          {formatPrice(item.totalPrice)}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Calculations */}
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "8px",
                      fontSize: "0.85rem",
                      paddingTop: "14px",
                      borderTop: "1px solid rgba(255, 255, 255, 0.06)",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-muted)" }}>
                      <span>{t.subtotal}</span>
                      <span style={{ fontWeight: 600, color: "var(--text-body)" }}>{formatPrice(subtotal)}</span>
                    </div>

                    {discount > 0 && (
                      <div style={{ display: "flex", justifyContent: "space-between", color: "var(--emerald)" }}>
                        <span>{t.discount}</span>
                        <span style={{ fontWeight: 700 }}>-{formatPrice(discount)}</span>
                      </div>
                    )}

                    <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-muted)" }}>
                      <span>{t.deliveryFee}</span>
                      <span style={{ fontWeight: 600, color: deliveryFee === 0 ? "var(--emerald)" : "var(--text-body)" }}>
                        {deliveryFee === 0 ? t.freeDelivery : formatPrice(deliveryFee)}
                      </span>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: "1.2rem",
                        fontWeight: 900,
                        color: "var(--text-main)",
                        paddingTop: "10px",
                        marginTop: "4px",
                        borderTop: "1px dashed rgba(255, 255, 255, 0.1)",
                        fontFamily: "var(--font-heading)",
                      }}
                    >
                      <span>{t.grandTotal}</span>
                      <span className="gradient-text-emerald">{formatPrice(grandTotal)}</span>
                    </div>
                  </div>
                </div>

                {/* Trust Guarantee Card */}
                <div
                  style={{
                    background: "rgba(16, 216, 118, 0.05)",
                    borderRadius: "var(--radius-xl)",
                    padding: "16px 20px",
                    border: "1px solid rgba(16, 216, 118, 0.15)",
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                  }}
                >
                  <ShieldCheck size={28} color="var(--emerald)" style={{ flexShrink: 0 }} />
                  <div style={{ fontSize: "0.78rem", color: "var(--text-body)", lineHeight: 1.5 }}>
                    <strong>১০০% তাজা পণ্য নিশ্চয়তা:</strong> ডেলিভারির সময় পণ্য দেখে পছন্দ না হলে তাৎক্ষণিক রিটার্ন ও রিফান্ড সুবিধা।
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Traffic Queue Gate */}
      <TrafficQueueGate isOpen={showQueueGate} onAdmit={executeOrderPlacement} />

      {/* ── bKash / Nagad Interactive Sandbox Modal ── */}
      {showPaymentModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 10000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
        >
          <div
            onClick={() => setShowPaymentModal(false)}
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(0, 0, 0, 0.8)",
              backdropFilter: "blur(12px)",
            }}
          />

          <div
            style={{
              position: "relative",
              width: "100%",
              maxWidth: "420px",
              background: "#0F131A",
              borderRadius: "var(--radius-2xl)",
              padding: "32px",
              boxShadow: "var(--shadow-2xl), 0 0 60px rgba(226, 19, 110, 0.2)",
              border: `1.5px solid ${paymentMethod === "BKASH" ? "#E2136E" : "#F7941D"}`,
              animation: "scaleIn 0.3s var(--ease-out)",
              zIndex: 10001,
            }}
          >
            {/* Modal Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <div
                style={{
                  padding: "4px 12px",
                  borderRadius: "6px",
                  background: paymentMethod === "BKASH" ? "#E2136E" : "#F7941D",
                  color: "#FFF",
                  fontWeight: 900,
                  fontSize: "0.85rem",
                }}
              >
                {paymentMethod === "BKASH" ? "bKash Checkout" : "Nagad Payment"}
              </div>

              <button
                type="button"
                onClick={() => setShowPaymentModal(false)}
                style={{
                  color: "var(--text-muted)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ textAlign: "center", marginBottom: "24px" }}>
              <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", textTransform: "uppercase" }}>
                {locale === "bn" ? "পরিশোধের মোট পরিমাণ" : "Payable Amount"}
              </div>
              <div style={{ fontSize: "1.8rem", fontWeight: 900, color: "var(--text-main)", marginTop: "4px" }}>
                {formatPrice(grandTotal)}
              </div>
            </div>

            {/* Step 1: Wallet Phone */}
            {modalStep === "PHONE" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "var(--text-body)", marginBottom: "6px" }}>
                    {paymentMethod === "BKASH" ? "bKash Account Number" : "Nagad Wallet Number"}
                  </label>
                  <input
                    type="tel"
                    className="input-premium"
                    value={walletPhone}
                    onChange={(e) => setWalletPhone(e.target.value)}
                    placeholder="01XXXXXXXXX"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => setModalStep("OTP")}
                  style={{
                    padding: "12px",
                    borderRadius: "var(--radius-md)",
                    background: paymentMethod === "BKASH" ? "#E2136E" : "#F7941D",
                    color: "#FFF",
                    fontWeight: 800,
                    fontSize: "0.92rem",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  Send OTP Code
                </button>
              </div>
            )}

            {/* Step 2: OTP */}
            {modalStep === "OTP" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "var(--text-body)", marginBottom: "6px" }}>
                    Verification Code (OTP) Sent to {walletPhone}
                  </label>
                  <input
                    type="text"
                    className="input-premium"
                    value={walletOtp}
                    onChange={(e) => setWalletOtp(e.target.value)}
                    placeholder="123456"
                    style={{ textAlign: "center", fontSize: "1.2rem", letterSpacing: "0.2em", fontWeight: 900 }}
                  />
                </div>

                <button
                  type="button"
                  onClick={() => setModalStep("PIN")}
                  style={{
                    padding: "12px",
                    borderRadius: "var(--radius-md)",
                    background: paymentMethod === "BKASH" ? "#E2136E" : "#F7941D",
                    color: "#FFF",
                    fontWeight: 800,
                    fontSize: "0.92rem",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  Verify Code
                </button>
              </div>
            )}

            {/* Step 3: PIN */}
            {modalStep === "PIN" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "var(--text-body)", marginBottom: "6px" }}>
                    Enter Wallet PIN
                  </label>
                  <input
                    type="password"
                    maxLength={5}
                    className="input-premium"
                    value={walletPin}
                    onChange={(e) => setWalletPin(e.target.value)}
                    placeholder="•••••"
                    style={{ textAlign: "center", fontSize: "1.4rem", letterSpacing: "0.3em", fontWeight: 900 }}
                  />
                </div>

                <button
                  type="button"
                  onClick={handleExecutePayment}
                  disabled={isProcessing}
                  style={{
                    padding: "14px",
                    borderRadius: "var(--radius-md)",
                    background: paymentMethod === "BKASH" ? "#E2136E" : "#F7941D",
                    color: "#FFF",
                    fontWeight: 800,
                    fontSize: "1rem",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  {isProcessing ? "Processing..." : `Confirm Payment • ${formatPrice(grandTotal)}`}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
