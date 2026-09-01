"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { VendorSidebar } from "./VendorSidebar";
import { VendorHeader } from "./VendorHeader";

export function VendorLayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  const isAuthPage = pathname === "/login" || pathname === "/apply";

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("tatka_vendor_token") : null;
    if (!token) {
      setIsAuthenticated(false);
      if (!isAuthPage) {
        router.replace("/login");
      }
    } else {
      setIsAuthenticated(true);
      if (pathname === "/login") {
        router.replace("/dashboard");
      }
    }
  }, [pathname, isAuthPage, router]);

  // Auth pages render without sidebar/header
  if (isAuthPage) {
    return <>{children}</>;
  }

  // Not authenticated or loading
  if (isAuthenticated === null || isAuthenticated === false) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--bg-main, #f8fafc)",
        color: "#64748b",
      }}>
        <p>Checking vendor authorization...</p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <VendorSidebar />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <VendorHeader />
        <main style={{ flex: 1, padding: "24px", overflowY: "auto" }}>
          {children}
        </main>
      </div>
    </div>
  );
}
