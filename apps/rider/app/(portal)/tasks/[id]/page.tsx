"use client";
import React, { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiFetch, type ActiveTask } from "@/lib/api";
import { sound } from "@/lib/sound";
import { ChatModal } from "@/components/ChatModal";
import { subscribeSyncEvent, emitSyncEvent } from "@/lib/sync";

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
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isVendorChatOpen, setIsVendorChatOpen] = useState(false);

  // Delivery Handover Modal & Customer OTP
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [inputDeliveryOtp, setInputDeliveryOtp] = useState("");
  const [deliveryOtpError, setDeliveryOtpError] = useState("");
  const [showBypass, setShowBypass] = useState(false);
  const [bypassNote, setBypassNote] = useState("");
  const [delivering, setDelivering] = useState(false);
  const [success, setSuccess] = useState(false);
  const [earning, setEarning] = useState(0);
  const [deducted, setDeducted] = useState(0);

  // Stage 1 -> 2 Transit
  const [transiting, setTransiting] = useState(false);

  // Cancel Request Flow
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("কাস্টমার ফোন ধরছেন না / বন্ধ");
  const [cancelling, setCancelling] = useState(false);

  // Return Code Input & Verification
  const [inputReturnCode, setInputReturnCode] = useState("");
  const [codeError, setCodeError] = useState("");
  const [verifyingCode, setVerifyingCode] = useState(false);
  const [approvingDemo, setApprovingDemo] = useState(false);
  const [returnSuccess, setReturnSuccess] = useState(false);

  useEffect(() => {
    function loadTask() {
      apiFetch<ActiveTask[]>("/rider-portal/tasks/active").then((r) => {
        if (r.success && r.data) {
          const found = (r.data as ActiveTask[]).find((a) => a.assignmentId === id || a.order.id === id);
          setTask(found || null);
        }
        setLoading(false);
      });
    }

    loadTask();

    const unsub = subscribeSyncEvent((payload) => {
      if (payload.type === "CANCELLATION_APPROVED") {
        if (!payload.taskId || payload.taskId === id || payload.taskId === task?.order?.id || payload.taskId === task?.assignmentId) {
          loadTask();
        }
      }
    });

    return () => unsub();
  }, [id, task?.order?.id, task?.assignmentId]);

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

  // 1. Advance to Transit (Stage 1 -> 2: Parcel Picked Up from Vendor)
  async function startTransit() {
    if (!task) return;
    setIsVendorChatOpen(false); // Close vendor chatbox upon picking up parcel from store
    setTransiting(true);
    const res = await apiFetch<ActiveTask>(`/rider-portal/tasks/${id}/transit`, { method: "POST" });
    if (res.success && res.data) {
      setTask(res.data);
    } else {
      alert("স্ট্যাটাস পরিবর্তন করা যায়নি");
    }
    setTransiting(false);
  }

  // 2. Rider Submits Cancellation Request to Admin & Hub
  async function handleSendCancelRequest() {
    if (!task) return;
    setCancelling(true);
    const res = await apiFetch<ActiveTask>(`/rider-portal/tasks/${id}/cancel-request`, {
      method: "POST",
      body: JSON.stringify({ reason: cancelReason }),
    });
    if (res.success && res.data) {
      setTask(res.data);
      setShowCancelModal(false);
    } else {
      alert("বাতিল অনুরোধ পাঠানো যায়নি");
    }
    setCancelling(false);
  }

  // 3. Demo Simulator: Admin Approves Cancellation Request
  async function handleAdminApproveDemo() {
    if (!task) return;
    setApprovingDemo(true);
    const res = await apiFetch<ActiveTask>(`/rider-portal/tasks/${id}/approve-cancel`, {
      method: "POST",
    });
    if (res.success && res.data) {
      setTask(res.data);
      emitSyncEvent({
        type: "CANCELLATION_APPROVED",
        taskId: id,
        message: "অ্যাডমিন ক্যানসেল রিকোয়েস্ট অনুমোদন করেছে।",
      });
    } else {
      alert("অ্যাপ্রুভাল প্রসেস করা যায়নি");
    }
    setApprovingDemo(false);
  }

  // 4. Rider Verifies 4-digit Return Code provided by Store Owner
  async function handleVerifyReturnCode() {
    if (!task) return;
    if (!inputReturnCode.trim()) {
      setCodeError("দোকানদারের দেওয়া ৪ সংখ্যার রিটার্ন কোডটি লিখুন");
      return;
    }
    setCodeError("");
    setVerifyingCode(true);
    const res = await apiFetch<{ returnAllowance: number; message: string }>(
      `/rider-portal/tasks/${id}/verify-return-code`,
      {
        method: "POST",
        body: JSON.stringify({ returnCode: inputReturnCode }),
      }
    );
    if (res.success) {
      setReturnSuccess(true);
      confetti();
      setTimeout(() => {
        router.replace("/tasks");
      }, 3800);
    } else {
      setCodeError(res.error || "ভুল রিটার্ন কোড! দোকানদারের কোড মিলিয়ে নিন।");
      setVerifyingCode(false);
    }
  }

  // 5. Normal Delivery to Customer Handover
  async function deliver() {
    if (!task) return;
    if (!showBypass && !inputDeliveryOtp.trim()) {
      setDeliveryOtpError("কাস্টমারের মোবাইলের ৪-সংখ্যার ওটিপি কোডটি লিখুন");
      return;
    }
    setDeliveryOtpError("");
    setDelivering(true);
    const res = await apiFetch<{ earning: number; orderTotal?: number; totalBill?: number; cashDeduction?: number; isPaid?: boolean }>(
      `/rider-portal/tasks/${id}/deliver`,
      {
        method: "POST",
        body: JSON.stringify({
          deliveryOtp: inputDeliveryOtp.trim(),
          proofNote: showBypass && bypassNote.trim() ? bypassNote.trim() : undefined,
        }),
      }
    );
    if (res.success && res.data) {
      sound.playSuccessChime();
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
      setDeliveryOtpError(res.error || "ডেলিভারি ওটিপি যাচাই ব্যর্থ হয়েছে");
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
  const isRequested = currentStage === "CANCELLATION_REQUESTED";
  const isReturning = currentStage === "RETURNING_TO_VENDOR";
  const isDelivered = currentStage === "DELIVERED";
  const isOnTheWay = currentStage === "ON_THE_WAY" || isDelivered;
  const isPickedUp = currentStage === "PICKED_UP" || isOnTheWay;

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

      {/* ─── Success Overlay: Store Return Verified ─── */}
      {returnSuccess && (
        <div className="success-overlay" style={{ pointerEvents: "auto", background: "rgba(5,8,16,.92)", zIndex: 1000 }}>
          <div className="success-circle" style={{ background: "rgba(16,185,129,.15)", borderColor: "#10B981" }}>🔐</div>
          <div className="success-text" style={{ fontSize: "1.5rem" }}>দোকানদার কোড যাচাই সফল!</div>
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
              🛡️ পার্সেল সেলারকে ফেরত সম্পন্ন (০ বিল কর্তন)
            </div>
            <div style={{ color: "var(--orange)", fontSize: ".95rem", fontWeight: 800 }}>
              + ৳ ২০ রিটার্ন ট্রিপ ভাতা আপনার ওয়ালেটে জমা হয়েছে
            </div>
          </div>
          <div className="success-sub" style={{ marginTop: "14px" }}>
            স্বয়ংক্রিয়ভাবে টাস্ক তালিকায় ফিরে যাচ্ছেন...
          </div>
        </div>
      )}

      {/* ─── Cancel Request & Hub Contact Modal ─── */}
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
              width: "100%", maxWidth: "390px",
              boxShadow: "0 28px 80px rgba(0,0,0,0.7)",
              fontFamily: "var(--font-bn)",
              maxHeight: "92vh",
              overflowY: "auto",
            }}
          >
            <div style={{ fontSize: "2rem", textAlign: "center", marginBottom: 6 }}>📞</div>
            <div style={{ fontSize: "1.15rem", fontWeight: 800, color: "var(--text-1)", textAlign: "center", marginBottom: 4 }}>
              ডেলিভারি বাতিল ও হাবে যোগাযোগ
            </div>
            <div style={{ fontSize: ".78rem", color: "var(--text-3)", textAlign: "center", lineHeight: 1.5, marginBottom: 14 }}>
              কাস্টমার পার্সেল না নিলে কারণ সিলেক্ট করে হাবে যোগাযোগ করুন। অ্যাডমিন অনুমোদনের পর দোকানে পণ্য ফেরত দেওয়ার অপশন চালু হবে।
            </div>

            {/* Hub Contact Hotline Card */}
            <div className="hub-contact-card" style={{ marginBottom: 14 }}>
              <div>
                <div style={{ fontSize: ".68rem", color: "var(--text-3)" }}>টাটকা বাজার সেন্ট্রাল হাব</div>
                <div style={{ fontSize: ".92rem", fontWeight: 800, color: "var(--text-1)" }}>
                  📞 {task.hubPhone || "01711-998877"}
                </div>
              </div>
              <a href={`tel:${(task.hubPhone || "01711998877").replace(/[^0-9]/g, "")}`} className="hub-call-btn">
                📞 সরাসরি কল দিন
              </a>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 14 }}>
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

            <div style={{ padding: "10px 12px", background: "rgba(255,107,43,.08)", borderRadius: "10px", fontSize: ".74rem", color: "var(--text-2)", marginBottom: 16, border: "1px dashed var(--border-orange)" }}>
              🛡️ <strong>আপনার অধিকার:</strong> আবেদন পাঠানোর পর অ্যাডমিন অ্যাপ্রুভ করলে দোকানে মাল ফেরত দিয়ে কোড যাচাই সম্পন্ন করবেন। ওয়ালেট থেকে কোনো টাকা কাটা হবে না এবং আপনি ৳ ২০ ট্রিপ ভাতা পাবেন।
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
                id="send-cancel-request-btn"
                type="button"
                onClick={handleSendCancelRequest}
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
                {cancelling ? "পাঠানো হচ্ছে..." : "📩 বাতিল অনুরোধ পাঠান"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Delivery Confirmation Handover Warning Modal ─── */}
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

            {/* Customer Delivery OTP Verification Box */}
            <div style={{
              background: "rgba(0, 0, 0, 0.25)",
              border: "1px solid rgba(0, 214, 143, 0.3)",
              borderRadius: "16px",
              padding: "16px 14px",
              marginBottom: "18px",
              textAlign: "center",
            }}>
              <div style={{ fontSize: ".76rem", fontWeight: 700, color: "#00d68f", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 4 }}>
                🔐 কাস্টমার ডেলিভারি ওটিপি (Proof of Delivery)
              </div>
              <div style={{ fontSize: ".76rem", color: "var(--text-3)", marginBottom: 10 }}>
                কাস্টমারের মোবাইলে পাঠানো ৪-সংখ্যার ডেলিভারি কোডটি নিচে লিখুন:
              </div>

              {!showBypass ? (
                <>
                  <input
                    id="customer-delivery-otp-input"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={4}
                    placeholder="• • • •"
                    value={inputDeliveryOtp}
                    onChange={(e) => {
                      setInputDeliveryOtp(e.target.value.replace(/[^0-9]/g, "").slice(0, 4));
                      setDeliveryOtpError("");
                    }}
                    className="delivery-otp-input"
                  />

                  {/* Test Demo OTP Pill */}
                  {task.customerDeliveryOtp && (
                    <div
                      className="return-hint-pill"
                      onClick={() => setInputDeliveryOtp(task.customerDeliveryOtp || "4826")}
                      style={{ borderColor: "rgba(0,214,143,.4)", background: "rgba(0,214,143,.1)", cursor: "pointer", display: "inline-flex", marginTop: 4 }}
                      title="ক্লিক করে কোড বসিয়ে দিন"
                    >
                      💡 [টেস্ট ডেমো ওটিপি]:{" "}
                      <strong style={{ color: "#00d68f", fontSize: "1rem", letterSpacing: 2, marginLeft: 4 }}>
                        {task.customerDeliveryOtp}
                      </strong>
                    </div>
                  )}

                  <div style={{ marginTop: 10 }}>
                    <button
                      type="button"
                      onClick={() => setShowBypass(true)}
                      style={{
                        background: "none",
                        border: "none",
                        color: "var(--text-3)",
                        fontSize: ".72rem",
                        textDecoration: "underline",
                        cursor: "pointer",
                        fontFamily: "var(--font-bn)",
                      }}
                    >
                      ⚠️ কাস্টমারের ফোন বন্ধ বা চার্জ নেই? জরুরি নোট দিন
                    </button>
                  </div>
                </>
              ) : (
                <div style={{ textAlign: "left", marginTop: 8 }}>
                  <div style={{ fontSize: ".74rem", color: "#F59E0B", fontWeight: 700, marginBottom: 4 }}>
                    জরুরি হ্যান্ডওভার নোট (ফোন বন্ধ থাকলে):
                  </div>
                  <input
                    type="text"
                    placeholder="উদা: কাস্টমারের ফোন বন্ধ, ভাইয়ের উপস্থিতিতে হ্যান্ডওভার"
                    value={bypassNote}
                    onChange={(e) => {
                      setBypassNote(e.target.value);
                      setDeliveryOtpError("");
                    }}
                    style={{
                      width: "100%",
                      padding: "10px",
                      borderRadius: "8px",
                      background: "var(--bg-base)",
                      border: "1px solid var(--border-2)",
                      color: "var(--text-1)",
                      fontSize: ".82rem",
                      fontFamily: "var(--font-bn)",
                      boxSizing: "border-box",
                      marginBottom: 6,
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowBypass(false)}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#00d68f",
                      fontSize: ".72rem",
                      textDecoration: "underline",
                      cursor: "pointer",
                      fontFamily: "var(--font-bn)",
                    }}
                  >
                    ← আবার ওটিপি কোড দিয়ে ভেরিফাই করুন
                  </button>
                </div>
              )}

              {deliveryOtpError && (
                <div style={{ fontSize: ".76rem", color: "#EF4444", marginTop: 8, fontWeight: 700 }}>
                  {deliveryOtpError}
                </div>
              )}
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
                disabled={delivering || (!showBypass && inputDeliveryOtp.length < 4 && !task.customerDeliveryOtp)}
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
                    <span>যাচাই হচ্ছে...</span>
                  </>
                ) : (
                  <span>✅ ওটিপি যাচাই ও ডেলিভারি সম্পন্ন</span>
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

        {/* ─── 3-Stage Delivery Stepper / Return Status Alert ─── */}
        {!isRequested && !isReturning ? (
          <div className="delivery-stepper">
            <div className="stepper-line" style={{ left: "16%", right: "16%" }} />
            <div className={`stepper-item ${isPickedUp ? (isOnTheWay ? "done" : "active") : ""}`}>
              <div className="stepper-dot">{isOnTheWay ? "✓" : "১"}</div>
              <div className="stepper-label">
                পার্সেল সংগ্রহ<br />
                <span style={{ fontSize: ".62rem", opacity: 0.8 }}>সেলার থেকে</span>
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
        ) : isRequested ? (
          <div
            style={{
              padding: "12px 14px",
              background: "rgba(245, 158, 11, 0.1)",
              border: "1px solid rgba(245, 158, 11, 0.35)",
              borderRadius: "var(--r-md)",
              display: "flex",
              alignItems: "center",
              gap: 12,
              fontFamily: "var(--font-bn)",
            }}
          >
            <span style={{ fontSize: "1.4rem" }}>⏳</span>
            <div>
              <div style={{ fontSize: ".86rem", fontWeight: 800, color: "var(--amber)" }}>
                বাতিল অনুরোধ পাঠানো হয়েছে — অ্যাডমিন অনুমোদনের অপেক্ষায়
              </div>
              <div style={{ fontSize: ".72rem", color: "var(--text-3)" }}>
                হাব ইনচার্জ কাস্টমারকে চেক করার পর সেলারের কাছে ফেরত পাঠানোর অপশন আনলক হবে।
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
                সেলারকে পার্সেল ফেরত দিন ও রিটার্ন কোড সংগ্রহ করুন
              </div>
              <div style={{ fontSize: ".72rem", color: "var(--text-3)" }}>
                অ্যাডমিন বাতিল অনুমোদন করেছে। দোকানে পণ্য পৌঁছে দিয়ে দোকানদারের কোড দিয়ে সম্পন্ন করুন।
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
              {isRequested ? (
                <span style={{ fontSize: ".68rem", color: "var(--amber)", background: "rgba(245,158,11,.15)", border: "1px solid rgba(245,158,11,.3)", padding: "3px 8px", borderRadius: 6, fontWeight: 800 }}>
                  ⏳ বাতিল অপেক্ষারত
                </span>
              ) : isReturning ? (
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
            <span className="live-dot" style={{ background: isRequested ? "var(--amber)" : isReturning ? "#EF4444" : "var(--emerald)" }} />
            {isRequested ? "বাতিল ভেরিফিকেশন" : isReturning ? "রিটার্ন প্রক্রিয়াধীন" : isOnTheWay ? "পথে আছেন" : "চলমান ডেলিভারি"}
          </span>

          <div className="detail-info-grid">
            <div className="detail-info-item">
              <div className="detail-info-label">কাস্টমার</div>
              <div className="detail-info-value">{task.order.customerName}</div>
            </div>
            <div className="detail-info-item" style={{ gridColumn: "1/-1" }}>
              <div className="detail-info-label">কাস্টমার স্ট্যাটাস ও যোগাযোগ</div>
              <div className="detail-info-value" style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap", marginTop: 4 }}>
                {task.order.hasAccount === false ? (
                  <span style={{
                    fontSize: ".70rem",
                    color: "#F59E0B",
                    background: "rgba(245, 158, 11, 0.12)",
                    border: "1px solid rgba(245, 158, 11, 0.35)",
                    padding: "3px 8px",
                    borderRadius: "6px",
                    fontWeight: 800,
                  }}>
                    ⚠️ অ্যাকাউন্ট ছাড়া গেস্ট অর্ডার
                  </span>
                ) : (
                  <span style={{
                    fontSize: ".70rem",
                    color: "#00d68f",
                    background: "rgba(0, 214, 143, 0.12)",
                    border: "1px solid rgba(0, 214, 143, 0.35)",
                    padding: "3px 8px",
                    borderRadius: "6px",
                    fontWeight: 800,
                  }}>
                    🟢 রেজিস্টার্ড কাস্টমার
                  </span>
                )}

                <a
                  href={`tel:${task.order.customerPhone}`}
                  style={{
                    color: "var(--orange)", display: "inline-flex",
                    alignItems: "center", gap: 4, textDecoration: "none", fontWeight: 700,
                    background: "rgba(255,122,0,0.12)", border: "1px solid rgba(255,122,0,0.3)",
                    padding: "4px 10px", borderRadius: "6px", fontSize: ".76rem",
                  }}
                  title="কাস্টমারকে সরাসরি কল করুন"
                >
                  📞 {task.order.customerPhone} (কল দিন)
                </a>

                {task.order.hasAccount === false ? (
                  <button
                    type="button"
                    onClick={() => alert("এই কাস্টমার অ্যাকাউন্ট ছাড়া গেস্ট হিসেবে অর্ডার করেছেন, তাই ইন-অ্যাপ চ্যাট প্রযোজ্য নয়। সরাসরি ফোন কল করুন।")}
                    style={{
                      color: "#94a3b8", display: "inline-flex",
                      alignItems: "center", gap: 4, fontWeight: 700,
                      background: "rgba(148, 163, 184, 0.1)", border: "1px solid rgba(148, 163, 184, 0.25)",
                      padding: "4px 10px", borderRadius: "6px", fontSize: ".76rem",
                      cursor: "not-allowed", fontFamily: "var(--font-bn)", opacity: 0.7,
                    }}
                    title="গেস্ট অর্ডারে ইন-অ্যাপ চ্যাট বন্ধ — সরাসরি কল করুন"
                  >
                    🚫 চ্যাট বন্ধ (গেস্ট)
                  </button>
                ) : (
                  <button
                    type="button"
                    id="customer-chat-btn"
                    onClick={() => setIsChatOpen(true)}
                    style={{
                      color: "#00d68f", display: "inline-flex",
                      alignItems: "center", gap: 4, fontWeight: 700,
                      background: "rgba(0,214,143,0.12)", border: "1px solid rgba(0,214,143,0.3)",
                      padding: "4px 10px", borderRadius: "6px", fontSize: ".76rem",
                      cursor: "pointer", fontFamily: "var(--font-bn)",
                    }}
                    title="কাস্টমারের সাথে ইন-অ্যাপ চ্যাট করুন"
                  >
                    💬 চ্যাট / SMS
                  </button>
                )}
              </div>

              {task.order.hasAccount === false && (
                <div style={{
                  background: "rgba(245, 158, 11, 0.08)",
                  border: "1px solid rgba(245, 158, 11, 0.25)",
                  borderRadius: "8px",
                  padding: "6px 10px",
                  fontSize: ".72rem",
                  color: "#F59E0B",
                  fontFamily: "var(--font-bn)",
                  marginTop: 6,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}>
                  <span>ℹ️</span>
                  <span>এই কাস্টমার অ্যাকাউন্ট ছাড়া গেস্ট হিসেবে অর্ডার করেছেন — ইন-অ্যাপ মেসেজ যাবে না, সরাসরি কল করতে হবে।</span>
                </div>
              )}
            </div>
            <div className="detail-info-item" style={{ gridColumn: "1/-1" }}>
              <div className="detail-info-label">ডেলিভারি ঠিকানা</div>
              <div className="detail-info-value" style={{ lineHeight: 1.5 }}>
                📍 {task.order.deliveryAddress}
              </div>
            </div>
            <div className="detail-info-item" style={{ gridColumn: "1/-1" }}>
              <div className="detail-info-label">দোকান ও ভেন্ডর যোগাযোগ</div>
              <div className="detail-info-value" style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap", marginTop: 4 }}>
                <span style={{ fontWeight: 800 }}>🏪 {task.order.vendorName || "সবুজ খামার গ্রোসারি"}</span>
                <a
                  href="tel:01711223344"
                  style={{
                    color: "var(--emerald)", display: "inline-flex",
                    alignItems: "center", gap: 4, textDecoration: "none", fontWeight: 700,
                    background: "rgba(0,214,143,0.12)", border: "1px solid rgba(0,214,143,0.3)",
                    padding: "4px 10px", borderRadius: "6px", fontSize: ".76rem",
                  }}
                  title="ভেন্ডরকে সরাসরি কল করুন"
                >
                  📞 01711-223344 (কল দিন)
                </a>
                {!isOnTheWay ? (
                  <button
                    type="button"
                    id="vendor-chat-btn"
                    onClick={() => setIsVendorChatOpen(true)}
                    style={{
                      color: "#38bdf8", display: "inline-flex",
                      alignItems: "center", gap: 4, fontWeight: 700,
                      background: "rgba(56,189,248,0.12)", border: "1px solid rgba(56,189,248,0.3)",
                      padding: "4px 10px", borderRadius: "6px", fontSize: ".76rem",
                      cursor: "pointer", fontFamily: "var(--font-bn)",
                    }}
                    title="পার্সেল পিকআপের জন্য ভেন্ডরের সাথে চ্যাট করুন"
                  >
                    💬 ভেন্ডরের সাথে চ্যাট
                  </button>
                ) : (
                  <span style={{
                    fontSize: ".70rem", color: "#94a3b8",
                    background: "rgba(148,163,184,0.1)", border: "1px solid rgba(148,163,184,0.2)",
                    padding: "3px 8px", borderRadius: "6px", fontWeight: 600,
                  }}>
                    🔒 পার্সেল রিসিভ সম্পন্ন (চ্যাট বন্ধ — প্রয়োজনে সরাসরি ফোনে কথা বলুন)
                  </span>
                )}
              </div>
            </div>
            <div className="detail-info-item">
              <div className="detail-info-label">{isReturning || isRequested ? "রিটার্ন ট্রিপ ভাতা" : "আপনার ডেলিভারি আয়"}</div>
              <div className="detail-info-value" style={{ color: "var(--emerald)", fontSize: "1.15rem", fontWeight: 900 }}>
                {isReturning || isRequested ? "৳ ২০" : `৳ ${Number(earnings).toLocaleString()}`}
              </div>
            </div>
          </div>
        </div>

        {/* ─── Customer Location Map (ON_THE_WAY stage) ─── */}
        {isOnTheWay && !isDelivered && (
          <CustomerLocationMap
            {...(task.customerLat !== undefined ? { lat: task.customerLat } : {})}
            {...(task.customerLng !== undefined ? { lng: task.customerLng } : {})}
            address={task.order.deliveryAddress}
            customerName={task.order.customerName}
          />
        )}

        {/* ─── State 1: CANCELLATION_REQUESTED (Waiting on Admin & Hub call) ─── */}
        {isRequested && (
          <div className="waiting-card">
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: "1.6rem" }}>⏳</span>
              <div>
                <div style={{ fontSize: ".92rem", fontWeight: 800, color: "var(--amber)" }}>
                  ক্যানসেলেশন রিকোয়েস্ট অ্যাডমিন প্যানেলে পাঠানো হয়েছে
                </div>
                <div style={{ fontSize: ".74rem", color: "var(--text-3)", marginTop: 2 }}>
                  কারণ: <strong>{task.cancellationReason}</strong>
                </div>
              </div>
            </div>

            {/* Direct Hub Helpline Call */}
            <div className="hub-contact-card">
              <div>
                <div style={{ fontSize: ".68rem", color: "var(--text-3)" }}>টাটকা বাজার সেন্ট্রাল হাব</div>
                <div style={{ fontSize: ".90rem", fontWeight: 800, color: "var(--text-1)" }}>
                  📞 {task.hubPhone || "01711-998877"}
                </div>
              </div>
              <a href={`tel:${(task.hubPhone || "01711998877").replace(/[^0-9]/g, "")}`} className="hub-call-btn">
                📞 হাবে কল দিন
              </a>
            </div>

            <div style={{ fontSize: ".75rem", color: "var(--text-2)", lineHeight: 1.5 }}>
              💡 হাবে কথা বলুন যাতে তারা কাস্টমারকে চেক করে অর্ডারটি বাতিল অনুমোদন করে। অনুমোদন পেলে আপনি পণ্যটি দোকানে ফেরত দেওয়ার অপশন পাবেন।
            </div>

            {/* Demo Simulation Action for Testing */}
            <div style={{ borderTop: "1px dashed var(--border-2)", paddingTop: 12 }}>
              <div style={{ fontSize: ".68rem", color: "var(--text-3)", marginBottom: 6 }}>
                ⚡ টেস্টের জন্য অ্যাডমিন অনুমোদন বাটন:
              </div>
              <button
                id="demo-admin-approve-btn"
                type="button"
                className="btn-secondary"
                disabled={approvingDemo}
                onClick={handleAdminApproveDemo}
                style={{
                  fontSize: ".82rem",
                  padding: "10px",
                  borderColor: "var(--amber)",
                  color: "var(--amber)",
                }}
              >
                {approvingDemo ? "প্রসেসিং..." : "⚡ [অ্যাডমিন অনুমোদন সম্পন্ন করুন — স্ট্যাটাস ওপেন]"}
              </button>
            </div>
          </div>
        )}

        {/* ─── State 2: RETURNING_TO_VENDOR (Store Handover & OTP Verification) ─── */}
        {isReturning && (
          <div className="return-card">
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: ".95rem", fontWeight: 800, color: "#EF4444" }}>
              <span>🔄</span>
              <span>সেলারকে পণ্য ফেরত ও রিটার্ন কোড ভেরিফিকেশন</span>
            </div>
            
            <div style={{ fontSize: ".80rem", color: "var(--text-2)", lineHeight: 1.6 }}>
              পার্সেলটি মূল দোকানে ফিরিয়ে দিন: <strong>🏪 {task.order.vendorName}</strong>।<br />
              দোকানদার পণ্য অক্ষত বুঝে নিয়ে আপনাকে <strong>৪-সংখ্যার রিটার্ন কোড</strong> দেবেন।
            </div>

            {/* Test Helper Pill */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 6 }}>
              <span style={{ fontSize: ".72rem", color: "var(--text-3)" }}>
                দোকানদার থেকে প্রাপ্ত কোডটি লিখুন:
              </span>
              <span className="return-hint-pill">
                🔑 দোকানদারের রিটার্ন কোড: <strong>{task.returnCode || "5842"}</strong>
              </span>
            </div>

            {/* Return Code Input */}
            <input
              id="return-code-input"
              type="text"
              maxLength={4}
              className="return-code-input"
              placeholder="••••"
              value={inputReturnCode}
              onChange={(e) => {
                setInputReturnCode(e.target.value.replace(/[^0-9]/g, ""));
                setCodeError("");
              }}
            />

            {codeError && (
              <div style={{ fontSize: ".76rem", color: "#EF4444", padding: "8px 12px", background: "rgba(239,68,68,.1)", borderRadius: "var(--r-sm)", textAlign: "center" }}>
                {codeError}
              </div>
            )}

            <div style={{ padding: "10px 12px", background: "var(--bg-base)", borderRadius: "var(--r-md)", border: "1px solid var(--border-1)", fontSize: ".75rem", color: "var(--text-3)" }}>
              🛡️ <strong>ক্যাশ নিরাপত্তা:</strong> এই অর্ডারের কোনো টাকা আপনার অ্যাকাউন্ট থেকে কাটা হবে না (৳ ০ কর্তন)। কোড যাচাই সম্পন্ন হলে সাথে সাথে ব্যালেন্সে <strong>৳ ২০</strong> রিটার্ন ভাতা জমা হবে।
            </div>

            <button
              id="verify-return-code-btn"
              type="button"
              className="task-deliver-btn"
              disabled={verifyingCode || inputReturnCode.length < 4}
              onClick={handleVerifyReturnCode}
              style={{
                background: "linear-gradient(135deg, #10B981, #059669)",
                boxShadow: "0 8px 30px rgba(16,185,129,.4)",
                padding: "16px",
                opacity: inputReturnCode.length < 4 ? 0.6 : 1,
              }}
            >
              {verifyingCode ? "কোড যাচাই করা হচ্ছে..." : "✅ রিটার্ন কোড যাচাই ও সম্পন্ন করুন"}
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
            <span>{isReturning || isRequested ? "রিটার্ন ট্রিপ ভাতা:" : "রাইডারের ডেলিভারি আয় (৫০% ফি):"}</span>
            <span style={{ fontWeight: 700, color: "#10B981" }}>
              ৳ {isReturning || isRequested ? 20 : earnings.toLocaleString()}
            </span>
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

        {/* Action Controls when not returning or requesting */}
        {!isReturning && !isRequested && (
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
                onClick={() => {
                  setInputDeliveryOtp("");
                  setDeliveryOtpError("");
                  setShowBypass(false);
                  setBypassNote("");
                  setShowConfirmModal(true);
                }}
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

            {/* Cancel & Hub Contact Trigger */}
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
              ⚠️ কাস্টমার নেয়নি / বাতিল অনুরোধ পাঠান
            </button>
          </div>
        )}

        {/* Customer In-App Chat Modal */}
        {task && (
          <ChatModal
            isOpen={isChatOpen}
            onClose={() => setIsChatOpen(false)}
            defaultChannel="CUSTOMER"
            taskId={id as string}
            customerName={task.order.customerName}
          />
        )}

        {/* Vendor In-App Chat Modal (Active strictly BEFORE parcel pickup from store) */}
        {task && !isOnTheWay && (
          <ChatModal
            isOpen={isVendorChatOpen}
            onClose={() => setIsVendorChatOpen(false)}
            defaultChannel="SUPPORT"
            taskId="task-01"
            customerName={task.order.vendorName || "সবুজ খামার গ্রোসারি (ভেন্ডর)"}
          />
        )}
      </div>
    </>
  );
}

// =============================================================================
// CustomerLocationMap — Rider's view of customer delivery pin
// =============================================================================
function CustomerLocationMap({
  lat,
  lng,
  address,
  customerName,
}: {
  lat?: number;
  lng?: number;
  address: string;
  customerName: string;
}) {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current) return;
    const finalLat = lat || 23.8103;
    const finalLng = lng || 90.4125;

    import("leaflet").then((L) => {
      if (leafletRef.current) { leafletRef.current.remove(); leafletRef.current = null; }
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });
      const map = L.map(mapRef.current!, {
        center: [finalLat, finalLng], zoom: 16,
        zoomControl: true, scrollWheelZoom: false, attributionControl: false,
      });
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19 }).addTo(map);
      const customerIcon = L.divIcon({
        className: "",
        html: `<div style="position:relative;width:36px;height:36px;display:flex;align-items:center;justify-content:center;">
          <div style="position:absolute;inset:0;border-radius:50%;background:rgba(255,107,43,0.25);animation:map-pin-pulse 1.8s ease-out infinite;"></div>
          <div style="width:20px;height:20px;border-radius:50%;background:#FF6B2B;border:3px solid white;box-shadow:0 2px 10px rgba(255,107,43,.7);position:relative;z-index:1;"></div>
        </div>`,
        iconSize: [36, 36], iconAnchor: [18, 18],
      });
      L.marker([finalLat, finalLng], { icon: customerIcon })
        .addTo(map)
        .bindPopup(`<strong>${customerName}</strong><br/>${address}`)
        .openPopup();
      leafletRef.current = map;
    });
    return () => { if (leafletRef.current) { leafletRef.current.remove(); leafletRef.current = null; } };
  }, [lat, lng, address, customerName]);

  const finalLat = lat || 23.8103;
  const finalLng = lng || 90.4125;
  const googleUrl = `https://www.google.com/maps/dir/?api=1&destination=${finalLat},${finalLng}&travelmode=driving`;
  const wazeUrl   = `https://waze.com/ul?ll=${finalLat},${finalLng}&navigate=yes`;

  return (
    <div className="customer-map-card">
      <div className="customer-map-header">
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: "1.1rem" }}>📍</span>
          <div>
            <div style={{ fontSize: ".80rem", fontWeight: 800, color: "var(--emerald)" }}>
              কাস্টমারের ডেলিভারি লোকেশন
            </div>
            <div style={{ fontSize: ".68rem", color: "var(--text-3)", fontFamily: "var(--font-bn)" }}>
              {customerName} — ম্যাপে পিন করা গন্তব্য
            </div>
          </div>
        </div>
        <span style={{
          fontSize: ".62rem", fontWeight: 800, color: "#FF6B2B",
          background: "rgba(255,107,43,.12)", border: "1px solid rgba(255,107,43,.3)",
          borderRadius: 999, padding: "3px 8px",
        }}>🔴 LIVE</span>
      </div>

      <div className="customer-map-canvas">
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" crossOrigin="" />
        <div ref={mapRef} style={{ width: "100%", height: "100%" }} />
      </div>

      <div className="customer-map-footer">
        <div className="customer-map-address">
          📋 <strong>লিখিত ঠিকানা:</strong> {address}
        </div>
        <div className="nav-btn-row">
          <a href={googleUrl} target="_blank" rel="noopener noreferrer" className="nav-btn nav-btn-google">
            🧭 Google Maps
          </a>
          <a href={wazeUrl} target="_blank" rel="noopener noreferrer" className="nav-btn nav-btn-waze">
            🗺️ Waze
          </a>
        </div>
      </div>
    </div>
  );
}
