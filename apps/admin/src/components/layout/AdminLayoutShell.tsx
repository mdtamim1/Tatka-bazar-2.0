"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AdminSidebar } from "./AdminSidebar";
import { AdminHeader } from "./AdminHeader";
import { ShieldAlert } from "lucide-react";

export function AdminLayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  const isLoginPage = pathname === "/login";

  useEffect(() => {
    // Check localStorage for admin auth token
    const token = typeof window !== "undefined" ? localStorage.getItem("tatka_admin_token") : null;
    
    if (!token) {
      setIsAuthenticated(false);
      if (!isLoginPage) {
        router.replace("/login");
      }
    } else {
      setIsAuthenticated(true);
      if (isLoginPage) {
        router.replace("/dashboard");
      }
    }
  }, [pathname, isLoginPage, router]);

  // 1. If currently on /login, render clean view without sidebar/header
  if (isLoginPage) {
    return <>{children}</>;
  }

  // 2. Initial state or checking authentication
  if (isAuthenticated === null || isAuthenticated === false) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--bg-deep)",
        color: "var(--text-2)",
        fontFamily: "var(--font)",
        gap: "12px",
      }}>
        <div style={{
          width: "48px",
          height: "48px",
          borderRadius: "50%",
          background: "var(--bg-raised)",
          border: "1px solid var(--border-1)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--green)",
        }}>
          <ShieldAlert size={24} />
        </div>
        <p style={{ fontSize: "0.9rem", color: "var(--text-3)" }}>
          Checking admin authorization...
        </p>
      </div>
    );
  }

  // 3. Authenticated: Render full admin workspace
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <AdminSidebar />
      <div style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        minWidth: 0,
        background: "var(--bg-deep)",
      }}>
        <AdminHeader />
        <main style={{
          flex: 1,
          padding: "24px 28px",
          overflowY: "auto",
          background: "var(--bg-deep)",
        }}>
          {children}
        </main>
      </div>
    </div>
  );
}
