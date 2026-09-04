"use client";
import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { apiFetch, type Task, type ActiveTask } from "@/lib/api";

export default function TasksPage() {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [active, setActive] = useState<ActiveTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    const [t, a] = await Promise.all([
      apiFetch<Task[]>("/rider-portal/tasks"),
      apiFetch<ActiveTask[]>("/rider-portal/tasks/active"),
    ]);
    if (t.success && t.data) setTasks(t.data as Task[]);
    if (a.success && a.data) setActive(a.data as ActiveTask[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
    const id = setInterval(fetchData, 15000);
    return () => clearInterval(id);
  }, [fetchData]);

  async function acceptTask(orderId: string) {
    setAccepting(orderId);
    const res = await apiFetch(`/rider-portal/tasks/${orderId}/accept`, { method: "POST" });
    if (res.success) {
      await fetchData();
    } else {
      alert(res.error || "একসেপ্ট করা যায়নি");
    }
    setAccepting(null);
  }

  if (loading) return <div className="page-content"><div className="loading-center"><div className="spinner" /></div></div>;

  return (
    <div className="page-content">
      {active.length > 0 && (
        <>
          <div className="section-header">
            <div className="section-title">
              ✅ চলমান ডেলিভারি
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
                    <div className="task-vendor-items bn">#{a.order.orderNumber}</div>
                  </div>
                </div>
                <div className="task-earning">
                  <div className="task-earning-label">আয়</div>
                  <div className="task-earning-amount">৳ {Number(a.order.earnings).toLocaleString()}</div>
                </div>
              </div>
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
                <div className="task-earning-label">আয়</div>
                <div className="task-earning-amount">৳ {Number(task.earnings).toLocaleString()}</div>
              </div>
            </div>
            <div className="task-address">
              <svg fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              <span className="task-address-text">{task.deliveryAddress}</span>
            </div>
            <button
              id={`accept-task-${task.id}`}
              className="task-accept-btn"
              disabled={accepting === task.id}
              onClick={() => acceptTask(task.id)}
            >
              {accepting === task.id ? <><div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> একসেপ্ট করা হচ্ছে...</> : "✅ একসেপ্ট করুন"}
            </button>
          </div>
        ))
      )}
    </div>
  );
}
