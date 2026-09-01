"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import confetti from "canvas-confetti";
import {
  Check, ChevronRight, ShieldCheck, Lock, ArrowRight,
  Truck, Clock, Sparkles, MapPin, Phone, User, Mail,
  CreditCard, Smartphone, DollarSign, CheckCircle2,
  AlertTriangle, RefreshCw, X
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useCartStore } from "@/lib/cart-store";
import { submitOrder } from "@/lib/api-client";
import styles from "./page.module.css";

type CheckoutStep = "details" | "payment" | "complete";

export default function CheckoutPage() {
  const router = useRouter();
  const { locale, formatPrice } = useLanguage();
  const {
    items,
    getSubtotal,
    getDiscountAmount,
    getDeliveryFee,
    getGrandTotal,
    clearCart,
    applyCoupon,
  } = useCartStore();

  // Current Multi-Step State
  const [currentStep, setCurrentStep] = useState<CheckoutStep>("details");
  const [isProcessing, setIsProcessing] = useState(false);
  const [couponInput, setCouponInput] = useState("");
  const [couponMessage, setCouponMessage] = useState<string | null>(null);

  // Form State (Step 1)
  const [formData, setFormData] = useState({
    fullName: "রাফিক আহমেদ",
    phone: "01712-345678",
    altPhone: "01819-876543",
    email: "rafiq.ahmed@example.com",
    city: "Dhaka",
    area: "ধানমন্ডি (Dhanmondi)",
    address: "বাড়ি ৪২, রোড ৭/এ, ফ্ল্যাট ৩বি, ধানমন্ডি আ/এ",
    landmark: "ইবনে সিনা হাসপাতালের বিপরীতে",
    deliverySlot: "morning", // morning | afternoon | evening
    specialNote: "মাছ ও শাকসবজি যেন আলাদা থার্মাল ব্যাগে প্যাকেজিং করা থাকে।",
  });

  // Payment State (Step 2)
  const [paymentMethod, setPaymentMethod] = useState<"BKASH" | "NAGAD" | "SSLCOMMERZ" | "COD">("BKASH");
  const [agreeTerms, setAgreeTerms] = useState(true);

  // Bot & Child Security Lock State
  const [isSlideUnlocked, setIsSlideUnlocked] = useState(false);
  const [mathAnswer, setMathAnswer] = useState("");
  const [mathProblem] = useState({ num1: 4, num2: 3, answer: 7 });
  const [securityVerified, setSecurityVerified] = useState(false);
  const [securityError, setSecurityError] = useState<string | null>(null);

  // Order Complete Receipt
  const [placedOrder, setPlacedOrder] = useState<any | null>(null);

  const subtotal = getSubtotal();
  const discount = getDiscountAmount();
  const deliveryFee = getDeliveryFee();
  const grandTotal = getGrandTotal();

  useEffect(() => {
    if (parseInt(mathAnswer.trim(), 10) === mathProblem.answer) {
      setSecurityVerified(true);
      setSecurityError(null);
    } else if (mathAnswer.trim().length > 0) {
      setSecurityVerified(false);
    }
  }, [mathAnswer, mathProblem.answer]);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    const res = applyCoupon(couponInput.trim());
    setCouponMessage(res.message);
  };

  const handleDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.phone || !formData.address) {
      alert("অনুগ্রহ করে আপনার নাম, ফোন নম্বর এবং সম্পূর্ণ ঠিকানা পূরণ করুন।");
      return;
    }
    setCurrentStep("payment");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSlideToggle = () => {
    setIsSlideUnlocked(true);
    setSecurityVerified(true);
    setSecurityError(null);
  };

  const handleFinalOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isSlideUnlocked && !securityVerified) {
      setSecurityError("অর্ডার নিশ্চিত করতে স্লাইড করুন অথবা নিরাপত্তা প্রশ্নের সঠিক উত্তর দিন।");
      return;
    }

    if (!agreeTerms) {
      alert("অনুগ্রহ করে টার্মস ও কন্ডিশনস সম্মতি দিন।");
      return;
    }

    setIsProcessing(true);

    try {
      const orderPayload = {
        customerName: formData.fullName,
        customerPhone: formData.phone,
        customerEmail: formData.email,
        customerAddress: `${formData.address}${formData.landmark ? ` (${formData.landmark})` : ""}`,
        deliveryArea: formData.area,
        deliverySlot: formData.deliverySlot === "morning"
          ? "সকাল (০৭:০০ - ০৯:৩০)"
          : formData.deliverySlot === "afternoon"
          ? "দুপুর (০১:০০ - ০৩:৩০)"
          : "সন্ধ্যা (০৬:৩০ - ০৯:০০)",
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
        internalNotes: formData.specialNote,
      };

      const result = await submitOrder(orderPayload);

      setPlacedOrder({
        orderNumber: result?.orderNumber || "TB-" + Math.floor(1000000 + Math.random() * 9000000),
        total: grandTotal,
        paymentMethod,
        deliverySlot: orderPayload.deliverySlot,
        date: new Date().toLocaleDateString("bn-BD"),
      });

      clearCart();
      setCurrentStep("complete");
      window.scrollTo({ top: 0, behavior: "smooth" });

      try {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
        });
      } catch (err) {
        // ignore
      }
    } catch (err) {
      alert("অর্ডার সম্পন্ন করতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className={styles.checkoutPage}>
      <div className={styles.container}>

        {/* ── Top Header ── */}
        <div className={styles.topNav}>
          <Link href="/" className={styles.brandLogo}>
            <div className={styles.brandLogoIcon}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <span>তাতকা বাজার 2.0</span>
          </Link>

          {currentStep !== "complete" && (
            <Link href="/cart" className={styles.cancelLink}>
              <X size={15} />
              <span>কার্টে ফিরে যান (Cancel)</span>
            </Link>
          )}
        </div>

        {/* ── Progress Stepper Bar ── */}
        {currentStep !== "complete" && (
          <div className={styles.stepperWrapper}>
            <div
              className={`${styles.stepItem} ${currentStep === "details" ? styles.stepItemActive : styles.stepItemCompleted}`}
              onClick={() => setCurrentStep("details")}
            >
              <div className={`${styles.stepCircle} ${currentStep === "details" ? styles.stepCircleActive : styles.stepCircleCompleted}`}>
                {currentStep === "payment" ? <Check size={14} /> : "1"}
              </div>
              <span>Personal details</span>
            </div>

            <div className={`${styles.stepLine} ${currentStep === "payment" ? styles.stepLineActive : ""}`} />

            <div className={`${styles.stepItem} ${currentStep === "payment" ? styles.stepItemActive : ""}`}>
              <div className={`${styles.stepCircle} ${currentStep === "payment" ? styles.stepCircleActive : ""}`}>
                2
              </div>
              <span>Payment</span>
            </div>

            <div className={styles.stepLine} />

            <div className={styles.stepItem}>
              <div className={styles.stepCircle}>
                3
              </div>
              <span>Complete</span>
            </div>
          </div>
        )}

        {/* ── Main Content Grid ── */}
        {currentStep !== "complete" ? (
          <div className={styles.layoutGrid}>

            {/* ── Left Column ── */}
            <div>
              {/* STAGE 1: PERSONAL DETAILS */}
              {currentStep === "details" && (
                <div className={styles.mainCard}>
                  <div className={styles.sectionHeader}>
                    <h2 className={styles.sectionTitle}>ব্যক্তিগত তথ্য ও ডেলিভারি ঠিকানা</h2>
                    <p className={styles.sectionSubtitle}>
                      আপনার তাজা বাজার নিরাপদে পৌঁছাতে নিচের তথ্যগুলো যাচাই করুন।
                    </p>
                  </div>

                  <form onSubmit={handleDetailsSubmit}>
                    <div className={styles.formGrid}>
                      
                      {/* Full Name */}
                      <div className={styles.inputGroup}>
                        <label className={styles.inputLabel}>
                          <span>গ্রাহকের পুরো নাম (Full Name) *</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.fullName}
                          onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                          className={styles.inputControl}
                        />
                      </div>

                      {/* Primary Phone */}
                      <div className={styles.inputGroup}>
                        <label className={styles.inputLabel}>
                          <span>প্রাইমারি মোবাইল নম্বর *</span>
                          <span style={{ fontSize: "0.7rem", color: "#10b981", fontWeight: 700 }}>ভেরিফাইড</span>
                        </label>
                        <input
                          type="tel"
                          required
                          value={formData.phone}
                          onChange={e => setFormData({ ...formData, phone: e.target.value })}
                          className={styles.inputControl}
                        />
                      </div>

                      {/* Alternate Phone */}
                      <div className={styles.inputGroup}>
                        <label className={styles.inputLabel}>
                          <span>বিকল্প ফোন নম্বর (ঐচ্ছিক)</span>
                        </label>
                        <input
                          type="tel"
                          placeholder="01XXXXXXXXX"
                          value={formData.altPhone}
                          onChange={e => setFormData({ ...formData, altPhone: e.target.value })}
                          className={styles.inputControl}
                        />
                      </div>

                      {/* Email */}
                      <div className={styles.inputGroup}>
                        <label className={styles.inputLabel}>
                          <span>ইমেইল এড্রেস</span>
                        </label>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={e => setFormData({ ...formData, email: e.target.value })}
                          className={styles.inputControl}
                        />
                      </div>

                      {/* Delivery Area */}
                      <div className={styles.inputGroup}>
                        <label className={styles.inputLabel}>
                          <span>শহর / এরিয়া *</span>
                        </label>
                        <select
                          value={formData.area}
                          onChange={e => setFormData({ ...formData, area: e.target.value })}
                          className={styles.inputControl}
                        >
                          <option value="ধানমন্ডি (Dhanmondi)">ধানমন্ডি (Dhanmondi, Dhaka)</option>
                          <option value="গুলশান (Gulshan)">গুলশান (Gulshan-1 & 2)</option>
                          <option value="বনানী (Banani)">বনানী (Banani, Dhaka)</option>
                          <option value="উত্তরা (Uttara)">উত্তরা (Uttara Sector 1-14)</option>
                          <option value="মিরপুর (Mirpur)">মিরপুর (Mirpur, Dhaka)</option>
                          <option value="মোহাম্মদপুর (Mohammadpur)">মোহাম্মদপুর (Mohammadpur)</option>
                        </select>
                      </div>

                      {/* Full Address */}
                      <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                        <label className={styles.inputLabel}>
                          <span>সম্পূর্ণ ডেলিভারি ঠিকানা (বাড়ি, রোড ও ফ্ল্যাট নম্বর) *</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.address}
                          onChange={e => setFormData({ ...formData, address: e.target.value })}
                          placeholder="House 12, Road 4, Flat B2"
                          className={styles.inputControl}
                        />
                      </div>

                      {/* Delivery Slot */}
                      <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                        <label className={styles.inputLabel}>
                          <span>পছন্দের ডেলিভারি সময় নির্বাচন করুন *</span>
                        </label>
                        <div className={styles.slotGrid}>
                          <div
                            className={`${styles.slotCard} ${formData.deliverySlot === "morning" ? styles.slotCardActive : ""}`}
                            onClick={() => setFormData({ ...formData, deliverySlot: "morning" })}
                          >
                            <span className={styles.slotTitle}>🌅 তাজা সকাল (Morning)</span>
                            <span className={styles.slotTime}>সকাল ০৭:০০ - ০৯:৩০</span>
                          </div>

                          <div
                            className={`${styles.slotCard} ${formData.deliverySlot === "afternoon" ? styles.slotCardActive : ""}`}
                            onClick={() => setFormData({ ...formData, deliverySlot: "afternoon" })}
                          >
                            <span className={styles.slotTitle}>☀️ দুপুর এক্সপ্রেস</span>
                            <span className={styles.slotTime}>দুপুর ০১:০০ - ০৩:৩০</span>
                          </div>

                          <div
                            className={`${styles.slotCard} ${formData.deliverySlot === "evening" ? styles.slotCardActive : ""}`}
                            onClick={() => setFormData({ ...formData, deliverySlot: "evening" })}
                          >
                            <span className={styles.slotTitle}>🌙 সন্ধ্যা বাজার</span>
                            <span className={styles.slotTime}>সন্ধ্যা ০৬:৩০ - ০৯:০০</span>
                          </div>
                        </div>
                      </div>

                      {/* Special Packaging Note */}
                      <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                        <label className={styles.inputLabel}>
                          <span>বিশেষ ডেলিভারি নির্দেশিকা / প্যাকেজিং নোট</span>
                        </label>
                        <textarea
                          rows={2}
                          value={formData.specialNote}
                          onChange={e => setFormData({ ...formData, specialNote: e.target.value })}
                          placeholder="যেমন: গেটের গার্ডের কাছে রেখে যাবেন..."
                          className={styles.inputControl}
                          style={{ height: "auto" }}
                        />
                      </div>

                    </div>

                    <div style={{ marginTop: "24px" }}>
                      <button type="submit" className={styles.continueBtn}>
                        <span>পরবর্তী ধাপ: পেমেন্ট অপশন নির্বাচন (Payment)</span>
                        <ChevronRight size={17} />
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* STAGE 2: PAYMENT & ANTI-BOT / CHILD LOCK */}
              {currentStep === "payment" && (
                <div className={styles.mainCard}>
                  <div className={styles.sectionHeader}>
                    <h2 className={styles.sectionTitle}>Select Payment Option</h2>
                    <p className={styles.sectionSubtitle}>
                      All transactions are 100% secure and 256-bit encrypted
                    </p>
                  </div>

                  <form onSubmit={handleFinalOrderSubmit}>
                    <div className={styles.paymentList}>
                      
                      {/* bKash */}
                      <div
                        className={`${styles.paymentOption} ${paymentMethod === "BKASH" ? styles.paymentOptionActive : ""}`}
                        onClick={() => setPaymentMethod("BKASH")}
                      >
                        <div className={styles.paymentLeft}>
                          <div className={`${styles.radioCircle} ${paymentMethod === "BKASH" ? styles.radioCircleActive : ""}`}>
                            {paymentMethod === "BKASH" && <div className={styles.radioDot} />}
                          </div>
                          <div>
                            <div className={styles.paymentLabel}>bKash (বিকাশ অনলাইন পেমেন্ট)</div>
                            <div className={styles.paymentDesc}>ইনস্ট্যান্ট পেমেন্ট ও ১০% ক্যাশব্যাক ক্যাম্পেইন</div>
                          </div>
                        </div>
                        <span style={{ fontWeight: 900, color: "#e11d48", fontSize: "0.95rem" }}>bKash</span>
                      </div>

                      {/* Nagad */}
                      <div
                        className={`${styles.paymentOption} ${paymentMethod === "NAGAD" ? styles.paymentOptionActive : ""}`}
                        onClick={() => setPaymentMethod("NAGAD")}
                      >
                        <div className={styles.paymentLeft}>
                          <div className={`${styles.radioCircle} ${paymentMethod === "NAGAD" ? styles.radioCircleActive : ""}`}>
                            {paymentMethod === "NAGAD" && <div className={styles.radioDot} />}
                          </div>
                          <div>
                            <div className={styles.paymentLabel}>Nagad (নগদ পেমেন্ট)</div>
                            <div className={styles.paymentDesc}>ডাক বিভাগের ডিজিটাল লেনদেন</div>
                          </div>
                        </div>
                        <span style={{ fontWeight: 900, color: "#ea580c", fontSize: "0.95rem" }}>Nagad</span>
                      </div>

                      {/* Credit Card / SSLCommerz */}
                      <div
                        className={`${styles.paymentOption} ${paymentMethod === "SSLCOMMERZ" ? styles.paymentOptionActive : ""}`}
                        onClick={() => setPaymentMethod("SSLCOMMERZ")}
                      >
                        <div className={styles.paymentLeft}>
                          <div className={`${styles.radioCircle} ${paymentMethod === "SSLCOMMERZ" ? styles.radioCircleActive : ""}`}>
                            {paymentMethod === "SSLCOMMERZ" && <div className={styles.radioDot} />}
                          </div>
                          <div>
                            <div className={styles.paymentLabel}>Credit / Debit Card & Net Banking</div>
                            <div className={styles.paymentDesc}>Visa, MasterCard, Amex & SSLCommerz Gateway</div>
                          </div>
                        </div>
                        <div style={{ display: "flex", gap: "6px" }}>
                          <span style={{ fontSize: "0.75rem", background: "#1e293b", color: "#fff", padding: "2px 6px", borderRadius: "4px", fontWeight: 700 }}>VISA</span>
                          <span style={{ fontSize: "0.75rem", background: "#dc2626", color: "#fff", padding: "2px 6px", borderRadius: "4px", fontWeight: 700 }}>MC</span>
                        </div>
                      </div>

                      {/* Cash on Delivery */}
                      <div
                        className={`${styles.paymentOption} ${paymentMethod === "COD" ? styles.paymentOptionActive : ""}`}
                        onClick={() => setPaymentMethod("COD")}
                      >
                        <div className={styles.paymentLeft}>
                          <div className={`${styles.radioCircle} ${paymentMethod === "COD" ? styles.radioCircleActive : ""}`}>
                            {paymentMethod === "COD" && <div className={styles.radioDot} />}
                          </div>
                          <div>
                            <div className={styles.paymentLabel}>Cash on delivery (ক্যাশ অন ডেলিভারি)</div>
                            <div className={styles.paymentDesc}>পণ্য হাতে পেয়ে দেখে টাকা পরিশোধ করুন</div>
                          </div>
                        </div>
                        <span style={{ fontSize: "1.2rem" }}>💵</span>
                      </div>

                    </div>

                    {/* ── ANTI-BOT & CHILD SAFETY SECURITY SHIELD ── */}
                    <div className={styles.securityShieldBox}>
                      <div className={styles.shieldHeader}>
                        <ShieldCheck size={18} color="#16a34a" />
                        <span>অর্ডার নিরাপত্তা ও ভেরিফিকেশন গার্ড (Anti-Bot & Child Shield)</span>
                      </div>
                      <p className={styles.shieldSub}>
                        অবাঞ্ছিত ক্লিক, ভুল অর্ডার ও হ্যাকিং বট প্রতিরোধে অর্ডার নিশ্চিত করতে নিচের স্লাইডারটি অন করুন।
                      </p>

                      {/* Slide-To-Confirm */}
                      <div
                        className={`${styles.slideTrack} ${isSlideUnlocked ? styles.slideTrackUnlocked : ""}`}
                        onClick={handleSlideToggle}
                      >
                        <div className={`${styles.slideHandle} ${isSlideUnlocked ? styles.slideHandleUnlocked : ""}`}>
                          {isSlideUnlocked ? <Check size={18} /> : <Lock size={16} />}
                        </div>
                        <span className={styles.slideLabel}>
                          {isSlideUnlocked ? "✓ অর্ডার ভেরিফিকেশন সফল!" : "👉 স্লাইড করে অর্ডার কনফার্ম করুন (Slide to Confirm)"}
                        </span>
                      </div>

                      {/* Optional Math Verification */}
                      <div className={styles.mathChallengeBox}>
                        <span className={styles.mathQuestion}>
                          নিরাপত্তা প্রশ্ন: {mathProblem.num1} + {mathProblem.num2} =
                        </span>
                        <input
                          type="text"
                          maxLength={2}
                          placeholder="?"
                          value={mathAnswer}
                          onChange={e => setMathAnswer(e.target.value)}
                          className={`${styles.mathInput} ${securityVerified ? styles.mathInputVerified : ""}`}
                        />
                        {securityVerified && (
                          <span style={{ fontSize: "0.78rem", color: "#16a34a", fontWeight: 700 }}>
                            ✓ হিউম্যান ভেরিফাইড
                          </span>
                        )}
                      </div>

                      {securityError && (
                        <div style={{ color: "#dc2626", fontSize: "0.78rem", marginTop: "8px", fontWeight: 600 }}>
                          ⚠️ {securityError}
                        </div>
                      )}
                    </div>

                    {/* Submit Pay Button */}
                    <button
                      type="submit"
                      disabled={isProcessing}
                      className={styles.payBtn}
                    >
                      {isProcessing ? (
                        <>
                          <RefreshCw size={18} className="spin" />
                          <span>অর্ডার প্রসেস হচ্ছে...</span>
                        </>
                      ) : (
                        <>
                          <Lock size={17} />
                          <span>Pay | {formatPrice(grandTotal)}</span>
                        </>
                      )}
                    </button>

                    <div className={styles.termsRow}>
                      <input
                        type="checkbox"
                        id="terms"
                        checked={agreeTerms}
                        onChange={e => setAgreeTerms(e.target.checked)}
                      />
                      <label htmlFor="terms">
                        By clicking this, I agree to Tatka Bazar <strong>Terms & Conditions</strong> and <strong>Privacy Policy</strong>
                      </label>
                    </div>

                    <div style={{ marginTop: "16px", textAlign: "center" }}>
                      <button
                        type="button"
                        onClick={() => setCurrentStep("details")}
                        style={{ background: "none", border: "none", color: "#64748b", fontSize: "0.82rem", cursor: "pointer", textDecoration: "underline" }}
                      >
                        ← ব্যক্তিগত তথ্যে ফিরে যান (Edit Details)
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>

            {/* ── Right Column: Your Cart & Summary ── */}
            <div className={styles.sidebarCard}>
              <div className={styles.sidebarTitle}>
                <span>Your cart ({items.length})</span>
                <Link href="/cart" style={{ fontSize: "0.78rem", color: "#6366f1", textDecoration: "none" }}>এডিট</Link>
              </div>

              {/* Items List */}
              <div className={styles.cartItemList}>
                {items.length > 0 ? (
                  items.map(item => (
                    <div key={item.id} className={styles.cartItemRow}>
                      <img
                        src={item.product?.images?.[0] || "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=300&auto=format&fit=crop&q=80"}
                        alt={locale === "bn" ? item.product?.nameBn : item.product?.nameEn}
                        className={styles.itemImg}
                      />
                      <div className={styles.itemMeta}>
                        <h4 className={styles.itemTitle}>{locale === "bn" ? item.product?.nameBn : item.product?.nameEn}</h4>
                        <div className={styles.itemQty}>{item.selectedWeight} {item.selectedUnit} × {item.quantity} টি</div>
                      </div>
                      <div className={styles.itemPrice}>
                        {formatPrice(item.unitPrice * item.quantity)}
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ color: "#94a3b8", fontSize: "0.82rem" }}>কার্ট খালি রয়েছে।</div>
                )}
              </div>

              {/* Apply Coupon Code */}
              <form onSubmit={handleApplyCoupon}>
                <div className={styles.couponBox}>
                  <input
                    type="text"
                    placeholder="Apply coupon code"
                    value={couponInput}
                    onChange={e => setCouponInput(e.target.value)}
                    className={styles.couponInput}
                  />
                  <button type="submit" className={styles.couponBtn}>
                    Apply
                  </button>
                </div>
                {couponMessage && (
                  <div style={{ fontSize: "0.75rem", color: "#16a34a", marginTop: "6px" }}>
                    {couponMessage}
                  </div>
                )}
              </form>

              {/* Order Summary Table */}
              <div className={styles.summaryTable}>
                <div className={styles.summaryRow}>
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className={styles.summaryRow}>
                  <span>Shipping / Delivery</span>
                  <span>{deliveryFee === 0 ? "Free" : formatPrice(deliveryFee)}</span>
                </div>
                {discount > 0 && (
                  <div className={styles.summaryRow} style={{ color: "#16a34a" }}>
                    <span>Discount</span>
                    <span>-{formatPrice(discount)}</span>
                  </div>
                )}
                <div className={styles.summaryRow}>
                  <span>Tax (ভ্যাট)</span>
                  <span>৳০.০০</span>
                </div>
                <div className={styles.summaryRowTotal}>
                  <span>Total</span>
                  <span>{formatPrice(grandTotal)}</span>
                </div>
              </div>
            </div>

          </div>
        ) : (
          /* ── STAGE 3: ORDER COMPLETE CELEBRATION ── */
          <div className={styles.completeCard}>
            <div className={styles.completeIconBox}>
              <CheckCircle2 size={40} />
            </div>

            <h1 className={styles.completeTitle}>অর্ডার সফলভাবে গৃহীত হয়েছে! 🎉</h1>
            <p className={styles.completeSub}>
              ধন্যবাদ <strong>{formData.fullName}</strong>! আপনার তাজা বাজার প্রস্তুতি শুরু হয়েছে।
            </p>

            <div className={styles.orderReceiptBox}>
              <div className={styles.receiptRow}>
                <span>অর্ডার আইডি (Order ID):</span>
                <strong>{placedOrder?.orderNumber}</strong>
              </div>
              <div className={styles.receiptRow}>
                <span>মোট পরিশোধযোগ্য:</span>
                <strong>{formatPrice(placedOrder?.total)}</strong>
              </div>
              <div className={styles.receiptRow}>
                <span>পেমেন্ট মেথড:</span>
                <strong>{placedOrder?.paymentMethod}</strong>
              </div>
              <div className={styles.receiptRow}>
                <span>ডেলিভারি স্লট:</span>
                <strong>{placedOrder?.deliverySlot}</strong>
              </div>
              <div className={styles.receiptRow}>
                <span>ডেলিভারি ঠিকানা:</span>
                <span>{formData.address}, {formData.area}</span>
              </div>
            </div>

            <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
              <Link
                href={`/track/${placedOrder?.orderNumber}`}
                className={styles.payBtn}
                style={{ width: "auto", padding: "12px 28px", textDecoration: "none" }}
              >
                <span>অর্ডার লাইভ ট্র্যাক করুন ↗</span>
              </Link>
              <Link
                href="/"
                className={styles.couponBtn}
                style={{ padding: "12px 24px", fontSize: "0.92rem", textDecoration: "none", display: "inline-flex", alignItems: "center" }}
              >
                হোমপেজে ফিরে যান
              </Link>
            </div>
          </div>
        )}

        {/* ── Bottom Freshness & Cancellation Policy Card ── */}
        <div className={styles.policyCard}>
          <div>
            <h4 className={styles.policyTitle}>Cancellation & Freshness Policy</h4>
            <p className={styles.policyText}>
              তাতকা বাজারে প্রতিটি পণ্য সরাসরি সংগ্রহের পর ১০০% কোয়ালিটি চেক করা হয়। ডেলিভারির সময় পণ্যের মান পছন্দ না হলে ইনস্ট্যান্ট কোনো বাড়তি ফি ছাড়াই ডোরস্টেপে ফেরত দিতে পারবেন।
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <ShieldCheck size={32} color="#10D876" />
          </div>
        </div>

      </div>
    </div>
  );
}
