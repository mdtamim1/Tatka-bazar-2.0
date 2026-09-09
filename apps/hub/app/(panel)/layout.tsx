"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import {
  LayoutDashboard, Users, Store, Radio, Settings,
  Bell, ChevronLeft, ChevronRight, LogOut, Shield,
  Bike, CreditCard, ArrowDownToLine, FileCheck, Banknote,
  MapPin, UserCog, AlertTriangle, Monitor,
} from "lucide-react";

interface NavItem {
  label: string;
  labelBn: string;
  href: string;
  icon: React.ElementType;
  badge?: number;
  badgeColor?: string;
  section?: string;
}

const NAV: NavItem[] = [
  { section: "OVERVIEW", label: "Dashboard", labelBn: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { section: "RIDERS", label: "All Riders", labelBn: "All Riders", href: "/riders", icon: Bike },
  { label: "KYC Queue", labelBn: "KYC Queue", href: "/riders/kyc", icon: FileCheck },
  { label: "Deposits", labelBn: "Deposits", href: "/riders/deposits", icon: ArrowDownToLine },
  { label: "Withdrawals", labelBn: "Withdrawals", href: "/riders/withdrawals", icon: CreditCard },
  { section: "VENDORS", label: "All Vendors", labelBn: "All Vendors", href: "/vendors", icon: Store },
  { label: "Approvals", labelBn: "Approvals", href: "/vendors/approvals", icon: AlertTriangle },
  { label: "Settlements", labelBn: "Settlements", href: "/vendors/settlements", icon: Banknote },
  { section: "OPERATIONS", label: "Live Dispatch", labelBn: "Live Dispatch", href: "/dispatch", icon: Radio },
  { label: "Notifications", labelBn: "Notifications", href: "/notifications", icon: Bell },
  { section: "SYSTEM", label: "Settings", labelBn: "Settings", href: "/settings", icon: Settings },
  { label: "Team", labelBn: "Team Management", href: "/settings/team", icon: UserCog },
];

export default function PanelLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <PanelShell>{children}</PanelShell>
    </AuthProvider>
  );
}

function PanelShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { session, isLoading, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [isMobileScreen, setIsMobileScreen] = useState(false);
  const [dismissMobileWarning, setDismissMobileWarning] = useState(false);

  useEffect(() => {
    const checkScreen = () => {
      setIsMobileScreen(window.innerWidth < 1024);
    };
    checkScreen();
    window.addEventListener("resize", checkScreen);
    return () => window.removeEventListener("resize", checkScreen);
  }, []);

  useEffect(() => {
    if (!isLoading && !session) {
      router.replace("/login");
    }
  }, [session, isLoading, router]);

  if (isLoading || !session) {
    return (
      <div className="flex-center" style={{ minHeight: "100vh", color: "var(--text-muted)" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>🛡️</div>
          <p style={{ fontSize: 14 }}>Loading...</p>
        </div>
      </div>
    );
  }

  if (isMobileScreen && !dismissMobileWarning) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        background: "#0f172a",
        color: "#ffffff",
        textAlign: "center",
      }}>
        <div style={{
          width: "72px",
          height: "72px",
          borderRadius: "50%",
          background: "rgba(0, 214, 143, 0.15)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "20px",
          border: "2px solid #00d68f",
        }}>
          <Monitor size={36} color="#00d68f" />
        </div>
        <h1 style={{ fontSize: "20px", fontWeight: 800, marginBottom: "8px" }}>
          ডেস্কটপ ভিউ প্রয়োজন (Desktop Only)
        </h1>
        <p style={{ fontSize: "14px", color: "#94a3b8", maxWidth: "380px", lineHeight: "1.6", marginBottom: "24px" }}>
          টাটকা বাজার হাব কন্ট্রোল পোর্টালটি ডিসপ্যাচ ও অপারেশনাল টিমদের বড় স্ক্রিনে (কম্পিউটার বা ল্যাপটপ) ব্যবহারের জন্য তৈরি করা হয়েছে।
        </p>
        <button
          onClick={() => setDismissMobileWarning(true)}
          style={{
            background: "rgba(255, 255, 255, 0.1)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            color: "#e2e8f0",
            padding: "8px 16px",
            borderRadius: "8px",
            fontSize: "12px",
            cursor: "pointer",
          }}
        >
          তবুও দেখতে চাই (Proceed anyway)
        </button>
      </div>
    );
  }

  const ROLE_LABELS: Record<string, string> = {
    SUPER_ADMIN: "Super Admin",
    OPS_MANAGER: "Ops Manager",
    SUPPORT_AGENT: "Support Agent",
    VIEWER: "Viewer",
  };

  let lastSection = "";

  async function handleLogout() {
    await logout();
    router.replace("/login");
  }

  return (
    <div className="hub-shell">
      {/* ─── Sidebar ───────────────────────────────────────────── */}
      <aside className={`sidebar${collapsed ? " collapsed" : ""}`}>
        {/* Logo */}
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">🛡️</div>
          {!collapsed && (
            <div>
              <div className="sidebar-logo-text">Tatka Bazar</div>
              <div className="sidebar-logo-sub">Control Hub</div>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="sidebar-nav">
          {NAV.map((item) => {
            const isActive =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href);
            const Icon = item.icon;
            const showSection = item.section && item.section !== lastSection;
            if (item.section) lastSection = item.section;

            return (
              <React.Fragment key={item.href}>
                {showSection && !collapsed && (
                  <div className="sidebar-section-title">{item.section}</div>
                )}
                {showSection && collapsed && (
                  <div style={{ height: 12 }} />
                )}
                <Link
                  href={item.href}
                  className={`sidebar-link${isActive ? " active" : ""}`}
                  title={collapsed ? item.label : undefined}
                >
                  <Icon size={16} strokeWidth={2} />
                  {!collapsed && (
                    <span>{item.label}</span>
                  )}
                  {!collapsed && item.badge !== undefined && item.badge > 0 && (
                    <span className={`sidebar-badge${item.badgeColor ? ` ${item.badgeColor}` : ""}`}>
                      {item.badge}
                    </span>
                  )}
                </Link>
              </React.Fragment>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-user-avatar">
              {session.role === "SUPER_ADMIN" ? "🛡️" :
               session.role === "OPS_MANAGER" ? "⚙️" :
               session.role === "SUPPORT_AGENT" ? "💬" : "👁️"}
            </div>
            {!collapsed && (
              <div className="sidebar-user-info">
                <div className="sidebar-user-name">{session.name}</div>
                <div className="sidebar-user-role">
                  {ROLE_LABELS[session.role] || session.role}
                </div>
              </div>
            )}
            {!collapsed && (
              <button
                onClick={handleLogout}
                className="btn-icon"
                title="Logout"
                style={{ flexShrink: 0 }}
              >
                <LogOut size={14} />
              </button>
            )}
          </div>

          {!collapsed && (
            <button
              onClick={() => setCollapsed(true)}
              className="btn btn-ghost btn-sm w-full"
              style={{ marginTop: 8, justifyContent: "center", fontSize: 12 }}
            >
              <ChevronLeft size={14} />
              Collapse
            </button>
          )}

          {collapsed && (
            <button
              onClick={() => setCollapsed(false)}
              className="btn-icon"
              style={{ width: "100%", borderRadius: "var(--radius-sm)", marginTop: 8 }}
              title="Expand"
            >
              <ChevronRight size={14} />
            </button>
          )}
        </div>
      </aside>

      {/* ─── Main Content ─────────────────────────────────────── */}
      <main className={`hub-main${collapsed ? " collapsed" : ""}`}>
        {children}
      </main>
    </div>
  );
}
