"use client";

import React, { useState } from "react";
import { FolderTree, Plus, Edit2, Trash2, Tag, Percent, Check, X } from "lucide-react";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([
    {
      id: "cat-fish-meat",
      slug: "fish-and-meat",
      nameBn: "মাছ ও মাংস",
      nameEn: "Fish & Meat",
      icon: "🐟",
      commissionRate: 8,
      itemCount: 42,
      subcategories: [
        { nameBn: "নদীর তাজা মাছ", nameEn: "River Fish" },
        { nameBn: "সামুদ্রিক মাছ", nameEn: "Sea Fish" },
        { nameBn: "দেশি মুরগি", nameEn: "Country Chicken" },
      ],
    },
    {
      id: "cat-veg",
      slug: "vegetables",
      nameBn: "শাকসবজি",
      nameEn: "Fresh Vegetables",
      icon: "🥬",
      commissionRate: 10,
      itemCount: 58,
      subcategories: [
        { nameBn: "তাজা শাক", nameEn: "Leafy Greens" },
        { nameBn: "নিত্যপ্রয়োজনীয় সবজি", nameEn: "Daily Veggies" },
      ],
    },
    {
      id: "cat-fruits",
      slug: "fruits",
      nameBn: "ফলমূল",
      nameEn: "Fresh Fruits",
      icon: "🥭",
      commissionRate: 10,
      itemCount: 35,
      subcategories: [
        { nameBn: "মৌসুমি ফল", nameEn: "Seasonal Fruits" },
        { nameBn: "আমদানি ফল", nameEn: "Imported Fruits" },
      ],
    },
    {
      id: "cat-rice-grains",
      slug: "rice-and-staples",
      nameBn: "চাল, ডাল ও নিত্যপণ্য",
      nameEn: "Rice, Lentils & Staples",
      icon: "🌾",
      commissionRate: 6,
      itemCount: 64,
      subcategories: [
        { nameBn: "সুগন্ধি ও প্রিমিয়াম চাল", nameEn: "Aromatic Rice" },
        { nameBn: "দেশি ডাল", nameEn: "Organic Lentils" },
      ],
    },
    {
      id: "cat-oil-ghee",
      slug: "oil-and-ghee",
      nameBn: "তেল, ঘি ও মসলা",
      nameEn: "Oil, Ghee & Spices",
      icon: "🫒",
      commissionRate: 12,
      itemCount: 48,
      subcategories: [
        { nameBn: "সরিষার তেল", nameEn: "Mustard Oil" },
        { nameBn: "গাওয়া ঘি", nameEn: "Desi Ghee" },
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
      nameBn: formData.nameBn,
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
            ক্যাটাগরি ট্রি ও কমিশন রেট নির্ধারণ
          </h1>
          <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginTop: "2px" }}>
            নেস্টেড ক্যাটাগরি স্ট্রাকচার ও ক্যাটাগরি-ভিত্তিক ডিফল্ট মার্কেটপ্লেস কমিশন
          </p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="admin-btn admin-btn-primary">
          <Plus size={16} />
          <span>+ নতুন ক্যাটাগরি যুক্ত করুন</span>
        </button>
      </div>

      <div className="admin-card">
        <table className="admin-table">
          <thead>
            <tr>
              <th>আইকন ও ক্যাটাগরি</th>
              <th>Category Slug</th>
              <th>সাব-ক্যাটাগরি সমূহ</th>
              <th>ডিফল্ট কমিশন রেট</th>
              <th>মোট পণ্য সংখ্যা</th>
              <th>অ্যাকশন</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat) => (
              <tr key={cat.id}>
                <td>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span style={{ fontSize: "1.5rem" }}>{cat.icon}</span>
                    <div>
                      <div style={{ fontWeight: 800 }}>{cat.nameBn}</div>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{cat.nameEn}</div>
                    </div>
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
                        {sub.nameBn}
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
                  <span style={{ fontWeight: 700 }}>{cat.itemCount} টি</span>
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
            <h2 style={{ fontSize: "1.2rem", fontWeight: 800, marginBottom: "16px" }}>নতুন ক্যাটাগরি তৈরি</h2>
            <form onSubmit={handleAddCategory} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={{ fontSize: "0.8rem", fontWeight: 700, display: "block", marginBottom: "4px" }}>ক্যাটাগরির নাম (বাংলা) *</label>
                <input
                  type="text"
                  required
                  value={formData.nameBn}
                  onChange={(e) => setFormData({ ...formData, nameBn: e.target.value })}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-medium)" }}
                />
              </div>
              <div>
                <label style={{ fontSize: "0.8rem", fontWeight: 700, display: "block", marginBottom: "4px" }}>Category Name (English) *</label>
                <input
                  type="text"
                  required
                  value={formData.nameEn}
                  onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-medium)" }}
                />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ fontSize: "0.8rem", fontWeight: 700, display: "block", marginBottom: "4px" }}>ইমোজি / আইকন</label>
                  <input
                    type="text"
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    style={{ width: "100%", padding: "8px 12px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-medium)" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "0.8rem", fontWeight: 700, display: "block", marginBottom: "4px" }}>কমিশন হার (%)</label>
                  <input
                    type="number"
                    value={formData.commissionRate}
                    onChange={(e) => setFormData({ ...formData, commissionRate: Number(e.target.value) })}
                    style={{ width: "100%", padding: "8px 12px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-medium)" }}
                  />
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px" }}>
                <button type="button" onClick={() => setIsModalOpen(false)} className="admin-btn admin-btn-secondary">বাতিল</button>
                <button type="submit" className="admin-btn admin-btn-primary">সংরক্ষণ করুন</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
