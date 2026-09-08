"use client";
import React from "react";
import { CreditCard } from "lucide-react";

export default function WithdrawalsPage() {
  return (
    <div className="hub-content">
      <div className="page-header">
        <h1 className="page-title"><CreditCard size={22} /><span className="font-bn">উইথড্রয়াল ম্যানেজমেন্ট</span></h1>
        <p className="page-subtitle font-bn">রাইডারদের উইথড্রয়াল অনুরোধ</p>
      </div>
      <div className="card">
        <div className="empty-state">
          <div className="empty-state-icon">💰</div>
          <div className="empty-state-title font-bn">কোনো উইথড্রয়াল অনুরোধ নেই</div>
          <p className="text-sm text-muted font-bn" style={{ marginTop: 8 }}>
            রাইডারদের উইথড্রয়াল অনুরোধ এখানে দেখাবে
          </p>
        </div>
      </div>
    </div>
  );
}
