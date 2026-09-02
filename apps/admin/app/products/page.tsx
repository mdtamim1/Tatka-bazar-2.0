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
    categoryName: "Vegetables",
    vendorId: "tatka-official",
    vendorName: "Tatka Bazar Central Stock",
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
        (p.nameEn && p.nameEn.toLowerCase().includes(q)) ||
        (p.nameBn && p.nameBn.toLowerCase().includes(q)) ||
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
      categoryName: "Vegetables",
      vendorId: "tatka-official",
      vendorName: "Tatka Bazar Central Stock",
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
      nameBn: p.nameEn || p.nameBn,
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
      updateProduct(editingId, { ...formData, nameBn: formData.nameEn, slug: generatedSlug });
    } else {
      addProduct({
        ...formData,
        nameBn: formData.nameEn,
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
            Product Catalog & Management
          </h1>
          <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginTop: "2px" }}>
            Total {products.length} products • Variable weight pricing and tiered discount rules
          </p>
        </div>

        <button onClick={handleOpenCreateModal} className="admin-btn admin-btn-primary">
          <Plus size={16} />
          <span>+ Create New Product</span>
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
            placeholder="Search by product name or SKU..."
            style={{ width: "100%", padding: "7px 12px 7px 36px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-medium)", outline: "none" }}
          />
        </div>

        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          style={{ padding: "7px 12px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-medium)", background: "#FFF" }}
        >
          <option value="all">All Categories</option>
          <option value="fish-and-meat">Fish & Meat</option>
          <option value="vegetables">Vegetables</option>
          <option value="rice-and-staples">Rice & Grains</option>
          <option value="oil-and-ghee">Oil & Ghee</option>
        </select>

        <select
          value={filterVendor}
          onChange={(e) => setFilterVendor(e.target.value)}
          style={{ padding: "7px 12px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-medium)", background: "#FFF" }}
        >
          <option value="all">All Vendors</option>
          <option value="tatka-official">Tatka Bazar Central Stock</option>
          {vendors.map((v) => (
            <option key={v.id} value={v.id}>{v.nameEn || v.nameBn}</option>
          ))}
        </select>
      </div>

      {/* Main Products Table */}
      <div className="admin-card">
        <div style={{ overflowX: "auto" }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Image & SKU</th>
                <th>Product Name</th>
                <th>Category</th>
                <th>Vendor</th>
                <th>Price & Unit</th>
                <th>Stock Units</th>
                <th>Status</th>
                <th>Actions</th>
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
                    <div style={{ fontWeight: 700, color: "var(--text-main)" }}>{prod.nameEn || prod.nameBn}</div>
                    {prod.isOrganic && (
                      <span style={{ fontSize: "0.68rem", color: "var(--primary)", fontWeight: 700 }}>
                        🌱 100% Organic
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
                        ⚖️ Variable Weight
                      </span>
                    )}
                  </td>
                  <td>
                    <div style={{ fontWeight: 700, color: prod.stock <= prod.lowStockAlert ? "var(--danger)" : "var(--text-main)" }}>
                      {prod.stock} {prod.baseUnit}
                    </div>
                    {prod.stock <= prod.lowStockAlert && (
                      <span style={{ fontSize: "0.68rem", color: "var(--danger)", fontWeight: 700 }}>
                        ⚠️ Low Stock!
                      </span>
                    )}
                  </td>
                  <td>
                    <button
                      onClick={() => toggleProductPublish(prod.id)}
                      className={`status-badge ${prod.isPublished ? "success" : "neutral"}`}
                    >
                      {prod.isPublished ? "Published" : "Draft"}
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
                {editingId ? "Edit Product" : "Add New Fresh Product"}
              </h2>
              <button onClick={() => setIsModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              
              {/* Product Name */}
              <div>
                <label style={{ fontSize: "0.8rem", fontWeight: 700, display: "block", marginBottom: "4px" }}>Product Name *</label>
                <input
                  type="text"
                  required
                  value={formData.nameEn}
                  onChange={(e) => setFormData({ ...formData, nameEn: e.target.value, nameBn: e.target.value })}
                  placeholder="e.g. Fresh Padma River Hilsa"
                  style={{ width: "100%", padding: "8px 12px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-medium)" }}
                />
              </div>

              {/* SKU & Category */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ fontSize: "0.8rem", fontWeight: 700, display: "block", marginBottom: "4px" }}>SKU Code *</label>
                  <input
                    type="text"
                    required
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    style={{ width: "100%", padding: "8px 12px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-medium)" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "0.8rem", fontWeight: 700, display: "block", marginBottom: "4px" }}>Category</label>
                  <select
                    value={formData.categorySlug}
                    onChange={(e) => {
                      const slug = e.target.value;
                      const catName = e.target.options[e.target.selectedIndex]?.text || slug;
                      setFormData({ ...formData, categorySlug: slug, categoryName: catName });
                    }}
                    style={{ width: "100%", padding: "8px 12px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-medium)", background: "#FFF" }}
                  >
                    <option value="fish-and-meat">Fish & Meat</option>
                    <option value="vegetables">Vegetables</option>
                    <option value="rice-and-staples">Rice & Grains</option>
                    <option value="oil-and-ghee">Oil & Ghee</option>
                  </select>
                </div>
              </div>

              {/* Pricing & Unit */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ fontSize: "0.8rem", fontWeight: 700, display: "block", marginBottom: "4px" }}>Base Price (৳) *</label>
                  <input
                    type="number"
                    required
                    value={formData.basePrice}
                    onChange={(e) => setFormData({ ...formData, basePrice: Number(e.target.value) })}
                    style={{ width: "100%", padding: "8px 12px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-medium)" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "0.8rem", fontWeight: 700, display: "block", marginBottom: "4px" }}>Compare Price (৳)</label>
                  <input
                    type="number"
                    value={formData.comparePrice}
                    onChange={(e) => setFormData({ ...formData, comparePrice: Number(e.target.value) })}
                    style={{ width: "100%", padding: "8px 12px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-medium)" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "0.8rem", fontWeight: 700, display: "block", marginBottom: "4px" }}>Base Unit</label>
                  <select
                    value={formData.baseUnit}
                    onChange={(e) => setFormData({ ...formData, baseUnit: e.target.value as any })}
                    style={{ width: "100%", padding: "8px 12px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-medium)", background: "#FFF" }}
                  >
                    <option value="kg">kg</option>
                    <option value="g">gram</option>
                    <option value="piece">piece</option>
                    <option value="packet">packet</option>
                    <option value="liter">liter</option>
                  </select>
                </div>
              </div>

              {/* Stock & Low Stock Threshold */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ fontSize: "0.8rem", fontWeight: 700, display: "block", marginBottom: "4px" }}>Current Stock Units *</label>
                  <input
                    type="number"
                    required
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                    style={{ width: "100%", padding: "8px 12px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-medium)" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "0.8rem", fontWeight: 700, display: "block", marginBottom: "4px" }}>Low Stock Alert Level</label>
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
                <label style={{ fontSize: "0.8rem", fontWeight: 700, display: "block", marginBottom: "4px" }}>Image URL</label>
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
                  <span>🌱 100% Certified Organic</span>
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.85rem", cursor: "pointer", fontWeight: 600 }}>
                  <input
                    type="checkbox"
                    checked={formData.isPublished}
                    onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                    style={{ accentColor: "var(--primary)" }}
                  />
                  <span>Published on Storefront</span>
                </label>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "12px", borderTop: "1px solid var(--border-subtle)", paddingTop: "14px" }}>
                <button type="button" onClick={() => setIsModalOpen(false)} className="admin-btn admin-btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="admin-btn admin-btn-primary">
                  {editingId ? "Save Changes" : "Save Product"}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
