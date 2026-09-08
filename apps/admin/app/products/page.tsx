"use client";

import React, { useState, useMemo } from "react";
import {
  Package, Plus, Search, X, Eye, Edit, Trash2, ToggleLeft, ToggleRight,
  Upload, Star, Tag, Scale, ChevronDown, ChevronUp, Image as ImageIcon,
  Check, AlertTriangle, Layers, DollarSign, Globe,
} from "lucide-react";
import { useAdmin } from "@/context/AdminContext";
import { AdminProduct } from "@/types";

// ── Helpers ──────────────────────────────────────────────────────────────────

function ProductImage({ src, alt }: { src: string; alt: string }) {
  const [err, setErr] = useState(false);
  if (err || !src) {
    return (
      <div style={{
        width: "100%", aspectRatio: "4/3",
        background: "var(--bg-elevated)", display: "flex",
        alignItems: "center", justifyContent: "center",
      }}>
        <ImageIcon size={22} color="var(--text-4)" />
      </div>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src} alt={alt}
      className="product-admin-card-img"
      onError={() => setErr(true)}
    />
  );
}

// ── Product Form (Add/Edit) ─────────────────────────────────────────────────

const CATEGORIES = [
  { slug: "fish-and-meat", name: "Fish & Meat" },
  { slug: "vegetables", name: "Fresh Vegetables" },
  { slug: "fruits", name: "Fresh Fruits" },
  { slug: "rice-and-staples", name: "Rice, Lentils & Staples" },
  { slug: "oil-and-ghee", name: "Oil, Ghee & Spices" },
  { slug: "dairy-and-eggs", name: "Dairy, Curd & Eggs" },
];

const UNITS = ["kg", "g", "piece", "packet", "liter", "dozen"];
const PRICING_TYPES = [
  { value: "variableWeight", label: "Variable Weight (e.g., per kg with options)" },
  { value: "fixed", label: "Fixed Price (one price)" },
  { value: "pack", label: "Pack / Bundle" },
];

type WeightOpt = { value: number; unit: string; labelEn: string; multiplier: number; popular?: boolean };
type TieredPrice = { minQty: number; pricePerUnit: number; discountPercent?: number; labelEn: string };

interface ProductFormData {
  nameEn: string; nameBn: string;
  descriptionEn: string;
  sku: string;
  categorySlug: string; categoryName: string;
  vendorId: string; vendorName: string;
  basePrice: number; comparePrice: number;
  baseUnit: string;
  pricingType: "variableWeight" | "fixed" | "pack";
  weightOptions: WeightOpt[];
  tieredPricing: TieredPrice[];
  stock: number; lowStockAlert: number;
  images: string[];
  isOrganic: boolean; isFeatured: boolean; isPublished: boolean;
  flashDiscount: number;
  originEn: string; freshnessGuaranteeEn: string;
  storageTipsEn: string;
  nutritionCalories: string; nutritionProtein: string;
  nutritionCarbs: string; nutritionFat: string;
}

function emptyForm(): ProductFormData {
  return {
    nameEn: "", nameBn: "", descriptionEn: "", sku: "",
    categorySlug: "vegetables", categoryName: "Fresh Vegetables",
    vendorId: "tatka-official", vendorName: "Tatka Bazar Central Stock",
    basePrice: 0, comparePrice: 0,
    baseUnit: "kg",
    pricingType: "variableWeight",
    weightOptions: [
      { value: 0.5, unit: "kg", labelEn: "500g", multiplier: 0.5 },
      { value: 1.0, unit: "kg", labelEn: "1 kg", multiplier: 1.0, popular: true },
    ],
    tieredPricing: [],
    stock: 0, lowStockAlert: 10,
    images: [""],
    isOrganic: false, isFeatured: false, isPublished: false,
    flashDiscount: 0,
    originEn: "", freshnessGuaranteeEn: "", storageTipsEn: "",
    nutritionCalories: "", nutritionProtein: "", nutritionCarbs: "", nutritionFat: "",
  };
}

