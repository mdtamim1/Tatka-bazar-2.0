"use client";

import React, { useState } from "react";
import { DollarSign, CheckCircle2, Building, ShieldCheck, Wallet, ArrowRight } from "lucide-react";
import { useRider } from "@/context/RiderContext";

export default function RiderCashSummaryPage() {
  const { dailySummary, depositCashToHub, deliveries, currentRider } = useRider();
  const [depositedSuccess, setDepositedSuccess] = useState(false);

  const completedOrders = deliveries.filter((d) => d.status === "DELIVERED");

  const handleDeposit = () => {
    depositCashToHub();
    setDepositedSuccess(true);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      
      {/* Header */}
      <div>
        <h1 style={{ fontSize: "1.3rem", fontWeight: 800 }}>Daily Cash & Earnings Summary</h1>
        <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "2px" }}>
          {dailySummary.date} • {currentRider.assignedHubName}
        </p>
      </div>

      {/* Big Cash Card */}
      <div
        className="rider-card"
        style={{
          background: "linear-gradient(135deg, #0F172A 0%, #1E293B 100%)",
          color: "#FFFFFF",
          padding: "24px 20px",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: "0.82rem", color: "#94A3B8", fontWeight: 700 }}>Total In-Hand COD Cash</span>
          <span
            className="status-pill"
            style={{
              background: dailySummary.cashInHandToDeposit === 0 ? "rgba(34, 197, 94, 0.2)" : "rgba(245, 158, 11, 0.2)",
              color: dailySummary.cashInHandToDeposit === 0 ? "#4ADE80" : "#FBBF24",
            }}
          >
            {depositedSuccess ? "✓ Deposited to Hub" : "Cash In-Hand"}
          </span>
        </div>

        <div style={{ fontSize: "2.2rem", fontWeight: 800, color: "var(--neon-green)", lineHeight: 1 }}>
          ৳{dailySummary.totalCodCollected.toLocaleString()}
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", color: "#CBD5E1", borderTop: "1px solid rgba(255, 255, 255, 0.1)", paddingTop: "10px" }}>
          <span>Today's Deliveries: <strong>{dailySummary.completedCount} orders</strong></span>
          <span>Failed: <strong>{dailySummary.failedCount} orders</strong></span>
        </div>
      </div>

      {/* Rider Earnings Card */}
      <div className="rider-card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ padding: "10px", borderRadius: "10px", background: "var(--primary-light)", color: "var(--primary)" }}>
            <Wallet size={22} />
          </div>
          <div>
            <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", fontWeight: 700 }}>Today's Delivery Fee Earnings</div>
            <div style={{ fontSize: "1.3rem", fontWeight: 800, color: "var(--primary-dark)" }}>
              ৳{dailySummary.totalEarnings.toLocaleString()}
            </div>
          </div>
        </div>
        <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", textAlign: "right" }}>
          (৳60 per completed drop)
        </div>
      </div>

      {/* Orders Cash Breakdown */}
      <div className="rider-card">
        <h3 style={{ fontSize: "0.92rem", fontWeight: 800, borderBottom: "1px solid var(--border-subtle)", paddingBottom: "8px", marginBottom: "10px" }}>
          Order-by-Order Breakdown
        </h3>

        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {completedOrders.map((ord) => (
            <div key={ord.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.82rem", padding: "6px 0", borderBottom: "1px dashed var(--border-subtle)" }}>
              <div>
                <div style={{ fontWeight: 700 }}>{ord.orderNumber} ({ord.customerName})</div>
                <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>{ord.deliveredAt} • {ord.deliveryArea}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontWeight: 800, color: ord.isCod ? "var(--primary-dark)" : "#2563EB" }}>
                  {ord.isCod ? `+৳${ord.codAmountToCollect}` : "Prepaid"}
                </div>
                <div style={{ fontSize: "0.68rem", color: "var(--primary)" }}>✓ Collected</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Hub Deposit Action */}
      {!depositedSuccess && dailySummary.totalCodCollected > 0 && (
        <button
          onClick={handleDeposit}
          className="rider-btn rider-btn-primary"
          style={{ padding: "14px", fontSize: "1rem" }}
        >
          <Building size={18} />
          <span>Confirm Cash Deposit at Hub</span>
        </button>
      )}

      {depositedSuccess && (
        <div style={{ background: "var(--primary-light)", padding: "12px", borderRadius: "var(--radius-md)", textAlign: "center", color: "var(--primary-hover)", fontWeight: 800, fontSize: "0.85rem" }}>
          ✓ Today's cash has been successfully deposited at {currentRider.assignedHubName}!
        </div>
      )}

    </div>
  );
}
