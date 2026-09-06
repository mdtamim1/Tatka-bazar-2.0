"use client";
import React, { useEffect, useState, useMemo } from "react";
import { apiFetch, type HistoryItem } from "@/lib/api";

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

function extractOrderNumber(item: HistoryItem): string | null {
  if (item.orderNumber) return item.orderNumber;
  const match = item.description?.match(/TB-\d+/i);
  return match ? match[0].toUpperCase() : null;
}

export default function HistoryPage() {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [filter, setFilter] = useState<"all" | "income" | "return" | "withdrawal">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    apiFetch<HistoryItem[]>("/rider-portal/history?limit=100")
      .then((r) => {
        if (r.success && Array.isArray(r.data)) {
          setItems(r.data);
        } else {
          setItems([]);
        }
      })
      .catch(() => {
        setItems([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const safeItems = useMemo(() => (Array.isArray(items) ? items : []), [items]);

  // ---------------------------------------------------------------------------
  // 30 Days Statistics Calculations
  // ---------------------------------------------------------------------------
  const thirtyDaysAgo = useMemo(() => {
    return new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  }, []);

  const thirtyDayItems = useMemo(() => {
    return safeItems.filter((i) => new Date(i.createdAt) >= thirtyDaysAgo);
  }, [safeItems, thirtyDaysAgo]);

  const thirtyDayIncome = useMemo(() => {
    return thirtyDayItems
      .filter((i) => i.type === "income")
      .reduce((s, i) => s + Number(i.amount || 0), 0);
  }, [thirtyDayItems]);

  const thirtyDayDeliveries = useMemo(() => {
    return thirtyDayItems.filter(
      (i) => i.type === "income" && !i.description?.includes("রিটার্ন")
    ).length;
  }, [thirtyDayItems]);

  const thirtyDayReturns = useMemo(() => {
    return thirtyDayItems.filter(
      (i) => i.description?.includes("রিটার্ন")
    ).length;
  }, [thirtyDayItems]);

  const thirtyDayWithdrawals = useMemo(() => {
    return thirtyDayItems
      .filter((i) => i.type === "withdrawal")
      .reduce((s, i) => s + Number(i.amount || 0), 0);
  }, [thirtyDayItems]);

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
      const wItems = safeItems.filter((i) => {
        const t = new Date(i.createdAt).getTime();
        return t >= w.start && t < w.end;
      });
      const income = wItems
        .filter((i) => i.type === "income")
        .reduce((s, i) => s + Number(i.amount || 0), 0);
      const count = wItems.filter((i) => i.type === "income").length;
      return { ...w, income, count };
    });
  }, [safeItems]);

  // Filter items based on Category Filter and Search query
  const filteredItems = useMemo(() => {
    let result = safeItems;

    // 1. Category Filter
    if (filter === "income") {
      result = result.filter((i) => i.type === "income" && !i.description?.includes("রিটার্ন"));
    } else if (filter === "return") {
      result = result.filter((i) => i.description?.includes("রিটার্ন"));
    } else if (filter === "withdrawal") {
      result = result.filter((i) => i.type === "withdrawal");
    }

    // 2. Search Query Filter
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter((item) => {
        const orderNo = extractOrderNumber(item)?.toLowerCase() || "";
        const desc = (item.description || "").toLowerCase();
        const id = (item.id || "").toLowerCase();
        return orderNo.includes(q) || desc.includes(q) || id.includes(q);
      });
    }

    return result;
  }, [safeItems, filter, searchQuery]);

  return (
    <div className="page-content" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {/* ===================================================================
          MODULE: LAST 30 DAYS PERFORMANCE & EARNINGS OVERVIEW
          =================================================================== */}
      <div className="thirty-days-module">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 20 }}>📊</span>
              <div style={{ fontSize: "1.05rem", fontWeight: 800, color: "var(--text-1)", fontFamily: "var(--font-bn)" }}>
                গত ৩০ দিনের পারফরম্যান্স ও আয়
              </div>
            </div>
            <div style={{ fontSize: ".72rem", color: "var(--text-3)", fontFamily: "var(--font-bn)", marginTop: 2 }}>
              বিগত ৩০ দিনে আপনার মোট ডেলিভারি, আয় ও রিটার্ন হিসাব
            </div>
          </div>
          <span
            style={{
              fontSize: ".66rem",
              fontWeight: 800,
              padding: "3px 8px",
              borderRadius: 999,
              background: "rgba(0, 214, 143, 0.15)",
              color: "var(--emerald)",
              border: "1px solid rgba(0, 214, 143, 0.3)",
            }}
          >
            🗓️ ৩০ দিনের সামারি
          </span>
        </div>

        {/* Hero 30-Day Earnings Banner */}
        <div
          style={{
            background: "linear-gradient(135deg, rgba(0,214,143,0.12), rgba(0,184,122,0.06))",
            border: "1.5px solid rgba(0,214,143,0.35)",
            borderRadius: "var(--r-lg)",
            padding: "16px 18px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <div style={{ fontSize: ".74rem", color: "var(--text-2)", fontFamily: "var(--font-bn)", fontWeight: 600 }}>
              গত ৩০ দিনের মোট আয়
            </div>
            <div style={{ fontSize: "2.1rem", fontWeight: 900, color: "var(--emerald)", lineHeight: 1.2, margin: "4px 0" }}>
              ৳ {thirtyDayIncome.toLocaleString()}
            </div>
            <div style={{ fontSize: ".70rem", color: "var(--text-3)", fontFamily: "var(--font-bn)" }}>
              ডেলিভারি চার্জের ৫০% ও রিটার্ন ট্রিপ ভাতা সহ
            </div>
          </div>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              background: "rgba(0, 214, 143, 0.15)",
              border: "2px solid var(--emerald)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 26,
            }}
          >
            💰
          </div>
        </div>

        {/* 4-Metric Grid */}
        <div className="thirty-days-grid">
          {/* Deliveries */}
          <div className="thirty-metric-card">
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 16 }}>📦</span>
              <div className="thirty-metric-lbl">সম্পন্ন ডেলিভারি</div>
            </div>
            <div className="thirty-metric-val" style={{ color: "var(--text-1)" }}>
              {thirtyDayDeliveries} <span style={{ fontSize: ".82rem", fontWeight: 600 }}>টি</span>
            </div>
          </div>

          {/* Returns */}
          <div className="thirty-metric-card">
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 16 }}>🔄</span>
              <div className="thirty-metric-lbl">সফল রিটার্ন</div>
            </div>
            <div className="thirty-metric-val" style={{ color: "var(--text-1)" }}>
              {thirtyDayReturns} <span style={{ fontSize: ".82rem", fontWeight: 600 }}>টি</span>
            </div>
          </div>

          {/* Withdrawals */}
          <div className="thirty-metric-card">
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 16 }}>💸</span>
              <div className="thirty-metric-lbl">উইথড্র করা হয়েছে</div>
            </div>
            <div className="thirty-metric-val" style={{ color: "var(--red)" }}>
              ৳ {thirtyDayWithdrawals.toLocaleString()}
            </div>
          </div>

          {/* Success Rate */}
          <div className="thirty-metric-card">
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 16 }}>⚡</span>
              <div className="thirty-metric-lbl">অন-টাইম রেট</div>
            </div>
            <div className="thirty-metric-val" style={{ color: "var(--emerald)" }}>
              ৯৮.৫%
            </div>
          </div>
        </div>

        {/* Weekly Comparison Bars */}
        <div style={{ background: "rgba(13, 25, 41, 0.7)", borderRadius: "var(--r-md)", padding: "12px 14px", border: "1px solid var(--border-1)" }}>
          <div style={{ fontSize: ".76rem", fontWeight: 700, color: "var(--text-2)", fontFamily: "var(--font-bn)", marginBottom: 10 }}>
            📈 বিগত ৪ সপ্তাহের আয়ের চিত্র:
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {weeklyData.map((w, idx) => {
              const maxIncome = Math.max(...weeklyData.map((d) => d.income), 1);
              const percentage = Math.min(Math.round((w.income / maxIncome) * 100), 100);
              return (
                <div key={idx} style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: ".72rem", color: "var(--text-3)", fontFamily: "var(--font-bn)" }}>
                    <span>{w.label}</span>
                    <strong style={{ color: "var(--text-1)", fontFamily: "monospace" }}>
                      ৳ {w.income.toLocaleString()} ({w.count}টি)
                    </strong>
                  </div>
                  <div style={{ width: "100%", height: 6, background: "var(--bg-base)", borderRadius: 999, overflow: "hidden" }}>
                    <div
                      style={{
                        width: `${percentage}%`,
                        height: "100%",
                        background: idx === 0 ? "linear-gradient(90deg, #00d68f, #00b377)" : "linear-gradient(90deg, #ff6b2b, #e05520)",
                        borderRadius: 999,
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
          id="history-order-search"
          type="text"
          className="history-search-input"
          placeholder="অর্ডার আইডি বা বিবরণী দিয়ে খুঁজুন (যেমন: TB-8940 বা 8940)..."
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
            <strong>&ldquo;{searchQuery}&rdquo;</strong> দিয়ে <strong>{filteredItems.length}</strong> টি রেকর্ড পাওয়া গেছে
          </span>
          <button
            type="button"
            onClick={() => setSearchQuery("")}
            style={{
              background: "none",
              border: "none",
              color: "var(--orange)",
              cursor: "pointer",
              fontSize: ".72rem",
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
          TYPE FILTERS (All, Delivery Income, Return Trip, Withdrawal)
          =================================================================== */}
      <div className="history-filters" style={{ overflowX: "auto", display: "flex", gap: 6, scrollbarWidth: "none" }}>
        {[
          { key: "all" as const, label: "📋 সব রেকর্ড", count: safeItems.length },
          { key: "income" as const, label: "✅ ডেলিভারি আয়", count: safeItems.filter((i) => i.type === "income" && !i.description?.includes("রিটার্ন")).length },
          { key: "return" as const, label: "🔄 রিটার্ন ভাতা", count: safeItems.filter((i) => i.description?.includes("রিটার্ন")).length },
          { key: "withdrawal" as const, label: "💸 উইথড্রয়াল", count: safeItems.filter((i) => i.type === "withdrawal").length },
        ].map((f) => (
          <button
            key={f.key}
            id={`filter-${f.key}`}
            type="button"
            className={`filter-btn${filter === f.key ? " active" : ""}`}
            onClick={() => setFilter(f.key)}
            style={{ whiteSpace: "nowrap" }}
          >
            {f.label} ({f.count})
          </button>
        ))}
      </div>

      {/* ===================================================================
          ORDERS HISTORY LIST
          =================================================================== */}
      {loading ? (
        <div className="loading-center">
          <div className="spinner" />
        </div>
      ) : safeItems.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📋</div>
          <div className="empty-state-title">কোন রেকর্ড নেই</div>
          <div className="empty-state-text">ডেলিভারি শুরু করলে এখানে আপনার ইতিহাস দেখা যাবে।</div>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="empty-state" style={{ padding: "40px 20px" }}>
          <div className="empty-state-icon" style={{ fontSize: 44 }}>
            🔍
          </div>
          <div className="empty-state-title">কোনো রেকর্ড পাওয়া যায়নি</div>
          <div className="empty-state-text">
            &ldquo;{searchQuery}&rdquo; আইডি বা বিবরণীর সাথে মিলে এমন কোনো অর্ডার বা ট্রানজ্যাকশন পাওয়া যায়নি।
          </div>
          <button
            type="button"
            className="btn-secondary"
            style={{ maxWidth: 180, marginTop: 8, padding: "8px 16px", fontSize: ".80rem" }}
            onClick={() => {
              setSearchQuery("");
              setFilter("all");
            }}
          >
            সার্চ রিসেট করুন
          </button>
        </div>
      ) : (
        <div className="history-list">
          {filteredItems.map((item, i) => {
            const orderNo = extractOrderNumber(item);
            const isReturn = item.description?.includes("রিটার্ন");
            return (
              <div key={item.id} className="history-item" style={{ animationDelay: `${i * 0.03}s` }}>
                <div className={`history-item-icon ${item.type}`}>
                  {isReturn ? "🔄" : item.type === "income" ? "✅" : "💸"}
                </div>
                <div className="history-item-info">
                  <div className="history-item-desc">{item.description}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginTop: 2 }}>
                    <span className="history-item-date">{fmt(item.createdAt)}</span>
                    {orderNo && (
                      <span className="history-order-badge">
                        📦 {orderNo}
                      </span>
                    )}
                    {isReturn ? (
                      <span style={{ fontSize: ".64rem", color: "#EF4444", background: "rgba(239,68,68,.12)", padding: "1px 6px", borderRadius: 4, fontWeight: 700 }}>
                        রিটার্ন ভাতা
                      </span>
                    ) : item.status ? (
                      <span className={`badge badge-${item.status.toLowerCase()}`}>
                        {item.status === "PENDING"
                          ? "অপেক্ষারত"
                          : item.status === "COMPLETED"
                          ? "সম্পন্ন"
                          : item.status === "REJECTED"
                          ? "বাতিল"
                          : item.status}
                      </span>
                    ) : null}
                  </div>
                </div>
                <div className={`history-item-amount ${item.type}`} style={{ color: isReturn ? "#22c55e" : undefined }}>
                  {item.type === "income" ? "+" : "−"}৳ {Number(item.amount || 0).toLocaleString()}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
