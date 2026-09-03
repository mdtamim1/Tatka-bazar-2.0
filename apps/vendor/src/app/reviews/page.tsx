"use client";

import React, { useState } from "react";
import {
  MessageSquareDiff,
  Star,
  CornerDownRight,
  Send,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ShieldAlert,
  X,
} from "lucide-react";
import { useVendorStore } from "@/store/vendorStore";
import { translations } from "@/utils/translations";

export default function ReviewsPage() {
  const {
    language,
    reviews,
    refundDisputes,
    replyToReview,
    resolveRefundDispute,
  } = useVendorStore();
  const t = translations[language];

  const [activeTab, setActiveTab] = useState<"REVIEWS" | "REFUNDS">("REVIEWS");
  const [activeReplyReviewId, setActiveReplyReviewId] = useState<string | null>(
    null
  );
  const [replyText, setReplyText] = useState("");

  const handleSendReply = (reviewId: string) => {
    if (!replyText.trim()) return;
    replyToReview(reviewId, replyText);
    setActiveReplyReviewId(null);
    setReplyText("");
  };

  return (
    <div className="space-y-6 select-none">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight">
          {t.reviewsTitle}
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">{t.reviewsSub}</p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#20333B] pb-2 text-xs">
        <button
          onClick={() => setActiveTab("REVIEWS")}
          className={`px-3 py-1.5 rounded-lg font-semibold transition-colors flex items-center gap-1.5 ${
            activeTab === "REVIEWS"
              ? "bg-emerald-600 text-white"
              : "bg-[#111C20] text-slate-400 hover:text-white border border-[#20333B]"
          }`}
        >
          <Star size={14} />
          <span>{t.tabReviews} ({reviews.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("REFUNDS")}
          className={`px-3 py-1.5 rounded-lg font-semibold transition-colors flex items-center gap-1.5 ${
            activeTab === "REFUNDS"
              ? "bg-emerald-600 text-white"
              : "bg-[#111C20] text-slate-400 hover:text-white border border-[#20333B]"
          }`}
        >
          <AlertTriangle size={14} />
          <span>{t.tabRefunds} ({refundDisputes.length})</span>
        </button>
      </div>

      {activeTab === "REVIEWS" ? (
        <div className="space-y-4">
          {reviews.map((rev) => (
            <div
              key={rev.id}
              className="p-5 rounded-xl bg-[#111C20] border border-[#20333B] space-y-3 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-100 text-sm">
                      {rev.customerName}
                    </span>
                    {rev.verifiedPurchase && (
                      <span className="badge-emerald text-[10px]">
                        Verified Buyer
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-medium text-emerald-400 mt-0.5">
                    {language === "bn" ? rev.productNameBn : rev.productName}
                  </p>
                </div>

                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      className={
                        i < rev.rating
                          ? "text-amber-400 fill-amber-400"
                          : "text-slate-600"
                      }
                    />
                  ))}
                  <span className="text-[11px] text-slate-400 ml-2">
                    {rev.date}
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-300 italic bg-[#152227] p-3 rounded-lg border border-[#20333B]/70">
                "{rev.comment}"
              </p>

              {/* Vendor Reply if exists */}
              {rev.vendorReply ? (
                <div className="pl-4 border-l-2 border-emerald-500 py-1 space-y-1">
                  <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-semibold">
                    <CornerDownRight size={13} />
                    <span>{t.yourReply}</span>
                    <span className="text-[10px] text-slate-500 font-normal">
                      ({new Date(rev.vendorReply.repliedAt).toLocaleDateString()})
                    </span>
                  </div>
                  <p className="text-xs text-slate-300">{rev.vendorReply.message}</p>
                </div>
              ) : activeReplyReviewId === rev.id ? (
                <div className="pl-4 border-l-2 border-emerald-500 pt-2 space-y-2">
                  <textarea
                    rows={2}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Write your professional response to the customer..."
                    className="w-full bg-[#0E171B] border border-[#20333B] rounded-lg p-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                  <div className="flex items-center gap-2 justify-end">
                    <button
                      onClick={() => setActiveReplyReviewId(null)}
                      className="px-2.5 py-1 text-xs text-slate-400 hover:text-white"
                    >
                      {t.cancelBtn}
                    </button>
                    <button
                      onClick={() => handleSendReply(rev.id)}
                      className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-bold flex items-center gap-1"
                    >
                      <Send size={12} />
                      <span>{t.sendReplyBtn}</span>
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setActiveReplyReviewId(rev.id);
                    setReplyText("");
                  }}
                  className="text-xs text-emerald-400 hover:underline font-semibold flex items-center gap-1"
                >
                  <CornerDownRight size={13} />
                  <span>{t.replyBtn}</span>
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        /* Return / Refund Queue */
        <div className="space-y-4">
          {refundDisputes.map((d) => (
            <div
              key={d.id}
              className="p-5 rounded-xl bg-[#111C20] border border-[#20333B] space-y-3"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-rose-400">
                      Refund #{d.displayId}
                    </span>
                    <span
                      className={`badge-${
                        d.status === "APPROVED"
                          ? "emerald"
                          : d.status === "REJECTED"
                          ? "rose"
                          : d.status === "ESCALATED"
                          ? "sky"
                          : "amber"
                      } text-[10px] font-bold`}
                    >
                      {d.status}
                    </span>
                  </div>
                  <h4 className="text-xs font-semibold text-slate-200 mt-1">
                    Customer: {d.customerName}
                  </h4>
                </div>

                <div className="text-right">
                  <span className="font-mono font-bold text-sm text-white">
                    Claim: ৳{d.requestedAmount}
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-[#152227] border border-[#20333B] text-xs text-slate-300">
                <strong>Reason:</strong> {d.reason}
              </div>

              {d.status === "PENDING" && (
                <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-[#20333B]">
                  <button
                    onClick={() => resolveRefundDispute(d.id, "ESCALATED")}
                    className="px-3 py-1.5 bg-[#152227] hover:bg-[#1c2c33] border border-sky-500/30 text-sky-400 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <ShieldAlert size={14} />
                    <span>{t.escalateDisputeBtn}</span>
                  </button>

                  <button
                    onClick={() => resolveRefundDispute(d.id, "REJECTED")}
                    className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <XCircle size={14} />
                    <span>{t.rejectRefundBtn}</span>
                  </button>

                  <button
                    onClick={() => resolveRefundDispute(d.id, "APPROVED")}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-950 transition-colors"
                  >
                    <CheckCircle size={14} />
                    <span>{t.approveRefundBtn}</span>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
