"use client";

import React, { useState, useMemo } from "react";
import {
  Store, Plus, Search, X, Check, Phone, Mail, MapPin, Star,
  ShieldCheck, ShieldX, DollarSign, Eye, Edit, Package, BarChart3,
} from "lucide-react";
import { useAdmin } from "@/context/AdminContext";
import { AdminVendor } from "@/types";

function VendorDrawer({ vendor, onClose }: { vendor: AdminVendor; onClose: () => void }) {
  const { approveVendor, suspendVendor, settleVendorPayout } = useAdmin();
  const [payAmount, setPayAmount] = useState("");

  return (
    <>
      <div className="drawer-overlay" onClick={onClose} />
      <div className="drawer-panel">
        <div className="drawer-header">
          <div>
            <div style={{ fontWeight: 800, fontSize: "1rem", color: "var(--text-0)" }}>{vendor.nameEn}</div>
            <span className={`status-badge ${vendor.status === "APPROVED" ? "success" : vendor.status === "PENDING" ? "warning" : "danger"}`} style={{ marginTop: "4px" }}>
              {vendor.status}
            </span>
          </div>
          <button className="admin-btn admin-btn-ghost admin-btn-icon" onClick={onClose}><X size={16} /></button>
        </div>
        <div className="drawer-body">
          <div className="section-label"><Store size={11} /> Business Info</div>
          <div className="detail-row"><span className="detail-label">Contact</span><span className="detail-value">{vendor.contactName}</span></div>
          <div className="detail-row"><span className="detail-label">Phone</span><span className="detail-value mono">{vendor.phone}</span></div>
          <div className="detail-row"><span className="detail-label">Email</span><span className="detail-value">{vendor.email}</span></div>
          <div className="detail-row"><span className="detail-label">Trade License</span><span className="detail-value mono" style={{ fontSize: "0.78rem" }}>{vendor.tradeLicense}</span></div>
          <div className="detail-row"><span className="detail-label">Location</span><span className="detail-value">{vendor.location}</span></div>
          <div className="detail-row"><span className="detail-label">Area</span><span className="detail-value">{vendor.area}, {vendor.city}</span></div>
          <div className="detail-row"><span className="detail-label">Joined</span><span className="detail-value">{vendor.joinedDate}</span></div>

          <div className="admin-divider" />
          <div className="section-label"><BarChart3 size={11} /> Performance</div>
          <div className="detail-row"><span className="detail-label">Total Sales</span><span className="detail-value mono" style={{ color: "var(--green-bright)", fontWeight: 700 }}>৳{vendor.totalSales.toLocaleString()}</span></div>
          <div className="detail-row"><span className="detail-label">Commission</span><span className="detail-value">{vendor.commissionRate}%</span></div>
          <div className="detail-row"><span className="detail-label">Products</span><span className="detail-value">{vendor.totalProducts}</span></div>
          <div className="detail-row"><span className="detail-label">Rating</span><span className="detail-value">{vendor.rating > 0 ? `⭐ ${vendor.rating.toFixed(1)}` : "No reviews yet"}</span></div>
          <div className="detail-row"><span className="detail-label">Active Orders</span><span className="detail-value">{vendor.activeOrders}</span></div>

          <div className="admin-divider" />
          <div className="section-label"><DollarSign size={11} /> Payable Balance</div>
          <div style={{
            background: "var(--green-glass)", border: "1px solid var(--border-green)",
            borderRadius: "var(--r-md)", padding: "14px 16px", marginBottom: "16px",
          }}>
            <div style={{ fontSize: "1.6rem", fontWeight: 900, color: "var(--green-bright)" }}>
              ৳{vendor.payableBalance.toLocaleString()}
            </div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-3)" }}>Outstanding payout</div>
          </div>
          {vendor.status === "APPROVED" && vendor.payableBalance > 0 && (
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <div className="admin-input-group" style={{ flex: 1 }}>
                <span className="admin-input-prefix">৳</span>
                <input className="admin-input" type="number" placeholder="Amount to settle" value={payAmount} onChange={e => setPayAmount(e.target.value)} />
              </div>
              <button className="admin-btn admin-btn-primary" onClick={() => { if (payAmount) { settleVendorPayout(vendor.id, Number(payAmount)); setPayAmount(""); } }}>
                Settle
              </button>
            </div>
          )}
        </div>
        <div className="drawer-footer">
          {vendor.status === "PENDING" && (
            <button className="admin-btn admin-btn-primary" onClick={() => { approveVendor(vendor.id); onClose(); }}>
              <ShieldCheck size={14} /> Approve Vendor
            </button>
          )}
          {vendor.status === "APPROVED" && (
            <button className="admin-btn admin-btn-danger" onClick={() => { if (confirm("Suspend this vendor?")) { suspendVendor(vendor.id); onClose(); } }}>
              <ShieldX size={14} /> Suspend
            </button>
          )}
          {vendor.status === "SUSPENDED" && (
            <button className="admin-btn admin-btn-primary" onClick={() => { approveVendor(vendor.id); onClose(); }}>
              <ShieldCheck size={14} /> Reactivate
            </button>
          )}
          <button className="admin-btn admin-btn-secondary" onClick={onClose}>Close</button>
        </div>
      </div>
    </>
  );
}

