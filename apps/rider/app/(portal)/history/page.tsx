"use client";
import React, { useEffect, useState } from "react";
import { apiFetch, type HistoryItem } from "@/lib/api";

function fmt(date: string) {
  const d = new Date(date);
  return d.toLocaleDateString("bn-BD", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default function HistoryPage() {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [filter, setFilter] = useState<"all" | "income" | "withdrawal">("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    apiFetch<HistoryItem[]>(`/rider-portal/history?type=${filter}&limit=50`)
      .then(r => {
        if (r.success && r.data) setItems(r.data as HistoryItem[]);
        setLoading(false);
      });
  }, [filter]);

  const totalIncome = items.filter(i => i.type === "income").reduce((s, i) => s + Number(i.amount), 0);
  const totalWithdraw = items.filter(i => i.type === "withdrawal").reduce((s, i) => s + Number(i.amount), 0);

  return (
    <div className="page-content">
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

      <div className="history-filters">
        {(["all", "income", "withdrawal"] as const).map(f => (
          <button key={f} id={`filter-${f}`} className={`filter-btn${filter === f ? " active" : ""}`} onClick={() => setFilter(f)}>
            {f === "all" ? "📋 সব" : f === "income" ? "✅ ইনকাম" : "💸 উইথড্র"}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="loading-center"><div className="spinner" /></div>
      ) : items.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📋</div>
          <div className="empty-state-title">কোন রেকর্ড নেই</div>
          <div className="empty-state-text">ডেলিভারি শুরু করলে এখানে আপনার ইতিহাস দেখা যাবে।</div>
        </div>
      ) : (
        <div className="history-list">
          {items.map((item, i) => (
            <div key={item.id} className="history-item" style={{ animationDelay: `${i * 0.05}s` }}>
              <div className={`history-item-icon ${item.type}`}>
                {item.type === "income" ? "✅" : "💸"}
              </div>
              <div className="history-item-info">
                <div className="history-item-desc">{item.description}</div>
                <div className="history-item-date">{fmt(item.createdAt)}</div>
                {item.status && <span className={`badge badge-${item.status.toLowerCase()}`}>{item.status === "PENDING" ? "অপেক্ষারত" : item.status === "COMPLETED" ? "সম্পন্ন" : item.status === "REJECTED" ? "বাতিল" : item.status}</span>}
              </div>
              <div className={`history-item-amount ${item.type}`}>
                {item.type === "income" ? "+" : "−"}৳ {Number(item.amount).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
