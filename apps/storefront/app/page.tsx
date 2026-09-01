"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Leaf, ArrowRight,
  Truck, ShieldCheck, RefreshCw, Clock, Download,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { HeroBanner }        from "@/components/home/HeroBanner";
import { CategoryQuickNav }  from "@/components/home/CategoryQuickNav";
import { FlashDeals }        from "@/components/home/FlashDeals";
import { Testimonials }      from "@/components/home/Testimonials";
import { ProductCard }       from "@/components/product/ProductCard";
import { ScrollProgress }    from "@/components/ui/ScrollProgress";
import { PRODUCTS }          from "@/lib/catalog";

/* ── Reusable reveal hook ── */
function useReveal(threshold = 0.1) {
  const ref    = useRef<HTMLElement>(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e?.isIntersecting) setVis(true); },
      { threshold }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, vis };
}

/* ── Section Header component ── */
function SectionHeader({
  eyebrow, eyebrowClass = "section-eyebrow--green", heading, sub, viewAllHref, viewAllLabel,
}: {
  eyebrow: string; eyebrowClass?: string; heading: string; sub?: string;
  viewAllHref?: string; viewAllLabel?: string;
}) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "22px", gap: "12px", flexWrap: "wrap" }}>
      <div style={{ minWidth: 0, flex: "1 1 auto" }}>
        <div className={`section-eyebrow ${eyebrowClass}`} style={{ marginBottom: "8px" }}>
          {eyebrow}
        </div>
        <h2 className="section-heading">{heading}</h2>
        {sub && <p className="section-subheading">{sub}</p>}
      </div>
      {viewAllHref && (
        <Link href={viewAllHref} className="view-all-link" style={{ flexShrink: 0 }}>
          <span>{viewAllLabel}</span>
          <ArrowRight size={14} />
        </Link>
      )}
    </div>
  );
}

