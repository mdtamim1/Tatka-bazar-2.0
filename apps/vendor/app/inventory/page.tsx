"use client";

import React, { useState } from "react";
import { Warehouse, AlertTriangle, Plus, Minus, ArrowDownUp, Check } from "lucide-react";
import { useVendor } from "@/context/VendorContext";

export default function VendorInventoryPage() {
  const { products, updateProductStock } = useVendor();
  const lowStockProducts = products.filter((p) => p.stock <= p.lowStockAlert);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <div>
        <h1 style={{ fontSize: "1.4rem", fontWeight: 800, color: "var(--text-main)" }}>
          Inventory & Stock Management
        </h1>
        <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginTop: "2px" }}>
          Manage your shop's inventory units, quick stock modifications, and low stock thresholds
        </p>
      </div>

      <div className="vendor-card">
        <table className="vendor-table">
          <thead>
            <tr>
              <th>Product & SKU</th>
              <th>Category</th>
              <th>Current Stock</th>
              <th>Alert Level</th>
              <th>Status</th>
              <th>Quick Stock Adjustment</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => {
              const isLow = p.stock <= p.lowStockAlert;
              return (
                <tr key={p.id}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <img src={p.images[0]} alt="Img" style={{ width: "40px", height: "40px", borderRadius: "6px", objectFit: "cover" }} />
                      <div>
                        <div style={{ fontWeight: 700 }}>{p.nameEn || p.nameBn}</div>
                        <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>{p.sku}</div>
                      </div>
                    </div>
                  </td>
                  <td>{p.categoryName}</td>
                  <td>
                    <span style={{ fontWeight: 800, fontSize: "1.05rem", color: isLow ? "var(--danger)" : "var(--primary-dark)" }}>
                      {p.stock} {p.baseUnit}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{p.lowStockAlert} {p.baseUnit}</span>
                  </td>
                  <td>
                    <span className={`status-badge ${isLow ? "danger" : "success"}`}>
                      {isLow ? "⚠️ Low Stock" : "Sufficient"}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <button
                        onClick={() => updateProductStock(p.id, Math.max(0, p.stock - 5))}
                        style={{ padding: "6px 10px", borderRadius: "6px", background: "#F1F5F9", fontWeight: 800 }}
                      >
                        -5
                      </button>
                      <button
                        onClick={() => updateProductStock(p.id, p.stock + 10)}
                        style={{ padding: "6px 10px", borderRadius: "6px", background: "var(--primary-light)", color: "var(--primary-dark)", fontWeight: 800 }}
                      >
                        +10
                      </button>
                      <button
                        onClick={() => updateProductStock(p.id, p.stock + 50)}
                        style={{ padding: "6px 10px", borderRadius: "6px", background: "#EFF6FF", color: "#1D4ED8", fontWeight: 800 }}
                      >
                        +50
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
