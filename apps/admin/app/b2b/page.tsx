"use client";

import React, { useState } from "react";
import { Building2, CheckCircle, XCircle, Search, DollarSign, FileText, ShieldCheck } from "lucide-react";
import { useAdmin } from "@/context/AdminContext";
import { AdminB2BAccount } from "@/types";

export default function AdminB2BPage() {
  const { b2bAccounts, approveB2BAccount, rejectB2BAccount } = useAdmin();
  const [selectedB2B, setSelectedB2B] = useState<AdminB2BAccount | null>(null);
  const [creditLimitInput, setCreditLimitInput] = useState<number>(200000);

  const handleApprove = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedB2B) return;
    approveB2BAccount(selectedB2B.id, creditLimitInput);
    setSelectedB2B(null);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <div>
        <h1 style={{ fontSize: "1.4rem", fontWeight: 800, color: "var(--text-main)" }}>
          B2B প্রাতিষ্ঠানিক অ্যাকাউন্ট ও কোটেশন কন্ট্রোল
        </h1>
        <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginTop: "2px" }}>
          রেস্তোরাঁ ও করপোরেট ক্লায়েন্টদের ট্রেড লাইসেন্স যাচাই, ক্রেডিট লিমিট নির্ধারণ ও বাল্ক কোটেশন
        </p>
      </div>

      <div className="admin-card">
        <table className="admin-table">
          <thead>
            <tr>
              <th>প্রতিষ্ঠানের নাম</th>
              <th>যোগাযোগকারী ও মোবাইল</th>
              <th>ট্রেড লাইসেন্স</th>
              <th>প্রয়োজনীয় ক্যাটাগরি ও চাহিদা</th>
              <th>ক্রেডিট লিমিট</th>
              <th>স্ট্যাটাস</th>
              <th>অ্যাকশন</th>
            </tr>
          </thead>
          <tbody>
            {b2bAccounts.map((acc) => (
              <tr key={acc.id}>
                <td>
                  <div style={{ fontWeight: 800 }}>{acc.companyName}</div>
                  <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>আবেদন: {acc.appliedDate}</div>
                </td>
                <td>
                  <div style={{ fontWeight: 600 }}>{acc.contactPerson}</div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{acc.phone}</div>
                </td>
                <td>
                  <span style={{ fontSize: "0.75rem", fontFamily: "var(--font-mono)", background: "#F1F5F9", padding: "2px 6px", borderRadius: "4px" }}>
                    {acc.tradeLicense}
                  </span>
                </td>
                <td>
                  <div style={{ fontSize: "0.8rem", fontWeight: 600 }}>{acc.categoryNeeded}</div>
                  <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>মাসিক চাহিদা: {acc.monthlyVolume}</div>
                </td>
                <td>
                  <span style={{ fontWeight: 800, color: acc.creditLimit > 0 ? "var(--primary-dark)" : "var(--text-muted)" }}>
                    {acc.creditLimit > 0 ? `৳${acc.creditLimit.toLocaleString()}` : "প্রযোজ্য নয়"}
                  </span>
                </td>
                <td>
                  <span className={`status-badge ${acc.status === "APPROVED" ? "success" : acc.status === "PENDING" ? "warning" : "danger"}`}>
                    {acc.status}
                  </span>
                </td>
                <td>
                  <div style={{ display: "flex", gap: "6px" }}>
                    {acc.status === "PENDING" && (
                      <>
                        <button
                          onClick={() => {
                            setSelectedB2B(acc);
                            setCreditLimitInput(200000);
                          }}
                          className="admin-btn admin-btn-primary"
                          style={{ padding: "5px 10px", fontSize: "0.75rem" }}
                        >
                          <CheckCircle size={14} />
                          <span>অনুমোদন ও ক্রেডিট</span>
                        </button>
                        <button
                          onClick={() => rejectB2BAccount(acc.id)}
                          style={{ padding: "5px 8px", borderRadius: "6px", background: "#FEE2E2", color: "var(--danger)", fontSize: "0.75rem" }}
                        >
                          বাতিল
                        </button>
                      </>
                    )}
                    {acc.status === "APPROVED" && (
                      <span style={{ fontSize: "0.75rem", color: "var(--primary)", fontWeight: 700 }}>
                        ✓ পাইকারি আনলকড
                      </span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Credit Limit Approval Modal */}
      {selectedB2B && (
        <div className="modal-overlay" onClick={() => setSelectedB2B(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "440px" }}>
            <h2 style={{ fontSize: "1.15rem", fontWeight: 800, marginBottom: "8px" }}>
              🏢 B2B অ্যাকাউন্ট অনুমোদন ও ক্রেডিট লিমিট
            </h2>
            <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginBottom: "16px" }}>
              {selectedB2B.companyName} কে অনুমোদনের সাথে সাথে স্টোরফ্রন্টে পাইকারি রেট আনলক হবে।
            </p>

            <form onSubmit={handleApprove} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={{ fontSize: "0.8rem", fontWeight: 700, display: "block", marginBottom: "4px" }}>
                  ক্রেডিট লিমিট সীমা (৳) *
                </label>
                <input
                  type="number"
                  required
                  value={creditLimitInput}
                  onChange={(e) => setCreditLimitInput(Number(e.target.value))}
                  style={{ width: "100%", padding: "10px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-medium)" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "6px" }}>
                <button type="button" onClick={() => setSelectedB2B(null)} className="admin-btn admin-btn-secondary">বাতিল</button>
                <button type="submit" className="admin-btn admin-btn-primary">অনুমোদন নিশ্চিত করুন</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
