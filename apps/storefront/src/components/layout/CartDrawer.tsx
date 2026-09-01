"use client";

import React, { useState } from "react";
import Link from "next/link";
import { X, Plus, Minus, ShoppingBag } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useCartStore } from "@/lib/cart-store";

export function CartDrawer() {
  const { locale, formatPrice } = useLanguage();
  const {
    items,
    isOpen,
    closeCart,
    updateQuantity,
    removeItem,
    getGrandTotal,
  } = useCartStore();

  const [orderInstructions, setOrderInstructions] = useState("");
  const [showInstructions, setShowInstructions] = useState(false);

  if (!isOpen) return null;

  const grandTotal = getGrandTotal();

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
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
          background: "rgba(0, 0, 0, 0.65)",
          backdropFilter: "blur(6px)",
          WebkitBackdropFilter: "blur(6px)",
        }}
      />

      {/* Drawer Container */}
      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: "460px",
          height: "100%",
          background: "#ffffff",
          color: "#0f172a",
          display: "flex",
          flexDirection: "column",
          boxShadow: "-8px 0 32px rgba(0, 0, 0, 0.25)",
          zIndex: 10000,
          animation: "slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
          fontFamily: "var(--font-body, system-ui, -apple-system, sans-serif)",
        }}
      >
        {/* ── Header ── */}
        <div
          style={{
            padding: "20px 24px",
            borderBottom: "1px solid #e2e8f0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "#ffffff",
          }}
        >
          <h2
            style={{
              fontSize: "1.35rem",
              fontWeight: 800,
              color: "#0f172a",
              letterSpacing: "-0.02em",
              margin: 0,
            }}
          >
            Shopping Cart
          </h2>

          <button
            onClick={closeCart}
            aria-label="Close Cart"
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "6px",
              background: "#0f172a",
              border: "none",
              color: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              transition: "transform 0.15s ease",
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.05)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; }}
          >
            <X size={16} />
          </button>
        </div>

        {/* ── Items List ── */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "20px 24px",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
            background: "#f8fafc",
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
                color: "#64748b",
              }}
            >
              <div
                style={{
                  width: "64px",
                  height: "64px",
                  borderRadius: "50%",
                  background: "#e2e8f0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "16px",
                  color: "#0f172a",
                }}
              >
                <ShoppingBag size={28} />
              </div>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#0f172a", margin: "0 0 6px 0" }}>
                Your cart is empty
              </h3>
              <p style={{ fontSize: "0.85rem", color: "#64748b", margin: "0 0 20px 0" }}>
                Add farm-fresh groceries, fish, and produce to get started.
              </p>
              <button
                onClick={closeCart}
                style={{
                  padding: "10px 24px",
                  background: "#0f172a",
                  color: "#ffffff",
                  borderRadius: "8px",
                  fontWeight: 700,
                  fontSize: "0.88rem",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Start Shopping
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                style={{
                  background: "#ffffff",
                  border: "1px solid #e2e8f0",
                  borderRadius: "14px",
                  padding: "16px",
                  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "14px",
                }}
              >
                {/* Left: Thumbnail & Details */}
                <div style={{ display: "flex", alignItems: "center", gap: "14px", flex: 1, minWidth: 0 }}>
                  <img
                    src={item.product?.images?.[0] || "https://images.unsplash.com/photo-1544943910-4c1dc44a0b27?w=300&auto=format&fit=crop&q=80"}
                    alt={locale === "bn" ? item.product?.nameBn : item.product?.nameEn}
                    style={{
                      width: "74px",
                      height: "74px",
                      borderRadius: "10px",
                      objectFit: "cover",
                      backgroundColor: "#f1f5f9",
                      border: "1px solid #e2e8f0",
                      flexShrink: 0,
                    }}
                  />
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <h4
                      style={{
                        fontSize: "0.95rem",
                        fontWeight: 700,
                        color: "#0f172a",
                        margin: "0 0 3px 0",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {locale === "bn" ? item.product?.nameBn : item.product?.nameEn}
                    </h4>
                    <p
                      style={{
                        fontSize: "0.78rem",
                        color: "#64748b",
                        margin: "0 0 6px 0",
                      }}
                    >
                      Weight: {item.selectedWeight} {item.selectedUnit} • Fresh
                    </p>
                    <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
                      <span
                        style={{
                          fontSize: "1.05rem",
                          fontWeight: 800,
                          color: "#e11d48",
                        }}
                      >
                        {formatPrice(item.unitPrice * item.quantity)}
                      </span>
                      {item.product?.comparePrice && (
                        <span
                          style={{
                            fontSize: "0.78rem",
                            color: "#94a3b8",
                            textDecoration: "line-through",
                          }}
                        >
                          {formatPrice(item.product.comparePrice * item.quantity)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Quantity Controls & Remove */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "8px", flexShrink: 0 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      border: "1px solid #cbd5e1",
                      borderRadius: "6px",
                      padding: "3px 8px",
                      gap: "10px",
                      background: "#ffffff",
                    }}
                  >
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#0f172a",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        padding: "2px",
                      }}
                      aria-label="Decrease quantity"
                    >
                      <Minus size={13} />
                    </button>
                    <span style={{ fontSize: "0.9rem", fontWeight: 700, color: "#0f172a", minWidth: "16px", textAlign: "center" }}>
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#0f172a",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        padding: "2px",
                      }}
                      aria-label="Increase quantity"
                    >
                      <Plus size={13} />
                    </button>
                  </div>

                  <button
                    onClick={() => removeItem(item.id)}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#e11d48",
                      fontSize: "0.78rem",
                      fontWeight: 600,
                      textDecoration: "underline",
                      cursor: "pointer",
                      padding: "2px",
                    }}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* ── Footer / Summary Section ── */}
        {items.length > 0 && (
          <div
            style={{
              padding: "20px 24px",
              background: "#ffffff",
              borderTop: "1px solid #e2e8f0",
              display: "flex",
              flexDirection: "column",
              gap: "16px",
            }}
          >
            {/* TOTAL Card (Dark High-Contrast Box) */}
            <div
              style={{
                background: "#0f172a",
                borderRadius: "14px",
                padding: "18px 22px",
                color: "#ffffff",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: "1.1rem", fontWeight: 800, letterSpacing: "0.02em" }}>
                  TOTAL
                </span>
                <span style={{ fontSize: "1.45rem", fontWeight: 900 }}>
                  {formatPrice(grandTotal)}
                </span>
              </div>
              <p
                style={{
                  fontSize: "0.74rem",
                  color: "#94a3b8",
                  margin: "6px 0 0 0",
                  lineHeight: 1.4,
                }}
              >
                Taxes, discounts and shipping calculated at checkout
              </p>
            </div>

            {/* ORDER SPECIAL INSTRUCTIONS */}
            <div>
              <button
                type="button"
                onClick={() => setShowInstructions(!showInstructions)}
                style={{
                  width: "100%",
                  background: "none",
                  border: "none",
                  padding: "0",
                  textAlign: "left",
                  fontSize: "0.82rem",
                  fontWeight: 700,
                  color: "#0f172a",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <span>ORDER SPECIAL INSTRUCTIONS</span>
                <span style={{ fontSize: "1.1rem", color: "#64748b" }}>{showInstructions ? "−" : "+"}</span>
              </button>

              {showInstructions && (
                <textarea
                  rows={2}
                  value={orderInstructions}
                  onChange={(e) => setOrderInstructions(e.target.value)}
                  placeholder="e.g. Leave package with security guard, please deliver before 2 PM..."
                  style={{
                    width: "100%",
                    marginTop: "8px",
                    padding: "10px 12px",
                    borderRadius: "8px",
                    border: "1px solid #cbd5e1",
                    fontSize: "0.82rem",
                    color: "#0f172a",
                    outline: "none",
                    fontFamily: "inherit",
                    resize: "none",
                  }}
                />
              )}
            </div>

            {/* Bottom Action Buttons (Checkout & View Cart) */}
            <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
              <Link
                href="/checkout"
                onClick={closeCart}
                style={{
                  flex: 1,
                  height: "46px",
                  background: "#0f172a",
                  color: "#ffffff",
                  borderRadius: "8px",
                  fontWeight: 700,
                  fontSize: "0.92rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  textDecoration: "none",
                  transition: "background 0.2s ease, transform 0.1s ease",
                  boxShadow: "0 4px 12px rgba(15, 23, 42, 0.2)",
                }}
                onMouseEnter={e => { e.currentTarget.style.background = "#1e293b"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "#0f172a"; }}
              >
                Checkout
              </Link>

              <Link
                href="/cart"
                onClick={closeCart}
                style={{
                  flex: 1,
                  height: "46px",
                  background: "#ffffff",
                  border: "1.5px solid #cbd5e1",
                  color: "#0f172a",
                  borderRadius: "8px",
                  fontWeight: 700,
                  fontSize: "0.92rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  textDecoration: "none",
                  transition: "background 0.2s ease, border-color 0.2s ease",
                }}
                onMouseEnter={e => { e.currentTarget.style.background = "#f8fafc"; e.currentTarget.style.borderColor = "#94a3b8"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "#ffffff"; e.currentTarget.style.borderColor = "#cbd5e1"; }}
              >
                View Cart
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
