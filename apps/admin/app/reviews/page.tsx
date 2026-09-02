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
          Customer Reviews & Moderation
        </h1>
        <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginTop: "2px" }}>
          Verify and moderate product feedback and customer ratings before publishing to storefront
        </p>
      </div>

      <div className="admin-card">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Product Name</th>
              <th>Customer & Date</th>
              <th>Rating</th>
              <th>Customer Review</th>
              <th>Status</th>
              <th>Actions</th>
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
                        <span>Approve</span>
                      </button>
                    )}
                    {rev.status !== "REJECTED" && (
                      <button
                        onClick={() => moderateReview(rev.id, "REJECTED")}
                        style={{ padding: "4px 8px", borderRadius: "6px", background: "#FEE2E2", color: "var(--danger)", fontSize: "0.72rem", fontWeight: 600 }}
                      >
                        Reject
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
