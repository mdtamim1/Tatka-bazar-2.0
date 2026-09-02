"use client";

import React, { useState } from "react";
import { DollarSign, Download, Plus, Clock, CheckCircle, ArrowDownRight, CreditCard } from "lucide-react";
import { useVendor } from "@/context/VendorContext";

export default function VendorPayoutsPage() {
  const { currentVendor, orders, payouts, requestWithdrawal } = useVendor();

  const totalSales = orders.reduce((sum, o) => sum + o.subtotal, 0);
  const totalCommission = orders.reduce((sum, o) => sum + o.commissionDeducted, 0);
  const availableBalance = orders.reduce((sum, o) => sum + o.netEarnings, 0);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState(availableBalance);
  const [withdrawMethod, setWithdrawMethod] = useState<"bKash" | "Bank Transfer">("bKash");

  const handleWithdraw = (e: React.FormEvent) => {
    e.preventDefault();
    if (withdrawAmount <= 0) return;
    requestWithdrawal(withdrawAmount, withdrawMethod);
    setIsModalOpen(false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 style={{ fontSize: "1.4rem", fontWeight: 800, color: "var(--text-main)" }}>
            Payout Ledger & Financial Settlement
          </h1>
          <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginTop: "2px" }}>
            Running balance, commission deductions, and bank/bKash disbursement history
          </p>
        </div>

        <button onClick={() => setIsModalOpen(true)} className="vendor-btn vendor-btn-primary">
          <DollarSign size={16} />
          <span>Request Payout Withdrawal</span>
        </button>
      </div>

      {/* 3 Metric Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px" }}>
        
        <div className="vendor-card" style={{ padding: "20px" }}>
          <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 700 }}>Withdrawable Balance</div>
          <div style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--primary-dark)", marginTop: "4px" }}>
            ৳{availableBalance.toLocaleString()}
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--primary)", fontWeight: 700, marginTop: "4px" }}>
            ✓ Ready for Settlement
          </div>
        </div>

        <div className="vendor-card" style={{ padding: "20px" }}>
          <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 700 }}>Total Platform Commission (-{currentVendor.commissionRate}%)</div>
          <div style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--accent)", marginTop: "4px" }}>
            ৳{totalCommission.toLocaleString()}
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "4px" }}>
            Transparent & automated deduction
          </div>
        </div>

        <div className="vendor-card" style={{ padding: "20px" }}>
          <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 700 }}>Next Auto-Payout Cycle</div>
          <div style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--text-main)", marginTop: "4px" }}>
            25 August 2026
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "4px" }}>
            Weekly scheduled disbursement
          </div>
        </div>

      </div>

      {/* Payout History Table */}
      <div className="vendor-card">
        <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", fontWeight: 800 }}>
          Disbursement Transaction History
        </div>
        <table className="vendor-table">
          <thead>
            <tr>
              <th>Date & Reference</th>
              <th>Payout Method & Account</th>
              <th>Disbursed Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {payouts.map((pay) => (
              <tr key={pay.id}>
                <td>
                  <div style={{ fontWeight: 700 }}>{pay.date}</div>
                  <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                    Ref: {pay.referenceNo}
                  </div>
                </td>
                <td>
                  <div style={{ fontWeight: 600 }}>{pay.method}</div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{pay.accountDetails}</div>
                </td>
                <td>
                  <span style={{ fontWeight: 800, color: "var(--primary-dark)", fontSize: "1rem" }}>
                    ৳{pay.amount.toLocaleString()}
                  </span>
                </td>
                <td>
                  <span className={`status-badge ${pay.status === "COMPLETED" ? "success" : "warning"}`}>
                    {pay.status === "COMPLETED" ? "✓ Successfully Paid" : "Processing"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Withdrawal Request Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "440px" }}>
            <h2 style={{ fontSize: "1.2rem", fontWeight: 800, marginBottom: "8px" }}>
              💵 Request Payout Withdrawal
            </h2>
            <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginBottom: "16px" }}>
              Available Balance: ৳{availableBalance.toLocaleString()} (Net earnings after commission)
            </p>

            <form onSubmit={handleWithdraw} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={{ fontSize: "0.8rem", fontWeight: 700, display: "block", marginBottom: "4px" }}>
                  Disbursement Method
                </label>
                <select
                  value={withdrawMethod}
                  onChange={(e) => setWithdrawMethod(e.target.value as any)}
                  style={{ width: "100%", padding: "10px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-medium)", background: "#FFF" }}
                >
                  <option value="bKash">bKash Merchant Wallet</option>
                  <option value="Bank Transfer">Bank Account Transfer (BEFTN/NPSB)</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: "0.8rem", fontWeight: 700, display: "block", marginBottom: "4px" }}>
                  Withdrawal Amount (৳) *
                </label>
                <input
                  type="number"
                  required
                  max={availableBalance}
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(Number(e.target.value))}
                  style={{ width: "100%", padding: "10px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-medium)" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "8px" }}>
                <button type="button" onClick={() => setIsModalOpen(false)} className="vendor-btn vendor-btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="vendor-btn vendor-btn-primary">
                  Confirm Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
