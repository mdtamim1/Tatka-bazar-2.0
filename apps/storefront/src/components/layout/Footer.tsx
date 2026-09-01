"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  MapPin, Phone, Mail, Send,
  ShieldCheck, Award, Truck, Clock, Check,
} from "lucide-react";

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
    { Icon: ShieldCheck, color: "var(--emerald)", bg: "rgba(16,216,118,0.08)", border: "rgba(16,216,118,0.15)", titleKey: "trust1Title" as const, descKey: "trust1Desc" as const },
    { Icon: Truck,       color: "#FB923C",         bg: "rgba(251,146,60,0.08)", border: "rgba(251,146,60,0.15)", titleKey: "trust2Title" as const, descKey: "trust2Desc" as const },
    { Icon: Award,       color: "var(--emerald)", bg: "rgba(16,216,118,0.08)", border: "rgba(16,216,118,0.15)", titleKey: "trust3Title" as const, descKey: "trust3Desc" as const },
    { Icon: Clock,       color: "var(--sapphire)", bg: "rgba(79,158,255,0.08)", border: "rgba(79,158,255,0.15)", titleKey: "trust4Title" as const, descKey: "trust4Desc" as const },
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
        background: "linear-gradient(180deg, #06080A 0%, #04060A 100%)",
        color: "var(--text-body)",
        paddingTop: "64px",
        paddingBottom: "32px",
        marginTop: "80px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Aurora background */}
      <div
        style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          background: `
            radial-gradient(ellipse 70% 40% at 10% 0%, rgba(16,216,118,0.06) 0%, transparent 60%),
            radial-gradient(ellipse 50% 35% at 90% 100%, rgba(245,200,66,0.04) 0%, transparent 55%)
          `,
        }}
      />

      {/* Top neon accent line */}
      <div
        style={{
          position: "absolute", top: 0, left: 0, right: 0,
          height: "2px",
          background: "linear-gradient(90deg, transparent 0%, rgba(16,216,118,0.7) 30%, rgba(245,200,66,0.5) 55%, rgba(16,216,118,0.5) 80%, transparent 100%)",
        }}
      />

      {/* Grid pattern */}
      <div
        style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          backgroundImage: "linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
          maskImage: "linear-gradient(to bottom, black 0%, transparent 100%)",
        }}
      />

      <div className="container" style={{ position: "relative", zIndex: 1 }}>

        {/* Trust Pillars */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "16px",
            paddingBottom: "48px",
            borderBottom: "1px solid var(--border-subtle)",
            marginBottom: "56px",
          }}
        >
          {trustPillars.map(({ Icon, color, bg, border, titleKey, descKey }, i) => (
            <div
              key={i}
              style={{
                display: "flex", gap: "14px", alignItems: "flex-start",
                padding: "18px",
                background: "var(--bg-glass)",
                borderRadius: "var(--radius-lg)",
                border: "1px solid var(--border-subtle)",
                transition: "all var(--t-smooth)",
                position: "relative",
                overflow: "hidden",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = bg;
                e.currentTarget.style.borderColor = border;
                e.currentTarget.style.transform = "translateY(-4px)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = "var(--bg-glass)";
                e.currentTarget.style.borderColor = "var(--border-subtle)";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "1px", background: `linear-gradient(90deg, transparent, ${color}, transparent)`, opacity: 0.4 }} />
              <div style={{ padding: "10px", borderRadius: "10px", background: bg, border: `1px solid ${border}`, flexShrink: 0 }}>
                <Icon size={20} color={color} />
              </div>
              <div>
                <h4 style={{ color: "var(--text-main)", fontSize: "0.94rem", fontWeight: 700, marginBottom: "5px", fontFamily: "var(--font-heading)" }}>
                  {t[titleKey]}
                </h4>
                <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", lineHeight: 1.55 }}>
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
            gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
            gap: "48px",
            marginBottom: "56px",
          }}
        >
          {/* Column 1: Brand */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "18px" }}>
              <div
                style={{
                  width: "44px", height: "44px",
                  borderRadius: "12px",
                  background: "linear-gradient(135deg, #10D876, #059E57)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "1.3rem",
                  boxShadow: "0 6px 24px rgba(16,216,118,0.35)",
                }}
              >
                🌾
              </div>
              <div>
                <div style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--text-main)", letterSpacing: "-0.04em", fontFamily: "var(--font-heading)" }}>
                  {locale === "bn" ? "তাতকা বাজার" : "Tatka Bazar"}
                </div>
                <div style={{ fontSize: "0.66rem", color: "var(--emerald)", fontWeight: 600, letterSpacing: "0.04em" }}>
                  Bangladesh's Premium Fresh Marketplace
                </div>
              </div>
            </div>
            <p style={{ fontSize: "0.84rem", color: "var(--text-muted)", lineHeight: 1.75, marginBottom: "22px" }}>
              {t.footerAbout}
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "0.84rem", color: "var(--text-body)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ padding: "6px", background: "rgba(16,216,118,0.08)", borderRadius: "8px", border: "1px solid rgba(16,216,118,0.15)" }}>
                  <Phone size={14} color="var(--emerald)" />
                </div>
                <span>{t.hotline}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ padding: "6px", background: "rgba(16,216,118,0.08)", borderRadius: "8px", border: "1px solid rgba(16,216,118,0.15)" }}>
                  <Mail size={14} color="var(--emerald)" />
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
                    background: "var(--bg-glass)",
                    border: "1px solid var(--border-medium)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "var(--text-muted)",
                    transition: "all var(--t-fast)",
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = `${color}18`;
                    e.currentTarget.style.borderColor = `${color}40`;
                    e.currentTarget.style.color = color;
                    e.currentTarget.style.transform = "translateY(-4px) scale(1.1)";
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = "var(--bg-glass)";
                    e.currentTarget.style.borderColor = "var(--border-medium)";
                    e.currentTarget.style.color = "var(--text-muted)";
                    e.currentTarget.style.transform = "translateY(0) scale(1)";
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
                color: "var(--text-main)", fontSize: "0.95rem", fontWeight: 700,
                marginBottom: "20px",
                display: "flex", alignItems: "center", gap: "8px",
                fontFamily: "var(--font-heading)",
              }}
            >
              <MapPin size={16} color="var(--emerald)" />
              {t.hubLocations}
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {BRANCHES.map(b => (
                <div
                  key={b.id}
                  style={{
                    padding: "12px 14px",
                    background: "var(--bg-glass)",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid var(--border-subtle)",
                    fontSize: "0.82rem",
                    transition: "all var(--t-fast)",
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = "rgba(16,216,118,0.05)";
                    e.currentTarget.style.borderColor = "rgba(16,216,118,0.15)";
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = "var(--bg-glass)";
                    e.currentTarget.style.borderColor = "var(--border-subtle)";
                  }}
                >
                  <div style={{ fontWeight: 700, color: "var(--text-main)", marginBottom: "3px" }}>
                    {locale === "bn" ? b.nameBn : b.nameEn}
                  </div>
                  <div style={{ color: "var(--text-muted)" }}>
                    {locale === "bn" ? b.addressBn : b.addressEn}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Column 3: Categories */}
          <div>
            <h3 style={{ color: "var(--text-main)", fontSize: "0.95rem", fontWeight: 700, marginBottom: "20px", fontFamily: "var(--font-heading)" }}>
              {locale === "bn" ? "বাজারের বিভাগ" : "Quick Categories"}
            </h3>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "8px" }}>
              {CATEGORIES.map(c => (
                <li key={c.id}>
                  <Link
                    href={`/category/${c.slug}`}
                    style={{
                      color: "var(--text-muted)", transition: "all var(--t-fast)",
                      display: "flex", alignItems: "center", gap: "8px",
                      fontSize: "0.84rem", fontWeight: 500,
                      padding: "4px 0",
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.color = "var(--emerald)";
                      e.currentTarget.style.paddingLeft = "6px";
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.color = "var(--text-muted)";
                      e.currentTarget.style.paddingLeft = "0";
                    }}
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
                    color: "var(--gold)", fontWeight: 700, fontSize: "0.84rem",
                    display: "flex", alignItems: "center", gap: "6px",
                    transition: "all var(--t-fast)",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.opacity = "0.8"; e.currentTarget.style.paddingLeft = "4px"; }}
                  onMouseLeave={e => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.paddingLeft = "0"; }}
                >
                  🏢 {locale === "bn" ? "পাইকারি / B2B অ্যাকাউন্ট →" : "Wholesale / B2B Account →"}
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Newsletter */}
          <div>
            <h3 style={{ color: "var(--text-main)", fontSize: "0.95rem", fontWeight: 700, marginBottom: "8px", fontFamily: "var(--font-heading)" }}>
              {locale === "bn" ? "বিশেষ অফার ও আপডেট" : "Newsletter & Deals"}
            </h3>
            <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginBottom: "16px", lineHeight: 1.65 }}>
              {locale === "bn"
                ? "প্রতিদিনের তাজা বাজার ও বিশেষ ছাড়ের আপডেট পেতে সাবস্ক্রাইব করুন।"
                : "Subscribe to get daily fresh deals and special discount notifications."}
            </p>

            <form onSubmit={handleSubscribe} style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
              <input
                type="email" required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder={locale === "bn" ? "আপনার ইমেইল..." : "Enter your email..."}
                style={{
                  flex: 1, padding: "10px 14px",
                  borderRadius: "var(--radius-md)",
                  background: "var(--bg-glass)",
                  border: "1px solid var(--border-medium)",
                  color: "var(--text-main)", fontSize: "0.84rem", outline: "none",
                  transition: "all var(--t-fast)",
                }}
                onFocus={e => {
                  e.currentTarget.style.borderColor = "rgba(16,216,118,0.4)";
                  e.currentTarget.style.boxShadow = "0 0 0 3px rgba(16,216,118,0.08)";
                }}
                onBlur={e => {
                  e.currentTarget.style.borderColor = "var(--border-medium)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              />
              <button
                type="submit"
                style={{
                  background: "linear-gradient(135deg, #10D876, #059E57)",
                  color: "var(--bg-page)", padding: "10px 16px",
                  borderRadius: "var(--radius-md)",
                  fontWeight: 700, border: "none", cursor: "pointer",
                  display: "flex", alignItems: "center",
                  boxShadow: "0 4px 16px rgba(16,216,118,0.35)",
                  transition: "all var(--t-fast)",
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.08)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; }}
              >
                <Send size={16} />
              </button>
            </form>

            {subscribed && (
              <div
                style={{
                  display: "flex", alignItems: "center", gap: "7px",
                  color: "var(--emerald)", fontSize: "0.82rem", fontWeight: 700,
                  padding: "8px 14px",
                  background: "rgba(16,216,118,0.08)",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid rgba(16,216,118,0.2)",
                  animation: "scaleIn 0.3s var(--ease-bounce)",
                }}
              >
                <Check size={15} />
                <span>{locale === "bn" ? "ধন্যবাদ! সাবস্ক্রিপশন সফল হয়েছে।" : "Subscribed successfully!"}</span>
              </div>
            )}

            {/* Payment badges */}
            <div style={{ marginTop: "24px" }}>
              <div style={{ fontSize: "0.68rem", color: "var(--text-subtle)", marginBottom: "12px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                {locale === "bn" ? "পেমেন্ট পার্টনার" : "Accepted Payments"}
              </div>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
                {[
                  { label: "bKash",      bg: "#E2136E" },
                  { label: "Nagad",      bg: "#F7941D" },
                  { label: "VISA",       bg: "#1A1F71" },
                  { label: "Mastercard", bg: "#EB001B" },
                  { label: "💵 COD",    bg: "rgba(255,255,255,0.06)" },
                ].map(p => (
                  <span
                    key={p.label}
                    style={{
                      background: p.bg,
                      border: "1px solid rgba(255,255,255,0.1)",
                      color: "#FFF",
                      padding: "5px 11px",
                      borderRadius: "6px",
                      fontSize: "0.68rem", fontWeight: 800,
                      boxShadow: "0 2px 8px rgba(0,0,0,0.35)",
                      fontFamily: "var(--font-heading)",
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
            borderTop: "1px solid var(--border-subtle)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "16px",
            fontSize: "0.78rem", color: "var(--text-subtle)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span>{t.allRightsReserved}</span>
            <span style={{ color: "var(--border-medium)" }}>•</span>
            <span style={{ color: "var(--emerald)", fontSize: "0.72rem" }}>Made with 💚 in Bangladesh</span>
          </div>
          <div style={{ display: "flex", gap: "24px" }}>
            {[
              { label: t.terms,     href: "/terms"   },
              { label: t.privacy,   href: "/privacy"  },
              { label: t.contactUs, href: "/contact"  },
            ].map(link => (
              <Link
                key={link.href}
                href={link.href}
                style={{ color: "var(--text-subtle)", transition: "color var(--t-fast)", fontSize: "0.78rem" }}
                onMouseEnter={e => (e.currentTarget.style.color = "var(--emerald)")}
                onMouseLeave={e => (e.currentTarget.style.color = "var(--text-subtle)")}
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
