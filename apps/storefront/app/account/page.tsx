"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  User,
  Package,
  Heart,
  MapPin,
  Clock,
  CheckCircle2,
  Truck,
  RotateCcw,
  Sparkles,
  ShoppingBag,
  Phone,
  Mail,
  ChevronRight,
  Plus,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useCartStore } from "@/lib/cart-store";
import { PRODUCTS } from "@/lib/catalog";
import { ProductCard } from "@/components/product/ProductCard";

export default function AccountPage() {
  const { locale, t, formatPrice } = useLanguage();
  const { wishlistIds, addItem } = useCartStore();

  const [activeTab, setActiveTab] = useState<"orders" | "wishlist" | "addresses">("orders");

  const wishlistProducts = PRODUCTS.filter((p) => wishlistIds.includes(p.id));

  // Simulated active order tracking timeline
  const activeOrder = {
    orderNumber: "TB-928410",
    date: "২১ আগস্ট ২০২৬, সকাল ৭:১৫",
    itemsCount: 3,
    total: 1980,
    status: "OUT_FOR_DELIVERY", // PLACED -> CONFIRMED -> PACKED -> OUT_FOR_DELIVERY -> DELIVERED
    riderName: "করিম মোল্লা (বাইক রাইডার)",
    riderPhone: "০১৭০১-৯৯৮৮৭৭",
    estimatedArrival: "সকাল ৮:১৫ (আর ২০ মিনিট)",
    items: [
      { nameBn: "পদ্মার তাজা রূপালি ইলিশ (১ কেজি)", nameEn: "Padma River Hilsa (1kg)", price: 1450, qty: 1 },
      { nameBn: "পাকা লাল দেশি টমেটো (১ কেজি)", nameEn: "Organic Tomatoes (1kg)", price: 65, qty: 1 },
      { nameBn: "তাজা দেশি রুই মাছ (১ কেজি)", nameEn: "Fresh Rui Fish (1kg)", price: 420, qty: 1 },
    ],
  };

  return (
    <div style={{ padding: "20px 0 60px" }}>
      <div className="container">
        
        {/* Breadcrumb Navigation */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.82rem", color: "var(--text-muted)", marginBottom: "20px" }}>
          <Link href="/" style={{ color: "var(--primary)" }}>হোম</Link>
          <ChevronRight size={14} />
          <span style={{ color: "var(--text-main)", fontWeight: 600 }}>আমার অ্যাকাউন্ট</span>
        </div>

        {/* User Profile Header Card */}
        <div
          style={{
            background: "linear-gradient(135deg, #125730 0%, #1B8A4C 100%)",
            borderRadius: "var(--radius-xl)",
            color: "#FFFFFF",
            padding: "28px",
            marginBottom: "30px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "20px",
            boxShadow: "var(--shadow-md)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div
              style={{
                width: "64px",
                height: "64px",
                borderRadius: "50%",
                background: "var(--bg-surface)",
                color: "var(--primary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.8rem",
                fontWeight: 800,
              }}
            >
              রা
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <h1 style={{ fontSize: "1.4rem", fontWeight: 800 }}>রাফিক আহমেদ (Rafiq Ahmed)</h1>
                <span style={{ background: "var(--accent)", color: "#FFF", padding: "2px 8px", borderRadius: "999px", fontSize: "0.72rem", fontWeight: 700 }}>
                  🌟 লয়্যালটি মেম্বার
                </span>
              </div>
              <div style={{ display: "flex", gap: "16px", fontSize: "0.85rem", opacity: 0.9, marginTop: "4px" }}>
                <span>📱 01700000002</span>
                <span>✉️ customer@example.com</span>
              </div>
            </div>
          </div>

          {/* Tatka Coins Balance */}
          <div style={{ background: "rgba(255, 255, 255, 0.15)", backdropFilter: "blur(6px)", padding: "12px 20px", borderRadius: "var(--radius-lg)", textAlign: "center" }}>
            <div style={{ fontSize: "0.75rem", opacity: 0.85 }}>তাতকা রিওয়ার্ড কয়েন</div>
            <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "#FDE047" }}>৪৫০ কয়েন (৳৪৫)</div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div style={{ display: "flex", gap: "10px", marginBottom: "24px", borderBottom: "2px solid var(--border-subtle)", paddingBottom: "10px" }}>
          <button
            onClick={() => setActiveTab("orders")}
            style={{
              padding: "10px 20px",
              borderRadius: "var(--radius-md)",
              fontWeight: 700,
              fontSize: "0.95rem",
              background: activeTab === "orders" ? "var(--primary)" : "var(--bg-surface)",
              color: activeTab === "orders" ? "#FFF" : "var(--text-main)",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <Package size={18} />
            <span>অর্ডার ও লাইভ ট্র্যাকিং</span>
          </button>

          <button
            onClick={() => setActiveTab("wishlist")}
            style={{
              padding: "10px 20px",
              borderRadius: "var(--radius-md)",
              fontWeight: 700,
              fontSize: "0.95rem",
              background: activeTab === "wishlist" ? "var(--primary)" : "var(--bg-surface)",
              color: activeTab === "wishlist" ? "#FFF" : "var(--text-main)",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <Heart size={18} />
            <span>পছন্দের তালিকা ({wishlistIds.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("addresses")}
            style={{
              padding: "10px 20px",
              borderRadius: "var(--radius-md)",
              fontWeight: 700,
              fontSize: "0.95rem",
              background: activeTab === "addresses" ? "var(--primary)" : "var(--bg-surface)",
              color: activeTab === "addresses" ? "#FFF" : "var(--text-main)",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <MapPin size={18} />
            <span>সংরক্ষিত ঠিকানা</span>
          </button>
        </div>

        {/* Tab 1: Active Order Live Tracking Timeline */}
        {activeTab === "orders" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "30px" }}>
            
            {/* Live Tracking Card */}
            <div
              style={{
                background: "var(--bg-surface)",
                borderRadius: "var(--radius-xl)",
                border: "2px solid var(--primary)",
                padding: "28px",
                boxShadow: "var(--shadow-md)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", marginBottom: "20px" }}>
                <div>
                  <span className="badge-fresh" style={{ marginBottom: "6px" }}>
                    <Truck size={14} />
                    <span>চলমান লাইভ অর্ডার ট্র্যাকিং</span>
                  </span>
                  <h2 style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--primary-dark)" }}>
                    অর্ডার #{activeOrder.orderNumber}
                  </h2>
                  <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "2px" }}>
                    অর্ডার সময়: {activeOrder.date}
                  </div>
                </div>

                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>সম্ভাব্য ডেলিভারি সময়:</div>
                  <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--accent)" }}>
                    {activeOrder.estimatedArrival}
                  </div>
                </div>
              </div>

              {/* 5-Step Progress Bar Timeline */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(5, 1fr)",
                  gap: "8px",
                  margin: "30px 0",
                  textAlign: "center",
                  position: "relative",
                }}
              >
                {/* Step 1: Placed */}
                <div>
                  <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "var(--primary)", color: "#FFF", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 8px" }}>
                    ✓
                  </div>
                  <div style={{ fontSize: "0.8rem", fontWeight: 700 }}>গৃহীত</div>
                </div>

                {/* Step 2: Confirmed */}
                <div>
                  <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "var(--primary)", color: "#FFF", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 8px" }}>
                    ✓
                  </div>
                  <div style={{ fontSize: "0.8rem", fontWeight: 700 }}>কনফার্মড</div>
                </div>

                {/* Step 3: Packed */}
                <div>
                  <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "var(--primary)", color: "#FFF", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 8px" }}>
                    ✓
                  </div>
                  <div style={{ fontSize: "0.8rem", fontWeight: 700 }}>প্যাকেজিং শেষ</div>
                </div>

                {/* Step 4: Out for Delivery (Active) */}
                <div>
                  <div
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "50%",
                      background: "var(--accent)",
                      color: "#FFF",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto 8px",
                      boxShadow: "0 0 14px rgba(244, 121, 32, 0.5)",
                    }}
                  >
                    🛵
                  </div>
                  <div style={{ fontSize: "0.8rem", fontWeight: 800, color: "var(--accent)" }}>রাইডার রওনা দিয়েছে</div>
                </div>

                {/* Step 5: Delivered */}
                <div style={{ opacity: 0.4 }}>
                  <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "var(--border-medium)", color: "#FFF", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 8px" }}>
                    ৫
                  </div>
                  <div style={{ fontSize: "0.8rem", fontWeight: 600 }}>ডেলিভার্ড</div>
                </div>
              </div>

              {/* Rider Assigned Box */}
              <div
                style={{
                  background: "var(--primary-light)",
                  borderRadius: "var(--radius-lg)",
                  padding: "16px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "12px",
                }}
              >
                <div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>নিযুক্ত ডেলিভারি রাইডার:</div>
                  <div style={{ fontWeight: 800, fontSize: "0.95rem", color: "var(--primary-dark)" }}>{activeOrder.riderName}</div>
                </div>
                <a
                  href={`tel:${activeOrder.riderPhone}`}
                  className="btn-primary"
                  style={{ padding: "8px 16px", fontSize: "0.85rem" }}
                >
                  <Phone size={14} />
                  <span>কল করুন ({activeOrder.riderPhone})</span>
                </a>
              </div>
            </div>

            {/* Past Orders with 1-Click Reorder */}
            <div>
              <h3 style={{ fontSize: "1.2rem", fontWeight: 800, marginBottom: "16px" }}>
                পূর্ববর্তী সফল অর্ডারসমূহ
              </h3>

              <div
                style={{
                  background: "var(--bg-surface)",
                  borderRadius: "var(--radius-lg)",
                  border: "1px solid var(--border-subtle)",
                  padding: "20px",
                  boxShadow: "var(--shadow-sm)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "16px",
                }}
              >
                <div>
                  <div style={{ fontWeight: 800, color: "var(--primary-dark)" }}>অর্ডার #TB-817294</div>
                  <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>১৫ আগস্ট ২০২৬ • ৩টি পণ্য • ৳১,৯৮০ (ক্যাশ অন ডেলিভারি)</div>
                  <div style={{ fontSize: "0.75rem", color: "var(--primary)", fontWeight: 700, marginTop: "2px" }}>✓ ডেলিভারি সম্পন্ন হয়েছে</div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    PRODUCTS.slice(0, 2).forEach((p) => addItem(p, 1, p.baseUnit, p.basePrice, 1));
                  }}
                  className="btn-secondary"
                  style={{ padding: "8px 16px", fontSize: "0.85rem" }}
                >
                  <RotateCcw size={14} />
                  <span>পুনরায় অর্ডার করুন</span>
                </button>
              </div>
            </div>

          </div>
        )}

        {/* Tab 2: Wishlist */}
        {activeTab === "wishlist" && (
          <div>
            {wishlistProducts.length === 0 ? (
              <div style={{ background: "var(--bg-surface)", padding: "40px", textAlign: "center", borderRadius: "var(--radius-lg)" }}>
                <Heart size={40} color="var(--text-muted)" style={{ margin: "0 auto 12px" }} />
                <h3>আপনার পছন্দের তালিকা খালি</h3>
                <Link href="/" className="btn-primary" style={{ marginTop: "16px" }}>পণ্য ব্রাউজ করুন</Link>
              </div>
            ) : (
              <div className="product-grid">
                {wishlistProducts.map((prod) => (
                  <ProductCard key={prod.id} product={prod} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Saved Addresses */}
        {activeTab === "addresses" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px" }}>
            <div style={{ background: "var(--bg-surface)", borderRadius: "var(--radius-lg)", border: "2px solid var(--primary)", padding: "20px" }}>
              <span className="badge-fresh" style={{ marginBottom: "8px" }}>ডিফল্ট ঠিকানা</span>
              <h3 style={{ fontSize: "1rem", fontWeight: 700, marginTop: "4px" }}>বাসার ঠিকানা</h3>
              <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "4px", lineHeight: 1.5 }}>
                বাড়ি ২৭, রোড ৮/এ, ফ্ল্যাট ৪বি, ধানমন্ডি আ/এ, ঢাকা ১২০৯<br />
                মোবাইল: 01700000002
              </p>
            </div>

            <div style={{ background: "var(--bg-surface)", borderRadius: "var(--radius-lg)", border: "1px dashed var(--border-medium)", padding: "20px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
              <div style={{ textAlign: "center", color: "var(--primary)", fontWeight: 700 }}>
                <Plus size={24} style={{ margin: "0 auto 6px" }} />
                <span>নতুন ঠিকানা যোগ করুন</span>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
