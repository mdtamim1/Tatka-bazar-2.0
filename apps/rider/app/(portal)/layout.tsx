"use client";
import React, { useEffect, useState, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { apiFetch, getDutyStatus, setDutyStatus, startGPSBroadcast, stopGPSBroadcast, getRiderActiveSos, resolveSosAlert, type RiderNotification, type Task, type SosAlert } from "@/lib/api";

import { sound } from "@/lib/sound";
import { ChatModal } from "@/components/ChatModal";
import { SosModal } from "@/components/SosModal";
import { PwaPrompt } from "@/components/PwaPrompt";
import { subscribeSyncEvent } from "@/lib/sync";
import { useRiderSessionGuard } from "@/hooks/useRiderSessionGuard";
import { SuspensionModal } from "@/components/SuspensionModal";

function HomeIcon()   { return <svg fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>; }
function TaskIcon()   { return <svg fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>; }
function HistoryIcon(){ return <svg fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>; }
function ProfileIcon(){ return <svg fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>; }
function PhoneIcon()  { return <svg fill="none" viewBox="0 0 24 24" style={{width:16,height:16,stroke:"currentColor"}}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>; }
function BellIcon()   { return <svg fill="none" viewBox="0 0 24 24" style={{width:18,height:18,stroke:"currentColor"}}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>; }

const TOTAL_COUNTDOWN = 45;

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [riderName, setRiderName] = useState("");
  const [riderId, setRiderId] = useState("");
  const [taskCount, setTaskCount] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [duty, setDuty] = useState<"ONLINE" | "OFFLINE">("ONLINE");
  const [gpsActive, setGpsActive] = useState(false);
  const [incomingOrder, setIncomingOrder] = useState<Task | null>(null);
  const [countdown, setCountdown] = useState<number>(TOTAL_COUNTDOWN);
  const countdownTimerRef = useRef<any>(null);
  const seenTaskIdsRef = useRef<Set<string>>(new Set());
  const initialLoadRef = useRef(true);

  // Real-time Sync state
  const [syncNotice, setSyncNotice] = useState<string | null>(null);

  // Safety & Communication States
  const [activeSos, setActiveSos] = useState<SosAlert | null>(null);
  const [isSosModalOpen, setIsSosModalOpen] = useState(false);
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);

  // Real-time Session Guard (Auto-detects Hub suspension and triggers auto-logout)
  const { isSuspended, suspendReason, suspendedAt, handleLogout } = useRiderSessionGuard(riderId, riderName);

  useEffect(() => {
    const token = localStorage.getItem("rider_token");
    if (!token || token.startsWith("rider-token-") || token.startsWith("demo_")) {
      localStorage.removeItem("rider_token");
      localStorage.removeItem("rider_user");
      router.replace("/login");
      return;
    }

    // Verify session against real DB
    apiFetch<{ id: string; name: string }>("/rider-portal/me").then((res) => {
      if (!res.success || !res.data) {
        localStorage.removeItem("rider_token");
        localStorage.removeItem("rider_user");
        router.replace("/login");
      }
    });

    const user = localStorage.getItem("rider_user");
    let rId = "", rName = "";
    if (user) {
      try {
        const parsed = JSON.parse(user);
        rName = parsed.name?.split(" ")[0] || "";
        rId = parsed.id || "";
      } catch {}
    }
    setRiderName(rName);
    setRiderId(rId);
    const currentDuty = getDutyStatus();
    setDuty(currentDuty);

    // Initial check for active SOS
    setActiveSos(getRiderActiveSos(rId));

    // Auto-start GPS if ONLINE on page load
    if (currentDuty === "ONLINE") {
      startGPSBroadcast(rId, rName);
      setGpsActive(true);
    }

    const handleDutyChange = (e: any) => {
      if (e.detail?.status) setDuty(e.detail.status);
    };

    const handleSosChange = () => {
      setActiveSos(getRiderActiveSos(rId));
    };

    const unsubscribeSync = subscribeSyncEvent((payload) => {
      if (payload.type === "DEPOSIT_APPROVED") {
        sound.playSuccessChime();
        setSyncNotice(payload.message || `⚡ অ্যাডমিন কর্তৃক ৳ ${payload.amount || ""} ডিপোজিট অনুমোদিত হয়েছে!`);
        setTimeout(() => setSyncNotice(null), 5000);
      } else if (payload.type === "CANCELLATION_APPROVED") {
        sound.playSuccessChime();
        setSyncNotice("⚡ ক্যানসেল অনুরোধ অনুমোদিত হয়েছে — পণ্য সেলারের কাছে ফেরত দিন।");
        setTimeout(() => setSyncNotice(null), 5000);
      }
    });

    window.addEventListener("rider_duty_change", handleDutyChange);
    window.addEventListener("tatka_sos_alert_change", handleSosChange);
    return () => {
      window.removeEventListener("rider_duty_change", handleDutyChange);
      window.removeEventListener("tatka_sos_alert_change", handleSosChange);
      unsubscribeSync();
      stopGPSBroadcast();
    };
  }, [router]);

  // Poll tasks every 3 seconds for instant real-time incoming orders
  useEffect(() => {
    const poll = () => {
      apiFetch<Task[]>("/rider-portal/tasks").then(r => {
        if (r.success && Array.isArray(r.data)) {
          const taskList = r.data as Task[];
          setTaskCount(taskList.length);

          if (initialLoadRef.current) {
            taskList.forEach((t) => {
              seenTaskIdsRef.current.add(t.id);
              if (t.orderNumber) seenTaskIdsRef.current.add(t.orderNumber);
            });
            initialLoadRef.current = false;
            // If there are pending ready tasks waiting and rider is ONLINE, alert immediately!
            if (taskList.length > 0 && getDutyStatus() === "ONLINE" && !incomingOrder && taskList[0]) {
              showIncomingOrder(taskList[0]);
            }
            return;
          }

          // Check for newly arrived unhandled tasks
          const brandNew = taskList.filter(
            (t) => !seenTaskIdsRef.current.has(t.id) && (!t.orderNumber || !seenTaskIdsRef.current.has(t.orderNumber))
          );

          if (brandNew.length > 0) {
            brandNew.forEach((t) => {
              seenTaskIdsRef.current.add(t.id);
              if (t.orderNumber) seenTaskIdsRef.current.add(t.orderNumber);
            });

            if (getDutyStatus() === "ONLINE" && !incomingOrder && brandNew[0]) {
              showIncomingOrder(brandNew[0]);
            }
          }
        }
      }).catch(() => {});
    };
    poll();
    const id = setInterval(poll, 3000);
    return () => clearInterval(id);
  }, [incomingOrder]);

  // Poll notifications
  useEffect(() => {
    const pollNotifs = () => {
      apiFetch<RiderNotification[]>("/rider-portal/notifications").then(r => {
        if (r.success && Array.isArray(r.data)) {
          setUnreadCount((r.data as RiderNotification[]).filter(n => !n.isRead).length);
        }
      }).catch(() => {});
    };
    pollNotifs();
    const id = setInterval(pollNotifs, 20000);
    return () => clearInterval(id);
  }, []);

  // Listen for simulated/real incoming order dispatch events
  useEffect(() => {
    const handleIncoming = (e: CustomEvent) => {
      if (getDutyStatus() === "OFFLINE") return;
      const task = e.detail?.task as Task;
      if (task) {
        showIncomingOrder(task);
      }
    };
    window.addEventListener("trigger_rider_order_alert" as any, handleIncoming as any);
    return () => window.removeEventListener("trigger_rider_order_alert" as any, handleIncoming as any);
  }, []);

  function toggleDuty() {
    const next = duty === "ONLINE" ? "OFFLINE" : "ONLINE";
    setDuty(next);
    setDutyStatus(next); // this also calls startGPSBroadcast / stopGPSBroadcast
    setGpsActive(next === "ONLINE");
    apiFetch("/rider-portal/duty-status", { method: "POST", body: JSON.stringify({ status: next }) });
    if (next === "OFFLINE") {
      dismissIncomingOrder();
    }
  }

  function showIncomingOrder(task: Task) {
    setIncomingOrder(task);
    setCountdown(TOTAL_COUNTDOWN);
    sound.startIncomingOrderAlert();

    if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    countdownTimerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          dismissIncomingOrder();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }

  function dismissIncomingOrder() {
    sound.stopIncomingOrderAlert();
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }
    setIncomingOrder(null);
  }

  async function acceptIncomingOrder() {
    if (!incomingOrder) return;
    const targetId = incomingOrder.id;
    dismissIncomingOrder();
    sound.playSuccessChime();
    await apiFetch(`/rider-portal/tasks/${targetId}/accept`, { method: "POST" });
    router.push(`/tasks/${targetId}`);
  }


  function handleResolveSos() {
    resolveSosAlert(riderId);
    setActiveSos(null);
  }

  const nav = [
    { href: "/home", label: "হোম", icon: <HomeIcon /> },
    { href: "/tasks", label: "টাস্ক", icon: <TaskIcon />, badge: taskCount },
    { href: "/history", label: "হিস্ট্রি", icon: <HistoryIcon /> },
    { href: "/profile", label: "প্রোফাইল", icon: <ProfileIcon /> },
  ];

  return (
    <div className="app-shell">
      {/* Real-time Sync Flash Toast */}
      {syncNotice && (
        <div
          style={{
            position: "fixed",
            top: "16px",
            left: "50%",
            transform: "translateX(-50%)",
            background: "linear-gradient(135deg, #00d68f 0%, #059669 100%)",
            color: "#051322",
            fontWeight: 800,
            fontSize: ".78rem",
            padding: "8px 20px",
            borderRadius: "999px",
            boxShadow: "0 6px 24px rgba(0,214,143,.5)",
            zIndex: 10001,
            fontFamily: "var(--font-bn)",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            animation: "fadeIn 0.2s ease-out",
          }}
        >
          <span>⚡</span>
          <span>{syncNotice}</span>
        </div>
      )}

      {/* Active SOS Emergency Banner */}
      {activeSos && (
        <div className="sos-active-strip">
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: "1.15rem" }}>🚨</span>
            <span>বিপদ সংকেত সক্রিয় — কন্ট্রোল রুম লাইভ ট্র্যাক করছে</span>
          </div>
          <button
            id="sos-resolve-btn"
            className="sos-resolve-btn"
            onClick={handleResolveSos}
            title="বিপদ সংকেত সম্পন্ন করুন"
          >
            ✅ আমি এখন নিরাপদ
          </button>
        </div>
      )}

      <header className="top-header">
        <div className="header-logo">
          <div className="header-logo-mark">🛵</div>
          <div>
            <div className="header-title">Tatka Rider</div>
            {riderName && <div className="header-subtitle bn">স্বাগতম, {riderName}!</div>}
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>

          {/* Central Support Chat Button */}
          <button
            id="support-chat-btn"
            type="button"
            onClick={() => setIsChatModalOpen(true)}
            className="support-btn"
            style={{
              background: "rgba(0, 214, 143, 0.12)",
              border: "1px solid rgba(0, 214, 143, 0.35)",
              color: "#00d68f",
              cursor: "pointer",
              padding: "5px 10px",
              borderRadius: "999px",
              fontSize: ".72rem",
              fontWeight: 700,
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
            }}
            title="তাতকা সেন্ট্রাল সাপোর্ট চ্যাট"
          >
            💬 সাপোর্ট
          </button>

          <button
            id="notifications-btn"
            aria-label="নোটিফিকেশন"
            onClick={() => router.push("/notifications")}
            style={{
              position: "relative",
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
            <BellIcon />
            {unreadCount > 0 && (
              <span style={{
                position: "absolute",
                top: -4,
                right: -4,
                background: "#ef4444",
                color: "#fff",
                borderRadius: "999px",
                fontSize: ".6rem",
                fontWeight: 800,
                minWidth: 18,
                height: 18,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "0 4px",
                lineHeight: 1,
                border: "2px solid var(--bg-base)",
              }}>
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>
          <a href="tel:+8801700000000" className="support-btn"><PhoneIcon />কল</a>
        </div>
      </header>

      {/* Duty Status Bar (Online/Offline Switch + GPS Indicator + Sound Test) */}
      <div className="duty-switch-bar">
        <div className="duty-toggle-group">
          <div
            id="duty-status-toggle"
            className={`duty-status-pill ${duty === "ONLINE" ? "online" : "offline"}`}
            onClick={toggleDuty}
            title="অন/অফ-ডিউটি পরিবর্তন করুন"
          >
            <div className="duty-pulse-dot" />
            <span>{duty === "ONLINE" ? "🟢 অন-ডিউটি (সক্রিয়)" : "⚪ অফ-ডিউটি (বিশ্রামে)"}</span>
            <span style={{ fontSize: ".68rem", opacity: 0.75, marginLeft: 2 }}>
              {duty === "ONLINE" ? "• টগল" : "• চালু করুন"}
            </span>
          </div>
        </div>
      </div>

      <main style={{ flex: 1 }}>{children}</main>

      {/* Incoming Order Audio Ringtone & Countdown Modal */}
      {incomingOrder && (
        <div className="incoming-backdrop">
          <div className="incoming-card">
            {/* Timer bar */}
            <div className="incoming-timer-bar">
              <div
                className="incoming-timer-fill"
                style={{ width: `${(countdown / TOTAL_COUNTDOWN) * 100}%` }}
              />
            </div>

            <div className="incoming-header">
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div className="incoming-bell-box">🔔</div>
                <div>
                  <div style={{ fontSize: ".72rem", color: "#ff7a00", fontWeight: 800, textTransform: "uppercase", letterSpacing: ".06em" }}>
                    ইনকামিং ডেলিভারি রিকোয়েস্ট
                  </div>
                  <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "#fff", fontFamily: "var(--font-bn)" }}>
                    অর্ডার #{incomingOrder.orderNumber}
                  </div>
                </div>
              </div>
              <div style={{
                background: "rgba(255,122,0,0.2)",
                border: "1px solid #ff7a00",
                borderRadius: "8px",
                padding: "4px 10px",
                color: "#ffb300",
                fontWeight: 900,
                fontSize: ".9rem",
              }}>
                ⏱️ {countdown}s
              </div>
            </div>

            <div style={{ padding: "20px" }}>
              {/* Earnings highlight */}
              <div style={{
                background: "linear-gradient(135deg, rgba(0,214,143,0.18), rgba(0,214,143,0.06))",
                border: "1.5px solid rgba(0,214,143,0.4)",
                borderRadius: "14px",
                padding: "14px 18px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "16px",
              }}>
                <div>
                  <div style={{ fontSize: ".72rem", color: "var(--text-3)", fontFamily: "var(--font-bn)" }}>রাইডারের নিশ্চিত আয় (৫০% ফি)</div>
                  <div style={{ fontSize: "1.6rem", fontWeight: 900, color: "#00d68f", lineHeight: 1.1 }}>
                    + ৳ {incomingOrder.earnings}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: ".70rem", color: "var(--text-3)", fontFamily: "var(--font-bn)" }}>পেমেন্ট মোড</div>
                  <div style={{
                    fontSize: ".78rem",
                    fontWeight: 800,
                    padding: "3px 8px",
                    borderRadius: "6px",
                    background: incomingOrder.paymentStatus === "PAID" ? "rgba(0,214,143,0.2)" : "rgba(255,179,0,0.2)",
                    color: incomingOrder.paymentStatus === "PAID" ? "#00d68f" : "#ffb300",
                    border: incomingOrder.paymentStatus === "PAID" ? "1px solid rgba(0,214,143,0.4)" : "1px solid rgba(255,179,0,0.4)",
                    marginTop: 3,
                  }}>
                    {incomingOrder.paymentStatus === "PAID" ? "🟢 অনলাইন পেইড" : `💵 সিওডি (৳ ${incomingOrder.total})`}
                  </div>
                </div>
              </div>

              {/* Route snippet */}
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: "20px" }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                  <div style={{ color: "#ff7a00", fontSize: "1.1rem" }}>🏪</div>
                  <div>
                    <div style={{ fontSize: ".68rem", color: "var(--text-3)", fontFamily: "var(--font-bn)" }}>পিকআপ শপ</div>
                    <div style={{ fontSize: ".88rem", fontWeight: 700, color: "var(--text-1)", fontFamily: "var(--font-bn)" }}>
                      {incomingOrder.vendorName}
                    </div>
                  </div>
                </div>
                <div style={{ borderLeft: "2px dashed var(--border-2)", marginLeft: 8, height: 12 }} />
                <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                  <div style={{ color: "#00d68f", fontSize: "1.1rem" }}>📍</div>
                  <div>
                    <div style={{ fontSize: ".68rem", color: "var(--text-3)", fontFamily: "var(--font-bn)" }}>ডেলিভারি ঠিকানা</div>
                    <div style={{ fontSize: ".88rem", fontWeight: 700, color: "var(--text-1)", fontFamily: "var(--font-bn)" }}>
                      {incomingOrder.deliveryAddress}
                    </div>
                  </div>
                </div>
              </div>

              {/* Buttons */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 10 }}>
                <button
                  id="decline-order-btn"
                  onClick={dismissIncomingOrder}
                  style={{
                    padding: "14px",
                    background: "rgba(239,68,68,0.15)",
                    border: "1px solid rgba(239,68,68,0.35)",
                    color: "#fca5a5",
                    borderRadius: "12px",
                    fontSize: ".9rem",
                    fontWeight: 800,
                    fontFamily: "var(--font-bn)",
                    cursor: "pointer",
                  }}
                >
                  প্রত্যাখ্যান
                </button>
                <button
                  id="accept-order-btn"
                  onClick={acceptIncomingOrder}
                  style={{
                    padding: "14px",
                    background: "linear-gradient(135deg, #00d68f, #00b377)",
                    border: "none",
                    color: "#051322",
                    borderRadius: "12px",
                    fontSize: "1rem",
                    fontWeight: 900,
                    fontFamily: "var(--font-bn)",
                    boxShadow: "0 4px 20px rgba(0,214,143,0.4)",
                    cursor: "pointer",
                  }}
                >
                  ⚡ গ্রহণ করুন
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <nav className="bottom-nav" role="navigation" aria-label="মূল নেভিগেশন">
        {nav.map(item => (
          <button
            key={item.href}
            id={`nav-${item.href.slice(1)}`}
            className={`nav-item${pathname === item.href || pathname.startsWith(item.href + "/") ? " active" : ""}`}
            onClick={() => router.push(item.href)}
            aria-label={item.label}
          >
            {item.badge && item.badge > 0 ? <div className="nav-badge">{item.badge > 9 ? "9+" : item.badge}</div> : null}
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Emergency SOS Modal */}
      <SosModal
        isOpen={isSosModalOpen}
        onClose={() => setIsSosModalOpen(false)}
        riderId={riderId}
        riderName={riderName || "রাইডার"}
        riderPhone="01812345678"
        onSosTriggered={() => {
          setActiveSos(getRiderActiveSos(riderId));
        }}
      />

      {/* Central Support Chat Modal */}
      <ChatModal
        isOpen={isChatModalOpen}
        onClose={() => setIsChatModalOpen(false)}
        defaultChannel="SUPPORT"
        riderName={riderName || "রাইডার"}
      />

      {/* Unclosable Real-time Suspension Modal */}
      <SuspensionModal
        isOpen={isSuspended}
        riderName={riderName}
        reason={suspendReason}
        suspendedAt={suspendedAt}
        onLogout={handleLogout}
      />
    </div>
  );
}
