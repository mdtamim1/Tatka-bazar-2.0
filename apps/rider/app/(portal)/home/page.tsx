"use client";
import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch, type BalanceData } from "@/lib/api";

function AnimatedNumber({ value, prefix = "" }: { value: number; prefix?: string }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef<number>(0);
  useEffect(() => {
    const start = ref.current;
    const end = value;
    const duration = 1200;
    const startTime = performance.now();
    function animate(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      ref.current = Math.round(start + (end - start) * eased);
      setDisplay(ref.current);
      if (progress < 1) requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);
  }, [value]);
  return <>{prefix}{display.toLocaleString("bn-BD")}</>;
}

export default function HomePage() {
  const router = useRouter();
  const [data, setData] = useState<BalanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    apiFetch<BalanceData>("/rider-portal/balance").then(r => {
      if (r.success && r.data) setData(r.data);
      setLoading(false);
    });
  }, []);

  // 3D card mouse effect
  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    cardRef.current.style.transform = `rotateX(${-y * 10}deg) rotateY(${x * 10}deg) translateY(-4px)`;
  }
  function handleMouseLeave() {
    if (cardRef.current) cardRef.current.style.transform = "";
  }

  const bal = Number(data?.balance ?? 0);
  const todayEarning = Number(data?.todayEarning ?? 0);
  const weekEarning = Number(data?.weekEarning ?? 0);
  const todayDeliveries = data?.todayDeliveries ?? 0;

  return (
    <div className="page-content">
      <div className="balance-card-wrapper">
        <div className="balance-card" ref={cardRef} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
          <div className="balance-card-bg" />
          <div className="balance-label">💰 মোট ব্যালেন্স</div>
          <div className="balance-amount">
            <span className="currency">৳</span>
            {loading ? "—" : <AnimatedNumber value={bal} />}
          </div>
          <div className="balance-row">
            <div>
              <div className="balance-stat-label">আজকের আয়</div>
              <div className="balance-stat-value">৳ {loading ? "—" : todayEarning.toLocaleString("bn-BD")}</div>
            </div>
            <button id="withdraw-main-btn" className="withdraw-btn" onClick={() => router.push("/withdraw")}>
              উইথড্র করুন →
            </button>
          </div>
        </div>
      </div>

      <div className="stat-row">
        <div className="stat-card">
          <div className="stat-card-icon orange">🚴</div>
          <div className="stat-card-label">আজকের ডেলিভারি</div>
          <div className="stat-card-value">{loading ? "—" : todayDeliveries}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon emerald">📅</div>
          <div className="stat-card-label">সাপ্তাহিক আয়</div>
          <div className="stat-card-value">৳ {loading ? "—" : weekEarning.toLocaleString()}</div>
        </div>
      </div>

      <div className="section-header">
        <div className="section-title">⚡ দ্রুত অ্যাকশন</div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <button id="go-tasks-btn" className="btn-primary" onClick={() => router.push("/tasks")}>
          📦 ডেলিভারি টাস্ক দেখুন
        </button>
        <button id="go-history-btn" className="btn-secondary" onClick={() => router.push("/history")}>
          📋 ইনকাম হিস্ট্রি
        </button>
      </div>

      <div style={{ padding: "16px", background: "var(--bg-card)", borderRadius: "var(--r-lg)", border: "1px solid var(--border-1)", marginTop: 4 }}>
        <div style={{ fontSize: ".72rem", color: "var(--text-3)", fontFamily: "var(--font-bn)", marginBottom: 8 }}>আজকের হালনাগাদ</div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div className="live-dot" />
          <span style={{ fontSize: ".78rem", color: "var(--text-2)", fontFamily: "var(--font-bn)" }}>
            সিস্টেম সক্রিয় — নতুন অর্ডারের জন্য অপেক্ষা করুন
          </span>
        </div>
      </div>
    </div>
  );
}
