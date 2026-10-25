"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  Bell, Send, CheckCircle2, RefreshCw, Users, Store,
  Megaphone, Clock, AlertCircle,
} from "lucide-react";

interface BroadcastRecord {
  id: string;
  title: string;
  body: string;
  targetType: "ALL_RIDERS" | "ALL_VENDORS" | "ALL";
  sentByName: string;
  recipientCount: number;
  sentAt: string;
}

const TARGET_OPTIONS = [
  { value: "ALL_RIDERS",  label: "All Riders",             icon: "🚴", desc: "সকল সক্রিয় ও KYC-approved রাইডার" },
  { value: "ALL_VENDORS", label: "All Vendors",             icon: "🏪", desc: "সকল সক্রিয় ভেন্ডর" },
  { value: "ALL",         label: "Everyone (Riders + Vendors)", icon: "📣", desc: "সকল রাইডার ও ভেন্ডর" },
];

const TARGET_LABEL: Record<string, string> = {
  ALL_RIDERS:  "All Riders",
  ALL_VENDORS: "All Vendors",
  ALL:         "Everyone",
};

const TARGET_COLOR: Record<string, string> = {
  ALL_RIDERS:  "#6366f1",
  ALL_VENDORS: "#10b981",
  ALL:         "#f59e0b",
};

