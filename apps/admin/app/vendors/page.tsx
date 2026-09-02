"use client";

import React, { useState } from "react";
import {
  Store,
  CheckCircle,
  XCircle,
  AlertCircle,
  Search,
  DollarSign,
  Star,
  MapPin,
  FileText,
  ShieldCheck,
} from "lucide-react";
import { useAdmin } from "@/context/AdminContext";
import { AdminVendor } from "@/types";

export default function AdminVendorsPage() {
  const { vendors, approveVendor, suspendVendor, settleVendorPayout } = useAdmin();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const [payoutModalVendor, setPayoutModalVendor] = useState<AdminVendor | null>(null);
  const [payoutAmount, setPayoutAmount] = useState<number>(0);

  const filteredVendors = vendors.filter((v) => {
    if (filterStatus !== "all" && v.status !== filterStatus) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        (v.nameEn && v.nameEn.toLowerCase().includes(q)) ||
        (v.nameBn && v.nameBn.toLowerCase().includes(q)) ||
        v.contactName.toLowerCase().includes(q) ||
        v.phone.includes(q)
      );
    }
    return true;
  });

  const handleOpenPayout = (v: AdminVendor) => {
    setPayoutModalVendor(v);
    setPayoutAmount(v.payableBalance);
  };

  const handleConfirmPayout = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payoutModalVendor || payoutAmount <= 0) return;
    settleVendorPayout(payoutModalVendor.id, payoutAmount);
    setPayoutModalVendor(null);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 style={{ fontSize: "1.4rem", fontWeight: 800, color: "var(--text-main)" }}>
            Vendor Partner & Commission Management
          </h1>
          <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginTop: "2px" }}>
            Approve partner applications, set platform commission rates, and manage disbursement settlements
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="admin-card" style={{ padding: "14px 18px", display: "flex", gap: "14px", alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: 1, minWidth: "240px" }}>
          <Search size={16} color="var(--text-muted)" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by vendor name, owner, or trade license..."
            style={{ width: "100%", padding: "7px 12px 7px 36px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-medium)", outline: "none" }}
          />
        </div>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          style={{ padding: "7px 12px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-medium)", background: "#FFF" }}
        >
          <option value="all">All Vendor Statuses</option>
          <option value="PENDING">PENDING (New Application)</option>
          <option value="APPROVED">APPROVED (Active Partner)</option>
          <option value="SUSPENDED">SUSPENDED</option>
        </select>
      </div>

      {/* Vendors Table */}
      <div className="admin-card">
        <div style={{ overflowX: "auto" }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Shop Name & Location</th>
                <th>Owner & Contact</th>
                <th>Trade License</th>
                <th>Commission Rate</th>
                <th>Total Sales & Payable</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredVendors.map((v) => (
                <tr key={v.id}>
                  <td>
                    <div style={{ fontWeight: 800, color: "var(--text-main)" }}>{v.nameEn || v.nameBn}</div>
                    <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "3px", marginTop: "2px" }}>
                      <MapPin size={12} color="var(--accent)" />
                      <span>{v.location}</span>
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 700 }}>{v.contactName}</div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{v.phone}</div>
                    <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>{v.email}</div>
                  </td>
                  <td>
                    <span style={{ fontSize: "0.78rem", fontFamily: "var(--font-mono)", background: "#F1F5F9", padding: "2px 6px", borderRadius: "4px" }}>
                      {v.tradeLicense}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontWeight: 800, color: "var(--primary-dark)", fontSize: "0.9rem" }}>
                      {v.commissionRate}%
                    </span>
                  </td>
                  <td>
                    <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Sales: ৳{v.totalSales.toLocaleString()}</div>
                    <div style={{ fontWeight: 800, color: v.payableBalance > 0 ? "var(--accent)" : "var(--text-main)", fontSize: "0.95rem" }}>
                      Payable: ৳{v.payableBalance.toLocaleString()}
                    </div>
                  </td>
                  <td>
                    <span className={`status-badge ${v.status === "APPROVED" ? "success" : v.status === "PENDING" ? "warning" : "danger"}`}>
                      {v.status}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: "6px" }}>
                      {v.status === "PENDING" && (
                        <button
                          onClick={() => approveVendor(v.id)}
                          className="admin-btn admin-btn-primary"
                          style={{ padding: "5px 10px", fontSize: "0.75rem" }}
                        >
                          <CheckCircle size={14} />
                          <span>Approve</span>
                        </button>
                      )}

                      {v.status === "APPROVED" && (
                        <>
                          <button
                            onClick={() => handleOpenPayout(v)}
                            className="admin-btn admin-btn-secondary"
                            style={{ padding: "5px 8px", fontSize: "0.75rem" }}
                            title="Settle Payout"
                          >
                            <DollarSign size={14} color="var(--primary)" />
                            <span>Payout</span>
                          </button>
                          <button
                            onClick={() => suspendVendor(v.id)}
                            style={{ padding: "5px 8px", borderRadius: "6px", background: "#FEE2E2", color: "var(--danger)", fontSize: "0.75rem", fontWeight: 600 }}
                          >
                            Suspend
                          </button>
                        </>
                      )}

                      {v.status === "SUSPENDED" && (
                        <button
                          onClick={() => approveVendor(v.id)}
                          className="admin-btn admin-btn-primary"
                          style={{ padding: "5px 10px", fontSize: "0.75rem" }}
                        >
                          Reactivate
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Settle Payout Modal */}
      {payoutModalVendor && (
        <div className="modal-overlay" onClick={() => setPayoutModalVendor(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "440px" }}>
            <h2 style={{ fontSize: "1.15rem", fontWeight: 800, marginBottom: "8px" }}>
              💵 Settle Vendor Payout
            </h2>
            <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginBottom: "16px" }}>
              Confirm disbursement for {payoutModalVendor.nameEn || payoutModalVendor.nameBn}.
            </p>

            <form onSubmit={handleConfirmPayout} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={{ fontSize: "0.8rem", fontWeight: 700, display: "block", marginBottom: "4px" }}>
                  Disbursement Amount (৳) *
                </label>
                <input
                  type="number"
                  required
                  max={payoutModalVendor.payableBalance}
                  value={payoutAmount}
                  onChange={(e) => setPayoutAmount(Number(e.target.value))}
                  style={{ width: "100%", padding: "10px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-medium)" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "6px" }}>
                <button type="button" onClick={() => setPayoutModalVendor(null)} className="admin-btn admin-btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="admin-btn admin-btn-primary">
                  Confirm Settlement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
