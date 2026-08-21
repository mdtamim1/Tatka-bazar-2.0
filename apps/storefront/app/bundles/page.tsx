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
      titleBn: "সাপ্তাহিক ব্যাচেলর ফ্রেশ কিচেন বক্স",
      titleEn: "Weekly Bachelor Fresh Kitchen Box",
      descriptionBn: "১ সপ্তাহের জন্য প্রয়োজনীয় আলু, পেঁয়াজ, ডিম, চাল, তেল ও ডালের পারফেক্ট কম্বো।",
      regularPrice: 1250,
      comboPrice: 1050,
      savings: 200,
      badge: "জনপ্রিয় পছন্দ",
      image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop&q=80",
      items: [
        "মিনিকেট চাল (২ কেজি)",
        "দেশি মসুর ডাল (১ কেজি)",
        "ঘানিভাঙা সরিষার তেল (৫০০ মিলি)",
        "হাঁসের ডিম (১ ডজন)",
        "দেশি নতুন আলু (২ কেজি)",
        "দেশি পেঁয়াজ (১ কেজি)",
      ],
    },
    {
      id: "bundle-family-monthly",
      titleBn: "ফ্যামিলি মাসিক চাল-ডাল ও গ্রোসারি বক্স",
      titleEn: "Family Monthly Staples Box",
      descriptionBn: "৪-৫ জনের পরিবারের পুরো মাসের প্রিমিয়াম বাসমতী চাল, ডাল, সরিষার তেল ও মসলা।",
      regularPrice: 4200,
      comboPrice: 3550,
      savings: 650,
      badge: "সর্বোচ্চ সঞ্চয়",
      image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&auto=format&fit=crop&q=80",
      items: [
        "দিনাজপুরের কাটারিভোগ সুগন্ধি চাল (১০ কেজি)",
        "দেশি প্রিমিয়াম মুগ ও মসুর ডাল (৪ কেজি)",
        "ঘানিভাঙা সরিষার তেল (২ লিটার)",
        "বগুড়ার খাঁটি গাওয়া ঘি (৫০০ গ্রাম)",
        "দেশি গোটা মসলার স্পেশাল প্যাক (১ কেজি)",
      ],
    },
    {
      id: "bundle-morning-greens",
      titleBn: "ভোরের ফ্রেশ সালাদ ও শাকসবজি বক্স",
      titleEn: "Fresh Morning Veggies & Salad Box",
      descriptionBn: "সাভার ও মানিকগঞ্জ থেকে ভোরে তোলা ১০০% বিষমুক্ত শাকসবজি ও সালাদের সতেজ প্যাক।",
      regularPrice: 650,
      comboPrice: 520,
      savings: 130,
      badge: "১০০% অর্গানিক",
      image: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&auto=format&fit=crop&q=80",
      items: [
        "তাজা কচি লাল শাক (১ কেজি)",
        "পাকা লাল দেশি টমেটো (১ কেজি)",
        "দেশি শসা ও গাজর (১ কেজি)",
        "দেশি কচি লাউ (১ পিস)",
        "কাঁচামরিচ ও ধনেপাতা (২৫০ গ্রাম)",
      ],
    },
  ];

  const handleAddBundle = (bundle: typeof BUNDLES[0]) => {
    const baseProd = PRODUCTS[0]!;
    addItem(
      {
        ...baseProd,
        id: bundle.id,
        nameBn: bundle.titleBn,
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
          "বিল্ড এ বক্স" কিউরেটেড কম্বো প্যাকেজ
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", maxWidth: "600px", margin: "8px auto 0" }}>
          একক পণ্যের চেয়ে বান্ডেল প্যাকেজে কিনুন এবং সরাসরি ১৫% থেকে ২০% অতিরিক্ত ছাড় উপভোগ করুন।
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
                <img src={bundle.image} alt={bundle.titleBn} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                <div style={{ position: "absolute", top: "12px", left: "12px", background: "var(--accent)", color: "#FFF", padding: "4px 10px", borderRadius: "999px", fontSize: "0.72rem", fontWeight: 800 }}>
                  {bundle.badge}
                </div>
                <div style={{ position: "absolute", top: "12px", right: "12px", background: "rgba(0,0,0,0.7)", color: "#4ADE80", padding: "4px 10px", borderRadius: "999px", fontSize: "0.75rem", fontWeight: 800 }}>
                  ৳{bundle.savings} ছাড়
                </div>
              </div>

              <div style={{ padding: "20px", display: "flex", flexDirection: "column", flex: 1 }}>
                <h3 style={{ fontSize: "1.2rem", fontWeight: 800, marginBottom: "6px" }}>{bundle.titleBn}</h3>
                <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "16px", lineHeight: 1.4 }}>
                  {bundle.descriptionBn}
                </p>

                <div style={{ background: "#F8FAFC", padding: "12px 14px", borderRadius: "var(--radius-md)", marginBottom: "20px" }}>
                  <div style={{ fontSize: "0.8rem", fontWeight: 700, marginBottom: "6px", color: "var(--text-main)" }}>
                    বক্সের অন্তর্ভুক্ত আইটেম:
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
                      রেগুলার ৳{bundle.regularPrice}
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
                    <span>{isAdded ? "যোগ হয়েছে" : "বক্স কার্টে নিন"}</span>
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
