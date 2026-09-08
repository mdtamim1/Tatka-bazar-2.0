"use client";
import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { HubSession, HubRole } from "@/types/hub";

interface AuthContextValue {
  session: HubSession | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  hasPermission: (minRole: HubRole) => boolean;
}

const ROLE_LEVEL: Record<HubRole, number> = {
  SUPER_ADMIN: 4,
  OPS_MANAGER: 3,
  SUPPORT_AGENT: 2,
  VIEWER: 1,
};

const AuthContext = createContext<AuthContextValue>({
  session: null,
  isLoading: true,
  login: async () => ({ success: false, error: "No provider" }),
  logout: async () => {},
  hasPermission: () => false,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<HubSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("hub_session");
    if (stored) {
      try {
        const s = JSON.parse(stored) as HubSession;
        if (new Date(s.expiresAt) > new Date()) {
          setSession(s);
        } else {
          localStorage.removeItem("hub_session");
        }
      } catch {}
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const json = await res.json();
    if (json.success) {
      setSession(json.data);
      localStorage.setItem("hub_session", JSON.stringify(json.data));
      return { success: true };
    }
    return { success: false, error: json.error };
  }, []);

  const logout = useCallback(async () => {
    if (session?.token) {
      await fetch("/api/auth", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${session.token}` },
      });
    }
    setSession(null);
    localStorage.removeItem("hub_session");
  }, [session]);

  const hasPermission = useCallback(
    (minRole: HubRole) => {
      if (!session) return false;
      return (ROLE_LEVEL[session.role] || 0) >= (ROLE_LEVEL[minRole] || 0);
    },
    [session]
  );

  return (
    <AuthContext.Provider value={{ session, isLoading, login, logout, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
