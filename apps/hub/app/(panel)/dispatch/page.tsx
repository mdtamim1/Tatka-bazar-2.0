"use client";
import React, { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { Radio, RefreshCw, Zap } from "lucide-react";

interface DispatchTask {
  id?: string;
  orderNumber?: string;
  customerName?: string;
  deliveryAddress?: string;
  deliveryZone?: string;
  vendorName?: string;
  status?: string;
  claimed?: boolean;
  claimedBy?: { riderName?: string; riderPhone?: string; claimedAt?: string };
  riderName?: string;
  total?: number;
  earnings?: number;
  paymentStatus?: string;
  createdAt?: string;
}

const STATUS_BN: Record<string, string> = {
  READY_FOR_PICKUP: "পিকআপ অপেক্ষায়",
  ASSIGNED: "রাইডার পেয়েছে",
  ON_THE_WAY: "ডেলিভারিতে",
  DELIVERED: "ডেলিভার হয়েছে",
  RETURNED: "রিটার্ন হয়েছে",
};
const STATUS_BADGE: Record<string, string> = {
  READY_FOR_PICKUP: "badge-orange",
  ASSIGNED: "badge-blue",
  ON_THE_WAY: "badge-purple",
  DELIVERED: "badge-green",
  RETURNED: "badge-red",
};

function timeAgo(ts?: string) {
  if (!ts) return "";
  const diff = Date.now() - new Date(ts).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "এইমাত্র";
  if (m < 60) return `${m} মি. আগে`;
  return `${Math.floor(m / 60)} ঘণ্টা আগে`;
}

export default function DispatchPage() {
  const { session } = useAuth();
  const token = session?.token || "";
  const [tasks, setTasks] = useState<DispatchTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [filter, setFilter] = useState("ALL");

  const fetchDispatch = useCallback(async () => {
    const res = await fetch("/api/proxy/dispatch", { headers: { Authorization: `Bearer ${token}` } });
    const json = await res.json();
    if (json.success && Array.isArray(json.data)) {
      setTasks(json.data);
    } else {
      setTasks([]);
    }
    setLoading(false);
    setLastUpdated(new Date());
  }, [token]);

  useEffect(() => { fetchDispatch(); }, [fetchDispatch]);
  useEffect(() => {
    const iv = setInterval(fetchDispatch, 8000);
    return () => clearInterval(iv);
  }, [fetchDispatch]);

  const filtered = filter === "ALL" ? tasks : tasks.filter((t) => t.status === filter || (filter === "UNCLAIMED" && !t.claimed));
  const counts = {
    ALL: tasks.length,
    UNCLAIMED: tasks.filter(t => !t.claimed).length,
    ON_THE_WAY: tasks.filter(t => t.status === "ON_THE_WAY").length,
    DELIVERED: tasks.filter(t => t.status === "DELIVERED").length,
  };

  return (
    <div className="hub-content">
      <div className="page-header">
        <div className="flex-between">
          <div>
            <h1 className="page-title"><Radio size={22} /><span className="font-bn">লাইভ ডিসপ্যাচ</span></h1>
            <p className="page-subtitle font-bn">
              সর্বশেষ: {lastUpdated.toLocaleTimeString("bn-BD")} •
              মোট {tasks.length}টি অর্ডার চলছে
            </p>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <span className="badge badge-green" style={{ fontSize: 10 }}>
              <span className="dot dot-green dot-pulse" style={{ width: 6, height: 6 }} /> LIVE
            </span>
            <button onClick={fetchDispatch} className="btn btn-ghost btn-sm">
              <RefreshCw size={13} /><span className="font-bn">রিফ্রেশ</span>
            </button>
          </div>
        </div>
      </div>

      {/* Quick stats */}
      <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
        {[
          { label: "মোট", val: tasks.length, color: "var(--text-primary)", bg: "var(--bg-card)" },
          { label: "ক্লেইম বাকি", val: counts.UNCLAIMED, color: "var(--accent-orange)", bg: "rgba(255,122,0,0.1)" },
          { label: "ডেলিভারিতে", val: counts.ON_THE_WAY, color: "var(--accent-purple)", bg: "rgba(124,92,252,0.1)" },
          { label: "সম্পন্ন", val: counts.DELIVERED, color: "var(--accent-green)", bg: "rgba(0,214,143,0.1)" },
        ].map((s) => (
          <div key={s.label} style={{
            background: s.bg, border: "1px solid var(--border)",
            borderRadius: "var(--radius-md)", padding: "10px 18px",
            display: "flex", flexDirection: "column", gap: 2,
          }}>
            <span style={{ fontSize: 22, fontWeight: 800, color: s.color }}>{s.val}</span>
            <span className="font-bn text-xs text-muted">{s.label}</span>
          </div>
        ))}
      </div>

      <div className="tabs">
        {[
          ["ALL", `সব (${counts.ALL})`],
          ["UNCLAIMED", `ক্লেইম বাকি (${counts.UNCLAIMED})`],
          ["ON_THE_WAY", `ডেলিভারিতে (${counts.ON_THE_WAY})`],
          ["DELIVERED", `সম্পন্ন (${counts.DELIVERED})`],
        ].map(([val, label]) => (
          <button key={val} className={`tab-btn font-bn${filter === val ? " active" : ""}`} onClick={() => setFilter(val as string)}>
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[1,2,3].map((i) => <div key={i} className="skeleton" style={{ height: 90, borderRadius: 12 }} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card"><div className="empty-state">
          <div className="empty-state-icon"><Zap size={40} style={{ opacity: 0.2, margin: "0 auto 12px" }} /></div>
          <div className="empty-state-title font-bn">কোনো অর্ডার নেই</div>
          <p className="text-sm text-muted font-bn" style={{ marginTop: 6 }}>
            Rider portal থেকে dispatch হলে এখানে দেখাবে
          </p>
        </div></div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {filtered.map((t, idx) => (
            <div key={t.id || t.orderNumber || idx} className="card" style={{ padding: 14 }}>
              <div className="flex-between" style={{ flexWrap: "wrap", gap: 10 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                    <span style={{ fontWeight: 700, fontSize: 14, color: "var(--text-primary)" }}>
                      #{t.orderNumber || t.id || "N/A"}
                    </span>
                    <span className={`badge ${STATUS_BADGE[t.status || ""] || "badge-gray"}`}>
                      <span className="font-bn">{STATUS_BN[t.status || ""] || t.status || "অজানা"}</span>
                    </span>
                    {t.claimed && (
                      <span className="badge badge-blue">
                        <span className="font-bn">ক্লেইমড</span>
                      </span>
                    )}
                  </div>
                  <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                    <span className="text-sm text-muted font-bn">🏪 {t.vendorName || "ভেন্ডর"}</span>
                    <span className="text-sm text-muted font-bn">📍 {t.deliveryAddress || t.deliveryZone || "ঠিকানা অজানা"}</span>
                    {t.total && <span className="text-sm text-muted">৳{t.total.toLocaleString()}</span>}
                    {t.paymentStatus && <span className={`badge ${t.paymentStatus === "PAID" ? "badge-green" : "badge-orange"} text-xs`}>{t.paymentStatus === "PAID" ? "PAID" : "COD"}</span>}
                  </div>
                  {t.claimedBy?.riderName && (
                    <div className="text-xs text-muted mt-1 font-bn">
                      🛵 {t.claimedBy.riderName} • {t.claimedBy.riderPhone} • {timeAgo(t.claimedBy.claimedAt)}
                    </div>
                  )}
                  {t.riderName && !t.claimedBy && (
                    <div className="text-xs text-muted mt-1 font-bn">🛵 {t.riderName}</div>
                  )}
                </div>
                <div className="text-xs text-muted font-bn" style={{ flexShrink: 0 }}>
                  {timeAgo(t.createdAt)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
