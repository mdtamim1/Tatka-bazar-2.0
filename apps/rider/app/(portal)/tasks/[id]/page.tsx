"use client";
import React, { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiFetch, type ActiveTask } from "@/lib/api";

function confetti() {
  const canvas = document.createElement("canvas");
  canvas.id = "confetti-canvas";
  canvas.style.cssText = "position:fixed;inset:0;pointer-events:none;z-index:9999;width:100%;height:100%;";
  document.body.appendChild(canvas);
  const ctx = canvas.getContext("2d")!;
  canvas.width = window.innerWidth; canvas.height = window.innerHeight;
  const pieces: { x: number; y: number; vx: number; vy: number; r: number; c: string; rot: number; rv: number }[] = [];
  const colors = ["#FF6B2B","#00D68F","#F59E0B","#3B82F6","#8B5CF6","#EF4444"];
  for (let i = 0; i < 120; i++) {
    pieces.push({ x: Math.random()*canvas.width, y: -20, vx: (Math.random()-0.5)*4, vy: Math.random()*4+2, r: Math.random()*6+3, c: colors[Math.floor(Math.random()*colors.length)] ?? "#FF6B2B", rot: 0, rv: (Math.random()-0.5)*0.2 });
  }
  let frame = 0;
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    pieces.forEach(p => {
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot);
      ctx.fillStyle = p.c; ctx.fillRect(-p.r, -p.r/2, p.r*2, p.r);
      ctx.restore();
      p.x += p.vx; p.y += p.vy; p.rot += p.rv; p.vy += 0.08;
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
  const [delivering, setDelivering] = useState(false);
  const [success, setSuccess] = useState(false);
  const [earning, setEarning] = useState(0);

  useEffect(() => {
    apiFetch<ActiveTask[]>("/rider-portal/tasks/active").then(r => {
      if (r.success && r.data) {
        const found = (r.data as ActiveTask[]).find(a => a.assignmentId === id);
        setTask(found || null);
      }
      setLoading(false);
    });
  }, [id]);

  async function deliver() {
    if (!task) return;
    setDelivering(true);
    const res = await apiFetch<{ earning: number }>(`/rider-portal/tasks/${id}/deliver`, { method: "POST" });
    if (res.success && res.data) {
      setEarning((res.data as { earning: number }).earning);
      setSuccess(true);
      confetti();
      setTimeout(() => { router.replace("/tasks"); }, 3500);
    } else {
      alert(res.error || "ডেলিভারি সম্পন্ন করা যায়নি");
      setDelivering(false);
    }
  }

  if (loading) return <div className="page-content"><div className="loading-center"><div className="spinner" /></div></div>;
  if (!task) return (
    <div className="page-content">
      <div className="empty-state">
        <div className="empty-state-icon">❓</div>
        <div className="empty-state-title">টাস্ক পাওয়া যায়নি</div>
        <button className="btn-primary" onClick={() => router.back()}>ফিরে যান</button>
      </div>
    </div>
  );

  return (
    <>
      {success && (
        <div className="success-overlay">
          <div className="success-circle">✅</div>
          <div className="success-text">ডেলিভারি সম্পন্ন!</div>
          <div className="success-sub">৳ {Number(earning).toLocaleString()} আপনার ব্যালেন্সে যোগ হয়েছে</div>
        </div>
      )}
      <div className="page-content">
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
                <a href={`tel:${task.order.customerPhone}`} style={{ color: "var(--orange)" }}>{task.order.customerPhone}</a>
              </div>
            </div>
            <div className="detail-info-item" style={{ gridColumn: "1/-1" }}>
              <div className="detail-info-label">ডেলিভারি ঠিকানা</div>
              <div className="detail-info-value">{task.order.deliveryAddress}</div>
            </div>
            <div className="detail-info-item">
              <div className="detail-info-label">দোকান</div>
              <div className="detail-info-value">{task.order.vendorName}</div>
            </div>
            <div className="detail-info-item">
              <div className="detail-info-label">আয়</div>
              <div className="detail-info-value" style={{ color: "var(--emerald)", fontSize: "1.1rem", fontWeight: 800 }}>৳ {Number(task.order.earnings).toLocaleString()}</div>
            </div>
          </div>
        </div>

        <div className="items-list">
          <div className="items-list-header">পণ্যের তালিকা ({task.order.items.length}টি)</div>
          {task.order.items.map((item, i) => (
            <div key={i} className="item-row">
              <span className="item-name">{item.name}</span>
              <span className="item-qty">×{item.qty}</span>
            </div>
          ))}
        </div>

        <div className="info-box">
          <svg fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <div className="info-box-text">পণ্য হাতে পাওয়ার পরে কাস্টমারকে ডেলিভারি দিন, তারপর নিচের বাটনে চাপুন।</div>
        </div>

        <button
          id="deliver-complete-btn"
          className="task-deliver-btn"
          onClick={deliver}
          disabled={delivering || success}
          style={{ fontSize: "1.1rem", padding: "22px" }}
        >
          {delivering ? <><div className="spinner" style={{ width: 22, height: 22, borderWidth: 3 }} /> সম্পন্ন হচ্ছে...</> : "🎯 ডেলিভারি সম্পন্ন করুন"}
        </button>
      </div>
    </>
  );
}
