"use client";

import React, { useState, useEffect, useRef } from "react";
import { Star, CheckCircle, Heart, Quote } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { REVIEWS } from "@/lib/catalog";

export function Testimonials() {
  const { locale } = useLanguage();
  const [activeIdx, setActiveIdx] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startAutoplay = () => {
    intervalRef.current = setInterval(() => {
      setActiveIdx(i => (i + 1) % REVIEWS.length);
    }, 4500);
  };

  useEffect(() => {
    startAutoplay();
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  const handleDotClick = (idx: number) => {
    setActiveIdx(idx);
    if (intervalRef.current) clearInterval(intervalRef.current);
    startAutoplay();
  };

  // Avatar initials for fallback
  const getInitials = (name: string) => name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

  const avatarColors = [
    "linear-gradient(135deg, #22C55E, #15803D)",
    "linear-gradient(135deg, #F59E0B, #D97706)",
    "linear-gradient(135deg, #6366F1, #4F46E5)",
    "linear-gradient(135deg, #EF4444, #DC2626)",
    "linear-gradient(135deg, #06B6D4, #0891B2)",
  ];

  return (
    <section style={{ padding: "48px 0 56px", position: "relative", overflow: "hidden" }}>
      {/* Subtle background */}
      <div
        style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(180deg, var(--bg-page) 0%, rgba(34,197,94,0.03) 50%, var(--bg-page) 100%)",
          pointerEvents: "none",
        }}
      />

      <div className="container" style={{ position: "relative", zIndex: 1 }}>

        {/* Section Header */}
        <div style={{ textAlign: "center", maxWidth: "600px", margin: "0 auto 40px" }}>
          <div
            className="badge-fresh"
            style={{ marginBottom: "12px", display: "inline-flex" }}
          >
            <Heart size={13} color="var(--crimson)" fill="var(--crimson)" />
            <span>{locale === "bn" ? "হাজারো পরিবারের প্রতিদিনের আস্থা" : "Trusted by 10,000+ Happy Households"}</span>
          </div>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(1.5rem, 3vw, 2rem)",
              fontWeight: 700, color: "var(--text-main)",
              lineHeight: 1.2, letterSpacing: "-0.025em",
            }}
          >
            {locale === "bn" ? "আমাদের সম্মানিত গ্রাহকদের অভিজ্ঞতা" : "What Our Customers Say"}
          </h2>
          <p style={{ color: "var(--text-muted)", fontSize: "var(--text-sm)", marginTop: "8px", lineHeight: 1.6 }}>
            {locale === "bn"
              ? "বাংলাদেশ জুড়ে হাজারো পরিবার প্রতিদিন তাতকা বাজার থেকে কেনাকাটা করে সন্তুষ্ট।"
              : "Thousands of families across Bangladesh shop daily with complete satisfaction."}
          </p>
        </div>

        {/* Review Cards Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "18px",
            width: "100%",
            boxSizing: "border-box",
            marginBottom: "32px",
          }}
        >
          {REVIEWS.map((rev, idx) => (
            <div
              key={rev.id}
              style={{
                background: "var(--bg-surface)",
                borderRadius: "var(--radius-xl)",
                border: idx === activeIdx
                  ? "1.5px solid rgba(34,197,94,0.35)"
                  : "1px solid var(--border-subtle)",
                padding: "24px",
                boxShadow: idx === activeIdx
                  ? "var(--shadow-lg), 0 0 0 3px rgba(34,197,94,0.08)"
                  : "var(--shadow-sm)",
                display: "flex", flexDirection: "column",
                position: "relative", overflow: "hidden",
                transition: "all 0.4s var(--ease-out)",
                transform: idx === activeIdx ? "translateY(-4px)" : "translateY(0)",
                cursor: "pointer",
              }}
              onClick={() => handleDotClick(idx)}
            >
              {/* Decorative quote mark */}
              <div
                style={{
                  position: "absolute", top: "14px", right: "18px",
                  opacity: idx === activeIdx ? 0.12 : 0.06,
                  transition: "opacity var(--t-smooth)",
                }}
              >
                <Quote size={52} color="var(--primary)" fill="var(--primary)" />
              </div>

              {/* Active indicator */}
              {idx === activeIdx && (
                <div
                  style={{
                    position: "absolute", top: 0, left: 0, right: 0,
                    height: "3px",
                    background: "linear-gradient(90deg, #22C55E, #86EFAC)",
                    borderRadius: "var(--radius-xl) var(--radius-xl) 0 0",
                  }}
                />
              )}

              {/* Stars */}
              <div style={{ display: "flex", gap: "3px", marginBottom: "14px" }}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={15}
                    fill={i < rev.rating ? "#F59E0B" : "none"}
                    color={i < rev.rating ? "#F59E0B" : "var(--border-medium)"}
                    style={{ transition: "transform 0.2s ease", transitionDelay: `${i * 30}ms` }}
                  />
                ))}
                <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginLeft: "4px", alignSelf: "center" }}>
                  {rev.date}
                </span>
              </div>

              {/* Comment */}
              <p
                style={{
                  fontSize: "0.9rem", color: "var(--text-main)",
                  lineHeight: 1.65, marginBottom: "20px",
                  fontStyle: "italic", flex: 1,
                  position: "relative", zIndex: 1,
                }}
              >
                &ldquo;{locale === "bn" ? rev.commentBn : rev.commentEn}&rdquo;
              </p>

              {/* Author */}
              <div
                style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  paddingTop: "14px", borderTop: "1px solid var(--border-subtle)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  {/* Avatar */}
                  <div
                    style={{
                      width: "38px", height: "38px",
                      borderRadius: "50%",
                      background: avatarColors[idx % avatarColors.length],
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: "#fff", fontSize: "0.8rem", fontWeight: 800,
                      boxShadow: "0 2px 10px rgba(0,0,0,0.15)",
                      flexShrink: 0,
                      border: "2px solid var(--bg-surface)",
                    }}
                  >
                    {getInitials(rev.userName)}
                  </div>
                  <div>
                    <div style={{ fontSize: "0.88rem", fontWeight: 700, color: "var(--text-main)" }}>
                      {rev.userName}
                    </div>
                    <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                      {rev.userLocation}
                    </div>
                  </div>
                </div>
                {rev.verifiedPurchase && (
                  <span
                    style={{
                      display: "flex", alignItems: "center", gap: "4px",
                      fontSize: "0.68rem", fontWeight: 800,
                      color: "var(--primary-dark)",
                      background: "rgba(34,197,94,0.1)",
                      padding: "3px 9px", borderRadius: "var(--radius-full)",
                      border: "1px solid rgba(34,197,94,0.2)",
                    }}
                  >
                    <CheckCircle size={11} />
                    <span>{locale === "bn" ? "ভেরিফাইড" : "Verified"}</span>
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Dot navigation */}
        <div style={{ display: "flex", justifyContent: "center", gap: "8px" }}>
          {REVIEWS.map((_, idx) => (
            <button
              key={idx}
              onClick={() => handleDotClick(idx)}
              style={{
                width: activeIdx === idx ? "28px" : "8px",
                height: "8px",
                borderRadius: "999px",
                background: activeIdx === idx
                  ? "linear-gradient(90deg, #22C55E, #86EFAC)"
                  : "var(--border-medium)",
                border: "none", cursor: "pointer",
                transition: "all 0.4s var(--ease-bounce)",
                padding: 0,
                boxShadow: activeIdx === idx ? "0 0 8px rgba(34,197,94,0.5)" : "none",
              }}
            />
          ))}
        </div>

        {/* Stats row */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "20px",
            maxWidth: "520px",
            margin: "32px auto 0",
            padding: "24px",
            background: "var(--bg-surface)",
            borderRadius: "var(--radius-xl)",
            border: "1px solid var(--border-subtle)",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          {[
            { num: "10,000+", label: locale === "bn" ? "সন্তুষ্ট পরিবার" : "Happy Families" },
            { num: "4.9/5",  label: locale === "bn" ? "গড় রেটিং" : "Avg. Rating" },
            { num: "98%",    label: locale === "bn" ? "পুনরায় অর্ডার" : "Reorder Rate" },
          ].map((s, i) => (
            <div key={i} style={{ textAlign: "center" }}>
              <div
                style={{
                  fontFamily: "var(--font-en)",
                  fontSize: "1.5rem", fontWeight: 900,
                  letterSpacing: "-0.04em",
                  background: "linear-gradient(135deg, #15803D, #22C55E)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                {s.num}
              </div>
              <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontWeight: 600, marginTop: "3px" }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
