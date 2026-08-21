"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import confetti from "canvas-confetti";
import {
  MapPin,
  Clock,
  CreditCard,
  CheckCircle2,
  Truck,
  ShieldCheck,
  Store,
  ArrowLeft,
  Sparkles,
  ShoppingBag,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useCartStore } from "@/lib/cart-store";
import { submitOrder } from "@/lib/api-client";

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
    note: "মাছটা যেন ভালোভাবে ড্রাম প্যাকেজিং করা থাকে।",
  });

  const [deliverySlot, setDeliverySlot] = useState<string>("morning");
  const [paymentMethod, setPaymentMethod] = useState<"BKASH" | "NAGAD" | "SSLCOMMERZ" | "COD">("BKASH");
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<any | null>(null);

  // bKash / Nagad Interactive Sandbox Modal
  const [showPaymentModal, setShowPaymentModal] = useState(false);
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
          price: it.price,
          quantity: it.quantity,
          unit: it.unit,
          vendorId: it.product.vendorId,
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

  if (orderSuccess) {
    return (
      <div style={{ padding: "60px 0", minHeight: "80vh", display: "flex", alignItems: "center" }}>
        <div className="container" style={{ maxWidth: "600px" }}>
          <div
            style={{
              background: "var(--bg-surface)",
              borderRadius: "var(--radius-xl)",
              padding: "40px 30px",
              textAlign: "center",
              border: "2px solid var(--primary)",
              boxShadow: "var(--shadow-xl)",
              animation: "scaleIn 0.3s ease-out",
            }}
          >
            <div
              style={{
                width: "76px",
                height: "76px",
                borderRadius: "50%",
                background: "var(--primary-light)",
                color: "var(--primary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 20px",
                boxShadow: "0 0 20px var(--primary-glow)",
              }}
            >
              <CheckCircle2 size={44} />
            </div>

            <h1 style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--primary-dark)", marginBottom: "8px" }}>
              {t.orderSuccessTitle}
            </h1>
            <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", marginBottom: "24px" }}>
              {t.orderTrackingMsg}
            </p>

            {/* Order Receipt Box */}
            <div
              style={{
                background: "var(--bg-subtle)",
                borderRadius: "var(--radius-lg)",
                padding: "20px",
                textAlign: "left",
                marginBottom: "28px",
                fontSize: "0.9rem",
                display: "flex",
                flexDirection: "column",
                gap: "10px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "8px" }}>
                <span style={{ color: "var(--text-muted)" }}>{t.orderNumber}:</span>
                <span style={{ fontWeight: 800, color: "var(--primary-dark)" }}>{orderSuccess.orderNumber}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-muted)" }}>মোট পরিশোধ:</span>
                <span style={{ fontWeight: 800 }}>{formatPrice(orderSuccess.total)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-muted)" }}>পেমেন্ট মাধ্যম:</span>
                <span style={{ fontWeight: 700 }}>{orderSuccess.paymentMethod}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-muted)" }}>ডেলিভারি ঠিকানা:</span>
                <span style={{ fontWeight: 600, maxWidth: "260px", textAlign: "right" }}>{orderSuccess.address}</span>
              </div>
            </div>

            {/* Action buttons */}
            <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
              <Link href="/account" className="btn-primary" style={{ padding: "12px 24px" }}>
                <span>{t.trackOrder}</span>
              </Link>
              <Link href="/" className="btn-secondary" style={{ padding: "12px 24px" }}>
                <span>{t.backToHome}</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div style={{ padding: "60px 0", textAlign: "center" }}>
        <div className="container" style={{ maxWidth: "400px" }}>
          <h2 style={{ fontSize: "1.4rem", fontWeight: 800, marginBottom: "12px" }}>{t.emptyCart}</h2>
          <Link href="/" className="btn-primary">
            {t.startShopping}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px 0 60px" }}>
      <div className="container">
        
        {/* Top Header */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "28px" }}>
          <Link href="/cart" style={{ color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "4px", fontSize: "0.9rem" }}>
            <ArrowLeft size={18} />
            <span>{locale === "bn" ? "কার্টে ফিরুন" : "Back to Cart"}</span>
          </Link>
          <span style={{ color: "var(--border-medium)" }}>|</span>
          <h1 style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--text-main)" }}>
            {t.checkoutTitle}
          </h1>
        </div>

        <form onSubmit={handlePlaceOrder}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: "30px", alignItems: "flex-start" }}>
            
            {/* Left Steps Column */}
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              
              {/* Step 1: Delivery Address */}
              <div
                style={{
                  background: "var(--bg-surface)",
                  borderRadius: "var(--radius-xl)",
                  border: "1px solid var(--border-subtle)",
                  padding: "24px",
                  boxShadow: "var(--shadow-sm)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "18px" }}>
                  <div style={{ padding: "8px", borderRadius: "8px", background: "var(--primary-light)", color: "var(--primary)" }}>
                    <MapPin size={20} />
                  </div>
                  <h2 style={{ fontSize: "1.15rem", fontWeight: 800 }}>{t.step1Title}</h2>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                  <div>
                    <label style={{ fontSize: "0.82rem", fontWeight: 700, display: "block", marginBottom: "6px" }}>{t.fullName} *</label>
                    <input
                      type="text"
                      required
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      style={{ width: "100%", padding: "10px 14px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-medium)", outline: "none" }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: "0.82rem", fontWeight: 700, display: "block", marginBottom: "6px" }}>{t.phoneNumber} *</label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      style={{ width: "100%", padding: "10px 14px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-medium)", outline: "none" }}
                    />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                  <div>
                    <label style={{ fontSize: "0.82rem", fontWeight: 700, display: "block", marginBottom: "6px" }}>{t.division}</label>
                    <select
                      value={formData.division}
                      onChange={(e) => setFormData({ ...formData, division: e.target.value })}
                      style={{ width: "100%", padding: "10px 14px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-medium)", background: "var(--bg-surface)", outline: "none" }}
                    >
                      <option value="Dhaka">ঢাকা (Dhaka)</option>
                      <option value="Chattogram">চট্টগ্রাম (Chattogram)</option>
                      <option value="Sylhet">সিলেট (Sylhet)</option>
                      <option value="Rajshahi">রাজশাহী (Rajshahi)</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: "0.82rem", fontWeight: 700, display: "block", marginBottom: "6px" }}>{t.area}</label>
                    <input
                      type="text"
                      required
                      value={formData.area}
                      onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                      style={{ width: "100%", padding: "10px 14px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-medium)", outline: "none" }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: "16px" }}>
                  <label style={{ fontSize: "0.82rem", fontWeight: 700, display: "block", marginBottom: "6px" }}>{t.fullAddress} *</label>
                  <textarea
                    rows={2}
                    required
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-medium)", outline: "none" }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: "0.82rem", fontWeight: 700, display: "block", marginBottom: "6px" }}>ল্যান্ডমার্ক বা ডেলিভারি নির্দেশনা (ঐচ্ছিক)</label>
                  <input
                    type="text"
                    value={formData.landmark}
                    onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
                    placeholder="যেমন: মসজিদের বিপরীতে, ৪তলা বাড়ি"
                    style={{ width: "100%", padding: "10px 14px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-medium)", outline: "none" }}
                  />
                </div>
              </div>

              {/* Step 2: Time-Slotted Delivery */}
              <div
                style={{
                  background: "var(--bg-surface)",
                  borderRadius: "var(--radius-xl)",
                  border: "1px solid var(--border-subtle)",
                  padding: "24px",
                  boxShadow: "var(--shadow-sm)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "18px" }}>
                  <div style={{ padding: "8px", borderRadius: "8px", background: "var(--primary-light)", color: "var(--primary)" }}>
                    <Clock size={20} />
                  </div>
                  <h2 style={{ fontSize: "1.15rem", fontWeight: 800 }}>{t.step2Title}</h2>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px" }}>
                  <label
                    onClick={() => setDeliverySlot("morning")}
                    style={{
                      padding: "14px",
                      borderRadius: "var(--radius-md)",
                      border: deliverySlot === "morning" ? "2px solid var(--primary)" : "1.5px solid var(--border-subtle)",
                      background: deliverySlot === "morning" ? "var(--primary-light)" : "var(--bg-surface)",
                      cursor: "pointer",
                      display: "flex",
                      flexDirection: "column",
                      gap: "4px",
                    }}
                  >
                    <div style={{ fontWeight: 800, fontSize: "0.95rem", color: "var(--primary-dark)" }}>{t.slotMorning}</div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>ভোরের তাজা মাছ ও শাকসবজির জন্য সেরা</div>
                  </label>

                  <label
                    onClick={() => setDeliverySlot("noon")}
                    style={{
                      padding: "14px",
                      borderRadius: "var(--radius-md)",
                      border: deliverySlot === "noon" ? "2px solid var(--primary)" : "1.5px solid var(--border-subtle)",
                      background: deliverySlot === "noon" ? "var(--primary-light)" : "var(--bg-surface)",
                      cursor: "pointer",
                      display: "flex",
                      flexDirection: "column",
                      gap: "4px",
                    }}
                  >
                    <div style={{ fontWeight: 800, fontSize: "0.95rem", color: "var(--primary-dark)" }}>{t.slotNoon}</div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>দুপুরের রান্নার দ্রুত ডেলিভারি</div>
                  </label>

                  <label
                    onClick={() => setDeliverySlot("evening")}
                    style={{
                      padding: "14px",
                      borderRadius: "var(--radius-md)",
                      border: deliverySlot === "evening" ? "2px solid var(--primary)" : "1.5px solid var(--border-subtle)",
                      background: deliverySlot === "evening" ? "var(--primary-light)" : "var(--bg-surface)",
                      cursor: "pointer",
                      display: "flex",
                      flexDirection: "column",
                      gap: "4px",
                    }}
                  >
                    <div style={{ fontWeight: 800, fontSize: "0.95rem", color: "var(--primary-dark)" }}>{t.slotEvening}</div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>অফিস শেষে সন্ধ্যার আরামদায়ক ডেলিভারি</div>
                  </label>
                </div>
              </div>

              {/* Step 3: Payment Method Selection */}
              <div
                style={{
                  background: "var(--bg-surface)",
                  borderRadius: "var(--radius-xl)",
                  border: "1px solid var(--border-subtle)",
                  padding: "24px",
                  boxShadow: "var(--shadow-sm)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "18px" }}>
                  <div style={{ padding: "8px", borderRadius: "8px", background: "var(--primary-light)", color: "var(--primary)" }}>
                    <CreditCard size={20} />
                  </div>
                  <h2 style={{ fontSize: "1.15rem", fontWeight: 800 }}>{t.step3Title}</h2>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {/* bKash */}
                  <label
                    onClick={() => setPaymentMethod("BKASH")}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "14px 18px",
                      borderRadius: "var(--radius-md)",
                      border: paymentMethod === "BKASH" ? "2px solid #E2136E" : "1px solid var(--border-subtle)",
                      background: paymentMethod === "BKASH" ? "#FDF2F8" : "var(--bg-surface)",
                      cursor: "pointer",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <span style={{ background: "#E2136E", color: "#FFF", padding: "4px 8px", borderRadius: "4px", fontWeight: 800, fontSize: "0.75rem" }}>
                        bKash
                      </span>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: "0.95rem" }}>{t.bkash}</div>
                        <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>সহজ ও তাৎক্ষণিক বিকাশ পেমেন্ট গেটওয়ে</div>
                      </div>
                    </div>
                    {paymentMethod === "BKASH" && <CheckCircle2 size={18} color="#E2136E" />}
                  </label>

                  {/* Nagad */}
                  <label
                    onClick={() => setPaymentMethod("NAGAD")}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "14px 18px",
                      borderRadius: "var(--radius-md)",
                      border: paymentMethod === "NAGAD" ? "2px solid #F7941D" : "1px solid var(--border-subtle)",
                      background: paymentMethod === "NAGAD" ? "#FFF7ED" : "var(--bg-surface)",
                      cursor: "pointer",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <span style={{ background: "#F7941D", color: "#FFF", padding: "4px 8px", borderRadius: "4px", fontWeight: 800, fontSize: "0.75rem" }}>
                        Nagad
                      </span>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: "0.95rem" }}>{t.nagad}</div>
                        <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>নগদ সরাসরি ওয়ালেট পে</div>
                      </div>
                    </div>
                    {paymentMethod === "NAGAD" && <CheckCircle2 size={18} color="#F7941D" />}
                  </label>

                  {/* SSLCommerz Card */}
                  <label
                    onClick={() => setPaymentMethod("SSLCOMMERZ")}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "14px 18px",
                      borderRadius: "var(--radius-md)",
                      border: paymentMethod === "SSLCOMMERZ" ? "2px solid var(--primary)" : "1px solid var(--border-subtle)",
                      background: paymentMethod === "SSLCOMMERZ" ? "var(--primary-light)" : "var(--bg-surface)",
                      cursor: "pointer",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <span style={{ background: "#1A1F71", color: "#FFF", padding: "4px 8px", borderRadius: "4px", fontWeight: 800, fontSize: "0.75rem" }}>
                        CARD
                      </span>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: "0.95rem" }}>{t.sslcommerz}</div>
                        <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>ভিসা, মাস্টারকার্ড ও ইন্টারনেট ব্যাংকিং</div>
                      </div>
                    </div>
                    {paymentMethod === "SSLCOMMERZ" && <CheckCircle2 size={18} color="var(--primary)" />}
                  </label>

                  {/* Cash on Delivery */}
                  <label
                    onClick={() => setPaymentMethod("COD")}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "14px 18px",
                      borderRadius: "var(--radius-md)",
                      border: paymentMethod === "COD" ? "2px solid var(--primary-dark)" : "1px solid var(--border-subtle)",
                      background: paymentMethod === "COD" ? "var(--bg-subtle)" : "var(--bg-surface)",
                      cursor: "pointer",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <span style={{ background: "var(--primary-dark)", color: "#FFF", padding: "4px 8px", borderRadius: "4px", fontWeight: 800, fontSize: "0.75rem" }}>
                        COD
                      </span>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: "0.95rem" }}>{t.cod}</div>
                        <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>পণ্য হাতে পেয়ে যাচাই করে মূল্য পরিশোধ করুন</div>
                      </div>
                    </div>
                    {paymentMethod === "COD" && <CheckCircle2 size={18} color="var(--primary-dark)" />}
                  </label>
                </div>
              </div>

            </div>

            {/* Right Order Summary & Confirm */}
            <div
              style={{
                background: "var(--bg-surface)",
                borderRadius: "var(--radius-xl)",
                border: "1px solid var(--border-subtle)",
                padding: "24px",
                boxShadow: "var(--shadow-md)",
                position: "sticky",
                top: "140px",
              }}
            >
              <h2 style={{ fontSize: "1.2rem", fontWeight: 800, marginBottom: "16px", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "10px" }}>
                {t.orderSummary}
              </h2>

              {/* Multi-Vendor Order Split Breakdown Badge */}
              <div
                style={{
                  background: "var(--bg-subtle)",
                  borderRadius: "var(--radius-md)",
                  padding: "12px",
                  marginBottom: "16px",
                  fontSize: "0.8rem",
                }}
              >
                <div style={{ fontWeight: 700, color: "var(--primary-dark)", marginBottom: "6px", display: "flex", alignItems: "center", gap: "6px" }}>
                  <Store size={15} />
                  <span>{vendorGroups.length} টি ভেন্ডর প্যাকেজ হিসেবে ডেলিভারি হবে:</span>
                </div>
                {vendorGroups.map((g) => (
                  <div key={g.vendorId} style={{ display: "flex", justifyContent: "space-between", color: "var(--text-muted)", marginTop: "2px" }}>
                    <span>• {locale === "bn" ? g.vendorNameBn : g.vendorNameEn}</span>
                    <span>{g.items.length} {t.items}</span>
                  </div>
                ))}
              </div>

              {/* Price Calculations */}
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "0.9rem", marginBottom: "20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-muted)" }}>
                  <span>{t.subtotal}</span>
                  <span style={{ fontWeight: 600, color: "var(--text-main)" }}>{formatPrice(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div style={{ display: "flex", justifyContent: "space-between", color: "var(--primary)" }}>
                    <span>{t.discount}</span>
                    <span style={{ fontWeight: 700 }}>-{formatPrice(discount)}</span>
                  </div>
                )}
                <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-muted)" }}>
                  <span>{t.deliveryFee}</span>
                  <span style={{ fontWeight: 600, color: deliveryFee === 0 ? "var(--primary)" : "var(--text-main)" }}>
                    {deliveryFee === 0 ? t.freeDelivery : formatPrice(deliveryFee)}
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "1.25rem",
                    fontWeight: 800,
                    color: "var(--primary-dark)",
                    paddingTop: "10px",
                    borderTop: "1.5px dashed var(--border-medium)",
                  }}
                >
                  <span>{t.grandTotal}</span>
                  <span>{formatPrice(grandTotal)}</span>
                </div>
              </div>

              {/* Place Order CTA Button */}
              <button
                type="submit"
                disabled={isProcessing}
                className="btn-primary"
                style={{
                  width: "100%",
                  padding: "15px",
                  fontSize: "1.05rem",
                  borderRadius: "var(--radius-md)",
                }}
              >
                {isProcessing ? (
                  <span>অর্ডার প্রসেসিং হচ্ছে...</span>
                ) : (
                  <span>{t.placeOrder} ({formatPrice(grandTotal)})</span>
                )}
              </button>

              <div style={{ marginTop: "16px", textAlign: "center", fontSize: "0.75rem", color: "var(--text-muted)" }}>
                🔒 SSL ২৫৬-বিট এনক্রিপশন দ্বারা সুরক্ষিত চেকআউট
              </div>
            </div>

          </div>
        </form>

      </div>

      {/* Interactive bKash / Nagad PGW Sandbox Modal */}
      {showPaymentModal && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(15, 23, 42, 0.75)",
          backdropFilter: "blur(6px)",
          zIndex: 10000,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px",
        }}>
          <div style={{
            background: "#FFFFFF",
            borderRadius: "20px",
            width: "100%",
            maxWidth: "420px",
            overflow: "hidden",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
            border: paymentMethod === "BKASH" ? "2px solid #E2136E" : "2px solid #F97316",
            animation: "scaleIn 0.25s ease-out",
          }}>
            {/* Header */}
            <div style={{
              background: paymentMethod === "BKASH" ? "linear-gradient(135deg, #E2136E 0%, #C00456 100%)" : "linear-gradient(135deg, #EA580C 0%, #C2410C 100%)",
              color: "#FFFFFF",
              padding: "20px 24px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}>
              <div>
                <div style={{ fontSize: "1.25rem", fontWeight: 800 }}>
                  {paymentMethod === "BKASH" ? "bKash Payment" : "Nagad Payment"}
                </div>
                <div style={{ fontSize: "0.78rem", opacity: 0.9 }}>
                  Merchant: Tatka Bazar Online
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "0.72rem", opacity: 0.85 }}>পরিমাণ (Amount)</div>
                <div style={{ fontSize: "1.25rem", fontWeight: 800 }}>{formatPrice(grandTotal)}</div>
              </div>
            </div>

            {/* Modal Body */}
            <div style={{ padding: "24px" }}>
              <div style={{ background: "#F8FAFC", padding: "8px 12px", borderRadius: "8px", fontSize: "0.78rem", color: "#64748B", marginBottom: "16px", display: "flex", justifyContent: "space-between" }}>
                <span>ইনভয়েস: <strong>#{pendingOrderNo}</strong></span>
                <span style={{ color: "#10B981", fontWeight: 700 }}>Sandbox Live ⚡</span>
              </div>

              {modalStep === "PHONE" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  <label style={{ fontSize: "0.88rem", fontWeight: 700, color: "#1E293B" }}>
                    আপনার {paymentMethod === "BKASH" ? "বিকাশ" : "নগদ"} একাউন্ট নম্বর দিন
                  </label>
                  <input
                    type="tel"
                    value={walletPhone}
                    onChange={(e) => setWalletPhone(e.target.value)}
                    placeholder="01XXXXXXXXX"
                    style={{
                      width: "100%",
                      padding: "12px 14px",
                      borderRadius: "10px",
                      border: "1.5px solid #CBD5E1",
                      fontSize: "1rem",
                      fontWeight: 700,
                      outline: "none",
                    }}
                  />
                  <div style={{ fontSize: "0.72rem", color: "#64748B" }}>
                    * টেস্ট মোডে যেকোনো ১১ ডিজিটের নম্বর দিন।
                  </div>
                  <button
                    type="button"
                    onClick={() => setModalStep("OTP")}
                    style={{
                      width: "100%",
                      padding: "12px",
                      borderRadius: "10px",
                      background: paymentMethod === "BKASH" ? "#E2136E" : "#EA580C",
                      color: "#FFFFFF",
                      fontWeight: 800,
                      fontSize: "0.95rem",
                      marginTop: "6px",
                      cursor: "pointer",
                      border: "none",
                    }}
                  >
                    পরবর্তী (Next) →
                  </button>
                </div>
              )}

              {modalStep === "OTP" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  <label style={{ fontSize: "0.88rem", fontWeight: 700, color: "#1E293B" }}>
                    ভেরিফিকেশন কোড (OTP) প্রবেশ করুন
                  </label>
                  <input
                    type="text"
                    value={walletOtp}
                    onChange={(e) => setWalletOtp(e.target.value)}
                    placeholder="123456"
                    maxLength={6}
                    style={{
                      width: "100%",
                      padding: "12px 14px",
                      borderRadius: "10px",
                      border: "1.5px solid #CBD5E1",
                      fontSize: "1.2rem",
                      fontWeight: 800,
                      textAlign: "center",
                      letterSpacing: "0.3em",
                      outline: "none",
                    }}
                  />
                  <div style={{ fontSize: "0.72rem", color: "#10B981", fontWeight: 700 }}>
                    ✓ টেস্ট ভেরিফিকেশন কোড: <strong>123456</strong>
                  </div>
                  <button
                    type="button"
                    onClick={() => setModalStep("PIN")}
                    style={{
                      width: "100%",
                      padding: "12px",
                      borderRadius: "10px",
                      background: paymentMethod === "BKASH" ? "#E2136E" : "#EA580C",
                      color: "#FFFFFF",
                      fontWeight: 800,
                      fontSize: "0.95rem",
                      cursor: "pointer",
                      border: "none",
                    }}
                  >
                    OTP নিশ্চিত করুন →
                  </button>
                </div>
              )}

              {modalStep === "PIN" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  <label style={{ fontSize: "0.88rem", fontWeight: 700, color: "#1E293B" }}>
                    আপনার {paymentMethod === "BKASH" ? "বিকাশ" : "নগদ"} পিন (PIN) দিন
                  </label>
                  <input
                    type="password"
                    value={walletPin}
                    onChange={(e) => setWalletPin(e.target.value)}
                    placeholder="•••••"
                    maxLength={5}
                    style={{
                      width: "100%",
                      padding: "12px 14px",
                      borderRadius: "10px",
                      border: "1.5px solid #CBD5E1",
                      fontSize: "1.3rem",
                      fontWeight: 800,
                      textAlign: "center",
                      letterSpacing: "0.3em",
                      outline: "none",
                    }}
                  />
                  <div style={{ fontSize: "0.72rem", color: "#10B981", fontWeight: 700 }}>
                    ✓ স্যান্ডবক্স টেস্ট পিন: <strong>12121</strong>
                  </div>
                  <button
                    type="button"
                    onClick={handleExecutePayment}
                    disabled={isProcessing}
                    style={{
                      width: "100%",
                      padding: "13px",
                      borderRadius: "10px",
                      background: paymentMethod === "BKASH" ? "#E2136E" : "#EA580C",
                      color: "#FFFFFF",
                      fontWeight: 800,
                      fontSize: "1rem",
                      cursor: "pointer",
                      border: "none",
                      boxShadow: "0 4px 12px rgba(226, 19, 110, 0.3)",
                    }}
                  >
                    {isProcessing ? "পেমেন্ট প্রসেসিং হচ্ছে..." : `পেমেন্ট সম্পন্ন করুন (${formatPrice(grandTotal)})`}
                  </button>
                </div>
              )}

              <button
                type="button"
                onClick={() => setShowPaymentModal(false)}
                style={{
                  width: "100%",
                  padding: "8px",
                  marginTop: "12px",
                  color: "#64748B",
                  fontSize: "0.8rem",
                  cursor: "pointer",
                  background: "transparent",
                  border: "none",
                }}
              >
                পেমেন্ট বাতিল করুন (Cancel)
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