function productToForm(p: AdminProduct): ProductFormData {
  return {
    nameEn: p.nameEn, nameBn: p.nameBn,
    descriptionEn: p.descriptionEn || "",
    sku: p.sku,
    categorySlug: p.categorySlug, categoryName: p.categoryName,
    vendorId: p.vendorId, vendorName: p.vendorName,
    basePrice: p.basePrice, comparePrice: p.comparePrice || 0,
    baseUnit: p.baseUnit,
    pricingType: p.pricingType as any,
    weightOptions: p.weightOptions || [],
    tieredPricing: p.tieredPricing || [],
    stock: p.stock, lowStockAlert: p.lowStockAlert,
    images: p.images?.length ? p.images : [""],
    isOrganic: p.isOrganic, isFeatured: p.isFeatured, isPublished: p.isPublished,
    flashDiscount: p.flashDiscount || 0,
    originEn: p.originEn || "", freshnessGuaranteeEn: p.freshnessGuaranteeEn || "",
    storageTipsEn: p.storageTipsEn || "",
    nutritionCalories: p.nutritionInfo?.calories || "",
    nutritionProtein: p.nutritionInfo?.protein || "",
    nutritionCarbs: p.nutritionInfo?.carbs || "",
    nutritionFat: p.nutritionInfo?.fat || "",
  };
}

