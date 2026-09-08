"use client";

import React, { useState, useMemo } from "react";
import { Users, Search, X, MapPin, Phone, ShoppingBag, DollarSign } from "lucide-react";
import { useAdmin } from "@/context/AdminContext";

export default function CustomersPage() {
  const { customers, orders } = useAdmin();
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => customers.filter(c =>
    !search ||
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search) ||
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    (c.area || "").toLowerCase().includes(search.toLowerCase())
  ), [customers, search]);

  const totalCustomers = customers.length;
  const totalRevenue = customers.reduce((s, c) => s + c.totalSpent, 0);
  const avgOrderValue = totalRevenue / Math.max(customers.reduce((s, c) => s + c.totalOrders, 0), 1);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "22px" }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Customers</h1>
          <p className="page-subtitle">{totalCustomers} registered customers · ৳{(totalRevenue / 1000).toFixed(1)}K total spent</p>
        </div>
      </div>

      {/* Stats */}
      <div className="kpi-grid" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
        {[
          { label: "Total Customers", value: totalCustomers, color: "var(--purple)", glow: "var(--purple-glass)" },
          { label: "Total Revenue", value: `৳${(totalRevenue / 1000).toFixed(1)}K`, color: "var(--green)", glow: "var(--green-glass)" },
          { label: "Avg Order Value", value: `৳${Math.round(avgOrderValue)}`, color: "var(--amber)", glow: "var(--amber-glass)" },
        ].map(s => (
          <div key={s.label} className="kpi-card" style={{ "--kpi-accent": s.color, "--kpi-glow": s.glow } as React.CSSProperties}>
            <div style={{ fontSize: "1.6rem", fontWeight: 900, color: "var(--text-0)" }}>{s.value}</div>
            <div style={{ fontSize: "0.78rem", color: "var(--text-3)", marginTop: "4px" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="search-wrap" style={{ maxWidth: "400px" }}>
        <Search size={14} className="search-icon" />
        <input className="search-input" placeholder="Search name, phone, email, area…" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="admin-card">
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Phone</th>
                <th>Area</th>
                <th>Orders</th>
                <th>Total Spent</th>
                <th>Last Order</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => (
                <tr key={c.id}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div style={{
                        width: "36px", height: "36px", borderRadius: "50%",
                        background: "linear-gradient(135deg, var(--purple), var(--indigo))",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontWeight: 800, fontSize: "0.82rem", color: "#fff",
                      }}>
                        {c.name[0]}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: "0.84rem" }}>{c.name}</div>
                        <div style={{ fontSize: "0.70rem", color: "var(--text-3)" }}>{c.email}</div>
                      </div>
                    </div>
                  </td>
                  <td><span className="mono">{c.phone}</span></td>
                  <td>{c.area || "—"}</td>
                  <td>
                    <span style={{ fontWeight: 700, color: "var(--text-1)" }}>{c.totalOrders}</span>
                    <span style={{ fontSize: "0.70rem", color: "var(--text-3)" }}> orders</span>
                  </td>
                  <td>
                    <span className="mono" style={{ color: "var(--green-bright)", fontWeight: 700 }}>৳{c.totalSpent.toLocaleString()}</span>
                  </td>
                  <td style={{ fontSize: "0.78rem", color: "var(--text-3)" }}>{c.lastOrderDate || "—"}</td>
                  <td>
                    <span className={`status-badge ${c.status === "ACTIVE" ? "success" : "danger"}`}>{c.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="empty-state"><div className="empty-state-icon">👤</div><div className="empty-state-title">No customers found</div></div>
          )}
        </div>
      </div>
    </div>
  );
}
