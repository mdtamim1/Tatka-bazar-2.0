"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Package,
  CheckCircle2,
  Clock,
  Phone,
  Navigation,
  MapPin,
  AlertTriangle,
  ArrowRight,
  ChevronRight,
  DollarSign,
  Bike,
  Volume2,
  BellRing,
  X,
} from "lucide-react";
import { useRider } from "@/context/RiderContext";
import { DeliveryStatus } from "@/types";

export default function RiderDeliveriesPage() {
  const { deliveries, updateStatus, currentRider, newOrderAlert, dismissAlert, playTestSound } = useRider();
  const [activeTab, setActiveTab] = useState<"ACTIVE" | "COMPLETED">("ACTIVE");

  const activeDeliveries = deliveries.filter(
    (d) => d.status === "ASSIGNED" || d.status === "PICKED_UP_FROM_HUB" || d.status === "EN_ROUTE"
  );
  const completedDeliveries = deliveries.filter(
    (d) => d.status === "DELIVERED" || d.status === "FAILED"
  );

  const displayedList = activeTab === "ACTIVE" ? activeDeliveries : completedDeliveries;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      
      {/* Live Audio Chime Banner on New Order Assigned */}
      {newOrderAlert && (
        <div style={{
          background: "linear-gradient(135deg, #059669 0%, #047857 100%)",
          border: "2px solid #34D399",
          padding: "16px",
          borderRadius: "var(--radius-lg)",
          color: "#FFFFFF",
          boxShadow: "0 10px 25px -5px rgba(5, 150, 105, 0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ background: "rgba(255,255,255,0.2)", padding: "10px", borderRadius: "50%" }}>
              <BellRing size={24} className="animate-bounce" />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: "0.95rem" }}>🔔 নতুন অর্ডার নির্ধারিত হয়েছে!</div>
              <div style={{ fontSize: "0.8rem", opacity: 0.9 }}>
                অর্ডার: <strong>{newOrderAlert.orderNumber}</strong> • {newOrderAlert.customerName} ({newOrderAlert.area})
              </div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <button
              onClick={playTestSound}
              style={{
                background: "#FFFFFF",
                color: "#065F46",
                border: "none",
                padding: "8px 12px",
                borderRadius: "var(--radius-sm)",
                fontSize: "0.75rem",
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                gap: "4px",
                cursor: "pointer",
              }}
            >
              <Volume2 size={14} /> আবার শুনুন
            </button>
            <button
              onClick={dismissAlert}
              style={{
                background: "transparent",
                color: "rgba(255,255,255,0.8)",
                border: "none",
                cursor: "pointer",
                padding: "4px",
              }}
            >
              <X size={20} />
            </button>
          </div>
        </div>
      )}

      {/* Sound Chime Readiness Bar */}
      <div style={{
        background: "var(--rider-surface)",
        border: "1px solid var(--border-color)",
        padding: "10px 14px",
        borderRadius: "var(--radius-md)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        fontSize: "0.8rem",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--text-muted)" }}>
          <Volume2 size={16} style={{ color: "var(--primary)" }} />
          <span>অ্যাসাইনমেন্ট সাউন্ড এলার্ট: <strong>সক্রিয় (Ting-Tong Chime)</strong></span>
        </div>
        <button
          onClick={playTestSound}
          style={{
            background: "rgba(16, 185, 129, 0.1)",
            color: "var(--primary)",
            border: "1px solid rgba(16, 185, 129, 0.3)",
            padding: "4px 10px",
            borderRadius: "var(--radius-sm)",
            fontSize: "0.75rem",
            fontWeight: 700,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "4px",
          }}
        >
          বেল সাউন্ড টেস্ট
        </button>
      </div>

      {/* Shift Status Banner */}
      {!currentRider.isOnline && (
        <div style={{ background: "#FEE2E2", border: "1px solid #FECACA", padding: "12px 14px", borderRadius: "var(--radius-md)", fontSize: "0.82rem", color: "#991B1B", display: "flex", alignItems: "center", gap: "8px" }}>
          <AlertTriangle size={18} />
          <span>আপনি বর্তমানে <strong>অফলাইনে</strong> আছেন। নতুন ডেলিভারি পেতে উপরের সুইচ অন করুন।</span>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: "flex", background: "rgba(0,0,0,0.06)", padding: "4px", borderRadius: "var(--radius-md)" }}>
        <button
          onClick={() => setActiveTab("ACTIVE")}
          style={{
            flex: 1,
            padding: "10px",
            borderRadius: "var(--radius-sm)",
            background: activeTab === "ACTIVE" ? "var(--rider-surface)" : "transparent",
            color: activeTab === "ACTIVE" ? "var(--primary)" : "var(--text-muted)",
            fontWeight: 800,
            fontSize: "0.88rem",
            boxShadow: activeTab === "ACTIVE" ? "var(--shadow-sm)" : "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px",
          }}
        >
          <span>চলমান কাজ</span>
          <span style={{ background: activeTab === "ACTIVE" ? "var(--primary-light)" : "#E2E8F0", color: activeTab === "ACTIVE" ? "var(--primary-hover)" : "var(--text-muted)", padding: "2px 6px", borderRadius: "999px", fontSize: "0.72rem" }}>
            {activeDeliveries.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("COMPLETED")}
          style={{
            flex: 1,
            padding: "10px",
            borderRadius: "var(--radius-sm)",
            background: activeTab === "COMPLETED" ? "var(--rider-surface)" : "transparent",
            color: activeTab === "COMPLETED" ? "var(--primary)" : "var(--text-muted)",
            fontWeight: 800,
            fontSize: "0.88rem",
            boxShadow: activeTab === "COMPLETED" ? "var(--shadow-sm)" : "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px",
          }}
        >
          <span>সম্পন্ন ({completedDeliveries.length})</span>
        </button>
      </div>

      {/* Delivery Cards List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        {displayedList.length === 0 ? (
          <div className="rider-card" style={{ textAlign: "center", padding: "36px 16px" }}>
            <CheckCircle2 size={40} color="var(--primary)" style={{ margin: "0 auto 10px" }} />
            <h3 style={{ fontSize: "1.1rem", fontWeight: 800 }}>
              {activeTab === "ACTIVE" ? "কোনো পেন্ডিং ডেলিভারি নেই!" : "এখনও কোনো ডেলিভারি সম্পন্ন হয়নি"}
            </h3>
            <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginTop: "4px" }}>
              {activeTab === "ACTIVE" ? "নতুন ডেলিভারি আসলে নোটিফিকেশন পাবেন।" : "ডেলিভারি সম্পন্ন হলে এখানে জমা হবে।"}
            </p>
          </div>
        ) : (
          displayedList.map((del) => (
            <div key={del.id} className="rider-card" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              
              {/* Order Card Header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "10px" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span style={{ fontWeight: 800, fontSize: "1rem", color: "var(--text-main)" }}>
                      {del.orderNumber}
                    </span>
                    <span
                      className={`status-pill ${
                        del.status === "DELIVERED"
                          ? "green"
                          : del.status === "FAILED"
                          ? "red"
                          : del.status === "EN_ROUTE"
                          ? "amber"
                          : "blue"
                      }`}
                    >
                      {del.status}
                    </span>
                  </div>
                  <div style={{ fontSize: "0.72rem", color: "var(--accent)", fontWeight: 700, marginTop: "2px" }}>
                    ⏰ {del.deliverySlot}
                  </div>
                </div>

                <div style={{ textAlign: "right" }}>
                  <span style={{ fontSize: "0.88rem", fontWeight: 800, color: del.isCod ? "var(--primary-dark)" : "#2563EB" }}>
                    {del.isCod ? `৳${del.codAmountToCollect.toLocaleString()} COD` : "অনলাইন পেইড"}
                  </span>
                </div>
              </div>

              {/* Customer Details & Address */}
              <div>
                <div style={{ fontWeight: 700, fontSize: "0.95rem" }}>{del.customerName}</div>
                <div style={{ fontSize: "0.82rem", color: "var(--text-muted)", display: "flex", alignItems: "flex-start", gap: "4px", marginTop: "4px" }}>
                  <MapPin size={15} color="var(--primary)" style={{ flexShrink: 0, marginTop: "2px" }} />
                  <span>{del.deliveryAddress}</span>
                </div>
              </div>

              {/* Items Preview */}
              <div style={{ background: "#F8FAFC", padding: "8px 12px", borderRadius: "var(--radius-sm)", fontSize: "0.78rem" }}>
                <div style={{ color: "var(--text-muted)", fontWeight: 700, marginBottom: "2px" }}>প্যাকেজ আইটেম:</div>
                <div style={{ color: "var(--text-main)" }}>
                  {del.items.map((it) => `${it.nameBn} (${it.weight})`).join(", ")}
                </div>
              </div>

              {/* Quick Communication Actions (Call & Maps) */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                <a
                  href={`tel:${del.customerPhone}`}
                  className="rider-btn rider-btn-secondary"
                  style={{ minHeight: "40px", padding: "8px", fontSize: "0.85rem" }}
                >
                  <Phone size={15} color="var(--primary)" />
                  <span>কল করুন</span>
                </a>

                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(del.mapQuery)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="rider-btn rider-btn-secondary"
                  style={{ minHeight: "40px", padding: "8px", fontSize: "0.85rem" }}
                >
                  <Navigation size={15} color="#2563EB" />
                  <span>গুগল ম্যাপ</span>
                </a>
              </div>

              {/* One-Tap Status Stepper Button */}
              {del.status === "ASSIGNED" && (
                <button
                  onClick={() => updateStatus(del.id, "PICKED_UP_FROM_HUB")}
                  className="rider-btn rider-btn-primary"
                >
                  <Package size={18} />
                  <span>১. হাবে পিকআপ গ্রহণ করুন</span>
                </button>
              )}

              {del.status === "PICKED_UP_FROM_HUB" && (
                <button
                  onClick={() => updateStatus(del.id, "EN_ROUTE")}
                  className="rider-btn"
                  style={{ background: "var(--accent)", color: "#FFF" }}
                >
                  <Bike size={18} />
                  <span>২. ডেলিভারির উদ্দেশ্যে রওনা দিন</span>
                </button>
              )}

              {del.status === "EN_ROUTE" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <button
                    onClick={() => updateStatus(del.id, "DELIVERED")}
                    className="rider-btn rider-btn-primary"
                    style={{ background: "var(--neon-green)", color: "#0F172A", fontWeight: 800 }}
                  >
                    <CheckCircle2 size={18} />
                    <span>
                      {del.isCod
                        ? `✓ ৳${del.codAmountToCollect} ক্যাশ গ্রহণ ও ডেলিভারি`
                        : "✓ ডেলিভারি সম্পন্ন করুন"}
                    </span>
                  </button>

                  <button
                    onClick={() => updateStatus(del.id, "FAILED", "গ্রাহক ফোনে অপ্রাপ্য")}
                    className="rider-btn rider-btn-secondary"
                    style={{ minHeight: "36px", padding: "6px", fontSize: "0.75rem", color: "var(--danger)" }}
                  >
                    ডেলিভারি ব্যর্থ হয়েছে (রিপোর্ট করুন)
                  </button>
                </div>
              )}

              {del.status === "DELIVERED" && (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "var(--primary-light)", padding: "8px 12px", borderRadius: "var(--radius-sm)", fontSize: "0.8rem", color: "var(--primary-hover)", fontWeight: 700 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <CheckCircle2 size={16} />
                    <span>সফল ডেলিভারি</span>
                  </div>
                  <span>{del.deliveredAt}</span>
                </div>
              )}

              {/* View Full Sheet Link */}
              <Link
                href={`/order/${del.id}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "4px",
                  fontSize: "0.78rem",
                  color: "var(--text-muted)",
                  paddingTop: "4px",
                  fontWeight: 600,
                }}
              >
                <span>বিস্তারিত তথ্য ও চালান রান-শীট দেখুন</span>
                <ChevronRight size={14} />
              </Link>

            </div>
          ))
        )}
      </div>

    </div>
  );
}
