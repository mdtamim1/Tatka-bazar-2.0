"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  MapPin, Phone, Mail, Clock, Send,
  ShieldCheck, Award, Truck, Check,
} from "lucide-react";

// Brand icons removed from lucide-react — inline SVG replacements
const Facebook  = ({ size = 18 }: { size?: number }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg>);
const Instagram = ({ size = 18 }: { size?: number }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" /></svg>);
const Youtube   = ({ size = 18 }: { size?: number }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" /><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="white" /></svg>);
const Twitter   = ({ size = 18 }: { size?: number }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.259 5.63 5.905-5.63zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>);
import { useLanguage } from "@/context/LanguageContext";
import { BRANCHES, CATEGORIES } from "@/lib/catalog";

export function Footer() {
  const { locale, t } = useLanguage();
  const [email, setEmail]           = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) { setSubscribed(true); setEmail(""); }
  };

  const trustPillars = [
    { Icon: ShieldCheck, color: "#4ADE80", bg: "rgba(74, 222, 128, 0.12)", titleKey: "trust1Title" as const, descKey: "trust1Desc" as const },
    { Icon: Truck,       color: "#FB923C", bg: "rgba(251, 146, 60, 0.12)", titleKey: "trust2Title" as const, descKey: "trust2Desc" as const },
    { Icon: Award,       color: "#4ADE80", bg: "rgba(74, 222, 128, 0.12)", titleKey: "trust3Title" as const, descKey: "trust3Desc" as const },
    { Icon: Clock,       color: "#60A5FA", bg: "rgba(96, 165, 250, 0.12)", titleKey: "trust4Title" as const, descKey: "trust4Desc" as const },
  ];

  const socialLinks = [
    { Icon: Facebook,  href: "#", label: "Facebook",  color: "#1877F2" },
    { Icon: Instagram, href: "#", label: "Instagram", color: "#E4405F" },
    { Icon: Youtube,   href: "#", label: "YouTube",   color: "#FF0000" },
    { Icon: Twitter,   href: "#", label: "Twitter",   color: "#1DA1F2" },
  ];

  return (
    <footer
      style={{
        background: "linear-gradient(180deg, #060F08 0%, #040A06 100%)",
        color: "#E2E8F0",
        paddingTop: "64px",
        paddingBottom: "32px",
        marginTop: "80px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Aurora background effect */}
      <div
        style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          background: `
            radial-gradient(ellipse 60% 40% at 10% 0%, rgba(34,197,94,0.07) 0%, transparent 55%),
            radial-gradient(ellipse 50% 35% at 90% 100%, rgba(245,158,11,0.05) 0%, transparent 50%)
          `,
        }}
      />

      {/* Top green accent line */}
      <div
        style={{
          position: "absolute", top: 0, left: 0, right: 0,
          height: "3px",
          background: "linear-gradient(90deg, transparent 0%, #22C55E 30%, #86EFAC 50%, #22C55E 70%, transparent 100%)",
        }}
      />

      <div className="container" style={{ position: "relative", zIndex: 1 }}>

        {/* Trust Pillars */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "20px",
            paddingBottom: "44px",
            borderBottom: "1px solid rgba(255,255,255,0.07)",
            marginBottom: "52px",
          }}
        >
          {trustPillars.map(({ Icon, color, bg, titleKey, descKey }, i) => (
            <div
              key={i}
              style={{
                display: "flex", gap: "14px", alignItems: "flex-start",
                padding: "18px",
                background: "rgba(255,255,255,0.03)",
                borderRadius: "var(--radius-lg)",
                border: "1px solid rgba(255,255,255,0.06)",
                transition: "all var(--t-smooth)",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.borderColor = "rgba(34,197,94,0.15)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.03)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"; }}
            >
              <div
                style={{
                  padding: "11px", borderRadius: "12px",
                  background: bg, color,
                  flexShrink: 0,
                }}
              >
                <Icon size={24} />
              </div>
              <div>
                <h4 style={{ color: "#F8FAFC", fontSize: "0.94rem", fontWeight: 700, marginBottom: "5px" }}>
                  {t[titleKey]}
                </h4>
                <p style={{ fontSize: "0.8rem", color: "#94A3B8", lineHeight: 1.5 }}>
                  {t[descKey]}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Main Content Columns */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "44px",
            marginBottom: "52px",
          }}
        >
          {/* Column 1: Brand */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "18px" }}>
              <div
                style={{
                  width: "44px", height: "44px",
                  borderRadius: "14px",
                  background: "linear-gradient(135deg, #22C55E, #15803D)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "1.4rem",
                  boxShadow: "0 6px 20px rgba(34,197,94,0.3)",
                }}
              >
                🌾
              </div>
              <div>
                <div style={{ fontSize: "1.3rem", fontWeight: 900, color: "#F8FAFC", letterSpacing: "-0.03em" }}>
                  {locale === "bn" ? "তাতকা বাজার" : "Tatka Bazar"}
                </div>
                <div style={{ fontSize: "0.68rem", color: "#4ADE80", fontWeight: 600, letterSpacing: "0.04em" }}>
                  Bangladesh's Premium Fresh Marketplace
                </div>
              </div>
            </div>
            <p style={{ fontSize: "0.84rem", color: "#94A3B8", lineHeight: 1.7, marginBottom: "22px" }}>
              {t.footerAbout}
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "0.84rem", color: "#CBD5E1" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ padding: "6px", background: "rgba(34,197,94,0.1)", borderRadius: "8px" }}>
                  <Phone size={14} color="#4ADE80" />
                </div>
                <span>{t.hotline}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ padding: "6px", background: "rgba(34,197,94,0.1)", borderRadius: "8px" }}>
                  <Mail size={14} color="#4ADE80" />
                </div>
                <span>support@tatkabazar.com</span>
              </div>
            </div>

            {/* Social Links */}
            <div style={{ display: "flex", gap: "10px", marginTop: "22px" }}>
              {socialLinks.map(({ Icon, href, label, color }) => (
                <Link
                  key={label}
                  href={href}
                  aria-label={label}
                  style={{
                    width: "38px", height: "38px",
                    borderRadius: "10px",
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "#94A3B8",
                    transition: "all var(--t-fast)",
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = `${color}22`;
                    e.currentTarget.style.borderColor = `${color}44`;
                    e.currentTarget.style.color = color;
                    e.currentTarget.style.transform = "translateY(-3px)";
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
                    e.currentTarget.style.color = "#94A3B8";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  <Icon size={17} />
                </Link>
              ))}
            </div>
          </div>

          {/* Column 2: Hub Locations */}
          <div>
            <h3
              style={{
                color: "#F8FAFC", fontSize: "1rem", fontWeight: 800,
                marginBottom: "20px",
                display: "flex", alignItems: "center", gap: "8px",
              }}
            >
              <MapPin size={16} color="#4ADE80" />
              {t.hubLocations}
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {BRANCHES.map(b => (
                <div
                  key={b.id}
                  style={{
                    padding: "12px",
                    background: "rgba(255,255,255,0.03)",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid rgba(255,255,255,0.06)",
                    fontSize: "0.82rem",
                    transition: "all var(--t-fast)",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = "rgba(34,197,94,0.06)"; e.currentTarget.style.borderColor = "rgba(34,197,94,0.15)"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.03)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"; }}
                >
                  <div style={{ fontWeight: 700, color: "#F8FAFC", marginBottom: "3px" }}>
                    {locale === "bn" ? b.nameBn : b.nameEn}
                  </div>
                  <div style={{ color: "#94A3B8" }}>
                    {locale === "bn" ? b.addressBn : b.addressEn}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Column 3: Categories */}
          <div>
            <h3 style={{ color: "#F8FAFC", fontSize: "1rem", fontWeight: 800, marginBottom: "20px" }}>
              {locale === "bn" ? "বাজারের বিভাগ" : "Quick Categories"}
            </h3>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "10px" }}>
              {CATEGORIES.map(c => (
                <li key={c.id}>
                  <Link
                    href={`/category/${c.slug}`}
                    style={{
                      color: "#94A3B8", transition: "all var(--t-fast)",
                      display: "flex", alignItems: "center", gap: "8px",
                      fontSize: "0.85rem", fontWeight: 500,
                      padding: "4px 0",
                    }}
                    onMouseEnter={e => { e.currentTarget.style.color = "#4ADE80"; e.currentTarget.style.paddingLeft = "6px"; }}
                    onMouseLeave={e => { e.currentTarget.style.color = "#94A3B8"; e.currentTarget.style.paddingLeft = "0"; }}
                  >
                    <span>{c.icon}</span>
                    <span>{locale === "bn" ? c.nameBn : c.nameEn}</span>
                  </Link>
                </li>
              ))}
              <li style={{ paddingTop: "8px" }}>
                <Link
                  href="/b2b"
                  style={{
                    color: "#FDE047", fontWeight: 700, fontSize: "0.85rem",
                    display: "flex", alignItems: "center", gap: "6px",
                    transition: "all var(--t-fast)",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.color = "#FEF08A"; e.currentTarget.style.paddingLeft = "4px"; }}
                  onMouseLeave={e => { e.currentTarget.style.color = "#FDE047"; e.currentTarget.style.paddingLeft = "0"; }}
                >
                  🏢 {locale === "bn" ? "পাইকারি / B2B অ্যাকাউন্ট →" : "Wholesale / B2B Account →"}
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Newsletter */}
          <div>
            <h3 style={{ color: "#F8FAFC", fontSize: "1rem", fontWeight: 800, marginBottom: "8px" }}>
              {locale === "bn" ? "বিশেষ অফার ও আপডেট" : "Newsletter & Deals"}
            </h3>
            <p style={{ fontSize: "0.82rem", color: "#94A3B8", marginBottom: "16px", lineHeight: 1.6 }}>
              {locale === "bn"
                ? "প্রতিদিনের তাজা বাজার ও বিশেষ ছাড়ের আপডেট পেতে সাবস্ক্রাইব করুন।"
                : "Subscribe to get daily fresh deals and special discount notifications."}
            </p>

            <form onSubmit={handleSubscribe} style={{ display: "flex", gap: "8px", marginBottom: "20px" }}>
              <input
                type="email" required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder={locale === "bn" ? "আপনার ইমেইল..." : "Enter your email..."}
                style={{
                  flex: 1, padding: "10px 14px",
                  borderRadius: "var(--radius-md)",
                  background: "rgba(255,255,255,0.07)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  color: "#FFF", fontSize: "0.84rem", outline: "none",
                  transition: "all var(--t-fast)",
                }}
                onFocus={e => { e.currentTarget.style.borderColor = "rgba(34,197,94,0.4)"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(34,197,94,0.1)"; }}
                onBlur={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)"; e.currentTarget.style.boxShadow = "none"; }}
              />
              <button
                type="submit"
                style={{
                  background: "linear-gradient(135deg, #22C55E, #15803D)",
                  color: "#FFF", padding: "10px 16px",
                  borderRadius: "var(--radius-md)",
                  fontWeight: 700, border: "none", cursor: "pointer",
                  display: "flex", alignItems: "center",
                  boxShadow: "0 4px 14px rgba(34,197,94,0.3)",
                  transition: "all var(--t-fast)",
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.06)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; }}
              >
                <Send size={16} />
              </button>
            </form>

            {subscribed && (
              <div
                style={{
                  display: "flex", alignItems: "center", gap: "7px",
                  color: "#4ADE80", fontSize: "0.82rem", fontWeight: 700,
                  padding: "8px 14px",
                  background: "rgba(34,197,94,0.1)",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid rgba(34,197,94,0.2)",
                  animation: "scaleIn 0.3s var(--ease-bounce)",
                }}
              >
                <Check size={15} />
                <span>{locale === "bn" ? "ধন্যবাদ! সাবস্ক্রিপশন সফল হয়েছে।" : "Subscribed successfully!"}</span>
              </div>
            )}

            {/* Payment badges */}
            <div style={{ marginTop: "22px" }}>
              <div style={{ fontSize: "0.72rem", color: "#64748B", marginBottom: "10px", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                {locale === "bn" ? "পেমেন্ট পার্টনার" : "Accepted Payments"}
              </div>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
                {[
                  { label: "bKash",      bg: "#E2136E" },
                  { label: "Nagad",      bg: "#F7941D" },
                  { label: "VISA",       bg: "#1A1F71" },
                  { label: "Mastercard", bg: "#EB001B" },
                  { label: "💵 COD",    bg: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)" },
                ].map(p => (
                  <span
                    key={p.label}
                    style={{
                      background: p.bg,
                      border: p.border,
                      color: "#FFF",
                      padding: "5px 10px",
                      borderRadius: "6px",
                      fontSize: "0.7rem", fontWeight: 800,
                      boxShadow: "0 2px 8px rgba(0,0,0,0.25)",
                    }}
                  >
                    {p.label}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div
          style={{
            paddingTop: "24px",
            borderTop: "1px solid rgba(255,255,255,0.07)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "16px",
            fontSize: "0.8rem", color: "#4B5563",
          }}
        >
          <div>{t.allRightsReserved}</div>
          <div style={{ display: "flex", gap: "24px" }}>
            {[
              { label: t.terms,     href: "/terms"   },
              { label: t.privacy,   href: "/privacy"  },
              { label: t.contactUs, href: "/contact"  },
            ].map(link => (
              <Link
                key={link.href}
                href={link.href}
                style={{ color: "#64748B", transition: "color var(--t-fast)" }}
                onMouseEnter={e => (e.currentTarget.style.color = "#94A3B8")}
                onMouseLeave={e => (e.currentTarget.style.color = "#64748B")}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

      </div>
    </footer>
  );
}
