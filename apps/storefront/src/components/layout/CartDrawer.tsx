"use client";

import React, { useState } from "react";
import Link from "next/link";
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight, Tag, ShieldCheck, Sparkles, Store } from "lucide-react";
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

  if (!isOpen) return null;

  const vendorGroups = getVendorGroups();
  const subtotal = getSubtotal();
  const discount = getDiscountAmount();
  const deliveryFee = getDeliveryFee();
  const grandTotal = getGrandTotal();

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    const res = applyCoupon(couponCode);
    setCouponMsg({ text: res.message, isError: !res.success });
    if (res.success) {
      setCouponCode("");
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 500,
        display: "flex",
        justifyContent: "flex-end",
        animation: "fadeIn 0.2s ease-out",
      }}
    >
      {/* Backdrop */}
      <div
        onClick={closeCart}
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(15, 26, 19, 0.6)",
          backdropFilter: "blur(4px)",
        }}
      />

      {/* Drawer Container */}
      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: "440px",
          height: "100%",
          background: "var(--bg-surface)",
          display: "flex",
          flexDirection: "column",
          boxShadow: "var(--shadow-xl)",
          zIndex: 510,
          animation: "slideInRight 0.25s ease-out",
        }}
      >
        {/* Drawer Header */}
        <div
          style={{
            padding: "16px 20px",
            borderBottom: "1px solid var(--border-subtle)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "var(--primary-light)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <ShoppingBag size={22} color="var(--primary)" />
            <div>
              <h2 style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--primary-dark)", lineHeight: 1.1 }}>
                {t.myCart}
              </h2>
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 600 }}>
                {items.length} {t.items}
              </span>
            </div>
          </div>
          <button
            onClick={closeCart}
            style={{
              padding: "6px",
              borderRadius: "50%",
              background: "var(--bg-surface)",
              color: "var(--text-main)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Free Shipping Progress Indicator */}
        <div style={{ padding: "10px 20px", background: "#F6FBF8", borderBottom: "1px solid var(--border-subtle)" }}>
          {subtotal >= 999 ? (
            <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.82rem", color: "var(--primary-dark)", fontWeight: 700 }}>
              <Sparkles size={16} color="var(--primary)" />
              <span>{locale === "bn" ? "🎉 অভিনন্দন! আপনি ফ্রি ডেলিভারি পেয়েছেন!" : "🎉 Congrats! You unlocked FREE Delivery!"}</span>
            </div>
          ) : (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.78rem", fontWeight: 600, color: "var(--text-muted)" }}>
                <span>{locale === "bn" ? `আর ${formatPrice(999 - subtotal)} কিনলে ফ্রি ডেলিভারি!` : `Add ${formatPrice(999 - subtotal)} more for FREE Delivery!`}</span>
                <span>{Math.round((subtotal / 999) * 100)}%</span>
              </div>
              <div style={{ width: "100%", height: "6px", background: "var(--border-subtle)", borderRadius: "9999px", marginTop: "6px", overflow: "hidden" }}>
                <div
                  style={{
                    width: `${Math.min(100, (subtotal / 999) * 100)}%`,
                    height: "100%",
                    background: "linear-gradient(90deg, var(--primary), var(--accent))",
                    borderRadius: "9999px",
                    transition: "width 0.3s ease",
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Drawer Body — Items Grouped by Multi-Vendor Sellers */}
        <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px" }}>
          {items.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 10px", color: "var(--text-muted)" }}>
              <div
                style={{
                  width: "70px",
                  height: "70px",
                  borderRadius: "50%",
                  background: "var(--primary-light)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 16px",
                  color: "var(--primary)",
                }}
              >
                <ShoppingBag size={36} />
              </div>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-main)", marginBottom: "6px" }}>
                {t.emptyCart}
              </h3>
              <p style={{ fontSize: "0.85rem", marginBottom: "20px" }}>{t.emptyCartMsg}</p>
              <button onClick={closeCart} className="btn-primary" style={{ width: "100%" }}>
                {t.startShopping}
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
              {vendorGroups.map((group) => (
                <div
                  key={group.vendorId}
                  style={{
                    background: "var(--bg-subtle)",
                    borderRadius: "var(--radius-md)",
                    padding: "12px",
                    border: "1px solid var(--border-subtle)",
                  }}
                >
                  {/* Vendor Tag */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      color: "var(--primary-dark)",
                      marginBottom: "10px",
                      paddingBottom: "6px",
                      borderBottom: "1px dashed var(--border-medium)",
                    }}
                  >
                    <Store size={14} color="var(--primary)" />
                    <span>{locale === "bn" ? group.vendorNameBn : group.vendorNameEn}</span>
                    <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontWeight: 500 }}>
                      ({group.items.length} {t.items})
                    </span>
                  </div>

                  {/* Items for this vendor */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {group.items.map((item) => (
                      <div
                        key={item.id}
                        style={{
                          display: "flex",
                          gap: "10px",
                          background: "var(--bg-surface)",
                          padding: "8px 10px",
                          borderRadius: "var(--radius-sm)",
                          alignItems: "center",
                        }}
                      >
                        <img
                          src={item.product.images[0]}
                          alt={locale === "bn" ? item.product.nameBn : item.product.nameEn}
                          style={{
                            width: "50px",
                            height: "50px",
                            objectFit: "cover",
                            borderRadius: "var(--radius-sm)",
                          }}
                        />
                        <div style={{ flex: 1 }}>
                          <h4 style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-main)", lineHeight: 1.2 }}>
                            {locale === "bn" ? item.product.nameBn : item.product.nameEn}
                          </h4>
                          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "2px" }}>
                            <span
                              style={{
                                fontSize: "0.72rem",
                                fontWeight: 700,
                                color: "var(--primary-dark)",
                                background: "var(--primary-light)",
                                padding: "1px 6px",
                                borderRadius: "var(--radius-sm)",
                              }}
                            >
                              {locale === "bn"
                                ? `${item.selectedWeight} ${item.selectedUnit}`
                                : `${item.selectedWeight} ${item.selectedUnit}`}
                            </span>
                            <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--text-main)" }}>
                              {formatPrice(item.totalPrice)}
                            </span>
                          </div>
                        </div>

                        {/* Quantity Stepper */}
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            background: "var(--bg-subtle)",
                            borderRadius: "var(--radius-sm)",
                            padding: "2px",
                          }}
                        >
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            style={{
                              width: "24px",
                              height: "24px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              background: "var(--bg-surface)",
                              borderRadius: "4px",
                            }}
                          >
                            <Minus size={13} />
                          </button>
                          <span style={{ fontSize: "0.85rem", fontWeight: 700, minWidth: "16px", textAlign: "center" }}>
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            style={{
                              width: "24px",
                              height: "24px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              background: "var(--primary)",
                              color: "#FFF",
                              borderRadius: "4px",
                            }}
                          >
                            <Plus size={13} />
                          </button>
                        </div>

                        {/* Remove */}
                        <button
                          onClick={() => removeItem(item.id)}
                          style={{ color: "var(--text-muted)", padding: "4px" }}
                          title="Remove"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Drawer Footer — Calculations & Checkout */}
        {items.length > 0 && (
          <div
            style={{
              padding: "16px 20px",
              borderTop: "1px solid var(--border-subtle)",
              background: "var(--bg-surface)",
              boxShadow: "0 -4px 12px rgba(0,0,0,0.05)",
            }}
          >
            {/* Coupon Box */}
            <form onSubmit={handleApplyCoupon} style={{ marginBottom: "12px" }}>
              <div style={{ display: "flex", gap: "8px" }}>
                <input
                  type="text"
                  placeholder={t.couponPlaceholder}
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  style={{
                    flex: 1,
                    padding: "8px 12px",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid var(--border-medium)",
                    fontSize: "0.82rem",
                    outline: "none",
                  }}
                />
                <button
                  type="submit"
                  style={{
                    padding: "8px 14px",
                    background: "var(--primary-dark)",
                    color: "#FFF",
                    borderRadius: "var(--radius-md)",
                    fontWeight: 600,
                    fontSize: "0.82rem",
                  }}
                >
                  {t.applyCoupon}
                </button>
              </div>
              {couponMsg && (
                <div
                  style={{
                    fontSize: "0.75rem",
                    marginTop: "4px",
                    color: couponMsg.isError ? "var(--crimson)" : "var(--primary)",
                    fontWeight: 600,
                  }}
                >
                  {couponMsg.text}
                </div>
              )}
              {appliedCoupon && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "4px 8px",
                    background: "var(--primary-light)",
                    borderRadius: "var(--radius-sm)",
                    marginTop: "6px",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    color: "var(--primary-dark)",
                  }}
                >
                  <span>
                    🏷️ {appliedCoupon.code} (-{formatPrice(discount)})
                  </span>
                  <button onClick={removeCoupon} style={{ color: "var(--crimson)" }}>
                    <X size={14} />
                  </button>
                </div>
              )}
            </form>

            {/* Calculations Breakdown */}
            <div style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "0.85rem", marginBottom: "14px" }}>
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
                  fontSize: "1.05rem",
                  fontWeight: 800,
                  color: "var(--primary-dark)",
                  paddingTop: "6px",
                  borderTop: "1px dashed var(--border-medium)",
                }}
              >
                <span>{t.grandTotal}</span>
                <span>{formatPrice(grandTotal)}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <Link
                href="/checkout"
                onClick={closeCart}
                className="btn-primary"
                style={{ width: "100%", padding: "12px", fontSize: "1rem" }}
              >
                <span>{t.proceedToCheckout}</span>
                <ArrowRight size={18} />
              </Link>
              <Link
                href="/cart"
                onClick={closeCart}
                className="btn-secondary"
                style={{ width: "100%", padding: "8px", fontSize: "0.85rem" }}
              >
                {locale === "bn" ? "বিস্তারিত কার্ট পেজ দেখুন" : "View Full Cart Details"}
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