export default function VendorsPage() {
  const { vendors } = useAdmin();
  const [selected, setSelected] = useState<AdminVendor | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const filtered = useMemo(() => vendors.filter(v => {
    const ms = !search || v.nameEn.toLowerCase().includes(search.toLowerCase()) || v.contactName.toLowerCase().includes(search.toLowerCase()) || v.area.toLowerCase().includes(search.toLowerCase());
    const mst = statusFilter === "ALL" || v.status === statusFilter;
    return ms && mst;
  }), [vendors, search, statusFilter]);

  const totalPayable = vendors.filter(v => v.status === "APPROVED").reduce((s, v) => s + v.payableBalance, 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "22px" }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Vendors</h1>
          <p className="page-subtitle">
            {vendors.filter(v => v.status === "APPROVED").length} approved · {vendors.filter(v => v.status === "PENDING").length} pending
            {totalPayable > 0 && <span style={{ color: "var(--amber)", marginLeft: "12px" }}>৳{totalPayable.toLocaleString()} payable</span>}
          </p>
        </div>
        <button className="admin-btn admin-btn-primary"><Plus size={14} /> Invite Vendor</button>
      </div>

      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
        <div className="search-wrap" style={{ flex: 1, minWidth: "220px" }}>
          <Search size={14} className="search-icon" />
          <input className="search-input" placeholder="Search vendor, contact, area…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="tab-bar">
          {["ALL", "APPROVED", "PENDING", "SUSPENDED"].map(s => (
            <button key={s} className={`tab-pill ${statusFilter === s ? "active" : ""}`} onClick={() => setStatusFilter(s)}>
              {s === "ALL" ? "All" : s.charAt(0) + s.slice(1).toLowerCase()}
              <span className="tab-count">{s === "ALL" ? vendors.length : vendors.filter(v => v.status === s).length}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="admin-card">
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Vendor</th>
                <th>Contact</th>
                <th>Area</th>
                <th>Total Sales</th>
                <th>Commission</th>
                <th>Payable</th>
                <th>Rating</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(v => (
                <tr key={v.id} className="clickable" onClick={() => setSelected(v)}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div style={{
                        width: "36px", height: "36px", borderRadius: "var(--r-md)",
                        background: "linear-gradient(135deg, var(--indigo), var(--purple))",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontWeight: 800, fontSize: "0.85rem", color: "#fff",
                      }}>
                        {v.nameEn[0]}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: "0.84rem" }}>{v.nameEn}</div>
                        <div style={{ fontSize: "0.70rem", color: "var(--text-3)" }}>{v.totalProducts} products</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div style={{ fontSize: "0.80rem" }}>{v.contactName}</div>
                    <div style={{ fontSize: "0.70rem", color: "var(--text-3)" }}>{v.phone}</div>
                  </td>
                  <td style={{ fontSize: "0.82rem" }}>{v.area}</td>
                  <td><span className="mono" style={{ color: "var(--green-bright)", fontWeight: 700 }}>৳{(v.totalSales / 1000).toFixed(0)}K</span></td>
                  <td style={{ fontSize: "0.82rem" }}>{v.commissionRate}%</td>
                  <td><span className="mono" style={{ color: v.payableBalance > 0 ? "var(--amber)" : "var(--text-3)" }}>৳{v.payableBalance.toLocaleString()}</span></td>
                  <td style={{ fontSize: "0.82rem" }}>{v.rating > 0 ? `⭐ ${v.rating.toFixed(1)}` : "—"}</td>
                  <td><span className={`status-badge ${v.status === "APPROVED" ? "success" : v.status === "PENDING" ? "warning" : "danger"}`}>{v.status}</span></td>
                  <td onClick={e => e.stopPropagation()}>
                    <button className="admin-btn admin-btn-ghost admin-btn-sm" onClick={() => setSelected(v)}><Eye size={13} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <div className="empty-state"><div className="empty-state-icon">🏪</div><div className="empty-state-title">No vendors found</div></div>}
        </div>
      </div>

      {selected && <VendorDrawer vendor={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
