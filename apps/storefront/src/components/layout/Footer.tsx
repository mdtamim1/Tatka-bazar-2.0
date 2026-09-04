"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  MessageSquare, Phone, Mail, MapPin, ChevronDown
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import styles from "./Footer.module.css";

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

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (emailInput.trim()) {
      setIsSubscribed(true);
      setEmailInput("");
      setTimeout(() => setIsSubscribed(false), 4000);
    }
  };

  return (
    <footer className={styles.footerWrapper}>
      <div className={styles.container}>
        
        {/* ── 1. Top Newsletter Card (2-Column Banner) ── */}
        <div className={styles.newsletterCard}>
          
          {/* Left: Product Showcase Photo with Exact Rounded Frame */}
          <div className={styles.newsletterImageWrapper}>
            <img
              src="https://images.unsplash.com/photo-1540420773420-3366772f4999?w=900&auto=format&fit=crop&q=85"
              alt="Fresh Organic Produce"
              className={styles.newsletterImage}
            />
          </div>

          {/* Right: Newsletter Form Content */}
          <div className={styles.newsletterContent}>
            <h2 className={styles.newsletterTitle}>
              Newsletter
            </h2>

            <p className={styles.newsletterDesc}>
              Join our newsletter for fresh harvest updates, seasonal organic recipes, exclusive offers, and early access to our latest fresh arrivals.
            </p>

            <form onSubmit={handleSubscribe} className={styles.newsletterForm}>
              <input
                type="email"
                required
                placeholder="Email Address"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                className={styles.newsletterInput}
              />
              <button
                type="submit"
                className={styles.subscribeBtn}
              >
                {isSubscribed ? "Subscribed ✓" : "Subscribe"}
              </button>
            </form>

            <p className={styles.newsletterLegal}>
              By subscribing you agree to the <Link href="/">Terms of Use</Link> & <Link href="/">Privacy Policy</Link>.
            </p>
          </div>
        </div>

        {/* ── 2. Support Info Row (4 Columns / Cards) ── */}
        <div className={styles.supportRow}>
          
          {/* Customer Support */}
          <div className={styles.supportItem}>
            <MessageSquare size={20} className={styles.supportIcon} />
            <div>
              <div className={styles.supportHeading}>
                Customer Support
              </div>
              <div className={styles.supportSubtext}>
                Mon-Sun, 6am - 10pm BST
              </div>
            </div>
          </div>

          {/* Call Us */}
          <div className={styles.supportItem}>
            <Phone size={20} className={styles.supportIcon} />
            <div>
              <div className={styles.supportHeading}>
                Call Us
              </div>
              <div className={styles.supportSubtext}>
                +880 9612-828520 (toll-free)
              </div>
            </div>
          </div>

          {/* Email Us */}
          <div className={styles.supportItem}>
            <Mail size={20} className={styles.supportIcon} />
            <div>
              <div className={styles.supportHeading}>
                Email Us
              </div>
              <div className={styles.supportSubtext}>
                support@tatkabazar.com
              </div>
            </div>
          </div>

          {/* Address */}
          <div className={styles.supportItem}>
            <MapPin size={20} className={styles.supportIcon} />
            <div>
              <div className={styles.supportHeading}>
                Address
              </div>
              <div className={styles.supportSubtext}>
                House 42, Road 7/A, Dhanmondi, Dhaka 1209
              </div>
            </div>
          </div>
        </div>

        {/* ── 3. Main Footer Links & Brand Section ── */}
        <div className={styles.mainLinksGrid}>
          
          {/* Brand Panel (Left) */}
          <div className={styles.brandPanel}>
            {/* Logo */}
            <Link href="/" className={styles.brandLogo}>
              <div style={{ width: "26px", height: "26px", color: "#0f172a", display: "flex", alignItems: "center" }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                  <polygon points="12 2 2 7 12 12 22 7 12 2" />
                  <polyline points="2 17 12 22 22 17" />
                  <polyline points="2 12 12 17 22 12" />
                </svg>
              </div>
              <span className={styles.brandLogoText}>
                TatkaBazar<span style={{ color: "#10D876" }}>.com</span>
              </span>
            </Link>

            <p className={styles.brandDesc}>
              Direct-from-source organic marketplace empowering Bangladeshi farmers and fishermen with fair prices and express chemical-free home delivery.
            </p>

            {/* Payment Badges Row */}
            <div className={styles.paymentBadgesRow}>
              <span className={styles.paymentBadge}>amazon pay</span>
              <span className={styles.paymentBadge}>apple pay</span>
              <span className={styles.paymentBadge}>mastercard</span>
              <span className={styles.paymentBadge}>visa</span>
              <span className={styles.paymentBadge}>bKash</span>
              <span className={styles.paymentBadge}>nagad</span>
            </div>
          </div>

          {/* Column 1: Shop */}
          <div>
            <div className={styles.columnTitle}>
              <span>Shop</span>
              <ChevronDown size={14} color="#64748b" />
            </div>

            <div className={styles.columnLinks}>
              <Link href="/category/vegetables" className={styles.footerLink}>New Harvests</Link>
              <Link href="/category/fish-and-meat" className={styles.footerLink}>Best Sellers</Link>
              <Link href="/category/rice-and-staples" className={styles.footerLink}>Farm Produce</Link>
              <Link href="/bundles" className={styles.footerLink}>Gifts & Sets</Link>
            </div>
          </div>

          {/* Column 2: Support */}
          <div>
            <div className={styles.columnTitle}>
              <span>Support</span>
              <ChevronDown size={14} color="#64748b" />
            </div>

            <div className={styles.columnLinks}>
              <Link href="/account" className={styles.footerLink}>Contact Us</Link>
              <Link href="/account" className={styles.footerLink}>FAQs</Link>
              <Link href="/track" className={styles.footerLink}>Order Tracking</Link>
              <Link href="/account" className={styles.footerLink}>Returns & Exchanges</Link>
            </div>
          </div>

          {/* Column 3: About & Socials */}
          <div>
            <div className={styles.columnTitle}>
              <span>About</span>
              <ChevronDown size={14} color="#64748b" />
            </div>

            <div className={styles.columnLinks}>
              <Link href="/recipes" className={styles.footerLink}>Our Story</Link>
              <Link href="/recipes" className={styles.footerLink}>Ingredients</Link>
              <Link href="/b2b" className={styles.footerLink}>Sustainability</Link>
              <Link href="/b2b" className={styles.footerLink}>Press</Link>
            </div>

            {/* Social Icons (Black circular buttons with white icons) */}
            <div className={styles.socialRow}>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook"
                className={styles.socialCircleBtn}
              >
                <FacebookIcon />
              </a>

              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                aria-label="X Twitter"
                className={styles.socialCircleBtn}
              >
                <XTwitterIcon />
              </a>

              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className={styles.socialCircleBtn}
              >
                <InstagramIcon />
              </a>
            </div>
          </div>
        </div>

        {/* ── 4. Bottom Copyright & Policy Bar ── */}
        <div className={styles.bottomLegalBar}>
          <div>
            © 2026 Made with <span style={{ color: "#ef4444" }}>❤️</span> by <strong style={{ color: "#0f172a" }}>TatkaBazar.com</strong>
          </div>

          <div className={styles.policyLinksRow}>
            <Link href="/" className={styles.policyLink}>Shipping Policy</Link>
            <Link href="/" className={styles.policyLink}>Returns Policy</Link>
            <Link href="/" className={styles.policyLink}>Terms Of Service</Link>
            <Link href="/" className={styles.policyLink}>Privacy Policy</Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
