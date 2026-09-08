"use client";

import React, { useState } from "react";
import { Plus, Edit, ToggleLeft, ToggleRight, FolderTree, X, Check, ChevronRight } from "lucide-react";
import { useAdmin } from "@/context/AdminContext";
import { AdminCategory } from "@/types";

const ICONS = ["🐟","🥬","🥭","🌾","🫒","🥛","🍅","🧅","🥕","🥩","🍯","🌶️","🧄","🥚","🍋","🫚"];

function CategoryModal({ initial, onSave, onClose }: {
  initial: AdminCategory | undefined; onSave: (data: any) => void; onClose: () => void;
}) {
  const [form, setForm] = useState({
    nameEn: initial?.nameEn || "",
    nameBn: initial?.nameBn || "",
    icon: initial?.icon || "🛒",
    commissionRate: initial?.commissionRate || 5,
    isActive: initial?.isActive ?? true,
  });
  const set = (k: string, v: any) => setForm(p => ({ ...p, [k]: v }));

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: "480px" }}>
        <div className="modal-header">
          <div className="modal-title">{initial ? "Edit Category" : "Add Category"}</div>
          <button className="admin-btn admin-btn-ghost admin-btn-icon" onClick={onClose}><X size={16} /></button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div>
            <label className="admin-label">Category Name (English) *</label>
            <input className="admin-input" value={form.nameEn} onChange={e => set("nameEn", e.target.value)} placeholder="e.g. Fish & Meat" />
          </div>
          <div>
            <label className="admin-label">Category Name (Bangla)</label>
            <input className="admin-input" value={form.nameBn} onChange={e => set("nameBn", e.target.value)} placeholder="e.g. মাছ ও মাংস" />
          </div>
          <div>
            <label className="admin-label">Icon Emoji</label>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "8px" }}>
              {ICONS.map(ic => (
                <button key={ic}
                  style={{
                    padding: "6px", fontSize: "1.2rem",
                    borderRadius: "var(--r-sm)",
                    background: form.icon === ic ? "var(--green-glass)" : "var(--bg-elevated)",
                    border: form.icon === ic ? "1.5px solid var(--green)" : "1px solid var(--border-1)",
                    cursor: "pointer",
                  }}
                  onClick={() => set("icon", ic)}
                >
                  {ic}
                </button>
              ))}
            </div>
            <input className="admin-input" value={form.icon} onChange={e => set("icon", e.target.value)} placeholder="Or type an emoji" style={{ width: "80px" }} />
          </div>
          <div>
            <label className="admin-label">Commission Rate (%)</label>
            <input className="admin-input" type="number" min="0" max="50" value={form.commissionRate} onChange={e => set("commissionRate", parseFloat(e.target.value))} />
          </div>
          <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}>
            <label className="admin-toggle">
              <input type="checkbox" checked={form.isActive} onChange={e => set("isActive", e.target.checked)} />
              <span className="admin-toggle-slider" />
            </label>
            <span style={{ fontSize: "0.84rem", fontWeight: 600, color: "var(--text-2)" }}>Active on Storefront</span>
          </label>
        </div>
        <div className="modal-footer">
          <button className="admin-btn admin-btn-secondary" onClick={onClose}>Cancel</button>
          <button className="admin-btn admin-btn-primary" disabled={!form.nameEn} onClick={() => { onSave(form); onClose(); }}>
            <Check size={14} /> Save
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CategoriesPage() {
  const { categories, updateCategory, products } = useAdmin();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<AdminCategory | undefined>(undefined);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "22px" }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Categories</h1>
          <p className="page-subtitle">{categories.length} categories on the storefront</p>
        </div>
        <button className="admin-btn admin-btn-primary" onClick={() => { setEditing(undefined); setShowForm(true); }}>
          <Plus size={14} /> Add Category
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px" }}>
        {categories.map(cat => {
          const productCount = products.filter(p => p.categorySlug === cat.slug).length;
          return (
            <div key={cat.id} className="admin-card" style={{ padding: "20px", position: "relative" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "14px" }}>
                <div style={{
                  width: "50px", height: "50px", borderRadius: "var(--r-lg)",
                  background: "var(--bg-elevated)", border: "1px solid var(--border-1)",
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem",
                }}>
                  {cat.icon}
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: "0.95rem", color: "var(--text-0)" }}>{cat.nameEn}</div>
                  <div style={{ fontSize: "0.72rem", color: "var(--text-3)", marginTop: "2px" }}>{cat.nameBn}</div>
                </div>
                <div style={{ marginLeft: "auto", display: "flex", gap: "6px" }}>
                  <button className="admin-btn admin-btn-ghost admin-btn-icon admin-btn-sm" onClick={() => { setEditing(cat); setShowForm(true); }}>
                    <Edit size={13} />
                  </button>
                </div>
              </div>
              <div style={{ display: "flex", gap: "12px", marginBottom: "12px" }}>
                <div style={{ flex: 1, background: "var(--bg-elevated)", borderRadius: "var(--r-md)", padding: "8px 12px", textAlign: "center" }}>
                  <div style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--text-0)" }}>{productCount}</div>
                  <div style={{ fontSize: "0.68rem", color: "var(--text-3)" }}>Products</div>
                </div>
                <div style={{ flex: 1, background: "var(--bg-elevated)", borderRadius: "var(--r-md)", padding: "8px 12px", textAlign: "center" }}>
                  <div style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--green-bright)" }}>{cat.commissionRate}%</div>
                  <div style={{ fontSize: "0.68rem", color: "var(--text-3)" }}>Commission</div>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span className={`status-badge ${cat.isActive ? "success" : "neutral"}`}>
                  {cat.isActive ? "Active" : "Hidden"}
                </span>
                <button
                  className="admin-btn admin-btn-ghost admin-btn-sm"
                  onClick={() => updateCategory(cat.id, { isActive: !cat.isActive })}
                >
                  {cat.isActive ? <ToggleRight size={14} color="var(--green)" /> : <ToggleLeft size={14} />}
                  {cat.isActive ? "Visible" : "Hidden"}
                </button>
              </div>
              {cat.subcategories.length > 0 && (
                <div style={{ marginTop: "12px", borderTop: "1px solid var(--border-0)", paddingTop: "10px" }}>
                  <div style={{ fontSize: "0.68rem", color: "var(--text-4)", fontWeight: 700, marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                    Subcategories
                  </div>
                  <div style={{ display: "flex", gap: "5px", flexWrap: "wrap" }}>
                    {cat.subcategories.map(s => (
                      <span key={s.slug} className="tag">{s.nameEn}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {showForm && (
        <CategoryModal
          initial={editing ?? undefined}
          onSave={(data) => {
            if (editing) updateCategory(editing.id, data);
          }}
          onClose={() => { setShowForm(false); setEditing(undefined); }}
        />
      )}
    </div>
  );
}
