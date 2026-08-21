"use client";

import React from "react";
import { User, Bike, Star, Award, MapPin, Phone, ShieldCheck, CheckCircle } from "lucide-react";
import { useRider } from "@/context/RiderContext";

export default function RiderProfilePage() {
  const { currentRider } = useRider();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      
      {/* Profile Header Card */}
      <div className="rider-card" style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", padding: "24px 16px" }}>
        <div
          style={{
            width: "68px",
            height: "68px",
            borderRadius: "50%",
            background: "var(--primary)",
            color: "#FFF",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "1.8rem",
            fontWeight: 800,
            marginBottom: "12px",
          }}
        >
          {currentRider.name[0]}
        </div>

        <h1 style={{ fontSize: "1.3rem", fontWeight: 800 }}>{currentRider.name}</h1>
        <div style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginTop: "2px" }}>
          {currentRider.phone} • {currentRider.email}
        </div>

        <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
          <span className="status-pill green">✓ ভেরিফাইড রাইডার</span>
          <span className="status-pill blue">🛵 {currentRider.vehicleType}</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
        <div className="rider-card" style={{ textAlign: "center", padding: "16px" }}>
          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 700 }}>মোট সফল ডেলিভারি</div>
          <div style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--primary-dark)", marginTop: "4px" }}>
            {currentRider.totalDeliveriesCompleted}+
          </div>
        </div>

        <div className="rider-card" style={{ textAlign: "center", padding: "16px" }}>
          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 700 }}>কাস্টমার রেটিং</div>
          <div style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--accent)", marginTop: "4px", display: "flex", alignItems: "center", justifyContent: "center", gap: "4px" }}>
            <span>{currentRider.rating}</span>
            <Star size={18} fill="var(--accent)" />
          </div>
        </div>
      </div>

      {/* Assigned Hub & Legal Card */}
      <div className="rider-card" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        <h3 style={{ fontSize: "0.92rem", fontWeight: 800, borderBottom: "1px solid var(--border-subtle)", paddingBottom: "8px" }}>
          অ্যাসাইনমেন্ট ও অফিসিয়াল তথ্য
        </h3>

        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem", padding: "4px 0" }}>
          <span style={{ color: "var(--text-muted)" }}>নিযুক্ত ডেলিভারি হাব:</span>
          <span style={{ fontWeight: 700 }}>{currentRider.assignedHubName}</span>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem", padding: "4px 0" }}>
          <span style={{ color: "var(--text-muted)" }}>জাতীয় পরিচয়পত্র (NID):</span>
          <span style={{ fontWeight: 700, fontFamily: "var(--font-mono)" }}>{currentRider.nid}</span>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem", padding: "4px 0" }}>
          <span style={{ color: "var(--text-muted)" }}>অন-টাইম ডেলিভারি রেট:</span>
          <span style={{ fontWeight: 800, color: "var(--primary)" }}>৯৯.২%</span>
        </div>
      </div>

    </div>
  );
}
