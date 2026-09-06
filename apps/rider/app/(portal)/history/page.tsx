"use client";
import React, { useEffect, useState, useMemo } from "react";
import { apiFetch, type HistoryItem } from "@/lib/api";

function fmt(date: string) {
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return "";
    return d.toLocaleDateString("bn-BD", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
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
  const [filter, setFilter] = useState<"all" | "income" | "withdrawal">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    apiFetch<HistoryItem[]>(`/rider-portal/history?type=${filter}&limit=50`)
      .then(r => {
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
  }, [filter]);

  const safeItems = useMemo(() => (Array.isArray(items) ? items : []), [items]);

  const totalIncome = useMemo(
    () => safeItems.filter(i => i.type === "income").reduce((s, i) => s + Number(i.amount || 0), 0),
    [safeItems]
  );
  const totalWithdraw = useMemo(
    () => safeItems.filter(i => i.type === "withdrawal").reduce((s, i) => s + Number(i.amount || 0), 0),
    [safeItems]
  );

  // Filter items based on search query (Order ID or keywords)
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return safeItems;
    const q = searchQuery.trim().toLowerCase();
    return safeItems.filter(item => {
      const orderNo = extractOrderNumber(item)?.toLowerCase() || "";
      const desc = (item.description || "").toLowerCase();
      const id = (item.id || "").toLowerCase();
      // Match full order ID (e.g. "TB-8940"), partial digits ("8940"), description, or ID
      return orderNo.includes(q) || desc.includes(q) || id.includes(q);
    });
  }, [safeItems, searchQuery]);

  return (
    <div className="page-content" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {/* Financial Summary */}
      <div style={{ display: "flex", gap: 10, padding: "12px 16px", background: "var(--bg-card)", borderRadius: "var(--r-lg)", border: "1px solid var(--border-1)" }}>
        <div style={{ flex: 1, textAlign: "center" }}>
          <div style={{ fontSize: ".68rem", color: "var(--text-3)", fontFamily: "var(--font-bn)" }}>মোট ইনকাম</div>
          <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--emerald)" }}>৳ {totalIncome.toLocaleString()}</div>
        </div>
        <div style={{ width: 1, background: "var(--border-1)" }} />
        <div style={{ flex: 1, textAlign: "center" }}>
          <div style={{ fontSize: ".68rem", color: "var(--text-3)", fontFamily: "var(--font-bn)" }}>মোট উইথড্র</div>
          <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--red)" }}>৳ {totalWithdraw.toLocaleString()}</div>
        </div>
      </div>

      {/* Order ID Search Box */}
      <div className="history-search-box">
        <span className="history-search-icon">🔍</span>
        <input
          id="history-order-search"
          type="text"
          className="history-search-input"
          placeholder="অর্ডার আইডি দিয়ে খুঁজুন (যেমন: TB-8940 বা 8940)..."
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

      {/* Type Filters */}
      <div className="history-filters">
        {(["all", "income", "withdrawal"] as const).map(f => (
          <button key={f} id={`filter-${f}`} className={`filter-btn${filter === f ? " active" : ""}`} onClick={() => setFilter(f)}>
            {f === "all" ? "📋 সব" : f === "income" ? "✅ ইনকাম" : "💸 উইথড্র"}
          </button>
        ))}
      </div>

      {/* Loading / Empty / List State */}
      {loading ? (
        <div className="loading-center"><div className="spinner" /></div>
      ) : safeItems.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📋</div>
          <div className="empty-state-title">কোন রেকর্ড নেই</div>
          <div className="empty-state-text">ডেলিভারি শুরু করলে এখানে আপনার ইতিহাস দেখা যাবে।</div>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="empty-state" style={{ padding: "40px 20px" }}>
          <div className="empty-state-icon" style={{ fontSize: 44 }}>🔍</div>
          <div className="empty-state-title">কোনো রেকর্ড পাওয়া যায়নি</div>
          <div className="empty-state-text">
            &ldquo;{searchQuery}&rdquo; আইডি বা বিবরণীর সাথে মিলে এমন কোনো অর্ডার বা ট্রানজ্যাকশন পাওয়া যায়নি।
          </div>
          <button
            type="button"
            className="btn-secondary"
            style={{ maxWidth: 180, marginTop: 8, padding: "8px 16px", fontSize: ".80rem" }}
            onClick={() => setSearchQuery("")}
          >
            সার্চ রিসেট করুন
          </button>
        </div>
      ) : (
        <div className="history-list">
          {filteredItems.map((item, i) => {
            const orderNo = extractOrderNumber(item);
            return (
              <div key={item.id} className="history-item" style={{ animationDelay: `${i * 0.04}s` }}>
                <div className={`history-item-icon ${item.type}`}>
                  {item.type === "income" ? "✅" : "💸"}
                </div>
                <div className="history-item-info">
                  <div className="history-item-desc">{item.description}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <span className="history-item-date">{fmt(item.createdAt)}</span>
                    {orderNo && (
                      <span className="history-order-badge">
                        📦 {orderNo}
                      </span>
                    )}
                    {item.status && (
                      <span className={`badge badge-${item.status.toLowerCase()}`}>
                        {item.status === "PENDING" ? "অপেক্ষারত" : item.status === "COMPLETED" ? "সম্পন্ন" : item.status === "REJECTED" ? "বাতিল" : item.status}
                      </span>
                    )}
                  </div>
                </div>
                <div className={`history-item-amount ${item.type}`}>
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
