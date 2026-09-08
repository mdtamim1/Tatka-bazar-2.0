"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AdminSidebar } from "./AdminSidebar";
import { AdminHeader } from "./AdminHeader";
import { ShieldAlert, Loader2 } from "lucide-react";

export function AdminLayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  const isLoginPage = pathname === "/login";

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("tatka_admin_token") : null;
    if (!token) {
      setIsAuthenticated(false);
      if (!isLoginPage) router.replace("/login");
    } else {
      setIsAuthenticated(true);
      if (isLoginPage) router.replace("/dashboard");
    }
  }, [pathname, isLoginPage, router]);

  if (isLoginPage) return <>{children}</>;

  if (isAuthenticated === null || isAuthenticated === false) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--bg-body)",
        gap: "16px",
      }}>
        <div style={{
          width: "56px", height: "56px",
          borderRadius: "var(--r-lg)",
          background: "var(--bg-surface)",
          border: "1px solid var(--border-1)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Loader2 size={24} color="var(--green)" style={{ animation: "spin 1s linear infinite" }} />
        </div>
        <p style={{ fontSize: "0.85rem", color: "var(--text-3)" }}>
          Verifying admin credentials…
        </p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div className="admin-workspace">
      <AdminSidebar />
      <div className="admin-main-area">
        <AdminHeader />
        <main className="admin-content">
          {children}
        </main>
      </div>
    </div>
  );
}
