"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiFetch, type ActiveTask } from "@/lib/api";

function confetti() {
  const canvas = document.createElement("canvas");
  canvas.id = "confetti-canvas";
  canvas.style.cssText = "position:fixed;inset:0;pointer-events:none;z-index:9999;width:100%;height:100%;";
  document.body.appendChild(canvas);
  const ctx = canvas.getContext("2d")!;
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  const pieces: { x: number; y: number; vx: number; vy: number; r: number; c: string; rot: number; rv: number }[] = [];
  const colors = ["#FF6B2B", "#00D68F", "#F59E0B", "#3B82F6", "#8B5CF6", "#EF4444"];
  for (let i = 0; i < 120; i++) {
    pieces.push({
      x: Math.random() * canvas.width,
      y: -20,
      vx: (Math.random() - 0.5) * 4,
      vy: Math.random() * 4 + 2,
      r: Math.random() * 6 + 3,
      c: colors[Math.floor(Math.random() * colors.length)] ?? "#FF6B2B",
      rot: 0,
      rv: (Math.random() - 0.5) * 0.2,
    });
  }
  let frame = 0;
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    pieces.forEach((p) => {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.c;
      ctx.fillRect(-p.r, -p.r / 2, p.r * 2, p.r);
      ctx.restore();
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.rv;
      p.vy += 0.08;
    });
    frame++;
    if (frame < 160) requestAnimationFrame(draw);
    else canvas.remove();
  }
  draw();
}

