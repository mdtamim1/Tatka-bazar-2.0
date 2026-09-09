"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { subscribeSyncEvent } from "@/lib/sync";
import { sound } from "@/lib/sound";

interface SuspensionState {
  isSuspended: boolean;
  reason?: string;
  suspendedAt?: string;
}

const HUB_STATUS_ENDPOINTS = [
  "/api/sync/events", // local endpoint on rider server
  "http://localhost:3004/api/public/status?type=rider", // Hub dev server
  "https://hub.tatkabazar.com/api/public/status?type=rider", // Production hub
];

export function useRiderSessionGuard(riderId: string, riderName?: string) {
  const router = useRouter();
  const [suspension, setSuspension] = useState<SuspensionState>({ isSuspended: false });
  const hasTriggeredRef = useRef(false);

  const triggerSuspension = useCallback(
    (reason?: string, suspendedAt?: string) => {
      if (hasTriggeredRef.current) return;
      hasTriggeredRef.current = true;

      try {
        sound.playUrgentAlert();
      } catch {}

      setSuspension({
        isSuspended: true,
        reason: reason || "Hub অ্যাডমিন কর্তৃক আপনার রাইডার অ্যাকাউন্ট সাময়িকভাবে স্থগিত করা হয়েছে।",
        suspendedAt: suspendedAt || new Date().toISOString(),
      });
    },
    []
  );

  const handleLogout = useCallback(() => {
    try {
      localStorage.removeItem("rider_token");
      localStorage.removeItem("rider_user");
      localStorage.removeItem("rider_duty_status");
    } catch {}

    const reasonParam = encodeURIComponent(
      suspension.reason || "অ্যাকাউন্ট স্থগিত করা হয়েছে"
    );
    router.replace(`/login?reason=suspended&message=${reasonParam}`);
  }, [router, suspension.reason]);

  // 1. Subscribe to real-time sync broadcast events (instant)
  useEffect(() => {
    const unsubscribe = subscribeSyncEvent((payload) => {
      if (payload.type === "RIDER_SUSPENDED") {
        if (!payload.riderId || payload.riderId === riderId) {
          triggerSuspension(payload.suspendReason, payload.suspendedAt);
        }
      }
    });

    return () => unsubscribe();
  }, [riderId, triggerSuspension]);

  // 2. Periodic status verification check (heartbeat guard every 10 seconds)
  useEffect(() => {
    if (!riderId || suspension.isSuspended) return;

    let isMounted = true;

    async function checkStatus() {
      // First check local rider event route
      try {
        const localRes = await fetch(`/api/sync/events?riderId=${encodeURIComponent(riderId)}`);
        if (localRes.ok) {
          const json = await localRes.json();
          if (json.isSuspended && isMounted) {
            triggerSuspension(json.data?.suspendReason, json.data?.suspendedAt);
            return;
          }
        }
      } catch {}

      // Fallback check Hub public status (cloud Hub first, then local)
      const hubBases = [
        process.env.NEXT_PUBLIC_HUB_URL || "https://hub-gamma-umber.vercel.app",
        "http://localhost:3004",
      ];
      for (const base of hubBases) {
        try {
          const hubUrl = `${base}/api/public/status?type=rider&id=${encodeURIComponent(riderId)}`;
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 2000);
          const hubRes = await fetch(hubUrl, { signal: controller.signal });
          clearTimeout(timeoutId);
          if (hubRes.ok) {
            const hubJson = await hubRes.json();
            if (hubJson.success && hubJson.data?.isSuspended && isMounted) {
              triggerSuspension(hubJson.data.suspendReason, hubJson.data.suspendedAt);
              break;
            }
          }
        } catch {}
      }
    }

    // Run initial check after 2 seconds
    const initialTimer = setTimeout(checkStatus, 2000);
    // Recurring interval every 10 seconds
    const interval = setInterval(checkStatus, 10000);

    return () => {
      isMounted = false;
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, [riderId, suspension.isSuspended, triggerSuspension]);

  return {
    isSuspended: suspension.isSuspended,
    suspendReason: suspension.reason,
    suspendedAt: suspension.suspendedAt,
    handleLogout,
  };
}
