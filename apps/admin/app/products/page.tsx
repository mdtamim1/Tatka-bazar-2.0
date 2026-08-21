"use client";

import React, { useState } from "react";
import {
  Package,
  Plus,
  Search,
  Edit2,
  Trash2,
  Check,
  X,
  Eye,
  EyeOff,
  Filter,
  Sparkles,
  Scale,
  Leaf,
  Store,
} from "lucide-react";
import { useAdmin } from "@/context/AdminContext";
import { AdminProduct } from "@/types";

export default function AdminProductsPage() {
  const { products, addProduct, updateProduct, deleteProduct, toggleProductPublish, vendors } = useAdmin();

  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterVendor, setFilterVendor] = useState("all");

  // Modal State for New / Edit Product
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    nameBn: "",
    nameEn: "",
    slug: "",
    sku: "",
    categorySlug: "vegetables",
    categoryName: "শাকসবজি (Vegetables)",
    vendorId: "tatka-official",
    vendorName: "তাতকা বাজার নিজস্ব স্টক",
    basePrice: 100,
    comparePrice: 120,
    baseUnit: "kg" as "kg" | "g" | "piece" | "packet" | "liter",
    pricingType: "variableWeight" as "variableWeight" | "fixed" | "pack",
    stock: 50,
    lowStockAlert: 10,
    images: ["https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop&q=80"],
    isOrganic: true,
    isPublished: true,
    rating: 5.0,
  });

  const filteredProducts = products.filter((p) => {
    if (filterCategory !== "all" && p.categorySlug !== filterCategory) return false;
    if (filterVendor !== "all" && p.vendorId !== filterVendor) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        p.nameBn.toLowerCase().includes(q) ||
        p.nameEn.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleOpenCreateModal = () => {
    setEditingId(null);
    setFormData({
      nameBn: "",
      nameEn: "",
      slug: "",
      sku: `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
      categorySlug: "vegetables",
      categoryName: "শাকসবজি (Vegetables)",
      vendorId: "tatka-official",
      vendorName: "তাতকা বাজার নিজস্ব স্টক",
      basePrice: 100,
      comparePrice: 120,
      baseUnit: "kg",
      pricingType: "variableWeight",
      stock: 50,
      lowStockAlert: 10,
      images: ["https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop&q=80"],
      isOrganic: true,
      isPublished: true,
      rating: 5.0,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (p: AdminProduct) => {
    setEditingId(p.id);
    setFormData({
      nameBn: p.nameBn,
      nameEn: p.nameEn,
      slug: p.slug,
      sku: p.sku,
      categorySlug: p.categorySlug,
      categoryName: p.categoryName,
      vendorId: p.vendorId,
      vendorName: p.vendorName,
      basePrice: p.basePrice,
      comparePrice: p.comparePrice || p.basePrice,
      baseUnit: p.baseUnit,
      pricingType: p.pricingType,
      stock: p.stock,
      lowStockAlert: p.lowStockAlert,
      images: p.images,
      isOrganic: p.isOrganic,
      isPublished: p.isPublished,
      rating: p.rating,
    });
    setIsModalOpen(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const generatedSlug = formData.slug || formData.nameEn.toLowerCase().replace(/[^a-z0-9]+/g, "-");

    if (editingId) {
      updateProduct(editingId, { ...formData, slug: generatedSlug });
    } else {
      addProduct({
        ...formData,
        slug: generatedSlug,
      });
    }
    setIsModalOpen(false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      
      {/* Header Bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 style={{ fontSize: "1.4rem", fontWeight: 800, color: "var(--text-main)" }}>
            পণ্য ক্যাটালগ ও প্রডাক্ট ম্যানেজমেন্ট
          </h1>
          <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginTop: "2px" }}>
            মোট {products.length} টি পণ্য • ওজন-ভিত্তিক মূল্য ও টিয়ার্ড ডিসকাউন্ট কনফিগারেশন
          </p>
        </div>

        <button onClick={handleOpenCreateModal} className="admin-btn admin-btn-primary">
          <Plus size={16} />
          <span>+ নতুন পণ্য তৈরি করুন</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="admin-card" style={{ padding: "14px 18px", display: "flex", gap: "14px", alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: 1, minWidth: "240px" }}>
          <Search size={16} color="var(--text-muted)" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="নাম বা SKU দিয়ে পণ্য সার্চ করুন..."
            style={{ width: "100%", padding: "7px 12px 7px 36px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-medium)", outline: "none" }}
          />
        </div>

        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          style={{ padding: "7px 12px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-medium)", background: "#FFF" }}
        >
          <option value="all">সকল ক্যাটাগরি</option>
          <option value="fish-and-meat">মাছ ও মাংস (Fish & Meat)</option>
          <option value="vegetables">শাকসবজি (Vegetables)</option>
          <option value="rice-and-staples">চাল ও ডাল (Rice & Grains)</option>
          <option value="oil-and-ghee">তেল ও ঘি (Oil & Ghee)</option>
        </select>

        <select
          value={filterVendor}
          onChange={(e) => setFilterVendor(e.target.value)}
          style={{ padding: "7px 12px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-medium)", background: "#FFF" }}
        >
          <option value="all">সকল বিক্রেতা / ভেন্ডর</option>
          <option value="tatka-official">তাতকা বাজার নিজস্ব স্টক</option>
          {vendors.map((v) => (
            <option key={v.id} value={v.id}>{v.nameBn}</option>
          ))}
        </select>
      </div>

      {/* Main Products Table */}
      <div className="admin-card">
        <div style={{ overflowX: "auto" }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>ছবি ও SKU</th>
                <th>পণ্যের নাম (বাংলা / EN)</th>
                <th>ক্যাটাগরি</th>
                <th>ভেন্ডর</th>
                <th>মূল্য ও একক</th>
                <th>মজুদ স্টক</th>
                <th>স্ট্যাটাস</th>
                <th>অ্যাকশন</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((prod) => (
                <tr key={prod.id}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <img src={prod.images[0]} alt="Img" style={{ width: "44px", height: "44px", borderRadius: "8px", objectFit: "cover" }} />
                      <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                        {prod.sku}
                      </span>
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 700, color: "var(--text-main)" }}>{prod.nameBn}</div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{prod.nameEn}</div>
                    {prod.isOrganic && (
                      <span style={{ fontSize: "0.68rem", color: "var(--primary)", fontWeight: 700 }}>
                        🌱 ১০০% অর্গানিক
                      </span>
                    )}
                  </td>
                  <td>
                    <span style={{ fontSize: "0.8rem", color: "var(--text-main)" }}>{prod.categoryName}</span>
                  </td>
                  <td>
                    <div style={{ fontSize: "0.8rem", fontWeight: 600 }}>{prod.vendorName}</div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 800, color: "var(--primary-dark)" }}>
                      ৳{prod.basePrice} / {prod.baseUnit}
                    </div>
                    {prod.pricingType === "variableWeight" && (
                      <span style={{ fontSize: "0.7rem", color: "var(--accent)", fontWeight: 700 }}>
                        ⚖️ ওজন-ভিত্তিক ডাইনামিক
                      </span>
                    )}
                  </td>
                  <td>
                    <div style={{ fontWeight: 700, color: prod.stock <= prod.lowStockAlert ? "var(--danger)" : "var(--text-main)" }}>
                      {prod.stock} {prod.baseUnit}
                    </div>
                    {prod.stock <= prod.lowStockAlert && (
                      <span style={{ fontSize: "0.68rem", color: "var(--danger)", fontWeight: 700 }}>
                        ⚠️ লো স্টক!
                      </span>
                    )}
                  </td>
                  <td>
                    <button
                      onClick={() => toggleProductPublish(prod.id)}
                      className={`status-badge ${prod.isPublished ? "success" : "neutral"}`}
                    >
                      {prod.isPublished ? "পাবলিশড" : "ড্রাফট"}
                    </button>
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: "6px" }}>
                      <button
                        onClick={() => handleOpenEditModal(prod)}
                        style={{ padding: "6px", borderRadius: "6px", background: "#F1F5F9", color: "var(--text-main)" }}
                        title="Edit"
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        onClick={() => deleteProduct(prod.id)}
                        style={{ padding: "6px", borderRadius: "6px", background: "#FEE2E2", color: "var(--danger)" }}
                        title="Delete"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* New / Edit Product Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "12px" }}>
              <h2 style={{ fontSize: "1.2rem", fontWeight: 800 }}>
                {editingId ? "পণ্য এডিট করুন" : "নতুন তাজা পণ্য যুক্ত করুন"}
              </h2>
              <button onClick={() => setIsModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              
              {/* Names */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ fontSize: "0.8rem", fontWeight: 700, display: "block", marginBottom: "4px" }}>পণ্যের নাম (বাংলা) *</label>
                  <input
                    type="text"
                    required
                    value={formData.nameBn}
                    onChange={(e) => setFormData({ ...formData, nameBn: e.target.value })}
                    placeholder="যেমন: পদ্মার তাজা ইলিশ"
                    style={{ width: "100%", padding: "8px 12px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-medium)" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "0.8rem", fontWeight: 700, display: "block", marginBottom: "4px" }}>Product Name (English) *</label>
                  <input
                    type="text"
                    required
                    value={formData.nameEn}
                    onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                    placeholder="e.g. Fresh Padma Hilsa"
                    style={{ width: "100%", padding: "8px 12px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-medium)" }}
                  />
                </div>
              </div>

              {/* SKU & Category */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ fontSize: "0.8rem", fontWeight: 700, display: "block", marginBottom: "4px" }}>SKU কোড *</label>
                  <input
                    type="text"
                    required
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    style={{ width: "100%", padding: "8px 12px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-medium)" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "0.8rem", fontWeight: 700, display: "block", marginBottom: "4px" }}>ক্যাটাগরি</label>
                  <select
                    value={formData.categorySlug}
                    onChange={(e) => {
                      const slug = e.target.value;
                      const catName = e.target.options[e.target.selectedIndex]?.text || slug;
                      setFormData({ ...formData, categorySlug: slug, categoryName: catName });
                    }}
                    style={{ width: "100%", padding: "8px 12px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-medium)", background: "#FFF" }}
                  >
                    <option value="fish-and-meat">মাছ ও মাংস (Fish & Meat)</option>
                    <option value="vegetables">শাকসবজি (Vegetables)</option>
                    <option value="rice-and-staples">চাল ও ডাল (Rice & Grains)</option>
                    <option value="oil-and-ghee">তেল ও ঘি (Oil & Ghee)</option>
                  </select>
                </div>
              </div>

              {/* Pricing & Unit */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ fontSize: "0.8rem", fontWeight: 700, display: "block", marginBottom: "4px" }}>মূল মূল্য (৳) *</label>
                  <input
                    type="number"
                    required
                    value={formData.basePrice}
                    onChange={(e) => setFormData({ ...formData, basePrice: Number(e.target.value) })}
                    style={{ width: "100%", padding: "8px 12px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-medium)" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "0.8rem", fontWeight: 700, display: "block", marginBottom: "4px" }}>পূর্বের মূল্য (৳)</label>
                  <input
                    type="number"
                    value={formData.comparePrice}
                    onChange={(e) => setFormData({ ...formData, comparePrice: Number(e.target.value) })}
                    style={{ width: "100%", padding: "8px 12px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-medium)" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "0.8rem", fontWeight: 700, display: "block", marginBottom: "4px" }}>বেস ইউনিট</label>
                  <select
                    value={formData.baseUnit}
                    onChange={(e) => setFormData({ ...formData, baseUnit: e.target.value as any })}
                    style={{ width: "100%", padding: "8px 12px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-medium)", background: "#FFF" }}
                  >
                    <option value="kg">কেজি (kg)</option>
                    <option value="g">গ্রাম (gram)</option>
                    <option value="piece">পিস (piece)</option>
                    <option value="packet">প্যাকেট (packet)</option>
                    <option value="liter">লিটার (liter)</option>
                  </select>
                </div>
              </div>

              {/* Stock & Low Stock Threshold */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ fontSize: "0.8rem", fontWeight: 700, display: "block", marginBottom: "4px" }}>বর্তমান স্টক *</label>
                  <input
                    type="number"
                    required
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                    style={{ width: "100%", padding: "8px 12px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-medium)" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "0.8rem", fontWeight: 700, display: "block", marginBottom: "4px" }}>লো-স্টক সতর্কবার্তা থ্রেশহোল্ড</label>
                  <input
                    type="number"
                    value={formData.lowStockAlert}
                    onChange={(e) => setFormData({ ...formData, lowStockAlert: Number(e.target.value) })}
                    style={{ width: "100%", padding: "8px 12px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-medium)" }}
                  />
                </div>
              </div>

              {/* Image URL */}
              <div>
                <label style={{ fontSize: "0.8rem", fontWeight: 700, display: "block", marginBottom: "4px" }}>ছবির লিংক (Image URL)</label>
                <input
                  type="url"
                  value={formData.images[0]}
                  onChange={(e) => setFormData({ ...formData, images: [e.target.value] })}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-medium)" }}
                />
              </div>

              {/* Toggles */}
              <div style={{ display: "flex", gap: "20px", alignItems: "center", paddingTop: "6px" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.85rem", cursor: "pointer", fontWeight: 600 }}>
                  <input
                    type="checkbox"
                    checked={formData.isOrganic}
                    onChange={(e) => setFormData({ ...formData, isOrganic: e.target.checked })}
                    style={{ accentColor: "var(--primary)" }}
                  />
                  <span>🌱 ১০০% অর্গানিক সার্টিফাইড</span>
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.85rem", cursor: "pointer", fontWeight: 600 }}>
                  <input
                    type="checkbox"
                    checked={formData.isPublished}
                    onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                    style={{ accentColor: "var(--primary)" }}
                  />
                  <span>স্টোরফ্রন্টে সরাসরি দৃশ্যমান (Published)</span>
                </label>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "12px", borderTop: "1px solid var(--border-subtle)", paddingTop: "14px" }}>
                <button type="button" onClick={() => setIsModalOpen(false)} className="admin-btn admin-btn-secondary">
                  বাতিল
                </button>
                <button type="submit" className="admin-btn admin-btn-primary">
                  {editingId ? "পরিবর্তন সংরক্ষণ করুন" : "পণ্য সংরক্ষণ করুন"}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
