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
          background: "rgba(0, 0, 0, 0.75)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
        }}
      />

      {/* Drawer Container */}
      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: "460px",
          height: "100%",
          background: "rgba(10, 13, 24, 0.98)",
          backdropFilter: "blur(32px) saturate(1.8)",
          WebkitBackdropFilter: "blur(32px) saturate(1.8)",
          color: "#E8ECFF",
          display: "flex",
          flexDirection: "column",
          boxShadow: "-12px 0 48px rgba(0, 0, 0, 0.7)",
          borderLeft: "1px solid rgba(124, 92, 252, 0.15)",
          zIndex: 10000,
          animation: "slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
          fontFamily: "var(--font-body, 'Inter', system-ui, sans-serif)",
        }}
      >
        {/* ── Header ── */}
        <div
          style={{
            padding: "20px 24px",
            borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "rgba(15, 20, 34, 0.6)",
          }}
        >
          <h2
            style={{
              fontSize: "1.35rem",
              fontWeight: 800,
              color: "#E8ECFF",
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
              borderRadius: "8px",
              background: "rgba(255, 255, 255, 0.06)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              color: "#B0BAD8",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = "rgba(247, 57, 90, 0.15)";
              e.currentTarget.style.color = "#F7395A";
              e.currentTarget.style.borderColor = "rgba(247, 57, 90, 0.3)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.06)";
              e.currentTarget.style.color = "#B0BAD8";
              e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.08)";
            }}
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
            gap: "14px",
            background: "transparent",
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
                color: "#6B79A0",
              }}
            >
              <div
                style={{
                  width: "64px",
                  height: "64px",
                  borderRadius: "50%",
                  background: "rgba(124, 92, 252, 0.1)",
                  border: "1px solid rgba(124, 92, 252, 0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "16px",
                  color: "#7C5CFC",
                }}
              >
                <ShoppingBag size={28} />
              </div>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#E8ECFF", margin: "0 0 6px 0" }}>
                Your cart is empty
              </h3>
              <p style={{ fontSize: "0.85rem", color: "#6B79A0", margin: "0 0 20px 0" }}>
                Add farm-fresh groceries, fish, and produce to get started.
              </p>
              <button
                onClick={closeCart}
                style={{
                  padding: "10px 24px",
                  background: "linear-gradient(135deg, #7C5CFC, #5A3ADA)",
                  color: "#ffffff",
                  borderRadius: "8px",
                  fontWeight: 700,
                  fontSize: "0.88rem",
                  border: "none",
                  cursor: "pointer",
                  boxShadow: "0 4px 16px rgba(124, 92, 252, 0.35)",
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
                  background: "rgba(15, 20, 34, 0.7)",
                  border: "1px solid rgba(255, 255, 255, 0.06)",
                  borderRadius: "14px",
                  padding: "14px",
                  boxShadow: "0 4px 16px rgba(0, 0, 0, 0.4)",
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
                    alt={item.product?.nameEn || item.product?.nameBn}
                    style={{
                      width: "74px",
                      height: "74px",
                      borderRadius: "10px",
                      objectFit: "cover",
                      backgroundColor: "rgba(255, 255, 255, 0.03)",
                      border: "1px solid rgba(255, 255, 255, 0.08)",
                      flexShrink: 0,
                    }}
                  />
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <h4
                      style={{
                        fontSize: "0.92rem",
                        fontWeight: 700,
                        color: "#E8ECFF",
                        margin: "0 0 3px 0",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {item.product?.nameEn || item.product?.nameBn}
                    </h4>
                    <p
                      style={{
                        fontSize: "0.75rem",
                        color: "#6B79A0",
                        margin: "0 0 6px 0",
                      }}
                    >
                      Weight: {item.selectedWeight} {item.selectedUnit} • Fresh
                    </p>
                    <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
                      <span
                        style={{
                          fontSize: "1.02rem",
                          fontWeight: 800,
                          color: "#00D084",
                        }}
                      >
                        {formatPrice(item.unitPrice * item.quantity)}
                      </span>
                      {item.product?.comparePrice && (
                        <span
                          style={{
                            fontSize: "0.76rem",
                            color: "#6B79A0",
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
                      border: "1px solid rgba(255, 255, 255, 0.08)",
                      borderRadius: "6px",
                      padding: "3px 8px",
                      gap: "10px",
                      background: "rgba(255, 255, 255, 0.04)",
                    }}
                  >
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#B0BAD8",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        padding: "2px",
                      }}
                      aria-label="Decrease quantity"
                    >
                      <Minus size={13} />
                    </button>
                    <span style={{ fontSize: "0.9rem", fontWeight: 700, color: "#E8ECFF", minWidth: "16px", textAlign: "center" }}>
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#B0BAD8",
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
                      color: "#F7395A",
                      fontSize: "0.76rem",
                      fontWeight: 600,
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
              background: "rgba(15, 20, 34, 0.9)",
              borderTop: "1px solid rgba(255, 255, 255, 0.06)",
              display: "flex",
              flexDirection: "column",
              gap: "16px",
            }}
          >
            {/* TOTAL Card */}
            <div
              style={{
                background: "linear-gradient(135deg, #131828 0%, #0A0D18 100%)",
                border: "1px solid rgba(124, 92, 252, 0.2)",
                borderRadius: "14px",
                padding: "18px 22px",
                color: "#ffffff",
                boxShadow: "0 6px 24px rgba(0, 0, 0, 0.4)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: "1.05rem", fontWeight: 800, letterSpacing: "0.04em", color: "#B0BAD8" }}>
                  TOTAL
                </span>
                <span style={{ fontSize: "1.45rem", fontWeight: 900, color: "#00D084" }}>
                  {formatPrice(grandTotal)}
                </span>
              </div>
              <p
                style={{
                  fontSize: "0.72rem",
                  color: "#6B79A0",
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
                  fontSize: "0.8rem",
                  fontWeight: 700,
                  color: "#B0BAD8",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <span>ORDER SPECIAL INSTRUCTIONS</span>
                <span style={{ fontSize: "1.1rem", color: "#6B79A0" }}>{showInstructions ? "−" : "+"}</span>
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
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    background: "rgba(255, 255, 255, 0.04)",
                    fontSize: "0.82rem",
                    color: "#E8ECFF",
                    outline: "none",
                    fontFamily: "inherit",
                    resize: "none",
                  }}
                />
              )}
            </div>

            {/* Bottom Action Buttons */}
            <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
              <Link
                href="/checkout"
                onClick={closeCart}
                style={{
                  flex: 1,
                  height: "46px",
                  background: "linear-gradient(135deg, #7C5CFC, #5A3ADA)",
                  color: "#ffffff",
                  borderRadius: "8px",
                  fontWeight: 700,
                  fontSize: "0.92rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  textDecoration: "none",
                  boxShadow: "0 4px 16px rgba(124, 92, 252, 0.35)",
                  transition: "all 0.2s ease",
                }}
              >
                Checkout
              </Link>

              <Link
                href="/cart"
                onClick={closeCart}
                style={{
                  flex: 1,
                  height: "46px",
                  background: "rgba(255, 255, 255, 0.04)",
                  border: "1.5px solid rgba(255, 255, 255, 0.08)",
                  color: "#E8ECFF",
                  borderRadius: "8px",
                  fontWeight: 700,
                  fontSize: "0.92rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  textDecoration: "none",
                  transition: "all 0.2s ease",
                }}
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
