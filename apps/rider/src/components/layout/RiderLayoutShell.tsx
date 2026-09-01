"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { RiderHeader } from "./RiderHeader";
import { RiderBottomNav } from "./RiderBottomNav";

export function RiderLayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  const isLoginPage = pathname === "/login";

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("tatka_rider_token") : null;
    if (!token) {
      setIsAuthenticated(false);
      if (!isLoginPage) {
        router.replace("/login");
      }
    } else {
      setIsAuthenticated(true);
      if (isLoginPage) {
        router.replace("/");
      }
    }
  }, [pathname, isLoginPage, router]);

  if (isLoginPage) {
    return <div className="rider-app-container">{children}</div>;
  }

  if (isAuthenticated === null || isAuthenticated === false) {
    return (
      <div className="rider-app-container" style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        color: "#64748b",
      }}>
        <p>Checking rider authorization...</p>
      </div>
    );
  }

  return (
    <div className="rider-app-container">
      <RiderHeader />
      <main style={{ flex: 1, padding: "16px" }}>
        {children}
      </main>
      <RiderBottomNav />
    </div>
  );
}
