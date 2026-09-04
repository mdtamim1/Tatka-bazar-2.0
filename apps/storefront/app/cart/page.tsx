"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShoppingBag,
  ShieldCheck,
  Truck,
  Store,
  ChevronRight,
} from "lucide-react";
import { useCartStore } from "@/lib/cart-store";
import { useLanguage } from "@/context/LanguageContext";

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

  const { t, formatPrice } = useLanguage();
  const [couponInput, setCouponInput] = useState("");
  const [couponStatus, setCouponStatus] = useState<{ text: string; isError: boolean } | null>(null);

  const subtotal = getSubtotal();
  const deliveryFee = getDeliveryFee();
  const discount = getDiscountAmount();
  const grandTotal = getGrandTotal();

  // Group items by vendor
  const vendorGroups = items.reduce((acc, item) => {
    const vId = item.product.vendorId || "tatka-central";
    const vNameEn = item.product.vendorNameEn || "Tatka Central Hub";
    const vNameBn = item.product.vendorNameBn || "Tatka Central Hub";

    let group = acc.find((g) => g.vendorId === vId);
    if (!group) {
      group = { vendorId: vId, vendorNameEn: vNameEn, vendorNameBn: vNameBn, items: [] };
      acc.push(group);
    }
    group.items.push(item);
    return acc;
  }, [] as Array<{ vendorId: string; vendorNameEn: string; vendorNameBn: string; items: typeof items }>);

  const handleCouponSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;

    const res = applyCoupon(couponInput.trim());
    setCouponStatus({
      text: res.message,
      isError: !res.success,
    });
  };

  if (items.length === 0) {
    return (
      <div style={{ padding: "80px 0", minHeight: "70vh", display: "flex", alignItems: "center" }}>
        <div className="container" style={{ textAlign: "center", maxWidth: "480px" }}>
          <div
            style={{
              width: "80px",
              height: "80px",
              borderRadius: "50%",
              background: "var(--primary-light)",
              color: "var(--primary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 20px",
            }}
          >
            <ShoppingBag size={40} />
          </div>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: "8px" }}>
            {t.emptyCart}
          </h2>
          <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", marginBottom: "24px" }}>
            Your shopping bag is empty. Explore our catalog to add fresh items.
          </p>
          <Link href="/" className="btn-primary" style={{ padding: "12px 28px" }}>
            {t.startShopping}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px 0 60px" }}>
      <div className="container">
        
        {/* Breadcrumb Navigation */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.82rem", color: "var(--text-muted)", marginBottom: "20px" }}>
          <Link href="/" style={{ color: "var(--primary)" }}>Home</Link>
          <ChevronRight size={14} />
          <span style={{ color: "var(--text-main)", fontWeight: 600 }}>Shopping Cart</span>
        </div>

        <h1 style={{ fontSize: "1.8rem", fontWeight: 800, color: "var(--text-main)", marginBottom: "24px" }}>
          {t.myCart} ({items.length} {t.items})
        </h1>

        {/* 2-Column Layout: Items List (Left) + Order Summary (Right) */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: "30px", alignItems: "flex-start" }}>
          
          {/* Left Column: Vendor Grouped Items */}
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {vendorGroups.map((group) => (
              <div
                key={group.vendorId}
                style={{
                  background: "var(--bg-surface)",
                  borderRadius: "var(--radius-xl)",
                  border: "1.5px solid var(--border-subtle)",
                  padding: "20px",
                  boxShadow: "var(--shadow-sm)",
                }}
              >
                {/* Vendor Header */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    paddingBottom: "12px",
                    borderBottom: "1px solid var(--border-subtle)",
                    marginBottom: "16px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <div style={{ padding: "6px", borderRadius: "8px", background: "var(--primary-light)", color: "var(--primary-dark)" }}>
                      <Store size={18} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: "0.95rem", color: "var(--primary-dark)" }}>
                        {group.vendorNameEn || group.vendorNameBn}
                      </div>
                      <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                        Packaged & verified by seller
                      </div>
                    </div>
                  </div>
                  <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--text-muted)" }}>
                    {group.items.length} {t.items}
                  </span>
                </div>

                {/* Items in this Vendor Group */}
                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  {group.items.map((item) => (
                    <div
                      key={item.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "16px",
                        paddingBottom: "14px",
                        borderBottom: "1px dashed var(--border-subtle)",
                      }}
                    >
                      <img
                        src={item.product.images[0]}
                        alt={item.product.nameEn || item.product.nameBn}
                        style={{ width: "70px", height: "70px", objectFit: "cover", borderRadius: "var(--radius-md)" }}
                      />

                      <div style={{ flex: 1 }}>
                        <Link href={`/product/${item.product.slug}`}>
                          <h3 style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--text-main)", lineHeight: 1.3 }}>
                            {item.product.nameEn || item.product.nameBn}
                          </h3>
                        </Link>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "4px" }}>
                          <span
                            style={{
                              fontSize: "0.75rem",
                              fontWeight: 700,
                              color: "var(--primary-dark)",
                              background: "var(--primary-light)",
                              padding: "2px 8px",
                              borderRadius: "var(--radius-sm)",
                            }}
                          >
                            {item.selectedWeight} {item.selectedUnit}
                          </span>
                          <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                            {formatPrice(item.unitPrice)} / {item.selectedUnit}
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
                          borderRadius: "var(--radius-md)",
                          padding: "4px",
                        }}
                      >
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          style={{
                            width: "28px",
                            height: "28px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            background: "var(--bg-surface)",
                            borderRadius: "4px",
                          }}
                        >
                          <Minus size={14} />
                        </button>
                        <span style={{ minWidth: "24px", textAlign: "center", fontWeight: 800, fontSize: "0.9rem" }}>
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          style={{
                            width: "28px",
                            height: "28px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            background: "var(--primary)",
                            color: "#FFF",
                            borderRadius: "4px",
                          }}
                        >
                          <Plus size={14} />
                        </button>
                      </div>

                      {/* Line Total */}
                      <div style={{ minWidth: "90px", textAlign: "right" }}>
                        <div style={{ fontSize: "1.05rem", fontWeight: 800, color: "var(--primary-dark)" }}>
                          {formatPrice(item.totalPrice)}
                        </div>
                      </div>

                      {/* Remove */}
                      <button
                        onClick={() => removeItem(item.id)}
                        style={{ color: "var(--text-muted)", padding: "6px" }}
                        title="Remove"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Right Column: Calculations & Checkout Summary */}
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

            {/* Coupon Code Section */}
            <form onSubmit={handleCouponSubmit} style={{ marginBottom: "18px" }}>
              <label style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--text-muted)", display: "block", marginBottom: "6px" }}>
                🏷️ Promo Code or Coupon:
              </label>
              <div style={{ display: "flex", gap: "8px" }}>
                <input
                  type="text"
                  placeholder="WELCOME10"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  style={{
                    flex: 1,
                    padding: "9px 12px",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid var(--border-medium)",
                    fontSize: "0.85rem",
                    outline: "none",
                  }}
                />
                <button
                  type="submit"
                  style={{
                    padding: "9px 16px",
                    background: "var(--primary-dark)",
                    color: "#FFF",
                    borderRadius: "var(--radius-md)",
                    fontWeight: 700,
                    fontSize: "0.85rem",
                  }}
                >
                  {t.applyCoupon}
                </button>
              </div>
              {couponStatus && (
                <div style={{ fontSize: "0.75rem", marginTop: "4px", color: couponStatus.isError ? "var(--crimson)" : "var(--primary)", fontWeight: 700 }}>
                  {couponStatus.text}
                </div>
              )}
              {appliedCoupon && (
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--primary-light)", padding: "6px 10px", borderRadius: "var(--radius-sm)", marginTop: "8px", fontSize: "0.8rem", fontWeight: 700, color: "var(--primary-dark)" }}>
                  <span>{appliedCoupon.code} (-{formatPrice(discount)})</span>
                  <button onClick={removeCoupon} style={{ color: "var(--crimson)" }}>✕</button>
                </div>
              )}
            </form>

            {/* Breakdown List */}
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
                  fontSize: "1.2rem",
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

            {/* Checkout Action Button */}
            <Link
              href="/checkout"
              className="btn-primary"
              style={{
                width: "100%",
                padding: "14px",
                fontSize: "1.05rem",
                borderRadius: "var(--radius-md)",
              }}
            >
              <span>{t.proceedToCheckout}</span>
              <ArrowRight size={18} />
            </Link>

            {/* Guarantees */}
            <div style={{ marginTop: "20px", display: "flex", flexDirection: "column", gap: "8px", fontSize: "0.75rem", color: "var(--text-muted)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <ShieldCheck size={16} color="var(--primary)" />
                <span>100% Secure Checkout & Fresh Guarantee</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <Truck size={16} color="var(--accent)" />
                <span>Express doorstep delivery in selected slot</span>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
