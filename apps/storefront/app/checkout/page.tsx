"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Check,
  ChevronRight,
  ShieldCheck,
  Lock,
  RefreshCw,
  ShoppingBag,
  CreditCard,
  Truck,
  ArrowRight,
  X,
  CheckCircle2,
} from "lucide-react";
import confetti from "canvas-confetti";
import { useCartStore } from "@/lib/cart-store";
import { useLanguage } from "@/context/LanguageContext";
import styles from "./page.module.css";

type CheckoutStep = "details" | "payment" | "complete";

export default function CheckoutPage() {
  const router = useRouter();
  const { formatPrice } = useLanguage();
  const {
    items,
    getSubtotal,
    getDiscountAmount,
    getDeliveryFee,
    getGrandTotal,
    clearCart,
    submitOrder,
    applyCoupon,
  } = useCartStore();

  // Current Multi-Step State
  const [currentStep, setCurrentStep] = useState<CheckoutStep>("details");
  const [isProcessing, setIsProcessing] = useState(false);
  const [couponInput, setCouponInput] = useState("");
  const [couponMessage, setCouponMessage] = useState<string | null>(null);

  // Form State (Step 1)
  const [formData, setFormData] = useState({
    fullName: "Rafiq Ahmed",
    phone: "01712-345678",
    altPhone: "01819-876543",
    email: "rafiq.ahmed@example.com",
    city: "Dhaka",
    area: "Dhanmondi",
    address: "House 42, Road 7/A, Flat 3B, Dhanmondi R/A",
    landmark: "Opposite Ibn Sina Hospital",
    deliverySlot: "morning", // morning | afternoon | evening
    specialNote: "Please pack fish and vegetables in separate insulated boxes.",
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
      alert("Please enter your name, phone number, and delivery address.");
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
      setSecurityError("Please slide to unlock or answer the verification question.");
      return;
    }

    if (!agreeTerms) {
      alert("Please agree to the terms and conditions.");
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
          ? "Morning (07:00 - 09:30 AM)"
          : formData.deliverySlot === "afternoon"
          ? "Midday (01:00 - 03:30 PM)"
          : "Evening (06:30 - 09:00 PM)",
        paymentMethod,
        items: items.map(it => ({
          productId: it.product.id,
          name: it.product.nameEn || it.product.nameBn,
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
        date: new Date().toLocaleDateString("en-US"),
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
      alert("There was an issue processing your order. Please try again.");
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
            <span>Tatka Bazar</span>
          </Link>

          {currentStep !== "complete" && (
            <Link href="/cart" className={styles.cancelLink}>
              <X size={15} />
              <span>Cancel & Return to Cart</span>
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
                    <h2 className={styles.sectionTitle}>Personal Details & Delivery Address</h2>
                    <p className={styles.sectionSubtitle}>
                      Verify your delivery location for accurate doorstep dispatch.
                    </p>
                  </div>

                  <form onSubmit={handleDetailsSubmit}>
                    <div className={styles.formGrid}>
                      
                      {/* Full Name */}
                      <div className={styles.inputGroup}>
                        <label className={styles.inputLabel}>
                          <span>Customer Full Name *</span>
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
                          <span>Primary Mobile Number *</span>
                          <span style={{ fontSize: "0.7rem", color: "#10b981", fontWeight: 700 }}>Verified</span>
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
                          <span>Alternate Phone (Optional)</span>
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
                          <span>Email Address</span>
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
                          <span>City / Area *</span>
                        </label>
                        <select
                          value={formData.area}
                          onChange={e => setFormData({ ...formData, area: e.target.value })}
                          className={styles.inputControl}
                        >
                          <option value="Dhanmondi">Dhanmondi, Dhaka</option>
                          <option value="Gulshan">Gulshan-1 & 2</option>
                          <option value="Banani">Banani, Dhaka</option>
                          <option value="Uttara">Uttara Sector 1-14</option>
                          <option value="Mirpur">Mirpur, Dhaka</option>
                          <option value="Mohammadpur">Mohammadpur</option>
                        </select>
                      </div>

                      {/* Full Address */}
                      <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                        <label className={styles.inputLabel}>
                          <span>Full Delivery Address (House, Road, Apartment) *</span>
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
                          <span>Preferred Delivery Slot *</span>
                        </label>
                        <div className={styles.slotGrid}>
                          <div
                            className={`${styles.slotCard} ${formData.deliverySlot === "morning" ? styles.slotCardActive : ""}`}
                            onClick={() => setFormData({ ...formData, deliverySlot: "morning" })}
                          >
                            <span className={styles.slotTitle}>🌅 Morning Slot</span>
                            <span className={styles.slotTime}>07:00 AM - 09:30 AM</span>
                          </div>

                          <div
                            className={`${styles.slotCard} ${formData.deliverySlot === "afternoon" ? styles.slotCardActive : ""}`}
                            onClick={() => setFormData({ ...formData, deliverySlot: "afternoon" })}
                          >
                            <span className={styles.slotTitle}>☀️ Midday Express</span>
                            <span className={styles.slotTime}>01:00 PM - 03:30 PM</span>
                          </div>

                          <div
                            className={`${styles.slotCard} ${formData.deliverySlot === "evening" ? styles.slotCardActive : ""}`}
                            onClick={() => setFormData({ ...formData, deliverySlot: "evening" })}
                          >
                            <span className={styles.slotTitle}>🌙 Evening Slot</span>
                            <span className={styles.slotTime}>06:30 PM - 09:00 PM</span>
                          </div>
                        </div>
                      </div>

                      {/* Special Packaging Note */}
                      <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                        <label className={styles.inputLabel}>
                          <span>Special Delivery / Packaging Instructions</span>
                        </label>
                        <textarea
                          rows={2}
                          value={formData.specialNote}
                          onChange={e => setFormData({ ...formData, specialNote: e.target.value })}
                          placeholder="e.g. Leave package with the security guard..."
                          className={styles.inputControl}
                          style={{ height: "auto" }}
                        />
                      </div>

                    </div>

                    <div style={{ marginTop: "24px" }}>
                      <button type="submit" className={styles.continueBtn}>
                        <span>Continue to Payment</span>
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
                            <div className={styles.paymentLabel}>bKash Online Payment</div>
                            <div className={styles.paymentDesc}>Instant payment with 10% cashback campaign</div>
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
                            <div className={styles.paymentLabel}>Nagad Digital Payment</div>
                            <div className={styles.paymentDesc}>Post office digital mobile wallet</div>
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
                            <div className={styles.paymentDesc}>Visa, MasterCard, Amex & Online Banking</div>
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
                            <div className={styles.paymentLabel}>Cash on Delivery (COD)</div>
                            <div className={styles.paymentDesc}>Inspect produce first, then pay in cash to the rider</div>
                          </div>
                        </div>
                        <span style={{ fontSize: "1.2rem" }}>💵</span>
                      </div>

                    </div>

                    {/* ── ANTI-BOT & CHILD SAFETY SECURITY SHIELD ── */}
                    <div className={styles.securityShieldBox}>
                      <div className={styles.shieldHeader}>
                        <ShieldCheck size={18} color="#16a34a" />
                        <span>Order Verification Shield (Anti-Bot & Child Protection)</span>
                      </div>
                      <p className={styles.shieldSub}>
                        To prevent accidental orders, please slide the toggle or solve the verification problem below.
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
                          {isSlideUnlocked ? "✓ Order verification complete!" : "👉 Slide to confirm order"}
                        </span>
                      </div>

                      {/* Optional Math Verification */}
                      <div className={styles.mathChallengeBox}>
                        <span className={styles.mathQuestion}>
                          Security Question: {mathProblem.num1} + {mathProblem.num2} =
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
                            ✓ Human Verified
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
                          <span>Processing Order...</span>
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
                        By placing this order, I agree to Tatka Bazar <strong>Terms & Conditions</strong> and <strong>Privacy Policy</strong>
                      </label>
                    </div>

                    <div style={{ marginTop: "16px", textAlign: "center" }}>
                      <button
                        type="button"
                        onClick={() => setCurrentStep("details")}
                        style={{ background: "none", border: "none", color: "#64748b", fontSize: "0.82rem", cursor: "pointer", textDecoration: "underline" }}
                      >
                        ← Edit Personal Details
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
                <Link href="/cart" style={{ fontSize: "0.78rem", color: "#6366f1", textDecoration: "none" }}>Edit</Link>
              </div>

              {/* Items List */}
              <div className={styles.cartItemList}>
                {items.length > 0 ? (
                  items.map(item => (
                    <div key={item.id} className={styles.cartItemRow}>
                      <img
                        src={item.product?.images?.[0] || "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=300&auto=format&fit=crop&q=80"}
                        alt={item.product?.nameEn || item.product?.nameBn}
                        className={styles.itemImg}
                      />
                      <div className={styles.itemMeta}>
                        <h4 className={styles.itemTitle}>{item.product?.nameEn || item.product?.nameBn}</h4>
                        <div className={styles.itemQty}>{item.selectedWeight} {item.selectedUnit} × {item.quantity} units</div>
                      </div>
                      <div className={styles.itemPrice}>
                        {formatPrice(item.unitPrice * item.quantity)}
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ color: "#94a3b8", fontSize: "0.82rem" }}>Your cart is empty.</div>
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
                  <span>VAT / Tax</span>
                  <span>৳0.00</span>
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

            <h1 className={styles.completeTitle}>Order Placed Successfully! 🎉</h1>
            <p className={styles.completeSub}>
              Thank you <strong>{formData.fullName}</strong>! We have started preparing your fresh items.
            </p>

            <div className={styles.orderReceiptBox}>
              <div className={styles.receiptRow}>
                <span>Order ID:</span>
                <strong>#{placedOrder?.orderNumber}</strong>
              </div>
              <div className={styles.receiptRow}>
                <span>Total Amount:</span>
                <strong>{formatPrice(placedOrder?.total)}</strong>
              </div>
              <div className={styles.receiptRow}>
                <span>Payment Method:</span>
                <strong>{placedOrder?.paymentMethod}</strong>
              </div>
              <div className={styles.receiptRow}>
                <span>Delivery Slot:</span>
                <strong>{placedOrder?.deliverySlot}</strong>
              </div>
              <div className={styles.receiptRow}>
                <span>Delivery Address:</span>
                <span>{formData.address}, {formData.area}</span>
              </div>
            </div>

            <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
              <Link
                href={`/track/${placedOrder?.orderNumber}`}
                className={styles.payBtn}
                style={{ width: "auto", padding: "12px 28px", textDecoration: "none" }}
              >
                <span>Track Order Live ↗</span>
              </Link>
              <Link
                href="/"
                className={styles.couponBtn}
                style={{ padding: "12px 24px", fontSize: "0.92rem", textDecoration: "none", display: "inline-flex", alignItems: "center" }}
              >
                Back to Home
              </Link>
            </div>
          </div>
        )}

        {/* ── Bottom Freshness & Cancellation Policy Card ── */}
        <div className={styles.policyCard}>
          <div>
            <h4 className={styles.policyTitle}>Cancellation & Freshness Policy</h4>
            <p className={styles.policyText}>
              Every item on Tatka Bazar undergoes quality inspection upon harvest. If you are unsatisfied with freshness upon delivery, you can instantly return the item with zero extra fees at your doorstep.
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
