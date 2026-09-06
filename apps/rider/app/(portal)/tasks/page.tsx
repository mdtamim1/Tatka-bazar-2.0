"use client";
import React, { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { apiFetch, type Task, type ActiveTask, type RiderProfile } from "@/lib/api";

export default function TasksPage() {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [active, setActive] = useState<ActiveTask[]>([]);
  const [profile, setProfile] = useState<RiderProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState<string | null>(null);

  // Modal state
  const [modalTask, setModalTask] = useState<Task | null>(null);
  const [inputOrderNum, setInputOrderNum] = useState("");
  const [modalError, setModalError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const fetchData = useCallback(async () => {
    try {
      const [t, a, p] = await Promise.all([
        apiFetch<Task[]>("/rider-portal/tasks"),
        apiFetch<ActiveTask[]>("/rider-portal/tasks/active"),
        apiFetch<RiderProfile>("/rider-portal/me"),
      ]);
      if (t.success && Array.isArray(t.data)) setTasks(t.data);
      else if (t.success && !t.data) setTasks([]);
      if (a.success && Array.isArray(a.data)) setActive(a.data);
      else if (a.success && !a.data) setActive([]);
      if (p.success && p.data) setProfile(p.data);
    } catch {
      // keep current state
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const id = setInterval(fetchData, 15000);
    return () => clearInterval(id);
  }, [fetchData]);

  // Open verification modal
  function openAcceptModal(task: Task) {
    setModalTask(task);
    setInputOrderNum("");
    setModalError("");
    setTimeout(() => inputRef.current?.focus(), 100);
  }

  function closeModal() {
    setModalTask(null);
    setInputOrderNum("");
    setModalError("");
  }

  async function confirmAccept() {
    if (!modalTask) return;
    const expected = modalTask.orderNumber.trim().toUpperCase();
    const entered = inputOrderNum.trim().toUpperCase();
    if (entered !== expected) {
      setModalError("❌ ভুল অর্ডার আইডি! সেলার থেকে নেওয়া প্যাকেটের ওপরের সঠিক অর্ডার আইডিটি লিখুন।");
      return;
    }
    setModalError("");
    setAccepting(modalTask.id);
    closeModal();
    await apiFetch(`/rider-portal/tasks/${modalTask.id}/accept`, {
      method: "POST",
      body: JSON.stringify({ orderNumber: entered }),
    });
    await fetchData();
    // Navigate to the latest active task
    const activeRes = await apiFetch<ActiveTask[]>("/rider-portal/tasks/active");
    if (activeRes.success && Array.isArray(activeRes.data) && activeRes.data.length > 0) {
      const latest = (activeRes.data as ActiveTask[])[activeRes.data.length - 1];
      if (latest) router.push(`/tasks/${latest.assignmentId}`);
    }
    setAccepting(null);
  }

  if (loading) return <div className="page-content"><div className="loading-center"><div className="spinner" /></div></div>;

  return (
    <>
      {/* Order ID Verification Modal with Full Earnings & Balance Impact Preview */}
      {modalTask && (() => {
        const isPaid = modalTask.paymentStatus === "PAID";
        const deliveryFee = Number(modalTask.deliveryFee || 60);
        const earnings = modalTask.earnings || Math.round(deliveryFee * 0.5);
        const totalBill = Number(modalTask.total || 1450);
        const currentBalance = Number(profile?.balance ?? 0);
        const projectedBalance = isPaid
          ? currentBalance + earnings
          : currentBalance + earnings - totalBill;

        return (
          <div
            style={{
              position: "fixed", inset: 0, zIndex: 999,
              background: "rgba(0,0,0,0.8)", backdropFilter: "blur(6px)",
              display: "flex", alignItems: "center", justifyContent: "center",
              padding: "16px",
            }}
            onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
          >
            <div style={{
              background: "var(--bg-card)",
              borderRadius: "var(--r-xl)",
              padding: "24px 20px",
              width: "100%",
              maxWidth: 380,
              border: "1px solid var(--border-1)",
              boxShadow: "0 24px 80px rgba(0,0,0,.6)",
              maxHeight: "92vh",
              overflowY: "auto",
            }}>
              <div style={{ fontSize: "1.8rem", textAlign: "center", marginBottom: 6 }}>📦</div>
              <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--text-1)", textAlign: "center", marginBottom: 3 }}>
                পণ্য রিসিভ ও অর্ডার একসেপ্ট
              </div>
              <div style={{ fontSize: ".76rem", color: "var(--text-3)", textAlign: "center", fontFamily: "var(--font-bn)", marginBottom: 14 }}>
                সেলার থেকে প্যাকেট বুঝে নিয়ে অর্ডার আইডি লিখে একসেপ্ট করুন।
              </div>

              {/* Earnings & Wallet Impact Preview Card */}
              <div className="accept-preview-box">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border-1)", paddingBottom: 6 }}>
                  <span style={{ fontSize: ".76rem", fontWeight: 800, color: "var(--orange)" }}>
                    💰 আয়ের হিসাব ও ওয়ালেট পূর্বাভাস
                  </span>
                  <span style={{ fontSize: ".70rem", fontWeight: 800, color: isPaid ? "#10B981" : "#F59E0B" }}>
                    {isPaid ? "🟢 অনলাইন পেইড" : "💵 সিওডি (COD)"}
                  </span>
                </div>

                <div className="accept-preview-row">
                  <span style={{ color: "var(--text-3)" }}>রাইডারের ডেলিভারি আয়:</span>
                  <strong style={{ color: "var(--emerald)" }}>+ ৳ {earnings.toLocaleString()}</strong>
                </div>

                <div className="accept-preview-row">
                  <span style={{ color: "var(--text-3)" }}>কাস্টমার থেকে নগদ আদায়:</span>
                  <strong style={{ color: isPaid ? "#10B981" : "var(--text-1)" }}>
                    {isPaid ? "৳ ০ (টাকা নেবেন না)" : `৳ ${totalBill.toLocaleString()}`}
                  </strong>
                </div>

                <div className="accept-preview-row">
                  <span style={{ color: "var(--text-3)" }}>ওয়ালেট থেকে বিল সমন্বয়:</span>
                  <strong style={{ color: isPaid ? "#10B981" : "#EF4444" }}>
                    {isPaid ? "৳ ০ (কোনো কর্তন নেই)" : `- ৳ ${totalBill.toLocaleString()}`}
                  </strong>
                </div>

                {/* Live Projected Balance */}
                <div className="accept-projection-badge">
                  <div>
                    <div style={{ fontSize: ".65rem", color: "var(--text-3)" }}>বর্তমান ব্যালেন্স:</div>
                    <div style={{ fontSize: ".84rem", fontWeight: 700, color: "var(--text-2)" }}>
                      ৳ {currentBalance.toLocaleString()}
                    </div>
                  </div>
                  <div style={{ fontSize: "1rem", color: "var(--text-4)" }}>➔</div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: ".65rem", color: "var(--orange)", fontWeight: 700 }}>
                      ডেলিভারি শেষে ব্যালেন্স:
                    </div>
                    <div style={{ fontSize: "1.02rem", fontWeight: 900, color: projectedBalance < 0 ? "#EF4444" : "var(--emerald)" }}>
                      ৳ {projectedBalance.toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>

              {/* Vendor & Address info */}
              <div style={{ marginBottom: 12, fontSize: ".76rem", color: "var(--text-3)", fontFamily: "var(--font-bn)", padding: "10px 12px", background: "var(--bg-base)", borderRadius: "var(--r-md)", border: "1px solid var(--border-1)" }}>
                🏪 সেলার / ভেন্ডর: <strong style={{ color: "var(--text-1)" }}>{modalTask.vendorName}</strong><br />
                📍 গন্তব্য: {modalTask.deliveryAddress}
              </div>

              <label style={{ display: "block", fontSize: ".74rem", color: "var(--text-3)", fontFamily: "var(--font-bn)", marginBottom: 6 }}>
                প্যাকেটের গায়ের অর্ডার আইডি লিখুন
              </label>
              <input
                ref={inputRef}
                id="order-id-input"
                type="text"
                placeholder="যেমন: TB-XXXX"
                value={inputOrderNum}
                onChange={e => { setInputOrderNum(e.target.value); setModalError(""); }}
                onKeyDown={e => { if (e.key === "Enter") confirmAccept(); if (e.key === "Escape") closeModal(); }}
                style={{
                  width: "100%",
                  background: "var(--bg-base)",
                  border: `1.5px solid ${modalError ? "#ef4444" : "var(--border-1)"}`,
                  borderRadius: "var(--r-md)",
                  padding: "13px 15px",
                  fontSize: "1.05rem",
                  color: "var(--text-1)",
                  fontFamily: "monospace",
                  letterSpacing: "0.1em",
                  outline: "none",
                  boxSizing: "border-box",
                  marginBottom: 8,
                  transition: "border-color .2s",
                  textTransform: "uppercase",
                }}
              />

              {modalError && (
                <div style={{ fontSize: ".74rem", color: "#ef4444", marginBottom: 10, fontFamily: "var(--font-bn)", lineHeight: 1.5, padding: "8px 12px", background: "rgba(239,68,68,.1)", borderRadius: "var(--r-sm)" }}>
                  {modalError}
                </div>
              )}

              <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
                <button
                  type="button"
                  onClick={closeModal}
                  style={{
                    flex: 1, padding: "12px", borderRadius: "var(--r-md)",
                    background: "var(--bg-base)", border: "1px solid var(--border-1)",
                    color: "var(--text-2)", cursor: "pointer", fontSize: ".88rem",
                    fontFamily: "var(--font-bn)",
                  }}
                >
                  বাতিল
                </button>
                <button
                  id="confirm-accept-btn"
                  type="button"
                  onClick={confirmAccept}
                  disabled={!inputOrderNum.trim()}
                  style={{
                    flex: 2, padding: "12px", borderRadius: "var(--r-md)",
                    background: inputOrderNum.trim() ? "var(--orange)" : "var(--bg-card-hover)",
                    border: "none", color: inputOrderNum.trim() ? "#fff" : "var(--text-3)",
                    cursor: inputOrderNum.trim() ? "pointer" : "not-allowed",
                    fontSize: ".92rem", fontWeight: 700, transition: "background .2s",
                    fontFamily: "var(--font-bn)",
                  }}
                >
                  ✅ একসেপ্ট করুন
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      <div className="page-content">
        {active.length > 0 && (
          <>
            <div className="section-header">
              <div className="section-title">
                ✅ চলমান ডেলিভারি ({active.length}টি)
                <span className="live-badge"><span className="live-dot" />LIVE</span>
              </div>
            </div>
            {active.map((a, i) => (
              <div
                key={a.assignmentId}
                className="task-card"
                style={{
                  animationDelay: `${i * 0.08}s`,
                  borderColor: a.status === "RETURNING_TO_VENDOR" ? "rgba(239,68,68,.4)" : "rgba(0,214,143,.3)",
                }}
              >
                <div className="task-card-header">
                  <div className="task-vendor">
                    <div
                      className="task-vendor-icon"
                      style={{
                        background: a.status === "RETURNING_TO_VENDOR" ? "rgba(239,68,68,.15)" : "var(--emerald-glass)",
                        border: `1px solid ${a.status === "RETURNING_TO_VENDOR" ? "rgba(239,68,68,.4)" : "rgba(0,214,143,.3)"}`,
                      }}
                    >
                      {a.status === "RETURNING_TO_VENDOR" ? "🔄" : "🏪"}
                    </div>
                    <div>
                      <div className="task-vendor-name">{a.order.vendorName}</div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2, flexWrap: "wrap" }}>
                        <span style={{ color: "var(--emerald)", fontWeight: 700, fontFamily: "monospace", fontSize: ".82rem" }}>
                          #{a.order.orderNumber}
                        </span>
                        
                        {/* 3-Stage Stage Chip */}
                        {a.status === "RETURNING_TO_VENDOR" ? (
                          <span style={{ fontSize: ".68rem", color: "#EF4444", background: "rgba(239,68,68,.15)", border: "1px solid rgba(239,68,68,.3)", padding: "1px 6px", borderRadius: 4, fontWeight: 700 }}>
                            🔄 সেলারকে রিটার্ন
                          </span>
                        ) : a.status === "ON_THE_WAY" ? (
                          <span style={{ fontSize: ".68rem", color: "var(--orange)", background: "var(--orange-glass)", border: "1px solid var(--border-orange)", padding: "1px 6px", borderRadius: 4, fontWeight: 700 }}>
                            🚀 ডেলিভারির পথে
                          </span>
                        ) : (
                          <span style={{ fontSize: ".68rem", color: "var(--emerald)", background: "rgba(0,214,143,.12)", border: "1px solid rgba(0,214,143,.25)", padding: "1px 6px", borderRadius: 4, fontWeight: 700 }}>
                            📦 পার্সেল রিসিভড
                          </span>
                        )}

                        {a.order.paymentStatus === "PAID" ? (
                          <span style={{ fontSize: ".68rem", color: "#10B981", background: "rgba(16,185,129,.15)", border: "1px solid rgba(16,185,129,.3)", padding: "1px 6px", borderRadius: 4, fontWeight: 700 }}>
                            🟢 PAID
                          </span>
                        ) : (
                          <span style={{ fontSize: ".68rem", color: "#F59E0B", background: "rgba(245,158,11,.15)", border: "1px solid rgba(245,158,11,.3)", padding: "1px 6px", borderRadius: 4, fontWeight: 700 }}>
                            💵 COD
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="task-earning">
                    <div className="task-earning-label">আয় (৫০% ফি)</div>
                    <div className="task-earning-amount">
                      ৳ {Math.round(Number(a.order.deliveryFee ?? (a.order.earnings ? a.order.earnings : 60)) * (a.order.deliveryFee ? 0.5 : 1)).toLocaleString()}
                    </div>
                  </div>
                </div>

                {a.order.total && (
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 12px", background: a.order.paymentStatus === "PAID" ? "rgba(16,185,129,.08)" : "var(--bg-base)", borderRadius: 8, fontSize: ".76rem", color: "var(--text-2)", fontFamily: "var(--font-bn)", marginBottom: 4 }}>
                    <span>{a.order.paymentStatus === "PAID" ? "কাস্টমার থেকে নগদ আদায়:" : "কাস্টমার থেকে সংগৃহীত বিল:"}</span>
                    <strong style={{ color: a.order.paymentStatus === "PAID" ? "#10B981" : "var(--text-1)", fontFamily: "monospace" }}>
                      {a.order.paymentStatus === "PAID" ? "৳ ০ (অনলাইনে পরিশোধিত)" : `৳ ${Number(a.order.total).toLocaleString()}`}
                    </strong>
                  </div>
                )}

                <div className="task-address">
                  <svg fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  <span className="task-address-text">{a.order.deliveryAddress}</span>
                </div>

                <button
                  id={`detail-btn-${a.assignmentId}`}
                  className="task-deliver-btn"
                  onClick={() => router.push(`/tasks/${a.assignmentId}`)}
                  style={{
                    background: a.status === "RETURNING_TO_VENDOR"
                      ? "linear-gradient(135deg, #EF4444, #DC2626)"
                      : undefined,
                  }}
                >
                  {a.status === "RETURNING_TO_VENDOR"
                    ? "⚠️ সেলারকে পার্সেল ফেরত দিন →"
                    : a.status === "ON_THE_WAY"
                    ? "🎯 কাস্টমার হ্যান্ডওভার ও সম্পন্ন করুন →"
                    : "🚀 ডেলিভারির পথে রওনা দিন →"}
                </button>
              </div>
            ))}
          </>
        )}

        <div className="section-header">
          <div className="section-title">
            📦 নতুন অর্ডার
            <span className="live-badge"><span className="live-dot" />LIVE</span>
          </div>
        </div>

        {tasks.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🛵</div>
            <div className="empty-state-title">এখন কোন টাস্ক নেই</div>
            <div className="empty-state-text">নতুন অর্ডার আসলে এখানে দেখা যাবে। প্রতি ১৫ সেকেন্ডে আপডেট হয়।</div>
            <div className="connecting-dots"><span /><span /><span /></div>
          </div>
        ) : (
          tasks.map((task, i) => (
            <div key={task.id} className="task-card" style={{ animationDelay: `${i * 0.08}s` }}>
              <div className="task-card-header">
                <div className="task-vendor">
                  <div className="task-vendor-icon">🏪</div>
                  <div>
                    <div className="task-vendor-name">{task.vendorName}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
                      <span className="task-vendor-items bn">{task.itemCount}টি পণ্য</span>
                      {task.paymentStatus === "PAID" ? (
                        <span style={{ fontSize: ".68rem", color: "#10B981", background: "rgba(16,185,129,.15)", border: "1px solid rgba(16,185,129,.3)", padding: "1px 6px", borderRadius: 4, fontWeight: 700 }}>
                          🟢 PAID
                        </span>
                      ) : (
                        <span style={{ fontSize: ".68rem", color: "#F59E0B", background: "rgba(245,158,11,.15)", border: "1px solid rgba(245,158,11,.3)", padding: "1px 6px", borderRadius: 4, fontWeight: 700 }}>
                          💵 COD
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="task-earning">
                  <div className="task-earning-label">আয় (৫০% ফি)</div>
                  <div className="task-earning-amount">
                    ৳ {Math.round(Number(task.deliveryFee ?? (task.earnings ? task.earnings : 60)) * (task.deliveryFee ? 0.5 : 1)).toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Order ID is hidden before accepting — revealed only after physical pickup from seller */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0 4px", fontSize: ".75rem", fontFamily: "var(--font-bn)" }}>
                <span style={{ color: "var(--text-3)", display: "flex", alignItems: "center", gap: 5 }}>
                  🔒 অর্ডার আইডি: <span style={{ color: "var(--orange)", fontWeight: 600 }}>সেলার থেকে রিসিভের সময়</span>
                </span>
                <span style={{ color: "var(--text-2)" }}>
                  {task.paymentStatus === "PAID" ? (
                    <span style={{ color: "#10B981", fontWeight: 700 }}>আদায়: ৳ ০ (অনলাইন পেইড)</span>
                  ) : (
                    <>মোট বিল: <strong style={{ color: "var(--text-1)", fontFamily: "monospace" }}>৳ {Number(task.total).toLocaleString()}</strong></>
                  )}
                </span>
              </div>
              <div className="task-address">
                <svg fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                <span className="task-address-text">{task.deliveryAddress}</span>
              </div>
              <div style={{ fontSize: ".72rem", color: "var(--text-3)", fontFamily: "var(--font-bn)", marginBottom: 10, lineHeight: 1.5 }}>
                💡 সেলার থেকে প্রোডাক্ট বুঝে নেওয়ার পর প্যাকেটের ওপর থাকা অর্ডার আইডি দিয়ে একসেপ্ট করুন
              </div>
              <button
                id={`accept-task-${task.id}`}
                className="task-accept-btn"
                disabled={accepting === task.id}
                onClick={() => openAcceptModal(task)}
              >
                {accepting === task.id ? <><div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> একসেপ্ট করা হচ্ছে...</> : "✅ একসেপ্ট করুন"}
              </button>
            </div>
          ))
        )}
      </div>
    </>
  );
}
