"use client";
import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { apiFetch, type RiderNotification } from "@/lib/api";

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "এইমাত্র";
  if (mins < 60) return `${mins} মিনিট আগে`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} ঘণ্টা আগে`;
  return `${Math.floor(hrs / 24)} দিন আগে`;
}

const TYPE_META: Record<string, { icon: string; color: string; bg: string }> = {
  TASK:    { icon: "📦", color: "#f97316", bg: "rgba(249,115,22,.12)" },
  PAYMENT: { icon: "💰", color: "#00d68f", bg: "rgba(0,214,143,.12)" },
  SYSTEM:  { icon: "🔔", color: "#818cf8", bg: "rgba(129,140,248,.12)" },
};

export default function NotificationsPage() {
  const router = useRouter();
  const [notifs, setNotifs] = useState<RiderNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);

  const fetchNotifs = useCallback(async () => {
    const res = await apiFetch<RiderNotification[]>("/rider-portal/notifications");
    if (res.success && Array.isArray(res.data)) setNotifs(res.data as RiderNotification[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchNotifs();
  }, [fetchNotifs]);

  async function markAllRead() {
    setMarking(true);
    await apiFetch("/rider-portal/notifications/read", { method: "POST" });
    setNotifs(prev => prev.map(n => ({ ...n, isRead: true })));
    setMarking(false);
  }

  const unreadCount = notifs.filter(n => !n.isRead).length;

  return (
    <div className="page-content">
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button
            onClick={() => router.back()}
            style={{ background: "var(--bg-card)", border: "1px solid var(--border-1)", borderRadius: "50%", width: 38, height: 38, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--text-2)", flexShrink: 0 }}
          >
            <svg fill="none" viewBox="0 0 24 24" style={{ width: 18, height: 18, stroke: "currentColor" }}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <div>
            <div style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text-1)", display: "flex", alignItems: "center", gap: 8 }}>
              নোটিফিকেশন
              {unreadCount > 0 && (
                <span style={{ background: "#ef4444", color: "#fff", borderRadius: "999px", fontSize: ".6rem", fontWeight: 800, minWidth: 18, height: 18, display: "inline-flex", alignItems: "center", justifyContent: "center", padding: "0 5px" }}>
                  {unreadCount}
                </span>
              )}
            </div>
            <div style={{ fontSize: ".74rem", color: "var(--text-3)", fontFamily: "var(--font-bn)" }}>সকল বার্তা</div>
          </div>
        </div>
        {unreadCount > 0 && (
          <button
            id="mark-all-read-btn"
            onClick={markAllRead}
            disabled={marking}
            style={{ fontSize: ".74rem", color: "var(--orange)", fontFamily: "var(--font-bn)", background: "none", border: "none", cursor: "pointer", padding: "6px 10px" }}
          >
            {marking ? "..." : "সব পড়া হয়েছে"}
          </button>
        )}
      </div>

      {loading && <div className="loading-center"><div className="spinner" /></div>}

      {!loading && notifs.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">🔔</div>
          <div className="empty-state-title">কোন নোটিফিকেশন নেই</div>
          <div className="empty-state-text">নতুন বার্তা আসলে এখানে দেখা যাবে</div>
        </div>
      )}

      {!loading && notifs.map((n, i) => {
        const meta = TYPE_META[n.type] ?? TYPE_META["SYSTEM"]!;
        return (
          <div
            key={n.id}
            style={{
              display: "flex",
              gap: 14,
              padding: "16px",
              background: n.isRead ? "var(--bg-card)" : meta.bg,
              border: `1px solid ${n.isRead ? "var(--border-1)" : meta.color + "44"}`,
              borderRadius: "var(--r-lg)",
              marginBottom: 10,
              animationDelay: `${i * 0.05}s`,
              animation: "fadeUp .3s both",
              position: "relative",
            }}
          >
            <div style={{ fontSize: "1.6rem", flexShrink: 0, lineHeight: 1 }}>{meta.icon}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8, marginBottom: 4 }}>
                <div style={{ fontSize: ".88rem", fontWeight: n.isRead ? 600 : 800, color: "var(--text-1)", lineHeight: 1.3 }}>
                  {n.title}
                </div>
                {!n.isRead && (
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#ef4444", flexShrink: 0, marginTop: 4 }} />
                )}
              </div>
              <div style={{ fontSize: ".78rem", color: "var(--text-2)", fontFamily: "var(--font-bn)", lineHeight: 1.5, marginBottom: 6 }}>
                {n.body}
              </div>
              <div style={{ fontSize: ".68rem", color: "var(--text-3)" }}>
                {timeAgo(n.createdAt)}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
