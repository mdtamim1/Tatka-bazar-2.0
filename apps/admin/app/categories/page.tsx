"use client";

import React, { useState } from "react";
import { FolderTree, Plus, Edit2, Trash2, Tag, Percent, Check, X } from "lucide-react";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([
    {
      id: "cat-fish-meat",
      slug: "fish-and-meat",
      nameBn: "Fish & Meat",
      nameEn: "Fish & Meat",
      icon: "🐟",
      commissionRate: 8,
      itemCount: 42,
      subcategories: [
        { nameBn: "River Fish", nameEn: "River Fish" },
        { nameBn: "Sea Fish", nameEn: "Sea Fish" },
        { nameBn: "Country Chicken", nameEn: "Country Chicken" },
      ],
    },
    {
      id: "cat-veg",
      slug: "vegetables",
      nameBn: "Fresh Vegetables",
      nameEn: "Fresh Vegetables",
      icon: "🥬",
      commissionRate: 10,
      itemCount: 58,
      subcategories: [
        { nameBn: "Leafy Greens", nameEn: "Leafy Greens" },
        { nameBn: "Daily Veggies", nameEn: "Daily Veggies" },
      ],
    },
    {
      id: "cat-fruits",
      slug: "fruits",
      nameBn: "Fresh Fruits",
      nameEn: "Fresh Fruits",
      icon: "🥭",
      commissionRate: 10,
      itemCount: 35,
      subcategories: [
        { nameBn: "Seasonal Fruits", nameEn: "Seasonal Fruits" },
        { nameBn: "Imported Fruits", nameEn: "Imported Fruits" },
      ],
    },
    {
      id: "cat-rice-grains",
      slug: "rice-and-staples",
      nameBn: "Rice, Lentils & Staples",
      nameEn: "Rice, Lentils & Staples",
      icon: "🌾",
      commissionRate: 6,
      itemCount: 64,
      subcategories: [
        { nameBn: "Aromatic Rice", nameEn: "Aromatic Rice" },
        { nameBn: "Organic Lentils", nameEn: "Organic Lentils" },
      ],
    },
    {
      id: "cat-oil-ghee",
      slug: "oil-and-ghee",
      nameBn: "Oil, Ghee & Spices",
      nameEn: "Oil, Ghee & Spices",
      icon: "🫒",
      commissionRate: 12,
      itemCount: 48,
      subcategories: [
        { nameBn: "Mustard Oil", nameEn: "Mustard Oil" },
        { nameBn: "Desi Ghee", nameEn: "Desi Ghee" },
      ],
    },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    nameBn: "",
    nameEn: "",
    slug: "",
    icon: "📦",
    commissionRate: 10,
  });

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    const newCat = {
      id: `cat-${Date.now()}`,
      slug: formData.slug || formData.nameEn.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      nameBn: formData.nameEn,
      nameEn: formData.nameEn,
      icon: formData.icon,
      commissionRate: formData.commissionRate,
      itemCount: 0,
      subcategories: [],
    };
    setCategories([...categories, newCat]);
    setIsModalOpen(false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ fontSize: "1.4rem", fontWeight: 800, color: "var(--text-main)" }}>
            Category Hierarchy & Commission Rates
          </h1>
          <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginTop: "2px" }}>
            Manage category tree, nested sub-categories, and default marketplace commission rates
          </p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="admin-btn admin-btn-primary">
          <Plus size={16} />
          <span>+ Add New Category</span>
        </button>
      </div>

      <div className="admin-card">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Icon & Category Name</th>
              <th>Category Slug</th>
              <th>Subcategories</th>
              <th>Default Commission Rate</th>
              <th>Total Products</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat) => (
              <tr key={cat.id}>
                <td>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span style={{ fontSize: "1.5rem" }}>{cat.icon}</span>
                    <div style={{ fontWeight: 800 }}>{cat.nameEn}</div>
                  </div>
                </td>
                <td>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.78rem", background: "#F1F5F9", padding: "2px 6px", borderRadius: "4px" }}>
                    {cat.slug}
                  </span>
                </td>
                <td>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                    {cat.subcategories.map((sub, i) => (
                      <span key={i} style={{ fontSize: "0.72rem", background: "var(--primary-light)", color: "var(--primary-dark)", padding: "2px 6px", borderRadius: "4px", fontWeight: 600 }}>
                        {sub.nameEn}
                      </span>
                    ))}
                  </div>
                </td>
                <td>
                  <span style={{ fontWeight: 800, color: "var(--primary-dark)", fontSize: "0.95rem" }}>
                    {cat.commissionRate}%
                  </span>
                </td>
                <td>
                  <span style={{ fontWeight: 700 }}>{cat.itemCount} items</span>
                </td>
                <td>
                  <button style={{ padding: "6px", borderRadius: "6px", background: "#F1F5F9" }}>
                    <Edit2 size={15} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "460px" }}>
            <h2 style={{ fontSize: "1.2rem", fontWeight: 800, marginBottom: "16px" }}>Add New Category</h2>
            <form onSubmit={handleAddCategory} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={{ fontSize: "0.8rem", fontWeight: 700, display: "block", marginBottom: "4px" }}>Category Name *</label>
                <input
                  type="text"
                  required
                  value={formData.nameEn}
                  onChange={(e) => setFormData({ ...formData, nameEn: e.target.value, nameBn: e.target.value })}
                  placeholder="e.g. Dairy & Eggs"
                  style={{ width: "100%", padding: "8px 12px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-medium)" }}
                />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ fontSize: "0.8rem", fontWeight: 700, display: "block", marginBottom: "4px" }}>Emoji / Icon</label>
                  <input
                    type="text"
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    style={{ width: "100%", padding: "8px 12px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-medium)" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "0.8rem", fontWeight: 700, display: "block", marginBottom: "4px" }}>Commission Rate (%)</label>
                  <input
                    type="number"
                    value={formData.commissionRate}
                    onChange={(e) => setFormData({ ...formData, commissionRate: Number(e.target.value) })}
                    style={{ width: "100%", padding: "8px 12px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-medium)" }}
                  />
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px" }}>
                <button type="button" onClick={() => setIsModalOpen(false)} className="admin-btn admin-btn-secondary">Cancel</button>
                <button type="submit" className="admin-btn admin-btn-primary">Save Category</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
