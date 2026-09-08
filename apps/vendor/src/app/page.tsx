"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  TrendingUp,
  ShoppingBag,
  PackageCheck,
  Wallet,
  AlertTriangle,
  Scale,
  CheckSquare,
  Sparkles,
  Zap,
  Clock,
  MessageCircle,
  Bike,
  Phone,
  Store,
  CheckCircle2,
  ChevronRight,
  ArrowRight,
} from "lucide-react";
import { useVendorStore } from "@/store/vendorStore";
import { translations } from "@/utils/translations";
import WeightReconciliationModal from "@/components/common/WeightReconciliationModal";
import PackingChecklistModal from "@/components/common/PackingChecklistModal";
import PayoutRequestModal from "@/components/common/PayoutRequestModal";

function AnimatedNumber({ value, prefix = "" }: { value: number; prefix?: string }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef<number>(0);
  useEffect(() => {
    const start = ref.current;
    const end = value;
    const duration = 900;
    const startTime = performance.now();
    function animate(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      ref.current = Math.round(start + (end - start) * eased);
      setDisplay(ref.current);
      if (progress < 1) requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);
  }, [value]);
  return (
    <>
      {prefix}
      {display.toLocaleString("bn-BD")}
    </>
  );
}

export default function VendorDashboardPage() {
  const router = useRouter();
  const {
    language,
    currentRole,
    profile,
    dutyStatus,
    orders,
    products,
    commissionLedger,
    updateOrderStatus,
    simulateIncomingOrder,
    setChatOrder,
    setTrackingOrder,
  } = useVendorStore();

  const t = translations[language];

  // Modals state
  const [activeWeightOrderId, setActiveWeightOrderId] = useState<string | null>(null);
  const [activeWeightItemId, setActiveWeightItemId] = useState<string | null>(null);
  const [activeChecklistOrderId, setActiveChecklistOrderId] = useState<string | null>(null);
  const [isPayoutModalOpen, setIsPayoutModalOpen] = useState(false);

  const activeWeightOrder = orders.find((o) => o.id === activeWeightOrderId) || null;
  const activeWeightItem = activeWeightOrder?.items.find((i) => i.id === activeWeightItemId) || null;
  const activeChecklistOrder = orders.find((o) => o.id === activeChecklistOrderId) || null;

  // 3D card mouse tilt effect
  const cardRef = useRef<HTMLDivElement>(null);
  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    cardRef.current.style.transform = `rotateX(${-y * 8}deg) rotateY(${x * 8}deg) translateY(-4px)`;
  }
  function handleMouseLeave() {
    if (cardRef.current) cardRef.current.style.transform = "";
  }

  // Live Metrics
  const completedOrders = orders.filter((o) => o.status === "COMPLETED");
  const todayGrossSales = completedOrders.reduce((sum, o) => sum + o.grossTotal, 0);

  const pendingOrders = orders.filter(
    (o) => o.status === "RECEIVED" || o.status === "PREPARING" || o.status === "READY_FOR_PICKUP"
  );

  const lowStockItems = products.filter(
    (p) => p.stockQty <= p.lowStockThreshold
  );

  const pendingCommissionLedger = commissionLedger.filter(
    (c) => c.settlementStatus === "PENDING"
  );

  const availableSettlementBalance = pendingCommissionLedger.reduce(
    (sum, c) => sum + c.netPayable,
    0
  );

  return (
    <div className="page-content">
      {/* Vacation Alert Banner */}
      {profile.vacationMode && (
        <div style={{
          padding: "12px 16px",
          borderRadius: "var(--r-md)",
          background: "rgba(245, 158, 11, 0.12)",
          border: "1px solid rgba(245, 158, 11, 0.35)",
          color: "#F59E0B",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontSize: ".82rem",
          fontFamily: "var(--font-bn)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <AlertTriangle size={18} />
            <span>{t.vacationActive}</span>
          </div>
          <Link
            href="/profile"
            style={{ textDecoration: "underline", fontWeight: 700, color: "#FBBF24" }}
          >
            {language === "bn" ? "প্রোফাইল দেখুন" : "View Profile"}
          </Link>
        </div>
      )}

      {/* 0. Vendor Tier & Store Scorecard Pill (Rider Portal Style) */}
      <div
        id="home-tier-pill"
        className="home-tier-pill"
        onClick={() => router.push("/profile")}
        title="সম্পূর্ণ পারফরম্যান্স ও রেটিং স্কোরকার্ড দেখুন"
      >
        <span>⭐ {profile.rating} (যাচাইকৃত বিক্রেতা)</span>
        <span style={{ opacity: 0.4 }}>•</span>
        <span>⏱️ ১০০% অন-টাইম প্যাকেজিং</span>
        <span style={{ opacity: 0.4 }}>•</span>
        <span>🥬 তাজা কোয়ালিটি সার্টিফাইড</span>
      </div>

      {/* 1. 3D Balance Card (Rider Portal Style) */}
      <div className="balance-card-wrapper">
        <div
          className="balance-card"
          ref={cardRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <div className="balance-card-bg" />
          <div className="balance-label">
            💰 উত্তোলনের জন্য উপলব্ধ ব্যালেন্স
          </div>
          <div className="balance-amount">
            <span className="currency">৳</span>
            <AnimatedNumber value={availableSettlementBalance} />
          </div>

          <div className="balance-row">
            <div className="balance-stat">
              <div className="balance-stat-label">আজকের মোট বিক্রয়</div>
              <div className="balance-stat-value">
                ৳ <AnimatedNumber value={todayGrossSales} />
              </div>
            </div>

            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <button
                id="ledger-main-btn"
                className="withdraw-btn"
                style={{
                  background: "rgba(0,214,143,.18)",
                  border: "1px solid rgba(0,214,143,.35)",
                  color: "#00d68f",
                }}
                onClick={() => router.push("/settlements")}
              >
                খতিয়ান ↑
              </button>

              {currentRole === "OWNER" && (
                <button
                  id="withdraw-main-btn"
                  className="withdraw-btn"
                  onClick={() => setIsPayoutModalOpen(true)}
                >
                  উইথড্র রিকোয়েস্ট →
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Stat Cards Row (Rider Portal Style) */}
      <div className="stat-row">
        <div className="stat-card" onClick={() => router.push("/orders")}>
          <div className="stat-card-icon orange">🚴</div>
          <div className="stat-card-label">আজকের ডেলিভারি সম্পন্ন</div>
          <div className="stat-card-value">{completedOrders.length}</div>
        </div>

        <div className="stat-card" onClick={() => router.push("/settlements")}>
          <div className="stat-card-icon emerald">📅</div>
          <div className="stat-card-label">আজকের মোট সেলস</div>
          <div className="stat-card-value text-emerald">
            ৳ {todayGrossSales.toLocaleString("bn-BD")}
          </div>
        </div>

        <div className="stat-card" onClick={() => router.push("/orders")}>
          <div className="stat-card-icon amber">📦</div>
          <div className="stat-card-label">অপেক্ষমাণ অর্ডার কিউ</div>
          <div className="stat-card-value" style={{ color: "#F59E0B" }}>
            {pendingOrders.length}
          </div>
        </div>

        <div className="stat-card" onClick={() => router.push("/inventory")}>
          <div className="stat-card-icon red">⚠️</div>
          <div className="stat-card-label">লো-স্টক সতর্কতা</div>
          <div className="stat-card-value" style={{ color: "#EF4444" }}>
            {lowStockItems.length}
          </div>
        </div>
      </div>

      {/* 3. Quick Action Buttons (Rider Portal Style) */}
      <div className="section-header">
        <div className="section-title">⚡ দ্রুত অ্যাকশন</div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 10 }}>
        <button
          id="go-orders-btn"
          className="btn-primary"
          onClick={() => {
            const queueEl = document.getElementById("live-order-queue-section");
            if (queueEl) queueEl.scrollIntoView({ behavior: "smooth" });
            else router.push("/orders");
          }}
        >
          📦 লাইভ অর্ডার কিউ ও ডিসপ্যাচ
        </button>

        <button
          id="go-settlements-btn"
          className="btn-secondary"
          onClick={() => router.push("/settlements")}
        >
          📋 সেটেলমেন্ট ও ইনকাম হিস্ট্রি
        </button>

        <button
          id="test-order-alert-btn"
          className="btn-secondary"
          style={{ borderColor: "rgba(255,107,43,0.35)", color: "#FF6B2B" }}
          onClick={simulateIncomingOrder}
        >
          ⚡ নতুন অর্ডার সাউন্ড টেস্ট (৪৫ সে.)
        </button>
      </div>

      {/* 4. Live Order Preparation & Dispatch Queue (Rider Task Card Style) */}
      <div id="live-order-queue-section" className="section-header" style={{ marginTop: 8 }}>
        <div className="section-title">
          <span>📦 লাইভ অর্ডার ও ডিসপ্যাচ কিউ</span>
          {pendingOrders.length > 0 && (
            <div className="live-badge">
              <div className="live-dot" />
              <span>{pendingOrders.length} টি সক্রিয়</span>
            </div>
          )}
        </div>
        <Link
          href="/orders"
          style={{
            fontSize: ".75rem",
            color: "#FF6B2B",
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            gap: 4,
            fontFamily: "var(--font-bn)",
          }}
        >
          <span>সব অর্ডার দেখুন</span>
          <ChevronRight size={14} />
        </Link>
      </div>

      {pendingOrders.length === 0 ? (
        <div
          style={{
            padding: "48px 20px",
            background: "var(--bg-card)",
            borderRadius: "var(--r-lg)",
            border: "1px solid var(--border-1)",
            textAlign: "center",
            fontFamily: "var(--font-bn)",
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              background: "rgba(0, 214, 143, 0.12)",
              color: "#00D68F",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
            }}
          >
            <CheckCircle2 size={28} />
          </div>
          <div style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text-1)", marginBottom: 4 }}>
            বর্তমানে কোনো অপেক্ষমাণ অর্ডার নেই
          </div>
          <div style={{ fontSize: ".8rem", color: "var(--text-3)", maxWidth: 360, margin: "0 auto 18px" }}>
            নতুন কোনো কাস্টমার অর্ডার করলে অবিলম্বে সাউন্ড রিংটোন ও ৪৫ সেকেন্ডের লাইভ কাউন্টডাউন পপ-আপ প্রদর্শিত হবে।
          </div>
          <button
            onClick={simulateIncomingOrder}
            style={{
              padding: "10px 20px",
              background: "linear-gradient(135deg, var(--orange), var(--orange-dim))",
              borderRadius: "var(--r-full)",
              color: "#fff",
              fontSize: ".82rem",
              fontWeight: 700,
              cursor: "pointer",
              boxShadow: "0 4px 16px var(--orange-glow)",
              fontFamily: "var(--font-bn)",
            }}
          >
            ⚡ টেস্ট অর্ডার ট্রাই করুন
          </button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {pendingOrders.map((order) => {
            const unweighedItem = order.items.find(
              (i) => i.pricingType === "WEIGHT_BASED" && !i.weightActual
            );

            return (
              <div key={order.id} className="task-card">
                {/* Header */}
                <div className="task-card-header">
                  <div className="task-vendor">
                    <div className="task-vendor-icon">
                      🥬
                    </div>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                        <span style={{
                          fontSize: ".82rem",
                          fontWeight: 800,
                          color: "#FF6B2B",
                          background: "rgba(255, 107, 43, 0.12)",
                          border: "1px solid rgba(255, 107, 43, 0.3)",
                          padding: "2px 8px",
                          borderRadius: 6,
                          fontFamily: "var(--font-mono)",
                        }}>
                          #{order.displayId}
                        </span>
                        <span style={{
                          fontSize: ".70rem",
                          fontWeight: 700,
                          padding: "2px 8px",
                          borderRadius: 999,
                          background: order.status === "RECEIVED"
                            ? "rgba(245, 158, 11, 0.12)"
                            : order.status === "PREPARING"
                            ? "rgba(59, 130, 246, 0.12)"
                            : "rgba(0, 214, 143, 0.12)",
                          color: order.status === "RECEIVED"
                            ? "#F59E0B"
                            : order.status === "PREPARING"
                            ? "#60A5FA"
                            : "#00D68F",
                          border: `1px solid ${
                            order.status === "RECEIVED"
                              ? "rgba(245, 158, 11, 0.3)"
                              : order.status === "PREPARING"
                              ? "rgba(59, 130, 246, 0.3)"
                              : "rgba(0, 214, 143, 0.3)"
                          }`,
                        }}>
                          {order.status === "RECEIVED"
                            ? "অর্ডার গৃহীত"
                            : order.status === "PREPARING"
                            ? "প্যাকিং চলছে"
                            : "পিকআপের জন্য প্রস্তুত"}
                        </span>
                        {order.urgent && (
                          <span style={{
                            fontSize: ".68rem",
                            fontWeight: 800,
                            padding: "2px 6px",
                            borderRadius: 4,
                            background: "rgba(239, 68, 68, 0.15)",
                            color: "#EF4444",
                            border: "1px solid rgba(239, 68, 68, 0.3)",
                          }}>
                            ⚡ জরুরি
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: ".82rem", fontWeight: 700, color: "var(--text-1)", marginTop: 4 }}>
                        {order.customerName}
                        <span style={{ opacity: 0.4, margin: "0 6px" }}>•</span>
                        <span style={{ fontSize: ".74rem", color: "var(--text-3)", fontWeight: 500 }}>
                          📍 {order.deliveryZone || "মিরপুর জোন"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="task-earning">
                    <div className="task-earning-label">{order.paymentMethod}</div>
                    <div className="task-earning-amount">
                      ৳ {order.grossTotal.toLocaleString("bn-BD")}
                    </div>
                  </div>
                </div>

                {/* Line Items List */}
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                  gap: 8,
                }}>
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      style={{
                        padding: "10px 12px",
                        background: "var(--bg-raised)",
                        borderRadius: "var(--r-sm)",
                        border: "1px solid var(--border-1)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        fontSize: ".78rem",
                        fontFamily: "var(--font-bn)",
                      }}
                    >
                      <div style={{ minWidth: 0, flex: 1, marginRight: 8 }}>
                        <div style={{ fontWeight: 700, color: "var(--text-1)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {language === "bn" ? item.productNameBn : item.productName}
                        </div>
                        <div style={{ fontSize: ".70rem", color: "var(--text-3)", marginTop: 2 }}>
                          {item.pricingType === "WEIGHT_BASED" ? (
                            item.weightActual ? (
                              <span style={{ color: "#00D68F", fontWeight: 700 }}>
                                ✓ স্কেল ওজন: {item.weightActual} {item.unit}
                              </span>
                            ) : (
                              <span style={{ color: "#F59E0B", fontWeight: 600 }}>
                                ⚖️ স্কেল বাকি (আনুমানিক: {item.weightOrdered} {item.unit})
                              </span>
                            )
                          ) : (
                            <span>{item.quantity} {item.unit} (প্যাকেট)</span>
                          )}
                        </div>
                      </div>

                      {item.pricingType === "WEIGHT_BASED" && !item.weightActual && (
                        <button
                          onClick={() => {
                            setActiveWeightOrderId(order.id);
                            setActiveWeightItemId(item.id);
                          }}
                          style={{
                            padding: "4px 10px",
                            background: "rgba(245, 158, 11, 0.15)",
                            border: "1px solid rgba(245, 158, 11, 0.4)",
                            color: "#F59E0B",
                            borderRadius: 6,
                            fontSize: ".72rem",
                            fontWeight: 700,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: 4,
                            flexShrink: 0,
                          }}
                        >
                          <Scale size={13} />
                          <span>ওজন করুন</span>
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {/* Assigned Rider Card (If Rider Assigned) */}
                {order.riderName && (
                  <div
                    style={{
                      padding: "10px 14px",
                      background: "rgba(0, 214, 143, 0.08)",
                      border: "1px solid rgba(0, 214, 143, 0.25)",
                      borderRadius: "var(--r-md)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 8,
                      flexWrap: "wrap",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: 8,
                          background: "linear-gradient(135deg, #00D68F, #00B87A)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 16,
                          color: "#051322",
                          fontWeight: 800,
                        }}
                      >
                        🛵
                      </div>
                      <div>
                        <div style={{ fontSize: ".82rem", fontWeight: 700, color: "var(--text-1)" }}>
                          {order.riderName}
                        </div>
                        <div style={{ fontSize: ".70rem", color: "var(--text-3)", fontFamily: "var(--font-bn)" }}>
                          রাইডার ফোন: {order.riderPhone}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <a
                        href={`tel:${order.riderPhone}`}
                        style={{
                          padding: "6px 10px",
                          background: "var(--bg-raised)",
                          border: "1px solid var(--border-2)",
                          borderRadius: 8,
                          color: "var(--text-1)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                        title="রাইডারকে কল করুন"
                      >
                        <Phone size={14} />
                      </a>

                      <button
                        onClick={() => setChatOrder(order)}
                        style={{
                          padding: "6px 12px",
                          background: "rgba(0, 214, 143, 0.15)",
                          border: "1px solid rgba(0, 214, 143, 0.4)",
                          borderRadius: 8,
                          color: "#00D68F",
                          fontSize: ".74rem",
                          fontWeight: 700,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                          fontFamily: "var(--font-bn)",
                        }}
                      >
                        <MessageCircle size={13} />
                        <span>চ্যাট</span>
                      </button>

                      <button
                        onClick={() => setTrackingOrder(order)}
                        style={{
                          padding: "6px 12px",
                          background: "linear-gradient(135deg, #00D68F, #00B87A)",
                          border: "none",
                          borderRadius: 8,
                          color: "#051322",
                          fontSize: ".74rem",
                          fontWeight: 800,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                          fontFamily: "var(--font-bn)",
                        }}
                      >
                        <Bike size={13} />
                        <span>লাইভ ট্র্যাক</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Footer Action Buttons */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    paddingTop: 10,
                    borderTop: "1px solid var(--border-1)",
                    gap: 8,
                    flexWrap: "wrap",
                  }}
                >
                  <button
                    onClick={() => setActiveChecklistOrderId(order.id)}
                    style={{
                      padding: "8px 14px",
                      background: "var(--bg-raised)",
                      border: "1px solid var(--border-2)",
                      borderRadius: 8,
                      color: "var(--text-2)",
                      fontSize: ".74rem",
                      fontWeight: 600,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      fontFamily: "var(--font-bn)",
                    }}
                  >
                    <CheckSquare size={14} className="text-emerald" />
                    <span>প্যাকিং চেকলিস্ট</span>
                  </button>

                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    {order.status === "RECEIVED" && (
                      <button
                        onClick={() => updateOrderStatus(order.id, "PREPARING")}
                        className="btn-primary"
                        style={{ padding: "8px 16px", fontSize: ".82rem", width: "auto" }}
                      >
                        প্রস্তুতি শুরু করুন →
                      </button>
                    )}

                    {order.status === "PREPARING" && (
                      <button
                        onClick={() => {
                          if (unweighedItem) {
                            setActiveWeightOrderId(order.id);
                            setActiveWeightItemId(unweighedItem.id);
                          } else {
                            updateOrderStatus(order.id, "READY_FOR_PICKUP");
                          }
                        }}
                        className="task-deliver-btn"
                        style={{ padding: "8px 18px", fontSize: ".82rem", width: "auto" }}
                      >
                        <Sparkles size={14} />
                        <span>প্যাকেজিং সম্পন্ন</span>
                      </button>
                    )}

                    {order.status === "READY_FOR_PICKUP" && (
                      <button
                        onClick={() => updateOrderStatus(order.id, "HANDED_TO_RIDER")}
                        className="btn-primary"
                        style={{
                          padding: "8px 18px",
                          fontSize: ".82rem",
                          width: "auto",
                          background: "linear-gradient(135deg, #8B5CF6, #6D28D9)",
                        }}
                      >
                        <Bike size={14} />
                        <span>রাইডারকে হ্যান্ডওভার</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 5. Live System Status Card (Rider Portal Style) */}
      <div
        style={{
          padding: "16px",
          background: "var(--bg-card)",
          borderRadius: "var(--r-lg)",
          border: "1px solid var(--border-1)",
          marginTop: 4,
        }}
      >
        <div style={{ fontSize: ".72rem", color: "var(--text-3)", fontFamily: "var(--font-bn)", marginBottom: 8 }}>
          আজকের হালনাগাদ
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div className="live-dot" />
          <span style={{ fontSize: ".78rem", color: "var(--text-2)", fontFamily: "var(--font-bn)" }}>
            সিস্টেম সক্রিয় — নতুন অর্ডারের জন্য অপেক্ষা করুন
          </span>
        </div>
      </div>

      {/* Global Modals */}
      <WeightReconciliationModal
        isOpen={!!activeWeightOrder && !!activeWeightItem}
        order={activeWeightOrder}
        item={activeWeightItem}
        onClose={() => {
          setActiveWeightOrderId(null);
          setActiveWeightItemId(null);
        }}
      />

      <PackingChecklistModal
        isOpen={!!activeChecklistOrder}
        order={activeChecklistOrder}
        onClose={() => setActiveChecklistOrderId(null)}
        onReadyForPickup={(orderId) => updateOrderStatus(orderId, "READY_FOR_PICKUP")}
      />

      <PayoutRequestModal
        isOpen={isPayoutModalOpen}
        availableBalance={availableSettlementBalance}
        onClose={() => setIsPayoutModalOpen(false)}
      />
    </div>
  );
}
