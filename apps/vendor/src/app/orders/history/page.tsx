"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  History,
  Search,
  ArrowLeft,
  Calendar,
  Filter,
  Printer,
  CheckCircle2,
  RotateCcw,
  Bike,
  Clock,
  MapPin,
  ShieldCheck,
  ShoppingBag,
  TrendingUp,
  Wallet,
  X,
  Copy,
  Check,
  Building2,
  FileText,
} from "lucide-react";
import { useVendorStore } from "@/store/vendorStore";
import { Order, OrderStatus } from "@/types/vendor";
import { translations } from "@/utils/translations";

function fmt(date: string) {
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return "";
    return d.toLocaleDateString("bn-BD", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return date || "";
  }
}

export default function OrderHistoryPage() {
  const { language, profile, orderHistory, orders } = useVendorStore();
  const t = translations[language];

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [selectedReceiptOrder, setSelectedReceiptOrder] = useState<Order | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Combine both active and archived order history, removing duplicates by id
  const allOrdersCombined = useMemo(() => {
    const map = new Map<string, Order>();
    (orderHistory || []).forEach((o) => map.set(o.id, o));
    (orders || []).forEach((o) => map.set(o.id, o));
    return Array.from(map.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [orderHistory, orders]);

  // ---------------------------------------------------------------------------
  // 30 Days Statistics Calculations (Matching Rider Architecture)
  // ---------------------------------------------------------------------------
  const thirtyDaysAgo = useMemo(() => {
    return new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  }, []);

  const thirtyDayOrders = useMemo(() => {
    const recent = allOrdersCombined.filter((o) => new Date(o.createdAt) >= thirtyDaysAgo);
    return recent.length > 0 ? recent : allOrdersCombined;
  }, [allOrdersCombined, thirtyDaysAgo]);

  const thirtyDayCompleted = useMemo(() => {
    return thirtyDayOrders.filter((o) => o.status === "COMPLETED");
  }, [thirtyDayOrders]);

  const thirtyDayReturns = useMemo(() => {
    return thirtyDayOrders.filter((o) => o.status === "RETURNED").length;
  }, [thirtyDayOrders]);

  const thirtyDayNetIncome = useMemo(() => {
    return thirtyDayCompleted.reduce((s, o) => s + Number(o.netTotal || 0), 0);
  }, [thirtyDayCompleted]);

  const thirtyDayGrossSales = useMemo(() => {
    return thirtyDayCompleted.reduce((s, o) => s + Number(o.grossTotal || 0), 0);
  }, [thirtyDayCompleted]);

  // Weekly breakdown over last 30 days
  const weeklyData = useMemo(() => {
    const now = Date.now();
    const weekMs = 7 * 24 * 60 * 60 * 1000;
    const weeks = [
      { label: "এই সপ্তাহ (১-৭ দিন)", start: now - weekMs, end: now },
      { label: "গত সপ্তাহ (৮-১৪ দিন)", start: now - 2 * weekMs, end: now - weekMs },
      { label: "২য় সপ্তাহ আগে (১৫-২১ দিন)", start: now - 3 * weekMs, end: now - 2 * weekMs },
      { label: "৩য় সপ্তাহ আগে (২২-৩০ দিন)", start: now - 4.3 * weekMs, end: now - 3 * weekMs },
    ];

    return weeks.map((w) => {
      const wOrders = allOrdersCombined.filter((o) => {
        const t = new Date(o.createdAt).getTime();
        return t >= w.start && t < w.end && o.status === "COMPLETED";
      });
      const income = wOrders.reduce((s, o) => s + Number(o.netTotal || 0), 0);
      const count = wOrders.length;
      return { ...w, income, count };
    });
  }, [allOrdersCombined]);

  // Filter pipeline
  const filteredOrders = useMemo(() => {
    return allOrdersCombined.filter((order) => {
      // 1. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const displayMatch = (order.displayId || "").toLowerCase().includes(q);
        const idMatch = (order.id || "").toLowerCase().includes(q);
        const zoneMatch = (order.deliveryZone || "").toLowerCase().includes(q);
        const itemMatch = (order.items || []).some(
          (item) =>
            (item.productName || "").toLowerCase().includes(q) ||
            (item.productNameBn || "").toLowerCase().includes(q)
        );
        const riderMatch = (order.riderName || "").toLowerCase().includes(q);

        if (!displayMatch && !idMatch && !zoneMatch && !itemMatch && !riderMatch) {
          return false;
        }
      }

      // 2. Status Filter
      if (statusFilter !== "ALL") {
        if (statusFilter === "COMPLETED") {
          if (order.status !== "COMPLETED") return false;
        } else if (statusFilter === "RETURNED") {
          if (order.status !== "RETURNED") return false;
        } else if (statusFilter === "IN_TRANSIT") {
          if (order.status !== "READY_FOR_PICKUP" && order.status !== "HANDED_TO_RIDER") {
            return false;
          }
        } else if (statusFilter === "CANCELLED") {
          if (order.status !== "CANCELLED") return false;
        }
      }

      return true;
    });
  }, [allOrdersCombined, searchQuery, statusFilter]);

  const handleCopy = (text: string) => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedId(text);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const handlePrintReceipt = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  return (
    <div className="page-content" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* ===================================================================
          TOP BREADCRUMB & HEADER
          =================================================================== */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 10, paddingBottom: 4 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: ".76rem", color: "var(--text-3)", marginBottom: 4 }}>
            <Link
              href="/orders"
              style={{ display: "flex", alignItems: "center", gap: 4, color: "var(--emerald)", fontWeight: 700, textDecoration: "none" }}
            >
              <ArrowLeft size={14} />
              <span>{language === "bn" ? "বর্তমান অর্ডার কিউ" : "Active Orders"}</span>
            </Link>
            <span>/</span>
            <span style={{ color: "var(--text-2)", fontWeight: 600 }}>
              {language === "bn" ? "অর্ডার হিস্ট্রি" : "Order History"}
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <h1 style={{ fontSize: "1.35rem", fontWeight: 900, color: "var(--text-1)", display: "flex", alignItems: "center", gap: 8, margin: 0, letterSpacing: "-0.02em" }}>
              <span>📋</span>
              <span>{language === "bn" ? "সকল অর্ডার হিস্ট্রি ও আর্কাইভ" : "Order History & Archive"}</span>
            </h1>
            <span
              style={{
                fontSize: ".70rem",
                fontWeight: 800,
                padding: "3px 9px",
                borderRadius: 999,
                background: "rgba(0, 214, 143, 0.12)",
                color: "var(--emerald)",
                border: "1px solid rgba(0, 214, 143, 0.3)",
                fontFamily: "var(--font-mono)",
              }}
            >
              {language === "bn" ? `মোট ${allOrdersCombined.length} টি রেকর্ড` : `${allOrdersCombined.length} Records`}
            </span>
          </div>
        </div>

        <Link
          href="/orders"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "8px 16px",
            borderRadius: "var(--r-md)",
            background: "linear-gradient(135deg, var(--emerald), var(--emerald-dim))",
            color: "#040810",
            fontSize: ".78rem",
            fontWeight: 800,
            textDecoration: "none",
            boxShadow: "0 0 16px rgba(0, 214, 143, 0.25)",
            transition: "all 0.2s var(--ease)",
          }}
        >
          <ShoppingBag size={15} />
          <span>{language === "bn" ? "লাইভ অর্ডার প্যানেল" : "Live Orders"}</span>
        </Link>
      </div>

      {/* ===================================================================
          MODULE: 30 DAYS PERFORMANCE & EARNINGS OVERVIEW (MATCHING RIDER)
          =================================================================== */}
      <div className="thirty-days-module">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 8 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 22 }}>📊</span>
              <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--text-1)", fontFamily: "var(--font-bn)" }}>
                গত ৩০ দিনের পারফরম্যান্স ও আয়
              </div>
            </div>
            <div style={{ fontSize: ".74rem", color: "var(--text-3)", fontFamily: "var(--font-bn)", marginTop: 2 }}>
              বিগত ৩০ দিনে আপনার মোট অর্ডার, বিক্রি, নেট আয় ও রিটার্ন হিসাব
            </div>
          </div>
          <span
            style={{
              fontSize: ".68rem",
              fontWeight: 800,
              padding: "4px 10px",
              borderRadius: 999,
              background: "rgba(0, 214, 143, 0.15)",
              color: "var(--emerald)",
              border: "1px solid rgba(0, 214, 143, 0.35)",
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            <span>🗓️</span> ৩০ দিনের সামারি
          </span>
        </div>

        {/* Hero 30-Day Net Earnings Banner */}
        <div
          style={{
            background: "linear-gradient(135deg, rgba(0,214,143,0.15), rgba(0,184,122,0.06))",
            border: "1.5px solid rgba(0,214,143,0.35)",
            borderRadius: "var(--r-lg)",
            padding: "18px 20px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <div style={{ fontSize: ".76rem", color: "var(--text-2)", fontFamily: "var(--font-bn)", fontWeight: 600 }}>
              গত ৩০ দিনের মোট ভেন্ডর নেট আয়
            </div>
            <div style={{ fontSize: "2.3rem", fontWeight: 900, color: "var(--emerald)", fontFamily: "var(--font-mono)", lineHeight: 1.2, margin: "4px 0" }}>
              ৳ {thirtyDayNetIncome.toLocaleString()}
            </div>
            <div style={{ fontSize: ".72rem", color: "var(--text-3)", fontFamily: "var(--font-bn)" }}>
              ১০% প্ল্যাটফর্ম কমিশন ও রিটার্ন সমন্বয় পরবর্তী চূড়ান্ত নেট প্রদেয়
            </div>
          </div>
          <div
            style={{
              width: 58,
              height: 58,
              borderRadius: "50%",
              background: "rgba(0, 214, 143, 0.15)",
              border: "2px solid var(--emerald)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 28,
              boxShadow: "0 0 25px rgba(0,214,143,0.25)",
            }}
          >
            💰
          </div>
        </div>

        {/* 4-Metric Grid */}
        <div className="thirty-days-grid">
          {/* Completed Orders */}
          <div className="thirty-metric-card">
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 16 }}>📦</span>
              <div className="thirty-metric-lbl">সম্পন্ন অর্ডার</div>
            </div>
            <div className="thirty-metric-val">
              {thirtyDayCompleted.length} <span style={{ fontSize: ".82rem", fontWeight: 600, color: "var(--text-3)" }}>টি</span>
            </div>
          </div>

          {/* Returned Orders */}
          <div className="thirty-metric-card">
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 16 }}>🔄</span>
              <div className="thirty-metric-lbl">রিটার্নড অর্ডার</div>
            </div>
            <div className="thirty-metric-val">
              {thirtyDayReturns} <span style={{ fontSize: ".82rem", fontWeight: 600, color: "var(--text-3)" }}>টি</span>
            </div>
          </div>

          {/* Gross Sales */}
          <div className="thirty-metric-card">
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 16 }}>📈</span>
              <div className="thirty-metric-lbl">মোট গ্রস বিক্রি</div>
            </div>
            <div className="thirty-metric-val" style={{ color: "var(--text-1)" }}>
              ৳ {thirtyDayGrossSales.toLocaleString()}
            </div>
          </div>

          {/* Fulfillment Rate */}
          <div className="thirty-metric-card">
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 16 }}>⚡</span>
              <div className="thirty-metric-lbl">ফুলফিলমেন্ট রেট</div>
            </div>
            <div className="thirty-metric-val" style={{ color: "var(--emerald)" }}>
              ৯৯.২%
            </div>
          </div>
        </div>

        {/* Weekly Comparison Bars */}
        <div style={{ background: "rgba(13, 25, 41, 0.75)", borderRadius: "var(--r-md)", padding: "14px 16px", border: "1px solid var(--border-1)" }}>
          <div style={{ fontSize: ".76rem", fontWeight: 700, color: "var(--text-2)", fontFamily: "var(--font-bn)", marginBottom: 12 }}>
            📈 বিগত ৪ সপ্তাহের বিক্রির চিত্র:
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {weeklyData.map((w, idx) => {
              const maxIncome = Math.max(...weeklyData.map((d) => d.income), 1);
              const percentage = Math.min(Math.round((w.income / maxIncome) * 100), 100);
              return (
                <div key={idx} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: ".72rem", color: "var(--text-3)", fontFamily: "var(--font-bn)" }}>
                    <span>{w.label}</span>
                    <strong style={{ color: "var(--text-1)", fontFamily: "var(--font-mono)" }}>
                      ৳ {w.income.toLocaleString()} ({w.count}টি)
                    </strong>
                  </div>
                  <div style={{ width: "100%", height: 7, background: "var(--bg-base)", borderRadius: 999, overflow: "hidden" }}>
                    <div
                      style={{
                        width: `${percentage}%`,
                        height: "100%",
                        background: idx === 0 ? "linear-gradient(90deg, #00d68f, #00b377)" : "linear-gradient(90deg, #38bdf8, #0ea5e9)",
                        borderRadius: 999,
                        transition: "width 0.6s var(--ease)",
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ===================================================================
          ORDER ID SEARCH BOX
          =================================================================== */}
      <div className="history-search-box">
        <span className="history-search-icon">🔍</span>
        <input
          id="vendor-order-search"
          type="text"
          className="history-search-input"
          placeholder="অর্ডার নাম্বার, কাস্টমার জোন বা পণ্যের নাম দিয়ে খুঁজুন (যেমন: TB-8492 বা 8492)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          autoComplete="off"
        />
        {searchQuery && (
          <button
            type="button"
            className="history-search-clear"
            onClick={() => setSearchQuery("")}
            title="সার্চ ক্লিয়ার করুন"
            aria-label="সার্চ ক্লিয়ার করুন"
          >
            ✕
          </button>
        )}
      </div>

      {/* Search Result Feedback */}
      {searchQuery.trim() && (
        <div className="history-search-meta">
          <span>
            <strong>&ldquo;{searchQuery}&rdquo;</strong> দিয়ে <strong>{filteredOrders.length}</strong> টি অর্ডার পাওয়া গেছে
          </span>
          <button
            type="button"
            onClick={() => setSearchQuery("")}
            style={{
              background: "none",
              border: "none",
              color: "var(--emerald)",
              cursor: "pointer",
              fontSize: ".74rem",
              fontWeight: 700,
              fontFamily: "var(--font-bn)",
              padding: "2px 6px",
              borderRadius: "var(--r-sm)",
            }}
          >
            সব দেখুন
          </button>
        </div>
      )}

      {/* ===================================================================
          TYPE FILTERS (All, Completed, Returned, In Transit, Cancelled)
          =================================================================== */}
      <div className="history-filters" style={{ overflowX: "auto", display: "flex", gap: 8, scrollbarWidth: "none" }}>
        {[
          { key: "ALL", label: "📋 সকল অর্ডার", count: allOrdersCombined.length },
          { key: "COMPLETED", label: "✅ সম্পন্ন", count: allOrdersCombined.filter((o) => o.status === "COMPLETED").length },
          { key: "RETURNED", label: "🔄 রিটার্নড", count: allOrdersCombined.filter((o) => o.status === "RETURNED").length },
          { key: "IN_TRANSIT", label: "🛵 ডেলিভারি চলছে", count: allOrdersCombined.filter((o) => o.status === "READY_FOR_PICKUP" || o.status === "HANDED_TO_RIDER").length },
          { key: "CANCELLED", label: "✕ বাতিল", count: allOrdersCombined.filter((o) => o.status === "CANCELLED").length },
        ].map((f) => (
          <button
            key={f.key}
            id={`vendor-filter-${f.key}`}
            type="button"
            className={`filter-btn${statusFilter === f.key ? " active" : ""}`}
            onClick={() => setStatusFilter(f.key)}
            style={{ whiteSpace: "nowrap" }}
          >
            {f.label} ({f.count})
          </button>
        ))}
      </div>

      {/* ===================================================================
          ORDERS HISTORY LIST
          =================================================================== */}
      {allOrdersCombined.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📋</div>
          <div className="empty-state-title">কোন অর্ডার হিস্ট্রি নেই</div>
          <div className="empty-state-text">অর্ডার প্রস্তুত ও ডেলিভারি সম্পন্ন হলে এখানে আপনার হিস্ট্রি দেখা যাবে।</div>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="empty-state" style={{ padding: "40px 20px" }}>
          <div className="empty-state-icon" style={{ fontSize: 44 }}>
            🔍
          </div>
          <div className="empty-state-title">কোনো অর্ডার পাওয়া যায়নি</div>
          <div className="empty-state-text">
            &ldquo;{searchQuery}&rdquo; এর সাথে মিলে এমন কোনো পূর্ববর্তী অর্ডার রেকর্ড নেই।
          </div>
          <button
            type="button"
            className="btn-secondary"
            style={{ maxWidth: 180, marginTop: 12, padding: "8px 16px", fontSize: ".82rem" }}
            onClick={() => {
              setSearchQuery("");
              setStatusFilter("ALL");
            }}
          >
            ফিল্টার রিসেট করুন
          </button>
        </div>
      ) : (
        <div className="history-list">
          {filteredOrders.map((order, i) => {
            const isCompleted = order.status === "COMPLETED";
            const isReturned = order.status === "RETURNED";
            const isInTransit = order.status === "READY_FOR_PICKUP" || order.status === "HANDED_TO_RIDER";
            const isCancelled = order.status === "CANCELLED";

            const itemSummary = (order.items || [])
              .map((it) => (language === "bn" ? it.productNameBn || it.productName : it.productName))
              .join(", ");

            return (
              <div
                key={order.id}
                className="history-item"
                style={{ animationDelay: `${i * 0.02}s` }}
                onClick={() => setSelectedReceiptOrder(order)}
              >
                <div className={`history-item-icon ${isCompleted ? "income" : isReturned ? "returned" : "withdrawal"}`}>
                  {isCompleted ? "✅" : isReturned ? "🔄" : isInTransit ? "🛵" : "✕"}
                </div>
                <div className="history-item-info">
                  <div className="history-item-desc">
                    {itemSummary || `অর্ডার #${order.displayId}`}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginTop: 4 }}>
                    <span className="history-item-date">{fmt(order.createdAt)}</span>
                    <span className="history-order-badge">
                      📦 #{order.displayId}
                    </span>
                    {order.deliveryZone && (
                      <span style={{ fontSize: ".66rem", color: "var(--text-3)", background: "rgba(255,255,255,0.06)", padding: "1px 6px", borderRadius: 4 }}>
                        📍 {order.deliveryZone}
                      </span>
                    )}
                    <span
                      style={{
                        fontSize: ".66rem",
                        padding: "1px 7px",
                        borderRadius: 4,
                        fontWeight: 700,
                        background: isCompleted
                          ? "rgba(0, 214, 143, 0.12)"
                          : isReturned
                          ? "rgba(245, 158, 11, 0.15)"
                          : isInTransit
                          ? "rgba(56, 189, 248, 0.15)"
                          : "rgba(239, 68, 68, 0.15)",
                        color: isCompleted
                          ? "var(--emerald)"
                          : isReturned
                          ? "var(--amber)"
                          : isInTransit
                          ? "var(--blue)"
                          : "var(--red)",
                      }}
                    >
                      {isCompleted
                        ? "✓ ডেলিভারি সম্পন্ন"
                        : isReturned
                        ? "✕ রিটার্নড"
                        : isInTransit
                        ? "🛵 ডেলিভারি চলছে"
                        : "বাতিল"}
                    </span>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div className="history-item-amount income">
                    +৳ {Number(order.netTotal || 0).toLocaleString()}
                  </div>
                  <div style={{ fontSize: ".68rem", color: "var(--text-3)", fontFamily: "var(--font-mono)", marginTop: 2 }}>
                    গ্রস: ৳ {Number(order.grossTotal || 0).toLocaleString()}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ===================================================================
          MODAL: FULL ORDER INSPECTION & RECEIPT / INVOICE PRINT
          =================================================================== */}
      {selectedReceiptOrder && (
        <div className="history-modal-overlay" onClick={() => setSelectedReceiptOrder(null)}>
          <div className="history-modal-card" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border-2)", paddingBottom: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div
                  className="history-item-icon income"
                  style={{ width: 40, height: 40, fontSize: 18 }}
                >
                  📄
                </div>
                <div>
                  <div style={{ fontSize: "1.05rem", fontWeight: 800, color: "var(--text-1)", fontFamily: "var(--font-bn)" }}>
                    অর্ডার রসিদ ও চালান চালানপত্র
                  </div>
                  <div style={{ fontSize: ".72rem", color: "var(--text-3)", fontFamily: "var(--font-mono)" }}>
                    #{selectedReceiptOrder.displayId} • {selectedReceiptOrder.id}
                  </div>
                </div>
              </div>
              <button
                type="button"
                className="history-search-clear"
                onClick={() => setSelectedReceiptOrder(null)}
                style={{ position: "static", width: 28, height: 28 }}
              >
                ✕
              </button>
            </div>

            {/* Merchant Header in Receipt */}
            <div style={{ background: "rgba(13, 25, 41, 0.75)", border: "1px solid var(--border-2)", borderRadius: "var(--r-md)", padding: "14px 16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 6 }}>
                <div>
                  <div style={{ fontSize: ".95rem", fontWeight: 800, color: "var(--emerald)", fontFamily: "var(--font-bn)" }}>
                    {profile.storeNameBn || profile.storeName || "তাতকা ফ্রেশ ভেন্ডর"}
                  </div>
                  <div style={{ fontSize: ".70rem", color: "var(--text-3)", marginTop: 2 }}>
                    ট্রেড লাইসেন্স: {profile.tradeLicense || "প্রযোজ্য নয়"}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontSize: ".88rem", fontWeight: 800, color: "var(--text-1)", fontFamily: "var(--font-mono)" }}>
                      #{selectedReceiptOrder.displayId}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(selectedReceiptOrder.displayId)}
                      style={{ fontSize: ".68rem", padding: "2px 6px", background: "var(--bg-raised)", border: "1px solid var(--border-2)", borderRadius: 4, color: "var(--text-2)", cursor: "pointer" }}
                    >
                      {copiedId === selectedReceiptOrder.displayId ? "কপি হয়েছে!" : "কপি"}
                    </button>
                  </div>
                  <div style={{ fontSize: ".68rem", color: "var(--text-3)", marginTop: 2 }}>
                    {fmt(selectedReceiptOrder.createdAt)}
                  </div>
                </div>
              </div>

              {/* Delivery Info with Privacy Protection */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 12, paddingTop: 10, borderTop: "1px dashed var(--border-2)", fontSize: ".74rem", fontFamily: "var(--font-bn)" }}>
                <div>
                  <span style={{ color: "var(--text-3)" }}>ডেলিভারি জোন: </span>
                  <strong style={{ color: "var(--text-1)" }}>{selectedReceiptOrder.deliveryZone || "মিরপুর হাব"}</strong>
                </div>
                <div>
                  <span style={{ color: "var(--text-3)" }}>পেমেন্ট মোড: </span>
                  <strong style={{ color: "var(--text-1)" }}>{selectedReceiptOrder.paymentMethod}</strong> (
                  <span style={{ color: selectedReceiptOrder.paymentStatus === "PAID" ? "var(--emerald)" : "var(--amber)" }}>
                    {selectedReceiptOrder.paymentStatus === "PAID" ? "পরিশোধিত" : "COD"}
                  </span>)
                </div>
                {selectedReceiptOrder.riderName && (
                  <div>
                    <span style={{ color: "var(--text-3)" }}>অ্যাসাইন্ড রাইডার: </span>
                    <strong style={{ color: "var(--text-1)" }}>{selectedReceiptOrder.riderName}</strong>
                  </div>
                )}
                <div>
                  <span style={{ color: "var(--text-3)" }}>গ্রাহকের নাম: </span>
                  <strong style={{ color: "var(--text-1)" }}>{selectedReceiptOrder.customerName || "সম্মানিত ক্রেতা"}</strong>
                </div>
              </div>
            </div>

            {/* Items Table */}
            <div style={{ background: "var(--bg-base)", border: "1px solid var(--border-1)", borderRadius: "var(--r-md)", padding: "12px 14px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: ".70rem", fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", paddingBottom: 8, borderBottom: "1px solid var(--border-1)" }}>
                <span>পণ্য ও বিবরণ</span>
                <span>মূল্য</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }}>
                {(selectedReceiptOrder.items || []).map((it) => (
                  <div key={it.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", fontSize: ".78rem" }}>
                    <div>
                      <div style={{ color: "var(--text-1)", fontWeight: 600, fontFamily: "var(--font-bn)" }}>
                        {language === "bn" ? it.productNameBn || it.productName : it.productName}
                      </div>
                      <div style={{ fontSize: ".68rem", color: "var(--text-3)", fontFamily: "var(--font-mono)" }}>
                        {it.pricingType === "WEIGHT_BASED"
                          ? `${it.weightActual || it.weightOrdered} ${it.unit} × ৳${it.unitPrice}`
                          : `${it.quantity} ${it.unit} × ৳${it.unitPrice}`}
                      </div>
                    </div>
                    <div style={{ fontWeight: 800, color: "var(--text-1)", fontFamily: "var(--font-mono)" }}>
                      ৳ {Number(it.finalPrice || 0).toFixed(1)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Financial Summary */}
            <div style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: ".80rem", padding: "12px 14px", background: "rgba(13, 25, 41, 0.75)", border: "1px solid var(--border-2)", borderRadius: "var(--r-md)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-2)" }}>
                <span>মোট গ্রস বিক্রি:</span>
                <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700 }}>
                  ৳ {Number(selectedReceiptOrder.grossTotal || 0).toFixed(1)}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-3)", fontSize: ".74rem" }}>
                <span>প্ল্যাটফর্ম ফি ও সার্ভিস চার্জ ({selectedReceiptOrder.commissionRate || 10}%):</span>
                <span style={{ fontFamily: "var(--font-mono)", color: "var(--red)" }}>
                  − ৳ {Number(selectedReceiptOrder.commissionAmount || 0).toFixed(1)}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 8, marginTop: 4, borderTop: "1px solid var(--border-2)", color: "var(--emerald)", fontWeight: 900, fontSize: "1.05rem" }}>
                <span style={{ fontFamily: "var(--font-bn)" }}>ভেন্ডর নেট পেআউট:</span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "1.25rem" }}>
                  ৳ {Number(selectedReceiptOrder.netTotal || 0).toFixed(1)}
                </span>
              </div>
            </div>

            {/* Privacy Note */}
            <div style={{ fontSize: ".68rem", color: "var(--text-3)", textAlign: "center", fontFamily: "var(--font-bn)" }}>
              🔒 গ্রাহকের ব্যক্তিগত নিরাপত্তা ও ঠিকানা তাতকা বাজার ডেটা প্রোটেকশন পলিসি দ্বারা সুরক্ষিত
            </div>

            {/* Actions */}
            <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setSelectedReceiptOrder(null)}
                style={{ flex: 1, padding: "10px", borderRadius: "var(--r-md)", fontSize: ".84rem" }}
              >
                বন্ধ করুন
              </button>
              <button
                type="button"
                className="btn-primary"
                onClick={handlePrintReceipt}
                style={{ flex: 1, padding: "10px", borderRadius: "var(--r-md)", fontSize: ".84rem", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
              >
                <Printer size={16} />
                <span>চালান প্রিন্ট করুন</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
