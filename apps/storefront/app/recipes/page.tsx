"use client";

import React, { useState } from "react";
import { Clock, Users, ChefHat, ShoppingBag, Check, ArrowRight, Sparkles } from "lucide-react";
import { POPULAR_RECIPES, Recipe } from "@/data/recipes";
import { useCartStore } from "@/lib/cart-store";
import { useLanguage } from "@/context/LanguageContext";
import { PRODUCTS } from "@/lib/catalog";

export default function RecipesPage() {
  const { addItem, openCart } = useCartStore();
  const { formatPrice } = useLanguage();
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe>(POPULAR_RECIPES[0]!);
  const [addedSuccess, setAddedSuccess] = useState(false);

  const handleAddAllIngredients = (recipe: Recipe) => {
    recipe.ingredients.forEach((ing) => {
      const matchingProduct = PRODUCTS.find((p) => p.id === ing.productId) || PRODUCTS[0]!;
      addItem(
        {
          ...matchingProduct,
          nameBn: ing.nameBn,
          nameEn: ing.nameEn,
          images: [ing.image],
        },
        ing.weight,
        ing.unit,
        ing.price,
        1
      );
    });

    setAddedSuccess(true);
    setTimeout(() => {
      setAddedSuccess(false);
      openCart();
    }, 600);
  };

  return (
    <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "30px 16px" }}>
      
      {/* Header Banner */}
      <div
        style={{
          background: "linear-gradient(135deg, #15803D 0%, #064E3B 100%)",
          borderRadius: "var(--radius-xl)",
          color: "#FFFFFF",
          padding: "36px 30px",
          marginBottom: "36px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "20px",
        }}
      >
        <div style={{ maxWidth: "620px" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "var(--accent)", color: "#FFF", padding: "4px 12px", borderRadius: "999px", fontSize: "0.75rem", fontWeight: 800, marginBottom: "10px" }}>
            <Sparkles size={14} />
            <span>RECIPE-TO-CART INNOVATION</span>
          </div>
          <h1 style={{ fontSize: "2rem", fontWeight: 800, lineHeight: 1.2, marginBottom: "10px" }}>
            Traditional Recipes & Fresh Ingredient Bundles
          </h1>
          <p style={{ color: "rgba(255,255,255,0.9)", fontSize: "0.95rem" }}>
            Select your favorite authentic dish and add all precisely weighed fresh ingredients into your cart with 1 click.
          </p>
        </div>

        <div style={{ textAlign: "right", background: "rgba(255,255,255,0.1)", padding: "16px 24px", borderRadius: "var(--radius-lg)", backdropFilter: "blur(4px)" }}>
          <div style={{ fontSize: "0.8rem", color: "#A7F3D0", fontWeight: 700 }}>100% Freshness Guarantee</div>
          <div style={{ fontSize: "1.4rem", fontWeight: 800 }}>Ready to Cook</div>
        </div>
      </div>

      {/* Main Grid: Recipe List (Left) + Detail View (Right) */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.6fr", gap: "28px", alignItems: "flex-start" }}>
        
        {/* Left: Recipe Selector Cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <h2 style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--text-main)" }}>
            Popular Recipes
          </h2>

          {POPULAR_RECIPES.map((recipe) => {
            const isSelected = selectedRecipe.id === recipe.id;
            return (
              <div
                key={recipe.id}
                onClick={() => setSelectedRecipe(recipe)}
                style={{
                  background: isSelected ? "var(--primary-light)" : "var(--surface)",
                  border: `2px solid ${isSelected ? "var(--primary)" : "var(--border-subtle)"}`,
                  borderRadius: "var(--radius-lg)",
                  padding: "16px",
                  cursor: "pointer",
                  display: "flex",
                  gap: "14px",
                  transition: "all 0.2s ease",
                  boxShadow: isSelected ? "var(--shadow-md)" : "none",
                }}
              >
                <img
                  src={recipe.coverImage}
                  alt={recipe.titleEn}
                  style={{ width: "80px", height: "80px", borderRadius: "var(--radius-md)", objectFit: "cover" }}
                />
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: "1rem", fontWeight: 800, color: isSelected ? "var(--primary-dark)" : "var(--text-main)" }}>
                    {recipe.titleEn || recipe.titleBn}
                  </h3>
                  <div style={{ display: "flex", gap: "12px", fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "6px" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                      <Clock size={13} />
                      {recipe.cookingTime}
                    </span>
                    <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                      <Users size={13} />
                      {recipe.servings} serves
                    </span>
                  </div>
                  <div style={{ fontWeight: 800, color: "var(--primary-dark)", fontSize: "0.95rem", marginTop: "6px" }}>
                    ৳{recipe.totalCost} (All Ingredients)
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right: Selected Recipe Details & 1-Click Buy */}
        <div style={{ background: "var(--surface)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-xl)", padding: "24px", boxShadow: "var(--shadow-sm)" }}>
          <div style={{ position: "relative", height: "240px", borderRadius: "var(--radius-lg)", overflow: "hidden", marginBottom: "20px" }}>
            <img
              src={selectedRecipe.coverImage}
              alt={selectedRecipe.titleEn}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 60%)" }} />
            <div style={{ position: "absolute", bottom: "16px", left: "16px", color: "#FFF" }}>
              <span style={{ background: "var(--primary)", padding: "3px 10px", borderRadius: "999px", fontSize: "0.72rem", fontWeight: 800 }}>
                {selectedRecipe.difficulty}
              </span>
              <h2 style={{ fontSize: "1.4rem", fontWeight: 800, marginTop: "4px" }}>
                {selectedRecipe.titleEn || selectedRecipe.titleBn}
              </h2>
            </div>
          </div>

          <p style={{ fontSize: "0.92rem", color: "var(--text-muted)", lineHeight: 1.5, marginBottom: "20px" }}>
            {selectedRecipe.descriptionEn || selectedRecipe.descriptionBn}
          </p>

          {/* Ingredients List */}
          <div style={{ marginBottom: "24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "8px" }}>
              <h3 style={{ fontSize: "1.05rem", fontWeight: 800 }}>
                Required Fresh Ingredients ({selectedRecipe.ingredients.length})
              </h3>
              <span style={{ fontSize: "0.85rem", fontWeight: 800, color: "var(--primary-dark)" }}>
                Total: ৳{selectedRecipe.totalCost}
              </span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {selectedRecipe.ingredients.map((ing) => (
                <div key={ing.productId} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#F8FAFC", padding: "10px 14px", borderRadius: "var(--radius-md)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <img src={ing.image} alt={ing.nameEn} style={{ width: "38px", height: "38px", borderRadius: "6px", objectFit: "cover" }} />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: "0.88rem" }}>{ing.nameEn || ing.nameBn}</div>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Quantity: {ing.weight} {ing.unit}</div>
                    </div>
                  </div>
                  <div style={{ fontWeight: 800, color: "var(--primary-dark)" }}>
                    ৳{ing.price}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 1-Click Recipe-To-Cart Action */}
          <button
            onClick={() => handleAddAllIngredients(selectedRecipe)}
            style={{
              width: "100%",
              padding: "16px",
              borderRadius: "var(--radius-lg)",
              background: addedSuccess ? "var(--primary-dark)" : "var(--primary)",
              color: "#FFFFFF",
              fontWeight: 800,
              fontSize: "1.05rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
              boxShadow: "0 4px 14px var(--primary-glow)",
              transition: "all 0.2s ease",
            }}
          >
            {addedSuccess ? (
              <>
                <Check size={20} />
                <span>All ingredients added to cart!</span>
              </>
            ) : (
              <>
                <ShoppingBag size={20} />
                <span>Add all ingredients to cart (৳{selectedRecipe.totalCost})</span>
              </>
            )}
          </button>

          {/* Cooking Method Stepper */}
          <div style={{ marginTop: "24px", paddingTop: "20px", borderTop: "1px solid var(--border-subtle)" }}>
            <h3 style={{ fontSize: "1rem", fontWeight: 800, marginBottom: "12px", display: "flex", alignItems: "center", gap: "6px" }}>
              <ChefHat size={18} color="var(--primary)" />
              <span>Cooking Instructions:</span>
            </h3>
            <ol style={{ paddingLeft: "20px", display: "flex", flexDirection: "column", gap: "8px", fontSize: "0.88rem", color: "var(--text-muted)", lineHeight: 1.5 }}>
              {(selectedRecipe.instructionsEn || selectedRecipe.instructionsBn || []).map((step: string, idx: number) => (
                <li key={idx}>{step}</li>
              ))}
            </ol>
          </div>

        </div>

      </div>

    </div>
  );
}
