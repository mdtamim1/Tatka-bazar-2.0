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
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [delivering, setDelivering] = useState(false);
  const [success, setSuccess] = useState(false);
  const [earning, setEarning] = useState(0);
  const [deducted, setDeducted] = useState(0);

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
  const deliveryFee = Number(task?.order.deliveryFee ?? (task?.order.earnings ? task.order.earnings * 2 : 60));
  const earnings = Number(task?.order.earnings ?? Math.round(deliveryFee * 0.5));
  const subtotal = Number(
    task?.order.subtotal ??
      task?.order.items?.reduce((s, it) => s + (it.total || (it.qty * (it.price || 0))), 0) ??
      (task?.order.total ? task.order.total - deliveryFee : 1390)
  );
  const totalBill = Number(task?.order.total ?? (subtotal + deliveryFee));

  async function deliver() {
    if (!task) return;
    setDelivering(true);
    const res = await apiFetch<{ earning: number; orderTotal?: number; totalBill?: number }>(
      `/rider-portal/tasks/${id}/deliver`,
      { method: "POST" }
    );
    if (res.success && res.data) {
      const resData = res.data as { earning: number; orderTotal?: number; totalBill?: number };
      setEarning(resData.earning || earnings);
      setDeducted(resData.totalBill || resData.orderTotal || totalBill);
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

  return (
    <>
      {/* ─── Success Overlay ─── */}
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
            <div style={{ color: "rgba(239,68,68,.9)", fontSize: ".88rem", fontWeight: 700 }}>
              - ৳ {Number(deducted).toLocaleString()} সংগৃহীত বিল সমন্বয় হয়েছে
            </div>
          </div>
          <div className="success-sub" style={{ marginTop: "14px" }}>
            স্বয়ংক্রিয়ভাবে টাস্ক তালিকায় ফিরে যাচ্ছেন...
          </div>
        </div>
      )}

      {/* ─── Delivery Confirmation Warning Modal ─── */}
      {showConfirmModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 999,
            background: "rgba(3, 7, 18, 0.85)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px",
            animation: "fade-in 0.2s ease-out",
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget && !delivering) setShowConfirmModal(false);
          }}
        >
          <div
            style={{
              background: "var(--bg-card)",
              border: "1.5px solid rgba(255, 107, 43, 0.35)",
              borderRadius: "24px",
              padding: "26px 22px",
              width: "100%",
              maxWidth: "400px",
              boxShadow: "0 28px 80px rgba(0,0,0,0.7), 0 0 35px rgba(255,107,43,0.15)",
              fontFamily: "var(--font-bn), inherit",
            }}
          >
            {/* Warning Icon Badge */}
            <div
              style={{
                width: 60,
                height: 60,
                borderRadius: "50%",
                background: "rgba(255, 107, 43, 0.15)",
                border: "2px solid rgba(255, 107, 43, 0.4)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "28px",
                margin: "0 auto 14px",
                boxShadow: "0 0 20px rgba(255,107,43,0.3)",
              }}
            >
              ⚠️
            </div>

            <div
              style={{
                fontSize: "1.2rem",
                fontWeight: 800,
                color: "var(--text-1)",
                textAlign: "center",
                marginBottom: "8px",
                lineHeight: 1.4,
              }}
            >
              সম্পূর্ণ টাকা বুঝে নিয়ে একসেপ্ট করুন
            </div>

            <div
              style={{
                fontSize: ".84rem",
                color: "var(--text-3)",
                textAlign: "center",
                lineHeight: 1.6,
                marginBottom: "18px",
              }}
            >
              কাস্টমারের কাছ থেকে নগদ মোট টাকা বুঝে পেয়েছেন কি না নিশ্চিত করুন। কনফার্ম করার সাথে সাথে হিসাব সমন্বয় করা হবে।
            </div>

            {/* Financial Breakdown in Modal */}
            <div
              style={{
                background: "var(--bg-base)",
                border: "1px solid var(--border-1)",
                borderRadius: "16px",
                padding: "14px 16px",
                marginBottom: "20px",
                display: "flex",
                flexDirection: "column",
                gap: "10px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: ".86rem" }}>
                <span style={{ color: "var(--text-2)" }}>💵 কাস্টমার থেকে মোট আদায়:</span>
                <span style={{ fontWeight: 800, color: "var(--text-1)", fontSize: ".95rem" }}>
                  ৳ {totalBill.toLocaleString()}
                </span>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  fontSize: ".84rem",
                  padding: "6px 0",
                  borderTop: "1px dashed var(--border-1)",
                  borderBottom: "1px dashed var(--border-1)",
                }}
              >
                <span style={{ color: "#FCA5A5", display: "flex", alignItems: "center", gap: "4px" }}>
                  🔻 অ্যাকাউন্ট থেকে মাইনাস হবে:
                </span>
                <span style={{ fontWeight: 800, color: "#EF4444" }}>- ৳ {totalBill.toLocaleString()}</span>
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
                  flex: 1,
                  padding: "13px",
                  borderRadius: "14px",
                  background: "var(--bg-base)",
                  border: "1px solid var(--border-2)",
                  color: "var(--text-2)",
                  cursor: "pointer",
                  fontSize: ".9rem",
                  fontWeight: 600,
                  fontFamily: "var(--font-bn)",
                  transition: "all .2s ease",
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
                  flex: 2,
                  padding: "13px 16px",
                  borderRadius: "14px",
                  background: "linear-gradient(135deg, #FF6B2B, #E05520)",
                  border: "none",
                  color: "#FFFFFF",
                  cursor: delivering ? "not-allowed" : "pointer",
                  fontSize: ".92rem",
                  fontWeight: 800,
                  fontFamily: "var(--font-bn)",
                  boxShadow: "0 6px 20px rgba(255, 107, 43, 0.4)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                  transition: "all .2s ease",
                  opacity: delivering ? 0.7 : 1,
                }}
              >
                {delivering ? (
                  <>
                    <div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />
                    <span>প্রসেসিং...</span>
                  </>
                ) : (
                  <>
                    <span>✅ হ্যাঁ, সম্পূর্ণ বুঝে পেয়েছি</span>
                  </>
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
              background: "var(--bg-card)",
              border: "1px solid var(--border-1)",
              borderRadius: "50%",
              width: 38,
              height: 38,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "var(--text-2)",
              flexShrink: 0,
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

        {/* Hero Card */}
        <div className="detail-hero">
          <div className="detail-order-num">অর্ডার #{task.order.orderNumber}</div>
          <span className="detail-status-chip">
            <span className="live-dot" style={{ background: "var(--emerald)" }} />
            চলমান ডেলিভারি
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
                    color: "var(--orange)",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                    textDecoration: "none",
                    fontWeight: 700,
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
              <div className="detail-info-label">আপনার ডেলিভারি আয়</div>
              <div
                className="detail-info-value"
                style={{ color: "var(--emerald)", fontSize: "1.15rem", fontWeight: 900 }}
              >
                ৳ {Number(earnings).toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        {/* Items List (পণ্যের তালিকা ও প্রতিটির মূল্য) */}
        <div className="items-list">
          <div
            className="items-list-header"
            style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
          >
            <span>পণ্যের তালিকা ({task.order.items.length}টি)</span>
            <span style={{ fontSize: ".72rem", color: "var(--text-3)", textTransform: "none" }}>মূল্য</span>
          </div>
          {task.order.items.map((item, i) => {
            const itemPrice = Number(item.price || 0);
            const itemTotal = Number(item.total || (itemPrice > 0 ? item.qty * itemPrice : 0));
            return (
              <div
                key={i}
                className="item-row"
                style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px" }}
              >
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

        {/* Price Breakdown Card (মূল্য বিবরণী, ডেলিভারি চার্জ ও সর্বমোট অ্যামাউন্ট) */}
        <div
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border-1)",
            borderRadius: "var(--r-lg)",
            padding: "16px 18px",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            fontFamily: "var(--font-bn)",
          }}
        >
          <div
            style={{
              fontSize: ".76rem",
              fontWeight: 700,
              color: "var(--text-3)",
              textTransform: "uppercase",
              letterSpacing: ".08em",
              borderBottom: "1px solid var(--border-1)",
              paddingBottom: "8px",
            }}
          >
            বিল বিবরণী (Bill Breakdown)
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", fontSize: ".88rem", color: "var(--text-2)" }}>
            <span>পণ্যের মোট মূল্য (Subtotal):</span>
            <span style={{ fontWeight: 600, color: "var(--text-1)" }}>৳ {subtotal.toLocaleString()}</span>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", fontSize: ".88rem", color: "var(--text-2)" }}>
            <span>ডেলিভারি চার্জ (Delivery Fee):</span>
            <span style={{ fontWeight: 600, color: "var(--orange)" }}>+ ৳ {deliveryFee.toLocaleString()}</span>
          </div>

          {/* Divider */}
          <div style={{ height: "1px", background: "var(--border-1)", margin: "2px 0" }} />

          {/* Total Payable Amount */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: ".98rem", fontWeight: 800, color: "var(--text-1)" }}>
                সর্বমোট প্রদেয় বিল:
              </div>
              <div style={{ fontSize: ".72rem", color: "var(--text-3)" }}>কাস্টমার থেকে নগদ আদায় করবেন</div>
            </div>
            <div style={{ fontSize: "1.35rem", fontWeight: 900, color: "var(--text-1)", fontFamily: "monospace" }}>
              ৳ {totalBill.toLocaleString()}
            </div>
          </div>

          {/* 50% Delivery Charge Rider Share Highlight */}
          <div
            style={{
              background: "rgba(0, 214, 143, 0.08)",
              border: "1px solid rgba(0, 214, 143, 0.25)",
              borderRadius: "12px",
              padding: "10px 14px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginTop: "4px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: "1.2rem" }}>🎁</span>
              <div>
                <div style={{ fontSize: ".82rem", fontWeight: 700, color: "#00D68F" }}>
                  আপনার ডেলিভারি আয়:
                </div>
                <div style={{ fontSize: ".70rem", color: "var(--text-3)" }}>ডেলিভারি চার্জের ৫০% পাবেন</div>
              </div>
            </div>
            <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "#00D68F" }}>
              ৳ {earnings.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Info / Guideline Box */}
        <div className="info-box" style={{ background: "rgba(255, 107, 43, 0.08)", borderColor: "rgba(255, 107, 43, 0.25)" }}>
          <svg fill="none" viewBox="0 0 24 24" style={{ stroke: "var(--orange)" }}>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div className="info-box-text" style={{ color: "var(--text-2)" }}>
            কাস্টমারের ঠিকানায় পৌঁছে সম্পূর্ণ <strong>৳ {totalBill.toLocaleString()}</strong> টাকা হাতে বুঝে নিয়ে নিচের বোতামে চাপুন।
          </div>
        </div>

        {/* Main Delivery Complete Trigger Button */}
        <button
          id="deliver-complete-btn"
          type="button"
          className="task-deliver-btn"
          onClick={() => setShowConfirmModal(true)}
          disabled={delivering || success}
          style={{
            fontSize: "1.08rem",
            padding: "20px",
            background: "linear-gradient(135deg, #FF6B2B, #E05520)",
            boxShadow: "0 8px 30px rgba(255,107,43,.4)",
            cursor: "pointer",
          }}
        >
          🎯 ডেলিভারি সম্পন্ন করুন
        </button>

      </div>
    </>
  );
}
