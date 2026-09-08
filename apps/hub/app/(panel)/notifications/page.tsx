"use client";
import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Bell, Send, CheckCircle2 } from "lucide-react";

export default function NotificationsPage() {
  const { session } = useAuth();
  const [targetType, setTargetType] = useState<"ALL_RIDERS" | "ALL_VENDORS" | "ALL">("ALL_RIDERS");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [broadcasts, setBroadcasts] = useState<{ title: string; body: string; targetType: string; sentAt: string }[]>([]);

  const TARGET_LABEL: Record<string, string> = {
    ALL_RIDERS: "All Riders",
    ALL_VENDORS: "All Vendors",
    ALL: "Everyone (Riders + Vendors)",
  };

  async function send() {
    if (!title || !body) return;
    setSending(true);
    // Simulate broadcast — in production, this would call push notification service
    await new Promise((r) => setTimeout(r, 800));
    const newBroadcast = {
      title, body, targetType,
      sentAt: new Date().toISOString(),
    };
    setBroadcasts((prev) => [newBroadcast, ...prev]);
    setTitle(""); setBody("");
    setSending(false);
    setSent(true);
    setTimeout(() => setSent(false), 3000);
  }

  return (
    <div className="hub-content">
      <div className="page-header">
        <h1 className="page-title"><Bell size={22} /><span>Broadcast Notifications</span></h1>
        <p className="page-subtitle">Send announcements to all riders and vendors</p>
      </div>

      <div className="grid-2" style={{ gap: 20 }}>
        {/* Send Form */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">📢 New Broadcast</div>
          </div>
          {sent && (
            <div style={{
              display: "flex", alignItems: "center", gap: 8,
              background: "rgba(0,214,143,0.1)", border: "1px solid rgba(0,214,143,0.25)",
              color: "var(--accent-green)", padding: "10px 14px", borderRadius: "var(--radius-sm)",
              fontSize: 13, marginBottom: 16,
            }}>
              <CheckCircle2 size={15} />
              <span>Notification sent successfully!</span>
            </div>
          )}
          <div className="form-group">
            <label className="form-label">Target Audience</label>
            <select className="form-input" value={targetType} onChange={(e) => setTargetType(e.target.value as any)}>
              <option value="ALL_RIDERS">All Riders</option>
              <option value="ALL_VENDORS">All Vendors</option>
              <option value="ALL">Everyone</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Title</label>
            <input
              type="text" className="form-input"
              placeholder="Notification title..."
              value={title} onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Message Body</label>
            <textarea
              className="form-input"
              placeholder="Write message details..."
              rows={4}
              value={body} onChange={(e) => setBody(e.target.value)}
              style={{ resize: "vertical" }}
            />
          </div>

          {/* Preview */}
          {(title || body) && (
            <div style={{
              background: "var(--bg-surface)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-md)",
              padding: 14, marginBottom: 16,
            }}>
              <div style={{ fontSize: 10, color: "var(--text-muted)", marginBottom: 6, fontWeight: 600, textTransform: "uppercase" }}>
                PREVIEW
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <span style={{ fontSize: 20 }}>🔔</span>
                <span style={{ fontWeight: 700, fontSize: 14, color: "var(--text-primary)" }}>{title || "Notification title..."}</span>
              </div>
              <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>{body || "Message details..."}</div>
              <div style={{ marginTop: 6, fontSize: 11, color: "var(--text-muted)" }}>
                → {TARGET_LABEL[targetType]}
              </div>
            </div>
          )}

          <button
            onClick={send} disabled={sending || !title || !body}
            className="btn btn-primary w-full"
            style={{ justifyContent: "center" }}
          >
            <Send size={14} />
            <span>{sending ? "Sending..." : "Send Broadcast"}</span>
          </button>
        </div>

        {/* Broadcast History */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">📋 Broadcast History</div>
          </div>
          {broadcasts.length === 0 ? (
            <div className="empty-state" style={{ padding: "40px 20px" }}>
              <div className="empty-state-icon">📭</div>
              <div className="empty-state-title">No broadcasts sent yet</div>
            </div>
          ) : (
            <div className="activity-feed">
              {broadcasts.map((b, i) => (
                <div key={i} className="activity-item">
                  <div className="activity-dot" />
                  <div className="activity-text">
                    <div style={{ fontWeight: 600, color: "var(--text-primary)", fontSize: 13 }}>{b.title}</div>
                    <div style={{ marginTop: 2 }}>{b.body}</div>
                    <div style={{ marginTop: 4 }}>
                      <span className="badge badge-blue" style={{ fontSize: 10 }}>
                        <span>{TARGET_LABEL[b.targetType]}</span>
                      </span>
                    </div>
                  </div>
                  <div className="activity-time">
                    {new Date(b.sentAt).toLocaleTimeString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