export default function TaskDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [task, setTask] = useState<ActiveTask | null>(null);
  const [loading, setLoading] = useState(true);

  // Delivery Handover Modal
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [delivering, setDelivering] = useState(false);
  const [success, setSuccess] = useState(false);
  const [earning, setEarning] = useState(0);
  const [deducted, setDeducted] = useState(0);

  // Stage 1 -> 2 Transit
  const [transiting, setTransiting] = useState(false);

  // Cancel & Return Flow
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("কাস্টমার ফোন ধরছেন না");
  const [cancelling, setCancelling] = useState(false);
  const [confirmingReturn, setConfirmingReturn] = useState(false);
  const [returnSuccess, setReturnSuccess] = useState(false);

  useEffect(() => {
    apiFetch<ActiveTask[]>("/rider-portal/tasks/active").then((r) => {
      if (r.success && r.data) {
        const found = (r.data as ActiveTask[]).find((a) => a.assignmentId === id);
        setTask(found || null);
      }
      setLoading(false);
    });
  }, [id]);

  // Derived financial figures
  const isPaid = task?.order.paymentStatus === "PAID";
  const deliveryFee = Number(task?.order.deliveryFee ?? 60);
  const earnings = Math.round(deliveryFee * 0.5);
  const subtotal = Number(
    task?.order.subtotal ??
      task?.order.items?.reduce((s, it) => s + (it.total || (it.qty * (it.price || 0))), 0) ??
      (task?.order.total ? task.order.total - deliveryFee : 1390)
  );
  const totalBill = Number(task?.order.total ?? (subtotal + deliveryFee));
  const cashToCollect = isPaid ? 0 : totalBill;

  // 1. Advance to Transit (Stage 1 -> 2)
  async function startTransit() {
    if (!task) return;
    setTransiting(true);
    const res = await apiFetch<ActiveTask>(`/rider-portal/tasks/${id}/transit`, { method: "POST" });
    if (res.success && res.data) {
      setTask(res.data);
    } else {
      alert("স্ট্যাটাস পরিবর্তন করা যায়নি");
    }
    setTransiting(false);
  }

  // 2. Initiate Cancel & Return to Vendor
  async function handleCancelReturn() {
    if (!task) return;
    setCancelling(true);
    const res = await apiFetch<ActiveTask>(`/rider-portal/tasks/${id}/cancel-return`, {
      method: "POST",
      body: JSON.stringify({ reason: cancelReason }),
    });
    if (res.success && res.data) {
      setTask(res.data);
      setShowCancelModal(false);
    } else {
      alert("রিটার্ন শুরু করা যায়নি");
    }
    setCancelling(false);
  }

  // 3. Confirm Handover back to Vendor
  async function handleConfirmReturn() {
    if (!task) return;
    setConfirmingReturn(true);
    const res = await apiFetch<{ returnAllowance: number; message: string }>(
      `/rider-portal/tasks/${id}/confirm-return`,
      { method: "POST" }
    );
    if (res.success) {
      setReturnSuccess(true);
      setTimeout(() => {
        router.replace("/tasks");
      }, 3500);
    } else {
      alert(res.error || "রিটার্ন সম্পন্ন করা যায়নি");
      setConfirmingReturn(false);
    }
  }

  // 4. Final Delivery to Customer
  async function deliver() {
    if (!task) return;
    setDelivering(true);
    const res = await apiFetch<{ earning: number; orderTotal?: number; totalBill?: number; cashDeduction?: number; isPaid?: boolean }>(
      `/rider-portal/tasks/${id}/deliver`,
      { method: "POST" }
    );
    if (res.success && res.data) {
      const resData = res.data;
      setEarning(resData.earning || earnings);
      setDeducted(resData.cashDeduction !== undefined ? resData.cashDeduction : (isPaid ? 0 : (resData.totalBill || resData.orderTotal || totalBill)));
      setShowConfirmModal(false);
      setSuccess(true);
      confetti();
      setTimeout(() => {
        router.replace("/tasks");
      }, 3800);
    } else {
      alert(res.error || "ডেলিভারি সম্পন্ন করা যায়নি");
      setDelivering(false);
    }
  }

  if (loading) {
    return (
      <div className="page-content">
        <div className="loading-center">
          <div className="spinner" />
        </div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="page-content">
        <div className="empty-state">
          <div className="empty-state-icon">❓</div>
          <div className="empty-state-title">টাস্ক পাওয়া যায়নি</div>
          <button className="btn-primary" onClick={() => router.back()}>
            ফিরে যান
          </button>
        </div>
      </div>
    );
  }

  const currentStage = task.status;
  const isPickedUp = currentStage === "PICKED_UP" || currentStage === "ON_THE_WAY" || currentStage === "DELIVERED";
  const isOnTheWay = currentStage === "ON_THE_WAY" || currentStage === "DELIVERED";
  const isDelivered = currentStage === "DELIVERED";
  const isReturning = currentStage === "RETURNING_TO_VENDOR";

  return (
    <>
      {/* ─── Success Overlay: Delivered ─── */}
      {success && (
        <div className="success-overlay" style={{ pointerEvents: "auto", background: "rgba(5,8,16,.92)", zIndex: 1000 }}>
          <div className="success-circle">✅</div>
          <div className="success-text" style={{ fontSize: "1.6rem" }}>ডেলিভারি সম্পন্ন হয়েছে!</div>
          <div
            style={{
              background: "rgba(255,255,255,.05)",
              border: "1px solid rgba(255,255,255,.12)",
              borderRadius: "16px",
              padding: "16px 22px",
              marginTop: "16px",
              textAlign: "center",
              fontFamily: "var(--font-bn)",
              maxWidth: "340px",
            }}
          >
            <div style={{ color: "var(--emerald)", fontWeight: 800, fontSize: "1.1rem", marginBottom: "6px" }}>
              + ৳ {Number(earning).toLocaleString()} আয় ব্যালেন্সে যোগ হয়েছে
            </div>
            {isPaid ? (
              <div style={{ color: "#34D399", fontSize: ".88rem", fontWeight: 700 }}>
                🟢 অনলাইন পেইড অর্ডার (অ্যাকাউন্ট থেকে কোনো টাকা কর্তন হয়নি)
              </div>
            ) : (
              <div style={{ color: "rgba(239,68,68,.9)", fontSize: ".88rem", fontWeight: 700 }}>
                - ৳ {Number(deducted).toLocaleString()} সংগৃহীত বিল সমন্বয় হয়েছে
              </div>
            )}
          </div>
          <div className="success-sub" style={{ marginTop: "14px" }}>
            স্বয়ংক্রিয়ভাবে টাস্ক তালিকায় ফিরে যাচ্ছেন...
          </div>
        </div>
      )}

      {/* ─── Success Overlay: Returned to Vendor ─── */}
      {returnSuccess && (
        <div className="success-overlay" style={{ pointerEvents: "auto", background: "rgba(5,8,16,.92)", zIndex: 1000 }}>
          <div className="success-circle" style={{ background: "rgba(16,185,129,.15)", borderColor: "#10B981" }}>🔄</div>
          <div className="success-text" style={{ fontSize: "1.5rem" }}>সেলারকে রিটার্ন সম্পন্ন!</div>
          <div
            style={{
              background: "rgba(255,255,255,.05)",
              border: "1px solid rgba(255,255,255,.12)",
              borderRadius: "16px",
              padding: "16px 22px",
              marginTop: "16px",
              textAlign: "center",
              fontFamily: "var(--font-bn)",
              maxWidth: "340px",
            }}
          >
            <div style={{ color: "var(--emerald)", fontWeight: 800, fontSize: "1.05rem", marginBottom: "6px" }}>
              🛡️ ওয়ালেট থেকে কোনো বিল কাটা হয়নি (৳ ০)
            </div>
            <div style={{ color: "var(--orange)", fontSize: ".9rem", fontWeight: 800 }}>
              + ৳ ২০ রিটার্ন ট্রিপ ভাতা আপনার ওয়ালেটে যোগ হয়েছে
            </div>
          </div>
          <div className="success-sub" style={{ marginTop: "14px" }}>
            স্বয়ংক্রিয়ভাবে টাস্ক তালিকায় ফিরে যাচ্ছেন...
          </div>
        </div>
      )}

      {/* ─── Cancel & Return Modal ─── */}
      {showCancelModal && (
        <div
          style={{
            position: "fixed", inset: 0, zIndex: 999,
            background: "rgba(3, 7, 18, 0.85)", backdropFilter: "blur(8px)",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "16px", animation: "fade-in 0.2s ease-out",
          }}
          onClick={(e) => { if (e.target === e.currentTarget && !cancelling) setShowCancelModal(false); }}
        >
          <div
            style={{
              background: "var(--bg-card)",
              border: "1.5px solid rgba(239, 68, 68, 0.4)",
              borderRadius: "24px", padding: "24px 20px",
              width: "100%", maxWidth: "380px",
              boxShadow: "0 28px 80px rgba(0,0,0,0.7)",
              fontFamily: "var(--font-bn)",
            }}
          >
            <div style={{ fontSize: "2rem", textAlign: "center", marginBottom: 8 }}>⚠️</div>
            <div style={{ fontSize: "1.15rem", fontWeight: 800, color: "var(--text-1)", textAlign: "center", marginBottom: 4 }}>
              ডেলিভারি বাতিল ও সেলারকে রিটার্ন
            </div>
            <div style={{ fontSize: ".78rem", color: "var(--text-3)", textAlign: "center", lineHeight: 1.5, marginBottom: 16 }}>
              কাস্টমার পণ্য নিতে না পারলে কারণ নির্বাচন করে পার্সেলটি সেলারের দোকানে ফেরত দিন।
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
              {[
                "📞 কাস্টমার ফোন ধরছেন না / বন্ধ",
                "🚫 কাস্টমার পার্সেল নিতে অস্বীকৃতি জানিয়েছেন",
                "❌ কাস্টমার আগেই অর্ডার বাতিল করেছেন",
                "📍 ঠিকানা ভুল বা কাস্টমার উপস্থিত নেই",
              ].map((reason) => (
                <button
                  key={reason}
                  type="button"
                  className={`return-reason-btn${cancelReason === reason ? " selected" : ""}`}
                  onClick={() => setCancelReason(reason)}
                >
                  <span style={{ fontSize: 16 }}>{cancelReason === reason ? "🔘" : "⚪"}</span>
                  <span>{reason}</span>
                </button>
              ))}
            </div>

            <div style={{ padding: "10px 12px", background: "rgba(255,107,43,.08)", borderRadius: "10px", fontSize: ".74rem", color: "var(--text-2)", marginBottom: 18, border: "1px dashed var(--border-orange)" }}>
              🛡️ <strong>আর্থিক নিশ্চয়তা:</strong> আপনার ওয়ালেট থেকে কোনো বিল কাটা হবে না এবং সেলারকে ফেরত দিলে আপনি ৳ ২০ ট্রিপ ভাতা পাবেন।
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button
                type="button"
                onClick={() => setShowCancelModal(false)}
                disabled={cancelling}
                style={{
                  flex: 1, padding: "12px", borderRadius: "12px",
                  background: "var(--bg-base)", border: "1px solid var(--border-2)",
                  color: "var(--text-2)", cursor: "pointer", fontSize: ".88rem",
                  fontFamily: "var(--font-bn)",
                }}
              >
                বাতিল নয়
              </button>
              <button
                id="confirm-cancel-return-btn"
                type="button"
                onClick={handleCancelReturn}
                disabled={cancelling}
                style={{
                  flex: 2, padding: "12px", borderRadius: "12px",
                  background: "linear-gradient(135deg, #EF4444, #DC2626)",
                  border: "none", color: "#FFFFFF", cursor: cancelling ? "not-allowed" : "pointer",
                  fontSize: ".90rem", fontWeight: 800, fontFamily: "var(--font-bn)",
                  boxShadow: "0 6px 20px rgba(239, 68, 68, 0.4)",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                }}
              >
                {cancelling ? "প্রসেসিং..." : "🔄 রিটার্ন শুরু করুন"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Delivery Confirmation Warning Modal ─── */}
      {showConfirmModal && (
        <div
          style={{
            position: "fixed", inset: 0, zIndex: 999,
            background: "rgba(3, 7, 18, 0.85)", backdropFilter: "blur(8px)",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "16px", animation: "fade-in 0.2s ease-out",
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget && !delivering) setShowConfirmModal(false);
          }}
        >
          <div
            style={{
              background: "var(--bg-card)",
              border: isPaid ? "1.5px solid rgba(16, 185, 129, 0.4)" : "1.5px solid rgba(255, 107, 43, 0.35)",
              borderRadius: "24px", padding: "26px 22px",
              width: "100%", maxWidth: "400px",
              boxShadow: isPaid
                ? "0 28px 80px rgba(0,0,0,0.7), 0 0 35px rgba(16,185,129,0.15)"
                : "0 28px 80px rgba(0,0,0,0.7), 0 0 35px rgba(255,107,43,0.15)",
              fontFamily: "var(--font-bn), inherit",
            }}
          >
            <div
              style={{
                width: 60, height: 60, borderRadius: "50%",
                background: isPaid ? "rgba(16, 185, 129, 0.15)" : "rgba(255, 107, 43, 0.15)",
                border: isPaid ? "2px solid rgba(16, 185, 129, 0.4)" : "2px solid rgba(255, 107, 43, 0.4)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "28px", margin: "0 auto 14px",
                boxShadow: isPaid ? "0 0 20px rgba(16,185,129,0.3)" : "0 0 20px rgba(255,107,43,0.3)",
              }}
            >
              {isPaid ? "💳" : "⚠️"}
            </div>

            <div style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--text-1)", textAlign: "center", marginBottom: "8px", lineHeight: 1.4 }}>
              {isPaid ? "অনলাইন পেইড অর্ডার ডেলিভারি" : "সম্পূর্ণ টাকা বুঝে নিয়ে একসেপ্ট করুন"}
            </div>

            <div style={{ fontSize: ".84rem", color: "var(--text-3)", textAlign: "center", lineHeight: 1.6, marginBottom: "18px" }}>
              {isPaid ? (
                <>
                  এই অর্ডারটির টাকা অনলাইনে অগ্রিম পরিশোধিত আছে (বিকাশ/অনলাইন)।{" "}
                  <strong style={{ color: "#34D399" }}>কাস্টমারের কাছ থেকে কোনো টাকা নেবেন না।</strong> পার্সেলটি
                  হস্তান্তর করে কনফার্ম করুন।
                </>
              ) : (
                "কাস্টমারের কাছ থেকে নগদ মোট টাকা বুঝে পেয়েছেন কি না নিশ্চিত করুন। কনফার্ম করার সাথে সাথে হিসাব সমন্বয় করা হবে।"
              )}
            </div>

            {/* Financial Breakdown in Modal */}
            <div
              style={{
                background: "var(--bg-base)", border: "1px solid var(--border-1)",
                borderRadius: "16px", padding: "14px 16px", marginBottom: "20px",
                display: "flex", flexDirection: "column", gap: "10px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: ".86rem" }}>
                <span style={{ color: "var(--text-2)" }}>💳 পেমেন্ট মোড:</span>
                <span style={{ fontWeight: 800, color: isPaid ? "#10B981" : "#F59E0B" }}>
                  {isPaid ? "অনলাইন পেইড (PAID)" : "ক্যাশ অন ডেলিভারি (COD)"}
                </span>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: ".86rem" }}>
                <span style={{ color: "var(--text-2)" }}>💵 কাস্টমার থেকে নগদ আদায়:</span>
                <span style={{ fontWeight: 800, color: isPaid ? "#10B981" : "var(--text-1)", fontSize: ".95rem" }}>
                  {isPaid ? "৳ ০ (টাকা নেবেন না)" : `৳ ${totalBill.toLocaleString()}`}
                </span>
              </div>

              <div
                style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: ".84rem",
                  padding: "6px 0", borderTop: "1px dashed var(--border-1)", borderBottom: "1px dashed var(--border-1)",
                }}
              >
                <span style={{ color: isPaid ? "#34D399" : "#FCA5A5", display: "flex", alignItems: "center", gap: "4px" }}>
                  {isPaid ? "🛡️ অ্যাকাউন্ট থেকে কর্তন:" : "🔻 অ্যাকাউন্ট থেকে মাইনাস হবে:"}
                </span>
                <span style={{ fontWeight: 800, color: isPaid ? "#10B981" : "#EF4444" }}>
                  {isPaid ? "৳ ০ (কোনো কর্তন নেই)" : `- ৳ ${totalBill.toLocaleString()}`}
                </span>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: ".84rem" }}>
                <span style={{ color: "#86EFAC", display: "flex", alignItems: "center", gap: "4px" }}>
                  🟢 ৫০% ডেলিভারি চার্জ যোগ হবে:
                </span>
                <span style={{ fontWeight: 800, color: "#00D68F" }}>+ ৳ {earnings.toLocaleString()}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: "flex", gap: "10px" }}>
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                disabled={delivering}
                style={{
                  flex: 1, padding: "13px", borderRadius: "14px",
                  background: "var(--bg-base)", border: "1px solid var(--border-2)",
                  color: "var(--text-2)", cursor: "pointer", fontSize: ".9rem",
                  fontWeight: 600, fontFamily: "var(--font-bn)",
                }}
              >
                বাতিল
              </button>

              <button
                id="modal-confirm-deliver-btn"
                type="button"
                onClick={deliver}
                disabled={delivering}
                style={{
                  flex: 2, padding: "13px 16px", borderRadius: "14px",
                  background: isPaid
                    ? "linear-gradient(135deg, #10B981, #059669)"
                    : "linear-gradient(135deg, #FF6B2B, #E05520)",
                  border: "none", color: "#FFFFFF",
                  cursor: delivering ? "not-allowed" : "pointer",
                  fontSize: ".92rem", fontWeight: 800, fontFamily: "var(--font-bn)",
                  boxShadow: isPaid ? "0 6px 20px rgba(16, 185, 129, 0.4)" : "0 6px 20px rgba(255, 107, 43, 0.4)",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
                  opacity: delivering ? 0.7 : 1,
                }}
              >
                {delivering ? (
                  <>
                    <div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />
                    <span>প্রসেসিং...</span>
                  </>
                ) : (
                  <span>{isPaid ? "✅ পার্সেল হ্যান্ডওভার সম্পন্ন" : "✅ হ্যাঁ, সম্পূর্ণ বুঝে পেয়েছি"}</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Main Page Content ─── */}
      <div className="page-content" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {/* Top bar back button */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button
            onClick={() => router.back()}
            style={{
              background: "var(--bg-card)", border: "1px solid var(--border-1)",
              borderRadius: "50%", width: 38, height: 38,
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", color: "var(--text-2)", flexShrink: 0,
            }}
          >
            <svg fill="none" viewBox="0 0 24 24" style={{ width: 18, height: 18, stroke: "currentColor" }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <div style={{ fontSize: "1.05rem", fontWeight: 800, color: "var(--text-1)" }}>
              ডেলিভারি বিস্তারিত
            </div>
            <div style={{ fontSize: ".74rem", color: "var(--text-3)", fontFamily: "var(--font-bn)" }}>
              অর্ডার #{task.order.orderNumber}
            </div>
          </div>
        </div>

        {/* ─── 3-Stage Delivery Stepper ─── */}
        {!isReturning ? (
          <div className="delivery-stepper">
            <div className="stepper-line" style={{ left: "16%", right: "16%" }} />
            <div className={`stepper-item ${isPickedUp ? (isOnTheWay ? "done" : "active") : ""}`}>
              <div className="stepper-dot">{isOnTheWay ? "✓" : "১"}</div>
              <div className="stepper-label">
                পার্সেল সংগ্রহ<br />
                <span style={{ fontSize: ".62rem", opacity: 0.8 }}>সেলার থেকে রিসিভড</span>
              </div>
            </div>
            <div className={`stepper-item ${isOnTheWay ? (isDelivered ? "done" : "active") : ""}`}>
              <div className="stepper-dot">{isDelivered ? "✓" : "২"}</div>
              <div className="stepper-label">
                ডেলিভারির পথে<br />
                <span style={{ fontSize: ".62rem", opacity: 0.8 }}>কাস্টমারের দিকে</span>
              </div>
            </div>
            <div className={`stepper-item ${isDelivered ? "done active" : ""}`}>
              <div className="stepper-dot">৩</div>
              <div className="stepper-label">
                কাস্টমার হ্যান্ডওভার<br />
                <span style={{ fontSize: ".62rem", opacity: 0.8 }}>ডেলিভারি সম্পন্ন</span>
              </div>
            </div>
          </div>
        ) : (
          <div
            style={{
              padding: "12px 14px",
              background: "rgba(239, 68, 68, 0.1)",
              border: "1px solid rgba(239, 68, 68, 0.35)",
              borderRadius: "var(--r-md)",
              display: "flex",
              alignItems: "center",
              gap: 12,
              fontFamily: "var(--font-bn)",
            }}
          >
            <span style={{ fontSize: "1.4rem" }}>🔄</span>
            <div>
              <div style={{ fontSize: ".86rem", fontWeight: 800, color: "#EF4444" }}>
                অর্ডার বাতিল — সেলারকে পার্সেল ফেরত দিন
              </div>
              <div style={{ fontSize: ".72rem", color: "var(--text-3)" }}>
                কারণ: <strong>{task.cancellationReason || "কাস্টমার রিসিভ করেননি"}</strong>
              </div>
            </div>
          </div>
        )}

        {/* Hero Card */}
        <div className="detail-hero">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8, flexWrap: "wrap", gap: 6 }}>
            <div className="detail-order-num" style={{ fontSize: ".88rem", color: "var(--orange)", fontWeight: 800, margin: 0 }}>
              অর্ডার #{task.order.orderNumber}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              {isPaid ? (
                <span style={{ fontSize: ".72rem", color: "#10B981", background: "rgba(16,185,129,.15)", border: "1px solid rgba(16,185,129,.35)", padding: "3px 9px", borderRadius: 6, fontWeight: 800 }}>
                  🟢 অনলাইন পেইড (PAID)
                </span>
              ) : (
                <span style={{ fontSize: ".72rem", color: "#F59E0B", background: "rgba(245,158,11,.15)", border: "1px solid rgba(245,158,11,.35)", padding: "3px 9px", borderRadius: 6, fontWeight: 800 }}>
                  💵 ক্যাশ অন ডেলিভারি (COD)
                </span>
              )}
              {isReturning ? (
                <span style={{ fontSize: ".68rem", color: "#EF4444", background: "rgba(239,68,68,.15)", border: "1px solid rgba(239,68,68,.3)", padding: "3px 8px", borderRadius: 6, fontWeight: 800 }}>
                  🔄 সেলারকে ফেরত
                </span>
              ) : isOnTheWay ? (
                <span style={{ fontSize: ".68rem", color: "var(--orange)", background: "var(--orange-glass)", border: "1px solid var(--border-orange)", padding: "3px 8px", borderRadius: 6, fontWeight: 700 }}>
                  🚀 ডেলিভারির পথে
                </span>
              ) : (
                <span style={{ fontSize: ".68rem", color: "var(--emerald)", background: "rgba(0,214,143,.12)", border: "1px solid rgba(0,214,143,.25)", padding: "3px 8px", borderRadius: 6, fontWeight: 700 }}>
                  📦 সেলার থেকে রিসিভড
                </span>
              )}
            </div>
          </div>
          <span className="detail-status-chip">
            <span className="live-dot" style={{ background: isReturning ? "#EF4444" : "var(--emerald)" }} />
            {isReturning ? "রিটার্ন প্রক্রিয়াধীন" : isOnTheWay ? "পথে আছেন" : "চলমান ডেলিভারি"}
          </span>

          <div className="detail-info-grid">
            <div className="detail-info-item">
              <div className="detail-info-label">কাস্টমার</div>
              <div className="detail-info-value">{task.order.customerName}</div>
            </div>
            <div className="detail-info-item">
              <div className="detail-info-label">ফোন</div>
              <div className="detail-info-value">
                <a
                  href={`tel:${task.order.customerPhone}`}
                  style={{
                    color: "var(--orange)", display: "inline-flex",
                    alignItems: "center", gap: 4, textDecoration: "none", fontWeight: 700,
                  }}
                >
                  📞 {task.order.customerPhone}
                </a>
              </div>
            </div>
            <div className="detail-info-item" style={{ gridColumn: "1/-1" }}>
              <div className="detail-info-label">ডেলিভারি ঠিকানা</div>
              <div className="detail-info-value" style={{ lineHeight: 1.5 }}>
                📍 {task.order.deliveryAddress}
              </div>
            </div>
            <div className="detail-info-item">
              <div className="detail-info-label">দোকান / ভেন্ডর</div>
              <div className="detail-info-value">🏪 {task.order.vendorName}</div>
            </div>
            <div className="detail-info-item">
              <div className="detail-info-label">{isReturning ? "রিটার্ন ট্রিপ ভাতা" : "আপনার ডেলিভারি আয়"}</div>
              <div className="detail-info-value" style={{ color: "var(--emerald)", fontSize: "1.15rem", fontWeight: 900 }}>
                {isReturning ? "৳ ২০" : `৳ ${Number(earnings).toLocaleString()}`}
              </div>
            </div>
          </div>
        </div>

        {/* If in Returning Stage, display prominent Return Guide */}
        {isReturning && (
          <div className="return-card">
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: ".9rem", fontWeight: 800, color: "#EF4444" }}>
              <span>🔄</span>
              <span>পণ্যটি সেলারের দোকানে ফেরত দিন</span>
            </div>
            <div style={{ fontSize: ".8rem", color: "var(--text-2)", lineHeight: 1.6 }}>
              দয়া করে পার্সেলটি নিয়ে সরাসরি <strong>{task.order.vendorName}</strong> দোকানে যান এবং পণ্যগুলো সেলারের হাতে অক্ষত অবস্থায় ফিরিয়ে দিন।
            </div>
            <div style={{ padding: "10px 12px", background: "var(--bg-base)", borderRadius: "var(--r-md)", border: "1px solid var(--border-1)", fontSize: ".76rem", color: "var(--text-3)" }}>
              🛡️ <strong>ক্যাশ নিরাপত্তা:</strong> এই অর্ডারের কোনো টাকা আপনার ওয়ালেট থেকে কাটা হয়নি। ফেরত সম্পন্ন করলে আপনার ব্যালেন্সে <strong>৳ ২০</strong> ট্রিপ ভাতা জমা হবে।
            </div>
            <button
              id="confirm-return-vendor-btn"
              type="button"
              className="task-deliver-btn"
              disabled={confirmingReturn}
              onClick={handleConfirmReturn}
              style={{
                background: "linear-gradient(135deg, #10B981, #059669)",
                boxShadow: "0 8px 30px rgba(16,185,129,.4)",
                padding: "16px",
              }}
            >
              {confirmingReturn ? "প্রসেসিং..." : "✅ ভেন্ডরকে পার্সেল ফেরত দিয়েছি"}
            </button>
          </div>
        )}

        {/* Items List */}
        <div className="items-list">
          <div className="items-list-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span>পণ্যের তালিকা ({task.order.items.length}টি)</span>
            <span style={{ fontSize: ".72rem", color: "var(--text-3)", textTransform: "none" }}>মূল্য</span>
          </div>
          {task.order.items.map((item, i) => {
            const itemPrice = Number(item.price || 0);
            const itemTotal = Number(item.total || (itemPrice > 0 ? item.qty * itemPrice : 0));
            return (
              <div key={i} className="item-row" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                  <span className="item-name" style={{ fontWeight: 600, color: "var(--text-1)" }}>
                    {item.name}
                  </span>
                  <span style={{ fontSize: ".75rem", color: "var(--text-3)", fontFamily: "var(--font-bn)" }}>
                    পরিমাণ: <strong style={{ color: "var(--orange)" }}>×{item.qty}</strong>
                    {itemPrice > 0 && <span> (প্রতিটি ৳{itemPrice.toLocaleString()})</span>}
                  </span>
                </div>
                <div style={{ textAlign: "right" }}>
                  <span style={{ fontSize: ".92rem", fontWeight: 700, color: "var(--text-1)", fontFamily: "monospace" }}>
                    {itemTotal > 0 ? `৳ ${itemTotal.toLocaleString()}` : "—"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Price Breakdown Card */}
        <div
          style={{
            background: "var(--bg-card)", border: "1px solid var(--border-1)",
            borderRadius: "var(--r-lg)", padding: "16px 18px",
            display: "flex", flexDirection: "column", gap: "12px", fontFamily: "var(--font-bn)",
          }}
        >
          <div
            style={{
              fontSize: ".76rem", fontWeight: 700, color: "var(--text-3)",
              textTransform: "uppercase", letterSpacing: ".08em",
              borderBottom: "1px solid var(--border-1)", paddingBottom: "8px",
              display: "flex", justifyContent: "space-between", alignItems: "center",
            }}
          >
            <span>বিল বিবরণী (Bill Breakdown)</span>
            <span style={{ color: isPaid ? "#10B981" : "#F59E0B", fontWeight: 800, textTransform: "none", fontSize: ".8rem" }}>
              {isPaid ? "🟢 অনলাইন পরিশোধিত (PAID)" : "💵 ক্যাশ অন ডেলিভারি (COD)"}
            </span>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", fontSize: ".88rem", color: "var(--text-2)" }}>
            <span>পণ্যের মোট মূল্য:</span>
            <span style={{ fontWeight: 600, color: "var(--text-1)" }}>৳ {subtotal.toLocaleString()}</span>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", fontSize: ".88rem", color: "var(--text-2)" }}>
            <span>ডেলিভারি চার্জ:</span>
            <span style={{ fontWeight: 600, color: "var(--orange)" }}>+ ৳ {deliveryFee.toLocaleString()}</span>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", fontSize: ".84rem", color: "var(--text-3)" }}>
            <span>রাইডারের ডেলিভারি আয় (৫০% ফি):</span>
            <span style={{ fontWeight: 700, color: "#10B981" }}>৳ {earnings.toLocaleString()}</span>
          </div>

          <div style={{ height: "1px", background: "var(--border-1)", margin: "2px 0" }} />

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: ".98rem", fontWeight: 800, color: "var(--text-1)" }}>
                সর্বমোট প্রদেয় বিল:
              </div>
              <div style={{ fontSize: ".72rem", color: "var(--text-3)" }}>
                {isPaid ? "অনলাইনে অগ্রিম পরিশোধিত" : "কাস্টমার থেকে নগদ আদায় করবেন"}
              </div>
            </div>
            <div style={{ fontSize: "1.35rem", fontWeight: 900, color: "var(--text-1)", fontFamily: "monospace" }}>
              ৳ {totalBill.toLocaleString()}
            </div>
          </div>

          <div
            style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "10px 14px",
              background: isPaid ? "rgba(16,185,129,.1)" : "rgba(255,107,43,.1)",
              border: `1px solid ${isPaid ? "rgba(16,185,129,.25)" : "rgba(255,107,43,.25)"}`,
              borderRadius: "12px", marginTop: "4px",
            }}
          >
            <div>
              <div style={{ fontSize: ".82rem", fontWeight: 800, color: isPaid ? "#10B981" : "var(--orange)" }}>
                💵 কাস্টমার থেকে নগদ আদায়:
              </div>
              <div style={{ fontSize: ".7rem", color: "var(--text-3)" }}>
                {isPaid ? "অনলাইন পেইড, কোনো টাকা নেওয়া যাবে না" : "কাস্টমার থেকে নগদ বুঝে নিবেন"}
              </div>
            </div>
            <div
              style={{
                fontSize: "1.2rem", fontWeight: 900,
                color: isPaid ? "#10B981" : "#EF4444", fontFamily: "monospace",
              }}
            >
              ৳ {cashToCollect.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Action Controls when not returning */}
        {!isReturning && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 4 }}>
            {/* Stage-based primary action */}
            {currentStage === "PICKED_UP" || currentStage === "ASSIGNED" ? (
              <button
                id="start-transit-btn"
                type="button"
                className="task-deliver-btn"
                onClick={startTransit}
                disabled={transiting}
                style={{
                  fontSize: "1.05rem", padding: "18px",
                  background: "linear-gradient(135deg, var(--orange), #E05520)",
                  boxShadow: "0 8px 30px var(--orange-glow)",
                  cursor: "pointer",
                }}
              >
                {transiting ? "প্রসেসিং..." : "🚀 কাস্টমারের উদ্দেশ্যে রওনা দিন (Start Delivery)"}
              </button>
            ) : (
              <button
                id="deliver-complete-btn"
                type="button"
                className="task-deliver-btn"
                onClick={() => setShowConfirmModal(true)}
                disabled={delivering || success}
                style={{
                  fontSize: "1.08rem", padding: "20px",
                  background: isPaid
                    ? "linear-gradient(135deg, #10B981, #059669)"
                    : "linear-gradient(135deg, #FF6B2B, #E05520)",
                  boxShadow: isPaid ? "0 8px 30px rgba(16,185,129,.4)" : "0 8px 30px rgba(255,107,43,.4)",
                  cursor: "pointer",
                }}
              >
                {isPaid ? "🎯 পার্সেল হ্যান্ডওভার ও ডেলিভারি সম্পন্ন" : "🎯 সম্পূর্ণ টাকা বুঝে পেয়ে ডেলিভারি সম্পন্ন"}
              </button>
            )}

            {/* Cancel & Return Trigger */}
            <button
              id="open-cancel-return-btn"
              type="button"
              onClick={() => setShowCancelModal(true)}
              style={{
                width: "100%", padding: "13px",
                background: "var(--bg-base)",
                border: "1px solid rgba(239, 68, 68, 0.35)",
                borderRadius: "var(--r-md)",
                color: "#EF4444", fontSize: ".88rem", fontWeight: 700,
                fontFamily: "var(--font-bn)", cursor: "pointer",
                transition: "all .2s ease",
              }}
            >
              ⚠️ কাস্টমার নেয়নি / অর্ডার বাতিল ও রিটার্ন
            </button>
          </div>
        )}
      </div>
    </>
  );
}
