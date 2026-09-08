"use client";

import React, { useState } from "react";
import { Star, Check, X, Eye } from "lucide-react";
import { useAdmin } from "@/context/AdminContext";

function Stars({ n }: { n: number }) {
  return (
    <span>
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} size={12} fill={i <= n ? "var(--amber)" : "none"} color={i <= n ? "var(--amber)" : "var(--text-4)"} style={{ display: "inline" }} />
      ))}
    </span>
  );
}

export default function ReviewsPage() {
  const { reviews, moderateReview } = useAdmin();
  const [filter, setFilter] = useState<"ALL" | "PENDING" | "APPROVED" | "REJECTED">("PENDING");

  const filtered = reviews.filter(r => filter === "ALL" || r.status === filter);
  const pending = reviews.filter(r => r.status === "PENDING").length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "22px" }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Reviews & Ratings</h1>
          <p className="page-subtitle">{reviews.length} reviews · {pending} awaiting moderation</p>
        </div>
      </div>

      <div className="tab-bar">
        {[
          { key: "PENDING", label: "Pending", count: pending },
          { key: "APPROVED", label: "Approved", count: reviews.filter(r => r.status === "APPROVED").length },
          { key: "REJECTED", label: "Rejected", count: reviews.filter(r => r.status === "REJECTED").length },
          { key: "ALL", label: "All", count: reviews.length },
        ].map(t => (
          <button key={t.key} className={`tab-pill ${filter === t.key ? "active" : ""}`} onClick={() => setFilter(t.key as any)}>
            {t.label} <span className="tab-count">{t.count}</span>
          </button>
        ))}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {filtered.map(r => (
          <div key={r.id} className="admin-card" style={{ padding: "18px", border: r.status === "PENDING" ? "1px solid var(--border-amber)" : undefined }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px" }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px", flexWrap: "wrap" }}>
                  <div style={{ fontWeight: 700, fontSize: "0.84rem", color: "var(--text-1)" }}>{r.userName}</div>
                  <Stars n={r.rating} />
                  <span style={{ fontSize: "0.70rem", color: "var(--text-3)" }}>{r.date}</span>
                  <span className={`status-badge ${r.status === "APPROVED" ? "success" : r.status === "PENDING" ? "warning" : "danger"}`}>{r.status}</span>
                </div>
                <div style={{ fontSize: "0.75rem", color: "var(--green)", marginBottom: "8px", display: "flex", alignItems: "center", gap: "4px" }}>
                  <Star size={10} /> {r.productName}
                </div>
                <div style={{
                  fontSize: "0.84rem", color: "var(--text-2)", lineHeight: 1.6,
                  background: "var(--bg-elevated)", borderRadius: "var(--r-md)",
                  padding: "10px 12px", borderLeft: "3px solid var(--border-1)",
                }}>
                  &ldquo;{r.comment}&rdquo;
                </div>
              </div>
              {r.status === "PENDING" && (
                <div style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
                  <button className="admin-btn admin-btn-primary admin-btn-sm" onClick={() => moderateReview(r.id, "APPROVED")}>
                    <Check size={13} /> Approve
                  </button>
                  <button className="admin-btn admin-btn-danger admin-btn-sm" onClick={() => moderateReview(r.id, "REJECTED")}>
                    <X size={13} /> Reject
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="admin-card">
            <div className="empty-state">
              <div className="empty-state-icon">⭐</div>
              <div className="empty-state-title">{filter === "PENDING" ? "No reviews awaiting moderation" : "No reviews found"}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
