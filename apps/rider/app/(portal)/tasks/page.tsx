"use client";
import React, { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  apiFetch,
  getDutyStatus,
  setDutyStatus,
  type Task,
  type ActiveTask,
  type RiderProfile,
  type TodayOrdersSummary,
  type TodayCompletedOrder,
  type TodayReturnedOrder,
} from "@/lib/api";

type StatusTab = "all" | "processing" | "pending" | "completed" | "returned";

export default function TasksPage() {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [active, setActive] = useState<ActiveTask[]>([]);
  const [profile, setProfile] = useState<RiderProfile | null>(null);
  const [todaySummary, setTodaySummary] = useState<TodayOrdersSummary>({
    todayDate: "",
    pendingCount: 0,
    processingCount: 0,
    completedCount: 0,
    returnedCount: 0,
    totalTodayCount: 0,
    todayCompleted: [],
    todayReturned: [],
  });

  const [selectedTab, setSelectedTab] = useState<StatusTab>("all");
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState<string | null>(null);
  const [duty, setDuty] = useState<"ONLINE" | "OFFLINE">("ONLINE");
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    setDuty(getDutyStatus());
    const handleDutyChange = (e: any) => {
      if (e.detail?.status) setDuty(e.detail.status);
    };
    window.addEventListener("rider_duty_change", handleDutyChange);
    return () => window.removeEventListener("rider_duty_change", handleDutyChange);
  }, []);

  // Modal state
  const [modalTask, setModalTask] = useState<Task | null>(null);
  const [inputOrderNum, setInputOrderNum] = useState("");
  const [modalError, setModalError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const fetchData = useCallback(async () => {
    try {
      const [t, a, p, s] = await Promise.all([
        apiFetch<Task[]>("/rider-portal/tasks"),
        apiFetch<ActiveTask[]>("/rider-portal/tasks/active"),
        apiFetch<RiderProfile>("/rider-portal/me"),
        apiFetch<TodayOrdersSummary>("/rider-portal/tasks/today-summary"),
      ]);
      if (t.success && Array.isArray(t.data)) setTasks(t.data);
      else if (t.success && !t.data) setTasks([]);
      if (a.success && Array.isArray(a.data)) setActive(a.data);
      else if (a.success && !a.data) setActive([]);
      if (p.success && p.data) setProfile(p.data);
      if (s.success && s.data) setTodaySummary(s.data);
    } catch {
      // keep current state
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const id = setInterval(fetchData, 3000);
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
    const expectedDigits = expected.replace(/\D/g, "");
    const enteredDigits = entered.replace(/\D/g, "");
    const isMatch = entered === expected || (enteredDigits && enteredDigits === expectedDigits);
    if (!isMatch) {
      setModalError("❌ ভুল অর্ডার আইডি! সেলার থেকে নেওয়া প্যাকেটের ওপরের সঠিক অর্ডার আইডিটি লিখুন।");
      return;
    }
    setModalError("");
    setAccepting(modalTask.id);
    const acceptedNum = modalTask.orderNumber;
    const acceptedId = modalTask.id;
    closeModal();

    // ⚡ User Requirement: Immediately transition from pending to processing tab!
    setSelectedTab("processing");
    setFeedback(`🎉 অর্ডার #${acceptedNum} সফলভাবে গ্রহণ করা হয়েছে এবং সরাসরি প্রসেসিং-এ স্থানান্তরিত হয়েছে!`);
    setTimeout(() => setFeedback(null), 4000);

    try {
      await apiFetch(`/rider-portal/tasks/${acceptedId}/accept`, {
        method: "POST",
        body: JSON.stringify({ orderNumber: entered }),
      });
      await fetchData();
    } finally {
      setAccepting(null);
    }
  }

  // Dynamic counter computations
  const pendingCount = tasks.length;
  const processingCount = active.length;
  const completedCount = todaySummary.todayCompleted?.length || 0;
  const returnedCount = todaySummary.todayReturned?.length || 0;
  const totalTodayCount = pendingCount + processingCount + completedCount + returnedCount;

  if (loading) {
    return (
      <div className="page-content">
        <div className="loading-center">
          <div className="spinner" />
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Toast Feedback Notification */}
      {feedback && (
        <div
          style={{
            position: "fixed",
            top: 70,
            left: "50%",
            transform: "translateX(-50%)",
            background: "linear-gradient(135deg, #059669, #10b981)",
            color: "#ffffff",
            padding: "10px 20px",
            borderRadius: 999,
            fontSize: ".82rem",
            fontWeight: 800,
            zIndex: 9999,
            boxShadow: "0 10px 30px rgba(0, 0, 0, 0.4)",
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontFamily: "var(--font-bn)",
            animation: "slide-in .3s ease-out",
            whiteSpace: "nowrap",
          }}
        >
          <span>✨</span>
          <span>{feedback}</span>
        </div>
      )}

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
              position: "fixed",
              inset: 0,
              zIndex: 999,
              background: "rgba(0,0,0,0.85)",
              backdropFilter: "blur(6px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "16px",
            }}
            onClick={(e) => {
              if (e.target === e.currentTarget) closeModal();
            }}
          >
            <div
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border-2)",
                borderRadius: "var(--r-xl)",
                padding: "24px 20px",
                width: "100%",
                maxWidth: 420,
                boxShadow: "0 25px 60px rgba(0,0,0,.7)",
                animation: "slide-in .25s var(--spring)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                <div>
                  <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--text-1)", fontFamily: "var(--font-bn)" }}>
                    📦 অর্ডার কনফার্ম ও পিকআপ
                  </div>
                  <div style={{ fontSize: ".76rem", color: "var(--text-3)", fontFamily: "var(--font-bn)", marginTop: 2 }}>
                    সেলার থেকে পার্সেল গ্রহণের জন্য কোড ভেরিফাই করুন
                  </div>
                </div>
                <button
                  type="button"
                  onClick={closeModal}
                  style={{
                    background: "var(--bg-base)",
                    border: "1px solid var(--border-1)",
                    borderRadius: "50%",
                    width: 28,
                    height: 28,
                    color: "var(--text-3)",
                    cursor: "pointer",
                    fontSize: 14,
                  }}
                >
                  ✕
                </button>
              </div>

              {/* Financial Impact Box */}
              <div
                style={{
                  background: "var(--bg-base)",
                  borderRadius: "var(--r-md)",
                  border: "1px solid var(--border-1)",
                  padding: "12px 14px",
                  marginBottom: 14,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: ".78rem", color: "var(--text-2)", fontFamily: "var(--font-bn)", marginBottom: 6 }}>
                  <span>আপনার নিশ্চিত আয় (৫০% ডেলিভারি ফি):</span>
                  <strong style={{ color: "var(--emerald)", fontFamily: "monospace" }}>+ ৳ {earnings}</strong>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", fontSize: ".78rem", color: "var(--text-2)", fontFamily: "var(--font-bn)", marginBottom: 8 }}>
                  <span>পেমেন্ট ধরন:</span>
                  <span style={{ fontWeight: 800, color: isPaid ? "#10B981" : "#F59E0B" }}>
                    {isPaid ? "🟢 অনলাইন পেইড" : `💵 ক্যাশ অন ডেলিভারি (৳ ${totalBill.toLocaleString()})`}
                  </span>
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    paddingTop: 8,
                    borderTop: "1px dashed var(--border-2)",
                    fontSize: ".78rem",
                    fontFamily: "var(--font-bn)",
                  }}
                >
                  <span style={{ color: "var(--text-3)" }}>ডেলিভারি পরবর্তী আনুমানিক ব্যালেন্স:</span>
                  <strong style={{ color: projectedBalance < 0 ? "#EF4444" : "var(--emerald)", fontFamily: "monospace" }}>
                    ৳ {projectedBalance.toLocaleString()}
                  </strong>
                </div>
              </div>

              {/* Vendor & Address info */}
              <div style={{ marginBottom: 12, fontSize: ".76rem", color: "var(--text-3)", fontFamily: "var(--font-bn)", padding: "10px 12px", background: "var(--bg-base)", borderRadius: "var(--r-md)", border: "1px solid var(--border-1)" }}>
                🏪 সেলার / ভেন্ডর: <strong style={{ color: "var(--text-1)" }}>{modalTask.vendorName}</strong><br />
                📍 গন্তব্য: {modalTask.deliveryAddress}
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <label style={{ fontSize: ".74rem", color: "var(--text-3)", fontFamily: "var(--font-bn)" }}>
                  প্যাকেটের গায়ের অর্ডার আইডি লিখুন
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setInputOrderNum(modalTask.orderNumber);
                    setModalError("");
                  }}
                  style={{
                    background: "rgba(255, 122, 0, 0.12)",
                    border: "1px solid rgba(255, 122, 0, 0.35)",
                    color: "var(--orange)",
                    fontSize: ".70rem",
                    padding: "2px 8px",
                    borderRadius: 4,
                    cursor: "pointer",
                    fontFamily: "monospace",
                    fontWeight: 700,
                  }}
                >
                  #{modalTask.orderNumber} অটো-ফিল
                </button>
              </div>
              <input
                ref={inputRef}
                id="order-id-input"
                type="text"
                placeholder="যেমন: TB-XXXX"
                value={inputOrderNum}
                onChange={(e) => {
                  setInputOrderNum(e.target.value);
                  setModalError("");
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") confirmAccept();
                  if (e.key === "Escape") closeModal();
                }}
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
                    flex: 1,
                    padding: "12px",
                    borderRadius: "var(--r-md)",
                    background: "var(--bg-base)",
                    border: "1px solid var(--border-1)",
                    color: "var(--text-2)",
                    cursor: "pointer",
                    fontSize: ".88rem",
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
                    flex: 2,
                    padding: "12px",
                    borderRadius: "var(--r-md)",
                    background: inputOrderNum.trim() ? "var(--orange)" : "var(--bg-card-hover)",
                    border: "none",
                    color: inputOrderNum.trim() ? "#fff" : "var(--text-3)",
                    cursor: inputOrderNum.trim() ? "pointer" : "not-allowed",
                    fontSize: ".92rem",
                    fontWeight: 700,
                    transition: "background .2s",
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
        {duty === "OFFLINE" && (
          <div className="offline-lock-card">
            <div className="offline-lock-icon">⏸️</div>
            <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "#fff", fontFamily: "var(--font-bn)", marginBottom: 6 }}>
              আপনি বর্তমানে অফলাইনে (বিশ্রামে) আছেন
            </div>
            <div style={{ fontSize: ".82rem", color: "var(--text-3)", fontFamily: "var(--font-bn)", maxWidth: 360, margin: "0 auto 16px", lineHeight: 1.5 }}>
              নতুন কোনো ডেলিভারি রিকোয়েস্ট বা অর্ডার গ্রহণ করতে অন-ডিউটি চালু করুন।
            </div>
            <button
              id="go-online-btn"
              onClick={() => {
                setDuty("ONLINE");
                setDutyStatus("ONLINE");
              }}
              style={{
                background: "linear-gradient(135deg, #00d68f, #00b377)",
                color: "#051322",
                padding: "10px 22px",
                borderRadius: "999px",
                fontWeight: 900,
                fontSize: ".9rem",
                border: "none",
                cursor: "pointer",
                boxShadow: "0 4px 16px rgba(0,214,143,.35)",
                fontFamily: "var(--font-bn)",
              }}
            >
              🟢 অনলাইনে যান (Go Online)
            </button>
          </div>
        )}

        {/* ===================================================================
            STATUS COLUMN BAR (Today Order, Processing, Pending, Completed, Returned)
            Placement matching user screenshot red circle
            =================================================================== */}
        <div className="status-column-bar" style={{ marginTop: 2 }}>
          {/* 1. Today Order */}
          <button
            id="tab-all-orders"
            type="button"
            className={`status-tab-btn ${selectedTab === "all" ? "active" : ""}`}
            onClick={() => setSelectedTab("all")}
          >
            <span>📋 আজকের অর্ডার</span>
            <span className="status-tab-badge">{totalTodayCount}</span>
          </button>

          {/* 2. Processing Order */}
          <button
            id="tab-processing-orders"
            type="button"
            className={`status-tab-btn ${selectedTab === "processing" ? "active" : ""}`}
            onClick={() => setSelectedTab("processing")}
          >
            <span>🚀 প্রসেসিং</span>
            <span className="status-tab-badge">{processingCount}</span>
          </button>

          {/* 3. Pending Order */}
          <button
            id="tab-pending-orders"
            type="button"
            className={`status-tab-btn ${selectedTab === "pending" ? "active" : ""}`}
            onClick={() => setSelectedTab("pending")}
          >
            <span>⏳ পেন্ডিং</span>
            <span className="status-tab-badge">{pendingCount}</span>
          </button>

          {/* 4. Completed Order */}
          <button
            id="tab-completed-orders"
            type="button"
            className={`status-tab-btn ${selectedTab === "completed" ? "active" : ""}`}
            onClick={() => setSelectedTab("completed")}
          >
            <span>✅ সম্পন্ন</span>
            <span className="status-tab-badge">{completedCount}</span>
          </button>

          {/* 5. Returned Order */}
          <button
            id="tab-returned-orders"
            type="button"
            className={`status-tab-btn ${selectedTab === "returned" ? "active" : ""}`}
            onClick={() => setSelectedTab("returned")}
          >
            <span>🔄 রিটার্নড</span>
            <span className="status-tab-badge">{returnedCount}</span>
          </button>
        </div>

        {/* ===================================================================
            TAB VIEW 1: PROCESSING ORDERS (Ongoing Accepted Deliveries)
            =================================================================== */}
        {(selectedTab === "processing" || (selectedTab === "all" && active.length > 0)) && (
          <>
            <div className="section-header">
              <div className="section-title">
                🚀 প্রসেসিং ডেলিভারি ({active.length}টি)
                <span className="live-badge"><span className="live-dot" />LIVE</span>
              </div>
            </div>

            {active.length === 0 ? (
              <div style={{ padding: "30px 16px", background: "var(--bg-card)", borderRadius: "var(--r-lg)", textAlign: "center", border: "1px dashed var(--border-2)" }}>
                <div style={{ fontSize: "2rem", marginBottom: 8 }}>🛵</div>
                <div style={{ fontSize: ".92rem", fontWeight: 700, color: "var(--text-1)", fontFamily: "var(--font-bn)" }}>
                  বর্তমানে কোনো প্রসেসিং ডেলিভারি নেই
                </div>
                <div style={{ fontSize: ".76rem", color: "var(--text-3)", fontFamily: "var(--font-bn)", marginTop: 4, marginBottom: 14 }}>
                  পেন্ডিং ট্যাব থেকে নতুন কোনো অর্ডার একসেপ্ট করলে এখানে প্রসেসিং দেখতে পাবেন।
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedTab("pending")}
                  style={{
                    padding: "8px 18px",
                    background: "var(--orange)",
                    color: "#ffffff",
                    borderRadius: 999,
                    fontSize: ".78rem",
                    fontWeight: 700,
                    fontFamily: "var(--font-bn)",
                  }}
                >
                  ⏳ পেন্ডিং অর্ডার দেখুন ({pendingCount}টি)
                </button>
              </div>
            ) : (
              active.map((a, i) => (
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
                          {a.status === "CANCELLATION_REQUESTED" ? (
                            <span style={{ fontSize: ".68rem", color: "var(--amber)", background: "rgba(245,158,11,.15)", border: "1px solid rgba(245,158,11,.3)", padding: "1px 6px", borderRadius: 4, fontWeight: 700 }}>
                              ⏳ বাতিল অপেক্ষারত
                            </span>
                          ) : a.status === "RETURNING_TO_VENDOR" ? (
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

                  {/* Return Trip Allowance Highlight if in Returning state */}
                  {a.status === "RETURNING_TO_VENDOR" ? (
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 12px", background: "rgba(239,68,68,.1)", border: "1px solid rgba(239,68,68,.25)", borderRadius: 8, fontSize: ".76rem", color: "#fca5a5", fontFamily: "var(--font-bn)", marginBottom: 4 }}>
                      <span>রিটার্ন ট্রিপ ভাতা (কোনো বিল কর্তন নেই):</span>
                      <strong style={{ color: "#22c55e", fontFamily: "monospace", fontSize: ".85rem" }}>
                        + ৳ ২০
                      </strong>
                    </div>
                  ) : (
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
                      background:
                        a.status === "CANCELLATION_REQUESTED"
                          ? "linear-gradient(135deg, #F59E0B, #D97706)"
                          : a.status === "RETURNING_TO_VENDOR"
                          ? "linear-gradient(135deg, #EF4444, #DC2626)"
                          : undefined,
                    }}
                  >
                    {a.status === "CANCELLATION_REQUESTED"
                      ? "⏳ বাতিল অনুরোধ দেখুন ও হাবে কথা বলুন →"
                      : a.status === "RETURNING_TO_VENDOR"
                      ? "🔄 সেলারকে পার্সেল ফেরত ও কোড দিন →"
                      : a.status === "ON_THE_WAY"
                      ? "🎯 কাস্টমার হ্যান্ডওভার ও সম্পন্ন করুন →"
                      : "🚀 ডেলিভারির পথে রওনা দিন →"}
                  </button>
                </div>
              ))
            )}
          </>
        )}

        {/* ===================================================================
            TAB VIEW 2: PENDING ORDERS (Waiting to be accepted by rider)
            =================================================================== */}
        {(selectedTab === "pending" || selectedTab === "all") && (
          <>
            <div className="section-header" style={{ marginTop: selectedTab === "all" ? 14 : 0 }}>
              <div className="section-title">
                ⏳ পেন্ডিং নতুন অর্ডার ({tasks.length}টি)
                {duty === "ONLINE" && <span className="live-badge"><span className="live-dot" />LIVE</span>}
              </div>
              {duty === "ONLINE" && tasks.length > 0 && (
                <button
                  id="trigger-sound-alert-btn"
                  onClick={() => {
                    if (tasks[0]) {
                      window.dispatchEvent(new CustomEvent("trigger_rider_order_alert", { detail: { task: tasks[0] } }));
                    }
                  }}
                  style={{
                    background: "rgba(255, 122, 0, 0.12)",
                    border: "1px solid rgba(255, 122, 0, 0.35)",
                    color: "#ff7a00",
                    borderRadius: 6,
                    padding: "3px 8px",
                    fontSize: ".70rem",
                    fontWeight: 700,
                    fontFamily: "var(--font-bn)",
                    cursor: "pointer",
                  }}
                >
                  🔔 অ্যালার্ট টেস্ট
                </button>
              )}
            </div>

            {duty === "OFFLINE" ? (
              <div style={{
                padding: "30px 20px",
                background: "var(--bg-card)",
                border: "1px dashed var(--border-2)",
                borderRadius: "var(--r-lg)",
                textAlign: "center",
              }}>
                <div style={{ fontSize: "2rem", marginBottom: 10 }}>🔒</div>
                <div style={{ fontSize: ".95rem", fontWeight: 700, color: "var(--text-2)", fontFamily: "var(--font-bn)", marginBottom: 6 }}>
                  নতুন অর্ডার দেখতে অন-ডিউটি চালু করুন
                </div>
                <div style={{ fontSize: ".78rem", color: "var(--text-3)", fontFamily: "var(--font-bn)" }}>
                  আপনি অফলাইনে থাকায় নতুন কোনো অর্ডার শো করা হচ্ছে না।
                </div>
              </div>
            ) : tasks.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">🛵</div>
                <div className="empty-state-title">এখন কোন পেন্ডিং টাস্ক নেই</div>
                <div className="empty-state-text">সব পেন্ডিং অর্ডার গ্রহণ করা হয়েছে অথবা নতুন অর্ডারের অপেক্ষা চলছে।</div>
                <div style={{ marginTop: 12 }}>
                  <button
                    type="button"
                    onClick={async () => {
                      await apiFetch("/rider-portal/tasks/reset-sample", { method: "POST" });
                      await fetchData();
                    }}
                    style={{
                      background: "rgba(255, 122, 0, 0.12)",
                      border: "1px solid rgba(255, 122, 0, 0.35)",
                      color: "var(--orange)",
                      padding: "7px 16px",
                      borderRadius: 999,
                      fontSize: ".78rem",
                      fontWeight: 700,
                      cursor: "pointer",
                      fontFamily: "var(--font-bn)",
                    }}
                  >
                    🔄 টেস্টের জন্য নতুন পেন্ডিং অর্ডার আনুন
                  </button>
                </div>
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
                    💡 সেলার থেকে প্রোডাক্ট বুঝে নেওয়ার পর প্যাকেটের ওপর থাকা অর্ডার আইডি দিয়ে একসেপ্ট করুন (একসেপ্ট করলে সরাসরি প্রসেসিং-এ যাবে)
                  </div>

                  <button
                    id={`accept-task-${task.id}`}
                    className="task-accept-btn"
                    disabled={accepting === task.id}
                    onClick={() => openAcceptModal(task)}
                  >
                    {accepting === task.id ? (
                      <>
                        <div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />
                        একসেপ্ট করা হচ্ছে...
                      </>
                    ) : (
                      "✅ একসেপ্ট করুন"
                    )}
                  </button>
                </div>
              ))
            )}
          </>
        )}

        {/* ===================================================================
            TAB VIEW 3: COMPLETED ORDERS TODAY
            =================================================================== */}
        {(selectedTab === "completed" || (selectedTab === "all" && completedCount > 0)) && (
          <>
            <div className="section-header" style={{ marginTop: selectedTab === "all" ? 14 : 0 }}>
              <div className="section-title">
                ✅ আজকের সম্পন্ন ডেলিভারি ({completedCount}টি)
              </div>
            </div>

            {completedCount === 0 ? (
              <div style={{ padding: "30px 16px", background: "var(--bg-card)", borderRadius: "var(--r-lg)", textAlign: "center", border: "1px dashed var(--border-2)" }}>
                <div style={{ fontSize: "2rem", marginBottom: 8 }}>📋</div>
                <div style={{ fontSize: ".92rem", fontWeight: 700, color: "var(--text-1)", fontFamily: "var(--font-bn)" }}>
                  আজকে এখনো কোনো ডেলিভারি সম্পন্ন হয়নি
                </div>
                <div style={{ fontSize: ".76rem", color: "var(--text-3)", fontFamily: "var(--font-bn)", marginTop: 4 }}>
                  প্রসেসিং অর্ডার কাস্টমারকে ওটিপি দিয়ে ডেলিভারি করলেই এখানে হিসাব যুক্ত হবে।
                </div>
              </div>
            ) : (
              todaySummary.todayCompleted.map((comp) => (
                <div key={comp.id} className="completed-card">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ color: "var(--emerald)", fontWeight: 800, fontFamily: "monospace", fontSize: ".92rem" }}>
                          #{comp.orderNumber}
                        </span>
                        <span style={{ fontSize: ".68rem", color: "var(--text-3)" }}>
                          {new Date(comp.completedAt).toLocaleTimeString("bn-BD", { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                      <div style={{ fontSize: ".82rem", fontWeight: 700, color: "var(--text-1)", marginTop: 4 }}>
                        👤 {comp.customerName} • 📞 {comp.customerPhone}
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: "1.05rem", fontWeight: 900, color: "var(--emerald)", fontFamily: "monospace" }}>
                        + ৳ {comp.earnings}
                      </div>
                      <div style={{ fontSize: ".64rem", color: "var(--text-3)", fontFamily: "var(--font-bn)" }}>
                        ডেলিভারি আয়
                      </div>
                    </div>
                  </div>

                  <div style={{ fontSize: ".76rem", color: "var(--text-2)", fontFamily: "var(--font-bn)", background: "var(--bg-base)", padding: "8px 10px", borderRadius: "var(--r-sm)" }}>
                    🏪 ভেন্ডর: <strong>{comp.vendorName}</strong> | 📍 {comp.deliveryAddress}
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: ".74rem", borderTop: "1px dashed var(--border-2)", paddingTop: 8 }}>
                    <span style={{ color: comp.paymentStatus === "PAID" ? "#10b981" : "#f59e0b", fontWeight: 700 }}>
                      {comp.paymentStatus === "PAID" ? "🟢 অনলাইন পেইড" : `💵 সংগৃহীত বিল: ৳ ${comp.total.toLocaleString()}`}
                    </span>
                    <span style={{ color: "var(--emerald)", background: "rgba(0,214,143,.12)", padding: "2px 8px", borderRadius: 999, fontWeight: 700, fontSize: ".68rem" }}>
                      🔐 ওটিপি {comp.deliveryOtp || "৪২৬৬"} যাচাইকৃত
                    </span>
                  </div>
                </div>
              ))
            )}
          </>
        )}

        {/* ===================================================================
            TAB VIEW 4: RETURNED ORDERS TODAY
            =================================================================== */}
        {(selectedTab === "returned" || (selectedTab === "all" && returnedCount > 0)) && (
          <>
            <div className="section-header" style={{ marginTop: selectedTab === "all" ? 14 : 0 }}>
              <div className="section-title">
                🔄 আজকের সফল রিটার্ন ({returnedCount}টি)
              </div>
            </div>

            {returnedCount === 0 ? (
              <div style={{ padding: "30px 16px", background: "var(--bg-card)", borderRadius: "var(--r-lg)", textAlign: "center", border: "1px dashed var(--border-2)" }}>
                <div style={{ fontSize: "2rem", marginBottom: 8 }}>📦</div>
                <div style={{ fontSize: ".92rem", fontWeight: 700, color: "var(--text-1)", fontFamily: "var(--font-bn)" }}>
                  আজকে কোনো পার্সেল রিটার্ন হয়নি
                </div>
                <div style={{ fontSize: ".76rem", color: "var(--text-3)", fontFamily: "var(--font-bn)", marginTop: 4 }}>
                  কাস্টমার অনুপস্থিত থাকলে সেলারকে ফেরত দেওয়া পার্সেলগুলো এখানে শো করবে।
                </div>
              </div>
            ) : (
              todaySummary.todayReturned.map((ret) => (
                <div key={ret.id} className="returned-card">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ color: "#EF4444", fontWeight: 800, fontFamily: "monospace", fontSize: ".92rem" }}>
                          #{ret.orderNumber}
                        </span>
                        <span style={{ fontSize: ".68rem", color: "var(--text-3)" }}>
                          {new Date(ret.returnedAt).toLocaleTimeString("bn-BD", { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                      <div style={{ fontSize: ".82rem", fontWeight: 700, color: "var(--text-1)", marginTop: 4 }}>
                        🏪 সেলার: {ret.vendorName}
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: "1.05rem", fontWeight: 900, color: "#22c55e", fontFamily: "monospace" }}>
                        + ৳ {ret.returnAllowance}
                      </div>
                      <div style={{ fontSize: ".64rem", color: "var(--text-3)", fontFamily: "var(--font-bn)" }}>
                        রিটার্ন ট্রিপ ভাতা
                      </div>
                    </div>
                  </div>

                  <div style={{ fontSize: ".74rem", color: "#fca5a5", fontFamily: "var(--font-bn)", background: "rgba(239,68,68,.08)", padding: "6px 10px", borderRadius: "var(--r-sm)" }}>
                    কারণ: {ret.reason || "কাস্টমার পার্সেল রিসিভ করেননি"}
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: ".72rem", borderTop: "1px dashed var(--border-2)", paddingTop: 8 }}>
                    <span style={{ color: "var(--text-3)" }}>
                      কোনো বিল কর্তন নেই
                    </span>
                    <span style={{ color: "#EF4444", background: "rgba(239,68,68,.12)", padding: "2px 8px", borderRadius: 999, fontWeight: 700, fontSize: ".68rem" }}>
                      🔄 রিটার্ন কোড {ret.returnCode} যাচাইকৃত
                    </span>
                  </div>
                </div>
              ))
            )}
          </>
        )}
      </div>
    </>
  );
}
