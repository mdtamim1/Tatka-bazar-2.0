"use client";
import React, { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { apiFetch, type Task, type ActiveTask } from "@/lib/api";

export default function TasksPage() {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [active, setActive] = useState<ActiveTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState<string | null>(null);

  // Modal state
  const [modalTask, setModalTask] = useState<Task | null>(null);
  const [inputOrderNum, setInputOrderNum] = useState("");
  const [modalError, setModalError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const fetchData = useCallback(async () => {
    try {
      const [t, a] = await Promise.all([
        apiFetch<Task[]>("/rider-portal/tasks"),
        apiFetch<ActiveTask[]>("/rider-portal/tasks/active"),
      ]);
      if (t.success && Array.isArray(t.data)) setTasks(t.data);
      else if (t.success && !t.data) setTasks([]);
      if (a.success && Array.isArray(a.data)) setActive(a.data);
      else if (a.success && !a.data) setActive([]);
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
    await apiFetch(`/rider-portal/tasks/${modalTask.id}/accept`, { method: "POST", body: JSON.stringify({ orderNumber: entered }) });
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
      {/* Order ID Verification Modal — Only input from physical package */}
      {modalTask && (
        <div
          style={{
            position: "fixed", inset: 0, zIndex: 999,
            background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "20px",
          }}
          onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
        >
          <div style={{
            background: "var(--bg-card)",
            borderRadius: "var(--r-xl)",
            padding: "28px 24px",
            width: "100%",
            maxWidth: 360,
            border: "1px solid var(--border-1)",
            boxShadow: "0 24px 80px rgba(0,0,0,.5)",
          }}>
            <div style={{ fontSize: "2rem", textAlign: "center", marginBottom: 8 }}>📦</div>
            <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-1)", textAlign: "center", marginBottom: 4 }}>
              পণ্য রিসিভ ও অর্ডার আইডি যাচাই
            </div>
            <div style={{ fontSize: ".8rem", color: "var(--text-3)", textAlign: "center", fontFamily: "var(--font-bn)", marginBottom: 18, lineHeight: 1.6 }}>
              সেলার থেকে পণ্যটি হাতে বুঝে নিন।<br />
              প্যাকেটের গায়ে লেখা অর্ডার আইডিটি লিখে একসেপ্ট করুন।
            </div>

            <div style={{ marginBottom: 12, fontSize: ".78rem", color: "var(--text-3)", fontFamily: "var(--font-bn)", padding: "10px 14px", background: "var(--bg-base)", borderRadius: "var(--r-md)", border: "1px solid var(--border-1)" }}>
              🏪 সেলার / ভেন্ডর: <strong style={{ color: "var(--text-1)" }}>{modalTask.vendorName}</strong><br />
              📍 গন্তব্য: {modalTask.deliveryAddress}
            </div>

            <label style={{ display: "block", fontSize: ".76rem", color: "var(--text-3)", fontFamily: "var(--font-bn)", marginBottom: 6 }}>
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
                padding: "14px 16px",
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
              <div style={{ fontSize: ".75rem", color: "#ef4444", marginBottom: 12, fontFamily: "var(--font-bn)", lineHeight: 1.5, padding: "8px 12px", background: "rgba(239,68,68,.1)", borderRadius: "var(--r-sm)" }}>
                {modalError}
              </div>
            )}

            <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
              <button
                onClick={closeModal}
                style={{
                  flex: 1, padding: "13px", borderRadius: "var(--r-md)",
                  background: "var(--bg-base)", border: "1px solid var(--border-1)",
                  color: "var(--text-2)", cursor: "pointer", fontSize: ".9rem",
                  fontFamily: "var(--font-bn)",
                }}
              >
                বাতিল
              </button>
              <button
                id="confirm-accept-btn"
                onClick={confirmAccept}
                disabled={!inputOrderNum.trim()}
                style={{
                  flex: 2, padding: "13px", borderRadius: "var(--r-md)",
                  background: inputOrderNum.trim() ? "var(--orange)" : "var(--bg-card-hover)",
                  border: "none", color: inputOrderNum.trim() ? "#fff" : "var(--text-3)",
                  cursor: inputOrderNum.trim() ? "pointer" : "not-allowed",
                  fontSize: ".95rem", fontWeight: 700, transition: "background .2s",
                  fontFamily: "var(--font-bn)",
                }}
              >
                ✅ একসেপ্ট করুন
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="page-content">
        {active.length > 0 && (
          <>
            <div className="section-header">
              <div className="section-title">
                ✅ চলমান ডেলিভারি (রিসিভড অর্ডার)
                <span className="live-badge"><span className="live-dot" />{active.length}টি</span>
              </div>
            </div>
            {active.map((a, i) => (
              <div key={a.assignmentId} className="task-card" style={{ animationDelay: `${i * 0.08}s`, borderColor: "rgba(0,214,143,.25)" }}>
                <div className="task-card-header">
                  <div className="task-vendor">
                    <div className="task-vendor-icon" style={{ background: "var(--emerald-glass)", border: "1px solid rgba(0,214,143,.3)" }}>🏪</div>
                    <div>
                      <div className="task-vendor-name">{a.order.vendorName}</div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
                        <span style={{ color: "var(--emerald)", fontWeight: 700, fontFamily: "monospace", fontSize: ".82rem" }}>
                          #{a.order.orderNumber}
                        </span>
                        <span style={{ fontSize: ".68rem", color: "var(--emerald)", background: "rgba(0,214,143,.12)", padding: "1px 6px", borderRadius: 4, fontWeight: 600 }}>
                          রিসিভড
                        </span>
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
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 12px", background: "var(--bg-base)", borderRadius: 8, fontSize: ".76rem", color: "var(--text-2)", fontFamily: "var(--font-bn)", marginBottom: 4 }}>
                    <span>কাস্টমার থেকে সংগৃহীত বিল:</span>
                    <strong style={{ color: "var(--text-1)", fontFamily: "monospace" }}>৳ {Number(a.order.total).toLocaleString()}</strong>
                  </div>
                )}
                <div className="task-address">
                  <svg fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  <span className="task-address-text">{a.order.deliveryAddress}</span>
                </div>
                <button id={`detail-btn-${a.assignmentId}`} className="task-deliver-btn" onClick={() => router.push(`/tasks/${a.assignmentId}`)}>
                  বিস্তারিত দেখুন ও সম্পন্ন করুন →
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
                    <div className="task-vendor-items bn">{task.itemCount}টি পণ্য</div>
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
                  মোট বিল: <strong style={{ color: "var(--text-1)", fontFamily: "monospace" }}>৳ {Number(task.total).toLocaleString()}</strong>
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
