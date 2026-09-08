"use client";
import React from "react";
import { CreditCard } from "lucide-react";

export default function WithdrawalsPage() {
  return (
    <div className="hub-content">
      <div className="page-header">
        <h1 className="page-title"><CreditCard size={22} /><span>Withdrawal Management</span></h1>
        <p className="page-subtitle">Rider payout and withdrawal requests</p>
      </div>
      <div className="card">
        <div className="empty-state">
          <div className="empty-state-icon">💰</div>
          <div className="empty-state-title">No withdrawal requests</div>
          <p className="text-sm text-muted" style={{ marginTop: 8 }}>
            Rider withdrawal requests will appear here
          </p>
        </div>
      </div>
    </div>
  );
}
