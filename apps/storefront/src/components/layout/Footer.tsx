"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  MessageSquare, Phone, Mail, MapPin, ChevronDown,
  ArrowRight, Check, ShieldCheck, Truck, Sparkles,
  Heart
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { CATEGORIES } from "@/lib/catalog";

// Social Icons (SVG)
const FacebookIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const XTwitterIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.259 5.63 5.905-5.63zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const InstagramIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

export function Footer() {
  const { locale, toggleLocale } = useLanguage();
  const [emailInput, setEmailInput] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);

  // Accordion Mobile State
  const [openSection, setOpenSection] = useState<string | null>(null);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (emailInput.trim()) {
      setIsSubscribed(true);
      setEmailInput("");
      setTimeout(() => setIsSubscribed(false), 4000);
    }
  };

  const toggleAccordion = (section: string) => {
    setOpenSection(openSection === section ? null : section);
  };

  return (
    <footer
      style={{
        background: "#ffffff",
        color: "#0f172a",
        paddingTop: "60px",
        paddingBottom: "36px",
        borderTop: "1px solid #e2e8f0",
        fontFamily: "var(--font-body, system-ui, -apple-system, sans-serif)",
      }}
    >
      <div style={{ maxWidth: "1240px", margin: "0 auto", padding: "0 24px" }}>
        
        {/* ── 1. Top Newsletter Card (2-Column Banner) ── */}
        <div
          style={{
            background: "#f8fafc",
            border: "1px solid #e2e8f0",
            borderRadius: "24px",
            padding: "clamp(24px, 4vw, 40px)",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "36px",
            alignItems: "center",
            marginBottom: "48px",
          }}
        >
          {/* Left: Product Showcase Photo */}
          <div
            style={{
              position: "relative",
              width: "100%",
              height: "260px",
              borderRadius: "18px",
              overflow: "hidden",
              background: "#e2e8f0",
            }}
          >
            <img
              src="https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&auto=format&fit=crop&q=80"
              alt="Fresh Organic Produce"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
            <div
              style={{
                position: "absolute",
                bottom: "14px",
                left: "14px",
                background: "rgba(0,0,0,0.75)",
                color: "#ffffff",
                backdropFilter: "blur(8px)",
                padding: "6px 14px",
                borderRadius: "999px",
                fontSize: "0.76rem",
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <Sparkles size={13} color="#10D876" />
              <span>100% Farm Fresh Guaranteed</span>
            </div>
          </div>

          {/* Right: Newsletter Form */}
          <div>
            <h2
              style={{
                fontSize: "clamp(1.7rem, 2.5vw, 2.1rem)",
                fontWeight: 800,
                color: "#0f172a",
                margin: "0 0 10px 0",
                letterSpacing: "-0.02em",
              }}
            >
              Newsletter
            </h2>

            <p
              style={{
                fontSize: "0.9rem",
                lineHeight: 1.6,
                color: "#475569",
                margin: "0 0 20px 0",
                maxWidth: "460px",
              }}
            >
              Join our newsletter for fresh harvest updates, seasonal organic recipes, exclusive offers, and early access to chemical-free essentials.
            </p>

            <form onSubmit={handleSubscribe} style={{ marginBottom: "12px" }}>
              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  maxWidth: "460px",
                  flexWrap: "wrap",
                }}
              >
                <input
                  type="email"
                  required
                  placeholder="Email Address"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  style={{
                    flex: "1 1 220px",
                    padding: "12px 16px",
                    borderRadius: "8px",
                    border: "1px solid #cbd5e1",
                    background: "#ffffff",
                    fontSize: "0.88rem",
                    color: "#0f172a",
                    outline: "none",
                  }}
                />
                <button
                  type="submit"
                  style={{
                    padding: "12px 24px",
                    borderRadius: "8px",
                    background: "#000000",
                    color: "#ffffff",
                    fontWeight: 700,
                    fontSize: "0.88rem",
                    border: "none",
                    cursor: "pointer",
                    transition: "background 0.2s ease",
                    flexShrink: 0,
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "#1e293b"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "#000000"; }}
                >
                  {isSubscribed ? "Subscribed ✓" : "Subscribe"}
                </button>
              </div>
            </form>

            <p style={{ fontSize: "0.75rem", color: "#64748b", margin: 0 }}>
              By subscribing you agree to the <Link href="/" style={{ color: "#0f172a", textDecoration: "underline" }}>Terms of Use</Link> & <Link href="/" style={{ color: "#0f172a", textDecoration: "underline" }}>Privacy Policy</Link>.
            </p>
          </div>
        </div>

        {/* ── 2. Support Info Row (4 Columns / Cards) ── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "16px",
            border: "1px solid #e2e8f0",
            borderRadius: "18px",
            padding: "24px 28px",
            marginBottom: "56px",
            background: "#ffffff",
          }}
        >
          {/* Customer Support */}
          <div style={{ display: "flex", alignItems: "flex-start", gap: "14px" }}>
            <div style={{ color: "#0f172a", marginTop: "2px" }}>
              <MessageSquare size={20} />
            </div>
            <div>
              <div style={{ fontSize: "0.92rem", fontWeight: 700, color: "#0f172a", marginBottom: "2px" }}>
                Customer Support
              </div>
              <div style={{ fontSize: "0.78rem", color: "#64748b" }}>
                Mon-Sun, 6am - 10pm BST
              </div>
            </div>
          </div>

          {/* Call Us */}
          <div style={{ display: "flex", alignItems: "flex-start", gap: "14px" }}>
            <div style={{ color: "#0f172a", marginTop: "2px" }}>
              <Phone size={20} />
            </div>
            <div>
              <div style={{ fontSize: "0.92rem", fontWeight: 700, color: "#0f172a", marginBottom: "2px" }}>
                Call Us
              </div>
              <div style={{ fontSize: "0.78rem", color: "#64748b" }}>
                +880 9612-828520 (Toll-Free)
              </div>
            </div>
          </div>

          {/* Email Us */}
          <div style={{ display: "flex", alignItems: "flex-start", gap: "14px" }}>
            <div style={{ color: "#0f172a", marginTop: "2px" }}>
              <Mail size={20} />
            </div>
            <div>
              <div style={{ fontSize: "0.92rem", fontWeight: 700, color: "#0f172a", marginBottom: "2px" }}>
                Email Us
              </div>
              <div style={{ fontSize: "0.78rem", color: "#64748b" }}>
                support@tatkabazar.com
              </div>
            </div>
          </div>

          {/* Address */}
          <div style={{ display: "flex", alignItems: "flex-start", gap: "14px" }}>
            <div style={{ color: "#0f172a", marginTop: "2px" }}>
              <MapPin size={20} />
            </div>
            <div>
              <div style={{ fontSize: "0.92rem", fontWeight: 700, color: "#0f172a", marginBottom: "2px" }}>
                Address
              </div>
              <div style={{ fontSize: "0.78rem", color: "#64748b" }}>
                House 42, Road 7/A, Dhanmondi, Dhaka 1209
              </div>
            </div>
          </div>
        </div>

        {/* ── 3. Main Footer Links & Brand Section ── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.4fr 1fr 1fr 1fr",
            gap: "40px",
            paddingBottom: "48px",
            borderBottom: "1px solid #f1f5f9",
          }}
          className="footer-grid-responsive"
        >
          {/* Brand Panel (Left) */}
          <div>
            {/* Logo */}
            <Link
              href="/"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                textDecoration: "none",
                marginBottom: "16px",
              }}
            >
              <div style={{ width: "28px", height: "28px", color: "#0f172a" }}>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                  <polygon points="12 2 2 7 12 12 22 7 12 2" />
                  <polyline points="2 17 12 22 22 17" />
                  <polyline points="2 12 12 17 22 12" />
                </svg>
              </div>
              <span style={{ fontSize: "1.3rem", fontWeight: 900, color: "#0f172a", letterSpacing: "-0.03em" }}>
                TatkaBazar<span style={{ color: "#10D876" }}>.com</span>
              </span>
            </Link>

            <p
              style={{
                fontSize: "0.85rem",
                lineHeight: 1.6,
                color: "#64748b",
                margin: "0 0 20px 0",
                maxWidth: "340px",
              }}
            >
              Direct-from-source organic marketplace empowering Bangladeshi farmers and fishermen with fair prices and express chemical-free home delivery.
            </p>

            {/* Language Dropdown Selector */}
            <div style={{ marginBottom: "20px" }}>
              <button
                type="button"
                onClick={toggleLocale}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "8px 14px",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  background: "#f8fafc",
                  fontSize: "0.82rem",
                  fontWeight: 600,
                  color: "#0f172a",
                  cursor: "pointer",
                }}
              >
                <span>{locale === "bn" ? "বাংলা (BN)" : "English (EN)"}</span>
                <ChevronDown size={14} color="#64748b" />
              </button>
            </div>

            {/* Payment Badges Row */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
              <span style={{ padding: "4px 8px", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "6px", fontSize: "0.72rem", fontWeight: 800, color: "#e11d48" }}>bKash</span>
              <span style={{ padding: "4px 8px", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "6px", fontSize: "0.72rem", fontWeight: 800, color: "#ea580c" }}>Nagad</span>
              <span style={{ padding: "4px 8px", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "6px", fontSize: "0.72rem", fontWeight: 800, color: "#0f172a" }}>VISA</span>
              <span style={{ padding: "4px 8px", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "6px", fontSize: "0.72rem", fontWeight: 800, color: "#dc2626" }}>Mastercard</span>
              <span style={{ padding: "4px 8px", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "6px", fontSize: "0.72rem", fontWeight: 800, color: "#007A48" }}>COD</span>
            </div>
          </div>

          {/* Column 1: Shop */}
          <div>
            <div
              onClick={() => toggleAccordion("shop")}
              style={{
                fontSize: "0.92rem",
                fontWeight: 800,
                color: "#0f172a",
                marginBottom: "16px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                cursor: "pointer",
              }}
            >
              <span>Shop</span>
              <ChevronDown size={14} className="hidden-desktop-chevron" />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <Link href="/category/vegetables" style={{ color: "#64748b", textDecoration: "none", fontSize: "0.85rem", transition: "color 0.15s ease" }} onMouseEnter={e => (e.currentTarget.style.color = "#007A48")} onMouseLeave={e => (e.currentTarget.style.color = "#64748b")}>New Harvests</Link>
              <Link href="/category/fish-and-meat" style={{ color: "#64748b", textDecoration: "none", fontSize: "0.85rem", transition: "color 0.15s ease" }} onMouseEnter={e => (e.currentTarget.style.color = "#007A48")} onMouseLeave={e => (e.currentTarget.style.color = "#64748b")}>River Fish Specials</Link>
              <Link href="/category/rice-and-staples" style={{ color: "#64748b", textDecoration: "none", fontSize: "0.85rem", transition: "color 0.15s ease" }} onMouseEnter={e => (e.currentTarget.style.color = "#007A48")} onMouseLeave={e => (e.currentTarget.style.color = "#64748b")}>Organic Staples & Grains</Link>
              <Link href="/b2b" style={{ color: "#64748b", textDecoration: "none", fontSize: "0.85rem", transition: "color 0.15s ease" }} onMouseEnter={e => (e.currentTarget.style.color = "#007A48")} onMouseLeave={e => (e.currentTarget.style.color = "#64748b")}>Wholesale B2B Deals</Link>
              <Link href="/bundles" style={{ color: "#64748b", textDecoration: "none", fontSize: "0.85rem", transition: "color 0.15s ease" }} onMouseEnter={e => (e.currentTarget.style.color = "#007A48")} onMouseLeave={e => (e.currentTarget.style.color = "#64748b")}>Weekly Family Bundles</Link>
            </div>
          </div>

          {/* Column 2: Support */}
          <div>
            <div
              onClick={() => toggleAccordion("support")}
              style={{
                fontSize: "0.92rem",
                fontWeight: 800,
                color: "#0f172a",
                marginBottom: "16px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                cursor: "pointer",
              }}
            >
              <span>Support</span>
              <ChevronDown size={14} className="hidden-desktop-chevron" />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <Link href="/account" style={{ color: "#64748b", textDecoration: "none", fontSize: "0.85rem", transition: "color 0.15s ease" }} onMouseEnter={e => (e.currentTarget.style.color = "#007A48")} onMouseLeave={e => (e.currentTarget.style.color = "#64748b")}>Contact Us</Link>
              <Link href="/account" style={{ color: "#64748b", textDecoration: "none", fontSize: "0.85rem", transition: "color 0.15s ease" }} onMouseEnter={e => (e.currentTarget.style.color = "#007A48")} onMouseLeave={e => (e.currentTarget.style.color = "#64748b")}>FAQs</Link>
              <Link href="/track" style={{ color: "#64748b", textDecoration: "none", fontSize: "0.85rem", transition: "color 0.15s ease" }} onMouseEnter={e => (e.currentTarget.style.color = "#007A48")} onMouseLeave={e => (e.currentTarget.style.color = "#64748b")}>Order Tracking</Link>
              <Link href="/account" style={{ color: "#64748b", textDecoration: "none", fontSize: "0.85rem", transition: "color 0.15s ease" }} onMouseEnter={e => (e.currentTarget.style.color = "#007A48")} onMouseLeave={e => (e.currentTarget.style.color = "#64748b")}>Returns & Exchanges</Link>
            </div>
          </div>

          {/* Column 3: About & Socials */}
          <div>
            <div
              onClick={() => toggleAccordion("about")}
              style={{
                fontSize: "0.92rem",
                fontWeight: 800,
                color: "#0f172a",
                marginBottom: "16px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                cursor: "pointer",
              }}
            >
              <span>About</span>
              <ChevronDown size={14} className="hidden-desktop-chevron" />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "24px" }}>
              <Link href="/recipes" style={{ color: "#64748b", textDecoration: "none", fontSize: "0.85rem", transition: "color 0.15s ease" }} onMouseEnter={e => (e.currentTarget.style.color = "#007A48")} onMouseLeave={e => (e.currentTarget.style.color = "#64748b")}>Our Farm Story</Link>
              <Link href="/recipes" style={{ color: "#64748b", textDecoration: "none", fontSize: "0.85rem", transition: "color 0.15s ease" }} onMouseEnter={e => (e.currentTarget.style.color = "#007A48")} onMouseLeave={e => (e.currentTarget.style.color = "#64748b")}>Chemical-Free Promise</Link>
              <Link href="/b2b" style={{ color: "#64748b", textDecoration: "none", fontSize: "0.85rem", transition: "color 0.15s ease" }} onMouseEnter={e => (e.currentTarget.style.color = "#007A48")} onMouseLeave={e => (e.currentTarget.style.color = "#64748b")}>Farmer Partnership</Link>
            </div>

            {/* Social Icons (Black circular buttons with white icons) */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook"
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  background: "#000000",
                  color: "#ffffff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  textDecoration: "none",
                  transition: "transform 0.15s ease",
                }}
                onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.08)")}
                onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
              >
                <FacebookIcon />
              </a>

              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                aria-label="X Twitter"
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  background: "#000000",
                  color: "#ffffff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  textDecoration: "none",
                  transition: "transform 0.15s ease",
                }}
                onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.08)")}
                onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
              >
                <XTwitterIcon />
              </a>

              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  background: "#000000",
                  color: "#ffffff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  textDecoration: "none",
                  transition: "transform 0.15s ease",
                }}
                onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.08)")}
                onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
              >
                <InstagramIcon />
              </a>
            </div>
          </div>
        </div>

        {/* ── 4. Bottom Copyright & Policy Bar ── */}
        <div
          style={{
            paddingTop: "24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "14px",
            fontSize: "0.8rem",
            color: "#64748b",
          }}
        >
          <div>
            © 2026 Made with <span style={{ color: "#ef4444" }}>❤️</span> by <strong style={{ color: "#0f172a" }}>TatkaBazar.com</strong>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "18px", flexWrap: "wrap" }}>
            <Link href="/" style={{ color: "#64748b", textDecoration: "none" }} onMouseEnter={e => (e.currentTarget.style.color = "#0f172a")} onMouseLeave={e => (e.currentTarget.style.color = "#64748b")}>Shipping Policy</Link>
            <Link href="/" style={{ color: "#64748b", textDecoration: "none" }} onMouseEnter={e => (e.currentTarget.style.color = "#0f172a")} onMouseLeave={e => (e.currentTarget.style.color = "#64748b")}>Returns Policy</Link>
            <Link href="/" style={{ color: "#64748b", textDecoration: "none" }} onMouseEnter={e => (e.currentTarget.style.color = "#0f172a")} onMouseLeave={e => (e.currentTarget.style.color = "#64748b")}>Terms Of Service</Link>
            <Link href="/" style={{ color: "#64748b", textDecoration: "none" }} onMouseEnter={e => (e.currentTarget.style.color = "#0f172a")} onMouseLeave={e => (e.currentTarget.style.color = "#64748b")}>Privacy Policy</Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
