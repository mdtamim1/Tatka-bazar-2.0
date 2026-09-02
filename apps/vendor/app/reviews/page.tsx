"use client";

import React from "react";
import { Star, MessageSquare } from "lucide-react";
import { useVendor } from "@/context/VendorContext";

export default function VendorReviewsPage() {
  const { currentVendor } = useVendor();

  const reviews = [
    {
      id: "rev-1",
      userName: "Tanvir Hasan",
      rating: 5,
      date: "20 Aug 2026",
      productName: "Organic Red Farm Tomatoes",
      comment: "The tomatoes were very fresh and flavorful. Packaging was intact and clean.",
    },
    {
      id: "rev-2",
      userName: "Farzana Haque",
      rating: 5,
      date: "19 Aug 2026",
      productName: "Fresh Desi Red Spinach (Lal Shak)",
      comment: "Ordered early morning and delivered by 8:00 AM. Greens were crisp and spotless.",
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <div>
        <h1 style={{ fontSize: "1.4rem", fontWeight: 800, color: "var(--text-main)" }}>
          Customer Reviews & Shop Ratings
        </h1>
        <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginTop: "2px" }}>
          Feedback and satisfaction scores from verified customers who bought your products.
        </p>
      </div>

      {/* Rating Score Card */}
      <div className="vendor-card" style={{ padding: "20px", display: "flex", alignItems: "center", gap: "24px" }}>
        <div style={{ textAlign: "center", borderRight: "1px solid var(--border-subtle)", paddingRight: "24px" }}>
          <div style={{ fontSize: "2.4rem", fontWeight: 800, color: "var(--text-main)", lineHeight: 1 }}>
            {currentVendor.rating}
          </div>
          <div style={{ display: "flex", gap: "2px", color: "var(--accent)", margin: "6px 0" }}>
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} size={16} fill="var(--accent)" />
            ))}
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
            {currentVendor.reviewsCount} Reviews
          </div>
        </div>

        <div style={{ flex: 1 }}>
          <h3 style={{ fontSize: "0.95rem", fontWeight: 700, marginBottom: "4px" }}>
            Customer Satisfaction & Trust Index
          </h3>
          <p style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>
            Over 98% of customers gave your store a 5-star rating. Keep providing farm-fresh quality and accurate weight.
          </p>
        </div>
      </div>

      {/* Reviews Table */}
      <div className="vendor-card">
        <table className="vendor-table">
          <thead>
            <tr>
              <th>Customer & Date</th>
              <th>Purchased Product</th>
              <th>Rating</th>
              <th>Comment</th>
            </tr>
          </thead>
          <tbody>
            {reviews.map((r) => (
              <tr key={r.id}>
                <td>
                  <div style={{ fontWeight: 700 }}>{r.userName}</div>
                  <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>{r.date}</div>
                </td>
                <td>
                  <span style={{ fontWeight: 600, fontSize: "0.82rem" }}>{r.productName}</span>
                </td>
                <td>
                  <div style={{ display: "flex", gap: "2px", color: "var(--accent)" }}>
                    {Array.from({ length: r.rating }).map((_, i) => (
                      <Star key={i} size={14} fill="var(--accent)" />
                    ))}
                  </div>
                </td>
                <td>
                  <p style={{ fontSize: "0.84rem", fontStyle: "italic", maxWidth: "420px" }}>"{r.comment}"</p>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
