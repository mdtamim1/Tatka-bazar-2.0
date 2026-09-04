"use client";
import React from "react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

function HomeIcon()   { return <svg fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>; }
function TaskIcon()   { return <svg fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>; }
function HistoryIcon(){ return <svg fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>; }
function ProfileIcon(){ return <svg fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>; }
function PhoneIcon()  { return <svg fill="none" viewBox="0 0 24 24" style={{width:16,height:16,stroke:"currentColor"}}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>; }

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [riderName, setRiderName] = useState("");
  const [taskCount, setTaskCount] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem("rider_token");
    if (!token) { router.replace("/login"); return; }
    const user = localStorage.getItem("rider_user");
    if (user) {
      try { setRiderName(JSON.parse(user).name?.split(" ")[0] || ""); } catch {}
    }
  }, [router]);

  useEffect(() => {
    const poll = () => {
      apiFetch<{ data: unknown[] }>("/rider-portal/tasks").then(r => {
        if (r.success && Array.isArray(r.data)) setTaskCount((r.data as unknown[]).length);
      }).catch(() => {});
    };
    poll();
    const id = setInterval(poll, 15000);
    return () => clearInterval(id);
  }, []);

  const nav = [
    { href: "/home", label: "হোম", icon: <HomeIcon /> },
    { href: "/tasks", label: "টাস্ক", icon: <TaskIcon />, badge: taskCount },
    { href: "/history", label: "হিস্ট্রি", icon: <HistoryIcon /> },
    { href: "/profile", label: "প্রোফাইল", icon: <ProfileIcon /> },
  ];

  function logout() {
    localStorage.removeItem("rider_token");
    localStorage.removeItem("rider_user");
    router.replace("/login");
  }

  return (
    <div className="app-shell">
      <header className="top-header">
        <div className="header-logo">
          <div className="header-logo-mark">🛵</div>
          <div>
            <div className="header-title">Tatka Rider</div>
            {riderName && <div className="header-subtitle bn">স্বাগতম, {riderName}!</div>}
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <a href="tel:+8801700000000" className="support-btn"><PhoneIcon />সাপোর্ট</a>
        </div>
      </header>

      <main style={{ flex: 1 }}>{children}</main>

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
    </div>
  );
}
