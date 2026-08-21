"use client";

import React, { useState } from "react";
import { Package, Plus, Search, Scale, Sparkles, AlertCircle, CheckCircle, Clock, X } from "lucide-react";
import { useVendor } from "@/context/VendorContext";

export default function VendorProductsPage() {
  const { products, addProduct, updateProductStock, currentVendor } = useVendor();

  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    nameBn: "",
    nameEn: "",
    slug: "",
    sku: `VPROD-${Math.floor(1000 + Math.random() * 9000)}`,
    categorySlug: "vegetables",
    categoryName: "শাকসবজি (Vegetables)",
    basePrice: 80,
    comparePrice: 95,
    baseUnit: "kg" as "kg" | "g" | "piece" | "packet" | "liter",
    pricingType: "variableWeight" as "variableWeight" | "fixed" | "pack",
    stock: 50,
    lowStockAlert: 10,
    images: ["https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop&q=80"],
    isOrganic: true,
    rating: 5.0,
  });

  const filteredProducts = products.filter((p) => {
    if (search.trim()) {
      const q = search.toLowerCase();
      return p.nameBn.toLowerCase().includes(q) || p.nameEn.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q);
    }
    return true;
  });

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const slug = formData.nameEn.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    addProduct({
      ...formData,
      slug,
    });
    setIsModalOpen(false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 style={{ fontSize: "1.4rem", fontWeight: 800, color: "var(--text-main)" }}>
            আমার শপের পণ্য ক্যাটালগ
          </h1>
          <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginTop: "2px" }}>
            মোট {products.length} টি পণ্য • ওজন-ভিত্তিক প্রাইসিং ও টিয়ার্ড ডিসকাউন্ট কনফিগারেশন
          </p>
        </div>

        <button onClick={() => setIsModalOpen(true)} className="vendor-btn vendor-btn-primary">
          <Plus size={16} />
          <span>+ নতুন পণ্য জমা দিন</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="vendor-card" style={{ padding: "14px 18px" }}>
        <div style={{ position: "relative", maxWidth: "360px" }}>
          <Search size={16} color="var(--text-muted)" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="পণ্য বা SKU দিয়ে খুঁজুন..."
            style={{ width: "100%", padding: "7px 12px 7px 36px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-medium)", outline: "none" }}
          />
        </div>
      </div>

      {/* Products Table */}
      <div className="vendor-card">
        <div style={{ overflowX: "auto" }}>
          <table className="vendor-table">
            <thead>
              <tr>
                <th>ছবি ও SKU</th>
                <th>পণ্যের নাম (বাংলা / EN)</th>
                <th>ক্যাটাগরি</th>
                <th>মূল্য ও একক</th>
                <th>বর্তমান স্টক</th>
                <th>অ্যাপ্রুভাল স্ট্যাটাস</th>
                <th>অ্যাকশন</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((p) => (
                <tr key={p.id}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <img src={p.images[0]} alt="Img" style={{ width: "44px", height: "44px", borderRadius: "8px", objectFit: "cover" }} />
                      <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                        {p.sku}
                      </span>
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 700 }}>{p.nameBn}</div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{p.nameEn}</div>
                    {p.isOrganic && (
                      <span style={{ fontSize: "0.68rem", color: "var(--primary)", fontWeight: 700 }}>
                        🌱 ১০০% অর্গানিক
                      </span>
                    )}
                  </td>
                  <td>{p.categoryName}</td>
                  <td>
                    <div style={{ fontWeight: 800, color: "var(--primary-dark)" }}>
                      ৳{p.basePrice} / {p.baseUnit}
                    </div>
                    {p.pricingType === "variableWeight" && (
                      <span style={{ fontSize: "0.7rem", color: "var(--accent)", fontWeight: 700 }}>
                        ⚖️ ওজন-ভিত্তিক
                      </span>
                    )}
                  </td>
                  <td>
                    <span style={{ fontWeight: 700, color: p.stock <= p.lowStockAlert ? "var(--danger)" : "var(--text-main)" }}>
                      {p.stock} {p.baseUnit}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${p.status === "APPROVED" ? "success" : "warning"}`}>
                      {p.status === "APPROVED" ? "✓ অনুমোদিত" : "⏳ পর্যালোচনায়"}
                    </span>
                  </td>
                  <td>
                    <button
                      onClick={() => updateProductStock(p.id, p.stock + 10)}
                      className="vendor-btn vendor-btn-secondary"
                      style={{ padding: "4px 8px", fontSize: "0.72rem" }}
                      title="Quick restock +10"
                    >
                      +১০ রিস্টক
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Product Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "12px" }}>
              <h2 style={{ fontSize: "1.2rem", fontWeight: 800 }}>
                নতুন পণ্য যুক্ত করুন (অ্যাডমিন অনুমোদনের জন্য)
              </h2>
              <button onClick={() => setIsModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ fontSize: "0.8rem", fontWeight: 700, display: "block", marginBottom: "4px" }}>পণ্যের নাম (বাংলা) *</label>
                  <input
                    type="text"
                    required
                    placeholder="যেমন: খাঁটি গাওয়া ঘি"
                    value={formData.nameBn}
                    onChange={(e) => setFormData({ ...formData, nameBn: e.target.value })}
                    style={{ width: "100%", padding: "8px 12px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-medium)" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "0.8rem", fontWeight: 700, display: "block", marginBottom: "4px" }}>Product Name (English) *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Pure Desi Cow Ghee"
                    value={formData.nameEn}
                    onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                    style={{ width: "100%", padding: "8px 12px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-medium)" }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
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
                    <option value="vegetables">শাকসবজি (Vegetables)</option>
                    <option value="fish-and-meat">মাছ ও মাংস (Fish & Meat)</option>
                    <option value="rice-and-staples">চাল ও খাদ্যশস্য (Rice & Grains)</option>
                    <option value="oil-and-ghee">তেল ও ঘি (Oil & Ghee)</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: "0.8rem", fontWeight: 700, display: "block", marginBottom: "4px" }}>প্রাইসিং টাইপ</label>
                  <select
                    value={formData.pricingType}
                    onChange={(e) => setFormData({ ...formData, pricingType: e.target.value as any })}
                    style={{ width: "100%", padding: "8px 12px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-medium)", background: "#FFF" }}
                  >
                    <option value="variableWeight">ওজন-ভিত্তিক ডাইনামিক (Variable Weight)</option>
                    <option value="fixed">ফিক্সড প্রতি পিস (Fixed Piece)</option>
                    <option value="pack">প্যাকেট সাইজ (Pack)</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ fontSize: "0.8rem", fontWeight: 700, display: "block", marginBottom: "4px" }}>মূল্য (৳) *</label>
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
                  <label style={{ fontSize: "0.8rem", fontWeight: 700, display: "block", marginBottom: "4px" }}>একক (Unit)</label>
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
                  <label style={{ fontSize: "0.8rem", fontWeight: 700, display: "block", marginBottom: "4px" }}>লো-স্টক অ্যালার্ট সীমা</label>
                  <input
                    type="number"
                    value={formData.lowStockAlert}
                    onChange={(e) => setFormData({ ...formData, lowStockAlert: Number(e.target.value) })}
                    style={{ width: "100%", padding: "8px 12px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-medium)" }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: "0.8rem", fontWeight: 700, display: "block", marginBottom: "4px" }}>পণ্যের ছবি (Image URL)</label>
                <input
                  type="url"
                  value={formData.images[0]}
                  onChange={(e) => setFormData({ ...formData, images: [e.target.value] })}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-medium)" }}
                />
              </div>

              <div style={{ background: "#EFF6FF", padding: "10px 14px", borderRadius: "8px", fontSize: "0.78rem", color: "#1E40AF", display: "flex", alignItems: "center", gap: "8px" }}>
                <Clock size={16} />
                <span>নতুন পণ্য সাবমিট করার পর সেন্ট্রাল অ্যাডমিন অনুমোদনের পরই স্টোরফ্রন্টে প্রদর্শিত হবে।</span>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "8px" }}>
                <button type="button" onClick={() => setIsModalOpen(false)} className="vendor-btn vendor-btn-secondary">
                  বাতিল
                </button>
                <button type="submit" className="vendor-btn vendor-btn-primary">
                  অনুমোদনের জন্য জমা দিন
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