/* ── Main Page ── */
export default function StorefrontHomePage() {
  const { locale, t } = useLanguage();

  const featuredProducts = PRODUCTS.filter(p => p.isFeatured);
  const organicProducts  = PRODUCTS.filter(p => p.isOrganic);

  const { ref: trustRef, vis: trustVis }     = useReveal();
  const { ref: bestRef,  vis: bestVis }      = useReveal();
  const { ref: organicRef, vis: organicVis } = useReveal();
  const { ref: appRef, vis: appVis }         = useReveal();

  const trustItems = [
    {
      Icon: Truck, emoji: "🚚",
      color: "#10D876", bg: "rgba(16,216,118,0.08)", border: "rgba(16,216,118,0.2)",
      label: locale === "bn" ? "দ্রুত ডেলিভারি"  : "Same-Day Delivery",
      sub:   locale === "bn" ? "ঢাকায় ২-৪ ঘন্টা" : "2-4 hrs in Dhaka",
    },
    {
      Icon: ShieldCheck, emoji: "🔐",
      color: "#4F9EFF", bg: "rgba(79,158,255,0.08)", border: "rgba(79,158,255,0.2)",
      label: locale === "bn" ? "নিরাপদ পেমেন্ট"    : "Secure Payment",
      sub:   locale === "bn" ? "bKash, Nagad, COD" : "bKash, Nagad, COD",
    },
    {
      Icon: Leaf, emoji: "🌿",
      color: "#10D876", bg: "rgba(16,216,118,0.08)", border: "rgba(16,216,118,0.2)",
      label: locale === "bn" ? "তাজা গ্যারান্টি"    : "Freshness Guarantee",
      sub:   locale === "bn" ? "সতেজ না হলে ফেরত" : "Fresh or full refund",
    },
    {
      Icon: RefreshCw, emoji: "🔄",
      color: "#FB923C", bg: "rgba(251,146,60,0.08)", border: "rgba(251,146,60,0.2)",
      label: locale === "bn" ? "সহজ রিটার্ন"      : "Easy Returns",
      sub:   locale === "bn" ? "২৪ ঘন্টায় রিফান্ড" : "24-hour refund",
    },
    {
      Icon: Clock, emoji: "📍",
      color: "#A855F7", bg: "rgba(168,85,247,0.08)", border: "rgba(168,85,247,0.2)",
      label: locale === "bn" ? "লাইভ ট্র্যাকিং"     : "Live Order Tracking",
      sub:   locale === "bn" ? "রিয়েল-টাইম আপডেট" : "Real-time updates",
    },
  ];

  return (
    <main style={{ minHeight: "100vh" }}>
      <ScrollProgress />

      {/* 1. Hero Banner */}
      <HeroBanner />

      {/* 2. Trust Strip */}
      <section
        ref={trustRef as React.RefObject<HTMLElement>}
        style={{ padding: "10px 0 18px" }}
      >
        <div className="container" style={{ overflow: "hidden" }}>
          <div
            style={{
              display: "flex", gap: "8px",
              overflowX: "auto", scrollbarWidth: "none",
              paddingBottom: "2px",
              width: "100%", maxWidth: "100%",
              boxSizing: "border-box",
            }}
          >
            {trustItems.map(({ Icon, color, bg, border, label, sub }, i) => (
              <div
                key={i}
                style={{
                  display: "flex", alignItems: "center", gap: "9px",
                  padding: "8px 12px",
                  background: "var(--bg-card)",
                  borderRadius: "12px",
                  border: `1px solid var(--border-subtle)`,
                  boxShadow: "0 2px 6px rgba(0,0,0,0.02)",
                  flexShrink: 0, flex: "1 1 0", minWidth: "135px",
                  transition: "all var(--t-smooth)",
                  cursor: "default",
                  position: "relative",
                  overflow: "hidden",
                  opacity: trustVis ? 1 : 0,
                  transform: trustVis ? "translateY(0)" : "translateY(14px)",
                  transitionDelay: trustVis ? `${i * 0.05}s` : "0s",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = "translateY(-3px)";
                  e.currentTarget.style.borderColor = border;
                  e.currentTarget.style.boxShadow = `0 6px 16px rgba(0,0,0,0.06), 0 0 16px ${bg}`;
                  e.currentTarget.style.background = bg;
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.borderColor = "var(--border-subtle)";
                  e.currentTarget.style.boxShadow = "0 2px 6px rgba(0,0,0,0.02)";
                  e.currentTarget.style.background = "var(--bg-card)";
                }}
              >
                {/* Top accent line */}
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "1.5px", background: `linear-gradient(90deg, transparent, ${color}, transparent)`, opacity: 0.7 }} />
                <div
                  style={{
                    width: "28px", height: "28px",
                    borderRadius: "8px",
                    background: bg,
                    border: `1px solid ${border}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Icon size={14} color={color} />
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: "0.74rem", fontWeight: 700, color: "var(--text-main)", lineHeight: 1.15, fontFamily: "var(--font-heading)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {label}
                  </div>
                  <div style={{ fontSize: "0.62rem", color: "var(--text-muted)", marginTop: "2px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
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
      <div className="section-divider" style={{ margin: "0 auto", width: "100%", maxWidth: "1280px" }} />

      {/* 4. Flash Deals */}
      <FlashDeals />

      {/* 5. Best Sellers */}
      <section
        ref={bestRef as React.RefObject<HTMLElement>}
        style={{ padding: "36px 0" }}
      >
        <div className="container">
          <div
            style={{
              opacity: bestVis ? 1 : 0,
              transform: bestVis ? "translateY(0)" : "translateY(24px)",
              transition: "all 0.6s var(--ease-out)",
            }}
          >
            <SectionHeader
              eyebrow={`✨ ${t.bestSellers || (locale === "bn" ? "সেরা বিক্রয়" : "Best Sellers")}`}
              heading={t.popularProducts || (locale === "bn" ? "সবচেয়ে জনপ্রিয় পণ্য" : "Most Popular Products")}
              sub={locale === "bn" ? "গ্রাহকরা বারবার কিনছেন এমন পণ্য" : "Products customers keep coming back for"}
              viewAllHref="/category/all"
              viewAllLabel={t.viewAll || (locale === "bn" ? "সব দেখুন" : "View All")}
            />
          </div>
          <div className="product-grid">
            {featuredProducts.map((prod, i) => (
              <div
                key={prod.id}
                style={{
                  minWidth: 0,
                  width: "100%",
                  boxSizing: "border-box",
                  opacity: bestVis ? 1 : 0,
                  transform: bestVis ? "translateY(0) scale(1)" : "translateY(20px) scale(0.97)",
                  transition: "all 0.6s var(--ease-out)",
                  transitionDelay: bestVis ? `${i * 0.08}s` : "0s",
                }}
              >
                <ProductCard product={prod} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="section-divider" style={{ margin: "0 auto", width: "100%", maxWidth: "1280px" }} />

      {/* 6. Organic Section */}
      <section
        ref={organicRef as React.RefObject<HTMLElement>}
        style={{
          padding: "36px 0",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Emerald ambient glow */}
        <div style={{ position: "absolute", top: "-100px", right: "-100px", width: "400px", height: "400px", borderRadius: "50%", background: "radial-gradient(circle, rgba(16,216,118,0.05) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: "-80px", left: "10%", width: "300px", height: "300px", borderRadius: "50%", background: "radial-gradient(circle, rgba(16,216,118,0.03) 0%, transparent 70%)", pointerEvents: "none" }} />

        <div className="container" style={{ position: "relative", zIndex: 1 }}>
          <div
            style={{
              opacity: organicVis ? 1 : 0,
              transform: organicVis ? "translateY(0)" : "translateY(24px)",
              transition: "all 0.6s var(--ease-out)",
            }}
          >
            <SectionHeader
              eyebrow={`🌿 ${locale === "bn" ? "১০০% রাসায়নিকমুক্ত" : "100% Pesticide-Free"}`}
              eyebrowClass="section-eyebrow--green"
              heading={t.organicPicks || (locale === "bn" ? "জৈব ও প্রাকৃতিক পণ্য" : "Organic & Natural Picks")}
              sub={locale === "bn" ? "স্থানীয় জৈব খামার থেকে সরাসরি সংগ্রহ করা পণ্য" : "Harvested directly from certified local sustainable eco-farms"}
              viewAllHref="/category/vegetables"
              viewAllLabel={t.viewAll || (locale === "bn" ? "সব দেখুন" : "View All")}
            />
          </div>
          <div className="product-grid">
            {organicProducts.map((prod, i) => (
              <div
                key={prod.id}
                style={{
                  minWidth: 0,
                  width: "100%",
                  boxSizing: "border-box",
                  opacity: organicVis ? 1 : 0,
                  transform: organicVis ? "translateY(0) scale(1)" : "translateY(20px) scale(0.97)",
                  transition: "all 0.6s var(--ease-out)",
                  transitionDelay: organicVis ? `${i * 0.08}s` : "0s",
                }}
              >
                <ProductCard product={prod} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. App Download CTA */}
      <section
        ref={appRef as React.RefObject<HTMLElement>}
        style={{ padding: "8px 0 60px" }}
      >
        <div className="container">
          <div
            style={{
              background: "linear-gradient(135deg, #060E08 0%, #0A1A0C 35%, #0E2412 65%, #122E18 100%)",
              borderRadius: "var(--radius-3xl)",
              color: "#FFFFFF",
              padding: "clamp(36px, 5.5vw, 64px)",
              display: "flex", alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap", gap: "36px",
              boxShadow: "var(--shadow-2xl), 0 0 0 1px rgba(16,216,118,0.12), 0 0 100px rgba(16,216,118,0.06)",
              position: "relative", overflow: "hidden",
              opacity: appVis ? 1 : 0,
              transform: appVis ? "translateY(0)" : "translateY(28px)",
              transition: "all 0.7s var(--ease-out)",
            }}
          >
            {/* Background decorations */}
            <div style={{ position: "absolute", top: "-80px", right: "-60px", width: "350px", height: "350px", borderRadius: "50%", background: "radial-gradient(circle, rgba(16,216,118,0.08) 0%, transparent 70%)", pointerEvents: "none", animation: "orbPulse 5s ease-in-out infinite" }} />
            <div style={{ position: "absolute", bottom: "-60px", right: "160px", width: "220px", height: "220px", borderRadius: "50%", background: "radial-gradient(circle, rgba(245,200,66,0.06) 0%, transparent 70%)", pointerEvents: "none" }} />

            {/* Grid pattern */}
            <div
              style={{
                position: "absolute", inset: 0, pointerEvents: "none",
                backgroundImage: "linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)",
                backgroundSize: "55px 55px",
              }}
            />

            {/* Top neon line */}
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "2px", background: "linear-gradient(90deg, transparent, rgba(16,216,118,0.8), transparent)", zIndex: 2 }} />

            {/* Text */}
            <div style={{ maxWidth: "580px", position: "relative" }}>
              <span
                style={{
                  background: "linear-gradient(135deg, #F5C842, #D4A017)",
                  color: "#000",
                  padding: "5px 16px",
                  borderRadius: "var(--radius-full)",
                  fontSize: "var(--text-xs)", fontWeight: 900,
                  letterSpacing: "0.05em", display: "inline-block",
                  marginBottom: "18px",
                  boxShadow: "0 4px 20px rgba(245,200,66,0.5)",
                  fontFamily: "var(--font-heading)",
                }}
              >
                📱 {locale === "bn" ? "মোবাইল অ্যাপ ও ক্যাশব্যাক" : "Mobile App & Cashback"}
              </span>
              <h2
                style={{
                  fontFamily: "var(--font-heading)",
                  fontSize: "clamp(1.5rem, 4vw, 2.4rem)",
                  fontWeight: 800, lineHeight: 1.15,
                  marginBottom: "16px", letterSpacing: "-0.04em",
                }}
              >
                {locale === "bn"
                  ? "প্রথম অর্ডারে পান "
                  : "Get "}
                <span style={{ color: "var(--emerald)" }}>
                  {locale === "bn" ? "৳১০০ ক্যাশব্যাক!" : "৳100 Cashback"}
                </span>
                {locale !== "bn" && " on Your First Order!"}
              </h2>
              <p style={{ color: "rgba(240,242,247,0.7)", fontSize: "var(--text-base)", lineHeight: 1.7, maxWidth: "50ch" }}>
                {locale === "bn"
                  ? "লাইভ রাইডার ট্র্যাকিং, লয়্যালটি পয়েন্ট এবং ১-ক্লিক রিঅর্ডার — শুধুমাত্র আমাদের অ্যাপে।"
                  : "Live GPS rider tracking, loyalty Tatka Coins, and seamless 1-click reordering — exclusively on our app."}
              </p>

              {/* Feature pills */}
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "22px" }}>
                {[
                  { icon: "📍", text: locale === "bn" ? "লাইভ ট্র্যাকিং" : "Live Tracking" },
                  { icon: "🪙", text: locale === "bn" ? "লয়্যালটি কয়েন" : "Loyalty Coins" },
                  { icon: "⚡", text: locale === "bn" ? "১-ক্লিক রিঅর্ডার" : "1-Click Reorder" },
                ].map((f, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex", alignItems: "center", gap: "6px",
                      padding: "7px 14px",
                      background: "rgba(255,255,255,0.06)",
                      borderRadius: "var(--radius-full)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      fontSize: "var(--text-xs)", fontWeight: 600,
                      backdropFilter: "blur(12px)",
                    }}
                  >
                    <span>{f.icon}</span>
                    <span>{f.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* App Store Buttons */}
            <div style={{ display: "flex", gap: "14px", flexWrap: "wrap", position: "relative" }}>
              {[
                { label: "GET IT ON",   store: "Google Play", icon: "▶" },
                { label: "DOWNLOAD ON", store: "App Store",   icon: "" },
              ].map(({ label, store }, i) => (
                <button
                  key={i}
                  type="button"
                  style={{
                    background: "rgba(8,9,11,0.7)",
                    color: "#FFFFFF", padding: "14px 24px",
                    borderRadius: "var(--radius-lg)",
                    display: "flex", alignItems: "center", gap: "13px",
                    fontWeight: 700, fontSize: "var(--text-base)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    cursor: "pointer",
                    transition: "all var(--t-smooth)",
                    backdropFilter: "blur(16px)",
                    minWidth: "180px",
                    fontFamily: "var(--font-heading)",
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = "rgba(8,9,11,0.9)";
                    e.currentTarget.style.transform = "translateY(-4px) scale(1.02)";
                    e.currentTarget.style.boxShadow = "0 12px 32px rgba(0,0,0,0.5)";
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)";
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = "rgba(8,9,11,0.7)";
                    e.currentTarget.style.transform = "translateY(0) scale(1)";
                    e.currentTarget.style.boxShadow = "none";
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
                  }}
                >
                  <Download size={21} />
                  <div style={{ textAlign: "left" }}>
                    <div style={{ fontSize: "0.56rem", opacity: 0.55, letterSpacing: "0.12em", textTransform: "uppercase" }}>{label}</div>
                    <div style={{ fontSize: "1rem", fontWeight: 800, letterSpacing: "-0.02em" }}>{store}</div>
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
