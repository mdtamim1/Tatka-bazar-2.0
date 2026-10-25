"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Star,
  CornerDownRight,
  Send,
  ShieldAlert,
  CheckCircle,
  XCircle,
  RefreshCw,
  Loader2,
  MessageSquare,
  AlertCircle,
} from "lucide-react";
import { useVendorStore } from "@/store/vendorStore";
import { translations } from "@/utils/translations";
import { apiFetch } from "@/lib/api";

interface DBReview {
  id: string;
  rating: number;
  title: string;
  comment: string;
  vendorReply: string | null;
  productName: string;
  customerName: string;
  isVerified: boolean;
  createdAt: string;
}

interface ReviewsResponse {
  reviews: DBReview[];
  totalCount: number;
  avgRating: number;
  page: number;
  ratingDist: { star: number; count: number }[];
}

export default function ReviewsPage() {
  const {
    language,
    profile,
    refundDisputes,
    resolveRefundDispute,
  } = useVendorStore();
  const t = translations[language];

  const [activeTab, setActiveTab] = useState<"REVIEWS" | "REFUNDS">("REVIEWS");
  const [reviews, setReviews] = useState<DBReview[]>([]);
  const [avgRating, setAvgRating] = useState<number>(profile.rating || 5.0);
  const [totalReviews, setTotalReviews] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [activeReplyReviewId, setActiveReplyReviewId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [submittingReply, setSubmittingReply] = useState(false);

  const loadReviews = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch<ReviewsResponse>("/api/vendor-portal/reviews");
      if (res.success && res.data) {
        setReviews(res.data.reviews || []);
        setAvgRating(res.data.avgRating || 5.0);
        setTotalReviews(res.data.totalCount || 0);
      } else {
        setError(res.error || "রিভিউ লোড করতে ব্যর্থ হয়েছে।");
      }
    } catch {
      setError("নেটওয়ার্ক সমস্যা হয়েছে।");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  const handleSendReply = async (reviewId: string) => {
    if (!replyText.trim()) return;
    setSubmittingReply(true);
    try {
      const res = await apiFetch("/api/vendor-portal/reviews", {
        method: "POST",
        body: JSON.stringify({ reviewId, reply: replyText.trim() }),
      });

      if (!res.success) {
        alert(res.error || "উত্তর পাঠাতে সমস্যা হয়েছে।");
        return;
      }

      setReviews((prev) =>
        prev.map((r) =>
          r.id === reviewId ? { ...r, vendorReply: replyText.trim() } : r
        )
      );
      setActiveReplyReviewId(null);
      setReplyText("");
    } catch {
      alert("নেটওয়ার্ক ত্রুটি! আবার চেষ্টা করুন।");
    } finally {
      setSubmittingReply(false);
    }
  };

  return (
    <div className="page-content select-none">
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h1
            style={{
              fontSize: "1.15rem",
              fontWeight: 800,
              color: "var(--text-1)",
              fontFamily: "var(--font-bn)",
            }}
          >
            ⭐ {t.reviewsTitle}
          </h1>
          <p
            style={{
              fontSize: ".76rem",
              color: "var(--text-3)",
              fontFamily: "var(--font-bn)",
              marginTop: 2,
            }}
          >
            {t.reviewsSub}
          </p>
        </div>
        <button
          onClick={loadReviews}
          className="btn-secondary"
          style={{ width: "auto", padding: "8px 12px", fontSize: ".76rem", gap: 6 }}
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> রিফ্রেশ
        </button>
      </div>

      {error && (
        <div
          style={{
            background: "var(--red-glass)",
            border: "1px solid var(--red-glow)",
            borderRadius: 10,
            padding: "10px 14px",
            fontSize: ".80rem",
            color: "var(--red)",
            fontFamily: "var(--font-bn)",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {/* Scorecard Hero Card */}
      <div className="profile-hero" style={{ padding: "20px 16px" }}>
        <div
          style={{
            fontSize: "2.4rem",
            fontWeight: 900,
            color: "#fbbf24",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            lineHeight: 1,
          }}
        >
          <span>⭐</span>
          <span>{avgRating.toFixed(1)}</span>
        </div>
        <div
          style={{
            fontSize: ".82rem",
            fontWeight: 700,
            color: "var(--text-1)",
            fontFamily: "var(--font-bn)",
            marginTop: 8,
          }}
        >
          গড় গ্রাহক রেটিং ({totalReviews > 0 ? totalReviews : reviews.length} টি রিভিউ)
        </div>
        <div
          style={{
            fontSize: ".72rem",
            color: "var(--text-3)",
            fontFamily: "var(--font-bn)",
            marginTop: 4,
          }}
        >
          ১০০% সন্তুষ্টি গ্যারান্টি • টাটকা পণ্য ও সঠিক ওজন নিশ্চিত করুন
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
          {loading && reviews.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <Loader2 size={24} className="animate-spin text-emerald-500 mx-auto mb-2" />
              <div style={{ fontSize: ".82rem", color: "var(--text-3)", fontFamily: "var(--font-bn)" }}>
                ডাটাবেজ থেকে রিভিউ লোড হচ্ছে...
              </div>
            </div>
          ) : reviews.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">⭐</div>
              <div className="empty-state-title">কোনো রিভিউ নেই</div>
              <div className="empty-state-text">
                আপনার পণ্যের ওপর ক্রেতারা রিভিউ দিলে তা সরাসরি এখানে প্রদর্শিত হবে।
              </div>
            </div>
          ) : (
            reviews.map((rev) => (
              <div key={rev.id} className="task-card" style={{ padding: "16px", gap: 10 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: 8,
                  }}
                >
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span
                        style={{
                          fontWeight: 800,
                          color: "var(--text-1)",
                          fontSize: ".86rem",
                        }}
                      >
                        {rev.customerName}
                      </span>
                      {rev.isVerified && (
                        <span className="badge badge-emerald" style={{ fontSize: ".62rem" }}>
                          ✓ ভেরিফাইড ক্রয়
                        </span>
                      )}
                    </div>
                    <div
                      style={{
                        fontSize: ".74rem",
                        color: "var(--emerald)",
                        fontWeight: 700,
                        marginTop: 2,
                      }}
                    >
                      {rev.productName}
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
                      {new Date(rev.createdAt).toLocaleDateString("bn-BD")}
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    fontSize: ".80rem",
                    color: "var(--text-2)",
                    fontStyle: "italic",
                    background: "var(--bg-raised)",
                    padding: "10px 12px",
                    borderRadius: "var(--r-sm)",
                    border: "1px solid var(--border-1)",
                    lineHeight: 1.5,
                  }}
                >
                  &ldquo;{rev.comment}&rdquo;
                </div>

                {/* Vendor Reply Display */}
                {rev.vendorReply ? (
                  <div
                    style={{
                      paddingLeft: 12,
                      borderLeft: "2px solid var(--emerald)",
                      display: "flex",
                      flexDirection: "column",
                      gap: 4,
                    }}
                  >
                    <div
                      style={{
                        fontSize: ".72rem",
                        color: "var(--emerald)",
                        fontWeight: 700,
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      <CornerDownRight size={12} />
                      <span>{t.yourReply} (দোকানের উত্তর)</span>
                    </div>
                    <p style={{ fontSize: ".78rem", color: "var(--text-2)" }}>{rev.vendorReply}</p>
                  </div>
                ) : activeReplyReviewId === rev.id ? (
                  <div
                    style={{
                      paddingLeft: 12,
                      borderLeft: "2px solid var(--emerald)",
                      display: "flex",
                      flexDirection: "column",
                      gap: 8,
                      paddingTop: 6,
                    }}
                  >
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
                        disabled={submittingReply}
                      >
                        {t.cancelBtn}
                      </button>
                      <button
                        onClick={() => handleSendReply(rev.id)}
                        className="btn-primary"
                        style={{ width: "auto", padding: "6px 14px", fontSize: ".74rem" }}
                        disabled={submittingReply || !replyText.trim()}
                      >
                        {submittingReply ? (
                          <Loader2 size={12} className="animate-spin" />
                        ) : (
                          <Send size={12} />
                        )}
                        <span>{submittingReply ? "পাঠানো হচ্ছে..." : t.sendReplyBtn}</span>
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
              <div key={d.id} className="task-card" style={{ padding: "16px", gap: 10 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: 8,
                  }}
                >
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: ".82rem",
                          fontWeight: 800,
                          color: "var(--red)",
                        }}
                      >
                        #{d.displayId}
                      </span>
                      <span
                        className={`badge badge-${
                          d.status === "APPROVED"
                            ? "completed"
                            : d.status === "REJECTED"
                            ? "rejected"
                            : "pending"
                        }`}
                      >
                        {d.status}
                      </span>
                    </div>
                    <div
                      style={{
                        fontSize: ".76rem",
                        color: "var(--text-1)",
                        fontWeight: 700,
                        marginTop: 2,
                      }}
                    >
                      গ্রাহক: {d.customerName}
                    </div>
                  </div>

                  <div style={{ textAlign: "right" }}>
                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontWeight: 900,
                        fontSize: "1rem",
                        color: "var(--text-1)",
                      }}
                    >
                      দাবি: ৳{d.requestedAmount}
                    </span>
                  </div>
                </div>

                <div
                  style={{
                    padding: "10px 12px",
                    borderRadius: "var(--r-sm)",
                    background: "var(--bg-raised)",
                    border: "1px solid var(--border-1)",
                    fontSize: ".76rem",
                    color: "var(--text-2)",
                    fontFamily: "var(--font-bn)",
                  }}
                >
                  <strong>কারণ:</strong> {d.reason}
                </div>

                {d.status === "PENDING" && (
                  <div
                    style={{
                      display: "flex",
                      gap: 8,
                      justifyContent: "flex-end",
                      paddingTop: 4,
                    }}
                  >
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