function HistoryCard({ b }: { b: BroadcastRecord }) {
  const color = TARGET_COLOR[b.targetType] || "#6366f1";
  return (
    <div style={{
      padding: "14px 16px", borderRadius: 10,
      background: "var(--surface-2)", border: "1px solid var(--border)",
      transition: "border-color 0.15s ease",
    }}>
      <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
        <div style={{
          width: 36, height: 36, borderRadius: 8, flexShrink: 0,
          background: `${color}18`, display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 16,
        }}>
          🔔
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: "0.9rem", color: "var(--text-primary)", marginBottom: 3 }}>
            {b.title}
          </div>
          <div style={{ fontSize: "0.80rem", color: "var(--text-2)", marginBottom: 8, lineHeight: 1.4 }}>
            {b.body}
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
            <span style={{
              display: "inline-flex", alignItems: "center", gap: 4,
              padding: "2px 8px", borderRadius: 20,
              fontSize: "0.70rem", fontWeight: 600,
              color, background: `${color}15`, border: `1px solid ${color}30`,
            }}>
              {b.targetType === "ALL_RIDERS" ? <Users size={10} />
                : b.targetType === "ALL_VENDORS" ? <Store size={10} />
                : <Megaphone size={10} />}
              {TARGET_LABEL[b.targetType]}
            </span>
            {b.recipientCount > 0 && (
              <span style={{ fontSize: "0.70rem", color: "var(--text-3)" }}>
                👥 {b.recipientCount} recipients
              </span>
            )}
            <span style={{ fontSize: "0.70rem", color: "var(--text-3)", marginLeft: "auto" }}>
              <Clock size={10} style={{ display: "inline", verticalAlign: "middle", marginRight: 3 }} />
              {new Date(b.sentAt).toLocaleString("en-BD", { dateStyle: "short", timeStyle: "short" })}
            </span>
          </div>
          <div style={{ fontSize: "0.70rem", color: "var(--text-3)", marginTop: 4 }}>
            Sent by {b.sentByName}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function NotificationsPage() {
  const { session } = useAuth();
  const token = session?.token || "";
  const canSend = session?.role !== "VIEWER";

  const [targetType, setTargetType] = useState<"ALL_RIDERS" | "ALL_VENDORS" | "ALL">("ALL_RIDERS");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [history, setHistory] = useState<BroadcastRecord[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  // ── Load broadcast history from API ──────────────────────────────────────
  const fetchHistory = useCallback(async () => {
    setLoadingHistory(true);
    try {
      const res = await fetch("/api/hub/notifications", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (json.success) setHistory(json.data);
    } catch { /* ignore */ } finally {
      setLoadingHistory(false);
    }
  }, [token]);

  useEffect(() => { fetchHistory(); }, [fetchHistory]);

  // ── Send broadcast via real API ───────────────────────────────────────────
  async function handleSend() {
    if (!title.trim() || !body.trim()) return;
    setSending(true);
    setError("");
    setSuccessMsg("");
    try {
      const res = await fetch("/api/hub/notifications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title: title.trim(), body: body.trim(), targetType }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Failed to send");

      // Prepend the new record to history
      if (json.data) setHistory((prev) => [json.data, ...prev]);
      setTitle("");
      setBody("");
      setSuccessMsg(json.message || "Broadcast sent successfully!");
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err: any) {
      setError(err.message || "কোনো সমস্যা হয়েছে। আবার চেষ্টা করুন।");
    } finally {
      setSending(false);
    }
  }

  const selectedOption = TARGET_OPTIONS.find((o) => o.value === targetType)!;

  return (
    <div className="hub-content">
      <div className="page-header">
        <h1 className="page-title"><Bell size={22} /><span>Broadcast Notifications</span></h1>
        <p className="page-subtitle">সকল রাইডার ও ভেন্ডরদের কাছে announcement পাঠান</p>
      </div>

      <div className="grid-2" style={{ gap: 20, alignItems: "flex-start" }}>

        {/* ── Compose Form ─────────────────────────────────────────────── */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">📢 New Broadcast</div>
          </div>

          {/* Success banner */}
          {successMsg && (
            <div style={{
              display: "flex", alignItems: "center", gap: 8,
              background: "rgba(16,185,129,0.10)", border: "1px solid rgba(16,185,129,0.25)",
              color: "#10b981", padding: "10px 14px", borderRadius: 8,
              fontSize: 13, marginBottom: 16,
            }}>
              <CheckCircle2 size={15} />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Error banner */}
          {error && (
            <div style={{
              display: "flex", alignItems: "center", gap: 8,
              background: "rgba(239,68,68,0.10)", border: "1px solid rgba(239,68,68,0.25)",
              color: "#ef4444", padding: "10px 14px", borderRadius: 8,
              fontSize: 13, marginBottom: 16,
            }}>
              <AlertCircle size={15} />
              <span>{error}</span>
            </div>
          )}

          {/* Target Type */}
          <div className="form-group">
            <label className="form-label">Target Audience</label>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {TARGET_OPTIONS.map((opt) => {
                const isSelected = targetType === opt.value;
                const color = TARGET_COLOR[opt.value];
                return (
                  <div
                    key={opt.value}
                    onClick={() => setTargetType(opt.value as any)}
                    style={{
                      display: "flex", alignItems: "center", gap: 12, padding: "10px 14px",
                      borderRadius: 8, cursor: "pointer",
                      background: isSelected ? `${color}12` : "var(--surface-2)",
                      border: `1px solid ${isSelected ? color + "50" : "var(--border)"}`,
                      transition: "all 0.15s ease",
                    }}
                  >
                    <span style={{ fontSize: 20 }}>{opt.icon}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: isSelected ? 700 : 500, fontSize: "0.85rem", color: isSelected ? color : "var(--text-primary)" }}>
                        {opt.label}
                      </div>
                      <div style={{ fontSize: "0.72rem", color: "var(--text-3)" }}>{opt.desc}</div>
                    </div>
                    <div style={{
                      width: 16, height: 16, borderRadius: "50%",
                      border: `2px solid ${isSelected ? color : "var(--border)"}`,
                      background: isSelected ? color : "transparent",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      flexShrink: 0,
                    }}>
                      {isSelected && <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#fff" }} />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Title */}
          <div className="form-group">
            <label className="form-label">Notification Title</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. গুরুত্বপূর্ণ ঘোষণা"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={80}
            />
            <div style={{ fontSize: "0.70rem", color: "var(--text-3)", textAlign: "right", marginTop: 4 }}>
              {title.length}/80
            </div>
          </div>

          {/* Body */}
          <div className="form-group">
            <label className="form-label">Message Body</label>
            <textarea
              className="form-input"
              placeholder="বিস্তারিত বার্তা লিখুন..."
              rows={4}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              style={{ resize: "vertical" }}
              maxLength={500}
            />
            <div style={{ fontSize: "0.70rem", color: "var(--text-3)", textAlign: "right", marginTop: 4 }}>
              {body.length}/500
            </div>
          </div>

          {/* Preview */}
          {(title || body) && (
            <div style={{
              background: "var(--surface-3)",
              border: "1px solid var(--border)",
              borderRadius: 10, padding: 14, marginBottom: 16,
            }}>
              <div style={{
                fontSize: "0.68rem", color: "var(--text-3)", marginBottom: 8,
                fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em",
              }}>
                Preview
              </div>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                <span style={{ fontSize: 22 }}>🔔</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: "0.90rem", color: "var(--text-primary)", marginBottom: 4 }}>
                    {title || "Notification title..."}
                  </div>
                  <div style={{ fontSize: "0.80rem", color: "var(--text-2)", lineHeight: 1.4 }}>
                    {body || "Message details..."}
                  </div>
                  <div style={{ marginTop: 8, fontSize: "0.70rem", color: TARGET_COLOR[targetType], fontWeight: 600 }}>
                    {selectedOption.icon} → {selectedOption.label}
                  </div>
                </div>
              </div>
            </div>
          )}

          <button
            onClick={handleSend}
            disabled={sending || !title.trim() || !body.trim() || !canSend}
            className="btn btn-primary w-full"
            style={{ justifyContent: "center" }}
          >
            {sending
              ? <><RefreshCw size={14} style={{ animation: "spin 1s linear infinite" }} /> Sending...</>
              : <><Send size={14} /> Send Broadcast</>
            }
          </button>

          {!canSend && (
            <p style={{ textAlign: "center", fontSize: "0.75rem", color: "var(--text-3)", marginTop: 8 }}>
              🔒 Viewer role cannot send broadcasts
            </p>
          )}
        </div>

        {/* ── Broadcast History ─────────────────────────────────────────── */}
        <div className="card">
          <div className="card-header" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div className="card-title">📋 Broadcast History</div>
            <button className="btn btn-ghost btn-sm" onClick={fetchHistory} disabled={loadingHistory}>
              <RefreshCw size={13} style={{ animation: loadingHistory ? "spin 1s linear infinite" : "none" }} />
            </button>
          </div>

          {loadingHistory ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[1, 2, 3].map((i) => (
                <div key={i} className="skeleton" style={{ height: 88, borderRadius: 10 }} />
              ))}
            </div>
          ) : history.length === 0 ? (
            <div className="empty-state" style={{ padding: "40px 20px" }}>
              <div className="empty-state-icon">📭</div>
              <div className="empty-state-title">No broadcasts sent yet</div>
              <p className="text-sm text-muted" style={{ marginTop: 6 }}>
                Sent notifications will appear here
              </p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {history.map((b) => (
                <HistoryCard key={b.id} b={b} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