function ProductFormModal({
  initial, onSave, onClose, vendors,
}: {
  initial: AdminProduct | undefined;
  onSave: (data: Omit<AdminProduct, "id">) => void;
  onClose: () => void;
  vendors: { id: string; nameEn: string }[];
}) {
  const [form, setForm] = useState<ProductFormData>(initial ? productToForm(initial) : emptyForm());
  const [tab, setTab] = useState<"basic" | "pricing" | "freshness" | "images">("basic");

  const set = (key: keyof ProductFormData, val: any) =>
    setForm(prev => ({ ...prev, [key]: val }));

  const handleWeightOptChange = (idx: number, key: keyof WeightOpt, val: any) => {
    const opts = [...form.weightOptions];
    (opts[idx] as any)[key] = key === "value" || key === "multiplier" ? parseFloat(val) || 0 : val;
    set("weightOptions", opts);
  };
  const addWeightOpt = () => set("weightOptions", [...form.weightOptions, { value: 0, unit: form.baseUnit, labelEn: "", multiplier: 1.0 }]);
  const removeWeightOpt = (i: number) => set("weightOptions", form.weightOptions.filter((_, idx) => idx !== i));

  const handleTierChange = (idx: number, key: keyof TieredPrice, val: any) => {
    const tiers = [...form.tieredPricing];
    (tiers[idx] as any)[key] = key === "labelEn" ? val : parseFloat(val) || 0;
    set("tieredPricing", tiers);
  };
  const addTier = () => set("tieredPricing", [...form.tieredPricing, { minQty: 0, pricePerUnit: 0, discountPercent: 0, labelEn: "" }]);
  const removeTier = (i: number) => set("tieredPricing", form.tieredPricing.filter((_, idx) => idx !== i));

  const handleSave = () => {
    const cat = CATEGORIES.find(c => c.slug === form.categorySlug);
    const vendor = vendors.find(v => v.id === form.vendorId);
    const flashDiscount = Number(form.flashDiscount);
    const comparePrice = Number(form.comparePrice);
    const product: Omit<AdminProduct, "id"> = {
      slug: form.nameEn.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
      nameEn: form.nameEn, nameBn: form.nameBn || form.nameEn,
      descriptionEn: form.descriptionEn,
      sku: form.sku,
      categorySlug: form.categorySlug, categoryName: cat?.name || form.categoryName,
      vendorId: form.vendorId, vendorName: vendor?.nameEn || form.vendorName,
      basePrice: Number(form.basePrice),
      ...(comparePrice > 0 ? { comparePrice } : {}),
      baseUnit: form.baseUnit as any,
      pricingType: form.pricingType,
      ...(form.pricingType === "variableWeight" ? { weightOptions: form.weightOptions } : {}),
      ...(form.tieredPricing.length > 0 ? { tieredPricing: form.tieredPricing } : {}),
      stock: Number(form.stock), lowStockAlert: Number(form.lowStockAlert),
      images: form.images.filter(Boolean),
      isOrganic: form.isOrganic, isFeatured: form.isFeatured, isPublished: form.isPublished,
      ...(flashDiscount > 0 ? { flashDiscount } : {}),
      ...(form.originEn ? { originEn: form.originEn } : {}),
      ...(form.freshnessGuaranteeEn ? { freshnessGuaranteeEn: form.freshnessGuaranteeEn } : {}),
      ...(form.storageTipsEn ? { storageTipsEn: form.storageTipsEn } : {}),
      ...((form.nutritionCalories || form.nutritionProtein) ? {
        nutritionInfo: {
          calories: form.nutritionCalories, protein: form.nutritionProtein,
          carbs: form.nutritionCarbs, fat: form.nutritionFat,
        },
      } : {}),
      rating: initial?.rating ?? 0,
      reviewsCount: initial?.reviewsCount ?? 0,
    };
    onSave(product);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content wide" onClick={e => e.stopPropagation()} style={{ maxWidth: "820px", maxHeight: "94vh" }}>
        <div className="modal-header">
          <div>
            <div className="modal-title">{initial ? "✏️ Edit Product" : "➕ Add New Product"}</div>
            <div className="modal-subtitle">Match the storefront product structure exactly</div>
          </div>
          <button className="admin-btn admin-btn-ghost admin-btn-icon" onClick={onClose}><X size={16} /></button>
        </div>

        {/* Tabs */}
        <div className="tab-bar" style={{ marginBottom: "20px" }}>
          {(["basic", "pricing", "freshness", "images"] as const).map(t => (
            <button key={t} className={`tab-pill ${tab === t ? "active" : ""}`} onClick={() => setTab(t)}>
              {t === "basic" ? "📋 Basic Info" : t === "pricing" ? "💰 Pricing & Stock" : t === "freshness" ? "🌿 Details" : "🖼️ Images"}
            </button>
          ))}
        </div>

        {/* ── BASIC ── */}
        {tab === "basic" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
            <div style={{ gridColumn: "1/-1" }}>
              <label className="admin-label">Product Name (English) *</label>
              <input className="admin-input" placeholder="e.g. Padma Hilsa – Full Fish (Premium Grade)" value={form.nameEn} onChange={e => set("nameEn", e.target.value)} />
            </div>
            <div style={{ gridColumn: "1/-1" }}>
              <label className="admin-label">Product Name (Bangla)</label>
              <input className="admin-input" placeholder="e.g. পদ্মার ইলিশ" value={form.nameBn} onChange={e => set("nameBn", e.target.value)} />
            </div>
            <div style={{ gridColumn: "1/-1" }}>
              <label className="admin-label">Description</label>
              <textarea className="admin-textarea" rows={3} placeholder="Detailed product description…" value={form.descriptionEn} onChange={e => set("descriptionEn", e.target.value)} />
            </div>
            <div>
              <label className="admin-label">SKU</label>
              <input className="admin-input" placeholder="e.g. FISH-ILISH-001" value={form.sku} onChange={e => set("sku", e.target.value)} />
            </div>
            <div>
              <label className="admin-label">Category *</label>
              <select className="admin-select" value={form.categorySlug} onChange={e => {
                const cat = CATEGORIES.find(c => c.slug === e.target.value);
                set("categorySlug", e.target.value);
                set("categoryName", cat?.name || "");
              }}>
                {CATEGORIES.map(c => <option key={c.slug} value={c.slug}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="admin-label">Vendor *</label>
              <select className="admin-select" value={form.vendorId} onChange={e => {
                const v = vendors.find(v => v.id === e.target.value);
                set("vendorId", e.target.value);
                set("vendorName", v?.nameEn || "");
              }}>
                {vendors.map(v => <option key={v.id} value={v.id}>{v.nameEn}</option>)}
              </select>
            </div>
            <div />
            {/* Toggles */}
            <div style={{ gridColumn: "1/-1", display: "flex", gap: "20px", flexWrap: "wrap", padding: "12px 0" }}>
              {([
                { key: "isOrganic", label: "🌿 Organic Certified" },
                { key: "isFeatured", label: "⭐ Featured on Homepage" },
                { key: "isPublished", label: "🌍 Published to Storefront" },
              ] as const).map(({ key, label }) => (
                <label key={key} style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}>
                  <label className="admin-toggle">
                    <input type="checkbox" checked={form[key]} onChange={e => set(key, e.target.checked)} />
                    <span className="admin-toggle-slider" />
                  </label>
                  <span style={{ fontSize: "0.84rem", fontWeight: 600, color: "var(--text-2)" }}>{label}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* ── PRICING ── */}
        {tab === "pricing" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
            <div>
              <label className="admin-label">Base Price (৳) *</label>
              <div className="admin-input-group">
                <span className="admin-input-prefix">৳</span>
                <input className="admin-input" type="number" min="0" value={form.basePrice} onChange={e => set("basePrice", e.target.value)} />
              </div>
            </div>
            <div>
              <label className="admin-label">Compare Price (৳)</label>
              <div className="admin-input-group">
                <span className="admin-input-prefix">৳</span>
                <input className="admin-input" type="number" min="0" value={form.comparePrice} onChange={e => set("comparePrice", e.target.value)} />
              </div>
            </div>
            <div>
              <label className="admin-label">Base Unit</label>
              <select className="admin-select" value={form.baseUnit} onChange={e => set("baseUnit", e.target.value)}>
                {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
            <div>
              <label className="admin-label">Pricing Type</label>
              <select className="admin-select" value={form.pricingType} onChange={e => set("pricingType", e.target.value as any)}>
                {PRICING_TYPES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
            </div>
            <div>
              <label className="admin-label">Flash Discount (%)</label>
              <input className="admin-input" type="number" min="0" max="99" value={form.flashDiscount} onChange={e => set("flashDiscount", e.target.value)} />
            </div>
            <div>
              <label className="admin-label">Low Stock Alert (qty)</label>
              <input className="admin-input" type="number" min="0" value={form.lowStockAlert} onChange={e => set("lowStockAlert", e.target.value)} />
            </div>
            <div>
              <label className="admin-label">Stock Quantity *</label>
              <input className="admin-input" type="number" min="0" value={form.stock} onChange={e => set("stock", e.target.value)} />
            </div>

            {/* Weight Options (Variable Weight) */}
            {form.pricingType === "variableWeight" && (
              <div style={{ gridColumn: "1/-1" }}>
                <div className="section-label"><Scale size={11} /> Weight / Size Options (storefront selector)</div>
                {form.weightOptions.map((opt, i) => (
                  <div key={i} style={{
                    display: "grid", gridTemplateColumns: "90px 60px 1fr 90px 100px 32px",
                    gap: "8px", marginBottom: "8px", alignItems: "center",
                  }}>
                    <input className="admin-input" type="number" placeholder="Value" title="Amount" value={opt.value} onChange={e => handleWeightOptChange(i, "value", e.target.value)} />
                    <select className="admin-select" title="Unit" value={opt.unit} onChange={e => handleWeightOptChange(i, "unit", e.target.value)}>
                      {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                    </select>
                    <input className="admin-input" placeholder="Label (e.g. 1 kg)" value={opt.labelEn} onChange={e => handleWeightOptChange(i, "labelEn", e.target.value)} />
                    <input className="admin-input" type="number" placeholder="Multiplier" title="Price multiplier" value={opt.multiplier} step="0.01" onChange={e => handleWeightOptChange(i, "multiplier", e.target.value)} />
                    <label style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer", fontSize: "0.78rem", color: "var(--text-2)" }}>
                      <input type="checkbox" checked={!!opt.popular} onChange={e => handleWeightOptChange(i, "popular", e.target.checked)} />
                      Popular
                    </label>
                    <button className="admin-btn admin-btn-danger admin-btn-icon admin-btn-sm" onClick={() => removeWeightOpt(i)} title="Remove"><X size={12} /></button>
                  </div>
                ))}
                <button className="admin-btn admin-btn-secondary admin-btn-sm" onClick={addWeightOpt}>
                  <Plus size={13} /> Add Weight Option
                </button>
              </div>
            )}

            {/* Tiered Pricing */}
            <div style={{ gridColumn: "1/-1" }}>
              <div className="section-label"><Layers size={11} /> Tiered / Bulk Pricing (optional)</div>
              {form.tieredPricing.map((tier, i) => (
                <div key={i} style={{
                  display: "grid", gridTemplateColumns: "100px 110px 100px 1fr 32px",
                  gap: "8px", marginBottom: "8px", alignItems: "center",
                }}>
                  <input className="admin-input" type="number" placeholder="Min Qty" title="Min Qty" value={tier.minQty} onChange={e => handleTierChange(i, "minQty", e.target.value)} />
                  <input className="admin-input" type="number" placeholder="৳/unit" title="Price per unit" value={tier.pricePerUnit} onChange={e => handleTierChange(i, "pricePerUnit", e.target.value)} />
                  <input className="admin-input" type="number" placeholder="% Off" title="Discount percent" value={tier.discountPercent || 0} onChange={e => handleTierChange(i, "discountPercent", e.target.value)} />
                  <input className="admin-input" placeholder="Label (e.g. 3kg+ at ৳60/kg)" value={tier.labelEn} onChange={e => handleTierChange(i, "labelEn", e.target.value)} />
                  <button className="admin-btn admin-btn-danger admin-btn-icon admin-btn-sm" onClick={() => removeTier(i)}><X size={12} /></button>
                </div>
              ))}
              <button className="admin-btn admin-btn-secondary admin-btn-sm" onClick={addTier}>
                <Plus size={13} /> Add Tier
              </button>
            </div>
          </div>
        )}

        {/* ── FRESHNESS / DETAILS ── */}
        {tab === "freshness" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
            <div>
              <label className="admin-label">Origin / Source</label>
              <input className="admin-input" placeholder="e.g. Padma River, Rajshahi" value={form.originEn} onChange={e => set("originEn", e.target.value)} />
            </div>
            <div>
              <label className="admin-label">Freshness Guarantee</label>
              <input className="admin-input" placeholder="e.g. Harvested at dawn, same-day delivery" value={form.freshnessGuaranteeEn} onChange={e => set("freshnessGuaranteeEn", e.target.value)} />
            </div>
            <div style={{ gridColumn: "1/-1" }}>
              <label className="admin-label">Storage Tips</label>
              <textarea className="admin-textarea" rows={2} placeholder="e.g. Keep refrigerated. Consume within 2 days." value={form.storageTipsEn} onChange={e => set("storageTipsEn", e.target.value)} />
            </div>
            <div className="section-label" style={{ gridColumn: "1/-1" }}>🥗 Nutrition Info (per unit)</div>
            <div>
              <label className="admin-label">Calories</label>
              <input className="admin-input" placeholder="e.g. 285 kcal" value={form.nutritionCalories} onChange={e => set("nutritionCalories", e.target.value)} />
            </div>
            <div>
              <label className="admin-label">Protein</label>
              <input className="admin-input" placeholder="e.g. 22.5g" value={form.nutritionProtein} onChange={e => set("nutritionProtein", e.target.value)} />
            </div>
            <div>
              <label className="admin-label">Carbohydrates</label>
              <input className="admin-input" placeholder="e.g. 3.9g" value={form.nutritionCarbs} onChange={e => set("nutritionCarbs", e.target.value)} />
            </div>
            <div>
              <label className="admin-label">Fat</label>
              <input className="admin-input" placeholder="e.g. 0.2g" value={form.nutritionFat} onChange={e => set("nutritionFat", e.target.value)} />
            </div>
          </div>
        )}

        {/* ── IMAGES ── */}
        {tab === "images" && (
          <div>
            <div className="section-label"><ImageIcon size={11} /> Product Image URLs</div>
            <p style={{ fontSize: "0.78rem", color: "var(--text-3)", marginBottom: "12px" }}>
              Paste Unsplash or CDN image URLs. First image is the main product image shown on storefront.
            </p>
            {form.images.map((img, i) => (
              <div key={i} style={{ display: "flex", gap: "8px", marginBottom: "10px", alignItems: "center" }}>
                <div style={{ flexShrink: 0, width: "54px", height: "54px", borderRadius: "var(--r-md)", overflow: "hidden", background: "var(--bg-elevated)", border: "1px solid var(--border-1)" }}>
                  {img && !img.includes("placeholder") ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                  ) : (
                    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <ImageIcon size={18} color="var(--text-4)" />
                    </div>
                  )}
                </div>
                <input
                  className="admin-input"
                  placeholder={`Image URL ${i + 1}…`}
                  value={img}
                  onChange={e => {
                    const imgs = [...form.images];
                    imgs[i] = e.target.value;
                    set("images", imgs);
                  }}
                />
                {form.images.length > 1 && (
                  <button className="admin-btn admin-btn-danger admin-btn-icon admin-btn-sm" onClick={() => set("images", form.images.filter((_, idx) => idx !== i))}>
                    <X size={12} />
                  </button>
                )}
              </div>
            ))}
            <button className="admin-btn admin-btn-secondary admin-btn-sm" onClick={() => set("images", [...form.images, ""])}>
              <Plus size={13} /> Add Image URL
            </button>
          </div>
        )}

        <div className="modal-footer">
          <button className="admin-btn admin-btn-secondary" onClick={onClose}>Cancel</button>
          <button
            className="admin-btn admin-btn-primary"
            disabled={!form.nameEn || !form.sku || form.basePrice <= 0}
            onClick={handleSave}
          >
            <Check size={14} /> {initial ? "Save Changes" : "Create Product"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Products Page ────────────────────────────────────────────────────────────

export default function ProductsPage() {
  const { products, vendors, addProduct, updateProduct, deleteProduct, toggleProductPublish } = useAdmin();
  const [showForm, setShowForm] = useState(false);
  const [editProduct, setEditProduct] = useState<AdminProduct | undefined>(undefined);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [publishFilter, setPublishFilter] = useState<"ALL" | "published" | "draft">("ALL");

  const filtered = useMemo(() => {
    return products.filter(p => {
      const matchSearch = !search ||
        p.nameEn.toLowerCase().includes(search.toLowerCase()) ||
        p.sku.toLowerCase().includes(search.toLowerCase()) ||
        p.categoryName.toLowerCase().includes(search.toLowerCase());
      const matchCat = categoryFilter === "ALL" || p.categorySlug === categoryFilter;
      const matchPub = publishFilter === "ALL" || (publishFilter === "published" ? p.isPublished : !p.isPublished);
      return matchSearch && matchCat && matchPub;
    });
  }, [products, search, categoryFilter, publishFilter]);

  const lowStockCount = products.filter(p => p.stock <= p.lowStockAlert).length;
  const publishedCount = products.filter(p => p.isPublished).length;

  const handleSave = (data: Omit<AdminProduct, "id">) => {
    if (editProduct) {
      updateProduct(editProduct.id, data);
    } else {
      addProduct(data);
    }
    setShowForm(false);
    setEditProduct(undefined);
  };

  const approvedVendors = vendors.filter(v => v.status === "APPROVED");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "22px" }}>

      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Products</h1>
          <p className="page-subtitle">
            {publishedCount} live on storefront · {products.length} total
            {lowStockCount > 0 && <span style={{ color: "var(--amber)", marginLeft: "12px" }}>⚠ {lowStockCount} low stock</span>}
          </p>
        </div>
        <div className="page-actions">
          <button className="admin-btn admin-btn-secondary" onClick={() => setViewMode(v => v === "grid" ? "list" : "grid")}>
            {viewMode === "grid" ? <Layers size={14} /> : <Package size={14} />}
            {viewMode === "grid" ? "List View" : "Grid View"}
          </button>
          <button className="admin-btn admin-btn-primary" onClick={() => { setEditProduct(undefined); setShowForm(true); }}>
            <Plus size={14} /> Add Product
          </button>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
        <div className="search-wrap" style={{ flex: 1, minWidth: "220px" }}>
          <Search size={14} className="search-icon" />
          <input className="search-input" placeholder="Search name, SKU, category…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="admin-select" style={{ width: "200px" }} value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
          <option value="ALL">All Categories</option>
          {CATEGORIES.map(c => <option key={c.slug} value={c.slug}>{c.name}</option>)}
        </select>
        <select className="admin-select" style={{ width: "140px" }} value={publishFilter} onChange={e => setPublishFilter(e.target.value as any)}>
          <option value="ALL">All Products</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>
        {(search || categoryFilter !== "ALL" || publishFilter !== "ALL") && (
          <button className="admin-btn admin-btn-ghost admin-btn-sm" onClick={() => { setSearch(""); setCategoryFilter("ALL"); setPublishFilter("ALL"); }}>
            <X size={13} /> Clear
          </button>
        )}
        <span style={{ fontSize: "0.78rem", color: "var(--text-3)", marginLeft: "auto" }}>{filtered.length} products</span>
      </div>

      {/* Grid View */}
      {viewMode === "grid" && (
        <div className="product-grid">
          {filtered.map(p => (
            <div key={p.id} className="product-admin-card">
              <ProductImage src={p.images?.[0] || ""} alt={p.nameEn} />
              {!p.isPublished && (
                <div style={{
                  position: "absolute", top: "8px", left: "8px",
                  background: "var(--bg-surface)", border: "1px solid var(--border-1)",
                  borderRadius: "var(--r-sm)", padding: "2px 7px",
                  fontSize: "0.62rem", fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase",
                }}>DRAFT</div>
              )}
              {p.flashDiscount && (
                <div style={{
                  position: "absolute", top: "8px", right: "8px",
                  background: "var(--red)", color: "#fff",
                  borderRadius: "var(--r-sm)", padding: "2px 7px",
                  fontSize: "0.62rem", fontWeight: 800,
                }}>-{p.flashDiscount}%</div>
              )}
              <div className="product-admin-card-actions">
                <button className="admin-btn admin-btn-secondary admin-btn-icon admin-btn-sm"
                  onClick={e => { e.stopPropagation(); setEditProduct(p); setShowForm(true); }}>
                  <Edit size={12} />
                </button>
                <button className="admin-btn admin-btn-danger admin-btn-icon admin-btn-sm"
                  onClick={e => { e.stopPropagation(); if (confirm(`Delete "${p.nameEn}"?`)) deleteProduct(p.id); }}>
                  <Trash2 size={12} />
                </button>
              </div>
              <div className="product-admin-card-body">
                <div className="product-admin-card-name">{p.nameEn}</div>
                <div style={{ fontSize: "0.70rem", color: "var(--text-3)", marginBottom: "6px", display: "flex", gap: "6px", flexWrap: "wrap" }}>
                  <span>{p.categoryName}</span>
                  <span>·</span>
                  <span className="mono" style={{ color: "var(--text-3)" }}>{p.sku}</span>
                </div>
                <div className="product-admin-card-meta">
                  <div>
                    <span className="product-admin-card-price">৳{p.basePrice.toLocaleString()}</span>
                    <span style={{ fontSize: "0.70rem", color: "var(--text-3)" }}>/{p.baseUnit}</span>
                  </div>
                  <div style={{ display: "flex", gap: "5px", alignItems: "center" }}>
                    {p.isOrganic && <span className="tag green">🌿</span>}
                    {p.isFeatured && <span className="tag amber">⭐</span>}
                  </div>
                </div>
                <div style={{ marginTop: "10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "0.72rem", color: p.stock <= p.lowStockAlert ? "var(--amber)" : "var(--text-3)" }}>
                    {p.stock <= p.lowStockAlert && "⚠ "}{p.stock} in stock
                  </span>
                  <button
                    className={`admin-btn admin-btn-sm ${p.isPublished ? "admin-btn-secondary" : "admin-btn-primary"}`}
                    style={{ padding: "4px 10px", fontSize: "0.70rem" }}
                    onClick={() => toggleProductPublish(p.id)}
                  >
                    {p.isPublished ? <ToggleRight size={12} /> : <ToggleLeft size={12} />}
                    {p.isPublished ? "Live" : "Publish"}
                  </button>
                </div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="admin-card" style={{ gridColumn: "1/-1" }}>
              <div className="empty-state">
                <div className="empty-state-icon">📦</div>
                <div className="empty-state-title">No products found</div>
                <div className="empty-state-desc">Add a product or clear filters</div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* List View */}
      {viewMode === "list" && (
        <div className="admin-card">
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>SKU</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Vendor</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => (
                  <tr key={p.id}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <div style={{ width: "40px", height: "40px", borderRadius: "var(--r-sm)", overflow: "hidden", flexShrink: 0, background: "var(--bg-elevated)" }}>
                          {p.images?.[0] && <img src={p.images[0]} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: "0.83rem" }}>{p.nameEn}</div>
                          <div style={{ fontSize: "0.70rem", color: "var(--text-3)", marginTop: "2px" }}>
                            {p.isOrganic && "🌿 "}{p.isFeatured && "⭐ "}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td><span className="mono">{p.sku}</span></td>
                    <td><span style={{ fontSize: "0.80rem" }}>{p.categoryName}</span></td>
                    <td>
                      <div>
                        <span className="mono" style={{ color: "var(--green-bright)", fontWeight: 700 }}>৳{p.basePrice.toLocaleString()}</span>
                        <span style={{ fontSize: "0.70rem", color: "var(--text-3)" }}>/{p.baseUnit}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`status-badge ${p.stock <= p.lowStockAlert ? "warning" : "success"}`}>
                        {p.stock} {p.stock <= p.lowStockAlert ? "⚠ low" : "ok"}
                      </span>
                    </td>
                    <td><span style={{ fontSize: "0.80rem" }}>{p.vendorName}</span></td>
                    <td>
                      <span className={`status-badge ${p.isPublished ? "success" : "neutral"}`}>
                        {p.isPublished ? "Live" : "Draft"}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: "6px" }}>
                        <button className="admin-btn admin-btn-ghost admin-btn-sm" onClick={() => { setEditProduct(p); setShowForm(true); }}>
                          <Edit size={12} />
                        </button>
                        <button className="admin-btn admin-btn-ghost admin-btn-sm" onClick={() => toggleProductPublish(p.id)}>
                          {p.isPublished ? <ToggleRight size={12} color="var(--green)" /> : <ToggleLeft size={12} />}
                        </button>
                        <button className="admin-btn admin-btn-danger admin-btn-sm" onClick={() => { if (confirm(`Delete "${p.nameEn}"?`)) deleteProduct(p.id); }}>
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <ProductFormModal
          initial={editProduct ?? undefined}
          onSave={handleSave}
          onClose={() => { setShowForm(false); setEditProduct(undefined); }}
          vendors={approvedVendors}
        />
      )}
    </div>
  );
}
