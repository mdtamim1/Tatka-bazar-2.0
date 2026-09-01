"use client";

import React, { useState, useMemo } from "react";
import {
  Plus, Minus, Check, Sparkles, Scale, Zap, ShieldCheck, Flame, Scissors, Clock
} from "lucide-react";
import { Product, WeightOption, WeightUnit } from "@/types";
import { useLanguage } from "@/context/LanguageContext";
import { useCartStore } from "@/lib/cart-store";

interface WeightPricingSelectorProps {
  product: Product;
  onAddToCartSuccess?: () => void;
}

export function WeightPricingSelector({ product, onAddToCartSuccess }: WeightPricingSelectorProps) {
  const { locale, t, formatPrice } = useLanguage();
  const { addItem } = useCartStore();

  // Default option
  const defaultOption = product.weightOptions?.find((o) => o.popular) || product.weightOptions?.[0] || {
    value: 1,
    unit: product.baseUnit,
    labelBn: `১ ${product.baseUnit}`,
    labelEn: `1 ${product.baseUnit}`,
    multiplier: 1,
  };

  const [selectedWeight, setSelectedWeight] = useState<number>(defaultOption.value);
  const [selectedUnit, setSelectedUnit] = useState<WeightUnit>(defaultOption.unit);
  const [multiplier, setMultiplier] = useState<number>(defaultOption.multiplier);
  const [quantity, setQuantity] = useState<number>(1);
  const [isAdded, setIsAdded] = useState(false);
  const [cutPreference, setCutPreference] = useState<string>("default");

  // Cutting / Processing options based on category
  const isFishOrMeat = product.categorySlug === "fish-and-meat" || product.nameEn.toLowerCase().includes("fish") || product.nameEn.toLowerCase().includes("meat");
  const cutOptions = isFishOrMeat
    ? [
        { id: "default", labelBn: "আস্ত তাজা (Whole Fresh)", labelEn: "Whole Fresh" },
        { id: "clean_gut", labelBn: "কাটা ও আঁশ ছাড়ানো (Cleaned & Gutted)", labelEn: "Cleaned & Gutted" },
        { id: "curry_cut", labelBn: "কারি কাট টুকরো (Curry Cut)", labelEn: "Curry Cut" },
      ]
    : [
        { id: "default", labelBn: "আস্ত তাজা সংগ্রহ (Fresh Whole)", labelEn: "Fresh Whole" },
        { id: "pre_sorted", labelBn: "বাছাইকৃত প্রিমিয়াম (Sorted & Graded)", labelEn: "Hand-Picked Grade A" },
      ];

  // Check if tiered bulk discount applies
  const activeTier = useMemo(() => {
    if (!product.tieredPricing || product.tieredPricing.length === 0) return null;
    const totalSelectedWeight = selectedWeight * quantity;
    const sortedTiers = [...product.tieredPricing].sort((a, b) => b.minQty - a.minQty);
    return sortedTiers.find((tier) => totalSelectedWeight >= tier.minQty) || null;
  }, [product.tieredPricing, selectedWeight, quantity]);

  // Calculate live unit price & total line price
  const { unitPrice, totalPrice, savingsAmount } = useMemo(() => {
    let effectiveBasePrice = product.basePrice;
    if (activeTier) {
      effectiveBasePrice = activeTier.pricePerUnit;
    }
    const singleUnitPrice = Math.round(effectiveBasePrice * multiplier);
    const regularTotal = Math.round(product.basePrice * multiplier) * quantity;
    const currentTotal = singleUnitPrice * quantity;
    const compareTotal = product.comparePrice
      ? Math.round(product.comparePrice * multiplier * quantity)
      : regularTotal;

    return {
      unitPrice: singleUnitPrice,
      totalPrice: currentTotal,
      savingsAmount: Math.max(0, compareTotal - currentTotal),
    };
  }, [product.basePrice, product.comparePrice, multiplier, quantity, activeTier]);

  const handleSelectChip = (opt: WeightOption) => {
    setSelectedWeight(opt.value);
    setSelectedUnit(opt.unit);
    setMultiplier(opt.multiplier);
  };

  const handleAddToCart = () => {
    addItem(product, selectedWeight, selectedUnit, unitPrice, quantity);
    setIsAdded(true);
    if (onAddToCartSuccess) onAddToCartSuccess();
    setTimeout(() => setIsAdded(false), 2200);
  };

  return (
    <div
      style={{
        background: "rgba(19, 23, 32, 0.95)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderRadius: "var(--radius-xl)",
        border: "1px solid rgba(255, 255, 255, 0.08)",
        padding: "24px",
        boxShadow: "var(--shadow-xl), 0 0 40px rgba(16, 216, 118, 0.04)",
        display: "flex",
        flexDirection: "column",
        gap: "20px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Top Subtle Ambient Glow */}
      <div
        style={{
          position: "absolute",
          top: "-50px",
          right: "-50px",
          width: "180px",
          height: "180px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(16,216,118,0.12) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      {/* ── Price Ticker & Tier Banner ── */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          paddingBottom: "16px",
          borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
        }}
      >
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              color: "var(--emerald)",
              fontSize: "0.78rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}
          >
            <Scale size={14} />
            <span>{t.selectWeight || (locale === "bn" ? "ওজন ও কাস্টমাইজেশন নির্বাচন" : "Select Weight & Customization")}</span>
          </div>

          <div style={{ display: "flex", alignItems: "baseline", gap: "10px", marginTop: "4px" }}>
            <div
              style={{
                fontSize: "2rem",
                fontWeight: 900,
                color: "var(--text-main)",
                letterSpacing: "-0.04em",
                fontFamily: "var(--font-heading)",
              }}
            >
              <span className="gradient-text-emerald">{formatPrice(totalPrice)}</span>
            </div>

            {product.comparePrice && (
              <span
                style={{
                  fontSize: "1.05rem",
                  color: "var(--text-subtle)",
                  textDecoration: "line-through",
                  fontWeight: 600,
                }}
              >
                {formatPrice(Math.round(product.comparePrice * multiplier * quantity))}
              </span>
            )}
          </div>

          {savingsAmount > 0 && (
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
                marginTop: "4px",
                padding: "2px 8px",
                borderRadius: "var(--radius-full)",
                background: "rgba(255, 77, 109, 0.15)",
                border: "1px solid rgba(255, 77, 109, 0.3)",
                color: "var(--rose)",
                fontSize: "0.72rem",
                fontWeight: 800,
              }}
            >
              <Sparkles size={11} />
              <span>{locale === "bn" ? `মোট সাশ্রয় ${formatPrice(savingsAmount)}!` : `Total Savings: ${formatPrice(savingsAmount)}!`}</span>
            </div>
          )}
        </div>

        {/* Tier / Bulk discount indicator */}
        {activeTier ? (
          <div
            style={{
              padding: "6px 14px",
              borderRadius: "var(--radius-full)",
              background: "linear-gradient(135deg, rgba(16,216,118,0.2), rgba(245,200,66,0.15))",
              border: "1px solid rgba(16, 216, 118, 0.4)",
              color: "var(--emerald)",
              fontSize: "0.8rem",
              fontWeight: 800,
              display: "flex",
              alignItems: "center",
              gap: "6px",
              boxShadow: "0 4px 16px rgba(16,216,118,0.2)",
            }}
          >
            <Zap size={14} fill="var(--emerald)" />
            <span>{locale === "bn" ? activeTier.labelBn : activeTier.labelEn}</span>
          </div>
        ) : (
          product.tieredPricing && product.tieredPricing.length > 0 && (
            <div
              style={{
                fontSize: "0.75rem",
                color: "var(--gold)",
                fontWeight: 700,
                background: "rgba(245, 200, 66, 0.1)",
                border: "1px solid rgba(245, 200, 66, 0.25)",
                padding: "4px 10px",
                borderRadius: "var(--radius-full)",
                display: "flex",
                alignItems: "center",
                gap: "5px",
              }}
            >
              <Flame size={12} fill="var(--gold)" />
              <span>{t.tieredDiscountBadge || (locale === "bn" ? "বাল্ক অর্ডারে বিশেষ ছাড়" : "Bulk Tier Pricing")}</span>
            </div>
          )
        )}
      </div>

      {/* ── Signature Weight Tiles Grid ── */}
      {product.weightOptions && product.weightOptions.length > 0 && (
        <div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))",
              gap: "10px",
            }}
          >
            {product.weightOptions.map((opt, idx) => {
              const isActive = selectedWeight === opt.value;
              const calculatedOptPrice = Math.round(product.basePrice * opt.multiplier);
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectChip(opt)}
                  style={{
                    position: "relative",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "12px 10px",
                    borderRadius: "var(--radius-md)",
                    background: isActive
                      ? "linear-gradient(145deg, rgba(16,216,118,0.16) 0%, rgba(5,158,87,0.08) 100%)"
                      : "rgba(255, 255, 255, 0.03)",
                    border: isActive
                      ? "1.5px solid var(--emerald)"
                      : "1px solid rgba(255, 255, 255, 0.08)",
                    color: isActive ? "var(--text-main)" : "var(--text-muted)",
                    cursor: "pointer",
                    transition: "all var(--t-fast)",
                    boxShadow: isActive ? "0 6px 20px rgba(16, 216, 118, 0.25)" : "none",
                    transform: isActive ? "translateY(-2px)" : "translateY(0)",
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.2)";
                      e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.08)";
                      e.currentTarget.style.background = "rgba(255, 255, 255, 0.03)";
                    }
                  }}
                >
                  {/* Popular Tag */}
                  {opt.popular && (
                    <span
                      style={{
                        position: "absolute",
                        top: "-8px",
                        background: "linear-gradient(135deg, #F5C842, #D4A017)",
                        color: "#000",
                        fontSize: "0.6rem",
                        fontWeight: 900,
                        padding: "1px 6px",
                        borderRadius: "999px",
                        boxShadow: "0 2px 6px rgba(0,0,0,0.4)",
                      }}
                    >
                      ★ {locale === "bn" ? "জনপ্রিয়" : "Popular"}
                    </span>
                  )}

                  <span
                    style={{
                      fontSize: "0.92rem",
                      fontWeight: 800,
                      color: isActive ? "var(--emerald)" : "var(--text-main)",
                      fontFamily: "var(--font-heading)",
                    }}
                  >
                    {locale === "bn" ? opt.labelBn : opt.labelEn}
                  </span>

                  <span
                    style={{
                      fontSize: "0.8rem",
                      fontWeight: 700,
                      color: isActive ? "var(--text-main)" : "var(--text-subtle)",
                      marginTop: "3px",
                    }}
                  >
                    {formatPrice(calculatedOptPrice)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Custom Cutting / Preparation Selection ── */}
      <div
        style={{
          background: "rgba(255, 255, 255, 0.02)",
          borderRadius: "var(--radius-md)",
          padding: "12px 14px",
          border: "1px solid rgba(255, 255, 255, 0.05)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            fontSize: "0.76rem",
            fontWeight: 700,
            color: "var(--text-muted)",
            marginBottom: "10px",
          }}
        >
          <Scissors size={13} color="var(--emerald)" />
          <span>{locale === "bn" ? "কাটিং ও প্রসেসিং পছন্দ (ফ্রি সার্ভিস):" : "Custom Preparation (Free Service):"}</span>
        </div>

        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {cutOptions.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => setCutPreference(opt.id)}
              style={{
                padding: "6px 12px",
                borderRadius: "var(--radius-full)",
                fontSize: "0.75rem",
                fontWeight: 600,
                background: cutPreference === opt.id ? "rgba(16,216,118,0.15)" : "rgba(255,255,255,0.04)",
                border: cutPreference === opt.id ? "1px solid var(--emerald)" : "1px solid rgba(255,255,255,0.08)",
                color: cutPreference === opt.id ? "var(--emerald)" : "var(--text-body)",
                cursor: "pointer",
                transition: "all var(--t-fast)",
              }}
            >
              {locale === "bn" ? opt.labelBn : opt.labelEn}
            </button>
          ))}
        </div>
      </div>

      {/* ── Tiered Wholesale Matrix Table (if available) ── */}
      {product.tieredPricing && product.tieredPricing.length > 0 && (
        <div
          style={{
            background: "rgba(245, 200, 66, 0.03)",
            borderRadius: "var(--radius-md)",
            padding: "12px 14px",
            border: "1px solid rgba(245, 200, 66, 0.12)",
            fontSize: "0.8rem",
          }}
        >
          <div
            style={{
              fontWeight: 800,
              color: "var(--gold)",
              marginBottom: "8px",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <Flame size={14} />
            <span>{locale === "bn" ? "পাইকারি সাশ্রয় অফার তালিকা:" : "Bulk Volume Pricing Discounts:"}</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {product.tieredPricing.map((tp, idx) => (
              <div
                key={idx}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  color: "var(--text-muted)",
                  padding: "4px 8px",
                  borderRadius: "4px",
                  background: activeTier?.minQty === tp.minQty ? "rgba(16,216,118,0.1)" : "transparent",
                }}
              >
                <span style={{ color: activeTier?.minQty === tp.minQty ? "var(--emerald)" : "var(--text-body)" }}>
                  {locale === "bn" ? tp.labelBn : tp.labelEn}
                </span>
                <span
                  style={{
                    fontWeight: 800,
                    color: activeTier?.minQty === tp.minQty ? "var(--emerald)" : "var(--gold)",
                  }}
                >
                  {formatPrice(tp.pricePerUnit)} / {locale === "bn" ? "কেজি" : "kg"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Stepper + Add to Cart Button ── */}
      <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
        {/* Quantity Stepper */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            background: "rgba(255, 255, 255, 0.04)",
            borderRadius: "var(--radius-lg)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            padding: "4px",
          }}
        >
          <button
            type="button"
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            aria-label="Decrease quantity"
            style={{
              width: "38px",
              height: "38px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(255, 255, 255, 0.06)",
              borderRadius: "var(--radius-md)",
              color: "var(--text-main)",
              cursor: "pointer",
              border: "none",
              transition: "all var(--t-fast)",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255, 77, 109, 0.2)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255, 255, 255, 0.06)")}
          >
            <Minus size={15} />
          </button>
          <span
            style={{
              minWidth: "44px",
              textAlign: "center",
              fontSize: "1.05rem",
              fontWeight: 800,
              color: "var(--text-main)",
              fontFamily: "var(--font-heading)",
            }}
          >
            {quantity}
          </span>
          <button
            type="button"
            onClick={() => setQuantity(quantity + 1)}
            aria-label="Increase quantity"
            style={{
              width: "38px",
              height: "38px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "linear-gradient(135deg, #10D876, #059E57)",
              borderRadius: "var(--radius-md)",
              color: "var(--bg-page)",
              cursor: "pointer",
              border: "none",
              transition: "all var(--t-fast)",
              boxShadow: "0 2px 10px rgba(16,216,118,0.3)",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.08)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            <Plus size={15} strokeWidth={3} />
          </button>
        </div>

        {/* Add to Cart CTA */}
        <button
          type="button"
          onClick={handleAddToCart}
          style={{
            flex: 1,
            padding: "14px 20px",
            fontSize: "1rem",
            fontWeight: 800,
            borderRadius: "var(--radius-lg)",
            background: isAdded
              ? "linear-gradient(135deg, #059E57 0%, #047A43 100%)"
              : "linear-gradient(135deg, #10D876 0%, #059E57 100%)",
            color: "var(--bg-page)",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
            boxShadow: isAdded
              ? "0 4px 16px rgba(5,158,87,0.4)"
              : "0 8px 28px rgba(16, 216, 118, 0.45), inset 0 1px 0 rgba(255,255,255,0.3)",
            transition: "all 0.3s var(--ease-bounce)",
            fontFamily: "var(--font-heading)",
          }}
          onMouseEnter={(e) => {
            if (!isAdded) {
              e.currentTarget.style.transform = "translateY(-3px) scale(1.02)";
              e.currentTarget.style.boxShadow = "0 14px 40px rgba(16, 216, 118, 0.6)";
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0) scale(1)";
            e.currentTarget.style.boxShadow = "0 8px 28px rgba(16, 216, 118, 0.45), inset 0 1px 0 rgba(255,255,255,0.3)";
          }}
        >
          {isAdded ? (
            <>
              <Check size={20} strokeWidth={3} style={{ animation: "scaleIn 0.3s var(--ease-bounce)" }} />
              <span>{t.addedToCart || (locale === "bn" ? "কার্টে যোগ হয়েছে ✓" : "Added to Cart!")}</span>
            </>
          ) : (
            <>
              <Zap size={18} fill="var(--bg-page)" />
              <span>{t.addToCart || (locale === "bn" ? "কার্টে যোগ করুন" : "Add to Cart")}</span>
              <span style={{ opacity: 0.85 }}>• {formatPrice(totalPrice)}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
