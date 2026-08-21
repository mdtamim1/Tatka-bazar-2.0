"use client";

import React, { useState, useMemo } from "react";
import { Plus, Minus, Check, Sparkles, Scale } from "lucide-react";
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

  // Default to popular option or first weight option
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

  // Check if tiered bulk discount applies
  const activeTier = useMemo(() => {
    if (!product.tieredPricing || product.tieredPricing.length === 0) return null;
    const totalSelectedWeight = selectedWeight * quantity;
    // Find highest qualifying tier
    const sortedTiers = [...product.tieredPricing].sort((a, b) => b.minQty - a.minQty);
    return sortedTiers.find((tier) => totalSelectedWeight >= tier.minQty) || null;
  }, [product.tieredPricing, selectedWeight, quantity]);

  // Calculate live unit price & total line price
  const { unitPrice, totalPrice } = useMemo(() => {
    let effectiveBasePrice = product.basePrice;
    if (activeTier) {
      effectiveBasePrice = activeTier.pricePerUnit;
    }
    const singleUnitPrice = Math.round(effectiveBasePrice * multiplier);
    return {
      unitPrice: singleUnitPrice,
      totalPrice: singleUnitPrice * quantity,
    };
  }, [product.basePrice, multiplier, quantity, activeTier]);

  const handleSelectChip = (opt: WeightOption) => {
    setSelectedWeight(opt.value);
    setSelectedUnit(opt.unit);
    setMultiplier(opt.multiplier);
  };

  const handleAddToCart = () => {
    addItem(product, selectedWeight, selectedUnit, unitPrice, quantity);
    setIsAdded(true);
    if (onAddToCartSuccess) onAddToCartSuccess();
    setTimeout(() => setIsAdded(false), 2000);
  };

  return (
    <div
      style={{
        background: "var(--bg-surface)",
        borderRadius: "var(--radius-lg)",
        border: "1.5px solid var(--border-subtle)",
        padding: "20px",
        boxShadow: "var(--shadow-md)",
      }}
    >
      {/* Selector Header & Live Price Display */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--text-muted)", fontSize: "0.82rem", fontWeight: 600 }}>
            <Scale size={16} color="var(--primary)" />
            <span>{t.selectWeight}</span>
          </div>
          <div style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--primary-dark)", marginTop: "2px" }}>
            {formatPrice(totalPrice)}
            {product.comparePrice && (
              <span style={{ fontSize: "1rem", color: "var(--text-subtle)", textDecoration: "line-through", marginLeft: "8px", fontWeight: 500 }}>
                {formatPrice(Math.round(product.comparePrice * multiplier * quantity))}
              </span>
            )}
          </div>
        </div>

        {/* Tier / Bulk discount indicator */}
        {activeTier ? (
          <div
            style={{
              padding: "4px 10px",
              borderRadius: "var(--radius-full)",
              background: "var(--primary-light)",
              border: "1px solid rgba(27, 138, 76, 0.3)",
              color: "var(--primary-dark)",
              fontSize: "0.78rem",
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              gap: "4px",
              animation: "pulseGlow 2s infinite",
            }}
          >
            <Sparkles size={14} color="var(--primary)" />
            <span>{locale === "bn" ? activeTier.labelBn : activeTier.labelEn}</span>
          </div>
        ) : (
          product.tieredPricing && product.tieredPricing.length > 0 && (
            <div
              style={{
                fontSize: "0.75rem",
                color: "var(--accent)",
                fontWeight: 700,
                background: "var(--accent-light)",
                padding: "3px 8px",
                borderRadius: "var(--radius-sm)",
              }}
            >
              ⚡ {t.tieredDiscountBadge}
            </div>
          )
        )}
      </div>

      {/* Signature Weight Option Chips Grid */}
      {product.weightOptions && product.weightOptions.length > 0 && (
        <div style={{ marginBottom: "18px" }}>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {product.weightOptions.map((opt, idx) => {
              const isActive = selectedWeight === opt.value;
              const calculatedOptPrice = Math.round(product.basePrice * opt.multiplier);
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectChip(opt)}
                  className={`weight-chip ${isActive ? "active" : ""}`}
                  style={{ flex: 1, minWidth: "90px" }}
                >
                  <span style={{ fontSize: "0.88rem" }}>
                    {locale === "bn" ? opt.labelBn : opt.labelEn}
                  </span>
                  <span style={{ fontSize: "0.75rem", opacity: 0.8, marginTop: "2px" }}>
                    {formatPrice(calculatedOptPrice)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Tiered Wholesale Matrix Table (if available) */}
      {product.tieredPricing && product.tieredPricing.length > 0 && (
        <div
          style={{
            background: "var(--bg-subtle)",
            borderRadius: "var(--radius-md)",
            padding: "10px 14px",
            marginBottom: "18px",
            fontSize: "0.8rem",
          }}
        >
          <div style={{ fontWeight: 700, color: "var(--text-main)", marginBottom: "6px" }}>
            🏷️ {locale === "bn" ? "পাইকারি সাশ্রয় অফার তালিকা:" : "Bulk Volume Pricing:"}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            {product.tieredPricing.map((tp, idx) => (
              <div key={idx} style={{ display: "flex", justifyContent: "space-between", color: "var(--text-muted)" }}>
                <span>{locale === "bn" ? tp.labelBn : tp.labelEn}</span>
                <span style={{ fontWeight: 700, color: "var(--primary-dark)" }}>
                  {formatPrice(tp.pricePerUnit)} / {locale === "bn" ? "কেজি" : "kg"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stepper + Add to Cart Button */}
      <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
        {/* Quantity Stepper */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            background: "var(--bg-subtle)",
            borderRadius: "var(--radius-md)",
            border: "1.5px solid var(--border-medium)",
            padding: "4px",
          }}
        >
          <button
            type="button"
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            style={{
              width: "36px",
              height: "36px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "var(--bg-surface)",
              borderRadius: "var(--radius-sm)",
              color: "var(--text-main)",
            }}
          >
            <Minus size={16} />
          </button>
          <span
            style={{
              minWidth: "40px",
              textAlign: "center",
              fontSize: "1rem",
              fontWeight: 800,
              color: "var(--text-main)",
            }}
          >
            {quantity}
          </span>
          <button
            type="button"
            onClick={() => setQuantity(quantity + 1)}
            style={{
              width: "36px",
              height: "36px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "var(--primary)",
              borderRadius: "var(--radius-sm)",
              color: "#FFF",
            }}
          >
            <Plus size={16} />
          </button>
        </div>

        {/* Add to Cart CTA */}
        <button
          type="button"
          onClick={handleAddToCart}
          className="btn-primary"
          style={{
            flex: 1,
            padding: "12px",
            fontSize: "1rem",
            background: isAdded ? "var(--primary-dark)" : undefined,
          }}
        >
          {isAdded ? (
            <>
              <Check size={18} />
              <span>{t.addedToCart}</span>
            </>
          ) : (
            <>
              <span>{t.addToCart}</span>
              <span>• {formatPrice(totalPrice)}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
