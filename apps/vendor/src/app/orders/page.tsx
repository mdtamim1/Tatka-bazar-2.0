"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShoppingBag,
  Search,
  Scale,
  CheckSquare,
  Sparkles,
  Bike,
  CheckCircle,
  Clock,
  Phone,
  MapPin,
  MessageCircle,
  ShieldCheck,
  RotateCcw,
  AlertTriangle,
  Flame,
} from "lucide-react";
import { useVendorStore } from "@/store/vendorStore";
import { Order, OrderStatus } from "@/types/vendor";
import { translations } from "@/utils/translations";
import WeightReconciliationModal from "@/components/common/WeightReconciliationModal";
import PackingChecklistModal from "@/components/common/PackingChecklistModal";

export default function OrdersPage() {
  const {
    language,
    orders,
    dutyStatus,
    setDutyStatus,
    updateOrderStatus,
    reconcileItemWeight,
    acceptOrder,
    declineOrder,
    setChatOrder,
    setTrackingOrder,
    resetShiftQueue,
    shiftStartedAt,
    syncRiderDispatch,
  } = useVendorStore();

  const t = translations[language];

  // ─── Real-time dispatch sync with Rider Portal ───
  useEffect(() => {
    let isMounted = true;
    async function syncDispatch() {
      const endpoints = [
        "/api/dispatch?all=true",
        "https://tatka-bazar-2-0-rider-seven.vercel.app/api/dispatch?all=true",
        "https://tatka-bazar-2-0-admin.vercel.app/api/dispatch?all=true",
        "https://hub-gamma-umber.vercel.app/api/dispatch?all=true",
      ];
      for (const url of endpoints) {
        try {
          const res = await fetch(url, { signal: AbortSignal.timeout(3500) });
          if (res.ok) {
            const data = await res.json();
            if (data.success && Array.isArray(data.data) && data.data.length > 0) {
              if (isMounted) syncRiderDispatch(data.data);
              break;
            }
          }
        } catch {}
      }
    }

    syncDispatch();
    const interval = setInterval(syncDispatch, 3500);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [syncRiderDispatch]);

  // Status Tabs: ALL (Today), PENDING, PROCESSING, READY_FOR_PICKUP, COMPLETED, RETURNED
  const [activeTab, setActiveTab] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Modals state
  const [activeWeightOrderId, setActiveWeightOrderId] = useState<string | null>(null);
  const [activeWeightItemId, setActiveWeightItemId] = useState<string | null>(null);
  const [activeChecklistOrderId, setActiveChecklistOrderId] = useState<string | null>(null);

  const activeWeightOrder = orders.find((o) => o.id === activeWeightOrderId) || null;
  const activeWeightItem = activeWeightOrder?.items.find((i) => i.id === activeWeightItemId) || null;
  const activeChecklistOrder = orders.find((o) => o.id === activeChecklistOrderId) || null;

  // Status mapping helper
  const matchesStatus = (order: Order, tab: string) => {
    if (tab === "ALL") return true;
    if (tab === "PENDING") return order.status === "PENDING" || order.status === "RECEIVED";
    if (tab === "PROCESSING") return order.status === "PROCESSING" || order.status === "PREPARING";
    if (tab === "READY_FOR_PICKUP") return order.status === "READY_FOR_PICKUP" || order.status === "HANDED_TO_RIDER";
    if (tab === "COMPLETED") return order.status === "COMPLETED";
    if (tab === "RETURNED") return order.status === "RETURNED";
    return order.status === tab;
  };

  const filteredOrders = orders.filter((order) => {
    if (!matchesStatus(order, activeTab)) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        order.displayId.toLowerCase().includes(q) ||
        (order.deliveryZone && order.deliveryZone.toLowerCase().includes(q)) ||
        order.items.some(
          (it) =>
            it.productName.toLowerCase().includes(q) ||
            it.productNameBn.toLowerCase().includes(q)
        )
      );
    }
    return true;
  });

  // Module Counts
  const countToday = orders.length;
  const countPending = orders.filter((o) => o.status === "PENDING" || o.status === "RECEIVED").length;
  const countProcessing = orders.filter((o) => o.status === "PROCESSING" || o.status === "PREPARING").length;
  const countReady = orders.filter((o) => o.status === "READY_FOR_PICKUP" || o.status === "HANDED_TO_RIDER").length;
  const countCompleted = orders.filter((o) => o.status === "COMPLETED").length;
  const countReturned = orders.filter((o) => o.status === "RETURNED").length;

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case "PENDING":
      case "RECEIVED":
        return <span className="badge badge-amber">⏱️ অপেক্ষমাণ</span>;
      case "PROCESSING":
      case "PREPARING":
        return <span className="badge badge-processing">⚡ প্রসেসিং</span>;
      case "READY_FOR_PICKUP":
        return <span className="badge badge-emerald">📦 রেডি ফর পিকআপ</span>;
      case "HANDED_TO_RIDER":
        return <span className="badge badge-processing">🛵 রাইডারের সাথে</span>;
      case "COMPLETED":
        return <span className="badge badge-completed">✅ ডেলিভার্ড</span>;
      case "RETURNED":
        return <span className="badge badge-rejected">↩️ ফেরত এসেছে</span>;
      default:
        return <span className="badge badge-slate">{status}</span>;
    }
  };

  return (
    <div className="page-content select-none">
      {/* Offline Lock Warning (Rider Style) */}
      {dutyStatus === "STORE_CLOSED" && (
        <div className="offline-lock-card">
          <div className="offline-lock-icon">⏸️</div>
          <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "#fff", fontFamily: "var(--font-bn)", marginBottom: 6 }}>
            আপনার দোকান বর্তমানে বন্ধ (বিশ্রামে) আছে
          </div>
          <div style={{ fontSize: ".82rem", color: "var(--text-3)", fontFamily: "var(--font-bn)", maxWidth: 360, margin: "0 auto 16px", lineHeight: 1.5 }}>
            নতুন কোনো কাস্টমার অর্ডার গ্রহণ বা প্রসেস করতে অন-ডিউটি (দোকান খোলা) চালু করুন।
          </div>
          <button
            id="go-online-btn"
            onClick={() => setDutyStatus("STORE_OPEN")}
            style={{
              background: "linear-gradient(135deg, #00d68f, #00b377)",
              color: "#051322",
              padding: "10px 22px",
              borderRadius: "999px",
              fontWeight: 900,
              fontSize: ".9rem",
              border: "none",
              cursor: "pointer",
              boxShadow: "0 4px 16px rgba(0,214,143,.35)",
              fontFamily: "var(--font-bn)",
            }}
          >
            🟢 দোকান খুলুন (Open Store)
          </button>
        </div>
      )}

      {/* Top Header Row with History Link */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div className="section-title">
          <span>📦 অর্ডার কিউ ও ডিসপ্যাচ</span>
          {countPending > 0 && (
            <div className="live-badge">
              <div className="live-dot" />
              <span>{countPending} টি নতুন</span>
            </div>
          )}
        </div>
        <Link
          href="/orders/history"
          style={{
            fontSize: ".75rem",
            color: "var(--emerald)",
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            gap: 4,
            fontFamily: "var(--font-bn)",
          }}
        >
          <span>অর্ডার হিস্ট্রি →</span>
        </Link>
      </div>

      {/* Horizontal Status Bar (Matching Rider Tasks Page) */}
      <div className="status-column-bar">
        <button
          type="button"
          className={`status-tab-btn ${activeTab === "ALL" ? "active" : ""}`}
          onClick={() => setActiveTab("ALL")}
        >
          <span>📋 আজকের অর্ডার</span>
          <span className="status-tab-badge">{countToday}</span>
        </button>

        <button
          type="button"
          className={`status-tab-btn ${activeTab === "PENDING" ? "active" : ""}`}
          onClick={() => setActiveTab("PENDING")}
        >
          <span>⏱️ পেন্ডিং</span>
          <span className="status-tab-badge">{countPending}</span>
        </button>

        <button
          type="button"
          className={`status-tab-btn ${activeTab === "PROCESSING" ? "active" : ""}`}
          onClick={() => setActiveTab("PROCESSING")}
        >
          <span>⚡ প্রসেসিং</span>
          <span className="status-tab-badge">{countProcessing}</span>
        </button>

        <button
          type="button"
          className={`status-tab-btn ${activeTab === "READY_FOR_PICKUP" ? "active" : ""}`}
          onClick={() => setActiveTab("READY_FOR_PICKUP")}
        >
          <span>📦 রেডি / পিকআপ</span>
          <span className="status-tab-badge">{countReady}</span>
        </button>

        <button
          type="button"
          className={`status-tab-btn ${activeTab === "COMPLETED" ? "active" : ""}`}
          onClick={() => setActiveTab("COMPLETED")}
        >
          <span>✅ সম্পন্ন</span>
          <span className="status-tab-badge">{countCompleted}</span>
        </button>

        <button
          type="button"
          className={`status-tab-btn ${activeTab === "RETURNED" ? "active" : ""}`}
          onClick={() => setActiveTab("RETURNED")}
        >
          <span>↩️ রিটার্নড</span>
          <span className="status-tab-badge">{countReturned}</span>
        </button>
      </div>

      {/* Search Bar */}
      <div style={{ position: "relative", width: "100%" }}>
        <Search
          size={16}
          style={{
            position: "absolute",
            left: 14,
            top: "50%",
            transform: "translateY(-50%)",
            color: "var(--text-3)",
            pointerEvents: "none",
          }}
        />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="অর্ডার আইডি (যেমন TB-8492), পণ্য বা জোন খুঁজুন..."
          className="form-input"
          style={{ paddingLeft: 40, fontSize: ".84rem" }}
        />
      </div>

      {/* Order Cards List (Rider task-card Style) */}
      {filteredOrders.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📦</div>
          <div className="empty-state-title">বর্তমানে কোনো অর্ডার নেই</div>
          <div className="empty-state-text">
            নতুন কোনো গ্রাহক অর্ডার করলে লাইভ সাউন্ড এলার্ট ও এখানে তালিকা প্রদর্শিত হবে।
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {filteredOrders.map((order) => {
            const unweighedItem = order.items.find(
              (i) => i.pricingType === "WEIGHT_BASED" && !i.weightActual
            );
            const isHandedOver = order.status === "HANDED_TO_RIDER" || order.status === "COMPLETED";

            return (
              <div key={order.id} className="task-card">
                {/* Header */}
                <div className="task-card-header">
                  <div className="task-vendor">
                    <div className="task-vendor-icon">🥬</div>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                        <span
                          style={{
                            fontSize: ".84rem",
                            fontWeight: 800,
                            color: "var(--emerald)",
                            fontFamily: "var(--font-mono)",
                          }}
                        >
                          #{order.displayId}
                        </span>
                        {getStatusBadge(order.status)}
                        {order.urgent && (
                          <span className="badge badge-red">
                            <Flame size={11} />
                            <span>জরুরি</span>
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: ".76rem", color: "var(--text-2)", marginTop: 2, display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ fontWeight: 700 }}>{order.customerName}</span>
                        <span>•</span>
                        <span style={{ color: "var(--emerald)" }}>{order.deliveryZone || "ঢাকা জোন"}</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "1.15rem", fontWeight: 900, color: "var(--text-1)", fontFamily: "var(--font-mono)" }}>
                      ৳{order.grossTotal.toLocaleString()}
                    </div>
                    <div style={{ fontSize: ".70rem", color: "var(--emerald)", fontWeight: 700, fontFamily: "var(--font-mono)" }}>
                      আয়: ৳{order.netTotal.toLocaleString()}
                    </div>
                  </div>
                </div>

                {order.notes && (
                  <div style={{
                    padding: "8px 12px",
                    borderRadius: "var(--r-sm)",
                    background: "var(--amber-glass)",
                    border: "1px solid var(--amber-glow)",
                    fontSize: ".75rem",
                    color: "var(--amber)",
                    fontFamily: "var(--font-bn)",
                  }}>
                    💬 নোট: {order.notes}
                  </div>
                )}

                {/* Items Box */}
                <div style={{
                  background: "var(--bg-raised)",
                  borderRadius: "var(--r-md)",
                  padding: "12px 14px",
                  border: "1px solid var(--border-2)",
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                }}>
                  <div style={{
                    fontSize: ".68rem",
                    color: "var(--text-3)",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: ".06em",
                    display: "flex",
                    justifyContent: "space-between",
                  }}>
                    <span>পণ্য ({order.items.length}টি)</span>
                    <span>পরিমাণ ও দাম</span>
                  </div>

                  {order.items.map((item) => {
                    const isWeightBased = item.pricingType === "WEIGHT_BASED";
                    return (
                      <div
                        key={item.id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: 8,
                          fontSize: ".82rem",
                          borderBottom: "1px solid var(--border-1)",
                          paddingBottom: 6,
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 700, color: "var(--text-1)" }}>
                            {language === "bn" ? item.productNameBn : item.productName}
                          </div>
                          <div style={{ fontSize: ".70rem", color: "var(--text-3)" }}>
                            {isWeightBased ? `${item.weightOrdered} ${item.unit}` : `${item.quantity} ${item.unit}`}
                            {isWeightBased && item.weightActual && (
                              <span style={{ color: "var(--emerald)", fontWeight: 700, marginLeft: 6 }}>
                                ✓ প্রকৃত: {item.weightActual} {item.unit}
                              </span>
                            )}
                          </div>
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ fontWeight: 800, color: "var(--text-1)", fontFamily: "var(--font-mono)" }}>
                            ৳{item.finalPrice}
                          </span>
                          {isWeightBased && (order.status === "PROCESSING" || order.status === "PREPARING") && (
                            <button
                              onClick={() => {
                                setActiveWeightOrderId(order.id);
                                setActiveWeightItemId(item.id);
                              }}
                              style={{
                                padding: "4px 8px",
                                borderRadius: 6,
                                background: "var(--amber-glass)",
                                border: "1px solid var(--amber-glow)",
                                color: "var(--amber)",
                                fontSize: ".70rem",
                                fontWeight: 700,
                                cursor: "pointer",
                              }}
                            >
                              ⚖️ {item.weightActual ? "ওজন ঠিক আছে" : "ওজন স্কেল"}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Assigned Rider Bar */}
                {(order.status === "READY_FOR_PICKUP" || order.status === "HANDED_TO_RIDER" || order.status === "COMPLETED" || order.riderName) && (
                  <div style={{
                    padding: "10px 14px",
                    borderRadius: "var(--r-md)",
                    background: "rgba(0,214,143,0.06)",
                    border: "1px solid rgba(0,214,143,0.2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 8,
                    flexWrap: "wrap",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: "1.2rem" }}>🛵</span>
                      <div>
                        <div style={{ fontSize: ".78rem", fontWeight: 800, color: "var(--text-1)" }}>
                          {order.riderName || "রাইডার নির্ধারিত"}
                        </div>
                        <div style={{ fontSize: ".68rem", color: "var(--text-3)" }}>
                          {order.riderPhone ? `${order.riderPhone} • ` : ""}{isHandedOver ? "ডেলিভারির পথে" : "দোকানে আসার পথে"}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                      <button
                        onClick={() => setTrackingOrder(order)}
                        style={{
                          padding: "6px 10px",
                          borderRadius: "var(--r-sm)",
                          background: "var(--emerald)",
                          color: "#051322",
                          fontSize: ".72rem",
                          fontWeight: 800,
                          fontFamily: "var(--font-bn)",
                          border: "none",
                          cursor: "pointer",
                        }}
                      >
                        🗺️ ট্র্যাকিং
                      </button>

                      {!isHandedOver && (
                        <button
                          onClick={() => setChatOrder(order)}
                          style={{
                            padding: "6px 10px",
                            borderRadius: "var(--r-sm)",
                            background: "var(--bg-raised)",
                            color: "var(--emerald)",
                            border: "1px solid rgba(0,214,143,0.3)",
                            fontSize: ".72rem",
                            fontWeight: 700,
                            fontFamily: "var(--font-bn)",
                            cursor: "pointer",
                          }}
                        >
                          💬 চ্যাট
                        </button>
                      )}

                      {order.riderPhone && (
                        <a
                          href={`tel:${order.riderPhone}`}
                          style={{
                            padding: "6px 10px",
                            borderRadius: "var(--r-sm)",
                            background: "var(--bg-raised)",
                            color: "var(--text-2)",
                            border: "1px solid var(--border-2)",
                            fontSize: ".72rem",
                            fontWeight: 700,
                            fontFamily: "var(--font-bn)",
                          }}
                        >
                          📞 কল
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {/* Return Banner */}
                {order.status === "RETURNED" && (
                  <div style={{
                    padding: "10px 14px",
                    borderRadius: "var(--r-md)",
                    background: "var(--red-glass)",
                    border: "1px solid var(--red-glow)",
                    fontSize: ".76rem",
                    color: "var(--red)",
                    fontFamily: "var(--font-bn)",
                  }}>
                    ⚠️ <strong>রিটার্ন কারণ:</strong> {order.returnReason || "গ্রাহক অনুপস্থিত ছিলেন।"}
                  </div>
                )}

                {/* Action Buttons */}
                <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                  {/* PENDING: Accept / Decline */}
                  {(order.status === "PENDING" || order.status === "RECEIVED") && (
                    <>
                      <button
                        onClick={() => declineOrder(order.id)}
                        className="btn-secondary"
                        style={{ flex: 1, padding: "12px" }}
                      >
                        বাতিল
                      </button>
                      <button
                        onClick={() => acceptOrder(order.id)}
                        className="btn-primary"
                        style={{ flex: 2, padding: "12px" }}
                      >
                        ⚡ অর্ডার গ্রহণ করুন
                      </button>
                    </>
                  )}

                  {/* PROCESSING: Mark Ready for Pickup & Checklist */}
                  {(order.status === "PROCESSING" || order.status === "PREPARING") && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 8, width: "100%" }}>
                      <button
                        onClick={() => setActiveChecklistOrderId(order.id)}
                        className="btn-secondary"
                        style={{ padding: "10px", fontSize: ".80rem" }}
                      >
                        <CheckSquare size={14} />
                        <span>প্যাকিং চেকলিস্ট যাচাই</span>
                      </button>
                      <button
                        onClick={() => {
                          if (unweighedItem) {
                            reconcileItemWeight(order.id, unweighedItem.id, unweighedItem.weightOrdered || 1.0);
                          }
                          updateOrderStatus(order.id, "READY_FOR_PICKUP");
                        }}
                        className="task-deliver-btn"
                      >
                        <Sparkles size={16} />
                        <span>প্যাকিং সম্পন্ন — রেডি ফর পিকআপ</span>
                      </button>
                    </div>
                  )}

                  {/* READY FOR PICKUP */}
                  {order.status === "READY_FOR_PICKUP" && (
                    <div style={{
                      padding: "12px 14px",
                      borderRadius: "var(--r-md)",
                      background: "rgba(0,214,143,0.1)",
                      border: "1px solid rgba(0,214,143,0.3)",
                      fontSize: ".78rem",
                      color: "var(--emerald)",
                      textAlign: "center",
                      width: "100%",
                      fontFamily: "var(--font-bn)",
                      fontWeight: 700,
                    }}>
                      ✓ পার্সেল রেডি · রাইডার পার্সেল সংগ্রহ করলেই স্বয়ংক্রিয়ভাবে আপডেট হবে
                    </div>
                  )}

                  {/* COMPLETED */}
                  {order.status === "COMPLETED" && (
                    <div style={{
                      padding: "10px 14px",
                      borderRadius: "var(--r-md)",
                      background: "rgba(0,214,143,0.1)",
                      border: "1px solid rgba(0,214,143,0.25)",
                      fontSize: ".78rem",
                      color: "var(--emerald)",
                      textAlign: "center",
                      width: "100%",
                      fontFamily: "var(--font-bn)",
                      fontWeight: 700,
                    }}>
                      ✓ সফলভাবে ডেলিভারি সম্পন্ন হয়েছে
                    </div>
                  )}

                  {/* RETURNED */}
                  {order.status === "RETURNED" && (
                    <Link
                      href="/inventory"
                      className="btn-danger"
                      style={{ width: "100%", textAlign: "center" }}
                    >
                      পুনরায় ইনভেন্টরিতে স্টক যুক্ত করুন
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
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
        onReadyForPickup={(orderId) =>
          updateOrderStatus(orderId, "READY_FOR_PICKUP")
        }
      />
    </div>
  );
}
