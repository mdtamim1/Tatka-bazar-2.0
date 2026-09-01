"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  X, Plus, Minus, Trash2, ShoppingBag, ArrowRight, Tag, ShieldCheck,
  Sparkles, Store, Check, Zap, Truck, AlertCircle, RefreshCw
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useCartStore } from "@/lib/cart-store";

export function CartDrawer() {
  const { locale, t, formatPrice } = useLanguage();
  const {
    items,
    isOpen,
    closeCart,
    updateQuantity,
    removeItem,
    getSubtotal,
    getDiscountAmount,
    getDeliveryFee,
    getGrandTotal,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    getVendorGroups,
  } = useCartStore();

  const [couponCode, setCouponCode] = useState("");
  const [couponMsg, setCouponMsg] = useState<{ text: string; isError: boolean } | null>(null);
  const [animatingItemId, setAnimatingItemId] = useState<string | null>(null);

  if (!isOpen) return null;

  const vendorGroups = getVendorGroups();
  const subtotal = getSubtotal();
  const discount = getDiscountAmount();
  const deliveryFee = getDeliveryFee();
  const grandTotal = getGrandTotal();
  const freeShippingThreshold = 999;
  const freeShippingPercent = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    const res = applyCoupon(couponCode);
    setCouponMsg({ text: res.message, isError: !res.success });
    if (res.success) {
      setCouponCode("");
    }
  };

  const handleUpdateQty = (itemId: string, newQty: number) => {
    setAnimatingItemId(itemId);
    updateQuantity(itemId, newQty);
    setTimeout(() => setAnimatingItemId(null), 300);
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        justifyContent: "flex-end",
        animation: "fadeIn 0.25s var(--ease-out)",
      }}
    >
      {/* Dynamic Backdrop */}
      <div
        onClick={closeCart}
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(4, 6, 8, 0.75)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          transition: "opacity 0.3s ease",
        }}
      />

      {/* Drawer Container */}
      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: "480px",
          height: "100%",
          background: "linear-gradient(180deg, #0D1117 0%, #080A0F 100%)",
          display: "flex",
          flexDirection: "column",
          boxShadow: "-12px 0 60px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.08)",
          zIndex: 10000,
          animation: "slideInRight 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
          overflow: "hidden",
        }}
      >
        {/* Neon Accent Glow Line */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "2px",
            background: "linear-gradient(90deg, #10D876, #F5C842, #4F9EFF)",
            boxShadow: "0 0 16px rgba(16, 216, 118, 0.8)",
            zIndex: 10,
          }}
        />

        {/* ── Header ── */}
        <div
          style={{
            padding: "20px 24px",
            borderBottom: "1px solid rgba(255, 255, 255, 0.07)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "rgba(16, 216, 118, 0.03)",
            backdropFilter: "blur(20px)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                width: "42px",
                height: "42px",
                borderRadius: "12px",
                background: "linear-gradient(135deg, rgba(16,216,118,0.2), rgba(5,158,87,0.1))",
                border: "1px solid rgba(16,216,118,0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 18px rgba(16,216,118,0.25)",
              }}
            >
              <ShoppingBag size={20} color="var(--emerald)" />
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <h2
                  style={{
                    fontSize: "1.15rem",
                    fontWeight: 800,
                    color: "var(--text-main)",
                    letterSpacing: "-0.03em",
                    fontFamily: "var(--font-heading)",
                  }}
                >
                  {t.myCart}
                </h2>
                <span
                  style={{
                    fontSize: "0.68rem",
                    fontWeight: 800,
                    padding: "2px 8px",
                    borderRadius: "999px",
                    background: "rgba(16,216,118,0.15)",
                    color: "var(--emerald)",
                    border: "1px solid rgba(16,216,118,0.3)",
                  }}
                >
                  {items.length} {locale === "bn" ? "টি পণ্য" : "items"}
                </span>
              </div>
              <p style={{ fontSize: "0.74rem", color: "var(--text-muted)", marginTop: "2px" }}>
                {locale === "bn" ? "তাজা খামারের নিরাপদ ডেলিভারি" : "Farm-fresh certified express dispatch"}
              </p>
            </div>
          </div>

          <button
            onClick={closeCart}
            aria-label="Close Cart"
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              background: "rgba(255, 255, 255, 0.06)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              color: "var(--text-muted)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              transition: "all var(--t-fast)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255, 77, 109, 0.15)";
              e.currentTarget.style.color = "var(--rose)";
              e.currentTarget.style.borderColor = "rgba(255, 77, 109, 0.3)";
              e.currentTarget.style.transform = "rotate(90deg)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.06)";
              e.currentTarget.style.color = "var(--text-muted)";
              e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.1)";
              e.currentTarget.style.transform = "rotate(0deg)";
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* ── Free Shipping Progress Bar (Gamified) ── */}
        <div
          style={{
            padding: "12px 24px",
            background: "rgba(13, 17, 23, 0.95)",
            borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
          }}
        >
          {subtotal >= freeShippingThreshold ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "0.82rem",
                color: "var(--emerald)",
                fontWeight: 700,
                padding: "4px 0",
              }}
            >
              <div
                style={{
                  width: "22px",
                  height: "22px",
                  borderRadius: "50%",
                  background: "rgba(16,216,118,0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Sparkles size={13} color="var(--emerald)" />
              </div>
              <span>
                {locale === "bn"
                  ? "🎉 অভিনন্দন! আপনি ফ্রি এক্সপ্রেস ডেলিভারি পেয়েছেন!"
                  : "🎉 High Five! You unlocked 100% FREE Express Delivery!"}
              </span>
            </div>
          ) : (
            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "0.78rem",
                  fontWeight: 600,
                  color: "var(--text-body)",
                  marginBottom: "8px",
                }}
              >
                <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <Truck size={14} color="var(--gold)" />
                  {locale === "bn"
                    ? `আর ${formatPrice(freeShippingThreshold - subtotal)} যোগ করলেই ফ্রি ডেলিভারি!`
                    : `Add ${formatPrice(freeShippingThreshold - subtotal)} more to unlock FREE Delivery`}
                </span>
                <span style={{ color: "var(--emerald)", fontWeight: 800 }}>{freeShippingPercent}%</span>
              </div>
              <div
                style={{
                  width: "100%",
                  height: "7px",
                  background: "rgba(255, 255, 255, 0.07)",
                  borderRadius: "999px",
                  overflow: "hidden",
                  padding: "1px",
                  border: "1px solid rgba(255, 255, 255, 0.05)",
                }}
              >
                <div
                  style={{
                    width: `${freeShippingPercent}%`,
                    height: "100%",
                    background: "linear-gradient(90deg, #10D876 0%, #F5C842 100%)",
                    borderRadius: "999px",
                    transition: "width 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
                    boxShadow: "0 0 12px rgba(16, 216, 118, 0.6)",
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* ── Drawer Body — Multi-Vendor Grouped Items ── */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "20px 24px",
            display: "flex",
            flexDirection: "column",
            gap: "18px",
          }}
        >
          {items.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "60px 16px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
              }}
            >
              <div
                style={{
                  width: "88px",
                  height: "88px",
                  borderRadius: "28px",
                  background: "linear-gradient(135deg, rgba(16,216,118,0.1), rgba(245,200,66,0.05))",
                  border: "1px solid rgba(16,216,118,0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "20px",
                  animation: "gravityFloat 4s ease-in-out infinite",
                  boxShadow: "0 12px 36px rgba(0, 0, 0, 0.4)",
                }}
              >
                <ShoppingBag size={42} color="var(--emerald)" />
              </div>
              <h3
                style={{
                  fontSize: "1.2rem",
                  fontWeight: 800,
                  color: "var(--text-main)",
                  marginBottom: "8px",
                  fontFamily: "var(--font-heading)",
                }}
              >
                {t.emptyCart}
              </h3>
              <p
                style={{
                  fontSize: "0.85rem",
                  color: "var(--text-muted)",
                  maxWidth: "280px",
                  lineHeight: 1.6,
                  marginBottom: "28px",
                }}
              >
                {t.emptyCartMsg || (locale === "bn" ? "আপনার ঝুড়িতে এখনও কোনো পণ্য যোগ করা হয়নি।" : "Your fresh basket is currently empty.")}
              </p>
              <button
                onClick={closeCart}
                className="btn-primary"
                style={{
                  width: "100%",
                  maxWidth: "260px",
                  padding: "14px 24px",
                  fontSize: "0.9rem",
                  fontWeight: 800,
                }}
              >
                <span>{t.startShopping}</span>
                <ArrowRight size={16} />
              </button>
            </div>
          ) : (
            vendorGroups.map((group) => (
              <div
                key={group.vendorId}
                style={{
                  background: "rgba(255, 255, 255, 0.025)",
                  borderRadius: "var(--radius-lg)",
                  border: "1px solid rgba(255, 255, 255, 0.07)",
                  padding: "16px",
                  boxShadow: "var(--shadow-sm)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                }}
              >
                {/* Vendor Header */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    paddingBottom: "10px",
                    borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <div
                      style={{
                        padding: "4px 8px",
                        borderRadius: "6px",
                        background: "rgba(16,216,118,0.1)",
                        color: "var(--emerald)",
                        display: "flex",
                        alignItems: "center",
                        gap: "5px",
                        fontSize: "0.72rem",
                        fontWeight: 700,
                        border: "1px solid rgba(16,216,118,0.2)",
                      }}
                    >
                      <Store size={12} />
                      <span>{locale === "bn" ? group.vendorNameBn : group.vendorNameEn}</span>
                    </div>
                  </div>
                  <span
                    style={{
                      fontSize: "0.7rem",
                      color: "var(--text-muted)",
                      fontWeight: 600,
                    }}
                  >
                    {group.items.length} {locale === "bn" ? "টি আইটেম" : "items"}
                  </span>
                </div>

                {/* Items in Vendor Group */}
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {group.items.map((item) => {
                    const isBouncing = animatingItemId === item.id;
                    return (
                      <div
                        key={item.id}
                        style={{
                          display: "flex",
                          gap: "12px",
                          background: "rgba(19, 23, 32, 0.7)",
                          padding: "12px",
                          borderRadius: "var(--radius-md)",
                          alignItems: "center",
                          border: "1px solid rgba(255, 255, 255, 0.04)",
                          transition: "all var(--t-fast)",
                          transform: isBouncing ? "scale(1.02)" : "scale(1)",
                        }}
                      >
                        {/* Thumbnail */}
                        <div
                          style={{
                            width: "56px",
                            height: "56px",
                            borderRadius: "var(--radius-sm)",
                            overflow: "hidden",
                            background: "var(--bg-subtle)",
                            border: "1px solid rgba(255, 255, 255, 0.08)",
                            flexShrink: 0,
                            position: "relative",
                          }}
                        >
                          <img
                            src={item.product.images[0]}
                            alt={locale === "bn" ? item.product.nameBn : item.product.nameEn}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                          />
                        </div>

                        {/* Details */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <h4
                            style={{
                              fontSize: "0.85rem",
                              fontWeight: 700,
                              color: "var(--text-main)",
                              lineHeight: 1.3,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                              fontFamily: "var(--font-heading)",
                            }}
                          >
                            {locale === "bn" ? item.product.nameBn : item.product.nameEn}
                          </h4>

                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                              marginTop: "4px",
                              flexWrap: "wrap",
                            }}
                          >
                            <span
                              style={{
                                fontSize: "0.68rem",
                                fontWeight: 700,
                                color: "var(--emerald)",
                                background: "rgba(16,216,118,0.1)",
                                padding: "2px 7px",
                                borderRadius: "var(--radius-full)",
                                border: "1px solid rgba(16,216,118,0.25)",
                              }}
                            >
                              {item.selectedWeight} {item.selectedUnit}
                            </span>
                            <span
                              style={{
                                fontSize: "0.86rem",
                                fontWeight: 800,
                                color: "var(--text-main)",
                              }}
                            >
                              {formatPrice(item.totalPrice)}
                            </span>
                          </div>
                        </div>

                        {/* Quantity Stepper */}
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                            background: "rgba(255, 255, 255, 0.05)",
                            borderRadius: "var(--radius-full)",
                            padding: "3px 6px",
                            border: "1px solid rgba(255, 255, 255, 0.08)",
                          }}
                        >
                          <button
                            onClick={() => handleUpdateQty(item.id, item.quantity - 1)}
                            aria-label="Decrease quantity"
                            style={{
                              width: "22px",
                              height: "22px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              background: "rgba(255, 255, 255, 0.08)",
                              borderRadius: "50%",
                              color: "var(--text-body)",
                              cursor: "pointer",
                              border: "none",
                              transition: "all var(--t-fast)",
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255, 77, 109, 0.2)")}
                            onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255, 255, 255, 0.08)")}
                          >
                            <Minus size={11} />
                          </button>
                          <span
                            style={{
                              fontSize: "0.82rem",
                              fontWeight: 800,
                              minWidth: "18px",
                              textAlign: "center",
                              color: "var(--text-main)",
                            }}
                          >
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => handleUpdateQty(item.id, item.quantity + 1)}
                            aria-label="Increase quantity"
                            style={{
                              width: "22px",
                              height: "22px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              background: "linear-gradient(135deg, #10D876, #059E57)",
                              borderRadius: "50%",
                              color: "var(--bg-page)",
                              cursor: "pointer",
                              border: "none",
                              transition: "all var(--t-fast)",
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.15)")}
                            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                          >
                            <Plus size={11} />
                          </button>
                        </div>

                        {/* Remove Trash Button */}
                        <button
                          onClick={() => removeItem(item.id)}
                          aria-label="Remove item"
                          style={{
                            color: "var(--text-subtle)",
                            padding: "6px",
                            cursor: "pointer",
                            border: "none",
                            background: "none",
                            borderRadius: "6px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            transition: "all var(--t-fast)",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.color = "var(--rose)";
                            e.currentTarget.style.background = "rgba(255, 77, 109, 0.1)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.color = "var(--text-subtle)";
                            e.currentTarget.style.background = "none";
                          }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>

        {/* ── Drawer Footer — Calculations & Checkout Action ── */}
        {items.length > 0 && (
          <div
            style={{
              padding: "20px 24px",
              borderTop: "1px solid rgba(255, 255, 255, 0.08)",
              background: "rgba(10, 13, 18, 0.98)",
              boxShadow: "0 -8px 32px rgba(0, 0, 0, 0.6)",
              backdropFilter: "blur(20px)",
              display: "flex",
              flexDirection: "column",
              gap: "14px",
            }}
          >
            {/* Coupon Box */}
            <form onSubmit={handleApplyCoupon} style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <div style={{ display: "flex", gap: "8px" }}>
                <div style={{ position: "relative", flex: 1 }}>
                  <input
                    type="text"
                    placeholder={t.couponPlaceholder || (locale === "bn" ? "কুপন কোড (যেমন: TATKA10)" : "Promo Code (e.g. TATKA10)")}
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    style={{
                      width: "100%",
                      padding: "10px 14px 10px 34px",
                      borderRadius: "var(--radius-md)",
                      background: "rgba(255, 255, 255, 0.04)",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      color: "var(--text-main)",
                      fontSize: "0.82rem",
                      fontWeight: 600,
                      outline: "none",
                      transition: "all var(--t-fast)",
                    }}
                    onFocus={(e) => (e.currentTarget.style.borderColor = "var(--emerald)")}
                    onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.1)")}
                  />
                  <Tag
                    size={14}
                    color="var(--text-muted)"
                    style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }}
                  />
                </div>
                <button
                  type="submit"
                  style={{
                    padding: "10px 18px",
                    background: "rgba(16, 216, 118, 0.15)",
                    border: "1px solid rgba(16, 216, 118, 0.3)",
                    color: "var(--emerald)",
                    borderRadius: "var(--radius-md)",
                    fontWeight: 700,
                    fontSize: "0.82rem",
                    cursor: "pointer",
                    transition: "all var(--t-fast)",
                    whiteSpace: "nowrap",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "var(--emerald)";
                    e.currentTarget.style.color = "var(--bg-page)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(16, 216, 118, 0.15)";
                    e.currentTarget.style.color = "var(--emerald)";
                  }}
                >
                  {t.applyCoupon}
                </button>
              </div>

              {couponMsg && (
                <div
                  style={{
                    fontSize: "0.74rem",
                    color: couponMsg.isError ? "var(--rose)" : "var(--emerald)",
                    fontWeight: 600,
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                    paddingLeft: "4px",
                  }}
                >
                  {couponMsg.isError ? <AlertCircle size={12} /> : <Check size={12} />}
                  <span>{couponMsg.text}</span>
                </div>
              )}

              {appliedCoupon && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "6px 12px",
                    background: "rgba(16,216,118,0.1)",
                    border: "1px solid rgba(16,216,118,0.25)",
                    borderRadius: "var(--radius-sm)",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    color: "var(--emerald)",
                  }}
                >
                  <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <Sparkles size={12} />
                    {appliedCoupon.code} (-{formatPrice(discount)})
                  </span>
                  <button
                    type="button"
                    onClick={removeCoupon}
                    aria-label="Remove coupon"
                    style={{
                      color: "var(--rose)",
                      cursor: "pointer",
                      border: "none",
                      background: "none",
                      padding: "2px",
                    }}
                  >
                    <X size={13} />
                  </button>
                </div>
              )}
            </form>

            {/* Calculations Breakdown */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "7px",
                fontSize: "0.84rem",
                padding: "12px 14px",
                background: "rgba(255, 255, 255, 0.02)",
                borderRadius: "var(--radius-md)",
                border: "1px solid rgba(255, 255, 255, 0.05)",
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
                  fontSize: "1.1rem",
                  fontWeight: 900,
                  color: "var(--text-main)",
                  paddingTop: "8px",
                  borderTop: "1px dashed rgba(255, 255, 255, 0.1)",
                  fontFamily: "var(--font-heading)",
                }}
              >
                <span>{t.grandTotal}</span>
                <span className="gradient-text-emerald">{formatPrice(grandTotal)}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <Link
                href="/checkout"
                onClick={closeCart}
                className="btn-primary"
                style={{
                  width: "100%",
                  padding: "14px",
                  fontSize: "1rem",
                  fontWeight: 800,
                  letterSpacing: "-0.01em",
                }}
              >
                <span>{t.proceedToCheckout}</span>
                <ArrowRight size={18} />
              </Link>
              <Link
                href="/cart"
                onClick={closeCart}
                style={{
                  textAlign: "center",
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  color: "var(--text-muted)",
                  padding: "6px",
                  transition: "color var(--t-fast)",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "var(--emerald)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
              >
                {locale === "bn" ? "বিস্তারিত কার্ট এবং নোটস দেখুন →" : "View full cart breakdown & notes →"}
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
