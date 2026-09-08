"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import {
  LayoutDashboard, Users, Store, Radio, Settings,
  Bell, ChevronLeft, ChevronRight, LogOut, Shield,
  Bike, CreditCard, ArrowDownToLine, FileCheck, Banknote,
  MapPin, UserCog, AlertTriangle,
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
  { section: "OVERVIEW", label: "Dashboard", labelBn: "ড্যাশবোর্ড", href: "/dashboard", icon: LayoutDashboard },
  { section: "RIDERS", label: "All Riders", labelBn: "সকল রাইডার", href: "/riders", icon: Bike },
  { label: "KYC Queue", labelBn: "KYC অনুমোদন", href: "/riders/kyc", icon: FileCheck },
  { label: "Deposits", labelBn: "ডিপোজিট অনুমোদন", href: "/riders/deposits", icon: ArrowDownToLine },
  { label: "Withdrawals", labelBn: "উইথড্রয়াল", href: "/riders/withdrawals", icon: CreditCard },
  { section: "VENDORS", label: "All Vendors", labelBn: "সকল ভেন্ডর", href: "/vendors", icon: Store },
  { label: "Approvals", labelBn: "ভেন্ডর অনুমোদন", href: "/vendors/approvals", icon: AlertTriangle },
  { label: "Settlements", labelBn: "সেটেলমেন্ট", href: "/vendors/settlements", icon: Banknote },
  { section: "OPERATIONS", label: "Live Dispatch", labelBn: "লাইভ ডিসপ্যাচ", href: "/dispatch", icon: Radio },
  { label: "Notifications", labelBn: "নোটিফিকেশন", href: "/notifications", icon: Bell },
  { section: "SYSTEM", label: "Settings", labelBn: "সেটিংস", href: "/settings", icon: Settings },
  { label: "Team", labelBn: "টিম ম্যানেজমেন্ট", href: "/settings/team", icon: UserCog },
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
          <p className="font-bn" style={{ fontSize: 14 }}>লোড হচ্ছে...</p>
        </div>
      </div>
    );
  }

  const ROLE_LABELS: Record<string, string> = {
    SUPER_ADMIN: "সুপার অ্যাডমিন",
    OPS_MANAGER: "অপস ম্যানেজার",
    SUPPORT_AGENT: "সাপোর্ট এজেন্ট",
    VIEWER: "ভিউয়ার",
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
                    <span className="font-bn">{item.labelBn}</span>
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
                <div className="sidebar-user-role font-bn">
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
