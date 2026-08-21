"use client";

import React from "react";
import Link from "next/link";
import {
  Leaf, Sparkles, Download, ArrowRight,
  Truck, ShieldCheck, RefreshCw, Clock, Zap,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { HeroBanner }        from "@/components/home/HeroBanner";
import { CategoryQuickNav }  from "@/components/home/CategoryQuickNav";
import { FlashDeals }        from "@/components/home/FlashDeals";
import { VendorRail }        from "@/components/home/VendorRail";
import { Testimonials }      from "@/components/home/Testimonials";
import { RecipeToCartRail }  from "@/components/home/RecipeToCartRail";
import { ProductCard }       from "@/components/product/ProductCard";
import { PRODUCTS }          from "@/lib/catalog";

function SectionHeader({
  eyebrow, eyebrowClass = "section-eyebrow--green", heading, sub, viewAllHref, viewAllLabel,
}: {
  eyebrow: string; eyebrowClass?: string; heading: string; sub?: string;
  viewAllHref?: string; viewAllLabel?: string;
}) {
  return (
    <div
      style={{
        display: "flex", justifyContent: "space-between",
        alignItems: "flex-end", marginBottom: "24px", gap: "16px",
      }}
    >
      <div>
        <div className={`section-eyebrow ${eyebrowClass}`} style={{ marginBottom: "10px" }}>
          {eyebrow}
        </div>
        <h2 className="section-heading">{heading}</h2>
        {sub && <p className="section-subheading">{sub}</p>}
      </div>
      {viewAllHref && (
        <Link href={viewAllHref} className="view-all-link">
          <span>{viewAllLabel}</span>
          <ArrowRight size={15} />
        </Link>
      )}
    </div>
  );
}

export default function StorefrontHomePage() {
  const { locale, t } = useLanguage();

  const featuredProducts = PRODUCTS.filter(p => p.isFeatured);
  const organicProducts  = PRODUCTS.filter(p => p.isOrganic);

  const trustItems = [
    {
      Icon: Truck, emoji: "🚚",
      color: "#22C55E", bg: "rgba(34, 197, 94, 0.1)", ring: "rgba(34, 197, 94, 0.25)",
      label: locale === "bn" ? "দ্রুত ডেলিভারি"  : "Same-Day Delivery",
      sub:   locale === "bn" ? "ঢাকায় ২-৪ ঘন্টা" : "2-4 hrs in Dhaka",
    },
    {
      Icon: ShieldCheck, emoji: "🔐",
      color: "#3B82F6", bg: "rgba(59, 130, 246, 0.1)", ring: "rgba(59, 130, 246, 0.25)",
      label: locale === "bn" ? "নিরাপদ পেমেন্ট"    : "Secure Payment",
      sub:   locale === "bn" ? "bKash, Nagad, COD" : "bKash, Nagad, COD",
    },
    {
      Icon: Leaf, emoji: "🌿",
      color: "#22C55E", bg: "rgba(34, 197, 94, 0.1)", ring: "rgba(34, 197, 94, 0.25)",
      label: locale === "bn" ? "তাজা গ্যারান্টি"    : "Freshness Guarantee",
      sub:   locale === "bn" ? "সতেজ না হলে ফেরত" : "Fresh or full refund",
    },
    {
      Icon: RefreshCw, emoji: "🔄",
      color: "#F97316", bg: "rgba(249, 115, 22, 0.1)", ring: "rgba(249, 115, 22, 0.25)",
      label: locale === "bn" ? "সহজ রিটার্ন"      : "Easy Returns",
      sub:   locale === "bn" ? "২৪ ঘন্টায় রিফান্ড" : "24-hour refund",
    },
    {
      Icon: Clock, emoji: "📍",
      color: "#8B5CF6", bg: "rgba(139, 92, 246, 0.1)", ring: "rgba(139, 92, 246, 0.25)",
      label: locale === "bn" ? "লাইভ ট্র্যাকিং"     : "Live Order Tracking",
      sub:   locale === "bn" ? "রিয়েল-টাইম আপডেট" : "Real-time updates",
    },
  ];

  return (
    <main style={{ minHeight: "100vh" }}>

      {/* 1. Hero Banner */}
      <HeroBanner />

      {/* 2. Trust Strip */}
      <section style={{ padding: "20px 0 32px" }}>
        <div className="container">
          <div
            style={{
              display: "flex", gap: "12px",
              overflowX: "auto", scrollbarWidth: "none",
              paddingBottom: "4px",
            }}
          >
            {trustItems.map(({ Icon, color, bg, ring, label, sub }, i) => (
              <div
                key={i}
                style={{
                  display: "flex", alignItems: "center", gap: "12px",
                  padding: "14px 18px",
                  background: "var(--bg-surface)",
                  borderRadius: "var(--radius-lg)",
                  border: "1px solid var(--border-subtle)",
                  boxShadow: "var(--shadow-xs)",
                  flexShrink: 0, flex: "1 1 0", minWidth: "176px",
                  transition: "all var(--t-smooth)",
                  cursor: "default",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.borderColor = ring;
                  e.currentTarget.style.boxShadow = `var(--shadow-md), 0 0 0 3px ${ring.replace("0.25", "0.12")}`;
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.borderColor = "var(--border-subtle)";
                  e.currentTarget.style.boxShadow = "var(--shadow-xs)";
                }}
              >
                <div
                  style={{
                    width: "44px", height: "44px",
                    borderRadius: "var(--radius-md)",
                    background: bg,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Icon size={22} color={color} />
                </div>
                <div>
                  <div style={{ fontSize: "var(--text-sm)", fontWeight: 800, color: "var(--text-main)", lineHeight: 1.2 }}>
                    {label}
                  </div>
                  <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", marginTop: "3px" }}>
                    {sub}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Category Quick Nav */}
      <CategoryQuickNav />

      {/* Divider */}
      <div className="section-divider" style={{ margin: "0 2.5rem" }} />

      {/* 4. Flash Deals */}
      <FlashDeals />

      {/* 5. Best Sellers */}
      <section style={{ padding: "36px 0" }}>
        <div className="container">
          <SectionHeader
            eyebrow={`✨ ${t.bestSellers || (locale === "bn" ? "সেরা বিক্রয়" : "Best Sellers")}`}
            heading={t.popularProducts || (locale === "bn" ? "সবচেয়ে জনপ্রিয় পণ্য" : "Most Popular Products")}
            sub={locale === "bn" ? "গ্রাহকরা বারবার কিনছেন এমন পণ্য" : "Products customers keep coming back for"}
            viewAllHref="/category/all"
            viewAllLabel={t.viewAll || (locale === "bn" ? "সব দেখুন" : "View All")}
          />
          <div className="product-grid">
            {featuredProducts.map(prod => <ProductCard key={prod.id} product={prod} />)}
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="section-divider" style={{ margin: "0 2.5rem" }} />

      {/* 6. Organic Section */}
      <section
        style={{
          padding: "36px 0",
          background: "linear-gradient(180deg, rgba(34,197,94,0.04) 0%, var(--bg-page) 100%)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Decorative leaf shapes */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, pointerEvents: "none", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: "-40px", right: "-40px", width: "200px", height: "200px", borderRadius: "50%", background: "radial-gradient(circle, rgba(34,197,94,0.06) 0%, transparent 70%)" }} />
        </div>
        <div className="container" style={{ position: "relative", zIndex: 1 }}>
          <SectionHeader
            eyebrow={`🌿 ${locale === "bn" ? "১০০% রাসায়নিকমুক্ত" : "100% Pesticide-Free"}`}
            eyebrowClass="section-eyebrow--green"
            heading={t.organicPicks || (locale === "bn" ? "জৈব ও প্রাকৃতিক পণ্য" : "Organic & Natural Picks")}
            sub={locale === "bn" ? "স্থানীয় জৈব খামার থেকে সরাসরি সংগ্রহ করা পণ্য" : "Harvested directly from certified local sustainable eco-farms"}
            viewAllHref="/category/vegetables"
            viewAllLabel={t.viewAll || (locale === "bn" ? "সব দেখুন" : "View All")}
          />
          <div className="product-grid">
            {organicProducts.map(prod => <ProductCard key={prod.id} product={prod} />)}
          </div>
        </div>
      </section>

      {/* 7. Recipe-to-Cart Rail */}
      <section style={{ padding: "36px 0" }}>
        <div className="container">
          <RecipeToCartRail />
        </div>
      </section>

      {/* Divider */}
      <div className="section-divider" style={{ margin: "0 2.5rem" }} />

      {/* 8. Vendor Rail */}
      <VendorRail />

      {/* 9. App Download CTA */}
      <section style={{ padding: "8px 0 56px" }}>
        <div className="container">
          <div
            style={{
              background: "linear-gradient(135deg, #031A0A 0%, #0A3D1C 35%, #0E5228 65%, #16803D 100%)",
              borderRadius: "var(--radius-2xl)",
              color: "#FFFFFF",
              padding: "clamp(32px, 5.5vw, 60px)",
              display: "flex", alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap", gap: "32px",
              boxShadow: "var(--shadow-2xl), 0 0 0 1px rgba(34,197,94,0.2), 0 0 80px rgba(34,197,94,0.1)",
              position: "relative", overflow: "hidden",
            }}
          >
            {/* Background decorations */}
            <div style={{ position: "absolute", top: "-80px", right: "-80px", width: "320px", height: "320px", borderRadius: "50%", background: "rgba(34,197,94,0.08)", pointerEvents: "none" }} />
            <div style={{ position: "absolute", bottom: "-60px", right: "180px", width: "200px", height: "200px", borderRadius: "50%", background: "rgba(34,197,94,0.06)", pointerEvents: "none" }} />
            <div style={{ position: "absolute", top: "20px", left: "45%", width: "1px", height: "calc(100% - 40px)", background: "rgba(255,255,255,0.05)", pointerEvents: "none" }} />

            {/* Text */}
            <div style={{ maxWidth: "600px", position: "relative" }}>
              <span
                style={{
                  background: "linear-gradient(135deg, #F59E0B, #D97706)",
                  color: "#fff", padding: "5px 15px",
                  borderRadius: "var(--radius-full)",
                  fontSize: "var(--text-xs)", fontWeight: 900,
                  letterSpacing: "0.04em", display: "inline-block",
                  marginBottom: "16px",
                  boxShadow: "0 4px 16px rgba(245, 158, 11, 0.45)",
                }}
              >
                📱 {locale === "bn" ? "মোবাইল অ্যাপ ও ক্যাশব্যাক" : "Mobile App & Cashback"}
              </span>
              <h2
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "clamp(1.5rem, 4vw, 2.3rem)",
                  fontWeight: 700, lineHeight: 1.18,
                  marginBottom: "14px", letterSpacing: "-0.025em",
                }}
              >
                {locale === "bn"
                  ? "প্রথম অর্ডারে পান ৳১০০ ক্যাশব্যাক!"
                  : "Get ৳100 Cashback on Your First Order!"}
              </h2>
              <p style={{ color: "rgba(255,255,255,0.78)", fontSize: "var(--text-base)", lineHeight: 1.65, maxWidth: "50ch" }}>
                {locale === "bn"
                  ? "লাইভ রাইডার ট্র্যাকিং, লয়্যালটি পয়েন্ট এবং ১-ক্লিক রিঅর্ডার — শুধুমাত্র আমাদের অ্যাপে।"
                  : "Live GPS rider tracking, loyalty Tatka Coins, and seamless 1-click reordering — exclusively on our app."}
              </p>

              {/* Feature pills */}
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "20px" }}>
                {[
                  { icon: "📍", text: locale === "bn" ? "লাইভ ট্র্যাকিং" : "Live Tracking" },
                  { icon: "🪙", text: locale === "bn" ? "লয়্যালটি কয়েন" : "Loyalty Coins" },
                  { icon: "⚡", text: locale === "bn" ? "১-ক্লিক রিঅর্ডার" : "1-Click Reorder" },
                ].map((f, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex", alignItems: "center", gap: "6px",
                      padding: "6px 13px",
                      background: "rgba(255,255,255,0.09)",
                      borderRadius: "var(--radius-full)",
                      border: "1px solid rgba(255,255,255,0.15)",
                      fontSize: "var(--text-xs)", fontWeight: 600,
                      backdropFilter: "blur(8px)",
                    }}
                  >
                    <span>{f.icon}</span>
                    <span>{f.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* App Store Buttons */}
            <div style={{ display: "flex", gap: "13px", flexWrap: "wrap", position: "relative" }}>
              {[
                { label: "GET IT ON",     store: "Google Play", icon: "▶" },
                { label: "DOWNLOAD ON",   store: "App Store",   icon: "" },
              ].map(({ label, store, icon }, i) => (
                <button
                  key={i}
                  type="button"
                  style={{
                    background: "rgba(0,0,0,0.75)",
                    color: "#FFFFFF", padding: "14px 24px",
                    borderRadius: "var(--radius-lg)",
                    display: "flex", alignItems: "center", gap: "13px",
                    fontWeight: 700, fontSize: "var(--text-base)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    cursor: "pointer",
                    transition: "all var(--t-smooth)",
                    backdropFilter: "blur(10px)",
                    minWidth: "175px",
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = "rgba(0,0,0,0.92)";
                    e.currentTarget.style.transform = "translateY(-3px)";
                    e.currentTarget.style.boxShadow = "0 8px 28px rgba(0,0,0,0.35)";
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.25)";
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = "rgba(0,0,0,0.75)";
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "none";
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)";
                  }}
                >
                  <Download size={21} />
                  <div style={{ textAlign: "left" }}>
                    <div style={{ fontSize: "0.58rem", opacity: 0.65, letterSpacing: "0.1em", textTransform: "uppercase" }}>{label}</div>
                    <div style={{ fontSize: "1rem", fontWeight: 800, letterSpacing: "-0.01em" }}>{store}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 10. Testimonials */}
      <Testimonials />

    </main>
  );
}
