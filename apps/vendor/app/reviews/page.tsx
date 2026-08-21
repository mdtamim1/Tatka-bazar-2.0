"use client";

import React from "react";
import { Star, MessageSquare } from "lucide-react";
import { useVendor } from "@/context/VendorContext";

export default function VendorReviewsPage() {
  const { currentVendor } = useVendor();

  const reviews = [
    {
      id: "rev-1",
      userName: "তানভীর হাসান",
      rating: 5,
      date: "২০ আগস্ট ২০২৬",
      productName: "পাকা লাল দেশি টমেটো (১০০% অর্গানিক)",
      comment: "টমেটোগুলো একদম টাটকা ছিল। প্যাকেজিং খুব ভালো হয়েছে। পরবর্তী অর্ডারেও নেব।",
    },
    {
      id: "rev-2",
      userName: "ফারজানা হক",
      rating: 5,
      date: "১৯ আগস্ট ২০২৬",
      productName: "তাজা কচি দেশি লাল শাক",
      comment: "সকালে অর্ডার দিয়ে ৮টার মধ্যে পেয়েছি। শাক অত্যন্ত সতেজ ছিল।",
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <div>
        <h1 style={{ fontSize: "1.4rem", fontWeight: 800, color: "var(--text-main)" }}>
          গ্রাহক রিভিউ ও শপ রেটিং
        </h1>
        <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginTop: "2px" }}>
          আপনার দোকানের পণ্য ক্রয়কারী গ্রাহকদের প্রতিক্রিয়া ও সন্তুষ্টি স্কোর
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
            {currentVendor.reviewsCount} টি রিভিউ
          </div>
        </div>

        <div style={{ flex: 1 }}>
          <h3 style={{ fontSize: "0.95rem", fontWeight: 700, marginBottom: "4px" }}>
            গ্রাহক সন্তুষ্টি সূচক (Customer Trust)
          </h3>
          <p style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>
            আপনার দোকানের ৯৮% গ্রাহক ৫-স্টার রিভিউ দিয়েছেন। উচ্চমানের তাজা পণ্য ও সঠিক ওজন বজায় রাখুন।
          </p>
        </div>
      </div>

      {/* Reviews Table */}
      <div className="vendor-card">
        <table className="vendor-table">
          <thead>
            <tr>
              <th>গ্রাহক ও তারিখ</th>
              <th>ক্রয়কৃত পণ্য</th>
              <th>রেটিং</th>
              <th>মন্তব্য</th>
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
