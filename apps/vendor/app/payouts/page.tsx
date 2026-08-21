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
            পে-আউট লেজার ও ফাইন্যান্সিয়াল সেটেলমেন্ট
          </h1>
          <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginTop: "2px" }}>
            রানিং ব্যালেন্স, প্ল্যাটফর্ম কমিশন কর্তন ও ব্যাংক/বিকাশ উইথড্রয়াল হিস্ট্রি
          </p>
        </div>

        <button onClick={() => setIsModalOpen(true)} className="vendor-btn vendor-btn-primary">
          <DollarSign size={16} />
          <span>উইথড্রয়াল রিকোয়েস্ট পাঠান</span>
        </button>
      </div>

      {/* 3 Metric Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px" }}>
        
        <div className="vendor-card" style={{ padding: "20px" }}>
          <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 700 }}>উত্তোলনযোগ্য ব্যালেন্স</div>
          <div style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--primary-dark)", marginTop: "4px" }}>
            ৳{availableBalance.toLocaleString()}
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--primary)", fontWeight: 700, marginTop: "4px" }}>
            ✓ রেডি ফর সেটেলমেন্ট
          </div>
        </div>

        <div className="vendor-card" style={{ padding: "20px" }}>
          <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 700 }}>মোট প্ল্যাটফর্ম কমিশন (-{currentVendor.commissionRate}%)</div>
          <div style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--accent)", marginTop: "4px" }}>
            ৳{totalCommission.toLocaleString()}
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "4px" }}>
            স্বচ্ছ ও স্বয়ংক্রিয় কর্তন
          </div>
        </div>

        <div className="vendor-card" style={{ padding: "20px" }}>
          <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 700 }}>পরবর্তী অটো-পেআউট শিডিউল</div>
          <div style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--text-main)", marginTop: "4px" }}>
            ২৫ আগস্ট ২০২৬
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "4px" }}>
            সাপ্তাহিক নিয়মিত পরিশোধ চক্র
          </div>
        </div>

      </div>

      {/* Payout History Table */}
      <div className="vendor-card">
        <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", fontWeight: 800 }}>
          বিগত পে-আউট লেনদেনের বিবরণ
        </div>
        <table className="vendor-table">
          <thead>
            <tr>
              <th>তারিখ ও রেফারেন্স</th>
              <th>পরিশোধের মাধ্যম ও অ্যাকাউন্ট</th>
              <th>পরিশোধিত পরিমাণ</th>
              <th>স্ট্যাটাস</th>
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
                    {pay.status === "COMPLETED" ? "✓ সফলভাবে পরিশোধিত" : "প্রক্রিয়াধীন"}
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
              💵 পে-আউট উইথড্রয়াল রিকোয়েস্ট
            </h2>
            <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginBottom: "16px" }}>
              বর্তমান ব্যালেন্স: ৳{availableBalance.toLocaleString()} (কমিশন কর্তন পরবর্তী নেট আয়)
            </p>

            <form onSubmit={handleWithdraw} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={{ fontSize: "0.8rem", fontWeight: 700, display: "block", marginBottom: "4px" }}>
                  উত্তোলনের মাধ্যম
                </label>
                <select
                  value={withdrawMethod}
                  onChange={(e) => setWithdrawMethod(e.target.value as any)}
                  style={{ width: "100%", padding: "10px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-medium)", background: "#FFF" }}
                >
                  <option value="bKash">বিকাশ মার্চেন্ট ওয়ালেট (bKash)</option>
                  <option value="Bank Transfer">ব্যাংক অ্যাকাউন্ট ট্রান্সফার (BEFTN/NPSB)</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: "0.8rem", fontWeight: 700, display: "block", marginBottom: "4px" }}>
                  উত্তোলনের পরিমাণ (৳) *
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
                  বাতিল
                </button>
                <button type="submit" className="vendor-btn vendor-btn-primary">
                  রিকোয়েস্ট নিশ্চিত করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
