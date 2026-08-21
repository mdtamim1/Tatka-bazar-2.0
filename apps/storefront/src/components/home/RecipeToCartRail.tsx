"use client";

import React from "react";
import Link from "next/link";
import { ChefHat, ArrowRight, Clock, Users, Zap } from "lucide-react";
import { POPULAR_RECIPES } from "@/data/recipes";
import { useLanguage } from "@/context/LanguageContext";

export function RecipeToCartRail() {
  const { locale } = useLanguage();

  return (
    <section style={{ margin: "40px 0" }}>

      {/* Section header */}
      <div
        style={{
          display: "flex", justifyContent: "space-between",
          alignItems: "flex-end", marginBottom: "24px",
        }}
      >
        <div>
          <div
            style={{
              display: "inline-flex", alignItems: "center", gap: "7px",
              background: "rgba(34, 197, 94, 0.1)",
              color: "var(--primary-dark)",
              padding: "5px 13px",
              borderRadius: "var(--radius-full)",
              fontSize: "0.72rem", fontWeight: 800,
              marginBottom: "10px",
              border: "1px solid rgba(34,197,94,0.22)",
              textTransform: "uppercase", letterSpacing: "0.06em",
            }}
          >
            <ChefHat size={13} />
            <span>Recipe-to-Cart</span>
          </div>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "var(--text-2xl)", fontWeight: 700,
              color: "var(--text-main)", lineHeight: 1.2, letterSpacing: "-0.025em",
            }}
          >
            {locale === "bn" ? "ঐতিহ্যবাহী রেসিপি ও তাজা উপাদান" : "Traditional Recipes & Fresh Ingredients"}
          </h2>
        </div>

        <Link
          href="/recipes"
          className="view-all-link"
        >
          <span>{locale === "bn" ? "সব রেসিপি" : "All Recipes"}</span>
          <ArrowRight size={15} />
        </Link>
      </div>

      {/* Recipe cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "22px",
        }}
      >
        {POPULAR_RECIPES.map((recipe, idx) => (
          <Link
            key={recipe.id}
            href="/recipes"
            style={{
              background: "var(--bg-surface)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "var(--radius-xl)",
              overflow: "hidden",
              boxShadow: "var(--shadow-card)",
              transition: "all var(--t-smooth)",
              display: "flex",
              flexDirection: "column",
              textDecoration: "none",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = "translateY(-6px)";
              e.currentTarget.style.boxShadow = "var(--shadow-lg), 0 0 0 1px rgba(34,197,94,0.12)";
              e.currentTarget.style.borderColor = "rgba(34,197,94,0.25)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "var(--shadow-card)";
              e.currentTarget.style.borderColor = "var(--border-subtle)";
            }}
          >
            {/* Image */}
            <div style={{ position: "relative", height: "190px", overflow: "hidden" }}>
              <img
                src={recipe.coverImage}
                alt={locale === "bn" ? recipe.titleBn : recipe.titleEn}
                style={{
                  width: "100%", height: "100%", objectFit: "cover",
                  transition: "transform 0.55s var(--ease-out)",
                }}
                onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.08)")}
                onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
              />
              {/* Gradient overlay */}
              <div
                style={{
                  position: "absolute", inset: 0,
                  background: "linear-gradient(180deg, transparent 40%, rgba(0,0,0,0.52) 100%)",
                }}
              />

              {/* Difficulty badge */}
              <div style={{ position: "absolute", top: "12px", right: "12px" }}>
                <span
                  style={{
                    background: "rgba(0,0,0,0.7)",
                    backdropFilter: "blur(8px)",
                    color: "#fff",
                    padding: "5px 11px",
                    borderRadius: "var(--radius-full)",
                    fontSize: "0.68rem", fontWeight: 800,
                    border: "1px solid rgba(255,255,255,0.15)",
                  }}
                >
                  {recipe.difficulty}
                </span>
              </div>

              {/* Bottom overlay info */}
              <div
                style={{
                  position: "absolute", bottom: "10px", left: "12px",
                  display: "flex", gap: "8px", alignItems: "center",
                }}
              >
                <span
                  style={{
                    display: "flex", alignItems: "center", gap: "4px",
                    fontSize: "0.68rem", color: "rgba(255,255,255,0.88)", fontWeight: 600,
                    background: "rgba(0,0,0,0.35)", backdropFilter: "blur(6px)",
                    padding: "3px 9px", borderRadius: "var(--radius-full)",
                  }}
                >
                  <Clock size={10} />
                  {recipe.cookTime || "30 min"}
                </span>
                <span
                  style={{
                    display: "flex", alignItems: "center", gap: "4px",
                    fontSize: "0.68rem", color: "rgba(255,255,255,0.88)", fontWeight: 600,
                    background: "rgba(0,0,0,0.35)", backdropFilter: "blur(6px)",
                    padding: "3px 9px", borderRadius: "var(--radius-full)",
                  }}
                >
                  <Users size={10} />
                  {recipe.serves || "4"} {locale === "bn" ? "জন" : "serves"}
                </span>
              </div>
            </div>

            {/* Body */}
            <div style={{ padding: "18px", display: "flex", flexDirection: "column", flex: 1 }}>
              <h3
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "1.05rem", fontWeight: 700,
                  color: "var(--text-main)", marginBottom: "6px",
                  lineHeight: 1.3,
                }}
              >
                {locale === "bn" ? recipe.titleBn : recipe.titleEn}
              </h3>
              <p
                style={{
                  fontSize: "0.82rem", color: "var(--text-muted)",
                  marginBottom: "16px", lineHeight: 1.5,
                  display: "-webkit-box", WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical", overflow: "hidden",
                }}
              >
                {locale === "bn" ? recipe.descriptionBn : recipe.descriptionEn}
              </p>

              {/* Footer */}
              <div
                style={{
                  marginTop: "auto",
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  paddingTop: "12px", borderTop: "1px solid var(--border-subtle)",
                }}
              >
                <div>
                  <div
                    style={{
                      fontFamily: "var(--font-en)",
                      fontWeight: 900, fontSize: "1rem",
                      background: "linear-gradient(135deg, #15803D, #22C55E)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    }}
                  >
                    ৳{recipe.totalCost}
                  </div>
                  <div style={{ fontSize: "0.65rem", color: "var(--text-muted)", marginTop: "1px" }}>
                    {locale === "bn" ? "সকল উপাদান" : "All ingredients"}
                  </div>
                </div>

                <div
                  style={{
                    display: "flex", alignItems: "center", gap: "5px",
                    padding: "8px 16px",
                    borderRadius: "var(--radius-full)",
                    background: "linear-gradient(135deg, #22C55E, #15803D)",
                    color: "#fff", fontWeight: 800, fontSize: "0.78rem",
                    boxShadow: "0 4px 14px rgba(34,197,94,0.35)",
                  }}
                >
                  <Zap size={12} fill="#fff" />
                  <span>{locale === "bn" ? "১-ক্লিকে কিনুন" : "1-Click Cart"}</span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
