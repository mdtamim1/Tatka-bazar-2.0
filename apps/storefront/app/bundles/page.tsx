"use client";

import React, { useState } from "react";
import { Package, Check, ShoppingBag, Sparkles, Flame, ArrowRight } from "lucide-react";
import { useCartStore } from "@/lib/cart-store";
import { PRODUCTS } from "@/lib/catalog";

export default function BundlesPage() {
  const { addItem, openCart } = useCartStore();
  const [addedBundleId, setAddedBundleId] = useState<string | null>(null);

  const BUNDLES = [
    {
      id: "bundle-bachelor-weekly",
      titleBn: "Weekly Bachelor Fresh Kitchen Box",
      titleEn: "Weekly Bachelor Fresh Kitchen Box",
      descriptionBn: "A complete 1-week essential combination of potatoes, onions, eggs, rice, mustard oil, and lentils.",
      descriptionEn: "A complete 1-week essential combination of potatoes, onions, eggs, rice, mustard oil, and lentils.",
      regularPrice: 1250,
      comboPrice: 1050,
      savings: 200,
      badge: "Popular Pick",
      image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop&q=80",
      items: [
        "Miniket Rice (2 kg)",
        "Local Red Lentils (1 kg)",
        "Cold-pressed Mustard Oil (500 ml)",
        "Duck Eggs (1 Dozen)",
        "Fresh New Potatoes (2 kg)",
        "Local Red Onions (1 kg)",
      ],
    },
    {
      id: "bundle-family-monthly",
      titleBn: "Family Monthly Staples Box",
      titleEn: "Family Monthly Staples Box",
      descriptionBn: "Full month supply of premium Katari rice, lentils, pure mustard oil, ghee, and spices for 4-5 persons.",
      descriptionEn: "Full month supply of premium Katari rice, lentils, pure mustard oil, ghee, and spices for 4-5 persons.",
      regularPrice: 4200,
      comboPrice: 3550,
      savings: 650,
      badge: "Max Savings",
      image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&auto=format&fit=crop&q=80",
      items: [
        "Dinajpur Aromatic Katari Rice (10 kg)",
        "Premium Moong & Red Lentils (4 kg)",
        "Cold-pressed Mustard Oil (2 Litres)",
        "Bogra Pure Cow Ghee (500 gm)",
        "Special Whole Spice Pack (1 kg)",
      ],
    },
    {
      id: "bundle-morning-greens",
      titleBn: "Fresh Morning Veggies & Salad Box",
      titleEn: "Fresh Morning Veggies & Salad Box",
      descriptionBn: "100% pesticide-free green veggies and crisp salad harvested early morning from Savar and Manikganj eco-farms.",
      descriptionEn: "100% pesticide-free green veggies and crisp salad harvested early morning from Savar and Manikganj eco-farms.",
      regularPrice: 650,
      comboPrice: 520,
      savings: 130,
      badge: "100% Organic",
      image: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&auto=format&fit=crop&q=80",
      items: [
        "Fresh Tender Red Spinach (1 kg)",
        "Ripe Red Farm Tomatoes (1 kg)",
        "Crisp Cucumbers & Carrots (1 kg)",
        "Fresh Tender Bottle Gourd (1 Piece)",
        "Green Chilies & Fresh Coriander (250 gm)",
      ],
    },
  ];

  const handleAddBundle = (bundle: typeof BUNDLES[0]) => {
    const baseProd = PRODUCTS[0]!;
    addItem(
      {
        ...baseProd,
        id: bundle.id,
        nameBn: bundle.titleEn,
        nameEn: bundle.titleEn,
        images: [bundle.image],
        basePrice: bundle.comboPrice,
        pricingType: "pack",
        baseUnit: "packet",
      },
      1,
      "packet",
      bundle.comboPrice,
      1
    );

    setAddedBundleId(bundle.id);
    setTimeout(() => {
      setAddedBundleId(null);
      openCart();
    }, 600);
  };

  return (
    <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "30px 16px" }}>
      
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "40px" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "var(--primary-light)", color: "var(--primary-dark)", padding: "4px 14px", borderRadius: "999px", fontSize: "0.8rem", fontWeight: 800, marginBottom: "12px" }}>
          <Package size={15} />
          <span>CURATED FRESH BUNDLES</span>
        </div>
        <h1 style={{ fontSize: "2.2rem", fontWeight: 800, color: "var(--text-main)", lineHeight: 1.2 }}>
          Curated Fresh Bundle Combos
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", maxWidth: "600px", margin: "8px auto 0" }}>
          Save 15% to 20% more on bundle packs compared to individual purchases with doorstep delivery.
        </p>
      </div>

      {/* Bundles Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "24px" }}>
        {BUNDLES.map((bundle) => {
          const isAdded = addedBundleId === bundle.id;
          return (
            <div
              key={bundle.id}
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "var(--radius-xl)",
                overflow: "hidden",
                boxShadow: "var(--shadow-sm)",
                display: "flex",
                flexDirection: "column",
                transition: "all 0.2s ease",
              }}
            >
              <div style={{ position: "relative", height: "200px" }}>
                <img src={bundle.image} alt={bundle.titleEn} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                <div style={{ position: "absolute", top: "12px", left: "12px", background: "var(--accent)", color: "#FFF", padding: "4px 10px", borderRadius: "999px", fontSize: "0.72rem", fontWeight: 800 }}>
                  {bundle.badge}
                </div>
                <div style={{ position: "absolute", top: "12px", right: "12px", background: "rgba(0,0,0,0.7)", color: "#4ADE80", padding: "4px 10px", borderRadius: "999px", fontSize: "0.75rem", fontWeight: 800 }}>
                  ৳{bundle.savings} OFF
                </div>
              </div>

              <div style={{ padding: "20px", display: "flex", flexDirection: "column", flex: 1 }}>
                <h3 style={{ fontSize: "1.2rem", fontWeight: 800, marginBottom: "6px" }}>{bundle.titleEn}</h3>
                <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "16px", lineHeight: 1.4 }}>
                  {bundle.descriptionEn}
                </p>

                <div style={{ background: "#F8FAFC", padding: "12px 14px", borderRadius: "var(--radius-md)", marginBottom: "20px" }}>
                  <div style={{ fontSize: "0.8rem", fontWeight: 700, marginBottom: "6px", color: "var(--text-main)" }}>
                    Items Included in this Box:
                  </div>
                  <ul style={{ paddingLeft: "18px", fontSize: "0.78rem", color: "var(--text-muted)", display: "flex", flexDirection: "column", gap: "3px" }}>
                    {bundle.items.map((it, idx) => (
                      <li key={idx}>{it}</li>
                    ))}
                  </ul>
                </div>

                <div style={{ marginTop: "auto", display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "14px", borderTop: "1px solid var(--border-subtle)" }}>
                  <div>
                    <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", textDecoration: "line-through" }}>
                      Regular ৳{bundle.regularPrice}
                    </div>
                    <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "var(--primary-dark)" }}>
                      ৳{bundle.comboPrice}
                    </div>
                  </div>

                  <button
                    onClick={() => handleAddBundle(bundle)}
                    style={{
                      padding: "10px 18px",
                      borderRadius: "var(--radius-md)",
                      background: isAdded ? "var(--primary-dark)" : "var(--primary)",
                      color: "#FFF",
                      fontWeight: 800,
                      fontSize: "0.9rem",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    {isAdded ? <Check size={16} /> : <ShoppingBag size={16} />}
                    <span>{isAdded ? "Added ✓" : "Add Bundle to Cart"}</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
