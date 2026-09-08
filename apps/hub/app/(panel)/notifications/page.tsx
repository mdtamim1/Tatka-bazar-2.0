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

  const TARGET_BN: Record<string, string> = {
    ALL_RIDERS: "সকল রাইডার",
    ALL_VENDORS: "সকল ভেন্ডর",
    ALL: "সবাই (Riders + Vendors)",
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
        <h1 className="page-title"><Bell size={22} /><span className="font-bn">ব্রডকাস্ট নোটিফিকেশন</span></h1>
        <p className="page-subtitle font-bn">সকল রাইডার ও ভেন্ডরকে বার্তা পাঠান</p>
      </div>

      <div className="grid-2" style={{ gap: 20 }}>
        {/* Send Form */}
        <div className="card">
          <div className="card-header">
            <div className="card-title font-bn">📢 নতুন ব্রডকাস্ট</div>
          </div>
          {sent && (
            <div style={{
              display: "flex", alignItems: "center", gap: 8,
              background: "rgba(0,214,143,0.1)", border: "1px solid rgba(0,214,143,0.25)",
              color: "var(--accent-green)", padding: "10px 14px", borderRadius: "var(--radius-sm)",
              fontSize: 13, marginBottom: 16,
            }}>
              <CheckCircle2 size={15} />
              <span className="font-bn">বার্তা পাঠানো হয়েছে!</span>
            </div>
          )}
          <div className="form-group">
            <label className="form-label font-bn">পাঠানোর লক্ষ্য</label>
            <select className="form-input font-bn" value={targetType} onChange={(e) => setTargetType(e.target.value as any)}>
              <option value="ALL_RIDERS">সকল রাইডার</option>
              <option value="ALL_VENDORS">সকল ভেন্ডর</option>
              <option value="ALL">সবাই</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label font-bn">শিরোনাম</label>
            <input
              type="text" className="form-input font-bn"
              placeholder="বার্তার শিরোনাম..."
              value={title} onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label font-bn">বিস্তারিত বার্তা</label>
            <textarea
              className="form-input font-bn"
              placeholder="বিস্তারিত লিখুন..."
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
                প্রিভিউ
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <span style={{ fontSize: 20 }}>🔔</span>
                <span style={{ fontWeight: 700, fontSize: 14, color: "var(--text-primary)" }}>{title || "শিরোনাম..."}</span>
              </div>
              <div className="font-bn" style={{ fontSize: 13, color: "var(--text-secondary)" }}>{body || "বার্তার বিস্তারিত..."}</div>
              <div style={{ marginTop: 6, fontSize: 11, color: "var(--text-muted)" }} className="font-bn">
                → {TARGET_BN[targetType]}
              </div>
            </div>
          )}

          <button
            onClick={send} disabled={sending || !title || !body}
            className="btn btn-primary w-full"
            style={{ justifyContent: "center" }}
          >
            <Send size={14} />
            <span className="font-bn">{sending ? "পাঠানো হচ্ছে..." : "ব্রডকাস্ট পাঠান"}</span>
          </button>
        </div>

        {/* Broadcast History */}
        <div className="card">
          <div className="card-header">
            <div className="card-title font-bn">📋 পাঠানো বার্তার ইতিহাস</div>
          </div>
          {broadcasts.length === 0 ? (
            <div className="empty-state" style={{ padding: "40px 20px" }}>
              <div className="empty-state-icon">📭</div>
              <div className="empty-state-title font-bn">এখনো কোনো বার্তা পাঠানো হয়নি</div>
            </div>
          ) : (
            <div className="activity-feed">
              {broadcasts.map((b, i) => (
                <div key={i} className="activity-item">
                  <div className="activity-dot" />
                  <div className="activity-text">
                    <div style={{ fontWeight: 600, color: "var(--text-primary)", fontSize: 13 }}>{b.title}</div>
                    <div className="font-bn" style={{ marginTop: 2 }}>{b.body}</div>
                    <div style={{ marginTop: 4 }}>
                      <span className="badge badge-blue" style={{ fontSize: 10 }}>
                        <span className="font-bn">{TARGET_BN[b.targetType]}</span>
                      </span>
                    </div>
                  </div>
                  <div className="activity-time font-bn">
                    {new Date(b.sentAt).toLocaleTimeString("bn-BD")}
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
