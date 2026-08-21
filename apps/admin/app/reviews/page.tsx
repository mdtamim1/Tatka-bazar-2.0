"use client";

import React from "react";
import { Star, CheckCircle, XCircle, MessageSquare } from "lucide-react";
import { useAdmin } from "@/context/AdminContext";

export default function AdminReviewsPage() {
  const { reviews, moderateReview } = useAdmin();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <div>
        <h1 style={{ fontSize: "1.4rem", fontWeight: 800, color: "var(--text-main)" }}>
          গ্রাহক রিভিউ ও ফিডব্যাক মডারেশন
        </h1>
        <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginTop: "2px" }}>
          স্টোরফ্রন্টে প্রকাশের পূর্বে পণ্য ও ভেন্ডর রিভিউ যাচাইকরণ ও রিপ্লাই
        </p>
      </div>

      <div className="admin-card">
        <table className="admin-table">
          <thead>
            <tr>
              <th>পণ্যের নাম</th>
              <th>গ্রাহক ও তারিখ</th>
              <th>রেটিং</th>
              <th>গ্রাহকের মন্তব্য (Review)</th>
              <th>স্ট্যাটাস</th>
              <th>অ্যাকশন</th>
            </tr>
          </thead>
          <tbody>
            {reviews.map((rev) => (
              <tr key={rev.id}>
                <td>
                  <span style={{ fontWeight: 700, color: "var(--text-main)" }}>{rev.productName}</span>
                </td>
                <td>
                  <div style={{ fontWeight: 600 }}>{rev.userName}</div>
                  <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>{rev.date}</div>
                </td>
                <td>
                  <div style={{ display: "flex", gap: "2px", color: "var(--accent)" }}>
                    {Array.from({ length: rev.rating }).map((_, i) => (
                      <Star key={i} size={14} fill="var(--accent)" />
                    ))}
                  </div>
                </td>
                <td>
                  <p style={{ fontSize: "0.85rem", fontStyle: "italic", maxWidth: "340px" }}>"{rev.comment}"</p>
                </td>
                <td>
                  <span className={`status-badge ${rev.status === "APPROVED" ? "success" : rev.status === "PENDING" ? "warning" : "danger"}`}>
                    {rev.status}
                  </span>
                </td>
                <td>
                  <div style={{ display: "flex", gap: "6px" }}>
                    {rev.status !== "APPROVED" && (
                      <button
                        onClick={() => moderateReview(rev.id, "APPROVED")}
                        className="admin-btn admin-btn-primary"
                        style={{ padding: "4px 8px", fontSize: "0.72rem" }}
                      >
                        <CheckCircle size={13} />
                        <span>অনুমোদন</span>
                      </button>
                    )}
                    {rev.status !== "REJECTED" && (
                      <button
                        onClick={() => moderateReview(rev.id, "REJECTED")}
                        style={{ padding: "4px 8px", borderRadius: "6px", background: "#FEE2E2", color: "var(--danger)", fontSize: "0.72rem", fontWeight: 600 }}
                      >
                        বাতিল
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
  );
}
