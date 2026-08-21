"use client";

import React from "react";
import Link from "next/link";
import { Bike, Power, MapPin, User, ArrowRightLeft } from "lucide-react";
import { useRider, AVAILABLE_RIDERS } from "@/context/RiderContext";

export function RiderHeader() {
  const { currentRider, toggleDutyStatus, switchRider } = useRider();

  return (
    <header
      style={{
        background: "var(--rider-header)",
        color: "#FFFFFF",
        padding: "14px 18px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        position: "sticky",
        top: 0,
        zIndex: 90,
        boxShadow: "0 2px 10px rgba(0,0,0,0.15)",
      }}
    >
      {/* Brand & Hub Info */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <div
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "50%",
            background: currentRider.isOnline ? "var(--neon-green)" : "#475569",
            color: currentRider.isOnline ? "#0F172A" : "#FFFFFF",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 800,
          }}
        >
          <Bike size={20} />
        </div>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ fontWeight: 800, fontSize: "0.95rem" }}>{currentRider.name}</span>
            <span style={{ fontSize: "0.68rem", color: currentRider.isOnline ? "#4ADE80" : "#94A3B8", fontWeight: 700 }}>
              {currentRider.isOnline ? "● অনলাইন" : "○ অফলাইন"}
            </span>
          </div>
          <div style={{ fontSize: "0.72rem", color: "#94A3B8", display: "flex", alignItems: "center", gap: "3px" }}>
            <MapPin size={11} color="#38BDF8" />
            <span>{currentRider.assignedHubName}</span>
          </div>
        </div>
      </div>

      {/* Right: Duty Power Button & Switcher */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        
        {/* Switch Rider for testing */}
        <select
          value={currentRider.id}
          onChange={(e) => switchRider(e.target.value)}
          style={{
            background: "rgba(255, 255, 255, 0.1)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            color: "#FFFFFF",
            fontSize: "0.72rem",
            padding: "4px 6px",
            borderRadius: "var(--radius-sm)",
            outline: "none",
          }}
        >
          {AVAILABLE_RIDERS.map((r) => (
            <option key={r.id} value={r.id} style={{ background: "#1E293B", color: "#FFF" }}>
              {r.name} ({r.vehicleType})
            </option>
          ))}
        </select>

        {/* Online / Offline Duty Button */}
        <button
          onClick={toggleDutyStatus}
          style={{
            padding: "6px 12px",
            borderRadius: "999px",
            background: currentRider.isOnline ? "rgba(34, 197, 94, 0.2)" : "rgba(239, 68, 68, 0.2)",
            color: currentRider.isOnline ? "#4ADE80" : "#F87171",
            border: `1px solid ${currentRider.isOnline ? "#22C55E" : "#EF4444"}`,
            fontSize: "0.75rem",
            fontWeight: 800,
            display: "flex",
            alignItems: "center",
            gap: "5px",
          }}
        >
          <Power size={13} />
          <span>{currentRider.isOnline ? "ডিউটি অন" : "ডিউটি অফ"}</span>
        </button>

      </div>
    </header>
  );
}
