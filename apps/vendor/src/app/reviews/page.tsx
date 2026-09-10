"use client";

import React, { useState } from "react";
import {
  Star,
  CornerDownRight,
  Send,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ShieldAlert,
} from "lucide-react";
import { useVendorStore } from "@/store/vendorStore";
import { translations } from "@/utils/translations";

export default function ReviewsPage() {
  const {
    language,
    profile,
    reviews,
    refundDisputes,
    replyToReview,
    resolveRefundDispute,
  } = useVendorStore();
  const t = translations[language];

  const [activeTab, setActiveTab] = useState<"REVIEWS" | "REFUNDS">("REVIEWS");
  const [activeReplyReviewId, setActiveReplyReviewId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  const handleSendReply = (reviewId: string) => {
    if (!replyText.trim()) return;
    replyToReview(reviewId, replyText);
    setActiveReplyReviewId(null);
    setReplyText("");
  };

  const avgRating = profile.rating || 5.0;

  return (
    <div className="page-content select-none">
      {/* Header */}
      <div>
        <h1 style={{ fontSize: "1.15rem", fontWeight: 800, color: "var(--text-1)", fontFamily: "var(--font-bn)" }}>
          ⭐ {t.reviewsTitle}
        </h1>
        <p style={{ fontSize: ".76rem", color: "var(--text-3)", fontFamily: "var(--font-bn)", marginTop: 2 }}>
          {t.reviewsSub}
        </p>
      </div>

      {/* Scorecard Hero Card (Rider Style) */}
      <div className="profile-hero" style={{ padding: "20px 16px" }}>
        <div style={{ fontSize: "2.4rem", fontWeight: 900, color: "#fbbf24", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, lineHeight: 1 }}>
          <span>⭐</span>
          <span>{avgRating.toFixed(1)}</span>
        </div>
        <div style={{ fontSize: ".82rem", fontWeight: 700, color: "var(--text-1)", fontFamily: "var(--font-bn)", marginTop: 8 }}>
          গড় গ্রাহক রেটিং ({reviews.length} টি রিভিউ)
        </div>
        <div style={{ fontSize: ".72rem", color: "var(--text-3)", fontFamily: "var(--font-bn)", marginTop: 4 }}>
          ১০০% সন্তুষ্টি গ্যারান্টি • দ্রুত ডেলিভারি ও মানসম্পন্ন পণ্য
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="tab-bar">
        <button
          className={`tab-btn${activeTab === "REVIEWS" ? " active" : ""}`}
          onClick={() => setActiveTab("REVIEWS")}
        >
          ⭐ {t.tabReviews} ({reviews.length})
        </button>
        <button
          className={`tab-btn${activeTab === "REFUNDS" ? " active" : ""}`}
          onClick={() => setActiveTab("REFUNDS")}
        >
          ⚠️ {t.tabRefunds} ({refundDisputes.length})
        </button>
      </div>

      {activeTab === "REVIEWS" ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {reviews.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">⭐</div>
              <div className="empty-state-title">কোনো রিভিউ নেই</div>
              <div className="empty-state-text">গ্রাহকদের কাছ থেকে রিভিউ পাওয়া গেলে এখানে প্রদর্শিত হবে।</div>
            </div>
          ) : (
            reviews.map((rev) => (
              <div
                key={rev.id}
                className="task-card"
                style={{ padding: "16px", gap: 10 }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ fontWeight: 800, color: "var(--text-1)", fontSize: ".86rem" }}>
                        {rev.customerName}
                      </span>
                      {rev.verifiedPurchase && (
                        <span className="badge badge-emerald" style={{ fontSize: ".62rem" }}>
                          ✓ ভেরিফাইড
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: ".74rem", color: "var(--emerald)", fontWeight: 700, marginTop: 2 }}>
                      {language === "bn" ? rev.productNameBn : rev.productName}
                    </div>
                  </div>

                  <div style={{ textAlign: "right" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={13}
                          className={
                            i < rev.rating
                              ? "text-amber-400 fill-amber-400"
                              : "text-slate-600"
                          }
                        />
                      ))}
                    </div>
                    <div style={{ fontSize: ".68rem", color: "var(--text-3)", marginTop: 3 }}>
                      {rev.date}
                    </div>
                  </div>
                </div>

                <div style={{
                  fontSize: ".80rem",
                  color: "var(--text-2)",
                  fontStyle: "italic",
                  background: "var(--bg-raised)",
                  padding: "10px 12px",
                  borderRadius: "var(--r-sm)",
                  border: "1px solid var(--border-1)",
                  lineHeight: 1.5,
                }}>
                  "{rev.comment}"
                </div>

                {/* Vendor Reply */}
                {rev.vendorReply ? (
                  <div style={{
                    paddingLeft: 12,
                    borderLeft: "2px solid var(--emerald)",
                    display: "flex",
                    flexDirection: "column",
                    gap: 4,
                  }}>
                    <div style={{ fontSize: ".72rem", color: "var(--emerald)", fontWeight: 700, display: "flex", alignItems: "center", gap: 4 }}>
                      <CornerDownRight size={12} />
                      <span>{t.yourReply}</span>
                      <span style={{ color: "var(--text-3)", fontWeight: 400 }}>
                        ({new Date(rev.vendorReply.repliedAt).toLocaleDateString()})
                      </span>
                    </div>
                    <p style={{ fontSize: ".78rem", color: "var(--text-2)" }}>{rev.vendorReply.message}</p>
                  </div>
                ) : activeReplyReviewId === rev.id ? (
                  <div style={{
                    paddingLeft: 12,
                    borderLeft: "2px solid var(--emerald)",
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                    paddingTop: 6,
                  }}>
                    <textarea
                      rows={2}
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="গ্রাহকের প্রতি আপনার প্রতিক্রিয়া লিখুন..."
                      className="form-input"
                      style={{ fontSize: ".78rem", padding: "8px 10px" }}
                    />
                    <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                      <button
                        onClick={() => setActiveReplyReviewId(null)}
                        className="btn-secondary"
                        style={{ width: "auto", padding: "6px 12px", fontSize: ".74rem" }}
                      >
                        {t.cancelBtn}
                      </button>
                      <button
                        onClick={() => handleSendReply(rev.id)}
                        className="btn-primary"
                        style={{ width: "auto", padding: "6px 14px", fontSize: ".74rem" }}
                      >
                        <Send size={12} />
                        <span>{t.sendReplyBtn}</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <button
                      onClick={() => {
                        setActiveReplyReviewId(rev.id);
                        setReplyText("");
                      }}
                      style={{
                        fontSize: ".74rem",
                        color: "var(--emerald)",
                        fontWeight: 700,
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4,
                        fontFamily: "var(--font-bn)",
                      }}
                    >
                      <CornerDownRight size={13} />
                      <span>{t.replyBtn}</span>
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      ) : (
        /* Return / Refund Queue */
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {refundDisputes.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">✅</div>
              <div className="empty-state-title">কোনো রিফান্ড বা বিরোধ নেই</div>
              <div className="empty-state-text">সমস্ত অর্ডার স্বাভাবিকভাবে ডেলিভারি হয়েছে।</div>
            </div>
          ) : (
            refundDisputes.map((d) => (
              <div
                key={d.id}
                className="task-card"
                style={{ padding: "16px", gap: 10 }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: ".82rem", fontWeight: 800, color: "var(--red)" }}>
                        #{d.displayId}
                      </span>
                      <span className={`badge badge-${d.status === "APPROVED" ? "completed" : d.status === "REJECTED" ? "rejected" : "pending"}`}>
                        {d.status}
                      </span>
                    </div>
                    <div style={{ fontSize: ".76rem", color: "var(--text-1)", fontWeight: 700, marginTop: 2 }}>
                      গ্রাহক: {d.customerName}
                    </div>
                  </div>

                  <div style={{ textAlign: "right" }}>
                    <span style={{ fontFamily: "var(--font-mono)", fontWeight: 900, fontSize: "1rem", color: "var(--text-1)" }}>
                      দাবি: ৳{d.requestedAmount}
                    </span>
                  </div>
                </div>

                <div style={{
                  padding: "10px 12px",
                  borderRadius: "var(--r-sm)",
                  background: "var(--bg-raised)",
                  border: "1px solid var(--border-1)",
                  fontSize: ".76rem",
                  color: "var(--text-2)",
                  fontFamily: "var(--font-bn)",
                }}>
                  <strong>কারণ:</strong> {d.reason}
                </div>

                {d.status === "PENDING" && (
                  <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", paddingTop: 4 }}>
                    <button
                      onClick={() => resolveRefundDispute(d.id, "ESCALATED")}
                      className="btn-secondary"
                      style={{ width: "auto", padding: "8px 12px", fontSize: ".74rem" }}
                    >
                      <ShieldAlert size={13} />
                      <span>{t.escalateDisputeBtn}</span>
                    </button>

                    <button
                      onClick={() => resolveRefundDispute(d.id, "REJECTED")}
                      className="btn-danger"
                      style={{ width: "auto", padding: "8px 12px", fontSize: ".74rem" }}
                    >
                      <XCircle size={13} />
                      <span>{t.rejectRefundBtn}</span>
                    </button>

                    <button
                      onClick={() => resolveRefundDispute(d.id, "APPROVED")}
                      className="btn-primary"
                      style={{ width: "auto", padding: "8px 14px", fontSize: ".74rem" }}
                    >
                      <CheckCircle size={13} />
                      <span>{t.approveRefundBtn}</span>
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
